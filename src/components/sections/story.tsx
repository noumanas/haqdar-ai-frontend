import { Section, SectionHeading } from "@/components/shared/section";
import { story } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function Story() {
  return (
    <Section containerClassName="gap-8">
      <SectionHeading eyebrow={story.eyebrow} title={story.title} description={story.note} />

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="grid min-w-[880px] grid-cols-4">
          {story.events.map((event) => (
            <li key={event.title} className="flex flex-col gap-1.5 pr-4">
              <span className="flex items-center" aria-hidden>
                <span className={cn("size-3.5 flex-none rounded-full", toneSurface[event.tone])} />
                <span className="h-0.5 flex-1 bg-input" />
              </span>
              <span className="mt-1.5 text-xs text-stone">{event.when}</span>
              <span className="text-base font-bold">{event.title}</span>
              <span className="text-sm leading-normal text-muted-foreground">{event.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
