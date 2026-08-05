import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

type Props = {
  publish: boolean;
  setPublish: (v: boolean) => void;
  busy: boolean;
  progress: string | null;
  progressPct: number;
  canSubmit: boolean;
};

export default function UploadSubmitPanel({
  publish,
  setPublish,
  busy,
  progress,
  progressPct,
  canSubmit,
}: Props) {
  return (
    <div className="space-y-5 overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-6 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
      <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-4 transition hover:bg-jevah-card/70">
        <div className="flex-1">
          <p className="text-sm font-extrabold text-jevah-text">
            Publish immediately
          </p>
          <p className="mt-0.5 text-xs text-jevah-text-muted">
            Make this track publicly visible in your catalog right away.
          </p>
        </div>
        <div
          className={`relative h-6 w-11 rounded-full transition-colors ${
            publish ? "bg-jevah-accent" : "bg-jevah-border"
          }`}
        >
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              publish ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </div>
      </label>

      {busy && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-jevah-text">
              {progress || "Uploading…"}
            </p>
            <span className="text-xs font-bold text-jevah-accent">
              {progressPct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-jevah-card">
            <div
              className="h-full rounded-full bg-gradient-to-r from-jevah-accent to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !canSubmit}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-jevah-accent/30 transition-all duration-200 hover:from-jevah-accent-hover hover:to-emerald-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {progress || "Working…"}
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-5 w-5" />
              {publish ? "Upload & Publish" : "Upload as Draft"}
            </>
          )}
        </span>
      </button>
    </div>
  );
}
