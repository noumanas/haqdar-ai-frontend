import { Section, SectionHeading, SplitIntro } from "@/components/shared/section";
import { trust } from "@/content/site";

export function Trust() {
  return (
    <Section id="trust" surface="forest">
      <SplitIntro
        inverted
        heading={<SectionHeading eyebrow={trust.eyebrow} title={trust.title} inverted />}
      >
        {trust.body}
      </SplitIntro>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trust.pillars.map(({ icon: Icon, title, body }) => (
          <li key={title} data-reveal className="flex flex-col gap-2.5 rounded-3xl bg-forest-deep p-6">
            <span className="flex size-11 items-center justify-center rounded-full bg-lime text-foreground">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-1 text-lg font-bold">{title}</h3>
            <p className="text-[15px] leading-[1.55] text-forest-mist">{body}</p>
          </li>
        ))}
      </ul>

      <p data-reveal className="text-[13px] text-forest-mist">{trust.disclaimer}</p>
    </Section>
  );
}
