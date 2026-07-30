import { Link as RouterLink } from "react-router-dom";
import {
  MusicalNoteIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function ArtistStudioPromo() {
  const highlights = [
    {
      icon: MusicalNoteIcon,
      title: "Publish Gospel Music",
      desc: "Upload single tracks or full albums directly to millions of eager Christian listeners.",
    },
    {
      icon: ChartBarIcon,
      title: "Real-time Stream Analytics",
      desc: "Track daily streams, listener demographics, and track engagement effortlessly.",
    },
    {
      icon: CheckCircleIcon,
      title: "Get Verified Artist Badge",
      desc: "Stand out with an official Jevah Creator verification checkmark on your public profile.",
    },
    {
      icon: UserGroupIcon,
      title: "Build Your Faithful Community",
      desc: "Engage with fans, share devotions, and receive direct prayer support and appreciation.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-jevah-muted via-[#eef3f1] to-jevah-bg px-6 py-20 dark:from-jevah-surface dark:via-jevah-bg dark:to-jevah-bg sm:py-28 sm:px-8 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-80 dark:opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 8% 0%, rgba(37,110,99,0.14), transparent 55%), radial-gradient(ellipse 45% 40% at 92% 15%, rgba(255,165,0,0.1), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface p-8 shadow-[0_20px_60px_var(--jevah-shadow)] sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#256E63]/20 bg-[#256E63]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#256E63] dark:border-jevah-accent/30 dark:bg-jevah-accent/10 dark:text-jevah-accent">
                <SparklesIcon className="h-4 w-4" />
                Jevah Creator Studio
              </div>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-jevah-text sm:text-4xl lg:text-5xl">
                Are You a Gospel Artist or Music Ministry?
              </h2>

              <p className="mt-4 text-base leading-relaxed text-jevah-text-muted sm:text-lg">
                Join <strong className="text-jevah-text">Jevah Creator Studio</strong> to
                distribute your gospel tracks, reach a dedicated global Christian audience,
                and track your streaming growth with professional tools.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="group rounded-2xl border border-jevah-border bg-jevah-muted/60 p-4 transition-all duration-300 hover:border-[#256E63]/25 hover:bg-[#256E63]/5 dark:hover:border-jevah-accent/30 dark:hover:bg-jevah-accent/5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#256E63]/10 text-[#256E63] ring-1 ring-[#256E63]/15 transition-transform duration-300 group-hover:scale-110 dark:bg-jevah-accent/15 dark:text-jevah-accent dark:ring-jevah-accent/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-jevah-text">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-jevah-text-muted">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <RouterLink
                  to="/creators/apply"
                  className="inline-flex items-center gap-2 rounded-full bg-[#256E63] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#256E63]/25 transition-all duration-200 hover:bg-[#1e5a52] hover:shadow-xl active:scale-95 dark:bg-jevah-accent dark:text-[#0b1a1f] dark:shadow-jevah-accent/20 dark:hover:bg-jevah-accent-hover"
                >
                  Register as an Artist
                  <ArrowRightIcon className="h-4 w-4" />
                </RouterLink>

                <RouterLink
                  to="/creators"
                  className="inline-flex items-center gap-2 rounded-full border border-[#256E63]/25 bg-white px-6 py-3.5 text-base font-semibold text-[#256E63] transition-all duration-200 hover:bg-[#256E63]/5 active:scale-95 dark:border-jevah-accent/30 dark:bg-jevah-elevated dark:text-jevah-accent dark:hover:bg-jevah-accent/10"
                >
                  Learn About Creators
                </RouterLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-[#256E63]/15 bg-gradient-to-br from-white via-[#f8fcfb] to-[#eef7f5] p-6 shadow-xl shadow-[#256E63]/10 ring-1 ring-[#256E63]/10 dark:border-jevah-accent/20 dark:from-jevah-elevated dark:via-jevah-surface dark:to-jevah-muted dark:shadow-black/30">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#256E63]/10 blur-2xl dark:bg-jevah-accent/10"
                  aria-hidden
                />

                <div className="relative flex items-center gap-4 border-b border-jevah-border pb-5">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#256E63] to-[#4ecdc4] text-xl font-black text-white shadow-md">
                    JV
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-slate-950">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-jevah-text">
                      Gospel Praise Ministry
                    </h4>
                    <p className="text-xs text-jevah-text-muted">Verified Creator Studio</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      ● Active Streaming
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-2xl border border-jevah-border bg-white/80 p-3 dark:bg-jevah-surface/80">
                    <p className="text-xs font-medium text-jevah-text-muted">Total Streams</p>
                    <p className="mt-1 text-xl font-bold text-[#256E63] dark:text-jevah-accent">
                      128,450+
                    </p>
                  </div>
                  <div className="rounded-2xl border border-jevah-border bg-white/80 p-3 dark:bg-jevah-surface/80">
                    <p className="text-xs font-medium text-jevah-text-muted">
                      Tracks Published
                    </p>
                    <p className="mt-1 text-xl font-bold text-jevah-text">24 Tracks</p>
                  </div>
                </div>

                <div className="relative mt-5 rounded-2xl border border-[#256E63]/15 bg-[#256E63]/5 p-4 dark:border-jevah-accent/20 dark:bg-jevah-accent/5">
                  <div className="flex items-center justify-between text-xs text-jevah-text">
                    <span className="truncate font-semibold">Living Water Devotional</span>
                    <span className="font-bold text-[#256E63] dark:text-jevah-accent">
                      Now Live
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 75, 60, 40, 85].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-[#256E63] dark:bg-jevah-accent"
                          style={{
                            height: `${h / 3}px`,
                            opacity: i % 2 === 0 ? 0.9 : 0.55,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                <p className="relative mt-5 text-center text-xs text-jevah-text-muted">
                  ⚡ Verification takes less than 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
