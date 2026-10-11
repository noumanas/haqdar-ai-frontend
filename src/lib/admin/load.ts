import "server-only";

import { AdminApiError } from "./api";

export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Loads data for one section. API failures become a message the section can show in place,
 * so one failing panel never takes down the whole page; redirects and real bugs still throw.
 */
export async function load<T>(run: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof AdminApiError) return { ok: false, error: error.message };
    throw error;
  }
}
