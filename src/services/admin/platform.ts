import { apiRequest } from "../../lib/api";
import { listFromUnknown, unwrapData } from "../../lib/api/unwrap";
import type { ApiSuccess } from "../../types/admin";

export type PlatformConfig = {
  uploadsEnabled?: boolean;
  registrationEnabled?: boolean;
  liveStreamingEnabled?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  minAppVersion?: { ios?: string; android?: string };
};

export async function fetchAdminConfig() {
  return unwrapData(
    await apiRequest<ApiSuccess<PlatformConfig>>("/admin/config")
  );
}

export async function patchAdminConfig(body: PlatformConfig) {
  return unwrapData(
    await apiRequest<ApiSuccess<PlatformConfig>>("/admin/config", {
      method: "PATCH",
      body,
    })
  );
}

export async function fetchSystemHealth() {
  return unwrapData(await apiRequest("/admin/system/health"));
}

export async function fetchAdminNotifications(unread = true) {
  const res = await apiRequest(
    `/admin/notifications?unread=${unread ? "true" : "false"}`
  );
  const data = unwrapData(res);
  return listFromUnknown<Record<string, unknown>>(data, [
    "notifications",
    "items",
    "data",
  ]);
}

export async function markNotificationsRead(body: {
  ids?: string[];
  all?: boolean;
}) {
  return apiRequest("/admin/notifications/read", { method: "POST", body });
}

export async function listAnnouncements(params?: {
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/announcements?${q.toString()}`);
  const data = unwrapData(res);
  return listFromUnknown<Record<string, unknown>>(data, [
    "announcements",
    "items",
    "data",
  ]);
}

export async function createAnnouncement(body: Record<string, unknown>) {
  return apiRequest("/admin/announcements", { method: "POST", body });
}

export async function patchAnnouncement(
  id: string,
  body: Record<string, unknown>
) {
  return apiRequest(`/admin/announcements/${id}`, { method: "PATCH", body });
}

export async function listCategories() {
  const res = await apiRequest("/admin/categories");
  const data = unwrapData(res);
  return listFromUnknown<Record<string, unknown>>(data, [
    "categories",
    "items",
    "data",
  ]);
}

export async function createCategory(body: Record<string, unknown>) {
  return apiRequest("/admin/categories", { method: "POST", body });
}

export async function deleteCategory(id: string) {
  return apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
}
