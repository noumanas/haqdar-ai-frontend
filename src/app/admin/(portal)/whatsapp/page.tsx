import { Image as ImageIcon, Mic, Search } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { BarRow } from "@/components/admin/ui/charts";
import { ApiErrorNotice, EmptyState, Skeleton } from "@/components/admin/ui/notices";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel, StatCard } from "@/components/admin/ui/panel";
import { Pill, type PillTone } from "@/components/admin/ui/pills";
import { RevealNumber } from "@/components/admin/whatsapp/reveal-number";
import { adminApi } from "@/lib/admin/api";
import {
  CONSENT_LABELS,
  formatDate,
  formatTime,
  LANGUAGE_LABELS,
  languageLabel,
  timeAgo,
} from "@/lib/admin/format";
import { load } from "@/lib/admin/load";
import type { ConsentStatus, Language, Message, WhatsAppContact, WhatsAppSummary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "WhatsApp" };

const PAGE_SIZE = 20;
const PERIOD_DAYS = 7;

const CONSENT_TONES: Record<ConsentStatus, PillTone> = { granted: "signal", pending: "neutral", declined: "alarm" };

type SearchParams = PageProps<"/admin/whatsapp">["searchParams"];

const first = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

export default function WhatsAppPage({ searchParams }: PageProps<"/admin/whatsapp">) {
  return (
    <>
      <PageHeader
        crumb="WhatsApp"
        title="WhatsApp numbers"
        description="Every number that has messaged Haqdar and its chat. Numbers are masked; showing one is logged."
      />
      <Suspense fallback={<StatsSkeleton />}>
        <Summary />
      </Suspense>
      <Suspense fallback={<ListSkeleton />}>
        <Numbers searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// ── Summary ───────────────────────────────────────────────────────────

async function Summary() {
  const summary = await load(() => adminApi.whatsappSummary(PERIOD_DAYS));
  if (!summary.ok) return <ApiErrorNotice message={summary.error} />;
  const s = summary.data;

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <div className="grid flex-[3_1_460px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] content-start gap-3">
        <StatCard label="WhatsApp numbers" value={s.numbers} hint="Have messaged Haqdar" />
        <StatCard label={`Active, last ${PERIOD_DAYS} days`} value={s.activeSince} hint={`of ${s.numbers} numbers`} />
        <StatCard
          label="Signed up"
          value={s.consent.granted}
          hint={`${s.consent.pending} not started · ${s.consent.declined} declined`}
        />
        <StatCard
          label="Messages stored"
          value={s.inboundMessages + s.outboundMessages}
          hint={`${s.inboundMessages} from workers · ${s.outboundMessages} replies`}
        />
      </div>
      <LanguagesPanel summary={s} />
    </div>
  );
}

function LanguagesPanel({ summary }: { summary: WhatsAppSummary }) {
  const rows = [
    ...(Object.keys(LANGUAGE_LABELS) as Language[]).map((language) => ({
      label: LANGUAGE_LABELS[language],
      value: summary.languages[language] ?? 0,
    })),
    { label: "Not chosen yet", value: summary.languages.unset ?? 0 },
  ];
  return (
    <Panel title="Languages" subtitle="Chosen on first contact" className="flex-[1_1_260px]">
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <BarRow key={row.label} label={row.label} value={row.value} max={Math.max(summary.numbers, 1)} />
        ))}
      </div>
    </Panel>
  );
}

// ── Numbers and chat ──────────────────────────────────────────────────

const href = (params: { page?: number; phone?: string; id?: string }): string => {
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined || value === "" || (key === "page" && value === 1) ? [] : [[key, String(value)]],
    ),
  );
  return query.size ? `/admin/whatsapp?${query}` : "/admin/whatsapp";
};

async function Numbers({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const phone = first(params.phone)?.trim() || undefined;
  const page = Math.max(1, Number(first(params.page)) || 1);

  const list = await load(() => adminApi.whatsappContacts({ page, limit: PAGE_SIZE, phone }));
  if (!list.ok) return <ApiErrorNotice message={list.error} />;

  const { items, meta } = list.data;
  const selected = items.find((item) => item.workerId === first(params.id)) ?? items[0];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Form action="/admin/whatsapp" className="flex w-full max-w-[420px] items-center gap-2">
          <label htmlFor="phone" className="sr-only">
            Find a full WhatsApp number
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone" aria-hidden />
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={phone}
              placeholder="Find a full number, e.g. +971 50 123 4567"
              className="h-10 w-full rounded-[10px] border border-line bg-white pr-3 pl-9 text-[13px] outline-none focus:border-foreground"
            />
          </div>
          <button type="submit" className="h-10 rounded-[10px] bg-ink px-4 text-[13px] font-semibold text-white">
            Find
          </button>
          {phone && (
            <Link href="/admin/whatsapp" className="text-xs font-semibold text-stone hover:text-foreground">
              Clear
            </Link>
          )}
        </Form>
        <span className="text-xs text-stone">
          {phone ? `${meta.total} match` : `${meta.total} number${meta.total === 1 ? "" : "s"}`}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState title={phone ? "No worker has messaged from that number" : "No WhatsApp numbers yet"}>
          {phone
            ? "Check the country code. Only exact, full numbers are found, because numbers are stored encrypted."
            : "Numbers appear here as soon as someone messages Haqdar on WhatsApp."}
        </EmptyState>
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <section aria-label="WhatsApp numbers" className="flex min-w-0 flex-[2_1_300px] flex-col gap-2">
            {items.map((item) => (
              <NumberCard
                key={item.workerId}
                item={item}
                selected={item.workerId === selected?.workerId}
                link={href({ page, phone, id: item.workerId })}
              />
            ))}
            {meta.totalPages > 1 && <Pager page={page} totalPages={meta.totalPages} phone={phone} />}
          </section>
          {selected && (
            <Suspense key={selected.workerId} fallback={<Skeleton className="h-[560px] flex-[3_1_480px]" />}>
              <Chat workerId={selected.workerId} />
            </Suspense>
          )}
        </div>
      )}
    </>
  );
}

function NumberCard({ item, selected, link }: { item: WhatsAppContact; selected: boolean; link: string }) {
  const last = item.lastMessage;
  return (
    <Link
      href={link}
      scroll={false}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border bg-white p-3.5 transition-colors",
        selected ? "border-foreground ring-1 ring-foreground" : "border-line hover:border-stone/40",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-bold tabular-nums">{item.maskedPhone}</span>
        <span className="flex items-center gap-1.5">
          {item.urgentCount > 0 && (
            <Pill tone="alarm" className="text-[11px]">
              Urgent
            </Pill>
          )}
          <Pill tone={CONSENT_TONES[item.consentStatus]} className="text-[11px]">
            {CONSENT_LABELS[item.consentStatus]}
          </Pill>
        </span>
      </span>
      {last ? (
        <span dir="auto" className="line-clamp-2 text-xs leading-snug text-stone">
          {last.direction === "outbound" ? "Haqdar: " : ""}
          {last.body}
        </span>
      ) : (
        <span className="text-xs text-stone">No messages stored yet</span>
      )}
      <span className="text-[11px] text-stone">
        {languageLabel(item.language)} · {item.messageCount} message{item.messageCount === 1 ? "" : "s"} · active{" "}
        {timeAgo(item.lastActiveAt)}
      </span>
    </Link>
  );
}

function Pager({ page, totalPages, phone }: { page: number; totalPages: number; phone?: string }) {
  const link = "rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:bg-hairline";
  return (
    <nav aria-label="Pages" className="flex items-center justify-between pt-1 text-xs text-stone">
      {page > 1 ? <Link className={link} href={href({ page: page - 1, phone })}>Previous</Link> : <span />}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? <Link className={link} href={href({ page: page + 1, phone })}>Next</Link> : <span />}
    </nav>
  );
}

async function Chat({ workerId }: { workerId: string }) {
  const chat = await load(() => adminApi.whatsappChat(workerId));
  if (!chat.ok) {
    return (
      <div className="flex-[3_1_480px]">
        <ApiErrorNotice message={chat.error} />
      </div>
    );
  }
  const { contact, messages } = chat.data;

  return (
    <section aria-label="WhatsApp chat" className="flex min-w-0 flex-[3_1_480px] flex-col gap-4">
      <Panel className="gap-3">
        <RevealNumber workerId={contact.workerId} maskedPhone={contact.maskedPhone} />
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={CONSENT_TONES[contact.consentStatus]}>{CONSENT_LABELS[contact.consentStatus]}</Pill>
          <Pill tone="neutral">{languageLabel(contact.language)}</Pill>
          {contact.urgentCount > 0 && <Pill tone="alarm">{contact.urgentCount} urgent</Pill>}
        </div>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 text-[13px]">
          <Fact label="First message" value={formatDate(contact.firstContactAt)} />
          <Fact label="Last active" value={timeAgo(contact.lastActiveAt)} />
          <Fact label="Conversations" value={contact.conversationCount} />
          <Fact label="Messages" value={`${contact.inboundCount} in · ${contact.messageCount - contact.inboundCount} out`} />
        </dl>
      </Panel>

      <Panel
        title="Chat"
        subtitle={
          messages.length >= 200
            ? "The latest 200 messages. Voice notes appear as their transcript."
            : "Voice notes appear as their transcript. Each reply was also sent as a voice note."
        }
      >
        {messages.length === 0 ? (
          <EmptyState title="Nothing stored for this number">
            This number hasn’t picked a language yet. Messages are kept from then on; the language menu itself is not stored.
          </EmptyState>
        ) : (
          <ChatLog messages={messages} />
        )}
      </Panel>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] text-stone">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Worker on the left, Haqdar on the right, as the business sees it in WhatsApp; a divider per day. */
function ChatLog({ messages }: { messages: Message[] }) {
  return (
    <ol className="flex max-h-[640px] flex-col gap-2 overflow-y-auto rounded-xl bg-canvas p-3">
      {messages.map((message, index) => {
        const day = formatDate(message.createdAt);
        const newDay = index === 0 || formatDate(messages[index - 1].createdAt) !== day;
        return (
          <li key={message.id} className="flex flex-col gap-2">
            {newDay && (
              <span className="self-center rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-stone shadow-sm">
                {day}
              </span>
            )}
            <Bubble message={message} />
          </li>
        );
      })}
    </ol>
  );
}

function Bubble({ message }: { message: Message }) {
  const fromWorker = message.direction === "inbound";
  return (
    <div
      className={cn(
        "flex max-w-[82%] flex-col gap-1 px-3 py-2 text-[13px] leading-normal shadow-sm",
        fromWorker
          ? "self-start rounded-[14px_14px_14px_4px] bg-white"
          : "self-end rounded-[14px_14px_4px_14px] bg-forest-mist/70",
        message.flagged && "ring-1 ring-alarm",
      )}
    >
      {fromWorker && message.kind !== "text" && (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-stone">
          {message.kind === "voice" ? <Mic className="size-3" aria-hidden /> : <ImageIcon className="size-3" aria-hidden />}
          {message.kind === "voice" ? "Voice note (transcript)" : "Contract photo"}
        </span>
      )}
      <p dir="auto" className="whitespace-pre-line">
        {message.body}
      </p>
      <span className="flex items-center justify-end gap-1.5 text-[10px] text-stone">
        {message.urgent && <span className="font-semibold text-alarm-ink">urgent</span>}
        {message.flagged && <span className="font-semibold text-alarm-ink">flagged</span>}
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="grid flex-[3_1_460px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[104px]" />
        ))}
      </div>
      <Skeleton className="h-[220px] flex-[1_1_260px]" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-[2_1_300px] flex-col gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[92px]" />
        ))}
      </div>
      <Skeleton className="h-[560px] flex-[3_1_480px]" />
    </div>
  );
}
