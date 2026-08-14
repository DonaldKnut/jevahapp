import type { TrackCard } from "../../types/media";
import { entityId } from "../api/unwrap";
import { copyrightFreeToTrack, trackId } from "./track";
import type { CopyrightFreeSong } from "../../types/media";

function nestedString(
  obj: unknown,
  keys: string[]
): string | null | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

/**
 * Flatten canonical Track payloads (nested audio/artwork/release)
 * into the flat TrackCard the player expects.
 */
export function normalizeTrackCard(raw: unknown): TrackCard {
  const row = (raw && typeof raw === "object" ? raw : {}) as TrackCard &
    Record<string, unknown>;

  const audio = row.audio as Record<string, unknown> | undefined;
  const artwork = row.artwork as Record<string, unknown> | undefined;
  const releaseRaw = row.release as Record<string, unknown> | undefined;

  const playbackUrl =
    row.playbackUrl ||
    row.fileUrl ||
    row.audioUrl ||
    nestedString(audio, ["playbackUrl", "fileUrl", "audioUrl", "url"]) ||
    null;

  const thumbnailUrl =
    row.thumbnailUrl ||
    nestedString(artwork, ["url", "coverUrl", "thumbnailUrl"]) ||
    nestedString(releaseRaw, ["coverUrl"]) ||
    null;

  const durationSec =
    typeof row.durationSec === "number"
      ? row.durationSec
      : typeof audio?.durationSec === "number"
        ? (audio.durationSec as number)
        : typeof row.duration === "number"
          ? row.duration
          : Number(row.duration) || null;

  const release =
    releaseRaw && typeof releaseRaw === "object"
      ? {
          id: String(releaseRaw.id || releaseRaw._id || ""),
          title: String(releaseRaw.title || ""),
          coverUrl:
            typeof releaseRaw.coverUrl === "string"
              ? releaseRaw.coverUrl
              : null,
          type: typeof releaseRaw.type === "string" ? releaseRaw.type : undefined,
          slug: typeof releaseRaw.slug === "string" ? releaseRaw.slug : undefined,
        }
      : row.release;

  return {
    ...row,
    id: trackId(row) || entityId(row),
    title: row.title || "Untitled",
    artistName: row.artistName || row.singer,
    singer: row.singer || row.artistName,
    playbackUrl,
    fileUrl: row.fileUrl || playbackUrl,
    audioUrl: row.audioUrl || playbackUrl,
    thumbnailUrl,
    durationSec,
    processingStatus:
      row.processingStatus ||
      (row.processing as { status?: string } | undefined)?.status ||
      "ready",
    release,
    releaseId:
      row.releaseId ||
      (release && typeof release === "object" ? release.id : undefined) ||
      undefined,
  };
}

export function normalizeTrackList(raw: unknown[]): TrackCard[] {
  return raw.map(normalizeTrackCard);
}

export function normalizeCopyrightFree(s: CopyrightFreeSong): TrackCard {
  return normalizeTrackCard(copyrightFreeToTrack(s));
}
