import {
  ChartBarIcon,
  GlobeAltIcon,
  HeartIcon,
  MusicalNoteIcon,
  SparklesIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import type { CreatorAnalytics } from "../../../services/creators/analytics";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

type Props = {
  analytics: CreatorAnalytics | null;
  loading?: boolean;
};

export default function CreatorAnalyticsDashboard({
  analytics,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface/90 p-6 shadow-[0_8px_30px_var(--jevah-shadow)]">
        <div className="h-5 w-40 animate-pulse rounded bg-jevah-card" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-jevah-card"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const maxRegion = Math.max(
    1,
    ...analytics.topRegions.map((r) => r.listens)
  );
  const maxTrack = Math.max(1, ...analytics.topTracks.map((t) => t.listens));

  return (
    <section className="overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface/90 shadow-[0_8px_30px_var(--jevah-shadow)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-jevah-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-jevah-text">
              Audience analytics
            </h2>
            <p className="text-xs text-jevah-text-muted">
              Last {analytics.rangeDays} days
              {analytics.source === "catalog_fallback"
                ? " · provisional from catalog plays"
                : ""}
            </p>
          </div>
        </div>
        {analytics.source === "api" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <SparklesIcon className="h-3 w-3" />
            Live
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:px-6">
        <Stat
          icon={MusicalNoteIcon}
          label="Listens"
          value={fmt(analytics.totalListens)}
        />
        <Stat
          icon={UsersIcon}
          label="Listeners"
          value={
            analytics.uniqueListeners
              ? fmt(analytics.uniqueListeners)
              : "—"
          }
        />
        <Stat
          icon={HeartIcon}
          label="Likes"
          value={analytics.likes ? fmt(analytics.likes) : "—"}
        />
        <Stat
          icon={ChartBarIcon}
          label="Avg watch"
          value={
            analytics.avgWatchPct != null
              ? `${Math.round(analytics.avgWatchPct)}%`
              : "—"
          }
        />
      </div>

      <div className="grid gap-5 border-t border-jevah-border p-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <GlobeAltIcon className="h-4 w-4 text-jevah-accent" />
            <h3 className="text-sm font-bold text-jevah-text">
              Where to focus
            </h3>
          </div>
          {analytics.topRegions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-jevah-border bg-jevah-card/50 px-4 py-6 text-xs leading-relaxed text-jevah-text-muted">
              {analytics.focusHint ||
                "Region heatmaps unlock when the analytics API ships geo from play events."}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {analytics.topRegions.slice(0, 6).map((r) => (
                <li key={r.region}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-jevah-text">
                      {r.region}
                    </span>
                    <span className="tabular-nums text-jevah-text-muted">
                      {fmt(r.listens)}
                      {r.sharePct != null
                        ? ` · ${Math.round(r.sharePct)}%`
                        : ""}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-jevah-card">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-jevah-accent to-emerald-400 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          6,
                          (r.listens / maxRegion) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {analytics.focusHint && analytics.topRegions.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-jevah-text-muted">
              {analytics.focusHint}
            </p>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <MusicalNoteIcon className="h-4 w-4 text-jevah-accent" />
            <h3 className="text-sm font-bold text-jevah-text">Top tracks</h3>
          </div>
          {analytics.topTracks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-jevah-border bg-jevah-card/50 px-4 py-6 text-xs text-jevah-text-muted">
              No plays yet. Your first listens will land here.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {analytics.topTracks.slice(0, 6).map((t, i) => (
                <li key={t.trackId || t.title + i}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-semibold text-jevah-text">
                      <span className="mr-1.5 font-mono text-[10px] text-jevah-text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.title}
                    </span>
                    <span className="shrink-0 tabular-nums text-jevah-text-muted">
                      {fmt(t.listens)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-jevah-card">
                    <div
                      className="h-full rounded-full bg-jevah-accent/80 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          6,
                          (t.listens / maxTrack) * 100
                        )}%`,
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

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MusicalNoteIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-jevah-border bg-jevah-card/40 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-jevah-text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-xl font-black tabular-nums text-jevah-text">
        {value}
      </p>
    </div>
  );
}
