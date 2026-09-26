import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPublicArtist,
  fetchPublicArtistTracks,
  type ArtistCard,
} from "../../services/creatorsApi";
import {
  formatTrackDuration,
  genreLabel,
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackThumb,
  type TrackCard,
} from "../../lib/media";
import { ApiError } from "../../lib/api";
import { matchesSearch } from "../../lib/searchMatch";
import { htmlToPlain } from "../../lib/htmlText";
import { useFeedback } from "../../components/admin/Feedback";
import BioRichText from "./components/BioRichText";
import { usePlayer } from "../../context/PlayerContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MusicalNoteIcon,
  ShareIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

export default function ArtistPublicProfile() {
  const { slug = "" } = useParams();
  const { toast } = useFeedback();

  const [artist, setArtist] = useState<ArtistCard | null>(null);
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const player = usePlayer();
  const activeTrack = player.track;
  const isPlaying = player.isPlaying;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
        err instanceof ApiError ? err.message : "Artist profile not found."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const name = artist?.displayName || artist?.name || slug;
  const bioPlain = artist?.bio ? htmlToPlain(artist.bio) : "";
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useDocumentMeta({
    title: name ? `${name} — Gospel artist on Jevah` : "Gospel artist — Jevah",
    description:
      bioPlain.slice(0, 160) ||
      `Listen to ${name} on Jevah — gospel music, worship, and ministry tracks.`,
    canonicalPath: slug ? `/artists/${slug}` : undefined,
  });

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.genre) set.add(t.genre);
    });
    return Array.from(set);
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const okSearch = matchesSearch(searchQuery, [
        t.title,
        t.genre,
        t.genre ? genreLabel(t.genre) : undefined,
        trackArtist(t),
        t.playCount,
      ]);
      const matchesGenre =
        selectedGenre === "all" ||
        (t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase());
      return okSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  const totalPlays = useMemo(() => {
    return tracks.reduce((sum, t) => sum + (t.playCount || 0), 0);
  }, [tracks]);

  function handlePlayTrack(track: TrackCard) {
    player.start(track, {
      queue: filteredTracks,
      shelfLabel: `${name} · Artist Catalog`,
    });
  }

  function playCatalog() {
    const first = filteredTracks.find((t) => trackPlaybackUrl(t));
    if (first) handlePlayTrack(first);
  }

  function copyToClipboard(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success("Copied to clipboard", label);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} on Jevah Gospel`,
          text: `Listen to ${name}'s gospel songs on Jevah Music!`,
          url: currentUrl,
        });
      } catch {
        /* cancelled */
      }
    } else {
      copyToClipboard(currentUrl, "Profile link copied");
    }
  }

  const banner = artist?.bannerUrl || artist?.avatarUrl || null;
  const socials = Object.entries(artist?.socials || {}).filter(([, link]) =>
    Boolean(link)
  );

  return (
    <div className="bg-jevah-bg pb-24 text-jevah-text">
      <section className="relative overflow-hidden bg-[#060e18] text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage: banner
              ? `url(${banner})`
              : "linear-gradient(135deg, #0f3832 0%, #07191c 55%, #04090c 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[#060e18]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e18] via-[#060e18]/80 to-[#060e18]/35" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            <Link to="/music" className="hover:text-white">
              Gospel Music
            </Link>
            <span className="mx-2 text-white/35">/</span>
            Artist
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-white/80">
                Loading artist profile…
              </p>
            </div>
          ) : error ? (
            <div className="mt-10 max-w-lg rounded-2xl bg-[#0b1618] p-8 ring-1 ring-white/10">
              <h1 className="text-2xl font-black text-white">{error}</h1>
              <p className="mt-2 text-sm text-white/70">
                This artist page is missing or no longer public.
              </p>
              <Link
                to="/music"
                className="mt-5 inline-flex h-9 items-center rounded-full bg-amber-400 px-4 text-xs font-black uppercase tracking-wider text-[#061114]"
              >
                Browse gospel music
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-8 sm:mt-10 lg:flex-row lg:items-end">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                <div className="h-36 w-36 overflow-hidden rounded-[1.6rem] bg-[#0f3832] shadow-[0_24px_50px_rgba(0,0,0,0.55)] ring-2 ring-white/25 sm:h-44 sm:w-44">
                  {artist?.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-black text-amber-200">
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {artist?.isVerified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-[#061114] ring-4 ring-[#060e18]"
                    title="Verified gospel artist"
                  >
                    <CheckBadgeIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {artist?.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200 ring-1 ring-amber-300/35">
                      <SparklesIcon className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                  {artist?.location && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15">
                      <MapPinIcon className="h-3.5 w-3.5 text-emerald-300" />
                      {artist.location}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 font-sans text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {name}
                </h1>

                {artist?.bio ? (
                  <BioRichText
                    html={artist.bio}
                    className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:mx-0 sm:text-base"
                  />
                ) : (
                  <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:mx-0">
                    Gospel artist on Jevah. Listen to the catalog below.
                  </p>
                )}

                {!!artist?.genres?.length && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {artist.genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/15"
                      >
                        {genreLabel(g)}
                      </span>
                    ))}
                  </div>
                )}

                {socials.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {socials.map(([platform, link]) => {
                      const fullUrl = link.startsWith("http")
                        ? link
                        : `https://${link}`;
                      return (
                        <a
                          key={platform}
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold capitalize text-white ring-1 ring-white/15 hover:bg-white/16"
                        >
                          <GlobeAltIcon className="h-3.5 w-3.5 text-emerald-300" />
                          {platform}
                          <ArrowUpRightIcon className="h-3 w-3 text-white/60" />
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {filteredTracks.some((t) => trackPlaybackUrl(t)) && (
                    <button
                      type="button"
                      onClick={playCatalog}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 px-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#061114] shadow-[0_6px_18px_rgba(245,158,11,0.28)]"
                    >
                      <PlayIcon className="h-3.5 w-3.5" />
                      Play catalog
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/20 hover:bg-white/16"
                  >
                    <ShareIcon className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>

                <div className="mt-6 grid max-w-lg grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#0b1618] px-3 py-3 ring-1 ring-white/10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/55">
                      Songs
                    </p>
                    <p className="mt-0.5 text-xl font-black text-white">
                      {tracks.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#0b1618] px-3 py-3 ring-1 ring-white/10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/55">
                      Plays
                    </p>
                    <p className="mt-0.5 text-xl font-black text-amber-300">
                      {totalPlays.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#0b1618] px-3 py-3 ring-1 ring-white/10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/55">
                      Catalog
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-emerald-300">
                      Live
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && !error && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-jevah-accent">
                <MusicalNoteIcon className="h-5 w-5" />
                <h2 className="font-sans text-2xl font-black text-jevah-text">
                  Discography
                </h2>
              </div>
              <p className="mt-1 text-sm text-jevah-text-muted">
                Published songs by {name}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs…"
                className="w-full rounded-2xl border border-jevah-border bg-jevah-surface py-2.5 pl-10 pr-9 text-sm font-semibold text-jevah-text outline-none focus:border-jevah-accent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-jevah-text-muted hover:text-jevah-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {availableGenres.length > 0 && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedGenre("all")}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold ${
                  selectedGenre === "all"
                    ? "bg-jevah-accent text-white"
                    : "border border-jevah-border bg-jevah-surface text-jevah-text-muted"
                }`}
              >
                All ({tracks.length})
              </button>
              {availableGenres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold capitalize ${
                    selectedGenre.toLowerCase() === g.toLowerCase()
                      ? "bg-jevah-accent text-white"
                      : "border border-jevah-border bg-jevah-surface text-jevah-text-muted"
                  }`}
                >
                  {genreLabel(g)}
                </button>
              ))}
            </div>
          )}

          {filteredTracks.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-jevah-border bg-jevah-surface p-12 text-center">
              <MusicalNoteIcon className="mx-auto h-8 w-8 text-jevah-text-muted" />
              <p className="mt-3 text-sm font-bold text-jevah-text">
                {searchQuery
                  ? `No songs matching “${searchQuery}”`
                  : "No published tracks yet."}
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-2">
              {filteredTracks.map((t, idx) => {
                const tid = trackId(t);
                const isCurrent = activeTrack && trackId(activeTrack) === tid;
                const playingThis = Boolean(isCurrent && isPlaying);
                const durationStr = formatTrackDuration(trackDuration(t));
                const thumb = trackThumb(t);
                const audioUrl = trackPlaybackUrl(t);

                return (
                  <li
                    key={tid}
                    className={`flex flex-col gap-3 rounded-2xl border bg-jevah-surface p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                      isCurrent
                        ? "border-jevah-accent"
                        : "border-jevah-border"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="hidden w-6 shrink-0 text-right font-mono text-[11px] font-bold text-jevah-text-muted sm:block">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        disabled={!audioUrl}
                        onClick={() => handlePlayTrack(t)}
                        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#0f3832] disabled:opacity-50"
                        aria-label={
                          playingThis ? `Pause ${t.title}` : `Play ${t.title}`
                        }
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-white/80">
                            <MusicalNoteIcon className="h-6 w-6" />
                          </span>
                        )}
                        {audioUrl && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                            {playingThis ? (
                              <PauseIcon className="h-5 w-5 text-emerald-300" />
                            ) : (
                              <PlayIcon className="h-5 w-5" />
                            )}
                          </span>
                        )}
                      </button>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-extrabold text-jevah-text">
                          {t.title}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-jevah-text-muted">
                          {trackArtist(t)}
                          {t.genre ? ` · ${genreLabel(t.genre)}` : ""}
                          {t.playCount != null
                            ? ` · ${t.playCount.toLocaleString()} plays`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {durationStr && (
                        <span className="font-mono text-xs font-bold text-jevah-text-muted">
                          {durationStr}
                        </span>
                      )}
                      {audioUrl && (
                        <button
                          type="button"
                          onClick={() => handlePlayTrack(t)}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-extrabold text-white ${
                            playingThis
                              ? "bg-emerald-600"
                              : "bg-jevah-accent"
                          }`}
                        >
                          {playingThis ? (
                            <PauseIcon className="h-3.5 w-3.5" />
                          ) : (
                            <PlayIcon className="h-3.5 w-3.5" />
                          )}
                          {playingThis ? "Playing" : "Play"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `${currentUrl}#song-${tid}`,
                            `Link to “${t.title}” copied`
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-jevah-border bg-jevah-surface text-jevah-text-muted hover:text-jevah-accent"
                        title="Copy track link"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setShareModalOpen(false)}
            className="absolute inset-0 bg-black/65"
            aria-label="Close share"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-jevah-border bg-jevah-surface p-6 text-jevah-text shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Share artist</h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-jevah-card text-jevah-text"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-jevah-border bg-jevah-bg p-3">
              {artist?.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-accent font-bold text-white">
                  {(name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">{name}</p>
                <p className="text-xs text-jevah-text-muted">
                  {tracks.length} songs · Jevah
                </p>
              </div>
            </div>

            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="mt-4 w-full rounded-2xl bg-jevah-accent py-3 text-xs font-extrabold text-white"
              >
                Open share sheet
              </button>
            )}

            <label className="mt-4 block text-[11px] font-extrabold uppercase tracking-wider text-jevah-text-muted">
              Profile URL
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                readOnly
                value={currentUrl}
                className="w-full rounded-2xl border border-jevah-border bg-jevah-bg px-3 py-2.5 font-mono text-xs text-jevah-text"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(currentUrl, "Profile URL copied")}
                className="shrink-0 rounded-2xl bg-jevah-accent px-3 py-2.5 text-xs font-extrabold text-white"
              >
                {copiedLink ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  "Copy"
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Listen to ${name} on Jevah: ${currentUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-extrabold text-emerald-700 dark:text-emerald-300"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Listen to ${name} on Jevah`
                )}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-center text-xs font-extrabold text-sky-700 dark:text-sky-300"
              >
                X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  currentUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 text-center text-xs font-extrabold text-blue-700 dark:text-blue-300"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
