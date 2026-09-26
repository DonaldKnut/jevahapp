import type { BibleBook } from "../../types/bible";
import { bookChapterCount } from "./paths";

export type JumpTarget = {
  book: string;
  chapter: number;
  verse?: number;
  label: string;
};

const ALIASES: Record<string, string> = {
  gen: "Genesis",
  gn: "Genesis",
  exo: "Exodus",
  ex: "Exodus",
  lev: "Leviticus",
  num: "Numbers",
  nm: "Numbers",
  deut: "Deuteronomy",
  dt: "Deuteronomy",
  josh: "Joshua",
  jud: "Judges",
  jdg: "Judges",
  ruth: "Ruth",
  ezr: "Ezra",
  neh: "Nehemiah",
  est: "Esther",
  job: "Job",
  ps: "Psalms",
  psa: "Psalms",
  psalm: "Psalms",
  psalms: "Psalms",
  prov: "Proverbs",
  pr: "Proverbs",
  ecc: "Ecclesiastes",
  eccl: "Ecclesiastes",
  song: "Song of Solomon",
  sos: "Song of Solomon",
  ss: "Song of Solomon",
  canticles: "Song of Solomon",
  isa: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  eze: "Ezekiel",
  ezek: "Ezekiel",
  dan: "Daniel",
  hos: "Hosea",
  joe: "Joel",
  amo: "Amos",
  oba: "Obadiah",
  jon: "Jonah",
  mic: "Micah",
  nah: "Nahum",
  hab: "Habakkuk",
  zep: "Zephaniah",
  hag: "Haggai",
  zec: "Zechariah",
  mal: "Malachi",
  mt: "Matthew",
  matt: "Matthew",
  mk: "Mark",
  mrk: "Mark",
  lk: "Luke",
  luk: "Luke",
  jn: "John",
  joh: "John",
  act: "Acts",
  rom: "Romans",
  gal: "Galatians",
  eph: "Ephesians",
  php: "Philippians",
  phil: "Philippians",
  col: "Colossians",
  tit: "Titus",
  phm: "Philemon",
  heb: "Hebrews",
  jas: "James",
  jam: "James",
  rev: "Revelation",
  "1sa": "1 Samuel",
  "2sa": "2 Samuel",
  "1ki": "1 Kings",
  "2ki": "2 Kings",
  "1ch": "1 Chronicles",
  "2ch": "2 Chronicles",
  "1co": "1 Corinthians",
  "2co": "2 Corinthians",
  "1th": "1 Thessalonians",
  "2th": "2 Thessalonians",
  "1ti": "1 Timothy",
  "2ti": "2 Timothy",
  "1pe": "1 Peter",
  "2pe": "2 Peter",
  "1jn": "1 John",
  "2jn": "2 John",
  "3jn": "3 John",
};

function key(s: string) {
  return s.toLowerCase().replace(/[.\u2019']/g, "").replace(/\s+/g, " ").trim();
}

function compact(s: string) {
  return key(s).replace(/\s+/g, "");
}

function ordinalBook(raw: string) {
  return key(raw)
    .replace(/^(first|1st|i)\s+/, "1 ")
    .replace(/^(second|2nd|ii)\s+/, "2 ")
    .replace(/^(third|3rd|iii)\s+/, "3 ");
}

export function matchBook(raw: string, books: BibleBook[]): BibleBook | null {
  const q = ordinalBook(raw);
  if (!q) return null;
  const alias = ALIASES[compact(q)] || ALIASES[q];
  if (alias) {
    const hit = books.find((b) => key(b.name) === key(alias));
    if (hit) return hit;
  }
  const exact = books.find((b) => key(b.name) === q);
  if (exact) return exact;
  const starts = books.filter(
    (b) => key(b.name).startsWith(q) || compact(b.name).startsWith(compact(q))
  );
  if (starts.length === 1) return starts[0];
  const abbr = books.find(
    (b) => b.abbreviation && compact(b.abbreviation) === compact(q)
  );
  return abbr || null;
}

export function parseJumpQuery(
  raw: string,
  books: BibleBook[],
  currentBook: string,
  currentChapter: number
): JumpTarget | null {
  const q = ordinalBook(raw);
  if (!q) return null;

  const verseOnly = q.match(/^(\d{1,3})$/);
  if (verseOnly && currentBook) {
    const verse = Number(verseOnly[1]);
    return {
      book: currentBook,
      chapter: currentChapter,
      verse,
      label: `${currentBook} ${currentChapter}:${verse}`,
    };
  }

  const chVerse = q.match(/^(\d{1,3}):(\d{1,3})$/);
  if (chVerse && currentBook) {
    const chapter = Number(chVerse[1]);
    const verse = Number(chVerse[2]);
    return {
      book: currentBook,
      chapter,
      verse,
      label: `${currentBook} ${chapter}:${verse}`,
    };
  }

  const ref = q.match(
    /^(.+?)\s+(\d{1,3})(?::(\d{1,3})(?:-\d{1,3})?)?$/
  );
  if (ref) {
    const book = matchBook(ref[1], books);
    if (book) {
      const max = bookChapterCount(book) || 999;
      const chapter = Math.min(Math.max(1, Number(ref[2])), max);
      const verse = ref[3] ? Number(ref[3]) : undefined;
      return {
        book: book.name,
        chapter,
        verse,
        label: verse
          ? `${book.name} ${chapter}:${verse}`
          : `${book.name} ${chapter}`,
      };
    }
  }

  const book = matchBook(q, books);
  if (book) {
    return {
      book: book.name,
      chapter: 1,
      label: book.name,
    };
  }

  return null;
}

export function suggestBooks(raw: string, books: BibleBook[], limit = 6) {
  const q = ordinalBook(raw);
  if (!q) return books.slice(0, limit);
  const scored = books
    .map((b) => {
      const n = key(b.name);
      const c = compact(b.name);
      const qc = compact(q);
      let score = 0;
      if (n === q) score = 100;
      else if (n.startsWith(q) || c.startsWith(qc)) score = 80;
      else if (n.includes(q)) score = 40;
      return { b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.b);
}
