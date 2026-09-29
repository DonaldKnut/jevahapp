import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { EbookCardTile } from "../components/ebooks/EbookCardTile";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFeedback } from "../components/admin/Feedback";
import { toastApiError } from "../lib/errors";
import { fetchEbooks } from "../services/ebooks";
import type { EbookCard } from "../types/ebook";

/**
 * Public ebook catalog — approved PDFs only via `GET /api/ebooks`.
 */
export default function Ebooks() {
  useDocumentMeta({
    title: "Christian ebooks & devotionals — Jevah",
    description:
      "Browse and read faith-filled ebooks, devotionals, and teaching PDFs on Jevah.",
    canonicalPath: "/ebooks",
  });

  const { toast } = useFeedback();
  const [items, setItems] = useState<EbookCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 280);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEbooks({
        page,
        limit: 20,
        search: q.length >= 2 ? q : undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      toastApiError(
        toast,
        "Could not load ebooks",
        err,
        "Could not load ebooks right now."
      );
      setItems([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, q, toast]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="jevah-dashboard-shell min-h-dvh pb-24 pt-24 font-sans antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-jevah-accent">
            <BookOpenIcon className="h-4 w-4" />
            Jevah Library
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-jevah-text sm:text-4xl lg:text-5xl">
            Ebooks & teaching
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-jevah-text-muted sm:text-base">
            Read approved devotionals and Christian books in the browser —
            covers from the live catalog, never drafts or pending uploads.
          </p>
        </header>

        <div className="relative mt-8 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search title or topic…"
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

        <p className="mt-4 text-xs text-jevah-text-muted">
          <span className="font-semibold text-jevah-text">
            {loading ? "…" : total}
          </span>{" "}
          book{total === 1 ? "" : "s"}
          {!loading && q.length >= 2 ? " matching" : ""}
        </p>

        <div className="mt-8">
          {loading ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-2xl bg-jevah-card" />
                  <div className="mt-3 h-3 w-3/4 rounded-full bg-jevah-card" />
                </li>
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-jevah-border/80 bg-jevah-elevated/80 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold text-jevah-text">
                No ebooks yet
              </p>
              <p className="mt-1 text-sm text-jevah-text-muted">
                {q.length >= 2
                  ? "Try a different search."
                  : "Approved books will appear here when published."}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((ebook) => (
                  <li key={ebook.id}>
                    <EbookCardTile ebook={ebook} />
                  </li>
                ))}
              </ul>
              {pages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full border border-jevah-border bg-jevah-surface px-5 py-2 text-sm font-bold text-jevah-text transition hover:bg-jevah-card disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-jevah-text-muted">
                    {page} / {pages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full border border-jevah-border bg-jevah-surface px-5 py-2 text-sm font-bold text-jevah-text transition hover:bg-jevah-card disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <p className="mt-12 text-center text-sm text-jevah-text-muted">
          Prefer listening?{" "}
          <Link
            to="/sermons"
            className="font-semibold text-jevah-accent hover:underline"
          >
            Browse sermons
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
