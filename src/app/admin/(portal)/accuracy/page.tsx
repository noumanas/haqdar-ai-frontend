import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ClearFlagButton } from "@/components/admin/conversations/conversation-actions";
import { HATCH, TargetGauge } from "@/components/admin/ui/charts";
import { ApiErrorNotice, EmptyState, InsightCallout, Skeleton } from "@/components/admin/ui/notices";
import { PageHeader } from "@/components/admin/ui/page-header";
import { MetricRow, Panel } from "@/components/admin/ui/panel";
import { DotPill, Pill } from "@/components/admin/ui/pills";
import { adminApi } from "@/lib/admin/api";
import { formatSeconds, percent, timeAgo } from "@/lib/admin/format";
import { load } from "@/lib/admin/load";
import type { AdminOverview, FlaggedMessage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Accuracy & testing" };

/** PRD: 90%+ correct answers before release, voice-to-voice reply under 15 seconds. */
const RELEASE_TARGET = 90;
const REPLY_TARGET_MS = 15_000;

export default function AccuracyPage() {
  return (
    <>
      <PageHeader
        crumb="Accuracy & testing"
        title="Accuracy & testing"
        badge={
          <Suspense fallback={null}>
            <ReleaseBadge />
          </Suspense>
        }
        description="Reviewer flags on live answers, and the legal test set that gates each release."
      />
      <Suspense fallback={<Skeleton className="h-[480px]" />}>
        <AccuracyContent />
      </Suspense>
    </>
  );
}

async function ReleaseBadge() {
  const overview = await load(() => adminApi.overview());
  if (!overview.ok || overview.data.conversations.outboundMessages === 0) return null;
  const { outboundMessages, flaggedMessages } = overview.data.conversations;
  const quality = percent(outboundMessages - flaggedMessages, outboundMessages);
  return quality >= RELEASE_TARGET ? (
    <DotPill tone="signal">On target</DotPill>
  ) : (
    <DotPill tone="alarm">Below target</DotPill>
  );
}

async function AccuracyContent() {
  const [overview, flagged] = await Promise.all([
    load(() => adminApi.overview()),
    load(() => adminApi.flaggedMessages({ limit: 50 })),
  ]);

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-4">
        {flagged.ok ? <FlaggedAnswers items={flagged.data.items} total={flagged.data.meta.total} /> : <ApiErrorNotice message={flagged.error} />}
        <TestSetPanel />
      </div>
      {overview.ok ? <ResultPanel overview={overview.data} /> : <ApiErrorNotice message={overview.error} />}
    </div>
  );
}

function FlaggedAnswers({ items, total }: { items: FlaggedMessage[]; total: number }) {
  return (
    <Panel
      title="Answers flagged by reviewers"
      subtitle="Marked wrong from the conversation review. Clear a flag once the cause is fixed."
      aside={
        <span className="flex items-center gap-1.5 text-xs text-stone">
          <span className={cn("h-1.5 w-3.5 rounded-full", HATCH)} aria-hidden />
          Does not match the law
        </span>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="No flagged answers">When a reviewer flags an answer as wrong, it appears here.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-stone">
                {["Agent answer", "Reason", "Answered", ""].map((heading) => (
                  <th key={heading} className="border-b border-line p-2 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-hairline align-top last:border-b-0">
                  <td className="max-w-[360px] px-2 py-3">
                    <span className="flex flex-col gap-1.5">
                      <span dir="auto" className="line-clamp-3 font-semibold">
                        {item.body}
                      </span>
                      <span className={cn("h-1.5 w-[120px] rounded-full", HATCH)} aria-hidden />
                      {item.citations.length > 0 && (
                        <span className="text-[11px] text-stone">Cited: {item.citations.join(" · ")}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-alarm-ink">{item.flagReason ?? "No reason given"}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-stone">{timeAgo(item.createdAt)}</td>
                  <td className="px-2 py-3">
                    <span className="flex flex-col items-end gap-1.5">
                      <Link
                        href={`/admin/conversations?id=${item.conversationId}`}
                        className="text-xs font-semibold whitespace-nowrap text-signal-ink hover:underline"
                      >
                        Open conversation
                      </Link>
                      <ClearFlagButton messageId={item.id} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > items.length && (
        <p className="text-xs text-stone">
          Showing the {items.length} most recent of {total} flagged answers.
        </p>
      )}
    </Panel>
  );
}

/** The PRD's 30-question legal test set has no backend runner yet; say so rather than show fake results. */
function TestSetPanel() {
  return (
    <Panel
      title="Legal test set"
      subtitle="30 real worker questions with verified answers, run before every release"
      aside={
        <button
          type="button"
          disabled
          title="Needs a test-set runner on the backend"
          className="flex min-h-[38px] items-center rounded-[10px] bg-ink px-4 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          Run test set
        </button>
      }
    >
      <EmptyState title="Not connected yet">
        Expected-vs-agent results will appear here once the test questions and a backend runner are added. Until then,
        use the agent playground (<code>POST /api/v1/admin/agent/simulate</code>) to check answers by hand.
      </EmptyState>
    </Panel>
  );
}

function ResultPanel({ overview }: { overview: AdminOverview }) {
  const c = overview.conversations;
  const unflagged = c.outboundMessages - c.flaggedMessages;
  const quality = percent(unflagged, c.outboundMessages);
  const onTarget = quality >= RELEASE_TARGET;

  return (
    <Panel title="Result" subtitle={`Answers not flagged · release target ${RELEASE_TARGET}%`} className="flex-[2_1_320px] gap-3.5">
      {c.outboundMessages === 0 ? (
        <EmptyState title="No answers yet" />
      ) : (
        <>
          <span className="text-[56px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{quality}%</span>
          <Pill tone={onTarget ? "signal" : "alarm"} className="self-start">
            {unflagged} of {c.outboundMessages} unflagged · {onTarget ? "on target" : "below target"}
          </Pill>
          <TargetGauge
            value={quality}
            target={RELEASE_TARGET}
            labels={
              <div className="flex justify-between text-[11px]">
                <span className={cn("font-semibold", onTarget ? "text-signal" : "text-alarm-ink")}>Actual {quality}%</span>
                <span className="text-stone">Target {RELEASE_TARGET}%</span>
              </div>
            }
          />
          <div className="flex flex-col">
            <MetricRow label="Answers citing a source" value={`${c.citedAnswers} / ${c.outboundMessages}`} />
            <MetricRow label="Flagged by reviewers" value={c.flaggedMessages} />
            <MetricRow
              label="Avg reply time"
              value={c.averageReplyLatencyMs === null ? "—" : formatSeconds(c.averageReplyLatencyMs)}
              target={`target ${formatSeconds(REPLY_TARGET_MS)}`}
            />
          </div>
        </>
      )}
      {c.outboundMessages > c.citedAnswers && (
        <InsightCallout action={{ label: "Open knowledge base", href: "/admin/knowledge" }}>
          {c.outboundMessages - c.citedAnswers === 1
            ? "1 answer cites"
            : `${c.outboundMessages - c.citedAnswers} answers cite`}{" "}
          no law reference. A missing article in the knowledge base is the usual cause.
        </InsightCallout>
      )}
    </Panel>
  );
}
