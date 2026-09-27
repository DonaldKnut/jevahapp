import type { CopyrightFreeSong, TrackCard } from "../../types/media";
import { entityId } from "../api/unwrap";

export function trackId(t: Pick<TrackCard, "id" | "_id"> | null | undefined) {
  return entityId(t);
}

/** Player URL — prefer flat fields, then nested audio.* aliases. */
export function trackPlaybackUrl(t: TrackCard) {
  return (
    t.playbackUrl ||
    t.fileUrl ||
    t.audioUrl ||
    t.audio?.playbackUrl ||
    t.audio?.fileUrl ||
    t.audio?.url ||
    null
  );
}

export function trackArtist(t: TrackCard) {
  if (t.artistName) return t.artistName;
  if (t.singer) return t.singer;
  if (typeof t.artist === "string" && t.artist.trim()) return t.artist;
  if (t.artist && typeof t.artist === "object") {
    return t.artist.displayName || t.artist.name || "Unknown";
  }
  return "Unknown";
}

export function trackArtistSlug(t: TrackCard) {
  if (t.artistSlug) return t.artistSlug;
  if (t.artist && typeof t.artist === "object") return t.artist.slug || null;
  return null;
}

/** HTTP(S) file only — `pending://` means the creator PUT never finished. */
export function trackPlayableUrl(t: TrackCard) {
  const url = trackPlaybackUrl(t);
  if (!url || /^pending:/i.test(url)) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

export function trackDuration(t: TrackCard) {
  const d = t.durationSec ?? t.audio?.durationSec ?? t.duration;
  if (d == null || d === "") return null;
  const n = typeof d === "string" ? Number(d) : d;
  return Number.isFinite(n) ? n : null;
}

export function trackThumb(t: TrackCard) {
  return (
    t.thumbnailUrl ||
    t.coverUrl ||
    t.artwork?.url ||
    t.artwork?.coverUrl ||
    t.artwork?.thumbnailUrl ||
    t.release?.coverUrl ||
    null
  );
}

export function trackProcessing(t: TrackCard) {
  return t.processingStatus || t.processing?.status || "ready";
}

export function formatTrackDuration(sec: number | null) {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Map legacy copyright-free song → TrackCard (curated lane). */
export function copyrightFreeToTrack(s: CopyrightFreeSong): TrackCard {
  return {
    id: entityId(s),
    title: s.title || "Untitled",
    artistName: s.singer,
    singer: s.singer,
    fileUrl: s.fileUrl,
    thumbnailUrl: s.thumbnailUrl,
    category: s.category,
    duration: s.duration,
    lane: "curated",
    visibility: "published",
    processingStatus: "ready",
  };
}
