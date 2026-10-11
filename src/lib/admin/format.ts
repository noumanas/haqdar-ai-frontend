import type { ConversationStatus, IssueType, LawTopic, MessageKind } from "./types";

export const ISSUE_LABELS: Record<IssueType, string> = {
  unpaid_salary: "Late salary",
  unpaid_overtime: "Unpaid overtime",
  end_of_service: "End-of-service",
  passport_held: "Passport held",
  recruitment_fees: "Recruitment fees",
  contract_mismatch: "Contract terms",
  unsafe_conditions: "Unsafe conditions",
  other: "Other",
};

/** Issues that put a worker at risk; shown in the alarm colour. */
export const URGENT_ISSUES: ReadonlySet<IssueType> = new Set(["passport_held", "unsafe_conditions"]);

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  needs_review: "Needs review",
  guided_to_mohre: "Guided to MOHRE",
  answered: "Answered",
  reviewed: "Reviewed",
};

export const CHANNEL_LABELS: Record<MessageKind, string> = { text: "Text", voice: "Voice", image: "Photo" };

export const TOPIC_LABELS: Record<LawTopic, string> = {
  contract: "Contract",
  salary: "Salary",
  working_hours: "Working hours",
  overtime: "Overtime",
  leave: "Leave",
  probation: "Probation",
  gratuity: "Gratuity",
  termination: "Termination",
  passport: "Passport",
  recruitment_fees: "Recruitment fees",
  safety: "Safety",
  complaints: "Complaints",
  other: "Other",
};

export const issueLabel = (issueType: IssueType | null): string =>
  issueType ? ISSUE_LABELS[issueType] : "General question";

/** A short anonymous label for a worker, e.g. "W-3F2A". Never a name or number. */
export const workerCode = (workerId: string): string => `W-${workerId.replace(/-/g, "").slice(0, 4).toUpperCase()}`;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 hours ago", "yesterday", or a date for anything older than a week. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  if (Math.abs(days) < 7) return relative.format(days, "day");
  return formatDate(iso);
}

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Whole-number percentage of `part` in `total`; 0 when there is nothing to divide. */
export const percent = (part: number, total: number): number => (total > 0 ? Math.round((part / total) * 100) : 0);

export const formatSeconds = (ms: number): string => `${(ms / 1000).toFixed(1)} s`;
