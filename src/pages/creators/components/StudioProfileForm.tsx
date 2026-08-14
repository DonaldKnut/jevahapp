import { FormEvent, useEffect, useState } from "react";
import { TRACK_GENRES, genreLabel } from "../../../lib/media";
import { inputClass } from "../../../components/ui/forms";
import type { ArtistCard } from "../../../types/creator";
import {
  UserCircleIcon,
  SparklesIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const SOCIAL_KEYS = [
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { id: "youtube", label: "YouTube Channel", placeholder: "https://youtube.com/@channel" },
  { id: "website", label: "Official Website", placeholder: "https://yourwebsite.com" },
  { id: "spotify", label: "Spotify Artist Link", placeholder: "https://open.spotify.com/artist/…" },
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

  const avatar = artist?.avatarUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Form Column */}
      <form
        onSubmit={(e) => void submit(e)}
        className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-2xl backdrop-blur-2xl lg:col-span-8"
      >
        <div className="flex items-center gap-3 border-b border-jevah-border/60 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-jevah-accent/15 text-jevah-accent ring-1 ring-jevah-accent/25">
            <UserCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-jevah-text">
              Public Artist Brand Profile
            </h2>
            <p className="text-xs font-semibold text-jevah-text-muted">
              Configure how listeners see your stage name, bio, and social channels on Jevah.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Stage Name */}
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-jevah-text-muted">
              Stage / Minister Name *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Pastor David Cole, Grace Worship..."
            />
          </label>

          {/* Bio */}
          <label className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs font-black uppercase tracking-wider text-jevah-text-muted">
                Artist Bio & Story
              </span>
              <span className="text-[11px] font-bold text-jevah-text-muted">
                {bio.length}/500 characters
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClass}
              placeholder="Share your calling, music ministry story, home church, or inspriation..."
            />
          </label>

          {/* Genres Chips Selector */}
          <div>
            <p className="mb-2.5 text-xs font-black uppercase tracking-wider text-jevah-text-muted">
              Primary Genres / Ministry Focus
            </p>
            <div className="flex flex-wrap gap-2">
              {TRACK_GENRES.map((g) => {
                const on = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                      on
                        ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-md ring-1 ring-white/20 scale-105"
                        : "bg-jevah-card/70 text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
                    }`}
                  >
                    {genreLabel(g)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-black uppercase tracking-wider text-jevah-text-muted">
              Social Links & External Profiles
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_KEYS.map((s) => (
                <label key={s.id} className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-jevah-text-muted">
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
          </div>

          <div className="flex justify-end pt-4 border-t border-jevah-border/50">
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-jevah-accent/25 hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {busy ? "Saving Profile…" : "Save Artist Profile"}
            </button>
          </div>
        </div>
      </form>

      {/* Right Column: Live Profile Card Preview */}
      <div className="lg:col-span-4 space-y-4">
        <div className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-4 w-4 text-jevah-accent" />
            <h3 className="text-xs font-black uppercase tracking-wider text-jevah-text">
              Live Card Preview
            </h3>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b2024] to-[#050c0e] p-5 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-jevah-accent to-emerald-400 text-2xl font-black ring-2 ring-white/20 shadow-md">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  name[0]?.toUpperCase() || "A"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="truncate text-base font-black text-white">
                    {name || "Your Artist Name"}
                  </h4>
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-emerald-300">Verified Creator</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/70 line-clamp-3">
              {bio || "Your bio will be displayed here for listeners exploring your music."}
            </p>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/90"
                  >
                    {genreLabel(g)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-jevah-text-muted">
            <InformationCircleIcon className="h-4 w-4 shrink-0 text-jevah-accent mt-0.5" />
            <p>Changes saved here update live on your public Artist page immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
