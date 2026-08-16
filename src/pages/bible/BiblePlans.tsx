import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useBible } from "./BibleContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { fetchReadingPlans } from "../../services/bible";
import {
  biblePlansHref,
  readerHref,
} from "../../lib/bible/paths";
import {
  dayHrefParts,
  planDuration,
  planId,
  planReadings,
  planTitle,
  readPlanProgress,
  writePlanProgress,
  type PlanProgress,
} from "../../lib/bible/plans";
import type { BibleReadingPlan } from "../../types/bible";

const STARTERS: BibleReadingPlan[] = [
  {
    id: "jevah-john",
    title: "Gospel of John",
    description:
      "One chapter a day through the Word made flesh. A tranquil path to walk through the miracles and teachings of Jesus.",
    days: 21,
  },
  {
    id: "jevah-psalms-30",
    title: "Psalms: 30 Days of Worship",
    description:
      "A daily Psalm for prayer, praise, and comfort. Progress is automatically saved on this device.",
    days: 30,
  },
];

export default function BiblePlans() {
  const { planId: routeId } = useParams();
  const { translationId } = useBible();
  const [plans, setPlans] = useState<BibleReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Bible Reading Plans — Jevah Holy Bible",
    description:
      "Guided Scripture reading plans to build a daily Bible habit. Track your progress seamlessly on Jevah.",
    canonicalPath: translationId
      ? `/bible/plans?translation=${encodeURIComponent(translationId)}`
      : "/bible/plans",
  });

  useEffect(() => {
    void fetchReadingPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const merged = useMemo(() => {
    const seen = new Set(plans.map(planId));
    const extras = STARTERS.filter((s) => !seen.has(planId(s)));
    return [...extras, ...plans];
  }, [plans]);

  const selected = routeId
    ? merged.find((p) => planId(p) === decodeURIComponent(routeId))
    : null;

  if (routeId) {
    if (loading) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-[#9a7b3c]" />
          <p className="mt-3 text-sm text-[#8a7d68]">Opening reading plan…</p>
        </main>
      );
    }
    if (!selected) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-base text-[#6b6256]">That reading plan was not found.</p>
          <Link
            to={biblePlansHref(translationId)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#256E63] px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>All Reading Plans</span>
          </Link>
        </main>
      );
    }
    return <PlanDetail plan={selected} translationId={translationId} />;
  }

  return (
    <main className="bible-page-enter mx-auto max-w-4xl px-3 py-10 sm:px-6 sm:py-12">
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c4a574]/40 bg-white/70 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#9a7b3c] shadow-sm backdrop-blur-md dark:bg-white/5 dark:text-[#e2c286]">
          <CalendarIcon className="h-3.5 w-3.5 text-[#256e63]" />
          <span>Daily Scripture Rhythm</span>
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#1f2a24] dark:text-[#f4ead6] sm:text-5xl">
          Reading Plans
        </h1>
        <p className="mt-2 text-sm text-[#6b6256] dark:text-[#cbbfa8]">
          Structured daily reading paths to keep your mind fixed on the Word.
          Progress is saved on this device as you check off each day.
        </p>
      </header>

      {loading ? (
        <div className="mt-16 text-center">
          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-[#9a7b3c]" />
          <p className="mt-3 font-serif text-lg text-[#8a7d68]">Gathering plan library…</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {merged.map((p, i) => {
            const id = planId(p);
            const days = planDuration(p) || planReadings(p).length;
            const progress = readPlanProgress(id);
            const done = progress.completed.length;
            const pct = days ? Math.round((done / days) * 100) : 0;

            return (
              <div
                key={id}
                className="bible-card-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  to={biblePlansHref(translationId, id)}
                  className="group flex flex-col justify-between h-full rounded-2xl border border-[#c4a574]/30 bg-white/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#256E63] hover:shadow-md dark:bg-white/5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#c4a574]/15 px-3 py-1 font-serif text-[10px] font-extrabold uppercase tracking-widest text-[#9a7b3c] dark:text-[#e2c286]">
                        {days ? `${days} Days` : "Self-Paced"}
                      </span>
                      {pct > 0 && (
                        <span className="text-xs font-bold text-[#256e63]">
                          {pct}% Done
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 font-serif text-2xl font-bold text-[#1f2a24] group-hover:text-[#256E63] dark:text-[#f4ead6] dark:group-hover:text-emerald-300">
                      {planTitle(p)}
                    </h2>

                    {p.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[#6b6256] dark:text-[#cbbfa8]">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[#c4a574]/20 pt-4">
                    {days > 0 && (
                      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#c4a574]/20">
                        <div
                          className="h-full rounded-full bg-[#256E63] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#256e63] group-hover:underline">
                      <span>{done > 0 ? "Continue Plan" : "Start Plan"}</span>
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function PlanDetail({
  plan,
  translationId,
}: {
  plan: BibleReadingPlan;
  translationId: string | null;
}) {
  const id = planId(plan);
  const readings = planReadings(plan);
  const days = planDuration(plan) || readings.length || 0;
  const [progress, setProgress] = useState<PlanProgress>(() =>
    readPlanProgress(id)
  );

  useDocumentMeta({
    title: `${planTitle(plan)} — Jevah Bible Plan`,
    description:
      plan.description ||
      `A ${days || ""}-day guided path through Scripture on Jevah.`.trim(),
    canonicalPath: `/bible/plans/${encodeURIComponent(id)}${
      translationId ? `?translation=${encodeURIComponent(translationId)}` : ""
    }`,
  });

  function toggleDay(n: number) {
    const completed = progress.completed.includes(n)
      ? progress.completed.filter((d) => d !== n)
      : [...progress.completed, n];
    const next = {
      completed,
      startedAt: progress.startedAt || new Date().toISOString(),
    };
    setProgress(next);
    writePlanProgress(id, next);
  }

  const done = progress.completed.length;
  const pct = days ? Math.round((done / days) * 100) : 0;

  return (
    <main className="bible-page-enter mx-auto max-w-3xl px-3 py-10 sm:px-6 sm:py-12">
      <Link
        to={biblePlansHref(translationId)}
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#256E63] hover:underline"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        <span>All Reading Plans</span>
      </Link>

      <h1 className="mt-3 font-serif text-3xl font-bold text-[#1f2a24] dark:text-[#f4ead6] sm:text-4xl">
        {planTitle(plan)}
      </h1>

      {plan.description && (
        <p className="mt-2 text-base leading-relaxed text-[#6b6256] dark:text-[#cbbfa8]">
          {plan.description}
        </p>
      )}

      {/* Progress Box */}
      {days > 0 && (
        <div className="mt-6 rounded-2xl border border-[#c4a574]/30 bg-white/60 p-5 backdrop-blur-md dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#9a7b3c] dark:text-[#e2c286]">
            <span>
              Overall Progress: {done} of {days} Days Complete
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#c4a574]/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#256E63] to-[#1e574e] transition-all duration-500 shadow-sm"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Daily Readings Checklist */}
      {readings.length > 0 ? (
        <ol className="mt-8 space-y-3">
          {readings.map((d, i) => {
            const n = d.day || i + 1;
            const { book, chapter, verse } = dayHrefParts(d);
            const marked = progress.completed.includes(n);
            return (
              <li
                key={`${n}-${book}-${chapter}`}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 backdrop-blur-md transition-all ${
                  marked
                    ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15"
                    : "border-[#c4a574]/30 bg-white/60 hover:border-[#256E63]/40 dark:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDay(n)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-transform active:scale-95 ${
                    marked
                      ? "bg-[#256E63] text-white shadow-sm"
                      : "border border-[#c4a574]/40 bg-white/70 text-[#6b5a3a] dark:bg-white/10 dark:text-[#e2c286]"
                  }`}
                  aria-label={marked ? `Unmark Day ${n}` : `Mark Day ${n}`}
                >
                  {marked ? <CheckIcon className="h-5 w-5 stroke-[3]" /> : n}
                </button>

                {book ? (
                  <Link
                    to={readerHref(book, chapter, {
                      verse,
                      translation: translationId,
                    })}
                    className="min-w-0 flex-1 font-serif text-lg font-semibold text-[#1f2a24] hover:text-[#256E63] dark:text-[#f4ead6] dark:hover:text-emerald-300"
                  >
                    {d.title || d.reference || d.passage || `${book} ${chapter}`}
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1 font-serif text-lg font-semibold text-[#1f2a24] dark:text-[#f4ead6]">
                    {d.title || d.reference || `Day ${n}`}
                  </span>
                )}

                {book && (
                  <Link
                    to={readerHref(book, chapter, {
                      verse,
                      translation: translationId,
                    })}
                    className="shrink-0 rounded-full border border-[#c4a574]/40 bg-white/60 px-3 py-1 text-xs font-bold text-[#6b5a3a] hover:bg-[#256e63] hover:text-white dark:bg-white/5 dark:text-[#e2c286]"
                  >
                    Read →
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#c4a574]/40 p-6 text-center text-sm text-[#6b6256] dark:text-[#cbbfa8]">
          <p>
            Use the canon library to read daily and mark completed days above as you go
            {days ? ` (${days} total days)` : ""}.
          </p>
          <Link
            to={readerHref("John", 1, { translation: translationId })}
            className="mt-3 inline-flex items-center gap-1 font-bold text-[#256E63] underline"
          >
            <span>Begin at John 1</span>
            <SparklesIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
    </main>
  );
}

