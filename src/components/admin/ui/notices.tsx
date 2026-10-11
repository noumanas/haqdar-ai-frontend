import { AlertTriangle, Sparkle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** The amber "Haqdar noticed" card: one observation from the data and where to act on it. */
export function InsightCallout({ children, action }: { children: ReactNode; action?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-notice-line bg-notice px-4 py-3.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-notice-ink">
        <Sparkle className="size-3.5" aria-hidden />
        Haqdar noticed
      </span>
      <p className="text-[13px] leading-normal text-notice-text">{children}</p>
      {action && (
        <Link
          href={action.href}
          className="flex min-h-[34px] items-center self-start rounded-lg border border-notice-line bg-white px-3 text-xs font-semibold hover:bg-white/70"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Shown in place of a section when the backend could not be reached or refused the request. */
export function ApiErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-alarm-soft bg-white p-5">
      <AlertTriangle className="mt-0.5 size-4 flex-none text-alarm-ink" aria-hidden />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Couldn’t load this section</span>
        <span className="text-[13px] text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-xl bg-canvas p-4">
      <span className="text-[13px] font-semibold">{title}</span>
      {children && <span className="text-[13px] text-stone">{children}</span>}
    </div>
  );
}

/** A grey placeholder block while a section streams in. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/70 ${className ?? ""}`} aria-hidden />;
}
