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
import { ErrorToaster } from "../../components/ErrorToaster";
import { inputClass } from "../../components/ui/forms";
import CreatorHubByStep from "./components/CreatorHubByStep";
import MarketingEmailPrefsCard from "../../components/MarketingEmailPrefsCard";
import ThemeToggle from "../../components/ThemeToggle";
import AdminModal from "../../components/admin/AdminModal";
import JevahLogo from "../../components/JevahLogo";
import {
  MusicalNoteIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  UserIcon,
  SparklesIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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
      <div className="jevah-dashboard-shell flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-jevah-accent border-t-transparent shadow-lg" />
          <p className="text-xs font-bold text-jevah-text-muted animate-pulse">Loading Studio...</p>
        </div>
      </div>
    );
  }

  if (!me) return <Navigate to="/creators" replace />;

  const name =
    me.artist?.displayName || me.artist?.name || user?.email || "Creator";

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="creator-shell jevah-dashboard-shell min-h-dvh font-sans antialiased transition-colors duration-300">
      {/* ── Studio Header ── */}
      <header className="sticky top-0 z-30 border-b border-jevah-border/70 bg-jevah-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
              <JevahLogo width={68} height={28} />
            </div>
            <div className="h-4 w-px bg-jevah-border" />
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-jevah-accent/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-jevah-accent">
                <SparklesIcon className="h-3 w-3" />
                Artist Studio
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            {me.capabilities.publicProfilePath && (
              <Link
                to={me.capabilities.publicProfilePath}
                className="hidden items-center gap-1.5 rounded-xl border border-jevah-border bg-jevah-surface px-3 py-2 text-xs font-bold text-jevah-text shadow-sm hover:bg-jevah-card sm:inline-flex"
              >
                <GlobeAltIcon className="h-3.5 w-3.5 text-jevah-accent" />
                Public profile
              </Link>
            )}
            <button
              type="button"
              onClick={() => void logout().then(() => navigate("/creators"))}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-jevah-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition"
            >
              <ArrowRightOnRectangleIcon className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <ErrorToaster error={error} title="Studio error" />

        {/* ── World-Class Creator Hero Card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-jevah-border/80 bg-gradient-to-br from-jevah-accent/15 via-jevah-surface to-jevah-surface p-6 sm:p-8 shadow-[0_10px_35px_var(--jevah-shadow)] backdrop-blur-xl">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-xl font-black text-white shadow-lg shadow-jevah-accent/30 ring-2 ring-white/20">
                {initials || "C"}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 admin-online-dot shadow-sm" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl font-black tracking-tight text-jevah-text sm:text-3xl">
                    {name}
                  </h1>
                  {me.status === "active" && (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500 shrink-0" title="Verified Creator" />
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-jevah-text-muted">
                  {me.artist?.bio || "Welcome to your creator hub. Manage your audio catalog and studio release profile."}
                </p>
              </div>
            </div>

            {/* Actions & Quick Stats */}
            <div className="flex flex-wrap items-center gap-2.5">
              {me.capabilities.canUploadTracks && (
                <Link
                  to="/creators/studio/upload"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/30 hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Upload track
                </Link>
              )}
              {me.capabilities.canEditProfile && (
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-surface/90 px-4 py-3 text-xs font-extrabold text-jevah-text shadow-sm hover:bg-jevah-card transition active:scale-95"
                >
                  <PencilSquareIcon className="h-4 w-4 text-jevah-accent" />
                  Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-jevah-border/60 sm:grid-cols-4">
            <div className="rounded-2xl border border-jevah-border/60 bg-jevah-surface/60 p-3 backdrop-blur-md">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-jevah-text-muted">Total Tracks</p>
              <p className="mt-0.5 text-xl font-black text-jevah-text">{tracks.length}</p>
            </div>
            <div className="rounded-2xl border border-jevah-border/60 bg-jevah-surface/60 p-3 backdrop-blur-md">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-jevah-text-muted">Total Plays</p>
              <p className="mt-0.5 text-xl font-black text-jevah-accent">
                {tracks.reduce((acc, t) => acc + (t.playCount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-jevah-border/60 bg-jevah-surface/60 p-3 backdrop-blur-md">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-jevah-text-muted">Account Status</p>
              <p className="mt-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 capitalize">
                {me.status || me.capabilities.nextStep.replace(/_/g, " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-jevah-border/60 bg-jevah-surface/60 p-3 backdrop-blur-md">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-jevah-text-muted">Capabilities</p>
              <p className="mt-0.5 text-xs font-extrabold text-jevah-text">
                {me.capabilities.canPublishTracks ? "Publish Enabled" : "Under Review"}
              </p>
            </div>
          </div>
        </div>

        {/* Step status hub callout */}
        <CreatorHubByStep
          me={me}
          tracks={tracks}
          onUpload={() => navigate("/creators/studio/upload")}
        />

        <MarketingEmailPrefsCard />

        {/* ── Track Catalog List ── */}
        {tracks.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 shadow-[0_8px_30px_var(--jevah-shadow)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-jevah-border/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
                  <MusicalNoteIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-jevah-text">Release Catalog</h2>
                  <p className="text-xs text-jevah-text-muted">{tracks.length} tracks published & uploaded</p>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-jevah-border/50">
              {tracks.map((t) => {
                const url = trackPlaybackUrl(t);
                const status = trackProcessing(t);
                return (
                  <li
                    key={trackId(t)}
                    className="group flex flex-col gap-4 p-5 transition hover:bg-jevah-card/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-jevah-text group-hover:text-jevah-accent transition">
                          {t.title}
                        </span>
                        <span className="rounded-full bg-jevah-accent/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-jevah-accent ring-1 ring-jevah-accent/20">
                          {t.visibility || "published"}
                        </span>
                        <span className="rounded-full bg-jevah-card px-2.5 py-0.5 text-[10px] font-bold text-jevah-text-muted capitalize">
                          {status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-jevah-text-muted">
                        {trackArtist(t)}
                        {t.playCount != null ? ` · ${t.playCount.toLocaleString()} plays` : ""}
                      </p>

                      {url && (
                        <div className="pt-1">
                          <audio
                            controls
                            preload="none"
                            className="h-9 w-full max-w-lg rounded-xl border border-jevah-border bg-jevah-surface text-xs"
                            src={url}
                          >
                            <track kind="captions" />
                          </audio>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditTrack(t);
                          setEditTitle(t.title || "");
                          setEditVisibility(t.visibility || "published");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-jevah-border bg-jevah-surface px-3.5 py-2 text-xs font-bold text-jevah-text shadow-sm hover:bg-jevah-card active:scale-95 transition"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5 text-jevah-accent" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(t)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 active:scale-95 transition dark:text-rose-400"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
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

      {/* ── High-End Edit Track Modal ── */}
      {editTrack && (
        <AdminModal
          open={!!editTrack}
          onClose={() => setEditTrack(null)}
          title="Edit Track Release"
          subtitle={`Update release parameters for "${editTrack.title}"`}
          icon={<PencilSquareIcon className="h-5 w-5" />}
          busy={busy}
          footer={
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setEditTrack(null)}
                className="flex-1 rounded-2xl border border-jevah-border py-3 text-xs font-bold text-jevah-text-muted hover:bg-jevah-card"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => void onSaveTrack(e)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-3 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/20 hover:shadow-lg disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          }
        >
          <form onSubmit={(e) => void onSaveTrack(e)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Track Title
              </span>
              <input
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Visibility Status
              </span>
              <select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                className={inputClass}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </form>
        </AdminModal>
      )}

      {/* ── High-End Edit Profile Modal ── */}
      {profileOpen && (
        <AdminModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          title="Edit Creator Profile"
          subtitle="Update your artist brand display name and bio"
          icon={<UserIcon className="h-5 w-5" />}
          busy={busy}
          footer={
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex-1 rounded-2xl border border-jevah-border py-3 text-xs font-bold text-jevah-text-muted hover:bg-jevah-card"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => void onSaveProfile(e)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-3 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/20 hover:shadow-lg disabled:opacity-50"
              >
                {busy ? "Updating..." : "Save profile"}
              </button>
            </div>
          }
        >
          <form onSubmit={(e) => void onSaveProfile(e)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Display Name
              </span>
              <input
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Bio / Artist Statement
              </span>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className={inputClass}
              />
            </label>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

