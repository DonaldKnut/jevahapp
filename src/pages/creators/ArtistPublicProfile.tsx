import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPublicArtist,
  fetchPublicArtistTracks,
  trackArtist,
  trackPlaybackUrl,
  trackProcessing,
  type ArtistCard,
  type TrackCard,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";

function trackId(t: TrackCard) {
  return String(t.id || t._id || "");
}

export default function ArtistPublicProfile() {
  const { slug = "" } = useParams();
  const [artist, setArtist] = useState<ArtistCard | null>(null);
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [a, t] = await Promise.all([
        fetchPublicArtist(slug),
        fetchPublicArtistTracks(slug),
      ]);
      setArtist(a);
      setTracks(t);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Artist not found."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const name = artist?.displayName || artist?.name || slug;

  return (
    <div className="relative jevah-dashboard-shell pb-20 pt-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[35%] jevah-dashboard-sidebar"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-jevah-surface p-8 text-center shadow-sm">
            <p className="text-jevah-text">{error}</p>
            <Link
              to="/creators"
              className="mt-4 inline-flex text-sm font-semibold text-jevah-accent"
            >
              Back to Creators
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center text-white sm:flex-row sm:text-left">
              {artist?.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt=""
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-jevah-accent text-3xl font-bold ring-4 ring-white/20">
                  {(name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                  {artist?.isVerified && (
                    <span className="rounded-full bg-[#FFA500]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FFA500]">
                      Verified
                    </span>
                  )}
                </div>
                {artist?.genres?.length ? (
                  <p className="mt-2 text-sm capitalize text-white/70">
                    {artist.genres.map((g) => g.replace(/_/g, " ")).join(" · ")}
                  </p>
                ) : null}
                {artist?.bio && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                    {artist.bio}
                  </p>
                )}
                {artist?.socials && (
                  <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold text-white/60 sm:justify-start">
                    {Object.entries(artist.socials).map(([k, v]) =>
                      v ? (
                        <a
                          key={k}
                          href={v.startsWith("http") ? v : `https://${v}`}
                          target="_blank"
                          rel="noreferrer"
                          className="capitalize hover:text-white"
                        >
                          {k}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-jevah-border bg-jevah-surface shadow-sm">
              <div className="border-b border-jevah-border px-4 py-3">
                <h2 className="text-sm font-semibold text-jevah-text">
                  Discography
                </h2>
              </div>
              {tracks.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-jevah-text-muted">
                  No published tracks yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {tracks.map((t) => {
                    const url = trackPlaybackUrl(t);
                    const id = trackId(t);
                    return (
                      <li key={id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-jevah-text">
                              {t.title}
                            </p>
                            <p className="text-xs text-jevah-text-muted">
                              {trackArtist(t)} · {trackProcessing(t)}
                              {t.playCount != null
                                ? ` · ${t.playCount} plays`
                                : ""}
                            </p>
                          </div>
                          {url && (
                            <button
                              type="button"
                              onClick={() =>
                                setPlayingId(playingId === id ? null : id)
                              }
                              className="shrink-0 rounded-full bg-jevah-accent px-4 py-2 text-xs font-semibold text-white"
                            >
                              {playingId === id ? "Hide" : "Play"}
                            </button>
                          )}
                        </div>
                        {playingId === id && url && (
                          <audio
                            autoPlay
                            controls
                            className="mt-3 w-full"
                            src={url}
                            onEnded={() => setPlayingId(null)}
                          >
                            <track kind="captions" />
                          </audio>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
