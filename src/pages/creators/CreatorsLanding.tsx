import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  SparklesIcon,
  CheckBadgeIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  GlobeAltIcon,
  HeartIcon,
  CloudArrowUpIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolid, PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const TYPES = [
  {
    title: "Artists",
    body: "Gospel, worship, and afro-gospel catalogs with a public profile listeners can follow.",
  },
  {
    title: "Ministers",
    body: "Share messages and music that travels with your congregation beyond Sunday.",
  },
  {
    title: "Podcasters",
    body: "Faith conversations that sit beside music — same catalog, clear shelves.",
  },
];

const HOW = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign in as a creator, then send one application with your ministry name and a short story.",
    icon: SparklesIcon,
  },
  {
    n: "02",
    title: "Get verified",
    body: "Jevah reviews within a couple of days. Studio stays read-only until you are approved — that keeps the shelf trusted.",
    icon: CheckBadgeIcon,
  },
  {
    n: "03",
    title: "Upload & cover",
    body: "Drop singles or a batch. Every track can carry its own artwork, genre, and draft or publish state.",
    icon: ArrowUpTrayIcon,
  },
  {
    n: "04",
    title: "Grow from the desk",
    body: "Pack albums, watch streams, and share your public page. Analytics tell you what people actually finish.",
    icon: ChartBarIcon,
  },
];

const BENEFITS = [
  {
    title: "A gospel-first audience",
    body: "Your music sits on the Artists shelf next to worship, choir, and Afro-gospel — not a generic dump of every genre.",
    icon: MusicalNoteIcon,
  },
  {
    title: "A page people can share",
    body: "Photo, banner, bio, and tracks in one URL. Same story you tell on Sunday, ready for midweek.",
    icon: GlobeAltIcon,
  },
  {
    title: "Streams you can read",
    body: "See listens, unique listeners, and completion. Know which songs to lead with next month.",
    icon: ChartBarIcon,
  },
  {
    title: "Room for the ministry",
    body: "Choirs, worship teams, and solo ministers use the same Studio. One apply. One catalog.",
    icon: UserGroupIcon,
  },
];

export default function CreatorsLanding() {
  useDocumentMeta({
    title: "Gospel artists on Jevah — share Christian music",
    description:
      "Upload gospel music, build a public artist profile, and reach listeners who love worship, Afro-gospel, and the Word.",
    canonicalPath: "/creators",
  });
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Interactive Tab & Animation state
  const [activeTab, setActiveTab] = useState<"player" | "upload" | "analytics">("player");
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);
  const [demoProgress, setDemoProgress] = useState(42);

  // Animated progress bar simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoProgress((prev) => (prev >= 98 ? 15 : prev + 6));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="jevah-dashboard-shell antialiased">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(37,110,99,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(255,165,0,0.12), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
            <SparklesIcon className="h-3.5 w-3.5" />
            Jevah Creators Desk
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-jevah-text sm:text-5xl lg:text-6xl">
            Spotify for gospel — built for faith music
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-jevah-text-muted sm:text-lg">
            Apply once. When approved, upload to the Artists shelf. Copyright-free
            beds stay curated by Jevah — same Track model, separate surfaces.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? "/creators/apply" : "/creators/login"}
              state={
                isAuthenticated
                  ? undefined
                  : { from: "/creators/apply", intent: "creator" }
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-jevah-accent to-emerald-600 px-8 text-sm font-extrabold text-white shadow-lg shadow-jevah-accent/25 transition hover:scale-105 sm:w-auto"
            >
              {isAuthenticated ? "Continue application" : "Become a creator"}
            </Link>
            <Link
              to={
                isAuthenticated
                  ? "/creators/studio"
                  : "/creators/login"
              }
              state={
                isAuthenticated
                  ? undefined
                  : { from: "/creators/studio", intent: "creator" }
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-jevah-accent/30 px-8 text-sm font-extrabold text-jevah-accent transition hover:bg-jevah-accent/5 sm:w-auto"
            >
              Open studio
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {TYPES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-jevah-border bg-jevah-surface p-6 shadow-sm transition hover:border-jevah-accent/40">
              <h2 className="text-lg font-bold text-jevah-text">{t.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ANIMATED CREATOR DESK SHOWCASE */}
      <section className="border-t border-b border-jevah-border/60 bg-jevah-surface/60 py-16 backdrop-blur-md px-4 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-jevah-accent/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-jevah-accent">
              <SparklesIcon className="h-3.5 w-3.5" />
              Creator Desk Interactive Demo
            </span>
            <h2 className="mt-3 font-sans text-3xl font-black text-jevah-text sm:text-4xl">
              Experience the Creator Desk Tools
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-jevah-text-muted max-w-xl mx-auto">
              Inspect live public profiles, batch upload engine progress, and real-time streaming analytics.
            </p>
          </div>

          {/* Interactive Showcase Container */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface shadow-2xl transition-all duration-300">
            {/* Tab Controls Header */}
            <div className="flex border-b border-jevah-border/60 bg-jevah-card/60 p-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("player")}
                className={`flex-1 min-w-[200px] rounded-2xl px-5 py-3 text-xs font-extrabold transition-all duration-200 ${
                  activeTab === "player"
                    ? "bg-jevah-accent text-white shadow-md shadow-jevah-accent/30"
                    : "text-jevah-text-muted hover:text-jevah-text"
                }`}
              >
                1. Public Artist Profile &amp; Player
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex-1 min-w-[200px] rounded-2xl px-5 py-3 text-xs font-extrabold transition-all duration-200 ${
                  activeTab === "upload"
                    ? "bg-jevah-accent text-white shadow-md shadow-jevah-accent/30"
                    : "text-jevah-text-muted hover:text-jevah-text"
                }`}
              >
                2. Live Upload Progress Queue
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 min-w-[200px] rounded-2xl px-5 py-3 text-xs font-extrabold transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-jevah-accent text-white shadow-md shadow-jevah-accent/30"
                    : "text-jevah-text-muted hover:text-jevah-text"
                }`}
              >
                3. Real-time Streaming Analytics
              </button>
            </div>

            {/* TAB 1: PUBLIC ARTIST PROFILE & PLAYER WITH ANIMATED SOUNDWAVE */}
            {activeTab === "player" && (
              <div className="p-6 sm:p-10 animate-fadeIn">
                <div className="grid gap-8 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black uppercase text-amber-500">
                      <GlobeAltIcon className="h-3.5 w-3.5" />
                      Public Web Profile
                    </span>
                    <h3 className="font-sans text-2xl font-black text-jevah-text">
                      Your Dedicated Webpage (`/artists/your-name`)
                    </h3>
                    <p className="text-xs leading-relaxed text-jevah-text-muted">
                      Every approved creator gets a sleek public profile. Share your link on social media or WhatsApp to let fans play your discography directly on Jevah.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-jevah-text">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 animate-icon-glow">
                          <CheckBadgeSolid className="h-4 w-4" />
                        </div>
                        <span>Gold Verified Gospel Emblem</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-jevah-text">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-jevah-accent/20 text-jevah-accent">
                          <MusicalNoteIcon className="h-4 w-4" />
                        </div>
                        <span>Interactive Discography Audio Player</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-jevah-text">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                          <ShareIcon className="h-4 w-4" />
                        </div>
                        <span>1-Tap Profile Sharing &amp; Social Links</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Player Mockup */}
                  <div className="lg:col-span-6 rounded-3xl border border-jevah-border bg-jevah-card/40 p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent via-emerald-500 to-teal-400 font-black text-white shadow-md ring-2 ring-white/20">
                          MK
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-sm font-black text-jevah-text">Min. David K.</span>
                            <CheckBadgeSolid className="h-4 w-4 text-amber-500" />
                          </div>
                          <span className="text-[10px] font-bold text-jevah-text-muted">Verified Worship Artist · Lagos, Nigeria</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-extrabold text-emerald-500">
                        Live Profile
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-jevah-accent/40 bg-jevah-surface p-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jevah-accent text-white shadow-md transition hover:scale-105"
                          >
                            {isPlayingDemo ? (
                              <PauseIcon className="h-5 w-5" />
                            ) : (
                              <PlayIcon className="h-5 w-5 ml-0.5" />
                            )}
                          </button>
                          <div>
                            <p className="text-xs font-black text-jevah-text">Amazing Grace (Live)</p>
                            <p className="text-[10px] text-jevah-text-muted">45,210 Plays · 4:32</p>
                          </div>
                        </div>

                        {/* Animated Equalizer Waveforms */}
                        {isPlayingDemo && (
                          <div className="flex items-end gap-1 h-6 px-2">
                            <span className="w-1 rounded-full bg-emerald-500 animate-soundwave-1" />
                            <span className="w-1 rounded-full bg-jevah-accent animate-soundwave-2" />
                            <span className="w-1 rounded-full bg-teal-400 animate-soundwave-3" />
                            <span className="w-1 rounded-full bg-amber-400 animate-soundwave-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE UPLOAD PROGRESS QUEUE WITH CYCLING PROGRESS */}
            {activeTab === "upload" && (
              <div className="p-6 sm:p-10 animate-fadeIn">
                <div className="grid gap-8 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-500">
                      <CloudArrowUpIcon className="h-3.5 w-3.5" />
                      Live Upload Engine
                    </span>
                    <h3 className="font-sans text-2xl font-black text-jevah-text">
                      Batch Song Upload with Real-time Progress Bars
                    </h3>
                    <p className="text-xs leading-relaxed text-jevah-text-muted">
                      Drop single or multiple songs at once. Watch live byte-level progress bars fill in real-time as your tracks upload securely to high-speed cloud storage.
                    </p>
                  </div>

                  {/* Animated Upload Queue Card */}
                  <div className="lg:col-span-6 space-y-3 rounded-3xl border border-jevah-border bg-jevah-card/40 p-6 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-jevah-text border-b border-jevah-border/60 pb-3">
                      <span>Batch Uploading (2 Tracks)</span>
                      <span className="text-emerald-500 font-mono">{demoProgress}% Overall</span>
                    </div>

                    <div className="rounded-2xl border border-jevah-accent/40 bg-jevah-surface p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-jevah-text truncate max-w-[200px]">Joyful Praise (Worship Single).mp3</span>
                        <span className="text-jevah-accent font-mono font-black">{demoProgress}%</span>
                      </div>

                      <div className="relative h-3 w-full rounded-full bg-jevah-card overflow-hidden ring-1 ring-jevah-border/60">
                        <div
                          className="h-full bg-gradient-to-r from-jevah-accent via-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${demoProgress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-wave" />
                      </div>

                      <p className="mt-2 text-[10px] font-bold text-jevah-accent animate-pulse">
                        Uploading audio bytes ({demoProgress}%)…
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REAL-TIME STREAMING ANALYTICS WITH COUNTERS */}
            {activeTab === "analytics" && (
              <div className="p-6 sm:p-10 animate-fadeIn">
                <div className="grid gap-8 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-black uppercase text-teal-400">
                      <ChartBarIcon className="h-3.5 w-3.5" />
                      Studio Analytics
                    </span>
                    <h3 className="font-sans text-2xl font-black text-jevah-text">
                      Track Streams, Growth &amp; Audience Reach
                    </h3>
                    <p className="text-xs leading-relaxed text-jevah-text-muted">
                      Get real-time insights into your song plays, top performing tracks, listener demographics, and catalog growth.
                    </p>
                  </div>

                  <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-jevah-accent/40 bg-jevah-surface p-5 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">Total Monthly Plays</span>
                      <p className="font-sans text-3xl font-black text-jevah-accent mt-1">+142,800</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-2">
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                        +24.5% vs last month
                      </span>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/40 bg-jevah-surface p-5 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">Audience Growth</span>
                      <p className="font-sans text-3xl font-black text-emerald-500 mt-1">+34.2%</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-2">
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                        Active Growth Rate
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="scroll-mt-28 border-t border-jevah-border/70 bg-jevah-card/40 px-4 py-16 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-jevah-text">
            From application to the shelf
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-jevah-text-muted">
            Four steps. No mystery queue. You always know whether you are waiting, uploading, or live.{" "}
            <Link to="/creators/how" className="font-bold text-jevah-accent hover:underline">
              Full guide
            </Link>
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {HOW.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className="flex gap-4 rounded-2xl border border-jevah-border bg-jevah-surface p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-jevah-accent">{step.n}</p>
                    <h3 className="mt-0.5 text-base font-bold text-jevah-text">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-jevah-text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="benefits"
        className="scroll-mt-28 px-4 py-16 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent">
            <HeartIcon className="h-3.5 w-3.5" />
            Why artists join
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-jevah-text">
            Built so ministry music can travel
          </h2>
          <p className="mt-2 text-sm text-jevah-text-muted">
            <Link to="/creators/benefits" className="font-bold text-jevah-accent hover:underline">
              See every benefit
            </Link>
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border border-jevah-border bg-jevah-surface p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-jevah-text">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] px-6 py-7 text-white sm:flex-row sm:px-8 shadow-xl">
            <div>
              <p className="text-lg font-black">Ready when you are</p>
              <p className="mt-1 text-sm text-white/65">
                Already approved? Open Studio. First time? Start the application.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                to="/creators/apply"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0B1A1F] transition hover:bg-slate-100"
              >
                Apply now
              </Link>
              <Link
                to="/creators/studio"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Open studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

