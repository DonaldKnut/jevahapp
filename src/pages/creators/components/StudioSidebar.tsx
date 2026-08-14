import { NavLink } from "react-router-dom";
import {
  ChartBarIcon,
  HomeIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
  UserCircleIcon,
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
  { id: "home", label: "Desk", hint: "Overview", icon: HomeIcon },
  { id: "catalog", label: "Catalog", hint: "Every track", icon: MusicalNoteIcon },
  {
    id: "releases",
    label: "Discography",
    hint: "Singles & albums",
    icon: RectangleStackIcon,
  },
  { id: "insights", label: "Insights", hint: "Audience", icon: ChartBarIcon },
  { id: "profile", label: "Artist", hint: "Public brand", icon: UserCircleIcon },
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
    <aside className="jevah-dashboard-sidebar hidden h-dvh w-[232px] shrink-0 flex-col border-r border-white/10 text-white lg:flex">
      <div className="px-4 pt-5 pb-4">
        <NavLink
          to="/creators/studio"
          className="inline-flex rounded-xl bg-white/95 px-2 py-1 shadow-md shadow-black/20"
        >
          <JevahLogo width={52} height={22} />
        </NavLink>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">
          Artist Studio
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onView(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                active
                  ? "bg-jevah-accent text-white shadow-md shadow-jevah-accent/25"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "block text-[10px] font-medium",
                    active ? "text-white/70" : "text-white/40"
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 mt-auto flex items-center gap-2.5 rounded-2xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-[11px] font-black">
          {initials || "A"}
        </div>
        <p className="truncate text-xs font-bold">{name}</p>
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
    <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:hidden custom-scrollbar">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onView(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition",
              active
                ? "bg-jevah-accent text-white shadow-sm"
                : "bg-jevah-card/80 text-jevah-text-muted ring-1 ring-jevah-border"
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
