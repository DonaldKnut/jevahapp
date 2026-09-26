const KEY = "jevah.bible.translation";
const LEGACY_KEY = "jevah-bible-translation";
const LAST_KEY = "jevah-bible-last";

export function readStoredTranslation(): string | null {
  try {
    const v = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    return v ? v.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function writeStoredTranslation(id: string) {
  try {
    const lower = id.toLowerCase();
    localStorage.setItem(KEY, lower);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export type BibleResume = {
  book: string;
  chapter: number;
  verse?: number;
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
  const base = `/bible/${bookPath(book)}/${chapter}`;
  const q = new URLSearchParams();
  if (opts?.verse) q.set("verse", String(opts.verse));
  if (opts?.translation) q.set("translation", opts.translation.toLowerCase());
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

export function compareHref(
  book: string,
  chapter: number,
  opts?: {
    verse?: number;
    left?: string | null;
    right?: string | null;
  }
) {
  const base = `/bible/compare/${bookPath(book)}/${chapter}`;
  const q = new URLSearchParams();
  if (opts?.left) q.set("left", opts.left.toLowerCase());
  if (opts?.right) q.set("translation", opts.right.toLowerCase());
  if (opts?.verse) q.set("verse", String(opts.verse));
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
  if (translation) q.set("translation", translation.toLowerCase());
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

export const BIBLE_ZOOMS = [
  10, 20, 30, 45, 60, 75, 90, 100, 115, 130, 150, 175,
] as const;
export type BibleFontSize = (typeof BIBLE_ZOOMS)[number];
const FONT_KEY = "jevah-bible-font";

function nearestZoom(n: number): BibleFontSize {
  let best: BibleFontSize = 100;
  let dist = Infinity;
  for (const z of BIBLE_ZOOMS) {
    const d = Math.abs(z - n);
    if (d < dist) {
      dist = d;
      best = z;
    }
  }
  return best;
}

function asZoom(value: unknown): BibleFontSize | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return (BIBLE_ZOOMS as readonly number[]).includes(n)
    ? (n as BibleFontSize)
    : nearestZoom(n);
}

export function readFontSize(): BibleFontSize {
  try {
    const v = localStorage.getItem(FONT_KEY);
    if (v === "sm") return 90;
    if (v === "md") return 100;
    if (v === "lg") return 130;
    return asZoom(v) ?? 100;
  } catch {
    return 100;
  }
}

export function writeFontSize(size: BibleFontSize) {
  try {
    localStorage.setItem(FONT_KEY, String(size));
  } catch {
    /* ignore */
  }
}

export function bumpBibleZoom(current: BibleFontSize, dir: -1 | 1): BibleFontSize {
  const i = BIBLE_ZOOMS.indexOf(current);
  const next = Math.min(BIBLE_ZOOMS.length - 1, Math.max(0, (i < 0 ? 2 : i) + dir));
  return BIBLE_ZOOMS[next];
}

/** `?translation=` plus optional `?v=` corpus fingerprint for CDN cache. */
export function scriptureQuery(
  translation: string | null,
  corpusVersion?: string | null
) {
  const q = new URLSearchParams();
  if (translation) q.set("translation", translation.toLowerCase());
  if (corpusVersion) q.set("v", corpusVersion);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function withTranslation(
  path: string,
  id: string | null,
  corpusVersion?: string | null
) {
  const extra = new URLSearchParams();
  if (id) extra.set("translation", id.toLowerCase());
  if (corpusVersion) extra.set("v", corpusVersion);
  const qs = extra.toString();
  if (!qs) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}${qs}`;
}

export function verseRef(book: string, chapter: number, verse?: number) {
  return verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
}

export function formatVerseCopy(
  ref: string,
  abbreviation: string,
  text: string
) {
  return `${ref} (${abbreviation})\n${text}`;
}

export function bookChapterCount(book: {
  chapters?: number;
  chapterCount?: number;
}) {
  return Number(book.chapterCount || book.chapters || 0);
}
