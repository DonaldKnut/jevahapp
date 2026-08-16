import { FormEvent, useState } from "react";
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

function BibleChrome() {
  const { translations, translationId, setTranslationId, catalogFailed } =
    useBible();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const selected = translations.find((t) => t.id === translationId);

  const pathname = location.pathname;
  const isSearch = pathname.startsWith("/bible/search");
  const isPlans = pathname.startsWith("/bible/plans");
  const isHome = pathname === "/bible" || pathname === "/bible/";
  const isReader = !isHome && !isSearch && !isPlans;

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(bibleSearchHref(translationId, { q: term }));
  }

  return (
    <div className="bible-shell font-sans min-h-dvh pt-[4.5rem] sm:pt-[5.5rem]">
      <div className="bible-gold-rule" />
      <div className="sticky top-16 z-30 border-b border-[#c4a574]/30 bg-[#fdfbf7]/90 backdrop-blur-2xl dark:border-amber-500/20 dark:bg-[#16130f]/90 sm:top-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={bibleHomeHref(translationId)}
              className="group flex items-center gap-2.5 min-w-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#c4a574]/40 bg-gradient-to-br from-[#f8f1e2] to-[#e6d5b7] text-[#9a7b3c] shadow-sm transition-transform duration-300 group-hover:scale-105 dark:from-[#2e261d] dark:to-[#1a140d] dark:text-[#e2c286]">
                <span className="font-sans text-lg font-bold">✦</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a7b3c] dark:text-[#e2c286] sm:text-[11px]">
                    Jevah Holy Bible
                  </p>
                  <span className="hidden rounded-full border border-[#c4a574]/30 bg-[#256e63]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#256e63] dark:bg-[#256e63]/25 dark:text-emerald-300 md:inline-block">
                    {selected?.abbreviation || "WEB"}
                  </span>
                </div>
                <p className="truncate font-sans text-base font-semibold tracking-tight text-[#1f2a24] dark:text-[#f4ead6] sm:text-xl">
                  Scripture, beautifully read
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-1 rounded-full border border-[#c4a574]/30 bg-white/50 p-1 backdrop-blur-md dark:bg-white/5 sm:gap-1.5">
              <Link
                to={bibleHomeHref(translationId)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isHome
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#cbbfa8]"
                }`}
              >
                <HomeIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </Link>
              <Link
                to={readerHref("John", 1, { translation: translationId })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isReader
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#cbbfa8]"
                }`}
              >
                <BookOpenIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reader</span>
              </Link>
              <Link
                to={bibleSearchHref(translationId)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isSearch
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#cbbfa8]"
                }`}
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </Link>
              <Link
                to={biblePlansHref(translationId)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  isPlans
                    ? "bg-[#256E63] text-white shadow-sm"
                    : "text-[#6b5a3a] hover:bg-[#256E63]/10 dark:text-[#cbbfa8]"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Plans</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={onSearch} className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7b3c] dark:text-[#e2c286]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search love, John 3, Psalm 23, grace…"
                className="h-10 w-full rounded-full border border-[#c4a574]/40 bg-white/80 pl-10 pr-9 text-xs text-[#1f2a24] outline-none ring-[#256E63]/25 placeholder:text-[#8a7d68] focus:border-[#256E63] focus:ring-2 dark:bg-[#241e17] dark:text-[#f4ead6] dark:placeholder:text-[#a3947c] sm:text-sm"
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

            {!catalogFailed && translations.length > 0 && (
              <label className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#c4a574]/40 bg-white/80 px-3 text-[11px] font-bold text-[#6b5a3a] shadow-sm dark:bg-[#241e17] dark:text-[#e2c286]">
                <span className="hidden uppercase sm:inline">{selected?.abbreviation || "WEB"}</span>
                <select
                  value={translationId || ""}
                  onChange={(e) => setTranslationId(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold uppercase text-[#1f2a24] outline-none cursor-pointer dark:text-[#f4ead6]"
                  aria-label="Translation"
                >
                  {translations.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-[#1a1610]">
                      {t.abbreviation} · {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      </div>
      <Outlet />
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

