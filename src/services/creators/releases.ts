import { apiRequest } from "../../lib/api";
import { listFromUnknown, unwrapData } from "../../lib/api/unwrap";
import { normalizeTrackCard, normalizeTrackList } from "../../lib/mediaParts/normalizeTrack";
import type { TrackCard } from "../../types/media";

export type ReleaseType = "single" | "ep" | "album" | "mixtape";
export type ReleaseStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | string;

export type ReleaseCard = {
  id: string;
  _id?: string;
  title: string;
  type?: ReleaseType | string;
  status?: ReleaseStatus;
  slug?: string;
  description?: string | null;
  label?: string | null;
  coverUrl?: string | null;
  coverResolved?: boolean;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  releaseDate?: string | null;
  trackCount?: number;
  tracks?: TrackCard[];
  updatedAt?: string;
  createdAt?: string;
};

function releaseId(r: Pick<ReleaseCard, "id" | "_id">) {
  return String(r.id || r._id || "");
}

function normalizeRelease(raw: unknown): ReleaseCard {
  const row = (raw && typeof raw === "object" ? raw : {}) as ReleaseCard &
    Record<string, unknown>;
  const tracks = Array.isArray(row.tracks)
    ? normalizeTrackList(row.tracks)
    : undefined;
  return {
    ...row,
    id: releaseId(row),
    title: row.title || "Untitled release",
    coverUrl:
      (typeof row.coverUrl === "string" && row.coverUrl) ||
      tracks?.[0]?.thumbnailUrl ||
      null,
    trackCount: row.trackCount ?? tracks?.length ?? 0,
    tracks,
  };
}

export async function listMyReleases(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/creators/releases?${q.toString()}`);
  const data = unwrapData(res);
  return listFromUnknown(data, ["releases", "items", "data"]).map(
    normalizeRelease
  );
}

export async function getMyRelease(id: string) {
  return normalizeRelease(
    unwrapData(await apiRequest(`/creators/releases/${id}`))
  );
}

export async function createRelease(body: {
  title: string;
  type?: ReleaseType;
  description?: string;
  label?: string;
  upc?: string;
  releaseDate?: string;
}) {
  return normalizeRelease(
    unwrapData(
      await apiRequest("/creators/releases", { method: "POST", body })
    )
  );
}

export async function patchRelease(
  id: string,
  body: Partial<{
    title: string;
    type: ReleaseType;
    description: string;
    label: string;
    slug: string;
    releaseDate: string;
  }>
) {
  return normalizeRelease(
    unwrapData(
      await apiRequest(`/creators/releases/${id}`, { method: "PATCH", body })
    )
  );
}

export async function deleteRelease(id: string) {
  return apiRequest(`/creators/releases/${id}`, { method: "DELETE" });
}

export async function publishRelease(
  id: string,
  body?: { scheduledAt?: string; skipTypeHints?: boolean }
) {
  const data = unwrapData(
    await apiRequest(`/creators/releases/${id}/publish`, {
      method: "POST",
      body: body || {},
    })
  ) as { release?: unknown } | unknown;
  const release =
    data && typeof data === "object" && "release" in (data as object)
      ? (data as { release: unknown }).release
      : data;
  return normalizeRelease(release);
}

export async function createReleaseCoverIntent(
  id: string,
  body: { contentType: string; fileName?: string; fileSizeBytes?: number }
) {
  return unwrapData(
    await apiRequest(`/creators/releases/${id}/cover/upload-intent`, {
      method: "POST",
      body,
    })
  ) as {
    putUrl?: string;
    cover?: { putUrl: string; headers?: Record<string, string> };
    headers?: Record<string, string>;
  };
}

export async function finalizeReleaseCover(id: string) {
  return normalizeRelease(
    unwrapData(
      await apiRequest(`/creators/releases/${id}/cover/finalize`, {
        method: "POST",
        body: {},
      })
    )
  );
}

export async function unlinkReleaseTrack(
  releaseId: string,
  trackId: string,
  hardDelete = false
) {
  const q = hardDelete ? "?deleteTrack=true" : "";
  return apiRequest(
    `/creators/releases/${releaseId}/tracks/${trackId}${q}`,
    { method: "DELETE" }
  );
}

export async function reorderReleaseTracks(
  releaseId: string,
  orderedTrackIds: string[]
) {
  return normalizeRelease(
    unwrapData(
      await apiRequest(`/creators/releases/${releaseId}/tracks/reorder`, {
        method: "POST",
        body: { orderedTrackIds },
      })
    )
  );
}

/** Public discography */
export async function fetchArtistReleases(slug: string) {
  const res = await apiRequest(`/artists/${slug}/releases`, { auth: false });
  const data = unwrapData(res);
  return listFromUnknown(data, ["releases", "items", "data"]).map(
    normalizeRelease
  );
}

export async function fetchPublicRelease(idOrSlug: string) {
  return normalizeRelease(
    unwrapData(
      await apiRequest(`/music/releases/${idOrSlug}`, { auth: false })
    )
  );
}

export { normalizeTrackCard };
