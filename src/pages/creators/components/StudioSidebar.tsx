import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MusicalNoteIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import JevahLogo from "../../../components/JevahLogo";
import SidebarTip from "../../../components/SidebarTip";
import { cn } from "../../../components/admin/ui";

export type StudioView =
  | "home"
  | "catalog"
  | "releases"
  | "insights"
  | "profile";

const COLLAPSED_KEY = "jevah-studio-sidebar-collapsed";

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
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#0c2024] via-[#08171b] to-[#040b0e] text-white shadow-2xl transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "relative border-b border-white/10",
          collapsed ? "px-2 pt-5 pb-4" : "px-5 pt-6 pb-5"
        )}
      >
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
          <NavLink
            to="/creators/studio"
            className="inline-flex rounded-xl bg-white/95 px-2.5 py-1 shadow-lg shadow-black/40 backdrop-blur-md transition hover:bg-white"
          >
            <JevahLogo width={collapsed ? 36 : 56} height={collapsed ? 16 : 24} />
          </NavLink>
          {!collapsed && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              <SparklesIcon className="h-3 w-3 text-emerald-300" />
              Studio Pro
            </span>
          )}
        </div>
        {!collapsed && (
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400/90">
            Creator Desk &amp; Catalog
          </p>
        )}
      </div>

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <SidebarTip key={item.id} label={item.label} show={collapsed}>
              <button
                type="button"
                onClick={() => onView(item.id)}
                aria-label={item.label}
                className={cn(
                  "group relative flex w-full items-center rounded-2xl text-left transition-all duration-200",
                  collapsed ? "justify-center px-2 py-3" : "gap-3.5 px-3.5 py-3",
                  active
                    ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-600 text-white shadow-lg shadow-jevah-accent/35 ring-1 ring-white/25"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {active && !collapsed && (
                  <div className="absolute -left-3 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_14px_#34d399]" />
                )}
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-200",
                    active
                      ? "bg-white/20 text-white ring-1 ring-white/30"
                      : "border border-white/10 bg-white/5 text-white/70 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between">
                      <span className="block text-sm font-black leading-tight tracking-tight">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[9px] font-black uppercase text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[10px] font-semibold tracking-wide",
                        active ? "text-white/90" : "text-white/40 group-hover:text-white/60"
                      )}
                    >
                      {item.hint}
                    </span>
                  </span>
                )}
              </button>
            </SidebarTip>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto border-t border-white/10",
          collapsed ? "p-2 pb-4" : "space-y-2 px-3 pb-4 pt-3"
        )}
      >
        <SidebarTip label={name} show={collapsed}>
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md",
              collapsed ? "flex justify-center p-2" : "p-3.5"
            )}
          >
            <div className={cn("flex items-center", collapsed ? "" : "gap-3")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jevah-accent via-emerald-500 to-[#4ECDC4] text-xs font-black text-white shadow-md ring-2 ring-white/20">
                {initials || "A"}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-white">{name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300/90">
                      Active Creator Desk
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarTip>

        <SidebarTip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          show={collapsed}
        >
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "flex w-full items-center rounded-2xl text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white",
              collapsed ? "mt-2 justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              {collapsed ? (
                <ChevronDoubleRightIcon className="h-4 w-4" />
              ) : (
                <ChevronDoubleLeftIcon className="h-4 w-4" />
              )}
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </SidebarTip>
      </div>
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
    <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden custom-scrollbar bg-jevah-surface/95 border-b border-jevah-border/60 backdrop-blur-xl">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onView(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200",
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
