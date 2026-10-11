"use client";

import { BookOpen, CircleCheck, Globe, LayoutGrid, LogOut, MessageCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: ReactNode;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

/** Section links match their sub-pages; the overview and the public site match exactly. */
const isActive = (pathname: string, href: string): boolean =>
  href === "/admin" || href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The portal's navigation: a fixed rail on desktop, a scrolling bar above the content on
 * small screens. `reviewBadge` streams in separately, so navigation never waits on the API.
 */
export function AdminSidebar({ reviewBadge }: { reviewBadge: ReactNode }) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      items: [
        { label: "Overview", href: "/admin", icon: LayoutGrid },
        { label: "Conversations", href: "/admin/conversations", icon: MessageCircle, badge: reviewBadge },
      ],
    },
    {
      label: "Quality",
      items: [
        { label: "Knowledge base", href: "/admin/knowledge", icon: BookOpen },
        { label: "Accuracy & testing", href: "/admin/accuracy", icon: CircleCheck },
      ],
    },
    { label: "Preview", items: [{ label: "Public website", href: "/", icon: Globe }] },
  ];

  return (
    <aside className="flex w-full flex-col gap-4 border-b border-line bg-rail px-3.5 py-4 md:sticky md:top-0 md:h-svh md:w-[236px] md:flex-none md:border-r md:border-b-0 md:py-5">
      <div className="flex items-center justify-between px-1.5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-[10px] bg-brand-orange text-white">
            <ShieldCheck className="size-[15px]" aria-hidden />
          </span>
          <span className="text-base font-bold">haqdar</span>
          <span className="text-xs text-stone">admin</span>
        </Link>
        <SignOutButton className="md:hidden" />
      </div>

      <nav aria-label="Admin" className="flex gap-0.5 overflow-x-auto md:flex-col md:overflow-visible">
        {groups.map((group) => (
          <div key={group.label ?? "main"} className="flex gap-0.5 md:flex-col">
            {group.label && (
              <span className="hidden px-2.5 pt-3.5 pb-1.5 text-[11px] text-stone md:block">{group.label}</span>
            )}
            {group.items.map(({ label, href, icon: Icon, badge }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 flex-none items-center gap-2.5 rounded-[10px] px-2.5 text-sm whitespace-nowrap transition-colors",
                    active ? "bg-ink font-semibold text-white" : "font-medium text-ink-muted hover:bg-hairline",
                  )}
                >
                  <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden />
                  {label}
                  {badge}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto hidden items-center gap-2.5 border-t border-line px-2 pt-3 md:flex">
        <span className="flex size-8 flex-none items-center justify-center rounded-full bg-lilac text-xs font-bold">HA</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] font-semibold">Haqdar admin</span>
          <span className="text-[11px] text-stone">Pilot</span>
        </span>
        <SignOutButton />
      </div>
    </aside>
  );
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logout} className={className}>
      <button
        type="submit"
        aria-label="Sign out"
        className="flex size-8 items-center justify-center rounded-lg text-stone hover:bg-hairline hover:text-foreground"
      >
        <LogOut className="size-4" aria-hidden />
      </button>
    </form>
  );
}

/** The orange count badge used in the navigation. */
export function NavCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
