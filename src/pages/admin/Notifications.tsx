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
  Panel,
  SkeletonRows,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

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

export default function NotificationsPage() {
  const { toast } = useFeedback();
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      toast.success("Marked all read");
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
    try {
      await markNotificationsRead({ ids: [id] });
      await load();
    } catch {
      /* optional */
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="In-app admin alerts (reports, moderation)."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => setUnreadOnly((v) => !v)}
            >
              {unreadOnly ? "Show all" : "Unread only"}
            </Button>
            <Button onClick={() => void markAll()}>Mark all read</Button>
          </div>
        }
      />

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={4} />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Panel key={nid(n)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{n.type || "alert"}</Badge>
                    <span className="text-xs text-jevah-text-muted">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-jevah-text">
                    {n.title || "Notification"}
                  </p>
                  <p className="mt-1 text-sm text-jevah-text-muted">
                    {n.message || n.body}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="min-h-9 text-xs"
                  onClick={() => void markOne(n)}
                >
                  Read
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
