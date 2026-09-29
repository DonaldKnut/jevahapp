import { useEffect, type RefObject } from "react";
import { attachMediaProtection } from "../lib/mediaProtection";

/**
 * Wire anti-download listeners whenever the media element mounts or `src` changes.
 * Pass `src` so the effect re-binds after React remounts `<video key={src}>`.
 */
export function useMediaProtection(
  mediaRef: RefObject<HTMLMediaElement | null>,
  shellRef?: RefObject<HTMLElement | null>,
  src?: string | null,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    return attachMediaProtection(
      mediaRef.current,
      shellRef?.current ?? null
    );
  }, [mediaRef, shellRef, src, active]);
}
