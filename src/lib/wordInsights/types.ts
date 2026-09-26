export type InsightTheme =
  | "word"
  | "bible"
  | "jesus"
  | "christianity"
  | "scrolls"
  | "gospel"
  | "evangelism"
  | "exorcism"
  | "deep"
  | "knowledge"
  | "wisdom";

export type WordInsight = {
  theme: InsightTheme;
  topic: string;
  body: string;
  scripture?: string;
};

export const INSIGHT_THEMES: { id: InsightTheme; label: string }[] = [
  { id: "word", label: "The Word of God" },
  { id: "bible", label: "The Bible" },
  { id: "jesus", label: "Jesus" },
  { id: "christianity", label: "Christianity" },
  { id: "scrolls", label: "Ancient scrolls" },
  { id: "gospel", label: "The Gospel" },
  { id: "evangelism", label: "Evangelism" },
  { id: "exorcism", label: "Deliverance" },
  { id: "deep", label: "Deep things of God" },
  { id: "knowledge", label: "Knowledge over the world" },
  { id: "wisdom", label: "Ancient wisdom" },
];
