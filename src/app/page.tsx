import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Languages } from "@/components/sections/languages";
import { Partners } from "@/components/sections/partners";
import { Pilot } from "@/components/sections/pilot";
import { Problem } from "@/components/sections/problem";
import { Story } from "@/components/sections/story";
import { Trust } from "@/components/sections/trust";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Story />
        <Trust />
        <Languages />
        <Pilot />
        <Partners />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
