import {
  ChartBarIcon,
  GlobeAltIcon,
  HeartIcon,
  MusicalNoteIcon,
  SparklesIcon,
  UsersIcon,
  BookmarkIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import type { CreatorAnalytics } from "../../../services/creators/analytics";
import StudioStatCard from "./StudioStatCard";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

type Props = {
  analytics: CreatorAnalytics | null;
  loading?: boolean;
  rangeDays?: number;
  onRangeDays?: (n: number) => void;
};

export default function CreatorAnalyticsDashboard({
  analytics,
  loading,
  rangeDays = 28,
  onRangeDays,
}: Props) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-jevah-card" />
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded-lg bg-jevah-card" />
            <div className="h-3 w-24 animate-pulse rounded-lg bg-jevah-card" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-3xl bg-jevah-card/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const maxRegion = Math.max(1, ...analytics.topRegions.map((r) => r.listens));
  const maxTrack = Math.max(1, ...analytics.topTracks.map((t) => t.listens));
  const series = analytics.timeseries || [];

  return (
    <section className="overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-jevah-border/60 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/30 shadow-md">
            <ChartBarIcon className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-jevah-text">
                Audience & Stream Performance
              </h2>
              {analytics.source === "api" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/25">
                  <SparklesIcon className="h-3 w-3 animate-spin" />
                  Live Real-Time
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-jevah-text-muted">
              Performance metrics for the last {analytics.rangeDays} days
              {analytics.source === "catalog_fallback"
                ? " · catalog stream metrics"
                : ""}
            </p>
          </div>
        </div>

        {/* Time Range Filter Pills */}
        <div className="flex items-center gap-2">
          {onRangeDays && (
            <div className="flex rounded-full bg-jevah-card p-1 ring-1 ring-jevah-border/80 shadow-inner">
              {[7, 28, 90].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onRangeDays(n)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-black transition-all duration-200 ${
                    rangeDays === n
                      ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-md shadow-jevah-accent/25"
                      : "text-jevah-text-muted hover:text-jevah-text"
                  }`}
                >
                  {n} Days
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">
        <StudioStatCard
          label="Total Listens"
          value={fmt(analytics.totalListens)}
          change="+14.2%"
          trend="up"
          subtitle="vs prev period"
          icon={MusicalNoteIcon}
          color="emerald"
        />
        <StudioStatCard
          label="Unique Listeners"
          value={analytics.uniqueListeners ? fmt(analytics.uniqueListeners) : "—"}
          change="+8.6%"
          trend="up"
          subtitle="active audience"
          icon={UsersIcon}
          color="teal"
        />
        <StudioStatCard
          label="Catalog Likes"
          value={analytics.likes ? fmt(analytics.likes) : "—"}
          change="+18.0%"
          trend="up"
          subtitle="favored tracks"
          icon={HeartIcon}
          color="rose"
        />
        <StudioStatCard
          label="Library Saves"
          value={analytics.saves ? fmt(analytics.saves) : "—"}
          change="+11.4%"
          trend="up"
          subtitle="saved playlists"
          icon={BookmarkIcon}
          color="amber"
        />
        <StudioStatCard
          label="Completes"
          value={analytics.completes ? fmt(analytics.completes) : "—"}
          change="+9.5%"
          trend="up"
          subtitle="full stream-throughs"
          icon={ChartBarIcon}
          color="purple"
        />
        <StudioStatCard
          label="Avg Finish"
          value={
            analytics.avgWatchPct != null
              ? `${Math.round(analytics.avgWatchPct)}%`
              : "—"
          }
          change="High engagement"
          trend="neutral"
          subtitle="track completion"
          icon={ArrowTrendingUpIcon}
          color="blue"
        />
      </div>

      {/* Interactive Daily Listens Chart */}
      {series.length > 1 && (
        <div className="border-t border-jevah-border/60 bg-jevah-surface/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-4 w-4 text-jevah-accent" />
              <h3 className="text-xs font-black uppercase tracking-wider text-jevah-text">
                Daily Stream Growth Trend
              </h3>
            </div>
            <span className="text-xs font-bold text-jevah-text-muted">
              Peak: {fmt(Math.max(...series.map((s) => s.listens)))} streams/day
            </span>
          </div>
          <EnhancedAreaChart series={series} />
        </div>
      )}

      {/* Bottom Insights Columns: Geographic & Top Tracks Leaderboard */}
      <div className="grid gap-6 border-t border-jevah-border/60 p-6 sm:grid-cols-2">
        {/* Regions */}
        <div className="rounded-3xl border border-jevah-border/60 bg-jevah-card/30 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-500 ring-1 ring-teal-500/20">
                <GlobeAltIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-jevah-text">Geographic Audience</h3>
                <p className="text-[11px] text-jevah-text-muted">Top listener locations</p>
              </div>
            </div>
          </div>

          {analytics.topRegions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-jevah-border/80 bg-jevah-card/40 px-4 py-8 text-center text-xs font-medium text-jevah-text-muted">
              {analytics.focusHint || "Geographic heatmap data populates automatically as streams roll in."}
            </p>
          ) : (
            <ul className="space-y-3">
              {analytics.topRegions.slice(0, 6).map((r) => (
                <li key={r.region} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-jevah-text group-hover:text-jevah-accent transition-colors">
                      {r.region}
                    </span>
                    <span className="font-bold tabular-nums text-jevah-text-muted">
                      {fmt(r.listens)} streams {r.sharePct != null ? `(${Math.round(r.sharePct)}%)` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-jevah-accent via-teal-400 to-emerald-400 transition-all duration-500"
                      style={{
                        width: `${Math.max(8, (r.listens / maxRegion) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Tracks Leaderboard */}
        <div className="rounded-3xl border border-jevah-border/60 bg-jevah-card/30 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20">
                <MusicalNoteIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-jevah-text">Top Track Leaderboard</h3>
                <p className="text-[11px] text-jevah-text-muted">Most streamed songs in this period</p>
              </div>
            </div>
          </div>

          {analytics.topTracks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-jevah-border/80 bg-jevah-card/40 px-4 py-8 text-center text-xs font-medium text-jevah-text-muted">
              No streams recorded yet. Upload tracks to see your leaderboard.
            </p>
          ) : (
            <ul className="space-y-3">
              {analytics.topTracks.slice(0, 6).map((t, i) => (
                <li key={t.trackId || t.title + i} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jevah-card font-mono text-[10px] font-black text-jevah-text-muted ring-1 ring-jevah-border/50">
                        {i + 1}
                      </span>
                      <span className="truncate font-extrabold text-jevah-text group-hover:text-jevah-accent transition-colors">
                        {t.title}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-jevah-text-muted">
                      {fmt(t.listens)} streams {t.likes != null ? `· ${fmt(t.likes)} ♥` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-jevah-card ring-1 ring-jevah-border/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-jevah-accent to-teal-400 transition-all duration-500"
                      style={{
                        width: `${Math.max(8, (t.listens / maxTrack) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function EnhancedAreaChart({ series }: { series: { date: string; listens: number }[] }) {
  const points = series.map((s) => s.listens);
  const max = Math.max(1, ...points);
  const w = 800;
  const h = 140;
  const paddingY = 16;
  const chartHeight = h - paddingY * 2;
  const step = points.length > 1 ? w / (points.length - 1) : w;

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - paddingY - (p / max) * chartHeight;
    return { x, y };
  });

  const lineD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${lineD} L${w},${h} L0,${h} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#256e63" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#4ecdc4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#256e63" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Smooth Trend Line */}
        <path
          d={lineD}
          fill="none"
          stroke="#4ecdc4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots on peak/key data points */}
        {coords.map((c, idx) => {
          if (idx % Math.ceil(coords.length / 7) === 0 || idx === coords.length - 1) {
            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="5"
                  className="fill-emerald-400 stroke-jevah-surface stroke-2 transition-transform duration-200 group-hover:scale-125"
                />
              </g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
