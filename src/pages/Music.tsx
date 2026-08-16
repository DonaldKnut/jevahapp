import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TrackRow } from "../components/TrackRow";
import NowPlayingBar from "../components/music/NowPlayingBar";
import { MusicSalon } from "../components/music/MusicSalon";
import { MusicViewToggle } from "../components/music/MusicViewToggle";
import { TrackCover } from "../components/music/TrackCover";
import {
  fetchCopyrightFreeTracks,
  fetchMusicTracks,
  trackId,
  type TrackCard,
} from "../services/creatorsApi";
import { ApiError, getAccessToken } from "../lib/api";
import { listFromUnknown } from "../lib/api/unwrap";
import {
  enqueueFeedEvent,
  fetchMusicForYou,
  flushFeedEvents,
} from "../lib/feedRanker";
import { normalizeTrackList, trackPlaybackUrl } from "../lib/media";
import { ErrorToaster } from "../components/ErrorToaster";
import { useAuth } from "../context/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { matchesSearch } from "../lib/searchMatch";
import {
  readMusicView,
  writeMusicView,
  type MusicView,
} from "../lib/musicView";
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Music() {
  useDocumentMeta({
    title: "Gospel music & worship songs — Jevah",
    description:
      "Listen to gospel music, worship, choir, and Afro-gospel on Jevah. Discover Christian artists and copyright-free faith tracks.",
    canonicalPath: "/music",
  });
  const { isAuthenticated } = useAuth();
  const [lane, setLane] = useState<"curated" | "artist">("curated");
  const [view, setView] = useState<MusicView>(() => readMusicView());
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [forYou, setForYou] = useState<TrackCard[]>([]);
  const [ranked, setRanked] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 160);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<TrackCard | null>(null);
  const [playing, setPlaying] = useState(false);
  const playStartedAt = useRef<number | null>(null);
  const impressed = useRef<Set<string>>(new Set());
  const activeIdRef = useRef<string | null>(null);

  const artistQuery = lane === "artist" ? q : "";
  const skipSpinner = useRef(false);

  const load = useCallback(async () => {
    if (!skipSpinner.current) setLoading(true);
    setError(null);
    setRanked(false);
    setForYou([]);
    try {
      if (lane === "curated") {
        const list = await fetchCopyrightFreeTracks();
        setTracks(list);
        return;
      }

      if (isAuthenticated && getAccessToken() && !artistQuery) {
        try {
          const page = await fetchMusicForYou({ lane: "artist", limit: 20 });
          const rankedTracks = normalizeTrackList(
            listFromUnknown<TrackCard>(page, ["tracks", "items"])
          );
          if (rankedTracks.length) {
            setForYou(rankedTracks);
            setTracks(rankedTracks);
            setRanked(true);
            return;
          }
        } catch {
          /* soft fallback */
        }
      }

      const list = await fetchMusicTracks({
        lane: "artist",
        search: artistQuery || undefined,
        limit: 50,
      });
      setTracks(list);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load music right now."
      );
      setTracks([]);
    } finally {
      setLoading(false);
      skipSpinner.current = true;
    }
  }, [lane, artistQuery, isAuthenticated]);

  useEffect(() => {
    skipSpinner.current = false;
  }, [lane]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      void flushFeedEvents();
    };
  }, []);

  const shelf = useMemo(() => {
    const base = ranked && !search.trim() ? forYou : tracks;
    return base.filter((t) =>
      matchesSearch(search, [
        t.title,
        t.artistName,
        t.singer,
        t.genre,
        t.category,
        t.playCount,
      ])
    );
  }, [tracks, forYou, ranked, search]);

  const playableQueue = useMemo(
    () => shelf.filter((t) => Boolean(trackPlaybackUrl(t))),
    [shelf]
  );

  function noteImpression(id: string) {
    if (!id || impressed.current.has(id)) return;
    impressed.current.add(id);
    enqueueFeedEvent({
      contentId: id,
      contentType: "music",
      eventType: "impression",
      source: ranked ? "music_for_you" : lane === "artist" ? "artists" : "curated",
    });
  }

  function emitLeave(prevId: string | null) {
    if (!prevId || !playStartedAt.current) return;
    const watched = Date.now() - playStartedAt.current;
    enqueueFeedEvent({
      contentId: prevId,
      contentType: "music",
      eventType: watched < 15_000 ? "skip" : "watch_time",
      watchMs: watched,
      source: ranked ? "music_for_you" : lane === "artist" ? "artists" : "curated",
    });
  }

  function selectTrack(tr: TrackCard | null) {
    const prevId = activeIdRef.current;
    if (!tr) {
      emitLeave(prevId);
      activeIdRef.current = null;
      playStartedAt.current = null;
      setActive(null);
      setPlaying(false);
      return;
    }

    const tid = trackId(tr);
    if (prevId === tid) {
      emitLeave(prevId);
      activeIdRef.current = null;
      playStartedAt.current = null;
      setActive(null);
      setPlaying(false);
      return;
    }

    emitLeave(prevId);
    noteImpression(tid);
    activeIdRef.current = tid;
    playStartedAt.current = Date.now();
    setActive(tr);
    setPlaying(true);
  }

  function onRowPlay(tr: TrackCard) {
    const tid = trackId(tr);
    if (activeIdRef.current === tid) {
      selectTrack(null);
      return;
    }
    selectTrack(tr);
  }

  function changeView(next: MusicView) {
    setView(next);
    writeMusicView(next);
  }

  const shelfLabel =
    lane === "curated"
      ? "Copyright-free"
      : ranked && !search.trim()
        ? "Made for you"
        : "Artists";

  const shelfCopy =
    lane === "curated"
      ? "Licensed beds for worship, prayer, and quiet work — cover art first."
      : ranked && !search.trim()
        ? "Ranked from your listens — same player as Copyright-free."
        : "Originals from Jevah artists and worship leaders.";

  return (
    <>
      <ErrorToaster error={error} title="Could not load music" />
      <div
        className={`jevah-dashboard-shell relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,var(--jevah-hero-via)_0%,var(--jevah-bg)_42%)] pt-24 ${
          active ? "pb-36" : "pb-20"
        }`}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[min(90vw,48rem)] -translate-x-1/2 rounded-full bg-jevah-accent/10 blur-3xl" />

        <div
          className={`relative mx-auto px-4 sm:px-6 ${
            view === "list" ? "max-w-3xl" : "max-w-6xl"
          }`}
        >
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jevah-accent">
                Listening room
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-jevah-text sm:text-5xl">
                Music
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-jevah-text-muted">
                Copyright-free beds and artist originals stay on separate shelves.
                One player for both — spinning vinyl with your cover art.
              </p>
            </div>
            <MusicViewToggle value={view} onChange={changeView} />
          </header>

          <div className="mt-8 inline-flex w-full max-w-md rounded-full border border-jevah-border/80 bg-jevah-card/70 p-1 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setLane("curated");
                selectTrack(null);
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                lane === "curated"
                  ? "bg-jevah-text text-jevah-surface shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              }`}
            >
              Copyright-free
            </button>
            <button
              type="button"
              onClick={() => {
                setLane("artist");
                selectTrack(null);
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                lane === "artist"
                  ? "bg-jevah-text text-jevah-surface shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              }`}
            >
              Artists
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={
                  lane === "curated"
                    ? "Search beds, titles, numbers…"
                    : "Search artists, songs, 23, C#…"
                }
                className="w-full rounded-full border border-jevah-border bg-jevah-surface/90 py-2.5 pl-10 pr-10 text-sm text-jevah-text outline-none backdrop-blur-md placeholder:text-jevah-text-muted focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-jevah-text-muted hover:text-jevah-text"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-jevah-text-muted sm:text-right">
              <span className="font-semibold text-jevah-text">
                {loading ? "…" : shelf.length}
              </span>{" "}
              {lane === "curated" ? "beds" : "tracks"}
              {!loading && search.trim() ? " matching" : ""}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-jevah-text">
                {shelfLabel}
              </h2>
              <p className="mt-1 text-xs text-jevah-text-muted">{shelfCopy}</p>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <MusicSkeleton view={view} />
            ) : shelf.length === 0 ? (
              <div className="rounded-[1.5rem] border border-jevah-border/80 bg-jevah-elevated/80 px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
                  <MusicalNoteIcon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-jevah-text">No tracks yet</p>
                <p className="mt-1 text-sm text-jevah-text-muted">
                  {lane === "artist" ? (
                    <>
                      Are you an artist?{" "}
                      <Link
                        to="/creators"
                        className="font-semibold text-jevah-accent hover:underline"
                      >
                        Become a creator
                      </Link>
                    </>
                  ) : (
                    "Curated library will appear here when published."
                  )}
                </p>
              </div>
            ) : view === "salon" ? (
              <MusicSalon
                tracks={shelf}
                active={active}
                playing={playing}
                onPlay={onRowPlay}
              />
            ) : view === "gallery" ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {shelf.map((t) => {
                  const id = trackId(t);
                  const isActive = active ? trackId(active) === id : false;
                  return (
                    <TrackCover
                      key={id}
                      track={t}
                      active={isActive}
                      playing={isActive && playing}
                      onPlay={onRowPlay}
                    />
                  );
                })}
              </ul>
            ) : (
              <ul className="rounded-[1.5rem] border border-jevah-border/80 bg-jevah-elevated/80 p-2 shadow-sm backdrop-blur-md sm:p-3">
                {shelf.map((t, i) => {
                  const id = trackId(t);
                  const isActive = active ? trackId(active) === id : false;
                  return (
                    <TrackRow
                      key={id}
                      track={t}
                      active={isActive}
                      playing={isActive && playing}
                      onPlay={onRowPlay}
                      showLane={false}
                      index={i + 1}
                    />
                  );
                })}
              </ul>
            )}
          </div>

          {!isAuthenticated && lane === "artist" && (
            <p className="mt-6 text-center text-sm text-jevah-text-muted">
              <Link
                to="/creators/login"
                state={{ from: "/music", intent: "creator" }}
                className="font-semibold text-jevah-accent hover:underline"
              >
                Sign in
              </Link>{" "}
              for a personalized Artists shelf.
            </p>
          )}

          <p className="mt-10 text-center text-sm text-jevah-text-muted">
            Creators upload in{" "}
            <Link
              to="/creators"
              className="font-semibold text-jevah-accent hover:underline"
            >
              Studio
            </Link>
            .
          </p>
        </div>
      </div>

      <NowPlayingBar
        track={active}
        queue={playableQueue}
        shelfLabel={shelfLabel}
        onPlayingChange={setPlaying}
        onTrackChange={(tr) => {
          if (!tr) {
            selectTrack(null);
            return;
          }
          const tid = trackId(tr);
          if (activeIdRef.current !== tid) {
            emitLeave(activeIdRef.current);
            noteImpression(tid);
            activeIdRef.current = tid;
            playStartedAt.current = Date.now();
          }
          setActive(tr);
          setPlaying(true);
        }}
        onClose={() => selectTrack(null)}
      />
    </>
  );
}

function MusicSkeleton({ view }: { view: MusicView }) {
  if (view === "gallery") {
    return (
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-jevah-card" />
            <div className="mt-3 h-3 w-3/4 rounded-full bg-jevah-card" />
            <div className="mt-2 h-2.5 w-1/2 rounded-full bg-jevah-card" />
          </li>
        ))}
      </ul>
    );
  }

  if (view === "salon") {
    return (
      <div className="h-[28rem] animate-pulse rounded-[1.75rem] bg-jevah-card" />
    );
  }

  return (
    <div className="space-y-2 rounded-[1.5rem] border border-jevah-border/80 bg-jevah-elevated/80 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 py-2">
          <div className="h-14 w-14 rounded-xl bg-jevah-card" />
          <div className="flex-1">
            <div className="h-3 w-2/5 rounded-full bg-jevah-card" />
            <div className="mt-2 h-2.5 w-1/4 rounded-full bg-jevah-card" />
          </div>
        </div>
      ))}
    </div>
  );
}
