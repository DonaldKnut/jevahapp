import { useRef, useState, useEffect } from "react";
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
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  ViewfinderCircleIcon,
  ExclamationTriangleIcon,
  BackwardIcon,
  ForwardIcon,
  TvIcon,
} from "@heroicons/react/24/outline";

type VideoFilter = "none" | "contrast" | "bright" | "grayscale" | "invert";

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
  const [speed, setSpeed] = useState<number>(1);
  const [filter, setFilter] = useState<VideoFilter>("none");

  // Moderation Overlays
  const [showHud, setShowHud] = useState(true);
  const [showScanner, setShowScanner] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [scannerPulse, setScannerPulse] = useState(0);

  const url = mediaPreviewUrl(media) || "/mother_daughter_poster.jpg";
  const thumb = mediaThumbUrl(media) || "/mother_daughter_poster.jpg";

  // Scanner animation
  useEffect(() => {
    if (!showScanner) return;
    const interval = setInterval(() => {
      setScannerPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [showScanner]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play().catch(() => onPlaybackError?.());
      }
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play().catch(() => onPlaybackError?.());
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const skipSeconds = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + sec, duration)
      );
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  };

  const formatTimecode = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "00:00:00";
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  const filterStyles: Record<VideoFilter, string> = {
    none: "",
    contrast: "contrast-150 saturate-125",
    bright: "brightness-125 contrast-110",
    grayscale: "grayscale contrast-125",
    invert: "invert hue-rotate-180",
  };

  const frameClass = compact
    ? "aspect-video max-h-[42vh] w-full"
    : "aspect-video max-h-[min(65vh,600px)] w-full";

  const isVideo = isVideoMedia(media, url) || true; // default to video preview for media studio

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-3xl border border-jevah-border/80 bg-black/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
    >
      {/* Media Canvas Container */}
      <div className={cn("relative flex items-center justify-center bg-black", frameClass)}>
        {isVideo ? (
          <video
            ref={videoRef}
            key={url || thumb || media.id}
            src={url || undefined}
            poster={thumb || undefined}
            playsInline
            preload="metadata"
            className={cn(
              "h-full w-full object-contain transition-all duration-300",
              filterStyles[filter]
            )}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
            onError={() => onPlaybackError?.()}
          />
        ) : isAudioMedia(media, url) ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950/40 to-black p-8">
            <audio
              ref={audioRef}
              src={url || undefined}
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
              onError={() => onPlaybackError?.()}
            />
            {/* Audio Spectrum Graphic */}
            <div className="flex items-center gap-1.5 h-24 my-4">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-jevah-accent via-emerald-400 to-teal-300 transition-all duration-150"
                  style={{
                    height: isPlaying
                      ? `${Math.max(15, Math.sin(i + scannerPulse * 0.2) * 80 + 20)}%`
                      : "20%",
                  }}
                />
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Audio Waveform Telemetry Active
            </p>
          </div>
        ) : (
          <img
            src={thumb || url || "/mother_daughter_poster.jpg"}
            alt={media.title}
            className={cn("h-full w-full object-contain", filterStyles[filter])}
          />
        )}

        {/* OVERLAY 1: Telemetry HUD Top Header */}
        {showHud && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-400 border border-rose-500/40 backdrop-blur-md shadow-lg shadow-rose-950/50">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                MODERATION FEED
              </span>
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                1080p · 24 FPS · 4.8 Mbps
              </span>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30 backdrop-blur-md">
                0% CONFIDENCE
              </span>
            </div>

            <div className="text-right font-mono text-[11px] font-bold text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <div>{formatTimecode(currentTime)}</div>
              <div className="text-[9px] text-gray-400">DURATION: {formatTimecode(duration || 252)}</div>
            </div>
          </div>
        )}

        {/* OVERLAY 2: AI Risk Target Scanner Reticle */}
        {showScanner && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            {/* Animated Laser Sweep Line */}
            <div
              className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-75 shadow-[0_0_15px_#f43f5e]"
              style={{ top: `${scannerPulse}%` }}
            />

            {/* Target Reticle Crosshair */}
            <div className="relative h-48 w-72 rounded-2xl border border-rose-500/40 bg-rose-500/5 backdrop-blur-[1px] transition-all">
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 h-4 w-4 border-l-2 border-t-2 border-rose-500" />
              <div className="absolute -top-1 -right-1 h-4 w-4 border-r-2 border-t-2 border-rose-500" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-l-2 border-b-2 border-rose-500" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-r-2 border-b-2 border-rose-500" />

              <div className="flex h-full flex-col items-center justify-between p-3">
                <span className="rounded bg-rose-950/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-300 border border-rose-500/40">
                  AI SCAN TARGET ZONE
                </span>
                <div className="flex items-center gap-1.5 text-center text-[10px] font-bold text-amber-300 bg-black/70 px-3 py-1 rounded-full border border-amber-500/40">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  moderation_service_error
                </div>
                <span className="font-mono text-[9px] text-rose-400/80">
                  LAT: 14.821 · LON: -0.192 · FRAME #{Math.floor(currentTime * 24)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY 3: Broadcast Safe Area Guidelines */}
        {showSafeArea && (
          <div className="pointer-events-none absolute inset-0 z-10 p-8">
            {/* Action Safe (93%) */}
            <div className="h-full w-full rounded border border-dashed border-cyan-400/50 relative">
              <span className="absolute left-2 top-1 font-mono text-[9px] text-cyan-400 uppercase">
                ACTION SAFE (93%)
              </span>
              {/* Title Safe (80%) */}
              <div className="absolute inset-6 rounded border border-dashed border-yellow-400/50">
                <span className="absolute left-2 top-1 font-mono text-[9px] text-yellow-400 uppercase">
                  TITLE SAFE (80%)
                </span>
              </div>
              {/* Center Cross */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-cyan-400 text-xs">
                +
              </div>
            </div>
          </div>
        )}

        {/* Center Play Button Overlay on hover */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition hover:bg-black/20"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-jevah-accent to-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] transition hover:scale-110">
              <PlayIcon className="h-10 w-10 translate-x-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Floating HUD Controls Toolbar Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-black px-4 py-3 text-xs text-white">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-jevah-accent hover:text-white transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => skipSeconds(-5)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/15 transition"
              title="Rewind 5s"
            >
              <BackwardIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => skipSeconds(5)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/15 transition"
              title="Forward 5s"
            >
              <ForwardIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/15 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <SpeakerXMarkIcon className="h-4 w-4 text-rose-400" /> : <SpeakerWaveIcon className="h-4 w-4" />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] font-extrabold transition",
                    speed === s
                      ? "bg-jevah-accent text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Right: Moderation Overlay Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400 ml-1" />
              {(["none", "contrast", "bright", "grayscale", "invert"] as VideoFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase transition",
                    filter === f
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* HUD Overlay Button */}
            <button
              type="button"
              onClick={() => setShowHud(!showHud)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition border",
                showHud
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <CpuChipIcon className="h-3.5 w-3.5" />
              HUD
            </button>

            {/* AI Target Scanner Button */}
            <button
              type="button"
              onClick={() => setShowScanner(!showScanner)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition border",
                showScanner
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <ViewfinderCircleIcon className="h-3.5 w-3.5" />
              AI SCAN
            </button>

            {/* Safe Area Guide Button */}
            <button
              type="button"
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition border",
                showSafeArea
                  ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <TvIcon className="h-3.5 w-3.5" />
              GUIDES
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:bg-white/15 transition"
              title="Fullscreen"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
