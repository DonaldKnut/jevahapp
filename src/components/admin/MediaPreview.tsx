import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { AdminMediaCard } from "../../types/admin";
import {
  isProcessingPreview,
  isSignedUrl,
  mediaThumbUrl,
  resolveAdminPlayable,
} from "../../lib/media";
import { cn } from "./ui";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BackwardIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  MEDIA_PROTECT_ATTRS,
  blockMediaContextMenu,
  blockMediaDrag,
} from "../../lib/mediaProtection";

function formatClock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const SPEEDS = [1, 1.5, 2, 0.75];

export default function MediaPreview({
  media,
  compact = false,
  onPlaybackError,
  autoPlay = false,
  showControls = true,
}: {
  media: AdminMediaCard;
  compact?: boolean;
  onPlaybackError?: () => void | Promise<unknown>;
  autoPlay?: boolean;
  showControls?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number>(0);
  const refreshTried = useRef(false);
  const seekRailRef = useRef<HTMLDivElement | null>(null);
  const draggingSeek = useRef(false);

  const playable = resolveAdminPlayable(media);
  const thumb = mediaThumbUrl(media);
  const processing = isProcessingPreview(media);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPct, setBufferedPct] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [seekPct, setSeekPct] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [staleSigned, setStaleSigned] = useState(false);
  const [posterBroken, setPosterBroken] = useState(false);
  const [chrome, setChrome] = useState(true);

  const url = playable.url;
  const kind = playable.kind;
  const html5Video = kind === "video" && url && !playable.useHlsJs;
  const html5Audio = kind === "audio" && url;

  const mediaEl = () => videoRef.current || audioRef.current;

  function revealChrome() {
    setChrome(true);
    window.clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = window.setTimeout(() => setChrome(false), 2400);
    }
  }

  async function handleMediaError() {
    setIsPlaying(false);
    if (!refreshTried.current) {
      refreshTried.current = true;
      await onPlaybackError?.();
      return;
    }
    setFailed(true);
    if (isSignedUrl(url) && !media.preview?.signed) {
      setStaleSigned(true);
    }
  }

  async function play() {
    const el = mediaEl();
    if (!el || !url) return;
    try {
      await el.play();
      setIsPlaying(true);
      setFailed(false);
    } catch (err) {
      setIsPlaying(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") return;
      await handleMediaError();
    }
  }

  function pause() {
    mediaEl()?.pause();
    setIsPlaying(false);
    setChrome(true);
  }

  function togglePlay() {
    if (isPlaying) pause();
    else void play();
  }

  function toggleMute() {
    const el = mediaEl();
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function mediaDuration() {
    const el = mediaEl();
    const fromEl = el?.duration;
    if (fromEl && Number.isFinite(fromEl) && fromEl > 0) return fromEl;
    return duration > 0 && Number.isFinite(duration) ? duration : 0;
  }

  function skipSeconds(sec: number) {
    const el = mediaEl();
    const dur = mediaDuration();
    if (!el || !dur) return;
    el.currentTime = Math.max(0, Math.min(el.currentTime + sec, dur));
    setCurrentTime(el.currentTime);
  }

  function pctFromClientX(clientX: number) {
    const rail = seekRailRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function applySeek(pct01: number) {
    const el = mediaEl();
    const dur = mediaDuration();
    if (!el || !dur) return;
    const next = Math.max(0, Math.min(1, pct01)) * dur;
    el.currentTime = next;
    setCurrentTime(next);
    setSeekPct((next / dur) * 100);
  }

  function onSeekPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    draggingSeek.current = true;
    setSeeking(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    applySeek(pctFromClientX(e.clientX));
  }

  function onSeekPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingSeek.current) return;
    applySeek(pctFromClientX(e.clientX));
  }

  function onSeekPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!draggingSeek.current) return;
    draggingSeek.current = false;
    applySeek(pctFromClientX(e.clientX));
    setSeeking(false);
  }

  function syncFromMedia(el: HTMLMediaElement) {
    setCurrentTime(el.currentTime);
    if (Number.isFinite(el.duration) && el.duration > 0) {
      setDuration(el.duration);
    }
    if (el.buffered.length > 0 && el.duration > 0) {
      setBufferedPct((el.buffered.end(el.buffered.length - 1) / el.duration) * 100);
    }
  }

  useEffect(() => {
    setIsPlaying(false);
    setFailed(false);
    setStaleSigned(false);
    setPosterBroken(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedPct(0);
    setSeeking(false);
    setSeekPct(0);
    setChrome(true);
    refreshTried.current = false;
  }, [url, media.id]);

  useEffect(() => {
    if (autoPlay && (html5Video || html5Audio)) void play();
  }, [autoPlay, url]);

  useEffect(() => {
    return () => window.clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const sync = () => {
      const node = containerRef.current;
      const active =
        document.fullscreenElement === node ||
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement === node;
      setIsFullscreen(Boolean(active));
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggleFullscreen = async () => {
    const box = containerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => void })
      | null;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (box?.requestFullscreen) await box.requestFullscreen();
      else box?.webkitRequestFullscreen?.();
    } catch {
      /* ignore */
    }
  };

  const frameClass = compact
    ? "aspect-video max-h-[38vh] w-full"
    : "aspect-video w-full max-h-[min(56vh,560px)]";
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayPct = seeking ? seekPct : progressPct;
  const showBar = chrome || !isPlaying || failed;

  const blockedReason = (() => {
    if (kind === "document") return null;
    if (kind === "video" && playable.useHlsJs) {
      return "This preview is HLS only (.m3u8). Chrome can’t play it without a stream player — wait for an MP4 on preview.playbackUrl.";
    }
    if (processing && !url) {
      return "Still processing — preview may fail until the worker finishes.";
    }
    if (staleSigned) {
      return "File URL is a stale signed link — re-upload or ask backend to heal this row.";
    }
    if (failed) {
      return "The file wouldn’t load. Open the URL in a new tab: 403 is storage, playable in tab but not here is CORS.";
    }
    if (kind === "none") {
      return "No playable preview.mediaUrl / playbackUrl yet.";
    }
    return null;
  })();

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={revealChrome}
      onFocus={revealChrome}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          togglePlay();
        }
      }}
      className={cn(
        "media-preview group relative isolate overflow-hidden bg-black outline-none",
        isFullscreen ? "flex h-full w-full flex-col rounded-none" : "rounded-2xl"
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center bg-black",
          isFullscreen ? "min-h-0 w-full flex-1" : frameClass
        )}
      >
        {kind === "document" && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
            {thumb && !posterBroken && (
              <img
                src={thumb}
                alt=""
                className="h-28 w-20 rounded-lg object-cover"
                onError={() => setPosterBroken(true)}
              />
            )}
            <p className="text-sm font-semibold text-white">{media.title}</p>
            <p className="text-xs text-white/60">Ebook / document</p>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1a1f]"
              >
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                Open file
              </a>
            ) : (
              <p className="text-xs text-white/55">No file URL on preview.</p>
            )}
          </div>
        )}

        {html5Video && (
          <video
            ref={videoRef}
            key={url}
            src={url}
            poster={thumb && !posterBroken ? thumb : undefined}
            playsInline
            preload="metadata"
            controls={!showControls}
            controlsList={MEDIA_PROTECT_ATTRS.controlsList}
            disablePictureInPicture={MEDIA_PROTECT_ATTRS.disablePictureInPicture}
            draggable={false}
            className="h-full w-full object-contain select-none"
            onContextMenu={blockMediaContextMenu}
            onDragStart={blockMediaDrag}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              if (!seeking) syncFromMedia(e.currentTarget);
            }}
            onProgress={(e) => syncFromMedia(e.currentTarget)}
            onLoadedMetadata={(e) => syncFromMedia(e.currentTarget)}
            onEnded={() => {
              setIsPlaying(false);
              setChrome(true);
            }}
            onError={() => void handleMediaError()}
          />
        )}

        {html5Audio && (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#12352f] to-[#05080a] p-8">
            <audio
              ref={audioRef}
              src={url}
              preload="metadata"
              controlsList={MEDIA_PROTECT_ATTRS.controlsList}
              draggable={false}
              onContextMenu={blockMediaContextMenu}
              onDragStart={blockMediaDrag}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => {
                if (!seeking) syncFromMedia(e.currentTarget);
              }}
              onProgress={(e) => syncFromMedia(e.currentTarget)}
              onLoadedMetadata={(e) => syncFromMedia(e.currentTarget)}
              onEnded={() => setIsPlaying(false)}
              onError={() => void handleMediaError()}
            />
            {thumb && !posterBroken ? (
              <img
                src={thumb}
                alt=""
                className="h-28 w-28 rounded-2xl object-cover shadow-lg ring-1 ring-white/10"
                onError={() => setPosterBroken(true)}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10 text-xs font-semibold tracking-[0.2em] text-white/70">
                AUDIO
              </div>
            )}
            <p className="mt-4 max-w-sm truncate text-sm font-medium text-white">
              {media.title}
            </p>
          </div>
        )}

        {!html5Video && !html5Audio && kind !== "document" && thumb && !posterBroken && (
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setPosterBroken(true)}
          />
        )}

        {html5Video && !isPlaying && !failed && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
            aria-label="Play"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#0b1a1f] shadow-2xl">
              <PlayIcon className="h-7 w-7 translate-x-0.5" />
            </span>
          </button>
        )}

        {blockedReason && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 px-6 text-center">
            <p className="text-sm font-semibold text-white">
              {processing && !url
                ? "Still processing"
                : playable.useHlsJs
                  ? "HLS preview only"
                  : kind === "none"
                    ? "No playback file"
                    : "Couldn’t play"}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/65">
              {blockedReason}
            </p>
            {(failed || playable.mustRefresh) && kind !== "none" && (
              <button
                type="button"
                onClick={() => {
                  setFailed(false);
                  setStaleSigned(false);
                  refreshTried.current = false;
                  void onPlaybackError?.();
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1a1f]"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Refresh preview
              </button>
            )}
          </div>
        )}

        {showControls && (html5Video || html5Audio) && !blockedReason && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-200",
              showBar ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="pointer-events-auto">
              <div
                ref={seekRailRef}
                role="slider"
                tabIndex={0}
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.round(mediaDuration())}
                aria-valuenow={Math.round(seeking ? (seekPct / 100) * mediaDuration() : currentTime)}
                onPointerDown={onSeekPointerDown}
                onPointerMove={onSeekPointerMove}
                onPointerUp={onSeekPointerUp}
                onPointerCancel={onSeekPointerUp}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    skipSeconds(5);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    skipSeconds(-5);
                  }
                }}
                className="group/seek relative flex h-7 cursor-pointer items-center touch-none"
              >
                <div
                  className={cn(
                    "relative h-1 w-full overflow-visible rounded-full bg-white/15 transition-all duration-200",
                    "group-hover/seek:h-1.5",
                    seeking && "h-1.5"
                  )}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white/20"
                    style={{ width: `${Math.max(displayPct, bufferedPct)}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 shadow-[0_0_10px_rgba(251,191,36,0.45)]"
                    style={{ width: `${displayPct}%` }}
                  />
                  <div
                    className={cn(
                      "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(251,191,36,0.35),0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-150",
                      seeking || displayPct > 0
                        ? "scale-100"
                        : "scale-0 group-hover/seek:scale-100"
                    )}
                    style={{ left: `${displayPct}%` }}
                  />
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-white">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0b1a1f]"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-3.5 w-3.5" />
                  ) : (
                    <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => skipSeconds(-10)}
                  className="hidden h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 sm:inline-flex"
                >
                  <BackwardIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => skipSeconds(10)}
                  className="hidden h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 sm:inline-flex"
                >
                  <ForwardIcon className="h-4 w-4" />
                </button>
                <span className="ml-1 text-[11px] font-medium tabular-nums text-white/80">
                  {formatClock(currentTime)}
                  <span className="text-white/40"> / {formatClock(duration)}</span>
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={toggleMute}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-4 w-4 text-rose-300" />
                  ) : (
                    <SpeakerWaveIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="h-8 min-w-[2.25rem] rounded-full px-2 text-[11px] font-semibold text-white/85 hover:bg-white/10"
                >
                  {speed}x
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="h-4 w-4" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
