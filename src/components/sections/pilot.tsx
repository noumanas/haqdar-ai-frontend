import { Container, Eyebrow } from "@/components/shared/section";
import { pilot } from "@/content/site";

export function Pilot() {
  return (
    <section className="pb-20">
      <Container>
        <div data-reveal className="flex flex-col gap-5 rounded-[32px] bg-white p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Eyebrow>{pilot.eyebrow}</Eyebrow>
            <span className="text-[13px] text-stone">{pilot.note}</span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pilot.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="text-[44px] font-extrabold tracking-[-0.03em]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
