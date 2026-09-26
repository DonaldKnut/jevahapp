import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type {
  AdminMediaCard,
  ApiSuccess,
  ModerationCaseSummary,
} from "../../types/admin";

export type ModerationDecision =
  | "approved"
  | "rejected"
  | "under_review"
  | "pending"
  | "flagged";

export async function fetchRecentMedia(params: {
  page?: number;
  limit?: number;
  moderationStatus?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.moderationStatus) q.set("moderationStatus", params.moderationStatus);
  const res = await apiRequest(`/admin/media/recent?${q.toString()}`);
  const data = unwrapData(res);
  return {
    media: listFromUnknown<AdminMediaCard>(data, ["media", "items", "data"]),
    total: paginationFrom(res).total,
  };
}

export async function searchAdminMedia(params: {
  search?: string;
  q?: string;
  contentType?: string;
  moderationStatus?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  const term = params.q || params.search;
  if (term) q.set("q", term);
  if (params.contentType) q.set("contentType", params.contentType);
  if (params.moderationStatus) q.set("moderationStatus", params.moderationStatus);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/media/search?${q.toString()}`);
  const data = unwrapData(res);
  return {
    media: listFromUnknown<AdminMediaCard>(data, ["media", "items", "data"]),
    total: paginationFrom(res).total,
  };
}

export async function fetchModerationQueue(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/moderation/queue?${q.toString()}`);
  const data = unwrapData(res);
  const meta = paginationFrom(res);
  let items = listFromUnknown<AdminMediaCard>(data, [
    "media",
    "items",
    "data",
    "queue",
    "results",
  ]);

  // Queue can be empty while recent still has held uploads.
  if (items.length === 0 && !params.status) {
    const recent = await fetchRecentMedia({ limit: 40 }).catch(() => ({
      media: [] as AdminMediaCard[],
    }));
    items = recent.media.filter((m) => {
      const status = (m.moderationStatus || "").toLowerCase();
      return !status || status === "pending" || status === "under_review";
    });
  }

  return {
    items,
    total: meta.total ?? items.length,
    page: meta.page,
    totalPages: meta.totalPages,
  };
}

export async function getModerationMedia(mediaId: string) {
  const res = await apiRequest<
    ApiSuccess<{ media: AdminMediaCard; moderationCase: ModerationCaseSummary | null }>
  >(`/admin/moderation/${mediaId}`);
  const data = unwrapData(res);
  if (data && typeof data === "object" && "media" in data && data.media) {
    return data;
  }
  return {
    media: data as unknown as AdminMediaCard,
    moderationCase: null,
  };
}

export async function getModerationCase(mediaId: string) {
  const res = await apiRequest<
    ApiSuccess<{ mediaId: string; cases: ModerationCaseSummary[] }>
  >(`/admin/moderation/${mediaId}/case`);
  return unwrapData(res);
}

export async function patchModerationStatus(
  mediaId: string,
  body: { status: ModerationDecision; adminNotes?: string }
) {
  const res = await apiRequest<
    ApiSuccess<AdminMediaCard> & {
      message?: string;
      data?: AdminMediaCard & { publishable?: boolean };
    }
  >(`/admin/moderation/${mediaId}/status`, {
    method: "PATCH",
    body,
  });
  const data = unwrapData(res) as AdminMediaCard & { publishable?: boolean };
  return {
    media: data,
    message: (res as { message?: string }).message,
    publishable: data?.publishable,
  };
}

export async function updateMediaMetadata(
  mediaId: string,
  body: {
    title?: string;
    description?: string;
    adminModerationNotes?: string;
    category?: string;
    speaker?: string;
    church?: string;
    scripture?: string;
    series?: string;
    language?: string;
    mediaType?: "audio" | "video";
  }
) {
  const res = await apiRequest(`/admin/media/${mediaId}`, {
    method: "PATCH",
    body,
  });
  return unwrapData(res) as { media?: AdminMediaCard } | AdminMediaCard;
}

export async function deleteMedia(mediaId: string) {
  return apiRequest(`/admin/media/${mediaId}`, { method: "DELETE" });
}

export async function refreshMediaPreview(
  mediaId: string
): Promise<AdminMediaCard | null> {
  try {
    const res = await apiRequest<
      ApiSuccess<
        { preview?: AdminMediaCard["preview"]; media?: AdminMediaCard } | AdminMediaCard
      >
    >(`/admin/media/${mediaId}/preview-refresh`, { method: "POST" });
    const data = unwrapData(res);
    if (data && typeof data === "object") {
      if ("media" in data && data.media) return data.media;
      if ("preview" in data && "id" in data) return data as AdminMediaCard;
      if ("preview" in data && data.preview) {
        const detail = await getModerationMedia(mediaId);
        return { ...detail.media, preview: data.preview };
      }
    }
  } catch {
    /* fall through — detail GET also rebuilds preview */
  }
  try {
    const detail = await getModerationMedia(mediaId);
    return detail.media;
  } catch {
    return null;
  }
}

export async function fetchModerationNotes(mediaId: string) {
  const res = await apiRequest(`/admin/moderation/${mediaId}/notes`);
  const data = unwrapData(res) as {
    notes?: Record<string, unknown>[];
    legacyNote?: string | null;
  };
  return {
    notes: listFromUnknown<Record<string, unknown>>(data, [
      "notes",
      "items",
      "data",
    ]),
    legacyNote: data?.legacyNote ?? null,
  };
}

export async function addModerationNote(mediaId: string, body: string) {
  return apiRequest(`/admin/moderation/${mediaId}/notes`, {
    method: "POST",
    body: { body },
  });
}

export async function assignModeration(
  mediaId: string,
  assigneeId: string | null
) {
  return apiRequest(`/admin/moderation/${mediaId}/assign`, {
    method: "PATCH",
    body: { assigneeId },
  });
}

export async function rerunModeration(mediaId: string, reason?: string) {
  return apiRequest(`/admin/moderation/${mediaId}/rerun`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

export async function bulkModerationStatus(body: {
  mediaIds: string[];
  status: ModerationDecision;
  adminNotes?: string;
}) {
  return unwrapData(
    await apiRequest("/admin/moderation/bulk", { method: "POST", body })
  );
}
