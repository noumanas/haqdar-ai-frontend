import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BarRow, Funnel, TargetGauge, type FunnelStep } from "@/components/admin/ui/charts";
import { ApiErrorNotice, EmptyState, InsightCallout, Skeleton } from "@/components/admin/ui/notices";
import { PageHeader } from "@/components/admin/ui/page-header";
import { MetricRow, Panel, StatCard } from "@/components/admin/ui/panel";
import { DotPill, Pill, StatusPill } from "@/components/admin/ui/pills";
import { adminApi } from "@/lib/admin/api";
import { formatSeconds, issueLabel, ISSUE_LABELS, percent, timeAgo, URGENT_ISSUES, workerCode } from "@/lib/admin/format";
import { load } from "@/lib/admin/load";
import type { AdminOverview, ConversationSummary } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Overview" };

const PERIOD_DAYS = 7;
/** PRD targets: 90%+ correct answers, voice-to-voice reply under 15 seconds. */
const QUALITY_TARGET = 90;
const REPLY_TARGET_MS = 15_000;

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        crumb="Overview"
        title="Pilot overview"
        badge={<DotPill tone="signal">Live</DotPill>}
        description={`Urdu WhatsApp pilot · counts since launch, new conversations over the last ${PERIOD_DAYS} days`}
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent />
      </Suspense>
    </>
  );
}

async function OverviewContent() {
  const [overview, queue] = await Promise.all([
    load(() => adminApi.overview(PERIOD_DAYS)),
    load(() => adminApi.conversations({ status: "needs_review", limit: 5 })),
  ]);
  if (!overview.ok) return <ApiErrorNotice message={overview.error} />;

  const { workers, conversations: c, contractsRead, followUpsScheduled } = overview.data;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        <StatCard label="Active workers" value={workers.granted} hint={`${workers.pending} waiting for consent`} />
        <StatCard
          label="Conversations"
          value={c.conversations}
          hint={`${c.conversationsSince} in the last ${PERIOD_DAYS} days`}
        />
        <StatCard label="Contracts read" value={contractsRead} hint="Photos deleted after reading" />
        <StatCard
          label="Issues found"
          value={c.withIssue}
          hint={`in ${percent(c.withIssue, c.conversations)}% of conversations`}
        />
      </div>

      <div className="flex flex-wrap items-stretch gap-4">
        <JourneyPanel overview={overview.data} followUps={followUpsScheduled} />
        <QualityPanel overview={overview.data} />
      </div>

      <div className="flex flex-wrap items-stretch gap-4">
        <IssuesPanel overview={overview.data} />
        <ReviewQueuePanel queue={queue.ok ? queue.data.items : null} error={queue.ok ? undefined : queue.error} />
      </div>
    </>
  );
}

function JourneyPanel({ overview, followUps }: { overview: AdminOverview; followUps: number }) {
  const c = overview.conversations;
  const steps: FunnelStep[] = [
    { label: "Started a chat", hint: "Voice, text or photo", value: c.conversations },
    { label: "Issue identified", hint: "Law may not be followed", value: c.withIssue },
    { label: "Guided to MOHRE", hint: "Complaint steps sent", value: c.guidedToMohre },
    { label: "Follow-up agreed", hint: "Check-in scheduled", value: followUps },
  ];
  const drops = steps.slice(1).map((step, index) => ({ from: steps[index], to: step, drop: steps[index].value - step.value }));
  const biggest = drops.reduce<(typeof drops)[number] | undefined>(
    (best, current) => (current.drop > (best?.drop ?? 0) ? current : best),
    undefined,
  );

  return (
    <Panel
      title="From question to action"
      subtitle="How far workers get"
      aside={<span className="text-xs text-stone">Drop shown in pink</span>}
      className="flex-[3_1_460px] gap-1.5"
    >
      {c.conversations === 0 ? (
        <EmptyState title="No conversations yet">The journey fills in as workers message Haqdar.</EmptyState>
      ) : (
        <>
          <Funnel steps={steps} />
          {biggest && (
            <p className="pt-2 text-xs text-stone">
              Biggest drop: {biggest.from.label} → {biggest.to.label} (−{biggest.drop}).
            </p>
          )}
        </>
      )}
    </Panel>
  );
}

function QualityPanel({ overview }: { overview: AdminOverview }) {
  const c = overview.conversations;
  const unflagged = c.outboundMessages - c.flaggedMessages;
  const quality = percent(unflagged, c.outboundMessages);
  const onTarget = quality >= QUALITY_TARGET;
  const unverified = overview.knowledgeBase.articles - overview.knowledgeBase.verified;
  const topIssue = c.issueTypes[0];

  return (
    <Panel title="Answer quality" subtitle={`Answers not flagged by reviewers · target ${QUALITY_TARGET}%`} className="flex-[2_1_300px]">
      {c.outboundMessages === 0 ? (
        <EmptyState title="No answers yet" />
      ) : (
        <>
          <span className="text-[52px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{quality}%</span>
          <Pill tone={onTarget ? "signal" : "alarm"} className="self-start">
            {onTarget ? "On target" : "Below target"} · {unflagged} of {c.outboundMessages}
          </Pill>
          <TargetGauge value={quality} target={QUALITY_TARGET} />
          <div className="flex flex-col">
            <MetricRow label="Answers citing a source" value={`${percent(c.citedAnswers, c.outboundMessages)}%`} />
            <MetricRow
              label="Avg reply time"
              value={c.averageReplyLatencyMs === null ? "—" : formatSeconds(c.averageReplyLatencyMs)}
              target={`target ${formatSeconds(REPLY_TARGET_MS)}`}
            />
            <MetricRow label="Urgent messages" value={c.urgentMessages} />
          </div>
        </>
      )}
      {unverified > 0 ? (
        <InsightCallout action={{ label: "Review sources", href: "/admin/knowledge?status=review" }}>
          {unverified} of {overview.knowledgeBase.articles} law sources haven’t been verified against current MOHRE
          material, so answers using them tell workers to confirm with MOHRE.
        </InsightCallout>
      ) : (
        topIssue && (
          <InsightCallout>
            {topIssue.count} of {c.withIssue} identified issues are {ISSUE_LABELS[topIssue.issueType].toLowerCase()}.
          </InsightCallout>
        )
      )}
    </Panel>
  );
}

function IssuesPanel({ overview }: { overview: AdminOverview }) {
  const issues = overview.conversations.issueTypes;
  const max = issues[0]?.count ?? 0;
  return (
    <Panel title="Issues by type" className="flex-[2_1_320px]">
      {issues.length === 0 ? (
        <EmptyState title="No issues identified yet" />
      ) : (
        issues.map(({ issueType, count }) => (
          <BarRow
            key={issueType}
            label={ISSUE_LABELS[issueType]}
            value={count}
            max={max}
            tone={URGENT_ISSUES.has(issueType) ? "alarm" : "signal"}
          />
        ))
      )}
    </Panel>
  );
}

function ReviewQueuePanel({ queue, error }: { queue: ConversationSummary[] | null; error?: string }) {
  return (
    <Panel
      title="Needs review"
      subtitle="Urgent cases and flagged answers"
      aside={
        <Link href="/admin/conversations?status=needs_review" className="text-[13px] font-semibold text-signal-ink hover:underline">
          Open review queue
        </Link>
      }
      className="flex-[3_1_460px]"
    >
      {error && <ApiErrorNotice message={error} />}
      {queue && queue.length === 0 && <EmptyState title="Nothing waiting">Urgent and flagged conversations appear here.</EmptyState>}
      {queue && queue.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-stone">
                {["Worker", "Issue", "Last message", "Status"].map((heading) => (
                  <th key={heading} className="border-b border-line p-2 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/conversations?status=needs_review&id=${item.id}`}
                      className="font-semibold text-signal-ink hover:underline"
                    >
                      {workerCode(item.workerId)}
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    {issueLabel(item.issueType)}
                    {item.urgentCount > 0 && <span className="text-alarm-ink"> · urgent</span>}
                  </td>
                  <td className="px-2 py-3 text-stone">{timeAgo(item.lastMessageAt)}</td>
                  <td className="px-2 py-3">
                    <StatusPill status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[106px]" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-80 flex-[3_1_460px]" />
        <Skeleton className="h-80 flex-[2_1_300px]" />
      </div>
    </>
  );
}
