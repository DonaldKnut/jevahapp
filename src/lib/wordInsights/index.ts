import { BIBLE } from "./bible";
import { CHRISTIANITY } from "./christianity";
import { DEEP } from "./deep";
import { EVANGELISM } from "./evangelism";
import { EXORCISM } from "./exorcism";
import { GOSPEL } from "./gospel";
import { JESUS } from "./jesus";
import { KNOWLEDGE } from "./knowledge";
import { SCROLLS } from "./scrolls";
import { WISDOM } from "./wisdom";
import { WORD } from "./word";
import { INSIGHT_THEMES, type InsightTheme, type WordInsight } from "./types";

export type { InsightTheme, WordInsight } from "./types";
export { INSIGHT_THEMES } from "./types";

export const WORD_INSIGHTS: WordInsight[] = [
  ...WORD,
  ...BIBLE,
  ...JESUS,
  ...CHRISTIANITY,
  ...SCROLLS,
  ...GOSPEL,
  ...EVANGELISM,
  ...EXORCISM,
  ...DEEP,
  ...KNOWLEDGE,
  ...WISDOM,
];

export function insightForToday(date = new Date()): WordInsight {
  const day = Math.floor(date.getTime() / 86_400_000);
  const theme = INSIGHT_THEMES[day % INSIGHT_THEMES.length].id;
  const pool = WORD_INSIGHTS.filter((item) => item.theme === theme);
  return pool[Math.floor(day / INSIGHT_THEMES.length) % pool.length];
}

export function insightFromText(text: string): WordInsight {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length < 24) return insightForToday();
  return {
    theme: "word",
    topic: "From the Word",
    body: trimmed,
  };
}

export function themeLabel(theme: InsightTheme) {
  return INSIGHT_THEMES.find((t) => t.id === theme)?.label ?? theme;
}
