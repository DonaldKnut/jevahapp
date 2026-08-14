import { useMemo, useState } from "react";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
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

export default function StudioCatalog({
  tracks,
  activeId,
  playing,
  onPlay,
  onEdit,
  onDelete,
  heading = "Catalog",
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
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let next = tracks.filter((t) => {
      if (visibility !== "all" && (t.visibility || "published") !== visibility) {
        return false;
      }
      if (!needle) return true;
      const hay = [
        t.title,
        trackArtist(t),
        t.genre,
        t.release?.title,
        t.language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
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

  return (
    <section className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-[0_8px_30px_var(--jevah-shadow)]">
      <div className="flex flex-col gap-4 border-b border-jevah-border/60 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-jevah-text">
            {heading}
          </h2>
          <p className="text-xs text-jevah-text-muted">
            {subheading ||
              `${tracks.length} tracks${
                totalDur > 0
                  ? ` · ${formatTrackDuration(totalDur)} total runtime`
                  : ""
              }`}
          </p>
        </div>
        {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[180px] flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter title, artist, genre…"
              className="h-10 w-full rounded-xl border border-jevah-border bg-jevah-card/50 pl-9 pr-3 text-sm text-jevah-text placeholder:text-jevah-text-muted/70 focus:border-jevah-accent focus:outline-none focus:ring-2 focus:ring-jevah-accent/20"
            />
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="h-10 rounded-xl border border-jevah-border bg-jevah-surface px-3 text-xs font-bold text-jevah-text"
          >
            <option value="all">All visibility</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-jevah-border bg-jevah-surface px-3 text-xs font-bold text-jevah-text"
          >
            <option value="recent">Newest</option>
            <option value="plays">Most played</option>
            <option value="title">Title</option>
            <option value="duration">Duration</option>
          </select>
        </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-jevah-text-muted">
          No tracks match this filter.
        </p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-jevah-border/50 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
              <tr>
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-2 py-3">Title</th>
                <th className="hidden px-2 py-3 md:table-cell">Release</th>
                <th className="hidden px-2 py-3 lg:table-cell">Genre</th>
                <th className="hidden px-2 py-3 xl:table-cell">Added</th>
                <th className="px-2 py-3 text-right">Plays</th>
                <th className="px-2 py-3 text-right">
                  <ClockIcon className="ml-auto h-3.5 w-3.5" />
                </th>
                <th className="px-3 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => {
                const id = trackId(t);
                const url = trackPlaybackUrl(t);
                const thumb = trackThumb(t);
                const active = activeId === id;
                const status = trackProcessing(t);
                return (
                  <tr
                    key={id}
                    className={`group border-b border-jevah-border/40 transition last:border-0 ${
                      active
                        ? "bg-jevah-accent/8"
                        : "hover:bg-jevah-card/60"
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      {active && playing ? (
                        <span className="inline-flex h-4 items-end gap-0.5">
                          <span className="eq-bar eq-bar-1 w-0.5 rounded-full bg-jevah-accent" />
                          <span className="eq-bar eq-bar-2 w-0.5 rounded-full bg-jevah-accent" />
                          <span className="eq-bar eq-bar-3 w-0.5 rounded-full bg-jevah-accent" />
                        </span>
                      ) : (
                        <span className="text-xs tabular-nums text-jevah-text-muted group-hover:hidden">
                          {i + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={!url}
                        onClick={() => onPlay(t)}
                        className="hidden text-jevah-text group-hover:inline-flex disabled:opacity-30"
                        aria-label={active && playing ? "Pause" : "Play"}
                      >
                        {active && playing ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={!url}
                          onClick={() => onPlay(t)}
                          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg disabled:opacity-40"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-jevah-accent/15 text-xs font-black text-jevah-accent">
                              ♪
                            </div>
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`truncate font-bold ${
                              active ? "text-jevah-accent" : "text-jevah-text"
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-jevah-text-muted">
                            {trackArtist(t)}
                            <span className="mx-1.5 opacity-40">·</span>
                            <span className="capitalize">
                              {t.visibility || "published"}
                            </span>
                            {status !== "ready" && (
                              <>
                                <span className="mx-1.5 opacity-40">·</span>
                                <span className="capitalize">{status}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden max-w-[140px] truncate px-2 py-2.5 text-xs text-jevah-text-muted md:table-cell">
                      {t.release?.title || "—"}
                    </td>
                    <td className="hidden px-2 py-2.5 text-xs capitalize text-jevah-text-muted lg:table-cell">
                      {t.genre ? genreLabel(t.genre) : "—"}
                    </td>
                    <td className="hidden px-2 py-2.5 text-xs text-jevah-text-muted xl:table-cell">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums font-semibold text-jevah-text-muted">
                      {(t.playCount || 0).toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs tabular-nums text-jevah-text-muted">
                      {formatTrackDuration(trackDuration(t))}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-1.5 text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-accent"
                          aria-label="Edit track"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          className="rounded-lg p-1.5 text-jevah-text-muted hover:bg-rose-500/10 hover:text-rose-500"
                          aria-label="Delete track"
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
