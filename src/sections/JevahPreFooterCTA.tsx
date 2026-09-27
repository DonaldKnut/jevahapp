import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useFeedback } from "../components/admin/Feedback";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export default function JevahPreFooterCTA() {
  const { toast } = useFeedback();
  const [copied, setCopied] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.08 });

  const handleCopyPhone = () => {
    void navigator.clipboard.writeText("+2347037742764");
    setCopied(true);
    toast.success("Phone Number Copied", "+234 703 774 2764 copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-jevah-border bg-jevah-bg px-4 py-16 transition-colors duration-300 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="quote-orb absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-[#256E63]/10 blur-3xl dark:bg-jevah-accent/15" />
        <div
          className="quote-orb absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/12"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div
          className={`overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface p-5 shadow-[0_20px_60px_var(--jevah-shadow)] xs:p-8 sm:p-12 ${
            isIntersecting ? "studio-rise" : "opacity-0"
          }`}
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#256E63]/20 bg-[#256E63]/10 px-3.5 py-1.5 text-xs font-semibold text-[#256E63] dark:border-jevah-accent/30 dark:bg-jevah-accent/10 dark:text-jevah-accent">
              <SparklesIcon className="quote-heart h-4 w-4" />
              <span>Experience Jevah — The Gospel Ecosystem</span>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <ClockIcon className="h-4 w-4" />
              <span>We're available 9 am - 11 pm WAT</span>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="space-y-6 lg:col-span-7">
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-jevah-text xs:text-3xl sm:text-4xl lg:text-5xl">
                Connect with God's word,{" "}
                <span className="bg-gradient-to-r from-[#256E63] via-amber-500 to-teal-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-jevah-accent dark:to-teal-200">
                  anytime, anywhere.
                </span>
              </h2>

              <p className="max-w-2xl text-base font-normal leading-relaxed text-jevah-text-muted sm:text-lg">
                Jevah brings together gospel music streaming, Holy Bible reading,
                life-changing sermons, books, and interactive fellowship for all
                generations.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                {[
                  "Afro-Gospel Streaming",
                  "Interactive Bible",
                  "Children's Kingdom",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-jevah-border bg-jevah-muted/60 px-3 py-2 text-xs font-medium text-jevah-text"
                  >
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-[#256E63] dark:text-jevah-accent" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#download"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-[#256E63] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#256E63]/20 transition-all duration-300 hover:bg-[#1e5a52] hover:shadow-xl active:scale-95 dark:bg-jevah-accent dark:text-[#0b1a1f] dark:shadow-jevah-accent/20 dark:hover:bg-jevah-accent-hover"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 stroke-[2.5]" />
                  <span>Download Jevah App</span>
                </a>

                <Link
                  to="/creators"
                  className="inline-flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-surface px-5 py-3.5 text-sm font-semibold text-jevah-text transition-all duration-300 hover:border-[#256E63]/30 hover:bg-[#256E63]/5 dark:hover:border-jevah-accent/40 dark:hover:bg-jevah-accent/10"
                >
                  <span>Join as Gospel Creator</span>
                  <ArrowRightIcon className="h-4 w-4 text-[#256E63] dark:text-jevah-accent" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-6 transition-all duration-300 hover:border-emerald-500/45 hover:shadow-lg hover:shadow-emerald-500/10 dark:bg-emerald-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Instant Chat
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-jevah-text">
                      Let's chat on WhatsApp
                    </h3>
                    <p className="mt-1 text-xs text-jevah-text-muted">
                      Got questions, feedback, or fellowship inquiries? We respond
                      instantly.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                  </div>
                </div>

                <a
                  href="https://wa.me/2347037742764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-500 active:scale-[0.98] dark:bg-emerald-500 dark:text-[#05120e] dark:hover:bg-emerald-400"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-amber-500/8 p-6 transition-all duration-300 hover:border-amber-500/45 hover:shadow-lg hover:shadow-amber-500/10 dark:bg-amber-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Direct Line
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-jevah-text">
                      Wanna call instead?
                    </h3>
                    <p className="mt-1 text-xs text-jevah-text-muted">
                      Speak directly with our team between 9 am and 11 pm WAT.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/25 dark:text-amber-400">
                    <PhoneIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <a
                    href="tel:+2347037742764"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-extrabold text-[#1a1206] transition hover:bg-amber-400 active:scale-[0.98]"
                  >
                    <PhoneIcon className="h-4 w-4 stroke-[2.5]" />
                    <span>+234 703 774 2764</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center justify-center rounded-xl border border-jevah-border bg-jevah-surface px-4 py-3 text-xs font-bold text-jevah-text transition hover:bg-jevah-muted active:scale-95"
                    title="Copy Phone Number"
                  >
                    {copied ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-jevah-text-muted">
                <ShieldCheckIcon className="h-4 w-4 text-[#256E63] dark:text-jevah-accent" />
                <span>Secure & Confidential Support · 7 Days a Week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
