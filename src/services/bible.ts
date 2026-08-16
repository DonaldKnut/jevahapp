import { apiRequest, ApiError } from "../lib/api";
import { listFromUnknown, unwrapData } from "../lib/api/unwrap";
import { bibleCached } from "../lib/bible/cache";
import { translationQuery, withTranslation } from "../lib/bible/paths";
import type {
  BibleBook,
  BibleCatalog,
  BibleCommentary,
  BibleCrossRef,
  BibleDailyVerse,
  BibleFact,
  BibleReadingPlan,
  BibleSearchHit,
  BibleStats,
  BibleTranslation,
  BibleVerse,
} from "../types/bible";

const publicGet = <T>(path: string) => apiRequest<T>(path, { auth: false });

function asVerse(raw: unknown): BibleVerse | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown> & Partial<BibleVerse>;
  const nested =
    v.verse && typeof v.verse === "object"
      ? (v.verse as Partial<BibleVerse>)
      : v;
  const bookName = String(nested.bookName || v.bookName || "");
  const text = String(nested.text || v.text || "");
  const chapterNumber = Number(nested.chapterNumber ?? v.chapterNumber ?? 0);
  const verseNumber = Number(nested.verseNumber ?? v.verseNumber ?? 0);
  if (!bookName && !text) return null;
  return {
    bookName,
    chapterNumber,
    verseNumber,
    text,
    translation: nested.translation || v.translation,
    _id: nested._id || v._id,
  };
}

export async function fetchBibleCatalog(): Promise<BibleCatalog | null> {
  try {
    return await bibleCached("catalog", async () => {
      const res = await publicGet<{ data?: BibleCatalog } | BibleCatalog>(
        "/bible/translations"
      );
      const data = unwrapData(res) as BibleCatalog & {
        translations?: BibleTranslation[];
      };
      if (!data || typeof data !== "object" || Array.isArray(data)) return null;
      const translations = Array.isArray(data.translations)
        ? data.translations
        : [];
      return {
        defaultId: (data.defaultId || translations.find((t) => t.isDefault)?.id || "web").toLowerCase(),
        translations,
      };
    });
  } catch (err) {
    if (err instanceof ApiError) return null;
    return null;
  }
}

export async function fetchBibleBooks(): Promise<BibleBook[]> {
  return bibleCached("books", async () => {
    const res = await publicGet("/bible/books");
    const data = unwrapData(res);
    return listFromUnknown<BibleBook>(data, ["books", "items", "data"]).map(
      (b) => ({
        ...b,
        name: b.name,
        testament: b.testament || "old",
        chapters: Number(b.chapters || 0),
        order: Number(b.order || 0),
      })
    );
  });
}

export async function fetchChapterMeta(
  book: string,
  chapter: number,
  translation: string | null
) {
  const q = translationQuery(translation);
  const res = await publicGet(
    `/bible/books/${encodeURIComponent(book)}/chapters/${chapter}${q}`
  );
  return unwrapData(res) as { actualVerseCount?: number; chapter?: number };
}

export async function fetchChapterVerses(
  book: string,
  chapter: number,
  translation: string | null
): Promise<BibleVerse[]> {
  const key = `verses:${translation || "default"}:${book}:${chapter}`;
  return bibleCached(key, async () => {
    const q = translationQuery(translation);
    const res = await publicGet(
      `/bible/books/${encodeURIComponent(book)}/chapters/${chapter}/verses${q}`
    );
    const data = unwrapData(res);
    const list = listFromUnknown<unknown>(data, ["verses", "items", "data"]);
    return list.map(asVerse).filter(Boolean) as BibleVerse[];
  });
}

export async function fetchDailyVerse(
  translation: string | null
): Promise<BibleVerse | null> {
  const day = new Date().toISOString().slice(0, 10);
  const key = `daily:${translation || "default"}:${day}`;
  return bibleCached(key, async () => {
    const q = translationQuery(translation);
    const res = await publicGet(`/bible/verses/daily${q}`);
    const data = unwrapData(res) as BibleDailyVerse;
    return asVerse(data);
  });
}

export async function fetchPopularVerses(
  translation: string | null,
  limit = 8
): Promise<BibleVerse[]> {
  const key = `popular:${translation || "default"}:${limit}`;
  return bibleCached(key, async () => {
    const path = withTranslation(
      `/bible/verses/popular?limit=${limit}`,
      translation
    );
    const res = await publicGet(path);
    const data = unwrapData(res);
    return listFromUnknown<unknown>(data, ["verses", "items", "data"])
      .map(asVerse)
      .filter(Boolean) as BibleVerse[];
  });
}

export async function fetchBibleStats(): Promise<BibleStats | null> {
  try {
    return await bibleCached("stats", async () => {
      const res = await publicGet("/bible/stats");
      return unwrapData(res) as BibleStats;
    });
  } catch {
    return null;
  }
}

export async function searchBible(opts: {
  q: string;
  translation: string | null;
  book?: string;
  testament?: string;
  limit?: number;
  offset?: number;
}): Promise<BibleVerse[]> {
  const q = new URLSearchParams();
  q.set("q", opts.q);
  if (opts.translation) q.set("translation", opts.translation);
  if (opts.book) q.set("book", opts.book);
  if (opts.testament) q.set("testament", opts.testament);
  q.set("limit", String(opts.limit ?? 50));
  q.set("offset", String(opts.offset ?? 0));
  const res = await publicGet(`/bible/search?${q.toString()}`);
  const data = unwrapData(res);
  const hits = listFromUnknown<BibleSearchHit | BibleVerse>(data, [
    "results",
    "hits",
    "verses",
    "items",
    "data",
  ]);
  return hits.map(asVerse).filter(Boolean) as BibleVerse[];
}

export async function fetchReadingPlans(): Promise<BibleReadingPlan[]> {
  try {
    return await bibleCached("plans", async () => {
      const res = await publicGet("/bible/reading-plans");
      const data = unwrapData(res);
      return listFromUnknown<BibleReadingPlan>(data, ["plans", "items", "data"]);
    });
  } catch {
    return [];
  }
}

export async function fetchDailyFact(): Promise<string | null> {
  try {
    return await bibleCached("fact-daily", async () => {
      const res = await publicGet("/bible-facts/daily");
      const data = unwrapData(res) as BibleFact | string;
      if (typeof data === "string") return data;
      return data.text || data.body || data.fact || data.title || null;
    });
  } catch {
    return null;
  }
}

export async function fetchRandomFact(): Promise<string | null> {
  try {
    const res = await publicGet("/bible-facts/random");
    const data = unwrapData(res) as BibleFact | string;
    if (typeof data === "string") return data;
    return data?.text || data?.body || data?.fact || data?.title || null;
  } catch {
    return null;
  }
}

export async function fetchRandomVerse(
  translation: string | null
): Promise<BibleVerse | null> {
  const q = translationQuery(translation);
  const res = await publicGet(`/bible/verses/random${q}`);
  const data = unwrapData(res);
  return asVerse(data);
}

function encodeRangeRef(ref: string) {
  return encodeURIComponent(ref).replace(/%3A/gi, ":");
}

export async function fetchVerseRange(
  reference: string,
  translation: string | null
): Promise<BibleVerse[]> {
  const q = translationQuery(translation);
  const res = await publicGet(
    `/bible/verses/range/${encodeRangeRef(reference)}${q}`
  );
  const data = unwrapData(res);
  const list = listFromUnknown<unknown>(data, ["verses", "items", "data"])
    .map(asVerse)
    .filter(Boolean) as BibleVerse[];
  if (list.length) return list;
  if (data && typeof data === "object") {
    const text = String((data as { text?: string }).text || "");
    if (text) {
      return [{ bookName: "", chapterNumber: 0, verseNumber: 0, text }];
    }
  }
  return [];
}

function asCommentary(raw: unknown): BibleCommentary {
  if (!raw) return { text: null };
  if (typeof raw === "string") return { text: raw };
  if (Array.isArray(raw)) {
    const bits = raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          return String(o.text || o.body || o.commentary || o.content || "");
        }
        return "";
      })
      .filter(Boolean);
    return { text: bits.join("\n\n") || null };
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const nested = o.commentary ?? o.data ?? o;
    if (nested && nested !== o) return asCommentary(nested);
    const text = String(
      o.text || o.body || o.commentary || o.content || o.note || ""
    );
    return {
      text: text || null,
      source: o.source ? String(o.source) : null,
      title: o.title ? String(o.title) : null,
    };
  }
  return { text: null };
}

export async function fetchVerseCommentary(
  book: string,
  chapter: number,
  verse: number,
  translation: string | null
): Promise<BibleCommentary> {
  try {
    const path = withTranslation(
      `/bible/books/${encodeURIComponent(book)}/chapters/${chapter}/verses/${verse}/commentary`,
      translation
    );
    const res = await publicGet(path);
    return asCommentary(unwrapData(res));
  } catch {
    return { text: null };
  }
}

function parseLooseRef(raw: string): BibleCrossRef | null {
  const m = raw.trim().match(/^(.+?)\s+(\d+):(\d+)\s*$/);
  if (!m) return null;
  return {
    bookName: m[1],
    chapterNumber: Number(m[2]),
    verseNumber: Number(m[3]),
    reference: raw.trim(),
  };
}

function asCrossRef(raw: unknown): BibleCrossRef | null {
  if (!raw) return null;
  if (typeof raw === "string") return parseLooseRef(raw);
  if (typeof raw !== "object") return null;
  const v = asVerse(raw);
  if (v?.bookName && v.chapterNumber && v.verseNumber) {
    return {
      bookName: v.bookName,
      chapterNumber: v.chapterNumber,
      verseNumber: v.verseNumber,
      text: v.text,
      reference: `${v.bookName} ${v.chapterNumber}:${v.verseNumber}`,
    };
  }
  const o = raw as Record<string, unknown>;
  const ref = String(o.reference || o.ref || o.passage || "");
  if (ref) {
    const parsed = parseLooseRef(ref);
    if (parsed) {
      parsed.text = o.text ? String(o.text) : parsed.text;
      return parsed;
    }
  }
  return null;
}

export async function fetchCrossReferences(
  book: string,
  chapter: number,
  verse: number,
  translation: string | null
): Promise<BibleCrossRef[]> {
  try {
    const path = withTranslation(
      `/bible/books/${encodeURIComponent(book)}/chapters/${chapter}/verses/${verse}/cross-references`,
      translation
    );
    const res = await publicGet(path);
    const data = unwrapData(res);
    return listFromUnknown<unknown>(data, [
      "crossReferences",
      "references",
      "verses",
      "items",
      "data",
    ])
      .map(asCrossRef)
      .filter(Boolean) as BibleCrossRef[];
  } catch {
    return [];
  }
}
