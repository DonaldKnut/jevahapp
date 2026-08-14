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
      const msg = err instanceof ApiError ? err.message : "Publish failed.";
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
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-jevah-text">
            Discography
          </h2>
          <p className="mt-1 text-sm text-jevah-text-muted">
            Singles, EPs, and albums on the Artists shelf — never mixed into
            Copyright-free.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-jevah-accent px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/20 hover:bg-jevah-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          New release
        </button>
      </div>

      {creating && (
        <form
          onSubmit={(e) => void onCreate(e)}
          className="mb-6 space-y-3 rounded-3xl border border-jevah-accent/25 bg-gradient-to-br from-jevah-accent/10 via-jevah-surface to-jevah-surface p-5"
        >
          <input
            required
            autoFocus
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-3xl bg-jevah-card"
            />
          ))}
        </div>
      ) : releases.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-jevah-border bg-jevah-surface/70 px-6 py-16 text-center">
          <MusicalNoteIcon className="mx-auto h-10 w-10 text-jevah-accent/50" />
          <p className="mt-3 text-sm font-semibold text-jevah-text-muted">
            No releases yet. Start a single or EP, then drop tracks into it.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {releases.map((r) => {
            const count = r.trackCount ?? r.tracks?.length ?? 0;
            return (
              <li
                key={r.id}
                className="group overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_var(--jevah-shadow)]"
              >
                <div className="relative aspect-square bg-jevah-card">
                  {r.coverUrl ? (
                    <img
                      src={r.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-jevah-accent">
                      <MusicalNoteIcon className="h-12 w-12 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                    <Link
                      to={`/creators/studio/upload?releaseId=${encodeURIComponent(r.id)}`}
                      className="flex-1 rounded-full bg-white px-2 py-1.5 text-center text-[10px] font-extrabold text-[#0b1a1f]"
                    >
                      Add track
                    </Link>
                    {r.status !== "published" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onPublish(r)}
                        className="inline-flex items-center gap-1 rounded-full bg-jevah-accent px-2.5 py-1.5 text-[10px] font-extrabold text-white"
                      >
                        <RocketLaunchIcon className="h-3 w-3" />
                        Publish
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="truncate font-bold text-jevah-text">{r.title}</p>
                  <p className="mt-0.5 text-[11px] font-semibold capitalize text-jevah-text-muted">
                    {r.type || "single"} · {r.status || "draft"} · {count}{" "}
                    {count === 1 ? "track" : "tracks"}
                  </p>
                  {r.publishedAt || r.releaseDate ? (
                    <p className="mt-0.5 text-[10px] text-jevah-text-muted">
                      {new Date(
                        r.publishedAt || r.releaseDate || ""
                      ).toLocaleDateString()}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void onDelete(r)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600/80 hover:text-rose-600 dark:text-rose-400"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
