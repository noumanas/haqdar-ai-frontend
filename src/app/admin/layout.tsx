import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Haqdar admin", default: "Haqdar admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-svh bg-canvas text-foreground">{children}</div>;
}
