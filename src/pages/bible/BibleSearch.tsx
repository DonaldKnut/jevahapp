import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useBible } from "./BibleContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { searchBible } from "../../services/bible";
import { HighlightQuery } from "../../lib/bible/highlight";
import { readerHref, verseRef } from "../../lib/bible/paths";
import type { BibleVerse } from "../../types/bible";
import { ApiError } from "../../lib/api";

const TOPICS = [
  "Love",
  "Faith",
  "Grace",
  "Peace",
  "Hope",
  "Forgiveness",
  "Strength",
  "Psalm 23",
  "John 3:16",
];

export default function BibleSearch() {
  const { translationId, books, catalogReady, catalogFailed } = useBible();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const bookFilter = params.get("book") || "";
  const testament = params.get("testament") || "";
  const [input, setInput] = useState(q);
  const [hits, setHits] = useState<BibleVerse[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const t = catalogFailed ? null : translationId;

  useDocumentMeta({
    title: q ? `“${q}” — Scripture Search | Jevah Holy Bible` : "Search Scripture — Jevah Holy Bible",
    description: q
      ? `Search results for “${q}” in the Holy Bible.`
      : "Search the World English Bible by keywords, verses, books, or testaments.",
    canonicalPath: q
      ? `/bible/search?q=${encodeURIComponent(q)}${t ? `&translation=${encodeURIComponent(t)}` : ""}`
      : t
        ? `/bible/search?translation=${encodeURIComponent(t)}`
        : "/bible/search",
  });

  useEffect(() => {
    setInput(q);
    if (!q.trim() || !catalogReady) {
      if (!q.trim()) setHits([]);
      return;
    }
    let alive = true;
    setBusy(true);
    setError(null);
    void searchBible({
      q: q.trim(),
      translation: t,
      book: bookFilter || undefined,
      testament: testament || undefined,
    })
      .then((list) => {
        if (alive) setHits(list);
      })
      .catch((err) => {
        if (!alive) return;
        setHits([]);
        setError(err instanceof ApiError ? err.message : "Search failed.");
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [q, bookFilter, testament, t, catalogReady]);

  function patchParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params);
    mutate(next);
    if (translationId) next.set("translation", translationId);
    else next.delete("translation");
    setParams(next);
  }

  function apply(e: FormEvent) {
    e.preventDefault();
    patchParams((next) => {
      if (input.trim()) next.set("q", input.trim());
      else next.delete("q");
    });
  }

  function pickTopic(topic: string) {
    setInput(topic);
    patchParams((next) => {
      next.set("q", topic);
    });
  }

  async function copyVerseHit(id: string, text: string, ref: string) {
    try {
      await navigator.clipboard.writeText(`"${text}" — ${ref}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="bible-page-enter mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12">
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c4a574]/40 bg-white/70 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#9a7b3c] shadow-sm backdrop-blur-md dark:bg-white/5 dark:text-[#e2c286]">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-[#256e63]" />
          <span>Full Canon Concordance</span>
        </div>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-tight text-[#1f2a24] dark:text-[#f4ead6] sm:text-5xl">
          Search Holy Scripture
        </h1>
        <p className="mt-2 text-sm text-[#6b6256] dark:text-[#cbbfa8]">
          Find verses by keyword, passage reference, testament, or book.
        </p>
      </header>

      {/* Hero Search Box */}
      <form onSubmit={apply} className="mt-8 space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a7b3c] dark:text-[#e2c286]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search keywords, topics, or references (e.g. John 3:16, love, shepherd)…"
            className="h-14 w-full rounded-2xl border border-[#c4a574]/40 bg-white/80 pl-12 pr-28 font-sans text-lg text-[#1f2a24] shadow-md backdrop-blur-md outline-none ring-[#256E63]/25 placeholder:text-[#8a7d68] focus:border-[#256E63] focus:ring-2 dark:bg-[#241e17] dark:text-[#f4ead6]"
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                patchParams((next) => next.delete("q"));
              }}
              className="absolute right-24 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-gradient-to-r from-[#256E63] to-[#1d574e] px-5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02]"
          >
            Search
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 text-xs font-bold text-[#8a7d68] mr-1">
            <FunnelIcon className="h-3.5 w-3.5 text-[#9a7b3c]" />
            <span>Filters:</span>
          </div>

          <select
            value={testament}
            onChange={(e) =>
              patchParams((next) => {
                if (e.target.value) next.set("testament", e.target.value);
                else next.delete("testament");
              })
            }
            className="h-9 rounded-full border border-[#c4a574]/40 bg-white/70 px-3 text-xs font-bold text-[#1f2a24] shadow-sm outline-none dark:bg-[#241e17] dark:text-[#f4ead6]"
          >
            <option value="">All Testaments</option>
            <option value="old">Old Testament</option>
            <option value="new">New Testament</option>
          </select>

          <select
            value={bookFilter}
            onChange={(e) =>
              patchParams((next) => {
                if (e.target.value) next.set("book", e.target.value);
                else next.delete("book");
              })
            }
            className="h-9 max-w-[200px] rounded-full border border-[#c4a574]/40 bg-white/70 px-3 text-xs font-bold text-[#1f2a24] shadow-sm outline-none dark:bg-[#241e17] dark:text-[#f4ead6]"
          >
            <option value="">All 66 Books</option>
            {books.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Suggested Topic Quick Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
          Popular Topics:
        </span>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => pickTopic(topic)}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
              q.toLowerCase() === topic.toLowerCase()
                ? "border-[#256e63] bg-[#256e63] text-white shadow-sm"
                : "border-[#c4a574]/40 bg-white/50 text-[#6b5a3a] hover:border-[#256e63] hover:text-[#256e63] dark:bg-white/5 dark:text-[#cbbfa8]"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {busy && (
        <div className="mt-12 py-8 text-center">
          <ArrowPathIcon className="mx-auto h-7 w-7 animate-spin text-[#9a7b3c]" />
          <p className="mt-2 text-sm text-[#8a7d68]">Searching the canon concordance…</p>
        </div>
      )}

      {error && (
        <p className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-center text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {/* Search Result Counter */}
      {!busy && q && !error && (
        <div className="mt-8 flex items-center justify-between border-b border-[#c4a574]/30 pb-3">
          <p className="font-sans text-sm font-bold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
            {hits.length} Passage{hits.length === 1 ? "" : "s"} Found for “{q}”
          </p>
          <span className="text-xs text-[#8a7d68]">World English Bible</span>
        </div>
      )}

      {/* Results List */}
      <ul className="mt-5 space-y-4">
        {hits.map((v, i) => {
          const hitId = `${v.bookName}-${v.chapterNumber}-${v.verseNumber}-${i}`;
          const isCopied = copiedId === hitId;
          const refString = verseRef(v.bookName, v.chapterNumber, v.verseNumber);
          return (
            <li
              key={hitId}
              className="bible-card-in"
              style={{ animationDelay: `${Math.min(i, 16) * 35}ms` }}
            >
              <div className="group rounded-2xl border border-[#c4a574]/30 bg-white/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-[#256E63] hover:shadow-md dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-bold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                    {refString}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void copyVerseHit(hitId, v.text, refString)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#c4a574]/30 bg-white/50 px-2.5 py-1 text-[11px] font-bold text-[#6b5a3a] hover:bg-white dark:bg-white/5 dark:text-[#e2c286]"
                    >
                      {isCopied ? (
                        <>
                          <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={readerHref(v.bookName, v.chapterNumber, {
                        verse: v.verseNumber,
                        translation: translationId,
                      })}
                      className="inline-flex items-center gap-1 rounded-full bg-[#256e63] px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#1e574e]"
                    >
                      <span>Read</span>
                      <SparklesIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <p className="mt-3 font-sans text-lg leading-relaxed text-[#1f2a24] dark:text-[#f4ead6]">
                  <HighlightQuery text={v.text} query={q} />
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

