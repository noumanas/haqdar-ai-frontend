import { ArrowRight, Flag, Mic, Play } from "lucide-react";

import { LogoMark, UrduText } from "@/components/shared/brand";

/** Heights (px) and delays (s) for the voice-note waveform bars. */
const WAVEFORM = [
  [8, 0], [16, 0.15], [10, 0.3], [20, 0.05], [12, 0.25], [6, 0.4],
  [18, 0.1], [10, 0.35], [14, 0.2], [8, 0.45], [16, 0.05], [10, 0.3],
] as const;

const DEMO_DESCRIPTION =
  "Haqdar running on a phone: a worker sends an Urdu voice note about late salary, Haqdar replies with the law, finds AED 1,750 missing, and suggests filing a complaint";

/**
 * A looping, CSS-only WhatsApp-style conversation shown in the hero.
 * Every message animates on the same 12s timeline (see globals.css).
 */
export function PhoneDemo() {
  return (
    <div
      role="img"
      aria-label={DEMO_DESCRIPTION}
      data-hero-phone
      className="relative aspect-[330/716] w-[min(330px,100%)] rounded-[58px] bg-[#1a1a1a] p-2.5 shadow-[0_30px_60px_rgb(10_30_24/0.35),inset_0_0_0_2px_#3a3a38]"
    >
      <HardwareButtons />

      <div className="relative flex size-full flex-col overflow-hidden rounded-[48px] bg-sand">
        <StatusBar />
        <ChatHeader />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
          <VoiceNote />
          <TypingIndicator />
          <LawReply />
          <SalaryCheck />
          <ComplaintAction />
        </div>

        <Composer />
        <span className="absolute bottom-1.5 left-1/2 h-1 w-30 -translate-x-1/2 rounded-full bg-foreground" />
      </div>

      <FloatingCard />
    </div>
  );
}

function HardwareButtons() {
  return (
    <>
      <span className="absolute top-[150px] -left-[3px] h-[34px] w-[3px] rounded-sm bg-[#2c2c2a]" />
      <span className="absolute top-[200px] -left-[3px] h-14 w-[3px] rounded-sm bg-[#2c2c2a]" />
      <span className="absolute top-[190px] -right-[3px] h-[84px] w-[3px] rounded-sm bg-[#2c2c2a]" />
    </>
  );
}

function StatusBar() {
  return (
    <div className="relative flex h-[50px] flex-none items-center justify-between px-7 text-sm font-bold">
      <span>9:41</span>
      <span className="absolute top-[11px] left-1/2 h-[30px] w-[104px] -translate-x-1/2 rounded-2xl bg-[#0a0a0a]" />
      <span className="flex items-center gap-1">
        <span className="h-[9px] w-4 rounded-[2px] bg-foreground" />
        <span className="h-[11px] w-[22px] rounded-[3px] border-[1.5px] border-foreground p-px">
          <span className="block h-full w-[70%] rounded-[1px] bg-foreground" />
        </span>
      </span>
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="flex flex-none items-center gap-2.5 border-b px-4 pt-1.5 pb-2.5">
      <LogoMark className="size-8 rounded-[10px]" />
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-bold">Haqdar</span>
        <span className="text-[11px] text-muted-foreground">Replies in Urdu voice</span>
      </span>
      <span className="rounded-full bg-lime px-2 py-1 text-[10px] font-bold">Online</span>
    </div>
  );
}

function VoiceNote() {
  return (
    <div className="flex max-w-[86%] flex-col gap-1 self-end rounded-[18px_18px_4px_18px] bg-lime px-3 py-2.5 animate-chat-voice motion-reduce:animate-none">
      <span className="flex items-center gap-1.5">
        <Play className="size-3.5 fill-foreground" strokeWidth={0} aria-hidden />
        <span className="flex h-5 items-center gap-[3px]">
          {WAVEFORM.map(([height, delay], i) => (
            <span
              key={i}
              className="w-[3px] rounded-sm bg-foreground animate-wave motion-reduce:animate-none"
              style={{ height, animationDelay: `${delay}s` }}
            />
          ))}
        </span>
        <span className="text-[11px] text-lime-ink">0:12</span>
      </span>
      <UrduText className="text-right text-[13px] text-foreground">میری تنخواہ دو مہینے سے نہیں آئی</UrduText>
      <span className="text-[11px] text-lime-ink">“My salary hasn&apos;t come for two months.”</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-[5px] self-start overflow-hidden rounded-[18px_18px_18px_4px] bg-white px-3.5 py-3 animate-chat-typing motion-reduce:hidden">
      {[0, 0.15, 0.3].map((delay) => (
        <span
          key={delay}
          className="size-[7px] rounded-full bg-stone animate-typing-dot"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}

function LawReply() {
  return (
    <div className="flex max-w-[90%] flex-col gap-1.5 self-start rounded-[18px_18px_18px_4px] bg-white px-3 py-2.5 animate-chat-reply motion-reduce:animate-none">
      <span className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-ink">
          <Play className="size-2.5 fill-lime" strokeWidth={0} aria-hidden />
        </span>
        <span className="h-[3px] flex-1 rounded-sm bg-muted">
          <span className="block h-[3px] w-[35%] rounded-sm bg-foreground animate-chat-progress motion-reduce:animate-none" />
        </span>
        <span className="text-[10px] text-muted-foreground">0:34</span>
      </span>
      <span className="text-xs leading-[1.45]">
        Your company must pay on time through the bank (WPS). You can file a free complaint with MOHRE.
      </span>
      <span className="self-start rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">
        Source: UAE Labour Law · WPS
      </span>
    </div>
  );
}

function SalaryCheck() {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] bg-white px-3 py-2.5 animate-chat-check motion-reduce:animate-none">
      <span className="text-[11px] text-muted-foreground">Salary check</span>
      <span className="grid grid-cols-[52px_1fr] items-center gap-1.5 text-[10px]">
        <span>Expected</span>
        <span className="h-1.5 rounded-[3px] bg-forest" />
        <span>Paid</span>
        <span className="h-1.5 rounded-[3px] bg-muted">
          <span className="block h-1.5 w-[74%] rounded-[3px] bg-coral animate-chat-paid motion-reduce:animate-none" />
        </span>
      </span>
      <span className="self-start rounded-full bg-peach px-2.5 py-1 text-xs font-bold text-[#6a2a0e]">
        AED 1,750 missing
      </span>
    </div>
  );
}

function ComplaintAction() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-forest py-1.5 pr-1.5 pl-3.5 text-white animate-chat-action motion-reduce:animate-none">
      <span className="flex-1 text-xs font-bold">File a free complaint · 4 steps</span>
      <span className="flex size-[30px] items-center justify-center rounded-full bg-lime text-foreground">
        <ArrowRight className="size-3.5" strokeWidth={2.2} aria-hidden />
      </span>
    </div>
  );
}

function Composer() {
  return (
    <div className="flex flex-none items-center gap-2 px-3 pt-2 pb-[18px]">
      <span className="flex h-10 flex-1 items-center rounded-full border bg-white px-3.5 text-xs text-stone">
        Type or hold the mic
      </span>
      <span className="flex size-10 items-center justify-center rounded-full bg-ink text-lime animate-mic-pulse motion-reduce:animate-none">
        <Mic className="size-[18px]" aria-hidden />
      </span>
    </div>
  );
}

function FloatingCard() {
  return (
    <div
      data-hero-float
      className="absolute top-[191px] -right-[72px] hidden items-center gap-2.5 rounded-[22px] bg-white px-3.5 py-3 shadow-[0_14px_30px_rgb(20_20_20/0.15)] [animation-delay:-2.5s] animate-float motion-reduce:animate-none sm:flex">
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-lime">
        <Flag className="size-4" aria-hidden />
      </span>
      <span className="flex flex-col whitespace-nowrap">
        <span className="text-[13px] font-bold">Complaint guide</span>
        <span className="text-[11px] text-muted-foreground">Step 2 of 4</span>
      </span>
    </div>
  );
}
