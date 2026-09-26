import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { fetchDailyFact } from "../services/bible";
import {
  INSIGHT_THEMES,
  insightForToday,
  insightFromText,
  type WordInsight as Insight,
} from "../lib/wordInsights";

const DELAY_MS = 7000;
const STORAGE_KEY = "jevah.wordInsight.day";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function alreadyShownToday() {
  try {
    return localStorage.getItem(STORAGE_KEY) === todayKey();
  } catch {
    return false;
  }
}

function markShown() {
  try {
    localStorage.setItem(STORAGE_KEY, todayKey());
  } catch {
    /* ignore */
  }
}

function reveal(setOpen: (v: boolean) => void, setVisible: (v: boolean) => void) {
  setOpen(true);
  markShown();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => setVisible(true));
  });
}

/**
 * Once a day, after seven quiet seconds on the homepage.
 * Themes rotate: Word, Bible, Jesus, church, scrolls, Gospel,
 * evangelism, deliverance, the deep things, and true knowledge.
 */
export default function WordInsight() {
  const titleId = useId();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (alreadyShownToday()) return;
    let cancelled = false;
    const planned = insightForToday();
    const timer = window.setTimeout(() => {
      if (cancelled || alreadyShownToday()) return;
      void fetchDailyFact()
        .then((text) => {
          if (cancelled) return;
          setInsight(planned.theme === "word" && text ? insightFromText(text) : planned);
          reveal(setOpen, setVisible);
        })
        .catch(() => {
          if (cancelled) return;
          setInsight(planned);
          reveal(setOpen, setVisible);
        });
    }, DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    if (leaving) return;
    setLeaving(true);
    setVisible(false);
    window.setTimeout(() => {
      setOpen(false);
      setLeaving(false);
    }, 280);
  }

  if (!open || !insight || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss today’s word"
        className={`word-insight-veil absolute inset-0 ${visible ? "is-in" : ""}`}
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`word-insight-card relative z-10 w-full max-w-lg ${visible ? "is-in" : ""}`}
      >
        <div className="word-insight-rule" />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-jevah-accent">
          A quiet word · seven seconds
        </p>
        <p
          id={titleId}
          className="mt-3 font-serif text-xl font-semibold tracking-tight text-jevah-text sm:text-2xl"
        >
          {insight.topic}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-jevah-text">{insight.body}</p>
        {insight.scripture ? (
          <p className="mt-3 text-xs font-semibold tracking-wide text-jevah-accent">
            {insight.scripture}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {INSIGHT_THEMES.map((theme) => (
            <span
              key={theme.id}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                theme.id === insight.theme
                  ? "bg-jevah-accent text-white"
                  : "bg-jevah-card text-jevah-text-muted"
              }`}
            >
              {theme.label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[11px] text-jevah-text-muted">
            One theme a day. Esc to close.
          </p>
          <button
            type="button"
            onClick={close}
            className="rounded-full bg-jevah-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-jevah-accent-hover"
          >
            Amen
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
