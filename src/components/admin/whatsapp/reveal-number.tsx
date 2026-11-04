"use client";

import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";

import { revealWhatsAppNumber } from "@/app/admin/actions";

/**
 * A worker's number, masked until an admin deliberately reveals it. The full number is
 * fetched on click (never sent with the page) and the backend logs each reveal.
 */
export function RevealNumber({ workerId, maskedPhone }: { workerId: string; maskedPhone: string }) {
  const [phone, setPhone] = useState<string>();
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const reveal = () =>
    startTransition(async () => {
      const result = await revealWhatsAppNumber(workerId);
      setPhone(result.phone);
      setError(result.error);
    });

  const copy = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Couldn’t copy. Select the number instead.");
    }
  };

  const button =
    "flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold hover:bg-hairline disabled:opacity-50";

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums" aria-live="polite">
          {phone ?? maskedPhone}
        </span>
        {phone ? (
          <>
            <button type="button" onClick={copy} className={button}>
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={() => setPhone(undefined)} className={button}>
              <EyeOff className="size-3.5" aria-hidden />
              Hide
            </button>
          </>
        ) : (
          <button type="button" onClick={reveal} disabled={pending} className={button}>
            <Eye className="size-3.5" aria-hidden />
            {pending ? "Showing…" : "Show number"}
          </button>
        )}
      </div>
      {phone && <span className="text-[11px] text-stone">This reveal was logged.</span>}
      {error && (
        <span role="alert" className="text-xs text-alarm-ink">
          {error}
        </span>
      )}
    </div>
  );
}
