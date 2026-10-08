/**
 * Brand surface tones. Every coloured card, chip and dot on the site picks
 * one of these, so the palette lives in exactly one place.
 */
export type Tone = "lime" | "coral" | "peach" | "lilac" | "forest" | "sand" | "white";

export const toneSurface: Record<Tone, string> = {
  lime: "bg-lime text-foreground",
  coral: "bg-coral text-foreground",
  peach: "bg-peach text-foreground",
  lilac: "bg-lilac text-foreground",
  forest: "bg-forest text-white",
  sand: "bg-sand text-foreground",
  white: "bg-white text-foreground",
};

/** Muted body-copy colour that keeps 4.5:1 contrast on each surface. */
export const toneMutedText: Record<Tone, string> = {
  lime: "text-lime-ink",
  coral: "text-ink-soft",
  peach: "text-ink-soft",
  lilac: "text-ink-soft",
  forest: "text-forest-mist",
  sand: "text-muted-foreground",
  white: "text-ink-soft",
};
