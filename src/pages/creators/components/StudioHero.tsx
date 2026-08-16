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
import { CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid";
import type { ArtistCard } from "../../../types/creator";
import { genreLabel } from "../../../lib/media";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const METRICS = [
  { key: "listeners", label: "Listeners", icon: UsersIcon },
  { key: "plays", label: "Plays", icon: ChartBarIcon },
  { key: "tracks", label: "Tracks", icon: MusicalNoteIcon },
] as const;

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
  const avatar = artist?.avatarUrl || null;
  const banner = artist?.bannerUrl || artist?.avatarUrl || null;
  const genres = artist?.genres || [];
  const verified = status === "active" || Boolean(artist?.isVerified);
  const stats = [
    { ...METRICS[0], value: fmt(monthlyListeners) },
    { ...METRICS[1], value: fmt(totalPlays) },
    { ...METRICS[2], value: fmt(trackCount) },
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: banner
            ? `url(${banner})`
            : "linear-gradient(135deg, #143f39 0%, #071518 55%, #040a0c 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#041012]/55 via-[#041012]/78 to-[#040a0c]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#040a0c]/85 via-[#040a0c]/40 to-transparent" />
      <div
        className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full blur-3xl sm:h-96 sm:w-96"
        style={{
          background:
            "radial-gradient(circle, rgba(78,205,196,0.28) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full blur-3xl sm:h-80 sm:w-80"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-14">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:gap-12">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-amber-200/50 via-emerald-300/20 to-transparent opacity-80 blur-[2px]" />
            <div className="relative h-28 w-28 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#1a5c54] via-[#0d2e2b] to-[#071518] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/25 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-serif text-4xl font-semibold tracking-wide text-white sm:text-5xl lg:text-6xl">
                  {initials || "A"}
                </div>
              )}
            </div>
            {verified && (
              <div
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-[#071518] shadow-lg ring-4 ring-[#041012] sm:h-9 sm:w-9"
                title="Verified creator"
              >
                <CheckBadgeSolid className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 bg-amber-100/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100/90 backdrop-blur-md">
                <SparklesIcon className="h-3 w-3" />
                Verified Creator Studio
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  <CheckBadgeIcon className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              {name}
            </h1>

            {bio ? (
              <p className="mx-auto mt-3 max-w-2xl font-serif text-base italic leading-relaxed text-white/75 sm:mx-0 sm:text-lg">
                {bio}
              </p>
            ) : null}

            {genres.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-md"
                  >
                    {genreLabel(g)}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center gap-1 px-2 py-3.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:px-4 sm:py-4"
                  >
                    <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-emerald-200 ring-1 ring-white/10 sm:flex">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-serif text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:text-[10px]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              {canUpload && (
                <Link
                  to="/creators/studio/upload"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#071518] shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:bg-amber-50 active:scale-[0.98]"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 text-[#256e63]" />
                  Upload New Track
                </Link>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
              {publicPath && (
                <Link
                  to={publicPath}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white/70 transition hover:text-white"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  View Public Page
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
