import { Link } from "react-router-dom";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import type { EbookCard } from "../../types/ebook";
import { JEVAH_FALLBACK_THUMB } from "../../lib/sermonMedia";

type Props = {
  ebook: EbookCard;
};

export function EbookCardTile({ ebook }: Props) {
  const thumb = ebook.thumbnailUrl?.trim() || JEVAH_FALLBACK_THUMB;
  const subtitle = [ebook.authorName, ebook.category].filter(Boolean).join(" · ");

  return (
    <Link
      to={`/ebooks/${ebook.id}`}
      state={{ ebook }}
      className="group block animate-fade-in-up outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent/40"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-[#06120f] ring-1 ring-jevah-border/70 transition group-hover:ring-jevah-accent/40">
        <img
          src={thumb}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = JEVAH_FALLBACK_THUMB;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-90" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          <BookOpenIcon className="h-3 w-3" />
          Ebook
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-jevah-text group-hover:text-jevah-accent">
        {ebook.title}
      </h3>
      {subtitle ? (
        <p className="mt-1 line-clamp-1 text-xs text-jevah-text-muted">
          {subtitle}
        </p>
      ) : null}
    </Link>
  );
}
