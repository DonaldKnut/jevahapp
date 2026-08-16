export const MUSIC_VIEWS = ["list", "gallery", "salon"] as const;
export type MusicView = (typeof MUSIC_VIEWS)[number];

const KEY = "jevah-music-view";

export function isMusicView(value: string | null | undefined): value is MusicView {
  return value === "list" || value === "gallery" || value === "salon";
}

export function readMusicView(): MusicView {
  try {
    const stored = localStorage.getItem(KEY);
    if (isMusicView(stored)) return stored;
  } catch {
    /* private mode */
  }
  return "gallery";
}

export function writeMusicView(view: MusicView) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    /* private mode */
  }
}
