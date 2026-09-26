import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useBible } from "../BibleContext";
import { searchBible } from "../../../services/bible";
import { readerHref, verseRef } from "../../../lib/bible/paths";
import {
  parseJumpQuery,
  suggestBooks,
  type JumpTarget,
} from "../../../lib/bible/parseJump";
import type { BibleVerse } from "../../../types/bible";

type Props = {
  currentBook: string;
  currentChapter: number;
  onClose: () => void;
};

function scrollToVerse(verse: number) {
  const el = document.getElementById(`v-${verse}`);
  if (!el) return false;
  el.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "center",
  });
  el.classList.add("bible-verse--active");
  return true;
}

export default function ReaderJumpSearch({
  currentBook,
  currentChapter,
  onClose,
}: Props) {
  const { books, translationId, corpusVersion } = useBible();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<BibleVerse[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: PointerEvent) => {
      const node = e.target as HTMLElement | null;
      if (node?.closest("[data-bible-jump]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [onClose]);

  const parsed = useMemo(
    () => parseJumpQuery(q, books, currentBook, currentChapter),
    [q, books, currentBook, currentChapter]
  );
  const bookHits = useMemo(
    () => (parsed ? [] : suggestBooks(q, books, 5)),
    [parsed, q, books]
  );

  useEffect(() => {
    const term = q.trim();
    if (parsed || term.length < 3) {
      setHits([]);
      setSearching(false);
      return;
    }
    let alive = true;
    setSearching(true);
    const id = window.setTimeout(() => {
      void searchBible({
        q: term,
        translation: translationId,
        limit: 6,
        corpusVersion,
      })
        .then((list) => {
          if (alive) setHits(list);
        })
        .catch(() => {
          if (alive) setHits([]);
        })
        .finally(() => {
          if (alive) setSearching(false);
        });
    }, 280);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [q, parsed, translationId, corpusVersion]);

  function go(target: JumpTarget) {
    const samePlace =
      target.book.toLowerCase() === currentBook.toLowerCase() &&
      target.chapter === currentChapter;
    if (samePlace && target.verse) {
      const href = readerHref(target.book, target.chapter, {
        verse: target.verse,
        translation: translationId,
      });
      navigate(href, { replace: true });
      window.requestAnimationFrame(() => scrollToVerse(target.verse!));
      onClose();
      return;
    }
    navigate(
      readerHref(target.book, target.chapter, {
        verse: target.verse,
        translation: translationId,
      })
    );
    onClose();
  }

  function goHit(v: BibleVerse) {
    go({
      book: v.bookName,
      chapter: v.chapterNumber,
      verse: v.verseNumber,
      label: verseRef(v.bookName, v.chapterNumber, v.verseNumber),
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (parsed) {
      go(parsed);
      return;
    }
    if (hits[0]) {
      goHit(hits[0]);
      return;
    }
    if (bookHits[0]) {
      go({ book: bookHits[0].name, chapter: 1, label: bookHits[0].name });
    }
  }

  return (
    <div className="bible-jump" ref={rootRef} data-bible-jump>
      <form onSubmit={onSubmit} className="bible-jump-form">
        <MagnifyingGlassIcon className="bible-jump-icon" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="John 3:16, Psalms 23, Moses, David…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Jump to a passage"
        />
        {q ? (
          <button
            type="button"
            className="bible-jump-clear"
            onClick={() => setQ("")}
            aria-label="Clear"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      <ul className="bible-jump-list">
        {parsed ? (
          <li>
            <button type="button" onClick={() => go(parsed)}>
              <span className="bible-jump-kicker">Go to</span>
              <span>{parsed.label}</span>
            </button>
          </li>
        ) : null}

        {bookHits.map((b) => (
          <li key={b.name}>
            <button
              type="button"
              onClick={() =>
                go({ book: b.name, chapter: 1, label: b.name })
              }
            >
              <span className="bible-jump-kicker">Book</span>
              <span>{b.name}</span>
            </button>
          </li>
        ))}

        {hits.map((v, i) => (
          <li key={`${v.bookName}-${v.chapterNumber}-${v.verseNumber}-${i}`}>
            <button type="button" onClick={() => goHit(v)}>
              <span className="bible-jump-kicker">
                {verseRef(v.bookName, v.chapterNumber, v.verseNumber)}
              </span>
              <span className="bible-jump-snippet">{v.text}</span>
            </button>
          </li>
        ))}

        {searching ? (
          <li className="bible-jump-status">Looking in Scripture…</li>
        ) : null}
        {!parsed &&
        !bookHits.length &&
        !hits.length &&
        !searching &&
        q.trim().length >= 3 ? (
          <li className="bible-jump-status">No match yet. Try a book or verse.</li>
        ) : null}
      </ul>
    </div>
  );
}
