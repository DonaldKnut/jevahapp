import type { RefObject } from "react";
import {
  CloudArrowUpIcon,
  MusicalNoteIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

type Props = {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (files: FileList | null) => void;
  fileRef: RefObject<HTMLInputElement>;
  coverRef: RefObject<HTMLInputElement>;
  itemCount: number;
};

export default function UploadDropZone({
  dragOver,
  setDragOver,
  onDrop,
  fileRef,
  coverRef,
  itemCount,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-jevah-border/60 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <CloudArrowUpIcon className="h-4 w-4 text-jevah-accent" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-jevah-text">
            Drop &amp; Queue Songs
          </h2>
        </div>
        {itemCount > 0 && (
          <span className="rounded-full bg-jevah-accent/15 px-3 py-1 text-xs font-black text-jevah-accent">
            {itemCount} {itemCount === 1 ? "Song" : "Songs"} in Queue
          </span>
        )}
      </div>

      <div className="p-6">
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
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver
              ? "scale-[1.01] border-jevah-accent bg-jevah-accent/10"
              : "border-jevah-border hover:border-jevah-accent/40 hover:bg-jevah-card/30"
          }`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
              dragOver
                ? "scale-110 bg-jevah-accent/20 text-jevah-accent"
                : "bg-jevah-card text-jevah-text-muted"
            }`}
          >
            <CloudArrowUpIcon className="h-7 w-7" />
          </div>

          <div>
            <p className="text-sm font-bold text-jevah-text">
              Drag &amp; drop your audio songs or album cover here
            </p>
            <p className="mt-1 text-xs text-jevah-text-muted">
              Upload single or multiple songs · MP3, WAV, M4A, AAC (max 100MB per track) · Cover art JPEG/PNG (max 5MB)
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-jevah-accent/40 bg-jevah-accent/10 px-4 py-2.5 text-xs font-extrabold text-jevah-accent shadow-sm transition hover:bg-jevah-accent hover:text-white active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              <MusicalNoteIcon className="h-4 w-4" />
              Add Songs (Multiple Supported)
            </button>

            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2.5 text-xs font-extrabold text-jevah-text shadow-sm transition hover:bg-jevah-card active:scale-95"
            >
              <PhotoIcon className="h-4 w-4 text-jevah-accent" />
              Choose Cover Art
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
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
      </div>
    </div>
  );
}

