import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  FlagIcon,
  ShieldCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingLibraryIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  HeartIcon,
  BellIcon,
  SignalIcon,
  MegaphoneIcon,
  TagIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon as ShieldSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminNotifications,
  fetchPresence,
  markNotificationsRead,
} from "../../services/adminApi";
import JevahLogo from "../../components/JevahLogo";
import ThemeToggle from "../../components/ThemeToggle";
import { cn } from "../../components/admin/ui";

const navItems = [
  { to: "/admin", end: true, label: "Overview", icon: ChartBarIcon, badge: null },
  { to: "/admin/users", label: "Users", icon: UsersIcon, badge: null },
  { to: "/admin/reports", label: "Reports", icon: FlagIcon, badge: "reports" },
  { to: "/admin/moderation", label: "Moderation", icon: ShieldCheckIcon, badge: null },
  { to: "/admin/churches", label: "Churches", icon: BuildingLibraryIcon, badge: null },
  { to: "/admin/audio", label: "Audio Library", icon: MusicalNoteIcon, badge: null },
  { to: "/admin/artists", label: "Artists", icon: UserGroupIcon, badge: null },
  { to: "/admin/announcements", label: "Announcements", icon: MegaphoneIcon, badge: null },
  { to: "/admin/categories", label: "Categories", icon: TagIcon, badge: null },
  { to: "/admin/notifications", label: "Notifications", icon: BellAlertIcon, badge: null },
  { to: "/admin/email", label: "Compose Email", icon: EnvelopeIcon, badge: null },
  { to: "/admin/activity", label: "Activity", icon: ClockIcon, badge: null },
  { to: "/admin/settings", label: "Settings", icon: Cog6ToothIcon, badge: null },
  { to: "/admin/health", label: "System Health", icon: HeartIcon, badge: null },
];

export default function AdminShell() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    async function loadPresence() {
      try {
        const res = await fetchPresence({ status: "online", limit: 1 });
        if (alive) setOnlineCount(res.onlineCount);
      } catch {
        if (alive) setOnlineCount(null);
      }
    }
    async function loadNotifs() {
      try {
        const items = await fetchAdminNotifications(true);
        if (alive) setUnread(items.length);
      } catch {
        if (alive) setUnread(0);
      }
    }
    void loadPresence();
    void loadNotifs();
    const id = window.setInterval(() => {
      void loadPresence();
      void loadNotifs();
    }, 45000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function clearNotifs() {
    try {
      await markNotificationsRead({ all: true });
      setUnread(0);
    } catch {
      /* optional endpoint */
    }
  }

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Admin";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  function NavItems({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="admin-nav flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "admin-nav-active bg-[#256E63] text-white shadow-md shadow-[#256E63]/30"
                  : "text-slate-300/80 hover:bg-white/10 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <div className="admin-shell min-h-dvh bg-jevah-muted font-sans text-jevah-text antialiased transition-colors duration-300 dark:bg-jevah-bg">
      <div className="flex min-h-dvh">
        {/* ── Desktop Sidebar (App Theme Colors) ── */}
        <aside
          className="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col bg-[#0B1A1F] text-white lg:flex"
          style={{
            background: "linear-gradient(180deg, #0F3832 0%, #0B1A1F 60%, #071317 100%)"
          }}
        >
          {/* Top Logo Section (Star icon removed, JevahLogo added) */}
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/95 px-3 py-1.5 shadow-sm">
                <JevahLogo width={92} height={40} />
              </div>
              <div className="min-w-0">
                <span className="rounded-md bg-[#256E63]/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-400/30">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="mx-3 mb-3 rounded-2xl bg-white/8 p-3.5 ring-1 ring-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#256E63] to-[#4ECDC4] text-sm font-bold text-white shadow-md shadow-[#256E63]/30">
                {initials || "A"}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1A1F] bg-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{displayName}</p>
                <p className="truncate text-[11px] font-medium text-emerald-200/70">
                  {isSuperAdmin ? "Super Admin" : "Administrator"}
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => void clearNotifs()}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-200 transition hover:bg-rose-500/30"
                  title="Mark all read"
                >
                  <BellIcon className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {onlineCount !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <SignalIcon className="h-3 w-3 text-emerald-400" />
                  {onlineCount} online
                </span>
              )}
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <ShieldSolid className="h-3 w-3 text-amber-400" />
                  Master
                </span>
              )}
            </div>
          </div>

          {/* Section Divider */}
          <p className="px-6 pb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/30">
            Console Navigation
          </p>

          <NavItems />

          {/* Sidebar Footer */}
          <div className="border-t border-white/10 p-3 space-y-2">
            <div className="flex justify-center px-2">
              <ThemeToggle variant="pill" className="w-full [&>button]:w-full [&>button]:justify-center" />
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-all duration-200 hover:bg-rose-500/15 hover:text-rose-200"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Top Bar */}
          <header className="sticky top-0 z-30 border-b border-jevah-border bg-jevah-surface/90 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-4 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <div className="inline-flex items-center gap-1.5">
                  <JevahLogo width={72} height={32} />
                  <span className="rounded-md bg-[#256E63] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Admin
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <ThemeToggle variant="icon" />
                {onlineCount !== null && (
                  <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {onlineCount}
                  </span>
                )}
                {unread > 0 && (
                  <button
                    onClick={() => void clearNotifs()}
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
                  >
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-[#0B1A1F]/65 backdrop-blur-sm admin-fade-in"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
              <div
                className="absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col pb-[env(safe-area-inset-bottom)] admin-drawer-in"
                style={{
                  background: "linear-gradient(180deg, #0F3832 0%, #0B1A1F 60%, #071317 100%)"
                }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
                  <div className="inline-flex rounded-2xl bg-white px-3 py-1.5">
                    <JevahLogo width={84} height={36} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* User Card */}
                <div className="mx-3 mb-3 rounded-2xl bg-white/8 p-3.5 ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#256E63] text-sm font-bold text-white">
                      {initials || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{displayName}</p>
                      <p className="truncate text-[11px] text-emerald-200/70">
                        {isSuperAdmin ? "Super Admin · " : ""}
                        {unread > 0 ? `${unread} alerts` : "All clear"}
                      </p>
                    </div>
                  </div>
                </div>

                <NavItems onNavigate={() => setMobileOpen(false)} />

                <div className="border-t border-white/10 p-3">
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full min-h-11 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white/70 transition hover:bg-rose-500/20 hover:text-rose-200"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    </span>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            <div className="admin-page-enter" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
