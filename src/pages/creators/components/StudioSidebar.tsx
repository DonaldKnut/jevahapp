import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MusicalNoteIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import JevahLogo from "../../../components/JevahLogo";
import { cn } from "../../../components/admin/ui";

export type StudioView =
  | "home"
  | "catalog"
  | "releases"
  | "insights"
  | "profile";

const NAV: {
  id: StudioView;
  label: string;
  hint: string;
  icon: typeof Squares2X2Icon;
  badge?: string;
}[] = [
  { id: "home", label: "Overview", hint: "Creator Desk", icon: Squares2X2Icon },
  { id: "catalog", label: "Tracks", hint: "Full Catalog", icon: MusicalNoteIcon, badge: "Live" },
  {
    id: "releases",
    label: "Discography",
    hint: "Albums & EPs",
    icon: Square3Stack3DIcon,
  },
  { id: "insights", label: "Analytics", hint: "Audience & Streams", icon: ArrowTrendingUpIcon },
  { id: "profile", label: "Brand Profile", hint: "Public Page", icon: CheckBadgeIcon },
];

export default function StudioSidebar({
  view,
  onView,
  initials,
  name,
}: {
  view: StudioView;
  onView: (v: StudioView) => void;
  initials: string;
  name: string;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jevah-studio-sidebar-collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("jevah-studio-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "relative sticky top-0 z-40 hidden h-dvh shrink-0 flex-col overflow-visible border-r border-white/10 bg-gradient-to-b from-[#0c2024] via-[#08171b] to-[#040b0e] text-white shadow-2xl transition-all duration-300 lg:flex",
        collapsed ? "w-[92px]" : "w-[250px]"
      )}
    >
      {/* Sleek Low-Height Brand Header */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-3.5 py-4">
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/"
              title="Jevah homepage"
              className="inline-flex transition hover:opacity-90"
            >
              <JevahLogo plated onDark width={50} height={20} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
              <SparklesIcon className="h-2.5 w-2.5" />
              Pro
            </span>
          </div>
        ) : (
          <Link
            to="/"
            title="Jevah homepage"
            className="mx-auto inline-flex transition hover:opacity-90"
          >
            <JevahLogo plated onDark width={28} height={14} />
          </Link>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-2.5 pt-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => onView(item.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center p-3" : "px-3 py-2.5 text-left",
                  active
                    ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-600 text-white shadow-md shadow-jevah-accent/30 ring-1 ring-white/25"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {active && !collapsed && (
                  <div className="absolute -left-2.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                )}

                {/* Dual-Tone Icon Badge */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center shadow-sm transition-all duration-200",
                    collapsed ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg",
                    active
                      ? "bg-white/20 text-white ring-1 ring-white/30"
                      : "border border-white/10 bg-white/5 text-white/70 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                  )}
                >
                  <Icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
                </div>

                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between">
                      <span className="block text-xs font-black leading-tight tracking-tight">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[8px] font-black uppercase text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "block text-[9px] font-semibold tracking-wide mt-0.5",
                        active
                          ? "text-white/90"
                          : "text-white/40 group-hover:text-white/60"
                      )}
                    >
                      {item.hint}
                    </span>
                  </span>
                )}
              </button>

              {/* Floating Tooltip */}
              <div
                className={cn(
                  "pointer-events-none fixed z-50 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto",
                  collapsed ? "left-[96px]" : "left-[256px]"
                )}
                style={{ transform: "translateY(-85%)" }}
              >
                <div className="rounded-xl border border-white/20 bg-gradient-to-r from-[#0c2024] to-[#08171b] px-3 py-1.5 text-xs font-bold text-white shadow-2xl backdrop-blur-xl whitespace-nowrap">
                  <p className="font-black text-white">{item.label}</p>
                  <p className="text-[9px] font-bold text-emerald-400">
                    {item.hint}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 bg-black/20 px-2.5 py-4 backdrop-blur-md">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent via-emerald-500 to-[#4ECDC4] text-xs font-black text-white shadow-md ring-1 ring-white/20">
              {initials || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black leading-tight text-white">
                {name}
              </p>
              <p className="mt-0.5 text-[9px] font-bold leading-none text-emerald-400/90">
                Desk Active
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent via-emerald-500 to-[#4ECDC4] text-sm font-black text-white ring-1 ring-white/20"
              title={name}
            >
              {initials || "A"}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute right-0 top-24 z-40 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0c2024] text-white/80 shadow-lg shadow-black/30 transition hover:scale-105 hover:bg-jevah-accent hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}

export function StudioMobileNav({
  view,
  onView,
}: {
  view: StudioView;
  onView: (v: StudioView) => void;
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto px-4 py-2.5 lg:hidden custom-scrollbar bg-jevah-surface/95 border-b border-jevah-border/60 backdrop-blur-xl">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onView(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all duration-200",
              active
                ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-600 text-white shadow-md shadow-jevah-accent/25 ring-1 ring-white/25"
                : "bg-jevah-card/80 text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
            )}
          >
            <Icon className="h-4 w-4 text-jevah-accent" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

