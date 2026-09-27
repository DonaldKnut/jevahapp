import { CREATOR_HOLD_COPY } from "./uploadPolicy";

export type StudioShelfTone = "live" | "review" | "hold" | "upload" | "draft";

export type StudioShelf = {
  key: string;
  label: string;
  detail?: string;
  tone: StudioShelfTone;
};

/** Creator-facing shelf label after finalize — songs do not “just appear.” */
export function studioTrackShelf(t: {
  moderationStatus?: string | null;
  visibility?: string | null;
  moderationReason?: string | null;
  adminReason?: string | null;
}): StudioShelf {
  const mod = String(t.moderationStatus || "").toLowerCase();
  const vis = String(t.visibility || "").toLowerCase();
  const reason =
    (t.moderationReason || t.adminReason || "").trim() || CREATOR_HOLD_COPY;

  if (mod === "rejected") {
    return { key: "rejected", label: "Not published", detail: reason, tone: "hold" };
  }
  if (mod === "under_review") {
    return { key: "under_review", label: "In review", tone: "review" };
  }
  if (mod === "pending") {
    return { key: "pending", label: "Still uploading", tone: "upload" };
  }
  if (mod === "approved" && vis === "published") {
    return { key: "live", label: "Live", tone: "live" };
  }
  if (mod === "approved") {
    return { key: "approved_draft", label: "Approved · draft", tone: "draft" };
  }
  if (vis === "published") {
    return { key: "live", label: "Live", tone: "live" };
  }
  if (vis === "archived") {
    return { key: "archived", label: "Archived", tone: "draft" };
  }
  return { key: "draft", label: "Draft", tone: "draft" };
}

/** Admin inbox — do not treat FE visibility "public" as live while still in review. */
export function isCreatorTrackLive(t: {
  moderationStatus?: string | null;
}): boolean {
  return String(t.moderationStatus || "").toLowerCase() === "approved";
}

export function adminTrackModLabel(status?: string | null): {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
} {
  const mod = String(status || "").toLowerCase();
  if (mod === "approved") return { label: "Live", tone: "success" };
  if (mod === "rejected") return { label: "Rejected", tone: "danger" };
  if (mod === "pending") return { label: "Uploading", tone: "neutral" };
  if (mod === "under_review") return { label: "In review", tone: "warning" };
  return { label: mod ? mod.replace(/_/g, " ") : "Unknown", tone: "neutral" };
}

export const SHELF_BADGE_CLASS: Record<StudioShelfTone, string> = {
  live: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400",
  review: "bg-amber-400/15 text-amber-600 ring-1 ring-amber-400/35 dark:text-amber-400",
  hold: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-rose-400",
  upload: "bg-slate-500/15 text-slate-600 ring-1 ring-slate-400/30 dark:text-slate-300",
  draft: "bg-jevah-card text-jevah-text-muted ring-1 ring-jevah-border/60",
};
