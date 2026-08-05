import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  createCopyrightFreeSong,
  createTrackUploadIntent,
  deleteAdminTrack,
  finalizeTrack,
  listAdminTracks,
  listCategories,
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
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import AdminModal from "../../components/admin/AdminModal";
import { useFeedback } from "../../components/admin/Feedback";
import {
  normalizeCategoryList,
  withCategoryFallbacks,
  type CategoryOption,
} from "../../lib/categories";
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [customCategory, setCustomCategory] = useState(false);

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

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const raw = await listCategories();
        if (!alive) return;
        setCategories(
          withCategoryFallbacks(
            normalizeCategoryList(raw as Array<Record<string, unknown>>)
          )
        );
      } catch {
        if (alive) setCategories(withCategoryFallbacks([]));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function openUpload() {
    setEditing(null);
    setMeta(emptyMeta);
    setAudioFile(null);
    setCoverFile(null);
    setUrlForm({ fileUrl: "", thumbnailUrl: "", duration: "" });
    setProgress(null);
    setMode("file");
    setCustomCategory(false);
    setError(null);
    setUploadOpen(true);
  }

  function openEdit(t: TrackCard) {
    setEditing(t);
    const cat = t.category || "";
    const known = categories.some(
      (c) => c.name.toLowerCase() === cat.toLowerCase()
    );
    setCustomCategory(Boolean(cat) && !known);
    setMeta({
      title: t.title || "",
      artistName: trackArtist(t),
      category: cat,
      genre: t.genre || "",
      language: t.language || "",
      licenseNote: t.licenseNote || "",
    });
    setError(null);
    setUploadOpen(true);
  }

  function closeUpload() {
    if (busy) return;
    setUploadOpen(false);
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
    <PageEnter>
      <PageHeader
        title="Audio Library"
        subtitle={
          lane === "curated"
            ? "Curated copyright-free audio catalog for app playback & streaming."
            : "Artist & creator upload catalog (moderation & management view)."
        }
        badgeText="Audio Manager"
        actions={
          lane === "curated" ? (
            <Button onClick={openUpload}>
              <CloudArrowUpIcon className="h-4 w-4" />
              Upload New Track
            </Button>
          ) : undefined
        }
      />

      {/* Lane Tabs & Search Toolbar */}
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-2xl bg-jevah-card p-1">
            <button
              type="button"
              onClick={() => setLane("curated")}
              className={`rounded-xl px-5 py-2 text-xs font-extrabold transition ${
                lane === "curated"
                  ? "bg-jevah-surface text-jevah-accent shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              }`}
            >
              Curated Library
            </button>
            <button
              type="button"
              onClick={() => setLane("artist")}
              className={`rounded-xl px-5 py-2 text-xs font-extrabold transition ${
                lane === "artist"
                  ? "bg-jevah-surface text-jevah-accent shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              }`}
            >
              Artist Catalog
            </button>
          </div>

          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by track title or artist..."
                className={`${inputClass} pl-10`}
              />
            </div>
            <Button variant="secondary" onClick={() => void load()}>
              Refresh
            </Button>
          </div>
        </div>
      </Panel>

      {error && !uploadOpen && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {/* Track Cards Grid */}
      {loading ? (
        <SkeletonRows rows={4} />
      ) : tracks.length === 0 ? (
        <EmptyState
          title="No Audio Tracks Found"
          description={
            lane === "curated"
              ? "Upload an audio file or import a URL to populate the curated library."
              : "Artist tracks will appear here once creators publish music."
          }
          icon={MusicalNoteIcon}
          action={
            lane === "curated" ? (
              <Button onClick={openUpload}>Upload Track</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((t, i) => {
            const url = trackPlaybackUrl(t);
            const status = trackProcessing(t);
            return (
              <div
                key={trackId(t)}
                className="admin-list-item group flex flex-col justify-between rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-jevah-accent/30 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {t.thumbnailUrl ? (
                      <img
                        src={t.thumbnailUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-jevah-border shadow-sm"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/20">
                        <MusicalNoteIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold text-jevah-text text-base">
                        {t.title || "Untitled Track"}
                      </p>
                      <p className="truncate text-xs font-semibold text-jevah-text-muted mt-0.5">
                        {trackArtist(t)}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Badge tone="neutral" size="sm">
                          {formatTrackDuration(trackDuration(t))}
                        </Badge>
                        {t.category && <Badge tone="brand" size="sm">{t.category}</Badge>}
                        <Badge
                          tone={
                            status === "ready"
                              ? "success"
                              : status === "failed"
                                ? "danger"
                                : "warning"
                          }
                          size="sm"
                          dot
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {url && (
                    <div className="mt-4 rounded-xl bg-jevah-card p-2.5">
                      <audio controls preload="none" className="w-full h-8" src={url}>
                        <track kind="captions" />
                      </audio>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2.5 pt-3 border-t border-jevah-border/40">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => openEdit(t)}
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => void onDelete(t)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <AdminModal
        open={uploadOpen}
        onClose={closeUpload}
        title={editing ? "Edit Track Details" : "Upload Audio Track"}
        subtitle="Curated library · Copyright-free audio for application streaming"
        size="lg"
        busy={busy}
        icon={<CloudArrowUpIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={closeUpload}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="audio-upload-form"
              className="flex-1"
              disabled={busy}
            >
              {busy
                ? progress || "Uploading..."
                : editing
                  ? "Save Changes"
                  : mode === "file"
                    ? "Upload & Publish Track"
                    : "Import Track URL"}
            </Button>
          </div>
        }
      >
        <form
          id="audio-upload-form"
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4"
        >
          {!editing && (
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-jevah-card p-1">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  mode === "file"
                    ? "bg-jevah-surface text-jevah-accent shadow-sm"
                    : "text-jevah-text-muted"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  mode === "url"
                    ? "bg-jevah-surface text-jevah-accent shadow-sm"
                    : "text-jevah-text-muted"
                }`}
              >
                Import URL
              </button>
            </div>
          )}

          {error && uploadOpen && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Track Title">
              <input
                required
                autoFocus
                value={meta.title}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, title: e.target.value }))
                }
                placeholder="e.g. Amazing Grace"
                className={inputClass}
              />
            </Field>
            <Field label="Artist / Singer">
              <input
                required
                value={meta.artistName}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, artistName: e.target.value }))
                }
                placeholder="Artist name"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category">
              {customCategory ? (
                <input
                  value={meta.category}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, category: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Custom category"
                />
              ) : (
                <select
                  value={meta.category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setCustomCategory(true);
                      setMeta((m) => ({ ...m, category: "" }));
                      return;
                    }
                    setMeta((m) => ({ ...m, category: e.target.value }));
                  }}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name.replace(/_/g, " ")}
                    </option>
                  ))}
                  <option value="__custom__">Custom…</option>
                </select>
              )}
            </Field>
            <Field label="Genre Tag">
              <input
                value={meta.genre}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, genre: e.target.value }))
                }
                className={inputClass}
                placeholder="gospel, worship..."
              />
            </Field>
          </div>

          {!editing && mode === "file" && (
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
              className={`rounded-3xl border-2 border-dashed p-7 text-center transition-all duration-200 ${
                dragOver
                  ? "border-jevah-accent bg-jevah-accent/15 scale-[1.01]"
                  : "border-jevah-border bg-jevah-surface/90 hover:border-jevah-accent/40 hover:bg-jevah-card/60 shadow-sm"
              }`}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/25 shadow-sm">
                <CloudArrowUpIcon className="h-7 w-7" />
              </div>
              <p className="text-sm font-extrabold text-jevah-text">
                Drag &amp; Drop audio file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-jevah-text-muted">
                Supported formats: MP3, M4A, WAV · Optional cover art (max 5MB)
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <MusicalNoteIcon className="h-4 w-4 text-jevah-accent" />
                  Choose Audio File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  Choose Cover Art
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
                <div className="mt-4 space-y-1 text-left text-xs font-semibold text-jevah-accent bg-jevah-accent/10 p-3 rounded-xl">
                  {audioFile && <p>Audio File: {audioFile.name}</p>}
                  {coverFile && <p>Cover Art: {coverFile.name}</p>}
                </div>
              )}
            </div>
          )}

          {!editing && mode === "url" && (
            <div className="space-y-3">
              <Field label="Direct Audio Stream / Playback URL">
                <input
                  required
                  value={urlForm.fileUrl}
                  onChange={(e) =>
                    setUrlForm((u) => ({ ...u, fileUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://storage.googleapis.com/..."
                />
              </Field>
              <Field label="Cover Art / Thumbnail URL">
                <input
                  value={urlForm.thumbnailUrl}
                  onChange={(e) =>
                    setUrlForm((u) => ({
                      ...u,
                      thumbnailUrl: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
            </div>
          )}

          {progress && (
            <p className="text-xs font-bold text-jevah-accent animate-pulse">{progress}</p>
          )}
        </form>
      </AdminModal>
    </PageEnter>
  );
}

