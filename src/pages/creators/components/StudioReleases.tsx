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
} from "@heroicons/react/24/outline";

const TYPES: { id: ReleaseType; label: string; hint: string }[] = [
  { id: "single", label: "Single", hint: "1 track" },
  { id: "ep", label: "EP", hint: "2–6 tracks" },
  { id: "album", label: "Album", hint: "7+ tracks" },
  { id: "mixtape", label: "Mixtape", hint: "Loose set" },
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
      toast.success("Release created", "Add tracks from Upload");
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
      message: `"${r.title}" will appear on your public Artists profile. All tracks must be ready.`,
      confirmLabel: "Publish",
      tone: "primary",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const next = await publishRelease(r.id);
      toast.success("Published", next.title);
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Publish failed.";
      // Retry with skipTypeHints when backend asks
      if (
        err instanceof ApiError &&
        /TYPE_HINT_MISMATCH/i.test(JSON.stringify(err.body || msg))
      ) {
        const skip = await confirm({
          title: "Track count doesn’t match release type",
          message: "Publish anyway?",
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
          ? "Draft will be deleted."
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
    <section className="overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface/90 shadow-[0_8px_30px_var(--jevah-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-jevah-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
            <MusicalNoteIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-jevah-text">
              Releases
            </h2>
            <p className="text-xs text-jevah-text-muted">
              Singles, EPs, albums — Artists shelf only, never Copyright-free
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-jevah-accent px-3.5 py-2 text-xs font-bold text-white hover:bg-jevah-accent-hover"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New release
        </button>
      </div>

      {creating && (
        <form
          onSubmit={(e) => void onCreate(e)}
          className="space-y-3 border-b border-jevah-border bg-jevah-card/40 px-5 py-4 sm:px-6"
        >
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Release title"
          />
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  type === t.id
                    ? "bg-jevah-accent text-white"
                    : "border border-jevah-border text-jevah-text-muted"
                }`}
              >
                {t.label}
                <span className="ml-1 opacity-70">{t.hint}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-xl border border-jevah-border px-4 py-2 text-xs font-bold text-jevah-text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-jevah-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create draft"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl bg-jevah-card"
            />
          ))}
        </div>
      ) : releases.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-jevah-text-muted sm:px-6">
          No releases yet. Create a single or EP, then upload tracks into it.
        </p>
      ) : (
        <ul className="divide-y divide-jevah-border/60">
          {releases.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                {r.coverUrl ? (
                  <img
                    src={r.coverUrl}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jevah-card text-jevah-accent">
                    <MusicalNoteIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-jevah-text">{r.title}</p>
                  <p className="text-xs text-jevah-text-muted capitalize">
                    {r.type || "single"} · {r.status || "draft"} ·{" "}
                    {r.trackCount ?? r.tracks?.length ?? 0} tracks
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/creators/studio/upload?releaseId=${encodeURIComponent(r.id)}`}
                  className="rounded-xl border border-jevah-border px-3 py-2 text-xs font-bold text-jevah-text hover:bg-jevah-card"
                >
                  Add track
                </Link>
                {r.status !== "published" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onPublish(r)}
                    className="inline-flex items-center gap-1 rounded-xl bg-jevah-accent/15 px-3 py-2 text-xs font-bold text-jevah-accent hover:bg-jevah-accent/25"
                  >
                    <RocketLaunchIcon className="h-3.5 w-3.5" />
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void onDelete(r)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
