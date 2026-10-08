import { Menu } from "lucide-react";

import { Logo } from "@/components/shared/brand";
import { Container } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <Container className="flex min-h-19 items-center justify-between gap-3 py-2.5">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-10 items-center rounded-full px-3 text-sm font-medium transition-colors hover:bg-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="pill" className="hidden bg-white font-urdu font-normal sm:inline-flex">
            <a href="#top" lang="ur">
              اردو
            </a>
          </Button>
          <Button asChild size="pill" className="hidden sm:inline-flex">
            <a href={siteConfig.whatsappUrl}>Try on WhatsApp</a>
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-lg" className="size-11 rounded-full bg-white lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-6 bg-background p-6">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Logo />
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {mainNav.map((link) => (
            <SheetClose asChild key={link.href}>
              <a href={link.href} className="flex h-12 items-center rounded-2xl px-4 text-base font-semibold hover:bg-white">
                {link.label}
              </a>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <SheetClose asChild>
            <Button asChild size="pill-lg">
              <a href={siteConfig.whatsappUrl}>Try on WhatsApp</a>
            </Button>
          </SheetClose>
          <Button asChild variant="outline" size="pill-lg" className="bg-white font-urdu font-normal">
            <a href="#top" lang="ur">
              اردو
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
