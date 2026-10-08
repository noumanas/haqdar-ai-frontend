import {
  Bell,
  BookOpen,
  Check,
  FileText,
  Flag,
  Loader,
  Lock,
  MessageCircle,
  Mic,
  ShieldCheck,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Tone } from "@/lib/tones";

export const siteConfig = {
  name: "Haqdar",
  tagline: "Know your rights at work in the UAE",
  description:
    "Haqdar is a free AI assistant on WhatsApp. Send a voice note or a photo of your job contract. Haqdar explains it in Urdu, checks the money you are owed, and guides you to the official labour ministry.",
  // TODO: replace with the real wa.me link once the number is live.
  whatsappUrl: "#start",
  whatsappNumber: "[Haqdar number]",
  partnersEmail: "[partners email]",
  mohre: {
    phone: "600590000",
    url: "https://www.mohre.gov.ae",
    label: "mohre.gov.ae",
  },
} as const;

export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "The problem", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Safety", href: "#trust" },
  { label: "Partners", href: "#partners" },
  { label: "FAQ", href: "#faq" },
];

export type IconItem = {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: Tone;
};

export const hero = {
  badges: [
    { label: "Free", icon: Check, tone: "lime" },
    { label: "Urdu voice", icon: Mic, tone: "coral" },
    { label: "On WhatsApp", icon: MessageCircle, tone: "lilac" },
  ] satisfies { label: string; icon: LucideIcon; tone: Tone }[],
  title: "Every worker in the UAE deserves to know their rights.",
  urduLine: "ہر مزدور کا حق، اس کی اپنی زبان میں",
  body: siteConfig.description,
  disclaimer: "Not a lawyer. Haqdar guides you to MOHRE, the UAE labour ministry.",
};

export const problem = {
  eyebrow: "The problem",
  title: "Millions of workers sign contracts they cannot read.",
  body: "Workers from Pakistan, India, Bangladesh, Nepal and the Philippines keep the UAE running. Many speak Urdu, Hindi, Punjabi, Malayalam, Bengali or Nepali, and many read little. Their contract is in Arabic or English. When something goes wrong, they don't know their rights or where to go.",
  issues: [
    {
      icon: FileText,
      tone: "lime",
      title: "Contract not understood",
      body: "Salary, hours, leave and end date are signed without being understood.",
    },
    {
      icon: Wallet,
      tone: "peach",
      title: "Salary late or short",
      body: "Workers wait months, not knowing the bank system already tracks late pay.",
    },
    {
      icon: TriangleAlert,
      tone: "lilac",
      title: "Unpaid overtime",
      body: "Extra hours are worked every day, but the legal overtime rate is never paid.",
    },
    {
      icon: Lock,
      tone: "lime",
      title: "Passport kept",
      body: "Employers are not allowed to hold passports, yet workers don't know it.",
    },
    {
      icon: Flag,
      tone: "peach",
      title: "Recruitment fees",
      body: "Workers pay agents fees that the employer is meant to cover.",
    },
    {
      icon: MessageCircle,
      tone: "lilac",
      title: "Nowhere to turn",
      body: "Help is in Arabic or English, on forms, or on busy helplines.",
    },
  ] satisfies IconItem[],
  today: [
    "Forms in Arabic and English",
    "Busy helplines in office hours",
    "No way to check the money owed",
    "Fear of a confusing process",
  ],
  withHaqdar: [
    "Voice in Urdu, on WhatsApp",
    "Answers 24 hours a day",
    "Exact overtime and end-of-service amounts",
    "Step by step to the official complaint",
  ],
};

export const steps = {
  eyebrow: "How it works",
  title: "Three steps. No forms. No English needed.",
  items: [
    {
      tone: "lime",
      title: "Send a voice note or a photo",
      body: "Message Haqdar on WhatsApp. Speak in Urdu, or send a photo of your contract or offer letter.",
    },
    {
      tone: "lilac",
      title: "Haqdar explains it",
      body: "You get a voice reply in simple Urdu: what your contract says, what the law says, and anything that looks wrong.",
    },
    {
      tone: "white",
      title: "Take the next step",
      body: "Check the money you're owed, then follow the step-by-step guide to MOHRE's free complaint service.",
    },
  ] satisfies { tone: Tone; title: string; body: string }[],
};

export const agent = {
  badge: { label: "Behind the chat", icon: Loader },
  title: "Haqdar is an AI agent, not just a chatbot.",
  body: "A chatbot only answers. Haqdar works on the worker's case: it understands the problem, decides which tools to use, takes the steps itself, checks its own work, and comes back later to follow up.",
  loop: [
    {
      phase: "Listen",
      title: "Understand",
      body: "Turns the Urdu voice note or contract photo into the real problem, for example “late salary, 2 months”.",
      tone: "sand",
    },
    {
      phase: "Decide",
      title: "Plan",
      body: "Decides what is needed: which law to check, whether to calculate money, whether it is urgent.",
      tone: "lilac",
    },
    {
      phase: "Use tools",
      title: "Act",
      body: "Uses its tools on its own: reads the contract, searches the law, runs the calculator, opens the complaint guide.",
      tone: "lime",
    },
    {
      phase: "Verify",
      title: "Check",
      body: "Answers only with a cited rule, numbers come from tested code, and says “I don’t know” instead of guessing.",
      tone: "peach",
    },
    {
      phase: "Remember",
      title: "Follow up",
      body: "Remembers the case and messages the worker later: “Did you get your complaint number?”",
      tone: "sand",
    },
  ] satisfies { phase: string; title: string; body: string; tone: Tone }[],
  tools: {
    title: "Tools the agent chooses from",
    items: [
      { label: "Urdu speech", icon: Mic },
      { label: "Contract reader", icon: FileText },
      { label: "Labour law search", icon: BookOpen },
      { label: "Money calculator", icon: Wallet },
      { label: "Urgent-case check", icon: TriangleAlert },
      { label: "Complaint guide", icon: Flag },
      { label: "Case memory", icon: Lock },
      { label: "Follow-up reminders", icon: Bell },
    ] satisfies { label: string; icon: LucideIcon }[],
    note: "The agent picks the right tools for each message. A simple question may use one; a salary problem may use five in a row.",
  },
  example: {
    title: "What the agent did · example",
    prompt: "Worker: “My salary hasn’t come for two months.”",
    events: [
      { tag: "Heard", title: "Late salary, 2 months", body: "Urdu speech turned into text and a clear problem.", tone: "lime" },
      { tag: "Decided", title: "Check the law, then the money", body: "Not urgent, but money may be missing.", tone: "lilac" },
      { tag: "Acted", title: "Searched WPS rules · ran calculator", body: "Expected AED 6,750, paid AED 5,000.", tone: "lime" },
      { tag: "Checked", title: "Rule cited, numbers from code", body: "AED 1,750 missing.", tone: "coral" },
      { tag: "Replied", title: "Urdu voice answer + complaint guide", body: "Next step: file a free complaint with MOHRE.", tone: "lime" },
      { tag: "7 days later", title: "Followed up on its own", body: "“Did you get your complaint number?”", tone: "lilac" },
    ] satisfies { tag: string; title: string; body: string; tone: Tone }[],
  },
};

export const features = {
  eyebrow: "What Haqdar does",
  title: "Four tools, one WhatsApp chat.",
  contractReader: {
    title: "Contract reader",
    body: "Photo in, plain Urdu out. Haqdar finds salary, hours, leave and end date, and flags terms that break the law. The photo is deleted after reading.",
    facts: [
      { label: "Basic salary", value: "AED 1,500" },
      { label: "Annual leave", value: "30 days" },
    ],
    flag: { label: "Working hours · check this", value: "10 h a day · legal limit 8" },
  },
  rightsAnswers: {
    title: "Rights answers",
    body: "Ask anything by voice. Every answer comes from official UAE sources and says which rule it is based on.",
    question: "Can my company keep my passport?",
    answer: "No. Your employer is not allowed to keep it. Call MOHRE on 600590000.",
  },
  calculator: {
    title: "Money calculator",
    body: "Exact overtime and end-of-service amounts, worked out by code, not guessed by AI. Compare with what you were paid.",
    results: [
      { label: "End-of-service · 6 years", value: "AED 6,750", tone: "lime" },
      { label: "Missing", value: "AED 1,750", tone: "coral" },
    ] satisfies { label: string; value: string; tone: Tone }[],
  },
  complaintGuide: {
    title: "Complaint guide",
    body: "Which documents to prepare, how to file with MOHRE, and a reminder to follow up. Haqdar reads every step aloud.",
    steps: [
      { label: "Documents ready", status: "done" },
      { label: "File with MOHRE · now", status: "current" },
      { label: "Save complaint number", status: "todo" },
    ] satisfies { label: string; status: "done" | "current" | "todo" }[],
  },
};

export const story = {
  eyebrow: "An example story",
  title: "Imran's contract said 10 hours. Nobody told him about overtime.",
  note: "A typical story Haqdar is built for. Names and amounts are examples.",
  events: [
    {
      tone: "forest",
      when: "Evening",
      title: "Sends a photo",
      body: "Imran, a construction worker from Punjab, sends his contract to Haqdar after work.",
    },
    {
      tone: "coral",
      when: "20 seconds later",
      title: "Hears the problem",
      body: "Haqdar explains in Urdu: his contract says 10 hours a day, above the normal 8.",
    },
    {
      tone: "lilac",
      when: "Same chat",
      title: "Checks his money",
      body: "The calculator shows about AED 154 overtime owed for this month.",
    },
    {
      tone: "lime",
      when: "Next day",
      title: "Files with MOHRE",
      body: "With his documents ready, he follows the guide and saves his complaint number.",
    },
  ] satisfies { tone: Tone; when: string; title: string; body: string }[],
};

export const trust = {
  eyebrow: "Safety and trust",
  title: "Built to be right, private, and on the worker's side.",
  body: "A wrong answer can hurt a worker. Haqdar only answers from official rules, says when it doesn't know, and always points to the official channel for the final step.",
  pillars: [
    {
      icon: BookOpen,
      title: "Official sources only",
      body: "Answers come from UAE Labour Law and MOHRE guides, with the rule named in every reply.",
    },
    {
      icon: Wallet,
      title: "Money by code, not AI",
      body: "Overtime and end-of-service are calculated by tested code, so the numbers are exact.",
    },
    {
      icon: Lock,
      title: "Private by design",
      body: "Contract photos are deleted after reading. No names needed. Delete your data any time.",
    },
    {
      icon: ShieldCheck,
      title: "A bridge to MOHRE",
      body: "Haqdar never replaces the ministry and never contacts your employer. It helps you use the official system.",
    },
  ] satisfies IconItem[],
  disclaimer: "Haqdar gives general information. It is not legal advice and not a law firm.",
};

export const languages = {
  eyebrow: "Languages",
  title: "Starting in Urdu. More languages next.",
  body: "Voice first, so workers who read little can still use it.",
  live: { native: "اردو", label: "Urdu · live" },
  upcoming: ["Hindi · next", "Punjabi · next", "Bengali", "Malayalam", "Nepali", "Tagalog"],
};

export const pilot = {
  eyebrow: "Pilot",
  note: "Results will be published after the pilot",
  // Placeholder values until pilot results are published.
  stats: [
    { value: "[—]", label: "Workers helped" },
    { value: "[—]", label: "Contracts explained" },
    { value: "[—]", label: "Issues found" },
    { value: "[—]", label: "Answer accuracy on legal tests" },
  ],
};

export const partners = {
  eyebrow: "Work with us",
  title: "Help us reach every worker.",
  items: [
    {
      tone: "lime",
      title: "Community groups and NGOs",
      body: "Share Haqdar in worker camps, mosques and community WhatsApp groups. We'll give you posters and a QR code in Urdu.",
      cta: "Get the kit",
    },
    {
      tone: "lilac",
      title: "Government and MOHRE",
      body: "Haqdar sends workers to official channels with their documents ready. Let's make that handover even smoother.",
      cta: "Talk to us",
    },
    {
      tone: "sand",
      title: "Responsible employers",
      body: "Give new hires a simple way to understand their contract on day one. Fewer disputes, more trust.",
      cta: "Learn more",
    },
  ] satisfies { tone: Tone; title: string; body: string; cta: string }[],
};

export const faq = {
  eyebrow: "Questions",
  title: "Common questions",
  body: "Still unsure? Ask Haqdar directly on WhatsApp.",
  items: [
    {
      q: "Is Haqdar really free?",
      a: "Yes. Haqdar is free for workers. It runs on WhatsApp, so you only need your normal data or Wi-Fi.",
    },
    {
      q: "Is Haqdar a lawyer?",
      a: "No. Haqdar explains your contract and the UAE Labour Law in simple words, and guides you to MOHRE, the official labour ministry, for any decision or complaint.",
    },
    {
      q: "Will my employer find out?",
      a: "No. Haqdar never contacts your employer. Your chat stays between you and Haqdar.",
    },
    {
      q: "What happens to my contract photo?",
      a: "Haqdar reads the details and then deletes the photo. You can ask Haqdar to delete all your data at any time.",
    },
    {
      q: "Does it work in every emirate?",
      a: "Haqdar follows the federal UAE Labour Law used across the emirates. Some free zones, such as DIFC and ADGM, have their own employment rules; Haqdar will tell you if your case may be different.",
    },
    {
      q: "Which languages can I use?",
      a: "Urdu today, by voice or text. Hindi and Punjabi are next, followed by more languages spoken by workers in the UAE.",
    },
  ],
};

export const cta = {
  title: "Know your rights in two minutes.",
  urduLine: "واٹس ایپ پر حقدار سے بات کریں، بالکل مفت",
  button: "Message Haqdar on WhatsApp",
  meta: `WhatsApp number: ${siteConfig.whatsappNumber} · Free · Urdu voice`,
};

export const footer = {
  copyright: "© 2026 Haqdar",
  blurb: "A free AI assistant that helps workers in the UAE understand their rights.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Features", href: "#features" },
        { label: "Safety", href: "#trust" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Organisation",
      links: [
        { label: "Partners", href: "#partners" },
        { label: "Press", href: "#contact" },
        { label: "Privacy policy", href: "#contact" },
        { label: "Terms", href: "#contact" },
      ],
    },
  ] satisfies { title: string; links: NavLink[] }[],
  legal:
    "Haqdar gives general information based on UAE Labour Law. It is not legal advice and is not part of the UAE government. For official decisions, contact MOHRE.",
};
