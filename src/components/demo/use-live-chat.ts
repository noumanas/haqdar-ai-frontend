"use client";

import { useEffect, useRef, useState } from "react";

import { liveExamples, liveGreeting } from "@/content/demo";
import {
  CONTRACT_MAX_BYTES,
  DemoApiError,
  demoApi,
  TOO_LARGE_MESSAGE,
} from "@/lib/demo/api";
import type {
  AgentStage,
  CaseStep,
  ChatTurn,
  LiveChatReply,
} from "@/lib/demo/types";

import {
  errorMessage,
  isPdf,
  withTyping,
  type Activity,
  type ChatEntry,
  type DemoError,
  type ReplyVoice,
} from "./use-demo";

type PendingAction =
  | { kind: "send"; text: string; spoken: boolean }
  | { kind: "contract"; photo: File }
  | { kind: "voice"; recording: Blob; seconds: number };

/** Same limit as the server's, checked here so a long note fails before uploading. */
const VOICE_MAX_BYTES = 4 * 1024 * 1024;

const CASE_ORDER: CaseStep[] = [
  "problem_shared",
  "rights_explained",
  "complaint_guided",
  "follow_up",
  "resolved",
];

const FRESH = {
  caseStep: "problem_shared" as CaseStep,
  agentStage: "understanding" as AgentStage,
};

/**
 * When the live AI can't answer (unavailable, or a rate limit was reached), the guided demo
 * still works: it is scripted and costs nothing.
 */
const offersGuided = (failure: unknown) =>
  failure instanceof DemoApiError &&
  (failure.status === 503 || failure.status === 429);

/** Retrying is pointless while a limit lasts longer than a minute; typing again works later. */
const canRetry = (failure: unknown) =>
  !(
    failure instanceof DemoApiError &&
    (failure.limit?.retryAfterSeconds ?? 0) > 60
  );

const liveEntry = (id: number, reply: LiveChatReply): ChatEntry => ({
  id,
  from: "agent",
  kind: "live",
  reply,
  voice: { status: "loading" },
});

const greeting = (): ChatEntry => ({
  id: 0,
  from: "agent",
  kind: "message",
  message: { ...liveGreeting, source: null, card: null, followUp: false },
});

/**
 * What the agent sees of the chat so far. Contract readings go back as `[Contract check]`
 * turns so the agent can answer questions about that contract.
 */
function toHistory(entries: ChatEntry[]): ChatTurn[] {
  return entries.flatMap((entry): ChatTurn[] => {
    switch (entry.kind) {
      case "text":
        return [{ role: "user", text: entry.text }];
      case "photo":
        return [{ role: "user", text: "[I sent my contract]" }];
      case "voice":
        return entry.transcript
          ? [{ role: "user", text: entry.transcript }]
          : [];
      case "live":
        return [{ role: "assistant", text: entry.reply.reply }];
      case "message":
        return [{ role: "assistant", text: entry.message.text }];
      case "contract": {
        const { reading } = entry;
        if (!reading.legible)
          return [{ role: "assistant", text: reading.message }];
        const terms = reading.terms.map(
          (term) => `${term.label}: ${term.value}`,
        );
        const flags = reading.flags.map(
          (flag) =>
            `${flag.title} (law: ${flag.legalLimit}, ${flag.articleRef})`,
        );
        return [
          {
            role: "assistant",
            text: [
              "[Contract check]",
              reading.message,
              ...terms,
              ...flags,
            ].join("\n"),
          },
        ];
      }
    }
  });
}

/**
 * State for live chat on the demo page: every message goes to the real Haqdar agent.
 * The chat lives only in this browser tab; each request carries the turns so far.
 */
export function useLiveChat() {
  const [entries, setEntries] = useState<ChatEntry[]>(() => [greeting()]);
  const [activity, setActivity] = useState<Activity>(null);
  const [error, setError] = useState<DemoError<PendingAction> | null>(null);
  const [progress, setProgress] = useState(FRESH);
  const [picked, setPicked] = useState<string | null>(null);
  /** Live questions the visitor can still ask right now (from the server's rate limit). */
  const [remaining, setRemaining] = useState<number | null>(null);

  const latestRequest = useRef(0);
  const nextEntryId = useRef(1);
  const photoUrls = useRef<string[]>([]);

  function forgetPhotos() {
    photoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrls.current = [];
  }
  useEffect(() => forgetPhotos, []);

  /** Runs one request as the current one; its result is dropped if the chat was restarted. */
  async function run<T>(
    request: Promise<T>,
    onDone: (result: T) => void,
    onFail: (failure: unknown) => void,
    busy: Activity = "typing",
  ) {
    const id = ++latestRequest.current;
    setActivity(busy);
    setError(null);
    try {
      const result = await withTyping(request);
      if (id === latestRequest.current) onDone(result);
    } catch (failure) {
      if (id === latestRequest.current) onFail(failure);
    } finally {
      if (id === latestRequest.current) setActivity(null);
    }
  }

  /** Turns the text answer into a voice note in the background; the text never waits for it. */
  function fetchVoice(replyId: number, reply: LiveChatReply) {
    const setVoice = (voice: ReplyVoice) =>
      setEntries((current) =>
        current.map((entry) =>
          entry.id === replyId && entry.kind === "live"
            ? { ...entry, voice }
            : entry,
        ),
      );
    demoApi.speech(reply.reply, reply.speechToken).then(
      (audio) => {
        const url = URL.createObjectURL(audio);
        photoUrls.current.push(url);
        setVoice({ status: "ready", url });
      },
      () => setVoice({ status: "failed" }),
    );
  }

  function send(text: string, spoken = false) {
    const message = text.trim();
    if (activity || !message) return;

    const sent: ChatEntry = {
      id: nextEntryId.current++,
      from: "user",
      kind: "text",
      text: message,
      spoken,
    };
    const history = toHistory(entries);
    setEntries((current) => [...current, sent]);
    void run(
      demoApi.chat(message, history),
      ({ remaining: left, ...reply }) => {
        setRemaining(left);
        const replyId = nextEntryId.current++;
        setEntries((current) => [...current, liveEntry(replyId, reply)]);
        fetchVoice(replyId, reply);
        // The case only moves forward; a later small-talk turn doesn't undo progress.
        setProgress((current) => ({
          caseStep:
            CASE_ORDER.indexOf(reply.progress.caseStep) >
            CASE_ORDER.indexOf(current.caseStep)
              ? reply.progress.caseStep
              : current.caseStep,
          agentStage: reply.progress.agentStage,
        }));
      },
      (failure) => {
        setEntries((current) => current.filter((entry) => entry !== sent));
        setError({
          message: errorMessage(failure),
          action: canRetry(failure)
            ? { kind: "send", text: message, spoken }
            : null,
          offerGuided: offersGuided(failure),
        });
      },
    );
  }

  /** A voice note: the server transcribes it and the agent answers in text. */
  function sendVoice(recording: Blob, seconds: number) {
    if (activity) return;
    if (recording.size > VOICE_MAX_BYTES) {
      setError({
        message: "That voice note is too long. Keep it under a minute.",
        action: null,
      });
      return;
    }

    const id = nextEntryId.current++;
    const url = URL.createObjectURL(recording);
    photoUrls.current.push(url);
    const history = toHistory(entries);
    setEntries((current) => [
      ...current,
      { id, from: "user", kind: "voice", url, seconds },
    ]);
    void run(
      demoApi.voice(recording, history),
      ({ transcript, remaining: left, ...reply }) => {
        setRemaining(left);
        const replyId = nextEntryId.current++;
        setEntries((current) => [
          ...current.map((entry) =>
            entry.id === id && entry.kind === "voice"
              ? { ...entry, transcript }
              : entry,
          ),
          liveEntry(replyId, reply),
        ]);
        fetchVoice(replyId, reply);
        if (transcript) {
          setProgress((current) => ({
            caseStep:
              CASE_ORDER.indexOf(reply.progress.caseStep) >
              CASE_ORDER.indexOf(current.caseStep)
                ? reply.progress.caseStep
                : current.caseStep,
            agentStage: reply.progress.agentStage,
          }));
        }
      },
      (failure) => {
        setEntries((current) => current.filter((entry) => entry.id !== id));
        setError({
          message: errorMessage(failure),
          action: canRetry(failure)
            ? { kind: "voice", recording, seconds }
            : null,
          offerGuided: offersGuided(failure),
        });
      },
      "listening",
    );
  }

  function sendContract(photo: File) {
    if (activity) return;
    if (photo.size > CONTRACT_MAX_BYTES) {
      setError({
        message: TOO_LARGE_MESSAGE,
        action: null,
      });
      return;
    }

    const url = URL.createObjectURL(photo);
    photoUrls.current.push(url);
    const sent: ChatEntry = {
      id: nextEntryId.current++,
      from: "user",
      kind: "photo",
      url,
      name: photo.name,
      pdf: isPdf(photo),
      size: photo.size,
    };
    setEntries((current) => [...current, sent]);
    void run(
      demoApi.readContract(photo),
      (reading) => {
        setEntries((current) => [
          ...current,
          {
            id: nextEntryId.current++,
            from: "agent",
            kind: "contract",
            reading,
          },
        ]);
        setProgress((current) => ({
          caseStep:
            current.caseStep === "problem_shared"
              ? "rights_explained"
              : current.caseStep,
          agentStage: "checking",
        }));
      },
      (failure) => {
        setEntries((current) => current.filter((entry) => entry !== sent));
        setError({
          message: errorMessage(failure),
          action: { kind: "contract", photo },
        });
      },
      "reading_contract",
    );
  }

  function restart() {
    latestRequest.current++;
    forgetPhotos();
    setEntries([greeting()]);
    setActivity(null);
    setError(null);
    setProgress(FRESH);
    setPicked(null);
  }

  function retry() {
    const action = error?.action;
    if (!action) return;
    if (action.kind === "send") send(action.text, action.spoken);
    else if (action.kind === "voice")
      sendVoice(action.recording, action.seconds);
    else sendContract(action.photo);
  }

  function pickExample(id: string) {
    const example = liveExamples.find((candidate) => candidate.id === id);
    if (!example || activity) return;
    setPicked(id);
    send(example.prompt);
  }

  const started = entries.some((entry) => entry.from === "user");

  return {
    entries,
    activity,
    error,
    progress,
    picked,
    remaining,
    /** Before the first message, the examples double as quick replies in the chat. */
    chips: started
      ? []
      : liveExamples.map(({ id, title }) => ({ id, label: title })),
    send,
    sendContract,
    sendVoice,
    restart,
    retry,
    pickExample,
  };
}
