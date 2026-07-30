import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  deleteCreatorTrack,
  fetchCreatorMe,
  listMyCreatorTracks,
  patchCreatorTrack,
  trackArtist,
  trackId,
  trackPlaybackUrl,
  trackProcessing,
  updateCreatorProfile,
  type CreatorMe,
  type TrackCard,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../components/admin/Feedback";
import { inputClass } from "../../components/ui/forms";
import CreatorHubByStep from "./components/CreatorHubByStep";
import ThemeToggle from "../../components/ThemeToggle";

export default function CreatorStudio() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();

  const [me, setMe] = useState<CreatorMe | null>(null);
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editTrack, setEditTrack] = useState<TrackCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVisibility, setEditVisibility] = useState("published");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCreatorMe();
      let next = data;
      if (data.capabilities.showCreatorHub || data.status === "active") {
        try {
          const list = await listMyCreatorTracks({ limit: 50 });
          setTracks(list);
          if (
            data.capabilities.nextStep === "manage_catalog" &&
            list.length === 0 &&
            data.capabilities.canUploadTracks
          ) {
            next = {
              ...data,
              capabilities: {
                ...data.capabilities,
                nextStep: "upload_first_track",
              },
              nextStep: "upload_first_track",
            };
          }
        } catch {
          setTracks([]);
        }
      }
      setMe(next);
      setProfileName(next.artist?.displayName || next.artist?.name || "");
      setProfileBio(next.artist?.bio || "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMe({
          artist: null,
          status: null,
          canUpload: false,
          nextStep: "apply",
          capabilities: {
            canApply: true,
            canEditProfile: false,
            canUploadTracks: false,
            canPublishTracks: false,
            showPendingBanner: false,
            showCreatorHub: false,
            showPublicProfile: false,
            publicProfilePath: null,
            nextStep: "apply",
            statusMessage:
              "Share your music on Jevah — apply to become a creator.",
          },
        });
      } else {
        setError(
          err instanceof ApiError ? err.message : "Failed to load creator hub."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(t: TrackCard) {
    const id = trackId(t);
    const ok = await confirm({
      title: "Delete track?",
      message: `"${t.title}" will be permanently removed.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteCreatorTrack(id);
      toast.success("Track deleted");
      await load();
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof ApiError ? err.message : undefined
      );
    }
  }

  async function onSaveTrack(e: FormEvent) {
    e.preventDefault();
    if (!editTrack) return;
    setBusy(true);
    try {
      await patchCreatorTrack(trackId(editTrack), {
        title: editTitle.trim(),
        visibility: editVisibility,
      });
      toast.success("Track updated");
      setEditTrack(null);
      await load();
    } catch (err) {
      toast.error(
        "Update failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateCreatorProfile({
        displayName: profileName.trim(),
        bio: profileBio.trim() || undefined,
      });
      toast.success("Profile updated");
      setProfileOpen(false);
      await load();
    } catch (err) {
      toast.error(
        "Profile update failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F3F7F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#256E63] border-t-transparent" />
      </div>
    );
  }

  if (!me) return <Navigate to="/creators" replace />;

  const name =
    me.artist?.displayName || me.artist?.name || user?.email || "Creator";

  return (
    <div className="creator-shell min-h-dvh bg-jevah-muted font-sans antialiased transition-colors duration-300 dark:bg-jevah-bg">
      <header className="border-b border-jevah-border bg-jevah-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#256E63]">
              Creator studio
            </p>
            <h1 className="text-lg font-bold text-[#0B1A1F]">{name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            {me.capabilities.publicProfilePath && (
              <Link
                to={me.capabilities.publicProfilePath}
                className="hidden rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 sm:inline-flex"
              >
                Public profile
              </Link>
            )}
            <button
              type="button"
              onClick={() => void logout().then(() => navigate("/creators"))}
              className="rounded-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            to="/creators"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
          >
            Overview
          </Link>
          {me.capabilities.canUploadTracks && (
            <Link
              to="/creators/studio/upload"
              className="rounded-full bg-[#256E63] px-4 py-2 text-xs font-semibold text-white"
            >
              Upload
            </Link>
          )}
          {me.capabilities.canEditProfile && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
            >
              Edit profile
            </button>
          )}
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
          >
            Refresh
          </button>
        </div>

        <CreatorHubByStep
          me={me}
          tracks={tracks}
          onUpload={() => navigate("/creators/studio/upload")}
        />

        {tracks.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-[#0B1A1F]">My tracks</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {tracks.map((t) => {
                const url = trackPlaybackUrl(t);
                const status = trackProcessing(t);
                return (
                  <li
                    key={trackId(t)}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#0B1A1F]">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trackArtist(t)} · {t.visibility || "—"} · {status}
                        {t.playCount != null ? ` · ${t.playCount} plays` : ""}
                      </p>
                      {url && (
                        <audio
                          controls
                          preload="none"
                          className="mt-2 w-full max-w-md"
                          src={url}
                        >
                          <track kind="captions" />
                        </audio>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditTrack(t);
                          setEditTitle(t.title || "");
                          setEditVisibility(t.visibility || "published");
                        }}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(t)}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      {editTrack && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={(e) => void onSaveTrack(e)}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">Edit track</h3>
            <div className="mt-4 space-y-3">
              <Field label="Title" value={editTitle} onChange={setEditTitle} />
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">
                  Visibility
                </span>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value)}
                  className={inputClass}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setEditTrack(null)}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-[#256E63] py-3 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={(e) => void onSaveProfile(e)}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">Edit profile</h3>
            <div className="mt-4 space-y-3">
              <Field
                label="Display name"
                value={profileName}
                onChange={setProfileName}
              />
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">Bio</span>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-[#256E63] py-3 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-600">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}
