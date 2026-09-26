import { ApiError } from "../api";
import type { BibleTranslation } from "../../types/bible";

const VOICES: Record<string, string> = {
  web: "Clear modern English. Our default.",
  bsb: "Contemporary, close to today’s study Bibles.",
  kjv: "The classic English many churches still read.",
  asv: "Formal, word-for-word.",
  ylt: "Extremely literal. Best beside another version.",
  darby: "19th-century formal English.",
  drb: "Historic Catholic English.",
};

/** Full text only: public-domain / permissive rows with a real corpus. */
export function isReadableTranslation(t: BibleTranslation) {
  const license = String(t.license || "").toLowerCase();
  const verses = Number(t.verseCount ?? t.count ?? 0);
  return license !== "licensed" && verses > 0;
}

export function normalizeTranslation(raw: BibleTranslation): BibleTranslation {
  const id = String(raw.id || raw.code || "").toLowerCase();
  const verseCount = Number(raw.verseCount ?? raw.count ?? 0);
  return {
    ...raw,
    id,
    abbreviation: String(raw.abbreviation || raw.code || id).toUpperCase(),
    name: raw.name || raw.abbreviation || id,
    verseCount,
    corpusVersion: raw.corpusVersion || null,
    isDefault: Boolean(raw.isDefault),
  };
}

export function sortTranslations(
  list: BibleTranslation[],
  defaultId: string
) {
  const def = defaultId.toLowerCase();
  return [...list].sort((a, b) => {
    const aDef = a.isDefault || a.id === def;
    const bDef = b.isDefault || b.id === def;
    if (aDef !== bDef) return aDef ? -1 : 1;
    return (a.abbreviation || a.id).localeCompare(b.abbreviation || b.id);
  });
}

export function translationVoice(id: string | null | undefined) {
  if (!id) return "Public-domain English.";
  return VOICES[id.toLowerCase()] || "Public-domain English.";
}

export function isUnknownTranslationError(err: unknown) {
  if (!(err instanceof ApiError)) return false;
  if (err.body?.code === "UNKNOWN_TRANSLATION") return true;
  const blob = `${err.message} ${err.body?.error || ""} ${err.body?.message || ""}`;
  return /unknown translation/i.test(blob);
}
