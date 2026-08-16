import { Link } from "react-router-dom";
import { ArrowPathIcon, BookOpenIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { readerHref, verseRef } from "../../../lib/bible/paths";
import type { BibleCommentary, BibleCrossRef } from "../../../types/bible";

export default function VerseStudyPanel({
  open,
  onClose,
  book,
  chapter,
  verse,
  translationId,
  commentary,
  refs,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verse: number;
  translationId: string | null;
  commentary: BibleCommentary | null;
  refs: BibleCrossRef[];
  loading: boolean;
}) {
  if (!open) return null;
  const ref = verseRef(book, chapter, verse);

  return (
    <div className="bible-sheet-root" role="dialog" aria-modal="true">
      <button
        type="button"
        className="bible-sheet-backdrop"
        aria-label="Close study panel"
        onClick={onClose}
      />
      <aside className="bible-sheet bible-sheet--study">
        <div className="flex items-start justify-between gap-3 border-b border-[#c4a574]/20 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
              <BookOpenIcon className="h-4 w-4 text-[#256e63]" />
              <span>Exposition & Cross-References</span>
            </div>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[#1f2a24] dark:text-[#f4ead6]">
              {ref}
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

        <div className="bible-sheet-scroll mt-4 space-y-6 pr-1">
          {/* Commentary Section */}
          <section className="rounded-2xl border border-[#c4a574]/30 bg-white/60 p-4 backdrop-blur-md dark:bg-white/5">
            <div className="flex items-center justify-between border-b border-[#c4a574]/20 pb-2">
              <h3 className="font-serif text-xs font-extrabold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
                Explanatory Commentary
              </h3>
              <SparklesIcon className="h-3.5 w-3.5 text-[#256e63]" />
            </div>

            {loading ? (
              <div className="py-4 text-center">
                <ArrowPathIcon className="mx-auto h-5 w-5 animate-spin text-[#9a7b3c]" />
                <p className="mt-2 text-xs text-[#8a7d68]">Retrieving commentary notes…</p>
              </div>
            ) : commentary?.text ? (
              <div className="mt-3">
                <p className="font-serif text-base leading-relaxed text-[#1f2a24] dark:text-[#f4ead6]">
                  {commentary.text}
                </p>
                {commentary.source && (
                  <p className="mt-3 border-t border-[#c4a574]/20 pt-2 text-right text-[11px] italic font-semibold text-[#8a7d68] dark:text-[#a3947c]">
                    Source: {commentary.source}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs italic text-[#8a7d68]">
                No public commentary notes found for this specific verse reference yet.
              </p>
            )}
          </section>

          {/* Cross References Section */}
          <section className="rounded-2xl border border-[#c4a574]/30 bg-white/60 p-4 backdrop-blur-md dark:bg-white/5">
            <div className="flex items-center justify-between border-b border-[#c4a574]/20 pb-2">
              <h3 className="font-serif text-xs font-extrabold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
                Scripture Cross-References ({refs.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-4 text-center">
                <ArrowPathIcon className="mx-auto h-5 w-5 animate-spin text-[#9a7b3c]" />
                <p className="mt-2 text-xs text-[#8a7d68]">Gathering related passages…</p>
              </div>
            ) : refs.length === 0 ? (
              <p className="mt-3 text-xs italic text-[#8a7d68]">
                No linked cross-references available for this verse.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {refs.map((r, i) => (
                  <li key={`${r.bookName}-${r.chapterNumber}-${r.verseNumber}-${i}`}>
                    <Link
                      to={readerHref(r.bookName, r.chapterNumber, {
                        verse: r.verseNumber,
                        translation: translationId,
                      })}
                      onClick={onClose}
                      className="group flex flex-col justify-between rounded-xl border border-[#c4a574]/25 bg-white/70 p-3 transition-all hover:border-[#256E63] hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#9a7b3c] group-hover:text-[#256E63] dark:text-[#e2c286] dark:group-hover:text-emerald-300">
                        <span>
                          {r.reference ||
                            verseRef(r.bookName, r.chapterNumber, r.verseNumber)}
                        </span>
                        <span className="text-[10px]">Open →</span>
                      </div>
                      {r.text && (
                        <p className="mt-1.5 line-clamp-3 font-serif text-sm leading-relaxed text-[#1f2a24] dark:text-[#f4ead6]">
                          “{r.text}”
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

