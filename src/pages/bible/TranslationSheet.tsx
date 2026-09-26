import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useBible } from "./BibleContext";
import { compareHref } from "../../lib/bible/paths";
import { translationVoice } from "../../lib/bible/translations";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TranslationSheet({ open, onClose }: Props) {
  const { translations, translationId, setTranslationId } = useBible();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const wide = window.matchMedia("(min-width: 768px)").matches;
    window.setTimeout(() => {
      if (wide) searchRef.current?.focus();
    }, 40);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return translations;
    return translations.filter((t) => {
      const voice = translationVoice(t.id).toLowerCase();
      return (
        t.abbreviation.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        voice.includes(q)
      );
    });
  }, [translations, query]);

  if (!open || typeof document === "undefined") return null;

  const readerBook = params.book ? decodeURIComponent(params.book) : "";
  const readerChapter = Number(params.chapter) || 0;
  const verse =
    Number(searchParams.get("verse") || params.verse || 0) || 0;
  const onPassage =
    Boolean(readerBook && readerChapter) &&
    !location.pathname.startsWith("/bible/compare");

  return createPortal(
    <div
      className="bible-trans-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="bible-trans-backdrop"
        aria-label="Close translations"
        onClick={onClose}
      />

      <div className="bible-trans-panel">
        <div className="bible-trans-handle" aria-hidden />

        <header className="bible-trans-head">
          <h2 id={titleId} className="bible-trans-title">
            Choose a translation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bible-trans-close"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <label className="bible-trans-search">
          <MagnifyingGlassIcon className="bible-trans-search-icon" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search WEB, KJV, Darby…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>

        <ul className="bible-trans-list">
          {filtered.length === 0 ? (
            <li className="bible-trans-empty">No match for “{query.trim()}”.</li>
          ) : (
            filtered.map((t) => {
              const active = t.id === translationId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTranslationId(t.id);
                      onClose();
                    }}
                    className={`bible-trans-row ${active ? "is-active" : ""}`}
                    aria-current={active ? "true" : undefined}
                  >
                    <span className="bible-trans-abbr">{t.abbreviation}</span>
                    <span className="bible-trans-copy">
                      <span className="bible-trans-row-name">{t.name}</span>
                      <span className="bible-trans-row-voice">
                        {translationVoice(t.id)}
                      </span>
                    </span>
                    {active ? (
                      <CheckIcon className="bible-trans-check" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {onPassage ? (
          <Link
            to={compareHref(readerBook, readerChapter, {
              verse: verse || undefined,
              left: "web",
              right: translationId === "web" ? "kjv" : translationId,
            })}
            onClick={onClose}
            className="bible-trans-compare"
          >
            Compare this chapter
          </Link>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
