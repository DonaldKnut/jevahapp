import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { TRACK_GENRES, genreLabel } from "../../../lib/media";

export type TrackQueueItem = {
  id: string;
  audioFile: File;
  coverFile: File | null;
  coverPreview: string | null;
  title: string;
  genre: string;
  category: string;
  language: string;
  status: "idle" | "uploading" | "completed" | "failed";
  progressPct: number;
  statusMessage: string;
  error?: string;
};

type Props = {
  item: TrackQueueItem;
  index: number;
  busy: boolean;
  onUpdateTitle: (title: string) => void;
  onUpdateGenre: (genre: string) => void;
  onUpdateCategory: (category: string) => void;
  onPickCover: () => void;
  onRemoveCover: () => void;
  onRemoveTrack: () => void;
};

export default function TrackQueueCard({
  item,
  index,
  busy,
  onUpdateTitle,
  onUpdateGenre,
  onUpdateCategory,
  onPickCover,
  onRemoveCover,
  onRemoveTrack,
}: Props) {
  const isUploading = item.status === "uploading";
  const isCompleted = item.status === "completed";
  const isFailed = item.status === "failed";
  const fileSizeMb = (item.audioFile.size / 1024 / 1024).toFixed(1);
  const ext = item.audioFile.name.split(".").pop()?.toUpperCase() || "AUDIO";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 backdrop-blur-xl ${
        isCompleted
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : isUploading
            ? "border-jevah-accent bg-jevah-surface shadow-[0_8px_30px_rgba(37,110,99,0.15)] ring-1 ring-jevah-accent/30"
            : isFailed
              ? "border-rose-500/40 bg-rose-500/5"
              : "border-jevah-border/80 bg-jevah-surface/90 shadow-[0_4px_20px_var(--jevah-shadow)]"
      }`}
    >
      {/* Top Track Header Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-jevah-border/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-jevah-accent/15 text-xs font-black text-jevah-accent">
            #{String(index + 1).padStart(2, "0")}
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-jevah-text truncate max-w-[200px] sm:max-w-xs">
                {item.audioFile.name}
              </span>
              <span className="rounded-full bg-jevah-card px-2 py-0.5 text-[10px] font-bold text-jevah-text-muted">
                {fileSizeMb} MB · {ext}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Completed ✓</span>
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-600 dark:text-rose-400">
              <ExclamationCircleIcon className="h-4 w-4" />
              <span>Upload Failed</span>
            </span>
          ) : isUploading ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-jevah-accent/15 px-3 py-1 text-xs font-extrabold text-jevah-accent">
              <span className="h-2 w-2 animate-ping rounded-full bg-jevah-accent" />
              <span>Uploading {item.progressPct}%</span>
            </span>
          ) : (
            <span className="rounded-full bg-jevah-card px-3 py-1 text-xs font-bold text-jevah-text-muted">
              Queued
            </span>
          )}

          {!busy && !isCompleted && (
            <button
              type="button"
              onClick={onRemoveTrack}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-jevah-card text-jevah-text-muted transition hover:bg-rose-500/15 hover:text-rose-500"
              title="Remove song from queue"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Track Editor */}
      <div className="mt-5 grid gap-5 sm:grid-cols-12">
        {/* Cover Art Box */}
        <div className="sm:col-span-3">
          <div className="relative group overflow-hidden rounded-2xl border border-jevah-border bg-jevah-card/40 text-center">
            {item.coverPreview ? (
              <div className="relative aspect-square w-full">
                <img
                  src={item.coverPreview}
                  alt="Track Cover"
                  className="h-full w-full object-cover"
                />
                {!busy && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={onPickCover}
                      className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold text-gray-900 shadow-sm hover:bg-white"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={onRemoveCover}
                      className="rounded-lg bg-rose-500/80 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={onPickCover}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 p-3 text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-accent"
              >
                <PhotoIcon className="h-7 w-7" />
                <span className="text-[10px] font-bold">Add Cover Art</span>
              </button>
            )}
          </div>
        </div>

        {/* Track Inputs */}
        <div className="space-y-3 sm:col-span-9">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-jevah-text-muted">
              Song Title *
            </label>
            <input
              required
              disabled={busy || isCompleted}
              value={item.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="e.g. Amazing Grace (Live)"
              className="w-full rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2.5 text-sm font-bold text-jevah-text outline-none focus:border-jevah-accent disabled:opacity-75"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-jevah-text-muted">
                Genre
              </label>
              <select
                disabled={busy || isCompleted}
                value={item.genre}
                onChange={(e) => onUpdateGenre(e.target.value)}
                className="w-full rounded-2xl border border-jevah-border bg-jevah-surface px-3 py-2 text-xs font-bold text-jevah-text outline-none focus:border-jevah-accent disabled:opacity-75"
              >
                {TRACK_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {genreLabel(g)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-jevah-text-muted">
                Category
              </label>
              <input
                disabled={busy || isCompleted}
                value={item.category}
                onChange={(e) => onUpdateCategory(e.target.value)}
                placeholder="worship"
                className="w-full rounded-2xl border border-jevah-border bg-jevah-surface px-3 py-2 text-xs font-bold text-jevah-text outline-none focus:border-jevah-accent disabled:opacity-75"
              />
            </div>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL PROGRESS BAR */}
      <div className="mt-5 border-t border-jevah-border/60 pt-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span
            className={`flex items-center gap-1.5 ${
              isCompleted
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : isFailed
                  ? "text-rose-600 font-extrabold"
                  : "text-jevah-text"
            }`}
          >
            {isUploading && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-jevah-accent border-t-transparent" />
            )}
            <span>{item.statusMessage}</span>
          </span>

          <span className="font-mono text-xs font-black text-jevah-accent">
            {item.progressPct}%
          </span>
        </div>

        {/* Track Bar Container */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border/60">
          <div
            className={`h-full rounded-full transition-all duration-300 shadow-sm ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : isFailed
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-jevah-accent via-teal-500 to-emerald-400"
            }`}
            style={{ width: `${item.progressPct}%` }}
          />

          {isUploading && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
            </div>
          )}
        </div>

        {item.error && (
          <p className="mt-2 text-xs font-bold text-rose-500">{item.error}</p>
        )}
      </div>
    </div>
  );
}
