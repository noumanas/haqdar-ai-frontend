"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Height of the sticky header, so anchor links land below it. */
const HEADER_OFFSET = -88;

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * and Lenis always read the same scroll position on the same frame.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // Lenis is created asynchronously, so read the ref on every tick.
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        anchors: { offset: HEADER_OFFSET },
        stopInertiaOnNavigate: true,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

/** Tells ScrollTrigger about every Lenis scroll frame. */
function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}
