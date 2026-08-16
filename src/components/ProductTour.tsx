import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { TourStep } from "../lib/tours";

export default function ProductTour({
  open,
  steps,
  eyebrow,
  finishLabel = "Let’s go!",
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
  const [animating, setAnimating] = useState(false);

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
    const t = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
      if (e.key === "ArrowRight") {
        setIndex((i) => {
          if (i < steps.length - 1) {
            triggerAnimation();
            return i + 1;
          }
          return i;
        });
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => {
          if (i > 0) {
            triggerAnimation();
            return i - 1;
          }
          return i;
        });
      }
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

  const triggerAnimation = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 250);
  };

  const changeStep = (newIndex: number) => {
    if (newIndex === index) return;
    triggerAnimation();
    setIndex(newIndex);
  };

  if (!mounted || typeof document === "undefined" || steps.length === 0) {
    return null;
  }

  const step = steps[index];
  const Icon = step.icon;
  const last = index === steps.length - 1;
  const progressPercent = Math.round(((index + 1) / steps.length) * 100);

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      {/* Backdrop overlay with blur */}
      <button
        type="button"
        aria-label="Skip tour"
        className={`absolute inset-0 bg-slate-950/75 backdrop-blur-xl transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onFinish}
      />

      {/* Main Dialog Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex max-h-[min(92dvh,740px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0D1117] shadow-[0_32px_90px_rgba(0,0,0,0.65)] transition-all duration-300 sm:rounded-3xl ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-[0.96] opacity-0"
        }`}
      >
        {/* Animated Top Progress Bar */}
        <div className="relative h-1.5 w-full bg-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ambient Top Glow background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-gradient-to-b from-amber-500/15 via-emerald-500/10 to-transparent blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-400 shadow-sm shadow-amber-500/10">
              <SparklesIcon className="h-3.5 w-3.5" />
              {eyebrow}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
              Step {index + 1} of {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onFinish}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Close tour"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div
            className={`transition-all duration-250 ${
              animating
                ? "opacity-40 translate-y-1 scale-[0.99]"
                : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            {/* Step Icon Badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-emerald-500/20 text-amber-400 ring-1 ring-amber-500/35 shadow-xl shadow-amber-500/10">
              <Icon className="h-8 w-8" />
            </div>

            {/* Title */}
            <h2
              id={titleId}
              className="mt-4 text-2xl font-extrabold tracking-tight text-white"
            >
              {step.title}
            </h2>

            {/* Layman Description */}
            <p className="mt-2.5 text-sm leading-relaxed text-slate-300 font-normal">
              {step.body}
            </p>

            {/* Key Bullet Points */}
            {step.points && step.points.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {step.points.map((p, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-slate-200 transition duration-200 hover:border-amber-500/30 hover:bg-white/[0.05]"
                  >
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Layman Pro Tip Box */}
            {step.tip ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/15 to-emerald-500/10 px-4 py-3.5 text-xs text-amber-200/90 leading-relaxed shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                  <LightBulbIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-amber-300 mb-0.5">Layman Tip</p>
                  <p className="text-amber-100/80">{step.tip}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 px-6 py-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => changeStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : i < index
                  ? "w-2 bg-emerald-400/60"
                  : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* Modal Footer Controls */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur-md">
          {/* Keyboard Hints & Skip */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onFinish}
              className="text-xs font-bold text-slate-400 transition hover:text-white"
            >
              Skip tour
            </button>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-slate-400">←</kbd>
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-slate-400">→</kbd>
            </div>
          </div>

          {/* Nav Action Buttons */}
          <div className="flex items-center gap-2.5">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => changeStep(index - 1)}
                className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (last) onFinish();
                else changeStep(index + 1);
              }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-300 hover:to-amber-500 hover:shadow-amber-500/40 active:scale-95"
            >
              <span>{last ? finishLabel : "Next"}</span>
              {!last && <ChevronRightIcon className="h-4 w-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

