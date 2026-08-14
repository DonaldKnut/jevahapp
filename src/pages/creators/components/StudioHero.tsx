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
} from "@heroicons/react/24/outline";
import type { ArtistCard } from "../../../types/creator";
import { genreLabel } from "../../../lib/media";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
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
  const cover = artist?.avatarUrl || null;
  const genres = artist?.genres || [];

  return (
    <section className="relative overflow-hidden rounded-b-[2.5rem] border-b border-white/10 shadow-2xl">
      {/* Background Cover & Ambient Gradients */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{
          backgroundImage: cover
            ? `linear-gradient(180deg, rgba(8, 20, 24, 0.45) 0%, rgba(8, 20, 24, 0.88) 60%, rgba(4, 10, 12, 0.98) 100%), url(${cover})`
            : "linear-gradient(135deg, #103b35 0%, #071518 55%, #050d0f 100%)",
        }}
      />
      
      {/* Mesh Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(78,205,196,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-10 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(37,110,99,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 px-6 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-12 lg:flex-row lg:items-end lg:gap-10">
        {/* Avatar Image Card */}
        <div className="relative group shrink-0">
          <div className="h-36 w-36 overflow-hidden rounded-3xl bg-gradient-to-br from-jevah-accent via-emerald-500 to-[#4ECDC4] shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-2 ring-white/30 sm:h-48 sm:w-48 transition-transform duration-300 group-hover:scale-[1.02]">
            {cover ? (
              <img src={cover} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl font-black text-white sm:text-6xl">
                {initials || "A"}
              </div>
            )}
          </div>
          {(status === "active" || artist?.isVerified) && (
            <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg ring-4 ring-[#081418]">
              <CheckBadgeIcon className="h-6 w-6" title="Verified Creator" />
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="min-w-0 flex-1 text-white">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md ring-1 ring-white/15">
              <SparklesIcon className="h-3 w-3" />
              Verified Creator Studio
            </span>
          </div>

          <h1 className="mt-2.5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">
            {name}
          </h1>

          {bio ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 line-clamp-2 sm:line-clamp-none font-medium">
              {bio}
            </p>
          ) : null}

          {genres.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white/90 backdrop-blur-md ring-1 ring-white/15 shadow-sm"
                >
                  {genreLabel(g)}
                </span>
              ))}
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-3 max-w-lg gap-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <UsersIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Listeners</p>
                <p className="text-base font-black tabular-nums text-white">{fmt(monthlyListeners)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <ChartBarIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Plays</p>
                <p className="text-base font-black tabular-nums text-white">{fmt(totalPlays)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <MusicalNoteIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Tracks</p>
                <p className="text-base font-black tabular-nums text-white">{trackCount}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canUpload && (
              <Link
                to="/creators/studio/upload"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-white via-slate-100 to-white px-6 py-3 text-sm font-black text-[#071518] shadow-xl shadow-black/20 hover:shadow-2xl transition hover:scale-[1.03] active:scale-95"
              >
                <ArrowUpTrayIcon className="h-4.5 w-4.5 text-jevah-accent" />
                Upload New Track
              </Link>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md ring-1 ring-white/20 hover:bg-white/15 transition active:scale-95"
              >
                <PencilSquareIcon className="h-4.5 w-4.5" />
                Edit Profile
              </button>
            )}
            {publicPath && (
              <Link
                to={publicPath}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white/80 hover:text-white transition"
              >
                <GlobeAltIcon className="h-4.5 w-4.5" />
                View Public Page →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
