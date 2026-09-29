import type { DragEvent, MouseEvent } from "react";

/** HTML attrs that strip browser “Download” / remote playback affordances. */
export const MEDIA_PROTECT_ATTRS = {
  controlsList: "nodownload noplaybackrate noremoteplayback",
  disablePictureInPicture: true,
  disableRemotePlayback: true,
  draggable: false as const,
};

export function blockMediaContextMenu(
  e: MouseEvent | { preventDefault: () => void; stopPropagation?: () => void }
) {
  e.preventDefault();
  e.stopPropagation?.();
}

export function blockMediaDrag(
  e: DragEvent | { preventDefault: () => void; stopPropagation?: () => void }
) {
  e.preventDefault();
  e.stopPropagation?.();
}

/** Block common save shortcuts while focus is inside a protected media shell. */
export function blockMediaSaveHotkey(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  const saveCombo =
    (e.ctrlKey || e.metaKey) && (key === "s" || key === "p");
  if (saveCombo) {
    e.preventDefault();
    e.stopPropagation();
  }
}

/**
 * Protect a non-media shell (ebook stage, PDF frame) from save / print /
 * context-menu / drag. Soft friction only — not DRM.
 */
export function attachShellProtection(shell: HTMLElement | null) {
  if (!shell) return () => undefined;

  const onCtx = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrag = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  shell.addEventListener("contextmenu", onCtx);
  shell.addEventListener("dragstart", onDrag);

  const onKey = (e: KeyboardEvent) => {
    const target = e.target as Node | null;
    const active = document.activeElement;
    const inside =
      (target != null && shell.contains(target)) ||
      (active != null && shell.contains(active));
    if (inside) blockMediaSaveHotkey(e);
  };
  window.addEventListener("keydown", onKey, true);

  return () => {
    shell.removeEventListener("contextmenu", onCtx);
    shell.removeEventListener("dragstart", onDrag);
    window.removeEventListener("keydown", onKey, true);
  };
}

/**
 * Attach anti-download listeners to a media element (and optional shell).
 * Returns a cleanup function.
 */
export function attachMediaProtection(
  media: HTMLMediaElement | null,
  shell?: HTMLElement | null
) {
  if (!media) return () => undefined;

  media.setAttribute("controlsList", MEDIA_PROTECT_ATTRS.controlsList);
  media.setAttribute("disablePictureInPicture", "true");
  media.setAttribute("disableRemotePlayback", "true");
  media.draggable = false;
  try {
    // Chromium remote playback API
    (media as HTMLMediaElement & { disableRemotePlayback?: boolean }).disableRemotePlayback =
      true;
  } catch {
    /* ignore */
  }

  const onCtx = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrag = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  media.addEventListener("contextmenu", onCtx);
  media.addEventListener("dragstart", onDrag);
  shell?.addEventListener("contextmenu", onCtx);
  shell?.addEventListener("dragstart", onDrag);

  const onKey = (e: KeyboardEvent) => {
    const target = e.target as Node | null;
    const active = document.activeElement;
    const inside =
      (shell != null && target != null && shell.contains(target)) ||
      (target != null && (media === target || media.contains(target))) ||
      active === media ||
      (shell != null && active != null && shell.contains(active));
    if (inside) blockMediaSaveHotkey(e);
  };
  window.addEventListener("keydown", onKey, true);

  return () => {
    media.removeEventListener("contextmenu", onCtx);
    media.removeEventListener("dragstart", onDrag);
    shell?.removeEventListener("contextmenu", onCtx);
    shell?.removeEventListener("dragstart", onDrag);
    window.removeEventListener("keydown", onKey, true);
  };
}
