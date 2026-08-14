import { ComponentType, SVGProps } from "react";
import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/react/24/outline";

interface StudioStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color?: "emerald" | "amber" | "teal" | "purple" | "rose" | "blue";
  compact?: boolean;
}

const colorMap = {
  emerald: {
    bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    glow: "shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
    bar: "bg-emerald-500",
  },
  teal: {
    bg: "from-teal-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/20",
    glow: "shadow-[0_8px_30px_rgba(20,184,166,0.12)]",
    bar: "bg-teal-500",
  },
  amber: {
    bg: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
    glow: "shadow-[0_8px_30px_rgba(245,158,11,0.12)]",
    bar: "bg-amber-500",
  },
  purple: {
    bg: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20",
    glow: "shadow-[0_8px_30px_rgba(168,85,247,0.12)]",
    bar: "bg-purple-500",
  },
  rose: {
    bg: "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
    glow: "shadow-[0_8px_30px_rgba(244,63,94,0.12)]",
    bar: "bg-rose-500",
  },
  blue: {
    bg: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
    glow: "shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
    bar: "bg-blue-500",
  },
};

export default function StudioStatCard({
  label,
  value,
  change,
  trend = "up",
  subtitle,
  icon: Icon,
  color = "emerald",
  compact = false,
}: StudioStatCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-jevah-border/70 bg-jevah-surface/90 transition-all duration-300 hover:-translate-y-1 hover:border-jevah-accent/40 ${styles.glow} backdrop-blur-xl ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {/* Subtle top ambient glow bar */}
      <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-60 ${styles.bar}`} />
      
      {/* Background soft ambient gradient */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${styles.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
            {label}
          </p>
          <p className="text-2xl font-black tracking-tight text-jevah-text sm:text-3xl tabular-nums">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="relative z-10 mt-3 flex items-center justify-between gap-2 border-t border-jevah-border/40 pt-3 text-xs">
          {change ? (
            <span
              className={`inline-flex items-center gap-1 font-extrabold ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-jevah-text-muted"
              }`}
            >
              {trend === "up" && <ArrowUpRightIcon className="h-3.5 w-3.5" />}
              {trend === "down" && <ArrowDownRightIcon className="h-3.5 w-3.5" />}
              {change}
            </span>
          ) : null}
          {subtitle && (
            <span className="text-[11px] text-jevah-text-muted truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
