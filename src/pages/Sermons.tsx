import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  DevicePhoneMobileIcon,
  MicrophoneIcon,
  PlayCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import StoreLinks from "../common/StoreLinks";
import { BtnTypes } from "../common/StoreLinks.types";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const highlights = [
  {
    icon: MicrophoneIcon,
    title: "Messages from trusted voices",
    body: "Pastors and teachers shared for listening on the go — not a fake web playlist.",
  },
  {
    icon: BookOpenIcon,
    title: "Scripture-rooted teaching",
    body: "Find messages by theme and stay with the Word between Sundays.",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "Best in the Jevah app",
    body: "Full library, offline saves, and live moments live where your headphones are.",
  },
];

const topics = [
  { label: "Faith & endurance", verse: "James 1" },
  { label: "Prayer", verse: "Matthew 6" },
  { label: "Purpose", verse: "Jeremiah 29" },
  { label: "Worship & joy", verse: "Psalm 51" },
  { label: "Family & community", verse: "Acts 2" },
  { label: "Hope in hard seasons", verse: "Romans 8" },
];

/**
 * Marketing surface for Sermons.
 * No sermon catalog API is wired in this web app yet — the live library
 * belongs in the mobile app (and needs backend sermon/media endpoints).
 */
export default function Sermons() {
  useDocumentMeta({
    title: "Christian sermons & teaching — Jevah",
    description:
      "Scripture-rooted sermons and messages on faith, prayer, and hope. Listen on the Jevah Christian app.",
    canonicalPath: "/sermons",
  });
  return (
    <div className="jevah-dashboard-shell min-h-dvh font-sans antialiased transition-colors duration-300">
      {/* Hero — one composition, full-bleed visual */}
      <section className="relative min-h-[min(92vh,820px)] overflow-hidden">
        <img
          src="https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--jevah-bg) 55%, transparent) 0%, color-mix(in srgb, var(--jevah-bg) 88%, transparent) 55%, var(--jevah-bg) 100%), linear-gradient(90deg, color-mix(in srgb, var(--jevah-bg) 75%, transparent) 0%, transparent 55%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(92vh,820px)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12">
          <p className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-jevah-accent">
            <AcademicCapIcon className="h-4 w-4" />
            Jevah Sermons
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-jevah-text sm:text-5xl lg:text-6xl">
            Teaching that travels with you.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-jevah-text-muted sm:text-lg">
            Powerful messages and Bible teaching — curated for faith growth.
            Open the Jevah app for the full sermon shelf.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/#download"
              className="inline-flex items-center gap-2 rounded-full bg-jevah-accent px-6 py-3 text-sm font-bold text-white shadow-md shadow-jevah-accent/25 transition hover:bg-jevah-accent-hover active:scale-[0.98]"
            >
              <PlayCircleIcon className="h-5 w-5" />
              Listen in the app
            </a>
            <Link
              to="/music"
              className="inline-flex items-center gap-2 rounded-full border border-jevah-border bg-jevah-surface/80 px-5 py-3 text-sm font-bold text-jevah-text backdrop-blur transition hover:bg-jevah-card"
            >
              Explore music
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why sermons on Jevah */}
      <section className="jevah-section px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl">
              Built for listening, not browsing tabs.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-jevah-text-muted sm:text-base">
              Sermons on Jevah are part of the same faith ecosystem as gospel
              music and community — available where believers already open the
              app.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/15 transition group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-jevah-text">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics — one job: show themes, not fake catalog */}
      <section className="jevah-section-muted px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-jevah-accent">
                Themes
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl">
                What believers are seeking
              </h2>
            </div>
            <p className="max-w-sm text-sm text-jevah-text-muted">
              Topic guides for the app library — full messages stream there.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-jevah-border border-y border-jevah-border">
            {topics.map((t) => (
              <li
                key={t.label}
                className="flex items-center justify-between gap-4 py-4 transition hover:bg-jevah-card/40"
              >
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-4 w-4 shrink-0 text-jevah-accent" />
                  <span className="font-semibold text-jevah-text">{t.label}</span>
                </div>
                <span className="text-xs font-medium text-jevah-text-muted">
                  {t.verse}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Honest catalog note + CTA */}
      <section className="jevah-section px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-jevah-border bg-jevah-surface px-6 py-12 text-center sm:px-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, var(--jevah-accent) 16%, transparent), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20">
              <PlayCircleIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-jevah-text sm:text-3xl">
              The sermon shelf lives in the app
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-jevah-text-muted">
              This website doesn&apos;t stream the full catalog yet. Download
              Jevah to listen — and when we wire a public sermons API, this page
              can list live messages from the backend.
            </p>
            <div className="mt-8 flex justify-center">
              <StoreLinks type={BtnTypes.Standard} />
            </div>
            <p className="mt-6 text-xs text-jevah-text-muted">
              Ministers &amp; creators:{" "}
              <Link
                to="/creators"
                className="font-semibold text-jevah-accent underline-offset-2 hover:underline"
              >
                share teaching via Creator Studio
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
