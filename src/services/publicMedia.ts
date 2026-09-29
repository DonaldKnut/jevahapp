import { apiRequest } from "../lib/api";
import {
  entityId,
  listFromUnknown,
  paginationFrom,
  unwrapData,
} from "../lib/api/unwrap";
import type { PublicMediaCard, SermonCard } from "../types/sermon";
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

export function normalizePublicMedia(raw: unknown): PublicMediaCard | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = entityId(row as { id?: string; _id?: string });
  if (!id) return null;

  const author =
    row.authorInfo && typeof row.authorInfo === "object"
      ? (row.authorInfo as Record<string, unknown>)
      : row.author && typeof row.author === "object"
        ? (row.author as Record<string, unknown>)
        : null;

  const authorName =
    asString(row.artistName) ||
    asString(row.speaker) ||
    (author
      ? asString(author.fullName) ||
        asString(author.name) ||
        [asString(author.firstName), asString(author.lastName)]
          .filter(Boolean)
          .join(" ") ||
        null
      : null);

  return {
    id,
    title: asString(row.title) || "Untitled",
    description: asString(row.description),
    contentType: asString(row.contentType),
    mediaType: asString(row.mediaType),
    thumbnailUrl:
      asString(row.thumbnailUrl) ||
      asString(row.coverImageUrl) ||
      asString(row.coverUrl) ||
      asString(row.imageUrl) ||
      asString(row.posterUrl),
    playbackUrl: normalizePlaybackUrl(
      asString(row.playbackUrl) ||
        asString(row.videoUrl) ||
        asString(row.fileUrl) ||
        asString(row.audioUrl)
    ),
    hlsUrl: normalizePlaybackUrl(asString(row.hlsUrl)),
    speaker: authorName,
    artistName: authorName,
    publishedAt: asString(row.publishedAt) || asString(row.createdAt),
    createdAt: asString(row.createdAt),
    playCount:
      asNumber(row.playCount) ?? asNumber(row.viewCount) ?? undefined,
    durationSec: asNumber(row.durationSec) ?? asNumber(row.duration),
    duration: asNumber(row.duration) ?? asNumber(row.durationSec),
  };
}

export type PublicAllContentResult = {
  items: PublicMediaCard[];
  total: number;
  page: number;
  hasMore: boolean;
};

/**
 * Visitor-facing feed of live (approved + publication-ready) gospel media.
 * Never use admin moderation endpoints here.
 */
export async function fetchPublicAllContent(params?: {
  page?: number;
  limit?: number;
  profile?: "lite" | "full";
}): Promise<PublicAllContentResult> {
  const q = new URLSearchParams();
  q.set("page", String(params?.page ?? 1));
  q.set("limit", String(Math.min(Math.max(params?.limit ?? 20, 1), 50)));
  if (params?.profile) q.set("profile", params.profile);

  const res = await apiRequest(
    `/media/public/all-content?${q.toString()}`,
    { auth: false }
  );
  const data = unwrapData(res);
  const items = listFromUnknown(data, ["media", "items", "content", "data"])
    .map(normalizePublicMedia)
    .filter((m): m is PublicMediaCard => Boolean(m));

  const meta = paginationFrom(res);
  const bag =
    data && typeof data === "object"
      ? (data as { hasMore?: boolean; total?: number })
      : {};

  const page = meta.page ?? params?.page ?? 1;
  const total = bag.total ?? meta.total ?? items.length;
  const pages = meta.totalPages ?? 1;

  return {
    items,
    total,
    page,
    hasMore: bag.hasMore ?? page < pages,
  };
}

/**
 * Public media detail. API returns `{ success, media }` (not always `{ data }`).
 */
export async function fetchPublicMedia(id: string): Promise<PublicMediaCard> {
  const res = await apiRequest(`/media/public/${encodeURIComponent(id)}`, {
    auth: false,
  });
  const bag = res as { media?: unknown; data?: unknown };
  const raw =
    bag.media ??
    (bag.data && typeof bag.data === "object" && "media" in (bag.data as object)
      ? (bag.data as { media: unknown }).media
      : unwrapData(res));
  const item = normalizePublicMedia(raw);
  if (!item) throw new Error("Media not found");
  return item;
}

/** Map any public media row into the dock/player card shape. */
export function publicMediaToPlayable(item: PublicMediaCard): SermonCard {
  const type = (item.contentType || "").toLowerCase();
  const isAudio =
    type === "audio" ||
    type === "music" ||
    (item.mediaType || "").toLowerCase() === "audio";

  return {
    id: item.id,
    title: item.title || "Untitled",
    speaker: item.speaker || item.artistName || null,
    church: null,
    description: item.description || null,
    scripture: null,
    series: null,
    duration: item.duration ?? item.durationSec ?? null,
    durationSec: item.durationSec ?? item.duration ?? null,
    thumbnailUrl: item.thumbnailUrl || null,
    playbackUrl: item.playbackUrl || null,
    hlsUrl: item.hlsUrl || null,
    mediaType: isAudio ? "audio" : "video",
    category: item.contentType || null,
    language: null,
    topics: [],
    publishedAt: item.publishedAt || item.createdAt || null,
    playCount: item.playCount ?? 0,
    likeCount: 0,
    processingStatus: "ready",
    moderationStatus: "approved",
    contentType: "sermon",
  };
}

/** Deep-link for a public media card — always a real watch / catalog route. */
export function publicMediaHref(item: PublicMediaCard): string {
  const type = (item.contentType || "").toLowerCase();
  if (type === "ebook" || type === "ebooks" || type === "books") {
    return `/ebooks/${item.id}`;
  }
  // Public feed rows (videos, sermons, music) resolve via /media/public/:id.
  // Use /watch so we never land on a dead #hash or a missing catalog sermon.
  return `/watch/${item.id}`;
}
