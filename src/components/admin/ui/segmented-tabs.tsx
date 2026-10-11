import Link from "next/link";

import { cn } from "@/lib/utils";

export interface TabLink {
  label: string;
  href: string;
  active: boolean;
}

/**
 * Filter tabs that live in the URL (e.g. `?status=needs_review`), so filtered views can be
 * linked to and work without client JavaScript.
 */
export function SegmentedTabs({ tabs, label }: { tabs: TabLink[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-1 rounded-[10px] bg-track p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          scroll={false}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "flex min-h-8 items-center rounded-lg px-3 text-[13px] font-semibold whitespace-nowrap transition-colors",
            tab.active ? "bg-white shadow-xs" : "hover:bg-white/60",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
