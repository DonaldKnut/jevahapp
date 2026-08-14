import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  meta?: {
    kind?: string;
    [key: string]: unknown;
  };
  kind?: string;
};

function emailKind(row: LogRow): string {
  const k = row.meta?.kind || row.kind;
  return typeof k === "string" ? k : "ops";
}

function kindBadge(kind: string): { label: string; tone: "info" | "success" | "warning" | "neutral" | "danger" } {
  switch (kind) {
    case "marketing":
      return { label: "Marketing", tone: "info" };
    case "artist_onboard":
      return { label: "Welcome artist", tone: "success" };
    default:
      return { label: "Ops", tone: "neutral" };
  }
}

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
        subtitle="Direct messages, news & promos, and artist welcome invites (including tests)."
        actions={
          <Link
            to="/admin/email"
            className="rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2 text-sm font-semibold text-jevah-text hover:border-jevah-accent hover:text-jevah-accent"
          >
            Compose
          </Link>
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
        <EmptyState title="No email activity yet" />
      ) : (
        <div className="space-y-3">
          {items.map((row, i) => {
            const kind = emailKind(row);
            const badge = kindBadge(kind);
            return (
              <Panel key={String(row.id || row._id || i)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-jevah-text">
                    {row.subject || "Untitled"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={badge.tone}>{badge.label}</Badge>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
