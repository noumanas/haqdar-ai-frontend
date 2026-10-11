"use client";

import { useState, type ReactNode } from "react";

import { demoPage, liveExamples } from "@/content/demo";

import { AgentStages } from "./agent-stages";
import { CaseProgress } from "./case-progress";
import { DemoChat } from "./demo-chat";
import { ScenarioPicker } from "./scenario-picker";
import { useDemo } from "./use-demo";
import { useLiveChat } from "./use-live-chat";

/** Before the first turn arrives the tracker shows a fresh case. */
const FRESH_CASE = {
  caseStep: "problem_shared",
  agentStage: "understanding",
  status: "in_progress",
  resolved: false,
} as const;

/**
 * The interactive half of the demo page. It opens on live chat with the real agent; if
 * the AI is unavailable the visitor can switch to the guided demo of scripted cases.
 */
export function DemoExperience({ intro }: { intro: ReactNode }) {
  const [variant, setVariant] = useState<"live" | "guided">("live");
  return variant === "live" ? (
    <LiveDemo intro={intro} onUseGuided={() => setVariant("guided")} />
  ) : (
    <GuidedDemo intro={intro} />
  );
}

function Layout({ side, chat }: { side: ReactNode; chat: ReactNode }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-5">{side}</div>
      {chat}
    </div>
  );
}

/** Shown only when the visitor is close to the demo's limit, so it doesn't come as a surprise. */
function quotaHint(remaining: number | null): string | undefined {
  if (remaining === null || remaining > 3) return undefined;
  if (remaining === 0) return demoPage.chat.quotaLast;
  return demoPage.chat.quotaLeft.replace("{count}", String(remaining));
}

function LiveDemo({
  intro,
  onUseGuided,
}: {
  intro: ReactNode;
  onUseGuided: () => void;
}) {
  const chat = useLiveChat();
  const complaint = ["follow_up", "resolved"].includes(chat.progress.caseStep);

  return (
    <Layout
      side={
        <>
          {intro}
          <ScenarioPicker
            label={demoPage.liveExamplesLabel}
            scenarios={liveExamples}
            selected={chat.picked}
            onPick={chat.pickExample}
          />
          <CaseProgress
            caseStep={chat.progress.caseStep}
            status={complaint ? "complaint_filed" : "in_progress"}
            resolved={false}
          />
          <AgentStages stage={chat.progress.agentStage} />
          <p className="text-xs leading-normal text-stone">
            {demoPage.disclaimer} {demoPage.privacy}
          </p>
        </>
      }
      chat={
        <DemoChat
          variant="live"
          entries={chat.entries}
          chips={chat.chips}
          activity={chat.activity}
          error={chat.error}
          canSend
          onChip={(chip) => chat.pickExample(chip.id)}
          onSend={chat.send}
          onContract={chat.sendContract}
          onRestart={chat.restart}
          onRetry={chat.retry}
          onUseGuided={onUseGuided}
          onVoiceNote={chat.sendVoice}
          quotaHint={quotaHint(chat.remaining)}
        />
      }
    />
  );
}

function GuidedDemo({ intro }: { intro: ReactNode }) {
  const demo = useDemo();
  const progress = demo.turn?.progress ?? FRESH_CASE;

  return (
    <Layout
      side={
        <>
          {intro}
          <ScenarioPicker
            scenarios={demo.scenarios}
            selected={demo.scenarioId}
            onPick={demo.pick}
          />
          <CaseProgress
            caseStep={progress.caseStep}
            status={progress.status}
            resolved={progress.resolved}
          />
          <AgentStages stage={progress.agentStage} />
          <p className="text-xs leading-normal text-stone">
            {demoPage.guidedDisclaimer} {demoPage.guidedPrivacy}
          </p>
        </>
      }
      chat={
        <DemoChat
          variant="guided"
          entries={demo.entries}
          chips={(demo.turn?.chips ?? []).map(({ id, label }) => ({
            id,
            label,
          }))}
          activity={demo.activity}
          error={demo.error}
          canSend={demo.canSend}
          emptySend={demo.emptySend}
          onChip={(chip) => {
            const step = demo.turn?.chips.find(
              (candidate) => candidate.id === chip.id,
            );
            if (step) demo.reply(step);
          }}
          onSend={demo.send}
          onContract={demo.sendContract}
          onRestart={demo.restart}
          onRetry={demo.retry}
        />
      }
    />
  );
}
