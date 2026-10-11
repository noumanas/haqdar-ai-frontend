import { CHANNEL_LABELS, formatSeconds } from "./format";
import type { Message, ToolCall } from "./types";

export interface TimelineStep {
  at: string;
  label: string;
  detail: string;
  /** Steps an admin should look at (urgent flags, failed tools, flagged answers). */
  attention: boolean;
}

const TOOL_STEPS: Record<string, (call: ToolCall, citations: string[]) => Omit<TimelineStep, "at" | "attention">> = {
  search_labour_law: (_call, citations) => ({
    label: "Law checked",
    detail: citations.find((citation) => !citation.startsWith("Federal")) ?? "No matching rule",
  }),
  calculate_gratuity: () => ({ label: "Gratuity calculated", detail: "By code, not the AI" }),
  calculate_overtime: () => ({ label: "Overtime calculated", detail: "By code, not the AI" }),
  get_saved_contract: () => ({ label: "Contract looked up", detail: "From the saved summary" }),
  get_complaint_guide: () => ({ label: "Guided to MOHRE", detail: "Complaint steps sent" }),
  schedule_follow_up: (call) => {
    const days = (call.input as { inDays?: number } | null)?.inDays;
    return { label: "Follow-up scheduled", detail: days ? `In ${days} days` : "Check-in agreed" };
  },
};

/**
 * "What happened" for one conversation: each worker message, every tool the agent used,
 * and each answer, in order, with the steps that need an admin's attention marked.
 */
export function buildTimeline(messages: Message[]): TimelineStep[] {
  return messages.flatMap((message): TimelineStep[] => {
    const at = message.createdAt;

    if (message.direction === "inbound") {
      const asked: TimelineStep = { at, label: "Asked", detail: CHANNEL_LABELS[message.kind], attention: false };
      return message.urgent
        ? [asked, { at, label: "Urgent flag", detail: "Helpline shown first", attention: true }]
        : [asked];
    }

    const tools = message.toolCalls.map((call): TimelineStep => {
      const describe = TOOL_STEPS[call.name];
      if (!call.ok || !describe) {
        return { at, label: "Tool failed", detail: call.name.replace(/_/g, " "), attention: true };
      }
      return { at, ...describe(call, message.citations), attention: false };
    });
    const answered: TimelineStep = {
      at,
      label: "Answered",
      detail: message.latencyMs === null ? "Reply sent" : `In ${formatSeconds(message.latencyMs)}`,
      attention: false,
    };
    const flagged: TimelineStep[] = message.flagged
      ? [{ at, label: "Flagged wrong", detail: message.flagReason ?? "By a reviewer", attention: true }]
      : [];
    return [...tools, answered, ...flagged];
  });
}
