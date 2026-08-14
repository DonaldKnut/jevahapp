import { apiRequest } from "../../lib/api";
import { listFromUnknown, unwrapData } from "../../lib/api/unwrap";
import { entityId } from "../../lib/api/unwrap";
import {
  normalizeTrackCard,
  normalizeTrackList,
} from "../../lib/mediaParts/normalizeTrack";
import type { ArtistCard } from "../../types/creator";
import type { TrackCard } from "../../types/media";

export async function fetchPublicArtist(slug: string) {
  return unwrapData(
    await apiRequest(`/artists/${slug}`, { auth: false })
  ) as ArtistCard;
}

export async function fetchPublicArtistTracks(slug: string) {
  const res = await apiRequest(`/artists/${slug}/tracks`, { auth: false });
  const data = unwrapData(res);
  return normalizeTrackList(
    listFromUnknown<TrackCard>(data, ["tracks", "items", "data"])
  );
}

export async function fetchMusicTracks(params: {
  lane?: string;
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
  releaseId?: string;
}) {
  const q = new URLSearchParams();
  if (params.lane) q.set("lane", params.lane);
  if (params.search) q.set("search", params.search);
  if (params.genre) q.set("genre", params.genre);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.releaseId) q.set("releaseId", params.releaseId);
  const res = await apiRequest(`/music/tracks?${q.toString()}`, {
    auth: false,
  });
  const data = unwrapData(res);
  return normalizeTrackList(
    listFromUnknown<TrackCard>(data, ["tracks", "items", "data"])
  );
}

export async function fetchCopyrightFreeTracks() {
  const res = await apiRequest("/audio/copyright-free", { auth: false });
  const data = unwrapData(res);
  const songs = listFromUnknown<Record<string, unknown>>(data, [
    "songs",
    "tracks",
    "items",
    "data",
  ]);
  return songs.map((s) => {
    const row = s as TrackCard & {
      singer?: string;
      fileUrl?: string;
      duration?: number | string;
    };
    return normalizeTrackCard({
      id: entityId(row),
      title: row.title || "Untitled",
      artistName: row.artistName || row.singer,
      singer: row.singer,
      playbackUrl: row.playbackUrl || row.fileUrl,
      fileUrl: row.fileUrl,
      thumbnailUrl: row.thumbnailUrl,
      durationSec:
        typeof row.durationSec === "number"
          ? row.durationSec
          : typeof row.duration === "number"
            ? row.duration
            : Number(row.duration) || null,
      lane: "curated",
      processingStatus: "ready",
      playCount: row.playCount,
      audio: row.audio,
      artwork: row.artwork,
    });
  });
}
