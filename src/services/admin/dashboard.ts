import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type {
  AdminUser,
  ApiSuccess,
  DashboardAnalytics,
  FeedEvent,
} from "../../types/admin";

export async function fetchAnalytics() {
  const res = await apiRequest<ApiSuccess<DashboardAnalytics> | DashboardAnalytics>(
    "/admin/dashboard/analytics"
  );
  return unwrapData(res);
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
