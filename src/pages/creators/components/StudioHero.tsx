import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  SparklesIcon,
  ChartBarIcon,
  MusicalNoteIcon,
  UsersIcon,
  ShareIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid";
import type { ArtistCard } from "../../../types/creator";
import { genreLabel } from "../../../lib/media";
import { htmlToPlain } from "../../../lib/htmlText";
import BioRichText from "./BioRichText";
import { useFeedback } from "../../../components/admin/Feedback";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function calcReadiness(artist: ArtistCard | null, trackCount: number) {
  let score = 20; // base account
  if (artist?.avatarUrl) score += 20;
  if (artist?.bannerUrl) score += 15;
  if (artist?.bio && htmlToPlain(artist.bio).length > 20) score += 15;
  if (artist?.genres && artist.genres.length > 0) score += 15;
  if (trackCount > 0) score += 15;
  return Math.min(100, score);
}

export default function StudioHero({
  name,
  initials,
  artist,
  status,
  bio,
  trackCount,
  totalPlays,
  monthlyListeners,
  canUpload,
  canEdit,
  publicPath,
  onEdit,
}: {
  name: string;
  initials: string;
  artist: ArtistCard | null;
  status: string | null;
  bio: string;
  trackCount: number;
  totalPlays: number;
  monthlyListeners: number;
  canUpload: boolean;
  canEdit: boolean;
  publicPath: string | null;
  onEdit: () => void;
}) {
  const { toast } = useFeedback();
  const [copied, setCopied] = useState(false);

  const avatar = artist?.avatarUrl || null;
  const banner = artist?.bannerUrl || artist?.avatarUrl || null;
  const genres = artist?.genres || [];
  const verified = status === "active" || Boolean(artist?.isVerified);
  const readiness = calcReadiness(artist, trackCount);
  const greeting = getGreeting();

  const handleShareProfile = async () => {
    if (!publicPath) return;
    const fullUrl = `${window.location.origin}${publicPath}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success(
          "Profile link copied!",
          "Share it on your Instagram, Spotify, or X bio."
        );
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.info("Public Page URL", fullUrl);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#060e18]">
      {/* Background Banner with Glass Overlay */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: banner
            ? `url(${banner})`
            : "linear-gradient(135deg, #0f3832 0%, #07191c 50%, #04090c 100%)",
        }}
      />
      
      {/* Deep Gradient Overlays for High-Contrast Readable Text */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060e18]/60 via-[#060e18]/85 to-[#060e18]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060e18] via-[#060e18]/80 to-transparent" />

      {/* Radiant Spotlights & Ambient Glow Mesh */}
      <div
        className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full blur-3xl opacity-40 animate-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(37,110,99,0.5) 0%, rgba(78,205,196,0.2) 50%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(212,175,55,0.15) 50%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-10">
          
          {/* Avatar Container with Glowing Halo & Verified Badge */}
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="absolute -inset-1.5 rounded-[2.2rem] bg-gradient-to-br from-amber-400/60 via-emerald-400/40 to-teal-500/20 opacity-80 blur-md animate-pulse" />
            <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b5e54] via-[#0d2f2b] to-[#061114] shadow-[0_24px_60px_rgba(0,0,0,0.7)] ring-2 ring-white/20 sm:h-44 sm:w-44 lg:h-48 lg:w-48">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-sans text-5xl font-black tracking-wider text-amber-200 sm:text-6xl lg:text-7xl">
                  {initials || "A"}
                </div>
              )}
            </div>
            {verified && (
              <div
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-[#061114] shadow-xl ring-4 ring-[#060e18] sm:h-10 sm:w-10 transition-transform duration-300 hover:scale-110"
                title="Gold Verified Gospel Artist"
              >
                <CheckBadgeSolid className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Artist Bio & Name Section */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-amber-200 backdrop-blur-xl shadow-sm">
                <SparklesIcon className="h-3.5 w-3.5 text-amber-300" />
                Verified Creator Desk
              </span>
              {verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300 backdrop-blur-xl shadow-sm">
                  <CheckBadgeIcon className="h-3.5 w-3.5" />
                  Gold Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-xl">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Artist Studio
                </span>
              )}
            </div>

            <p className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-400/90">
              {greeting}, Minister
            </p>

            <h1 className="mt-1 font-sans text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
              {name}
            </h1>

            {bio ? (
              <BioRichText
                html={bio}
                className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-white/80 sm:mx-0 sm:text-base"
              />
            ) : (
              <p className="mx-auto mt-2 max-w-2xl font-sans text-xs italic text-white/60 sm:mx-0">
                Manage your songs, stream analytics, public brand profile, and catalog release strategy.
              </p>
            )}

            {/* Genre Pills */}
            {genres.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/90 shadow-sm backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    {genreLabel(g)}
                  </span>
                ))}
              </div>
            )}

            {/* 4 Premium Stat Cards Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 divide-y-0 sm:grid-cols-4 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-2.5 backdrop-blur-2xl shadow-2xl">
              
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-black tracking-tight text-white">
                    {fmt(monthlyListeners)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    Listeners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-black tracking-tight text-white">
                    {fmt(totalPlays)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    Total Plays
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30">
                  <MusicalNoteIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-black tracking-tight text-white">
                    {fmt(trackCount)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    Catalog Tracks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/30">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-black tracking-tight text-emerald-300">
                    {readiness}%
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    Studio Ready
                  </p>
                </div>
              </div>

            </div>

            {/* Compact premium actions */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {canUpload && (
                <Link
                  to="/creators/studio/upload"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 px-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#061114] shadow-[0_4px_14px_rgba(245,158,11,0.28)] ring-1 ring-amber-100/70 transition hover:brightness-110 active:scale-[0.97]"
                >
                  <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                  Upload Release
                </Link>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/12"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              )}

              {publicPath && (
                <button
                  type="button"
                  onClick={() => void handleShareProfile()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur-xl transition hover:bg-emerald-500/18"
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ShareIcon className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Share Link"}
                </button>
              )}

              {publicPath && (
                <Link
                  to={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 transition hover:text-white"
                >
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  Public Page
                  <span aria-hidden>↗</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

