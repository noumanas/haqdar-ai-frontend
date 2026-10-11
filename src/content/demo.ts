import type { AgentStage, CaseStatus, CaseStep } from "@/lib/demo/types";

export const demoPage = {
  title: "Try the demo",
  description:
    "Pick a workplace problem and tap the replies. See Haqdar understand it, check the law and the money, guide the complaint, and follow up until it's resolved.",
  badge: "Free demo · no download · no sign-up",
  heading: "Try Haqdar. See how a complaint gets resolved.",
  intro:
    "Ask Haqdar about your job in the UAE by typing or talking, or send a photo or PDF of your contract. This is the real agent: it searches the labour law and works out the money with code.",
  pickerLabel: "Choose a problem",
  liveExamplesLabel: "Or start with an example",
  progressTitle: "Case progress",
  stagesLabel: "Agent is now:",
  disclaimer:
    "Answers are guidance from Haqdar's AI, not legal advice. Haqdar is not a lawyer and guides you to MOHRE. On WhatsApp it also replies by voice and checks back on your case.",
  guidedDisclaimer:
    "This guided demo uses example answers and amounts. The real Haqdar works on WhatsApp by voice in Urdu. Haqdar is not a lawyer and guides you to MOHRE.",
  privacy:
    "Nothing you type, say or send here is saved. Voice notes, photos and PDFs are read by Haqdar's AI once and then discarded.",
  guidedPrivacy:
    "Nothing you type or say here is saved. Voice is turned into text by your browser.",
  backLabel: "Back to website",
  whatsappLabel: "Get it on WhatsApp",
  chat: {
    name: "Haqdar",
    online: "Online · live AI",
    onlineGuided: "Online · guided demo",
    useGuided: "Try the guided demo",
    quotaLeft:
      "{count} more live questions for now. The guided demo and Haqdar on WhatsApp are still available.",
    quotaLast:
      "That was your last live question for now. The guided demo and Haqdar on WhatsApp are still available.",
    urgentTitle:
      "If you are in danger, call MOHRE now: 600590000. Police: 999.",
    typing: "typing…",
    restart: "Start again",
    agentMeta: "Haqdar · Urdu voice reply",
    liveMeta: "Haqdar · voice note and text",
    preparingVoice: "Recording the voice answer…",
    yourVoiceLabel: "your voice note",
    helpfulQuestion: "Was this helpful?",
    helpfulThanks: "Thanks for telling us.",
    helpfulYes: "Yes, this was helpful",
    helpfulNo: "No, this was not helpful",
    voiceUnavailable: "Voice note unavailable for this answer",
    replyVoiceLabel: "Haqdar's voice answer",
    followUpMeta: "Haqdar · follow-up",
    userMeta: "You",
    inputLabel: "Type a message",
    placeholder: "Type your question…",
    send: "Send",
    retry: "Try again",
    sourcePrefix: "Source:",
    readingContract: "reading your contract…",
    listening: "listening to your voice note…",
    voiceNoteMeta: "You · voice note",
    transcribing: "Haqdar is listening…",
    heard: "Haqdar heard:",
    notHeard: "No clear speech heard",
    contractMeta: "Haqdar · contract check",
    voiceMeta: "You · voice",
    photoMeta: "You · contract",
    termsTitle: "What your contract says",
    flagsTitle: "Needs your attention",
    found: "Contract says",
    law: "Law says",
    attach: "Upload your contract (photo or PDF)",
    mute: "Don't play voice answers automatically",
    unmute: "Play voice answers automatically",
  },
  modeChoice: {
    title: "How do you want to talk to Haqdar?",
    hint: "Speak in Urdu or English and hear the replies, like a voice note on WhatsApp.",
    liveHint:
      "Send voice notes in Urdu or any language, like on WhatsApp. Haqdar answers with a voice note and text.",
    voice: "Talk with voice",
    text: "Type instead",
  },
  voice: {
    tapToSpeak: "Tap and speak",
    record: "Tap to record a voice note",
    recording: "tap to send",
    preparing: "Preparing your voice note…",
    cancel: "Cancel voice note",
    noteHint:
      "Speak in Urdu or any language, up to a minute. Haqdar answers with a voice note and text.",
    noteUnsupported:
      "This browser can't record audio. Try Chrome, Edge, Safari or Firefox, or type instead.",
    listening: "Listening… tap to send",
    switchToText: "Type instead",
    switchToVoice: "Talk with voice",
    unsupported:
      "This browser can't listen. Try Chrome, Edge or Safari, or tap a reply or type.",
    languages: [
      { id: "ur-PK", label: "اردو", lang: "ur" },
      { id: "en-US", label: "English", lang: "en" },
    ],
  },
};

export const caseSteps: { id: CaseStep; label: string; hint: string }[] = [
  {
    id: "problem_shared",
    label: "Problem shared",
    hint: "You tell Haqdar what happened",
  },
  {
    id: "rights_explained",
    label: "Rights explained",
    hint: "Law checked, money worked out",
  },
  {
    id: "complaint_guided",
    label: "Complaint guided",
    hint: "Documents and MOHRE steps",
  },
  {
    id: "follow_up",
    label: "Follow-up",
    hint: "Haqdar checks back on its own",
  },
  { id: "resolved", label: "Resolved", hint: "You got what you were owed" },
];

export const agentStages: { id: AgentStage; label: string }[] = [
  { id: "understanding", label: "Understanding" },
  { id: "planning", label: "Planning" },
  { id: "using_tools", label: "Using tools" },
  { id: "checking", label: "Checking" },
  { id: "following_up", label: "Following up" },
];

export const caseStatusLabel: Record<CaseStatus, string> = {
  in_progress: "In progress",
  complaint_filed: "Complaint filed",
  resolved: "Resolved",
};

/** The first message in live chat; nothing is sent to the server until the visitor writes. */
export const liveGreeting = {
  text: "Assalam o Alaikum! I am Haqdar. Ask me about late salary, overtime, end-of-service money, your contract or a MOHRE complaint. You can type, talk, or send a photo or PDF of your contract.",
  urdu: "السلام علیکم! میں حقدار ہوں۔ اپنا مسئلہ لکھیں، بولیں یا معاہدے کی تصویر یا PDF بھیجیں۔",
};

/** One-tap starting questions for live chat. Each sends a real question to the agent. */
export const liveExamples: {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}[] = [
  {
    id: "late-salary",
    title: "Late salary",
    subtitle: "2 months unpaid",
    prompt:
      "My salary has not been paid for 2 months. My basic salary is AED 1,500. What can I do?",
  },
  {
    id: "unpaid-overtime",
    title: "Unpaid overtime",
    subtitle: "10 hours a day",
    prompt:
      "I work 10 hours a day and get no overtime. My basic salary is AED 1,500 and I worked about 20 extra hours this month. How much am I owed?",
  },
  {
    id: "gratuity",
    title: "End-of-service money",
    subtitle: "After 6 years",
    prompt:
      "I worked 6 years and my basic salary is AED 2,000. How much end-of-service gratuity will I get?",
  },
  {
    id: "passport-kept",
    title: "Passport kept",
    subtitle: "Employer is holding it",
    prompt:
      "My company is keeping my passport. Is that allowed? What should I do?",
  },
];
