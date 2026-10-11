import { Check } from "lucide-react";

import { caseStatusLabel, caseSteps, demoPage } from "@/content/demo";
import type { CaseStatus, CaseStep } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const statusTone: Record<CaseStatus, string> = {
  in_progress: "bg-pebble",
  complaint_filed: "bg-lilac",
  resolved: "bg-lime",
};

type CaseProgressProps = {
  caseStep: CaseStep;
  status: CaseStatus;
  resolved: boolean;
};

export function CaseProgress({
  caseStep,
  status,
  resolved,
}: CaseProgressProps) {
  const current = caseSteps.findIndex((step) => step.id === caseStep);

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-[18px]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-bold">{demoPage.progressTitle}</h2>
        <span
          aria-live="polite"
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
            statusTone[status],
          )}
        >
          {caseStatusLabel[status]}
        </span>
      </div>

      <ol className="flex flex-col">
        {caseSteps.map((step, index) => {
          const done = index < current || (resolved && index === current);
          const active = index === current && !resolved;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className="grid grid-cols-[26px_1fr] gap-2.5"
            >
              <span className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-[22px] items-center justify-center rounded-full border-2 text-[11px] font-extrabold transition-colors duration-300",
                    done && "border-forest bg-forest text-lime",
                    active && "border-ink bg-lime text-foreground",
                    !done && !active && "border-pebble bg-pebble text-stone",
                  )}
                >
                  {done ? (
                    <Check
                      className="size-3"
                      strokeWidth={3.5}
                      aria-label="Done"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                {index < caseSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="min-h-2.5 w-0.5 flex-1 bg-line"
                  />
                )}
              </span>
              <span className="flex flex-col pb-2.5">
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-extrabold" : "font-semibold",
                    done || active ? "text-foreground" : "text-stone",
                  )}
                >
                  {step.label}
                </span>
                <span className="text-xs text-stone">{step.hint}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
