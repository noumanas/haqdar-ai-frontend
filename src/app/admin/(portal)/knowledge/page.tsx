import type { Metadata } from "next";
import { Suspense } from "react";

import { AddSourceButton, EditSourceButton, VerifyToggle } from "@/components/admin/knowledge/source-actions";
import { ApiErrorNotice, EmptyState, InsightCallout, Skeleton } from "@/components/admin/ui/notices";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { DotPill, Pill } from "@/components/admin/ui/pills";
import { SegmentedTabs } from "@/components/admin/ui/segmented-tabs";
import { adminApi } from "@/lib/admin/api";
import { formatDate, TOPIC_LABELS } from "@/lib/admin/format";
import { load } from "@/lib/admin/load";

export const metadata: Metadata = { title: "Knowledge base" };

const PAGE_SIZE = 100;

/**
 * The rules the money calculators run, mirrored from the backend's
 * `labour-law.constants.ts`. They change only in code, after a legal check.
 */
const CALCULATOR_RULES = [
  { label: "Gratuity, years 1–5", rule: "21 days' basic per year" },
  { label: "Gratuity, after year 5", rule: "30 days' basic per year" },
  { label: "Gratuity cap", rule: "Two years' basic salary" },
  { label: "Overtime, day", rule: "Hourly rate + 25%" },
  { label: "Overtime, night (10pm–4am)", rule: "Hourly rate + 50%" },
  { label: "Normal hours", rule: "8 a day, 48 a week" },
];

export default function KnowledgePage({ searchParams }: PageProps<"/admin/knowledge">) {
  return (
    <>
      <PageHeader
        crumb="Knowledge base"
        title="Knowledge base"
        badge={
          <Suspense fallback={null}>
            <ReviewBadge />
          </Suspense>
        }
        actions={<AddSourceButton />}
        description="Haqdar answers legal questions only from these sources, and every answer cites one of them."
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <SourcesSection searchParams={searchParams} />
      </Suspense>
      <CalculatorRules />
    </>
  );
}

async function ReviewBadge() {
  const pending = await load(() => adminApi.articles({ verified: false, limit: 1 }));
  if (!pending.ok || pending.data.meta.total === 0) return null;
  return <DotPill tone="alarm">{pending.data.meta.total} need review</DotPill>;
}

async function SourcesSection({ searchParams }: { searchParams: PageProps<"/admin/knowledge">["searchParams"] }) {
  const reviewOnly = (await searchParams).status === "review";
  const [articles, pending] = await Promise.all([
    load(() => adminApi.articles({ verified: reviewOnly ? false : undefined, limit: PAGE_SIZE })),
    load(() => adminApi.articles({ verified: false, limit: 1 })),
  ]);
  if (!articles.ok) return <ApiErrorNotice message={articles.error} />;
  const unverified = pending.ok ? pending.data.meta.total : 0;

  return (
    <>
      {unverified > 0 && !reviewOnly && (
        <InsightCallout action={{ label: "Review now", href: "/admin/knowledge?status=review" }}>
          {unverified} source{unverified === 1 ? " hasn’t" : "s haven’t"} been checked against current MOHRE material.
          Answers that use them tell workers to confirm with MOHRE.
        </InsightCallout>
      )}
      <Panel
        title="Sources"
        subtitle={`${articles.data.meta.total} ${reviewOnly ? "to review" : "in total"}`}
        aside={
          <SegmentedTabs
            label="Filter sources"
            tabs={[
              { label: "All", href: "/admin/knowledge", active: !reviewOnly },
              { label: "Needs review", href: "/admin/knowledge?status=review", active: reviewOnly },
            ]}
          />
        }
      >
        {articles.data.items.length === 0 ? (
          <EmptyState title={reviewOnly ? "Every source is verified" : "No sources yet"}>
            {reviewOnly ? undefined : "Add the official rules the agent may answer from."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-stone">
                  {["Source", "Covers", "Last updated", "Status", ""].map((heading) => (
                    <th key={heading} className="border-b border-line p-2 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.data.items.map((article) => (
                  <tr key={article.id} className="border-b border-hairline align-top last:border-b-0">
                    <td className="px-2 py-3">
                      <span className="flex flex-col">
                        <span className="font-semibold">{article.title}</span>
                        <span className="text-[11px] text-stone">{article.reference}</span>
                      </span>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{TOPIC_LABELS[article.topic]}</td>
                    <td className="px-2 py-3 text-stone">{formatDate(article.updatedAt)}</td>
                    <td className="px-2 py-3">
                      <Pill tone={article.verified ? "signal" : "alarm"}>
                        {article.verified ? "Verified" : "Needs review"}
                      </Pill>
                    </td>
                    <td className="px-2 py-3">
                      <span className="flex justify-end gap-3">
                        <VerifyToggle id={article.id} verified={article.verified} />
                        <EditSourceButton article={article} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function CalculatorRules() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Calculator rules</h2>
        <span className="text-xs text-stone">Run as code, never by the AI. Changed only after a legal check.</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {CALCULATOR_RULES.map(({ label, rule }) => (
          <div key={label} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-3.5">
            <span className="text-xs text-stone">{label}</span>
            <span className="text-[15px] font-semibold">{rule}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
