import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function CreatorUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<CreatorMe | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("gospel");
  const [category, setCategory] = useState("worship");
  const [language, setLanguage] = useState("en");
  const [publish, setPublish] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div className="creator-shell jevah-dashboard-shell min-h-dvh px-4 pb-16 pt-10 font-sans antialiased sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          to="/creators/studio"
          className="text-sm font-semibold text-jevah-accent hover:underline"
        >
          ← Studio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-jevah-text">Upload track</h1>
        <p className="mt-1 text-sm text-jevah-text-muted">
          Artist lane · intent → PUT → finalize
        </p>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="mt-6 space-y-4 rounded-2xl border border-jevah-border bg-jevah-surface p-6 shadow-sm"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-jevah-text-muted">
              Title
            </span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["Genre", genre, setGenre],
                ["Category", category, setCategory],
                ["Lang", language, setLanguage],
              ] as const
            ).map(([label, value, set]) => (
              <label key={label} className="block">
                <span className="mb-1 block text-xs text-jevah-text-muted">{label}</span>
                <input
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={inputClass}
                />
              </label>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onDrop(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed px-4 py-10 text-center ${
              dragOver
                ? "border-jevah-accent bg-jevah-accent/5"
                : "border-jevah-border bg-jevah-muted"
            }`}
          >
            <p className="text-sm font-medium">Drop audio / cover</p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border bg-jevah-surface px-3 py-2 text-xs font-semibold"
              >
                Audio
              </button>
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="rounded-lg border bg-jevah-surface px-3 py-2 text-xs font-semibold"
              >
                Cover
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav"
              className="hidden"
              onChange={(e) => onDrop(e.target.files)}
            />
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onDrop(e.target.files)}
            />
            {(audioFile || coverFile) && (
              <div className="mt-3 space-y-1 text-left text-xs text-jevah-text-muted">
                {audioFile && <p>Audio: {audioFile.name}</p>}
                {coverFile && <p>Cover: {coverFile.name}</p>}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-jevah-text-muted">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
            />
            Publish after finalize
          </label>

          {progress && (
            <p className="text-sm font-medium text-jevah-accent">{progress}</p>
          )}

          <button
            type="submit"
            disabled={busy || !audioFile}
            className="w-full rounded-xl bg-jevah-accent py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? progress || "Working…" : "Upload & finalize"}
          </button>
        </form>
      </div>
    </div>
  );
}
