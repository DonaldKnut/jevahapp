import { useMemo, useState } from "react";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MusicalNoteIcon,
  ShareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  formatTrackDuration,
  genreLabel,
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackProcessing,
  trackThumb,
  type TrackCard,
} from "../../../lib/media";
import { matchesSearch } from "../../../lib/searchMatch";
import { useFeedback } from "../../../components/admin/Feedback";
import {
  SHELF_BADGE_CLASS,
  studioTrackShelf,
} from "../../../lib/studioTrackStatus";

function ShelfBadge({
  track,
  showDetail = false,
}: {
  track: TrackCard;
  showDetail?: boolean;
}) {
  const shelf = studioTrackShelf(track);
  return (
    <span className="inline-flex min-w-0 flex-col items-start gap-0.5">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${SHELF_BADGE_CLASS[shelf.tone]}`}
        title={shelf.detail}
      >
        {shelf.label}
      </span>
      {showDetail && shelf.detail ? (
        <span className="max-w-[220px] text-[10px] font-medium leading-snug text-jevah-text-muted">
          {shelf.detail}
        </span>
      ) : null}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type SortKey = "recent" | "plays" | "title" | "duration";
type ViewMode = "table" | "grid";

export default function StudioCatalog({
  tracks,
  activeId,
  playing,
  onPlay,
  onEdit,
  onDelete,
  heading = "Track Catalog",
  subheading,
  compact = false,
}: {
  tracks: TrackCard[];
  activeId: string | null;
  playing: boolean;
  onPlay: (t: TrackCard) => void;
  onEdit: (t: TrackCard) => void;
  onDelete: (t: TrackCard) => void;
  heading?: string;
  subheading?: string;
  compact?: boolean;
}) {
  const { toast } = useFeedback();
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    let next = tracks.filter((t) => {
      if (visibility !== "all") {
        const shelf = studioTrackShelf(t);
        if (visibility === "published" && shelf.key !== "live") return false;
        if (visibility === "draft" && shelf.key === "live") return false;
        if (visibility === "under_review" && shelf.key !== "under_review")
          return false;
        if (visibility === "rejected" && shelf.key !== "rejected") return false;
        if (visibility === "archived" && t.visibility !== "archived")
          return false;
      }
      const shelf = studioTrackShelf(t);
      return matchesSearch(q, [
        t.title,
        trackArtist(t),
        t.genre,
        t.genre ? genreLabel(t.genre) : undefined,
        t.release?.title,
        t.language,
        t.visibility,
        t.moderationStatus,
        shelf.label,
        t.playCount,
        trackId(t),
      ]);
    });
    next = [...next].sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "plays") return (b.playCount || 0) - (a.playCount || 0);
      if (sort === "duration")
        return (trackDuration(b) || 0) - (trackDuration(a) || 0);
      return (
        new Date(b.createdAt || b.updatedAt || 0).getTime() -
        new Date(a.createdAt || a.updatedAt || 0).getTime()
      );
    });
    return next;
  }, [tracks, q, visibility, sort]);

  const totalDur = tracks.reduce((n, t) => n + (trackDuration(t) || 0), 0);

  const handleShareTrack = async (t: TrackCard) => {
    const id = trackId(t);
    const fullUrl = `${window.location.origin}/tracks/${id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        toast.success(`Share link copied for "${t.title}"`);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch {
      toast.info("Track URL", fullUrl);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-jevah-border/60 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black tracking-tight text-jevah-text">
              {heading}
            </h2>
            <span className="inline-flex rounded-full bg-amber-400/15 px-3 py-0.5 text-xs font-black text-amber-500 ring-1 ring-amber-400/30">
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-jevah-text-muted">
            {subheading ||
              `Complete track management · ${
                totalDur > 0 ? `${formatTrackDuration(totalDur)} total audio duration` : "all uploaded media"
              }`}
          </p>
        </div>

        {!compact && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <label className="relative min-w-[200px] flex-1 sm:flex-initial">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, artist, genre, #plays…"
                autoComplete="off"
                spellCheck={false}
                className="h-10 w-full rounded-2xl border border-jevah-border/80 bg-jevah-card/60 pl-10 pr-3.5 text-xs font-bold text-jevah-text placeholder:text-jevah-text-muted/70 focus:border-jevah-accent focus:outline-none focus:ring-2 focus:ring-jevah-accent/20 transition-all"
              />
            </label>

            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="h-10 rounded-2xl border border-jevah-border/80 bg-jevah-card/60 px-3 text-xs font-bold text-jevah-text focus:border-jevah-accent focus:outline-none"
            >
              <option value="all">All status</option>
              <option value="published">Live</option>
              <option value="under_review">In review</option>
              <option value="rejected">Not published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-2xl border border-jevah-border/80 bg-jevah-card/60 px-3 text-xs font-bold text-jevah-text focus:border-jevah-accent focus:outline-none"
            >
              <option value="recent">Newest First</option>
              <option value="plays">Most Streamed</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration">Longest Duration</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-2xl bg-jevah-card p-1 ring-1 ring-jevah-border/80">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-xl p-1.5 transition-all ${
                  viewMode === "table"
                    ? "bg-jevah-accent text-white shadow-sm"
                    : "text-jevah-text-muted hover:text-jevah-text"
                }`}
                title="Table View"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl p-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-jevah-accent text-white shadow-sm"
                    : "text-jevah-text-muted hover:text-jevah-text"
                }`}
                title="Grid View"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Track Content */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/15 text-amber-500 ring-1 ring-amber-400/30">
            <MusicalNoteIcon className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-black text-jevah-text">No tracks found</h3>
          <p className="mt-1 max-w-sm text-xs font-medium text-jevah-text-muted">
            {q ? "No tracks matched your search criteria. Try adjusting filters." : "You haven't uploaded any tracks yet. Upload your first release to start building your catalog."}
          </p>
        </div>
      ) : viewMode === "grid" && !compact ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((t) => {
            const id = trackId(t);
            const url = trackPlaybackUrl(t);
            const thumb = trackThumb(t);
            const active = activeId === id;
            return (
              <div
                key={id}
                className={`group relative overflow-hidden rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                  active
                    ? "border-amber-400 bg-amber-400/10 shadow-xl shadow-amber-400/10"
                    : "border-jevah-border/60 bg-jevah-card/40 hover:border-jevah-accent/40 hover:bg-jevah-card/80 shadow-md"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 shadow-md">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-amber-400">
                      ♪
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!url}
                    onClick={() => onPlay(t)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity duration-300 disabled:opacity-0"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#061114] shadow-2xl transition hover:scale-110">
                      {active && playing ? (
                        <PauseIcon className="h-6 w-6 text-amber-500" />
                      ) : (
                        <PlayIcon className="h-6 w-6 ml-0.5 text-[#061114]" />
                      )}
                    </div>
                  </button>

                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-black text-white backdrop-blur-md">
                    {formatTrackDuration(trackDuration(t))}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate font-black text-sm ${active ? "text-amber-500" : "text-jevah-text"}`}>
                      {t.title}
                    </p>
                    <ShelfBadge track={t} />
                  </div>
                  <p className="truncate text-xs font-semibold text-jevah-text-muted">
                    {trackArtist(t)}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-jevah-border/40 text-[11px]">
                    <span className="font-extrabold text-jevah-text-muted">
                      {(t.playCount || 0).toLocaleString()} streams
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleShareTrack(t)}
                        className="rounded-lg p-1.5 text-jevah-text-muted hover:bg-jevah-card hover:text-emerald-400 transition"
                        title="Share Track Link"
                      >
                        {copiedId === id ? (
                          <CheckIcon className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ShareIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(t)}
                        className="rounded-lg p-1.5 text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-accent transition"
                        title="Edit track"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t)}
                        className="rounded-lg p-1.5 text-jevah-text-muted hover:bg-rose-500/10 hover:text-rose-500 transition"
                        title="Delete track"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-jevah-border/60 bg-jevah-card/30 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
              <tr>
                <th className="w-12 px-4 py-3.5 text-center">#</th>
                <th className="px-3 py-3.5">Track Title</th>
                <th className="hidden px-3 py-3.5 md:table-cell">Release</th>
                <th className="hidden px-3 py-3.5 lg:table-cell">Genre</th>
                <th className="hidden px-3 py-3.5 xl:table-cell">Release Date</th>
                <th className="px-3 py-3.5 text-right">Streams</th>
                <th className="px-3 py-3.5 text-right">
                  <ClockIcon className="ml-auto h-4 w-4" />
                </th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jevah-border/40">
              {rows.map((t, i) => {
                const id = trackId(t);
                const url = trackPlaybackUrl(t);
                const thumb = trackThumb(t);
                const active = activeId === id;
                const status = trackProcessing(t);
                return (
                  <tr
                    key={id}
                    className={`group transition-colors duration-200 ${
                      active
                        ? "bg-amber-400/15"
                        : "hover:bg-jevah-card/60"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      {active && playing ? (
                        <span className="inline-flex h-4 items-end gap-0.5">
                          <span className="h-3 w-1 animate-pulse rounded-full bg-amber-400" />
                          <span className="h-4 w-1 animate-bounce rounded-full bg-amber-400" />
                          <span className="h-2 w-1 animate-pulse rounded-full bg-amber-400" />
                        </span>
                      ) : (
                        <span className="text-xs font-bold tabular-nums text-jevah-text-muted group-hover:hidden">
                          {i + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={!url}
                        onClick={() => onPlay(t)}
                        className="hidden text-amber-500 group-hover:inline-flex disabled:opacity-30 transition"
                        aria-label={active && playing ? "Pause" : "Play"}
                      >
                        {active && playing ? (
                          <PauseIcon className="h-4.5 w-4.5" />
                        ) : (
                          <PlayIcon className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          disabled={!url}
                          onClick={() => onPlay(t)}
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-amber-400/15 disabled:opacity-40 ring-1 ring-jevah-border/50 group-hover:ring-amber-400/50 transition shadow-sm"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black text-amber-400">
                              ♪
                            </div>
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`truncate font-black text-sm ${
                              active ? "text-amber-500" : "text-jevah-text"
                            }`}
                          >
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-jevah-text-muted font-semibold">
                            <span>{trackArtist(t)}</span>
                            <span className="opacity-40">·</span>
                            <ShelfBadge track={t} showDetail />
                            {status !== "ready" && (
                              <span className="capitalize text-amber-600 dark:text-amber-400 font-bold">
                                {status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden max-w-[150px] truncate px-3 py-3 text-xs font-semibold text-jevah-text-muted md:table-cell">
                      {t.release?.title || "Single"}
                    </td>
                    <td className="hidden px-3 py-3 text-xs font-semibold capitalize text-jevah-text-muted lg:table-cell">
                      {t.genre ? genreLabel(t.genre) : "—"}
                    </td>
                    <td className="hidden px-3 py-3 text-xs font-semibold text-jevah-text-muted xl:table-cell">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs tabular-nums font-black text-jevah-text">
                      {(t.playCount || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right text-xs tabular-nums font-semibold text-jevah-text-muted">
                      {formatTrackDuration(trackDuration(t))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleShareTrack(t)}
                          className="rounded-xl p-2 text-jevah-text-muted hover:bg-jevah-card hover:text-emerald-400 transition"
                          title="Share Track Link"
                        >
                          {copiedId === id ? (
                            <CheckIcon className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <ShareIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-xl p-2 text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-accent transition"
                          title="Edit Track"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          className="rounded-xl p-2 text-jevah-text-muted hover:bg-rose-500/10 hover:text-rose-500 transition"
                          title="Delete Track"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

