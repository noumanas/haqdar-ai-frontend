"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import {
  CONTRACT_MAX_BYTES,
  DemoApiError,
  demoApi,
  TOO_LARGE_MESSAGE,
} from "@/lib/demo/api";
import type {
  DemoChip,
  DemoContractReading,
  DemoMessage,
  DemoScenario,
  DemoTurn,
  LiveChatReply,
} from "@/lib/demo/types";

export type ChatEntry =
  | { id: number; from: "agent"; kind: "message"; message: DemoMessage }
  | {
      id: number;
      from: "agent";
      kind: "contract";
      reading: DemoContractReading;
    }
  | {
      id: number;
      from: "agent";
      kind: "live";
      reply: LiveChatReply;
      /** The same answer as a voice note, fetched right after the text arrives. */
      voice: ReplyVoice;
    }
  | { id: number; from: "user"; kind: "text"; text: string; spoken: boolean }
  | {
      id: number;
      from: "user";
      kind: "photo";
      url: string;
      name: string;
      /** A PDF shows as a document chip; images show as a preview. */
      pdf: boolean;
      size: number;
    }
  | {
      id: number;
      from: "user";
      kind: "voice";
      url: string;
      seconds: number;
      /** undefined while Haqdar is still listening; null when no speech was heard. */
      transcript?: string | null;
    };

type PendingAction =
  | { kind: "load" }
  | { kind: "start"; scenarioId: string }
  | { kind: "reply"; chip: DemoChip; label: string; spoken: boolean }
  | { kind: "contract"; photo: File };

export type ReplyVoice =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "failed" };

/**
 * `action` is what "Try again" repeats; null when retrying would not help.
 * `offerGuided`: the live AI is unavailable, so the chat offers the guided demo instead.
 */
export type DemoError<Action = PendingAction> = {
  message: string;
  action: Action | null;
  offerGuided?: boolean;
};

export type Activity = "typing" | "reading_contract" | "listening" | null;

/** Long enough to read as "the agent is typing", short enough not to feel slow. */
const TYPING_MS = 700;

/** Some systems send PDFs with an empty type, so the name is checked too. */
export const isPdf = (file: File) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

export const withTyping = <T>(request: Promise<T>) =>
  Promise.all([
    request,
    new Promise((resolve) => setTimeout(resolve, TYPING_MS)),
  ]).then(([result]) => result);

export const errorMessage = (error: unknown) =>
  error instanceof DemoApiError
    ? error.message
    : "Something went wrong. Please try again.";

/**
 * State for the "Try the demo" page. The conversation lives on the server's public demo API;
 * this hook keeps the transcript and drops any answer that arrives after the visitor has
 * already moved on (picked another case or restarted).
 */
export function useDemo() {
  const [scenarios, setScenarios] = useState<DemoScenario[] | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [turn, setTurn] = useState<DemoTurn | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [activity, setActivity] = useState<Activity>("typing");
  const [error, setError] = useState<DemoError | null>(null);

  const latestRequest = useRef(0);
  const nextEntryId = useRef(0);
  const photoUrls = useRef<string[]>([]);

  const agentEntries = (messages: DemoMessage[]): ChatEntry[] =>
    messages.map((message) => ({
      id: ++nextEntryId.current,
      from: "agent",
      kind: "message",
      message,
    }));

  /** Runs one API call as the current request; its result is dropped if a newer request has started. */
  async function run<T>(
    request: Promise<T>,
    onDone: (result: T) => void,
    onFail: (message: string) => void,
    busy: Activity = "typing",
  ) {
    const id = ++latestRequest.current;
    setActivity(busy);
    setError(null);
    try {
      const result = await withTyping(request);
      if (id === latestRequest.current) onDone(result);
    } catch (failure) {
      if (id === latestRequest.current) onFail(errorMessage(failure));
    } finally {
      if (id === latestRequest.current) setActivity(null);
    }
  }

  function forgetPhotos() {
    photoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrls.current = [];
  }

  function start(id: string) {
    setScenarioId(id);
    setTurn(null);
    setEntries([]);
    forgetPhotos();
    return run(
      demoApi.start(id),
      (next) => {
        setTurn(next);
        setEntries(agentEntries(next.messages));
      },
      (message) =>
        setError({ message, action: { kind: "start", scenarioId: id } }),
    );
  }

  /** Fetches the cases and opens the first. State changes only in callbacks, so it can run on mount. */
  function fetchScenarios() {
    const id = ++latestRequest.current;
    const current = () => id === latestRequest.current;
    withTyping(demoApi.scenarios()).then(
      (list) => {
        if (!current()) return;
        setScenarios(list);
        if (list[0]) void start(list[0].id);
        else setActivity(null);
      },
      (failure: unknown) => {
        if (!current()) return;
        setError({ message: errorMessage(failure), action: { kind: "load" } });
        setActivity(null);
      },
    );
  }

  function load() {
    setActivity("typing");
    setError(null);
    fetchScenarios();
  }

  /** `spoken`: the visitor said it with the mic rather than typing or tapping. */
  function reply(chip: DemoChip, label = chip.label, spoken = false) {
    if (!turn || activity) return;
    if (chip.action === "next_scenario") {
      void start(turn.nextScenarioId);
      return;
    }

    const sent: ChatEntry = {
      id: ++nextEntryId.current,
      from: "user",
      kind: "text",
      text: label,
      spoken,
    };
    setEntries((current) => [...current, sent]);
    void run(
      demoApi.step(turn.scenarioId, turn.nodeId, chip.id),
      (next) => {
        setTurn(next);
        setEntries((current) => [...current, ...agentEntries(next.messages)]);
      },
      (message) => {
        setEntries((current) => current.filter((entry) => entry !== sent));
        setError({ message, action: { kind: "reply", chip, label, spoken } });
      },
    );
  }

  /** Reads a contract photo with the real reader; the case in progress carries on afterwards. */
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
      id: ++nextEntryId.current,
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
      (reading) =>
        setEntries((current) => [
          ...current,
          {
            id: ++nextEntryId.current,
            from: "agent",
            kind: "contract",
            reading,
          },
        ]),
      (message) => {
        setEntries((current) => current.filter((entry) => entry !== sent));
        setError({ message, action: { kind: "contract", photo } });
      },
      "reading_contract",
    );
  }

  function retry() {
    const action = error?.action;
    if (!action) return;
    if (action.kind === "load") load();
    else if (action.kind === "start") void start(action.scenarioId);
    else if (action.kind === "contract") sendContract(action.photo);
    else reply(action.chip, action.label, action.spoken);
  }

  const loadOnMount = useEffectEvent(fetchScenarios);
  useEffect(() => loadOnMount(), []);
  useEffect(() => forgetPhotos, []);

  const primary = turn?.chips[0];

  return {
    scenarios,
    scenarioId,
    turn,
    entries,
    activity,
    busy: activity !== null,
    error,
    pick: (id: string) => void start(id),
    restart: () => scenarioId && void start(scenarioId),
    reply,
    /** Typed or spoken text: the guided demo is scripted, so it takes the main path. */
    send: (text: string, spoken: boolean) => {
      if (primary) reply(primary, text, spoken);
    },
    canSend: Boolean(primary),
    emptySend: primary?.label,
    sendContract,
    retry,
  };
}
