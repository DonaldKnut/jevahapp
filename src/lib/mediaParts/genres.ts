/** Backend TRACK_GENRES — one catalog enum for apply + upload + browse. */
export const TRACK_GENRES = [
  "gospel",
  "contemporary_christian",
  "afro_gospel",
  "hymn",
  "choir",
  "rap_gospel",
  "highlife_gospel",
  "other",
] as const;

export type TrackGenre = (typeof TRACK_GENRES)[number];

export const TRACK_GENRE_LABELS: Record<TrackGenre, string> = {
  gospel: "Gospel",
  contemporary_christian: "Contemporary Christian",
  afro_gospel: "Afro Gospel",
  hymn: "Hymn",
  choir: "Choir",
  rap_gospel: "Gospel Rap",
  highlife_gospel: "Highlife Gospel",
  other: "Other",
};

export function genreLabel(g: string) {
  return TRACK_GENRE_LABELS[g as TrackGenre] || g.replace(/_/g, " ");
}
