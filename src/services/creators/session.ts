import { apiRequest } from "../../lib/api";
import { unwrapData } from "../../lib/api/unwrap";
import {
  assertImageFile,
  extractPutSlot,
  putPresignedFile,
  COVER_MAX_BYTES,
} from "../../lib/media";
import { normalizeCreatorMe } from "./presenter";

export async function fetchCreatorMe() {
  return normalizeCreatorMe(await apiRequest("/creators/me"));
}

export async function applyAsCreator(body: {
  displayName: string;
  bio?: string;
  genres?: string[];
  creatorTypes?: string[];
  socials?: Record<string, string>;
  applicationNote?: string;
  avatarUrl?: string;
}) {
  return normalizeCreatorMe(
    await apiRequest("/creators/apply", { method: "POST", body })
  );
}

export async function updateCreatorProfile(body: {
  displayName?: string;
  bio?: string;
  genres?: string[];
  socials?: Record<string, string>;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}) {
  return normalizeCreatorMe(
    await apiRequest("/creators/me", { method: "PATCH", body })
  );
}

export async function uploadCreatorImage(
  kind: "avatar" | "banner",
  file: File
) {
  assertImageFile(file, COVER_MAX_BYTES);
  const intent = unwrapData(
    await apiRequest(`/creators/me/${kind}/upload-intent`, {
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
    throw new Error("Upload was not prepared. Try again in a moment.");
  }
  await putPresignedFile(slot.putUrl, file, slot.headers);
  return normalizeCreatorMe(
    await apiRequest(`/creators/me/${kind}/finalize`, {
      method: "POST",
      body: {},
    })
  );
}
