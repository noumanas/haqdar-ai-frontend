import { Section, SectionHeading } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { partners } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function Partners() {
  return (
    <Section id="partners" surface="white">
      <SectionHeading eyebrow={partners.eyebrow} title={partners.title} />

      <div className="grid gap-4 md:grid-cols-3">
        {partners.items.map((partner) => (
          <article
            key={partner.title}
            data-reveal
            className={cn(
              "flex flex-col gap-3 rounded-[28px] p-[26px] transition-transform duration-300 hover:-translate-y-1",
              toneSurface[partner.tone],
            )}
          >
            <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">{partner.title}</h3>
            <p className="flex-1 text-[15px] leading-[1.55] text-ink-soft">{partner.body}</p>
            <Button asChild size="pill" className="self-start">
              <a href="#contact">{partner.cta}</a>
            </Button>
          </article>
        ))}
      </div>
    </Section>
  );
}
