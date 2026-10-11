import { Suspense } from "react";

import { AdminSidebar, NavCount } from "@/components/admin/shell/admin-sidebar";
import { adminApi } from "@/lib/admin/api";
import { load } from "@/lib/admin/load";

/** The signed-in portal: navigation rail plus the current screen. */
export default function PortalLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <AdminSidebar
        reviewBadge={
          <Suspense fallback={null}>
            <ReviewCount />
          </Suspense>
        }
      />
      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 pt-6 pb-12 sm:px-8">{children}</main>
    </div>
  );
}

/** Conversations waiting for an admin, shown on the navigation item. */
async function ReviewCount() {
  const queue = await load(() => adminApi.conversations({ status: "needs_review", limit: 1 }));
  return queue.ok ? <NavCount count={queue.data.meta.total} /> : null;
}
