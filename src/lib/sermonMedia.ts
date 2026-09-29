/** Default poster when a sermon/media item has no thumbnail. */
export const JEVAH_FALLBACK_THUMB =
  "https://res.cloudinary.com/ddgzzjp4x/image/upload/v1785751939/jevahh_app_xme9ju.png";

export function sermonThumb(url: string | null | undefined): string {
  const trimmed = typeof url === "string" ? url.trim() : "";
  return trimmed || JEVAH_FALLBACK_THUMB;
}

/**
 * Backend sometimes double-encodes path segments (`%2520` instead of `%20`),
 * which 404s on R2. Undo over-encoding, then return a usable URL.
 */
export function normalizePlaybackUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || /^pending:/i.test(trimmed)) return null;

  try {
    const u = new URL(trimmed);
    let pathname = u.pathname;
    let guard = 0;
    while (/%25[0-9A-Fa-f]{2}/i.test(pathname) && guard < 3) {
      pathname = pathname.replace(
        /%25([0-9A-Fa-f]{2})/gi,
        (_match: string, hex: string) => "%" + hex
      );
      guard += 1;
    }
    u.pathname = pathname;
    // Drop noisy cache-busters we may have added earlier
    u.searchParams.delete("_jevah");
    return u.toString();
  } catch {
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
  }
}

/** Bust Chrome Range/cache failures (`ERR_CACHE_READ_FAILURE`) on R2. */
export function withPlaybackCacheBust(
  url: string | null | undefined,
  bust: number
): string | null {
  const base = normalizePlaybackUrl(url);
  if (!base) return null;
  if (!bust) return base;
  try {
    const u = new URL(base);
    u.searchParams.set("_jevah", String(bust));
    return u.toString();
  } catch {
    return base;
  }
}
