import type { BiblePlanDay, BibleReadingPlan } from "../../types/bible";

export function planId(p: BibleReadingPlan) {
  return String(p.id || p._id || p.slug || p.title || p.name || "");
}

export function planTitle(p: BibleReadingPlan) {
  return p.title || p.name || "Reading plan";
}

export function planDuration(p: BibleReadingPlan) {
  if (typeof p.days === "number") return p.days;
  return p.durationDays || 0;
}

function asDayList(raw: unknown): BiblePlanDay[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d) => d && typeof d === "object") as BiblePlanDay[];
}

export function planReadings(p: BibleReadingPlan): BiblePlanDay[] {
  const explicit = [
    ...asDayList(p.readings),
    ...asDayList(p.schedule),
    ...(Array.isArray(p.days) ? asDayList(p.days) : []),
  ];
  if (explicit.length) {
    return explicit.map((d, i) => ({
      ...d,
      day: d.day || i + 1,
      bookName: d.bookName || d.book,
      chapterNumber: d.chapterNumber || d.chapter,
    }));
  }

  const title = planTitle(p).toLowerCase();
  const days = planDuration(p);
  if (!days) return [];

  if (/\bjohn\b/.test(title) && !/1\s*john|2\s*john|3\s*john/.test(title)) {
    const n = Math.min(days, 21);
    return Array.from({ length: n }, (_, i) => ({
      day: i + 1,
      bookName: "John",
      chapterNumber: i + 1,
    }));
  }
  if (/psalm/.test(title)) {
    const n = Math.min(days, 150);
    return Array.from({ length: n }, (_, i) => ({
      day: i + 1,
      bookName: "Psalms",
      chapterNumber: i + 1,
    }));
  }
  if (/proverb/.test(title)) {
    const n = Math.min(days, 31);
    return Array.from({ length: n }, (_, i) => ({
      day: i + 1,
      bookName: "Proverbs",
      chapterNumber: i + 1,
    }));
  }
  return [];
}

const progressKey = (id: string) => `jevah-bible-plan:${id}`;

export type PlanProgress = {
  completed: number[];
  startedAt: string;
};

export function readPlanProgress(id: string): PlanProgress {
  try {
    const raw = localStorage.getItem(progressKey(id));
    if (!raw) return { completed: [], startedAt: "" };
    const parsed = JSON.parse(raw) as PlanProgress;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      startedAt: parsed.startedAt || "",
    };
  } catch {
    return { completed: [], startedAt: "" };
  }
}

export function writePlanProgress(id: string, next: PlanProgress) {
  try {
    localStorage.setItem(progressKey(id), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function dayHrefParts(d: BiblePlanDay) {
  const book = d.bookName || d.book || "";
  const chapter = Number(d.chapterNumber || d.chapter || 1) || 1;
  const verse = Number(d.verseNumber || d.verse || 0) || undefined;
  return { book, chapter, verse };
}
