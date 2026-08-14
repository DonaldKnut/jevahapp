/**
 * Public barrel for media helpers.
 * Implementations live in ./mediaParts/* (folder renamed to avoid
 * Vite resolving `media.ts` vs `media/` ambiguously).
 */
export {
  trackId,
  trackPlaybackUrl,
  trackArtist,
  trackDuration,
  trackThumb,
  trackProcessing,
  formatTrackDuration,
  copyrightFreeToTrack,
} from "./mediaParts/track";
export { putPresignedFile, runPresignedTrackUpload } from "./mediaParts/upload";
export {
  formatAge,
  uploaderLabel,
  mediaPreviewUrl,
  mediaThumbUrl,
  isVideoMedia,
  isAudioMedia,
  signedRefreshDelayMs,
  signedExpiryLabel,
} from "./mediaParts/preview";
export {
  TRACK_GENRES,
  TRACK_GENRE_LABELS,
  genreLabel,
  type TrackGenre,
} from "./mediaParts/genres";
export {
  normalizeTrackCard,
  normalizeTrackList,
  normalizeCopyrightFree,
} from "./mediaParts/normalizeTrack";
export {
  AUDIO_MAX_BYTES,
  COVER_MAX_BYTES,
  type TrackCard,
  type CopyrightFreeSong,
  type TrackUploadIntent,
  type PresignSlot,
  type TrackReleaseRef,
} from "../types/media";
