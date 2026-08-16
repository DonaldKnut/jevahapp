import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchModerationQueue,
  fetchReports,
  fetchUsers,
  listArtists,
  listCommentReports,
} from "../../../services/adminApi";
import type { AdminMediaCard, AdminUser, ReportItem } from "../../../types/admin";
import { getErrorMessage } from "../../../lib/errors";
import AdminModal from "../../../components/admin/AdminModal";
import { Badge, Button } from "../../../components/admin/ui";
import {
  ArrowUpRightIcon,
  FlagIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  UserGroupIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";

export type OverviewPeek =
  | "reports"
  | "comments"
  | "review"
  | "banned"
  | "artists"
  | "sessions";

const PEEK_META: Record<
  OverviewPeek,
  {
    title: string;
    subtitle: string;
    href: string;
    hrefLabel: string;
    icon: typeof FlagIcon;
  }
> = {
  reports: {
    title: "Media Reports",
    subtitle: "Pending community flags on audio and video",
    href: "/admin/reports?status=pending",
    hrefLabel: "Open reports inbox",
    icon: FlagIcon,
  },
  comments: {
    title: "Reported Comments",
    subtitle: "Comment flags waiting for a decision",
    href: "/admin/reports?type=comment",
    hrefLabel: "Open comment reports",
    icon: ChatBubbleLeftEllipsisIcon,
  },
  review: {
    title: "Under Review",
    subtitle: "Uploads in the moderation queue — tap one to approve or reject",
    href: "/admin/moderation",
    hrefLabel: "Open moderation studio",
    icon: ShieldCheckIcon,
  },
  banned: {
    title: "Banned Users",
    subtitle: "Restricted accounts on the platform",
    href: "/admin/users?isBanned=true",
    hrefLabel: "Open user directory",
    icon: UserMinusIcon,
  },
  artists: {
    title: "Unverified Artists",
    subtitle: "Creator applications still waiting on verification",
    href: "/admin/artists",
    hrefLabel: "Open creator directory",
    icon: UserGroupIcon,
  },
  sessions: {
    title: "Active Sessions",
    subtitle: "People online on Jevah right now",
    href: "/admin/users?presence=online",
    hrefLabel: "Open live users",
    icon: WifiIcon,
  },
};

type Row = {
  id: string;
  title: string;
  meta: string;
  badge?: string;
  media?: AdminMediaCard;
  reason?: string;
};

function userLabel(u: AdminUser) {
  return (
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.email ||
    u.username ||
    "User"
  );
}

function reportTitle(r: ReportItem) {
  const raw =
    r.reason ||
    r.target?.title ||
    r.description ||
    (r.kind === "comment" || r.type === "comment" ? "Comment report" : "Media report");
  return String(raw).replace(/_/g, " ");
}

function reasonTone(reason?: string): "danger" | "warning" | "brand" {
  const s = (reason || "").toLowerCase();
  if (s.includes("blasphem") || s.includes("hate") || s.includes("abuse")) {
    return "danger";
  }
  if (s.includes("explicit") || s.includes("sexual") || s.includes("spam")) {
    return "warning";
  }
  return "brand";
}

export default function OverviewKpiPeek({
  peek,
  onlineUsers,
  queuePreview,
  onClose,
  onOpenReview,
}: {
  peek: OverviewPeek | null;
  onlineUsers: AdminUser[];
  queuePreview: AdminMediaCard[];
  onClose: () => void;
  onOpenReview: (item: AdminMediaCard) => void;
}) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!peek) {
      setRows([]);
      setError(null);
      return;
    }

    if (peek === "sessions") {
      setRows(
        onlineUsers.map((u) => ({
          id: u.id,
          title: userLabel(u),
          meta: u.email || u.role || "Online",
          badge: "Live",
        }))
      );
      setLoading(false);
      setError(null);
      return;
    }

    if (peek === "review" && queuePreview.length > 0) {
      setRows(
        queuePreview.map((m) => ({
          id: m.id,
          title: m.title || "Untitled",
          meta: m.contentType || "upload",
          badge: m.moderationStatus.replace(/_/g, " "),
          media: m,
        }))
      );
    }

    let alive = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        let next: Row[] = [];
        if (peek === "reports") {
          const res = await fetchReports({ status: "pending", limit: 12 });
          next = res.reports.map((r) => ({
            id: r.id || r._id || "",
            title: reportTitle(r),
            meta: r.reporter?.email || r.reason || "Pending",
            badge: r.status || "pending",
            reason: r.reason,
          }));
        } else if (peek === "comments") {
          const res = await listCommentReports({ limit: 12 });
          next = res.reports.map((r) => ({
            id: r.id || r._id || r.commentId || "",
            title: reportTitle(r),
            meta: r.reporter?.email || "Comment flag",
            badge: r.status || "pending",
            reason: r.reason,
          }));
        } else if (peek === "review") {
          const res = await fetchModerationQueue({
            status: "under_review",
            limit: 12,
          });
          next = res.items.map((m) => ({
            id: m.id,
            title: m.title || "Untitled",
            meta: m.contentType || "upload",
            badge: m.moderationStatus.replace(/_/g, " "),
            media: m,
          }));
        } else if (peek === "banned") {
          const res = await fetchUsers({ isBanned: true, limit: 12 });
          next = res.users.map((u) => ({
            id: u.id,
            title: userLabel(u),
            meta: u.banReason || u.email || "Banned",
            badge: "Banned",
          }));
        } else if (peek === "artists") {
          const res = await listArtists({ status: "pending", limit: 12 });
          next = res.items.map((raw) => {
            const a = raw as {
              id?: string;
              _id?: string;
              name?: string;
              displayName?: string;
              email?: string;
              status?: string;
            };
            return {
              id: String(a.id || a._id || a.email || Math.random()),
              title: a.displayName || a.name || "Unnamed artist",
              meta: a.email || "Pending review",
              badge: a.status || "pending",
            };
          });
        }
        if (alive) setRows(next.filter((r) => r.id));
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Could not load this list."));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [peek, onlineUsers, queuePreview]);

  const meta = peek ? PEEK_META[peek] : null;
  const Icon = meta?.icon;

  return (
    <AdminModal
      open={Boolean(peek)}
      onClose={onClose}
      title={meta?.title || "Details"}
      subtitle={meta?.subtitle}
      icon={Icon ? <Icon className="h-5 w-5" /> : undefined}
      size="lg"
      footer={
        meta ? (
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                navigate(meta.href);
              }}
            >
              {meta.hrefLabel}
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      }
    >
      {error && (
        <p className="mb-3 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-300">
          {error}
        </p>
      )}
      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-jevah-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium text-jevah-text-muted">
          Nothing in this queue right now.
        </p>
      ) : (
        <ul
          className={
            peek === "reports" || peek === "comments"
              ? "-mx-1 space-y-2.5 rounded-2xl bg-gradient-to-b from-rose-500/15 via-jevah-muted to-jevah-card p-3 ring-1 ring-rose-500/20 sm:p-3.5"
              : "space-y-2.5"
          }
        >
          {rows.map((row) => {
            const clickable = peek === "review" && row.media;
            const tone = reasonTone(row.reason || row.title);
            const rowBg =
              peek === "reports" || peek === "comments"
                ? tone === "danger"
                  ? "border-rose-500/25 bg-jevah-surface shadow-sm shadow-rose-500/5"
                  : tone === "warning"
                    ? "border-amber-500/25 bg-jevah-surface shadow-sm shadow-amber-500/5"
                    : "border-jevah-border bg-jevah-surface shadow-sm"
                : "border-jevah-border/80 bg-jevah-surface shadow-sm";
            const stripe =
              tone === "danger"
                ? "bg-rose-500"
                : tone === "warning"
                  ? "bg-amber-500"
                  : "bg-jevah-accent";
            const body = (
              <>
                <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${stripe}`} />
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
                    peek === "reports" || peek === "comments"
                      ? tone === "danger"
                        ? "bg-rose-500/10 text-rose-500 ring-rose-500/20"
                        : tone === "warning"
                          ? "bg-amber-500/10 text-amber-600 ring-amber-500/20"
                          : "bg-jevah-accent/10 text-jevah-accent ring-jevah-accent/20"
                      : "bg-jevah-accent/10 text-jevah-accent ring-jevah-accent/20"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : <FlagIcon className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold capitalize text-jevah-text">
                    {row.title}
                  </p>
                  <p className="truncate text-xs text-jevah-text-muted">{row.meta}</p>
                </div>
                {row.badge && (
                  <Badge
                    size="sm"
                    tone={
                      row.badge.toLowerCase().includes("ban")
                        ? "danger"
                        : row.badge.toLowerCase().includes("live")
                          ? "success"
                          : "warning"
                    }
                  >
                    {row.badge}
                  </Badge>
                )}
              </>
            );
            return (
              <li key={row.id}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onOpenReview(row.media!)}
                    className={`relative flex w-full items-center gap-3 rounded-xl border p-3.5 pl-4 text-left transition hover:border-jevah-accent/40 ${rowBg}`}
                  >
                    {body}
                  </button>
                ) : (
                  <div
                    className={`relative flex items-center gap-3 rounded-xl border p-3.5 pl-4 ${rowBg}`}
                  >
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminModal>
  );
}
