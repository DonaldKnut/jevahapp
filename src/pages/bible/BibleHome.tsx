import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BookmarkIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useBible } from "./BibleContext";
import { matchesSearch } from "../../lib/searchMatch";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  fetchBibleStats,
  fetchDailyFact,
  fetchDailyVerse,
  fetchPopularVerses,
  fetchRandomFact,
  fetchRandomVerse,
} from "../../services/bible";
import {
  biblePlansHref,
  bibleSearchHref,
  readerHref,
  readResume,
  verseRef,
} from "../../lib/bible/paths";
import type { BibleBook, BibleVerse } from "../../types/bible";

function getBookCategory(name: string): string {
  const n = name.toLowerCase();
  if (["genesis", "exodus", "leviticus", "numbers", "deuteronomy"].includes(n)) return "Torah / Law";
  if (["joshua", "judges", "ruth", "1 samuel", "2 samuel", "1 kings", "2 kings", "1 chronicles", "2 chronicles", "ezra", "nehemiah", "esther"].includes(n)) return "History";
  if (["job", "psalms", "proverbs", "ecclesiastes", "song of solomon", "song of songs"].includes(n)) return "Poetry & Wisdom";
  if (["isaiah", "jeremiah", "lamentations", "ezekiel", "daniel"].includes(n)) return "Major Prophets";
  if (["hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"].includes(n)) return "Minor Prophets";
  if (["matthew", "mark", "luke", "john"].includes(n)) return "Gospels";
  if (n === "acts") return "Church History";
  if (["romans", "1 corinthians", "2 corinthians", "galatians", "ephesians", "philippians", "colossians", "1 thessalonians", "2 thessalonians", "1 timothy", "2 timothy", "titans", "titus", "philemon", "hebrews", "james", "1 peter", "2 peter", "1 john", "2 john", "3 john", "jude"].includes(n)) return "Epistle";
  if (n === "revelation") return "Prophecy";
  return "Scripture";
}

export default function BibleHome() {
  const { books, booksLoading, translationId, catalogReady, catalogFailed } =
    useBible();
  const [daily, setDaily] = useState<BibleVerse | null>(null);
  const [popular, setPopular] = useState<BibleVerse[]>([]);
  const [random, setRandom] = useState<BibleVerse | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [statsLine, setStatsLine] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [testamentFilter, setTestamentFilter] = useState<"all" | "old" | "new">("all");
  const [surpriseBusy, setSurpriseBusy] = useState(false);
  const [copiedDaily, setCopiedDaily] = useState(false);
  const resume = readResume();
  const t = catalogFailed ? null : translationId;

  useDocumentMeta({
    title: "Jevah Holy Bible — World English Bible Reader & Study",
    description:
      "Read the Holy Bible on Jevah. Search verses, browse books, explore reading plans, and study Scripture with ease.",
    canonicalPath: translationId ? `/bible?translation=${translationId}` : "/bible",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Jevah Holy Bible",
      description:
        "Free online Bible reader with search, verse of the day, commentaries, and chapter navigation.",
      isPartOf: { "@type": "WebSite", name: "Jevah", url: "https://www.jevahapp.com" },
    },
  });

  useEffect(() => {
    if (!catalogReady) return;
    let alive = true;
    void fetchDailyVerse(t).then((v) => {
      if (alive) setDaily(v);
    });
    void fetchPopularVerses(t, 8).then((v) => {
      if (alive) setPopular(v);
    });
    void fetchDailyFact().then((f) => {
      if (alive) setFact(f);
    });
    void fetchBibleStats().then((s) => {
      if (!alive || !s) return;
      const verses = s.totalVerses?.toLocaleString();
      const booksN = s.totalBooks;
      if (verses || booksN) {
        setStatsLine(
          [booksN ? `${booksN} Books` : null, verses ? `${verses} Verses` : null]
            .filter(Boolean)
            .join(" · ")
        );
      }
    });
    return () => {
      alive = false;
    };
  }, [t, catalogReady]);

  async function surprise() {
    setSurpriseBusy(true);
    try {
      const v = await fetchRandomVerse(t);
      setRandom(v);
    } finally {
      setSurpriseBusy(false);
    }
  }

  async function anotherFact() {
    const f = await fetchRandomFact();
    if (f) setFact(f);
  }

  async function copyVerse(text: string, ref: string) {
    try {
      await navigator.clipboard.writeText(`"${text}" — ${ref}`);
      setCopiedDaily(true);
      setTimeout(() => setCopiedDaily(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const ot = useMemo(
    () =>
      books.filter(
        (b) =>
          b.testament === "old" &&
          matchesSearch(filter, [b.name, b.abbreviation])
      ),
    [books, filter]
  );
  const nt = useMemo(
    () =>
      books.filter(
        (b) =>
          b.testament === "new" &&
          matchesSearch(filter, [b.name, b.abbreviation])
      ),
    [books, filter]
  );

  return (
    <main className="bible-page-enter mx-auto max-w-6xl px-3 pb-24 pt-6 sm:px-6 sm:pt-10">
      {/* Hero Header */}
      <header className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#c4a574]/40 bg-white/70 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#9a7b3c] shadow-sm backdrop-blur-md dark:bg-white/5 dark:text-[#e2c286]">
          <SparklesIcon className="h-3.5 w-3.5 animate-pulse text-[#256e63]" />
          <span>The Word for Every Day</span>
        </div>

        <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-[#1f2a24] dark:text-[#f4ead6] sm:text-6xl">
          Jevah Holy Bible
        </h1>

        <p className="mt-3 text-base leading-relaxed text-[#6b6256] dark:text-[#cbbfa8] sm:text-lg">
          A tranquil reader crafted for quiet meditation, search, and deep study.
          Public-domain World English Bible edition.
        </p>

        {statsLine && (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#9a7b3c] dark:text-[#e2c286]/80">
            {statsLine}
          </p>
        )}
      </header>

      {/* Daily Verse Feature Card */}
      {daily && (
        <blockquote className="bible-quote bible-quote-in relative mx-auto mt-8 max-w-3xl overflow-hidden sm:mt-10">
          <div className="absolute -right-6 -top-6 font-sans text-9xl font-bold text-[#c4a574]/10 dark:text-amber-300/5 select-none pointer-events-none">
            “
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
            <span className="h-2 w-2 rounded-full bg-[#256e63] animate-ping" />
            <span>Verse of the Day</span>
          </div>

          <p className="mt-3 font-sans text-2xl font-medium leading-relaxed text-[#1f2a24] dark:text-[#f4ead6] sm:text-3.5xl">
            “{daily.text}”
          </p>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#c4a574]/25 pt-4">
            <cite className="not-italic font-sans text-base font-bold text-[#9a7b3c] dark:text-[#e2c286]">
              {verseRef(daily.bookName, daily.chapterNumber, daily.verseNumber)}
            </cite>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void copyVerse(
                    daily.text,
                    verseRef(daily.bookName, daily.chapterNumber, daily.verseNumber)
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a574]/40 bg-white/60 px-3.5 py-1.5 text-xs font-bold text-[#6b5a3a] transition-all hover:bg-white dark:bg-white/5 dark:text-[#e2c286]"
              >
                {copiedDaily ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <Link
                to={readerHref(daily.bookName, daily.chapterNumber, {
                  verse: daily.verseNumber,
                  translation: translationId,
                })}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#256E63] to-[#1d574e] px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <span>Read Chapter</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </footer>
        </blockquote>
      )}

      {/* Quick Action Navigation Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        {resume && (
          <Link
            to={readerHref(resume.book, resume.chapter, {
              translation: translationId,
            })}
            className="group inline-flex items-center gap-2 rounded-full border border-[#256E63]/40 bg-[#256E63]/10 px-4 py-2 text-xs font-extrabold text-[#256E63] shadow-sm transition-all hover:bg-[#256E63] hover:text-white dark:bg-[#256E63]/25 dark:text-emerald-300 dark:hover:bg-[#256E63] dark:hover:text-white"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>Continue {resume.book} {resume.chapter}</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => void surprise()}
          disabled={surpriseBusy}
          className="inline-flex items-center gap-2 rounded-full border border-[#c4a574]/50 bg-white/60 px-4 py-2 text-xs font-bold text-[#6b5a3a] shadow-sm transition-all hover:border-[#256E63] hover:text-[#256E63] dark:bg-white/5 dark:text-[#e2c286]"
        >
          {surpriseBusy ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin text-[#9a7b3c]" />
          ) : (
            <SparklesIcon className="h-4 w-4 text-[#9a7b3c]" />
          )}
          <span>{surpriseBusy ? "Drawing verse…" : "Random Verse"}</span>
        </button>

        <Link
          to={bibleSearchHref(translationId)}
          className="inline-flex items-center gap-2 rounded-full border border-[#c4a574]/50 bg-white/60 px-4 py-2 text-xs font-bold text-[#6b5a3a] shadow-sm transition-all hover:border-[#256E63] hover:text-[#256E63] dark:bg-white/5 dark:text-[#e2c286]"
        >
          <MagnifyingGlassIcon className="h-4 w-4 text-[#9a7b3c]" />
          <span>Search Scripture</span>
        </Link>

        <Link
          to={biblePlansHref(translationId)}
          className="inline-flex items-center gap-2 rounded-full border border-[#c4a574]/50 bg-white/60 px-4 py-2 text-xs font-bold text-[#6b5a3a] shadow-sm transition-all hover:border-[#256E63] hover:text-[#256E63] dark:bg-white/5 dark:text-[#e2c286]"
        >
          <CalendarIcon className="h-4 w-4 text-[#9a7b3c]" />
          <span>Reading Plans</span>
        </Link>
      </div>

      {/* Random Verse Display Card */}
      {random && (
        <Link
          to={readerHref(random.bookName, random.chapterNumber, {
            verse: random.verseNumber,
            translation: translationId,
          })}
          className="bible-quote mx-auto mt-6 block max-w-3xl transition-transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
            <span>A Verse at Random · {verseRef(random.bookName, random.chapterNumber, random.verseNumber)}</span>
            <span className="text-xs">Read →</span>
          </div>
          <p className="mt-2 font-sans text-xl leading-relaxed text-[#1f2a24] dark:text-[#f4ead6]">
            “{random.text}”
          </p>
        </Link>
      )}

      {/* Beloved Verses Grid */}
      {popular.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#9a7b3c] dark:text-[#e2c286]">
                Curated Passages
              </p>
              <h2 className="font-sans text-2xl font-bold text-[#1f2a24] dark:text-[#f4ead6]">
                Beloved Verses
              </h2>
            </div>
            <Link
              to={bibleSearchHref(translationId, { q: "love" })}
              className="text-xs font-bold text-[#256e63] hover:underline"
            >
              Explore more →
            </Link>
          </div>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((v, i) => (
              <li
                key={`${v.bookName}-${v.chapterNumber}-${v.verseNumber}`}
                className="bible-card-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  to={readerHref(v.bookName, v.chapterNumber, {
                    verse: v.verseNumber,
                    translation: translationId,
                  })}
                  className="group flex flex-col justify-between h-full rounded-2xl border border-[#c4a574]/30 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#256E63] hover:shadow-md dark:bg-white/5 dark:hover:border-emerald-500/50"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
                      <span>{verseRef(v.bookName, v.chapterNumber, v.verseNumber)}</span>
                      <BookmarkIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-[#256e63]" />
                    </div>
                    <p className="mt-2 line-clamp-4 font-sans text-base leading-relaxed text-[#1f2a24] dark:text-[#f4ead6]">
                      “{v.text}”
                    </p>
                  </div>
                  <span className="mt-3 block text-[10px] font-extrabold uppercase tracking-wider text-[#256e63]">
                    Open Chapter →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Holy Fact Banner */}
      {fact && (
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[#c4a574]/30 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-amber-500/10 p-5 backdrop-blur-md text-center">
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#c4a574]/20 text-[#9a7b3c] dark:text-[#e2c286] mb-2">
            <LightBulbIcon className="h-4 w-4" />
          </div>
          <p className="font-sans text-base italic text-[#1f2a24] dark:text-[#f4ead6]">
            “Did you know? {fact}”
          </p>
          <button
            type="button"
            onClick={() => void anotherFact()}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#256E63] hover:underline"
          >
            <span>Another Scripture Fact</span>
            <ArrowPathIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* The Library (Canon Books Grid) */}
      <section className="mt-16">
        <div className="flex flex-col gap-4 border-b border-[#c4a574]/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#9a7b3c] dark:text-[#e2c286]">
              66 Books of Scripture
            </p>
            <h2 className="font-sans text-3xl font-bold text-[#1f2a24] dark:text-[#f4ead6]">
              The Canon Library
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Testament Tab Filter Buttons */}
            <div className="flex items-center rounded-full border border-[#c4a574]/40 bg-white/50 p-1 backdrop-blur-md dark:bg-white/5">
              <button
                type="button"
                onClick={() => setTestamentFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  testamentFilter === "all"
                    ? "bg-[#256E63] text-white"
                    : "text-[#6b5a3a] hover:text-[#256E63] dark:text-[#cbbfa8]"
                }`}
              >
                All ({books.length})
              </button>
              <button
                type="button"
                onClick={() => setTestamentFilter("old")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  testamentFilter === "old"
                    ? "bg-[#256E63] text-white"
                    : "text-[#6b5a3a] hover:text-[#256E63] dark:text-[#cbbfa8]"
                }`}
              >
                Old ({books.filter((b) => b.testament === "old").length})
              </button>
              <button
                type="button"
                onClick={() => setTestamentFilter("new")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  testamentFilter === "new"
                    ? "bg-[#256E63] text-white"
                    : "text-[#6b5a3a] hover:text-[#256E63] dark:text-[#cbbfa8]"
                }`}
              >
                New ({books.filter((b) => b.testament === "new").length})
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="relative min-w-[14rem]">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7b3c]" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Find book by name…"
                className="h-9 w-full rounded-full border border-[#c4a574]/40 bg-white/70 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#256E63]/25 dark:bg-[#241e17] dark:text-[#f4ead6]"
              />
            </div>
          </div>
        </div>

        {booksLoading ? (
          <div className="py-16 text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-[#9a7b3c]" />
            <p className="mt-3 font-sans text-lg text-[#8a7d68]">Unrolling the canon scroll…</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {(testamentFilter === "all" || testamentFilter === "old") && ot.length > 0 && (
              <BookColumn title="Old Testament" books={ot} translationId={translationId} />
            )}
            {(testamentFilter === "all" || testamentFilter === "new") && nt.length > 0 && (
              <BookColumn title="New Testament" books={nt} translationId={translationId} />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function BookColumn({
  title,
  books,
  translationId,
}: {
  title: string;
  books: BibleBook[];
  translationId: string | null;
}) {
  return (
    <div className="rounded-3xl border border-[#c4a574]/25 bg-white/40 p-6 backdrop-blur-md dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-[#c4a574]/20 pb-3">
        <h3 className="font-sans text-sm font-bold uppercase tracking-[0.25em] text-[#9a7b3c] dark:text-[#e2c286]">
          {title}
        </h3>
        <span className="rounded-full bg-[#c4a574]/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#9a7b3c] dark:text-[#e2c286]">
          {books.length} Books
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {books.map((b) => {
          const category = getBookCategory(b.name);
          return (
            <li key={b.name}>
              <Link
                to={readerHref(b.name, 1, { translation: translationId })}
                className="group flex flex-col justify-between rounded-xl border border-transparent bg-white/50 p-2.5 transition-all hover:border-[#256E63]/40 hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="font-sans text-base font-semibold text-[#1f2a24] group-hover:text-[#256E63] dark:text-[#f4ead6] dark:group-hover:text-emerald-300">
                  {b.name}
                </span>
                <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-[#8a7d68] dark:text-[#a3947c]">
                  <span>{b.chapters ? `${b.chapters} ch` : ""}</span>
                  <span className="truncate text-[9px] uppercase tracking-wider text-[#9a7b3c]/80 dark:text-[#e2c286]/70">
                    {category}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

