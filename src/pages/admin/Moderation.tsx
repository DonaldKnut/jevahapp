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
  cn,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import MediaPreview from "../../components/admin/MediaPreview";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
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

  const selectedIndex = useMemo(
    () => items.findIndex((m) => m.id === selectedId),
    [items, selectedId]
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
    const next = items[selectedIndex + delta];
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
      // Backend accepts assigneeId; null clears. We pass current user when available via prompt.
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
        <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-sm text-jevah-text-muted">
          Select an item to review.
        </div>
      );
    }
    if (detailLoading || !detail) {
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <MediaPreview
            media={detail}
            compact={forMobile}
            onPlaybackError={onPlaybackError}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(detail.moderationStatus)}>
              {detail.moderationStatus}
            </Badge>
            {detail.publicationState && (
              <Badge tone="info">{detail.publicationState}</Badge>
            )}
            {signedExpiryLabel(detail.preview) && (
              <Badge tone="warning">{signedExpiryLabel(detail.preview)}</Badge>
            )}
            {detail.createdAt && (
              <span className="text-xs text-jevah-text-muted">
                {formatAge(detail.createdAt)}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold leading-snug text-jevah-text sm:text-xl">
              {detail.title}
            </h2>
            <p className="mt-1 text-sm text-jevah-text-muted">
              {detail.contentType}
              {detail.category ? ` · ${detail.category}` : ""} ·{" "}
              {uploaderLabel(detail)}
            </p>
            {detail.description && (
              <p className="mt-2 text-sm leading-relaxed text-jevah-text">
                {detail.description}
              </p>
            )}
          </div>

          {decision && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm">
              <p className="font-semibold text-amber-950">AI decision</p>
              <p className="mt-1 text-amber-900">
                {decision.reason || "No reason"}
                {decision.confidence != null
                  ? ` · ${(decision.confidence * 100).toFixed(0)}% confidence`
                  : ""}
              </p>
              {!!decision.flags?.length && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {decision.flags.map((flag) => (
                    <Badge key={flag} tone="warning">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {detail.processing?.status && (
            <p className="text-xs text-jevah-text-muted">
              Processing: {detail.processing.status}
              {detail.processing.progress != null
                ? ` (${detail.processing.progress}%)`
                : ""}
            </p>
          )}

          <Field label="Admin notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Optional notes for this decision…"
            />
          </Field>

          <div className="rounded-xl border border-jevah-border bg-jevah-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-jevah-text-muted">
              Notes thread
            </p>
            <ul className="mt-2 max-h-28 space-y-1.5 overflow-y-auto text-xs text-jevah-text-muted">
              {threadNotes.length === 0 ? (
                <li>No notes yet.</li>
              ) : (
                threadNotes.map((n, i) => (
                  <li key={String(n.id || i)}>
                    {String(n.body || n.text || n.message || "—")}
                  </li>
                ))
              )}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className={inputClass}
                placeholder="Add note…"
              />
              <Button
                variant="secondary"
                disabled={busy || !noteDraft.trim()}
                onClick={() => void submitNote()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setEditOpen(true)}
            >
              Edit metadata
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => void loadCases()}>
              AI evidence
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => void assignToMe()}
            >
              Assign
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => void rerunAi()}
            >
              Re-run AI
            </Button>
            <Button
              variant="warning"
              disabled={busy || !detail.uploader?.id}
              onClick={() => void banUploader()}
            >
              Ban uploader
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => void hardDelete()}
            >
              Delete
            </Button>
          </div>

          {showCases && (
            <div className="rounded-2xl border border-jevah-border bg-jevah-muted p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">AI case history</p>
                <button
                  type="button"
                  className="rounded-lg p-1 text-jevah-text-muted hover:bg-jevah-surface"
                  onClick={() => setShowCases(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              {cases.length === 0 ? (
                <p className="text-xs text-jevah-text-muted">No cases.</p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
                  {cases.map((c) => (
                    <li key={c.id} className="rounded-xl bg-jevah-surface p-2.5 shadow-sm">
                      <p className="font-medium">
                        {c.provider || "AI"} · {c.modelId || "—"}
                      </p>
                      <p className="mt-1">{c.decision?.reason || "—"}</p>
                      <p className="mt-1 text-jevah-text-muted">
                        {(c.decision?.flags || []).join(", ")} · {c.createdAt}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-jevah-border bg-jevah-surface/95 px-4 py-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={selectedIndex <= 0}
              onClick={() => goAdjacent(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted ring-1 ring-jevah-border disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <p className="text-xs text-jevah-text-muted">
              {selectedIndex >= 0 ? selectedIndex + 1 : 0} / {items.length}
            </p>
            <button
              type="button"
              disabled={selectedIndex < 0 || selectedIndex >= items.length - 1}
              onClick={() => goAdjacent(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-jevah-text-muted ring-1 ring-jevah-border disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="success"
              disabled={busy}
              className="min-h-11"
              onClick={() => void setStatus("approved")}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              className="min-h-11"
              onClick={() => void setStatus("under_review")}
            >
              Hold
            </Button>
            <Button
              variant="warning"
              disabled={busy}
              className="min-h-11"
              onClick={() => void setStatus("rejected")}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Moderation queue"
        subtitle="Watch the upload, review AI signals, then decide. Desktop split view · mobile full-screen review."
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {[
          { value: "", label: "Needs review" },
          { value: "under_review", label: "Under review" },
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
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
              statusFilter === f.value
                ? "bg-jevah-accent text-white shadow-sm"
                : "bg-jevah-surface text-jevah-text-muted ring-1 ring-jevah-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-jevah-border bg-jevah-surface px-3 py-2">
          <span className="text-xs font-medium text-jevah-text-muted">
            {selectedIds.size} selected
          </span>
          <Button
            variant="success"
            className="min-h-9 text-xs"
            disabled={busy}
            onClick={() => void runBulk("approved")}
          >
            Bulk approve
          </Button>
          <Button
            variant="warning"
            className="min-h-9 text-xs"
            disabled={busy}
            onClick={() => void runBulk("rejected")}
          >
            Bulk reject
          </Button>
          <Button
            variant="ghost"
            className="min-h-9 text-xs"
            onClick={() => setSelectedIds(new Set())}
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

      {/* Desktop split */}
      <div className="hidden overflow-hidden rounded-2xl border border-jevah-border bg-jevah-surface shadow-sm lg:grid lg:h-[calc(100vh-12rem)] lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="overflow-y-auto border-r border-jevah-border">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Queue is empty" />
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <div
                    className={cn(
                      "flex w-full gap-2 border-b border-jevah-border px-2 py-3 transition duration-200 hover:bg-jevah-card",
                      selectedId === item.id && "bg-jevah-accent/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-4 h-4 w-4 shrink-0"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleQueueSelect(item.id)}
                    />
                    <button
                      type="button"
                      onClick={() => selectItem(item.id)}
                      className="flex min-w-0 flex-1 gap-3 text-left"
                    >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-jevah-card">
                      {item.preview?.thumbnailUrl ? (
                        <img
                          src={item.preview.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-jevah-text-muted">
                        {item.contentType} · {item.moderationStatus}
                      </p>
                      <p className="truncate text-xs text-jevah-text-muted">
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
        <div className="min-h-0 overflow-hidden">
          <ReviewBody />
        </div>
      </div>

      {/* Mobile queue */}
      <div className="lg:hidden">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Queue is empty" />
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li
                key={item.id}
                className="admin-list-item"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <button
                  type="button"
                  onClick={() => selectItem(item.id, true)}
                  className="flex w-full gap-3 rounded-2xl border border-jevah-border bg-jevah-surface p-3 text-left shadow-sm transition active:scale-[0.99]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-jevah-card">
                    {item.preview?.thumbnailUrl ? (
                      <img
                        src={item.preview.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-jevah-text-muted">
                      {item.contentType} · {item.moderationStatus}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-jevah-text-muted">
                      {uploaderLabel(item)}
                      {item.createdAt ? ` · ${formatAge(item.createdAt)}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobile full-screen review */}
      {mobileReviewOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-jevah-surface admin-fade-in lg:hidden">
          <div className="flex items-center gap-2 border-b border-jevah-border px-3 py-2.5 admin-sheet-in">
            <button
              type="button"
              onClick={() => setMobileReviewOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-jevah-card"
              aria-label="Back to queue"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {detail?.title || "Review"}
              </p>
              <p className="text-[11px] text-jevah-text-muted">
                {selectedIndex >= 0 ? selectedIndex + 1 : 0} of {items.length}
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ReviewBody forMobile />
          </div>
        </div>
      )}

      {editOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full max-w-lg space-y-3 rounded-t-3xl bg-jevah-surface p-6 shadow-xl admin-sheet-in sm:rounded-2xl">
            <h3 className="text-lg font-semibold">Edit metadata</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className={inputClass}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className={inputClass}
            />
            <input
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="Category"
              className={inputClass}
            />
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Admin moderation notes"
              rows={2}
              className={inputClass}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={busy}
                onClick={() => void saveMetadata()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
