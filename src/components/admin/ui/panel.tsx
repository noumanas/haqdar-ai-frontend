import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelProps extends Omit<ComponentProps<"section">, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned content in the panel header, e.g. tabs or a link. */
  aside?: ReactNode;
}

/** The white card every admin section sits in. */
export function Panel({ title, subtitle, aside, className, children, ...props }: PanelProps) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white p-5", className)} {...props}>
      {(title || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && <span className="text-xs text-stone">{subtitle}</span>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4">
      <span className="text-xs text-stone">{label}</span>
      <span className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{value}</span>
      {hint && <span className="text-xs text-stone">{hint}</span>}
    </div>
  );
}

/** Label on the left, value on the right; the rows inside the quality panels. */
export function MetricRow({ label, value, target }: { label: string; value: ReactNode; target?: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-hairline py-2.5 text-[13px] last:border-b-0">
      <span className="text-stone">{label}</span>
      <span className="font-semibold tabular-nums">
        {value} {target && <span className="font-normal text-stone">{target}</span>}
      </span>
    </div>
  );
}
