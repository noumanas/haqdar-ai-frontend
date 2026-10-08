import { ShieldCheck } from "lucide-react";

import { UrduText, WhatsAppButton } from "@/components/shared/brand";
import { Container } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { hero } from "@/content/site";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

import { PhoneDemo } from "./phone-demo";

export function Hero() {
  return (
    <section id="top" className="pt-10 pb-16 sm:pt-14 sm:pb-18">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-[22px]">
          <ul className="flex flex-wrap gap-2">
            {hero.badges.map(({ label, icon: Icon, tone }) => (
              <li
                key={label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-[13px] font-semibold",
                  toneSurface[tone],
                )}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-ink text-white">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <h1 className="text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.045em]">
            {hero.title}
          </h1>
          <UrduText className="text-2xl">{hero.urduLine}</UrduText>
          <p className="max-w-[560px] text-[19px] leading-[1.55] text-muted-foreground">{hero.body}</p>

          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppButton>Try Haqdar on WhatsApp</WhatsAppButton>
            <Button asChild variant="outline" size="pill-lg" className="border-ink bg-transparent">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <ShieldCheck className="size-4 flex-none text-forest" aria-hidden />
            {hero.disclaimer}
          </p>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative flex min-h-[700px] items-center justify-center">
      <div aria-hidden className="absolute inset-x-[6%] inset-y-[60px] overflow-hidden rounded-[40px] bg-forest">
        <svg width="600" height="600" viewBox="0 0 600 600" className="absolute top-0 left-0">
          <path
            d="M-20 80 C 120 220, 220 60, 320 240 S 520 380, 640 280"
            fill="none"
            className="stroke-lime"
            strokeWidth="1.6"
            opacity="0.6"
          />
          <path
            d="M20 620 C 140 460, 300 560, 440 420"
            fill="none"
            className="stroke-lilac"
            strokeWidth="1.4"
            opacity="0.5"
          />
        </svg>
      </div>

      <PhoneDemo />

      <div className="absolute bottom-16 left-2 hidden w-46 flex-col gap-0.5 rounded-[22px] bg-lilac px-4 py-3.5 shadow-[0_14px_30px_rgb(20_20_20/0.15)] animate-float motion-reduce:animate-none sm:flex">
        <span className="text-xs">Contract read in</span>
        <span className="text-[28px] font-extrabold tracking-[-0.03em]">20 sec</span>
        <span className="text-[11px] text-lilac-ink">Photo deleted after</span>
      </div>
    </div>
  );
}
