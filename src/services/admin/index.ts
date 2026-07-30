/**
 * Admin API surface — domain modules under ./admin/*
 * Import from `services/adminApi` for backward compatibility.
 */
export * from "./dashboard";
export * from "./users";
export * from "./reports";
export * from "./moderation";
export * from "./audio";
export * from "./churches";
export * from "./artists";
export * from "./platform";

export { unwrapData } from "../../lib/api/unwrap";
export {
  trackId,
  trackPlaybackUrl,
  trackArtist,
  trackDuration,
  trackProcessing,
  formatTrackDuration,
  putPresignedFile,
  runPresignedTrackUpload,
} from "../../lib/media";
