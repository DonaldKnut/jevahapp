import { apiRequest } from "../../lib/api";
import { listFromUnknown, unwrapData } from "../../lib/api/unwrap";
import {
  assertImageFile,
  extractPutSlot,
  putPresignedFile,
  COVER_MAX_BYTES,
} from "../../lib/media";
import {
  normalizeTrackCard,
  normalizeTrackList,
} from "../../lib/mediaParts/normalizeTrack";
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
  return normalizeTrackList(
    listFromUnknown<TrackCard>(data, ["tracks", "items", "data"])
  );
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
  releaseId?: string;
  trackNumber?: number;
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
  return normalizeTrackCard(
    unwrapData(
      await apiRequest(`/creators/tracks/${trackId}/finalize`, {
        method: "POST",
        body,
      })
    )
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

export async function uploadTrackCover(trackId: string, file: File) {
  assertImageFile(file, COVER_MAX_BYTES);
  const intent = unwrapData(
    await apiRequest(`/creators/tracks/${trackId}/cover/upload-intent`, {
      method: "POST",
      body: {
        contentType: file.type,
        fileName: file.name,
        fileSizeBytes: file.size,
      },
    })
  );
  const slot = extractPutSlot(intent);
  if (!slot) {
    throw new Error("Cover upload was not prepared. Try again in a moment.");
  }
  await putPresignedFile(slot.putUrl, file, slot.headers);
  return normalizeTrackCard(
    unwrapData(
      await apiRequest(`/creators/tracks/${trackId}/cover/finalize`, {
        method: "POST",
        body: {},
      })
    )
  );
}
