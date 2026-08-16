import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import {
  formatTrackDuration,
  trackArtist,
  trackDuration,
  trackPlaybackUrl,
  trackThumb,
  type TrackCard,
} from "../../lib/media";

export function TrackCover({
  track,
  active,
  playing,
  onPlay,
}: {
  track: TrackCard;
  active?: boolean;
  playing?: boolean;
  onPlay?: (track: TrackCard) => void;
}) {
  const url = trackPlaybackUrl(track);
  const artist = trackArtist(track);
  const thumb = trackThumb(track);
  const dur = formatTrackDuration(trackDuration(track));
  const meta = [track.category, track.genre].filter(Boolean).join(" · ");

  return (
    <li className="group min-w-0">
      <button
        type="button"
        disabled={!url}
        onClick={() => onPlay?.(track)}
        aria-label={
          active && playing ? `Pause ${track.title}` : `Play ${track.title}`
        }
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jevah-bg disabled:opacity-40"
      >
        <div
          className={`relative aspect-square overflow-hidden rounded-2xl bg-jevah-elevated shadow-[0_12px_40px_var(--jevah-shadow)] ring-1 transition duration-300 ${
            active
              ? "ring-jevah-accent/70 shadow-[0_16px_48px_rgba(37,110,99,0.28)]"
              : "ring-black/10 group-hover:-translate-y-1 group-hover:shadow-[0_20px_50px_var(--jevah-shadow)] dark:ring-white/10"
          }`}
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className={`h-full w-full object-cover transition duration-700 ${
                active && playing ? "scale-105" : "group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f3832] via-[#123c36] to-[#071317] text-white/80">
              <span className="text-[11px] font-semibold tracking-[0.35em]">
                JEVAH
              </span>
            </div>
          )}

          <span className="music-cover-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <span
            className={`absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity ${
              active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          />

          <span
            className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0b1a1f] shadow-lg transition duration-300 ${
              active
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            }`}
          >
            {active && playing ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5 translate-x-px" />
            )}
          </span>

          {dur !== "—" && (
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-wide text-white backdrop-blur-md">
              {dur}
            </span>
          )}

          {active && playing && (
            <span className="absolute bottom-3 left-3 flex h-3 items-end gap-0.5">
              <span className="eq-bar eq-bar-1 w-0.5 rounded-full bg-white" />
              <span className="eq-bar eq-bar-2 w-0.5 rounded-full bg-white" />
              <span className="eq-bar eq-bar-3 w-0.5 rounded-full bg-white" />
            </span>
          )}
        </div>

        <div className="mt-3 px-0.5">
          <p
            className={`truncate text-sm font-semibold tracking-tight ${
              active ? "text-jevah-accent" : "text-jevah-text"
            }`}
          >
            {track.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-jevah-text-muted">
            {artist}
            {meta ? ` · ${meta}` : ""}
          </p>
        </div>
      </button>
    </li>
  );
}
