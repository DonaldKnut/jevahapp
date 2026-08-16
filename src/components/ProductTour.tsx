import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { TourStep } from "../lib/tours";

export default function ProductTour({
  open,
  steps,
  eyebrow,
  finishLabel = "Let’s go",
  onFinish,
}: {
  open: boolean;
  steps: TourStep[];
  eyebrow: string;
  finishLabel?: string;
  onFinish: () => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setIndex(0);
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
      if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, steps.length - 1));
      }
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onFinish, steps.length]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined" || steps.length === 0) {
    return null;
  }

  const step = steps[index];
  const Icon = step.icon;
  const last = index === steps.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Skip tour"
        className={`absolute inset-0 bg-[var(--jevah-overlay)] backdrop-blur-md transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onFinish}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-jevah-border/80 bg-jevah-surface shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition-all duration-300 sm:rounded-3xl ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-[0.96] opacity-0"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-jevah-accent via-[#4ECDC4] to-amber-400" />

        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent">
              {eyebrow}
            </p>
            <p className="mt-1 text-xs font-bold text-jevah-text-muted">
              {index + 1} of {steps.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onFinish}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
            aria-label="Close tour"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-emerald-500/10 text-jevah-accent ring-1 ring-jevah-accent/25">
            <Icon className="h-7 w-7" />
          </div>
          <h2
            id={titleId}
            className="mt-4 text-2xl font-black tracking-tight text-jevah-text"
          >
            {step.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
            {step.body}
          </p>
          {step.points && step.points.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {step.points.map((p) => (
                <li
                  key={p}
                  className="flex gap-2.5 rounded-xl bg-jevah-card/80 px-3 py-2.5 text-sm text-jevah-text ring-1 ring-jevah-border/70"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jevah-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 px-5 pb-2 sm:px-6">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 flex-1 rounded-full transition ${
                i === index
                  ? "bg-jevah-accent"
                  : i < index
                    ? "bg-jevah-accent/40"
                    : "bg-jevah-border"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-jevah-border/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onFinish}
            className="text-sm font-bold text-jevah-text-muted transition hover:text-jevah-text"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="rounded-full border border-jevah-border px-4 py-2 text-sm font-bold text-jevah-text transition hover:bg-jevah-card"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (last) onFinish();
                else setIndex((i) => i + 1);
              }}
              className="rounded-full bg-jevah-accent px-5 py-2 text-sm font-extrabold text-white shadow-md shadow-jevah-accent/25 transition hover:bg-jevah-accent-hover"
            >
              {last ? finishLabel : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
