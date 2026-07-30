import { useCallback, useEffect, useState } from "react";
import { fetchEmailLog } from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  SkeletonRows,
} from "../../components/admin/ui";

type LogRow = {
  id?: string;
  _id?: string;
  subject?: string;
  dryRun?: boolean;
  recipientCount?: number;
  createdAt?: string;
  status?: string;
  to?: string[];
};

export default function EmailLogPage() {
  const [items, setItems] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems((await fetchEmailLog(40)) as LogRow[]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Email log unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email log"
        subtitle="Recent admin sends and dry runs."
      />

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={4} />
      ) : items.length === 0 ? (
        <EmptyState title="No email activity yet" />
      ) : (
        <div className="space-y-3">
          {items.map((row, i) => (
            <Panel key={String(row.id || row._id || i)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-jevah-text">
                  {row.subject || "Untitled"}
                </p>
                <div className="flex gap-1.5">
                  {row.dryRun && <Badge tone="warning">Dry run</Badge>}
                  <Badge tone="neutral">{row.status || "sent"}</Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-jevah-text-muted">
                {row.createdAt
                  ? new Date(row.createdAt).toLocaleString()
                  : ""}
                {row.recipientCount != null
                  ? ` · ${row.recipientCount} recipients`
                  : ""}
              </p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
