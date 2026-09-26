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

export function isHttp(u?: string | null) {
  return typeof u === "string" && /^https?:\/\//i.test(u);
}

export function isHls(u?: string | null) {
  return typeof u === "string" && /\.m3u8(\?|$)/i.test(u);
}

export function isSignedUrl(u?: string | null) {
  return typeof u === "string" && /X-Amz-Algorithm|X-Amz-Signature/i.test(u);
}

export function looksLikeEbook(contentType?: string | null) {
  return /ebook|books/i.test(contentType || "");
}

export function looksLikeAudio(contentType?: string | null, url?: string | null) {
  return (
    /^(music|audio|podcast)$/i.test(contentType || "") ||
    /\.(mp3|m4a|wav|aac|ogg|flac)(\?|$)/i.test(url || "")
  );
}

export type AdminPlayable = {
  kind: "video" | "audio" | "document" | "none";
  url: string | null;
  useHlsJs: boolean;
  mustRefresh: boolean;
};

/** Play from `preview` only. Prefer MP4. Never stuff HLS into `<video src>`. */
export function resolveAdminPlayable(
  card: AdminMediaCard | null | undefined
): AdminPlayable {
  const empty: AdminPlayable = {
    kind: "none",
    url: null,
    useHlsJs: false,
    mustRefresh: true,
  };
  if (!card?.preview) return empty;

  const p = card.preview;
  const mp4 =
    [p.playbackUrl, p.mediaUrl].find((u) => isHttp(u) && !isHls(u)) || null;
  const hls = isHttp(p.hlsUrl)
    ? p.hlsUrl
    : isHls(p.mediaUrl)
      ? p.mediaUrl
      : null;

  if (looksLikeEbook(card.contentType)) {
    return {
      kind: "document",
      url: mp4 || (isHttp(p.mediaUrl) ? p.mediaUrl : null),
      useHlsJs: false,
      mustRefresh: false,
    };
  }
  if (looksLikeAudio(card.contentType, mp4 || p.mediaUrl)) {
    return {
      kind: "audio",
      url: mp4 || (isHttp(p.mediaUrl) ? p.mediaUrl : null),
      useHlsJs: false,
      mustRefresh: Boolean(p.signed || isSignedUrl(mp4 || p.mediaUrl)),
    };
  }
  if (mp4) {
    return {
      kind: "video",
      url: mp4,
      useHlsJs: false,
      mustRefresh: Boolean(p.signed || isSignedUrl(mp4)),
    };
  }
  if (hls) {
    return {
      kind: "video",
      url: hls,
      useHlsJs: true,
      mustRefresh: Boolean(p.signed || isSignedUrl(hls)),
    };
  }
  return empty;
}

/** @deprecated use resolveAdminPlayable(card).url */
export function mediaPreviewUrl(media: AdminMediaCard | null | undefined) {
  return resolveAdminPlayable(media).url;
}

export function mediaThumbUrl(media: AdminMediaCard | null | undefined) {
  const thumb = media?.preview?.thumbnailUrl;
  return isHttp(thumb) ? thumb : null;
}

export function isVideoMedia(media: AdminMediaCard | null | undefined) {
  return resolveAdminPlayable(media).kind === "video";
}

export function isAudioMedia(media: AdminMediaCard | null | undefined) {
  return resolveAdminPlayable(media).kind === "audio";
}

export function isProcessingPreview(media: AdminMediaCard | null | undefined) {
  const status = (media?.processing?.status || "").toLowerCase();
  if (!/queued|processing|pending/.test(status)) return false;
  const play = resolveAdminPlayable(media);
  return !play.url || play.useHlsJs;
}

export function signedRefreshDelayMs(
  preview: AdminMediaCard["preview"] | null | undefined,
  playUrl?: string | null
) {
  const signed =
    Boolean(preview?.signed) ||
    isSignedUrl(playUrl) ||
    isSignedUrl(preview?.mediaUrl) ||
    isSignedUrl(preview?.playbackUrl) ||
    isSignedUrl(preview?.hlsUrl);
  if (!signed) return null;
  const expires = preview?.expiresInSeconds;
  if (expires == null || expires <= 0) return 50 * 60 * 1000;
  return Math.max((expires - 60) * 1000, 15_000);
}

export function signedExpiryLabel(
  preview: AdminMediaCard["preview"] | null | undefined
) {
  if (!preview?.signed && !isSignedUrl(preview?.mediaUrl) && !isSignedUrl(preview?.playbackUrl)) {
    return null;
  }
  if (preview?.expiresInSeconds == null) return "Signed URL";
  return `Signed · ~${Math.max(1, Math.round(preview.expiresInSeconds / 60))}m`;
}
