/** Shapes returned by the Haqdar backend's admin API (see the backend Swagger docs at /docs). */

export type IssueType =
  | "unpaid_salary"
  | "unpaid_overtime"
  | "end_of_service"
  | "passport_held"
  | "recruitment_fees"
  | "contract_mismatch"
  | "unsafe_conditions"
  | "other";

export type ConversationStatus = "reviewed" | "needs_review" | "guided_to_mohre" | "answered";

export type MessageKind = "text" | "voice" | "image";

export type LawTopic =
  | "contract"
  | "salary"
  | "working_hours"
  | "overtime"
  | "leave"
  | "probation"
  | "gratuity"
  | "termination"
  | "passport"
  | "recruitment_fees"
  | "safety"
  | "complaints"
  | "other";

export interface Page<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminOverview {
  periodDays: number;
  workers: { total: number; pending: number; granted: number; declined: number };
  conversations: {
    conversations: number;
    conversationsSince: number;
    inboundMessages: number;
    outboundMessages: number;
    urgentMessages: number;
    flaggedMessages: number;
    citedAnswers: number;
    averageReplyLatencyMs: number | null;
    needsReview: number;
    withIssue: number;
    guidedToMohre: number;
    issueTypes: { issueType: IssueType; count: number }[];
  };
  contractsRead: number;
  followUpsScheduled: number;
  knowledgeBase: { articles: number; verified: number };
}

export interface ConversationSummary {
  id: string;
  workerId: string;
  issueType: IssueType | null;
  status: ConversationStatus;
  preview: string | null;
  channel: MessageKind | null;
  messageCount: number;
  flaggedCount: number;
  urgentCount: number;
  guidedToMohre: boolean;
  reviewedAt: string | null;
  lastMessageAt: string;
}

export interface ToolCall {
  name: string;
  input: unknown;
  ok: boolean;
}

export interface Message {
  id: string;
  direction: "inbound" | "outbound";
  kind: MessageKind;
  body: string;
  toolCalls: ToolCall[];
  citations: string[];
  urgent: boolean;
  flagged: boolean;
  flagReason: string | null;
  latencyMs: number | null;
  createdAt: string;
}

export interface FlaggedMessage {
  id: string;
  conversationId: string;
  body: string;
  flagReason: string | null;
  citations: string[];
  createdAt: string;
}

export interface LawArticle {
  id: string;
  reference: string;
  title: string;
  body: string;
  topic: LawTopic;
  sourceUrl: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LawArticleInput = Pick<LawArticle, "reference" | "title" | "body" | "topic"> & {
  sourceUrl?: string;
  verified?: boolean;
};
