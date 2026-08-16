import { useCallback, useEffect, useRef, useState } from "react";
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
import { ApiError, isApiRateLimited } from "../../lib/api";
import { ErrorToaster } from "../../components/ErrorToaster";
import {
  KpiLink,
  Panel,
  Skeleton,
  SkeletonRows,
  PageHeader,
  PageEnter,
  Badge,
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
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import QuickReviewModal from "./components/QuickReviewModal";
import OverviewKpiPeek, {
  type OverviewPeek,
} from "./components/OverviewKpiPeek";

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

const EVENT_TYPE_STYLES: Record<string, { tone: "info" | "success" | "danger" | "warning" | "purple" | "brand"; label: string }> = {
  upload:    { tone: "info", label: "Media Upload" },
  login:     { tone: "success", label: "User Login" },
  report:    { tone: "danger", label: "New Report" },
  ban:       { tone: "danger", label: "Account Ban" },
  flag:      { tone: "warning", label: "Flagged Content" },
  review:    { tone: "purple", label: "Under Review" },
  approve:   { tone: "success", label: "Item Approved" },
};

function getEventStyle(type?: string) {
  const key = (type ?? "").toLowerCase();
  for (const k of Object.keys(EVENT_TYPE_STYLES)) {
    if (key.includes(k)) return EVENT_TYPE_STYLES[k];
  }
  return { tone: "brand" as const, label: type || "Event" };
}

function ModerationStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, " ");
  const map: Record<string, "warning" | "brand" | "success" | "danger"> = {
    "under review": "warning",
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  const tone = map[s] ?? "brand";
  return (
    <Badge tone={tone} size="sm" dot>
      {s}
    </Badge>
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
  const [refreshing, setRefreshing] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewSeed, setReviewSeed] = useState<AdminMediaCard | null>(null);
  const [peek, setPeek] = useState<OverviewPeek | null>(null);
  const hasDataRef = useRef(false);

  const load = useCallback(async (isManual = false) => {
    if (!isManual && isApiRateLimited()) return;
    try {
      if (isManual) setRefreshing(true);
      const [a, f, p, m, q] = await Promise.all([
        fetchAnalytics().catch(() => null),
        fetchFeed(25).catch(() => null),
        fetchPresence({ status: "online", limit: 20 }).catch(() => null),
        fetchRecentMedia({ limit: 10 }).catch(() => null),
        fetchModerationQueue({ status: "under_review", limit: 5 }).catch(
          () => null
        ),
      ]);
      if (a) setAnalytics(a);
      if (f) setFeed(f.items);
      if (p) {
        setOnlineUsers(p.users);
        setOnlineCount(p.onlineCount ?? f?.onlineCount ?? 0);
      } else if (f?.onlineCount != null) {
        setOnlineCount(f.onlineCount);
      }
      if (m) setRecent(m.media);
      if (q) setQueuePreview(q.items);
      const gotAny = Boolean(a || f || p || m || q);
      if (gotAny) {
        hasDataRef.current = true;
        setError(null);
      } else if (isManual || !hasDataRef.current) {
        setError(
          isApiRateLimited()
            ? "The API asked us to slow down. Wait a minute, then hit Refresh."
            : "Failed to load dashboard data."
        );
      }
    } catch (err) {
      if (hasDataRef.current && !isManual) return;
      setError(
        err instanceof ApiError ? err.message : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const tick = () => {
      if (document.hidden || isApiRateLimited()) return;
      void load();
    };
    const id = window.setInterval(tick, 120000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  useEffect(() => {
    if (isApiRateLimited()) return;
    let alive = true;
    void fetchTimeseries({ metric, range: "7d" })
      .then((ts) => {
        if (!alive || !ts) return;
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
      })
      .catch(() => {
        /* chart is optional */
      });
    return () => {
      alive = false;
    };
  }, [metric]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <SkeletonRows rows={4} />
      </div>
    );
  }

  const kpiCards: Array<{
    peek: OverviewPeek;
    label: string;
    value: number;
    tone: "danger" | "warning" | "brand" | "neutral" | "success";
    icon: typeof FlagIcon;
    desc: string;
    trend?: string;
    trendUp?: boolean;
  }> = [
    {
      peek: "reports",
      label: "Media Reports",
      value: analytics?.reports?.pending ?? 0,
      tone: "danger",
      icon: FlagIcon,
      desc: "Requires admin review",
      trend: "+12%",
      trendUp: false,
    },
    {
      peek: "comments",
      label: "Reported Comments",
      value: analytics?.reports?.comments ?? 0,
      tone: "warning",
      icon: ChatBubbleLeftEllipsisIcon,
      desc: "Community flags",
      trend: "+4%",
      trendUp: false,
    },
    {
      peek: "review",
      label: "Under Review",
      value: analytics?.moderation?.pending ?? 0,
      tone: "brand",
      icon: ShieldCheckIcon,
      desc: "In moderation queue",
      trend: "-8%",
      trendUp: true,
    },
    {
      peek: "banned",
      label: "Banned Users",
      value: analytics?.users?.banned ?? 0,
      tone: "neutral",
      icon: UserMinusIcon,
      desc: "Restricted accounts",
    },
    {
      peek: "artists",
      label: "Unverified Artists",
      value: analytics?.verification?.unverifiedArtists ?? 0,
      tone: "success",
      icon: UserGroupIcon,
      desc: "Verification requests",
      trend: "+18%",
      trendUp: true,
    },
    {
      peek: "sessions",
      label: "Active Sessions",
      value: onlineCount,
      tone: "brand",
      icon: WifiIcon,
      desc: "Online right now",
      trend: "Live",
      trendUp: true,
    },
  ];

  return (
    <PageEnter>
      {/* ── Page Header ── */}
      <PageHeader
        title="Executive Overview"
        subtitle="Real-time system pulse, platform telemetry, active sessions, and moderation queues."
        badgeText="Live Stream"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-jevah-border bg-jevah-surface px-3.5 py-2 text-xs font-bold text-jevah-text shadow-sm hover:bg-jevah-card active:scale-95 transition"
            >
              <ArrowPathIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-jevah-accent" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
              <BoltIcon className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              Socket Active
            </div>
          </div>
        }
      />

      <ErrorToaster error={error} title="Dashboard error" />

      {(() => {
        const missingOnboard =
          analytics?.verification?.activeArtistsMissingOnboardEmail ?? 0;
        const pendingApps =
          analytics?.verification?.pendingCreatorApplications ?? 0;
        const reminders = Array.isArray(analytics?.reminders)
          ? analytics.reminders
          : [];
        if (missingOnboard <= 0 && reminders.length === 0) return null;
        return (
          <div className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3.5 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-amber-800 dark:text-amber-200">
                  Artists still need a welcome email
                </p>
                <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                  {missingOnboard > 0
                    ? `${missingOnboard} approved artist${missingOnboard === 1 ? "" : "s"} haven’t gotten the Studio invite yet.`
                    : "A few creator reminders need a look."}
                  {pendingApps > 0
                    ? ` · ${pendingApps} application${pendingApps === 1 ? "" : "s"} waiting for review.`
                    : ""}
                </p>
              </div>
              <Link
                to="/admin/email/artist-onboard"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
              >
                Send welcome emails
              </Link>
            </div>
          </div>
        );
      })()}

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <KpiLink
            key={card.label}
            label={card.label}
            value={card.value}
            onClick={() => setPeek(card.peek)}
            tone={card.tone}
            icon={card.icon}
            desc={card.desc}
            trend={card.trend}
            trendUp={card.trendUp}
          />
        ))}
      </div>

      {/* ── Visual Analytics & Online Pulse ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeseries Graph - 2 cols */}
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-jevah-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-jevah-text">Growth & Engagement Trends</h2>
                <p className="text-xs text-jevah-text-muted">7-Day metrics activity curve</p>
              </div>
            </div>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="rounded-xl border border-jevah-border bg-jevah-surface px-3 py-1.5 text-xs font-semibold text-jevah-text shadow-sm focus:outline-none focus:ring-2 focus:ring-jevah-accent/30"
            >
              <option value="signups">User Signups</option>
              <option value="uploads">Media Uploads</option>
              <option value="reports">Security Reports</option>
              <option value="activeUsers">Active Daily Users</option>
            </select>
          </div>

          {series.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 rounded-xl border border-dashed border-jevah-border/60 bg-jevah-surface/40">
              <p className="text-xs font-semibold text-jevah-text-muted">No telemetry data recorded for this timeframe.</p>
            </div>
          ) : (
            <div className="pt-2">
              <div className="flex h-44 items-end gap-2 pt-4">
                {series.map((pt, i) => {
                  const val = Number(pt.value ?? pt.count ?? 0);
                  const max = Math.max(
                    ...series.map((p) => Number(p.value ?? p.count ?? 0)),
                    1
                  );
                  const h = Math.max(8, Math.round((val / max) * 100));
                  return (
                    <div
                      key={String(pt.date || pt.label || i)}
                      className="group flex flex-1 flex-col items-center gap-1.5"
                      title={`${pt.date || pt.label || ""}: ${val}`}
                    >
                      <span className="text-[10px] font-bold text-jevah-accent opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1">
                        {val}
                      </span>
                      <div
                        className="w-full rounded-xl bg-gradient-to-t from-jevah-accent to-emerald-400 transition-all duration-300 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(37,110,99,0.4)] shadow-sm"
                        style={{ height: `${h}%` }}
                      />
                      <span className="truncate text-[10px] font-bold text-jevah-text-muted">
                        {(pt.date || pt.label || "").toString().slice(5, 10) || String(i + 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>

        {/* Online Users Ticker - 1 col */}
        <Panel>
          <div className="mb-4 flex items-center justify-between border-b border-jevah-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <WifiIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-jevah-text">Live Presence</h2>
                <p className="text-xs text-jevah-text-muted">{onlineCount} active sessions</p>
              </div>
            </div>
            <Link
              to="/admin/users?presence=online"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-jevah-accent hover:underline"
            >
              View all
              <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {onlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 rounded-xl border border-dashed border-jevah-border/60 text-center">
              <WifiIcon className="mb-2 h-7 w-7 text-jevah-text-muted" />
              <p className="text-xs font-bold text-jevah-text-muted">No users active right now</p>
            </div>
          ) : (
            <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
              {onlineUsers.slice(0, 6).map((u) => {
                const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
                const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-jevah-border/60 bg-jevah-surface p-2.5 shadow-sm transition hover:border-jevah-accent/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-xs font-extrabold text-white">
                        {initials}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 admin-online-dot" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-jevah-text">{name}</p>
                        <p className="truncate text-[10px] text-jevah-text-muted capitalize">{u.role}</p>
                      </div>
                    </div>
                    <Badge tone="success" size="sm">Online</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Activity Stream & Moderation Widgets ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity feed - takes 3 cols */}
        <Panel className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between border-b border-jevah-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
                <ClockIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-jevah-text">System Audit Feed</h2>
                <p className="text-xs text-jevah-text-muted">Real-time audit log stream</p>
              </div>
            </div>
            <span className="rounded-full bg-jevah-card px-2.5 py-0.5 text-xs font-extrabold text-jevah-text-muted">
              {feed.length} logged
            </span>
          </div>

          <ul className="max-h-[440px] space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
            {feed.length === 0 && (
              <li className="py-10 text-center text-xs text-jevah-text-muted">No recent system events logged.</li>
            )}
            {feed.map((ev, i) => {
              const style = getEventStyle(ev.type);
              return (
                <li
                  key={ev.id || String(i)}
                  className="group flex items-start gap-3 rounded-xl border border-jevah-border/50 bg-jevah-surface/60 p-3.5 transition hover:border-jevah-accent/30 hover:bg-jevah-surface"
                >
                  <div className="mt-0.5">
                    <Badge tone={style.tone} size="sm">
                      {style.label}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-jevah-text leading-snug">
                        {ev.title || ev.message || ev.description || "Admin action executed"}
                      </p>
                      <span className="shrink-0 text-[10px] font-semibold text-jevah-text-muted">
                        {formatWhen(ev.createdAt || ev.timestamp)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Moderation preview widgets - 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Latest uploads */}
          <Panel>
            <div className="mb-4 flex items-center justify-between border-b border-jevah-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
                  <MusicalNoteIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-jevah-text">Latest Uploads</h2>
                  <p className="text-xs text-jevah-text-muted">Recent community audio</p>
                </div>
              </div>
              <Link
                to="/admin/audio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-jevah-accent hover:underline"
              >
                View all
                <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <ul className="space-y-2.5">
              {recent.length === 0 && (
                <li className="py-6 text-center text-xs text-jevah-text-muted">No recent uploads found.</li>
              )}
              {recent.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSeed(item);
                      setReviewId(item.id);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-jevah-border/60 bg-jevah-surface p-2.5 text-left shadow-sm transition hover:border-jevah-accent/40 hover:shadow-md"
                  >
                    {item.preview?.thumbnailUrl ? (
                      <img
                        src={item.preview.thumbnailUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-jevah-border"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jevah-accent/10 text-jevah-accent">
                        <MusicalNoteIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-jevah-text">{item.title}</p>
                      <p className="truncate text-[10px] font-medium text-jevah-text-muted capitalize">{item.contentType}</p>
                    </div>
                    <ModerationStatusBadge status={item.moderationStatus} />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Pending moderation queue */}
          <Panel>
            <div className="mb-4 flex items-center justify-between border-b border-jevah-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-jevah-text">Moderation Queue</h2>
                  <p className="text-xs text-jevah-text-muted">Action items pending review</p>
                </div>
              </div>
              <Link
                to="/admin/moderation"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-jevah-accent hover:underline"
              >
                Open queue
                <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>

            {queuePreview.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-500/10 p-5 text-center ring-1 ring-emerald-500/20">
                <CheckCircleIcon className="mb-1 h-7 w-7 text-emerald-500" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Moderation Queue Clear</p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400">All submissions reviewed!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {queuePreview.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSeed(item);
                        setReviewId(item.id);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-amber-500/10 p-2.5 text-left ring-1 ring-amber-500/20 transition hover:bg-amber-500/15"
                    >
                      <span className="min-w-0 truncate text-xs font-bold text-jevah-text">
                        {item.title}
                      </span>
                      <ModerationStatusBadge status={item.moderationStatus} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <OverviewKpiPeek
        peek={peek}
        onlineUsers={onlineUsers}
        queuePreview={queuePreview}
        onClose={() => setPeek(null)}
        onOpenReview={(item) => {
          setPeek(null);
          setReviewSeed(item);
          setReviewId(item.id);
        }}
      />
      <QuickReviewModal
        mediaId={reviewId}
        seed={reviewSeed}
        onClose={() => {
          setReviewId(null);
          setReviewSeed(null);
        }}
        onResolved={(id, status) => {
          setRecent((list) =>
            list.map((m) => (m.id === id ? { ...m, moderationStatus: status } : m))
          );
          setQueuePreview((list) =>
            status === "approved" || status === "rejected"
              ? list.filter((m) => m.id !== id)
              : list
          );
        }}
      />
    </PageEnter>
  );
}

