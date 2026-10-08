import { LogoMark } from "@/components/shared/brand";

/**
 * Full-screen intro shown on first paint. It is server-rendered so it covers
 * the page before hydration; MotionOrchestrator animates it away.
 */
export function PageLoader() {
  return (
    <div
      data-loader
      data-state="active"
      aria-hidden
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-forest text-white motion-reduce:hidden"
    >
      <noscript>
        <style>{"[data-loader]{display:none}"}</style>
      </noscript>

      <div data-loader-brand className="flex items-center gap-3">
        <LogoMark className="size-12 rounded-2xl bg-lime text-forest" />
        <span className="text-4xl font-extrabold tracking-[-0.03em]">haqdar</span>
      </div>

      <div className="flex w-56 flex-col gap-2">
        <span className="h-0.5 overflow-hidden rounded-full bg-white/15">
          <span data-loader-bar className="block h-full origin-left scale-x-0 bg-lime" />
        </span>
        <span className="flex justify-between text-xs text-forest-mist">
          <span>Know your rights</span>
          <span data-loader-count className="tabular-nums">
            0%
          </span>
        </span>
      </div>
    </div>
  );
}
