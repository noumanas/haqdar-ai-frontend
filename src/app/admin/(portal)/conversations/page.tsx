import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ClearFlagButton, FlagAnswerButton, ReviewToggle } from "@/components/admin/conversations/conversation-actions";
import { ApiErrorNotice, EmptyState, Skeleton } from "@/components/admin/ui/notices";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { Pill, StatusPill } from "@/components/admin/ui/pills";
import { SegmentedTabs } from "@/components/admin/ui/segmented-tabs";
import { adminApi } from "@/lib/admin/api";
import { CHANNEL_LABELS, formatTime, issueLabel, timeAgo, workerCode } from "@/lib/admin/format";
import { load } from "@/lib/admin/load";
import { buildTimeline } from "@/lib/admin/timeline";
import type { ConversationStatus, ConversationSummary, Message } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Conversations" };

const PAGE_SIZE = 20;

const FILTERS: { label: string; status?: ConversationStatus }[] = [
  { label: "All" },
  { label: "Needs review", status: "needs_review" },
  { label: "Guided to MOHRE", status: "guided_to_mohre" },
  { label: "Reviewed", status: "reviewed" },
];

type SearchParams = PageProps<"/admin/conversations">["searchParams"];

export default function ConversationsPage({ searchParams }: PageProps<"/admin/conversations">) {
  return (
    <>
      <PageHeader
        crumb="Conversations"
        title="Conversations"
        description="Anonymised worker chats. Names and phone numbers are never shown."
      />
      <Suspense fallback={<ConversationsSkeleton />}>
        <ConversationsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const href = (status: ConversationStatus | undefined, extra: Record<string, string | number> = {}): string => {
  const params = new URLSearchParams(
    Object.entries({ ...(status ? { status } : {}), ...extra }).map(([key, value]) => [key, String(value)]),
  );
  return params.size ? `/admin/conversations?${params}` : "/admin/conversations";
};

async function ConversationsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = FILTERS.find((filter) => filter.status && filter.status === params.status)?.status;
  const page = Math.max(1, Number(params.page) || 1);

  const list = await load(() => adminApi.conversations({ status, page, limit: PAGE_SIZE }));
  if (!list.ok) return <ApiErrorNotice message={list.error} />;

  const { items, meta } = list.data;
  const selected = items.find((item) => item.id === params.id) ?? items[0];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          label="Filter conversations"
          tabs={FILTERS.map((filter) => ({
            label: filter.label,
            href: href(filter.status),
            active: filter.status === status,
          }))}
        />
        <span className="text-xs text-stone">
          {meta.total} conversation{meta.total === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No conversations here">
          {status ? "Try another filter." : "Conversations appear once workers message Haqdar."}
        </EmptyState>
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <section aria-label="Conversation list" className="flex min-w-0 flex-[2_1_300px] flex-col gap-2">
            {items.map((item) => (
              <ConversationCard key={item.id} item={item} selected={item.id === selected?.id} status={status} page={page} />
            ))}
            {meta.totalPages > 1 && <Pager status={status} page={page} totalPages={meta.totalPages} />}
          </section>
          {selected && (
            <Suspense key={selected.id} fallback={<Skeleton className="h-[520px] flex-[3_1_480px]" />}>
              <ConversationDetail summary={selected} />
            </Suspense>
          )}
        </div>
      )}
    </>
  );
}

function ConversationCard({
  item,
  selected,
  status,
  page,
}: {
  item: ConversationSummary;
  selected: boolean;
  status?: ConversationStatus;
  page: number;
}) {
  return (
    <Link
      href={href(status, { ...(page > 1 ? { page } : {}), id: item.id })}
      scroll={false}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border bg-white p-3.5 transition-colors",
        selected ? "border-foreground ring-1 ring-foreground" : "border-line hover:border-stone/40",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold">
          {workerCode(item.workerId)} · {issueLabel(item.issueType)}
        </span>
        <StatusPill status={item.status} className="text-[11px]" />
      </span>
      {item.preview && (
        <span dir="auto" className="line-clamp-2 text-xs leading-snug text-stone">
          {item.preview}
        </span>
      )}
      <span className="text-[11px] text-stone">
        {item.channel ? CHANNEL_LABELS[item.channel] : "No messages"} · {timeAgo(item.lastMessageAt)}
      </span>
    </Link>
  );
}

function Pager({ status, page, totalPages }: { status?: ConversationStatus; page: number; totalPages: number }) {
  const link = "rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:bg-hairline";
  return (
    <nav aria-label="Pages" className="flex items-center justify-between pt-1 text-xs text-stone">
      {page > 1 ? <Link className={link} href={href(status, { page: page - 1 })}>Previous</Link> : <span />}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? <Link className={link} href={href(status, { page: page + 1 })}>Next</Link> : <span />}
    </nav>
  );
}

async function ConversationDetail({ summary }: { summary: ConversationSummary }) {
  const messages = await load(() => adminApi.messages(summary.id));
  if (!messages.ok) {
    return (
      <div className="flex-[3_1_480px]">
        <ApiErrorNotice message={messages.error} />
      </div>
    );
  }

  const steps = buildTimeline(messages.data);
  const attention = steps.filter((step) => step.attention).length;

  return (
    <section aria-label="Conversation detail" className="flex min-w-0 flex-[3_1_480px] flex-col gap-4">
      <Panel className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
                {workerCode(summary.workerId)} · {issueLabel(summary.issueType)}
              </h2>
              <StatusPill status={summary.status} className="text-[11px]" />
            </div>
            <span className="text-xs text-stone">
              {summary.channel ? CHANNEL_LABELS[summary.channel] : "—"} · Urdu · {summary.messageCount} messages ·{" "}
              {timeAgo(summary.lastMessageAt)}
            </span>
          </div>
          <ReviewToggle conversationId={summary.id} reviewed={summary.status === "reviewed"} />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">What happened</h3>
            <span className="text-xs text-stone">
              {attention} of {steps.length} steps need attention
            </span>
          </div>
          <div className="overflow-x-auto">
            <ol className="grid auto-cols-[minmax(132px,1fr)] grid-flow-col">
              {steps.map((step, index) => (
                <li key={`${step.at}-${index}`} className="flex flex-col gap-1 pr-3">
                  <span className="flex items-center" aria-hidden>
                    <span className={cn("size-2.5 flex-none rounded-full", step.attention ? "bg-alarm" : "bg-signal")} />
                    <span className="h-px flex-1 bg-line" />
                  </span>
                  <span className="mt-1 text-[11px] text-stone">{formatTime(step.at)}</span>
                  <span className="text-[13px] font-semibold">{step.label}</span>
                  <span className="text-xs leading-snug text-stone">{step.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>

      <Panel title="Transcript" subtitle="As stored: voice notes appear as their transcript">
        <div className="flex flex-col gap-3">
          {messages.data.map((message) => (
            <TranscriptMessage key={message.id} message={message} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function TranscriptMessage({ message }: { message: Message }) {
  if (message.direction === "inbound") {
    return (
      <div className="max-w-[80%] self-end rounded-[14px_14px_4px_14px] bg-signal-wash px-3 py-2.5 text-[13px] leading-normal">
        <div className="mb-1 text-[11px] font-semibold text-stone">
          Worker · {CHANNEL_LABELS[message.kind]} · {formatTime(message.createdAt)}
          {message.urgent && <span className="text-alarm-ink"> · urgent</span>}
        </div>
        <p dir="auto" className="whitespace-pre-line">
          {message.body}
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[80%] flex-col gap-1.5 self-start">
      <div
        className={cn(
          "rounded-[14px_14px_14px_4px] px-3 py-2.5 text-[13px] leading-normal",
          message.flagged ? "bg-alarm-soft" : "bg-canvas",
        )}
      >
        <div className="mb-1 text-[11px] font-semibold text-stone">Haqdar · {formatTime(message.createdAt)}</div>
        <p dir="auto" className="whitespace-pre-line">
          {message.body}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {message.citations.map((citation) => (
          <Pill key={citation} tone="signal" className="rounded-full text-[11px]">
            {citation}
          </Pill>
        ))}
        {message.flagged ? (
          <>
            <Pill tone="alarm" className="text-[11px]">
              Flagged{message.flagReason ? `: ${message.flagReason}` : ""}
            </Pill>
            <ClearFlagButton messageId={message.id} />
          </>
        ) : (
          <FlagAnswerButton messageId={message.id} />
        )}
      </div>
    </div>
  );
}

function ConversationsSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-[2_1_300px] flex-col gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[92px]" />
        ))}
      </div>
      <Skeleton className="h-[520px] flex-[3_1_480px]" />
    </div>
  );
}
