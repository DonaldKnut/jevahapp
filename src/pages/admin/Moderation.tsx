import { useCallback, useEffect, useMemo, useState } from "react";
import {
  banUser,
  bulkModerationStatus,
  addModerationNote,
  assignModeration,
  deleteMedia,
  fetchModerationNotes,
  fetchModerationQueue,
  getModerationCase,
  getModerationMedia,
  patchModerationStatus,
  rerunModeration,
  updateMediaMetadata,
} from "../../services/adminApi";
import type { AdminMediaCard, ModerationCaseSummary } from "../../types/admin";
import { getErrorMessage } from "../../lib/errors";
import { matchesSearch } from "../../lib/searchMatch";
import {
  formatAge,
  signedExpiryLabel,
  uploaderLabel,
} from "../../lib/media";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Skeleton,
  PageEnter,
  cn,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import MediaPreview from "../../components/admin/MediaPreview";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import AdminModal from "../../components/admin/AdminModal";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  NoSymbolIcon,
  TrashIcon,
  PencilSquareIcon,
  UserPlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FilmIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  UserIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

function statusTone(
  status?: string
): "brand" | "success" | "warning" | "danger" | "neutral" {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review") return "warning";
  return "neutral";
}

export default function ModerationPage() {
  const { confirm, prompt, toast } = useFeedback();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [items, setItems] = useState<AdminMediaCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileReviewOpen, setMobileReviewOpen] = useState(false);
  const [detail, setDetail] = useState<AdminMediaCard | null>(null);
  const [modCase, setModCase] = useState<ModerationCaseSummary | null>(null);
  const [cases, setCases] = useState<ModerationCaseSummary[]>([]);
  const [showCases, setShowCases] = useState(false);
  const [notes, setNotes] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [threadNotes, setThreadNotes] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [noteDraft, setNoteDraft] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((m) =>
      matchesSearch(searchQuery, [
        m.title,
        uploaderLabel(m),
        m.contentType,
        m.category,
        m.id,
      ])
    );
  }, [items, searchQuery]);

  const selectedIndex = useMemo(
    () => filteredItems.findIndex((m) => m.id === selectedId),
    [filteredItems, selectedId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchModerationQueue({
        status: statusFilter || undefined,
        page: 1,
        limit: 40,
      });
      setItems(res.items);
      setSelectedId((prev) => {
        if (prev && res.items.some((m) => m.id === prev)) return prev;
        return res.items[0]?.id || null;
      });
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to load moderation queue.")
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setModCase(null);
      return;
    }
    let alive = true;
    async function loadDetail() {
      setDetailLoading(true);
      setShowCases(false);
      try {
        const res = await getModerationMedia(selectedId!);
        if (!alive) return;
        setDetail(res.media);
        setModCase(res.moderationCase);
        setNotes(res.media.adminModerationNotes || "");
        setEditTitle(res.media.title || "");
        setEditDescription(res.media.description || "");
        setEditCategory(res.media.category || "");
        setEditNotes(res.media.adminModerationNotes || "");
        try {
          const notesList = await fetchModerationNotes(selectedId!);
          if (alive) setThreadNotes(notesList);
        } catch {
          if (alive) setThreadNotes([]);
        }
      } catch (err) {
        if (alive) {
          setError(
            getErrorMessage(err, "Failed to load detail.")
          );
        }
      } finally {
        if (alive) setDetailLoading(false);
      }
    }
    void loadDetail();
    return () => {
      alive = false;
    };
  }, [selectedId]);

  function selectItem(id: string, openMobile = false) {
    setSelectedId(id);
    if (openMobile) setMobileReviewOpen(true);
  }

  function goAdjacent(delta: number) {
    if (selectedIndex < 0) return;
    const next = filteredItems[selectedIndex + delta];
    if (next) setSelectedId(next.id);
  }

  async function loadCases() {
    if (!selectedId) return;
    try {
      const res = await getModerationCase(selectedId);
      setCases(res.cases || []);
      setShowCases(true);
    } catch (err) {
      toast.error(
        "Failed to load AI cases",
        getErrorMessage(err, "Something went wrong")
      );
    }
  }

  async function setStatus(status: "approved" | "rejected" | "under_review") {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await patchModerationStatus(selectedId, {
        status,
        adminNotes: notes || undefined,
      });
      if (status === "approved" || status === "rejected") {
        const remaining = items.filter((m) => m.id !== selectedId);
        setItems(remaining);
        const nextId = remaining[selectedIndex]?.id || remaining[0]?.id || null;
        setSelectedId(nextId);
        if (!nextId) setMobileReviewOpen(false);
        toast.success(
          status === "approved" ? "Approved" : "Rejected",
          status === "approved"
            ? "Content can proceed on the publish path."
            : "Uploader will be notified."
        );
      } else {
        await load();
        const refreshed = await getModerationMedia(selectedId);
        setDetail(refreshed.media);
        setModCase(refreshed.moderationCase);
        toast.info("Held for review");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Update failed."));
      toast.error("Action failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  function toggleQueueSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(status: "approved" | "rejected" | "under_review") {
    const mediaIds = Array.from(selectedIds).slice(0, 50);
    if (!mediaIds.length) return;
    setBusy(true);
    try {
      await bulkModerationStatus({
        mediaIds,
        status,
        adminNotes: notes || undefined,
      });
      toast.success(`Bulk ${status}`, `${mediaIds.length} item(s)`);
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      toast.error("Bulk failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function submitNote() {
    if (!selectedId || !noteDraft.trim()) return;
    setBusy(true);
    try {
      await addModerationNote(selectedId, noteDraft.trim());
      setNoteDraft("");
      setThreadNotes(await fetchModerationNotes(selectedId));
      toast.success("Note added");
    } catch (err) {
      toast.error("Note failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function assignToMe() {
    if (!selectedId) return;
    setBusy(true);
    try {
      const assigneeId = await prompt({
        title: "Assign moderation",
        message: "Paste assignee user id (leave empty to unassign).",
        label: "Assignee ID",
        defaultValue: "",
        required: false,
        confirmLabel: "Assign",
      });
      if (assigneeId === null) return;
      await assignModeration(selectedId, assigneeId.trim() || null);
      toast.success(assigneeId.trim() ? "Assigned" : "Unassigned");
    } catch (err) {
      toast.error("Assign failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function rerunAi() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await rerunModeration(selectedId);
      toast.success("AI moderation re-queued");
    } catch (err) {
      toast.error("Rerun failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete() {
    if (!selectedId) return;
    const ok = await confirm({
      title: "Delete media permanently?",
      message:
        "This removes the files and cannot be undone. Pending reports on this item will be resolved.",
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteMedia(selectedId);
      const remaining = items.filter((m) => m.id !== selectedId);
      setItems(remaining);
      const nextId = remaining[0]?.id || null;
      setSelectedId(nextId);
      if (!nextId) setMobileReviewOpen(false);
      toast.success("Media deleted");
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed."));
      toast.error("Delete failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function saveMetadata() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await updateMediaMetadata(selectedId, {
        title: editTitle || undefined,
        description: editDescription || undefined,
        category: editCategory || undefined,
        adminModerationNotes: editNotes || undefined,
      });
      setEditOpen(false);
      const refreshed = await getModerationMedia(selectedId);
      setDetail(refreshed.media);
      setItems((prev) =>
        prev.map((m) => (m.id === selectedId ? refreshed.media : m))
      );
      toast.success("Metadata updated");
    } catch (err) {
      setError(getErrorMessage(err, "Metadata update failed."));
      toast.error("Update failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  async function banUploader() {
    const uploaderId = detail?.uploader?.id;
    if (!uploaderId) return;
    const reason = await prompt({
      title: "Ban uploader",
      message: `Ban ${detail?.uploader?.email || "this user"} for 7 days.`,
      label: "Reason",
      defaultValue: "Policy violation",
      confirmLabel: "Ban for 7 days",
      tone: "danger",
    });
    if (reason == null) return;
    setBusy(true);
    try {
      await banUser(uploaderId, {
        reason: reason || "Policy violation",
        duration: 7,
      });
      toast.success("Uploader banned", "7-day ban applied.");
    } catch (err) {
      setError(getErrorMessage(err, "Ban failed."));
      toast.error("Ban failed", getErrorMessage(err, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  const decision = modCase?.decision || detail?.moderationResult;

  const { onPlaybackError } = useSignedPreviewRefresh(detail, (next) => {
    setDetail(next);
    setItems((prev) => prev.map((m) => (m.id === next.id ? next : m)));
  });

  function ReviewBody({ forMobile = false }: { forMobile?: boolean }) {
    if (!selectedId) {
      return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20 shadow-md mb-4">
            <ShieldCheckIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-extrabold text-jevah-text">No Item Selected</h3>
          <p className="mt-1 max-w-xs text-xs font-medium text-jevah-text-muted">
            Select a submission from the queue on the left to inspect media, review AI confidence, and execute moderation decisions.
          </p>
        </div>
      );
    }
    if (detailLoading || !detail) {
      return (
        <div className="space-y-5 p-6">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <Skeleton className="h-7 w-2/3 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      );
    }

    const confidenceScore =
      decision?.confidence != null ? Math.round(decision.confidence * 100) : 0;

    return (
      <div className="flex h-full flex-col bg-jevah-surface/60">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar sm:p-6">
          {/* Media Player Container */}
          <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-black/90 ring-1 ring-jevah-border/80 shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-xl">
            <MediaPreview
              media={detail}
              compact={forMobile}
              onPlaybackError={onPlaybackError}
            />
          </div>

          {/* Submission Overview Card */}
          <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-5 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-jevah-border/50 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(detail.moderationStatus)} dot size="sm">
                  {detail.moderationStatus}
                </Badge>
                {detail.publicationState && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-jevah-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-jevah-accent ring-1 ring-jevah-accent/20">
                    {detail.publicationState}
                  </span>
                )}
                {signedExpiryLabel(detail.preview) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
                    <ClockIcon className="h-3 w-3" />
                    {signedExpiryLabel(detail.preview)}
                  </span>
                )}
              </div>
              {detail.createdAt && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-jevah-text-muted">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {formatAge(detail.createdAt)}
                </span>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-black leading-tight text-jevah-text sm:text-2xl">
                {detail.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-jevah-text-muted">
                <span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-jevah-accent">
                  {detail.contentType === "videos" ? (
                    <FilmIcon className="h-3.5 w-3.5" />
                  ) : detail.contentType === "ebook" ? (
                    <BookOpenIcon className="h-3.5 w-3.5" />
                  ) : (
                    <MusicalNoteIcon className="h-3.5 w-3.5" />
                  )}
                  {detail.contentType}
                </span>
                {detail.category && (
                  <>
                    <span>·</span>
                    <span className="rounded-full bg-jevah-card px-2.5 py-0.5 font-bold text-jevah-text">
                      {detail.category}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-semibold">
                  <UserIcon className="h-3.5 w-3.5 text-sky-500" />
                  {uploaderLabel(detail)}
                </span>
              </div>

              {detail.description && (
                <div className="mt-3.5 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-4 text-xs font-medium leading-relaxed text-jevah-text">
                  {detail.description}
                </div>
              )}
            </div>
          </div>

          {/* AI Automated Confidence & Telemetry Meter */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-jevah-surface to-jevah-surface p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30">
                  <CpuChipIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-jevah-text">
                    Automated AI Evidence &amp; Confidence
                  </h3>
                  <p className="text-[11px] font-semibold text-jevah-text-muted">
                    Safety confidence telemetry score
                  </p>
                </div>
              </div>
              <span className={`text-sm font-black ${confidenceScore > 70 ? "text-emerald-500" : confidenceScore > 40 ? "text-amber-500" : "text-rose-500"}`}>
                {confidenceScore}% confidence
              </span>
            </div>

            {/* Confidence Progress Bar */}
            <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-jevah-card">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  confidenceScore > 70
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : confidenceScore > 40
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-rose-500 to-pink-500"
                }`}
                style={{ width: `${Math.max(confidenceScore, 5)}%` }}
              />
            </div>

            <p className="mt-3 text-xs font-medium leading-relaxed text-jevah-text-muted">
              {decision?.reason || "Automated moderation completed. Review AI evidence flags before taking action."}
            </p>

            {!!decision?.flags?.length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {decision.flags.map((flag) => (
                  <span
                    key={flag}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400"
                  >
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Transcoding / Processing Status */}
          {detail.processing?.status && (
            <div className="flex items-center justify-between rounded-2xl border border-jevah-border/60 bg-jevah-card/40 px-4 py-3 text-xs font-bold text-jevah-text">
              <span className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-jevah-accent animate-pulse" />
                Transcoding Status: {detail.processing.status}
              </span>
              <span className="font-mono text-jevah-accent">
                {detail.processing.progress != null ? `${detail.processing.progress}%` : "100%"}
              </span>
            </div>
          )}

          {/* Reviewer Decision Notes */}
          <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-5 shadow-sm backdrop-blur-xl space-y-4">
            <Field label="Reviewer Decision Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Write reviewer notes or rationale for this moderation decision..."
              />
            </Field>

            {/* Moderation Audit Log Thread */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-jevah-text-muted">
                  Moderation Audit Log Thread ({threadNotes.length})
                </p>
              </div>
              <ul className="max-h-36 space-y-2 overflow-y-auto text-xs custom-scrollbar">
                {threadNotes.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-jevah-border/60 bg-jevah-card/30 p-3 text-center text-xs font-semibold text-jevah-text-muted">
                    No admin notes added yet.
                  </li>
                ) : (
                  threadNotes.map((n, i) => (
                    <li
                      key={String(n.id || i)}
                      className="rounded-2xl border border-jevah-border/60 bg-jevah-card/50 p-3 text-xs font-medium text-jevah-text"
                    >
                      {String(n.body || n.text || n.message || "—")}
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className={inputClass}
                  placeholder="Append note to audit log..."
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy || !noteDraft.trim()}
                  onClick={() => void submitNote()}
                >
                  <PaperAirplaneIcon className="h-3.5 w-3.5" />
                  Post
                </Button>
              </div>
            </div>
          </div>

          {/* Action Toolbox Buttons */}
          <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-jevah-text-muted">
              Action Toolbox
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setEditOpen(true)}
              >
                <PencilSquareIcon className="h-3.5 w-3.5 text-jevah-accent" />
                Edit Metadata
              </Button>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => void loadCases()}>
                <CpuChipIcon className="h-3.5 w-3.5 text-amber-500" />
                AI Evidence
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void assignToMe()}
              >
                <UserPlusIcon className="h-3.5 w-3.5 text-sky-500" />
                Assign
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void rerunAi()}
              >
                <ArrowPathIcon className="h-3.5 w-3.5 text-emerald-500" />
                Re-run AI
              </Button>
              <Button
                variant="warning"
                size="sm"
                disabled={busy || !detail.uploader?.id}
                onClick={() => void banUploader()}
              >
                <NoSymbolIcon className="h-3.5 w-3.5 text-rose-500" />
                Ban Uploader
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={() => void hardDelete()}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete Media
              </Button>
            </div>

            {showCases && (
              <div className="mt-4 rounded-2xl border border-jevah-border bg-jevah-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-jevah-text">AI Telemetry Case History</p>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-jevah-text-muted hover:bg-jevah-surface"
                    onClick={() => setShowCases(false)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                {cases.length === 0 ? (
                  <p className="text-xs text-jevah-text-muted">No prior cases recorded.</p>
                ) : (
                  <ul className="max-h-48 space-y-2 overflow-y-auto text-xs custom-scrollbar">
                    {cases.map((c) => (
                      <li key={c.id} className="rounded-xl bg-jevah-surface p-3 shadow-sm border border-jevah-border/60">
                        <p className="font-bold text-jevah-text">
                          {c.provider || "AI Provider"} · {c.modelId || "—"}
                        </p>
                        <p className="mt-1 font-medium">{c.decision?.reason || "—"}</p>
                        <p className="mt-1 text-[10px] text-jevah-text-muted">
                          {(c.decision?.flags || []).join(", ")} · {c.createdAt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Decision Control Bar */}
        <div className="sticky bottom-0 z-20 border-t border-jevah-border/80 bg-jevah-surface/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={selectedIndex <= 0}
              onClick={() => goAdjacent(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-jevah-border/80 bg-jevah-surface text-jevah-text-muted shadow-sm hover:bg-jevah-card disabled:opacity-30 transition"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <p className="text-xs font-black uppercase tracking-wider text-jevah-text-muted">
              {selectedIndex >= 0 ? selectedIndex + 1 : 0} of {filteredItems.length} Queue Items
            </p>
            <button
              type="button"
              disabled={selectedIndex < 0 || selectedIndex >= filteredItems.length - 1}
              onClick={() => goAdjacent(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-jevah-border/80 bg-jevah-surface text-jevah-text-muted shadow-sm hover:bg-jevah-card disabled:opacity-30 transition"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void setStatus("approved")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 px-4 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:from-emerald-500 hover:to-teal-400 active:scale-95 disabled:opacity-50 transition"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void setStatus("under_review")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/15 py-3 px-4 text-xs font-extrabold text-amber-700 dark:text-amber-300 shadow-sm hover:bg-amber-500/25 active:scale-95 disabled:opacity-50 transition"
            >
              <ClockIcon className="h-4 w-4" />
              Hold
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void setStatus("rejected")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 py-3 px-4 text-xs font-extrabold text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:from-rose-500 hover:to-red-400 active:scale-95 disabled:opacity-50 transition"
            >
              <XMarkIcon className="h-4 w-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageEnter>
      <PageHeader
        title="Content Moderation"
        subtitle="Review community uploads, inspect automated AI confidence scores, and make decisions."
        badgeText="Moderation Engine"
      />

      {/* Modern Filter Pills Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { value: "", label: "Needs Review" },
            { value: "under_review", label: "Under Review" },
            { value: "pending", label: "Pending" },
            { value: "rejected", label: "Rejected" },
            { value: "approved", label: "Approved" },
          ].map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => {
                setStatusFilter(f.value);
                setMobileReviewOpen(false);
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition duration-200 shadow-sm",
                statusFilter === f.value
                  ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-jevah-accent/25"
                  : "bg-jevah-surface text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Queue Field */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, uploader, type…"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} pl-9 pr-8 text-xs`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-jevah-text-muted hover:text-jevah-text"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-jevah-accent/30 bg-jevah-accent/10 px-4 py-3 shadow-sm">
          <span className="text-xs font-bold text-jevah-accent">
            {selectedIds.size} items selected
          </span>
          <Button
            variant="success"
            size="sm"
            disabled={busy}
            onClick={() => void runBulk("approved")}
          >
            Bulk Approve
          </Button>
          <Button
            variant="warning"
            size="sm"
            disabled={busy}
            onClick={() => void runBulk("rejected")}
          >
            Bulk Reject
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {/* Desktop split view */}
      <div className="hidden overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-xl lg:grid lg:h-[calc(100vh-14rem)] lg:grid-cols-[minmax(320px,400px)_1fr]">
        {/* Left Queue List */}
        <div className="overflow-y-auto border-r border-jevah-border/60 custom-scrollbar">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState title="Moderation Queue Clear" icon={ShieldCheckIcon} />
            </div>
          ) : (
            <ul className="divide-y divide-jevah-border/40">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <div
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-3.5 transition duration-200 hover:bg-jevah-card/70",
                      selectedId === item.id && "bg-jevah-accent/12 border-l-4 border-l-jevah-accent"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-jevah-border text-jevah-accent"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleQueueSelect(item.id)}
                    />
                    <button
                      type="button"
                      onClick={() => selectItem(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-jevah-card ring-1 ring-jevah-border/60 shadow-sm">
                        {item.preview?.thumbnailUrl ? (
                          <img
                            src={item.preview.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-jevah-accent bg-jevah-accent/10">
                            {item.contentType === "videos" ? (
                              <FilmIcon className="h-5 w-5" />
                            ) : item.contentType === "ebook" ? (
                              <BookOpenIcon className="h-5 w-5" />
                            ) : (
                              <MusicalNoteIcon className="h-5 w-5" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-jevah-text">{item.title}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-jevah-text-muted uppercase tracking-wider">
                            {item.contentType}
                          </span>
                          <span className="text-jevah-text-muted">·</span>
                          <Badge tone={statusTone(item.moderationStatus)} size="sm">{item.moderationStatus}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-jevah-text-muted font-medium">
                          {uploaderLabel(item)}
                          {item.createdAt ? ` · ${formatAge(item.createdAt)}` : ""}
                        </p>
                      </div>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="min-h-0 overflow-hidden">
          <ReviewBody />
        </div>
      </div>

      {/* Mobile Queue List */}
      <div className="lg:hidden">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState title="Queue is empty" icon={ShieldCheckIcon} />
        ) : (
          <ul className="space-y-2.5">
            {filteredItems.map((item, i) => (
              <li
                key={item.id}
                className="admin-list-item"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <button
                  type="button"
                  onClick={() => selectItem(item.id, true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-jevah-border/80 bg-jevah-surface p-3.5 text-left shadow-sm transition active:scale-[0.99]"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-jevah-card ring-1 ring-jevah-border">
                    {item.preview?.thumbnailUrl ? (
                      <img
                        src={item.preview.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold text-jevah-text leading-snug">
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-jevah-text-muted capitalize">{item.contentType}</span>
                      <Badge tone={statusTone(item.moderationStatus)} size="sm">{item.moderationStatus}</Badge>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobile Fullscreen Review Drawer */}
      {mobileReviewOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-jevah-surface admin-fade-in lg:hidden">
          <div className="flex items-center gap-2 border-b border-jevah-border/80 px-3 py-3 admin-sheet-in">
            <button
              type="button"
              onClick={() => setMobileReviewOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-jevah-card"
              aria-label="Back to queue"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-jevah-text">
                {detail?.title || "Review Submission"}
              </p>
              <p className="text-[10px] font-semibold text-jevah-text-muted">
                Item {selectedIndex >= 0 ? selectedIndex + 1 : 0} of {filteredItems.length}
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ReviewBody forMobile />
          </div>
        </div>
      )}

      {/* Metadata Edit Modal */}
      <AdminModal
        open={editOpen && Boolean(detail)}
        onClose={() => setEditOpen(false)}
        title="Edit Media Metadata"
        subtitle="Modify media title, category, description and moderation notes."
        busy={busy}
        icon={<PencilSquareIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={busy}
              onClick={() => void saveMetadata()}
            >
              Save Metadata
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Media Title">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Category / Genre">
            <input
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="Category"
              className={inputClass}
            />
          </Field>
          <Field label="Moderation Internal Notes">
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Admin moderation notes"
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>
      </AdminModal>
    </PageEnter>
  );
}

