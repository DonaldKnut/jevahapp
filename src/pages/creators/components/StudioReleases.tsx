import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createRelease,
  deleteRelease,
  listMyReleases,
  publishRelease,
  type ReleaseCard,
  type ReleaseType,
} from "../../../services/creatorsApi";
import { ApiError } from "../../../lib/api";
import { useFeedback } from "../../../components/admin/Feedback";
import { inputClass } from "../../../components/ui/forms";
import {
  PlusIcon,
  MusicalNoteIcon,
  TrashIcon,
  RocketLaunchIcon,
  SparklesIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";

const TYPES: { id: ReleaseType; label: string; hint: string }[] = [
  { id: "single", label: "Single", hint: "1 Track" },
  { id: "ep", label: "EP", hint: "2–6 Tracks" },
  { id: "album", label: "Album", hint: "7+ Tracks" },
  { id: "mixtape", label: "Mixtape", hint: "Collection" },
];

export default function StudioReleases() {
  const { toast, confirm } = useFeedback();
  const [releases, setReleases] = useState<ReleaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReleaseType>("single");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReleases(await listMyReleases({ limit: 40 }));
    } catch {
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const r = await createRelease({ title: title.trim(), type });
      toast.success("Release created", "You can now add tracks to this release");
      setTitle("");
      setCreating(false);
      setReleases((prev) => [r, ...prev]);
    } catch (err) {
      toast.error(
        "Could not create release",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function onPublish(r: ReleaseCard) {
    const ok = await confirm({
      title: "Publish this release?",
      message: `"${r.title}" will be published live on your public Artist profile.`,
      confirmLabel: "Publish Release",
      tone: "primary",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const next = await publishRelease(r.id);
      toast.success("Release Published", next.title);
      await load();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Publish failed.";
      if (
        err instanceof ApiError &&
        /TYPE_HINT_MISMATCH/i.test(JSON.stringify(err.body || msg))
      ) {
        const skip = await confirm({
          title: "Track count mismatch",
          message: "Publish anyway despite track count warning?",
          confirmLabel: "Publish anyway",
          tone: "warning",
        });
        if (skip) {
          try {
            await publishRelease(r.id, { skipTypeHints: true });
            toast.success("Published");
            await load();
          } catch (e2) {
            toast.error(
              "Publish failed",
              e2 instanceof ApiError ? e2.message : undefined
            );
          }
        }
      } else {
        toast.error("Publish failed", msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(r: ReleaseCard) {
    const ok = await confirm({
      title: "Remove release?",
      message:
        r.status === "draft"
          ? "Draft release will be deleted."
          : "Release will be archived.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteRelease(r.id);
      toast.success("Release removed");
      await load();
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof ApiError ? err.message : undefined
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 p-6 shadow-2xl backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/25">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-jevah-text">
                Discography & Releases
              </h2>
              <p className="text-xs font-semibold text-jevah-text-muted">
                Package your singles, EPs, and albums for listener discography views
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-jevah-accent/25 transition hover:scale-[1.02] active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          Create New Release
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {creating && (
        <form
          onSubmit={(e) => void onCreate(e)}
          className="relative overflow-hidden rounded-3xl border border-jevah-accent/30 bg-gradient-to-br from-jevah-accent/10 via-jevah-surface to-jevah-surface p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-jevah-border/50">
            <h3 className="text-sm font-black text-jevah-text flex items-center gap-2">
              <FolderPlusIcon className="h-4 w-4 text-jevah-accent" />
              New Release Details
            </h3>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs font-bold text-jevah-text-muted hover:text-jevah-text"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Release Title
              </span>
              <input
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Grace & Victory (Deluxe Album)"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Select Release Package Type
              </span>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3.5 text-center transition-all ${
                      type === t.id
                        ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-md ring-2 ring-white/20"
                        : "border border-jevah-border/80 bg-jevah-card/60 text-jevah-text-muted hover:bg-jevah-card"
                    }`}
                  >
                    <span className="text-xs font-black">{t.label}</span>
                    <span className="text-[10px] opacity-75">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-2xl border border-jevah-border/80 px-5 py-2.5 text-xs font-bold text-jevah-text-muted hover:bg-jevah-card"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-lg disabled:opacity-50"
              >
                {busy ? "Creating Release…" : "Save Draft Release"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Releases Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-3xl bg-jevah-card/60"
            />
          ))}
        </div>
      ) : releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-jevah-border/80 bg-jevah-surface/60 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/25">
            <MusicalNoteIcon className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-black text-jevah-text">No releases created</h3>
          <p className="mt-1 max-w-sm text-xs font-medium text-jevah-text-muted">
            Start a single, EP, or album package to categorize your uploaded tracks on your public profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {releases.map((r) => {
            const count = r.trackCount ?? r.tracks?.length ?? 0;
            return (
              <div
                key={r.id}
                className="group relative overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-jevah-accent/40 hover:shadow-2xl"
              >
                {/* Cover Art Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-jevah-accent/20 to-teal-500/10">
                  {r.coverUrl ? (
                    <img
                      src={r.coverUrl}
                      alt={r.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-jevah-accent">
                      <MusicalNoteIcon className="h-14 w-14 opacity-30" />
                    </div>
                  )}

                  {/* Status Badge Overlay */}
                  <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                    r.status === "published"
                      ? "bg-emerald-500/90 text-white ring-1 ring-white/20"
                      : "bg-amber-500/90 text-white ring-1 ring-white/20"
                  }`}>
                    {r.status || "Draft"}
                  </span>

                  {/* Hover Actions Bar */}
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-xs">
                    <Link
                      to={`/creators/studio/upload?releaseId=${encodeURIComponent(r.id)}`}
                      className="flex-1 rounded-2xl bg-white py-2 text-center text-xs font-black text-[#0b1a1f] shadow-md transition hover:scale-105"
                    >
                      Add Tracks
                    </Link>
                    {r.status !== "published" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onPublish(r)}
                        className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-md"
                      >
                        <RocketLaunchIcon className="h-3.5 w-3.5" />
                        Publish
                      </button>
                    )}
                  </div>
                </div>

                {/* Release Card Details */}
                <div className="p-4 space-y-1">
                  <p className="truncate font-extrabold text-sm text-jevah-text">{r.title}</p>
                  <div className="flex items-center justify-between text-xs text-jevah-text-muted font-medium pt-1">
                    <span className="capitalize font-bold text-jevah-accent">
                      {r.type || "single"}
                    </span>
                    <span>{count} {count === 1 ? "track" : "tracks"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-jevah-border/40 text-[11px]">
                    <span className="text-jevah-text-muted">
                      {r.publishedAt || r.releaseDate
                        ? new Date(r.publishedAt || r.releaseDate || "").toLocaleDateString()
                        : "Unpublished"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onDelete(r)}
                      className="inline-flex items-center gap-1 font-bold text-rose-500/80 hover:text-rose-500 transition"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
