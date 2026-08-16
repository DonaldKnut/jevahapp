import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import VinylDisc from "./VinylDisc";
import {
  formatTrackDuration,
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackThumb,
  type TrackCard,
} from "../../lib/media";

export function MusicSalon({
  tracks,
  active,
  playing,
  onPlay,
}: {
  tracks: TrackCard[];
  active: TrackCard | null;
  playing: boolean;
  onPlay: (track: TrackCard) => void;
}) {
  const featured = active ?? tracks[0] ?? null;
  const featuredId = featured ? trackId(featured) : null;
  const featuredPlaying = Boolean(active && featuredId && playing);
  const thumb = featured ? trackThumb(featured) : null;
  const artist = featured ? trackArtist(featured) : "";
  const dur = featured ? formatTrackDuration(trackDuration(featured)) : "—";
  const canPlay = featured ? Boolean(trackPlaybackUrl(featured)) : false;
  const meta = featured
    ? [featured.category, featured.genre].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-jevah-border/70 shadow-[0_20px_60px_var(--jevah-shadow)]">
      <div className="music-salon-stage relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-10">
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="pointer-events-none absolute -left-16 -top-24 h-80 w-80 rounded-full object-cover opacity-25 blur-3xl"
          />
        )}

        <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jevah-accent">
            Now on the platter
          </p>

          <button
            type="button"
            disabled={!canPlay}
            onClick={() => featured && onPlay(featured)}
            className="mt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent focus-visible:ring-offset-4 focus-visible:ring-offset-transparent disabled:opacity-40"
            aria-label={
              featured
                ? featuredPlaying
                  ? `Pause ${featured.title}`
                  : `Play ${featured.title}`
                : "No track"
            }
          >
            <VinylDisc
              track={featured}
              playing={featuredPlaying}
              size="xl"
              className="drop-shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
            />
          </button>

          {featured && (
            <div className="mt-7 max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight text-jevah-text sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-jevah-text-muted">
                {artist}
                {meta ? ` · ${meta}` : ""}
                {dur !== "—" ? ` · ${dur}` : ""}
              </p>
              <button
                type="button"
                disabled={!canPlay}
                onClick={() => onPlay(featured)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-jevah-text px-5 py-2.5 text-sm font-semibold text-jevah-surface shadow-md transition hover:opacity-90 disabled:opacity-40"
              >
                {featuredPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4 translate-x-px" />
                )}
                {featuredPlaying ? "Pause" : active ? "Play this" : "Begin listening"}
              </button>
            </div>
          )}
        </div>

        <ol className="relative max-h-[28rem] space-y-1 overflow-y-auto pr-1 lg:max-h-[32rem]">
          {tracks.map((track, i) => {
            const id = trackId(track);
            const isActive = featuredId === id && Boolean(active);
            const url = trackPlaybackUrl(track);
            const rowDur = formatTrackDuration(trackDuration(track));

            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!url}
                  onClick={() => onPlay(track)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition disabled:opacity-40 ${
                    isActive
                      ? "bg-jevah-accent/12 ring-1 ring-jevah-accent/30"
                      : "hover:bg-jevah-card/80"
                  }`}
                >
                  <span
                    className={`w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums ${
                      isActive ? "text-jevah-accent" : "text-jevah-text-muted"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        isActive ? "text-jevah-accent" : "text-jevah-text"
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-xs text-jevah-text-muted">
                      {trackArtist(track)}
                    </span>
                  </span>
                  {isActive && playing ? (
                    <span className="flex h-3 items-end gap-0.5">
                      <span className="eq-bar eq-bar-1 w-0.5 rounded-full bg-jevah-accent" />
                      <span className="eq-bar eq-bar-2 w-0.5 rounded-full bg-jevah-accent" />
                      <span className="eq-bar eq-bar-3 w-0.5 rounded-full bg-jevah-accent" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium tabular-nums text-jevah-text-muted">
                      {rowDur}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
