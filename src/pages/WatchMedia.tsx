import { useCallback, useEffect, useState, type RefObject } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  EyeIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ApiError } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { sermonThumb } from "../lib/sermonMedia";
import { useSermonDock } from "../context/SermonDockContext";
import {
  fetchPublicMedia,
  publicMediaToPlayable,
} from "../services/publicMedia";
import type { PublicMediaCard } from "../types/sermon";

type LocationState = { media?: PublicMediaCard };

/**
 * Watch page for Latest / explore videos (and any public media with a playback URL).
 * Reuses the global sermon dock player so docked playback continues into admin.
 */
export default function WatchMedia() {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const hint = (location.state as LocationState | null)?.media ?? null;
  const dock = useSermonDock();

  const [media, setMedia] = useState<PublicMediaCard | null>(
    hint?.id === id ? hint : null
  );
  const [loading, setLoading] = useState(!media);
  const [error, setError] = useState<string | null>(null);

  useDocumentMeta({
    title: media?.title
      ? `${media.title} — Jevah`
      : "Watch — Jevah",
    description:
      media?.description ||
      "Watch gospel video on Jevah.",
    canonicalPath: id ? `/watch/${id}` : "/explore",
  });

  const load = useCallback(async () => {
    if (!id) {
      setError("Video not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const item =
        hint?.id === id ? hint : await fetchPublicMedia(id);
      // Prefer fresh detail when we only had a lite shelf card
      const fresh =
        hint?.id === id
          ? await fetchPublicMedia(id).catch(() => item)
          : item;
      setMedia(fresh);
      const playable = publicMediaToPlayable(fresh);
      dock.open(playable, {
        mini: false,
        wantPlaying:
          dock.session?.sermon.id === fresh.id
            ? dock.session.wantPlaying
            : true,
        resumeAt:
          dock.session?.sermon.id === fresh.id
            ? dock.session.resumeAt
            : 0,
      });
    } catch (err) {
      setMedia(null);
      if (err instanceof ApiError && err.status === 404) {
        setError("This video is not available.");
      } else {
        setError(getErrorMessage(err, "Could not load this video."));
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!media) return;
    dock.refreshStageBox();
    const onResize = () => dock.refreshStageBox();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [media, dock]);

  useEffect(() => {
    return () => {
      if (dock.session?.wantPlaying) dock.setMini(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="jevah-dashboard-shell min-h-dvh px-4 pb-20 pt-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="sermon-watch-stage mx-auto rounded-[1.35rem] bg-jevah-card" />
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="jevah-dashboard-shell flex min-h-dvh flex-col items-center justify-center px-4 pb-20 pt-28 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
          <PlayCircleIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-jevah-text">
          {error || "Video not found"}
        </h1>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-jevah-accent px-5 py-2.5 text-sm font-bold text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Latest
        </Link>
      </div>
    );
  }

  const thumb = sermonThumb(media.thumbnailUrl);
  const mini =
    dock.session?.mini && dock.session.sermon.id === media.id;

  return (
    <div className="relative min-h-dvh overflow-x-hidden pb-24 pt-20 font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={thumb}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-30 blur-3xl"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--jevah-bg) 55%, transparent) 0%, var(--jevah-bg) 42%, var(--jevah-bg) 100%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-jevah-text-muted transition hover:text-jevah-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Latest on Jevah
        </Link>

        <div
          ref={dock.stageRef as RefObject<HTMLDivElement>}
          className="sermon-watch-stage relative mx-auto mt-4"
        >
          <div
            className={`h-full w-full overflow-hidden rounded-[1.5rem] ring-1 ring-black/10 ${
              mini
                ? "bg-jevah-card/50"
                : "bg-[#04110e] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]"
            }`}
          />
          {mini ? (
            <button
              type="button"
              onClick={() => dock.setMini(false)}
              className="absolute inset-0 flex items-center justify-center text-sm font-bold text-jevah-text-muted"
            >
              Player docked — tap to expand
            </button>
          ) : null}
        </div>

        <header className="mt-8">
          <span className="inline-flex items-center rounded-full bg-jevah-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-jevah-accent">
            {media.contentType || "Video"}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl">
            {media.title}
          </h1>
          <p className="mt-2 text-sm text-jevah-text-muted">
            {[media.speaker || media.artistName, media.contentType]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {(media.playCount ?? 0) > 0 ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-jevah-text-muted">
              <EyeIcon className="h-3.5 w-3.5 text-jevah-accent" />
              {media.playCount!.toLocaleString()} views
            </p>
          ) : null}
          {media.description ? (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-jevah-text-muted">
              {media.description}
            </p>
          ) : null}
        </header>
      </div>
    </div>
  );
}
