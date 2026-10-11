"use client";

import { Pause, Play } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

type VoiceNotePlayerProps = {
  /** The recording; leave it out while the voice note is still being made. */
  src?: string;
  /** Shown in place of the time while there is no recording yet. */
  pendingLabel?: string;
  /** Lets the chat find and start this player (autoplay of the newest answer). */
  voiceId?: number;
  label: string;
  /** "card" on white answers; "bubble" inside the visitor's lime bubble. */
  tone?: "card" | "bubble";
  /** Duration known before the audio loads, e.g. a recording's own length. */
  knownSeconds?: number;
};

/**
 * A voice note like WhatsApp's: round play button, a track you can tap or drag along, and
 * the time. The native <audio> element stays in the page (hidden) and drives everything.
 */
export function VoiceNotePlayer({
  src,
  pendingLabel,
  voiceId,
  label,
  tone = "card",
  knownSeconds,
}: VoiceNotePlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(knownSeconds ?? 0);
  const ready = Boolean(src);
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  function toggle() {
    const player = audio.current;
    if (!player) return;
    if (player.paused) void player.play().catch(() => {});
    else player.pause();
  }

  function seekTo(ratio: number) {
    const player = audio.current;
    if (!player || !duration) return;
    player.currentTime = Math.min(duration, Math.max(0, ratio * duration));
    setCurrent(player.currentTime);
  }

  function seekFromPointer(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    seekTo((event.clientX - box.left) / box.width);
  }

  function seekByKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[
      event.key
    ];
    if (step === undefined || !duration) return;
    event.preventDefault();
    seekTo((current + step) / duration);
  }

  return (
    <div className="flex items-center gap-3">
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="auto"
          data-reply-voice={voiceId}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setCurrent(0);
          }}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            if (Number.isFinite(event.currentTarget.duration))
              setDuration(event.currentTarget.duration);
          }}
          className="hidden"
        />
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className={cn(
          "flex flex-none cursor-pointer items-center justify-center rounded-full bg-ink text-lime outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:cursor-default",
          tone === "card" ? "size-14" : "size-10",
          !ready && "motion-safe:animate-pulse",
        )}
      >
        {playing ? (
          <Pause
            className={tone === "card" ? "size-5" : "size-4"}
            fill="currentColor"
            aria-hidden
          />
        ) : (
          <Play
            className={cn(
              "translate-x-px",
              tone === "card" ? "size-5" : "size-4",
            )}
            fill="currentColor"
            aria-hidden
          />
        )}
      </button>

      <div
        role="slider"
        tabIndex={ready ? 0 : -1}
        aria-label={`${label} position`}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(current)}
        aria-valuetext={`${clock(current)} of ${clock(duration)}`}
        aria-disabled={!ready}
        onPointerDown={(event) => {
          if (!ready) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          seekFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            seekFromPointer(event);
        }}
        onKeyDown={seekByKey}
        className="group flex h-8 min-w-0 flex-1 cursor-pointer touch-none items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-default"
      >
        {!ready && pendingLabel ? (
          <span className="truncate text-sm font-semibold text-stone">
            {pendingLabel}
          </span>
        ) : (
          <span
            className={cn(
              "relative h-1.5 w-full overflow-hidden rounded-full",
              tone === "card" ? "bg-pebble" : "bg-white/60",
            )}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-ink"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
        )}
      </div>

      <span
        className={cn(
          "flex-none text-right tabular-nums",
          tone === "card"
            ? "min-w-11 text-[15px] text-ink-soft"
            : "min-w-9 text-xs text-lime-ink",
        )}
      >
        {ready || knownSeconds
          ? clock(playing || current > 0 ? current : duration)
          : "–:––"}
      </span>
    </div>
  );
}
