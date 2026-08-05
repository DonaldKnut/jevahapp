import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon } from "@heroicons/react/24/outline";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  subtitle,
  actions,
  badgeText,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badgeText?: string;
}) {
  return (
    <div className="relative pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-jevah-text sm:text-3xl">
              {title}
            </h1>
            {badgeText && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-jevah-accent/15 to-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-jevah-accent ring-1 ring-jevah-accent/25 shadow-sm">
                <SparklesIcon className="h-3 w-3 animate-pulse" />
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 max-w-3xl text-sm font-medium leading-relaxed text-jevah-text-muted">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        )}
      </div>
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-jevah-accent/30 to-transparent" />
    </div>
  );
}

export function Panel({
  children,
  className,
  padding = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-jevah-border/80 bg-jevah-surface/90 shadow-[0_4px_20px_var(--jevah-shadow)] backdrop-blur-xl transition-all duration-300",
        hover && "hover:-translate-y-0.5 hover:border-jevah-accent/40 hover:shadow-[0_12px_32px_var(--jevah-shadow)]",
        padding && "p-4 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-jevah-border/50 pb-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold tracking-tight text-jevah-text">{title}</h2>
          {subtitle && <p className="text-xs text-jevah-text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "warning" | "success" | "outline";

const btnStyles: Record<BtnVariant, string> = {
  primary:
    "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white hover:from-jevah-accent-hover hover:to-emerald-700 shadow-md shadow-jevah-accent/20 hover:shadow-lg hover:shadow-jevah-accent/30 border border-emerald-400/20",
  secondary:
    "bg-jevah-surface text-jevah-text ring-1 ring-jevah-border hover:bg-jevah-card hover:ring-jevah-border shadow-sm",
  ghost: "bg-transparent text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text",
  danger: "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-sm shadow-rose-500/20",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm shadow-amber-500/20",
  success: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20",
  outline: "border border-jevah-border text-jevah-text hover:bg-jevah-card hover:border-jevah-accent/40",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "min-h-8 px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "min-h-10 px-4 py-2 text-sm rounded-xl gap-2",
    lg: "min-h-12 px-5 py-3 text-base rounded-2xl gap-2.5 font-bold",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        sizeClasses[size],
        btnStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  dot = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}) {
  const tones = {
    neutral: "bg-jevah-card text-jevah-text ring-jevah-border/60",
    brand: "bg-jevah-accent/15 text-jevah-accent ring-jevah-accent/25 dark:text-emerald-300",
    success: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    warning: "bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-300",
    danger: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300",
    info: "bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300",
    purple: "bg-purple-500/15 text-purple-700 ring-purple-500/25 dark:text-purple-300",
  };
  const dotColors = {
    neutral: "bg-gray-400",
    brand: "bg-jevah-accent",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    purple: "bg-purple-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ring-1 backdrop-blur-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        tones[tone]
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[tone])} />}
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-jevah-border bg-jevah-surface/50 px-6 py-12 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/20 shadow-inner">
        {Icon ? <Icon className="h-7 w-7" /> : <SparklesIcon className="h-7 w-7" />}
      </div>
      <p className="text-base font-bold text-jevah-text">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-sm text-jevah-text-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-jevah-card/70",
        className
      )}
    />
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function Alert({
  tone = "error",
  children,
  onRetry,
}: {
  tone?: "error" | "warning" | "success";
  children: ReactNode;
  onRetry?: () => void;
}) {
  const tones = {
    error: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  };
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm backdrop-blur-md",
        tones[tone]
      )}
    >
      <div>{children}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-bold underline-offset-2 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const kpiToneConfig = {
  brand: {
    card: "from-jevah-accent/15 via-jevah-surface/95 to-jevah-surface/90 border-jevah-accent/30 shadow-[0_8px_32px_rgba(37,110,99,0.12)]",
    icon: "bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-jevah-accent/25 shadow-sm",
    value: "text-jevah-accent",
    arrow: "text-jevah-accent/70",
    hover: "hover:border-jevah-accent/50 hover:shadow-[0_12px_40px_rgba(37,110,99,0.2)]",
    sparkline: "#256e63",
    glow: "bg-jevah-accent/15",
  },
  danger: {
    card: "from-rose-500/15 via-jevah-surface/95 to-jevah-surface/90 border-rose-500/30 shadow-[0_8px_32px_rgba(244,63,94,0.08)]",
    icon: "bg-gradient-to-br from-rose-500/20 to-pink-500/10 text-rose-500 ring-rose-500/25 shadow-sm",
    value: "text-rose-600 dark:text-rose-400",
    arrow: "text-rose-400/70",
    hover: "hover:border-rose-500/50 hover:shadow-[0_12px_40px_rgba(244,63,94,0.15)]",
    sparkline: "#f43f5e",
    glow: "bg-rose-500/15",
  },
  warning: {
    card: "from-amber-500/15 via-jevah-surface/95 to-jevah-surface/90 border-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.08)]",
    icon: "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500 ring-amber-500/25 shadow-sm",
    value: "text-amber-600 dark:text-amber-400",
    arrow: "text-amber-400/70",
    hover: "hover:border-amber-500/50 hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)]",
    sparkline: "#f59e0b",
    glow: "bg-amber-500/15",
  },
  neutral: {
    card: "from-jevah-card/80 via-jevah-surface/95 to-jevah-surface/90 border-jevah-border/80 shadow-[0_8px_32px_var(--jevah-shadow)]",
    icon: "bg-jevah-card text-jevah-text-muted ring-jevah-border/40 shadow-sm",
    value: "text-jevah-text",
    arrow: "text-jevah-text-muted",
    hover: "hover:border-jevah-border hover:shadow-[0_12px_40px_var(--jevah-shadow)]",
    sparkline: "#64748b",
    glow: "bg-jevah-border/30",
  },
  success: {
    card: "from-emerald-500/15 via-jevah-surface/95 to-jevah-surface/90 border-emerald-500/30 shadow-[0_8px_32px_rgba(16,185,129,0.08)]",
    icon: "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-500 ring-emerald-500/25 shadow-sm",
    value: "text-emerald-600 dark:text-emerald-400",
    arrow: "text-emerald-400/70",
    hover: "hover:border-emerald-500/50 hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)]",
    sparkline: "#10b981",
    glow: "bg-emerald-500/15",
  },
};

export function KpiLink({
  label,
  value,
  to,
  tone = "brand",
  icon: Icon,
  desc,
  trend,
  trendUp = true,
}: {
  label: string;
  value: number | string;
  to: string;
  tone?: "brand" | "danger" | "warning" | "neutral" | "success";
  icon?: ComponentType<{ className?: string }>;
  desc?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  const t = kpiToneConfig[tone];
  return (
    <Link
      to={to}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]",
        t.card,
        t.hover
      )}
    >
      {/* Glow orb */}
      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity group-hover:opacity-80", t.glow)} />
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-200 group-hover:scale-110", t.icon)}>
            <Icon className="h-[22px] w-[22px]" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                trendUp
                  ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400"
              )}
            >
              {trendUp ? (
                <ArrowTrendingUpIcon className="h-3 w-3" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3" />
              )}
              {trend}
            </span>
          )}
          <ArrowUpRightIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", t.arrow)} />
        </div>
      </div>
      <div className="mt-4">
        <p className={cn("text-3xl font-black tracking-tight sm:text-4xl", t.value)}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
          {label}
        </p>
        {desc && (
          <p className="mt-0.5 text-[11px] font-medium text-jevah-text-muted/80">{desc}</p>
        )}
      </div>

      {/* Background Sparkline Accent Graphic */}
      <svg className="absolute -bottom-1 right-0 h-10 w-28 opacity-20 transition-opacity group-hover:opacity-40" viewBox="0 0 100 30" fill="none">
        <path
          d={trendUp ? "M0 25 Q 25 20, 50 15 T 100 5 L 100 30 L 0 30 Z" : "M0 5 Q 25 15, 50 20 T 100 28 L 100 30 L 0 30 Z"}
          fill={t.sparkline}
        />
      </svg>
    </Link>
  );
}

export function Field({
  label,
  children,
  helperText,
}: {
  label: string;
  children: ReactNode;
  helperText?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-jevah-text">
      <span className="mb-1.5 block tracking-tight">{label}</span>
      {children}
      {helperText && <span className="mt-1 block text-xs font-normal text-jevah-text-muted">{helperText}</span>}
    </label>
  );
}

export { inputClass, inputClassCompact } from "../ui/forms";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function PageEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-page-enter space-y-6 pb-12", className)}>{children}</div>;
}

export function StaggerList({
  children,
  className,
  itemClassName,
}: {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn("admin-list-item", itemClassName)}
          style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function OnlineDot({ online }: { online?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-jevah-text-muted">
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-all duration-300",
          online
            ? "admin-online-dot bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            : "bg-gray-400"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function TabNav<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: T; label: string; count?: number; icon?: ComponentType<{ className?: string }> }>;
  activeTab: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex border-b border-jevah-border/60 overflow-x-auto custom-scrollbar">
      <nav className="flex gap-2 pb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "group inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-all duration-200",
                isActive
                  ? "border-jevah-accent text-jevah-accent"
                  : "border-transparent text-jevah-text-muted hover:border-jevah-border hover:text-jevah-text"
              )}
            >
              {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-jevah-accent" : "text-jevah-text-muted group-hover:text-jevah-text")} />}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-2 py-0.5 text-xs font-extrabold",
                    isActive
                      ? "bg-jevah-accent/15 text-jevah-accent"
                      : "bg-jevah-card text-jevah-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
