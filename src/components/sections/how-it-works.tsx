import { AgentLoop } from "@/components/sections/agent-loop";
import { Section, SectionHeading } from "@/components/shared/section";
import { steps } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading eyebrow={steps.eyebrow} title={steps.title} />

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.items.map((step, index) => (
          <li
            key={step.title}
            data-reveal
            className={cn(
              "flex min-h-60 flex-col gap-3 rounded-[28px] p-[26px] transition-transform duration-300 hover:-translate-y-1",
              toneSurface[step.tone],
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-ink text-[17px] font-extrabold text-lime">
              {index + 1}
            </span>
            <h3 className="mt-auto text-[22px] font-extrabold tracking-[-0.02em]">{step.title}</h3>
            <p className="text-[15px] leading-[1.55] text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>

      <AgentLoop />
    </Section>
  );
}
