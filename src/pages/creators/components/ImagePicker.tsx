import { CameraIcon } from "@heroicons/react/24/outline";
import { IMAGE_ACCEPT } from "../../../lib/media";

export default function ImagePicker({
  label,
  hint,
  previewUrl,
  busy,
  onPick,
  roundedClass = "rounded-2xl",
  aspectClass = "aspect-square",
}: {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  busy?: boolean;
  onPick: (file: File) => void;
  roundedClass?: string;
  aspectClass?: string;
}) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-jevah-text-muted">
        {label}
      </span>
      <span
        className={`relative flex ${aspectClass} w-full items-center justify-center overflow-hidden ${roundedClass} border border-dashed border-jevah-border/80 bg-jevah-card/50 ring-1 ring-jevah-border/40 transition hover:border-jevah-accent/50`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 px-3 text-center text-jevah-text-muted">
            <CameraIcon className="h-7 w-7" />
            <span className="text-[11px] font-bold">Tap to upload</span>
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-white">
          {busy ? "Uploading…" : previewUrl ? "Change" : "Upload"}
        </span>
      </span>
      {hint ? (
        <span className="mt-1.5 block text-[11px] font-medium text-jevah-text-muted">
          {hint}
        </span>
      ) : null}
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </label>
  );
}
