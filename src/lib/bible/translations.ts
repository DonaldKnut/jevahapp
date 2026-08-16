import type { BibleTranslation } from "../../types/bible";

/** Hide licensed chips until the catalog says full text actually exists. */
export function isReadableTranslation(t: BibleTranslation) {
  const license = String(t.license || "").toLowerCase();
  if (license === "licensed") return Number(t.verseCount || 0) > 0;
  return true;
}
