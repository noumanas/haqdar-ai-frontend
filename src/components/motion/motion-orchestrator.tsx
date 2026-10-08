"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

import { EASE, gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Drives every animation on the page from one place, using data attributes
 * so the sections themselves stay server components:
 *
 * - `data-loader*`        intro loader (see PageLoader)
 * - `data-hero-*`         hero entrance, played when the loader leaves
 * - `data-header`         sticky header hides on scroll down, returns on scroll up
 * - `data-reveal`         fades and lifts in when scrolled into view (batched)
 * - `data-split`          heading lines slide up through a mask
 * - `data-parallax="n"`   drifts by n × its height while scrolling past
 * - `data-draw`           line grows from the left as its list scrolls in
 */
export function MotionOrchestrator() {
  const lenisRef = useRef<Lenis | undefined>(undefined);
  const loadingRef = useRef(true);

  // Lenis is created after this component mounts, so pick it up when ready.
  const lenis = useLenis();
  useEffect(() => {
    lenisRef.current = lenis;
    if (lenis && loadingRef.current) lenis.stop();
  }, [lenis]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, (_context, contextSafe) => {
      const loader = buildLoader();

      const finishLoading = contextSafe!(() => {
        loadingRef.current = false;
        lenisRef.current?.start();
        playHeroIntro();
        hideLoader(loader);
        ScrollTrigger.refresh();
      });

      // Wait for both the loader's count-up and the web fonts, so text is
      // split into lines with its final metrics.
      let active = true;
      Promise.all([loader.then(), document.fonts.ready]).then(() => active && finishLoading());

      setupHeader();
      setupReveals();
      setupSplitHeadings();
      setupParallax();
      setupDraws();

      // Ignore a late fonts promise if this context was reverted (e.g. Strict Mode remount).
      return () => {
        active = false;
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      loadingRef.current = false;
      lenisRef.current?.start();
      markLoaderDone();
    });

    return () => mm.revert();
  });

  return null;
}

function buildLoader() {
  const countEl = document.querySelector<HTMLElement>("[data-loader-count]");
  const counter = { value: 0 };

  return gsap
    .timeline()
    .from("[data-loader-brand]", { autoAlpha: 0, y: 24, duration: 0.7, ease: EASE.out })
    .to("[data-loader-bar]", { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0.15)
    .to(
      counter,
      {
        value: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (countEl) countEl.textContent = `${Math.round(counter.value)}%`;
        },
      },
      "<",
    );
}

function hideLoader(loader: gsap.core.Timeline) {
  gsap
    .timeline()
    .to("[data-loader-brand], [data-loader-bar]", { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" })
    .to("[data-loader]", { yPercent: -100, duration: 0.9, ease: EASE.inOut }, "-=0.1")
    .set("[data-loader]", { autoAlpha: 0 })
    .call(() => {
      markLoaderDone();
      loader.kill();
    });
}

/** Flips the flag the CSS scroll lock in globals.css listens to. */
function markLoaderDone() {
  const el = document.querySelector<HTMLElement>("[data-loader]");
  if (el) el.dataset.state = "done";
}

/** Runs as the loader lifts away; fonts are loaded, so line breaks are final. */
function playHeroIntro() {
  const title = document.querySelector("[data-hero-title]");
  const split = title ? SplitText.create(title, { type: "lines", mask: "lines" }) : null;

  gsap
    .timeline({
      defaults: { ease: EASE.out },
      // Restore the plain heading so it reflows naturally on resize.
      onComplete: () => split?.revert(),
    })
    .from("[data-hero-panel]", { autoAlpha: 0, scale: 0.9, duration: 1.3, ease: EASE.expo }, 0.15)
    .from(split?.lines ?? [], { yPercent: 110, duration: 1.1, ease: EASE.expo, stagger: 0.1 }, 0.2)
    .from("[data-hero-item]", { autoAlpha: 0, y: 28, duration: 0.8, stagger: 0.08 }, 0.45)
    .from("[data-hero-phone]", { autoAlpha: 0, y: 140, rotate: -4, duration: 1.4, ease: EASE.expo }, 0.3)
    // Floating cards run a CSS float loop on `transform`, so only fade them.
    .from("[data-hero-float]", { autoAlpha: 0, duration: 0.6, stagger: 0.2 }, 1);
}

function setupHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  const show = gsap
    .from(header, { yPercent: -100, duration: 0.35, ease: "power2.out", paused: true })
    .progress(1);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const scrolled = self.scroll() > 8;
      if (header.dataset.scrolled !== String(scrolled)) header.dataset.scrolled = String(scrolled);

      if (self.scroll() < 160 || self.direction === -1) show.play();
      else show.reverse();
    },
  });
}

function setupReveals() {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  gsap.set(items, { autoAlpha: 0, y: 48 });

  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: EASE.out,
        stagger: 0.08,
        overwrite: true,
        clearProps: "transform",
      }),
  });
}

function setupSplitHeadings() {
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
    SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (split) =>
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1,
          ease: EASE.expo,
          stagger: 0.08,
          scrollTrigger: { trigger: heading, start: "top 88%", once: true },
        }),
    });
  });
}

function setupParallax() {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const speed = Number(el.dataset.parallax) || 0.1;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

function setupDraws() {
  const lines = gsap.utils.toArray<HTMLElement>("[data-draw]");
  if (!lines.length) return;

  gsap.from(lines, {
    scaleX: 0,
    transformOrigin: "left center",
    ease: "none",
    stagger: 0.25,
    scrollTrigger: { trigger: lines[0].closest("ol") ?? lines[0], start: "top 85%", end: "top 45%", scrub: true },
  });
}
