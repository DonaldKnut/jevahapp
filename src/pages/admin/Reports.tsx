import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  banUser,
  bulkReviewMediaReports,
  deleteReportedMedia,
  dismissCommentReports,
  fetchReports,
  getMediaReportDetail,
  hideComment,
  listCommentReports,
  reviewMediaReport,
  unhideComment,
} from "../../services/adminApi";
import type { MediaReportDetail, ReportItem } from "../../types/admin";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  FilterBar,
  PageHeader,
  Skeleton,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import MediaPreview from "../../components/admin/MediaPreview";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import { getErrorMessage } from "../../lib/errors";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

function reportId(r: ReportItem) {
  return r.id || r._id || "";
}

function reportKind(r: ReportItem) {
  return r.kind || r.type || "media";
}

export default function ReportsPage() {
  const { confirm, prompt, toast } = useFeedback();
  const [params, setParams] = useSearchParams();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MediaReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const type = params.get("type") || "all";
  const status = params.get("status") || "pending";
  const page = Number(params.get("page") || "1");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (type === "comment") {
        const res = await listCommentReports({ page, limit: 20 });
        setReports(res.reports);
      } else {
        const res = await fetchReports({ type, status, page, limit: 20 });
        setReports(res.reports);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load reports."));
    } finally {
      setLoading(false);
    }
  }, [type, status, page]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 45000);
    return () => window.clearInterval(id);
  }, [load]);

  async function openMediaReport(id: string) {
    setDetailLoading(true);
    setError(null);
    setAdminNotes("");
    try {
      const res = await getMediaReportDetail(id);
      setDetail(res);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load report detail."));
    } finally {
      setDetailLoading(false);
    }
  }

  async function review(statusValue: "reviewed" | "resolved" | "dismissed") {
    if (!detail?.report.id) return;
    setBusy(true);
    try {
      await reviewMediaReport(detail.report.id, {
        status: statusValue,
        adminNotes: adminNotes || undefined,
      });
      setDetail(null);
      await load();
      toast.success(
        statusValue === "resolved"
          ? "Resolved — media hidden"
          : statusValue === "dismissed"
            ? "Report dismissed"
            : "Marked reviewed"
      );
    } catch (err) {
      setError(getErrorMessage(err, "Review failed."));
      toast.error("Review failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function deleteContent() {
    const mediaId = detail?.media?.id;
    if (!mediaId) return;
    const ok = await confirm({
      title: "Delete reported media?",
      message:
        "This permanently deletes the content and resolves related reports. This cannot be undone.",
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteReportedMedia(mediaId);
      setDetail(null);
      await load();
      toast.success("Content deleted");
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed."));
      toast.error("Delete failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function banUploaderFromReport() {
    const uploaderId = detail?.uploader?.id;
    if (!uploaderId) return;
    const reason = await prompt({
      title: "Ban uploader",
      message: `Ban ${detail?.uploader?.email || "this user"} for 7 days.`,
      label: "Reason",
      defaultValue: "Repeated policy violations",
      confirmLabel: "Ban for 7 days",
      tone: "danger",
    });
    if (reason == null) return;
    setBusy(true);
    try {
      await banUser(uploaderId, {
        reason: reason || "Repeated policy violations",
        duration: 7,
      });
      toast.success("Uploader banned");
    } catch (err) {
      setError(getErrorMessage(err, "Ban failed."));
      toast.error("Ban failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function commentAction(
    commentId: string,
    action: "hide" | "unhide" | "dismiss"
  ) {
    setBusy(true);
    try {
      if (action === "hide") await hideComment(commentId, { reason: "harassment" });
      if (action === "unhide") await unhideComment(commentId);
      if (action === "dismiss") await dismissCommentReports(commentId);
      await load();
      toast.success(
        action === "hide"
          ? "Comment hidden"
          : action === "unhide"
            ? "Comment unhidden"
            : "Reports dismissed"
      );
    } catch (err) {
      setError(getErrorMessage(err, "Action failed."));
      toast.error("Action failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkReview(statusValue: "dismissed" | "reviewed" | "resolved") {
    const ids = Array.from(selected).slice(0, 50);
    if (!ids.length) return;
    setBusy(true);
    try {
      await bulkReviewMediaReports({
        reportIds: ids,
        status: statusValue,
        adminNotes: adminNotes || undefined,
      });
      toast.success(`Bulk ${statusValue}`, `${ids.length} report(s)`);
      setSelected(new Set());
      await load();
    } catch (err) {
      toast.error(
        "Bulk review failed",
        getErrorMessage(err, "Something went wrong")
      );
    } finally {
      setBusy(false);
    }
  }

  const previewMedia = detail?.media || null;
  const { onPlaybackError } = useSignedPreviewRefresh(previewMedia, (next) => {
    setDetail((prev) => (prev ? { ...prev, media: next } : prev));
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Media and comment report inbox — polls about every 45s."
      />

      <FilterBar>
        <select
          value={type}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set("type", e.target.value);
            next.set("page", "1");
            setParams(next);
          }}
          className={inputClass}
        >
          <option value="all">All types</option>
          <option value="media">Media</option>
          <option value="comment">Comments</option>
        </select>
        {type !== "comment" ? (
          <select
            value={status}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("status", e.target.value);
              next.set("page", "1");
              setParams(next);
            }}
            className={inputClass}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All statuses</option>
          </select>
        ) : (
          <div className="hidden sm:block" />
        )}
      </FilterBar>

      {type !== "comment" && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs font-medium text-slate-600">
            {selected.size} selected
          </span>
          <Button
            variant="secondary"
            className="min-h-9 text-xs"
            disabled={busy}
            onClick={() => void bulkReview("dismissed")}
          >
            Bulk dismiss
          </Button>
          <Button
            variant="secondary"
            className="min-h-9 text-xs"
            disabled={busy}
            onClick={() => void bulkReview("reviewed")}
          >
            Bulk reviewed
          </Button>
          <Button
            variant="danger"
            className="min-h-9 text-xs"
            disabled={busy}
            onClick={() => void bulkReview("resolved")}
          >
            Bulk resolve
          </Button>
          <Button
            variant="ghost"
            className="min-h-9 text-xs"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      <div className="space-y-3">
        {loading ? (
          <SkeletonRows rows={4} />
        ) : reports.length === 0 ? (
          <EmptyState title="No reports in this filter" />
        ) : (
          reports.map((r, i) => {
            const id = reportId(r);
            const kind = reportKind(r);
            return (
              <article
                key={id}
                className="admin-list-item rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {kind === "media" && (
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selected.has(id)}
                        onChange={() => toggleSelect(id)}
                      />
                    )}
                    <Badge tone="danger">{kind}</Badge>
                  </div>
                  <span className="text-xs text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-[#0B1A1F]">
                  {r.reason || "Reported content"}
                </p>
                {r.description && (
                  <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Status: {r.status || "—"}
                  {r.reporter?.email ? ` · by ${r.reporter.email}` : ""}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  {kind === "media" && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => void openMediaReport(id)}
                    >
                      Open detail
                    </Button>
                  )}
                  {kind === "comment" && (
                    <>
                      <Button
                        variant="secondary"
                        disabled={busy}
                        className="w-full sm:w-auto"
                        onClick={() =>
                          void commentAction(r.commentId || id, "hide")
                        }
                      >
                        Hide
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={busy}
                        className="w-full sm:w-auto"
                        onClick={() =>
                          void commentAction(r.commentId || id, "unhide")
                        }
                      >
                        Unhide
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busy}
                        className="w-full sm:w-auto"
                        onClick={() =>
                          void commentAction(r.commentId || id, "dismiss")
                        }
                      >
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex bg-[#0B1A1F]/45 sm:items-stretch sm:justify-end sm:bg-black/40">
          <button
            type="button"
            className="hidden flex-1 sm:block"
            aria-label="Close"
            onClick={() => setDetail(null)}
          />
          <div className="flex h-dvh w-full max-w-none flex-col bg-white shadow-2xl admin-panel-in sm:h-auto sm:max-w-lg">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 sm:hidden"
                onClick={() => setDetail(null)}
                aria-label="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">
                Report detail
              </h2>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 sm:inline-flex"
                onClick={() => setDetail(null)}
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="space-y-3 p-5">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                  {detail.media && (
                    <MediaPreview
                      media={detail.media}
                      compact
                      onPlaybackError={onPlaybackError}
                    />
                  )}

                  <div>
                    <p className="text-base font-semibold text-[#0B1A1F]">
                      {detail.media.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {detail.report.reason} · {detail.report.status}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {detail.report.description || "No description"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Reporter: {detail.report.reporter?.email || "—"}
                      <br />
                      Uploader: {detail.uploader?.email || "—"}
                    </p>
                  </div>

                  {detail.siblingReports?.length > 0 && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs">
                      <p className="font-semibold">
                        Sibling reports ({detail.siblingReports.length})
                      </p>
                      <ul className="mt-1 space-y-1">
                        {detail.siblingReports.map((s) => (
                          <li key={reportId(s)}>
                            {s.reason || "report"} · {s.status}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Field label="Admin notes">
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="sticky bottom-0 grid grid-cols-1 gap-2 border-t bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:grid-cols-2 sm:px-5">
                  {(
                    detail.actions?.review || [
                      "dismissed",
                      "reviewed",
                      "resolved",
                    ]
                  ).map((s) => (
                    <Button
                      key={s}
                      disabled={busy}
                      onClick={() =>
                        void review(s as "reviewed" | "resolved" | "dismissed")
                      }
                      className="min-h-11 capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                  {detail.actions?.deleteContent !== false && (
                    <Button
                      variant="danger"
                      disabled={busy}
                      className="min-h-11"
                      onClick={() => void deleteContent()}
                    >
                      Delete content
                    </Button>
                  )}
                  {detail.actions?.banUploader !== false &&
                    detail.uploader?.id && (
                      <Button
                        variant="warning"
                        disabled={busy}
                        className="min-h-11"
                        onClick={() => void banUploaderFromReport()}
                      >
                        Ban uploader
                      </Button>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
