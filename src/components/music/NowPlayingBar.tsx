import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useLocation } from "react-router-dom";
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
} from "../../lib/media";
import VinylDisc from "./VinylDisc";
import { usePlayer } from "../../context/PlayerContext";
import { MEDIA_PROTECT_ATTRS } from "../../lib/mediaProtection";
import { useMediaProtection } from "../../hooks/useMediaProtection";

const MIN_W = 72;
const MIN_H = 72;
const DEFAULT_W = 300;
const DEFAULT_H = 360;

function formatClock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SeekRail({
  progressPct,
  seeking: _seeking,
  onSeeking,
  onSeek,
  tall,
}: {
  progressPct: number;
  seeking: boolean;
  onSeeking: (v: boolean) => void;
  onSeek: (pct: number) => void;
  tall?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border ${
        tall ? "h-2" : "h-1.5"
      }`}
    >
      <div
        className="h-full rounded-full bg-jevah-accent"
        style={{ width: `${progressPct}%` }}
      />
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progressPct}
        aria-label="Move through the song"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onMouseDown={() => onSeeking(true)}
        onTouchStart={() => onSeeking(true)}
        onMouseUp={(e) => {
          onSeek(Number(e.currentTarget.value));
          onSeeking(false);
        }}
        onTouchEnd={(e) => {
          onSeek(Number(e.currentTarget.value));
          onSeeking(false);
        }}
        onChange={(e) => {
          onSeek(Number(e.target.value));
        }}
      />
    </div>
  );
}

/**
 * One player for the whole site.
 * Bar = strip at the bottom.
 * Window = a box you can drag and resize, like a computer window.
 * Full = large player over the page.
 */
export default function NowPlayingBar() {
  const {
    track,
    queue,
    shelfLabel,
    size,
    setTrack: onTrackChange,
    setPlaying: onPlayingChange,
    setSize,
    close: onClose,
  } = usePlayer();
  const location = useLocation();
  const onBible = location.pathname.startsWith("/bible");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [winPos, setWinPos] = useState<{ x: number; y: number } | null>(null);
  const [winSize, setWinSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H });
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showResizeTip, setShowResizeTip] = useState(true);
  const [hoverResize, setHoverResize] = useState(false);

  useEffect(() => {
    if (onBible && track && size === "bar") setSize("window");
  }, [onBible, track, size, setSize]);

  useEffect(() => {
    if (size !== "window") return;
    setShowResizeTip(true);
    const t = window.setTimeout(() => setShowResizeTip(false), 6000);
    return () => window.clearTimeout(t);
  }, [size]);

  const url = track ? trackPlaybackUrl(track) : null;
  const metaDur = track ? trackDuration(track) : null;
  const displayDur = duration || metaDur || 0;

  useMediaProtection(audioRef, undefined, url, Boolean(url));

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
    if (!queue.length) return;
    const next = queue[index];
    if (next) onTrackChange(next);
  }

  function playNext() {
    if (!track || !queue.length) {
      setPlaying(false);
      return;
    }
    if (isShuffle) {
      playAt(Math.floor(Math.random() * queue.length));
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
    if (!track || !queue.length) return;
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

  function onSeekPct(value: number) {
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

  function windowBox() {
    const x = winPos?.x ?? Math.max(12, window.innerWidth - winSize.w - 20);
    const y =
      winPos?.y ??
      Math.max(72, window.innerHeight - winSize.h - (onBible ? 160 : 24));
    return { x, y };
  }

  function restoreWindowSize() {
    setWinSize({ w: DEFAULT_W, h: DEFAULT_H });
    setSize("window");
  }

  function onDragDown(e: PointerEvent<HTMLDivElement>) {
    if (resizing.current) return;
    if ((e.target as HTMLElement).closest("button, input, [data-resize]")) return;
    dragging.current = false;
    const box = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - box.left, y: e.clientY - box.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onDragMove(e: PointerEvent<HTMLDivElement>) {
    if (resizing.current) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) dragging.current = true;
    setWinPos({
      x: Math.max(8, Math.min(window.innerWidth - winSize.w - 8, e.clientX - dragOffset.current.x)),
      y: Math.max(56, Math.min(window.innerHeight - winSize.h - 8, e.clientY - dragOffset.current.y)),
    });
  }

  function onDragUp() {
    window.setTimeout(() => {
      dragging.current = false;
    }, 0);
  }

  function onResizeDown(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = true;
    setShowResizeTip(false);
    setHoverResize(false);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: winSize.w, h: winSize.h };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function applyResize(clientX: number, clientY: number) {
    const { x, y } = windowBox();
    const nextW = resizeStart.current.w + (clientX - resizeStart.current.x);
    const nextH = resizeStart.current.h + (clientY - resizeStart.current.y);
    setWinSize({
      w: Math.max(MIN_W, Math.min(window.innerWidth - x - 8, nextW)),
      h: Math.max(MIN_H, Math.min(window.innerHeight - y - 8, nextH)),
    });
  }

  function onResizeMove(e: PointerEvent<HTMLDivElement>) {
    if (!resizing.current) return;
    applyResize(e.clientX, e.clientY);
  }

  function onResizeUp() {
    resizing.current = false;
  }

  if (!track || !url) return null;

  const progressPct = displayDur > 0 ? (current / displayDur) * 100 : 0;
  const artist = trackArtist(track);
  const box = typeof window !== "undefined" ? windowBox() : { x: 12, y: 72 };
  const compact = winSize.w < 220 || winSize.h < 180;
  const tiny = winSize.w < 120 || winSize.h < 120;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        controlsList={MEDIA_PROTECT_ATTRS.controlsList}
        draggable={false}
      >
        <track kind="captions" />
      </audio>

      {size === "window" && (
        <div
          className="fixed z-[92] flex touch-none flex-col overflow-visible rounded-2xl border border-jevah-border bg-jevah-surface shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
          style={{ left: box.x, top: box.y, width: winSize.w, height: winSize.h }}
          onPointerDown={onDragDown}
          onPointerMove={onDragMove}
          onPointerUp={onDragUp}
          onPointerCancel={onDragUp}
        >
          {tiny && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 rounded-2xl bg-jevah-surface/95 p-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreWindowSize();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-jevah-accent text-white shadow-md"
                aria-label="Expand now playing"
                title="Expand now playing"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-jevah-card text-jevah-text ring-1 ring-jevah-border"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <PauseIcon className="h-3.5 w-3.5" />
                ) : (
                  <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
                )}
              </button>
            </div>
          )}
          {!tiny && (
            <div
              className={`flex shrink-0 items-center justify-between gap-1 border-b border-jevah-border bg-jevah-card/70 ${
                compact ? "px-1.5 py-1" : "px-3 py-2"
              }`}
            >
              {!compact && (
                <p className="min-w-0 truncate text-xs font-bold text-jevah-text">
                  Now playing
                </p>
              )}
              <div className={`flex shrink-0 items-center gap-1 ${compact ? "ml-auto" : ""}`}>
                <button
                  type="button"
                  onClick={() => setSize("full")}
                  className={`rounded-full bg-jevah-accent font-bold text-white ${
                    compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
                  }`}
                >
                  Large
                </button>
                {!compact && (
                  <button
                    type="button"
                    onClick={() => setSize("bar")}
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold text-jevah-text hover:bg-jevah-elevated"
                  >
                    Bottom bar
                  </button>
                )}
                {compact && (
                  <button
                    type="button"
                    onClick={restoreWindowSize}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-jevah-accent hover:bg-jevah-elevated"
                    title="Restore default size"
                  >
                    Expand
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-jevah-text-muted hover:bg-jevah-elevated hover:text-jevah-text"
                  aria-label="Stop and close"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div
            className={`flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden ${
              tiny ? "gap-0 p-1" : compact ? "gap-1.5 px-2 py-1.5" : "gap-3 px-4 py-3"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (dragging.current) return;
                toggle();
              }}
              className="relative"
              aria-label={playing ? "Pause" : "Play"}
            >
              <VinylDisc
                track={track}
                playing={playing}
                size={
                  winSize.w >= 360 && winSize.h >= 420
                    ? "lg"
                    : tiny
                      ? "sm"
                      : compact
                        ? "sm"
                        : "md"
                }
                className={tiny ? "!h-10 !w-10" : undefined}
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25 text-white">
                {playing ? (
                  <PauseIcon className={tiny ? "h-3.5 w-3.5" : "h-5 w-5"} />
                ) : (
                  <PlayIcon className={tiny ? "h-3.5 w-3.5 translate-x-px" : "h-5 w-5 translate-x-px"} />
                )}
              </span>
            </button>
            {!tiny && !compact && (
              <div className="w-full min-w-0 text-center">
                <p className="truncate text-sm font-bold text-jevah-text">{track.title}</p>
                <p className="truncate text-xs text-jevah-text-muted">{artist}</p>
              </div>
            )}
            {compact && !tiny && winSize.h >= 148 && (
              <p className="w-full truncate text-center text-[11px] font-bold text-jevah-text">
                {track.title}
              </p>
            )}
            {winSize.h >= 280 && winSize.w >= 220 && (
              <div className="w-full space-y-1">
                <SeekRail
                  progressPct={progressPct}
                  seeking={seeking}
                  onSeeking={setSeeking}
                  onSeek={onSeekPct}
                />
                <div className="flex justify-between text-[10px] font-semibold tabular-nums text-jevah-text-muted">
                  <span>{formatClock(current)}</span>
                  <span>
                    {displayDur ? formatClock(displayDur) : formatTrackDuration(metaDur)}
                  </span>
                </div>
              </div>
            )}
            {winSize.h >= 320 && winSize.w >= 240 && (
              <p className="text-center text-[10px] leading-snug text-jevah-text-muted">
                Drag the top to move. Pull the corner to make this bigger or smaller.
              </p>
            )}
          </div>

          <div
            data-resize
            className="absolute bottom-0 right-0 flex h-10 w-10 cursor-nwse-resize items-end justify-end p-1.5"
            onPointerDown={onResizeDown}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
            onPointerEnter={() => setHoverResize(true)}
            onPointerLeave={() => setHoverResize(false)}
            title="Drag this corner to make the window smaller or larger"
            aria-label="Drag this corner to make the window smaller or larger"
            role="slider"
            aria-valuetext={`${Math.round(winSize.w)} by ${Math.round(winSize.h)}`}
          >
            {!tiny && (showResizeTip || hoverResize) && (
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-9 right-1 z-10 w-[11.5rem] rounded-lg bg-jevah-text px-2.5 py-2 text-left text-[11px] font-semibold leading-snug text-jevah-surface shadow-lg"
              >
                Drag this corner to make the window smaller or larger.
                <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 bg-jevah-text" />
              </div>
            )}
            <span className="h-3.5 w-3.5 border-b-2 border-r-2 border-jevah-accent" />
          </div>
        </div>
      )}

      {size === "bar" && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] xs:px-3 sm:px-6"
          role="region"
          aria-label="Now playing"
        >
          <div className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-jevah-border bg-jevah-elevated text-jevah-text shadow-[0_-8px_32px_rgba(0,0,0,0.28)]">
            <SeekRail
              progressPct={progressPct}
              seeking={seeking}
              onSeeking={setSeeking}
              onSeek={onSeekPct}
            />

            <div className="flex items-center gap-2 px-2 py-2 xs:gap-3 xs:px-3 xs:py-3 sm:gap-4 sm:px-4">
              <button
                type="button"
                onClick={() => setSize("full")}
                className="shrink-0"
                title="Open the large player"
              >
                <VinylDisc track={track} playing={playing} size="sm" />
              </button>

              <button
                type="button"
                onClick={() => setSize("full")}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-black text-jevah-text sm:text-base">
                  {track.title}
                </p>
                <p className="truncate text-xs font-semibold text-jevah-text">
                  {artist}
                  {track.release?.title ? ` · ${track.release.title}` : ""}
                  {shelfLabel ? ` · ${shelfLabel}` : ""}
                </p>
                <p className="mt-0.5 tabular-nums text-xs font-bold text-jevah-text">
                  {formatClock(current)}
                  <span className="mx-1 text-jevah-text/60">/</span>
                  {displayDur ? formatClock(displayDur) : formatTrackDuration(metaDur)}
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-0.5 xs:gap-1 sm:gap-2">
                <button
                  type="button"
                  aria-label="Previous song"
                  onClick={playPrev}
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-jevah-text hover:bg-jevah-card min-[380px]:inline-flex"
                >
                  <BackwardIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={toggle}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-jevah-accent text-white shadow-lg shadow-jevah-accent/30 xs:h-11 xs:w-11"
                >
                  {playing ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5 translate-x-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Next song"
                  onClick={playNext}
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-jevah-text hover:bg-jevah-card min-[380px]:inline-flex"
                >
                  <ForwardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-jevah-border bg-jevah-card px-3 py-2">
              <button
                type="button"
                onClick={restoreWindowSize}
                className="rounded-full border border-jevah-border bg-jevah-elevated px-3 py-1.5 text-[11px] font-bold text-jevah-text hover:bg-jevah-surface"
              >
                Now playing
              </button>
              <button
                type="button"
                onClick={() => setSize("full")}
                className="inline-flex items-center gap-1 rounded-full bg-jevah-accent px-3 py-1.5 text-[11px] font-bold text-white"
              >
                <ArrowsPointingOutIcon className="h-3.5 w-3.5" />
                Large player
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-jevah-border bg-jevah-elevated px-3 py-1.5 text-[11px] font-bold text-jevah-text hover:bg-jevah-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {size === "full" && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-jevah-bg p-3 text-jevah-text xs:p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-2 xs:gap-3">
            <button
              type="button"
              onClick={() => {
                restoreWindowSize();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-card px-4 py-2 text-xs font-semibold text-jevah-text hover:bg-jevah-elevated"
            >
              <ChevronDownIcon className="h-4 w-4" />
              Now playing
            </button>

            <span className="inline-flex items-center rounded-full border border-jevah-accent/30 bg-jevah-accent/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-jevah-accent">
              {shelfLabel || "Now playing"}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text hover:bg-jevah-elevated"
              aria-label="Stop and close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
            <div className="relative my-4">
              <div className="absolute inset-0 scale-110 rounded-full bg-jevah-accent/25 blur-3xl" />
              <VinylDisc track={track} playing={playing} size="xl" />
            </div>
            <h2 className="mt-6 max-w-xl truncate font-sans text-2xl font-semibold tracking-tight sm:text-4xl">
              {track.title}
            </h2>
            <p className="mt-2 text-sm font-medium sm:text-base">
              {artist}
              {track.release?.title ? ` · ${track.release.title}` : ""}
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl space-y-6 pb-4">
            <div className="space-y-2">
              <SeekRail
                progressPct={progressPct}
                seeking={seeking}
                onSeeking={setSeeking}
                onSeek={onSeekPct}
                tall
              />
              <div className="flex items-center justify-between text-xs font-semibold tabular-nums">
                <span>{formatClock(current)}</span>
                <span>
                  {displayDur ? formatClock(displayDur) : formatTrackDuration(metaDur)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isShuffle
                    ? "bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/40"
                    : "text-jevah-text hover:bg-jevah-card"
                }`}
                title="Shuffle songs"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={rewind10}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text hover:bg-jevah-elevated"
                title="Go back 10 seconds"
              >
                <span className="flex items-center text-[11px] font-semibold">
                  <ArrowUturnLeftIcon className="mr-0.5 h-4 w-4" />
                  10s
                </span>
              </button>
              <button
                type="button"
                onClick={playPrev}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-card text-jevah-text hover:bg-jevah-elevated"
                title="Previous song"
              >
                <BackwardIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={toggle}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-jevah-accent text-white shadow-lg shadow-jevah-accent/30 ring-4 ring-jevah-accent/20"
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-card text-jevah-text hover:bg-jevah-elevated"
                title="Next song"
              >
                <ForwardIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={fastForward10}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-jevah-border bg-jevah-card text-jevah-text hover:bg-jevah-elevated"
                title="Skip ahead 10 seconds"
              >
                <span className="flex items-center text-[11px] font-semibold">
                  10s
                  <ArrowUturnRightIcon className="ml-0.5 h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isRepeat
                    ? "bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/40"
                    : "text-jevah-text hover:bg-jevah-card"
                }`}
                title="Repeat this song"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-jevah-text hover:text-jevah-accent"
                title={muted ? "Turn sound on" : "Mute"}
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
              <span className="w-8 text-xs font-semibold tabular-nums">
                {muted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
