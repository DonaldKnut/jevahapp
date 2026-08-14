import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  deleteCreatorTrack,
  fetchCreatorAnalytics,
  fetchCreatorMe,
  listMyCreatorTracks,
  patchCreatorTrack,
  trackId,
  updateCreatorProfile,
  type CreatorAnalytics,
  type CreatorMe,
  type TrackCard,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";
import { TRACK_GENRES, genreLabel } from "../../lib/media";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../components/admin/Feedback";
import { ErrorToaster } from "../../components/ErrorToaster";
import { inputClass } from "../../components/ui/forms";
import CreatorHubByStep from "./components/CreatorHubByStep";
import CreatorAnalyticsDashboard from "./components/CreatorAnalyticsDashboard";
import StudioReleases from "./components/StudioReleases";
import StudioHero from "./components/StudioHero";
import StudioCatalog from "./components/StudioCatalog";
import StudioProfileForm from "./components/StudioProfileForm";
import StudioSidebar, {
  StudioMobileNav,
  type StudioView,
} from "./components/StudioSidebar";
import MarketingEmailPrefsCard from "../../components/MarketingEmailPrefsCard";
import ThemeToggle from "../../components/ThemeToggle";
import AdminModal from "../../components/admin/AdminModal";
import NowPlayingBar from "../../components/music/NowPlayingBar";
import JevahLogo from "../../components/JevahLogo";
import {
  PencilSquareIcon,
  ArrowUpTrayIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const VIEWS: StudioView[] = [
  "home",
  "catalog",
  "releases",
  "insights",
  "profile",
];

function parseView(raw: string | null): StudioView {
  if (raw && VIEWS.includes(raw as StudioView)) return raw as StudioView;
  return "home";
}

export default function CreatorStudio() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const [params, setParams] = useSearchParams();
  const view = parseView(params.get("view"));

  const [me, setMe] = useState<CreatorMe | null>(null);
  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editTrack, setEditTrack] = useState<TrackCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editVisibility, setEditVisibility] = useState("published");
  const [playing, setPlaying] = useState<TrackCard | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const setView = (v: StudioView) => {
    const next = new URLSearchParams(params);
    if (v === "home") next.delete("view");
    else next.set("view", v);
    setParams(next, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCreatorMe();
      let next = data;
      let list: TrackCard[] = [];
      if (data.capabilities.showCreatorHub || data.status === "active") {
        try {
          list = await listMyCreatorTracks({ limit: 100 });
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
          list = [];
        }
      } else {
        setTracks([]);
        setAnalytics(null);
      }
      setMe(next);
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
        setAnalytics(null);
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

  useEffect(() => {
    if (!me || !(me.capabilities.showCreatorHub || me.status === "active")) {
      return;
    }
    let cancelled = false;
    setAnalyticsLoading(true);
    void fetchCreatorAnalytics(tracks, rangeDays)
      .then((a) => {
        if (!cancelled) setAnalytics(a);
      })
      .catch(() => {
        if (!cancelled) setAnalytics(null);
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [me, tracks, rangeDays]);

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
      if (playing && trackId(playing) === id) setPlaying(null);
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
        artistName: editArtist.trim() || undefined,
        genre: editGenre || undefined,
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

  async function onSaveProfile(body: {
    displayName: string;
    bio?: string;
    genres?: string[];
    socials?: Record<string, string>;
  }) {
    setBusy(true);
    try {
      await updateCreatorProfile(body);
      toast.success("Profile updated");
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

  function openEdit(t: TrackCard) {
    setEditTrack(t);
    setEditTitle(t.title || "");
    setEditArtist(t.artistName || t.singer || "");
    setEditGenre(t.genre || "");
    setEditVisibility(t.visibility || "published");
  }

  if (loading) {
    return (
      <div className="jevah-dashboard-shell flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-jevah-accent border-t-transparent shadow-lg" />
          <p className="text-xs font-bold text-jevah-text-muted animate-pulse">
            Opening studio…
          </p>
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
  const totalPlays = tracks.reduce((acc, t) => acc + (t.playCount || 0), 0);
  const hubReady = me.capabilities.showCreatorHub || me.status === "active";
  const recent = [...tracks]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 8);

  return (
    <div className="creator-shell jevah-dashboard-shell flex h-dvh overflow-hidden font-sans antialiased bg-jevah-dashboard-bg">
      <StudioSidebar
        view={view}
        onView={setView}
        initials={initials}
        name={name}
      />

      <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="z-30 shrink-0 border-b border-jevah-border/70 bg-jevah-surface/90 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="inline-flex rounded-xl bg-white px-2 py-1 shadow-md">
                <JevahLogo width={48} height={20} />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="truncate text-xs font-black uppercase tracking-wider text-jevah-text-muted">
                {view === "home"
                  ? "Creator Overview & Desk"
                  : view === "catalog"
                    ? "Full Audio Track Catalog"
                    : view === "releases"
                      ? "Discography & Package Management"
                      : view === "insights"
                        ? "Real-Time Audience Analytics"
                        : "Public Brand & Profile Settings"}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {me.capabilities.canUploadTracks && (
                <Link
                  to="/creators/studio/upload"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-jevah-accent/20 transition hover:scale-[1.02] active:scale-95"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Track</span>
                </Link>
              )}
              <ThemeToggle variant="icon" />
              <button
                type="button"
                onClick={() => void logout().then(() => navigate("/creators"))}
                className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-jevah-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
          <StudioMobileNav view={view} onView={setView} />
        </header>

        <main
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain studio-custom-scrollbar ${playing ? "pb-32" : "pb-12"}`}
        >
          <ErrorToaster error={error} title="Studio error" />

          {view === "home" && (
            <>
              <StudioHero
                name={name}
                initials={initials}
                artist={me.artist}
                status={me.status}
                bio={
                  me.artist?.bio ||
                  "Your music, stream analytics, discography, and public creator brand — all in one desk."
                }
                trackCount={tracks.length}
                totalPlays={totalPlays}
                monthlyListeners={analytics?.uniqueListeners || totalPlays}
                canUpload={me.capabilities.canUploadTracks}
                canEdit={me.capabilities.canEditProfile}
                publicPath={me.capabilities.publicProfilePath}
                onEdit={() => setView("profile")}
              />
              <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <CreatorHubByStep
                  me={me}
                  tracks={tracks}
                  onUpload={() => navigate("/creators/studio/upload")}
                />
                {hubReady && recent.length > 0 && (
                  <StudioCatalog
                    tracks={recent}
                    heading="Recent Uploads"
                    subheading="Latest uploaded audio tracks — switch to Catalog for full library"
                    compact
                    activeId={playing ? trackId(playing) : null}
                    playing={isPlaying}
                    onPlay={setPlaying}
                    onEdit={openEdit}
                    onDelete={(t) => void onDelete(t)}
                  />
                )}
                {hubReady && (
                  <CreatorAnalyticsDashboard
                    analytics={analytics}
                    loading={analyticsLoading}
                    rangeDays={rangeDays}
                    onRangeDays={setRangeDays}
                  />
                )}
              </div>
            </>
          )}

          {view === "catalog" && (
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
              {tracks.length === 0 ? (
                <CreatorHubByStep
                  me={me}
                  tracks={tracks}
                  onUpload={() => navigate("/creators/studio/upload")}
                />
              ) : (
                <StudioCatalog
                  tracks={tracks}
                  activeId={playing ? trackId(playing) : null}
                  playing={isPlaying}
                  onPlay={setPlaying}
                  onEdit={openEdit}
                  onDelete={(t) => void onDelete(t)}
                />
              )}
            </div>
          )}

          {view === "releases" && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {me.capabilities.canUploadTracks || me.status === "active" ? (
                <StudioReleases />
              ) : (
                <CreatorHubByStep
                  me={me}
                  tracks={tracks}
                  onUpload={() => navigate("/creators/studio/upload")}
                />
              )}
            </div>
          )}

          {view === "insights" && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {hubReady ? (
                <CreatorAnalyticsDashboard
                  analytics={analytics}
                  loading={analyticsLoading}
                  rangeDays={rangeDays}
                  onRangeDays={setRangeDays}
                />
              ) : (
                <CreatorHubByStep
                  me={me}
                  tracks={tracks}
                  onUpload={() => navigate("/creators/studio/upload")}
                />
              )}
            </div>
          )}

          {view === "profile" && (
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
              {me.capabilities.canEditProfile ? (
                <StudioProfileForm
                  artist={me.artist}
                  busy={busy}
                  onSave={onSaveProfile}
                />
              ) : (
                <CreatorHubByStep
                  me={me}
                  tracks={tracks}
                  onUpload={() => navigate("/creators/studio/upload")}
                />
              )}
              <div className="max-w-3xl">
                <MarketingEmailPrefsCard />
              </div>
            </div>
          )}
        </main>
      </div>

      <NowPlayingBar
        track={playing}
        queue={tracks}
        onTrackChange={setPlaying}
        onPlayingChange={setIsPlaying}
        onClose={() => setPlaying(null)}
        shelfLabel="Studio preview"
      />

      {editTrack && (
        <AdminModal
          open={!!editTrack}
          onClose={() => setEditTrack(null)}
          title="Edit track"
          subtitle={editTrack.title}
          icon={<PencilSquareIcon className="h-5 w-5" />}
          busy={busy}
          size="lg"
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
                className="flex-1 rounded-2xl bg-gradient-to-r from-jevah-accent to-emerald-600 py-3 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          }
        >
          <form onSubmit={(e) => void onSaveTrack(e)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Title
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
                Credited artist
              </span>
              <input
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Genre
              </span>
              <select
                value={editGenre}
                onChange={(e) => setEditGenre(e.target.value)}
                className={inputClass}
              >
                <option value="">Unset</option>
                {TRACK_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {genreLabel(g)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                Visibility
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

    </div>
  );
}
