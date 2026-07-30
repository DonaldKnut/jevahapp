import { Link } from "react-router-dom";
import {
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackProcessing,
  formatTrackDuration,
  type TrackCard,
} from "../lib/media";

export function TrackRow({
  track,
  active,
  onPlay,
  showLane,
  artistHref,
}: {
  track: TrackCard;
  active?: boolean;
  onPlay?: (track: TrackCard) => void;
  showLane?: boolean;
  artistHref?: string | null;
}) {
  const url = trackPlaybackUrl(track);
  const id = trackId(track);
  const artist = trackArtist(track);
  const dur = formatTrackDuration(trackDuration(track));
  const status = trackProcessing(track);

  return (
    <li
      className={`flex items-start gap-3 border-b border-slate-100 px-3 py-3 last:border-0 sm:px-4 ${
        active ? "bg-[#256E63]/5" : ""
      }`}
    >
      {track.thumbnailUrl ? (
        <img
          src={track.thumbnailUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#256E63]/10 text-[10px] font-bold text-[#256E63]">
          ♪
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#0B1A1F]">{track.title}</p>
        <p className="truncate text-xs text-slate-500">
          {artistHref ? (
            <Link to={artistHref} className="hover:text-[#256E63] hover:underline">
              {artist}
            </Link>
          ) : (
            artist
          )}
          {dur !== "—" ? ` · ${dur}` : ""}
          {track.playCount != null ? ` · ${track.playCount} plays` : ""}
          {showLane && track.lane ? ` · ${track.lane}` : ""}
          {status !== "ready" ? ` · ${status}` : ""}
        </p>
        {active && url && (
          <audio
            autoPlay
            controls
            className="mt-2 w-full max-w-md"
            src={url}
            onEnded={() => onPlay?.(track)}
          >
            <track kind="captions" />
          </audio>
        )}
      </div>
      {url && (
        <button
          type="button"
          onClick={() => onPlay?.(track)}
          className="shrink-0 rounded-full bg-[#256E63] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e5a52]"
        >
          {active ? "Playing" : "Play"}
        </button>
      )}
      <span className="sr-only">{id}</span>
    </li>
  );
}
