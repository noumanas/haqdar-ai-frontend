import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Pink diagonal hatching marks failures and drops, so they read without relying on colour alone. */
export const HATCH = "bg-[repeating-linear-gradient(135deg,var(--color-alarm)_0_4px,#f6b7cf_4px_7px)]";

/** A horizontal bar: `value` out of `max`, drawn in blue or in the alarm colour. */
export function Bar({
  value,
  max,
  tone = "signal",
  thickness = "h-2",
}: {
  value: number;
  max: number;
  tone?: "signal" | "alarm";
  thickness?: string;
}) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <span className={cn("block rounded-full bg-hairline", thickness)}>
      <span
        className={cn("block rounded-full", thickness, tone === "alarm" ? "bg-alarm" : "bg-signal")}
        style={{ width: value > 0 ? `${width}%` : 0 }}
      />
    </span>
  );
}

/** One labelled bar with its count, as in "Issues by type". */
export function BarRow({ label, value, max, tone }: { label: string; value: number; max: number; tone?: "signal" | "alarm" }) {
  return (
    <div className="grid grid-cols-[130px_1fr_32px] items-center gap-3 text-[13px]">
      <span>{label}</span>
      <Bar value={value} max={max} tone={tone} />
      <span className="text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export interface FunnelStep {
  label: string;
  hint: string;
  value: number;
}

/**
 * "From question to action": each stage as a share of the first, with the drop from the
 * previous stage in the alarm colour when it is the stage's main story.
 */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const start = steps[0]?.value ?? 0;
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const drop = index > 0 ? (steps[index - 1]?.value ?? 0) - step.value : 0;
        return (
          <div
            key={step.label}
            className="grid grid-cols-[1fr_40px_40px] items-center gap-x-3 gap-y-2 border-b border-hairline py-2.5 sm:grid-cols-[minmax(120px,170px)_1fr_48px_56px]"
          >
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold">{step.label}</span>
              <span className="text-[11px] text-stone">{step.hint}</span>
            </span>
            <span className="order-last col-span-3 sm:order-none sm:col-span-1">
              <Bar value={step.value} max={start} thickness="h-2.5" />
            </span>
            <span className="text-right text-[13px] font-semibold tabular-nums">{step.value}</span>
            <span className="text-right text-xs text-alarm-ink tabular-nums">{drop > 0 ? `−${drop}` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/** A thin track with a knob at `value`%, against a `target`% goal. */
export function TargetGauge({ value, target, labels }: { value: number; target: number; labels?: ReactNode }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const onTarget = value >= target;
  return (
    <div className="flex flex-col gap-1">
      {labels}
      <div
        className="relative h-6"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={`${clamped}% against a ${target}% target`}
      >
        <span className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-hairline" />
        <span
          className={cn("absolute top-2.5 left-0 h-1 rounded-full", onTarget ? "bg-signal" : "bg-alarm")}
          style={{ width: `${clamped}%` }}
        />
        <span
          className="absolute top-1 h-4 w-0.5 bg-stone/60"
          style={{ left: `${target}%` }}
          title={`Target ${target}%`}
          aria-hidden
        />
        <span
          className={cn(
            "absolute top-[5px] size-3.5 rounded-full border-[3px] bg-white",
            onTarget ? "border-signal" : "border-alarm",
          )}
          style={{ left: `calc(${clamped}% - 7px)` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
