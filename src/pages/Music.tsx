import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrackRow } from "../components/TrackRow";
import {
  fetchCopyrightFreeTracks,
  fetchMusicTracks,
  trackId,
  type TrackCard,
} from "../services/creatorsApi";
import { ApiError } from "../lib/api";

export default function Music() {
  const [lane, setLane] = useState<"curated" | "artist">("curated");
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      } else {
        const list = await fetchMusicTracks({
          lane: "artist",
          search: q || undefined,
          limit: 50,
        });
        setTracks(list);
      }
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
  }, [lane, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="bg-[linear-gradient(180deg,#F3F7F6_0%,#ffffff_45%)] pb-20 pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#256E63]">
          Listen
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A1F] sm:text-4xl">
          Music
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Two shelves, one catalog — copyright-free beds and artist originals stay
          separate.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLane("curated");
              setActiveId(null);
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              lane === "curated"
                ? "bg-white text-[#0B1A1F] shadow-sm"
                : "text-slate-500"
            }`}
          >
            Copyright-free
          </button>
          <button
            type="button"
            onClick={() => {
              setLane("artist");
              setActiveId(null);
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              lane === "artist"
                ? "bg-white text-[#0B1A1F] shadow-sm"
                : "text-slate-500"
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
              lane === "curated" ? "Search curated tracks" : "Search artists & songs"
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#256E63] focus:ring-2 focus:ring-[#256E63]/15"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#256E63] px-5 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#256E63] border-t-transparent" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <p className="font-medium text-slate-700">No tracks yet</p>
              <p className="mt-1 text-sm text-slate-500">
                {lane === "artist" ? (
                  <>
                    Are you an artist?{" "}
                    <Link
                      to="/creators"
                      className="font-semibold text-[#256E63] hover:underline"
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
              {tracks.map((t) => {
                const id = trackId(t);
                return (
                  <TrackRow
                    key={id}
                    track={t}
                    active={activeId === id}
                    onPlay={(tr) => {
                      const tid = trackId(tr);
                      setActiveId((prev) => (prev === tid ? null : tid));
                    }}
                    showLane={false}
                  />
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Creators upload in{" "}
          <Link to="/creators" className="font-semibold text-[#256E63] hover:underline">
            Studio
          </Link>
          . Full experience also lives in the Jevah app.
        </p>
      </div>
    </div>
  );
}
