"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Voice for the demo, done in the browser: the Web Speech API listens (Chrome, Edge, Safari)
 * and speech synthesis reads replies aloud. No audio is sent to Haqdar's servers.
 */

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

// Browser support never changes during a visit; the server snapshot keeps hydration stable.
const noSubscription = () => () => {};
export const useBrowserCheck = (check: () => boolean) =>
  useSyncExternalStore(noSubscription, check, () => false);

export type VoiceLanguage = "ur-PK" | "en-US";

const RECOGNITION_ERRORS: Record<string, string> = {
  "not-allowed": "Allow the microphone in your browser to talk to Haqdar.",
  "service-not-allowed":
    "Allow the microphone in your browser to talk to Haqdar.",
  "no-speech": "I didn't hear anything. Tap the mic and try again.",
  "audio-capture": "No microphone was found.",
  network: "Voice needs an internet connection. Try again, or type instead.",
  "language-not-supported":
    "Your browser can't listen in this language. Try English, or type instead.",
};

/** Listens once: interim words show while speaking, and `onHeard` gets the final sentence. */
export function useVoiceInput(
  language: VoiceLanguage,
  onHeard: (text: string) => void,
) {
  const supported = useBrowserCheck(() => recognitionConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const heard = useRef(onHeard);

  useEffect(() => {
    heard.current = onHeard;
  });
  useEffect(() => () => recognition.current?.abort(), []);

  function start() {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    recognition.current?.abort();

    const session = new Constructor();
    session.lang = language;
    session.interimResults = true;
    session.continuous = false;
    session.maxAlternatives = 1;

    let finalText = "";
    session.onresult = (event) => {
      let pending = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else pending += result[0].transcript;
      }
      setInterim(`${finalText}${pending}`);
    };
    session.onerror = (event) => {
      if (event.error !== "aborted")
        setError(
          RECOGNITION_ERRORS[event.error] ??
            "Voice stopped. Try again, or type instead.",
        );
    };
    session.onend = () => {
      recognition.current = null;
      setListening(false);
      setInterim("");
      const text = finalText.trim();
      if (text) heard.current(text);
    };

    recognition.current = session;
    setError(null);
    setListening(true);
    session.start();
  }

  return {
    supported,
    listening,
    interim,
    error,
    start,
    /** Stops listening; whatever was heard so far is sent. */
    stop: () => recognition.current?.stop(),
  };
}

export type SpokenPart = { text: string; lang: "en" | "ur" };

/** Reads text aloud. Urdu is read only when the device has an Urdu voice. */
export function useReadAloud() {
  const supported = useBrowserCheck(() => "speechSynthesis" in window);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function speak(parts: SpokenPart[]) {
    if (!supported) return;
    // Speech engines differ a lot between browsers; reading aloud is a nice-to-have, so a
    // failure here must never break the chat.
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const voices = synth.getVoices();
      for (const part of parts) {
        const voice = voices.find((candidate) =>
          candidate.lang.toLowerCase().startsWith(part.lang),
        );
        if (!voice && part.lang === "ur") continue;
        const utterance = new SpeechSynthesisUtterance(part.text);
        utterance.lang = voice?.lang ?? "en-US";
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
        synth.speak(utterance);
      }
    } catch {
      // Stay silent; the replies are on screen.
    }
  }

  return {
    supported,
    speak,
    cancel: () => {
      if (supported) window.speechSynthesis.cancel();
    },
  };
}
