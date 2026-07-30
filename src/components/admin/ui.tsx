import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-jevah-text sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-jevah-text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      )}
    </div>
  );
}

export function Panel({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-jevah-border bg-jevah-surface shadow-[0_1px_3px_var(--jevah-shadow),0_1px_2px_var(--jevah-shadow)]",
        padding && "p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-jevah-text">{title}</h2>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "warning" | "success";

const btnStyles: Record<BtnVariant, string> = {
  primary:
    "bg-jevah-accent text-white hover:bg-jevah-accent-hover shadow-sm shadow-jevah-accent/20 hover:shadow-jevah-accent/30",
  secondary:
    "bg-jevah-surface text-jevah-text ring-1 ring-jevah-border hover:bg-jevah-card shadow-sm",
  ghost: "bg-transparent text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-400/20",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20",
};

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
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
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-jevah-card text-jevah-text ring-jevah-border",
    brand: "bg-jevah-accent/10 text-jevah-accent ring-jevah-accent/15",
    success: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300",
    danger: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
    info: "bg-sky-500/10 text-sky-800 ring-sky-500/20 dark:text-sky-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-jevah-border bg-jevah-muted/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-jevah-accent/10">
        <div className="h-6 w-6 rounded-full bg-jevah-accent/20" />
      </div>
      <p className="font-semibold text-jevah-text">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-jevah-text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-jevah-card",
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
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm",
        tones[tone]
      )}
    >
      <div>{children}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

const kpiToneConfig = {
  brand: {
    card: "from-jevah-accent/10 via-jevah-surface to-jevah-surface border-jevah-accent/20",
    icon: "bg-jevah-accent/10 text-jevah-accent",
    value: "text-jevah-accent",
    arrow: "text-jevah-accent/50",
    hover: "hover:border-jevah-accent/30",
  },
  danger: {
    card: "from-rose-500/10 via-jevah-surface to-jevah-surface border-rose-500/20",
    icon: "bg-rose-500/10 text-rose-500",
    value: "text-rose-600 dark:text-rose-400",
    arrow: "text-rose-400/60",
    hover: "hover:border-rose-500/30",
  },
  warning: {
    card: "from-amber-500/10 via-jevah-surface to-jevah-surface border-amber-500/20",
    icon: "bg-amber-500/10 text-amber-500",
    value: "text-amber-600 dark:text-amber-400",
    arrow: "text-amber-400/60",
    hover: "hover:border-amber-500/30",
  },
  neutral: {
    card: "from-jevah-card via-jevah-surface to-jevah-surface border-jevah-border",
    icon: "bg-jevah-card text-jevah-text-muted",
    value: "text-jevah-text",
    arrow: "text-jevah-text-muted",
    hover: "hover:border-jevah-border",
  },
};

export function KpiLink({
  label,
  value,
  to,
  tone = "brand",
  icon: Icon,
  desc,
}: {
  label: string;
  value: number | string;
  to: string;
  tone?: "brand" | "danger" | "warning" | "neutral";
  icon?: ComponentType<{ className?: string }>;
  desc?: string;
}) {
  const t = kpiToneConfig[tone];
  return (
    <Link
      to={to}
      className={cn(
        "group block rounded-2xl border bg-gradient-to-br p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] sm:p-5",
        t.card,
        t.hover
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.icon)}>
            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </div>
        )}
        <ArrowUpRightIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", t.arrow)} />
      </div>
      <div className="mt-3">
        <p className={cn("text-3xl font-bold tracking-tight sm:text-4xl", t.value)}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-jevah-text-muted sm:text-xs">
          {label}
        </p>
        {desc && (
          <p className="mt-0.5 text-[11px] text-jevah-text-muted">{desc}</p>
        )}
      </div>
    </Link>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-jevah-text">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export { inputClass, inputClassCompact } from "../ui/forms";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
  return <div className={cn("admin-page-enter", className)}>{children}</div>;
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
    <span className="inline-flex items-center gap-1.5 text-sm text-jevah-text-muted">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          online
            ? "admin-online-dot bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]"
            : "bg-jevah-border"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}
