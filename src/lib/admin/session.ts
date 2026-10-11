import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * The admin session is the backend's admin API key, kept in an httpOnly cookie so browser
 * JavaScript can never read it. Every admin request is made server-side with it.
 */
export const SESSION_COOKIE = "haqdar_admin";
export const LOGIN_PATH = "/admin/login";
const SESSION_HOURS = 8;

export async function readAdminKey(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** The admin key for this request; sends the visitor to the login page without one. */
export async function requireAdminKey(): Promise<string> {
  const key = await readAdminKey();
  if (!key) redirect(LOGIN_PATH);
  return key;
}

export async function startSession(key: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}
