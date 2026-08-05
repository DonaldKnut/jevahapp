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
  PageEnter,
  cn,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import MediaPreview from "../../components/admin/MediaPreview";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import { getErrorMessage } from "../../lib/errors";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  NoSymbolIcon,
  TrashIcon,
  UserCircleIcon,
  XCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

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

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = "neutral",
}: {
  icon: typeof CheckCircleIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "success" | "danger" | "warning" | "brand";
}) {
  const tones = {
    neutral:
      "bg-jevah-card text-jevah-text ring-jevah-border hover:bg-jevah-surface",
    brand:
      "bg-jevah-accent/15 text-jevah-accent ring-jevah-accent/30 hover:bg-jevah-accent/25",
    success:
      "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 hover:bg-emerald-500/25 dark:text-emerald-300",
    warning:
      "bg-amber-500/15 text-amber-800 ring-amber-500/30 hover:bg-amber-500/25 dark:text-amber-300",
    danger:
      "bg-rose-500/15 text-rose-700 ring-rose-500/30 hover:bg-rose-500/25 dark:text-rose-300",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ring-1 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 shadow-sm",
        tones[tone]
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="capitalize">{label}</span>
    </button>
  );
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

      {/* ── Side Inspector Drawer ── */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end admin-fade-in">
          {/* Heavy dark focus overlay */}
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            aria-label="Close"
            onClick={() => setDetail(null)}
          />
          <div className="relative flex h-dvh w-full max-w-none flex-col border-l border-jevah-border/80 bg-jevah-surface/98 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl admin-panel-in sm:max-w-md md:max-w-lg">
            {/* Top glowing brand accent gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-jevah-accent" />

            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-jevah-border/60 bg-jevah-surface/95 px-4 py-4 backdrop-blur sm:px-6">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted hover:bg-jevah-card sm:hidden"
                onClick={() => setDetail(null)}
                aria-label="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 text-rose-500 ring-1 ring-rose-500/25 shadow-sm">
                <FlagIcon className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-black tracking-tight text-jevah-text">
                  Report Detail &amp; Review
                </h2>
                <p className="truncate text-xs font-medium text-jevah-text-muted">
                  Inspect media &amp; execute moderation decisions
                </p>
              </div>
              <button
                type="button"
                className="hidden h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted hover:bg-jevah-card hover:rotate-90 transition sm:inline-flex"
                onClick={() => setDetail(null)}
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="space-y-4 p-5">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar sm:p-5">
                  {detail.media && (
                    <div className="overflow-hidden rounded-2xl ring-1 ring-jevah-border/80 shadow-md">
                      <MediaPreview
                        media={detail.media}
                        compact
                        onPlaybackError={onPlaybackError}
                      />
                    </div>
                  )}

                  <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-extrabold text-jevah-text leading-snug">
                        {detail.media?.title || "Untitled Media"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="danger" size="sm">
                          {detail.report.reason || "flagged"}
                        </Badge>
                        <Badge tone={statusTone(detail.report.status)} size="sm" dot>
                          {detail.report.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2.5 rounded-2xl bg-jevah-card/60 p-3.5 ring-1 ring-jevah-border/40">
                      <DocumentTextIcon className="mt-0.5 h-4 w-4 shrink-0 text-jevah-text-muted" />
                      <p className="text-xs leading-relaxed text-jevah-text font-medium">
                        {detail.report.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-jevah-border/80 bg-jevah-surface/90 p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                        <UserCircleIcon className="h-4 w-4 text-sky-500" />
                        Reporter
                      </div>
                      <p className="mt-1.5 truncate text-xs font-extrabold text-jevah-text">
                        {detail.report.reporter?.email || "Anonymous"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-jevah-border/80 bg-jevah-surface/90 p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                        <UserCircleIcon className="h-4 w-4 text-jevah-accent" />
                        Uploader
                      </div>
                      <p className="mt-1.5 truncate text-xs font-extrabold text-jevah-text">
                        {detail.uploader?.email || "—"}
                      </p>
                    </div>
                  </div>

                  {detail.siblingReports?.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                          Sibling Reports ({detail.siblingReports.length})
                        </p>
                      </div>
                      <ul className="mt-2.5 space-y-1.5">
                        {detail.siblingReports.map((s) => (
                          <li
                            key={reportId(s)}
                            className="flex flex-wrap items-center gap-2 text-xs"
                          >
                            <Badge tone="danger" size="sm">{s.reason || "report"}</Badge>
                            <Badge tone={statusTone(s.status)} size="sm">{s.status || "pending"}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Field label="Admin Resolution Notes">
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder="Enter reviewer decision notes..."
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="sticky bottom-0 space-y-3 border-t border-jevah-border/80 bg-jevah-surface/95 px-4 py-4 backdrop-blur sm:px-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                    Execution Actions
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      detail.actions?.review || [
                        "reviewed",
                        "resolved",
                        "dismissed",
                      ]
                    ).map((s) => {
                      const icon =
                        s === "resolved"
                          ? CheckCircleIcon
                          : s === "dismissed"
                            ? XCircleIcon
                            : FlagIcon;
                      const tone =
                        s === "resolved"
                          ? "success"
                          : s === "dismissed"
                            ? "neutral"
                            : "brand";
                      return (
                        <ActionBtn
                          key={s}
                          icon={icon}
                          label={s}
                          disabled={busy}
                          tone={tone}
                          onClick={() =>
                            void review(
                              s as "reviewed" | "resolved" | "dismissed"
                            )
                          }
                        />
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {detail.actions?.deleteContent !== false && (
                      <ActionBtn
                        icon={TrashIcon}
                        label="Delete Content"
                        disabled={busy}
                        tone="danger"
                        onClick={() => void deleteContent()}
                      />
                    )}
                    {detail.actions?.banUploader !== false &&
                      detail.uploader?.id && (
                        <ActionBtn
                          icon={NoSymbolIcon}
                          label="Ban Uploader"
                          disabled={busy}
                          tone="warning"
                          onClick={() => void banUploaderFromReport()}
                        />
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageEnter>
  );
}

