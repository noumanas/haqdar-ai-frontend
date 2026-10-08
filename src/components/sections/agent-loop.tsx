import { agent } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

const panelTitle = "text-sm font-bold text-lime";

/** "Behind the chat": explains that Haqdar is an agent that plans, acts, checks and follows up. */
export function AgentLoop() {
  const { badge, tools, example } = agent;
  const BadgeIcon = badge.icon;

  return (
    <div id="agent" className="flex flex-col gap-6 rounded-[32px] bg-white p-6 sm:p-8">
      <div className="grid items-end gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span
            data-reveal
            className="inline-flex items-center gap-2 self-start rounded-full bg-lime px-3 py-1.5 text-xs font-bold"
          >
            <BadgeIcon className="size-3.5" aria-hidden />
            {badge.label}
          </span>
          <h3 data-split className="text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
            {agent.title}
          </h3>
        </div>
        <p data-reveal className="text-base leading-relaxed text-muted-foreground">
          {agent.body}
        </p>
      </div>

      <ol className="flex flex-wrap gap-2.5">
        {agent.loop.map((step, index) => (
          <li
            key={step.title}
            data-reveal
            className={cn(
              "flex min-w-0 flex-[1_1_190px] flex-col gap-2 rounded-[22px] p-[18px]",
              toneSurface[step.tone],
            )}
          >
            <span className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[13px] font-extrabold text-lime">
                {index + 1}
              </span>
              <span className="text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase">
                {step.phase}
              </span>
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.01em]">{step.title}</span>
            <span className="text-sm leading-normal text-ink-soft">{step.body}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        <div data-reveal className="flex flex-col gap-3.5 rounded-[26px] bg-forest p-6">
          <span className={panelTitle}>{tools.title}</span>
          <ul className="flex flex-wrap gap-2">
            {tools.items.map(({ label, icon: Icon }) => (
              <li
                key={label}
                data-reveal
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest-deep py-0 pr-3.5 pl-1.5 text-[13px] font-semibold text-white"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-lime text-foreground">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-normal text-forest-mist">{tools.note}</p>
        </div>

        <div data-reveal className="flex flex-col gap-3 rounded-[26px] bg-forest-deep p-6">
          <div className="flex flex-col gap-1">
            <span className={panelTitle}>{example.title}</span>
            <span className="text-[13px] text-forest-mist">{example.prompt}</span>
          </div>

          <ol>
            {example.events.map((event) => (
              <li key={event.tag} className="group grid grid-cols-[22px_1fr] gap-3">
                <span className="flex flex-col items-center" aria-hidden>
                  <span className={cn("mt-1 size-3 flex-none rounded-full", toneSurface[event.tone])} />
                  <span data-draw="y" className="mt-1 w-0.5 flex-1 bg-forest-line group-last:hidden" />
                </span>
                <span className="flex flex-col gap-0.5 pb-3.5">
                  <span className="text-[11px] font-semibold tracking-[0.06em] text-forest-sage uppercase">
                    {event.tag}
                  </span>
                  <span className="text-[15px] font-bold text-white">{event.title}</span>
                  <span className="text-[13px] leading-normal text-forest-mist">{event.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
