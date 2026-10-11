"use client";

import {
  BookMarked,
  FileText,
  Mic,
  Phone,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { demoPage } from "@/content/demo";
import { demoApi } from "@/lib/demo/api";
import type {
  DemoContractReading,
  DemoMessage,
  LiveChatReply,
} from "@/lib/demo/types";
import { toneSurface } from "@/lib/tones";
import { cn } from "@/lib/utils";

import type { ChatEntry, ReplyVoice } from "./use-demo";
import { VoiceNotePlayer } from "./voice-note-player";

const copy = demoPage.chat;

export function Bubble({ entry }: { entry: ChatEntry }) {
  switch (entry.kind) {
    case "text":
      return (
        <UserBubble
          meta={entry.spoken ? copy.voiceMeta : copy.userMeta}
          icon={entry.spoken ? <Mic /> : null}
        >
          <span className="text-sm leading-normal">{entry.text}</span>
        </UserBubble>
      );
    case "photo":
      return (
        <UserBubble meta={copy.photoMeta} icon={<FileText />}>
          {entry.pdf ? (
            <span className="flex w-60 max-w-full items-center gap-3 rounded-xl bg-white/70 p-2.5">
              <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-alert text-[10px] font-extrabold tracking-wide text-white">
                PDF
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  {entry.name}
                </span>
                <span className="text-xs text-lime-ink">
                  {fileSize(entry.size)}
                </span>
              </span>
            </span>
          ) : (
            <>
              {/* A local preview of the visitor's own file; it never leaves the browser except to be read. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.url}
                alt={entry.name}
                className="max-h-48 w-auto rounded-xl object-cover"
              />
            </>
          )}
        </UserBubble>
      );
    case "voice":
      return (
        <UserBubble meta={copy.voiceNoteMeta} icon={<Mic />}>
          <div className="w-64 max-w-full">
            <VoiceNotePlayer
              src={entry.url}
              tone="bubble"
              knownSeconds={entry.seconds}
              label={copy.yourVoiceLabel}
            />
          </div>
          <VoiceTranscript transcript={entry.transcript} />
        </UserBubble>
      );
    case "message":
      return <AgentMessage message={entry.message} />;
    case "contract":
      return <ContractReading reading={entry.reading} />;
    case "live":
      return (
        <LiveReply id={entry.id} reply={entry.reply} voice={entry.voice} />
      );
  }
}

/** Urdu-script answers read right to left; English ones left to right. */
const URDU_SCRIPT = /[\u0600-\u06FF]/;

/** What Haqdar heard, shown under the visitor's own voice note. */
function VoiceTranscript({ transcript }: { transcript?: string | null }) {
  if (transcript === undefined) {
    return (
      <span className="text-xs font-semibold text-lime-ink">
        {copy.transcribing}
      </span>
    );
  }
  if (transcript === null) {
    return <span className="text-xs text-lime-ink">{copy.notHeard}</span>;
  }
  const urdu = URDU_SCRIPT.test(transcript);
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-[11px] text-lime-ink">{copy.heard}</span>
      <span
        dir="auto"
        lang={urdu ? "ur" : undefined}
        className={cn(
          "text-sm",
          urdu ? "font-urdu leading-[2]" : "leading-normal",
        )}
      >
        {transcript}
      </span>
    </span>
  );
}

const fileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Blank lines split an answer into paragraphs; spacing between them comes from the layout. */
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/**
 * A live answer, laid out like a WhatsApp voice reply: the voice note first, then the
 * same answer as text, an English translation, the law it relied on, and feedback.
 */
function LiveReply({
  id,
  reply,
  voice,
}: {
  id: number;
  reply: LiveChatReply;
  voice: ReplyVoice;
}) {
  const urdu = URDU_SCRIPT.test(reply.reply);
  const latin = !reply.translation;
  return (
    <div className="flex w-[92%] flex-col gap-4 self-start rounded-[28px] bg-white p-5 motion-safe:animate-bubble-in sm:p-6">
      {reply.urgent && (
        <span className="flex items-start gap-2 rounded-2xl bg-peach px-3.5 py-3 text-[13px] font-bold">
          <Phone className="mt-0.5 size-3.5 flex-none text-alert" aria-hidden />
          {copy.urgentTitle}
        </span>
      )}

      {voice.status !== "failed" && (
        <VoiceNotePlayer
          voiceId={id}
          src={voice.status === "ready" ? voice.url : undefined}
          pendingLabel={copy.preparingVoice}
          label={copy.replyVoiceLabel}
        />
      )}

      <div className="flex flex-col gap-3">
        <div
          dir="auto"
          lang={urdu ? "ur" : undefined}
          className={cn(
            "flex flex-col text-foreground",
            urdu
              ? "gap-1 text-right font-urdu text-[21px] leading-[2.15]"
              : latin
                ? "gap-2 text-[16px] leading-relaxed"
                : "gap-2 text-[18px] leading-relaxed",
          )}
        >
          {paragraphs(reply.reply).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
        {reply.translation && (
          <div
            lang="en"
            className="flex flex-col gap-2 text-[15px] leading-relaxed text-muted-foreground"
          >
            {paragraphs(reply.translation).map((paragraph, index, all) => (
              <p key={index} className="whitespace-pre-line">
                {index === 0 && "“"}
                {paragraph}
                {index === all.length - 1 && "”"}
              </p>
            ))}
          </div>
        )}
      </div>

      {reply.citations.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Sources">
          {reply.citations.map((citation) => (
            <li
              key={citation}
              className="flex items-center gap-2 rounded-full bg-pebble px-3.5 py-2 text-[13px] font-semibold"
            >
              <BookMarked className="size-3.5 flex-none" aria-hidden />
              {citation}
            </li>
          ))}
        </ul>
      )}

      <AnswerFeedback tools={reply.tools} />
    </div>
  );
}

function AnswerFeedback({ tools }: { tools: string[] }) {
  const [rating, setRating] = useState<boolean | null>(null);

  function rate(helpful: boolean) {
    if (rating !== null) return;
    setRating(helpful);
    // Only the rating and tool names leave the browser; losing one is harmless.
    demoApi.feedback(helpful, tools).catch(() => {});
  }

  const button = (helpful: boolean) => (
    <button
      type="button"
      onClick={() => rate(helpful)}
      disabled={rating !== null}
      aria-pressed={rating === helpful}
      aria-label={helpful ? copy.helpfulYes : copy.helpfulNo}
      className={cn(
        "flex size-11 cursor-pointer items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default",
        rating === helpful
          ? "border-ink bg-ink text-lime"
          : "border-line bg-white hover:bg-paper",
        rating !== null && rating !== helpful && "opacity-40",
      )}
    >
      {helpful ? (
        <ThumbsUp className="size-[18px]" aria-hidden />
      ) : (
        <ThumbsDown className="size-[18px]" aria-hidden />
      )}
    </button>
  );

  return (
    <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
      <span aria-live="polite" className="text-[15px] text-muted-foreground">
        {rating === null ? copy.helpfulQuestion : copy.helpfulThanks}
      </span>
      <span className="flex gap-2.5">
        {button(true)}
        {button(false)}
      </span>
    </div>
  );
}

function UserBubble({
  meta,
  icon,
  children,
}: {
  meta: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex max-w-[84%] flex-col gap-1.5 self-end rounded-[20px] rounded-br-[6px] bg-lime px-3.5 py-3 motion-safe:animate-bubble-in">
      <span className="flex items-center gap-1 text-[11px] font-bold text-lime-ink [&_svg]:size-3">
        {icon}
        {meta}
      </span>
      {children}
    </div>
  );
}

function AgentBubble({
  meta,
  children,
  wide,
}: {
  meta: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 self-start rounded-[20px] rounded-bl-[6px] bg-white px-3.5 py-3 motion-safe:animate-bubble-in",
        wide ? "w-[92%]" : "max-w-[84%]",
      )}
    >
      <span className="text-[11px] font-bold text-stone">{meta}</span>
      {children}
    </div>
  );
}

function AgentMessage({ message }: { message: DemoMessage }) {
  const { text, urdu, source, card, followUp } = message;
  return (
    <AgentBubble meta={followUp ? copy.followUpMeta : copy.agentMeta}>
      <span className="text-sm leading-normal">{text}</span>
      {urdu && (
        <span
          lang="ur"
          dir="rtl"
          className="text-right font-urdu text-sm leading-[1.9]"
        >
          {urdu}
        </span>
      )}
      {source && (
        <span className="self-start rounded-full bg-pebble px-2.5 py-1 text-[11px] font-semibold">
          {copy.sourcePrefix} {source}
        </span>
      )}
      {card && (
        <span
          className={cn(
            "flex flex-col gap-0.5 rounded-[14px] px-3 py-2.5",
            toneSurface[card.tone],
          )}
        >
          <span className="text-[11px]">{card.label}</span>
          <span className="text-xl font-extrabold">{card.value}</span>
        </span>
      )}
    </AgentBubble>
  );
}

function ContractReading({ reading }: { reading: DemoContractReading }) {
  return (
    <AgentBubble meta={copy.contractMeta} wide={reading.legible}>
      <span className="text-sm leading-normal">{reading.message}</span>
      {reading.legible && reading.terms.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-[14px] bg-paper px-3 py-2.5">
          <span className="text-[11px] font-bold text-stone">
            {copy.termsTitle}
          </span>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
            {reading.terms.map((term) => (
              <div key={term.label} className="contents">
                <dt className="text-stone">{term.label}</dt>
                <dd className="font-semibold">{term.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {reading.legible && reading.flags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-stone">
            {copy.flagsTitle}
          </span>
          {reading.flags.map((flag) => (
            <div
              key={flag.title}
              className="flex flex-col gap-1 rounded-[14px] bg-peach px-3 py-2.5"
            >
              <span className="flex items-start gap-1.5 text-[13px] font-bold">
                <TriangleAlert
                  className="mt-0.5 size-3.5 flex-none text-alert"
                  aria-hidden
                />
                {flag.title}
              </span>
              <span className="text-xs text-ink-soft">
                {flag.found !== null && (
                  <>
                    {copy.found}: {flag.found} ·{" "}
                  </>
                )}
                {copy.law}: {flag.legalLimit}
              </span>
              <span className="self-start rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold">
                {copy.sourcePrefix} {flag.articleRef}
              </span>
            </div>
          ))}
        </div>
      )}
    </AgentBubble>
  );
}

export function TypingIndicator({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex items-center gap-[5px] self-start rounded-[20px] rounded-bl-[6px] bg-white px-4 py-3.5"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-[7px] rounded-full bg-stone motion-safe:animate-typing-dot"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
