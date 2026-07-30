import { unwrapData } from "../../lib/api/unwrap";
import type {
  ArtistCard,
  CreatorCapabilities,
  CreatorMe,
  CreatorNextStep,
} from "../../types/creator";

export type {
  ArtistCard,
  CreatorCapabilities,
  CreatorMe,
  CreatorNextStep,
} from "../../types/creator";

function fallbackCapabilities(
  partial?: Partial<CreatorMe>
): CreatorCapabilities {
  const status = partial?.status ?? null;
  const artist = partial?.artist ?? null;
  if (!artist) {
    return {
      canApply: true,
      canEditProfile: false,
      canUploadTracks: false,
      canPublishTracks: false,
      showPendingBanner: false,
      showCreatorHub: false,
      showPublicProfile: false,
      publicProfilePath: null,
      nextStep: "apply",
      statusMessage: "Share your music on Jevah — apply to become a creator.",
    };
  }
  if (status === "pending") {
    return {
      canApply: false,
      canEditProfile: true,
      canUploadTracks: false,
      canPublishTracks: false,
      showPendingBanner: true,
      showCreatorHub: true,
      showPublicProfile: false,
      publicProfilePath: artist.slug ? `/artists/${artist.slug}` : null,
      nextStep: "wait_review",
      statusMessage:
        "Your application is under review. We’ll notify you when approved.",
    };
  }
  if (status === "suspended") {
    return {
      canApply: false,
      canEditProfile: false,
      canUploadTracks: false,
      canPublishTracks: false,
      showPendingBanner: false,
      showCreatorHub: true,
      showPublicProfile: false,
      publicProfilePath: null,
      nextStep: "contact_support",
      statusMessage:
        "Your creator account is suspended. Contact support@jevahapp.com.",
    };
  }
  return {
    canApply: false,
    canEditProfile: true,
    canUploadTracks: true,
    canPublishTracks: true,
    showPendingBanner: false,
    showCreatorHub: true,
    showPublicProfile: Boolean(artist.slug),
    publicProfilePath: artist.slug ? `/artists/${artist.slug}` : null,
    nextStep: "manage_catalog",
    statusMessage: "You’re an active creator. Manage your catalog below.",
  };
}

/** Normalize `/creators/me` payloads into a UI-ready CreatorMe presenter. */
export function normalizeCreatorMe(raw: unknown): CreatorMe {
  const data = unwrapData(raw as { data?: CreatorMe }) as CreatorMe & {
    artist?: ArtistCard | null;
  };
  const artist = data?.artist ?? null;
  const status = (data?.status ??
    artist?.status ??
    null) as CreatorMe["status"];
  const caps =
    data?.capabilities && typeof data.capabilities === "object"
      ? { ...fallbackCapabilities({ artist, status }), ...data.capabilities }
      : fallbackCapabilities({ artist, status });

  return {
    artist,
    capabilities: caps,
    status,
    canUpload: Boolean(data?.canUpload ?? caps.canUploadTracks),
    nextStep: (data?.nextStep || caps.nextStep) as CreatorNextStep,
  };
}
