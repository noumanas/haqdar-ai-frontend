import { UrduText, WhatsAppButton } from "@/components/shared/brand";
import { Container } from "@/components/shared/section";
import { cta } from "@/content/site";

export function Cta() {
  return (
    <section id="start" className="pb-20">
      <Container>
        <div
          data-reveal
          className="relative grid items-center gap-8 overflow-hidden rounded-[40px] bg-lime px-6 py-14 sm:px-10 md:grid-cols-2">
          <svg
            width="1100"
            height="360"
            viewBox="0 0 1100 360"
            aria-hidden
            data-parallax="0.3"
            className="pointer-events-none absolute top-0 left-0"
          >
            <path
              d="M-20 300 C 200 120, 420 360, 700 140 S 1000 40, 1120 120"
              fill="none"
              className="stroke-forest"
              strokeWidth="1.6"
              opacity="0.3"
            />
          </svg>

          <div className="relative flex flex-col gap-4">
            <h2 data-split className="text-[clamp(2.125rem,4.4vw,3.375rem)] leading-[1.04] font-extrabold tracking-[-0.04em]">
              {cta.title}
            </h2>
            <UrduText className="text-xl">{cta.urduLine}</UrduText>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton chip="white">{cta.button}</WhatsAppButton>
            </div>
            <span className="text-[13px] text-lime-ink">{cta.meta}</span>
          </div>

          <div className="relative flex flex-col items-center gap-2.5 justify-self-center rounded-[28px] bg-white p-5">
            {/* TODO: replace placeholder with the real WhatsApp QR code image. */}
            <div
              role="img"
              aria-label="QR code placeholder"
              className="flex size-45 items-center justify-center rounded-2xl border-2 border-dashed border-stone bg-sand p-3 text-center text-[13px] text-muted-foreground"
            >
              [WhatsApp QR code]
            </div>
            <span className="text-[13px] font-semibold">Scan to start</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
