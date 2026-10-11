"use client";

import { Flag } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { clearFlag, flagAnswer, setConversationReviewed, type ActionState } from "@/app/admin/actions";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** "Mark reviewed" / "Reopen": takes the conversation in or out of the review queue. */
export function ReviewToggle({ conversationId, reviewed }: { conversationId: string; reviewed: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const toggle = () =>
    startTransition(async () => {
      const result = await setConversationReviewed(conversationId, !reviewed);
      setError(result.error);
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        onClick={toggle}
        disabled={pending}
        variant={reviewed ? "outline" : "default"}
        className="h-[38px] rounded-[10px] px-4 text-[13px] font-semibold"
      >
        {pending ? "Saving…" : reviewed ? "Reopen" : "Mark reviewed"}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-alarm-ink">
          {error}
        </span>
      )}
    </div>
  );
}

/** Opens a dialog to flag one agent answer as wrong, with an optional reason. */
export function FlagAnswerButton({ messageId }: { messageId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (previous, form) => {
      const result = await flagAnswer(messageId, previous, form);
      if (result.ok) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-semibold text-stone hover:text-alarm-ink"
        >
          <Flag className="size-3" aria-hidden />
          Flag wrong answer
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Flag this answer as wrong</DialogTitle>
            <DialogDescription>
              Flagged answers lower the quality score and put the conversation back in the review queue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`reason-${messageId}`}>What was wrong? (optional)</Label>
            <Textarea
              id={`reason-${messageId}`}
              name="reason"
              maxLength={500}
              placeholder="e.g. Used the day overtime rate for night work"
            />
          </div>
          {state.error && (
            <p role="alert" className="text-[13px] text-alarm-ink">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Flagging…" : "Flag answer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ClearFlagButton({ messageId }: { messageId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => clearFlag(messageId).then(() => undefined))}
      className="text-[11px] font-semibold text-stone underline-offset-2 hover:underline disabled:opacity-50"
    >
      {pending ? "Clearing…" : "Clear flag"}
    </button>
  );
}
