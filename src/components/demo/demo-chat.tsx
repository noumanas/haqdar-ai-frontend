"use client";

import { RotateCcw, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/shared/brand";
import { demoPage } from "@/content/demo";

import { Bubble, TypingIndicator } from "./chat-bubbles";
import {
  ChatComposer,
  ModeChoice,
  type ChatMode,
  type QuickReply,
} from "./chat-composer";
import type { Activity, ChatEntry, DemoError } from "./use-demo";
import {
  useReadAloud,
  type SpokenPart,
  type VoiceLanguage,
} from "./use-speech";

const copy = demoPage.chat;

type DemoChatProps = {
  /** "live": the real agent answers; "guided": the scripted example cases. */
  variant: "live" | "guided";
  entries: ChatEntry[];
  chips: QuickReply[];
  activity: Activity;
  error: DemoError<unknown> | null;
  canSend: boolean;
  emptySend?: string;
  onChip: (chip: QuickReply) => void;
  onSend: (text: string, spoken: boolean) => void;
  onContract: (photo: File) => void;
  onRestart: () => void;
  onRetry: () => void;
  /** Shown when the live AI is unavailable. */
  onUseGuided?: () => void;
  /** Live chat sends recorded voice notes; the guided demo uses browser speech recognition. */
  onVoiceNote?: (recording: Blob, seconds: number) => void;
  /** A note that the visitor is close to the demo's limit. */
  quotaHint?: string;
};

/** What Haqdar says aloud for one of its chat entries. */
function speechFor(entry: ChatEntry): SpokenPart[] {
  if (entry.kind === "message") {
    const { text, urdu, card } = entry.message;
    return [
      { text, lang: "en" },
      ...(urdu ? [{ text: urdu, lang: "ur" as const }] : []),
      ...(card
        ? [{ text: `${card.label}: ${card.value}`, lang: "en" as const }]
        : []),
    ];
  }
  // Live answers come with their own voice note, played instead of the browser's voice.
  if (entry.kind === "live") return [];
  if (entry.kind === "contract") {
    const flags = entry.reading.legible
      ? entry.reading.flags.map((flag) => flag.title)
      : [];
    return [entry.reading.message, ...flags].map((text) => ({
      text,
      lang: "en",
    }));
  }
  return [];
}

export function DemoChat({
  variant,
  entries,
  chips,
  activity,
  error,
  canSend,
  emptySend,
  onChip,
  onSend,
  onContract,
  onRestart,
  onRetry,
  onUseGuided,
  onVoiceNote,
  quotaHint,
}: DemoChatProps) {
  const [mode, setMode] = useState<ChatMode>("choose");
  const [language, setLanguage] = useState<VoiceLanguage>("ur-PK");
  const [muted, setMuted] = useState(false);
  const section = useRef<HTMLElement>(null);
  const voicePlayed = useRef(new Set<number>());
  const readAloud = useReadAloud();
  const spoken = useRef(new Set<number>());
  const busy = activity !== null;

  // In voice mode Haqdar reads out its newest replies: those since the visitor last spoke.
  useEffect(() => {
    if (mode !== "voice" || muted) return;
    const lastUser = entries.findLastIndex((entry) => entry.from === "user");
    const fresh = entries
      .slice(lastUser + 1)
      .filter(
        (entry) => entry.from === "agent" && !spoken.current.has(entry.id),
      );
    if (fresh.length === 0) return;
    fresh.forEach((entry) => spoken.current.add(entry.id));
    readAloud.speak(fresh.flatMap(speechFor));
  }, [entries, mode, muted, readAloud]);

  // In voice mode the newest answer's voice note plays by itself, once, like an incoming voice message.
  useEffect(() => {
    if (mode !== "voice" || muted) return;
    const lastUser = entries.findLastIndex((entry) => entry.from === "user");
    const next = entries
      .slice(lastUser + 1)
      .find(
        (entry) =>
          entry.kind === "live" &&
          entry.voice.status === "ready" &&
          !voicePlayed.current.has(entry.id),
      );
    if (!next) return;
    voicePlayed.current.add(next.id);
    const player = section.current?.querySelector<HTMLAudioElement>(
      `audio[data-reply-voice="${next.id}"]`,
    );
    if (!player) return;
    stopVoices();
    // Browsers may block playback without a recent tap; the player is still there to press.
    void player.play().catch(() => {});
  }, [entries, mode, muted]);

  function stopVoices() {
    section.current
      ?.querySelectorAll("audio")
      .forEach((audio) => audio.pause());
  }

  function silence() {
    readAloud.cancel();
    stopVoices();
  }

  function changeMode(next: Exclude<ChatMode, "choose">) {
    if (next === "text") silence();
    setMode(next);
  }

  function toggleMuted() {
    if (!muted) silence();
    setMuted(!muted);
  }

  const status =
    activity === "reading_contract"
      ? copy.readingContract
      : activity === "listening"
        ? copy.listening
        : activity === "typing"
          ? copy.typing
          : variant === "live"
            ? copy.online
            : copy.onlineGuided;

  return (
    <section
      ref={section}
      aria-label="Demo chat"
      className="flex h-[640px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_20px_50px_rgb(20_40_30/0.10)] sm:h-[760px]"
    >
      <div className="flex flex-none items-center gap-2.5 border-b border-hairline px-[18px] py-3.5">
        <LogoMark />
        <span className="flex flex-1 flex-col">
          <span className="text-[15px] font-bold">{copy.name}</span>
          <span className="text-xs text-muted-foreground">{status}</span>
        </span>
        {mode === "voice" && readAloud.supported && (
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? copy.unmute : copy.mute}
            title={muted ? copy.unmute : copy.mute}
            aria-pressed={!muted}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-line bg-white outline-none hover:bg-paper focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {muted ? (
              <VolumeX className="size-4" aria-hidden />
            ) : (
              <Volume2 className="size-4" aria-hidden />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            silence();
            onRestart();
          }}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold transition-colors outline-none hover:bg-paper focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {copy.restart}
        </button>
      </div>

      {/* column-reverse keeps the newest message in view without any scroll code. */}
      <div
        data-lenis-prevent
        className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto overscroll-contain bg-sand"
      >
        <div
          role="log"
          aria-live="polite"
          aria-busy={busy}
          className="flex flex-col gap-2.5 p-4"
        >
          {entries.map((entry) => (
            <Bubble key={entry.id} entry={entry} />
          ))}
          {busy && <TypingIndicator label={`Haqdar is ${status}`} />}
          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-3 self-stretch rounded-2xl border border-notice-line bg-notice px-4 py-3 text-sm text-notice-text"
            >
              <TriangleAlert
                className="size-4 flex-none text-notice-ink"
                aria-hidden
              />
              <span className="flex-1">{error.message}</span>
              {error.action != null && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="min-h-9 cursor-pointer rounded-full bg-ink px-3.5 text-xs font-semibold text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {copy.retry}
                </button>
              )}
              {error.offerGuided && onUseGuided && (
                <button
                  type="button"
                  onClick={onUseGuided}
                  className="min-h-9 cursor-pointer rounded-full border border-notice-line bg-white px-3.5 text-xs font-semibold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {copy.useGuided}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {quotaHint && !error && (
        <p
          aria-live="polite"
          className="flex-none border-t border-hairline bg-paper px-4 py-2 text-center text-xs text-stone"
        >
          {quotaHint}
        </p>
      )}
      {mode === "choose" ? (
        <ModeChoice
          onChoose={changeMode}
          hint={variant === "live" ? demoPage.modeChoice.liveHint : undefined}
        />
      ) : (
        <ChatComposer
          mode={mode}
          chips={chips}
          busy={busy}
          canSend={canSend}
          emptySend={emptySend}
          language={language}
          onLanguage={setLanguage}
          onMode={changeMode}
          onChip={onChip}
          onSend={onSend}
          onContract={onContract}
          onListen={silence}
          onVoiceNote={onVoiceNote}
        />
      )}
    </section>
  );
}
