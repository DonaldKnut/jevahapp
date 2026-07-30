import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";

export async function listChurches(params: {
  search?: string;
  isVerified?: boolean;
  isListed?: boolean;
  source?: string;
  hasContactEmail?: boolean;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.isVerified !== undefined) q.set("isVerified", String(params.isVerified));
  if (params.isListed !== undefined) q.set("isListed", String(params.isListed));
  if (params.source) q.set("source", params.source);
  if (params.hasContactEmail !== undefined) {
    q.set("hasContactEmail", String(params.hasContactEmail));
  }
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/churches?${q.toString()}`);
  const data = unwrapData(res);
  return {
    churches: listFromUnknown<Record<string, unknown>>(data, [
      "churches",
      "items",
      "data",
    ]),
    total: paginationFrom(res).total,
  };
}

export async function verifyChurch(id: string, isVerified: boolean) {
  return apiRequest(`/admin/churches/${id}/verification`, {
    method: "PATCH",
    body: { isVerified },
  });
}

export async function createChurch(body: {
  name: string;
  state: string;
  verified?: boolean;
  [key: string]: unknown;
}) {
  return apiRequest("/churches", { method: "POST", body });
}

export async function createAdminChurch(body: Record<string, unknown>) {
  try {
    return await apiRequest("/admin/churches", { method: "POST", body });
  } catch {
    return createChurch(body as { name: string; state: string });
  }
}

export async function patchAdminChurch(
  id: string,
  body: Record<string, unknown>
) {
  return apiRequest(`/admin/churches/${id}`, { method: "PATCH", body });
}
