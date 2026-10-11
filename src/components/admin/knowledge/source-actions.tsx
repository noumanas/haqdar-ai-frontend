"use client";

import { Plus } from "lucide-react";
import { useActionState, useState, useTransition, type ReactNode } from "react";

import {
  createArticle,
  deleteArticle,
  setArticleVerified,
  updateArticle,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TOPIC_LABELS } from "@/lib/admin/format";
import type { LawArticle, LawTopic } from "@/lib/admin/types";

type FormAction = (state: ActionState, form: FormData) => Promise<ActionState>;

/** Fields shared by "Add source" and "Edit source"; submits through the given Server Action. */
function SourceForm({
  article,
  action,
  submitLabel,
  onSaved,
  extraActions,
}: {
  article?: LawArticle;
  action: FormAction;
  submitLabel: string;
  onSaved: () => void;
  extraActions?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (previous, form) => {
    const result = await action(previous, form);
    if (result.ok) onSaved();
    return result;
  }, {});
  const id = article?.id ?? "new";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`reference-${id}`}>Reference</Label>
          <Input
            id={`reference-${id}`}
            name="reference"
            required
            maxLength={160}
            defaultValue={article?.reference}
            placeholder="Decree-Law 33/2021, Art. 19"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`topic-${id}`}>Topic</Label>
          <Select name="topic" required defaultValue={article?.topic}>
            <SelectTrigger id={`topic-${id}`} className="w-full">
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TOPIC_LABELS) as LawTopic[]).map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {TOPIC_LABELS[topic]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`title-${id}`}>Title</Label>
        <Input id={`title-${id}`} name="title" required maxLength={200} defaultValue={article?.title} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`body-${id}`}>Rule text</Label>
        <Textarea
          id={`body-${id}`}
          name="body"
          required
          rows={5}
          defaultValue={article?.body}
          placeholder="The rule as the agent should state it, in plain English."
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`sourceUrl-${id}`}>Official source link (optional)</Label>
        <Input
          id={`sourceUrl-${id}`}
          name="sourceUrl"
          type="url"
          defaultValue={article?.sourceUrl ?? undefined}
          placeholder="https://www.mohre.gov.ae/…"
        />
      </div>
      <label className="flex items-start gap-2.5 text-[13px]">
        <input
          type="checkbox"
          name="verified"
          defaultChecked={article?.verified}
          className="mt-0.5 size-4 accent-[var(--color-signal)]"
        />
        <span>
          <span className="font-semibold">Verified</span>
          <span className="block text-stone">Checked against current MOHRE material.</span>
        </span>
      </label>
      {state.error && (
        <p role="alert" className="text-[13px] text-alarm-ink">
          {state.error}
        </p>
      )}
      <DialogFooter className="items-center sm:justify-between">
        <div>{extraActions}</div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddSourceButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-[38px] rounded-[10px] px-4 text-[13px] font-semibold">
          <Plus aria-hidden />
          Add source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a source</DialogTitle>
          <DialogDescription>The agent can only state rules that are in the knowledge base.</DialogDescription>
        </DialogHeader>
        <SourceForm action={createArticle} submitLabel="Add source" onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function EditSourceButton({ article }: { article: LawArticle }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-xs font-semibold text-signal-ink hover:underline">
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit source</DialogTitle>
          <DialogDescription>{article.reference}</DialogDescription>
        </DialogHeader>
        <SourceForm
          article={article}
          action={updateArticle.bind(null, article.id)}
          submitLabel="Save changes"
          onSaved={() => setOpen(false)}
          extraActions={<DeleteSourceButton id={article.id} onDeleted={() => setOpen(false)} />}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Deleting is permanent, so it asks for a second click. */
function DeleteSourceButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const remove = () =>
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (result.ok) onDeleted();
      else setError(result.error);
    });

  return (
    <span className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        onClick={confirming ? remove : () => setConfirming(true)}
        className="text-alarm-ink hover:bg-alarm-soft hover:text-alarm-ink"
      >
        {pending ? "Deleting…" : confirming ? "Click again to delete" : "Delete"}
      </Button>
      {error && <span className="text-xs text-alarm-ink">{error}</span>}
    </span>
  );
}

/** One-click verify / unverify from the table. */
export function VerifyToggle({ id, verified }: { id: string; verified: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setArticleVerified(id, !verified).then(() => undefined))}
      className="text-xs font-semibold text-signal-ink hover:underline disabled:opacity-50"
    >
      {pending ? "Saving…" : verified ? "Unverify" : "Mark verified"}
    </button>
  );
}
