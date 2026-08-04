export type UserRole =
  | "learner"
  | "parent"
  | "educator"
  | "moderator"
  | "admin"
  | "content_creator"
  | "vendor"
  | "church_admin"
  | "artist";

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string | null;
  role: UserRole | string;
  isProfileComplete?: boolean;
  isBanned?: boolean;
  banUntil?: string | null;
  banReason?: string | null;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  isOnline?: boolean;
  isVerifiedCreator?: boolean;
  isVerifiedVendor?: boolean;
  isVerifiedChurch?: boolean;
  isVerifiedArtist?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: AdminUser;
  message?: string;
}

export interface DashboardAnalytics {
  reports?: {
    pending?: number;
    comments?: number;
    total?: number;
  };
  moderation?: {
    pending?: number;
    rejected?: number;
  };
  users?: {
    banned?: number;
    total?: number;
    roleDistribution?: Record<string, number>;
  };
  verification?: {
    unverifiedArtists?: number;
    pendingCreatorApplications?: number;
    activeArtistsMissingOnboardEmail?: number;
  };
  content?: {
    total?: number;
  };
  media?: {
    total?: number;
  };
  reminders?: Array<string | { message?: string; code?: string; to?: string }>;
  [key: string]: unknown;
}

export interface FeedEvent {
  id: string;
  type:
    | "upload"
    | "review"
    | "report"
    | "delete_media"
    | "send_email"
    | "admin_action"
    | string;
  title?: string;
  message?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  meta?: Record<string, unknown>;
  actor?: { name?: string; email?: string };
}

export interface AdminMediaPreview {
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  hlsUrl: string | null;
  signed: boolean;
  expiresInSeconds: number | null;
}

export interface AdminMediaCard {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  category: string | null;
  moderationStatus: "pending" | "approved" | "rejected" | "under_review" | string;
  publicationState?:
    | "draft"
    | "staged"
    | "publishing"
    | "live"
    | "tombstoned"
    | null;
  isHidden: boolean;
  reportCount: number;
  likeCount: number;
  viewCount: number;
  adminModerationNotes: string | null;
  moderationResult: {
    isApproved: boolean;
    confidence: number | null;
    reason: string | null;
    flags: string[];
    requiresReview: boolean;
    moderatedAt: string | null;
  } | null;
  processing: {
    status: string | null;
    error: string | null;
    progress: number | null;
    updatedAt: string | null;
  } | null;
  preview: AdminMediaPreview;
  uploader: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated prefer AdminMediaCard */
export type MediaItem = AdminMediaCard & {
  _id?: string;
  type?: string;
  thumbnail?: string | null;
  coverImage?: string | null;
};

export interface ModerationCaseSummary {
  id: string;
  decision?: {
    isApproved?: boolean;
    confidence?: number | null;
    reason?: string | null;
    flags?: string[];
    requiresReview?: boolean;
  };
  scores?: Record<string, unknown>;
  modalityCoverage?: Record<string, unknown>;
  languageCandidates?: string[];
  provider?: string;
  modelId?: string;
  promptVersion?: string;
  policyVersion?: string;
  reviewerOutcome?: unknown;
  createdAt?: string;
}

export interface ReportItem {
  id: string;
  _id?: string;
  kind?: "media" | "comment";
  type?: "media" | "comment" | string;
  status?: string;
  reason?: string;
  description?: string;
  createdAt?: string;
  adminNotes?: string | null;
  reporter?: { id?: string; email?: string; firstName?: string };
  target?: { id?: string; title?: string };
  mediaId?: string;
  commentId?: string;
}

export interface MediaReportDetail {
  report: ReportItem;
  media: AdminMediaCard;
  uploader: { id: string; email?: string; firstName?: string; lastName?: string } | null;
  siblingReports: ReportItem[];
  actions: {
    review: Array<"reviewed" | "resolved" | "dismissed" | string>;
    deleteContent: boolean;
    banUploader: boolean;
  };
}

export interface Paginated<T> {
  data?: T[] | Record<string, unknown>;
  users?: T[];
  items?: T[];
  reports?: T[];
  media?: T[];
  feed?: T[];
  activity?: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  pages?: number;
  onlineCount?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  success?: boolean;
}

export interface ApiSuccess<T> {
  success?: boolean;
  data?: T;
  message?: string;
}
