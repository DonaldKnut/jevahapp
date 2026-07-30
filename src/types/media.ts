/** Shared media / track catalog shapes (admin + creators + public listen). */

export type TrackCard = {
  id: string;
  _id?: string;
  title: string;
  artistName?: string;
  singer?: string;
  category?: string | null;
  genre?: string | null;
  language?: string | null;
  durationSec?: number | null;
  duration?: number | string | null;
  lane?: "curated" | "artist" | string;
  visibility?: "draft" | "published" | "archived" | string;
  copyrightStatus?: string;
  licenseNote?: string | null;
  playbackUrl?: string | null;
  fileUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  processingStatus?: "pending" | "processing" | "ready" | "failed" | string;
  processing?: { status?: string };
  playCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CopyrightFreeSong = {
  id?: string;
  _id?: string;
  title?: string;
  singer?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  duration?: number | string;
};

export type PresignSlot = {
  putUrl: string;
  key: string;
  headers?: Record<string, string>;
  expiresInSeconds?: number;
};

export type TrackUploadIntent = {
  trackId: string;
  audio: PresignSlot;
  cover: PresignSlot | null;
};

export const AUDIO_MAX_BYTES = 100 * 1024 * 1024;
export const COVER_MAX_BYTES = 5 * 1024 * 1024;
