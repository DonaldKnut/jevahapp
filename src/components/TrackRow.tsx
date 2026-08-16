import { Link } from "react-router-dom";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import {
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackProcessing,
  trackThumb,
  formatTrackDuration,
  type TrackCard,
} from "../lib/media";

export function TrackRow({
  track,
  active,
  playing,
  onPlay,
  showLane,
  artistHref,
  index,
}: {
  track: TrackCard;
  active?: boolean;
  playing?: boolean;
  onPlay?: (track: TrackCard) => void;
  showLane?: boolean;
  artistHref?: string | null;
  index?: number;
}) {
  const url = trackPlaybackUrl(track);
  const id = trackId(track);
  const artist = trackArtist(track);
  const dur = formatTrackDuration(trackDuration(track));
  const status = trackProcessing(track);
  const thumb = trackThumb(track);
  const fromRelease = track.release?.title;

  return (
    <li>
      <div
        className={`group flex items-center gap-3.5 rounded-2xl px-2.5 py-2.5 transition duration-200 sm:px-3 ${
          active
            ? "bg-jevah-accent/10 ring-1 ring-jevah-accent/25"
            : "hover:bg-jevah-card/80"
        }`}
      >
        {index != null && (
          <span
            className={`hidden w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums sm:block ${
              active ? "text-jevah-accent" : "text-jevah-text-muted"
            }`}
          >
            {String(index).padStart(2, "0")}
          </span>
        )}

        <button
          type="button"
          disabled={!url}
          onClick={() => onPlay?.(track)}
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/80 shadow-sm ring-1 ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent disabled:opacity-40 dark:ring-white/10"
          aria-label={
            active && playing ? `Pause ${track.title}` : `Play ${track.title}`
          }
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className={`h-full w-full object-cover transition duration-500 ${
                active && playing ? "scale-110" : "group-hover:scale-105"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f3832] to-[#071317] text-xs font-semibold tracking-widest text-white/80">
              ♪
            </div>
          )}

          <span
            className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 ${
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {active && playing ? (
              <PauseIcon className="h-5 w-5 text-white" />
            ) : (
              <PlayIcon className="h-5 w-5 translate-x-0.5 text-white" />
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold tracking-tight sm:text-[15px] ${
              active ? "text-jevah-accent" : "text-jevah-text"
            }`}
          >
            {track.title}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-jevah-text-muted">
            {artistHref ? (
              <Link
                to={artistHref}
                className="font-medium text-jevah-text hover:text-jevah-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {artist}
              </Link>
            ) : (
              <span className="font-medium text-jevah-text/80">{artist}</span>
            )}

            {fromRelease && <span>· {fromRelease}</span>}

            {track.playCount != null && (
              <span>· {track.playCount.toLocaleString()} plays</span>
            )}

            {showLane && track.lane && (
              <span className="rounded bg-jevah-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jevah-accent">
                {track.lane}
              </span>
            )}

            {status !== "ready" && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {status}
              </span>
            )}
          </div>
        </div>

        {active && playing ? (
          <span className="flex h-3 shrink-0 items-end gap-0.5 pr-1">
            <span className="eq-bar eq-bar-1 w-0.5 rounded-full bg-jevah-accent" />
            <span className="eq-bar eq-bar-2 w-0.5 rounded-full bg-jevah-accent" />
            <span className="eq-bar eq-bar-3 w-0.5 rounded-full bg-jevah-accent" />
          </span>
        ) : (
          <span className="hidden shrink-0 text-[11px] font-medium tabular-nums text-jevah-text-muted sm:inline">
            {dur}
          </span>
        )}

        <span className="sr-only">{id}</span>
      </div>
    </li>
  );
}
