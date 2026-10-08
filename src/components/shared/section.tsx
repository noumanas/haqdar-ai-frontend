import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-8", className)} {...props} />;
}

type SectionProps = ComponentProps<"section"> & {
  surface?: "sand" | "white" | "forest";
  containerClassName?: string;
};

const surfaces = {
  sand: "",
  white: "bg-white",
  forest: "bg-forest text-white",
} as const;

export function Section({ surface = "sand", className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-20", surfaces[surface], className)} {...props}>
      <Container className={cn("flex flex-col gap-9", containerClassName)}>{children}</Container>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Use on dark (forest) sections. */
  inverted?: boolean;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, inverted, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-3.5", className)}>
      <Eyebrow inverted={inverted}>{eyebrow}</Eyebrow>
      <h2 data-split className="text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.035em]">{title}</h2>
      {description && (
        <p data-reveal className={cn("text-base", inverted ? "text-forest-mist" : "text-muted-foreground")}>{description}</p>
      )}
    </div>
  );
}

export function Eyebrow({ inverted, children }: { inverted?: boolean; children: ReactNode }) {
  return (
    <span
      data-reveal
      className={cn(
        "text-[13px] font-bold tracking-[0.08em] uppercase",
        inverted ? "text-lime" : "text-forest",
      )}
    >
      {children}
    </span>
  );
}

/** Two-column intro: heading on the left, supporting paragraph on the right. */
export function SplitIntro({
  heading,
  children,
  inverted,
}: {
  heading: ReactNode;
  children: ReactNode;
  inverted?: boolean;
}) {
  return (
    <div className="grid items-end gap-8 md:grid-cols-2">
      {heading}
      <p data-reveal className={cn("text-[17px] leading-relaxed", inverted ? "text-forest-mist" : "text-muted-foreground")}>
        {children}
      </p>
    </div>
  );
}
