import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";

// ── Mega Menu 1: Music & Artists ──────────────────────────────────────────
const musicAndArtistsMenu = [
  {
    title: "Gospel Music",
    description: "Stream inspiring worship, praise, and gospel tracks",
    href: "/music",
    icon: MusicalNoteIcon,
    badge: "Popular",
    color: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    title: "Gospel Artists & Ministries",
    description: "Discover verified artists, worship leaders, and choirs",
    href: "/artists/popular",
    icon: UserGroupIcon,
    badge: "Verified",
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    title: "Sermons & Audio",
    description: "Listen to life-changing sermons & spiritual audio",
    href: "/sermons",
    icon: AcademicCapIcon,
    badge: null,
    color: "bg-sky-50 text-sky-600 border-sky-200/60",
  },
  {
    title: "Creator Studio & Registration",
    description: "Register as an artist, upload music & track streams",
    href: "/creators",
    icon: SparklesIcon,
    badge: "Studio",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  },
];

// ── Mega Menu 2: About & Community ──────────────────────────────────────────
const aboutAndCommunityMenu = [
  {
    title: "About Jevah",
    description: "Our vision, mission, and commitment to spiritual growth",
    href: "/about",
    icon: InformationCircleIcon,
    badge: null,
    color: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    title: "Community Forum",
    description: "Connect, share testimonies, and pray with believers",
    href: "/forum",
    icon: ChatBubbleLeftRightIcon,
    badge: null,
    color: "bg-purple-50 text-purple-600 border-purple-200/60",
  },
  {
    title: "Faith Events & Conferences",
    description: "Discover upcoming faith events, conferences & services",
    href: "/events",
    icon: CalendarDaysIcon,
    badge: "Live",
    color: "bg-rose-50 text-rose-600 border-rose-200/60",
  },
  {
    title: "Contact & Support",
    description: "Get in touch with our team or request prayer support",
    href: "/contact",
    icon: EnvelopeIcon,
    badge: null,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
  },
];

export default function Nav() {
  const isScrolled = useScroll(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<"music" | "about" | null>(null);
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const dashboardPath =
    !loading
      ? sessionDashboardPath({ isAuthenticated, isAdmin })
      : null;

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="relative z-50">
      {/* ── Main Navigation Bar ── */}
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
              isScrolled
            ? "border-b border-jevah-border bg-[var(--jevah-nav)] shadow-md backdrop-blur-xl"
            : "bg-gradient-to-r from-[var(--jevah-hero-from)] via-[var(--jevah-hero-via)] to-[var(--jevah-hero-to)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-12">
          {/* Brand Logo */}
          <Link to="/" className="z-10 shrink-0 transition-transform active:scale-95">
            <JevahLogo width={112} height={52} />
            </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#256E63]/10 text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent"
                    : "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-jevah-text-muted dark:hover:bg-white/5 dark:hover:text-jevah-text"
                }`
              }
            >
              Home
            </NavLink>

            {/* ── Mega Menu 1 Trigger: Music & Artists ── */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMega("music")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                type="button"
                onClick={() => setActiveMega((v) => (v === "music" ? null : "music"))}
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeMega === "music"
                    ? "bg-[#256E63]/10 text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent"
                    : "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-jevah-text-muted dark:hover:bg-white/5 dark:hover:text-jevah-text"
                }`}
                aria-expanded={activeMega === "music"}
              >
                Music & Artists
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeMega === "music" ? "rotate-180 text-[#256E63]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel 1 */}
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                  activeMega === "music"
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="jevah-mega-panel w-[620px] overflow-hidden rounded-3xl border p-6 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-3">
                    {musicAndArtistsMenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={() => setActiveMega(null)}
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
                              {item.badge && (
                                <span className="rounded-full bg-jevah-accent/10 px-2 py-0.5 text-[10px] font-bold text-jevah-accent">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-jevah-text-muted">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mega Menu Banner */}
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                        <SparklesIcon className="h-5 w-5 text-[#4ECDC4]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Are you a Gospel Artist?</p>
                        <p className="text-[11px] text-white/60">Register & upload your tracks to Jevah.</p>
                      </div>
                    </div>
                    <Link
                      to="/creators/apply"
                      onClick={() => setActiveMega(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#256E63] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1e5a52] active:scale-95"
                    >
                      Register Artist
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mega Menu 2 Trigger: About & Community ── */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMega("about")}
              onMouseLeave={() => setActiveMega(null)}
            >
              <button
                type="button"
                onClick={() => setActiveMega((v) => (v === "about" ? null : "about"))}
                className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeMega === "about"
                    ? "bg-[#256E63]/10 text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent"
                    : "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-jevah-text-muted dark:hover:bg-white/5 dark:hover:text-jevah-text"
                }`}
                aria-expanded={activeMega === "about"}
              >
                About & Community
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeMega === "about" ? "rotate-180 text-[#256E63]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </button>

              {/* Mega Dropdown Panel 2 */}
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                  activeMega === "about"
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="jevah-mega-panel w-[600px] overflow-hidden rounded-3xl border p-6 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-3">
                    {aboutAndCommunityMenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={() => setActiveMega(null)}
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
                              {item.badge && (
                                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-jevah-text-muted">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
            </div>
            </div>

            <NavLink
              to="/creators"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#256E63]/10 text-[#256E63] dark:bg-jevah-accent/15 dark:text-jevah-accent"
                    : "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-jevah-text-muted dark:hover:bg-white/5 dark:hover:text-jevah-text"
                }`
              }
            >
              Creators
            </NavLink>
          </div>

          {/* Desktop Right Actions */}
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

            {/* ── Dope Animated Hamburger Icon Button ── */}
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

      {/* ── Premium Mobile Menu Drawer ── */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "var(--jevah-overlay)" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed left-3 right-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out md:hidden ${
          mobileOpen
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
            : "-translate-y-6 scale-95 opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: "var(--jevah-mobile-menu-bg)",
          borderColor: "var(--jevah-mobile-menu-border)",
        }}
      >
        <div className="flex items-center justify-between border-b border-jevah-border pb-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#256E63]">
            Navigation
          </p>
          <span className="rounded-full bg-[#256E63]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#256E63]">
            Jevah App
          </span>
        </div>

        {/* Links list */}
        <div className="mt-3 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold text-jevah-text transition hover:bg-jevah-accent/10 hover:text-jevah-accent"
          >
            Home
            <ArrowRightIcon className="h-4 w-4 text-gray-300" />
          </Link>

          {/* Mobile Category Grid: Music & Artists */}
          <div className="jevah-mobile-section my-2 rounded-2xl p-3 ring-1 ring-jevah-border">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-jevah-text-muted">
              Music & Artists
            </p>
            <div className="grid grid-cols-2 gap-2">
              {musicAndArtistsMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col gap-1.5 rounded-xl bg-jevah-card p-2.5 shadow-sm transition active:scale-95"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-jevah-text line-clamp-1">{item.title}</span>
                  </Link>
                );
              })}
            </div>
                </div>

          {/* Mobile Category Grid: About & Community */}
          <div className="jevah-mobile-section my-2 rounded-2xl p-3 ring-1 ring-jevah-border">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-jevah-text-muted">
              About & Community
            </p>
            <div className="grid grid-cols-2 gap-2">
              {aboutAndCommunityMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col gap-1.5 rounded-xl bg-jevah-card p-2.5 shadow-sm transition active:scale-95"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-jevah-text line-clamp-1">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5 border-t border-jevah-border pt-4">
          {dashboardPath ? (
            <Link
              to={dashboardPath}
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-2xl bg-jevah-accent py-3.5 text-base font-bold text-white shadow-lg shadow-jevah-accent/25 transition hover:bg-jevah-accent-hover active:scale-95"
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
            className="flex w-full items-center justify-center rounded-2xl bg-jevah-accent py-3.5 text-base font-bold text-white shadow-lg shadow-jevah-accent/25 transition hover:bg-jevah-accent-hover active:scale-95"
          >
            Download App
          </a>
        </div>
              </div>
    </header>
  );
}
