import { Link } from "react-router-dom";
import type { ComponentType, ReactNode, SVGProps } from "react";
import ThemeToggle from "../../../components/ThemeToggle";
import JevahLogo from "../../../components/JevahLogo";
import AuthPromoSlider from "../../../components/AuthPromoSlider";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

const DEFAULT_FEATURES = [
  { icon: MusicalNoteIcon, text: "One Jevah account — web and the app" },
];

export default function CreatorAuthShell({
  children,
  eyebrow = "Jevah Creator Studio",
  headline,
  blurb,
  features = DEFAULT_FEATURES,
  badge = "Creator",
}: {
  children: ReactNode;
  eyebrow?: string;
  headline: string;
  blurb: string;
  features?: Array<{
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    text: string;
  }>;
  badge?: string;
}) {
  return (
    <div
      className="auth-root flex h-dvh overflow-hidden font-sans antialiased transition-colors duration-300"
      style={{ backgroundColor: "var(--jevah-auth-root)" }}
    >
      <aside className="auth-promo relative hidden h-full w-[45%] shrink-0 flex-col justify-between overflow-hidden lg:flex xl:w-[42%]">
        <AuthPromoSlider />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1208] via-[#3D2A12]/80 to-[#0B1A1F]/55 backdrop-brightness-75"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(255,165,0,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(37,110,99,0.35), transparent 50%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col px-10 py-10 xl:px-12 xl:py-12">
          <div className="mb-auto mt-auto pt-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-100 backdrop-blur-md">
              <MusicalNoteIcon className="h-3.5 w-3.5 text-amber-300" />
              {eyebrow}
            </span>
            <h2 className="mt-5 text-[2.2rem] font-extrabold leading-[1.18] tracking-tight text-white drop-shadow-sm xl:text-[2.5rem]">
              {headline}
            </h2>
            <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-slate-200 drop-shadow-sm">
              {blurb}
            </p>
            <ul className="mt-8 space-y-3.5">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 ring-1 ring-amber-300/25 backdrop-blur-md">
                    <Icon className="h-3.5 w-3.5 text-amber-300" />
                  </span>
                  <span className="text-sm font-semibold text-white/90">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto border-t border-white/15 pt-6">
            <p className="text-xs font-semibold text-white/60">
              Jevah Creator Studio · Artists & ministers
            </p>
            <p className="mt-2 text-[11px] text-white/50">
              <Link
                to="/terms"
                className="font-semibold text-white/75 underline-offset-2 hover:text-white hover:underline"
              >
                Terms & Conditions
              </Link>
              <span className="mx-1.5 text-white/30">·</span>
              <Link
                to="/privacy"
                className="font-semibold text-white/75 underline-offset-2 hover:text-white hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </aside>

      <div className="auth-form-panel jevah-auth-form flex min-w-0 flex-1 flex-col overflow-y-auto border-l border-jevah-border transition-colors duration-300">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-jevah-border bg-[var(--jevah-auth-form-bg)]/95 px-3 py-3 backdrop-blur-sm xs:px-5 xs:py-4">
          <Link
            to="/creators"
            className="inline-flex rounded-xl bg-jevah-elevated px-2.5 py-1.5 ring-1 ring-jevah-border lg:hidden"
          >
            <JevahLogo width={88} height={40} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <span className="rounded-full bg-[var(--jevah-auth-creator-accent)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
              {badge}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-3 py-8 xs:px-5 xs:py-10 sm:px-8 md:px-12 lg:px-14 xl:px-16">
          <div className="w-full max-w-[420px]">
            <div className="mb-6 hidden lg:flex lg:items-center lg:justify-between">
              <Link
                to="/creators"
                className="inline-flex rounded-2xl bg-jevah-elevated px-3.5 py-2 ring-1 ring-jevah-border transition hover:opacity-90"
              >
                <JevahLogo width={108} height={48} />
              </Link>
              <ThemeToggle variant="icon" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
