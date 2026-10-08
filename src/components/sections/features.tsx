import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { features } from "@/content/site";
import { toneMutedText, toneSurface, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function Features() {
  const { contractReader, rightsAnswers, calculator, complaintGuide } = features;

  return (
    <Section id="features" surface="white">
      <SectionHeading eyebrow={features.eyebrow} title={features.title} />

      <div className="grid gap-4 lg:grid-cols-2">
        <FeatureCard tone="sand" title={contractReader.title} body={contractReader.body}>
          <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-white p-4">
            {contractReader.facts.map((fact) => (
              <div key={fact.label} className="rounded-[14px] bg-paper p-3">
                <div className="text-xs text-stone">{fact.label}</div>
                <div className="text-base font-bold">{fact.value}</div>
              </div>
            ))}
            <div className="col-span-2 rounded-[14px] border-2 border-coral p-3">
              <div className="text-xs text-coral-ink">{contractReader.flag.label}</div>
              <div className="text-base font-bold">{contractReader.flag.value}</div>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard tone="lilac" title={rightsAnswers.title} body={rightsAnswers.body}>
          <div className="flex flex-col gap-2 text-sm">
            <span className="self-end rounded-[18px_18px_4px_18px] bg-white px-3.5 py-2.5">{rightsAnswers.question}</span>
            <span className="max-w-[85%] self-start rounded-[18px_18px_18px_4px] bg-ink px-3.5 py-2.5 leading-normal text-white">
              {rightsAnswers.answer}
            </span>
          </div>
        </FeatureCard>

        <FeatureCard tone="forest" title={calculator.title} body={calculator.body}>
          <div className="grid grid-cols-2 gap-2">
            {calculator.results.map((result) => (
              <div key={result.label} className={cn("rounded-[20px] p-4", toneSurface[result.tone])}>
                <div className="text-xs">{result.label}</div>
                <div className="text-[26px] font-extrabold">{result.value}</div>
              </div>
            ))}
          </div>
        </FeatureCard>

        <FeatureCard tone="lime" title={complaintGuide.title} body={complaintGuide.body}>
          <ol className="flex flex-col gap-2.5 rounded-[22px] bg-white p-4 text-sm">
            {complaintGuide.steps.map((step, index) => (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-2.5",
                  step.status === "current" && "font-bold",
                  step.status === "todo" && "text-stone",
                )}
              >
                <StepMarker status={step.status} number={index + 1} />
                {step.label}
              </li>
            ))}
          </ol>
        </FeatureCard>
      </div>
    </Section>
  );
}

type FeatureCardProps = {
  tone: Tone;
  title: string;
  body: string;
  children: ReactNode;
};

function FeatureCard({ tone, title, body, children }: FeatureCardProps) {
  return (
    <article className={cn("flex flex-col gap-[18px] rounded-[32px] p-7", toneSurface[tone])}>
      <div className="flex flex-col gap-2">
        <h3 className="text-[26px] font-extrabold tracking-[-0.02em]">{title}</h3>
        <p className={cn("text-base leading-[1.55]", toneMutedText[tone])}>{body}</p>
      </div>
      {children}
    </article>
  );
}

function StepMarker({ status, number }: { status: "done" | "current" | "todo"; number: number }) {
  const base = "flex size-6 flex-none items-center justify-center rounded-full text-[11px]";

  if (status === "done") {
    return (
      <span className={cn(base, "bg-forest text-lime")}>
        <Check className="size-[13px]" strokeWidth={2.6} aria-hidden />
      </span>
    );
  }
  return <span className={cn(base, status === "current" ? "border-2 border-ink bg-lime" : "bg-muted")}>{number}</span>;
}
