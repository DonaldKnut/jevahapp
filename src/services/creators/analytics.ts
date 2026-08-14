import { apiRequest, ApiError } from "../../lib/api";
import { unwrapData } from "../../lib/api/unwrap";
import type { TrackCard } from "../../types/media";

export type CreatorRegionStat = {
  region: string;
  countryCode?: string;
  listens: number;
  sharePct?: number;
};

export type CreatorTrackStat = {
  trackId: string;
  title: string;
  listens: number;
  completes?: number;
  likes?: number;
  saves?: number;
  avgWatchPct?: number;
};

export type CreatorAnalytics = {
  rangeDays: number;
  totalListens: number;
  uniqueListeners: number;
  completes: number;
  likes: number;
  saves: number;
  avgWatchPct: number | null;
  topRegions: CreatorRegionStat[];
  focusHint: string | null;
  topTracks: CreatorTrackStat[];
  timeseries?: Array<{ date: string; listens: number }>;
  source: "api" | "catalog_fallback";
};

function fallbackFromTracks(tracks: TrackCard[]): CreatorAnalytics {
  const topTracks = [...tracks]
    .map((t) => ({
      trackId: String(t.id || t._id || ""),
      title: t.title || "Untitled",
      listens: t.playCount || 0,
    }))
    .sort((a, b) => b.listens - a.listens)
    .slice(0, 8);

  const totalListens = topTracks.reduce((n, t) => n + t.listens, 0);

  return {
    rangeDays: 30,
    totalListens,
    uniqueListeners: 0,
    completes: 0,
    likes: 0,
    saves: 0,
    avgWatchPct: null,
    topRegions: [],
    focusHint:
      totalListens > 0
        ? "Region insights arrive once the analytics API is live. Keep shipping tracks — plays already count."
        : "Upload and share a track to start collecting listens.",
    topTracks,
    source: "catalog_fallback",
  };
}

/**
 * Soft-fail analytics loader. Prefer live API; never blank the studio.
 */
export async function fetchCreatorAnalytics(
  tracks: TrackCard[],
  rangeDays = 30
): Promise<CreatorAnalytics> {
  try {
    const res = await apiRequest(
      `/creators/me/analytics?rangeDays=${rangeDays}`
    );
    const data = unwrapData(res) as Partial<CreatorAnalytics> | null;
    if (!data || typeof data !== "object") {
      return fallbackFromTracks(tracks);
    }
    return {
      rangeDays: data.rangeDays ?? rangeDays,
      totalListens: data.totalListens ?? 0,
      uniqueListeners: data.uniqueListeners ?? 0,
      completes: data.completes ?? 0,
      likes: data.likes ?? 0,
      saves: data.saves ?? 0,
      avgWatchPct: data.avgWatchPct ?? null,
      topRegions: Array.isArray(data.topRegions) ? data.topRegions : [],
      focusHint: data.focusHint ?? null,
      topTracks: Array.isArray(data.topTracks)
        ? data.topTracks
        : fallbackFromTracks(tracks).topTracks,
      timeseries: data.timeseries,
      source: "api",
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
      return fallbackFromTracks(tracks);
    }
    return fallbackFromTracks(tracks);
  }
}
