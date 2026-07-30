import { useCallback, useEffect, useRef } from "react";
import type { AdminMediaCard } from "../types/admin";
import { signedRefreshDelayMs } from "../lib/media";
import { refreshMediaPreview } from "../services/adminApi";

/**
 * Keeps signed preview URLs fresh.
 * - Schedules a refresh before expiry
 * - Exposes `onPlaybackError` for player error handlers
 */
export function useSignedPreviewRefresh(
  media: AdminMediaCard | null | undefined,
  onUpdated: (next: AdminMediaCard) => void
) {
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    const id = media?.id;
    if (!id || refreshing.current) return null;
    refreshing.current = true;
    try {
      const next = await refreshMediaPreview(id);
      if (next) onUpdatedRef.current(next);
      return next;
    } catch {
      return null;
    } finally {
      refreshing.current = false;
    }
  }, [media?.id]);

  useEffect(() => {
    const delay = signedRefreshDelayMs(media?.preview);
    if (!media?.id || delay == null) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [
    media?.id,
    media?.preview?.signed,
    media?.preview?.expiresInSeconds,
    media?.preview?.mediaUrl,
    refresh,
  ]);

  const onPlaybackError = useCallback(() => {
    if (media?.preview?.signed) {
      void refresh();
    }
  }, [media?.preview?.signed, refresh]);

  return { refresh, onPlaybackError };
}
