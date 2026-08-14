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
  FilterBar,
  PageHeader,
  SkeletonRows,
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import { getErrorMessage } from "../../lib/errors";
import {
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import ReportDetailDrawer from "./components/ReportDetailDrawer";

function reportId(r: ReportItem) {
  return r.id || r._id || "";
}

function reportKind(r: ReportItem) {
  return r.kind || r.type || "media";
}

function statusTone(status?: string): "warning" | "success" | "neutral" | "danger" | "info" {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "warning";
  if (s === "resolved" || s === "reviewed") return "success";
  if (s === "dismissed") return "neutral";
  return "danger";
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
    <PageEnter>
      <PageHeader
        title="Reports Inbox"
        subtitle="Community flags, abuse reports, comment moderation, and content review."
        badgeText="Moderation Desk"
      />

      {/* ── Filter Bar ── */}
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
          <option value="all">All Content Types</option>
          <option value="media">Media Submissions</option>
          <option value="comment">User Comments</option>
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
            <option value="pending">Pending Review</option>
            <option value="reviewed">Marked Reviewed</option>
            <option value="resolved">Resolved Items</option>
            <option value="dismissed">Dismissed Flags</option>
            <option value="all">All Statuses</option>
          </select>
        ) : (
          <div className="hidden sm:block" />
        )}
      </FilterBar>

      {/* ── Bulk Actions ── */}
      {type !== "comment" && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-jevah-accent/30 bg-jevah-accent/10 px-4 py-3 shadow-sm">
          <span className="text-xs font-bold text-jevah-accent">
            {selected.size} reports selected
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void bulkReview("dismissed")}
          >
            Bulk Dismiss
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void bulkReview("reviewed")}
          >
            Mark Reviewed
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            onClick={() => void bulkReview("resolved")}
          >
            Bulk Resolve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            Deselect All
          </Button>
        </div>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {/* ── Report Feed List ── */}
      <div className="space-y-3.5">
        {loading ? (
          <SkeletonRows rows={4} />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No Reports Found"
            description="No flagged content or user reports matching this criteria."
            icon={FlagIcon}
          />
        ) : (
          reports.map((r, i) => {
            const id = reportId(r);
            const kind = reportKind(r);
            return (
              <article
                key={id}
                className="admin-list-item rounded-2xl border border-jevah-border/80 bg-jevah-surface p-4 shadow-sm backdrop-blur-md transition hover:border-jevah-accent/40 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-jevah-border/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    {kind === "media" && (
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
                        checked={selected.has(id)}
                        onChange={() => toggleSelect(id)}
                      />
                    )}
                    <Badge tone={kind === "comment" ? "purple" : "danger"} size="sm">
                      {kind}
                    </Badge>
                    <Badge tone={statusTone(r.status)} size="sm" dot>
                      {r.status || "pending"}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-jevah-text-muted">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-bold text-jevah-text text-base">
                    {r.reason || "Reported content violation"}
                  </p>
                  {r.description && (
                    <p className="mt-1 text-xs text-jevah-text-muted leading-relaxed">{r.description}</p>
                  )}
                  {r.reporter?.email && (
                    <p className="mt-2 text-xs font-medium text-jevah-text-muted">
                      Flagged by: <span className="font-bold text-jevah-text">{r.reporter.email}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {kind === "media" && (
                    <Button
                      size="sm"
                      onClick={() => void openMediaReport(id)}
                    >
                      Inspect Media & Actions
                    </Button>
                  )}
                  {kind === "comment" && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() => void commentAction(r.commentId || id, "hide")}
                      >
                        <EyeSlashIcon className="h-3.5 w-3.5" />
                        Hide Comment
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() => void commentAction(r.commentId || id, "unhide")}
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        Unhide
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => void commentAction(r.commentId || id, "dismiss")}
                      >
                        Dismiss Flag
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <ReportDetailDrawer
        open={Boolean(detail || detailLoading)}
        loading={detailLoading}
        detail={detail}
        adminNotes={adminNotes}
        busy={busy}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setDetail(null)}
        onReview={(s) => void review(s)}
        onDeleteContent={() => void deleteContent()}
        onBanUploader={() => void banUploaderFromReport()}
        onPlaybackError={onPlaybackError}
      />
    </PageEnter>
  );
}

