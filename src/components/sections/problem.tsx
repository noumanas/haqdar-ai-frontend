import { Check, X } from "lucide-react";

import { IconTile } from "@/components/shared/brand";
import { Section, SectionHeading, SplitIntro } from "@/components/shared/section";
import { problem } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function Problem() {
  return (
    <Section id="problem" surface="white" containerClassName="gap-10">
      <SplitIntro
        heading={<SectionHeading eyebrow={problem.eyebrow} title={problem.title} />}
      >
        {problem.body}
      </SplitIntro>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problem.issues.map((issue) => (
          <li key={issue.title} data-reveal className="flex flex-col gap-2.5 rounded-3xl bg-white p-[22px]">
            <IconTile icon={issue.icon} className={toneSurface[issue.tone]} />
            <h3 className="mt-1 text-lg font-bold tracking-[-0.01em]">{issue.title}</h3>
            <p className="text-[15px] leading-[1.55] text-muted-foreground">{issue.body}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 md:grid-cols-2">
        <Comparison title="Today" items={problem.today} variant="before" />
        <Comparison title="With Haqdar" items={problem.withHaqdar} variant="after" />
      </div>
    </Section>
  );
}

function Comparison({ title, items, variant }: { title: string; items: string[]; variant: "before" | "after" }) {
  const isAfter = variant === "after";
  const Icon = isAfter ? Check : X;

  return (
    <div data-reveal className={cn("flex flex-col gap-3.5 rounded-[28px] p-7", isAfter ? "bg-forest text-white" : "bg-sand")}>
      <span className={cn("text-sm font-bold", isAfter ? "text-lime" : "text-muted-foreground")}>{title}</span>
      <ul className="flex flex-col gap-3 text-base leading-normal">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Icon
              className={cn("size-5 flex-none", isAfter ? "text-lime" : "text-alert")}
              strokeWidth={isAfter ? 2.4 : 2.2}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
