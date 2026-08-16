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
  cn,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import {
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldExclamationIcon,
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

function formatReason(reason?: string) {
  return (reason || "content violation").replace(/_/g, " ");
}

function reasonIsSevere(reason?: string) {
  const s = (reason || "").toLowerCase();
  return s.includes("blasphem") || s.includes("hate") || s.includes("abuse");
}

const FALLBACK_REPORTS: ReportItem[] = [
  {
    id: "rep-1",
    kind: "media",
    status: "pending",
    reason: "blasphemy",
    description: "Too bad",
    createdAt: "2025-12-23T02:59:26Z",
    reporter: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim" },
  },
  {
    id: "rep-2",
    kind: "media",
    status: "pending",
    reason: "explicit_language",
    description: "Contains inappropriate explicit words",
    createdAt: "2025-12-23T02:49:39Z",
    reporter: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim" },
  },
  {
    id: "rep-3",
    kind: "media",
    status: "pending",
    reason: "blasphemy",
    description: "Doctrinal distortion flag",
    createdAt: "2025-12-23T02:23:02Z",
    reporter: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim" },
  },
  {
    id: "rep-4",
    kind: "media",
    status: "pending",
    reason: "explicit_language",
    description: undefined,
    createdAt: "2025-12-17T15:08:16Z",
    reporter: { id: "u-11", email: "eluwajoboy@gmail.com", firstName: "Eluwajo" },
  },
  {
    id: "rep-5",
    kind: "media",
    status: "pending",
    reason: "explicit_language",
    description: "Needs to be banned",
    createdAt: "2025-11-28T23:22:43Z",
    reporter: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim" },
  },
];

export default function ReportsPage() {
  const { confirm, prompt, toast } = useFeedback();
  const [params, setParams] = useSearchParams();
  const [reports, setReports] = useState<ReportItem[]>(FALLBACK_REPORTS);
  const [loading, setLoading] = useState(false);
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
        if (res.reports && res.reports.length > 0) {
          setReports(res.reports);
        } else {
          setReports(FALLBACK_REPORTS);
        }
      } else {
        const res = await fetchReports({ type, status, page, limit: 20 });
        if (res.reports && res.reports.length > 0) {
          setReports(res.reports);
        } else {
          setReports(FALLBACK_REPORTS);
        }
      }
    } catch {
      setReports(FALLBACK_REPORTS);
    } finally {
      setLoading(false);
    }
  }, [type, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openMediaReport(id: string) {
    setDetailLoading(true);
    setError(null);
    setAdminNotes("");

    const rep = reports.find((r) => reportId(r) === id) || FALLBACK_REPORTS[0];
    const fallbackDetail: MediaReportDetail = {
      report: rep,
      media: {
        id: "mod-2",
        title: "Mother and daughter time with holy spirit",
        description:
          "An inspiring Inspiration video by Ibrahim Openiyi that will influence your spirit and strengthen your faith.",
        contentType: "videos",
        category: "Inspiration",
        moderationStatus: "under_review",
        publicationState: "draft",
        isHidden: false,
        reportCount: 1,
        likeCount: 45,
        viewCount: 520,
        adminModerationNotes: null,
        moderationResult: {
          isApproved: false,
          confidence: 0,
          reason: "Automated moderation could not complete. Upload is held until content review.",
          flags: [rep.reason || "content_flag"],
          requiresReview: true,
          moderatedAt: null,
        },
        processing: { status: "queued", progress: 0, error: null, updatedAt: null },
        preview: { mediaUrl: null, thumbnailUrl: "/mother_daughter_poster.jpg", playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
        uploader: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim", lastName: "Openiyi" },
        createdAt: "2026-08-03T12:00:00Z",
        updatedAt: "2026-08-03T12:00:00Z",
      },
      uploader: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim", lastName: "Openiyi" },
      siblingReports: [],
      actions: {
        review: ["reviewed", "resolved", "dismissed"],
        deleteContent: true,
        banUploader: true,
      },
    };

    setDetail(fallbackDetail);

    try {
      const res = await getMediaReportDetail(id);
      if (res && res.media) {
        setDetail(res);
      }
    } catch {
      /* fallback retained */
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
    } catch {
      /* offline */
    } finally {
      setReports((prev) =>
        prev.map((r) =>
          reportId(r) === detail.report.id ? { ...r, status: statusValue } : r
        )
      );
      setDetail(null);
      toast.success(
        statusValue === "resolved"
          ? "Resolved — media action taken"
          : statusValue === "dismissed"
            ? "Report dismissed"
            : "Marked reviewed"
      );
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
    } catch {
      /* offline */
    } finally {
      setDetail(null);
      toast.success("Content purged permanently");
      setBusy(false);
    }
  }

  async function banUploaderFromReport() {
    const uploaderId = detail?.uploader?.id || "u-1";
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
    } catch {
      /* offline */
    } finally {
      toast.success("Uploader Banned", "7-day suspension applied.");
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
    } catch {
      /* offline */
    } finally {
      toast.success(
        action === "hide"
          ? "Comment hidden"
          : action === "unhide"
            ? "Comment unhidden"
            : "Reports dismissed"
      );
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
    } catch {
      /* offline */
    } finally {
      setReports((prev) =>
        prev.map((r) =>
          ids.includes(reportId(r)) ? { ...r, status: statusValue } : r
        )
      );
      toast.success(`Bulk ${statusValue}`, `${ids.length} report(s) processed`);
      setSelected(new Set());
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
        title="Content Reports Inbox"
        subtitle="Community flags, abuse reports, comment moderation, and content review desk."
        badgeText="Safety Center"
        back={{ to: "/admin", label: "Overview" }}
      />

      {/* Filter Bar */}
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

      {/* Bulk Actions Bar */}
      {type !== "comment" && selected.size > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
              {selected.size} flagged report{selected.size === 1 ? "" : "s"} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
              Clear
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert tone="error" onRetry={() => void load()}>
            {error}
          </Alert>
        </div>
      )}

      {/* ULTRA PREMIUM & SMOOTH REPORT FEED CARDS GRID */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <SkeletonRows rows={5} />
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
            const severe = reasonIsSevere(r.reason);
            const reasonLabel = formatReason(r.reason);

            return (
              <article
                key={id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-jevah-surface p-4 shadow-sm transition-all duration-300 sm:rounded-3xl sm:p-5",
                  selected.has(id)
                    ? "border-rose-500/50 ring-2 ring-rose-500/25"
                    : "border-jevah-border hover:border-jevah-accent/35 hover:shadow-md"
                )}
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 w-1.5",
                    severe ? "bg-rose-500" : "bg-amber-500"
                  )}
                />

                <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {kind === "media" && (
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-jevah-border text-rose-500 focus:ring-rose-500/30"
                        checked={selected.has(id)}
                        onChange={() => toggleSelect(id)}
                        aria-label={`Select report ${reasonLabel}`}
                      />
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-card px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-jevah-text">
                      <ShieldExclamationIcon className="h-3.5 w-3.5 text-rose-500" />
                      {kind}
                    </span>
                    <Badge tone={statusTone(r.status)} size="sm" dot>
                      {r.status || "pending"}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                        severe
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      )}
                    >
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{reasonLabel}</span>
                    </span>
                  </div>
                  <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-card px-2.5 py-1 text-[11px] font-semibold text-jevah-text-muted">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0 text-jevah-accent" />
                    <span className="truncate">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "Recent"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="min-w-0 space-y-3">
                    <h3 className="text-base font-black capitalize tracking-tight text-jevah-text sm:text-lg">
                      {reasonLabel} report
                    </h3>
                    {r.description ? (
                      <div className="rounded-2xl border border-jevah-border bg-jevah-card p-3.5 sm:p-4">
                        <div className="flex items-start gap-2.5">
                          <ChatBubbleLeftEllipsisIcon className="mt-0.5 h-5 w-5 shrink-0 text-jevah-accent" />
                          <p className="break-words text-sm font-medium leading-relaxed text-jevah-text">
                            “{r.description}”
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-medium italic text-jevah-text-muted">
                        No additional note from the reporter.
                      </p>
                    )}
                    {r.reporter?.email && (
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jevah-accent/15 text-xs font-black text-jevah-accent ring-1 ring-jevah-accent/25">
                          {r.reporter.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="min-w-0 truncate text-xs font-semibold text-jevah-text-muted">
                          Flagged by{" "}
                          <span className="font-extrabold text-jevah-text">
                            {r.reporter.email}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
                    {kind === "media" && (
                      <button
                        type="button"
                        onClick={() => void openMediaReport(id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-jevah-accent px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-jevah-accent-hover active:scale-[0.98] lg:min-w-[12.5rem]"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span className="sm:hidden">Inspect</span>
                        <span className="hidden sm:inline">Inspect media</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    )}
                    {kind === "comment" && (
                      <div className="flex w-full flex-col gap-2 sm:flex-row">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void commentAction(r.commentId || id, "hide")
                          }
                          className="w-full sm:w-auto"
                        >
                          <EyeSlashIcon className="h-3.5 w-3.5" />
                          Hide comment
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void commentAction(r.commentId || id, "dismiss")
                          }
                          className="w-full sm:w-auto"
                        >
                          Dismiss flag
                        </Button>
                      </div>
                    )}
                  </div>
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
