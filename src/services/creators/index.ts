/**
 * Creators / public music API — no admin imports (SOLID: ISP + DIP).
 */
export * from "./presenter";
export * from "./session";
export * from "./tracks";
export * from "./catalog";
export * from "./analytics";
export * from "./releases";


export {
  trackId,
  trackPlaybackUrl,
  trackArtist,
  trackDuration,
  trackProcessing,
  formatTrackDuration,
  putPresignedFile,
  runPresignedTrackUpload,
  AUDIO_MAX_BYTES,
  COVER_MAX_BYTES,
  type TrackCard,
} from "../../lib/media";
