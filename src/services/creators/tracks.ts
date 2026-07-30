import { apiRequest } from "../../lib/api";
import { listFromUnknown, unwrapData } from "../../lib/api/unwrap";
import type { TrackCard, TrackUploadIntent } from "../../types/media";

export async function listMyCreatorTracks(params?: {
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/creators/me/tracks?${q.toString()}`);
  const data = unwrapData(res);
  return listFromUnknown<TrackCard>(data, ["tracks", "items", "data"]);
}

export async function createCreatorUploadIntent(body: {
  title: string;
  artistName: string;
  genre?: string;
  category?: string;
  language?: string;
  contentType: string;
  fileName: string;
  fileSizeBytes: number;
  coverContentType?: string;
  coverFileName?: string;
  coverFileSizeBytes?: number;
}): Promise<TrackUploadIntent> {
  return unwrapData(
    await apiRequest<{ data?: TrackUploadIntent }>(
      "/creators/tracks/upload-intent",
      { method: "POST", body }
    )
  ) as TrackUploadIntent;
}

export async function finalizeCreatorTrack(
  trackId: string,
  body: { publish?: boolean } = { publish: true }
) {
  return unwrapData(
    await apiRequest(`/creators/tracks/${trackId}/finalize`, {
      method: "POST",
      body,
    })
  );
}

export async function patchCreatorTrack(
  id: string,
  body: Partial<{
    title: string;
    artistName: string;
    genre: string;
    category: string;
    language: string;
    visibility: string;
  }>
) {
  return apiRequest(`/creators/tracks/${id}`, { method: "PATCH", body });
}

export async function deleteCreatorTrack(id: string) {
  return apiRequest(`/creators/tracks/${id}`, { method: "DELETE" });
}
