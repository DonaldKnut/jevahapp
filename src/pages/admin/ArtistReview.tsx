import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminTrack,
  getAdminTrack,
  listAdminTracks,
  reviewTrackModeration,
  formatTrackDuration,
  trackArtist,
  trackArtistSlug,
  trackDuration,
  trackId,
  trackPlayableUrl,
  trackProcessing,
  trackThumb,
  type TrackCard,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageEnter,
  PageHeader,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { CREATOR_HOLD_COPY } from "../../lib/uploadPolicy";
import { adminTrackModLabel } from "../../lib/studioTrackStatus";
import { genreLabel } from "../../lib/media";
import {
  ArrowPathIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type ModTab = "under_review" | "rejected" | "approved" | "all";

const TABS: { value: ModTab; label: string }[] = [
  { value: "under_review", label: "In review" },
  { value: "rejected", label: "Rejected" },
  { value: "approved", label: "Live" },
  { value: "all", label: "All creator songs" },
];

function formatUploaded(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ArtistReviewPage() {
  const { confirm, toast } = useFeedback();
  const [tab, setTab] = useState<ModTab>("under_review");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 220);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TrackCard[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [counts, setCounts] = useState<Record<ModTab, number>>({
    under_review: 0,
    rejected: 0,
    approved: 0,
    all: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TrackCard | null>(null);
  const [heard, setHeard] = useState(false);
  const [reason, setReason] = useState("");
  const [approveError, setApproveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const [review, rejected, live, all] = await Promise.all([
        listAdminTracks({ lane: "artist", moderationStatus: "under_review", limit: 1 }),
        listAdminTracks({ lane: "artist", moderationStatus: "rejected", limit: 1 }),
        listAdminTracks({ lane: "artist", moderationStatus: "approved", limit: 1 }),
        listAdminTracks({ lane: "artist", limit: 1 }),
      ]);
      setCounts({
        under_review: review.total ?? 0,
        rejected: rejected.total ?? 0,
        approved: live.total ?? 0,
        all: all.total ?? 0,
      });
    } catch {
      /* list load surfaces the real error */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminTracks({
        lane: "artist",
        moderationStatus: tab === "all" ? undefined : tab,
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      });
      setItems(res.items);
      setTotal(res.total ?? res.items.length);
      setPages(Math.max(1, res.pages ?? 1));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load creator songs."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const selected = useMemo(
    () => items.find((t) => trackId(t) === selectedId) || detail,
    [items, selectedId, detail]
  );

  async function openRow(t: TrackCard) {
    const id = trackId(t);
    if (!id) return;
    setSelectedId(id);
    setDetail(t);
    setHeard(false);
    setApproveError(null);
    setReason("");
    try {
      const fresh = await getAdminTrack(id);
      setDetail(fresh);
    } catch {
      /* list card is enough to play */
    }
  }

  const playUrl = selected ? trackPlayableUrl(selected) : null;
  const processing = selected ? trackProcessing(selected) : "ready";
  const fileMissing = Boolean(selected) && !playUrl;
  const canPlay = Boolean(playUrl) && processing === "ready";
  const canApprove = Boolean(selected) && heard && canPlay && !busy;

  async function decide(status: "approved" | "rejected" | "under_review") {
    const id = selected ? trackId(selected) : "";
    if (!id) return;
    if (status === "approved" && !canApprove) {
      setApproveError(
        "Play the song first, then send heardConfirmed: true. Creator tracks do not go live from a click alone."
      );
      return;
    }
    setBusy(true);
    setApproveError(null);
    try {
      await reviewTrackModeration(id, {
        status,
        heardConfirmed: status === "approved" ? true : undefined,
        reason:
          reason.trim() ||
          (status === "rejected" ? CREATOR_HOLD_COPY : undefined),
      });
      toast.success(
        status === "approved"
          ? "Approved — live on the Artists shelf"
          : status === "rejected"
            ? "Rejected — stays off the public shelf"
            : "Held for another listen"
      );
      setHeard(false);
      setReason("");
      await load();
      await loadCounts();
      setSelectedId(null);
      setDetail(null);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Review request failed.";
      if (
        err instanceof ApiError &&
        err.body?.code === "ADMIN_MUST_HEAR_TRACK"
      ) {
        setApproveError(msg);
      } else {
        toast.error("Review failed", msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    const id = selected ? trackId(selected) : "";
    if (!id) return;
    const ok = await confirm({
      title: "Delete this track?",
      message: "This purges the song and the R2 file. The creator cannot undo it.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteAdminTrack(id);
      toast.success("Track deleted");
      setSelectedId(null);
      setDetail(null);
      await load();
      await loadCounts();
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  const slug = selected ? trackArtistSlug(selected) : null;
  const mod = selected ? adminTrackModLabel(selected.moderationStatus) : null;

  return (
    <PageEnter>
      <PageHeader
        title="Creator songs"
        subtitle="Listen, then approve or reject. These tracks are not the video queue — they stay off the public Artists shelf until you hear them."
        badgeText="Artist lane"
        back={{ to: "/admin/moderation", label: "Video queue" }}
        actions={
          <Button variant="secondary" onClick={() => void load()} disabled={loading}>
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold shadow-sm transition ${
                tab === t.value
                  ? "bg-jevah-accent text-white"
                  : "bg-jevah-surface text-jevah-text-muted ring-1 ring-jevah-border hover:text-jevah-text"
              }`}
            >
              {t.label}
              <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono text-[10px]">
                {counts[t.value]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-72">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or artist"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} pl-10 text-xs font-medium`}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert tone="error" onRetry={() => void load()}>
            {error}
          </Alert>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr] xl:grid-cols-[minmax(0,22rem)_1fr]">
        <section className="overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface">
          {loading ? (
            <div className="p-4">
              <SkeletonRows rows={6} />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title={
                tab === "under_review"
                  ? "No creator songs waiting"
                  : "No songs in this tab"
              }
              description={
                tab === "under_review"
                  ? "New uploads land here after they finish the PUT."
                  : "Try another tab or search."
              }
              icon={MusicalNoteIcon}
            />
          ) : (
            <ul className="divide-y divide-jevah-border/60">
              {items.map((t) => {
                const id = trackId(t);
                const thumb = trackThumb(t);
                const badge = adminTrackModLabel(t.moderationStatus);
                const active = id === selectedId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => void openRow(t)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                        active
                          ? "bg-jevah-accent/10"
                          : "hover:bg-jevah-card"
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-jevah-card text-jevah-accent">
                          <MusicalNoteIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-jevah-text">
                          {t.title || "Untitled"}
                        </p>
                        <p className="truncate text-xs font-semibold text-jevah-text-muted">
                          {trackArtist(t)}
                        </p>
                        <div className="mt-1">
                          <Badge tone={badge.tone} size="sm">
                            {badge.label}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-jevah-border/60 px-4 py-3 text-xs font-bold text-jevah-text-muted">
              <span>
                Page {page} of {pages} · {total} songs
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-jevah-border bg-jevah-surface p-5 sm:p-6">
          {!selected ? (
            <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jevah-card text-jevah-accent">
                <MusicalNoteIcon className="h-7 w-7" />
              </div>
              <p className="mt-4 text-sm font-extrabold text-jevah-text">
                Select a song
              </p>
              <p className="mt-1 max-w-sm text-xs font-medium text-jevah-text-muted">
                Play it here, then approve. Reject does not require a listen.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex gap-4">
                {trackThumb(selected) ? (
                  <img
                    src={trackThumb(selected) || ""}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-jevah-border"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-jevah-card text-jevah-accent">
                    <MusicalNoteIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-jevah-text">
                      {selected.title || "Untitled"}
                    </h2>
                    {mod && (
                      <Badge tone={mod.tone} size="sm" dot>
                        {mod.label}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-jevah-text-muted">
                    {slug ? (
                      <Link
                        to={`/artists/${slug}`}
                        className="hover:text-jevah-accent hover:underline"
                      >
                        {trackArtist(selected)}
                      </Link>
                    ) : (
                      trackArtist(selected)
                    )}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-jevah-text-muted">
                    {[
                      selected.copyrightStatus,
                      selected.genre ? genreLabel(selected.genre) : selected.genre,
                      selected.category,
                      selected.language,
                      formatTrackDuration(trackDuration(selected)),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-jevah-text-muted">
                    Uploaded {formatUploaded(selected.createdAt)}
                    {selected.visibilityDb || selected.visibility
                      ? ` · shelf ${selected.visibilityDb || selected.visibility}`
                      : ""}
                  </p>
                  {selected.licenseNote ? (
                    <p className="mt-2 text-xs font-medium text-jevah-text">
                      License: {selected.licenseNote}
                    </p>
                  ) : null}
                </div>
              </div>

              {fileMissing ? (
                <Alert tone="warning">
                  File not uploaded. The creator PUT never finished — Approve is
                  disabled.
                </Alert>
              ) : processing !== "ready" ? (
                <Alert tone="warning">
                  Still processing ({processing}). Play is disabled until the
                  file is ready.
                </Alert>
              ) : (
                <div className="rounded-2xl bg-jevah-card p-3">
                  <audio
                    key={trackId(selected)}
                    controls
                    preload="metadata"
                    className="w-full"
                    src={playUrl || ""}
                    onEnded={() => setHeard(true)}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (el.duration && el.currentTime / el.duration >= 0.2) {
                        setHeard(true);
                      }
                    }}
                  >
                    <track kind="captions" />
                  </audio>
                  <p className="mt-2 text-[11px] font-bold text-jevah-text-muted">
                    {heard
                      ? "Heard — Approve is available."
                      : "Approve is disabled until you play about 20% or finish the track."}
                  </p>
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-jevah-text-muted">
                  Reason (optional)
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Worship track, names Jesus — or why you are holding / rejecting"
                  className={`${inputClass} min-h-[4.5rem] py-2.5 text-sm`}
                />
              </label>

              {approveError ? (
                <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {approveError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => void decide("rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void decide("under_review")}
                >
                  Keep on hold
                </Button>
                <Button
                  className="ml-auto"
                  disabled={!canApprove}
                  onClick={() => void decide("approved")}
                >
                  <CheckIcon className="h-4 w-4" />
                  Approve
                </Button>
              </div>

              <div className="border-t border-jevah-border/60 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void onDelete()}
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete track
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageEnter>
  );
}
