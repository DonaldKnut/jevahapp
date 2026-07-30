import { useCallback, useEffect, useState } from "react";
import { fetchSystemHealth } from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  PageHeader,
  Panel,
  SkeletonRows,
} from "../../components/admin/ui";

type Health = {
  status?: string;
  api?: string;
  mongo?: string;
  redis?: string;
  storage?: string;
  version?: string;
  uptimeSeconds?: number;
  queues?: Record<string, { waiting?: number; failed?: number }>;
};

function statusTone(s?: string): "success" | "danger" | "warning" | "neutral" {
  if (!s) return "neutral";
  const v = s.toLowerCase();
  if (v === "ok" || v === "healthy" || v === "up") return "success";
  if (v === "degraded" || v === "warn") return "warning";
  return "danger";
}

function formatUptime(sec?: number) {
  if (sec == null) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchSystemHealth()) as Health;
      setHealth(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Health endpoint unavailable."
      );
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(id);
  }, [load]);

  const services = [
    ["API", health?.api || health?.status],
    ["Mongo", health?.mongo],
    ["Redis", health?.redis],
    ["Storage", health?.storage],
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader
        title="System health"
        subtitle="Ops status · auto-refreshes every 30s."
        actions={
          <Button variant="secondary" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading && !health ? (
        <SkeletonRows rows={3} />
      ) : health ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([label, value]) => (
              <Panel key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <div className="mt-2">
                  <Badge tone={statusTone(value)}>{value || "unknown"}</Badge>
                </div>
              </Panel>
            ))}
          </div>

          <Panel>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-400">Version</p>
                <p className="mt-1 font-mono text-slate-800">
                  {health.version || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Uptime</p>
                <p className="mt-1 font-medium text-slate-800">
                  {formatUptime(health.uptimeSeconds)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Overall</p>
                <div className="mt-1">
                  <Badge tone={statusTone(health.status)}>
                    {health.status || "unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </Panel>

          {health.queues && Object.keys(health.queues).length > 0 && (
            <Panel>
              <p className="mb-3 text-sm font-semibold text-[#0B1A1F]">Queues</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(health.queues).map(([name, q]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <p className="text-sm font-medium capitalize">{name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      waiting {q.waiting ?? 0} · failed {q.failed ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </>
      ) : null}
    </div>
  );
}
