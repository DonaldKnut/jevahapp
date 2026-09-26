import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../context/AuthContext";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import {
  SparklesIcon,
  CheckBadgeIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon,
  PlayCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign in from Creator in the header. Use the same email you want listeners and Jevah to reach you on.",
    detail: "You land in Studio even before approval — the desk shows a review card instead of upload until you are verified.",
    icon: SparklesIcon,
    accent: "amber",
  },
  {
    n: "02",
    title: "Send one application",
    body: "Display name, ministry type, genres, a short bio, and optional social links. That is the whole form.",
    detail: "Admins see you in the Artists queue. Typical review is 1–2 days. You get email when the desk opens.",
    icon: EnvelopeIcon,
    accent: "emerald",
  },
  {
    n: "03",
    title: "Wait with the desk open",
    body: "Studio stays readable. You cannot publish yet — that is how the Artists shelf stays trusted gospel music.",
    detail: "If something is missing, support will ask. You will not be left in a silent queue.",
    icon: ClockIcon,
    accent: "teal",
  },
  {
    n: "04",
    title: "Upload tracks & cover art",
    body: "Drop one song or a batch. Title, genre, and artwork per track. Save as draft or publish to the shelf.",
    detail: "Covers travel with the player. You can replace art later from Catalog → Edit.",
    icon: ArrowUpTrayIcon,
    accent: "violet",
  },
  {
    n: "05",
    title: "Pack albums, then grow",
    body: "Discography groups singles into an EP or album. Analytics shows who listened and how far they played.",
    detail: "Brand Profile is the public page at /artists/your-name — photo, banner, bio, and the catalog people share.",
    icon: ChartBarIcon,
    accent: "rose",
  },
];

const accentColors: Record<string, { line: string; dot: string; iconBg: string; iconRing: string; iconText: string }> = {
  amber:   { line: "from-amber-400 to-amber-500",     dot: "bg-amber-400 shadow-amber-400/50",     iconBg: "bg-amber-500/10",   iconRing: "ring-amber-500/25",   iconText: "text-amber-500" },
  emerald: { line: "from-emerald-400 to-emerald-500", dot: "bg-emerald-400 shadow-emerald-400/50", iconBg: "bg-emerald-500/10", iconRing: "ring-emerald-500/25", iconText: "text-emerald-500" },
  teal:    { line: "from-teal-400 to-teal-500",       dot: "bg-teal-400 shadow-teal-400/50",       iconBg: "bg-teal-500/10",    iconRing: "ring-teal-500/25",    iconText: "text-teal-500" },
  violet:  { line: "from-violet-400 to-violet-500",   dot: "bg-violet-400 shadow-violet-400/50",   iconBg: "bg-violet-500/10",  iconRing: "ring-violet-500/25",  iconText: "text-violet-500" },
  rose:    { line: "from-rose-400 to-rose-500",       dot: "bg-rose-400 shadow-rose-400/50",       iconBg: "bg-rose-500/10",    iconRing: "ring-rose-500/25",    iconText: "text-rose-500" },
};

const FEATURES = [
  { icon: MusicalNoteIcon, title: "Unlimited Uploads", desc: "No cap on how many tracks you can publish. Singles, EPs, full albums — all welcome." },
  { icon: ShieldCheckIcon, title: "Verified Badge", desc: "Gold verification mark that travels with your name across the entire platform." },
  { icon: GlobeAltIcon, title: "Public Artist Page", desc: "A dedicated /artists/your-name URL with photo, banner, bio, and full catalog." },
  { icon: PlayCircleIcon, title: "Vinyl Player", desc: "Listeners experience your music through an immersive gospel-themed vinyl player." },
  { icon: UserGroupIcon, title: "Community Reach", desc: "Built-in audience of believers seeking worship music, sermons, and fellowship." },
  { icon: ChartBarIcon, title: "Deep Analytics", desc: "Track streams, listener retention, engagement spikes, and geographic reach." },
];

export default function CreatorHow() {
  useDocumentMeta({
    title: "How Creator Studio works — Jevah",
    description: "Apply as a gospel artist, get verified, upload tracks with cover art, and grow from Jevah Studio.",
    canonicalPath: "/creators/how",
  });
  const { isAuthenticated } = useAuth();
  const applyTo = isAuthenticated ? "/creators/apply" : "/creators/signup";

  const { ref: heroRef, isIntersecting: heroVis } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: stepsRef, isIntersecting: stepsVis } = useIntersectionObserver({ threshold: 0.05 });
  const { ref: featRef, isIntersecting: featVis } = useIntersectionObserver({ threshold: 0.05 });
  const { ref: faqRef, isIntersecting: faqVis } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: ctaRef, isIntersecting: ctaVis } = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div className="jevah-dashboard-shell px-4 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      {/* ── Hero ── */}
      <div ref={heroRef} className="mx-auto max-w-3xl text-center">
        <p className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <RocketLaunchIcon className="h-3.5 w-3.5" />
          How Studio works
        </p>
        <h1 className={`mt-3 text-4xl font-black tracking-tight text-jevah-text sm:text-5xl transition-all duration-700 delay-100 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          Apply once.{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Publish when verified.
          </span>
        </h1>
        <p className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed text-jevah-text-muted sm:text-base transition-all duration-700 delay-200 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Five steps from first login to a live track on the Artists shelf. No mystery
          queue — Studio always tells you whether you are waiting, uploading, or live.
        </p>
      </div>

      {/* ── Steps Timeline ── */}
      <div ref={stepsRef} className="mx-auto mt-14 max-w-3xl">
        <ol className="relative space-y-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const ac = accentColors[step.accent] || accentColors.amber;
            const isLast = i === STEPS.length - 1;
            return (
              <li
                key={step.n}
                className={`relative pl-14 pb-10 transition-all duration-600 ${stepsVis ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Vertical connector line */}
                {!isLast && (
                  <div className={`absolute left-[23px] top-14 bottom-0 w-0.5 bg-gradient-to-b ${ac.line} opacity-30`} />
                )}

                {/* Step dot */}
                <div className={`absolute left-3 top-1 flex h-8 w-8 items-center justify-center rounded-full ${ac.dot} shadow-lg`}>
                  <span className="text-xs font-black text-white">{step.n}</span>
                </div>

                {/* Card */}
                <div className="group rounded-2xl border border-jevah-border bg-jevah-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-jevah-accent/30 hover:shadow-lg sm:p-6">
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ac.iconBg} ${ac.iconText} ring-1 ${ac.iconRing} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${ac.iconText}`}>
                        Step {step.n}
                      </p>
                      <h2 className="mt-0.5 text-lg font-bold text-jevah-text">{step.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">{step.body}</p>
                      <p className="mt-2 text-sm leading-relaxed text-jevah-text">{step.detail}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── What's Included Feature Grid ── */}
      <div ref={featRef} className="mx-auto mt-16 max-w-5xl">
        <div className={`text-center transition-all duration-700 ${featVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-500">
            <BoltIcon className="h-3.5 w-3.5" />
            Everything included
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-jevah-text sm:text-3xl">
            What you get as a Jevah Creator
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-jevah-text-muted">
            All features are free. No subscription tiers, no revenue share, no hidden costs.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Ic = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative overflow-hidden rounded-2xl border border-jevah-border bg-jevah-surface p-5 transition-all duration-500 hover:-translate-y-1 hover:border-jevah-accent/25 hover:shadow-lg ${featVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${150 + i * 80}ms` }}
              >
                <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-jevah-accent/8 blur-xl transition-transform duration-500 group-hover:scale-[2]" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20 transition-transform duration-300 group-hover:scale-110">
                  <Ic className="h-5 w-5" />
                </div>
                <h3 className="relative mt-3 text-sm font-bold text-jevah-text">{f.title}</h3>
                <p className="relative mt-1 text-xs leading-relaxed text-jevah-text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FAQ-style Quick Answers ── */}
      <div ref={faqRef} className="mx-auto mt-16 max-w-3xl">
        <div className={`text-center transition-all duration-700 ${faqVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-500">
            <HeartIcon className="h-3.5 w-3.5" />
            Common questions
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-jevah-text sm:text-3xl">
            Artists always ask
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {[
            { q: "Is it really free?", a: "100%. No subscription, no revenue share, no hidden fees. Jevah is ministry-first. Your music reaches listeners at zero cost." },
            { q: "How long does verification take?", a: "Most artists are verified within 24 hours. Complex cases (choirs, large ministries) may take 1–2 business days." },
            { q: "Can I upload sermons and podcasts too?", a: "Yes. Studio supports gospel music, sermons, worship talks, and faith podcasts. All under one creator account." },
            { q: "What if my application is declined?", a: "You'll receive a clear reason and can reapply. Jevah support will guide you through any missing requirements." },
          ].map((item, i) => (
            <div
              key={item.q}
              className={`rounded-2xl border border-jevah-border bg-jevah-surface p-5 transition-all duration-500 hover:border-jevah-accent/25 ${faqVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              <h3 className="text-sm font-bold text-jevah-text">{item.q}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-jevah-text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div ref={ctaRef} className={`mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1A1F] via-[#0e2530] to-[#12263a] p-8 text-white transition-all duration-700 ${ctaVis ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
        <div className="relative text-center">
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 text-sm font-black">
              <CheckBadgeIcon className="h-5 w-5 text-emerald-300" />
              Ready to start?
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Your ministry music deserves a{" "}
              <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
                dedicated home
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/65">
              Application is one form. Upload unlocks after approval. Join thousands of gospel creators already publishing on Jevah.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={applyTo}
                state={isAuthenticated ? undefined : { from: "/creators/apply", intent: "creator" }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-7 py-3.5 text-sm font-extrabold text-[#0B1A1F] shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/35 active:scale-95"
              >
                Become a Creator
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/creators/benefits"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10"
              >
                Why artists join
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
