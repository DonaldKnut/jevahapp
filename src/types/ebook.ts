/** Public ebook catalog shapes (`GET /api/ebooks*`). */

export type EbookCard = {
  id: string;
  _id?: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  pdfUrl: string | null;
  authorName: string | null;
  category: string | null;
  topics: string[];
  publishedAt: string | null;
  readCount: number;
  likeCount: number;
  processingStatus: string;
  moderationStatus: string;
  contentType: "ebook";
};

export type EbookListResult = {
  items: EbookCard[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type EbookTextPage = {
  page: number;
  text: string;
};

export type EbookTextResult = {
  title: string | null;
  totalPages: number;
  pages: EbookTextPage[];
};

export type EbookTtsConfig = {
  available: boolean;
  voices?: string[];
  message?: string;
};

export type EbookTtsResult = {
  audioUrl: string | null;
  timings?: unknown;
  status?: string;
};
