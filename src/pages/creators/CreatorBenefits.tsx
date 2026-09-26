import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../context/AuthContext";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import {
  MusicalNoteIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  BoltIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const BENEFITS = [
  {
    title: "A gospel-first audience",
    body: "Your music sits on the Artists shelf next to worship, choir, and Afro-gospel — not a dump of every genre on earth.",
    extra: "Copyright-free beds stay on a separate curated shelf. Listeners who want original ministry music find you on purpose.",
    icon: MusicalNoteIcon,
    color: "amber",
  },
  {
    title: "A page people can share",
    body: "Photo, banner, bio, and tracks in one URL: /artists/your-name. Same story you tell on Sunday, ready for midweek.",
    extra: "Verified creators get the gold mark. Share the link on WhatsApp, Instagram, or the church bulletin.",
    icon: GlobeAltIcon,
    color: "emerald",
  },
  {
    title: "Streams you can actually read",
    body: "Studio Analytics shows listens, unique listeners, and how far people play — 7, 28, or 90 days.",
    extra: "Double down on what people finish. A spike after a service is normal; the week after tells you if the song travels.",
    icon: ChartBarIcon,
    color: "teal",
  },
  {
    title: "Cover art that travels",
    body: "Every track can carry its own artwork. The vinyl player and the public page both use it.",
    extra: "Replace a cover later from Catalog without re-uploading the audio.",
    icon: PhotoIcon,
    color: "violet",
  },
  {
    title: "Room for the whole ministry",
    body: "Solo ministers, worship teams, choirs, and faith podcasters use the same Studio. One apply. One catalog.",
    extra: "Discography packs singles into EPs and albums when a project should travel together.",
    icon: UserGroupIcon,
    color: "rose",
  },
  {
    title: "A trusted shelf",
    body: "Verification is the gate. That is why upload waits on approval — listeners know the Artists shelf is ministry music.",
    extra: "Admins review applications in the Artists queue. You are not competing with spam accounts for attention.",
    icon: ShieldCheckIcon,
    color: "cyan",
  },
];

const colorMap: Record<string, { icon: string; ring: string; bg: string; glow: string }> = {
  amber:   { icon: "text-amber-500",   ring: "ring-amber-500/25",   bg: "bg-amber-500/10",   glow: "group-hover:shadow-amber-500/20" },
  emerald: { icon: "text-emerald-500", ring: "ring-emerald-500/25", bg: "bg-emerald-500/10", glow: "group-hover:shadow-emerald-500/20" },
  teal:    { icon: "text-teal-500",    ring: "ring-teal-500/25",    bg: "bg-teal-500/10",    glow: "group-hover:shadow-teal-500/20" },
  violet:  { icon: "text-violet-500",  ring: "ring-violet-500/25",  bg: "bg-violet-500/10",  glow: "group-hover:shadow-violet-500/20" },
  rose:    { icon: "text-rose-500",    ring: "ring-rose-500/25",    bg: "bg-rose-500/10",    glow: "group-hover:shadow-rose-500/20" },
  cyan:    { icon: "text-cyan-500",    ring: "ring-cyan-500/25",    bg: "bg-cyan-500/10",    glow: "group-hover:shadow-cyan-500/20" },
};

const STATS = [
  { value: "10K+", label: "Gospel Creators" },
  { value: "1M+", label: "Monthly Streams" },
  { value: "24hr", label: "Avg Verification" },
  { value: "100%", label: "Free to Join" },
];

const COMPARE = [
  { feature: "Gospel-dedicated audience", jevah: true, others: false },
  { feature: "Free publishing — no fees", jevah: true, others: false },
  { feature: "Built-in artist verification", jevah: true, others: false },
  { feature: "Real-time stream analytics", jevah: true, others: true },
  { feature: "Cover art per track", jevah: true, others: true },
  { feature: "Shareable public profile", jevah: true, others: true },
  { feature: "Ministry-focused community", jevah: true, others: false },
  { feature: "Children's content shelf", jevah: true, others: false },
];

export default function CreatorBenefits() {
  useDocumentMeta({
    title: "Why gospel artists join Jevah — Creator Studio",
    description:
      "A gospel audience, a public artist page, stream analytics, and a trusted Artists shelf — why ministers publish on Jevah.",
    canonicalPath: "/creators/benefits",
  });
  const { isAuthenticated } = useAuth();
  const applyTo = isAuthenticated ? "/creators/apply" : "/creators/signup";

  const { ref: heroRef, isIntersecting: heroVis } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: gridRef, isIntersecting: gridVis } = useIntersectionObserver({ threshold: 0.05 });
  const { ref: statsRef, isIntersecting: statsVis } = useIntersectionObserver({ threshold: 0.15 });
  const { ref: compareRef, isIntersecting: compareVis } = useIntersectionObserver({ threshold: 0.08 });
  const { ref: testimonialRef, isIntersecting: testimonialVis } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: ctaRef, isIntersecting: ctaVis } = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div className="jevah-dashboard-shell px-4 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      {/* ── Hero ── */}
      <div ref={heroRef} className="mx-auto max-w-3xl text-center">
        <p className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent transition-all duration-700 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <HeartIcon className="h-3.5 w-3.5" />
          Why artists join
        </p>
        <h1 className={`mt-3 text-4xl font-black tracking-tight text-jevah-text sm:text-5xl transition-all duration-700 delay-100 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          Built so ministry music{" "}
          <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            can travel
          </span>
        </h1>
        <p className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed text-jevah-text-muted sm:text-base transition-all duration-700 delay-200 ${heroVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Jevah is not a generic upload dump. It is a gospel house: listeners come for
          worship and the Word. Your catalog lives in that room.
        </p>
      </div>

      {/* ── Stats Banner ── */}
      <div ref={statsRef} className="mx-auto mt-12 max-w-4xl">
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 transition-all duration-700 ${statsVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-jevah-border bg-jevah-surface p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-jevah-accent/10"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-jevah-accent/5 via-transparent to-amber-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative text-3xl font-black tracking-tight text-jevah-text sm:text-4xl">{s.value}</p>
              <p className="relative mt-1 text-xs font-semibold text-jevah-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Benefit Cards Grid ── */}
      <div ref={gridRef} className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b, i) => {
          const Icon = b.icon;
          const c = colorMap[b.color] || colorMap.amber;
          return (
            <article
              key={b.title}
              className={`group relative overflow-hidden rounded-2xl border border-jevah-border bg-jevah-surface p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-jevah-accent/30 hover:shadow-xl ${c.glow} ${gridVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-jevah-accent/8 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-150" />
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.icon} ring-1 ${c.ring} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-jevah-text">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">{b.body}</p>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text">{b.extra}</p>
            </article>
          );
        })}
      </div>

      {/* ── Comparison Table ── */}
      <div ref={compareRef} className="mx-auto mt-16 max-w-2xl">
        <div className={`text-center transition-all duration-700 ${compareVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-500">
            <BoltIcon className="h-3.5 w-3.5" />
            The Jevah Difference
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-jevah-text sm:text-3xl">
            Jevah vs. generic platforms
          </h2>
        </div>

        <div className={`mt-8 overflow-hidden rounded-2xl border border-jevah-border transition-all duration-700 delay-150 ${compareVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-[1fr_80px_80px] items-center border-b border-jevah-border bg-jevah-surface px-4 py-3 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted sm:grid-cols-[1fr_100px_100px] sm:px-6">
            <span>Feature</span>
            <span className="text-center text-emerald-500">Jevah</span>
            <span className="text-center">Others</span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_80px_80px] items-center border-b border-jevah-border/50 px-4 py-3 text-xs sm:grid-cols-[1fr_100px_100px] sm:px-6 transition-all duration-300 hover:bg-jevah-accent/5 ${compareVis ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
              style={{ transitionDelay: `${200 + i * 60}ms` }}
            >
              <span className="font-medium text-jevah-text">{row.feature}</span>
              <span className="flex justify-center">
                {row.jevah ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-jevah-text-muted/40" />
                )}
              </span>
              <span className="flex justify-center">
                {row.others ? (
                  <CheckCircleIcon className="h-5 w-5 text-jevah-text-muted/60" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-rose-400/60" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonial ── */}
      <div ref={testimonialRef} className="mx-auto mt-16 max-w-3xl">
        <div className={`relative overflow-hidden rounded-3xl border border-jevah-border bg-gradient-to-br from-jevah-surface via-jevah-surface to-jevah-accent/5 p-8 sm:p-10 transition-all duration-700 ${testimonialVis ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-lg font-semibold leading-relaxed text-jevah-text sm:text-xl">
              "Before Jevah, our worship recordings sat on a hard drive. Now they reach believers across three continents. The Studio is simple, the analytics are real, and the audience actually <em>wants</em> gospel."
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 text-sm font-black text-white shadow-lg">
                GP
              </div>
              <div>
                <p className="text-sm font-bold text-jevah-text">Gospel Praise Ministry</p>
                <p className="text-xs text-jevah-text-muted">Verified Creator · Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── What You Get Quick-List ── */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: RocketLaunchIcon, title: "Launch in 24hrs", desc: "Apply today, get verified tomorrow, publish your first track by evening.", color: "text-amber-500" },
            { icon: SparklesIcon, title: "Zero platform fees", desc: "No subscription, no cut from donations, no hidden costs. Ministry first.", color: "text-emerald-500" },
            { icon: ShieldCheckIcon, title: "Trusted & verified", desc: "Gold badge, moderated shelf, real listeners. Your music is protected.", color: "text-teal-500" },
          ].map((item) => {
            const Ic = item.icon;
            return (
              <div key={item.title} className="group rounded-2xl border border-jevah-border bg-jevah-surface p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jevah-card ${item.color} ring-1 ring-jevah-border transition-transform duration-300 group-hover:scale-110`}>
                  <Ic className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-jevah-text">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-jevah-text-muted">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div ref={ctaRef} className={`mx-auto mt-14 flex max-w-3xl flex-col items-center justify-between gap-5 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1A1F] via-[#0e2530] to-[#12263a] px-6 py-8 text-white sm:flex-row sm:px-8 transition-all duration-700 ${ctaVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="relative">
          <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-amber-500/20 blur-2xl" />
          <p className="relative text-xl font-black sm:text-2xl">Start with the application</p>
          <p className="relative mt-1 text-sm text-white/65">
            Read how Studio works, then apply. Upload unlocks after you are verified.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
          <Link
            to={applyTo}
            state={isAuthenticated ? undefined : { from: "/creators/apply", intent: "creator" }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-6 py-3 text-sm font-extrabold text-[#0B1A1F] shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/35 active:scale-95"
          >
            Become a Creator
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            to="/creators/how"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10"
          >
            How Studio works
          </Link>
        </div>
      </div>
    </div>
  );
}
