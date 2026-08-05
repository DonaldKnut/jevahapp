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
  PageEnter,
  SkeletonRows,
} from "../../components/admin/ui";
import {
  ClockIcon,
  BoltIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const ACTION_ICONS: Record<string, string> = {
  create: "✨",
  update: "✏️",
  delete: "🗑️",
  publish: "📢",
  approve: "✅",
  reject: "❌",
  ban: "🔨",
  unban: "🔓",
  login: "🔑",
  logout: "👋",
  email: "✉️",
  restore: "♻️",
};

function getIcon(type?: string): string {
  if (!type) return "⚡";
  const lower = type.toLowerCase();
  for (const [key, icon] of Object.entries(ACTION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "⚡";
}

function relativeTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

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
    <PageEnter>
      <PageHeader
        title="Activity Log"
        subtitle={
          isSuperAdmin && scope === "all"
            ? "Full org-wide audit trail across all admin accounts."
            : "Chronological audit trail of all actions from your admin account."
        }
        badgeText="Audit"
      />

      {/* Scope switcher for super-admins */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 overflow-hidden rounded-3xl border border-jevah-border bg-jevah-card p-1.5">
          {[
            { key: "me" as const, label: "My Activity", icon: ClockIcon },
            { key: "all" as const, label: "All Admins", icon: GlobeAltIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold transition ${
                scope === key
                  ? "bg-jevah-surface text-jevah-text shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Stats strip */}
      {!loading && activity.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-jevah-border/60 bg-jevah-surface px-4 py-3 shadow-sm">
            <BoltIcon className="h-5 w-5 text-jevah-accent shrink-0" />
            <div>
              <p className="text-xs font-bold text-jevah-text-muted uppercase tracking-wide">Events</p>
              <p className="text-lg font-black text-jevah-text">{activity.length}</p>
            </div>
          </div>
          {scope === "all" && (
            <div className="flex items-center gap-3 rounded-2xl border border-jevah-border/60 bg-jevah-surface px-4 py-3 shadow-sm">
              <UserGroupIcon className="h-5 w-5 text-purple-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-jevah-text-muted uppercase tracking-wide">Admins</p>
                <p className="text-lg font-black text-jevah-text">
                  {new Set(activity.map((e) => (e as any).adminId || (e as any).userId)).size}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 rounded-2xl border border-jevah-border/60 bg-jevah-surface px-4 py-3 shadow-sm">
            <ClockIcon className="h-5 w-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-jevah-text-muted uppercase tracking-wide">Latest</p>
              <p className="text-sm font-bold text-jevah-text">
                {activity[0]
                  ? relativeTime((activity[0].createdAt || activity[0].timestamp) as string)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={5} />
      ) : activity.length === 0 ? (
        <EmptyState
          title="No activity recorded"
          description="Actions you take as an admin will be logged and appear here."
          icon={BoltIcon}
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-7 top-0 bottom-0 w-px bg-jevah-border/60" />

          <div className="space-y-1.5 pl-16">
            {activity.map((ev, i) => (
              <div
                key={ev.id || String(i)}
                className="admin-list-item relative"
                style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute -left-10 top-3.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-jevah-border bg-jevah-card text-xs shadow-sm">
                  {getIcon(ev.type)}
                </div>

                <div className="group flex items-start justify-between gap-3 rounded-2xl border border-jevah-border/50 bg-jevah-surface px-4 py-3.5 shadow-sm transition hover:border-jevah-accent/20 hover:shadow-md">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand" size="sm">
                        {ev.type}
                      </Badge>
                      {(ev as any).adminEmail && (
                        <span className="text-xs text-jevah-text-muted font-semibold">
                          {(ev as any).adminEmail}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-jevah-text leading-snug">
                      {ev.title || ev.message || ev.description || "Admin action"}
                    </p>
                    {(ev as any).target && (
                      <p className="mt-0.5 text-xs text-jevah-text-muted font-mono truncate">
                        → {String((ev as any).target)}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-jevah-text-muted">
                      {relativeTime((ev.createdAt || ev.timestamp) as string)}
                    </p>
                    {(ev.createdAt || ev.timestamp) && (
                      <p className="mt-0.5 text-xs text-jevah-text-muted/60">
                        {new Date((ev.createdAt || ev.timestamp) as string).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageEnter>
  );
}
