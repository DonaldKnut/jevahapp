import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import type { SermonCard } from "../../types/sermon";
import {
  formatSermonDuration,
  sermonPlayableUrl,
} from "../../services/sermons";
import { JEVAH_FALLBACK_THUMB, sermonThumb } from "../../lib/sermonMedia";

type Props = {
  sermon: SermonCard;
};

export function SermonCardTile({ sermon }: Props) {
  const playable = Boolean(sermonPlayableUrl(sermon));
  const duration = formatSermonDuration(
    sermon.durationSec ?? sermon.duration
  );
  const subtitle = [sermon.speaker, sermon.church].filter(Boolean).join(" · ");
  const [thumb, setThumb] = useState(() => sermonThumb(sermon.thumbnailUrl));

  useEffect(() => {
    setThumb(sermonThumb(sermon.thumbnailUrl));
  }, [sermon.thumbnailUrl]);

  return (
    <Link
      to={`/sermons/${sermon.id}`}
      className="group block animate-fade-in-up outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent/40"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#06120f] ring-1 ring-jevah-border/70 transition group-hover:ring-jevah-accent/40">
        <img
          src={thumb}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setThumb(JEVAH_FALLBACK_THUMB)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {sermon.mediaType === "audio" ? "Audio" : "Video"}
          </span>
          {duration ? (
            <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              {duration}
            </span>
          ) : null}
        </div>
        {playable ? (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <PlayCircleIcon className="h-12 w-12 text-white drop-shadow-lg" />
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-jevah-text group-hover:text-jevah-accent">
        {sermon.title}
      </h3>
      {subtitle ? (
        <p className="mt-1 line-clamp-1 text-xs text-jevah-text-muted">
          {subtitle}
        </p>
      ) : null}
      {sermon.series ? (
        <p className="mt-0.5 line-clamp-1 text-[11px] text-jevah-text-muted/80">
          {sermon.series}
        </p>
      ) : null}
    </Link>
  );
}
