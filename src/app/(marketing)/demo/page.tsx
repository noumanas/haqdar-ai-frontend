import type { Metadata } from "next";

import { DemoExperience } from "@/components/demo/demo-experience";
import { DemoHeader } from "@/components/demo/demo-header";
import { Container } from "@/components/shared/section";
import { demoPage } from "@/content/demo";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: `${demoPage.title} · ${siteConfig.name}`,
  description: demoPage.description,
};

export default function DemoPage() {
  return (
    <>
      <DemoHeader />
      <main>
        <Container className="pt-10 pb-16">
          <DemoExperience intro={<DemoIntro />} />
        </Container>
      </main>
    </>
  );
}

function DemoIntro() {
  return (
    <>
      <span className="self-start rounded-full bg-lime px-3 py-1.5 text-xs font-bold">
        {demoPage.badge}
      </span>
      <h1 className="text-[clamp(2.125rem,4.4vw,3.375rem)] leading-[1.04] font-extrabold tracking-[-0.04em]">
        {demoPage.heading}
      </h1>
      <p className="text-[17px] leading-[1.55] text-muted-foreground">
        {demoPage.intro}
      </p>
    </>
  );
}
