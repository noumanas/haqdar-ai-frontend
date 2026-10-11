"use client";

import { useEffect, useRef, useState } from "react";

import { SILENCE_RMS, toWav } from "@/lib/demo/wav";

import { useBrowserCheck } from "./use-speech";

/** Long enough for a real question, short enough to stay under the server's 4 MB limit. */
export const VOICE_NOTE_MAX_SECONDS = 60;
const MIN_SECONDS = 0.6;

const MIC_ERRORS: Record<string, string> = {
  NotAllowedError: "Allow the microphone in your browser to send a voice note.",
  SecurityError: "Allow the microphone in your browser to send a voice note.",
  NotFoundError: "No microphone was found.",
  NotReadableError: "The microphone is busy in another app.",
};

export type VoiceNoteState = "idle" | "recording" | "preparing";

/**
 * Records a WhatsApp-style voice note: tap to start, tap to send, or cancel. The audio
 * stays in the browser until it is sent, and the microphone is released as soon as it stops.
 */
export function useVoiceNote(onRecorded: (wav: Blob, seconds: number) => void) {
  const supported = useBrowserCheck(
    () =>
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== "undefined",
  );
  const [state, setState] = useState<VoiceNoteState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const cancelled = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorded = useRef(onRecorded);

  useEffect(() => {
    recorded.current = onRecorded;
  });
  useEffect(
    () => () => {
      cancelled.current = true;
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
    [],
  );

  async function start() {
    if (state !== "idle") return;
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (failure) {
      const name = failure instanceof DOMException ? failure.name : "";
      setError(
        MIC_ERRORS[name] ??
          "The microphone could not start. Try again, or type instead.",
      );
      return;
    }

    const session = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    cancelled.current = false;

    session.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    session.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      if (timer.current) clearInterval(timer.current);
      recorder.current = null;

      const elapsed = (Date.now() - startedAt) / 1000;
      if (cancelled.current) return setState("idle");
      if (elapsed < MIN_SECONDS) {
        setState("idle");
        return setError(
          "That was too short. Tap the mic, speak, then tap again to send.",
        );
      }

      setState("preparing");
      try {
        const { wav, rms } = await toWav(
          new Blob(chunks, { type: session.mimeType }),
        );
        if (rms < SILENCE_RMS) {
          setError(
            "I couldn't hear anything. Check that your microphone is on and not muted, then try again.",
          );
        } else {
          recorded.current(wav, Math.round(elapsed));
        }
      } catch {
        setError(
          "The recording could not be prepared. Try again, or type instead.",
        );
      } finally {
        setState("idle");
      }
    };

    recorder.current = session;
    session.start();
    setSeconds(0);
    setState("recording");
    timer.current = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setSeconds(Math.floor(elapsed));
      if (elapsed >= VOICE_NOTE_MAX_SECONDS && session.state === "recording")
        session.stop();
    }, 250);
  }

  return {
    supported,
    state,
    seconds,
    error,
    start,
    /** Stops and sends. */
    send: () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
    /** Stops and throws the recording away. */
    cancel: () => {
      cancelled.current = true;
      if (recorder.current?.state === "recording") recorder.current.stop();
    },
  };
}
