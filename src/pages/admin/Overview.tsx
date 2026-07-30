import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAnalytics,
  fetchFeed,
  fetchModerationQueue,
  fetchPresence,
  fetchRecentMedia,
  fetchTimeseries,
} from "../../services/adminApi";
import type {
  DashboardAnalytics,
  FeedEvent,
  AdminMediaCard,
  AdminUser,
} from "../../types/admin";
import { ApiError } from "../../lib/api";
import { ErrorToaster } from "../../components/ErrorToaster";
import {
  KpiLink,
  Panel,
  Skeleton,
  SkeletonRows,
} from "../../components/admin/ui";
import {
  FlagIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  UserGroupIcon,
  WifiIcon,
  ArrowUpRightIcon,
  MusicalNoteIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

function formatWhen(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return iso ?? "";
  }
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  upload:    { bg: "bg-sky-500/10", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-400" },
  login:     { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-400" },
  report:    { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-400" },
  ban:       { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  flag:      { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-400" },
  review:    { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-400" },
  approve:   { bg: "bg-green-500/10", text: "text-green-700 dark:text-green-300", dot: "bg-green-400" },
  default:   { bg: "bg-jevah-muted", text: "text-jevah-text-muted", dot: "bg-jevah-border" },
};

function getEventStyle(type?: string) {
  const key = (type ?? "").toLowerCase();
  for (const k of Object.keys(EVENT_TYPE_COLORS)) {
    if (key.includes(k)) return EVENT_TYPE_COLORS[k];
  }
  return EVENT_TYPE_COLORS.default;
}

function ModerationStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, " ");
  const map: Record<string, string> = {
    "under review": "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300",
    pending: "bg-orange-500/10 text-orange-800 ring-orange-500/20 dark:text-orange-300",
    approved: "bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 dark:text-emerald-300",
    rejected: "bg-red-500/10 text-red-800 ring-red-500/20 dark:text-red-300",
  };
  const cls = map[s] ?? "bg-jevah-card text-jevah-text ring-jevah-border";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 capitalize ${cls}`}>
      {s}
    </span>
  );
}

export default function Overview() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<AdminUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recent, setRecent] = useState<AdminMediaCard[]>([]);
  const [queuePreview, setQueuePreview] = useState<AdminMediaCard[]>([]);
  const [series, setSeries] = useState<
    Array<{ date?: string; label?: string; value?: number; count?: number }>
  >([]);
  const [metric, setMetric] = useState("signups");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [a, f, p, m, q, ts] = await Promise.all([
        fetchAnalytics(),
        fetchFeed(25),
        fetchPresence({ status: "online", limit: 20 }),
        fetchRecentMedia({ limit: 10 }),
        fetchModerationQueue({ status: "under_review", limit: 5 }),
        fetchTimeseries({ metric, range: "7d" }).catch(() => null),
      ]);
      setAnalytics(a);
      setFeed(f.items);
      setOnlineUsers(p.users);
      setOnlineCount(p.onlineCount ?? f.onlineCount ?? 0);
      setRecent(m.media);
      setQueuePreview(q.items);
      if (ts) {
        const raw = ts as unknown;
        const points = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { points?: unknown }).points)
            ? (raw as { points: unknown[] }).points
            : Array.isArray((raw as { data?: unknown }).data)
              ? (raw as { data: unknown[] }).data
              : [];
        setSeries(
          points as Array<{
            date?: string;
            label?: string;
            value?: number;
            count?: number;
          }>
        );
      } else {
        setSeries([]);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 45000);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* KPI skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <SkeletonRows rows={4} />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Media Reports",
      value: analytics?.reports?.pending ?? 0,
      to: "/admin/reports?status=pending",
      tone: "danger" as const,
      icon: FlagIcon,
      desc: "Pending review",
    },
    {
      label: "Reported Comments",
      value: analytics?.reports?.comments ?? 0,
      to: "/admin/reports?type=comment",
      tone: "warning" as const,
      icon: ChatBubbleLeftEllipsisIcon,
      desc: "Flagged by users",
    },
    {
      label: "Under Review",
      value: analytics?.moderation?.pending ?? 0,
      to: "/admin/moderation",
      tone: "brand" as const,
      icon: ShieldCheckIcon,
      desc: "In moderation queue",
    },
    {
      label: "Banned Users",
      value: analytics?.users?.banned ?? 0,
      to: "/admin/users?isBanned=true",
      tone: "neutral" as const,
      icon: UserMinusIcon,
      desc: "Restricted accounts",
    },
    {
      label: "Unverified Artists",
      value: analytics?.verification?.unverifiedArtists ?? 0,
      to: "/admin/users?role=artist",
      tone: "brand" as const,
      icon: UserGroupIcon,
      desc: "Awaiting verification",
    },
    {
      label: "Online Now",
      value: onlineCount,
      to: "/admin/users?presence=online",
      tone: "brand" as const,
      icon: WifiIcon,
      desc: "Active right now",
    },
  ];

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-jevah-accent/10">
              <SparklesIcon className="h-4 w-4 text-jevah-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-jevah-text sm:text-3xl">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-jevah-text-muted leading-relaxed">
            Platform overview · Live pulse, refreshes every 45 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200/50">
            <BoltIcon className="h-3.5 w-3.5 text-emerald-500" />
            Live
          </div>
        </div>
      </div>

      <ErrorToaster error={error} title="Dashboard error" />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <KpiLink
            key={card.label}
            label={card.label}
            value={card.value}
            to={card.to}
            tone={card.tone}
            icon={card.icon}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Timeseries ── */}
      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-jevah-text">Last 7 days</p>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="rounded-lg border border-jevah-border px-2 py-1.5 text-xs"
          >
            <option value="signups">Signups</option>
            <option value="uploads">Uploads</option>
            <option value="reports">Reports</option>
            <option value="activeUsers">Active users</option>
          </select>
        </div>
        {series.length === 0 ? (
          <p className="text-sm text-jevah-text-muted">
            Chart data unavailable (timeseries endpoint optional).
          </p>
        ) : (
          <div className="flex h-36 items-end gap-1.5">
            {series.map((pt, i) => {
              const val = Number(pt.value ?? pt.count ?? 0);
              const max = Math.max(
                ...series.map((p) => Number(p.value ?? p.count ?? 0)),
                1
              );
              const h = Math.max(4, Math.round((val / max) * 100));
              return (
                <div
                  key={String(pt.date || pt.label || i)}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${pt.date || pt.label || ""}: ${val}`}
                >
                  <div
                    className="w-full rounded-t-md bg-jevah-accent/80"
                    style={{ height: `${h}%` }}
                  />
                  <span className="truncate text-[9px] text-jevah-text-muted">
                    {(pt.date || pt.label || "").toString().slice(5, 10) ||
                      String(i + 1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* ── Online Users Strip ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-jevah-text">Online Now</h2>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {onlineCount}
            </span>
          </div>
          <Link
            to="/admin/users?presence=online"
            className="inline-flex items-center gap-1 text-sm font-semibold text-jevah-accent transition hover:text-jevah-accent-hover"
          >
            View all
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {onlineUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-jevah-border bg-jevah-surface/60 px-6 py-8 text-center">
            <WifiIcon className="mx-auto mb-2 h-8 w-8 text-jevah-text-muted" />
            <p className="text-sm font-medium text-jevah-text-muted">No one online right now</p>
          </div>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {onlineUsers.map((u, i) => {
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
              const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
              return (
                <div
                  key={u.id}
                  className="admin-list-item group min-w-[160px] cursor-pointer rounded-2xl border border-jevah-border bg-jevah-surface p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <div className="relative mb-2.5 inline-flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-xs font-bold text-white">
                      {initials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 admin-online-dot" />
                  </div>
                  <p className="truncate text-sm font-semibold text-jevah-text">{name}</p>
                  <p className="truncate text-[11px] capitalize text-jevah-text-muted">{u.role}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Bottom grid ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Activity feed - takes 3 cols */}
        <Panel className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-jevah-card">
                <ClockIcon className="h-4 w-4 text-jevah-text-muted" />
              </div>
              <h2 className="text-base font-bold text-jevah-text">Activity Feed</h2>
            </div>
            <span className="rounded-full bg-jevah-card px-2.5 py-0.5 text-[11px] font-semibold text-jevah-text-muted">
              {feed.length} events
            </span>
          </div>

          <ul className="max-h-[460px] space-y-2 overflow-y-auto pr-0.5 custom-scrollbar">
            {feed.length === 0 && (
              <li className="py-8 text-center text-sm text-jevah-text-muted">No recent events.</li>
            )}
            {feed.map((ev, i) => {
              const style = getEventStyle(ev.type);
              return (
                <li
                  key={ev.id || String(i)}
                  className="flex items-start gap-3 rounded-xl border border-transparent bg-jevah-muted/80 px-3.5 py-3 transition hover:border-jevah-border hover:bg-jevah-surface"
                >
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                        {ev.type}
                      </span>
                      <span className="shrink-0 text-[10px] text-jevah-text-muted">
                        {formatWhen(ev.createdAt || ev.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-jevah-text leading-snug">
                      {ev.title || ev.message || ev.description || "Admin event"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Right column - 2 cols */}
        <div className="space-y-5 lg:col-span-2">
          {/* Latest uploads */}
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-jevah-card">
                  <MusicalNoteIcon className="h-4 w-4 text-jevah-text-muted" />
                </div>
                <h2 className="text-base font-bold text-jevah-text">Latest Uploads</h2>
              </div>
              <Link
                to="/admin/moderation"
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-jevah-accent hover:text-jevah-accent-hover"
              >
                Moderation
                <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <ul className="space-y-2">
              {recent.length === 0 && (
                <li className="py-4 text-center text-sm text-jevah-text-muted">No recent uploads.</li>
              )}
              {recent.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-jevah-border p-2 transition hover:border-jevah-border hover:bg-jevah-card"
                >
                  {item.preview?.thumbnailUrl ? (
                    <img
                      src={item.preview.thumbnailUrl}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                      <MusicalNoteIcon className="h-5 w-5 text-jevah-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-jevah-text">{item.title}</p>
                    <p className="mt-0.5 text-[11px] capitalize text-jevah-text-muted">
                      {item.contentType}
                    </p>
                  </div>
                  <ModerationStatusBadge status={item.moderationStatus} />
                </li>
              ))}
            </ul>
          </Panel>

          {/* On review queue */}
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                </div>
                <h2 className="text-base font-bold text-jevah-text">On Review</h2>
              </div>
              <Link
                to="/admin/moderation"
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-jevah-accent hover:text-jevah-accent-hover"
              >
                Open queue
                <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>

            {queuePreview.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-50 py-5 text-center">
                <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-700">Queue is clear</p>
                <p className="text-[11px] text-emerald-500">All caught up!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {queuePreview.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-amber-50/70 px-3 py-2.5 ring-1 ring-amber-200/40"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-jevah-text">
                      {item.title}
                    </span>
                    <ModerationStatusBadge status={item.moderationStatus} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
