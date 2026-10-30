import type { Metadata } from "next";
import { Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";

import { siteConfig } from "@/content/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} AI Assistant · ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${naskh.variable}`}>
      <body>{children}</body>
    </html>
  );
}
