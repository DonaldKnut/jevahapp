import { apiRequest } from "../../lib/api";
import { normalizeCreatorMe } from "./presenter";

export async function fetchCreatorMe() {
  return normalizeCreatorMe(await apiRequest("/creators/me"));
}

export async function applyAsCreator(body: {
  displayName: string;
  bio?: string;
  genres?: string[];
  creatorTypes?: string[];
  socials?: Record<string, string>;
  applicationNote?: string;
  avatarUrl?: string;
}) {
  return normalizeCreatorMe(
    await apiRequest("/creators/apply", { method: "POST", body })
  );
}

export async function updateCreatorProfile(body: {
  displayName?: string;
  bio?: string;
  genres?: string[];
  socials?: Record<string, string>;
  avatarUrl?: string;
}) {
  try {
    return normalizeCreatorMe(
      await apiRequest("/creators/me", { method: "PATCH", body })
    );
  } catch {
    return applyAsCreator({
      displayName: body.displayName || "Creator",
      bio: body.bio,
      genres: body.genres,
      socials: body.socials,
      avatarUrl: body.avatarUrl,
    });
  }
}
