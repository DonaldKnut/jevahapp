import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PlayCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useFeedback } from "../components/admin/Feedback";
import { toastApiError } from "../lib/errors";
import {
  fetchPublicAllContent,
  publicMediaHref,
} from "../services/publicMedia";
import { sermonThumb } from "../lib/sermonMedia";
import type { PublicMediaCard } from "../types/sermon";

/**
 * Public “Latest on Jevah” — live approved media only.
 * Do not call `/api/admin/media/*` from this page.
 */
export default function Explore() {
  useDocumentMeta({
    title: "Latest on Jevah — gospel videos & sermons",
    description:
      "Discover the latest live gospel videos, sermons, and media on Jevah.",
    canonicalPath: "/explore",
  });

  const { toast } = useFeedback();
  const [items, setItems] = useState<PublicMediaCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetchPublicAllContent({
          page: pageNum,
          limit: 24,
        });
        setItems((prev) => {
          if (!append) return res.items;
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...res.items.filter((i) => !seen.has(i.id))];
        });
        setPage(res.page);
        setHasMore(res.hasMore);
      } catch (err) {
        if (!append) setItems([]);
        toastApiError(
          toast,
          "Could not load latest",
          err,
          "Could not load the latest feed right now."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  return (
    <div className="jevah-dashboard-shell min-h-dvh pb-24 pt-24 font-sans antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-jevah-accent">
            <SparklesIcon className="h-4 w-4" />
            Latest on Jevah
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-jevah-text sm:text-4xl">
            Fresh uploads, already live
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-jevah-text-muted sm:text-base">
            Videos, sermons, and more that passed moderation and are ready to
            play. Pending or rejected uploads never appear here.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/sermons"
              className="inline-flex items-center gap-2 rounded-full bg-jevah-accent px-5 py-2.5 text-sm font-bold text-white"
            >
              <PlayCircleIcon className="h-4 w-4" />
              Sermons catalog
            </Link>
            <Link
              to="/music"
              className="inline-flex items-center gap-2 rounded-full border border-jevah-border bg-jevah-surface px-5 py-2.5 text-sm font-bold text-jevah-text"
            >
              Music
            </Link>
          </div>
        </header>

        <div className="mt-10">
          {loading ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="aspect-video rounded-2xl bg-jevah-card" />
                  <div className="mt-3 h-3 w-3/4 rounded-full bg-jevah-card" />
                </li>
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-jevah-border bg-jevah-elevated px-6 py-16 text-center">
              <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-jevah-accent" />
              <p className="mt-4 font-semibold text-jevah-text">
                Nothing live yet
              </p>
              <p className="mt-1 text-sm text-jevah-text-muted">
                Check back soon — new gospel media will show here first.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((m) => (
                  <li key={m.id} id={m.id}>
                    <Link
                      to={publicMediaHref(m)}
                      state={{ media: m }}
                      className="group block outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent/40"
                    >
                      <div className="aspect-video overflow-hidden rounded-2xl bg-jevah-card ring-1 ring-jevah-border/70 transition group-hover:ring-jevah-accent/40">
                        <img
                          src={sermonThumb(m.thumbnailUrl)}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <h2 className="mt-3 line-clamp-2 text-sm font-bold text-jevah-text group-hover:text-jevah-accent">
                        {m.title}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-xs text-jevah-text-muted">
                        {[m.speaker || m.artistName, m.contentType]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              {hasMore ? (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void load(page + 1, true)}
                    className="rounded-full border border-jevah-border bg-jevah-surface px-6 py-2.5 text-sm font-bold text-jevah-text transition hover:bg-jevah-card disabled:opacity-60"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
