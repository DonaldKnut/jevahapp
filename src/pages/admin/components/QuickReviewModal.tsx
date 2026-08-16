import { useEffect, useState } from "react";
import {
  getModerationMedia,
  patchModerationStatus,
} from "../../../services/adminApi";
import type { AdminMediaCard } from "../../../types/admin";
import { getErrorMessage } from "../../../lib/errors";
import { formatAge, uploaderLabel } from "../../../lib/media";
import AdminModal from "../../../components/admin/AdminModal";
import MediaPreview from "../../../components/admin/MediaPreview";
import { Button, Badge } from "../../../components/admin/ui";
import { useFeedback } from "../../../components/admin/Feedback";
import { useSignedPreviewRefresh } from "../../../hooks/useSignedPreviewRefresh";
import {
  CheckCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

function statusTone(
  status?: string
): "brand" | "success" | "warning" | "danger" | "neutral" {
  const s = (status || "").toLowerCase().replace(/_/g, " ");
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  if (s === "under review" || s === "pending") return "warning";
  return "neutral";
}

export default function QuickReviewModal({
  mediaId,
  seed,
  onClose,
  onResolved,
}: {
  mediaId: string | null;
  seed?: AdminMediaCard | null;
  onClose: () => void;
  onResolved: (id: string, status: "approved" | "rejected") => void;
}) {
  const { toast } = useFeedback();
  const [detail, setDetail] = useState<AdminMediaCard | null>(seed ?? null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useSignedPreviewRefresh(detail, setDetail);

  useEffect(() => {
    if (!mediaId) {
      setDetail(null);
      setNotes("");
      setError(null);
      return;
    }
    setDetail(seed ?? null);
    setNotes(seed?.adminModerationNotes || "");
    let alive = true;
    setLoading(true);
    setError(null);
    void getModerationMedia(mediaId)
      .then((res) => {
        if (!alive) return;
        setDetail(res.media);
        setNotes(res.media.adminModerationNotes || "");
      })
      .catch((err) => {
        if (!alive) return;
        setError(getErrorMessage(err, "Could not load this upload."));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [mediaId, seed?.id]);

  async function decide(status: "approved" | "rejected") {
    if (!mediaId) return;
    setBusy(status);
    setError(null);
    try {
      await patchModerationStatus(mediaId, {
        status,
        adminNotes: notes.trim() || undefined,
      });
      toast.success(
        status === "approved" ? "Approved" : "Rejected",
        status === "approved"
          ? "This upload can proceed on the publish path."
          : "The uploader will be notified."
      );
      onResolved(mediaId, status);
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, "Action failed.");
      setError(msg);
      toast.error("Action failed", msg);
    } finally {
      setBusy(null);
    }
  }

  const open = Boolean(mediaId);
  const title = detail?.title || seed?.title || "Review upload";
  const status = detail?.moderationStatus || seed?.moderationStatus || "";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={
        detail || seed
          ? `${uploaderLabel(detail || seed)} · ${formatAge((detail || seed)?.createdAt) || "just now"}`
          : "Load media details to approve or reject."
      }
      icon={<ShieldCheckIcon className="h-5 w-5" />}
      size="lg"
      busy={Boolean(busy)}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="danger"
            disabled={Boolean(busy) || loading || !detail}
            onClick={() => void decide("rejected")}
          >
            <NoSymbolIcon className="h-4 w-4" />
            {busy === "rejected" ? "Rejecting…" : "Reject"}
          </Button>
          <Button
            variant="success"
            disabled={Boolean(busy) || loading || !detail}
            onClick={() => void decide("approved")}
          >
            <CheckCircleIcon className="h-4 w-4" />
            {busy === "approved" ? "Approving…" : "Approve"}
          </Button>
        </div>
      }
    >
      {error && (
        <p className="mb-3 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading && !detail ? (
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-2xl bg-jevah-card" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-jevah-card" />
        </div>
      ) : detail ? (
        <div className="space-y-4">
          <MediaPreview media={detail} compact />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(status)} size="sm" dot>
              {status.replace(/_/g, " ")}
            </Badge>
            {detail.contentType && (
              <Badge tone="neutral" size="sm">
                {detail.contentType}
              </Badge>
            )}
            {detail.category && (
              <Badge tone="brand" size="sm">
                {detail.category}
              </Badge>
            )}
          </div>
          {detail.description ? (
            <p className="text-sm leading-relaxed text-jevah-text-muted">
              {detail.description}
            </p>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-jevah-text-muted">
              Reviewer note (optional)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why you’re approving or rejecting…"
              className="w-full rounded-xl border border-jevah-border bg-jevah-card px-3 py-2 text-sm text-jevah-text outline-none ring-jevah-accent/25 placeholder:text-jevah-text-muted focus:border-jevah-accent focus:ring-2"
            />
          </label>
        </div>
      ) : (
        <p className="text-sm text-jevah-text-muted">No preview available.</p>
      )}
    </AdminModal>
  );
}
