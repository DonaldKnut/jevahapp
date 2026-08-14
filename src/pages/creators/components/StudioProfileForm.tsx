import { FormEvent, useEffect, useState } from "react";
import { TRACK_GENRES, genreLabel } from "../../../lib/media";
import { inputClass } from "../../../components/ui/forms";
import type { ArtistCard } from "../../../types/creator";

const SOCIAL_KEYS = [
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/…" },
  { id: "website", label: "Website", placeholder: "https://" },
] as const;

export default function StudioProfileForm({
  artist,
  busy,
  onSave,
}: {
  artist: ArtistCard | null;
  busy: boolean;
  onSave: (body: {
    displayName: string;
    bio?: string;
    genres?: string[];
    socials?: Record<string, string>;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [socials, setSocials] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(artist?.displayName || artist?.name || "");
    setBio(artist?.bio || "");
    setGenres(artist?.genres || []);
    setSocials(artist?.socials || {});
  }, [artist]);

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(socials)) {
      if (v?.trim()) cleaned[k] = v.trim();
    }
    await onSave({
      displayName: name.trim(),
      bio: bio.trim() || undefined,
      genres,
      socials: Object.keys(cleaned).length ? cleaned : undefined,
    });
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-[0_8px_30px_var(--jevah-shadow)]"
    >
      <div className="border-b border-jevah-border/60 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-black tracking-tight text-jevah-text">
          Public artist
        </h2>
        <p className="text-xs text-jevah-text-muted">
          How listeners see you on Jevah — name, story, and links.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
            Stage name
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
            Bio
          </span>
          <textarea
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={inputClass}
            placeholder="Who you minister to, what you write, where you’re from…"
          />
          <span className="mt-1 block text-[11px] text-jevah-text-muted">
            {bio.length}/500
          </span>
        </label>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {TRACK_GENRES.map((g) => {
              const on = genres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                    on
                      ? "bg-jevah-accent text-white ring-jevah-accent"
                      : "bg-jevah-card text-jevah-text-muted ring-jevah-border"
                  }`}
                >
                  {genreLabel(g)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {SOCIAL_KEYS.map((s) => (
            <label key={s.id} className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                {s.label}
              </span>
              <input
                value={socials[s.id] || ""}
                onChange={(e) =>
                  setSocials((prev) => ({ ...prev, [s.id]: e.target.value }))
                }
                className={inputClass}
                placeholder={s.placeholder}
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-jevah-accent/20 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save artist page"}
          </button>
        </div>
      </div>
    </form>
  );
}
