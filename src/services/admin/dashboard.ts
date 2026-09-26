import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type {
  AdminUser,
  ApiSuccess,
  DashboardAnalytics,
  FeedEvent,
} from "../../types/admin";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickNum(
  obj: Record<string, unknown> | null,
  keys: string[]
): number | undefined {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

/** Map dashboard analytics whether nested, camelCase, or snake_case. */
export function normalizeDashboardAnalytics(raw: unknown): DashboardAnalytics {
  const root = asRecord(raw) ?? {};
  const inner = asRecord(root.analytics) ?? root;
  const reports = asRecord(inner.reports) ?? asRecord(root.reports);
  const moderation = asRecord(inner.moderation) ?? asRecord(root.moderation);
  const users = asRecord(inner.users) ?? asRecord(root.users);
  const verification =
    asRecord(inner.verification) ?? asRecord(root.verification);
  const pendingApps = pickNum(verification, [
    "pendingCreatorApplications",
    "pending_creator_applications",
    "unverifiedArtists",
    "unverified_artists",
    "pendingArtists",
    "pending_artists",
  ]);

  return {
    ...(inner as DashboardAnalytics),
    reports: {
      pending: pickNum(reports, ["pending", "open", "unresolved"]),
      comments: pickNum(reports, ["comments", "comment", "commentReports"]),
      total: pickNum(reports, ["total"]),
    },
    moderation: {
      pending: pickNum(moderation, [
        "pending",
        "under_review",
        "underReview",
        "queue",
      ]),
      rejected: pickNum(moderation, ["rejected"]),
    },
    users: {
      banned: pickNum(users, ["banned", "bannedCount"]),
      total: pickNum(users, ["total"]),
      roleDistribution: (users?.roleDistribution ?? users?.role_distribution) as
        | Record<string, number>
        | undefined,
    },
    verification: {
      unverifiedArtists: pendingApps,
      pendingCreatorApplications: pendingApps,
      activeArtistsMissingOnboardEmail: pickNum(verification, [
        "activeArtistsMissingOnboardEmail",
        "active_artists_missing_onboard_email",
      ]),
    },
    reminders: Array.isArray(inner.reminders)
      ? (inner.reminders as DashboardAnalytics["reminders"])
      : Array.isArray(root.reminders)
        ? (root.reminders as DashboardAnalytics["reminders"])
        : [],
  };
}

export async function fetchAnalytics() {
  const res = await apiRequest<ApiSuccess<DashboardAnalytics> | DashboardAnalytics>(
    "/admin/dashboard/analytics"
  );
  return normalizeDashboardAnalytics(unwrapData(res));
}

export async function fetchFeed(limit = 20) {
  const res = await apiRequest(`/admin/dashboard/feed?limit=${limit}`);
  const data = unwrapData(res);
  return {
    items: listFromUnknown<FeedEvent>(data, ["feed", "items", "data"]),
    onlineCount: paginationFrom(res).onlineCount,
  };
}

export async function fetchPresence(params: {
  status?: "online" | "offline" | "all";
  page?: number;
  limit?: number;
  search?: string;
}) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  const res = await apiRequest(`/admin/users/presence?${q.toString()}`);
  const data = unwrapData(res);
  const meta = paginationFrom(res);
  return {
    users: listFromUnknown<AdminUser>(data, ["users", "items", "data"]),
    onlineCount: meta.onlineCount ?? 0,
    total: meta.total,
  };
}

export async function fetchTimeseries(params: {
  metric: string;
  range?: string;
}) {
  const q = new URLSearchParams({ metric: params.metric });
  if (params.range) q.set("range", params.range);
  return unwrapData(
    await apiRequest(`/admin/dashboard/timeseries?${q.toString()}`)
  );
}

export async function fetchActivity(params: {
  page?: number;
  limit?: number;
  scope?: "all" | "me";
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.scope) q.set("scope", params.scope);
  if (params.actorId) q.set("actorId", params.actorId);
  if (params.action) q.set("action", params.action);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  const res = await apiRequest(`/admin/activity?${q.toString()}`);
  const data = unwrapData(res);
  return {
    activity: listFromUnknown<FeedEvent>(data, ["activity", "items", "feed", "data"]),
    total: paginationFrom(res).total,
  };
}
