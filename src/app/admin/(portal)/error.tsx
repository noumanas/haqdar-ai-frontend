"use client";

import { Button } from "@/components/ui/button";

/** Catches anything a section's own error handling didn't, so the navigation stays usable. */
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-white p-6">
      <h2 className="text-base font-semibold">Something went wrong on this page</h2>
      <p className="text-[13px] text-stone">The error has been logged on the server. Try again, or open another section.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
