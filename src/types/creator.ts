export type CreatorNextStep =
  | "apply"
  | "wait_review"
  | "upload_first_track"
  | "manage_catalog"
  | "contact_support"
  | string;

export type CreatorCapabilities = {
  canApply: boolean;
  canEditProfile: boolean;
  canUploadTracks: boolean;
  canPublishTracks: boolean;
  showPendingBanner: boolean;
  showCreatorHub: boolean;
  showPublicProfile: boolean;
  publicProfilePath: string | null;
  nextStep: CreatorNextStep;
  statusMessage: string;
};

export type ArtistCard = {
  id?: string;
  _id?: string;
  slug?: string;
  displayName?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  genres?: string[];
  creatorTypes?: string[];
  socials?: Record<string, string>;
  isVerified?: boolean;
  status?: string;
};

export type CreatorMe = {
  artist: ArtistCard | null;
  capabilities: CreatorCapabilities;
  status: "pending" | "active" | "suspended" | null;
  canUpload: boolean;
  nextStep: CreatorNextStep;
};
