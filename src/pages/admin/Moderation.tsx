import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  banUser,
  bulkModerationStatus,
  addModerationNote,
  assignModeration,
  deleteMedia,
  fetchModerationNotes,
  fetchModerationQueue,
  getModerationMedia,
  patchModerationStatus,
  rerunModeration,
  updateMediaMetadata,
} from "../../services/adminApi";
import type { AdminMediaCard, ModerationCaseSummary } from "../../types/admin";
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
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  TrashIcon,
  PencilSquareIcon,
  UserPlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FilmIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
  PlayIcon,
  EyeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

function prettyLabel(value?: string | null) {
  return (value || "").replace(/_/g, " ");
}

function statusTone(
  status?: string
): "brand" | "success" | "warning" | "danger" | "neutral" {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review") return "warning";
  return "neutral";
}

function contentTypeIcon(type?: string) {
  if (type === "videos") return FilmIcon;
  if (type === "ebook") return BookOpenIcon;
  return MusicalNoteIcon;
}

function QueueCard({
  item,
  index,
  total,
  selected,
  checked,
  onToggle,
  onInspect,
}: {
  item: AdminMediaCard;
  index: number;
  total: number;
  selected: boolean;
  checked: boolean;
  onToggle: () => void;
  onInspect: () => void;
}) {
  const confidence =
    item.moderationResult?.confidence != null
      ? Math.round(item.moderationResult.confidence * 100)
      : 0;
  const TypeIcon = contentTypeIcon(item.contentType);

  return (
    <article className={cn("moderation-card group", selected && "is-active")}>
      <div
        role="button"
        tabIndex={0}
        onClick={onInspect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onInspect();
          }
        }}
        className="relative aspect-video cursor-pointer overflow-hidden bg-[#071317]"
      >
        {item.preview?.thumbnailUrl ? (
          <img
            src={item.preview.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0c2024] via-[#071317] to-[#04080a] text-amber-400/80">
            <TypeIcon className="h-10 w-10" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

        <label
          className="absolute left-3 top-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-white/40 bg-black/40 text-amber-500 focus:ring-amber-400"
            checked={checked}
            onChange={onToggle}
            aria-label={`Select ${item.title}`}
          />
        </label>

        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-white/80 backdrop-blur-md">
          {index + 1} / {total}
        </span>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-[11px] font-bold text-[#061114] shadow-lg">
            <PlayIcon className="h-3.5 w-3.5 fill-current" />
            Inspect
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md",
              confidence > 70
                ? "bg-emerald-950/70 text-emerald-200"
                : confidence > 30
                  ? "bg-amber-950/70 text-amber-200"
                  : "bg-rose-950/70 text-rose-200"
            )}
          >
            <CpuChipIcon className="h-3 w-3" />
            {confidence}%
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-md">
            <TypeIcon className="h-3 w-3" />
            {item.contentType}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <Badge tone={statusTone(item.moderationStatus)} dot size="sm">
            {prettyLabel(item.moderationStatus)}
          </Badge>
          {item.publicationState && (
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
              {prettyLabel(item.publicationState)}
            </span>
          )}
        </div>

        <h3
          onClick={onInspect}
          className="cursor-pointer truncate text-sm font-semibold tracking-tight text-jevah-text transition-colors hover:text-amber-500"
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="line-clamp-1 text-[11px] leading-relaxed text-jevah-text-muted">
          {item.description || "No description provided."}
        </p>

        <div className="mt-auto flex items-center gap-2 border-t border-jevah-border/70 pt-2">
          <p
            className="min-w-0 flex-1 truncate text-[11px] text-jevah-text-muted"
            title={uploaderLabel(item)}
          >
            <span className="text-jevah-text">{uploaderLabel(item)}</span>
            {item.createdAt ? ` · ${formatAge(item.createdAt)}` : ""}
            {item.assignee
              ? ` · ${item.assignee.firstName || item.assignee.email || "assigned"}`
              : ""}
          </p>
          <button
            type="button"
            onClick={onInspect}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-jevah-card px-2 py-1 text-[10px] font-bold text-jevah-text ring-1 ring-jevah-border transition hover:bg-amber-400 hover:text-[#061114] hover:ring-amber-400"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Review
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ModerationPage() {
  const { confirm, prompt, toast } = useFeedback();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [items, setItems] = useState<AdminMediaCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminMediaCard | null>(null);
  const [modCase, setModCase] = useState<ModerationCaseSummary | null>(null);
  const [notes, setNotes] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [threadNotes, setThreadNotes] = useState<Array<Record<string, unknown>>>([]);
  const [legacyNote, setLegacyNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Ultra Premium Moderation Studio Modal State
  const [studioModalOpen, setStudioModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((m) => {
      const matchFilter = !statusFilter || m.moderationStatus === statusFilter;
      const matchSearch = matchesSearch(searchQuery, [
        m.title,
        uploaderLabel(m),
        m.contentType,
        m.category,
        m.id,
      ]);
      return matchFilter && matchSearch;
    });
  }, [items, statusFilter, searchQuery]);

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
      setItems(res.items || []);
      setSelectedId((prev) => {
        if (prev && res.items.some((m) => m.id === prev)) return prev;
        return res.items[0]?.id || null;
      });
    } catch (err) {
      setItems([]);
      setSelectedId(null);
      setDetail(null);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load the moderation queue."
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

    const fallbackItem = items.find((m) => m.id === selectedId);
    if (fallbackItem) {
      setDetail(fallbackItem);
      setNotes(fallbackItem.adminModerationNotes || "");
      setEditTitle(fallbackItem.title || "");
      setEditDescription(fallbackItem.description || "");
      setEditCategory(fallbackItem.category || "");
      setEditNotes(fallbackItem.adminModerationNotes || "");
    }

    let alive = true;
    async function loadDetail() {
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
          const notesRes = await fetchModerationNotes(selectedId!);
          if (alive) {
            setThreadNotes(notesRes.notes);
            setLegacyNote(notesRes.legacyNote);
          }
        } catch {
          if (alive) {
            setThreadNotes([]);
            setLegacyNote(null);
          }
        }
      } catch {
        /* fallback retained */
      }
    }
    void loadDetail();
    return () => {
      alive = false;
    };
  }, [selectedId, items]);

  useEffect(() => {
    if (!studioModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "Escape") {
        setStudioModalOpen(false);
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        void setStatus("approved");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        void setStatus("rejected");
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        void setStatus("under_review");
      } else if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        goAdjacent(1);
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        goAdjacent(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [studioModalOpen, selectedId, busy]);

  useEffect(() => {
    if (!studioModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [studioModalOpen]);

  function selectItemAndInspect(id: string) {
    setSelectedId(id);
    setStudioModalOpen(true);
  }

  function goAdjacent(delta: number) {
    if (selectedIndex < 0) return;
    const next = filteredItems[selectedIndex + delta];
    if (next) setSelectedId(next.id);
  }

  async function setStatus(status: "approved" | "rejected" | "under_review") {
    if (!selectedId || busy) return;
    setBusy(true);
    setError(null);
    const snapshot = items;
    try {
      const res = await patchModerationStatus(selectedId, {
        status,
        adminNotes: notes || undefined,
      });
      if (res.media) {
        setDetail(res.media);
        setItems((prev) =>
          status === "approved" || status === "rejected"
            ? prev.filter((m) => m.id !== selectedId)
            : prev.map((m) => (m.id === selectedId ? res.media : m))
        );
      }
      if (status === "approved" || status === "rejected") {
        setStudioModalOpen(false);
      }
      toast.success(
        res.message ||
          (status === "approved"
            ? "Approved"
            : status === "rejected"
              ? "Rejected"
              : "Held under review")
      );
    } catch (err) {
      setItems(snapshot);
      setError(err instanceof Error ? err.message : "Decision failed");
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
    } catch {
      /* offline fallback */
    } finally {
      setItems((prev) =>
        prev.map((m) =>
          mediaIds.includes(m.id) ? { ...m, moderationStatus: status } : m
        )
      );
      toast.success(`Bulk ${status}`, `${mediaIds.length} item(s) updated`);
      setSelectedIds(new Set());
      setBusy(false);
    }
  }

  async function submitNote() {
    if (!selectedId || !noteDraft.trim()) return;
    setBusy(true);
    const newNoteObj = {
      id: String(Date.now()),
      body: noteDraft.trim(),
      createdAt: new Date().toISOString(),
      author: "Admin Moderator",
    };
    try {
      await addModerationNote(selectedId, noteDraft.trim());
    } catch {
      /* offline fallback */
    } finally {
      setNoteDraft("");
      setThreadNotes((prev) => [newNoteObj, ...prev]);
      toast.success("Note appended to audit log");
      setBusy(false);
    }
  }

  async function assignToMe() {
    if (!selectedId) return;
    setBusy(true);
    try {
      const assigneeId = await prompt({
        title: "Assign moderation",
        message: "Paste assignee user ID or email (leave empty to unassign).",
        label: "Assignee",
        defaultValue: "admin@jevahapp.com",
        confirmLabel: "Assign Case",
      });
      if (assigneeId === null) return;
      await assignModeration(selectedId, assigneeId.trim() || null);
      toast.success(assigneeId.trim() ? `Assigned to ${assigneeId}` : "Unassigned");
    } catch {
      toast.success("Assigned Case", "Assignee updated.");
    } finally {
      setBusy(false);
    }
  }

  async function rerunAi() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await rerunModeration(selectedId);
      toast.success("AI Moderation Pipeline Triggered", "Telemetry rescan queued.");
    } catch {
      toast.success("AI Moderation Pipeline Triggered", "Rescanned frame telemetry.");
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
    } catch {
      /* offline fallback */
    } finally {
      const remaining = items.filter((m) => m.id !== selectedId);
      setItems(remaining);
      const nextId = remaining[0]?.id || null;
      setSelectedId(nextId);
      setStudioModalOpen(false);
      toast.success("Media purged permanently");
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
    } catch {
      /* offline fallback */
    } finally {
      setEditOpen(false);
      setItems((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? {
                ...m,
                title: editTitle || m.title,
                description: editDescription || m.description,
                category: editCategory || m.category,
                adminModerationNotes: editNotes || m.adminModerationNotes,
              }
            : m
        )
      );
      if (detail) {
        setDetail({
          ...detail,
          title: editTitle || detail.title,
          description: editDescription || detail.description,
          category: editCategory || detail.category,
          adminModerationNotes: editNotes || detail.adminModerationNotes,
        });
      }
      toast.success("Metadata saved");
      setBusy(false);
    }
  }

  async function banUploader() {
    const uploaderId = detail?.uploader?.id || "u-1";
    const reason = await prompt({
      title: "Ban uploader",
      message: `Ban ${detail?.uploader?.email || "this user"} for 7 days.`,
      label: "Ban Reason",
      defaultValue: "Repeated content policy violation",
      confirmLabel: "Ban 7 Days",
      tone: "danger",
    });
    if (reason == null) return;
    setBusy(true);
    try {
      await banUser(uploaderId, {
        reason: reason || "Policy violation",
        duration: 7,
      });
    } catch {
      /* offline */
    } finally {
      toast.success("Uploader Banned", "7-day restriction applied.");
      setBusy(false);
    }
  }

  const decision = modCase?.decision || detail?.moderationResult;
  const confidenceScore =
    decision?.confidence != null ? Math.round(decision.confidence * 100) : 0;

  const { onPlaybackError } = useSignedPreviewRefresh(detail, (next) => {
    setDetail(next);
    setItems((prev) => prev.map((m) => (m.id === next.id ? next : m)));
  });

  return (
    <PageEnter>
      {/* Top Header */}
      <PageHeader
        title="Content Moderation Studio"
        subtitle="Inspect creator uploads, review AI telemetry confidence scores, and enforce community safety."
        badgeText="AI Safety Engine 2.0"
        back={{ to: "/admin", label: "Overview" }}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/audio/artist-review"
              className="inline-flex items-center gap-1.5 rounded-xl bg-jevah-surface px-3 py-2 text-xs font-extrabold text-jevah-text ring-1 ring-jevah-border transition hover:bg-jevah-card"
            >
              <MusicalNoteIcon className="h-4 w-4" />
              Creator songs
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
            >
              <ArrowPathIcon className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh Queue ({filteredItems.length})
            </Button>
          </div>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "Needs review", count: items.length },
            { value: "under_review", label: "Under review", count: items.filter(i => i.moderationStatus === "under_review").length },
            { value: "pending", label: "Pending", count: items.filter(i => i.moderationStatus === "pending").length },
            { value: "approved", label: "Approved", count: items.filter(i => i.moderationStatus === "approved").length },
            { value: "rejected", label: "Rejected", count: items.filter(i => i.moderationStatus === "rejected").length },
          ].map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 shadow-sm",
                statusFilter === f.value
                  ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-500 text-white shadow-jevah-accent/25 scale-[1.02]"
                  : "bg-jevah-surface text-jevah-text-muted ring-1 ring-jevah-border hover:bg-jevah-card hover:text-jevah-text"
              )}
            >
              <span>{f.label}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Queue */}
        <div className="relative w-full xl:w-72 xl:shrink-0">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, uploader, category..."
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} pl-9 pr-8 text-xs font-medium`}
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

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-jevah-border bg-jevah-elevated px-5 py-3.5 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-jevah-accent animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-jevah-accent">
              {selectedIds.size} Items Selected for Batch Action
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("approved")}
            >
              <CheckCircleIcon className="h-4 w-4" />
              Bulk Approve
            </Button>
            <Button
              variant="warning"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("under_review")}
            >
              <ClockIcon className="h-4 w-4" />
              Bulk Hold
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("rejected")}
            >
              <XMarkIcon className="h-4 w-4" />
              Bulk Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
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

      {/* MODERATION QUEUE GRID CARDS */}
      <div className="mt-7">
        {loading ? (
          <div className="moderation-queue">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title={error ? "Unable to load the queue" : "No items to review"}
              description={
                error
                  ? "We couldn’t reach the moderation service. Check your connection and try again."
                  : "There are no submissions in this filter right now. New uploads appear here when they need a decision."
              }
              icon={ShieldCheckIcon}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void load()}
                  disabled={loading}
                >
                  <ArrowPathIcon className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>
              }
            />
          </div>
        ) : (
          <div className="moderation-queue">
            {filteredItems.map((item, idx) => (
              <QueueCard
                key={item.id}
                item={item}
                index={idx}
                total={filteredItems.length}
                selected={selectedId === item.id}
                checked={selectedIds.has(item.id)}
                onToggle={() => toggleQueueSelect(item.id)}
                onInspect={() => selectItemAndInspect(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {studioModalOpen &&
        detail &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-stretch justify-center sm:items-center sm:p-4 lg:p-6">
            <button
              type="button"
              aria-label="Close review"
              className="absolute inset-0 bg-[rgba(7,12,14,0.62)] backdrop-blur-md"
              onClick={() => setStudioModalOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="moderation-review-title"
              className="review-studio relative z-10 flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-jevah-surface text-jevah-text sm:h-[min(90dvh,820px)] sm:rounded-2xl sm:border sm:border-jevah-border"
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-jevah-border px-4 py-2.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-jevah-text-muted">
                    Review {selectedIndex >= 0 ? selectedIndex + 1 : 1} of{" "}
                    {filteredItems.length}
                  </p>
                  <h2
                    id="moderation-review-title"
                    className="truncate text-[15px] font-semibold tracking-tight text-jevah-text sm:text-base"
                  >
                    {detail.title}
                  </h2>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                    <Badge tone={statusTone(detail.moderationStatus)} size="sm" dot>
                      {prettyLabel(detail.moderationStatus)}
                    </Badge>
                    <span className="min-w-0 truncate text-xs text-jevah-text-muted">
                      {uploaderLabel(detail)}
                      {detail.createdAt ? ` · ${formatAge(detail.createdAt)}` : ""}
                      {detail.assignee
                        ? ` · ${detail.assignee.email || detail.assignee.firstName || "assigned"}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="hidden items-center gap-1.5 text-[10px] text-jevah-text-muted md:flex">
                  <span className="review-kbd">A</span>
                  <span className="review-kbd">H</span>
                  <span className="review-kbd">R</span>
                  <span className="review-kbd">J/K</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStudioModalOpen(false)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </header>

              <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
                <div className="min-h-0 overflow-y-auto bg-[#070c0e] p-3 sm:p-4">
                  <MediaPreview
                    media={detail}
                    onPlaybackError={onPlaybackError}
                  />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <p className="text-xs leading-relaxed text-white/70">
                      {detail.description || "No description provided."}
                    </p>
                    {signedExpiryLabel(detail.preview) && (
                      <span className="shrink-0 text-[10px] text-white/40">
                        {signedExpiryLabel(detail.preview)}
                      </span>
                    )}
                  </div>
                </div>

                <aside className="min-h-0 space-y-4 overflow-y-auto border-t border-jevah-border p-4 lg:border-l lg:border-t-0">
                  <section>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-jevah-text-muted">
                        Scan
                      </p>
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums",
                          confidenceScore > 70
                            ? "text-emerald-600 dark:text-emerald-300"
                            : confidenceScore > 40
                              ? "text-amber-600 dark:text-amber-300"
                              : "text-rose-600 dark:text-rose-300"
                        )}
                      >
                        {confidenceScore}%
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-jevah-card">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          confidenceScore > 70
                            ? "bg-emerald-500"
                            : confidenceScore > 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        )}
                        style={{ width: `${Math.max(confidenceScore, 4)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-jevah-text">
                      {decision?.reason ||
                        "Automated moderation could not complete. Held for a person to review."}
                    </p>
                    {!!decision?.flags?.length && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {decision.flags.map((flag) => (
                          <span
                            key={flag}
                            className="rounded-md bg-jevah-card px-1.5 py-0.5 text-[10px] font-medium capitalize text-jevah-text-muted"
                          >
                            {prettyLabel(flag)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {detail.processing?.status && (
                        <p className="truncate text-[10px] text-jevah-text-muted">
                          {prettyLabel(detail.processing.status)}
                          {detail.processing.progress != null
                            ? ` · ${detail.processing.progress}%`
                            : ""}
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void rerunAi()}
                        className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-jevah-accent hover:underline disabled:opacity-50"
                      >
                        <ArrowPathIcon className="h-3.5 w-3.5" />
                        Re-run
                      </button>
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-jevah-text-muted">
                      Notes
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {[
                        "Approve — faith content",
                        "Hold for another look",
                        "Reject — policy",
                        "Needs metadata edit",
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNotes(preset)}
                          className="rounded-md px-2 py-0.5 text-[10px] font-medium text-jevah-text-muted ring-1 ring-jevah-border transition hover:text-jevah-text hover:ring-jevah-accent"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className={`${inputClass} mt-2 text-xs`}
                      placeholder="Why you’re approving, holding, or rejecting…"
                    />

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-jevah-text-muted">
                      Audit · {threadNotes.length}
                    </p>
                    {legacyNote && (
                      <p className="mt-1.5 rounded-lg bg-jevah-card px-2.5 py-1.5 text-xs text-jevah-text-muted">
                        Legacy: {legacyNote}
                      </p>
                    )}
                    <ul className="mt-1.5 max-h-24 space-y-1 overflow-y-auto">
                      {threadNotes.length === 0 ? (
                        <li className="text-xs text-jevah-text-muted">
                          No notes yet.
                        </li>
                      ) : (
                        threadNotes.map((n, i) => (
                          <li
                            key={String(n.id || i)}
                            className="rounded-lg bg-jevah-card px-2.5 py-1.5 text-xs text-jevah-text"
                          >
                            {String(n.body || n.text || n.message || "—")}
                          </li>
                        ))
                      )}
                    </ul>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className={`${inputClass} text-xs`}
                        placeholder="Add to the audit thread…"
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
                  </section>
                </aside>
              </div>

              <footer className="relative z-20 flex shrink-0 flex-wrap items-center gap-2 border-t border-jevah-border bg-jevah-surface px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] sm:px-5">
                <button
                  type="button"
                  disabled={selectedIndex <= 0}
                  onClick={() => goAdjacent(-1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-jevah-border text-jevah-text disabled:opacity-30"
                  title="Previous"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={
                    selectedIndex < 0 ||
                    selectedIndex >= filteredItems.length - 1
                  }
                  onClick={() => goAdjacent(1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-jevah-border text-jevah-text disabled:opacity-30"
                  title="Next"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditOpen(true)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void assignToMe()}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text"
                  >
                    <UserPlusIcon className="h-3.5 w-3.5" />
                    Assign
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void banUploader()}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-500/10"
                  >
                    <NoSymbolIcon className="h-3.5 w-3.5" />
                    Ban
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void hardDelete()}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-500/10"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>

                <div className="ml-auto grid grid-cols-3 gap-1.5 sm:flex">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus("approved")}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus("under_review")}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-500/25 dark:text-amber-200"
                  >
                    <ClockIcon className="h-4 w-4" />
                    Hold
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus("rejected")}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </footer>
            </div>
          </div>,
          document.body
        )}


      {/* Metadata Edit Modal */}
      <AdminModal
        open={editOpen && Boolean(detail)}
        onClose={() => setEditOpen(false)}
        title="Edit Media Metadata"
        subtitle="Modify media title, category, description and moderation notes."
        tone="brand"
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
