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
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1A1F] sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
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
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(11,26,31,0.05),0_1px_2px_rgba(11,26,31,0.03)]",
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
      <h2 className="text-base font-bold text-[#0B1A1F]">{title}</h2>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "warning" | "success";

const btnStyles: Record<BtnVariant, string> = {
  primary:
    "bg-[#256E63] text-white hover:bg-[#1e5a52] shadow-sm shadow-[#256E63]/20 hover:shadow-[#256E63]/30",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
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
    neutral: "bg-slate-100 text-slate-700 ring-slate-200/50",
    brand: "bg-[#256E63]/10 text-[#256E63] ring-[#256E63]/15",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
    warning: "bg-amber-50 text-amber-800 ring-amber-200/50",
    danger: "bg-rose-50 text-rose-700 ring-rose-200/50",
    info: "bg-sky-50 text-sky-800 ring-sky-200/50",
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#256E63]/8">
        <div className="h-6 w-6 rounded-full bg-[#256E63]/20" />
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/70",
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
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
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
    card: "from-[#256E63]/5 via-white to-white border-[#256E63]/12",
    icon: "bg-[#256E63]/10 text-[#256E63]",
    value: "text-[#256E63]",
    arrow: "text-[#256E63]/50",
    hover: "hover:border-[#256E63]/25 hover:shadow-[#256E63]/8",
  },
  danger: {
    card: "from-rose-50 via-white to-white border-rose-100",
    icon: "bg-rose-50 text-rose-500",
    value: "text-rose-600",
    arrow: "text-rose-300",
    hover: "hover:border-rose-200 hover:shadow-rose-100",
  },
  warning: {
    card: "from-amber-50 via-white to-white border-amber-100",
    icon: "bg-amber-50 text-amber-500",
    value: "text-amber-600",
    arrow: "text-amber-300",
    hover: "hover:border-amber-200 hover:shadow-amber-100",
  },
  neutral: {
    card: "from-slate-50 via-white to-white border-slate-200",
    icon: "bg-slate-100 text-slate-500",
    value: "text-slate-700",
    arrow: "text-slate-300",
    hover: "hover:border-slate-300 hover:shadow-slate-100",
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
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
          {label}
        </p>
        {desc && (
          <p className="mt-0.5 text-[11px] text-slate-400">{desc}</p>
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
    <label className="block text-sm font-medium text-slate-700">
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
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          online
            ? "admin-online-dot bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]"
            : "bg-slate-300"
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}
