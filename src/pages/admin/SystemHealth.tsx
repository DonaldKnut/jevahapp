import { useCallback, useEffect, useState } from "react";
import { fetchSystemHealth } from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  PageHeader,
  PageEnter,
  SkeletonRows,
} from "../../components/admin/ui";
import {
  ServerIcon,
  CircleStackIcon,
  BoltIcon,
  CloudIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

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

function statusIcon(s?: string) {
  const tone = statusTone(s);
  if (tone === "success") return CheckCircleIcon;
  if (tone === "warning") return ExclamationTriangleIcon;
  if (tone === "danger") return XCircleIcon;
  return ClockIcon;
}

function statusBg(s?: string) {
  const tone = statusTone(s);
  if (tone === "success") return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  if (tone === "warning") return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  if (tone === "danger") return "bg-rose-500/15 text-rose-500 border-rose-500/30";
  return "bg-jevah-card text-jevah-text-muted border-jevah-border";
}

function formatUptime(sec?: number) {
  if (sec == null) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const SERVICES = [
  { key: "api" as const, label: "API Server", icon: ServerIcon },
  { key: "mongo" as const, label: "MongoDB", icon: CircleStackIcon },
  { key: "redis" as const, label: "Redis Cache", icon: BoltIcon },
  { key: "storage" as const, label: "Storage", icon: CloudIcon },
] as const;

export default function SystemHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [spinning, setSpinning] = useState(false);

  const load = useCallback(async () => {
    setSpinning(true);
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchSystemHealth()) as Health;
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Health endpoint unavailable."
      );
      setHealth(null);
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 400);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.hidden) return;
      void load();
    }, 60000);
    return () => window.clearInterval(id);
  }, [load]);

  const overallStatusBg = statusBg(health?.status);

  return (
    <PageEnter>
      <PageHeader
        title="System Health"
        subtitle="Live operational status of all platform services. Auto-refreshes every 60 seconds."
        badgeText="Ops"
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-jevah-text-muted sm:block">
              Last updated {lastRefresh.toLocaleTimeString()}
            </span>
            <Button variant="secondary" onClick={() => void load()}>
              <ArrowPathIcon className={`h-4 w-4 transition-transform ${spinning ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
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
          {/* Overall Status Banner */}
          <div className={`flex items-center justify-between gap-4 rounded-3xl border p-5 ${overallStatusBg}`}>
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = statusIcon(health.status);
                return <Icon className="h-8 w-8 shrink-0" />;
              })()}
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Overall Status</p>
                <p className="text-2xl font-black capitalize">{health.status || "Unknown"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold opacity-60 uppercase tracking-wide">Uptime</p>
              <p className="text-xl font-black">{formatUptime(health.uptimeSeconds)}</p>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ key, label, icon: Icon }) => {
              const value = key === "api" ? (health.api || health.status) : health[key];
              const bg = statusBg(value);
              const StatusIcon = statusIcon(value);
              return (
                <div
                  key={key}
                  className={`flex flex-col gap-3 rounded-3xl border p-5 transition hover:shadow-md ${bg}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6" />
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">{label}</p>
                    <p className="mt-1 text-base font-black capitalize">{value || "Unknown"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Build Info */}
          <div className="grid gap-4 rounded-3xl border border-jevah-border bg-jevah-surface p-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <CodeBracketIcon className="mt-0.5 h-5 w-5 shrink-0 text-jevah-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-jevah-text-muted">Version</p>
                <p className="mt-1 font-mono text-lg font-black text-jevah-text">
                  {health.version || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-jevah-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-jevah-text-muted">Uptime</p>
                <p className="mt-1 text-lg font-black text-jevah-text">
                  {formatUptime(health.uptimeSeconds)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowPathIcon className="mt-0.5 h-5 w-5 shrink-0 text-jevah-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-jevah-text-muted">Last Checked</p>
                <p className="mt-1 text-sm font-bold text-jevah-text">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Panel */}
          {health.queues && Object.keys(health.queues).length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BoltIcon className="h-5 w-5 text-jevah-accent" />
                <h2 className="text-sm font-black uppercase tracking-widest text-jevah-text">
                  Job Queues
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(health.queues).map(([name, q]) => {
                  const hasFailed = (q.failed ?? 0) > 0;
                  return (
                    <div
                      key={name}
                      className={`rounded-3xl border p-5 transition hover:shadow-md ${
                        hasFailed
                          ? "border-rose-500/30 bg-rose-500/10"
                          : "border-jevah-border bg-jevah-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black capitalize text-jevah-text">{name}</p>
                        <Badge tone={hasFailed ? "danger" : "success"} size="sm" dot>
                          {hasFailed ? "issues" : "ok"}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-jevah-border bg-jevah-card px-3 py-2 text-center">
                          <p className="text-lg font-black text-jevah-text">{q.waiting ?? 0}</p>
                          <p className="text-xs font-bold text-jevah-text-muted uppercase tracking-wide">Waiting</p>
                        </div>
                        <div className={`rounded-xl border px-3 py-2 text-center ${hasFailed ? "border-rose-500/30 bg-rose-500/10" : "border-jevah-border bg-jevah-card"}`}>
                          <p className={`text-lg font-black ${hasFailed ? "text-rose-500" : "text-jevah-text"}`}>{q.failed ?? 0}</p>
                          <p className="text-xs font-bold text-jevah-text-muted uppercase tracking-wide">Failed</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </PageEnter>
  );
}
