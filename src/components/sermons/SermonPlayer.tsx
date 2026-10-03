import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import type { SermonCard } from "../../types/sermon";
import {
  fetchSermon,
  formatSermonDuration,
  sermonPlayableUrl,
} from "../../services/sermons";
import {
  withPlaybackCacheBust,
  sermonThumb,
} from "../../lib/sermonMedia";
import {
  MEDIA_PROTECT_ATTRS,
  blockMediaContextMenu,
  blockMediaDrag,
} from "../../lib/mediaProtection";
import { useMediaProtection } from "../../hooks/useMediaProtection";
import { useSermonDock } from "../../context/SermonDockContext";

function preferredSrc(item: SermonCard, bust = 0) {
  const raw =
    item.playbackUrl ||
    (item.mediaType === "video" ? item.hlsUrl : null);
  return withPlaybackCacheBust(raw, bust);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

type InnerProps = {
  item: SermonCard;
  mini: boolean;
  theater: boolean;
  autoPlay: boolean;
  resumeAt: number;
  onTime: (t: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onMiniChange: (mini: boolean) => void;
  onClose: () => void;
  onRefreshed?: (next: SermonCard) => void;
};

function SermonPlayerChrome({
  item,
  mini,
  theater,
  autoPlay,
  resumeAt,
  onTime,
  onPlayingChange,
  onMiniChange,
  onClose,
  onRefreshed,
}: InnerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const refreshing = useRef(false);
  const errorRetries = useRef(0);
  const resumed = useRef(false);

  const [cacheBust, setCacheBust] = useState(0);
  const [src, setSrc] = useState(() => preferredSrc(item, 0));
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(resumeAt || 0);
  const [duration, setDuration] = useState(
    item.durationSec ?? item.duration ?? 0
  );
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isAudio = item.mediaType === "audio";
  const poster = sermonThumb(item.thumbnailUrl);
  const playable = Boolean(
    src && sermonPlayableUrl({ ...item, playbackUrl: src })
  );

  useMediaProtection(mediaRef, shellRef, src, playable);

  useEffect(() => {
    setSrc(preferredSrc(item, cacheBust));
    setLoadError(null);
    errorRetries.current = 0;
    resumed.current = false;
    setDuration(item.durationSec ?? item.duration ?? 0);
  }, [item.id, item.playbackUrl, item.hlsUrl, item.mediaType, item.durationSec, item.duration, cacheBust]);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    // Always keep chrome visible in mini/dock so play/pause stays usable
    if (!isAudio && playing && !scrubbing && !mini) {
      hideTimer.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2800);
    }
  }, [isAudio, playing, scrubbing, mini]);

  useEffect(() => {
    showControlsTemporarily();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [playing, mini, showControlsTemporarily]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    el.playbackRate = rate;
  }, [volume, muted, rate]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const refreshSrc = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const next = await fetchSermon(item.id);
      onRefreshed?.(next);
      const url = preferredSrc(next, cacheBust + 1);
      if (url) {
        setCacheBust((n) => n + 1);
        setSrc(url);
        setLoadError(null);
      }
    } catch {
      /* keep */
    } finally {
      refreshing.current = false;
    }
  }, [item.id, onRefreshed, cacheBust]);

  const onMediaError = useCallback(() => {
    if (errorRetries.current < 2) {
      errorRetries.current += 1;
      // Cache-bust R2 Range failures, then soft-refresh URL from API
      setCacheBust((n) => n + 1);
      void refreshSrc();
      return;
    }
    setLoadError(
      "Could not load this media. Try again, or refresh the page."
    );
    setPlaying(false);
    onPlayingChange(false);
  }, [refreshSrc, onPlayingChange]);

  const togglePlay = useCallback(async () => {
    const el = mediaRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        setLoadError(null);
        await el.play();
        setPlaying(true);
        onPlayingChange(true);
      } else {
        el.pause();
        setPlaying(false);
        onPlayingChange(false);
      }
    } catch (err) {
      setPlaying(false);
      onPlayingChange(false);
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Playback was blocked. Tap play again."
          : "Could not start playback.";
      setLoadError(msg);
    }
  }, [onPlayingChange]);

  // Resume once + autoplay when src/autoPlay changes — do NOT depend on resumeAt
  // (it updates on every timeupdate and would re-enter play/setState forever).
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !playable) return;
    if (!resumed.current && resumeAt > 0.5) {
      try {
        el.currentTime = resumeAt;
      } catch {
        /* ignore */
      }
      resumed.current = true;
    }
    if (autoPlay) {
      void el.play().then(
        () => {
          setPlaying(true);
          onPlayingChange(true);
        },
        () => {
          setPlaying(false);
          onPlayingChange(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resumeAt is one-shot via resumed.current
  }, [src, playable, autoPlay, onPlayingChange]);

  const seekBy = useCallback(
    (delta: number) => {
      const el = mediaRef.current;
      if (!el) return;
      el.currentTime = clamp(
        el.currentTime + delta,
        0,
        el.duration || duration || 0
      );
      setCurrent(el.currentTime);
      onTime(el.currentTime);
      showControlsTemporarily();
    },
    [duration, onTime, showControlsTemporarily]
  );

  const seekToRatio = useCallback(
    (ratio: number) => {
      const el = mediaRef.current;
      if (!el) return;
      const d = el.duration || duration || 0;
      if (!d) return;
      el.currentTime = clamp(ratio, 0, 1) * d;
      setCurrent(el.currentTime);
      onTime(el.currentTime);
    },
    [duration, onTime]
  );

  const cycleRate = useCallback(() => {
    setRate((r) => {
      const i = RATES.indexOf(r as (typeof RATES)[number]);
      return RATES[(i + 1) % RATES.length];
    });
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.requestFullscreen();
    } catch {
      /* ignore */
    }
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          void togglePlay();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seekBy(-10);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seekBy(10);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          if (!isAudio && !mini) {
            e.preventDefault();
            void toggleFullscreen();
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekBy, toggleMute, toggleFullscreen, isAudio, mini]);

  if (!playable) {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#06120f]">
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative rounded-full border border-white/15 bg-black/50 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md">
          Processing — playback will appear when ready
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? current / duration : 0;
  const bufferPct = duration > 0 ? (buffered / duration) * 100 : 0;
  const timeLabel = formatSermonDuration(current) ?? "0:00";
  const durLabel = formatSermonDuration(duration) ?? "—";
  const chromeOpen = controlsVisible || isAudio || scrubbing || mini;

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      role="region"
      aria-label={`${item.title} player`}
      onMouseMove={showControlsTemporarily}
      onFocus={showControlsTemporarily}
      onContextMenu={blockMediaContextMenu}
      onDragStart={blockMediaDrag}
      onClick={() => {
        shellRef.current?.focus();
        showControlsTemporarily();
      }}
      className={`group/player relative isolate h-full w-full overflow-hidden bg-[#04110e] outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-jevah-accent/50 select-none ${
        mini
          ? "aspect-video rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          : isAudio
            ? "rounded-[1.35rem]"
            : "aspect-video rounded-[1.35rem]"
      } ${fullscreen ? "rounded-none" : ""} ${theater ? "" : ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,110,99,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(245,158,11,0.12), transparent 50%)",
        }}
      />

      {isAudio ? (
        <div
          className={`relative flex flex-col items-center ${
            mini ? "px-3 pb-20 pt-4" : "px-6 pb-28 pt-10 sm:px-10 sm:pb-32 sm:pt-14"
          }`}
        >
          <img
            src={poster}
            alt=""
            className={`relative aspect-square rounded-[1.25rem] object-cover shadow-2xl ring-1 ring-white/15 ${
              mini ? "w-20" : "w-[min(72vw,260px)] rounded-[1.75rem]"
            }`}
          />
          {!mini ? (
            <>
              <p className="mt-8 max-w-md text-center text-lg font-bold tracking-tight text-white sm:text-xl">
                {item.title}
              </p>
              {item.speaker ? (
                <p className="mt-1 text-sm text-white/60">{item.speaker}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 line-clamp-1 px-2 text-center text-[11px] font-bold text-white">
              {item.title}
            </p>
          )}
          <audio
            ref={(el) => {
              mediaRef.current = el;
            }}
            key={src ?? undefined}
            src={src ?? undefined}
            preload="metadata"
            className="hidden"
            controlsList={MEDIA_PROTECT_ATTRS.controlsList}
            draggable={false}
            onContextMenu={blockMediaContextMenu}
            onDragStart={blockMediaDrag}
            onPlay={() => {
              setPlaying(true);
              onPlayingChange(true);
            }}
            onPause={() => {
              setPlaying(false);
              onPlayingChange(false);
            }}
            onTimeUpdate={(e) => {
              if (!scrubbing) {
                setCurrent(e.currentTarget.currentTime);
                onTime(e.currentTarget.currentTime);
              }
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration || duration);
            }}
            onDurationChange={(e) => {
              setDuration(e.currentTarget.duration || duration);
            }}
            onProgress={(e) => {
              const b = e.currentTarget.buffered;
              if (b.length) setBuffered(b.end(b.length - 1));
            }}
            onEnded={() => {
              setPlaying(false);
              onPlayingChange(false);
            }}
            onError={onMediaError}
          />
        </div>
      ) : (
        <>
          <video
            ref={(el) => {
              mediaRef.current = el;
            }}
            key={src ?? undefined}
            src={src ?? undefined}
            poster={poster}
            playsInline
            preload="auto"
            controlsList={MEDIA_PROTECT_ATTRS.controlsList}
            disablePictureInPicture={MEDIA_PROTECT_ATTRS.disablePictureInPicture}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain select-none"
            onContextMenu={blockMediaContextMenu}
            onDragStart={blockMediaDrag}
            onPlay={() => {
              setPlaying(true);
              onPlayingChange(true);
            }}
            onPause={() => {
              setPlaying(false);
              onPlayingChange(false);
            }}
            onTimeUpdate={(e) => {
              if (!scrubbing) {
                setCurrent(e.currentTarget.currentTime);
                onTime(e.currentTarget.currentTime);
              }
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration || duration);
              setLoadError(null);
            }}
            onDurationChange={(e) => {
              setDuration(e.currentTarget.duration || duration);
            }}
            onProgress={(e) => {
              const b = e.currentTarget.buffered;
              if (b.length) setBuffered(b.end(b.length - 1));
            }}
            onEnded={() => {
              setPlaying(false);
              onPlayingChange(false);
            }}
            onError={onMediaError}
            onClick={(e) => {
              e.stopPropagation();
              void togglePlay();
            }}
          />
          {loadError ? (
            <div className="absolute inset-x-3 top-3 z-30 rounded-xl border border-red-400/30 bg-red-950/80 px-3 py-2 text-center text-[11px] font-semibold text-red-100 backdrop-blur-md sm:text-xs">
              {loadError}
            </div>
          ) : null}
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={(e) => {
              e.stopPropagation();
              void togglePlay();
            }}
            className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white shadow-2xl ring-1 ring-white/30 backdrop-blur-md transition hover:scale-105 hover:bg-white/25 ${
              mini ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
            } ${
              playing && !chromeOpen
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }`}
          >
            {playing ? (
              <PauseIcon className={mini ? "h-6 w-6" : "h-8 w-8 sm:h-9 sm:w-9"} />
            ) : (
              <PlayIcon
                className={`${mini ? "h-6 w-6" : "h-8 w-8 sm:h-9 sm:w-9"} translate-x-0.5`}
              />
            )}
          </button>
        </>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition duration-300 ${
          chromeOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div
          className={`bg-gradient-to-t from-black/90 via-black/55 to-transparent ${
            mini ? "px-2 pb-2 pt-10" : "px-3 pb-3 pt-16 sm:px-5 sm:pb-4"
          }`}
        >
          <div
            className="group/scrub relative mb-2 h-1.5 cursor-pointer rounded-full bg-white/20 sm:mb-3 sm:h-2"
            onPointerDown={(e) => {
              setScrubbing(true);
              const rect = e.currentTarget.getBoundingClientRect();
              seekToRatio((e.clientX - rect.left) / rect.width);
              const onMove = (ev: PointerEvent) => {
                seekToRatio((ev.clientX - rect.left) / rect.width);
              };
              const onUp = () => {
                setScrubbing(false);
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/25"
              style={{ width: `${bufferPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-jevah-accent to-amber-400"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-md ring-2 ring-jevah-accent/40 sm:h-3.5 sm:w-3.5"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <ControlBtn label="Rewind 10 seconds" onClick={() => seekBy(-10)}>
              <BackwardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </ControlBtn>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => void togglePlay()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#04110e] shadow-lg transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
            >
              {playing ? (
                <PauseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <PlayIcon className="h-4 w-4 translate-x-0.5 sm:h-5 sm:w-5" />
              )}
            </button>
            <ControlBtn label="Forward 10 seconds" onClick={() => seekBy(10)}>
              <ForwardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </ControlBtn>

            {!mini ? (
              <span className="ml-1 min-w-[5.5rem] tabular-nums text-[11px] font-semibold text-white/80 sm:text-xs">
                {timeLabel} <span className="text-white/40">/</span> {durLabel}
              </span>
            ) : null}

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <ControlBtn
                label={muted ? "Unmute" : "Mute"}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <SpeakerXMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <SpeakerWaveIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </ControlBtn>
              {!mini ? (
                <>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    aria-label="Volume"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVolume(v);
                      setMuted(v === 0);
                      showControlsTemporarily();
                    }}
                    className="sermon-volume hidden w-20 accent-amber-400 sm:block"
                  />
                  <button
                    type="button"
                    onClick={cycleRate}
                    className="rounded-lg px-2 py-1.5 text-[11px] font-bold tabular-nums text-white/85 ring-1 ring-white/15 transition hover:bg-white/10"
                    aria-label="Playback speed"
                  >
                    {rate}x
                  </button>
                </>
              ) : null}
              <ControlBtn
                label={mini ? "Expand player" : "Minimize player"}
                onClick={() => onMiniChange(!mini)}
              >
                {mini ? (
                  <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ArrowsPointingInIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </ControlBtn>
              {!mini && !isAudio ? (
                <ControlBtn
                  label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={() => void toggleFullscreen()}
                >
                  <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </ControlBtn>
              ) : null}
              <ControlBtn label="Close player" onClick={onClose}>
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </ControlBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95 sm:h-9 sm:w-9"
    >
      {children}
    </button>
  );
}

/**
 * Global dock: one persistent player that theaters on the watch page
 * or floats (YouTube-style) on any route — including admin.
 */
export function GlobalSermonDock() {
  const {
    session,
    stageBox,
    setMini,
    setResumeAt,
    setWantPlaying,
    refreshStageBox,
    close,
    open,
  } = useSermonDock();
  const location = useLocation();
  const navigate = useNavigate();

  const id = session?.sermon.id;
  const onWatch =
    !!session &&
    !!id &&
    (location.pathname === `/sermons/${id}` ||
      location.pathname === `/watch/${id}`);
  const mini = session ? session.mini || !onWatch : false;
  const theater = onWatch && !mini;

  /** Expand mini player into the correct full watch route. */
  const expandHref = (sermon: NonNullable<typeof session>["sermon"]) => {
    const cat = (sermon.category || "").toLowerCase();
    // Public feed stamps category with contentType (videos / sermon / music…).
    if (
      cat === "videos" ||
      cat === "video" ||
      cat === "music" ||
      cat === "audio" ||
      cat === "track" ||
      cat === "gospel_videos" ||
      cat === "sermon" ||
      cat === "sermons"
    ) {
      return `/watch/${sermon.id}`;
    }
    return `/sermons/${sermon.id}`;
  };

  useLayoutEffect(() => {
    if (!session || !theater) return;
    refreshStageBox();
    const onScroll = () => refreshStageBox();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const timer = window.setInterval(refreshStageBox, 500);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(timer);
    };
    // Depend on id/pathname, not the whole session (resumeAt thrash)
  }, [id, theater, refreshStageBox, location.pathname]);

  if (!session) return null;

  // Wait for stage measure on the watch page so we don't flash the corner dock
  if (theater && !stageBox) {
    return null;
  }

  const style: CSSProperties = theater && stageBox
    ? {
        position: "fixed",
        top: stageBox.top,
        left: stageBox.left,
        width: stageBox.width,
        height: stageBox.height,
        zIndex: 70,
      }
    : {
        position: "fixed",
        right: 12,
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        width: "min(22rem, calc(100vw - 1.5rem))",
        zIndex: 95,
      };

  return (
    <div style={style} className="pointer-events-auto">
      <SermonPlayerChrome
        item={session.sermon}
        mini={mini}
        theater={theater}
        autoPlay={session.wantPlaying}
        resumeAt={session.resumeAt}
        onTime={setResumeAt}
        onPlayingChange={setWantPlaying}
        onMiniChange={(next) => {
          if (!next && !onWatch) {
            setMini(false);
            navigate(expandHref(session.sermon));
            return;
          }
          setMini(next);
        }}
        onClose={close}
        onRefreshed={(next) =>
          open(next, {
            mini: session.mini,
            resumeAt: session.resumeAt,
            wantPlaying: session.wantPlaying,
          })
        }
      />
    </div>
  );
}

export { SermonPlayerChrome };
