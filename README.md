# Haqdar frontend

Next.js 16 app (App Router, Tailwind CSS v4, shadcn/ui) with two parts:

- **Marketing site** at `/`: GSAP animations, Lenis smooth scrolling.
- **Try the demo** at `/demo`: a visitor picks a workplace problem and taps through the case, driven by the backend's public demo API.
- **Admin portal** at `/admin`: overview, conversation review, knowledge base, and accuracy, backed by the Haqdar API.

## Run

```bash
cp .env.example .env.local   # HAQDAR_API_URL (admin, server-side) and NEXT_PUBLIC_HAQDAR_API_URL (demo, browser)
pnpm dev                     # http://localhost:3001  (the backend uses :3000)
```

Start the backend first (see `../backend/README.md`), then open <http://localhost:3001/admin> and sign in with the backend's `ADMIN_API_KEY`.

## Try the demo

`/demo` is linked from the nav ("Try the demo") and the hero ("Try the demo first"). The page shell is static; `src/components/demo/use-demo.ts` calls `GET /demo/scenarios` and `POST /demo/scenarios/:id/start|steps` from the browser (`src/lib/demo/api.ts`). Answers are scripted, but money figures and law sources come from the real calculators and knowledge base. Typing a message moves the case along its main path; nothing typed is sent to the server. A failed request shows an inline error with **Try again**, and answers that arrive after the visitor switches case are dropped.

- **Live AI first.** The chat opens on live chat with the real agent (`use-live-chat.ts` → `POST /demo/chat`): anything typed, spoken or photographed gets a real answer, with law sources and calculator figures. The browser keeps the conversation and sends recent turns each time; nothing is saved. The example cards send a starting question. If the AI is unavailable (503), the chat offers **Try the guided demo**, the scripted cases above.
- **Answers as voice note + text.** Each live answer card (`chat-bubbles.tsx`) shows a WhatsApp-style voice note (`voice-note-player.tsx`, fetched from `POST /demo/speech` after the text arrives), the answer (Urdu in Nastaliq), an English translation when it's in another language, the law sources, and "Was this helpful?". In voice mode the newest voice answer plays by itself.
- **Rate limits.** When few live questions remain the chat says so (`X-Demo-Remaining`); at a limit it shows the server's message ("try again in 25 minutes") and offers the guided demo, which costs nothing. "Try again" only appears for waits of a minute or less.
- **Voice notes (live chat).** The mic records a WhatsApp-style voice note (`use-voice-note.ts`), converts it to 16 kHz WAV in the browser (`lib/demo/wav.ts`) and sends it to `POST /demo/voice`. The bubble shows the recording and what Haqdar heard; the answer comes back as text in the language spoken. Silent recordings are caught before upload.
- **Voice first.** The chat opens by asking "Talk with voice" or "Type instead". Voice uses the browser's Web Speech API (`src/components/demo/use-speech.ts`): it listens in Urdu or English (Chrome, Edge, Safari) and reads Haqdar's replies aloud, with a mute button. No audio reaches Haqdar's servers. Browsers without speech recognition still get read-aloud and can tap or type.
- **Contract upload.** The paperclip sends a photo (JPG, PNG, WebP, HEIC) or a PDF, up to 10 MB, to `POST /demo/contract`, which runs the real contract reader and legal checks and saves nothing. The reply lists the contract's key terms and anything that breaks the labour law, with the article. It needs `GEMINI_API_KEY` on the backend; without it the chat says contract reading isn't available.

The backend's `CORS_ORIGINS` must include this site's origin (it is `http://localhost:3001` in development).

## Admin portal

| Route | Screen |
|---|---|
| `/admin` | Overview: KPIs, journey funnel, answer quality, issues by type, review queue |
| `/admin/conversations` | Review queue with filters, timeline of what the agent did, transcript, flag answer, mark reviewed |
| `/admin/knowledge` | Law sources: add, edit, verify, delete; calculator rules |
| `/admin/accuracy` | Reviewer-flagged answers and release quality against the 90% target |

How it works:

- **Auth.** Signing in checks the key against the backend, then stores it in an `httpOnly`, `sameSite=strict` cookie scoped to `/admin`; browser JavaScript never sees it. `src/proxy.ts` sends visitors without a session to the login page.
- **Data.** Pages are Server Components that call the API server-side (`src/lib/admin/api.ts`, never cached), each section behind its own `<Suspense>` boundary. A failing section shows an error in place instead of breaking the page.
- **Changes.** Mutations are Server Actions (`src/app/admin/actions.ts`) that re-check the session through the API, validate input, and `refresh()` the page.
- **Filters** live in the URL (`?status=…&id=…`), so any view can be linked to.

Not built yet: the 30-question legal test-set runner (the Accuracy screen says so), and per-user admin accounts (one shared key for now).
