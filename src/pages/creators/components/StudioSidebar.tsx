import { NavLink } from "react-router-dom";
import {
  ChartBarIcon,
  HomeIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
  UserCircleIcon,
  SparklesIcon,
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
  icon: typeof HomeIcon;
}[] = [
  { id: "home", label: "Overview", hint: "Creator Desk", icon: HomeIcon },
  { id: "catalog", label: "Tracks", hint: "Full Catalog", icon: MusicalNoteIcon },
  {
    id: "releases",
    label: "Discography",
    hint: "Albums & EPs",
    icon: RectangleStackIcon,
  },
  { id: "insights", label: "Analytics", hint: "Audience & Streams", icon: ChartBarIcon },
  { id: "profile", label: "Brand Profile", hint: "Public Page", icon: UserCircleIcon },
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
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#0d2226] via-[#09171b] to-[#040a0c] text-white shadow-2xl lg:flex">
      {/* Brand Header */}
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <NavLink
            to="/creators/studio"
            className="inline-flex rounded-xl bg-white/95 px-2.5 py-1 shadow-lg shadow-black/40 backdrop-blur-md transition hover:bg-white"
          >
            <JevahLogo width={56} height={24} />
          </NavLink>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
            <SparklesIcon className="h-3 w-3" />
            Studio Pro
          </span>
        </div>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400/90">
          Creator Desk
        </p>
      </div>

      {/* Main Nav Items */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3 pt-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onView(item.id)}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-lg shadow-jevah-accent/30 ring-1 ring-white/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {active && (
                <div className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/70 group-hover:bg-white/15 group-hover:text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight tracking-tight">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "block text-[10px] font-medium tracking-wide",
                    active ? "text-white/80" : "text-white/40"
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Artist Profile Pill */}
      <div className="mx-3 mb-5 mt-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-md transition hover:bg-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jevah-accent via-emerald-500 to-[#4ECDC4] text-xs font-black text-white shadow-md ring-2 ring-white/20">
              {initials || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-white">{name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-300/80">Active Creator</span>
              </div>
            </div>
          </div>
        </div>
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
                ? "bg-gradient-to-r from-jevah-accent to-emerald-600 text-white shadow-md shadow-jevah-accent/20 ring-1 ring-white/20"
                : "bg-jevah-card/80 text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
