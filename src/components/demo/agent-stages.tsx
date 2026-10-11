import { agentStages, demoPage } from "@/content/demo";
import type { AgentStage } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

/** The loop the agent is in right now, highlighted among all five stages. */
export function AgentStages({ stage }: { stage: AgentStage }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-muted-foreground">
        {demoPage.stagesLabel}
      </span>
      {agentStages.map(({ id, label }) => (
        <span
          key={id}
          aria-current={id === stage ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors duration-300",
            id === stage ? "bg-ink text-lime" : "bg-white text-stone",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
