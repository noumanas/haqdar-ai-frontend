import type {
  LiveVoiceReply,
  ChatTurn,
  DemoContractReading,
  DemoScenario,
  DemoTurn,
  LiveChatReply,
} from "./types";

/** A phone photo is a few MB; a scanned multi-page PDF can be more. Matches the server. */
export const CONTRACT_MAX_BYTES = 10 * 1024 * 1024;
export const CONTRACT_TYPES =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.pdf";
export const TOO_LARGE_MESSAGE =
  "That file is too large. Send a photo or PDF under 10 MB.";

/** The demo API is public and called from the browser, so its base URL is a public env var. */
const API_URL =
  process.env.NEXT_PUBLIC_HAQDAR_API_URL ?? "http://localhost:3000/api/v1";

export class DemoApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    /** For 429: when to try again, and whether the limit is the visitor's own or the demo's. */
    readonly limit?: {
      retryAfterSeconds: number;
      scope: "visitor" | "everyone";
    },
  ) {
    super(message);
    this.name = "DemoApiError";
  }
}

/** Messages for statuses a visitor can cause; anything else gets the generic one. */
const STATUS_MESSAGES: Record<number, string> = {
  413: TOO_LARGE_MESSAGE,
  415: "That file type isn't supported. Send a photo or a PDF of the contract, or record again.",
};

/** Sends a request and turns any failure into a DemoApiError written for visitors. */
async function send(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/demo${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(typeof init?.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
      },
    });
  } catch {
    throw new DemoApiError(
      "We couldn't reach Haqdar. Check your connection and try again.",
    );
  }
  if (response.ok) return response;

  if (response.status === 429) {
    throw new DemoApiError(
      (await serverMessage(response)) ??
        "You're going a little fast. Wait a moment, then try again.",
      429,
      {
        retryAfterSeconds: Number(response.headers.get("Retry-After")) || 60,
        scope:
          response.headers.get("X-Demo-Limit-Scope") === "everyone"
            ? "everyone"
            : "visitor",
      },
    );
  }
  // A 503 carries a message written for visitors (for example "contract reading isn't available").
  const fromServer =
    response.status === 503 ? await serverMessage(response) : null;
  throw new DemoApiError(
    STATUS_MESSAGES[response.status] ??
      fromServer ??
      "Something went wrong on our side. Please try again.",
    response.status,
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await (await send(path, init)).json()) as T;
}

/** For live AI requests: the reply plus how many the visitor has left right now. */
async function requestCounted<T>(
  path: string,
  init: RequestInit,
): Promise<T & { remaining: number | null }> {
  const response = await send(path, init);
  const header = response.headers.get("X-Demo-Remaining");
  const remaining = header === null ? null : Number(header);
  return {
    ...((await response.json()) as T),
    remaining: Number.isFinite(remaining) ? remaining : null,
  };
}

/** Fetches binary audio; failures only cost the voice note, never the text answer. */
async function requestAudio(path: string, body: unknown): Promise<Blob> {
  const response = await fetch(`${API_URL}/demo${path}`, {
    method: "POST",
    headers: { Accept: "audio/wav", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new DemoApiError("The voice note isn't available.", response.status);
  return response.blob();
}

async function serverMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" ? body.message : null;
  } catch {
    return null;
  }
}

export const demoApi = {
  scenarios: () => request<DemoScenario[]>("/scenarios"),
  start: (scenarioId: string) =>
    request<DemoTurn>(`/scenarios/${encodeURIComponent(scenarioId)}/start`, {
      method: "POST",
    }),
  step: (scenarioId: string, from: string, to: string) =>
    request<DemoTurn>(`/scenarios/${encodeURIComponent(scenarioId)}/steps`, {
      method: "POST",
      body: JSON.stringify({ from, to }),
    }),
  /** One message to the real agent. `history` is the chat so far; the server stores nothing. */
  chat: (message: string, history: ChatTurn[]) =>
    requestCounted<LiveChatReply>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
  /** "Was this helpful?": only the rating and the tools used are sent. */
  feedback: async (helpful: boolean, tools: string[]) => {
    await fetch(`${API_URL}/demo/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful, tools }),
    });
  },
  /** A reply as a spoken voice note (WAV), in the reply's own language. */
  speech: (text: string, token: string) =>
    requestAudio("/speech", { text, token }),
  /** A recorded voice note (WAV): transcribed in the language spoken, answered in text. */
  voice: (recording: Blob, history: ChatTurn[]) => {
    const form = new FormData();
    form.append("audio", recording, "voice-note.wav");
    form.append("history", JSON.stringify(history));
    return requestCounted<LiveVoiceReply>("/voice", {
      method: "POST",
      body: form,
    });
  },
  /** The photo is read and discarded by the server; nothing is saved. */
  readContract: (photo: File) => {
    const form = new FormData();
    form.append("contract", photo);
    return request<DemoContractReading>("/contract", {
      method: "POST",
      body: form,
    });
  },
};
