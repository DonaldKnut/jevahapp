import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  applyAsCreator,
  fetchCreatorMe,
  type CreatorMe,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";
import { useFeedback } from "../../components/admin/Feedback";
import { ErrorToaster } from "../../components/ErrorToaster";

const CREATOR_TYPES = [
  { id: "artist", label: "Artist" },
  { id: "minister", label: "Minister" },
  { id: "podcaster", label: "Podcaster" },
] as const;

const GENRE_OPTIONS = [
  "gospel",
  "afro_gospel",
  "worship",
  "hymn",
  "contemporary",
  "choir",
];

const inputClass =
  "w-full rounded-xl border border-jevah-border bg-jevah-input px-4 py-3 text-sm text-jevah-text outline-none transition placeholder:text-jevah-text-muted focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/15";

export default function CreatorApply() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [me, setMe] = useState<CreatorMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [types, setTypes] = useState<string[]>(["artist"]);
  const [genres, setGenres] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");
  const [note, setNote] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchCreatorMe();
        if (!alive) return;
        setMe(data);
        if (data.artist?.displayName || data.artist?.name) {
          setDisplayName(data.artist.displayName || data.artist.name || "");
        }
        if (!data.capabilities.canApply && data.capabilities.showCreatorHub) {
          navigate("/creators/studio", { replace: true });
        }
      } catch {
        /* first-time applicants may 404 until apply */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  function toggleType(id: string) {
    setTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!types.length) {
      setError("Pick at least one creator type.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const socials: Record<string, string> = {};
      if (instagram.trim()) socials.instagram = instagram.trim();
      if (youtube.trim()) socials.youtube = youtube.trim();
      if (spotify.trim()) socials.spotify = spotify.trim();

      const result = await applyAsCreator({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        genres,
        creatorTypes: types,
        socials: Object.keys(socials).length ? socials : undefined,
        applicationNote: note.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setMe(result);
      toast.success("Application submitted", result.capabilities.statusMessage);
      navigate("/creators/studio", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not submit application.";
      setError(msg);
      toast.error("Apply failed", msg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-jevah-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="jevah-dashboard-shell mx-auto max-w-xl px-4 pb-20 pt-28 font-sans antialiased sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jevah-accent">
        Apply
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-jevah-text">
        Become a creator
      </h1>
      <p className="mt-2 text-sm text-jevah-text-muted">
        Same form as mobile. Admins review in the Artists queue.
      </p>

      {me?.capabilities.showPendingBanner && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {me.capabilities.statusMessage}
        </div>
      )}

      <ErrorToaster error={error} title="Application error" />

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-jevah-text">I am a…</p>
          <div className="flex flex-wrap gap-2">
            {CREATOR_TYPES.map((t) => {
              const on = types.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    on
                      ? "bg-jevah-accent text-white"
                      : "border border-jevah-border bg-jevah-surface text-jevah-text-muted hover:border-jevah-accent/40"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
            Display name
          </span>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
            placeholder="Grace Collective"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
            Bio
          </span>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={inputClass}
            placeholder="Gospel worship from Lagos"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-jevah-text">Genres</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => {
              const on = genres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                    on
                      ? "bg-jevah-brand text-white"
                      : "border border-jevah-border text-jevah-text-muted"
                  }`}
                >
                  {g.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
              Instagram
            </span>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
              YouTube
            </span>
            <input
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
              Spotify
            </span>
            <input
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
            Avatar URL (optional)
          </span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className={inputClass}
            placeholder="https://…"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
            Note to reviewers
          </span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            placeholder="We lead youth worship…"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-jevah-accent py-3.5 text-sm font-semibold text-white transition hover:bg-jevah-accent-hover disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit application"}
        </button>

        <p className="text-center text-sm text-jevah-text-muted">
          <Link to="/creators" className="text-jevah-accent hover:underline">
            Back to Creators
          </Link>
        </p>
      </form>
    </div>
  );
}
