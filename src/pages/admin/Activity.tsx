import { useCallback, useEffect, useState } from "react";
import { fetchActivity } from "../../services/adminApi";
import type { FeedEvent } from "../../types/admin";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";

export default function ActivityPage() {
  const { isSuperAdmin } = useAuth();
  const [activity, setActivity] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<"me" | "all">("me");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchActivity({
        page: 1,
        limit: 50,
        scope: isSuperAdmin && scope === "all" ? "all" : undefined,
      });
      setActivity(res.activity);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load activity."
      );
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        subtitle={
          isSuperAdmin && scope === "all"
            ? "Org-wide admin audit trail (master)."
            : "Audit trail of admin actions from your account."
        }
      />

      {isSuperAdmin && (
        <Panel>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "me" | "all")}
            className={inputClass}
          >
            <option value="me">My activity</option>
            <option value="all">All admins (master)</option>
          </select>
        </Panel>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={5} />
      ) : activity.length === 0 ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <div className="space-y-3">
          {activity.map((ev, i) => (
            <div
              key={ev.id || String(i)}
              className="admin-list-item"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <Panel>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="brand">{ev.type}</Badge>
                  <span className="text-xs text-jevah-text-muted">
                    {ev.createdAt || ev.timestamp
                      ? new Date(
                          (ev.createdAt || ev.timestamp) as string
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="mt-3 text-sm text-jevah-text">
                  {ev.title || ev.message || ev.description || "Admin action"}
                </p>
              </Panel>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
