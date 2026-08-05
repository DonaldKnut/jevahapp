import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
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
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
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

const SIDEBAR_COLLAPSED_KEY = "jevah-admin-sidebar-collapsed";
const PROFILE_OPEN_KEY = "jevah-admin-profile-open";

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

function SidebarTip({
  label,
  show,
  children,
}: {
  label: string;
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return <>{children}</>;
  return (
    <div className="group/tip relative flex w-full justify-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#0b1a1f] px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-xl ring-1 ring-white/15 transition duration-150 group-hover/tip:opacity-100"
      >
        {label}
        <span className="absolute right-full top-1/2 -mr-px h-2 w-2 -translate-y-1/2 rotate-45 bg-[#0b1a1f] ring-1 ring-white/15" />
      </span>
    </div>
  );
}

export default function AdminShell() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [profileOpen, setProfileOpen] = useState(() => {
    try {
      const v = localStorage.getItem(PROFILE_OPEN_KEY);
      return v === null ? true : v === "1";
    } catch {
      return true;
    }
  });
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_OPEN_KEY, profileOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [profileOpen]);

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

  function NavItems({
    onNavigate,
    compact = false,
  }: {
    onNavigate?: () => void;
    compact?: boolean;
  }) {
    return (
      <nav
        className={cn(
          "admin-nav flex-1 space-y-1 overflow-y-auto py-3",
          compact ? "px-2" : "px-3"
        )}
      >
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <SidebarTip key={to} label={label} show={compact}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-2xl text-sm font-semibold transition-all duration-200",
                  compact
                    ? "w-full justify-center px-2 py-2.5"
                    : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "admin-nav-active bg-jevah-accent text-white shadow-md shadow-jevah-accent/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!compact && (
                    <span className="flex-1 truncate tracking-tight">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          </SidebarTip>
        ))}
      </nav>
    );
  }

  return (
    <div className="admin-shell jevah-dashboard-shell min-h-dvh font-sans text-jevah-text antialiased transition-colors duration-300">
      <div className="flex min-h-dvh">
        {/* ── Desktop Sidebar (App Theme Colors) ── */}
        <aside
          className={cn(
            "jevah-dashboard-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-white/10 text-white backdrop-blur-2xl transition-[width] duration-300 ease-out lg:flex",
            collapsed ? "w-[76px]" : "w-[240px] xl:w-[260px]"
          )}
        >
          {/* Brand header with logo */}
          <div
            className={cn(
              "flex items-center pt-5 pb-3",
              collapsed ? "flex-col gap-2 px-2" : "justify-between px-4"
            )}
          >
            <div
              className={cn(
                "inline-flex rounded-2xl bg-white/95 shadow-md shadow-black/20 ring-1 ring-white/20",
                collapsed ? "px-1.5 py-1" : "px-3 py-1.5"
              )}
            >
              <JevahLogo
                width={collapsed ? 48 : 84}
                height={collapsed ? 20 : 34}
              />
            </div>
            {!collapsed && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                Admin
              </span>
            )}
          </div>

          {/* Elevated User Profile Card — independently collapsible */}
          <div
            className={cn(
              "my-2 rounded-2xl bg-gradient-to-b from-white/12 to-white/5 ring-1 ring-white/15 shadow-lg backdrop-blur-xl",
              collapsed ? "mx-2 p-2" : "mx-3 p-2.5"
            )}
          >
            {collapsed ? (
              <SidebarTip
                label={`${displayName} · ${isSuperAdmin ? "Super Admin" : "Administrator"}`}
                show
              >
                <div className="flex justify-center">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent via-[#4ECDC4] to-emerald-400 text-xs font-black text-white shadow-md shadow-jevah-accent/30">
                    {initials || "A"}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1a1f] bg-emerald-400 admin-online-dot shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                </div>
              </SidebarTip>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  className="flex w-full items-center gap-2.5 rounded-xl p-0.5 text-left transition hover:bg-white/5"
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent via-[#4ECDC4] to-emerald-400 text-xs font-black text-white shadow-md shadow-jevah-accent/30">
                    {initials || "A"}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1a1f] bg-emerald-400 admin-online-dot shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold tracking-tight text-white">
                      {displayName}
                    </p>
                    {profileOpen && (
                      <p className="truncate text-[10px] font-semibold text-emerald-300/80">
                        {isSuperAdmin ? "Super Admin" : "Administrator"}
                      </p>
                    )}
                  </div>
                  {unread > 0 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        void clearNotifs();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          void clearNotifs();
                        }
                      }}
                      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-200 transition hover:bg-rose-500/30"
                      title="Mark all read"
                    >
                      <BellIcon className="h-4 w-4" />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    </span>
                  )}
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 shrink-0 text-white/50 transition-transform duration-200",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    profileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
                      {onlineCount !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                          <SignalIcon className="h-3 w-3 animate-pulse text-emerald-400" />
                          {onlineCount} active
                        </span>
                      )}
                      {isSuperAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                          <ShieldSolid className="h-3 w-3 text-amber-400" />
                          Master
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {collapsed && unread > 0 && (
              <SidebarTip label="Mark all notifications read" show>
                <button
                  type="button"
                  onClick={() => void clearNotifs()}
                  className="relative mt-2 flex h-8 w-full items-center justify-center rounded-xl bg-rose-500/20 text-rose-200 transition hover:bg-rose-500/30"
                >
                  <BellIcon className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                </button>
              </SidebarTip>
            )}
          </div>

          {!collapsed && (
            <p className="px-4 pb-1 pt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              Control Center
            </p>
          )}

          <NavItems compact={collapsed} />

          {/* Sidebar Footer */}
          <div
            className={cn(
              "space-y-2 border-t border-white/10",
              collapsed ? "p-2" : "space-y-2.5 p-3.5"
            )}
          >
            <SidebarTip
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              show={collapsed}
            >
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className={cn(
                  "flex w-full items-center rounded-2xl text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5"
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
            <SidebarTip label="Theme" show={collapsed}>
              <div className={cn("flex justify-center", !collapsed && "px-1")}>
                {collapsed ? (
                  <ThemeToggle variant="icon" />
                ) : (
                  <ThemeToggle
                    variant="pill"
                    className="w-full [&>button]:w-full [&>button]:justify-center"
                  />
                )}
              </div>
            </SidebarTip>
            <SidebarTip label="Sign Out" show={collapsed}>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={cn(
                  "flex w-full items-center rounded-2xl text-xs font-bold text-white/70 transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-200 active:scale-95",
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3.5 py-2.5"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </span>
                {!collapsed && "Sign Out"}
              </button>
            </SidebarTip>
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
                className="jevah-hamburger-btn inline-flex h-10 w-10 items-center justify-center rounded-2xl transition"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <JevahLogo width={68} height={28} />
              </div>

              <div className="flex items-center gap-1.5">
                <ThemeToggle variant="icon" />
                {onlineCount !== null && (
                  <span className="hidden items-center gap-1 rounded-full bg-jevah-accent/10 px-2 py-1 text-[11px] font-semibold text-jevah-accent sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-jevah-accent" />
                    {onlineCount}
                  </span>
                )}
                {unread > 0 && (
                  <button
                    onClick={() => void clearNotifs()}
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500"
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
                className="absolute inset-0 backdrop-blur-sm admin-fade-in"
                style={{ backgroundColor: "var(--jevah-overlay)" }}
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
              <div className="jevah-dashboard-sidebar absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col pb-[env(safe-area-inset-bottom)] admin-drawer-in">
                <div className="flex items-center justify-between px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                  <div className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
                    <JevahLogo width={72} height={30} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mx-2.5 mb-2 rounded-xl bg-white/8 p-2.5 ring-1 ring-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jevah-accent text-xs font-bold text-white">
                      {initials || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{displayName}</p>
                      <p className="truncate text-[10px] text-emerald-200/70">
                        {isSuperAdmin ? "Super Admin · " : ""}
                        {unread > 0 ? `${unread} alerts` : "All clear"}
                      </p>
                    </div>
                  </div>
                </div>

                <NavItems onNavigate={() => setMobileOpen(false)} />

                <div className="border-t border-white/10 p-3 space-y-2">
                  <div className="flex justify-center px-2">
                    <ThemeToggle variant="pill" className="w-full [&>button]:w-full [&>button]:justify-center" />
                  </div>
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
