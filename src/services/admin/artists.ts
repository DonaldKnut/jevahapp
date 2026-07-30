import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";

export async function listArtists(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/artists?${q.toString()}`);
  const data = unwrapData(res);
  return {
    items: listFromUnknown<Record<string, unknown>>(data, [
      "artists",
      "items",
      "data",
    ]),
    total: paginationFrom(res).total,
  };
}

export async function createArtist(body: Record<string, unknown>) {
  return apiRequest("/admin/artists", { method: "POST", body });
}

export async function patchArtist(id: string, body: Record<string, unknown>) {
  return apiRequest(`/admin/artists/${id}`, { method: "PATCH", body });
}
