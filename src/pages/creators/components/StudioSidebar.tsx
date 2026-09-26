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
  { id: "insights", label: "Analytics", hint: "Audience & Streams", icon: ArrowTrendingUpIcon, badge: "Pro" },
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
        "relative sticky top-0 z-40 hidden h-dvh shrink-0 flex-col overflow-visible border-r border-white/10 bg-gradient-to-b from-[#091a1e] via-[#061114] to-[#04080a] text-white shadow-2xl transition-all duration-300 lg:flex",
        collapsed ? "w-[92px]" : "w-[256px]"
      )}
    >
      {/* Ambient background spotlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#256E63]/20 to-transparent blur-xl" />

      {/* Sleek Brand Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-4.5">
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              to="/"
              title="Jevah homepage"
              className="inline-flex transition hover:opacity-90"
            >
              <JevahLogo plated onDark width={52} height={22} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-xs">
              <SparklesIcon className="h-2.5 w-2.5" />
              Creator Pro
            </span>
          </div>
        ) : (
          <Link
            to="/"
            title="Jevah homepage"
            className="mx-auto inline-flex transition hover:opacity-90"
          >
            <JevahLogo plated onDark width={30} height={15} />
          </Link>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="relative z-10 flex flex-1 flex-col gap-2 px-3 pt-5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => onView(item.id)}
                className={cn(
                  "relative flex w-full items-center gap-3.5 rounded-2xl transition-all duration-200",
                  collapsed ? "justify-center p-3" : "px-3.5 py-3 text-left",
                  active
                    ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-600 text-white shadow-[0_8px_24px_rgba(37,110,99,0.4)] ring-1 ring-white/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {active && !collapsed && (
                  <div className="absolute -left-3 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-amber-300 shadow-[0_0_12px_#fcd34d]" />
                )}

                {/* Icon Badge */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center transition-all duration-200",
                    collapsed ? "h-10 w-10 rounded-2xl" : "h-8.5 w-8.5 rounded-xl",
                    active
                      ? "bg-white/20 text-white ring-1 ring-white/40 shadow-sm"
                      : "border border-white/10 bg-white/5 text-white/70 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                  )}
                >
                  <Icon className={collapsed ? "h-5 w-5" : "h-4.5 w-4.5"} />
                </div>

                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between">
                      <span className="block text-xs font-black leading-tight tracking-tight">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider",
                            item.badge === "Live"
                              ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/30"
                              : "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "block text-[9px] font-bold tracking-wide mt-0.5",
                        active
                          ? "text-white/90"
                          : "text-white/40 group-hover:text-white/70"
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
                  collapsed ? "left-[100px]" : "left-[264px]"
                )}
                style={{ transform: "translateY(-85%)" }}
              >
                <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#091a1e] to-[#061114] px-3.5 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-2xl whitespace-nowrap">
                  <p className="font-black text-white">{item.label}</p>
                  <p className="text-[9px] font-extrabold text-amber-300">
                    {item.hint}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Artist Desk Status */}
      <div className="relative z-10 mt-auto border-t border-white/10 bg-black/30 px-3 py-4 backdrop-blur-xl">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-[#4ECDC4] text-xs font-black text-[#061114] shadow-md ring-2 ring-white/20">
              {initials || "A"}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#061114] bg-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black leading-tight text-white">
                {name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  Studio Online
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1">
            <div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-[#4ECDC4] text-sm font-black text-[#061114] ring-2 ring-white/20"
              title={name}
            >
              {initials || "A"}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#061114] bg-emerald-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Expand / Collapse Button */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute right-0 top-24 z-50 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#091a1e] text-white/90 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-jevah-accent hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand Studio Sidebar" : "Collapse Studio Sidebar"}
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
    <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden custom-scrollbar bg-jevah-surface/95 border-b border-jevah-border/70 backdrop-blur-2xl">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onView(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all duration-200",
              active
                ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-600 text-white shadow-md shadow-jevah-accent/30 ring-1 ring-white/30"
                : "bg-jevah-card/80 text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
            )}
          >
            <Icon className="h-4 w-4 text-amber-400" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}


