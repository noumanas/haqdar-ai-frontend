"use client";

import { ArrowRight, Keyboard, Mic, Paperclip, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { demoPage } from "@/content/demo";
import { CONTRACT_TYPES } from "@/lib/demo/api";
import { cn } from "@/lib/utils";

import { useVoiceInput, type VoiceLanguage } from "./use-speech";
import { useVoiceNote } from "./use-voice-note";

export type ChatMode = "choose" | "voice" | "text";

/** A tappable reply under the chat: a scripted step, or an example question in live chat. */
export type QuickReply = { id: string; label: string };

const { chat: copy, voice: voiceCopy } = demoPage;

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const roundButton = cn(
  "flex size-12 flex-none cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50",
  ring,
);

type ComposerProps = {
  mode: Exclude<ChatMode, "choose">;
  chips: QuickReply[];
  busy: boolean;
  /** Whether typed or spoken text can be sent right now. */
  canSend: boolean;
  /** What an empty "Send" sends, if anything (the guided demo's next step). */
  emptySend?: string;
  language: VoiceLanguage;
  onLanguage: (language: VoiceLanguage) => void;
  onMode: (mode: Exclude<ChatMode, "choose">) => void;
  onChip: (chip: QuickReply) => void;
  /** `spoken`: the visitor said it with the mic. */
  onSend: (text: string, spoken: boolean) => void;
  onContract: (photo: File) => void;
  /** Called when the mic opens, so Haqdar stops talking over the visitor. */
  onListen: () => void;
  /**
   * Live chat: the mic records a voice note for the server to transcribe. Without it the
   * browser's own speech recognition turns speech into text (the guided demo).
   */
  onVoiceNote?: (recording: Blob, seconds: number) => void;
};

/** Quick replies, plus either the voice controls or the text box, with the contract upload beside them. */
export function ChatComposer(props: ComposerProps) {
  const { mode, chips, busy, onChip } = props;

  return (
    <div className="flex flex-none flex-col gap-2.5 border-t border-hairline px-3.5 pt-3 pb-4">
      {!busy && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChip(chip)}
              className={cn(
                "min-h-[42px] cursor-pointer rounded-full px-4 text-left text-sm font-semibold transition-colors motion-safe:animate-bubble-in",
                ring,
                index === 0
                  ? "bg-ink text-white hover:bg-ink-soft"
                  : "bg-pebble hover:bg-line",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {mode === "voice" ? (
        props.onVoiceNote ? (
          <VoiceNoteControls {...props} onVoiceNote={props.onVoiceNote} />
        ) : (
          <VoiceControls {...props} />
        )
      ) : (
        <TextControls {...props} />
      )}
    </div>
  );
}

function AttachButton({
  busy,
  onContract,
}: Pick<ComposerProps, "busy" | "onContract">) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={CONTRACT_TYPES}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const photo = event.target.files?.[0];
          event.target.value = "";
          if (photo) onContract(photo);
        }}
      />
      <button
        type="button"
        aria-label={copy.attach}
        title={copy.attach}
        disabled={busy}
        onClick={() => input.current?.click()}
        className={cn(
          roundButton,
          "border border-line bg-white hover:bg-paper",
        )}
      >
        <Paperclip className="size-5" aria-hidden />
      </button>
    </>
  );
}

function TextControls({
  busy,
  canSend,
  emptySend,
  onSend,
  onContract,
  onMode,
}: ComposerProps) {
  const [draft, setDraft] = useState("");
  const text = draft.trim() || emptySend;

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canSend || !text) return;
    onSend(text, false);
    setDraft("");
  }

  return (
    <form onSubmit={send} className="flex items-center gap-2">
      <AttachButton busy={busy} onContract={onContract} />
      <label htmlFor="demo-input" className="sr-only">
        {copy.inputLabel}
      </label>
      <input
        id="demo-input"
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={copy.placeholder}
        maxLength={1000}
        autoComplete="off"
        className="min-h-12 min-w-0 flex-1 rounded-full border border-line bg-paper px-[18px] text-[15px] outline-none placeholder:text-stone focus-visible:border-ink"
      />
      {draft.trim() ? (
        <button
          type="submit"
          aria-label={copy.send}
          disabled={busy || !canSend}
          className={cn(roundButton, "bg-ink text-lime")}
        >
          <ArrowRight className="size-5" strokeWidth={2.2} aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          aria-label={voiceCopy.switchToVoice}
          title={voiceCopy.switchToVoice}
          onClick={() => onMode("voice")}
          className={cn(roundButton, "bg-ink text-lime")}
        >
          <Mic className="size-5" aria-hidden />
        </button>
      )}
    </form>
  );
}

function VoiceControls({
  busy,
  canSend,
  language,
  onLanguage,
  onMode,
  onSend,
  onContract,
  onListen,
}: ComposerProps) {
  const voice = useVoiceInput(language, (heard) => onSend(heard, true));
  const canSpeak = voice.supported && !busy && canSend;

  function toggle() {
    if (voice.listening) return voice.stop();
    onListen();
    voice.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <AttachButton busy={busy || voice.listening} onContract={onContract} />
        <button
          type="button"
          onClick={toggle}
          disabled={!canSpeak && !voice.listening}
          aria-pressed={voice.listening}
          className={cn(
            "flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            ring,
            voice.listening
              ? "bg-lime text-foreground"
              : "bg-ink text-white hover:bg-ink-soft",
          )}
        >
          {voice.listening ? (
            <Waves />
          ) : (
            <Mic className="size-5 text-lime" aria-hidden />
          )}
          <span className="truncate">
            {voice.listening
              ? voice.interim || voiceCopy.listening
              : voiceCopy.tapToSpeak}
          </span>
        </button>
        <button
          type="button"
          aria-label={voiceCopy.switchToText}
          title={voiceCopy.switchToText}
          onClick={() => {
            voice.stop();
            onMode("text");
          }}
          className={cn(
            roundButton,
            "border border-line bg-white hover:bg-paper",
          )}
        >
          <Keyboard className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="min-h-4 flex-1 text-xs text-stone">
          {!voice.supported ? voiceCopy.unsupported : voice.error}
        </p>
        <div
          role="radiogroup"
          aria-label="Voice language"
          className="flex rounded-full bg-pebble p-0.5"
        >
          {voiceCopy.languages.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={language === option.id}
              lang={option.lang}
              disabled={voice.listening}
              onClick={() => onLanguage(option.id as VoiceLanguage)}
              className={cn(
                "min-h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition-colors",
                ring,
                option.lang === "ur" && "font-urdu font-normal",
                language === option.id ? "bg-white shadow-sm" : "text-stone",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function VoiceNoteControls({
  busy,
  canSend,
  onMode,
  onContract,
  onListen,
  onVoiceNote,
}: ComposerProps & { onVoiceNote: NonNullable<ComposerProps["onVoiceNote"]> }) {
  const note = useVoiceNote(onVoiceNote);
  const recording = note.state === "recording";
  const preparing = note.state === "preparing";

  function toggle() {
    if (recording) return note.send();
    onListen();
    void note.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {recording ? (
          <button
            type="button"
            aria-label={voiceCopy.cancel}
            title={voiceCopy.cancel}
            onClick={note.cancel}
            className={cn(
              roundButton,
              "border border-line bg-white hover:bg-paper",
            )}
          >
            <X className="size-5" aria-hidden />
          </button>
        ) : (
          <AttachButton busy={busy || preparing} onContract={onContract} />
        )}
        <button
          type="button"
          onClick={toggle}
          disabled={
            !recording && (!note.supported || busy || preparing || !canSend)
          }
          aria-pressed={recording}
          className={cn(
            "flex min-h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            ring,
            recording
              ? "bg-lime text-foreground"
              : "bg-ink text-white hover:bg-ink-soft",
          )}
        >
          {recording ? (
            <Waves />
          ) : (
            <Mic className="size-5 text-lime" aria-hidden />
          )}
          <span className="truncate">
            {recording
              ? `${clock(note.seconds)} · ${voiceCopy.recording}`
              : preparing
                ? voiceCopy.preparing
                : voiceCopy.record}
          </span>
        </button>
        <button
          type="button"
          aria-label={voiceCopy.switchToText}
          title={voiceCopy.switchToText}
          disabled={recording}
          onClick={() => onMode("text")}
          className={cn(
            roundButton,
            "border border-line bg-white hover:bg-paper",
          )}
        >
          <Keyboard className="size-5" aria-hidden />
        </button>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-stone">
        {!note.supported
          ? voiceCopy.noteUnsupported
          : (note.error ?? voiceCopy.noteHint)}
      </p>
    </div>
  );
}

function Waves() {
  return (
    <span aria-hidden className="flex h-5 items-center gap-[3px]">
      {[0, 120, 240, 360].map((delay) => (
        <span
          key={delay}
          className="h-full w-[3px] rounded-full bg-forest motion-safe:animate-wave"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** The first thing the chat asks: talk or type. */
export function ModeChoice({
  onChoose,
  hint = demoPage.modeChoice.hint,
}: {
  onChoose: (mode: Exclude<ChatMode, "choose">) => void;
  hint?: string;
}) {
  const choice = demoPage.modeChoice;
  return (
    <div className="flex flex-none flex-col gap-3 border-t border-hairline px-4 pt-4 pb-5">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-bold">{choice.title}</span>
        <span className="text-xs text-stone">{hint}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChoose("voice")}
          className={cn(
            "flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap bg-ink px-3 text-sm font-semibold text-white hover:bg-ink-soft sm:px-4 sm:text-[15px]",
            ring,
          )}
        >
          <Mic className="size-5 text-lime" aria-hidden />
          {choice.voice}
        </button>
        <button
          type="button"
          onClick={() => onChoose("text")}
          className={cn(
            "flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap border border-line bg-white px-3 text-sm font-semibold hover:bg-paper sm:px-4 sm:text-[15px]",
            ring,
          )}
        >
          <Keyboard className="size-5" aria-hidden />
          {choice.text}
        </button>
      </div>
    </div>
  );
}
