import { apiRequest } from "../lib/api";
import {
  entityId,
  listFromUnknown,
  paginationFrom,
  unwrapData,
} from "../lib/api/unwrap";
import { normalizePlaybackUrl } from "../lib/sermonMedia";
import type {
  EbookCard,
  EbookListResult,
  EbookTextResult,
  EbookTtsConfig,
  EbookTtsResult,
} from "../types/ebook";

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

export function ebookPdfUrl(ebook: EbookCard): string | null {
  return normalizePlaybackUrl(ebook.fileUrl || ebook.pdfUrl);
}

/**
 * In-app viewer URL — soft-hides Chromium PDF chrome (toolbar/download).
 * Never surface this as a "download" or "open in new tab" link.
 */
export function ebookViewerUrl(ebook: EbookCard): string | null {
  const base = ebookPdfUrl(ebook);
  if (!base) return null;
  const frag = "toolbar=0&navpanes=0&scrollbar=0&view=FitH";
  const hashIdx = base.indexOf("#");
  const bare = hashIdx >= 0 ? base.slice(0, hashIdx) : base;
  return `${bare}#${frag}`;
}

export function normalizeEbookCard(raw: unknown): EbookCard | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = entityId(row as { id?: string; _id?: string });
  if (!id) return null;

  const pdf =
    normalizePlaybackUrl(asString(row.fileUrl) || asString(row.pdfUrl)) ||
    null;

  return {
    id,
    title: asString(row.title) || "Untitled ebook",
    description: asString(row.description),
    thumbnailUrl: asString(row.thumbnailUrl) || asString(row.coverUrl),
    fileUrl: pdf,
    pdfUrl: pdf,
    authorName:
      asString(row.authorName) ||
      asString(row.author) ||
      asString(row.speaker),
    category: asString(row.category),
    topics: asTopics(row.topics),
    publishedAt: asString(row.publishedAt) || asString(row.createdAt),
    readCount: asNumber(row.readCount) ?? asNumber(row.playCount) ?? 0,
    likeCount: asNumber(row.likeCount) ?? 0,
    processingStatus: asString(row.processingStatus) || "ready",
    moderationStatus: asString(row.moderationStatus) || "approved",
    contentType: "ebook",
  };
}

export async function fetchEbooks(params?: {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  topics?: string;
}): Promise<EbookListResult> {
  const q = new URLSearchParams();
  const limit = Math.min(Math.max(params?.limit ?? 20, 1), 50);
  q.set("page", String(params?.page ?? 1));
  q.set("limit", String(limit));
  if (params?.search?.trim()) q.set("search", params.search.trim());
  if (params?.topic?.trim()) q.set("topic", params.topic.trim());
  if (params?.topics?.trim()) q.set("topics", params.topics.trim());

  const res = await apiRequest(`/ebooks?${q.toString()}`, { auth: false });
  const data = unwrapData(res);
  const items = listFromUnknown(data, ["items", "ebooks", "data"])
    .map(normalizeEbookCard)
    .filter((e): e is EbookCard => Boolean(e));

  const meta = paginationFrom(res);
  const bag =
    data && typeof data === "object"
      ? (data as { total?: number; page?: number; limit?: number })
      : {};

  const total = bag.total ?? meta.total ?? items.length;
  const page = bag.page ?? meta.page ?? params?.page ?? 1;
  const pages =
    meta.totalPages ?? Math.max(1, Math.ceil(total / (bag.limit ?? limit)));

  return {
    items,
    total,
    page,
    limit: bag.limit ?? meta.limit ?? limit,
    pages,
  };
}

/** Resolve one ebook when there is no dedicated detail endpoint. */
export async function resolveEbook(
  id: string,
  hint?: EbookCard | null
): Promise<EbookCard | null> {
  if (hint && hint.id === id) return hint;

  // Prefer a wide first page; then scan further pages lightly
  for (let page = 1; page <= 5; page += 1) {
    const res = await fetchEbooks({ page, limit: 50 });
    const found = res.items.find((e) => e.id === id);
    if (found) return found;
    if (!res.items.length || page >= res.pages) break;
  }
  return null;
}

export async function fetchEbookText(
  contentId: string,
  opts?: { normalize?: boolean }
): Promise<EbookTextResult> {
  const q = new URLSearchParams({ contentId });
  if (opts?.normalize) q.set("normalize", "true");
  const res = await apiRequest(`/ebooks/text?${q.toString()}`, {
    auth: false,
  });
  const data = unwrapData(res) as Record<string, unknown>;
  const pagesRaw = listFromUnknown<{ page?: number; text?: string }>(data, [
    "pages",
  ]);
  const pages = pagesRaw.map((p, i) => ({
    page: typeof p.page === "number" ? p.page : i + 1,
    text: typeof p.text === "string" ? p.text : "",
  }));
  return {
    title: asString(data.title),
    totalPages: asNumber(data.totalPages) ?? pages.length,
    pages,
  };
}

export async function fetchEbookTtsConfig(): Promise<EbookTtsConfig> {
  try {
    const res = await apiRequest("/ebooks/tts/config", { auth: false });
    const data = unwrapData(res) as Record<string, unknown>;
    return {
      available: Boolean(data.available ?? data.enabled ?? data.ready),
      voices: Array.isArray(data.voices)
        ? data.voices.filter((v): v is string => typeof v === "string")
        : undefined,
      message: asString(data.message) || undefined,
    };
  } catch {
    return { available: false };
  }
}

export async function fetchEbookTts(
  ebookId: string
): Promise<EbookTtsResult | null> {
  try {
    const res = await apiRequest(
      `/ebooks/${encodeURIComponent(ebookId)}/tts?includeTimings=true`,
      { auth: false }
    );
    const data = unwrapData(res) as Record<string, unknown>;
    return {
      audioUrl: normalizePlaybackUrl(
        asString(data.audioUrl) || asString(data.url)
      ),
      timings: data.timings,
      status: asString(data.status) || undefined,
    };
  } catch {
    return null;
  }
}

export async function generateEbookTts(
  ebookId: string,
  voice = "female"
): Promise<EbookTtsResult | null> {
  try {
    const res = await apiRequest(
      `/ebooks/${encodeURIComponent(ebookId)}/tts/generate?voice=${encodeURIComponent(voice)}`,
      { method: "POST", auth: false }
    );
    const data = unwrapData(res) as Record<string, unknown>;
    return {
      audioUrl: normalizePlaybackUrl(
        asString(data.audioUrl) || asString(data.url)
      ),
      timings: data.timings,
      status: asString(data.status) || undefined,
    };
  } catch {
    return null;
  }
}
