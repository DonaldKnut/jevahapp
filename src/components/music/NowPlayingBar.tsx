import { useEffect, useRef, useState } from "react";
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BackwardIcon,
  ChevronDownIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
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
 * Docked & Expandable Spotify-like now playing bar with full-screen player modal.
 * Shared across Copyright-free, Artists shelves, and Creator Studio.
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
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

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
    const onEnded = () => {
      if (isRepeat && el) {
        el.currentTime = 0;
        void el.play();
      } else {
        playNext();
      }
    };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeking, queue, track, isRepeat]);

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
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      playAt(randomIdx);
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

  function rewind10() {
    const el = audioRef.current;
    if (!el) return;
    const t = Math.max(0, el.currentTime - 10);
    el.currentTime = t;
    setCurrent(t);
  }

  function fastForward10() {
    const el = audioRef.current;
    if (!el || !displayDur) return;
    const t = Math.min(displayDur, el.currentTime + 10);
    el.currentTime = t;
    setCurrent(t);
  }

  function onSeek(value: number) {
    const el = audioRef.current;
    if (!el || !displayDur) return;
    const t = (value / 100) * displayDur;
    el.currentTime = t;
    setCurrent(t);
  }

  function handleVolumeChange(v: number) {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;
    const nextMuted = !muted;
    audioRef.current.muted = nextMuted;
    setMuted(nextMuted);
  }

  if (!track || !url) return null;

  const progressPct = displayDur > 0 ? (current / displayDur) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" className="hidden">
        <track kind="captions" />
      </audio>

      {/* DOCKED BOTTOM PLAYER BAR */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
        role="region"
        aria-label="Now playing"
      >
        <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-jevah-border/80 bg-jevah-surface/95 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300">
          {/* Progress Bar Header */}
          <div className="relative h-1.5 w-full bg-jevah-card/80">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-jevah-accent via-emerald-500 to-teal-400 transition-[width] duration-150"
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
            {/* Clickable Vinyl Disc to Expand Full Player */}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="group relative transition hover:scale-105"
              title="Expand Player View"
            >
              <VinylDisc track={track} playing={playing} size="md" />
            </button>

            {/* Clickable Track Details to Expand Full Player */}
            <div
              onClick={() => setExpanded(true)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <p className="truncate text-sm font-black text-jevah-text sm:text-base hover:text-jevah-accent transition">
                {track.title}
              </p>
              <p className="truncate text-xs font-medium text-jevah-text-muted">
                {trackArtist(track)}
                {track.release?.title ? ` · ${track.release.title}` : ""}
                {shelfLabel ? ` · ${shelfLabel}` : ""}
              </p>
              <p
                className={`mt-0.5 tabular-nums text-xs font-semibold ${
                  seeking ? "text-jevah-accent" : "text-jevah-text"
                }`}
              >
                {formatClock(current)}
                <span className="mx-1 text-jevah-text-muted">/</span>
                {displayDur
                  ? formatClock(displayDur)
                  : formatTrackDuration(metaDur)}
              </p>
            </div>

            {/* Control Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Previous"
                onClick={playPrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
              >
                <BackwardIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                onClick={toggle}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent to-emerald-600 text-white shadow-lg shadow-jevah-accent/30 transition hover:scale-105 active:scale-95"
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
                <ForwardIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                aria-label="Expand Full Player"
                onClick={() => setExpanded(true)}
                className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text"
                title="Expand Full Player"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
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

      {/* FULL-SCREEN / LARGE MODAL AUDIO PLAYER DRAWER */}
      {expanded && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-jevah-bg p-6 text-jevah-text sm:p-10">
          {/* Top Sheet Header */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-card px-4 py-2 text-xs font-semibold text-jevah-text transition hover:bg-jevah-elevated"
            >
              <ChevronDownIcon className="h-4 w-4" />
              <span>Minimize</span>
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-jevah-accent/30 bg-jevah-accent/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-jevah-accent">
              {shelfLabel || "Gospel audio"}
            </span>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  onClose();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text transition hover:bg-jevah-elevated"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Center Vinyl & Artwork Spotlight */}
          <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-6 h-1.5 w-12 rounded-full bg-jevah-border sm:hidden" />

            <div className="group relative my-4">
              <div className="absolute inset-0 scale-110 rounded-full bg-jevah-accent/25 blur-3xl" />
              <VinylDisc track={track} playing={playing} size="xl" />
            </div>

            <h2 className="mt-6 max-w-xl truncate font-sans text-2xl font-semibold tracking-tight text-jevah-text sm:text-4xl">
              {track.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-jevah-text sm:text-base">
              {trackArtist(track)}
              {track.release?.title ? ` · ${track.release.title}` : ""}
            </p>
          </div>

          {/* Bottom Timeline Scrubber & Complete Player Suite */}
          <div className="mx-auto w-full max-w-2xl space-y-6 pb-4">
            <div className="space-y-2">
              <div className="relative pt-7">
                {seeking && (
                  <span
                    className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md bg-jevah-text px-2 py-0.5 text-[11px] font-semibold tabular-nums text-jevah-surface shadow-md"
                    style={{ left: `${Math.min(96, Math.max(4, progressPct))}%` }}
                  >
                    {formatClock(current)}
                  </span>
                )}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border">
                  <div
                    className="h-full rounded-full bg-jevah-accent transition-all duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={progressPct}
                    aria-label="Seek Timeline"
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
              </div>

              <div className="flex items-center justify-between text-xs font-semibold tabular-nums text-jevah-text">
                <span>{formatClock(current)}</span>
                <span>
                  {displayDur
                    ? formatClock(displayDur)
                    : formatTrackDuration(metaDur)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isShuffle
                    ? "bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/40"
                    : "text-jevah-text hover:bg-jevah-card"
                }`}
                title="Toggle Shuffle"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={rewind10}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text transition hover:bg-jevah-elevated active:scale-95"
                title="Rewind 10 Seconds"
              >
                <span className="flex items-center text-[11px] font-semibold">
                  <ArrowUturnLeftIcon className="mr-0.5 h-4 w-4" />
                  10s
                </span>
              </button>

              <button
                type="button"
                onClick={playPrev}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-card text-jevah-text transition hover:bg-jevah-elevated active:scale-95"
                title="Previous Track"
              >
                <BackwardIcon className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={toggle}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-jevah-accent text-white shadow-lg shadow-jevah-accent/30 ring-4 ring-jevah-accent/20 transition hover:scale-105 active:scale-95"
                title={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8 translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-card text-jevah-text transition hover:bg-jevah-elevated active:scale-95"
                title="Next Track"
              >
                <ForwardIcon className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={fastForward10}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text transition hover:bg-jevah-elevated active:scale-95"
                title="Fast Forward 10 Seconds"
              >
                <span className="flex items-center text-[11px] font-semibold">
                  10s
                  <ArrowUturnRightIcon className="ml-0.5 h-4 w-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isRepeat
                    ? "bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/40"
                    : "text-jevah-text hover:bg-jevah-card"
                }`}
                title="Toggle Repeat"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-jevah-text transition hover:text-jevah-accent"
              >
                {muted || volume === 0 ? (
                  <SpeakerXMarkIcon className="h-5 w-5 text-rose-500" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5 text-jevah-accent" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                aria-label="Volume"
                className="h-1.5 w-36 cursor-pointer rounded-lg bg-jevah-card accent-jevah-accent"
              />
              <span className="w-8 text-xs font-semibold tabular-nums text-jevah-text">
                {muted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

