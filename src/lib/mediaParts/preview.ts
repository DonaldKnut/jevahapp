import type { AdminMediaCard } from "../../types/admin";

export function formatAge(iso?: string | null) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function uploaderLabel(
  media: Pick<AdminMediaCard, "uploader"> | null | undefined
) {
  if (!media?.uploader) return "Unknown uploader";
  return (
    media.uploader.email ||
    [media.uploader.firstName, media.uploader.lastName]
      .filter(Boolean)
      .join(" ") ||
    media.uploader.username ||
    "Unknown uploader"
  );
}

export function mediaPreviewUrl(media: AdminMediaCard | null | undefined) {
  if (!media?.preview) return null;
  return media.preview.mediaUrl || media.preview.playbackUrl || null;
}

export function mediaThumbUrl(media: AdminMediaCard | null | undefined) {
  return media?.preview?.thumbnailUrl || null;
}

export function isVideoMedia(
  media: AdminMediaCard | null | undefined,
  url?: string | null
) {
  const type = (media?.contentType || "").toLowerCase();
  const src = url || mediaPreviewUrl(media);
  return (
    type.includes("video") ||
    type.includes("live") ||
    Boolean(src?.match(/\.(mp4|webm|m3u8)(\?|$)/i))
  );
}

export function isAudioMedia(
  media: AdminMediaCard | null | undefined,
  url?: string | null
) {
  const type = (media?.contentType || "").toLowerCase();
  const src = url || mediaPreviewUrl(media);
  return (
    type.includes("audio") || Boolean(src?.match(/\.(mp3|wav|m4a)(\?|$)/i))
  );
}

/** Milliseconds until we should refresh a signed URL (buffer before expiry). */
export function signedRefreshDelayMs(
  preview: AdminMediaCard["preview"] | null | undefined,
  bufferSeconds = 90
) {
  if (!preview?.signed) return null;
  const expires = preview.expiresInSeconds;
  if (expires == null || expires <= 0) return 5 * 60 * 1000;
  const wait = Math.max((expires - bufferSeconds) * 1000, 15_000);
  return wait;
}

export function signedExpiryLabel(
  preview: AdminMediaCard["preview"] | null | undefined
) {
  if (!preview?.signed) return null;
  if (preview.expiresInSeconds == null) return "Signed URL";
  return `Signed · ~${Math.max(1, Math.round(preview.expiresInSeconds / 60))}m`;
}
