import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  createCopyrightFreeSong,
  createTrackUploadIntent,
  deleteAdminTrack,
  finalizeTrack,
  listAdminTracks,
  patchAdminTrack,
  trackArtist,
  trackDuration,
  trackId,
  trackPlaybackUrl,
  trackProcessing,
  formatTrackDuration,
  putPresignedFile,
  type TrackCard,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

const emptyMeta = {
  title: "",
  artistName: "",
  category: "",
  genre: "",
  language: "",
  licenseNote: "",
};

type UploadMode = "file" | "url";

export default function AudioLibraryPage() {
  const { confirm, toast } = useFeedback();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tracks, setTracks] = useState<TrackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lane, setLane] = useState<"curated" | "artist">("curated");
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mode, setMode] = useState<UploadMode>("file");
  const [meta, setMeta] = useState(emptyMeta);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [urlForm, setUrlForm] = useState({
    fileUrl: "",
    thumbnailUrl: "",
    duration: "",
  });
  const [progress, setProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<TrackCard | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminTracks({
        lane,
        search: search || undefined,
        limit: 50,
      });
      setTracks(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tracks.");
    } finally {
      setLoading(false);
    }
  }, [search, lane]);

  useEffect(() => {
    void load();
  }, [load]);

  function openUpload() {
    setEditing(null);
    setMeta(emptyMeta);
    setAudioFile(null);
    setCoverFile(null);
    setUrlForm({ fileUrl: "", thumbnailUrl: "", duration: "" });
    setProgress(null);
    setMode("file");
    setUploadOpen(true);
  }

  function openEdit(t: TrackCard) {
    setEditing(t);
    setMeta({
      title: t.title || "",
      artistName: trackArtist(t),
      category: t.category || "",
      genre: t.genre || "",
      language: t.language || "",
      licenseNote: t.licenseNote || "",
    });
    setUploadOpen(true);
  }

  function onDropFiles(files: FileList | null) {
    if (!files?.length) return;
    const audio = Array.from(files).find((f) =>
      f.type.startsWith("audio/") || /\.(mp3|m4a|wav|aac|ogg)$/i.test(f.name)
    );
    const image = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (audio) setAudioFile(audio);
    if (image) setCoverFile(image);
  }

  async function uploadViaPresign() {
    if (!audioFile) throw new Error("Choose an audio file.");
    if (!meta.title.trim() || !meta.artistName.trim()) {
      throw new Error("Title and artist are required.");
    }
    setProgress("Requesting upload slots…");
    const intent = await createTrackUploadIntent({
      title: meta.title.trim(),
      artistName: meta.artistName.trim(),
      category: meta.category || undefined,
      genre: meta.genre || undefined,
      language: meta.language || undefined,
      licenseNote: meta.licenseNote || undefined,
      copyrightStatus: "copyright_free",
      lane: "curated",
      contentType: audioFile.type || "audio/mpeg",
      fileName: audioFile.name,
      fileSizeBytes: audioFile.size,
      coverContentType: coverFile?.type,
      coverFileName: coverFile?.name,
    });

    setProgress("Uploading audio…");
    await putPresignedFile(
      intent.audio.putUrl,
      audioFile,
      intent.audio.headers
    );

    if (coverFile && intent.cover?.putUrl) {
      setProgress("Uploading cover…");
      await putPresignedFile(
        intent.cover.putUrl,
        coverFile,
        intent.cover.headers
      );
    }

    setProgress("Finalizing…");
    await finalizeTrack(intent.trackId, { publish: true });
  }

  async function uploadViaUrl() {
    if (!urlForm.fileUrl.trim()) throw new Error("Playback URL is required.");
    await createCopyrightFreeSong({
      title: meta.title.trim(),
      singer: meta.artistName.trim(),
      fileUrl: urlForm.fileUrl.trim(),
      thumbnailUrl: urlForm.thumbnailUrl.trim() || undefined,
      category: meta.category || undefined,
      duration: urlForm.duration || undefined,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setProgress(null);
    try {
      if (editing) {
        const id = trackId(editing);
        await patchAdminTrack(id, {
          title: meta.title.trim(),
          artistName: meta.artistName.trim(),
          category: meta.category || undefined,
          genre: meta.genre || undefined,
          language: meta.language || undefined,
          licenseNote: meta.licenseNote || undefined,
        });
        toast.success("Track updated");
      } else if (mode === "file") {
        try {
          await uploadViaPresign();
          toast.success("Track uploaded", "It should appear in the app shortly.");
        } catch (err) {
          // If upload-intent isn't live yet, guide admin to URL mode
          if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
            setMode("url");
            throw new Error(
              "File upload API not available yet. Use URL paste, or wait for backend upload-intent."
            );
          }
          throw err;
        }
      } else {
        await uploadViaUrl();
        toast.success("Track created from URL");
      }
      setUploadOpen(false);
      await load();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload failed.";
      setError(msg);
      toast.error("Upload failed", msg);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function onDelete(t: TrackCard) {
    const id = trackId(t);
    if (!id) return;
    const ok = await confirm({
      title: "Delete track?",
      message: `"${t.title}" will be removed from the catalog and storage when supported.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteAdminTrack(id);
      toast.success("Track deleted");
      await load();
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audio library"
        subtitle={
          lane === "curated"
            ? "Curated copyright-free tracks for the mobile app."
            : "Artist-lane catalog (ops / moderation view)."
        }
        actions={
          lane === "curated" ? (
            <Button className="w-full sm:w-auto" onClick={openUpload}>
              Upload track
            </Button>
          ) : undefined
        }
      />

      <Panel>
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setLane("curated")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              lane === "curated"
                ? "bg-white text-[#0B1A1F] shadow-sm"
                : "text-slate-500"
            }`}
          >
            Curated
          </button>
          <button
            type="button"
            onClick={() => setLane("artist")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              lane === "artist"
                ? "bg-white text-[#0B1A1F] shadow-sm"
                : "text-slate-500"
            }`}
          >
            Artist catalog
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or artist"
            className={inputClass}
          />
          <Button variant="secondary" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </Panel>

      {error && !uploadOpen && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={4} />
      ) : tracks.length === 0 ? (
        <EmptyState
          title="No tracks yet"
          description={
            lane === "curated"
              ? "Upload a file or paste a playback URL to seed the curated library."
              : "Artist-lane tracks appear here after creators publish."
          }
          action={
            lane === "curated" ? (
              <Button onClick={openUpload}>Upload track</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((t, i) => {
            const url = trackPlaybackUrl(t);
            const status = trackProcessing(t);
            return (
              <div
                key={trackId(t)}
                className="admin-list-item flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  {t.thumbnailUrl ? (
                    <img
                      src={t.thumbnailUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#256E63]/10 text-xs font-semibold text-[#256E63]">
                      Audio
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#0B1A1F]">
                      {t.title || "Untitled"}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {trackArtist(t)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone="neutral">
                        {formatTrackDuration(trackDuration(t))}
                      </Badge>
                      {t.category && <Badge tone="brand">{t.category}</Badge>}
                      <Badge
                        tone={
                          status === "ready"
                            ? "success"
                            : status === "failed"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {status}
                      </Badge>
                      {t.visibility && (
                        <Badge tone="neutral">{t.visibility}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {url && (
                  <audio controls preload="none" className="mt-3 w-full" src={url}>
                    <track kind="captions" />
                  </audio>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 min-h-9 text-xs"
                    disabled={busy}
                    onClick={() => openEdit(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 min-h-9 text-xs"
                    disabled={busy}
                    onClick={() => void onDelete(t)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">
              {editing ? "Edit track" : "Upload track"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Curated lane · copyright-free for the app library
            </p>

            {!editing && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("file")}
                  className={`rounded-lg py-2 text-sm font-medium transition ${
                    mode === "file"
                      ? "bg-white text-[#0B1A1F] shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={`rounded-lg py-2 text-sm font-medium transition ${
                    mode === "url"
                      ? "bg-white text-[#0B1A1F] shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Paste URL
                </button>
              </div>
            )}

            {error && uploadOpen && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <Field label="Title">
                <input
                  required
                  value={meta.title}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, title: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Artist / singer">
                <input
                  required
                  value={meta.artistName}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, artistName: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <input
                    value={meta.category}
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, category: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="worship, kids…"
                  />
                </Field>
                <Field label="Genre">
                  <input
                    value={meta.genre}
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, genre: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              {!editing && mode === "file" && (
                <>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      onDropFiles(e.dataTransfer.files);
                    }}
                    className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                      dragOver
                        ? "border-[#256E63] bg-[#256E63]/5"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-700">
                      Drop audio here, or browse
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      MP3, M4A, WAV · optional cover image
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose audio
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        Cover image
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.m4a,.wav"
                      className="hidden"
                      onChange={(e) => onDropFiles(e.target.files)}
                    />
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setCoverFile(f);
                      }}
                    />
                    {(audioFile || coverFile) && (
                      <div className="mt-4 space-y-1 text-left text-xs text-slate-600">
                        {audioFile && (
                          <p>
                            Audio:{" "}
                            <span className="font-medium">{audioFile.name}</span>
                          </p>
                        )}
                        {coverFile && (
                          <p>
                            Cover:{" "}
                            <span className="font-medium">{coverFile.name}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {!editing && mode === "url" && (
                <>
                  <Field label="Playback URL">
                    <input
                      required
                      value={urlForm.fileUrl}
                      onChange={(e) =>
                        setUrlForm((u) => ({ ...u, fileUrl: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="https://…"
                    />
                  </Field>
                  <Field label="Thumbnail URL (optional)">
                    <input
                      value={urlForm.thumbnailUrl}
                      onChange={(e) =>
                        setUrlForm((u) => ({
                          ...u,
                          thumbnailUrl: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Duration (seconds, optional)">
                    <input
                      value={urlForm.duration}
                      onChange={(e) =>
                        setUrlForm((u) => ({ ...u, duration: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </>
              )}

              {progress && (
                <p className="text-sm font-medium text-[#256E63]">{progress}</p>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy
                  ? progress || "Working…"
                  : editing
                    ? "Save"
                    : mode === "file"
                      ? "Upload & publish"
                      : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
