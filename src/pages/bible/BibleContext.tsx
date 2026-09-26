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
import type { BibleBook, BibleTranslation } from "../../types/bible";

type BibleContextValue = {
  translationId: string | null;
  setTranslationId: (id: string) => void;
  fallbackTranslation: () => void;
  translations: BibleTranslation[];
  currentTranslation: BibleTranslation | null;
  defaultId: string;
  corpusVersion: string | null;
  catalogFailed: boolean;
  catalogReady: boolean;
  books: BibleBook[];
  booksLoading: boolean;
  notice: string | null;
  clearNotice: () => void;
};

const BibleContext = createContext<BibleContextValue | null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const urlTranslation = params.get("translation")?.toLowerCase() || null;
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [translationId, setTranslationIdState] = useState<string | null>(null);
  const [defaultId, setDefaultId] = useState("web");
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

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
      setCatalogFailed(false);
      setTranslations(catalog.translations);
      setDefaultId(catalog.defaultId);
      const ids = new Set(catalog.translations.map((t) => t.id.toLowerCase()));
      const stored = readStoredTranslation();
      const urlOk = urlTranslation && ids.has(urlTranslation);
      const next =
        (urlOk && urlTranslation) ||
        (stored && ids.has(stored) && stored) ||
        (ids.has(catalog.defaultId) && catalog.defaultId) ||
        catalog.translations.find((t) => t.isDefault)?.id.toLowerCase() ||
        catalog.translations[0].id.toLowerCase();
      if (urlTranslation && !urlOk) {
        setNotice("That version isn’t available");
      }
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
    if (!catalogReady) return;
    const current = (params.get("translation") || "").toLowerCase();
    if (catalogFailed) {
      if (!current) return;
      const next = new URLSearchParams(params);
      next.delete("translation");
      setParams(next, { replace: true });
      return;
    }
    if (!translationId) return;
    if (!current) {
      const next = new URLSearchParams(params);
      next.set("translation", translationId);
      setParams(next, { replace: true });
      return;
    }
    const known = translations.some((t) => t.id.toLowerCase() === current);
    if (!known) {
      setNotice("That version isn’t available");
      setTranslationIdState(defaultId);
      writeStoredTranslation(defaultId);
      const next = new URLSearchParams(params);
      next.set("translation", defaultId);
      setParams(next, { replace: true });
    }
  }, [
    catalogReady,
    catalogFailed,
    translationId,
    translations,
    defaultId,
    params,
    setParams,
  ]);

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
      if (!translations.some((t) => t.id.toLowerCase() === lower)) {
        setNotice("That version isn’t available");
        return;
      }
      setTranslationIdState(lower);
      writeStoredTranslation(lower);
      const next = new URLSearchParams(params);
      next.set("translation", lower);
      setParams(next, { replace: true });
    },
    [params, setParams, translations]
  );

  const fallbackTranslation = useCallback(() => {
    setNotice("That version isn’t available");
    setTranslationIdState(defaultId);
    writeStoredTranslation(defaultId);
    const next = new URLSearchParams(params);
    next.set("translation", defaultId);
    setParams(next, { replace: true });
  }, [defaultId, params, setParams]);

  const clearNotice = useCallback(() => setNotice(null), []);

  const currentTranslation =
    translations.find((t) => t.id === translationId) || null;
  const corpusVersion = currentTranslation?.corpusVersion || null;

  const value = useMemo(
    () => ({
      translationId,
      setTranslationId,
      fallbackTranslation,
      translations,
      currentTranslation,
      defaultId,
      corpusVersion,
      catalogFailed,
      catalogReady,
      books,
      booksLoading,
      notice,
      clearNotice,
    }),
    [
      translationId,
      setTranslationId,
      fallbackTranslation,
      translations,
      currentTranslation,
      defaultId,
      corpusVersion,
      catalogFailed,
      catalogReady,
      books,
      booksLoading,
      notice,
      clearNotice,
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
