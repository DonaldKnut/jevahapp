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
import { useFeedback } from "../../components/admin/Feedback";
import JevahLogo from "../../components/JevahLogo";
import NowPlayingBar from "../../components/music/NowPlayingBar";
import {
  ArrowLeftIcon,
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

  // Audio Playback state
  const [activeTrack, setActiveTrack] = useState<TrackCard | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Share Modal state
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
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Available genres extracted from tracks
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.genre) set.add(t.genre);
    });
    return Array.from(set);
  }, [tracks]);

  // Filtered tracks by search and genre tab
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        selectedGenre === "all" ||
        (t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase());

      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  // Total streams counter
  const totalPlays = useMemo(() => {
    return tracks.reduce((sum, t) => sum + (t.playCount || 0), 0);
  }, [tracks]);

  function handlePlayTrack(track: TrackCard) {
    if (activeTrack && trackId(activeTrack) === trackId(track)) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
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
        // User cancelled share
      }
    } else {
      copyToClipboard(currentUrl, "Profile link copied");
    }
  }

  return (
    <div className="relative min-h-dvh jevah-dashboard-shell pb-28 text-jevah-text antialiased transition-colors duration-300">
      {/* Navigation Top Header */}
      <header className="sticky top-0 z-30 border-b border-jevah-border/60 bg-jevah-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/creators"
              className="inline-flex items-center gap-1.5 rounded-xl border border-jevah-border/60 bg-jevah-card/60 px-3 py-1.5 text-xs font-bold text-jevah-text hover:bg-jevah-card"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-jevah-border" />
            <div className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
              <JevahLogo width={64} height={24} />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-jevah-accent/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-jevah-accent">
              Artist Profile
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/20 transition-all hover:scale-105 active:scale-95"
          >
            <ShareIcon className="h-4 w-4" />
            <span>Share Profile</span>
          </button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900 sm:h-80 lg:h-96">
        {artist?.bannerUrl ? (
          <img
            src={artist.bannerUrl}
            alt={`${name} Banner`}
            className="h-full w-full object-cover object-center opacity-70 filter brightness-90"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--jevah-dashboard-bg,#041012)] via-black/40 to-transparent" />
      </div>

      <div className="relative mx-auto -mt-24 max-w-6xl px-4 sm:-mt-32 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-jevah-accent border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-jevah-text-muted">Loading artist profile…</p>
          </div>
        ) : error ? (
          <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface p-10 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <XMarkIcon className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-black text-jevah-text">{error}</h2>
            <p className="mt-1 text-xs text-jevah-text-muted">
              The artist profile you requested does not exist or may have been removed.
            </p>
            <Link
              to="/creators"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-jevah-accent px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-jevah-accent-hover"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Return to Creator Hub
            </Link>
          </div>
        ) : (
          <>
            {/* Artist Header Info Card */}
            <div className="relative overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-6 shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-2xl sm:p-8">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {artist?.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={name}
                      className="h-28 w-28 rounded-full object-cover shadow-xl ring-4 ring-jevah-accent/30 sm:h-36 sm:w-36"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent to-emerald-700 text-4xl font-black text-white shadow-xl ring-4 ring-jevah-accent/30 sm:h-36 sm:w-36">
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}

                  {artist?.isVerified && (
                    <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg ring-2 ring-white dark:ring-gray-900" title="Verified Creator">
                      <CheckBadgeIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Info & Socials */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <h1 className="font-serif text-3xl font-black tracking-tight text-jevah-text sm:text-4xl">
                      {name}
                    </h1>

                    {artist?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-500">
                        <SparklesIcon className="h-3.5 w-3.5" />
                        Verified Gospel Artist
                      </span>
                    )}
                  </div>

                  {/* Location & Creator Tags */}
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-jevah-text-muted sm:justify-start">
                    {artist?.location && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-jevah-card px-2.5 py-1 text-jevah-text">
                        <MapPinIcon className="h-3.5 w-3.5 text-jevah-accent" />
                        {artist.location}
                      </span>
                    )}

                    {artist?.genres?.map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-jevah-accent/10 px-2.5 py-1 text-xs font-bold text-jevah-accent capitalize"
                      >
                        {g.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  {artist?.bio && (
                    <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-jevah-text-muted">
                      {artist.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {artist?.socials && Object.keys(artist.socials).length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
                      {Object.entries(artist.socials).map(([platform, link]) => {
                        if (!link) return null;
                        const fullUrl = link.startsWith("http")
                          ? link
                          : `https://${link}`;
                        return (
                          <a
                            key={platform}
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-jevah-border/80 bg-jevah-card/60 px-3 py-1.5 text-xs font-bold capitalize text-jevah-text shadow-xs transition hover:border-jevah-accent hover:bg-jevah-card hover:text-jevah-accent"
                          >
                            <GlobeAltIcon className="h-3.5 w-3.5 text-jevah-accent" />
                            <span>{platform}</span>
                            <ArrowUpRightIcon className="h-3 w-3 opacity-60" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Share Button Box */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-jevah-accent/40 bg-jevah-accent/10 px-5 py-3 text-xs font-extrabold text-jevah-accent shadow-sm transition hover:bg-jevah-accent hover:text-white"
                  >
                    <ShareIcon className="h-4 w-4" />
                    <span>Share Artist</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-jevah-border/60 pt-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-jevah-card/40 p-3.5 text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                    Published Songs
                  </p>
                  <p className="mt-0.5 font-serif text-2xl font-black text-jevah-text">
                    {tracks.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-jevah-card/40 p-3.5 text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                    Total Plays
                  </p>
                  <p className="mt-0.5 font-serif text-2xl font-black text-jevah-accent">
                    {totalPlays.toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl bg-jevah-card/40 p-3.5 text-center sm:col-span-1 sm:text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
                    Catalog Status
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold text-emerald-500">
                    Active Catalog ✓
                  </p>
                </div>
              </div>
            </div>

            {/* ARTIST DISCOGRAPHY & SONGS SECTION */}
            <div className="mt-8 space-y-6">
              {/* Header & Filter Controls */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MusicalNoteIcon className="h-5 w-5 text-jevah-accent" />
                    <h2 className="font-serif text-2xl font-bold text-jevah-text">
                      Songs &amp; Discography
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-jevah-text-muted">
                    Explore and listen to all published songs by {name}
                  </p>
                </div>

                {/* Discography Search Input */}
                <div className="relative w-full sm:w-72">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs by title…"
                    className="w-full rounded-2xl border border-jevah-border/80 bg-jevah-surface/90 pl-10 pr-4 py-2 text-xs font-bold text-jevah-text outline-none focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-jevah-text-muted hover:text-jevah-text"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Genre Filter Tabs */}
              {availableGenres.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedGenre("all")}
                    className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                      selectedGenre === "all"
                        ? "bg-jevah-accent text-white shadow-sm"
                        : "border border-jevah-border/80 bg-jevah-surface text-jevah-text-muted hover:bg-jevah-card"
                    }`}
                  >
                    All Songs ({tracks.length})
                  </button>

                  {availableGenres.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(g)}
                      className={`rounded-full px-4 py-1.5 text-xs font-extrabold capitalize transition ${
                        selectedGenre.toLowerCase() === g.toLowerCase()
                          ? "bg-jevah-accent text-white shadow-sm"
                          : "border border-jevah-border/80 bg-jevah-surface text-jevah-text-muted hover:bg-jevah-card"
                      }`}
                    >
                      {genreLabel(g)}
                    </button>
                  ))}
                </div>
              )}

              {/* Track List Display */}
              {filteredTracks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-jevah-border p-12 text-center">
                  <MusicalNoteIcon className="mx-auto h-10 w-10 text-jevah-text-muted" />
                  <p className="mt-3 text-sm font-bold text-jevah-text">
                    {searchQuery
                      ? `No songs matching "${searchQuery}"`
                      : "No published tracks in this catalog yet."}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs font-extrabold text-jevah-accent hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTracks.map((t, idx) => {
                    const tid = trackId(t);
                    const isCurrent = activeTrack && trackId(activeTrack) === tid;
                    const playingThis = isCurrent && isPlaying;
                    const durationStr = formatTrackDuration(trackDuration(t));
                    const thumb = trackThumb(t);
                    const audioUrl = trackPlaybackUrl(t);

                    return (
                      <div
                        key={tid}
                        className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-center ${
                          isCurrent
                            ? "border-jevah-accent bg-jevah-accent/10 shadow-md ring-1 ring-jevah-accent/30"
                            : "border-jevah-border/80 bg-jevah-surface/90 hover:border-jevah-accent/40 hover:bg-jevah-surface shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Track # Counter */}
                          <span className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center font-mono text-xs font-extrabold text-jevah-text-muted">
                            {String(idx + 1).padStart(2, "0")}
                          </span>

                          {/* Cover Image / Play trigger */}
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-jevah-card">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={t.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-jevah-accent/20 to-teal-500/20 text-jevah-accent">
                                <MusicalNoteIcon className="h-6 w-6" />
                              </div>
                            )}

                            {audioUrl && (
                              <button
                                type="button"
                                onClick={() => handlePlayTrack(t)}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                title={playingThis ? "Pause" : "Play track"}
                              >
                                {playingThis ? (
                                  <PauseIcon className="h-6 w-6 text-emerald-400" />
                                ) : (
                                  <PlayIcon className="h-6 w-6 text-white ml-0.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Track Details */}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-extrabold text-jevah-text">
                              {t.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-jevah-text-muted mt-0.5">
                              <span>{trackArtist(t)}</span>
                              {t.genre && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{genreLabel(t.genre)}</span>
                                </>
                              )}
                              {t.playCount != null && (
                                <>
                                  <span>·</span>
                                  <span>{t.playCount.toLocaleString()} plays</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Action Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-jevah-border/40 pt-3 sm:border-0 sm:pt-0">
                          {durationStr && (
                            <span className="font-mono text-xs font-bold text-jevah-text-muted">
                              {durationStr}
                            </span>
                          )}

                          {audioUrl && (
                            <button
                              type="button"
                              onClick={() => handlePlayTrack(t)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-xs ${
                                playingThis
                                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                  : "bg-jevah-accent text-white hover:bg-jevah-accent-hover"
                              }`}
                            >
                              {playingThis ? (
                                <>
                                  <PauseIcon className="h-4 w-4" />
                                  <span>Playing</span>
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="h-4 w-4" />
                                  <span>Play</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                `${currentUrl}#song-${tid}`,
                                `Link to "${t.title}" copied`
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-jevah-border bg-jevah-card/60 text-jevah-text-muted transition hover:border-jevah-accent hover:text-jevah-accent"
                            title="Copy track link"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Docked Player Bar when track is playing */}
      {activeTrack && (
        <NowPlayingBar
          track={activeTrack}
          queue={filteredTracks}
          onTrackChange={(t) => setActiveTrack(t)}
          onPlayingChange={(p) => setIsPlaying(p)}
          onClose={() => setActiveTrack(null)}
          shelfLabel={`${name} · Artist Catalog`}
        />
      )}

      {/* SHARE ARTIST PROFILE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setShareModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            aria-label="Close modal"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-jevah-border/60 pb-4">
              <div className="flex items-center gap-2">
                <ShareIcon className="h-5 w-5 text-jevah-accent" />
                <h3 className="text-lg font-black text-jevah-text">
                  Share Artist Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-jevah-card text-jevah-text-muted hover:text-jevah-text"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Profile Card Preview */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-3.5">
                {artist?.avatarUrl ? (
                  <img
                    src={artist.avatarUrl}
                    alt={name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-jevah-accent/30"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jevah-accent font-bold text-white">
                    {(name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-jevah-text">
                    {name}
                  </p>
                  <p className="text-xs text-jevah-text-muted">
                    {tracks.length} Published Gospel Songs · Jevah Music
                  </p>
                </div>
              </div>

              {/* Native System Share Trigger */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => void handleNativeShare()}
                  className="w-full rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-3 text-xs font-extrabold text-white shadow-md transition hover:scale-[1.01]"
                >
                  Open Mobile Share Sheet
                </button>
              )}

              {/* Copy Profile Link Box */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-jevah-text-muted">
                  Direct Profile URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={currentUrl}
                    className="w-full rounded-2xl border border-jevah-border bg-jevah-card/60 px-3.5 py-2.5 text-xs font-mono text-jevah-text outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(currentUrl, "Profile URL copied!")
                    }
                    className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-jevah-accent px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-jevah-accent-hover"
                  >
                    {copiedLink ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Share Shortcuts */}
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-jevah-text-muted">
                  Share to Social Apps
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Listen to ${name}'s gospel music on Jevah: ${currentUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center transition hover:bg-emerald-500/20"
                  >
                    <span className="text-xs font-extrabold text-emerald-500">
                      WhatsApp
                    </span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Listen to ${name}'s gospel songs on @JevahApp`
                    )}&url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-center transition hover:bg-sky-500/20"
                  >
                    <span className="text-xs font-extrabold text-sky-500">
                      X / Twitter
                    </span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      currentUrl
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 text-center transition hover:bg-blue-500/20"
                  >
                    <span className="text-xs font-extrabold text-blue-500">
                      Facebook
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

