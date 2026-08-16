import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { readerHref } from "../../../lib/bible/paths";
import type { BibleBook } from "../../../types/bible";

export default function BookPickerSheet({
  open,
  onClose,
  books,
  currentBook,
  currentChapter,
  translationId,
  startOnChapters = false,
}: {
  open: boolean;
  onClose: () => void;
  books: BibleBook[];
  currentBook: string;
  currentChapter: number;
  translationId: string | null;
  startOnChapters?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [picked, setPicked] = useState(currentBook);
  const [step, setStep] = useState<"book" | "chapter">(
    startOnChapters ? "chapter" : "book"
  );

  useEffect(() => {
    if (!open) return;
    setPicked(currentBook);
    setStep(startOnChapters ? "chapter" : "book");
    setFilter("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, currentBook, startOnChapters]);

  const needle = filter.trim().toLowerCase();
  const ot = useMemo(
    () =>
      books.filter(
        (b) =>
          b.testament === "old" &&
          (!needle || b.name.toLowerCase().includes(needle))
      ),
    [books, needle]
  );
  const nt = useMemo(
    () =>
      books.filter(
        (b) =>
          b.testament === "new" &&
          (!needle || b.name.toLowerCase().includes(needle))
      ),
    [books, needle]
  );

  const meta = books.find(
    (b) => b.name.toLowerCase() === picked.toLowerCase()
  );
  const chapterCount = meta?.chapters || 1;

  if (!open) return null;

  return (
    <div className="bible-sheet-root" role="dialog" aria-modal="true">
      <button
        type="button"
        className="bible-sheet-backdrop"
        aria-label="Close book picker"
        onClick={onClose}
      />
      <div className="bible-sheet">
        <div className="flex items-center justify-between gap-3 border-b border-[#c4a574]/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                {step === "book" ? "Library Selector" : meta?.name || picked}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1f2a24] dark:text-[#f4ead6]">
              {step === "book" ? "Choose a Book" : `Select Chapter (1–${chapterCount})`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c4a574]/40 bg-white/60 text-[#1f2a24] hover:bg-white dark:bg-white/10 dark:text-[#f4ead6]"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {step === "book" ? (
          <>
            <div className="relative mt-3">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7b3c] dark:text-[#e2c286]" />
              <input
                autoFocus
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search 66 books by name…"
                className="h-10 w-full rounded-full border border-[#c4a574]/40 bg-white/80 pl-10 pr-9 text-sm text-[#1f2a24] outline-none focus:border-[#256E63] focus:ring-2 focus:ring-[#256E63]/25 dark:bg-[#241e17] dark:text-[#f4ead6]"
              />
              {filter && (
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="bible-sheet-scroll mt-4 pr-1">
              <BookGroup
                title="Old Testament"
                books={ot}
                current={currentBook}
                onPick={(name) => {
                  setPicked(name);
                  setStep("chapter");
                }}
              />
              <BookGroup
                title="New Testament"
                books={nt}
                current={currentBook}
                onPick={(name) => {
                  setPicked(name);
                  setStep("chapter");
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between border-b border-[#c4a574]/20 pb-2">
              <button
                type="button"
                onClick={() => setStep("book")}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#256E63] hover:underline"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Choose Another Book</span>
              </button>

              <span className="text-xs font-semibold text-[#8a7d68]">
                {meta?.chapters ? `${meta.chapters} chapters` : ""}
              </span>
            </div>

            <div className="bible-sheet-scroll mt-4 pr-1">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map(
                  (n) => (
                    <Link
                      key={n}
                      to={readerHref(meta?.name || picked, n, {
                        translation: translationId,
                      })}
                      onClick={onClose}
                      className={`flex h-11 items-center justify-center rounded-xl text-sm font-extrabold transition-all hover:scale-105 ${
                        (meta?.name || picked) === currentBook &&
                        n === currentChapter
                          ? "bg-[#256E63] text-white shadow-md"
                          : "border border-[#c4a574]/30 bg-white/70 text-[#1f2a24] hover:border-[#256E63] dark:bg-white/10 dark:text-[#f4ead6]"
                      }`}
                    >
                      {n}
                    </Link>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BookGroup({
  title,
  books,
  current,
  onPick,
}: {
  title: string;
  books: BibleBook[];
  current: string;
  onPick: (name: string) => void;
}) {
  if (!books.length) return null;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
          {title}
        </p>
        <span className="text-[10px] font-bold text-[#8a7d68]">{books.length} Books</span>
      </div>

      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {books.map((b) => (
          <li key={b.name}>
            <button
              type="button"
              onClick={() => onPick(b.name)}
              className={`w-full rounded-xl px-3 py-2.5 text-left font-serif text-[15px] transition-all ${
                b.name === current
                  ? "border border-[#256E63]/40 bg-[#256E63]/15 font-bold text-[#256E63] dark:text-emerald-300"
                  : "border border-transparent bg-white/60 text-[#1f2a24] hover:bg-white dark:bg-white/5 dark:text-[#f4ead6] dark:hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{b.name}</span>
                <span className="text-[10px] font-sans font-normal text-[#8a7d68]">
                  {b.chapters || ""}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

