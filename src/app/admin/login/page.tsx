import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-line bg-white p-7">
        <div className="flex flex-col gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-orange text-white">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Haqdar admin</h1>
            <p className="text-[13px] text-stone">
              Sign in with the admin API key from the backend’s <code>ADMIN_API_KEY</code> setting.
            </p>
          </div>
        </div>
        <Suspense fallback={null}>
          <ExpiredNotice searchParams={searchParams} />
        </Suspense>
        <LoginForm />
      </div>
    </div>
  );
}

async function ExpiredNotice({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { reason } = await searchParams;
  if (reason !== "expired") return null;
  return (
    <p role="status" className="rounded-xl border border-notice-line bg-notice px-3 py-2.5 text-[13px] text-notice-text">
      Your session is no longer valid. Sign in again.
    </p>
  );
}
