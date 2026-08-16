const KEY = "jevah-bible-translation";
const LAST_KEY = "jevah-bible-last";

export function readStoredTranslation(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? v.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function writeStoredTranslation(id: string) {
  try {
    localStorage.setItem(KEY, id.toLowerCase());
  } catch {
    /* ignore */
  }
}

export type BibleResume = {
  book: string;
  chapter: number;
  translation?: string | null;
};

export function readResume(): BibleResume | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BibleResume;
    if (!parsed.book || !parsed.chapter) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeResume(next: BibleResume) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function bookPath(book: string) {
  return encodeURIComponent(book);
}

export function readerHref(
  book: string,
  chapter: number,
  opts?: { verse?: number; translation?: string | null }
) {
  const versePart = opts?.verse ? `/${opts.verse}` : "";
  const base = `/bible/${bookPath(book)}/${chapter}${versePart}`;
  const q = new URLSearchParams();
  if (opts?.translation) q.set("translation", opts.translation);
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

export function bibleHomeHref(translation?: string | null) {
  return withTranslation("/bible", translation || null);
}

export function bibleSearchHref(
  translation?: string | null,
  extra?: Record<string, string | undefined>
) {
  const q = new URLSearchParams();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) q.set(k, v);
    }
  }
  if (translation) q.set("translation", translation);
  const qs = q.toString();
  return qs ? `/bible/search?${qs}` : "/bible/search";
}

export function biblePlansHref(translation?: string | null, planId?: string) {
  const base = planId
    ? `/bible/plans/${encodeURIComponent(planId)}`
    : "/bible/plans";
  return withTranslation(base, translation || null);
}

export function rangeRef(
  book: string,
  chapter: number,
  from: number,
  to: number
) {
  if (from === to) return `${book} ${chapter}:${from}`;
  const a = Math.min(from, to);
  const b = Math.max(from, to);
  return `${book} ${chapter}:${a}-${b}`;
}

export type BibleFontSize = "sm" | "md" | "lg";
const FONT_KEY = "jevah-bible-font";

export function readFontSize(): BibleFontSize {
  try {
    const v = localStorage.getItem(FONT_KEY);
    if (v === "sm" || v === "md" || v === "lg") return v;
  } catch {
    /* ignore */
  }
  return "md";
}

export function writeFontSize(size: BibleFontSize) {
  try {
    localStorage.setItem(FONT_KEY, size);
  } catch {
    /* ignore */
  }
}

export function translationQuery(id: string | null) {
  return id ? `?translation=${encodeURIComponent(id)}` : "";
}

export function withTranslation(
  path: string,
  id: string | null
) {
  if (!id) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}translation=${encodeURIComponent(id)}`;
}

export function verseRef(book: string, chapter: number, verse?: number) {
  return verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
}
