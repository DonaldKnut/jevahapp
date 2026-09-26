import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  Squares2X2Icon,
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
  bookChapterCount,
  compareHref,
  formatVerseCopy,
  rangeRef,
  readerHref,
  BIBLE_ZOOMS,
  bumpBibleZoom,
  readFontSize,
  verseRef,
  writeFontSize,
  writeResume,
  type BibleFontSize,
} from "../../lib/bible/paths";
import { isUnknownTranslationError } from "../../lib/bible/translations";
import type {
  BibleBook,
  BibleCommentary,
  BibleCrossRef,
  BibleVerse,
} from "../../types/bible";
import { ApiError } from "../../lib/api";
import BookPickerSheet from "./components/BookPickerSheet";
import VerseStudyPanel from "./components/VerseStudyPanel";
import TranslationChip from "./TranslationChip";

function neighbor(
  books: BibleBook[],
  book: string,
  chapter: number,
  dir: -1 | 1
): { book: string; chapter: number } | null {
  const idx = books.findIndex(
    (b) => b.name.toLowerCase() === book.toLowerCase()
  );
  if (idx < 0) {
    const nextCh = chapter + dir;
    return nextCh >= 1 ? { book, chapter: nextCh } : null;
  }
  const current = books[idx];
  const max = bookChapterCount(current);
  const nextCh = chapter + dir;
  if (max > 0) {
    if (nextCh >= 1 && nextCh <= max) {
      return { book: current.name, chapter: nextCh };
    }
  } else if (nextCh >= 1) {
    return { book: current.name, chapter: nextCh };
  }
  const ni = idx + dir;
  if (ni < 0 || ni >= books.length) return null;
  const nb = books[ni];
  const nMax = bookChapterCount(nb) || 1;
  return { book: nb.name, chapter: dir === 1 ? 1 : nMax };
}

function hopLabel(
  currentBook: string,
  dest: { book: string; chapter: number }
) {
  if (dest.book === currentBook) return `Ch ${dest.chapter}`;
  return `${dest.book} ${dest.chapter}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  const {
    books,
    translationId,
    currentTranslation,
    corpusVersion,
    catalogReady,
    catalogFailed,
    fallbackTranslation,
  } = useBible();
  const chapter = Math.max(1, Number(chapterRaw) || 1);
  const highlight = Number(verseParam || params.get("verse") || 0) || 0;
  const bookName = decodeURIComponent(book);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
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
  const placeRef = useRef({ book: "", chapter: 0, translation: "" as string | null });

  const meta = books.find(
    (b) => b.name.toLowerCase() === bookName.toLowerCase()
  );
  const canonicalBook = meta?.name || bookName;
  const transName = currentTranslation?.name || "World English Bible";
  const transAbbr = currentTranslation?.abbreviation || "WEB";
  const renderedAbbr = (
    verses[0]?.translation ||
    transAbbr
  ).toUpperCase();

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
    title: `${canonicalBook} ${chapter}${highlight ? `:${highlight}` : ""} (${transAbbr}) · Jevah`,
    description: `Read ${canonicalBook} chapter ${chapter} in the ${transName} on Jevah.`,
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
    const t = catalogFailed ? null : translationId;
    const placeChanged =
      placeRef.current.book !== canonicalBook ||
      placeRef.current.chapter !== chapter;
    const transChanged = placeRef.current.translation !== t;
    placeRef.current = { book: canonicalBook, chapter, translation: t };

    if (placeChanged) {
      setLoading(true);
      setError(null);
    } else if (transChanged) {
      setSwapping(true);
      setError(null);
    }

    void fetchChapterVerses(canonicalBook, chapter, t, corpusVersion)
      .then((list) => {
        if (!alive) return;
        setVerses(list);
        setError(null);
        writeResume({
          book: canonicalBook,
          chapter,
          verse: highlight || undefined,
          translation: translationId,
        });
      })
      .catch((err) => {
        if (!alive) return;
        if (isUnknownTranslationError(err)) {
          fallbackTranslation();
          return;
        }
        if (!verses.length) {
          setVerses([]);
        }
        setError(
          err instanceof ApiError
            ? err.status === 404
              ? "This book or chapter was not found. Note: Psalms is spelled with an ‘s’."
              : err.message
            : "Could not load this chapter."
        );
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
        setSwapping(false);
      });
    return () => {
      alive = false;
    };
    // verses.length is only used to decide whether to clear on error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canonicalBook,
    chapter,
    translationId,
    corpusVersion,
    catalogReady,
    catalogFailed,
    fallbackTranslation,
  ]);

  useEffect(() => {
    if (!next || loading || catalogFailed) return;
    const t = translationId;
    const idle = window.setTimeout(() => {
      void fetchChapterVerses(next.book, next.chapter, t, corpusVersion).catch(
        () => undefined
      );
    }, 900);
    return () => window.clearTimeout(idle);
  }, [next, translationId, corpusVersion, loading, catalogFailed]);

  useEffect(() => {
    if (!highlight || loading) return;
    const el = document.getElementById(`v-${highlight}`);
    if (!el) return;
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    const rect = el.getBoundingClientRect();
    const inView = rect.top >= 96 && rect.bottom <= window.innerHeight - 96;
    if (!inView) {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [highlight, loading, verses, translationId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        navigate(
          readerHref(prev.book, prev.chapter, { translation: translationId })
        );
      }
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        navigate(
          readerHref(next.book, next.chapter, { translation: translationId })
        );
      }
      if ((e.key === "-" || e.key === "_") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const nextSize = bumpBibleZoom(fontSize, -1);
        setFontSize(nextSize);
        writeFontSize(nextSize);
      }
      if ((e.key === "=" || e.key === "+") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const nextSize = bumpBibleZoom(fontSize, 1);
        setFontSize(nextSize);
        writeFontSize(nextSize);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, navigate, translationId, fontSize]);

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
    const path = readerHref(canonicalBook, chapter, {
      verse: highlight || undefined,
      translation: translationId,
    });
    const url = `${window.location.origin}${path}`;
    const selected = verses.find((v) => v.verseNumber === highlight);
    const text = selected
      ? formatVerseCopy(
          verseRef(canonicalBook, chapter, highlight),
          renderedAbbr,
          selected.text
        )
      : `${canonicalBook} ${chapter} (${renderedAbbr})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${canonicalBook} ${chapter} (${renderedAbbr})`,
          text,
          url,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    const ok = await copyText(url);
    setToast(ok ? "Link copied" : "Could not copy link");
  }

  async function copyPassage(from: number, to: number) {
    const t = catalogFailed ? null : translationId;
    const ref = rangeRef(canonicalBook, chapter, from, to);
    const local = verses
      .filter((v) => v.verseNumber >= from && v.verseNumber <= to)
      .map((v) => v.text)
      .join("\n");
    try {
      const list = await fetchVerseRange(ref, t, corpusVersion);
      const body =
        list.length > 0
          ? list.map((v) => v.text).join("\n")
          : local;
      const ok = await copyText(formatVerseCopy(ref, renderedAbbr, body));
      setToast(ok ? `Copied ${ref} (${renderedAbbr})` : "Could not copy");
    } catch {
      const ok = await copyText(formatVerseCopy(ref, renderedAbbr, local));
      setToast(ok ? `Copied ${ref} (${renderedAbbr})` : "Could not copy");
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
    const nextSize = bumpBibleZoom(fontSize, dir);
    setFontSize(nextSize);
    writeFontSize(nextSize);
  }

  const zoomStyle = {
    "--bible-zoom": String(fontSize / 100),
  } as CSSProperties;

  const needle = railFilter.trim().toLowerCase();
  const ot = books.filter(
    (b) => b.testament === "old" && (!needle || b.name.toLowerCase().includes(needle))
  );
  const nt = books.filter(
    (b) => b.testament === "new" && (!needle || b.name.toLowerCase().includes(needle))
  );
  const chapterCount =
    (meta && bookChapterCount(meta)) || Math.max(chapter, verses.length ? 1 : 0);
  const verseInRange = (n: number) =>
    highlight > 0 && n >= rangeStart && n <= rangeStop && rangeStop > 0;
  const showColumn = verses.length > 0;
  const firstPaint = loading && !showColumn;

  return (
    <>
      <div className="bible-reader mx-auto grid max-w-6xl gap-6 px-3 pb-40 pt-4 sm:px-6 sm:pb-40 sm:pt-6 lg:grid-cols-[220px_1fr] lg:gap-8">
        <aside className="bible-page-enter sticky top-36 hidden h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-[#c4a574]/30 bg-white/40 p-3 backdrop-blur-md dark:bg-white/5 lg:block">
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a7b3c]" />
            <input
              value={railFilter}
              onChange={(e) => setRailFilter(e.target.value)}
              placeholder="Find book…"
              className="h-8 w-full rounded-lg border border-[#c4a574]/30 bg-white/70 pl-8 pr-2 text-xs outline-none focus:border-[#256E63] dark:bg-[#0d2622] dark:text-[#e4ebe9]"
            />
          </div>

          <nav className="bible-rail h-[calc(100%-3rem)] overflow-y-auto pr-1 text-xs">
            {ot.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#8fd4c8]">
                  Old Testament
                </p>
                {ot.map((b) => (
                  <Link
                    key={b.name}
                    to={readerHref(b.name, 1, { translation: translationId })}
                    className={`block rounded-lg px-2.5 py-1.5 font-sans text-sm transition-all ${
                      b.name === canonicalBook
                        ? "bg-[#256E63] font-bold text-white shadow-sm"
                        : "text-[#1f2a24] hover:bg-black/5 dark:text-[#e4ebe9] dark:hover:bg-white/10"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            )}
            {nt.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#8fd4c8]">
                  New Testament
                </p>
                {nt.map((b) => (
                  <Link
                    key={b.name}
                    to={readerHref(b.name, 1, { translation: translationId })}
                    className={`block rounded-lg px-2.5 py-1.5 font-sans text-sm transition-all ${
                      b.name === canonicalBook
                        ? "bg-[#256E63] font-bold text-white shadow-sm"
                        : "text-[#1f2a24] hover:bg-black/5 dark:text-[#e4ebe9] dark:hover:bg-white/10"
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
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c4a574]/30 pb-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPicker("book")}
                className="bible-picker-chip"
              >
                <span className="truncate">{canonicalBook}</span>
                <span className="text-[#9a7b3c]">▾</span>
              </button>
              <button
                type="button"
                onClick={() => setPicker("chapter")}
                className="bible-picker-chip shrink-0"
              >
                {chapter} ▾
              </button>
              <TranslationChip />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => void share()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#c4a574]/40 bg-white/60 px-3.5 text-xs font-bold text-[#6b5a3a] backdrop-blur-md hover:bg-white dark:bg-white/5 dark:text-[#c8d5d2]"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {prev && (
                <Link
                  to={readerHref(prev.book, prev.chapter, {
                    translation: translationId,
                  })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c4a574]/40 bg-white/60 text-[#1f2a24] backdrop-blur-md hover:border-[#256e63] dark:bg-white/5 dark:text-[#e4ebe9]"
                  aria-label={`Previous: ${hopLabel(canonicalBook, prev)}`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Link>
              )}
              {next && (
                <Link
                  to={readerHref(next.book, next.chapter, {
                    translation: translationId,
                  })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c4a574]/40 bg-white/60 text-[#1f2a24] backdrop-blur-md hover:border-[#256e63] dark:bg-white/5 dark:text-[#e4ebe9]"
                  aria-label={`Next: ${hopLabel(canonicalBook, next)}`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              )}
            </div>
          </header>

          {rangeMode && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#256E63]/30 bg-[#256E63]/10 px-4 py-2.5 text-xs font-semibold text-[#256E63] dark:bg-[#256E63]/25 dark:text-emerald-300">
              <span>Tap the last verse to copy the range.</span>
              <button
                type="button"
                onClick={() => setRangeMode(false)}
                className="font-bold underline"
              >
                Cancel
              </button>
            </div>
          )}

          {firstPaint ? (
            <div className="bible-column bible-column--skeleton mt-10" style={zoomStyle}>
              {Array.from({ length: 8 }, (_, i) => (
                <p key={i} className="bible-verse-skel" />
              ))}
            </div>
          ) : error && !showColumn ? (
            <div className="mt-12 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center text-sm text-rose-800 dark:text-rose-200">
              <p className="font-semibold">{error}</p>
              <Link
                to={readerHref("Genesis", 1, { translation: translationId })}
                className="mt-3 inline-block font-bold text-[#256E63] underline"
              >
                Open Genesis 1
              </Link>
            </div>
          ) : (
            <div
              className={`bible-column mt-8 sm:mt-10 ${swapping ? "is-swapping" : ""}`}
              style={zoomStyle}
            >
              {verses.map((v) => {
                const active = verseInRange(v.verseNumber);
                const isSelected = highlight === v.verseNumber;
                return (
                  <p
                    key={v.verseNumber}
                    id={`v-${v.verseNumber}`}
                    className={`bible-verse group ${
                      active || isSelected ? "bible-verse--active" : ""
                    }`}
                    onClick={() => selectVerse(v.verseNumber)}
                  >
                    <sup className="bible-sup">{v.verseNumber}</sup>
                    {v.text}
                  </p>
                );
              })}
            </div>
          )}

          {highlight > 0 && showColumn && (
            <div className="mt-8 hidden flex-wrap items-center justify-center gap-2 lg:flex">
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={() => void copyPassage(rangeStart, rangeStop || rangeStart)}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copy
              </button>
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={() => {
                  setRangeMode(true);
                  setToast("Tap the last verse");
                }}
              >
                Range
              </button>
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={() => void share()}
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </button>
              <button
                type="button"
                className="bible-chip-btn inline-flex items-center gap-1.5"
                onClick={openStudy}
              >
                <BookOpenIcon className="h-4 w-4" />
                Study
              </button>
              <Link
                to={compareHref(canonicalBook, chapter, {
                  verse: highlight || undefined,
                  left: "web",
                  right: translationId === "web" ? "kjv" : translationId,
                })}
                className="bible-chip-btn inline-flex items-center gap-1.5"
              >
                <Squares2X2Icon className="h-4 w-4" />
                Compare
              </Link>
            </div>
          )}

          <nav className="mt-10 flex items-stretch gap-2">
            {prev ? (
              <Link
                to={readerHref(prev.book, prev.chapter, {
                  translation: translationId,
                })}
                className="bible-chapternav-end"
              >
                <ChevronLeftIcon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 truncate">
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                    Previous
                  </span>
                  {hopLabel(canonicalBook, prev)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={readerHref(next.book, next.chapter, {
                  translation: translationId,
                })}
                className="bible-chapternav-end text-right"
              >
                <span className="min-w-0 truncate">
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                    Next
                  </span>
                  {hopLabel(canonicalBook, next)}
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0" />
              </Link>
            ) : (
              <span />
            )}
          </nav>

          {chapterCount > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-1.5 pb-4">
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to={readerHref(canonicalBook, n, { translation: translationId })}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all ${
                    n === chapter
                      ? "bg-[#256E63] text-white shadow-sm"
                      : "bg-white/50 text-[#6b5a3a] hover:bg-[#256E63]/15 dark:bg-white/5 dark:text-[#c8d5d2]"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </article>
      </div>

      {prev && (
        <Link
          to={readerHref(prev.book, prev.chapter, { translation: translationId })}
          className="bible-edge-btn bible-edge-btn--prev"
          aria-label={`Previous: ${hopLabel(canonicalBook, prev)}`}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
      )}
      {next && (
        <Link
          to={readerHref(next.book, next.chapter, { translation: translationId })}
          className="bible-edge-btn bible-edge-btn--next"
          aria-label={`Next: ${hopLabel(canonicalBook, next)}`}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </Link>
      )}

      <div
        className="fixed bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[45] -translate-x-1/2"
        role="group"
        aria-label="Scripture zoom"
      >
        <div className="inline-flex items-center overflow-hidden rounded-full border border-[#c4a574]/45 bg-[#fdfbf7]/95 shadow-lg shadow-black/15 backdrop-blur-xl dark:border-white/15 dark:bg-[#0a1f1c]/95">
          <button
            type="button"
            onClick={() => bumpFont(-1)}
            disabled={fontSize === BIBLE_ZOOMS[0]}
            className="inline-flex h-11 w-11 items-center justify-center text-[#6b5a3a] transition-colors hover:bg-[#256e63]/10 disabled:opacity-35 dark:text-[#c8d5d2]"
            aria-label="Zoom out scripture"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-bold tabular-nums text-[#6b5a3a] dark:text-[#c8d5d2]">
            {fontSize}%
          </span>
          <button
            type="button"
            onClick={() => bumpFont(1)}
            disabled={fontSize === BIBLE_ZOOMS[BIBLE_ZOOMS.length - 1]}
            className="inline-flex h-11 w-11 items-center justify-center text-[#6b5a3a] transition-colors hover:bg-[#256e63]/10 disabled:opacity-35 dark:text-[#c8d5d2]"
            aria-label="Zoom in scripture"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="bible-thumbbar" aria-label="Chapter navigation">
        {prev ? (
          <Link
            to={readerHref(prev.book, prev.chapter, {
              translation: translationId,
            })}
            className="bible-thumbbar-hop"
            aria-label={`Previous: ${hopLabel(canonicalBook, prev)}`}
          >
            <ChevronLeftIcon className="h-5 w-5 shrink-0" />
            <span className="hidden min-w-0 truncate sm:inline">
              {hopLabel(canonicalBook, prev)}
            </span>
          </Link>
        ) : (
          <span className="bible-thumbbar-hop opacity-30">
            <ChevronLeftIcon className="h-5 w-5" />
          </span>
        )}

        <button
          type="button"
          className="bible-thumbbar-now"
          onClick={() => setPicker("chapter")}
          aria-label="Choose chapter"
        >
          <span className="truncate">
            {canonicalBook} {chapter}
          </span>
          <span aria-hidden>▾</span>
        </button>

        {next ? (
          <Link
            to={readerHref(next.book, next.chapter, {
              translation: translationId,
            })}
            className="bible-thumbbar-hop bible-thumbbar-hop--next"
            aria-label={`Next: ${hopLabel(canonicalBook, next)}`}
          >
            <span className="hidden min-w-0 truncate sm:inline">
              {hopLabel(canonicalBook, next)}
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0" />
          </Link>
        ) : (
          <span className="bible-thumbbar-hop opacity-30">
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
