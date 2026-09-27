import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublicArtists } from "../services/creatorsApi";
import type { ArtistCard } from "../types/creator";
import { genreLabel } from "../lib/media";
import { htmlToPlain } from "../lib/htmlText";
import { ApiError } from "../lib/api";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

function artistName(a: ArtistCard) {
  return a.displayName || a.name || a.slug || "Artist";
}

function artistInitial(a: ArtistCard) {
  return artistName(a).charAt(0).toUpperCase();
}

export default function Artists() {
  const [artists, setArtists] = useState<ArtistCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const q = useDebouncedValue(search, 200);

  useDocumentMeta({
    title: "Gospel artists — Jevah",
    description:
      "Meet verified gospel artists, worship leaders, and choirs on Jevah. Open a public page and listen.",
    canonicalPath: "/artists",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPublicArtists({
        search: q || undefined,
        limit: 48,
      });
      setArtists(res.items);
      setTotal(res.total);
    } catch (err) {
      setArtists([]);
      setTotal(0);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load gospel artists right now."
      );
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    artists.forEach((a) => a.genres?.forEach((g) => set.add(g)));
    return Array.from(set);
  }, [artists]);

  const visible = useMemo(() => {
    if (genre === "all") return artists;
    return artists.filter((a) =>
      a.genres?.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }, [artists, genre]);

  return (
    <div className="bg-jevah-bg pb-24 text-jevah-text">
      <section className="bg-[#060e18] text-white">
        <div className="mx-auto max-w-6xl px-3 pb-8 pt-6 xs:px-4 xs:pb-10 xs:pt-8 sm:px-6 sm:pb-12 sm:pt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
            <Link to="/music" className="hover:text-white">
              Gospel Music
            </Link>
            <span className="mx-2 text-white/30">/</span>
            Artists
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200 ring-1 ring-amber-300/35">
              <SparklesIcon className="h-3.5 w-3.5" />
              Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 ring-1 ring-white/15">
              <UserGroupIcon className="h-3.5 w-3.5" />
              On Jevah
            </span>
          </div>
          <h1 className="mt-3 text-[1.75rem] font-black tracking-tight text-white xs:mt-4 xs:text-4xl sm:text-5xl">
            Gospel Artists
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Verified ministers, worship leaders, and choirs publishing on Jevah.
            Open a page, read the story, play the catalog.
          </p>

          <div className="relative mt-6 max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artists…"
              className="w-full rounded-2xl border border-white/15 bg-[#0b1618] py-2.5 pl-10 pr-9 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-amber-300/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-white/55">
            {loading ? "Loading…" : `${total} ${total === 1 ? "artist" : "artists"}`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-8 xs:px-4 xs:py-10 sm:px-6">
        {genres.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setGenre("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold ${
                genre === "all"
                  ? "bg-jevah-accent text-white"
                  : "border border-jevah-border bg-jevah-surface text-jevah-text-muted"
              }`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold ${
                  genre.toLowerCase() === g.toLowerCase()
                    ? "bg-jevah-accent text-white"
                    : "border border-jevah-border bg-jevah-surface text-jevah-text-muted"
                }`}
              >
                {genreLabel(g)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="h-52 animate-pulse rounded-3xl border border-jevah-border bg-jevah-surface"
              />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded-3xl border border-jevah-border bg-jevah-surface p-10 text-center">
            <p className="text-sm font-bold text-jevah-text">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 text-xs font-extrabold text-jevah-accent hover:underline"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-jevah-border bg-jevah-surface p-12 text-center">
            <UserGroupIcon className="mx-auto h-8 w-8 text-jevah-text-muted" />
            <p className="mt-3 text-sm font-bold text-jevah-text">
              {search
                ? `No artists matching “${search}”`
                : "No public artists yet."}
            </p>
            <Link
              to="/creators"
              className="mt-4 inline-flex text-xs font-extrabold text-jevah-accent hover:underline"
            >
              Become a gospel creator
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => {
              const name = artistName(a);
              const bio = a.bio ? htmlToPlain(a.bio) : "";
              return (
                <li key={a.slug}>
                  <Link
                    to={`/artists/${a.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-jevah-border bg-jevah-surface p-5 transition hover:border-jevah-accent"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#0f3832] text-lg font-black text-amber-200 ring-1 ring-black/5">
                        {a.avatarUrl ? (
                          <img
                            src={a.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            {artistInitial(a)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h2 className="truncate text-lg font-black text-jevah-text">
                            {name}
                          </h2>
                          {a.isVerified && (
                            <CheckBadgeIcon
                              className="h-5 w-5 shrink-0 text-amber-500"
                              title="Verified"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-jevah-text-muted">
                          {a.isVerified ? "Verified gospel artist" : "Gospel artist"}
                        </p>
                        {a.location && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-jevah-text-muted">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {a.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {bio && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-jevah-text-muted">
                        {bio}
                      </p>
                    )}

                    {!!a.genres?.length && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.genres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-jevah-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-jevah-accent"
                          >
                            {genreLabel(g)}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-jevah-accent group-hover:underline">
                      Open profile
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
