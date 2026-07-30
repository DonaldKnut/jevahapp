import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type {
  AdminMediaCard,
  ApiSuccess,
  ModerationCaseSummary,
} from "../../types/admin";

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
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
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
  return {
    items: listFromUnknown<AdminMediaCard>(data, ["media", "items", "data"]),
    total: meta.total,
    page: meta.page,
    totalPages: meta.totalPages,
  };
}

export async function getModerationMedia(mediaId: string) {
  const res = await apiRequest<
    ApiSuccess<{ media: AdminMediaCard; moderationCase: ModerationCaseSummary | null }>
  >(`/admin/moderation/${mediaId}`);
  return unwrapData(res);
}

export async function getModerationCase(mediaId: string) {
  const res = await apiRequest<
    ApiSuccess<{ mediaId: string; cases: ModerationCaseSummary[] }>
  >(`/admin/moderation/${mediaId}/case`);
  return unwrapData(res);
}

export async function patchModerationStatus(
  mediaId: string,
  body: { status: "approved" | "rejected" | "under_review"; adminNotes?: string }
) {
  const res = await apiRequest(`/admin/moderation/${mediaId}/status`, {
    method: "PATCH",
    body,
  });
  return unwrapData(res) as { media?: AdminMediaCard } | AdminMediaCard;
}

export async function updateMediaMetadata(
  mediaId: string,
  body: {
    title?: string;
    description?: string;
    adminModerationNotes?: string;
    category?: string;
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
      if ("preview" in data && "id" in data) return data as AdminMediaCard;
      if ("media" in data && data.media) return data.media;
      if ("preview" in data && data.preview) {
        const detail = await getModerationMedia(mediaId);
        return {
          ...detail.media,
          preview: data.preview as AdminMediaCard["preview"],
        };
      }
    }
  } catch {
    /* fall through */
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
  const data = unwrapData(res);
  return listFromUnknown<Record<string, unknown>>(data, [
    "notes",
    "items",
    "data",
  ]);
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

export async function rerunModeration(mediaId: string) {
  return apiRequest(`/admin/moderation/${mediaId}/rerun`, { method: "POST" });
}

export async function bulkModerationStatus(body: {
  mediaIds: string[];
  status: "approved" | "rejected" | "under_review";
  adminNotes?: string;
}) {
  return unwrapData(
    await apiRequest("/admin/moderation/bulk", { method: "POST", body })
  );
}
