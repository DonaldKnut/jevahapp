import { apiRequest } from "../../lib/api";
import { unwrapData } from "../../lib/api/unwrap";

export type MarketingSegment =
  | "all_opted_in"
  | "role"
  | "userIds"
  | "emails";

export type ArtistOnboardSegment =
  | "artistIds"
  | "userIds"
  | "emails"
  | "pending"
  | "active"
  | "active_missing_onboard";

function countFromUnknown(data: unknown): number {
  if (typeof data === "number") return data;
  if (!data || typeof data !== "object") return 0;
  const o = data as Record<string, unknown>;
  for (const key of ["count", "total", "recipientCount", "recipients"]) {
    const v = o[key];
    if (typeof v === "number") return v;
  }
  return 0;
}

export async function sendMarketingEmail(body: {
  subject: string;
  message?: string;
  html?: string;
  segment: MarketingSegment;
  roles?: string[];
  userIds?: string[];
  emails?: string[];
  dryRun?: boolean;
  limit?: number;
  allowRawEmails?: boolean;
}) {
  return apiRequest("/admin/email/marketing", { method: "POST", body });
}

export async function previewMarketingCount(params: {
  segment: MarketingSegment;
  roles?: string[];
  userIds?: string[];
  emails?: string[];
  limit?: number;
}) {
  const q = new URLSearchParams();
  q.set("segment", params.segment);
  if (params.roles?.length) q.set("roles", params.roles.join(","));
  if (params.userIds?.length) q.set("userIds", params.userIds.join(","));
  if (params.emails?.length) q.set("emails", params.emails.join(","));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(
    `/admin/email/marketing/preview-count?${q.toString()}`
  );
  return countFromUnknown(unwrapData(res));
}

export async function sendArtistOnboardEmail(body: {
  segment?: ArtistOnboardSegment;
  artistIds?: string[];
  userIds?: string[];
  emails?: string[];
  subject?: string;
  message?: string;
  dryRun?: boolean;
  limit?: number;
}) {
  return apiRequest("/admin/email/artist-onboard", { method: "POST", body });
}

export async function previewArtistOnboardCount(params: {
  segment?: ArtistOnboardSegment;
  artistIds?: string[];
  userIds?: string[];
  emails?: string[];
  limit?: number;
}) {
  const q = new URLSearchParams();
  q.set("segment", params.segment || "active_missing_onboard");
  if (params.artistIds?.length)
    q.set("artistIds", params.artistIds.join(","));
  if (params.userIds?.length) q.set("userIds", params.userIds.join(","));
  if (params.emails?.length) q.set("emails", params.emails.join(","));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(
    `/admin/email/artist-onboard/preview-count?${q.toString()}`
  );
  return countFromUnknown(unwrapData(res));
}
