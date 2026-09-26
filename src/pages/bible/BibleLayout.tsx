import { FormEvent, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BibleProvider, useBible } from "./BibleContext";
import {
  bibleHomeHref,
  biblePlansHref,
  bibleSearchHref,
  readerHref,
} from "../../lib/bible/paths";
import TranslationChip from "./TranslationChip";
import ReaderJumpSearch from "./components/ReaderJumpSearch";

function BibleChrome() {
  const { translationId, notice, clearNotice } = useBible();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);

  const pathname = location.pathname;
  const isSearch = pathname.startsWith("/bible/search");
  const isPlans = pathname.startsWith("/bible/plans");
  const isCompare = pathname.startsWith("/bible/compare");
  const isHome = pathname === "/bible" || pathname === "/bible/";
  const isReader = !isHome && !isSearch && !isPlans && !isCompare;
  const pathParts = pathname.split("/");
  const readerBook = isReader ? decodeURIComponent(pathParts[2] || "") : "";
  const readerChapter = isReader ? Number(pathParts[3]) || 1 : 1;

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(clearNotice, 2800);
    return () => window.clearTimeout(id);
  }, [notice, clearNotice]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(bibleSearchHref(translationId, { q: term }));
  }

  return (
    <div className="bible-shell font-sans min-h-dvh pt-[4.5rem] sm:pt-[5.5rem]" lang="en">
      <div className="bible-gold-rule" />
      <div className="sticky top-16 z-30 border-b border-[#c4a574]/30 bg-[#fdfbf7]/90 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a1f1c]/90 sm:top-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={bibleHomeHref(translationId)}
              className="group flex min-w-0 items-center gap-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#c4a574]/40 bg-gradient-to-br from-[#f8f1e2] to-[#e6d5b7] text-[#9a7b3c] shadow-sm transition-transform duration-300 group-hover:scale-105 dark:from-[#16332e] dark:to-[#0a1f1c] dark:text-[#8fd4c8]">
                <span className="font-sans text-lg font-bold">✦</span>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a7b3c] dark:text-[#8fd4c8] sm:text-[11px]">
                  Jevah Bible
                </p>
                <p className="truncate font-sans text-base font-semibold tracking-tight text-[#1f2a24] dark:text-[#e4ebe9] sm:text-xl">
                  Scripture, still
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-1 rounded-full border border-[#c4a574]/30 bg-white/50 p-1 backdrop-blur-md dark:bg-white/5 sm:gap-1.5">
              <Link
                to={bibleHomeHref(translationId)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isHome
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#c8d5d2]"
                }`}
              >
                <HomeIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to={readerHref("John", 3, { verse: 16, translation: translationId })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isReader
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#c8d5d2]"
                }`}
              >
                <BookOpenIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Read</span>
              </Link>
              {isReader ? (
                <button
                  type="button"
                  data-bible-jump
                  onClick={() => setJumpOpen((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    jumpOpen
                      ? "bg-[#256E63] text-white shadow-sm"
                      : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#c8d5d2]"
                  }`}
                  aria-expanded={jumpOpen}
                  aria-haspopup="dialog"
                >
                  <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              ) : (
                <Link
                  to={bibleSearchHref(translationId)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    isSearch
                      ? "bg-[#256E63] text-white shadow-sm"
                      : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#c8d5d2]"
                  }`}
                >
                  <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
              )}
              <Link
                to={biblePlansHref(translationId)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isPlans
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#c8d5d2]"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Plans</span>
              </Link>
            </nav>
          </div>

          {isReader && jumpOpen && (
            <ReaderJumpSearch
              currentBook={readerBook}
              currentChapter={readerChapter}
              onClose={() => setJumpOpen(false)}
            />
          )}

          {!isReader && !isCompare && (
            <div className="flex items-center gap-2">
              <form onSubmit={onSearch} className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7b3c] dark:text-[#8fd4c8]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search love, John 3, Psalm 23…"
                  className="h-10 w-full rounded-full border border-[#c4a574]/40 bg-white/80 pl-10 pr-9 text-xs text-[#1f2a24] outline-none ring-[#256E63]/25 placeholder:text-[#8a7d68] focus:border-[#256E63] focus:ring-2 dark:bg-[#0d2622] dark:text-[#e4ebe9] dark:placeholder:text-[#8aa39e] sm:text-sm"
                  aria-label="Search the Bible"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </form>
              <TranslationChip />
            </div>
          )}
        </div>
      </div>
      <Outlet />
      {notice && <p className="bible-toast">{notice}</p>}
    </div>
  );
}

export default function BibleLayout() {
  return (
    <BibleProvider>
      <BibleChrome />
    </BibleProvider>
  );
}
