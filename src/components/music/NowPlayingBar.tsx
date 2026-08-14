import { useEffect, useRef, useState } from "react";
import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  formatTrackDuration,
  trackArtist,
  trackDuration,
  trackPlaybackUrl,
  type TrackCard,
} from "../../lib/media";
import VinylDisc from "./VinylDisc";

function formatClock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  track: TrackCard | null;
  queue?: TrackCard[];
  onTrackChange?: (track: TrackCard | null) => void;
  onPlayingChange?: (playing: boolean) => void;
  onClose?: () => void;
  /** Lane label under title, e.g. Copyright-free / Artists */
  shelfLabel?: string;
};

/**
 * Docked Spotify-like now playing bar with rolling vinyl artwork.
 * Shared by Copyright-free and Artists shelves.
 */
export default function NowPlayingBar({
  track,
  queue = [],
  onTrackChange,
  onPlayingChange,
  onClose,
  shelfLabel,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const url = track ? trackPlaybackUrl(track) : null;
  const metaDur = track ? trackDuration(track) : null;
  const displayDur = duration || metaDur || 0;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;
    el.src = url;
    el.load();
    const p = el.play();
    if (p) {
      void p
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
    setCurrent(0);
    return () => {
      el.pause();
    };
  }, [url, track?.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      if (!seeking) setCurrent(el.currentTime);
    };
    const onMeta = () => setDuration(el.duration || 0);
    const onEnded = () => playNext();
    const onPlay = () => {
      setPlaying(true);
      onPlayingChange?.(true);
    };
    const onPause = () => {
      setPlaying(false);
      onPlayingChange?.(false);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queue identity via playNext closure refresh
  }, [seeking, queue, track]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  function playAt(index: number) {
    if (!queue.length || !onTrackChange) return;
    const next = queue[index];
    if (next) onTrackChange(next);
  }

  function playNext() {
    if (!track || !queue.length || !onTrackChange) {
      setPlaying(false);
      return;
    }
    const idx = queue.findIndex((t) => (t.id || t._id) === (track.id || track._id));
    if (idx >= 0 && idx < queue.length - 1) playAt(idx + 1);
    else {
      setPlaying(false);
      onTrackChange(null);
    }
  }

  function playPrev() {
    if (!track || !queue.length || !onTrackChange) return;
    const el = audioRef.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    const idx = queue.findIndex((t) => (t.id || t._id) === (track.id || track._id));
    if (idx > 0) playAt(idx - 1);
  }

  function onSeek(value: number) {
    const el = audioRef.current;
    if (!el || !displayDur) return;
    const t = (value / 100) * displayDur;
    el.currentTime = t;
    setCurrent(t);
  }

  if (!track || !url) return null;

  const progressPct = displayDur > 0 ? (current / displayDur) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" className="hidden">
        <track kind="captions" />
      </audio>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
        role="region"
        aria-label="Now playing"
      >
        <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-jevah-border/80 bg-jevah-surface/95 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {/* Progress */}
          <div className="relative h-1 w-full bg-jevah-card">
            <div
              className="absolute inset-y-0 left-0 bg-jevah-accent transition-[width] duration-150"
              style={{ width: `${progressPct}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPct}
              aria-label="Seek"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onMouseDown={() => setSeeking(true)}
              onTouchStart={() => setSeeking(true)}
              onMouseUp={(e) => {
                onSeek(Number(e.currentTarget.value));
                setSeeking(false);
              }}
              onTouchEnd={(e) => {
                onSeek(Number(e.currentTarget.value));
                setSeeking(false);
              }}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (seeking) {
                  setCurrent((v / 100) * displayDur);
                } else {
                  onSeek(v);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
            <VinylDisc track={track} playing={playing} size="md" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-jevah-text sm:text-base">
                {track.title}
              </p>
              <p className="truncate text-xs text-jevah-text-muted">
                {trackArtist(track)}
                {track.release?.title ? ` · ${track.release.title}` : ""}
                {shelfLabel ? ` · ${shelfLabel}` : ""}
              </p>
              <p className="mt-0.5 tabular-nums text-[10px] text-jevah-text-muted">
                {formatClock(current)}
                <span className="mx-1 opacity-40">/</span>
                {displayDur
                  ? formatClock(displayDur)
                  : formatTrackDuration(metaDur)}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Previous"
                onClick={playPrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
              >
                <BackwardIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                onClick={toggle}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-jevah-accent text-white shadow-md shadow-jevah-accent/30 transition hover:scale-105 hover:bg-jevah-accent-hover active:scale-95"
              >
                {playing ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5 translate-x-0.5" />
                )}
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={playNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
              >
                <ForwardIcon className="h-5 w-5" />
              </button>
              {onClose && (
                <button
                  type="button"
                  aria-label="Close player"
                  onClick={onClose}
                  className="ml-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
