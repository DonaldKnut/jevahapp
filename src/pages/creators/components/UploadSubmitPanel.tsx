import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

type Props = {
  publish: boolean;
  setPublish: (v: boolean) => void;
  busy: boolean;
  overallPct: number;
  completedCount: number;
  totalCount: number;
  canSubmit: boolean;
};

export default function UploadSubmitPanel({
  publish,
  setPublish,
  busy,
  overallPct,
  completedCount,
  totalCount,
  canSubmit,
}: Props) {
  return (
    <div className="space-y-5 overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-6 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
      <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-4 transition hover:bg-jevah-card/70">
        <div className="flex-1">
          <p className="text-sm font-extrabold text-jevah-text">
            Publish songs immediately
          </p>
          <p className="mt-0.5 text-xs text-jevah-text-muted">
            Make uploaded songs publicly visible on your Artist profile right away.
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

      {/* Master Batch Progress Header */}
      {busy && (
        <div className="space-y-2 rounded-2xl border border-jevah-accent/30 bg-jevah-accent/5 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-jevah-text">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-jevah-accent" />
              <span>
                Batch Uploading: {completedCount} of {totalCount} Songs Uploaded
              </span>
            </span>
            <span className="font-mono font-black text-jevah-accent">
              {overallPct}% Overall
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-jevah-accent via-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Master Upload Button */}
      <button
        type="submit"
        disabled={busy || !canSubmit}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-jevah-accent/30 transition-all duration-200 hover:from-jevah-accent-hover hover:to-emerald-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Uploading Songs ({completedCount}/{totalCount})…</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>
                {publish
                  ? `Upload & Publish ${totalCount > 1 ? `${totalCount} Songs` : "Song"}`
                  : `Upload ${totalCount > 1 ? `${totalCount} Songs` : "Song"} as Draft`}
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}

