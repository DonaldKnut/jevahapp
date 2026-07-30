import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type { AdminUser } from "../../types/admin";

export async function fetchUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBanned?: boolean;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  if (params.isBanned !== undefined) q.set("isBanned", String(params.isBanned));
  const res = await apiRequest(`/admin/users?${q.toString()}`);
  const data = unwrapData(res);
  const meta = paginationFrom(res);
  return {
    users: listFromUnknown<AdminUser>(data, ["users", "items", "data"]),
    onlineCount: meta.onlineCount ?? 0,
    total: meta.total,
    page: meta.page,
    totalPages: meta.totalPages,
  };
}

export async function getAdminUser(id: string) {
  return unwrapData(await apiRequest(`/admin/users/${id}`));
}

export async function deleteAdminUser(userId: string) {
  return apiRequest(`/users/${userId}`, { method: "DELETE" });
}

export async function banUser(
  id: string,
  body: { reason: string; duration?: number; revokeSessions?: boolean }
) {
  return apiRequest(`/admin/users/${id}/ban`, {
    method: "POST",
    body: { revokeSessions: true, ...body },
  });
}

export async function unbanUser(id: string) {
  return apiRequest(`/admin/users/${id}/unban`, { method: "POST" });
}

export async function warnUser(
  id: string,
  body: { subject: string; message: string; sendEmail?: boolean }
) {
  return apiRequest(`/admin/users/${id}/warn`, { method: "POST", body });
}

export async function patchUserRole(id: string, role: string) {
  return apiRequest(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export async function patchVerification(
  id: string,
  body: Partial<{
    isVerifiedCreator: boolean;
    isVerifiedVendor: boolean;
    isVerifiedChurch: boolean;
    isVerifiedArtist: boolean;
  }>
) {
  return apiRequest(`/admin/users/${id}/verification`, {
    method: "PATCH",
    body,
  });
}

export async function sendAdminEmail(body: {
  userIds?: string[];
  emails?: string[];
  churchIds?: string[];
  subject: string;
  message?: string;
  html?: string;
  dryRun?: boolean;
}) {
  return apiRequest("/admin/email", { method: "POST", body });
}

export async function fetchEmailLog(limit = 30) {
  const res = await apiRequest(`/admin/email/log?limit=${limit}`);
  const data = unwrapData(res);
  return listFromUnknown<Record<string, unknown>>(data, [
    "logs",
    "items",
    "emails",
    "data",
  ]);
}
