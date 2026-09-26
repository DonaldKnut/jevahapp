import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useBible } from "./BibleContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { fetchChapterVerses } from "../../services/bible";
import { compareHref, readerHref } from "../../lib/bible/paths";
import { isUnknownTranslationError } from "../../lib/bible/translations";
import type { BibleVerse } from "../../types/bible";

function Column({
  verses,
  abbr,
  name,
  highlight,
  loading,
}: {
  verses: BibleVerse[];
  abbr: string;
  name: string;
  highlight: number;
  loading: boolean;
}) {
  return (
    <section className="min-w-0">
      <header className="mb-4 border-b border-[#c4a574]/25 pb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#8fd4c8]">
          {abbr}
        </p>
        <h2 className="font-sans text-lg font-semibold text-[#1f2a24] dark:text-[#e4ebe9]">
          {name}
        </h2>
      </header>
      {loading && !verses.length ? (
        <div className="bible-column bible-column--skeleton" data-size="sm">
          {Array.from({ length: 6 }, (_, i) => (
            <p key={i} className="bible-verse-skel" />
          ))}
        </div>
      ) : (
        <div className="bible-column" data-size="sm">
          {verses.map((v) => (
            <p
              key={v.verseNumber}
              id={`cmp-${abbr}-${v.verseNumber}`}
              className={`bible-verse ${
                highlight === v.verseNumber ? "bible-verse--active" : ""
              }`}
            >
              <sup className="bible-sup">{v.verseNumber}</sup>
              {v.text}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

export default function BibleCompare() {
  const { book = "", chapter: chapterRaw = "1" } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { translations, translationId, defaultId, fallbackTranslation } =
    useBible();
  const bookName = decodeURIComponent(book);
  const chapter = Math.max(1, Number(chapterRaw) || 1);
  const highlight = Number(params.get("verse") || 0) || 0;
  const leftId = (params.get("left") || defaultId || "web").toLowerCase();
  const rightId = (
    params.get("translation") ||
    translationId ||
    "kjv"
  ).toLowerCase();

  const [left, setLeft] = useState<BibleVerse[]>([]);
  const [right, setRight] = useState<BibleVerse[]>([]);
  const [leftLoading, setLeftLoading] = useState(true);
  const [rightLoading, setRightLoading] = useState(true);

  const leftMeta = translations.find((t) => t.id === leftId);
  const rightMeta = translations.find((t) => t.id === rightId);

  useDocumentMeta({
    title: `${bookName} ${chapter} (${leftMeta?.abbreviation || "WEB"} · ${rightMeta?.abbreviation || "KJV"}) · Jevah`,
    description: `Compare ${bookName} ${chapter} in two translations on Jevah.`,
    canonicalPath: compareHref(bookName, chapter, {
      verse: highlight || undefined,
      left: leftId,
      right: rightId,
    }),
  });

  useEffect(() => {
    let alive = true;
    setLeftLoading(true);
    void fetchChapterVerses(
      bookName,
      chapter,
      leftId,
      leftMeta?.corpusVersion
    )
      .then((list) => {
        if (alive) setLeft(list);
      })
      .catch((err) => {
        if (isUnknownTranslationError(err)) fallbackTranslation();
      })
      .finally(() => {
        if (alive) setLeftLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bookName, chapter, leftId, leftMeta?.corpusVersion, fallbackTranslation]);

  useEffect(() => {
    let alive = true;
    setRightLoading(true);
    void fetchChapterVerses(
      bookName,
      chapter,
      rightId,
      rightMeta?.corpusVersion
    )
      .then((list) => {
        if (alive) setRight(list);
      })
      .catch((err) => {
        if (isUnknownTranslationError(err)) fallbackTranslation();
      })
      .finally(() => {
        if (alive) setRightLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bookName, chapter, rightId, rightMeta?.corpusVersion, fallbackTranslation]);

  useEffect(() => {
    if (!highlight) return;
    const el =
      document.getElementById(`cmp-${rightMeta?.abbreviation || "KJV"}-${highlight}`) ||
      document.getElementById(`cmp-${leftMeta?.abbreviation || "WEB"}-${highlight}`);
    el?.scrollIntoView({ block: "center" });
  }, [highlight, left.length, right.length, leftMeta?.abbreviation, rightMeta?.abbreviation]);

  function setSide(side: "left" | "right", id: string) {
    const next = new URLSearchParams(params);
    if (side === "left") next.set("left", id);
    else next.set("translation", id);
    setParams(next, { replace: true });
  }

  return (
    <main className="bible-page-enter mx-auto max-w-6xl px-3 pb-16 pt-5 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={readerHref(bookName, chapter, {
            verse: highlight || undefined,
            translation: translationId,
          })}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#256E63]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to reader
        </Link>
        <h1 className="font-sans text-xl font-bold text-[#1f2a24] dark:text-[#e4ebe9] sm:text-2xl">
          {bookName} {chapter}
        </h1>
        <button
          type="button"
          onClick={() =>
            navigate(
              readerHref(bookName, chapter, {
                verse: highlight || undefined,
                translation: rightId,
              })
            )
          }
          className="text-xs font-bold uppercase tracking-wider text-[#9a7b3c] dark:text-[#8fd4c8]"
        >
          Read {rightMeta?.abbreviation || rightId}
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#6b6256] dark:text-[#c8d5d2]">
          Left
          <select
            value={leftId}
            onChange={(e) => setSide("left", e.target.value)}
            className="mt-1 h-10 w-full rounded-full border border-[#c4a574]/40 bg-white/80 px-3 text-sm font-semibold text-[#1f2a24] dark:bg-[#0d2622] dark:text-[#e4ebe9]"
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>
                {t.abbreviation} · {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-[#6b6256] dark:text-[#c8d5d2]">
          Right
          <select
            value={rightId}
            onChange={(e) => setSide("right", e.target.value)}
            className="mt-1 h-10 w-full rounded-full border border-[#c4a574]/40 bg-white/80 px-3 text-sm font-semibold text-[#1f2a24] dark:bg-[#0d2622] dark:text-[#e4ebe9]"
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>
                {t.abbreviation} · {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Column
          verses={left}
          abbr={leftMeta?.abbreviation || "WEB"}
          name={leftMeta?.name || "World English Bible"}
          highlight={highlight}
          loading={leftLoading}
        />
        <Column
          verses={right}
          abbr={rightMeta?.abbreviation || "KJV"}
          name={rightMeta?.name || "King James Version"}
          highlight={highlight}
          loading={rightLoading}
        />
      </div>
    </main>
  );
}
