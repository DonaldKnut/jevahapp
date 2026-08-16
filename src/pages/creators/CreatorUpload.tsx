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
import { usePresignedTrackUpload } from "../../hooks/usePresignedTrackUpload";
import JevahLogo from "../../components/JevahLogo";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import UploadPromoAside from "./components/UploadPromoAside";
import UploadDropZone from "./components/UploadDropZone";
import UploadSubmitPanel from "./components/UploadSubmitPanel";
import TrackQueueCard, { type TrackQueueItem } from "./components/TrackQueueCard";

export default function CreatorUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const releaseId = params.get("releaseId") || undefined;
  const { toast } = useFeedback();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<CreatorMe | null>(null);
  const [publish, setPublish] = useState(true);
  const [queue, setQueue] = useState<TrackQueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [masterCover, setMasterCover] = useState<File | null>(null);
  const [masterCoverPreview, setMasterCoverPreview] = useState<string | null>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [, setActiveTrackIndex] = useState<number>(-1);

  const uploadApi = useMemo(
    () => ({
      createIntent: createCreatorUploadIntent,
      finalize: (trackId: string, shouldPublish: boolean) =>
        finalizeCreatorTrack(trackId, { publish: shouldPublish }),
    }),
    []
  );
  const { upload, validateFiles } = usePresignedTrackUpload(uploadApi);

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
    const fileList = Array.from(files);

    const audioFiles = fileList.filter(
      (f) =>
        f.type.startsWith("audio/") ||
        /\.(mp3|m4a|wav|aac|ogg)$/i.test(f.name)
    );

    const imageFile = fileList.find((f) => f.type.startsWith("image/"));

    let nextCover = masterCover;
    let nextPreview = masterCoverPreview;

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Cover image size limit is 5MB");
      } else {
        nextCover = imageFile;
        setMasterCover(imageFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          const prev = e.target?.result as string;
          setMasterCoverPreview(prev);
          setQueue((prevQueue) =>
            prevQueue.map((item) =>
              item.status === "idle" && !item.coverFile
                ? { ...item, coverFile: imageFile, coverPreview: prev }
                : item
            )
          );
        };
        reader.readAsDataURL(imageFile);
      }
    }

    if (audioFiles.length > 0) {
      const newItems: TrackQueueItem[] = [];
      for (const file of audioFiles) {
        try {
          validateFiles(file, nextCover);
          const rawName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            audioFile: file,
            coverFile: nextCover,
            coverPreview: nextPreview,
            title: rawName || "Untitled Song",
            genre: "gospel",
            category: "worship",
            language: "en",
            status: "idle",
            progressPct: 0,
            statusMessage: "Queued",
          });
        } catch (err) {
          toast.error(
            `Invalid file (${file.name})`,
            err instanceof Error ? err.message : undefined
          );
        }
      }

      if (newItems.length > 0) {
        setQueue((prevQueue) => [...prevQueue, ...newItems]);
        toast.success(
          `Added ${newItems.length} ${newItems.length === 1 ? "song" : "songs"} to queue`
        );
      }
    }
  }

  function updateItem(id: string, patch: Partial<TrackQueueItem>) {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function setItemCover(id: string, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover max size is 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateItem(id, {
        coverFile: file,
        coverPreview: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!queue.length || isUploadingBatch) return;

    const pendingTracks = queue.filter((t) => t.status !== "completed");
    if (!pendingTracks.length) {
      toast.info("All songs in queue have already been uploaded");
      return;
    }

    setIsUploadingBatch(true);

    const artistName =
      me?.artist?.displayName ||
      me?.artist?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      "Artist";

    let successCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === "completed") {
        successCount++;
        continue;
      }

      setActiveTrackIndex(i);

      updateItem(item.id, {
        status: "uploading",
        progressPct: 5,
        statusMessage: "Requesting upload slots…",
        error: undefined,
      });

      try {
        await upload({
          title: item.title,
          artistName,
          genre: item.genre,
          category: item.category,
          language: item.language,
          audioFile: item.audioFile,
          coverFile: item.coverFile,
          publish,
          extraIntent: releaseId ? { releaseId } : undefined,
          onProgressPct: (pct, label) => {
            updateItem(item.id, {
              progressPct: pct,
              statusMessage: label,
            });
          },
        });

        updateItem(item.id, {
          status: "completed",
          progressPct: 100,
          statusMessage: publish ? "Uploaded & Published ✓" : "Saved as Draft ✓",
        });
        successCount++;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Upload failed";

        updateItem(item.id, {
          status: "failed",
          statusMessage: "Upload Failed",
          error: msg,
        });
      }
    }

    setIsUploadingBatch(false);
    setActiveTrackIndex(-1);

    if (successCount === queue.length) {
      toast.success(
        publish ? "All songs published to catalog!" : "All songs saved as drafts!"
      );
      setTimeout(() => navigate("/creators/studio", { replace: true }), 1200);
    } else {
      toast.warning(
        "Partial Batch Completion",
        `${successCount} of ${queue.length} songs were uploaded successfully.`
      );
    }
  }

  const completedCount = queue.filter((x) => x.status === "completed").length;
  const totalCount = queue.length;
  const overallPct = totalCount > 0
    ? Math.round(
        queue.reduce((acc, item) => acc + item.progressPct, 0) / totalCount
      )
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
              Artist Upload Studio
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
                  <MusicalNoteIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-jevah-text">
                    Upload Music Songs
                  </h1>
                  <p className="mt-0.5 text-xs font-medium text-jevah-text-muted">
                    {releaseId
                      ? "Add songs to your selected release. Each song displays its own real-time progress bar."
                      : "Drag & drop single or multiple audio files. Customize metadata & watch live upload progress for each song."}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
              <UploadDropZone
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={onDrop}
                fileRef={fileRef}
                coverRef={coverRef}
                itemCount={queue.length}
              />

              {queue.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-jevah-accent" />
                      <h2 className="text-sm font-extrabold uppercase tracking-wider text-jevah-text">
                        Songs Upload Queue ({queue.length})
                      </h2>
                    </div>
                    {completedCount > 0 && (
                      <span className="text-xs font-bold text-emerald-500">
                        {completedCount} of {totalCount} Completed
                      </span>
                    )}
                  </div>

                  {queue.map((item, index) => (
                    <TrackQueueCard
                      key={item.id}
                      item={item}
                      index={index}
                      busy={isUploadingBatch}
                      onUpdateTitle={(title) => updateItem(item.id, { title })}
                      onUpdateGenre={(genre) => updateItem(item.id, { genre })}
                      onUpdateCategory={(category) =>
                        updateItem(item.id, { category })
                      }
                      onPickCover={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) {
                            setItemCover(item.id, target.files[0]);
                          }
                        };
                        input.click();
                      }}
                      onRemoveCover={() =>
                        updateItem(item.id, {
                          coverFile: null,
                          coverPreview: null,
                        })
                      }
                      onRemoveTrack={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              )}

              <UploadSubmitPanel
                publish={publish}
                setPublish={setPublish}
                busy={isUploadingBatch}
                overallPct={overallPct}
                completedCount={completedCount}
                totalCount={totalCount}
                canSubmit={queue.length > 0}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
