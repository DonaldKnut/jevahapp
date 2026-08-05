import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminNotifications,
  markNotificationsRead,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageEnter,
  SkeletonRows,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import {
  BellIcon,
  BellSlashIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";

type Notif = {
  id?: string;
  _id?: string;
  type?: string;
  title?: string;
  message?: string;
  body?: string;
  createdAt?: string;
  read?: boolean;
};

function nid(n: Notif) {
  return String(n.id || n._id || "");
}

const TYPE_ICON_MAP: Record<string, string> = {
  report: "🚨",
  moderation: "🛡️",
  user: "👤",
  church: "⛪",
  audio: "🎵",
  system: "⚙️",
};

export default function NotificationsPage() {
  const { toast } = useFeedback();
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(
        (await fetchAdminNotifications(unreadOnly)) as Notif[]
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Notifications unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAll() {
    try {
      await markNotificationsRead({ all: true });
      toast.success("All notifications marked as read");
      await load();
    } catch (err) {
      toast.error(
        "Failed",
        err instanceof ApiError ? err.message : undefined
      );
    }
  }

  async function markOne(n: Notif) {
    const id = nid(n);
    if (!id) return;
    setMarking(id);
    try {
      await markNotificationsRead({ ids: [id] });
      await load();
    } catch {
      /* optional */
    } finally {
      setMarking(null);
    }
  }

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <PageEnter>
      <PageHeader
        title="Notifications"
        subtitle="In-app admin alerts triggered by reports, moderation actions, and system events."
        badgeText="Inbox"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUnreadOnly((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                unreadOnly
                  ? "border-jevah-accent bg-jevah-accent/10 text-jevah-accent"
                  : "border-jevah-border bg-jevah-surface text-jevah-text hover:border-jevah-accent/40"
              }`}
            >
              {unreadOnly ? <BellSolidIcon className="h-4 w-4" /> : <BellIcon className="h-4 w-4" />}
              {unreadOnly ? "Unread only" : "Show all"}
            </button>
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={() => void markAll()}>
                <CheckCircleIcon className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Unread count strip */}
      {!loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-jevah-border/60 bg-jevah-surface px-5 py-3.5 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${unreadCount > 0 ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500"}`}>
            {unreadCount > 0 ? <BellSolidIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-jevah-text">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
            </p>
            <p className="text-xs text-jevah-text-muted">
              {items.length} total {unreadOnly ? "unread" : ""} alerts loaded
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title={unreadOnly ? "No unread notifications" : "No notifications"}
          description={unreadOnly ? "You're all caught up. Toggle to view all notifications." : "Alerts from reports and moderation will appear here."}
          icon={BellSlashIcon}
          action={
            unreadOnly ? (
              <Button variant="secondary" onClick={() => setUnreadOnly(false)}>
                Show all notifications
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n, i) => (
            <div
              key={nid(n)}
              className={`admin-list-item group flex items-start justify-between gap-4 rounded-3xl border px-5 py-4 transition hover:shadow-md ${
                !n.read
                  ? "border-jevah-accent/30 bg-jevah-accent/5 shadow-sm"
                  : "border-jevah-border/60 bg-jevah-surface"
              }`}
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${!n.read ? "bg-jevah-accent/15" : "bg-jevah-card"}`}>
                  {TYPE_ICON_MAP[n.type?.toLowerCase() ?? ""] ?? "🔔"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={!n.read ? "brand" : "neutral"} size="sm">
                      {n.type || "alert"}
                    </Badge>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-jevah-accent" />
                    )}
                    <span className="text-xs text-jevah-text-muted font-medium">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-jevah-text">
                    {n.title || "Notification"}
                  </p>
                  <p className="mt-0.5 text-sm text-jevah-text-muted leading-relaxed">
                    {n.message || n.body}
                  </p>
                </div>
              </div>
              {!n.read && (
                <button
                  type="button"
                  disabled={marking === nid(n)}
                  onClick={() => void markOne(n)}
                  title="Mark as read"
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-jevah-border/60 bg-jevah-surface text-jevah-text-muted opacity-0 transition hover:border-jevah-accent hover:text-jevah-accent group-hover:opacity-100"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </PageEnter>
  );
}
