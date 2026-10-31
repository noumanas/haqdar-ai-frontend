/** Arabic-script text reads right to left; English left to right. */
const ARABIC_SCRIPT = /[؀-ۿ]/;
/** Letters Urdu uses and Arabic does not, to tag the right language for screen readers. */
const URDU_LETTERS = /[ٹڈڑںھہے]/;

/** The language to tag Arabic-script text with, or undefined for any other script. */
export function scriptLang(text: string): "ar" | "ur" | undefined {
  if (!ARABIC_SCRIPT.test(text)) return undefined;
  return URDU_LETTERS.test(text) ? "ur" : "ar";
}
