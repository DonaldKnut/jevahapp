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
  AUDIO_MAX_BYTES,
  COVER_MAX_BYTES,
  type TrackCard,
  type CopyrightFreeSong,
  type TrackUploadIntent,
  type PresignSlot,
} from "../types/media";
