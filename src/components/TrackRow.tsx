import { Link } from "react-router-dom";
import {
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
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
}: {
  track: TrackCard;
  active?: boolean;
  playing?: boolean;
  onPlay?: (track: TrackCard) => void;
  showLane?: boolean;
  artistHref?: string | null;
}) {
  const url = trackPlaybackUrl(track);
  const id = trackId(track);
  const artist = trackArtist(track);
  const dur = formatTrackDuration(trackDuration(track));
  const status = trackProcessing(track);
  const thumb = trackThumb(track);
  const fromRelease = track.release?.title;

  return (
    <li
      className={`group flex items-center gap-3 border-b border-jevah-border/60 px-3 py-3 last:border-0 transition sm:px-4 ${
        active
          ? "bg-jevah-accent/8"
          : "hover:bg-jevah-card/50"
      }`}
    >
      <button
        type="button"
        disabled={!url}
        onClick={() => onPlay?.(track)}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent disabled:opacity-40"
        aria-label={active && playing ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className={`h-full w-full object-cover transition duration-500 ${
              active && playing ? "scale-105" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-jevah-accent/10 text-[10px] font-bold text-jevah-accent">
            ♪
          </div>
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/35 transition ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {active && playing ? (
            <PauseIcon className="h-5 w-5 text-white drop-shadow" />
          ) : (
            <PlayIcon className="h-5 w-5 translate-x-0.5 text-white drop-shadow" />
          )}
        </span>
        {active && playing && (
          <span className="absolute bottom-1 left-1 flex h-1.5 gap-0.5">
            <span className="eq-bar eq-bar-1 w-0.5 rounded-full bg-jevah-accent" />
            <span className="eq-bar eq-bar-2 w-0.5 rounded-full bg-jevah-accent" />
            <span className="eq-bar eq-bar-3 w-0.5 rounded-full bg-jevah-accent" />
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            active ? "text-jevah-accent" : "text-jevah-text"
          }`}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-jevah-text-muted">
          {artistHref ? (
            <Link
              to={artistHref}
              className="hover:text-jevah-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {artist}
            </Link>
          ) : (
            artist
          )}
          {fromRelease ? ` · ${fromRelease}` : ""}
          {dur !== "—" ? ` · ${dur}` : ""}
          {track.playCount != null ? ` · ${track.playCount} plays` : ""}
          {showLane && track.lane ? ` · ${track.lane}` : ""}
          {status !== "ready" ? ` · ${status}` : ""}
        </p>
      </div>

      <span className="sr-only">{id}</span>
    </li>
  );
}
