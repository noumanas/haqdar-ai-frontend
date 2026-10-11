/** Shapes returned by the backend's public demo API (`/demo/*`). */

export type CaseStep =
  | "problem_shared"
  | "rights_explained"
  | "complaint_guided"
  | "follow_up"
  | "resolved";
export type AgentStage =
  "understanding" | "planning" | "using_tools" | "checking" | "following_up";
export type CaseStatus = "in_progress" | "complaint_filed" | "resolved";
export type CardTone = "lime" | "peach" | "lilac";

export type DemoScenario = { id: string; title: string; subtitle: string };

export type DemoMessage = {
  text: string;
  urdu: string | null;
  source: string | null;
  card: { label: string; value: string; tone: CardTone } | null;
  followUp: boolean;
};

export type DemoChip = {
  id: string;
  label: string;
  action: "reply" | "next_scenario";
};

export type DemoTurn = {
  scenarioId: string;
  nodeId: string;
  messages: DemoMessage[];
  chips: DemoChip[];
  progress: {
    caseStep: CaseStep;
    agentStage: AgentStage;
    status: CaseStatus;
    resolved: boolean;
  };
  nextScenarioId: string;
};

export type DemoContractTerm = { label: string; value: string };
export type DemoContractFlag = {
  title: string;
  found: string | null;
  legalLimit: string;
  articleRef: string;
};

export type DemoContractReading =
  | { legible: false; message: string }
  | {
      legible: true;
      message: string;
      terms: DemoContractTerm[];
      flags: DemoContractFlag[];
    };

/** One earlier turn of a live chat, sent back with each message (the server keeps nothing). */
export type ChatTurn = { role: "user" | "assistant"; text: string };

/** The real agent's answer in live chat. */
export type LiveChatReply = {
  reply: string;
  /** The answer in plain English when it was written in another language. */
  translation: string | null;
  citations: string[];
  tools: string[];
  urgent: boolean;
  progress: { caseStep: CaseStep; agentStage: AgentStage };
  /** Lets this reply be fetched as a voice note. */
  speechToken: string;
};

/** The agent's answer to a voice note, with what it heard. */
export type LiveVoiceReply = LiveChatReply & { transcript: string | null };
