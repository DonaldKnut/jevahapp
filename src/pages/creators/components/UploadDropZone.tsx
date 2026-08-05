import type { RefObject } from "react";
import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Props = {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (files: FileList | null) => void;
  fileRef: RefObject<HTMLInputElement>;
  coverRef: RefObject<HTMLInputElement>;
  audioFile: File | null;
  coverFile: File | null;
  coverPreview: string | null;
  onClearCover: () => void;
};

export default function UploadDropZone({
  dragOver,
  setDragOver,
  onDrop,
  fileRef,
  coverRef,
  audioFile,
  coverFile,
  coverPreview,
  onClearCover,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-jevah-border/60 px-6 py-4">
        <CloudArrowUpIcon className="h-4 w-4 text-jevah-accent" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-jevah-text">
          Media Files
        </h2>
      </div>
      <div className="space-y-4 p-6">
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
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            dragOver
              ? "scale-[1.01] border-jevah-accent bg-jevah-accent/10"
              : "border-jevah-border hover:border-jevah-accent/40 hover:bg-jevah-card/30"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-3xl transition-all duration-200 ${
              dragOver
                ? "scale-110 bg-jevah-accent/20 text-jevah-accent"
                : "bg-jevah-card text-jevah-text-muted"
            }`}
          >
            <CloudArrowUpIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-jevah-text">
              Drag &amp; drop your files here
            </p>
            <p className="mt-1 text-xs text-jevah-text-muted">
              Supports MP3, WAV, M4A, AAC · Cover art JPEG/PNG (max 5MB)
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2.5 text-xs font-extrabold text-jevah-text shadow-sm transition hover:bg-jevah-card active:scale-95"
            >
              <MusicalNoteIcon className="h-4 w-4 text-jevah-accent" />
              Choose Audio
            </button>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2.5 text-xs font-extrabold text-jevah-text shadow-sm transition hover:bg-jevah-card active:scale-95"
            >
              <PhotoIcon className="h-4 w-4 text-jevah-accent" />
              Choose Cover
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
        </div>

        {(audioFile || coverFile) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {audioFile && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 ring-1 ring-emerald-500/15">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <MusicalNoteIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-jevah-text">
                    {audioFile.name}
                  </p>
                  <p className="text-[10px] text-jevah-text-muted">
                    {(audioFile.size / 1024 / 1024).toFixed(1)} MB · Audio
                  </p>
                </div>
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
              </div>
            )}
            {coverFile && (
              <div className="flex items-center gap-3 rounded-2xl border border-jevah-accent/30 bg-jevah-accent/5 p-3.5 ring-1 ring-jevah-accent/15">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-jevah-border"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jevah-accent/15 text-jevah-accent">
                    <PhotoIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-jevah-text">
                    {coverFile.name}
                  </p>
                  <p className="text-[10px] text-jevah-text-muted">
                    {(coverFile.size / 1024 / 1024).toFixed(1)} MB · Cover Art
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearCover}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jevah-card text-jevah-text-muted transition hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
