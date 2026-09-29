import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SermonCardTile } from "../components/sermons/SermonCardTile";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFeedback } from "../components/admin/Feedback";
import { toastApiError } from "../lib/errors";
import {
  fetchFeaturedSermons,
  fetchSermonTopics,
  fetchSermons,
  sermonPlayableUrl,
} from "../services/sermons";
import {
  fetchPublicAllContent,
  publicMediaHref,
} from "../services/publicMedia";
import { sermonThumb } from "../lib/sermonMedia";
import type { PublicMediaCard, SermonCard } from "../types/sermon";

/**
 * Public sermons catalog — approved + playable only via `/api/sermons`.
 * Admin pending/rejected media is never fetched here.
 */
export default function Sermons() {
  useDocumentMeta({
    title: "Christian sermons & teaching — Jevah",
    description:
      "Watch and listen to scripture-rooted sermons on faith, prayer, and hope. Browse the live Jevah sermon catalog.",
    canonicalPath: "/sermons",
  });

  const { toast } = useFeedback();
  const [featured, setFeatured] = useState<SermonCard[]>([]);
  const [items, setItems] = useState<SermonCard[]>([]);
  const [latest, setLatest] = useState<PublicMediaCard[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 280);
  const [topic, setTopic] = useState("");
  const [series, setSeries] = useState("");
  const [language, setLanguage] = useState("");

  const loadFacets = useCallback(async () => {
    const [feat, facets, live] = await Promise.all([
      fetchFeaturedSermons(),
      fetchSermonTopics(),
      fetchPublicAllContent({ profile: "lite", limit: 12 }).catch(() => ({
        items: [] as PublicMediaCard[],
        total: 0,
        page: 1,
        hasMore: false,
      })),
    ]);
    setFeatured(feat.filter((s) => sermonPlayableUrl(s)));
    setTopics(facets.topics);
    setSeriesList(facets.series);
    setLanguages(facets.languages);
    setLatest(live.items);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSermons({
        page: 1,
        limit: 20,
        search: q.length >= 2 ? q : undefined,
        topic: topic || undefined,
        series: series || undefined,
        language: language || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      toastApiError(
        toast,
        "Could not load sermons",
        err,
        "Could not load sermons right now."
      );
      setItems([]);
      setTotal(0);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [q, topic, series, language, toast]);

  useEffect(() => {
    void loadFacets();
  }, [loadFacets]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchSermons({
        limit: 20,
        search: q.length >= 2 ? q : undefined,
        topic: topic || undefined,
        series: series || undefined,
        language: language || undefined,
        ...(nextCursor
          ? { cursor: nextCursor }
          : { page: Math.floor(items.length / 20) + 1 }),
      });
      setItems((prev) => {
        const seen = new Set(prev.map((s) => s.id));
        return [...prev, ...res.items.filter((s) => !seen.has(s.id))];
      });
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setTotal(res.total);
    } catch (err) {
      toastApiError(
        toast,
        "Could not load more",
        err,
        "Could not load more sermons."
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loadingMore,
    nextCursor,
    items.length,
    q,
    topic,
    series,
    language,
    toast,
  ]);

  const hero = useMemo(
    () => featured[0] ?? items.find((s) => sermonPlayableUrl(s)) ?? null,
    [featured, items]
  );

  const clearFilters = () => {
    setSearch("");
    setTopic("");
    setSeries("");
    setLanguage("");
  };

  const hasFilters = Boolean(search || topic || series || language);

  return (
    <div className="jevah-dashboard-shell min-h-dvh font-sans antialiased transition-colors duration-300">
      {/* Hero */}
      <section className="relative min-h-[min(72vh,640px)] overflow-hidden">
        <img
          src={sermonThumb(hero?.thumbnailUrl)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--jevah-bg) 45%, transparent) 0%, color-mix(in srgb, var(--jevah-bg) 88%, transparent) 55%, var(--jevah-bg) 100%), linear-gradient(90deg, color-mix(in srgb, var(--jevah-bg) 78%, transparent) 0%, transparent 55%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12">
          <p className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-jevah-accent">
            <AcademicCapIcon className="h-4 w-4" />
            Jevah Sermons
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-jevah-text sm:text-5xl lg:text-6xl">
            Teaching that travels with you.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-jevah-text-muted sm:text-lg">
            Scripture-rooted messages — watch or listen in the browser. Only
            live, approved sermons appear here.
          </p>
          {hero ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={`/sermons/${hero.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-jevah-accent px-6 py-3 text-sm font-bold text-white shadow-md shadow-jevah-accent/25 transition hover:bg-jevah-accent-hover active:scale-[0.98]"
              >
                <MicrophoneIcon className="h-5 w-5" />
                {featured.length ? "Play featured" : "Start listening"}
              </Link>
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-full border border-jevah-border bg-jevah-surface/80 px-5 py-3 text-sm font-bold text-jevah-text backdrop-blur transition hover:bg-jevah-card"
              >
                Browse catalog
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured shelf */}
      {featured.length > 1 ? (
        <section className="jevah-section px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-lg font-extrabold tracking-tight text-jevah-text sm:text-xl">
              Featured
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <SermonCardTile sermon={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Latest on Jevah */}
      {latest.length > 0 ? (
        <section className="jevah-section-muted px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-jevah-accent">
                  Live now
                </p>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight text-jevah-text sm:text-xl">
                  Latest on Jevah
                </h2>
              </div>
              <Link
                to="/explore"
                className="text-sm font-semibold text-jevah-accent hover:underline"
              >
                See all
              </Link>
            </div>
            <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {latest.map((m) => (
                <li key={m.id} className="w-44 shrink-0 sm:w-52">
                  <Link
                    to={publicMediaHref(m)}
                    state={{ media: m }}
                    className="group block outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent/40"
                  >
                    <div className="aspect-video overflow-hidden rounded-xl bg-jevah-card ring-1 ring-jevah-border/70">
                      <img
                        src={sermonThumb(m.thumbnailUrl)}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-bold text-jevah-text group-hover:text-jevah-accent">
                      {m.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-jevah-text-muted">
                      {m.speaker || m.artistName || m.contentType || "Media"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Catalog */}
      <section
        id="catalog"
        className="jevah-section scroll-mt-24 px-4 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl">
                Sermon catalog
              </h2>
              <p className="mt-1 text-sm text-jevah-text-muted">
                {loading ? "Loading…" : `${total} message${total === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>

          <div className="relative mt-6 max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search title, speaker, church, series…"
              className="w-full rounded-full border border-jevah-border bg-jevah-surface/90 py-2.5 pl-10 pr-10 text-sm text-jevah-text outline-none backdrop-blur-md placeholder:text-jevah-text-muted focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/15"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-jevah-text-muted hover:text-jevah-text"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {(topics.length > 0 ||
            seriesList.length > 0 ||
            languages.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {topics.slice(0, 12).map((t) => (
                <button
                  key={`topic-${t}`}
                  type="button"
                  onClick={() => setTopic((cur) => (cur === t ? "" : t))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    topic === t
                      ? "bg-jevah-text text-jevah-surface"
                      : "border border-jevah-border bg-jevah-card/60 text-jevah-text-muted hover:text-jevah-text"
                  }`}
                >
                  {t}
                </button>
              ))}
              {seriesList.slice(0, 6).map((s) => (
                <button
                  key={`series-${s}`}
                  type="button"
                  onClick={() => setSeries((cur) => (cur === s ? "" : s))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    series === s
                      ? "bg-jevah-accent text-white"
                      : "border border-jevah-border bg-jevah-card/60 text-jevah-text-muted hover:text-jevah-text"
                  }`}
                >
                  {s}
                </button>
              ))}
              {languages.map((lang) => (
                <button
                  key={`lang-${lang}`}
                  type="button"
                  onClick={() =>
                    setLanguage((cur) => (cur === lang ? "" : lang))
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition ${
                    language === lang
                      ? "bg-jevah-text text-jevah-surface"
                      : "border border-jevah-border bg-jevah-card/60 text-jevah-text-muted hover:text-jevah-text"
                  }`}
                >
                  {lang}
                </button>
              ))}
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-jevah-accent hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <CatalogSkeleton />
            ) : items.length === 0 ? (
              <div className="rounded-[1.5rem] border border-jevah-border/80 bg-jevah-elevated/80 px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
                  <MicrophoneIcon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-jevah-text">
                  No sermons yet
                </p>
                <p className="mt-1 text-sm text-jevah-text-muted">
                  {hasFilters
                    ? "Try clearing filters or a different search."
                    : "Approved messages will appear here when published."}
                </p>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((s) => (
                    <li key={s.id}>
                      <SermonCardTile sermon={s} />
                    </li>
                  ))}
                </ul>
                {hasMore ? (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void loadMore()}
                      disabled={loadingMore}
                      className="rounded-full border border-jevah-border bg-jevah-surface px-6 py-2.5 text-sm font-bold text-jevah-text transition hover:bg-jevah-card disabled:opacity-60"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <p className="mt-12 text-center text-sm text-jevah-text-muted">
            Ministers share teaching via{" "}
            <Link
              to="/creators"
              className="font-semibold text-jevah-accent hover:underline"
            >
              Creator Studio
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="aspect-video rounded-2xl bg-jevah-card" />
          <div className="mt-3 h-3 w-3/4 rounded-full bg-jevah-card" />
          <div className="mt-2 h-2.5 w-1/2 rounded-full bg-jevah-card" />
        </li>
      ))}
    </ul>
  );
}
