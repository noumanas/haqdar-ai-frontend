import { demoPage } from "@/content/demo";
import type { DemoScenario } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

type ScenarioPickerProps = {
  scenarios: DemoScenario[] | null;
  selected: string | null;
  onPick: (id: string) => void;
  label?: string;
};

export function ScenarioPicker({
  scenarios,
  selected,
  onPick,
  label = demoPage.pickerLabel,
}: ScenarioPickerProps) {
  return (
    <div
      role="group"
      aria-labelledby="demo-picker-label"
      className="flex flex-col gap-2"
    >
      <span
        id="demo-picker-label"
        className="text-[13px] font-semibold text-muted-foreground"
      >
        {label}
      </span>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-2">
        {scenarios
          ? scenarios.map((scenario) => {
              const active = scenario.id === selected;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onPick(scenario.id)}
                  className={cn(
                    "flex min-h-[76px] cursor-pointer flex-col gap-0.5 rounded-[20px] border-2 px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-ink bg-lime"
                      : "border-white bg-white hover:border-stone-light",
                  )}
                >
                  <span className="text-[15px] font-bold">
                    {scenario.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {scenario.subtitle}
                  </span>
                </button>
              );
            })
          : Array.from({ length: 3 }, (_, index) => (
              <span
                key={index}
                aria-hidden
                className="min-h-[76px] animate-pulse rounded-[20px] bg-white/70"
              />
            ))}
      </div>
    </div>
  );
}
