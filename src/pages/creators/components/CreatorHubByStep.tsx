import { Link } from "react-router-dom";
import type { CreatorMe } from "../../../types/creator";
import type { TrackCard } from "../../../types/media";
import {
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

/**
 * Drive studio chrome from capabilities.nextStep (Open/Closed).
 * Avoid scattering status === "pending" checks across screens.
 */
export default function CreatorHubByStep({
  me,
  tracks,
  onUpload,
}: {
  me: CreatorMe;
  tracks: TrackCard[];
  onUpload: () => void;
}) {
  const step = me.capabilities.nextStep;

  switch (step) {
    case "apply":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-jevah-accent/30 bg-gradient-to-br from-jevah-accent/10 via-jevah-surface to-jevah-surface p-8 text-center shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-xl">
          {/* Background orb glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-jevah-accent/20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/25 shadow-md">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-jevah-text">Become a Creator</h2>
              <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-jevah-text-muted">
                {me.capabilities.statusMessage}
              </p>
            </div>
            <Link
              to="/creators/apply"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-jevah-accent/30 hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <SparklesIcon className="h-4 w-4" />
              Apply now
            </Link>
          </div>
        </div>
      );

    case "wait_review":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-jevah-surface to-jevah-surface p-8 shadow-[0_8px_32px_rgba(245,158,11,0.1)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-12 right-8 h-28 w-28 rounded-full bg-amber-400/15 blur-2xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/25 shadow-sm">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                Under Review
              </span>
              <p className="mt-2 text-sm font-medium leading-relaxed text-jevah-text-muted">
                {me.capabilities.statusMessage}
              </p>
              <p className="mt-2 text-xs text-jevah-text-muted/70">
                Our team reviews applications within 24–48 hours. You'll be notified by email.
              </p>
            </div>
          </div>
        </div>
      );

    case "contact_support":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-jevah-surface to-jevah-surface p-8 shadow-[0_8px_32px_rgba(239,68,68,0.1)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-8 right-8 h-24 w-24 rounded-full bg-rose-400/15 blur-2xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/25 shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-rose-500/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
                Action Required
              </span>
              <p className="mt-2 text-sm font-medium leading-relaxed text-jevah-text-muted">
                {me.capabilities.statusMessage}
              </p>
              <a
                href="mailto:support@jevahapp.com"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 transition dark:text-rose-400 ring-1 ring-rose-500/20"
              >
                Contact support →
              </a>
            </div>
          </div>
        </div>
      );

    case "upload_first_track":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-jevah-border/80 bg-gradient-to-br from-jevah-accent/8 via-jevah-surface to-jevah-surface p-8 text-center shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -bottom-8 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-jevah-accent/20 to-emerald-500/10 text-jevah-accent ring-1 ring-jevah-accent/25 shadow-md">
              <MusicalNoteIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-jevah-text">Upload Your First Track</h2>
              <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-jevah-text-muted">
                {me.capabilities.statusMessage || "Share your first song with the Jevah community."}
              </p>
            </div>
            <button
              type="button"
              onClick={onUpload}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-jevah-accent/30 hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload track
            </button>
          </div>
        </div>
      );

    case "manage_catalog":
    default:
      if (!tracks.length && me.capabilities.canUploadTracks) {
        return (
          <div className="relative overflow-hidden rounded-3xl border border-jevah-border/80 bg-gradient-to-br from-jevah-surface to-jevah-surface p-8 text-center shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-jevah-card text-jevah-text-muted ring-1 ring-jevah-border shadow-sm">
                <MusicalNoteIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-jevah-text">Your catalog is empty</h2>
                <p className="mt-1 text-sm text-jevah-text-muted">Start building your library — upload your first release.</p>
              </div>
              <button
                type="button"
                onClick={onUpload}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/25 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload track
              </button>
            </div>
          </div>
        );
      }
      return null;
  }
}

