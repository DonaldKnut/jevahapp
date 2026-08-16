export type BibleLicense = "public-domain" | "permissive" | "licensed" | string;

export type BibleTranslation = {
  id: string;
  abbreviation: string;
  name: string;
  language?: string;
  license?: BibleLicense;
  offline?: boolean;
  packBytes?: number | null;
  verseCount?: number;
  isDefault?: boolean;
};

export type BibleCatalog = {
  defaultId: string;
  translations: BibleTranslation[];
};

export type BibleBook = {
  name: string;
  testament: "old" | "new" | string;
  chapters?: number;
  order?: number;
  abbreviation?: string;
};

export type BibleVerse = {
  _id?: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  translation?: string;
};

export type BibleSearchHit = {
  verse: BibleVerse;
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
  text?: string;
};

export type BibleDailyVerse = {
  date?: string;
  verse?: BibleVerse;
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
  text?: string;
  reference?: string;
};

export type BibleStats = {
  totalBooks?: number;
  totalVerses?: number;
  oldTestamentBooks?: number;
  newTestamentBooks?: number;
  oldTestamentVerses?: number;
  newTestamentVerses?: number;
};

export type BiblePlanDay = {
  day?: number;
  book?: string;
  bookName?: string;
  chapter?: number;
  chapterNumber?: number;
  verse?: number;
  verseNumber?: number;
  reference?: string;
  title?: string;
  passage?: string;
};

export type BibleReadingPlan = {
  id?: string;
  _id?: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  days?: number | BiblePlanDay[];
  durationDays?: number;
  readings?: BiblePlanDay[];
  schedule?: BiblePlanDay[];
};

export type BibleFact = {
  title?: string;
  text?: string;
  body?: string;
  fact?: string;
};

export type BibleCommentary = {
  text: string | null;
  source?: string | null;
  title?: string | null;
};

export type BibleCrossRef = {
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text?: string;
  reference?: string;
};
