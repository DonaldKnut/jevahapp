import { Link } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  PencilSquareIcon,
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
    <section className="studio-hero relative overflow-hidden rounded-b-3xl">
      <div
        className="absolute inset-0"
        style={{
          background: cover
            ? `linear-gradient(180deg, rgba(11,26,31,0.35) 0%, rgba(11,26,31,0.82) 100%), url(${cover}) center/cover`
            : "linear-gradient(135deg, #256e63 0%, #0b1a1f 52%, #134e4a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 12% 20%, rgba(78,205,196,0.35), transparent 55%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:flex-row lg:items-end lg:gap-8">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-jevah-accent to-[#4ECDC4] shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/20 sm:h-44 sm:w-44">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-black text-white">
              {initials || "A"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200/80">
            Creator desk
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            {(status === "active" || artist?.isVerified) && (
              <CheckBadgeIcon
                className="h-7 w-7 shrink-0 text-emerald-300"
                title="Verified on Jevah"
              />
            )}
          </div>
          {bio ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
              {bio}
            </p>
          ) : null}
          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-white/90 ring-1 ring-white/15"
                >
                  {genreLabel(g)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white/80">
            <span>
              <span className="tabular-nums text-white">{fmt(monthlyListeners)}</span>{" "}
              monthly listeners
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
            <span>
              <span className="tabular-nums text-white">{fmt(totalPlays)}</span> plays
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
            <span>
              <span className="tabular-nums text-white">{trackCount}</span>{" "}
              {trackCount === 1 ? "track" : "tracks"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {canUpload && (
              <Link
                to="/creators/studio/upload"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#0b1a1f] shadow-lg transition hover:scale-[1.02] active:scale-95"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload
              </Link>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit profile
              </button>
            )}
            {publicPath && (
              <Link
                to={publicPath}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white/80 hover:text-white"
              >
                <GlobeAltIcon className="h-4 w-4" />
                Public page
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
