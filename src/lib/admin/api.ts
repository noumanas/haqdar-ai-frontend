import "server-only";

import { redirect } from "next/navigation";

import { LOGIN_PATH, requireAdminKey } from "./session";
import type {
  AdminOverview,
  ConversationStatus,
  ConversationSummary,
  FlaggedMessage,
  LawArticle,
  LawArticleInput,
  Message,
  Page,
} from "./types";

const API_URL = process.env.HAQDAR_API_URL ?? "http://localhost:3000/api/v1";

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined>;

const withQuery = (path: string, query: Query = {}): string => {
  const params = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) => (value === undefined ? [] : [[key, String(value)]])),
  );
  return params.size ? `${path}?${params}` : path;
};

async function call(path: string, init: RequestInit, key: string): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "x-api-key": key, "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new AdminApiError(503, "The Haqdar API is not reachable. Check that the backend is running.");
  }
}

/** Calls the admin API with the session's key. Admin data is never cached. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await call(path, init, await requireAdminKey());

  if (response.status === 401) redirect(`${LOGIN_PATH}?reason=expired`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new AdminApiError(response.status, message ?? `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const adminApi = {
  overview: (days = 7) => request<AdminOverview>(withQuery("/admin/overview", { days })),

  conversations: (query: { status?: ConversationStatus; page?: number; limit?: number } = {}) =>
    request<Page<ConversationSummary>>(withQuery("/admin/conversations", query)),
  messages: (conversationId: string) => request<Message[]>(`/admin/conversations/${conversationId}/messages`),
  setReviewed: (conversationId: string, reviewed: boolean) =>
    request(`/admin/conversations/${conversationId}/review`, json("PATCH", { reviewed })),

  flaggedMessages: (query: { page?: number; limit?: number } = {}) =>
    request<Page<FlaggedMessage>>(withQuery("/admin/messages/flagged", query)),
  flagMessage: (messageId: string, flagged: boolean, reason?: string) =>
    request<Message>(`/admin/messages/${messageId}/flag`, json("PATCH", { flagged, reason })),

  articles: (query: { verified?: boolean; page?: number; limit?: number } = {}) =>
    request<Page<LawArticle>>(withQuery("/admin/knowledge", query)),
  createArticle: (input: LawArticleInput) => request<LawArticle>("/admin/knowledge", json("POST", input)),
  updateArticle: (id: string, input: Partial<LawArticleInput>) =>
    request<LawArticle>(`/admin/knowledge/${id}`, json("PATCH", input)),
  deleteArticle: (id: string) => request<void>(`/admin/knowledge/${id}`, { method: "DELETE" }),
};

export type KeyCheck = "valid" | "invalid" | "unreachable";

/** Login: checks a candidate key against the backend before a session is started. */
export async function checkAdminKey(key: string): Promise<KeyCheck> {
  try {
    const response = await call(withQuery("/admin/overview", { days: 1 }), {}, key);
    return response.ok ? "valid" : "invalid";
  } catch {
    return "unreachable";
  }
}
