import { apiRequest, ApiError } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import { copyrightFreeToTrack, normalizeTrackCard, normalizeTrackList } from "../../lib/media";
import type { ApiSuccess } from "../../types/admin";
import type {
  CopyrightFreeSong,
  TrackCard,
  TrackUploadIntent,
} from "../../types/media";

export type { CopyrightFreeSong, TrackCard };

export async function listCopyrightFreeSongs() {
  const res = await apiRequest("/audio/copyright-free");
  const data = unwrapData(res);
  return listFromUnknown<CopyrightFreeSong>(data, ["songs", "items", "data"]);
}

export async function createCopyrightFreeSong(body: {
  title: string;
  singer: string;
  fileUrl: string;
  thumbnailUrl?: string;
  category?: string;
  duration?: number | string;
}) {
  return apiRequest("/audio/copyright-free", { method: "POST", body });
}

export async function updateCopyrightFreeSong(
  songId: string,
  body: Partial<{
    title: string;
    singer: string;
    fileUrl: string;
    thumbnailUrl: string;
    category: string;
    duration: number | string;
  }>
) {
  return apiRequest(`/audio/copyright-free/${songId}`, {
    method: "PUT",
    body,
  });
}

export async function deleteCopyrightFreeSong(songId: string) {
  return apiRequest(`/audio/copyright-free/${songId}`, { method: "DELETE" });
}

export async function listAdminTracks(params: {
  lane?: string;
  search?: string;
  category?: string;
  visibility?: string;
  moderationStatus?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.lane) q.set("lane", params.lane);
  if (params.search) q.set("search", params.search);
  if (params.category) q.set("category", params.category);
  if (params.visibility) q.set("visibility", params.visibility);
  if (params.moderationStatus) q.set("moderationStatus", params.moderationStatus);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  try {
    const res = await apiRequest(`/admin/audio/tracks?${q.toString()}`);
    const data = unwrapData(res);
    const pageMeta = paginationFrom(res);
    const items = normalizeTrackList(
      listFromUnknown<TrackCard>(data, ["items", "tracks", "data"])
    );
    return {
      items,
      total: pageMeta.total ?? items.length,
      page: pageMeta.page ?? params.page ?? 1,
      pages: pageMeta.totalPages ?? 1,
      limit: pageMeta.limit ?? params.limit ?? 20,
    };
  } catch {
    if (params.lane && params.lane !== "curated") {
      throw new ApiError(404, "Artist catalog endpoint unavailable.");
    }
    const legacy = await listCopyrightFreeSongs();
    return {
      items: legacy.map(copyrightFreeToTrack),
      total: legacy.length,
      page: 1,
      pages: 1,
      limit: legacy.length,
    };
  }
}

export async function createTrackUploadIntent(body: {
  title: string;
  artistName: string;
  category?: string;
  genre?: string;
  language?: string;
  copyrightStatus?: string;
  licenseNote?: string;
  lane?: string;
  contentType: string;
  fileName: string;
  fileSizeBytes: number;
  coverContentType?: string;
  coverFileName?: string;
}): Promise<TrackUploadIntent> {
  return unwrapData(
    await apiRequest<ApiSuccess<TrackUploadIntent>>(
      "/admin/audio/tracks/upload-intent",
      { method: "POST", body }
    )
  );
}

export async function finalizeTrack(
  trackId: string,
  body: { publish?: boolean } = { publish: true }
) {
  return unwrapData(
    await apiRequest(`/admin/audio/tracks/${trackId}/finalize`, {
      method: "POST",
      body,
    })
  );
}

export async function getAdminTrack(id: string) {
  const data = unwrapData(await apiRequest(`/admin/audio/tracks/${id}`));
  const row =
    data && typeof data === "object" && "track" in data
      ? (data as { track: unknown }).track
      : data;
  return normalizeTrackCard(row);
}

export async function patchAdminTrack(
  id: string,
  body: Partial<{
    title: string;
    artistName: string;
    category: string;
    genre: string;
    language: string;
    visibility: string;
    licenseNote: string;
    copyrightStatus: string;
  }>
) {
  return apiRequest(`/admin/audio/tracks/${id}`, { method: "PATCH", body });
}

export async function reviewTrackModeration(
  id: string,
  body: {
    status: "approved" | "rejected" | "under_review";
    reason?: string;
    heardConfirmed?: boolean;
  }
) {
  return unwrapData(
    await apiRequest(`/admin/audio/tracks/${id}/moderation`, {
      method: "PATCH",
      body,
    })
  );
}

export async function deleteAdminTrack(id: string) {
  try {
    return await apiRequest(`/admin/audio/tracks/${id}`, { method: "DELETE" });
  } catch {
    return deleteCopyrightFreeSong(id);
  }
}
