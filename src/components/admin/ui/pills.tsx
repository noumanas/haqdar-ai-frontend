import type { ReactNode } from "react";

import { STATUS_LABELS } from "@/lib/admin/format";
import type { ConversationStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export type PillTone = "signal" | "alarm" | "neutral";

const TONES: Record<PillTone, string> = {
  signal: "bg-signal-soft text-signal-ink",
  alarm: "bg-alarm-soft text-alarm-ink",
  neutral: "bg-hairline text-muted-foreground",
};

/** A small status label, e.g. "Needs review". */
export function Pill({ tone, children, className }: { tone: PillTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-md px-2 py-[3px] text-xs font-semibold whitespace-nowrap", TONES[tone], className)}>
      {children}
    </span>
  );
}

/** A rounded pill with a leading dot, shown beside page titles ("Live", "3 need review"). */
export function DotPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", TONES[tone])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

const STATUS_TONES: Record<ConversationStatus, PillTone> = {
  needs_review: "alarm",
  guided_to_mohre: "signal",
  reviewed: "signal",
  answered: "neutral",
};

export function StatusPill({ status, className }: { status: ConversationStatus; className?: string }) {
  return (
    <Pill tone={STATUS_TONES[status]} className={className}>
      {STATUS_LABELS[status]}
    </Pill>
  );
}
