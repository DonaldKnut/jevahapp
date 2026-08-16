import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowPathIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useBible } from "./BibleContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  fetchChapterVerses,
  fetchCrossReferences,
  fetchVerseCommentary,
  fetchVerseRange,
} from "../../services/bible";
import {
  rangeRef,
  readerHref,
  readFontSize,
  verseRef,
  writeFontSize,
  writeResume,
  type BibleFontSize,
} from "../../lib/bible/paths";
import type {
  BibleBook,
  BibleCommentary,
  BibleCrossRef,
  BibleVerse,
} from "../../types/bible";
import { ApiError } from "../../lib/api";
import BookPickerSheet from "./components/BookPickerSheet";
import VerseStudyPanel from "./components/VerseStudyPanel";

function neighbor(
  books: BibleBook[],
  book: string,
  chapter: number,
  dir: -1 | 1
): { book: string; chapter: number } | null {
  const idx = books.findIndex(
    (b) => b.name.toLowerCase() === book.toLowerCase()
  );
  if (idx < 0) return null;
  const current = books[idx];
  const max = current.chapters || 1;
  const nextCh = chapter + dir;
  if (nextCh >= 1 && nextCh <= max) return { book: current.name, chapter: nextCh };
  const ni = idx + dir;
  if (ni < 0 || ni >= books.length) return null;
  const nb = books[ni];
  const nMax = nb.chapters || 1;
  return { book: nb.name, chapter: dir === 1 ? 1 : nMax };
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function BibleReader() {
  const { book = "", chapter: chapterRaw = "1", verse: verseParam } =
    useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { books, translationId, translations, catalogReady, catalogFailed } =
    useBible();
  const chapter = Math.max(1, Number(chapterRaw) || 1);
  const highlight = Number(verseParam || params.get("verse") || 0) || 0;
  const bookName = decodeURIComponent(book);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<"book" | "chapter" | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeEnd, setRangeEnd] = useState(0);
  const [studyOpen, setStudyOpen] = useState(false);
  const [commentary, setCommentary] = useState<BibleCommentary | null>(null);
  const [crossRefs, setCrossRefs] = useState<BibleCrossRef[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<BibleFontSize>(() => readFontSize());
  const [railFilter, setRailFilter] = useState("");

  const meta = books.find(
    (b) => b.name.toLowerCase() === bookName.toLowerCase()
  );
  const canonicalBook = meta?.name || bookName;
  const transName =
    translations.find((t) => t.id === translationId)?.name ||
    "World English Bible";
  const transAbbr =
    translations.find((t) => t.id === translationId)?.abbreviation || "WEB";

  const prev = useMemo(
    () => neighbor(books, canonicalBook, chapter, -1),
    [books, canonicalBook, chapter]
  );
  const next = useMemo(
    () => neighbor(books, canonicalBook, chapter, 1),
    [books, canonicalBook, chapter]
  );

  const fromVerse = highlight || 0;
  const toVerse = rangeEnd || highlight || 0;
  const rangeStart = Math.min(fromVerse, toVerse) || fromVerse;
  const rangeStop = Math.max(fromVerse, toVerse) || toVerse;

  useDocumentMeta({
    title: `${canonicalBook} ${chapter}${highlight ? `:${highlight}` : ""} — Jevah Holy Bible`,
    description: `Read ${canonicalBook} chapter ${chapter} in the ${transName} on Jevah. Search, study commentary, and share verses.`,
    canonicalPath: readerHref(canonicalBook, chapter, {
      verse: highlight || undefined,
      translation: translationId,
    }),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${canonicalBook} ${chapter}`,
      inLanguage: "en",
      isPartOf: { "@type": "Book", name: "Holy Bible", alternateName: transName },
    },
  });

  useEffect(() => {
    if (!catalogReady) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const t = catalogFailed ? null : translationId;
    void fetchChapterVerses(canonicalBook, chapter, t)
      .then((list) => {
        if (!alive) return;
        setVerses(list);
        writeResume({
          book: canonicalBook,
          chapter,
          translation: translationId,
        });
      })
      .catch((err) => {
        if (!alive) return;
        setVerses([]);
        setError(
          err instanceof ApiError
            ? err.status === 404
              ? "This book or chapter was not found. Note: Psalms is spelled with an 's'."
              : err.message
            : "Could not unroll this chapter."
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [canonicalBook, chapter, translationId, catalogReady, catalogFailed]);

  useEffect(() => {
    if (!highlight || loading) return;
    const el = document.getElementById(`v-${highlight}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight, loading, verses.length]);

  useEffect(() => {
    setRangeMode(false);
    setRangeEnd(0);
    setStudyOpen(false);
  }, [canonicalBook, chapter]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  function selectVerse(n: number) {
    if (rangeMode && highlight) {
      const a = Math.min(highlight, n);
      const b = Math.max(highlight, n);
      setRangeEnd(n);
      setRangeMode(false);
      void copyPassage(a, b);
      return;
    }
    setRangeEnd(0);
    navigate(
      readerHref(canonicalBook, chapter, {
        verse: n,
        translation: translationId,
      }),
      { replace: true }
    );
  }

  async function share() {
    const url = `${window.location.origin}${readerHref(canonicalBook, chapter, {
      verse: highlight || undefined,
      translation: translationId,
    })}`;
    const ok = await copyText(url);
    setToast(ok ? "Chapter link copied to clipboard" : "Could not copy link");
  }

  async function copyPassage(from: number, to: number) {
    const t = catalogFailed ? null : translationId;
    const ref = rangeRef(canonicalBook, chapter, from, to);
    try {
      const list = await fetchVerseRange(ref, t);
      const body =
        list.length > 0
          ? list
              .map((v) =>
                v.verseNumber ? `${v.verseNumber} ${v.text}` : v.text
              )
              .join("\n")
          : verses
              .filter((v) => v.verseNumber >= from && v.verseNumber <= to)
              .map((v) => `${v.verseNumber} ${v.text}`)
              .join("\n");
      const ok = await copyText(`${ref} (${transAbbr})\n\n${body}`);
      setToast(ok ? `Copied ${ref}` : "Could not copy");
    } catch {
      const body = verses
        .filter((v) => v.verseNumber >= from && v.verseNumber <= to)
        .map((v) => `${v.verseNumber} ${v.text}`)
        .join("\n");
      const ok = await copyText(`${ref} (${transAbbr})\n\n${body}`);
      setToast(ok ? `Copied ${ref}` : "Could not copy");
    }
  }

  function openStudy() {
    if (!highlight) return;
    setStudyOpen(true);
    setStudyLoading(true);
    const t = catalogFailed ? null : translationId;
    void Promise.all([
      fetchVerseCommentary(canonicalBook, chapter, highlight, t),
      fetchCrossReferences(canonicalBook, chapter, highlight, t),
    ])
      .then(([c, refs]) => {
        setCommentary(c);
        setCrossRefs(refs);
      })
      .finally(() => setStudyLoading(false));
  }

  function bumpFont(dir: -1 | 1) {
    const order: BibleFontSize[] = ["sm", "md", "lg"];
    const i = Math.min(2, Math.max(0, order.indexOf(fontSize) + dir));
    const nextSize = order[i];
    setFontSize(nextSize);
    writeFontSize(nextSize);
  }

  const needle = railFilter.trim().toLowerCase();
  const ot = books.filter(
    (b) => b.testament === "old" && (!needle || b.name.toLowerCase().includes(needle))
  );
  const nt = books.filter(
    (b) => b.testament === "new" && (!needle || b.name.toLowerCase().includes(needle))
  );
  const chapterCount = meta?.chapters || Math.max(chapter, verses.length ? 1 : 0);
  const verseInRange = (n: number) =>
    highlight > 0 && n >= rangeStart && n <= rangeStop && rangeStop > 0;

  return (
    <>
      <div className="bible-reader mx-auto grid max-w-6xl gap-6 px-3 pb-28 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:grid-cols-[220px_1fr] lg:gap-8">
        <aside className="bible-page-enter hidden lg:block sticky top-36 h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-[#c4a574]/30 bg-white/40 p-3 backdrop-blur-md dark:bg-white/5">
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a7b3c]" />
            <input
              value={railFilter}
              onChange={(e) => setRailFilter(e.target.value)}
              placeholder="Find book…"
              className="h-8 w-full rounded-lg border border-[#c4a574]/30 bg-white/70 pl-8 pr-2 text-xs outline-none focus:border-[#256E63] dark:bg-[#241e17] dark:text-[#f4ead6]"
            />
          </div>

          <nav className="bible-rail h-[calc(100%-3rem)] overflow-y-auto pr-1 text-xs">
            {ot.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                  Old Testament ({ot.length})
                </p>
                {ot.map((b) => (
                  <Link
                    key={b.name}
                    to={readerHref(b.name, 1, { translation: translationId })}
                    className={`block rounded-lg px-2.5 py-1.5 font-serif text-sm transition-all ${
                      b.name === canonicalBook
                        ? "bg-[#256E63] font-bold text-white shadow-sm"
                        : "text-[#1f2a24] hover:bg-black/5 dark:text-[#f4ead6] dark:hover:bg-white/10"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            )}

            {nt.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                  New Testament ({nt.length})
                </p>
                {nt.map((b) => (
                  <Link
                    key={b.name}
                    to={readerHref(b.name, 1, { translation: translationId })}
                    className={`block rounded-lg px-2.5 py-1.5 font-serif text-sm transition-all ${
                      b.name === canonicalBook
                        ? "bg-[#256E63] font-bold text-white shadow-sm"
                        : "text-[#1f2a24] hover:bg-black/5 dark:text-[#f4ead6] dark:hover:bg-white/10"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </aside>

        <article className="bible-page-enter min-w-0">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#c4a574]/30 pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#c4a574]/15 px-2.5 py-0.5 font-serif text-[10px] font-bold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                  {meta?.testament === "new" ? "New Testament" : "Old Testament"}
                </span>
                <span className="text-xs font-semibold text-[#8a7d68]">{transAbbr}</span>
              </div>
              <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-[#1f2a24] dark:text-[#f4ead6] sm:text-5xl">
                {canonicalBook}{" "}
                <span className="text-[#9a7b3c] dark:text-[#e2c286]">{chapter}</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="inline-flex overflow-hidden rounded-full border border-[#c4a574]/40 bg-white/60 backdrop-blur-md dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => bumpFont(-1)}
                  className={`h-9 px-2.5 text-xs font-bold transition-colors ${
                    fontSize === "sm" ? "bg-[#256e63] text-white" : "text-[#6b5a3a] hover:bg-[#256e63]/10 dark:text-[#e2c286]"
                  }`}
                  aria-label="Smaller text"
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={() => bumpFont(1)}
                  className={`h-9 border-l border-[#c4a574]/30 px-2.5 text-sm font-bold transition-colors ${
                    fontSize === "lg" ? "bg-[#256e63] text-white" : "text-[#6b5a3a] hover:bg-[#256e63]/10 dark:text-[#e2c286]"
                  }`}
                  aria-label="Larger text"
                >
                  A+
                </button>
              </div>

              <button
                type="button"
                onClick={() => void share()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#c4a574]/40 bg-white/60 px-3.5 text-xs font-bold text-[#6b5a3a] backdrop-blur-md hover:bg-white dark:bg-white/5 dark:text-[#e2c286]"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {prev && (
                <Link
                  to={readerHref(prev.book, prev.chapter, {
                    translation: translationId,
                  })}
                  className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#c4a574]/40 bg-white/60 text-[#1f2a24] backdrop-blur-md hover:border-[#256e63] dark:bg-white/5 dark:text-[#f4ead6] sm:inline-flex"
                  aria-label="Previous chapter"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Link>
              )}
              {next && (
                <Link
                  to={readerHref(next.book, next.chapter, {
                    translation: translationId,
                  })}
                  className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#c4a574]/40 bg-white/60 text-[#1f2a24] backdrop-blur-md hover:border-[#256e63] dark:bg-white/5 dark:text-[#f4ead6] sm:inline-flex"
                  aria-label="Next chapter"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              )}
            </div>
          </header>

          <div className="mt-3 flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setPicker("book")}
              className="bible-picker-chip min-w-0 flex-1"
            >
              <span className="truncate">{canonicalBook}</span>
              <span className="text-[#9a7b3c]">▾</span>
            </button>
            <button
              type="button"
              onClick={() => setPicker("chapter")}
              className="bible-picker-chip shrink-0"
            >
              Ch {chapter} ▾
            </button>
          </div>

          {chapterCount > 1 && (
            <div className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to={readerHref(canonicalBook, n, { translation: translationId })}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all ${
                    n === chapter
                      ? "bg-[#256E63] text-white shadow-sm"
                      : "bg-white/50 text-[#6b5a3a] hover:bg-[#256E63]/15 dark:bg-white/5 dark:text-[#cbbfa8]"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}

          {rangeMode && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#256E63]/30 bg-[#256E63]/10 px-4 py-2.5 text-xs font-semibold text-[#256E63] dark:bg-[#256E63]/25 dark:text-emerald-300">
              <span>Tap the ending verse to select and copy the full passage range.</span>
              <button
                type="button"
                onClick={() => setRangeMode(false)}
                className="font-bold underline"
              >
                Cancel
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-16 text-center">
              <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-[#9a7b3c]" />
              <p className="mt-3 font-serif text-lg text-[#8a7d68]">Unrolling chapter scroll…</p>
            </div>
          ) : error ? (
            <div className="mt-12 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center text-sm text-rose-800 dark:text-rose-200">
              <p className="font-semibold">{error}</p>
              <Link
                to={readerHref("Genesis", 1, { translation: translationId })}
                className="mt-3 inline-block font-bold text-[#256E63] underline"
              >
                Return to Genesis 1
              </Link>
            </div>
          ) : (
            <div className="bible-column mt-8 sm:mt-10" data-size={fontSize}>
              {verses.map((v, i) => {
                const active = verseInRange(v.verseNumber);
                const isSelected = highlight === v.verseNumber;
                return (
                  <p
                    key={v.verseNumber}
                    id={`v-${v.verseNumber}`}
                    className={`bible-verse group ${i === 0 ? "bible-verse-first" : ""} ${
                      active || isSelected ? "bible-verse--active" : ""
                    }`}
                    style={{ animationDelay: `${Math.min(i, 24) * 16}ms` }}
                    onClick={() => selectVerse(v.verseNumber)}
                  >
                    <sup className="bible-sup">{v.verseNumber}</sup>
                    {v.text}
                  </p>
                );
              })}
            </div>
          )}

          <p className="mt-12 text-center font-serif text-xs text-[#8a7d68]">
            {transName} Edition
            {highlight
              ? ` · ${rangeStart && rangeStop && rangeStop !== rangeStart
                  ? rangeRef(canonicalBook, chapter, rangeStart, rangeStop)
                  : verseRef(canonicalBook, chapter, highlight)}`
              : ""}
          </p>

          {highlight > 0 && (
            <div className="mt-6 hidden flex-wrap items-center justify-center gap-2.5 lg:flex">
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={() => void copyPassage(rangeStart, rangeStop || rangeStart)}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                <span>Copy Verse</span>
              </button>
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={() => {
                  setRangeMode(true);
                  setToast("Click ending verse to complete range selection");
                }}
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Select Multi-Verse Range</span>
              </button>
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={openStudy}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Commentary & Study</span>
              </button>
            </div>
          )}
        </article>
      </div>

      <nav className="bible-thumbbar lg:hidden">
        {prev ? (
          <Link
            to={readerHref(prev.book, prev.chapter, {
              translation: translationId,
            })}
            className="bible-thumbbar-btn"
            aria-label="Previous chapter"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span className="bible-thumbbar-btn opacity-30">
            <ChevronLeftIcon className="h-5 w-5" />
          </span>
        )}

        {highlight ? (
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <button
              type="button"
              className="bible-thumbbar-action"
              onClick={() => void copyPassage(rangeStart, rangeStop || rangeStart)}
            >
              <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              <span>Copy</span>
            </button>
            <button
              type="button"
              className="bible-thumbbar-action"
              onClick={() => {
                setRangeMode(true);
                setToast("Tap ending verse");
              }}
            >
              <span>Range</span>
            </button>
            <button
              type="button"
              className="bible-thumbbar-action"
              onClick={openStudy}
            >
              <span>Study</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-center font-serif text-sm font-bold tracking-wide text-[#1f2a24] dark:text-[#f4ead6]"
            onClick={() => setPicker("book")}
          >
            {canonicalBook} <span className="text-[#9a7b3c]">{chapter}</span> ▾
          </button>
        )}

        {next ? (
          <Link
            to={readerHref(next.book, next.chapter, {
              translation: translationId,
            })}
            className="bible-thumbbar-btn"
            aria-label="Next chapter"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span className="bible-thumbbar-btn opacity-30">
            <ChevronRightIcon className="h-5 w-5" />
          </span>
        )}
      </nav>

      {toast && <p className="bible-toast">{toast}</p>}

      <BookPickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        books={books}
        currentBook={canonicalBook}
        currentChapter={chapter}
        translationId={translationId}
        startOnChapters={picker === "chapter"}
      />

      <VerseStudyPanel
        open={studyOpen}
        onClose={() => setStudyOpen(false)}
        book={canonicalBook}
        chapter={chapter}
        verse={highlight}
        translationId={translationId}
        commentary={commentary}
        refs={crossRefs}
        loading={studyLoading}
      />
    </>
  );
}
