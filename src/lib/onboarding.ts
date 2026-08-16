import { useCallback, useEffect, useState } from "react";

export type TourKind = "admin" | "creator";

const PREFIX = "jevah-tour-v1";

export function tourStorageKey(kind: TourKind, userId: string) {
  return `${PREFIX}:${kind}:${userId}`;
}

export function hasCompletedTour(kind: TourKind, userId: string) {
  try {
    return localStorage.getItem(tourStorageKey(kind, userId)) === "done";
  } catch {
    return false;
  }
}

export function markTourComplete(kind: TourKind, userId: string) {
  try {
    localStorage.setItem(tourStorageKey(kind, userId), "done");
  } catch {
    /* private mode */
  }
}

/**
 * Opens the product tour once per user+role in this browser,
 * after the dashboard has finished loading.
 */
export function useProductTour(
  kind: TourKind,
  userId: string | undefined,
  ready: boolean
) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !userId) return;
    if (hasCompletedTour(kind, userId)) return;
    const t = window.setTimeout(() => setOpen(true), 550);
    return () => window.clearTimeout(t);
  }, [kind, userId, ready]);

  const finish = useCallback(() => {
    if (userId) markTourComplete(kind, userId);
    setOpen(false);
  }, [kind, userId]);

  const replay = useCallback(() => setOpen(true), []);

  return { open, finish, replay };
}
