"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { AdminApiError, adminApi, checkAdminKey } from "@/lib/admin/api";
import { TOPIC_LABELS } from "@/lib/admin/format";
import { endSession, LOGIN_PATH, startSession } from "@/lib/admin/session";
import type { LawArticleInput, LawTopic } from "@/lib/admin/types";

/** What a form action reports back to its form. */
export interface ActionState {
  error?: string;
  ok?: boolean;
}

/**
 * Runs a backend call and turns API errors into a form message. Anything else (notably
 * the redirect to login when the session has expired) is rethrown for Next.js to handle.
 */
async function attempt(run: () => Promise<unknown>): Promise<ActionState> {
  try {
    await run();
  } catch (error) {
    if (error instanceof AdminApiError) return { error: error.message };
    throw error;
  }
  refresh();
  return { ok: true };
}

const text = (form: FormData, field: string): string => String(form.get(field) ?? "").trim();

// ── Session ───────────────────────────────────────────────────────────

export async function login(_state: ActionState, form: FormData): Promise<ActionState> {
  const key = text(form, "apiKey");
  if (!key) return { error: "Enter the admin API key." };

  const check = await checkAdminKey(key);
  if (check === "unreachable") return { error: "The Haqdar API is not reachable. Check that the backend is running." };
  if (check === "invalid") return { error: "That key was not accepted." };

  await startSession(key);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect(LOGIN_PATH);
}

// ── Conversations ─────────────────────────────────────────────────────

export async function setConversationReviewed(conversationId: string, reviewed: boolean): Promise<ActionState> {
  return attempt(() => adminApi.setReviewed(conversationId, reviewed));
}

export async function flagAnswer(messageId: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const reason = text(form, "reason");
  if (reason.length > 500) return { error: "Keep the reason under 500 characters." };
  return attempt(() => adminApi.flagMessage(messageId, true, reason || undefined));
}

export async function clearFlag(messageId: string): Promise<ActionState> {
  return attempt(() => adminApi.flagMessage(messageId, false));
}

// ── Knowledge base ────────────────────────────────────────────────────

function readArticle(form: FormData): LawArticleInput | string {
  const article = {
    reference: text(form, "reference"),
    title: text(form, "title"),
    body: text(form, "body"),
    topic: text(form, "topic") as LawTopic,
    sourceUrl: text(form, "sourceUrl") || undefined,
    verified: form.get("verified") === "on",
  };
  if (!article.reference || !article.title || !article.body) return "Reference, title and rule text are required.";
  if (!(article.topic in TOPIC_LABELS)) return "Choose a topic.";
  if (article.sourceUrl && !/^https?:\/\//.test(article.sourceUrl)) return "The source link must start with https://";
  return article;
}

export async function createArticle(_state: ActionState, form: FormData): Promise<ActionState> {
  const article = readArticle(form);
  if (typeof article === "string") return { error: article };
  return attempt(() => adminApi.createArticle(article));
}

export async function updateArticle(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const article = readArticle(form);
  if (typeof article === "string") return { error: article };
  return attempt(() => adminApi.updateArticle(id, article));
}

export async function setArticleVerified(id: string, verified: boolean): Promise<ActionState> {
  return attempt(() => adminApi.updateArticle(id, { verified }));
}

export async function deleteArticle(id: string): Promise<ActionState> {
  return attempt(() => adminApi.deleteArticle(id));
}
