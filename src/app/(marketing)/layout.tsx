import { SmoothScroll } from "@/components/motion/smooth-scroll";

/** The public site scrolls with Lenis; the admin portal keeps native scrolling. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
