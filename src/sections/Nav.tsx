import { useState, useEffect, type ComponentType, type SVGProps } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import JevahLogo from "../components/JevahLogo";
import ThemeToggle from "../components/ThemeToggle";
import { useScroll } from "../hooks/useScroll";
import { useAuth } from "../context/AuthContext";
import { sessionDashboardPath } from "../lib/sessionHome";
import {
  ChevronDownIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  BookOpenIcon,
  ArrowUpTrayIcon,
  RectangleStackIcon,
  HeartIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

type MenuItem = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string | null;
  color: string;
};

const musicMenu: MenuItem[] = [
  {
    title: "Gospel Music",
    description: "Worship, praise, and Afro-gospel to stream now",
    href: "/music",
    icon: MusicalNoteIcon,
    badge: "Play",
    color: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    title: "Gospel Artists",
    description: "Verified ministers, worship leaders, and choirs",
    href: "/music",
    icon: UserGroupIcon,
    badge: "Verified",
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    title: "Sermons & Audio",
    description: "Teaching and spiritual audio for the week",
    href: "/sermons",
    icon: AcademicCapIcon,
    badge: null,
    color: "bg-sky-50 text-sky-600 border-sky-200/60",
  },
];

const moreMenu: MenuItem[] = [
  {
    title: "About Jevah",
    description: "Vision, mission, and why we built this house",
    href: "/about",
    icon: InformationCircleIcon,
    badge: null,
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    title: "Community Forum",
    description: "Testimonies, prayer, and conversation",
    href: "/forum",
    icon: ChatBubbleLeftRightIcon,
    badge: null,
    color: "bg-purple-50 text-purple-600 border-purple-200/60",
  },
  {
    title: "Faith Events",
    description: "Conferences, services, and live nights",
    href: "/events",
    icon: CalendarDaysIcon,
    badge: "Live",
    color: "bg-rose-50 text-rose-600 border-rose-200/60",
  },
  {
    title: "Contact & Support",
    description: "Reach the team or request prayer",
    href: "/contact",
    icon: EnvelopeIcon,
    badge: null,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
  },
];

const creatorMenu: MenuItem[] = [
  {
    title: "Become a Creator",
    description: "Apply once — upload after you are verified",
    href: "/creators/apply",
    icon: SparklesIcon,
    badge: "Join",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  },
  {
    title: "How Studio works",
    description: "Apply, get approved, then publish to the shelf",
    href: "/creators/how",
    icon: LightBulbIcon,
    badge: null,
    color: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    title: "Why artists join",
    description: "Gospel listeners, a public page, and stream stats",
    href: "/creators/benefits",
    icon: HeartIcon,
    badge: null,
    color: "bg-rose-50 text-rose-600 border-rose-200/60",
  },
  {
    title: "Creator Studio",
    description: "Catalog, discography, brand, and analytics",
    href: "/creators/studio",
    icon: RectangleStackIcon,
    badge: "Desk",
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    title: "Upload music",
    description: "Tracks, album art, then draft or publish",
    href: "/creators/studio/upload",
    icon: ArrowUpTrayIcon,
    badge: null,
    color: "bg-sky-50 text-sky-600 border-sky-200/60",
  },
];

function MegaLink({
  item,
  onClick,
  badgeClass = "bg-jevah-accent/10 text-jevah-accent",
}: {
  item: MenuItem;
  onClick: () => void;
  badgeClass?: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className="jevah-mega-item group flex items-start gap-3.5 rounded-2xl p-3.5 transition-all duration-200 hover:shadow-sm"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.color} transition-transform duration-200 group-hover:scale-105`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-jevah-text group-hover:text-jevah-accent">
            {item.title}
          </span>
          {item.badge ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}
            >
              {item.badge}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-jevah-text-muted">
          {item.description}
        </p>
      </div>
    </Link>
  );
}

export default function Nav() {
  const isScrolled = useScroll(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<
    "music" | "community" | "creator" | null
  >(null);
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const dashboardPath = !loading
    ? sessionDashboardPath({ isAuthenticated, isAdmin })
    : null;

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const linkIdle =
    "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-jevah-text-muted dark:hover:bg-white/5 dark:hover:text-jevah-text";
  const linkActive =
    "bg-[#256E63]/10 text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent";

  return (
    <header className="relative z-50">
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-jevah-border bg-[var(--jevah-nav)] shadow-md backdrop-blur-xl"
            : "bg-gradient-to-r from-[var(--jevah-hero-from)] via-[var(--jevah-hero-via)] to-[var(--jevah-hero-to)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-12">
          <Link to="/" className="z-10 shrink-0 transition-transform active:scale-95">
            <JevahLogo width={112} height={52} />
          </Link>

          {/* Four items: Music · Community · Creator · Bible */}
          <div className="hidden items-center gap-1 md:flex lg:gap-1.5">
            <div
              className="relative"
              onMouseEnter={() => setActiveMega("music")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMega((v) => (v === "music" ? null : "music"))
                }
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeMega === "music" ? linkActive : linkIdle
                }`}
                aria-expanded={activeMega === "music"}
              >
                Music
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeMega === "music"
                      ? "rotate-180 text-[#256E63]"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </button>
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                  activeMega === "music"
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="jevah-mega-panel w-[420px] overflow-hidden rounded-3xl border p-5 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
                  <p className="px-1 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9a7b3c]">
                    Listen
                  </p>
                  <div className="grid gap-1.5">
                    {musicMenu.map((item) => (
                      <MegaLink
                        key={item.title}
                        item={item}
                        onClick={() => setActiveMega(null)}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                        <SparklesIcon className="h-5 w-5 text-[#4ECDC4]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Are you a Gospel Artist?
                        </p>
                        <p className="text-[11px] text-white/60">
                          Register and upload your tracks to Jevah.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/creators/apply"
                      onClick={() => setActiveMega(null)}
                      className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#0B1A1F] transition hover:bg-amber-100"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveMega("community")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMega((v) => (v === "community" ? null : "community"))
                }
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeMega === "community" ? linkActive : linkIdle
                }`}
                aria-expanded={activeMega === "community"}
              >
                Community
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeMega === "community"
                      ? "rotate-180 text-[#256E63]"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </button>
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                  activeMega === "community"
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="jevah-mega-panel w-[480px] overflow-hidden rounded-3xl border p-5 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
                  <p className="px-1 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9a7b3c]">
                    About & community
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {moreMenu.map((item) => (
                      <MegaLink
                        key={item.title}
                        item={item}
                        onClick={() => setActiveMega(null)}
                        badgeClass="bg-rose-500/10 text-rose-600"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveMega("creator")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMega((v) => (v === "creator" ? null : "creator"))
                }
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  activeMega === "creator" ||
                  location.pathname.startsWith("/creators")
                    ? "bg-[#256E63] text-white shadow-sm shadow-[#256E63]/25"
                    : "bg-[#256E63]/10 text-[#256E63] hover:bg-[#256E63] hover:text-white dark:bg-jevah-accent/20 dark:text-emerald-200"
                }`}
                aria-expanded={activeMega === "creator"}
              >
                <SparklesIcon className="h-4 w-4" />
                Creator
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeMega === "creator" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                  activeMega === "creator"
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="jevah-mega-panel w-[540px] overflow-hidden rounded-3xl border p-5 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
                  <p className="px-1 pb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9a7b3c]">
                    For gospel artists
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {creatorMenu.map((item) => (
                      <MegaLink
                        key={item.title}
                        item={item}
                        onClick={() => setActiveMega(null)}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] p-4 text-white">
                    <div>
                      <p className="text-xs font-bold text-white">
                        Ready to publish?
                      </p>
                      <p className="text-[11px] text-white/60">
                        Apply, get verified, then upload from Studio.
                      </p>
                    </div>
                    <Link
                      to="/creators/apply"
                      onClick={() => setActiveMega(null)}
                      className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#0B1A1F] transition hover:bg-amber-100"
                    >
                      Start application
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <NavLink
              to="/bible"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200"
                    : `${linkIdle} font-semibold`
                }`
              }
            >
              <BookOpenIcon className="h-4 w-4" />
              Bible
            </NavLink>
          </div>

          <div className="z-10 flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="icon" />
            {dashboardPath ? (
              <Link
                to={dashboardPath}
                className="hidden rounded-full bg-[#256E63] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#256E63]/25 transition hover:bg-[#1e5a52] active:scale-95 md:inline-flex"
              >
                Dashboard
              </Link>
            ) : !loading ? (
              <>
                <Link
                  to="/creators/login"
                  className="hidden rounded-full border border-[var(--jevah-auth-creator-accent)]/40 px-4 py-2 text-sm font-bold text-[var(--jevah-auth-creator-accent)] transition hover:bg-[var(--jevah-auth-creator-accent)]/10 active:scale-95 md:inline-flex"
                >
                  Creator
                </Link>
                <Link
                  to="/login"
                  className="hidden rounded-full border border-jevah-accent/30 px-4 py-2 text-sm font-bold text-jevah-accent transition hover:border-jevah-accent hover:bg-jevah-accent/5 active:scale-95 md:inline-flex"
                >
                  Admin
                </Link>
              </>
            ) : null}
            <a
              href="/#download"
              className="hidden rounded-full bg-[#256E63] px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#256E63]/25 transition hover:bg-[#1e5a52] hover:shadow-md active:scale-95 sm:inline-flex"
            >
              Download App
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="jevah-hamburger-btn relative z-50 flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-90 md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <div className="flex h-5 w-5 flex-col justify-between">
                <span
                  className={`jevah-hamburger-line h-0.5 w-full rounded-full transition-all duration-300 ease-in-out ${
                    mobileOpen ? "translate-y-[9px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`jevah-hamburger-line h-0.5 w-full rounded-full transition-all duration-200 ease-in-out ${
                    mobileOpen ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`jevah-hamburger-line h-0.5 w-full rounded-full transition-all duration-300 ease-in-out ${
                    mobileOpen ? "-translate-y-[9px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--jevah-overlay)" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed left-3 right-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out md:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-6 scale-95 opacity-0"
        }`}
        style={{
          backgroundColor: "var(--jevah-mobile-menu-bg)",
          borderColor: "var(--jevah-mobile-menu-border)",
        }}
      >
        <div className="flex items-center justify-between border-b border-jevah-border pb-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#256E63]">
            Menu
          </p>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="text-[11px] font-bold text-jevah-text-muted"
          >
            Home
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          <div className="jevah-mobile-section my-2 rounded-2xl p-3 ring-1 ring-jevah-border">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-jevah-text-muted">
              Music
            </p>
            <div className="grid grid-cols-3 gap-2">
              {musicMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col gap-1.5 rounded-xl bg-jevah-card p-2.5 shadow-sm transition active:scale-95"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-2 text-[11px] font-bold text-jevah-text">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="jevah-mobile-section my-2 rounded-2xl p-3 ring-1 ring-jevah-border">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-jevah-text-muted">
              About & community
            </p>
            <div className="grid grid-cols-2 gap-2">
              {moreMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col gap-1.5 rounded-xl bg-jevah-card p-2.5 shadow-sm transition active:scale-95"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-1 text-xs font-bold text-jevah-text">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="jevah-mobile-section my-2 rounded-2xl p-3 ring-1 ring-jevah-border">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-jevah-text-muted">
              Creator
            </p>
            <div className="grid grid-cols-2 gap-2">
              {creatorMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col gap-1.5 rounded-xl bg-jevah-card p-2.5 shadow-sm transition active:scale-95"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-1 text-xs font-bold text-jevah-text">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            to="/bible"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500/20 to-jevah-accent/10 px-4 py-3.5 text-base font-bold text-jevah-text ring-1 ring-amber-500/30"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-amber-700" />
              Jevah Bible
            </span>
            <ArrowRightIcon className="h-4 w-4 text-amber-700/70" />
          </Link>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-jevah-border pt-4">
          {dashboardPath ? (
            <Link
              to={dashboardPath}
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-2xl bg-jevah-accent py-3.5 text-base font-bold text-white shadow-lg shadow-jevah-accent/25"
            >
              Dashboard
            </Link>
          ) : !loading ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-2xl border-2 border-jevah-accent py-3 text-sm font-bold text-jevah-accent transition hover:bg-jevah-accent/5 active:scale-95"
              >
                Admin
              </Link>
              <Link
                to="/creators/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-2xl border-2 border-[var(--jevah-auth-creator-accent)] py-3 text-sm font-bold text-[var(--jevah-auth-creator-accent)] transition hover:bg-[var(--jevah-auth-creator-accent)]/10 active:scale-95"
              >
                Creator
              </Link>
            </div>
          ) : null}
          <a
            href="/#download"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center justify-center rounded-2xl bg-jevah-accent py-3.5 text-base font-bold text-white shadow-lg shadow-jevah-accent/25"
          >
            Download App
          </a>
        </div>
      </div>
    </header>
  );
}
