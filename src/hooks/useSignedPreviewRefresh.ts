import { useCallback, useEffect, useRef } from "react";
import type { AdminMediaCard } from "../types/admin";
import { resolveAdminPlayable, signedRefreshDelayMs } from "../lib/media";
import { refreshMediaPreview } from "../services/adminApi";

/**
 * Consume-guide §4.3 — mint a fresh preview ~60s before expiry,
 * and once on player error.
 */
export function useSignedPreviewRefresh(
  media: AdminMediaCard | null | undefined,
  onUpdated: (next: AdminMediaCard) => void
) {
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;
  const refreshing = useRef(false);
  const retried = useRef(false);

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
    retried.current = false;
  }, [media?.id, media?.preview?.mediaUrl, media?.preview?.playbackUrl]);

  useEffect(() => {
    const play = resolveAdminPlayable(media);
    const delay = signedRefreshDelayMs(media?.preview, play.url);
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
    media?.preview?.playbackUrl,
    refresh,
  ]);

  const onPlaybackError = useCallback(async () => {
    if (retried.current) return null;
    retried.current = true;
    return refresh();
  }, [refresh]);

  return { refresh, onPlaybackError };
}
