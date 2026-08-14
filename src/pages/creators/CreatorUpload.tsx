import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createCreatorUploadIntent,
  fetchCreatorMe,
  finalizeCreatorTrack,
  type CreatorMe,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../components/admin/Feedback";
import { inputClass } from "../../components/ui/forms";
import { usePresignedTrackUpload } from "../../hooks/usePresignedTrackUpload";
import { TRACK_GENRES, genreLabel } from "../../lib/media";
import JevahLogo from "../../components/JevahLogo";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import UploadPromoAside from "./components/UploadPromoAside";
import UploadDropZone from "./components/UploadDropZone";
import UploadSubmitPanel from "./components/UploadSubmitPanel";

export default function CreatorUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const releaseId = params.get("releaseId") || undefined;
  const { toast } = useFeedback();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<CreatorMe | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>("gospel");
  const [category, setCategory] = useState("worship");
  const [language, setLanguage] = useState("en");
  const [publish, setPublish] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const uploadApi = useMemo(
    () => ({
      createIntent: createCreatorUploadIntent,
      finalize: (trackId: string, shouldPublish: boolean) =>
        finalizeCreatorTrack(trackId, { publish: shouldPublish }),
    }),
    []
  );
  const { upload, busy, progress, validateFiles } =
    usePresignedTrackUpload(uploadApi);

  useEffect(() => {
    void fetchCreatorMe()
      .then((data) => {
        setMe(data);
        if (!data.capabilities.canUploadTracks) {
          toast.warning("Under review", data.capabilities.statusMessage);
          navigate("/creators/studio", { replace: true });
        }
      })
      .catch(() => navigate("/creators/studio", { replace: true }));
  }, [navigate, toast]);

  function onDrop(files: FileList | null) {
    if (!files?.length) return;
    const audio = Array.from(files).find(
      (f) =>
        f.type.startsWith("audio/") ||
        /\.(mp3|m4a|wav|aac|ogg)$/i.test(f.name)
    );
    const image = Array.from(files).find((f) => f.type.startsWith("image/"));
    try {
      if (audio) {
        validateFiles(audio, image || null);
        setAudioFile(audio);
      }
      if (image) {
        if (audio) validateFiles(audio, image);
        else if (image.size > 5 * 1024 * 1024) {
          throw new Error("Cover max is 5MB.");
        }
        setCoverFile(image);
        const reader = new FileReader();
        reader.onload = (e) => setCoverPreview(e.target?.result as string);
        reader.readAsDataURL(image);
      }
    } catch (err) {
      toast.error(
        "Invalid file",
        err instanceof Error ? err.message : undefined
      );
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!audioFile || !title.trim()) return;
    try {
      const artistName =
        me?.artist?.displayName ||
        me?.artist?.name ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Creator";

      await upload({
        title,
        artistName,
        genre,
        category,
        language,
        audioFile,
        coverFile,
        publish,
        extraIntent: releaseId ? { releaseId } : undefined,
      });
      toast.success(publish ? "Published" : "Saved as draft");
      navigate("/creators/studio", { replace: true });
    } catch (err) {
      toast.error(
        "Upload failed",
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : undefined
      );
    }
  }

  const progressPct = busy
    ? progress?.includes("100")
      ? 100
      : progress?.includes("Upload")
        ? 40
        : progress?.includes("Finali")
          ? 80
          : 20
    : 0;

  return (
    <div className="creator-shell jevah-dashboard-shell min-h-dvh font-sans antialiased transition-colors duration-300">
      <header className="studio-topbar sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
              <JevahLogo width={68} height={28} />
            </div>
            <div className="h-4 w-px bg-jevah-border" />
            <span className="inline-flex items-center gap-1 rounded-full bg-jevah-accent/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-jevah-accent">
              <CloudArrowUpIcon className="h-3 w-3" />
              Upload Studio
            </span>
          </div>
          <Link
            to="/creators/studio"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-jevah-text-muted transition hover:bg-jevah-card"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Studio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <UploadPromoAside />

          <div className="lg:col-span-7">
            <div className="relative mb-6 overflow-hidden rounded-3xl border border-jevah-border/80 bg-gradient-to-br from-jevah-accent/10 via-jevah-surface to-jevah-surface p-6 shadow-[0_8px_32px_var(--jevah-shadow)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-jevah-accent/15 blur-3xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent shadow-md ring-1 ring-jevah-accent/25">
                  <CloudArrowUpIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-jevah-text">
                    Upload a Track
                  </h1>
                  <p className="mt-0.5 text-xs font-medium text-jevah-text-muted">
                    {releaseId
                      ? "This track will be attached to your selected release (Artists shelf only)."
                      : "Fill in track details, drag & drop audio/cover files, then publish to your catalog."}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
                <div className="flex items-center gap-2.5 border-b border-jevah-border/60 px-6 py-4">
                  <SparklesIcon className="h-4 w-4 text-jevah-accent" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-jevah-text">
                    Track Details
                  </h2>
                </div>
                <div className="space-y-4 p-6">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                      Track Title *
                    </span>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Amazing Grace (Live)"
                      className={inputClass}
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                        Genre
                      </span>
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className={inputClass}
                      >
                        {TRACK_GENRES.map((g) => (
                          <option key={g} value={g}>
                            {genreLabel(g)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                        Category
                      </span>
                      <input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="worship"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                        Language
                      </span>
                      <input
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="en"
                        className={inputClass}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <UploadDropZone
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={onDrop}
                fileRef={fileRef}
                coverRef={coverRef}
                audioFile={audioFile}
                coverFile={coverFile}
                coverPreview={coverPreview}
                onClearCover={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              />

              <UploadSubmitPanel
                publish={publish}
                setPublish={setPublish}
                busy={busy}
                progress={progress}
                progressPct={progressPct}
                canSubmit={Boolean(audioFile)}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
