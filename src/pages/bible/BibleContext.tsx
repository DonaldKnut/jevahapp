import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { fetchBibleBooks, fetchBibleCatalog } from "../../services/bible";
import {
  readStoredTranslation,
  writeStoredTranslation,
} from "../../lib/bible/paths";
import { isReadableTranslation } from "../../lib/bible/translations";
import type { BibleBook, BibleTranslation } from "../../types/bible";

type BibleContextValue = {
  translationId: string | null;
  setTranslationId: (id: string) => void;
  translations: BibleTranslation[];
  catalogFailed: boolean;
  catalogReady: boolean;
  books: BibleBook[];
  booksLoading: boolean;
};

const BibleContext = createContext<BibleContextValue | null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const urlTranslation = params.get("translation")?.toLowerCase() || null;
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [translationId, setTranslationIdState] = useState<string | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void fetchBibleCatalog().then((catalog) => {
      if (!alive) return;
      if (!catalog || !catalog.translations.length) {
        setCatalogFailed(true);
        setTranslationIdState(null);
        setCatalogReady(true);
        return;
      }
      const readable = catalog.translations.filter(isReadableTranslation);
      if (!readable.length) {
        setCatalogFailed(true);
        setTranslationIdState(null);
        setCatalogReady(true);
        return;
      }
      setCatalogFailed(false);
      setTranslations(readable);
      const ids = new Set(readable.map((t) => t.id.toLowerCase()));
      const stored = readStoredTranslation();
      const next =
        (urlTranslation && ids.has(urlTranslation) && urlTranslation) ||
        (stored && ids.has(stored) && stored) ||
        (ids.has(catalog.defaultId) && catalog.defaultId) ||
        readable.find((t) => t.isDefault)?.id.toLowerCase() ||
        readable[0].id.toLowerCase();
      setTranslationIdState(next);
      writeStoredTranslation(next);
      setCatalogReady(true);
    });
    void fetchBibleBooks()
      .then((list) => {
        if (!alive) return;
        const sorted = [...list].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setBooks(sorted);
      })
      .finally(() => {
        if (alive) setBooksLoading(false);
      });
    return () => {
      alive = false;
    };
    // Boot once; URL translation is applied in the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!catalogReady || catalogFailed || !translationId) return;
    const current = (params.get("translation") || "").toLowerCase();
    if (current) return;
    const next = new URLSearchParams(params);
    next.set("translation", translationId);
    setParams(next, { replace: true });
  }, [catalogReady, catalogFailed, translationId, params, setParams]);

  useEffect(() => {
    if (!urlTranslation || !translations.length) return;
    if (urlTranslation === translationId) return;
    if (!translations.some((t) => t.id.toLowerCase() === urlTranslation)) {
      return;
    }
    setTranslationIdState(urlTranslation);
    writeStoredTranslation(urlTranslation);
  }, [urlTranslation, translations, translationId]);

  const setTranslationId = useCallback(
    (id: string) => {
      const lower = id.toLowerCase();
      setTranslationIdState(lower);
      writeStoredTranslation(lower);
      const next = new URLSearchParams(params);
      next.set("translation", lower);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const value = useMemo(
    () => ({
      translationId,
      setTranslationId,
      translations,
      catalogFailed,
      catalogReady,
      books,
      booksLoading,
    }),
    [
      translationId,
      setTranslationId,
      translations,
      catalogFailed,
      catalogReady,
      books,
      booksLoading,
    ]
  );

  return (
    <BibleContext.Provider value={value}>{children}</BibleContext.Provider>
  );
}

export function useBible() {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error("useBible must be used within BibleProvider");
  return ctx;
}
