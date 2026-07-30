import { apiRequest } from "../../lib/api";
import { listFromUnknown, paginationFrom, unwrapData } from "../../lib/api/unwrap";
import type { ApiSuccess, MediaReportDetail, ReportItem } from "../../types/admin";

export async function fetchReports(params: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.type) q.set("type", params.type);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await apiRequest(`/admin/reports?${q.toString()}`);
  const data = unwrapData(res);
  return {
    reports: listFromUnknown<ReportItem>(data, ["reports", "items", "data"]),
    total: paginationFrom(res).total,
  };
}

export async function getMediaReportDetail(reportId: string) {
  const res = await apiRequest<ApiSuccess<MediaReportDetail>>(
    `/admin/reports/media/${reportId}`
  );
  return unwrapData(res);
}

export async function reviewMediaReport(
  reportId: string,
  body: { status: "reviewed" | "resolved" | "dismissed"; adminNotes?: string }
) {
  return apiRequest(`/admin/reports/media/${reportId}/review`, {
    method: "POST",
    body,
  });
}

export async function deleteReportedMedia(mediaId: string) {
  return apiRequest(`/admin/reports/media/${mediaId}/content`, {
    method: "DELETE",
  });
}

export async function bulkReviewMediaReports(body: {
  reportIds: string[];
  status: "dismissed" | "reviewed" | "resolved";
  adminNotes?: string;
}) {
  return unwrapData(
    await apiRequest("/admin/reports/media/bulk-review", {
      method: "POST",
      body,
    })
  );
}

export async function listCommentReports(params: {
  page?: number;
  limit?: number;
  hidden?: boolean;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.hidden !== undefined) q.set("hidden", String(params.hidden));
  const res = await apiRequest(`/admin/reports/comments?${q.toString()}`);
  const data = unwrapData(res);
  return {
    reports: listFromUnknown<ReportItem>(data, [
      "reports",
      "items",
      "comments",
      "data",
    ]),
    total: paginationFrom(res).total,
  };
}

export async function hideComment(commentId: string, body?: { reason?: string }) {
  return apiRequest(`/admin/reports/comments/${commentId}/hide`, {
    method: "POST",
    body: body || {},
  });
}

export async function unhideComment(commentId: string) {
  return apiRequest(`/admin/reports/comments/${commentId}/unhide`, {
    method: "POST",
  });
}

export async function dismissCommentReports(commentId: string) {
  return apiRequest(`/admin/reports/comments/${commentId}/dismiss`, {
    method: "POST",
  });
}
