import type { ComponentProps } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex size-9 flex-none items-center justify-center rounded-xl bg-forest text-lime", className)}
    >
      <ShieldCheck className="size-[55%]" strokeWidth={2} aria-hidden />
    </span>
  );
}

export function Logo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5 text-foreground" aria-label={`${siteConfig.name} home`}>
      <LogoMark />
      <span className="flex flex-col">
        <span className="text-xl leading-none font-extrabold tracking-[-0.02em]">haqdar</span>
        {showTagline && <span className="text-[11px] text-muted-foreground">AI rights assistant</span>}
      </span>
    </a>
  );
}

/** Urdu copy: right-to-left Nastaliq script with the generous line height it needs. */
export function UrduText({ className, ...props }: ComponentProps<"p">) {
  return <p lang="ur" dir="rtl" className={cn("text-left font-urdu leading-[1.9] text-forest", className)} {...props} />;
}

type WhatsAppButtonProps = {
  children: string;
  /** Colour of the round arrow chip at the end of the button. */
  chip?: "lime" | "white";
  className?: string;
};

export function WhatsAppButton({ children, chip = "lime", className }: WhatsAppButtonProps) {
  return (
    <Button asChild size="pill-lg" className={cn("pr-2 pl-[26px] text-[17px] hover:bg-ink/85", className)}>
      <a href={siteConfig.whatsappUrl}>
        {children}
        <span
          className={cn(
            "flex size-11 flex-none items-center justify-center rounded-full text-foreground transition-transform duration-300 group-hover/button:translate-x-1",
            chip === "lime" ? "bg-lime" : "bg-white",
          )}
        >
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </a>
    </Button>
  );
}

type IconTileProps = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
};

export function IconTile({ icon: Icon, className }: IconTileProps) {
  return (
    <span className={cn("flex size-11 flex-none items-center justify-center rounded-[14px]", className)}>
      <Icon className="size-[22px]" strokeWidth={1.9} aria-hidden />
    </span>
  );
}
