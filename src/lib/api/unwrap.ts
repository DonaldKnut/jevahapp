import type { ApiSuccess, Paginated } from "../../types/admin";

/** Unwrap `{ success, data }` or return payload as-is. */
export function unwrapData<T>(payload: ApiSuccess<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as ApiSuccess<T>).data !== undefined
  ) {
    return (payload as ApiSuccess<T>).data as T;
  }
  return payload as T;
}

/** Pull the first matching array from a loosely shaped API payload. */
export function listFromUnknown<T>(res: unknown, keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[];
  if (!res || typeof res !== "object") return [];
  const obj = res as Record<string, unknown>;

  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const nested = listFromUnknown<T>(obj.data, keys);
    if (nested.length) return nested;
  }

  for (const key of keys) {
    const val = obj[key];
    if (Array.isArray(val)) return val as T[];
  }

  if (Array.isArray(obj.data)) return obj.data as T[];
  return [];
}

export type PaginationMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onlineCount?: number;
};

export function paginationFrom(res: unknown): PaginationMeta {
  if (!res || typeof res !== "object") return {};
  const obj = res as Record<string, unknown>;
  const inner =
    obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)
      ? (obj.data as Record<string, unknown>)
      : obj;
  const p = (inner.pagination || obj.pagination) as
    | Paginated<unknown>["pagination"]
    | undefined;
  return {
    page: p?.page ?? (inner.page as number | undefined),
    limit: p?.limit ?? (inner.limit as number | undefined),
    total: p?.total ?? (inner.total as number | undefined),
    totalPages:
      p?.pages ??
      (inner.totalPages as number | undefined) ??
      (inner.pages as number | undefined),
    onlineCount: (inner.onlineCount ?? obj.onlineCount) as number | undefined,
  };
}

/** Stable id from Mongo-ish documents (`id` or `_id`). */
export function entityId(row: { id?: string; _id?: string } | null | undefined) {
  return String(row?.id || row?._id || "");
}
