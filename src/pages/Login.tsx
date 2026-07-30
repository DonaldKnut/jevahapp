import { FormEvent, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JevahLogo from "../components/JevahLogo";
import {
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

type AuthVariant = "admin" | "creator";

const adminFeatures = [
  { icon: ShieldCheckIcon, text: "Full moderation & content controls" },
  { icon: SparklesIcon, text: "Live platform analytics & system health" },
  { icon: CheckBadgeIcon, text: "Artist verification & audio approvals" },
  { icon: StarIcon, text: "Church & community administration" },
];

const creatorFeatures = [
  { icon: MusicalNoteIcon, text: "Upload & publish to the Artists shelf" },
  { icon: MicrophoneIcon, text: "Shape your public gospel artist profile" },
  { icon: ChartBarIcon, text: "Track processing status & catalog health" },
  { icon: SparklesIcon, text: "Reach listeners beside curated worship beds" },
];

function resolveVariant(
  pathname: string,
  searchIntent: string | null,
  stateIntent?: string,
  from?: string
): AuthVariant {
  if (pathname.startsWith("/creators/login")) return "creator";
  if (stateIntent === "creator" || searchIntent === "creator") return "creator";
  if (from?.startsWith("/creators")) return "creator";
  return "admin";
}

export default function Login() {
  const { login, isAdmin, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  const state = location.state as { from?: string; intent?: string } | null;
  const from = state?.from || "";

  const variant = resolveVariant(
    location.pathname,
    search.get("intent"),
    state?.intent,
    from
  );
  const isCreator = variant === "creator";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const defaultRedirect = useMemo(() => {
    const dest =
      from ||
      search.get("from") ||
      (isCreator ? "/creators/studio" : "/admin");
    if (isCreator) {
      return dest.startsWith("/creators") ? dest : "/creators/studio";
    }
    return dest.startsWith("/admin") ? dest : "/admin";
  }, [from, isCreator, search]);

  // Canonicalize creator auth URL (keeps bookmarks & intent query working)
  if (
    isCreator &&
    location.pathname === "/login" &&
    (search.get("intent") === "creator" ||
      state?.intent === "creator" ||
      from.startsWith("/creators"))
  ) {
    return (
      <Navigate
        to="/creators/login"
        replace
        state={{ from: from || "/creators/studio", intent: "creator" }}
      />
    );
  }

  if (!loading && isAuthenticated) {
    if (isCreator || from.startsWith("/creators")) {
      return <Navigate to={defaultRedirect} replace />;
    }
    if (isAdmin) {
      return (
        <Navigate
          to={from.startsWith("/admin") ? from : "/admin"}
          replace
        />
      );
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email.trim(), password, rememberMe, {
      requireAdmin: !isCreator,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(defaultRedirect, { replace: true });
  }

  const features = isCreator ? creatorFeatures : adminFeatures;

  return (
    <div
      className={`auth-root flex h-dvh overflow-hidden font-sans antialiased ${
        isCreator ? "bg-[#140F0A]" : "bg-[#060E18]"
      }`}
    >
      {/* ── LEFT PROMO ─────────────────────────────────────────────── */}
      <aside className="auth-promo relative hidden h-full w-[45%] shrink-0 flex-col justify-between overflow-hidden lg:flex xl:w-[42%]">
        <img
          src={
            isCreator
              ? "https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
              : "https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
          }
          alt={isCreator ? "Jevah Creator Studio" : "Jevah Admin"}
          className={`absolute inset-0 h-full w-full object-cover object-center ${
            isCreator ? "scale-105 brightness-90 saturate-110" : ""
          }`}
        />

        <div
          className={`pointer-events-none absolute inset-0 backdrop-brightness-75 ${
            isCreator
              ? "bg-gradient-to-t from-[#1A1208] via-[#3D2A12]/80 to-[#0B1A1F]/55"
              : "bg-gradient-to-t from-[#060E18] via-[#0F3832]/85 to-[#0B1A1F]/70"
          }`}
          aria-hidden
        />

        {isCreator && (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(255,165,0,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(37,110,99,0.35), transparent 50%)",
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col px-10 py-10 xl:px-12 xl:py-12">
          <div className="mb-auto mt-auto pt-16">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md ${
                isCreator
                  ? "border border-amber-400/35 bg-amber-500/20 text-amber-100"
                  : "border border-emerald-400/30 bg-[#256E63]/30 text-emerald-200"
              }`}
            >
              {isCreator ? (
                <MusicalNoteIcon className="h-3.5 w-3.5 text-amber-300" />
              ) : (
                <LockClosedIcon className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {isCreator ? "Jevah Creator Studio" : "Jevah Admin Console"}
            </span>

            <h2 className="mt-5 text-[2.2rem] font-extrabold leading-[1.18] tracking-tight text-white drop-shadow-sm xl:text-[2.5rem]">
              {isCreator
                ? "Share gospel music with listeners who are already listening."
                : "Steward the platform with clarity & conviction."}
            </h2>

            <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-slate-200 drop-shadow-sm">
              {isCreator
                ? "Sign in to apply, manage your artist profile, and publish tracks to the Artists shelf — separate from admin controls."
                : "Official administration console for managing audio streams, user accounts, moderation queues, and platform health."}
            </p>

            <ul className="mt-8 space-y-3.5">
              {features.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg backdrop-blur-md ring-1 ${
                      isCreator
                        ? "bg-amber-400/15 ring-amber-300/25"
                        : "bg-white/10 ring-white/20"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isCreator ? "text-amber-300" : "text-[#4ECDC4]"
                      }`}
                    />
                  </span>
                  <span className="text-sm font-semibold text-white/90 drop-shadow-sm">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto">
            <div className="border-t border-white/15 pt-6">
              <p className="text-xs font-semibold text-white/60">
                {isCreator
                  ? "Jevah Creator Studio · Artists & ministers"
                  : "Jevah Admin Portal · Authorized Personnel Only"}
              </p>
              <p className="mt-1 text-[10px] text-white/40">
                © {new Date().getFullYear()} Jevah. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT FORM ─────────────────────────────────────────────── */}
      <div
        className={`auth-form-panel flex min-w-0 flex-1 flex-col overflow-y-auto ${
          isCreator ? "bg-[#FFFBF5]" : "bg-white"
        }`}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur-sm lg:hidden ${
            isCreator
              ? "border-amber-100/80 bg-[#FFFBF5]/95"
              : "border-slate-100 bg-white/95"
          }`}
        >
          <Link
            to={isCreator ? "/creators" : "/"}
            className="inline-flex rounded-xl bg-white/80 px-2.5 py-1.5 ring-1 ring-slate-100"
          >
            <JevahLogo width={88} height={40} />
          </Link>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white ${
              isCreator ? "bg-amber-600" : "bg-[#256E63]"
            }`}
          >
            {isCreator ? "Creator Studio" : "Admin Portal"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 md:px-12 lg:px-14 xl:px-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-6 hidden lg:block">
              <Link
                to={isCreator ? "/creators" : "/"}
                className="inline-flex rounded-2xl bg-white px-3.5 py-2 ring-1 ring-slate-200/70 transition hover:bg-slate-50"
              >
                <JevahLogo width={108} height={48} />
              </Link>
            </div>

            <div
              className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${
                isCreator
                  ? "bg-amber-50 text-amber-800 ring-amber-200/80"
                  : "bg-emerald-50 text-[#256E63] ring-[#256E63]/20"
              }`}
            >
              {isCreator ? (
                <MusicalNoteIcon className="h-3.5 w-3.5 text-amber-700" />
              ) : (
                <LockClosedIcon className="h-3.5 w-3.5 text-[#256E63]" />
              )}
              {isCreator ? "Creator Studio Sign In" : "Admin Portal Sign In"}
            </div>

            <h1 className="text-[1.85rem] font-extrabold tracking-tight text-[#0B1A1F]">
              {isCreator ? "Welcome back, creator" : "Sign In to Admin"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {isCreator
                ? "Use your Jevah account to open the studio, continue an application, or manage your catalog."
                : "Enter your administrator credentials to access platform controls and management dashboards."}
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700"
              >
                <span className="mt-0.5 shrink-0 text-rose-500">⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  {isCreator ? "Email Address" : "Admin Email Address"}
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isCreator ? "you@ministry.com" : "admin@jevahapp.com"
                  }
                  className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                    isCreator
                      ? "border-amber-200/80 focus:border-amber-500 focus:ring-amber-500/15"
                      : "border-slate-200 bg-slate-50/60 focus:border-[#256E63] focus:ring-[#256E63]/15"
                  }`}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-white/80 px-4 py-3 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                      isCreator
                        ? "border-amber-200/80 focus:border-amber-500 focus:ring-amber-500/15"
                        : "border-slate-200 bg-slate-50/60 focus:border-[#256E63] focus:ring-[#256E63]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <div className="relative flex">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition focus:ring-2 ${
                      isCreator
                        ? "checked:border-amber-600 checked:bg-amber-600 focus:ring-amber-500/20"
                        : "checked:border-[#256E63] checked:bg-[#256E63] focus:ring-[#256E63]/20"
                    }`}
                  />
                  <svg
                    className="pointer-events-none absolute inset-0 m-auto hidden h-2.5 w-2.5 text-white peer-checked:block"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5l3.5 3.5L11 1"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {isCreator ? "Keep me signed in" : "Remember admin session"}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className={`auth-submit-btn relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                  isCreator
                    ? "bg-amber-600 shadow-amber-600/25 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/30"
                    : "bg-[#256E63] shadow-[#256E63]/20 hover:bg-[#1e5a52] hover:shadow-lg hover:shadow-[#256E63]/30"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : isCreator ? (
                  "Enter Creator Studio"
                ) : (
                  "Sign In to Admin Console"
                )}
              </button>
            </form>

            <div className="mt-8 space-y-2 text-center text-xs text-slate-400">
              {isCreator ? (
                <>
                  <p>
                    Platform administrator?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-[#256E63] underline-offset-2 hover:underline"
                    >
                      Admin sign-in
                    </Link>
                  </p>
                  <p>
                    New here?{" "}
                    <Link
                      to="/creators"
                      className="font-bold text-amber-700 underline-offset-2 hover:underline"
                    >
                      Learn about Creator Studio
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Need Creator access instead?{" "}
                    <Link
                      to="/creators/login"
                      className="font-bold text-[#256E63] underline-offset-2 hover:underline"
                    >
                      Creator Studio sign-in
                    </Link>
                  </p>
                  <p>
                    Return to main{" "}
                    <Link
                      to="/"
                      className="font-bold text-[#256E63] underline-offset-2 hover:underline"
                    >
                      website
                    </Link>
                  </p>
                </>
              )}
            </div>

            <div className="mt-10 flex items-center justify-center gap-5 border-t border-slate-200/80 pt-6">
              {isCreator ? (
                <>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <MusicalNoteIcon className="h-3.5 w-3.5 text-amber-600" />
                    Artist catalog access
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 text-amber-600" />
                    Separate from admin
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-[#256E63]" />
                    Encrypted Admin Portal
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <LockClosedIcon className="h-3.5 w-3.5 text-[#256E63]" />
                    Role-based Security
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
