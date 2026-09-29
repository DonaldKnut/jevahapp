import { useCallback, useEffect, useState, type RefObject } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  EyeIcon,
  HeartIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import { SermonCardTile } from "../components/sermons/SermonCardTile";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ApiError } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { sermonThumb } from "../lib/sermonMedia";
import { useSermonDock } from "../context/SermonDockContext";
import {
  fetchSermon,
  fetchSermons,
  formatSermonDuration,
} from "../services/sermons";
import type { SermonCard } from "../types/sermon";

export default function SermonWatch() {
  const { id = "" } = useParams<{ id: string }>();
  const dock = useSermonDock();
  const [sermon, setSermon] = useState<SermonCard | null>(null);
  const [related, setRelated] = useState<SermonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocumentMeta({
    title: sermon
      ? `${sermon.title} — Jevah Sermons`
      : "Sermon — Jevah",
    description:
      sermon?.description ||
      "Watch or listen to this sermon on Jevah.",
    canonicalPath: id ? `/sermons/${id}` : "/sermons",
  });

  const load = useCallback(async () => {
    if (!id) {
      setError("Sermon not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const item = await fetchSermon(id);
      setSermon(item);
      // Open / refresh global dock session for this sermon (persists into admin)
      dock.open(item, {
        mini: false,
        wantPlaying: dock.session?.sermon.id === item.id
          ? dock.session.wantPlaying
          : false,
        resumeAt:
          dock.session?.sermon.id === item.id ? dock.session.resumeAt : 0,
      });
      const more = await fetchSermons({
        limit: 8,
        series: item.series || undefined,
        topic: item.topics[0] || undefined,
      }).catch(() => null);
      setRelated(
        (more?.items ?? []).filter((s) => s.id !== item.id).slice(0, 4)
      );
    } catch (err) {
      setSermon(null);
      setRelated([]);
      if (err instanceof ApiError && err.status === 404) {
        setError("This sermon is not available.");
      } else {
        setError(getErrorMessage(err, "Could not load this sermon."));
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dock.open is stable; avoid reopen loops
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep stage box measured for theater positioning
  useEffect(() => {
    if (!sermon) return;
    dock.refreshStageBox();
    const onResize = () => dock.refreshStageBox();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [sermon, dock]);

  // Leaving the watch page while playing → stay in corner dock (YouTube-style)
  useEffect(() => {
    return () => {
      if (dock.session?.wantPlaying) {
        dock.setMini(true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="jevah-dashboard-shell min-h-dvh px-4 pb-20 pt-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="sermon-watch-stage mx-auto rounded-[1.35rem] bg-jevah-card" />
          <div className="mt-6 h-8 w-2/3 rounded-full bg-jevah-card" />
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="jevah-dashboard-shell flex min-h-dvh flex-col items-center justify-center px-4 pb-20 pt-28 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
          <MicrophoneIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-jevah-text">
          {error || "Sermon not found"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-jevah-text-muted">
          It may still be processing, or it is not public yet.
        </p>
        <Link
          to="/sermons"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-jevah-accent px-5 py-2.5 text-sm font-bold text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sermons
        </Link>
      </div>
    );
  }

  const duration = formatSermonDuration(
    sermon.durationSec ?? sermon.duration
  );
  const thumb = sermonThumb(sermon.thumbnailUrl);
  const isVideo = sermon.mediaType !== "audio";
  const mini = dock.session?.mini && dock.session.sermon.id === sermon.id;

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
          to="/sermons"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-jevah-text-muted transition hover:text-jevah-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Sermons
        </Link>

        {/* Stage slot — GlobalSermonDock pins the live player here in theater mode */}
        <div
          ref={dock.stageRef as RefObject<HTMLDivElement>}
          className={`relative mt-4 ${
            isVideo ? "sermon-watch-stage mx-auto" : "min-h-[20rem] w-full"
          }`}
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

        <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-jevah-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-jevah-accent">
                {sermon.mediaType === "audio" ? "Listen" : "Watch"}
              </span>
              {sermon.series ? (
                <span className="text-xs font-semibold text-jevah-accent">
                  {sermon.series}
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl lg:text-[2rem]">
              {sermon.title}
            </h1>
            <p className="mt-2 text-sm text-jevah-text-muted">
              {[sermon.speaker, sermon.church, duration]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-surface/80 px-3 py-1.5 text-xs font-semibold text-jevah-text-muted backdrop-blur">
              <EyeIcon className="h-3.5 w-3.5 text-jevah-accent" />
              {sermon.playCount.toLocaleString()} plays
            </span>
            {sermon.likeCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-jevah-border bg-jevah-surface/80 px-3 py-1.5 text-xs font-semibold text-jevah-text-muted backdrop-blur">
                <HeartIcon className="h-3.5 w-3.5 text-amber-500" />
                {sermon.likeCount.toLocaleString()}
              </span>
            ) : null}
          </div>
        </header>

        {sermon.scripture ? (
          <p className="mt-6 inline-flex max-w-2xl items-start gap-2 rounded-2xl border border-jevah-border bg-jevah-elevated/80 px-4 py-3 text-sm text-jevah-text shadow-sm backdrop-blur">
            <BookOpenIcon className="mt-0.5 h-4 w-4 shrink-0 text-jevah-accent" />
            <span>{sermon.scripture}</span>
          </p>
        ) : null}

        {sermon.description ? (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-jevah-text-muted sm:text-base">
            {sermon.description}
          </p>
        ) : null}

        {sermon.topics.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {sermon.topics.map((t) => (
              <li
                key={t}
                className="rounded-full border border-jevah-border bg-jevah-card/70 px-3 py-1 text-xs font-semibold text-jevah-text-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-lg font-extrabold text-jevah-text">
              More messages
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((s) => (
                <li key={s.id}>
                  <SermonCardTile sermon={s} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
