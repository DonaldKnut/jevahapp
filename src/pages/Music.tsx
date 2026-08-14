import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TrackRow } from "../components/TrackRow";
import NowPlayingBar from "../components/music/NowPlayingBar";
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

export default function Music() {
  const { isAuthenticated } = useAuth();
  const [lane, setLane] = useState<"curated" | "artist">("curated");
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [forYou, setForYou] = useState<TrackCard[]>([]);
  const [ranked, setRanked] = useState(false);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<TrackCard | null>(null);
  const [playing, setPlaying] = useState(false);
  const playStartedAt = useRef<number | null>(null);
  const impressed = useRef<Set<string>>(new Set());
  const activeIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRanked(false);
    setForYou([]);
    try {
      if (lane === "curated") {
        const list = await fetchCopyrightFreeTracks();
        const filtered = q
          ? list.filter(
              (t) =>
                t.title?.toLowerCase().includes(q.toLowerCase()) ||
                (t.artistName || t.singer || "")
                  .toLowerCase()
                  .includes(q.toLowerCase())
            )
          : list;
        setTracks(filtered);
        return;
      }

      if (isAuthenticated && getAccessToken() && !q) {
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
        search: q || undefined,
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
    }
  }, [lane, q, isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      void flushFeedEvents();
    };
  }, []);

  const shelf = ranked && !q ? forYou : tracks;
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
      // Toggle handled by row when same track — pause/resume via re-select close
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

  const shelfLabel =
    lane === "curated" ? "Copyright-free" : ranked && !q ? "Made for you" : "Artists";

  return (
    <>
      <ErrorToaster error={error} title="Could not load music" />
      <div
        className={`jevah-dashboard-shell bg-[linear-gradient(180deg,var(--jevah-hero-via)_0%,var(--jevah-bg)_45%)] pt-24 ${
          active ? "pb-36" : "pb-20"
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jevah-accent">
            Listen
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-jevah-text sm:text-4xl">
            Music
          </h1>
          <p className="mt-2 text-sm text-jevah-text-muted">
            Copyright-free beds and artist originals stay on separate shelves.
            One player for both — spinning vinyl with your cover art.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-jevah-card p-1">
            <button
              type="button"
              onClick={() => {
                setLane("curated");
                selectTrack(null);
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                lane === "curated"
                  ? "bg-jevah-surface text-jevah-text shadow-sm"
                  : "text-jevah-text-muted"
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
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                lane === "artist"
                  ? "bg-jevah-surface text-jevah-text shadow-sm"
                  : "text-jevah-text-muted"
              }`}
            >
              Artists / Gospel
            </button>
          </div>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search.trim());
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lane === "curated"
                  ? "Search curated tracks"
                  : "Search artists & songs"
              }
              className="w-full rounded-xl border border-jevah-border bg-jevah-input px-4 py-3 text-sm text-jevah-text outline-none focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/15"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-jevah-accent px-5 text-sm font-semibold text-white hover:bg-jevah-accent-hover"
            >
              Search
            </button>
          </form>

          {lane === "artist" && ranked && !q && (
            <div className="mt-8">
              <h2 className="text-lg font-bold tracking-tight text-jevah-text">
                Made for you
              </h2>
              <p className="mt-1 text-xs text-jevah-text-muted">
                Ranked from your listens — same player as Copyright-free.
              </p>
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl border border-jevah-border bg-jevah-elevated shadow-sm">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-jevah-accent border-t-transparent" />
              </div>
            ) : shelf.length === 0 ? (
              <div className="px-4 py-14 text-center">
                <p className="font-medium text-jevah-text">No tracks yet</p>
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
            ) : (
              <ul>
                {shelf.map((t) => {
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
                    />
                  );
                })}
              </ul>
            )}
          </div>

          {!isAuthenticated && lane === "artist" && (
            <p className="mt-4 text-center text-sm text-jevah-text-muted">
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

          <p className="mt-8 text-center text-sm text-jevah-text-muted">
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
