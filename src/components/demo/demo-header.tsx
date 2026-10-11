import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/brand";
import { Container } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { demoPage } from "@/content/demo";
import { siteConfig } from "@/content/site";

export function DemoHeader() {
  return (
    <header className="border-b">
      <Container className="flex min-h-18 flex-wrap items-center justify-between gap-3 py-2.5">
        <Logo href="/" showTagline={false} />
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="pill" className="bg-white">
            <Link href="/">
              <ChevronLeft className="size-4" aria-hidden />
              {demoPage.backLabel}
            </Link>
          </Button>
          <Button asChild size="pill" className="hidden sm:inline-flex">
            <Link
              href={
                siteConfig.whatsappUrl.startsWith("#")
                  ? `/${siteConfig.whatsappUrl}`
                  : siteConfig.whatsappUrl
              }
            >
              {demoPage.whatsappLabel}
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
