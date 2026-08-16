import { useEffect, useRef, useState } from "react";
import type { AdminMediaCard } from "../../types/admin";
import {
  isAudioMedia,
  isVideoMedia,
  mediaPreviewUrl,
  mediaThumbUrl,
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

type VideoFilter = "none" | "contrast" | "bright" | "grayscale";

function formatClock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MediaPreview({
  media,
  compact = false,
  onPlaybackError,
  autoPlay = false,
  showControls = true,
}: {
  media: AdminMediaCard;
  compact?: boolean;
  onPlaybackError?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState<VideoFilter>("none");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const url = mediaPreviewUrl(media);
  const thumb = mediaThumbUrl(media);
  const isVideo = isVideoMedia(media, url);
  const isAudio = isAudioMedia(media, url);

  const togglePlay = () => {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }
    void el.play().catch(() => onPlaybackError?.());
    setIsPlaying(true);
  };

  const toggleMute = () => {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (next: number) => {
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const skipSeconds = (sec: number) => {
    const el = videoRef.current || audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.max(0, Math.min(el.currentTime + sec, el.duration));
  };

  const seekTo = (pct: number) => {
    const el = videoRef.current || audioRef.current;
    if (!el || !duration) return;
    el.currentTime = (pct / 100) * duration;
  };

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
    const video = videoRef.current;
    const onIosEnter = () => setIsFullscreen(true);
    const onIosExit = () => setIsFullscreen(false);
    video?.addEventListener("webkitbeginfullscreen", onIosEnter);
    video?.addEventListener("webkitendfullscreen", onIosExit);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      video?.removeEventListener("webkitbeginfullscreen", onIosEnter);
      video?.removeEventListener("webkitendfullscreen", onIosExit);
    };
  }, [url]);

  const toggleFullscreen = async () => {
    const box = containerRef.current as
      | (HTMLDivElement & {
          webkitRequestFullscreen?: () => void;
          webkitRequestFullScreen?: () => void;
        })
      | null;
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };

    try {
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else doc.webkitExitFullscreen?.();
        return;
      }
      if (box?.requestFullscreen) {
        await box.requestFullscreen();
        return;
      }
      if (box?.webkitRequestFullscreen) {
        box.webkitRequestFullscreen();
        return;
      }
      if (box?.webkitRequestFullScreen) {
        box.webkitRequestFullScreen();
        return;
      }
      video?.webkitEnterFullscreen?.();
    } catch {
      video?.webkitEnterFullscreen?.();
    }
  };

  const filterStyles: Record<VideoFilter, string> = {
    none: "",
    contrast: "contrast-125 saturate-110",
    bright: "brightness-110 contrast-105",
    grayscale: "grayscale",
  };

  const frameClass = compact
    ? "aspect-video max-h-[32vh] w-full sm:max-h-[38vh]"
    : "aspect-video max-h-[min(28vh,240px)] w-full sm:max-h-[min(52vh,520px)]";

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "media-preview relative z-0 isolate overflow-hidden bg-black shadow-inner ring-1 ring-black/20",
        isFullscreen
          ? "flex h-full w-full flex-col rounded-none"
          : "rounded-2xl"
      )}
    >
      <div
        className={cn(
          "media-preview-stage relative z-0 flex items-center justify-center bg-black",
          isFullscreen
            ? "min-h-0 w-full flex-1"
            : frameClass
        )}
      >
        {isVideo && url ? (
          <video
            ref={videoRef}
            key={url}
            src={url}
            poster={thumb || undefined}
            playsInline
            preload="metadata"
            className={cn(
              "relative z-0 h-full w-full object-contain",
              filterStyles[filter]
            )}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
            onError={() => onPlaybackError?.()}
          />
        ) : isAudio && url ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f3832] to-black p-8">
            <audio
              ref={audioRef}
              src={url}
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
              onError={() => onPlaybackError?.()}
            />
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="h-28 w-28 rounded-2xl object-cover shadow-lg ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-jevah-accent/20 text-sm font-semibold tracking-widest text-white/80">
                AUDIO
              </div>
            )}
            <p className="mt-4 max-w-sm truncate text-sm font-medium text-white">
              {media.title}
            </p>
          </div>
        ) : (
          <img
            src={thumb || "/mother_daughter_poster.jpg"}
            alt={media.title}
            className={cn("h-full w-full object-contain", filterStyles[filter])}
          />
        )}

        {!isPlaying && (isVideo || isAudio) && url && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition hover:bg-black/15"
            aria-label="Play"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0b1a1f] shadow-lg">
              <PlayIcon className="h-7 w-7 translate-x-px" />
            </span>
          </button>
        )}
      </div>

      {showControls && (
        <div className="space-y-1.5 border-t border-white/10 bg-[#0b1114] px-2.5 py-2 sm:px-3 sm:py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0b1a1f]"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4 translate-x-px" />
              )}
            </button>
            <div className="relative flex h-8 min-w-0 flex-1 items-center sm:h-6">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 sm:h-1.5">
                <div
                  className="h-full rounded-full bg-jevah-accent"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow sm:h-3 sm:w-3"
                style={{ left: `${Math.min(98, Math.max(2, progressPct))}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progressPct}
                aria-label="Seek"
                onChange={(e) => seekTo(Number(e.target.value))}
                className="media-seek absolute inset-0 h-full w-full cursor-pointer"
              />
            </div>
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/90">
              {formatClock(currentTime)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-white">
            <button
              type="button"
              onClick={() => skipSeconds(-5)}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 sm:inline-flex"
              title="Back 5s"
            >
              <BackwardIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => skipSeconds(5)}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 sm:inline-flex"
              title="Forward 5s"
            >
              <ForwardIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-4 w-4 text-rose-300" />
              ) : (
                <SpeakerWaveIcon className="h-4 w-4" />
              )}
            </button>
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium tabular-nums text-white/70">
              {formatClock(duration)}
            </span>

            <label className="sr-only" htmlFor={`speed-${media.id}`}>
              Playback speed
            </label>
            <select
              id={`speed-${media.id}`}
              value={speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-white/15 bg-[#161d21] px-1.5 text-[11px] font-semibold text-white"
            >
              {[0.5, 1, 1.5, 2].map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`look-${media.id}`}>
              Picture look
            </label>
            <select
              id={`look-${media.id}`}
              value={filter}
              onChange={(e) => setFilter(e.target.value as VideoFilter)}
              className="hidden h-8 rounded-lg border border-white/15 bg-[#161d21] px-1.5 text-[11px] font-medium capitalize text-white sm:block"
            >
              {(["none", "contrast", "bright", "grayscale"] as VideoFilter[]).map(
                (f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                )
              )}
            </select>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-4 w-4" />
              ) : (
                <ArrowsPointingOutIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
