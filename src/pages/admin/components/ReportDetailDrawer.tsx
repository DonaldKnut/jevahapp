import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
} from "@heroicons/react/24/outline";
import type { MediaReportDetail, ReportItem } from "../../../types/admin";
import {
  Badge,
  Field,
  Skeleton,
  cn,
  inputClass,
} from "../../../components/admin/ui";
import MediaPreview from "../../../components/admin/MediaPreview";

function reportId(r: ReportItem) {
  return r.id || r._id || "";
}

function statusTone(
  status?: string
): "warning" | "success" | "neutral" | "danger" | "info" {
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

type Props = {
  open: boolean;
  loading: boolean;
  detail: MediaReportDetail | null;
  adminNotes: string;
  busy: boolean;
  onAdminNotesChange: (v: string) => void;
  onClose: () => void;
  onReview: (status: "reviewed" | "resolved" | "dismissed") => void;
  onDeleteContent: () => void;
  onBanUploader: () => void;
  onPlaybackError: () => void;
};

/**
 * Portaled report inspector — sits above AdminShell stacking contexts
 * so the overlay actually dims the page in light and dark theme.
 */
export default function ReportDetailDrawer({
  open,
  loading,
  detail,
  adminNotes,
  busy,
  onAdminNotesChange,
  onClose,
  onReview,
  onDeleteContent,
  onBanUploader,
  onPlaybackError,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  const panel: ReactNode = (
    <div
      className="fixed inset-0 z-[115] flex items-stretch justify-end"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--jevah-overlay)] backdrop-blur-md transition-opacity duration-300"
        aria-label="Close report detail"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Report detail and review"
        className="relative flex h-dvh w-full max-w-none flex-col border-l border-jevah-border bg-jevah-surface shadow-[0_0_60px_var(--jevah-shadow)] sm:max-w-md md:max-w-lg admin-panel-in"
      >
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-rose-500 via-amber-500 to-jevah-accent" />

        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-jevah-border bg-jevah-surface/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted transition hover:bg-jevah-card sm:hidden"
            onClick={onClose}
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 text-rose-500 ring-1 ring-rose-500/25 shadow-sm dark:text-rose-300">
            <FlagIcon className="h-5 w-5" />
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
            className="hidden h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted transition hover:rotate-90 hover:bg-jevah-card sm:inline-flex"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {loading || !detail ? (
          <div className="space-y-4 p-5">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {detail.media && (
                <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-jevah-border">
                  <MediaPreview
                    media={detail.media}
                    compact
                    onPlaybackError={onPlaybackError}
                  />
                </div>
              )}

              <div className="rounded-3xl border border-jevah-border bg-jevah-elevated/80 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-base font-extrabold leading-snug text-jevah-text">
                    {detail.media?.title || "Untitled Media"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="danger" size="sm">
                      {detail.report.reason || "flagged"}
                    </Badge>
                    <Badge
                      tone={statusTone(detail.report.status)}
                      size="sm"
                      dot
                    >
                      {detail.report.status || "pending"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex gap-2.5 rounded-2xl bg-jevah-card p-3.5 ring-1 ring-jevah-border/60">
                  <DocumentTextIcon className="mt-0.5 h-4 w-4 shrink-0 text-jevah-text-muted" />
                  <p className="text-xs font-medium leading-relaxed text-jevah-text">
                    {detail.report.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-jevah-border bg-jevah-elevated/80 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                    <UserCircleIcon className="h-4 w-4 text-sky-500" />
                    Reporter
                  </div>
                  <p className="mt-1.5 truncate text-xs font-extrabold text-jevah-text">
                    {detail.report.reporter?.email || "Anonymous"}
                  </p>
                </div>
                <div className="rounded-2xl border border-jevah-border bg-jevah-elevated/80 p-4 shadow-sm">
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
                <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 dark:border-amber-400/25 dark:bg-amber-400/10">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-100">
                      Sibling Reports ({detail.siblingReports.length})
                    </p>
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {detail.siblingReports.map((s: ReportItem) => (
                      <li
                        key={reportId(s)}
                        className="flex flex-wrap items-center gap-2 text-xs"
                      >
                        <Badge tone="danger" size="sm">
                          {s.reason || "report"}
                        </Badge>
                        <Badge tone={statusTone(s.status)} size="sm">
                          {s.status || "pending"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Field label="Admin Resolution Notes">
                <textarea
                  value={adminNotes}
                  onChange={(e) => onAdminNotesChange(e.target.value)}
                  rows={3}
                  placeholder="Enter reviewer decision notes..."
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="sticky bottom-0 space-y-3 border-t border-jevah-border bg-jevah-surface/95 px-4 py-4 backdrop-blur-xl sm:px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                ).map((s: string) => {
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
                        onReview(s as "reviewed" | "resolved" | "dismissed")
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
                    onClick={onDeleteContent}
                  />
                )}
                {detail.actions?.banUploader !== false &&
                  detail.uploader?.id && (
                    <ActionBtn
                      icon={NoSymbolIcon}
                      label="Ban Uploader"
                      disabled={busy}
                      tone="warning"
                      onClick={onBanUploader}
                    />
                  )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );

  return createPortal(panel, document.body);
}
