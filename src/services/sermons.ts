import { apiRequest } from "../lib/api";
import {
  entityId,
  listFromUnknown,
  paginationFrom,
  unwrapData,
} from "../lib/api/unwrap";
import type {
  SermonCard,
  SermonListResult,
  SermonMediaType,
  SermonTopicsResult,
} from "../types/sermon";
import { normalizePlaybackUrl } from "../lib/sermonMedia";

function asString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asTopics(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean);
}

function asMediaType(v: unknown): SermonMediaType {
  const raw = typeof v === "string" ? v.toLowerCase() : "";
  if (raw === "audio" || raw === "video") return raw;
  if (raw.includes("audio")) return "audio";
  return "video";
}

/** Normalize a loosely shaped API row into SermonCard. */
export function normalizeSermonCard(raw: unknown): SermonCard | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = entityId(row as { id?: string; _id?: string });
  if (!id) return null;

  const duration =
    asNumber(row.durationSec) ?? asNumber(row.duration) ?? null;

  return {
    id,
    title: asString(row.title) || "Untitled sermon",
    speaker: asString(row.speaker) || asString(row.artistName),
    church: asString(row.church),
    description: asString(row.description),
    scripture: asString(row.scripture),
    series: asString(row.series),
    duration,
    durationSec: duration,
    thumbnailUrl: asString(row.thumbnailUrl) || asString(row.coverUrl),
    playbackUrl: normalizePlaybackUrl(
      asString(row.playbackUrl) || asString(row.fileUrl)
    ),
    hlsUrl: normalizePlaybackUrl(asString(row.hlsUrl)),
    mediaType: asMediaType(row.mediaType),
    category: asString(row.category),
    language: asString(row.language),
    topics: asTopics(row.topics),
    publishedAt: asString(row.publishedAt) || asString(row.createdAt),
    playCount: asNumber(row.playCount) ?? 0,
    likeCount: asNumber(row.likeCount) ?? 0,
    processingStatus: asString(row.processingStatus) || "ready",
    moderationStatus: asString(row.moderationStatus) || "approved",
    contentType: "sermon",
  };
}

export function normalizeSermonList(raw: unknown[]): SermonCard[] {
  return raw
    .map(normalizeSermonCard)
    .filter((s): s is SermonCard => Boolean(s));
}

export function sermonPlayableUrl(s: SermonCard): string | null {
  return normalizePlaybackUrl(s.playbackUrl || s.hlsUrl);
}

export function formatSermonDuration(sec: number | null | undefined) {
  if (sec == null || !Number.isFinite(sec)) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}:${String(rm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function fetchSermons(params?: {
  page?: number;
  limit?: number;
  search?: string;
  series?: string;
  topic?: string;
  topics?: string;
  language?: string;
  cursor?: string;
}): Promise<SermonListResult> {
  const q = new URLSearchParams();
  const limit = Math.min(Math.max(params?.limit ?? 20, 1), 50);
  q.set("limit", String(limit));

  if (params?.cursor?.trim()) {
    q.set("cursor", params.cursor.trim());
  } else if (params?.page) {
    q.set("page", String(params.page));
  }

  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.series?.trim()) q.set("series", params.series.trim());
  if (params?.topic?.trim()) q.set("topic", params.topic.trim());
  if (params?.topics?.trim()) q.set("topics", params.topics.trim());
  if (params?.language?.trim()) q.set("language", params.language.trim());

  const res = await apiRequest(`/sermons?${q.toString()}`, { auth: false });
  const data = unwrapData(res);
  const items = normalizeSermonList(
    listFromUnknown(data, ["items", "sermons", "data"])
  );
  const meta = paginationFrom(res);
  const bag =
    data && typeof data === "object"
      ? (data as {
          nextCursor?: string | null;
          hasMore?: boolean;
          total?: number;
          limit?: number;
        })
      : {};

  const total = bag.total ?? meta.total ?? items.length;
  const page = meta.page ?? params?.page ?? 1;
  const pages = meta.totalPages ?? Math.max(1, Math.ceil(total / limit));

  return {
    items,
    total,
    limit: bag.limit ?? meta.limit ?? limit,
    nextCursor: bag.nextCursor ?? null,
    hasMore:
      typeof bag.hasMore === "boolean"
        ? bag.hasMore
        : Boolean(bag.nextCursor) || page < pages,
    page,
    pages,
  };
}

export async function fetchSermon(id: string): Promise<SermonCard> {
  const res = await apiRequest(`/sermons/${encodeURIComponent(id)}`, {
    auth: false,
  });
  const data = unwrapData(res);
  const row =
    data && typeof data === "object" && "item" in (data as object)
      ? (data as { item: unknown }).item
      : data && typeof data === "object" && "sermon" in (data as object)
        ? (data as { sermon: unknown }).sermon
        : data;
  const sermon = normalizeSermonCard(row);
  if (!sermon) throw new Error("Sermon not found");
  return sermon;
}

export async function fetchFeaturedSermons(): Promise<SermonCard[]> {
  try {
    const res = await apiRequest("/sermons/featured", { auth: false });
    const data = unwrapData(res);
    return normalizeSermonList(
      listFromUnknown(data, ["items", "sermons", "featured", "data"])
    );
  } catch {
    return [];
  }
}

export async function fetchSermonTopics(): Promise<SermonTopicsResult> {
  try {
    const res = await apiRequest("/sermons/topics", { auth: false });
    const data = unwrapData(res);
    const bag =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};

    const topics = asTopics(bag.topics).length
      ? asTopics(bag.topics)
      : listFromUnknown<string>(data, ["topics"]).filter(
          (t) => typeof t === "string"
        );

    const series = asTopics(bag.series).length
      ? asTopics(bag.series)
      : listFromUnknown<string>(data, ["series"]).filter(
          (t) => typeof t === "string"
        );

    const languages = asTopics(bag.languages).length
      ? asTopics(bag.languages)
      : listFromUnknown<string>(data, ["languages"]).filter(
          (t) => typeof t === "string"
        );

    return { topics, series, languages };
  } catch {
    return { topics: [], series: [], languages: [] };
  }
}
