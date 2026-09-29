/** Public sermon catalog shapes (`GET /api/sermons*`). */

export type SermonMediaType = "audio" | "video";

export type SermonCard = {
  id: string;
  _id?: string;
  title: string;
  speaker: string | null;
  church: string | null;
  description: string | null;
  scripture: string | null;
  series: string | null;
  duration: number | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  hlsUrl: string | null;
  mediaType: SermonMediaType;
  category: string | null;
  language: string | null;
  topics: string[];
  publishedAt: string | null;
  playCount: number;
  likeCount: number;
  processingStatus: string;
  moderationStatus: string;
  contentType: "sermon";
};

export type SermonListResult = {
  items: SermonCard[];
  total: number;
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  page: number;
  pages: number;
};

export type SermonTopicsResult = {
  topics: string[];
  series: string[];
  languages: string[];
};

/** Live public media row from `GET /api/media/public/all-content`. */
export type PublicMediaCard = {
  id: string;
  _id?: string;
  title?: string | null;
  description?: string | null;
  contentType?: string | null;
  mediaType?: string | null;
  thumbnailUrl?: string | null;
  playbackUrl?: string | null;
  hlsUrl?: string | null;
  speaker?: string | null;
  artistName?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  playCount?: number;
  durationSec?: number | null;
  duration?: number | null;
};
