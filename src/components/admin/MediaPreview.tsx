import type { AdminMediaCard } from "../../types/admin";
import {
  isAudioMedia,
  isVideoMedia,
  mediaPreviewUrl,
  mediaThumbUrl,
} from "../../lib/media";
import { cn } from "./ui";

export default function MediaPreview({
  media,
  compact = false,
  onPlaybackError,
}: {
  media: AdminMediaCard;
  compact?: boolean;
  onPlaybackError?: () => void;
}) {
  const url = mediaPreviewUrl(media);
  const thumb = mediaThumbUrl(media);
  const frame = compact
    ? "aspect-video max-h-[40vh] w-full"
    : "aspect-video max-h-[min(62vh,560px)] w-full";

  if (!url && !thumb) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-jevah-card text-sm text-jevah-text-muted",
          frame
        )}
      >
        No preview available
      </div>
    );
  }

  if (isVideoMedia(media, url)) {
    return (
      <div className="overflow-hidden rounded-2xl bg-black shadow-inner">
        <video
          key={url || thumb || media.id}
          src={url || undefined}
          poster={thumb || undefined}
          controls
          playsInline
          preload="metadata"
          className={cn(frame, "bg-black object-contain")}
          onError={() => onPlaybackError?.()}
        />
      </div>
    );
  }

  if (isAudioMedia(media, url)) {
    return (
      <div className="overflow-hidden rounded-2xl border border-jevah-border bg-jevah-muted">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="aspect-[2/1] max-h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-28 items-center justify-center text-sm text-jevah-text-muted">
            Audio
          </div>
        )}
        <div className="p-4">
          <audio
            key={url || media.id}
            src={url || undefined}
            controls
            preload="metadata"
            className="w-full"
            onError={() => onPlaybackError?.()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-jevah-card">
      <img
        src={thumb || url || ""}
        alt={media.title}
        className={cn(frame, "object-contain")}
        onError={() => onPlaybackError?.()}
      />
    </div>
  );
}
