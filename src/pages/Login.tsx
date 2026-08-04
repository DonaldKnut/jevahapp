import { FormEvent, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../components/admin/Feedback";
import { ErrorToaster } from "../components/ErrorToaster";
import AuthPortalTabs from "../components/AuthPortalTabs";
import ThemeToggle from "../components/ThemeToggle";
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
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  const state = location.state as { from?: string; intent?: string } | null;
  const fromParam = search.get("from") || "";
  const from = state?.from || fromParam || "";

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
    const dest = from || (isCreator ? "/creators/studio" : "/admin");
    // Only allow in-app relative paths (block open redirects).
    if (!dest.startsWith("/") || dest.startsWith("//")) {
      return isCreator ? "/creators/studio" : "/admin";
    }
    if (isCreator) {
      return dest.startsWith("/creators") ? dest : "/creators/studio";
    }
    return dest.startsWith("/admin") ? dest : "/admin";
  }, [from, isCreator]);

  if (
    isCreator &&
    location.pathname === "/login" &&
    (search.get("intent") === "creator" ||
      state?.intent === "creator" ||
      from.startsWith("/creators"))
  ) {
    return (
      <Navigate
        to={`/creators/login?from=${encodeURIComponent(from || "/creators/studio")}&intent=creator`}
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
      return <Navigate to={defaultRedirect} replace />;
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
      toast.error("Sign in failed", result.error);
      return;
    }
    navigate(defaultRedirect, { replace: true });
  }

  const features = isCreator ? creatorFeatures : adminFeatures;
  const submitClass = isCreator
    ? "bg-[var(--jevah-auth-creator-accent)] shadow-black/20 hover:opacity-90"
    : "bg-jevah-accent shadow-jevah-accent/20 hover:bg-jevah-accent-hover";

  return (
    <>
      <ErrorToaster error={error} title="Sign in failed" />
      <div
        className="auth-root flex h-dvh overflow-hidden font-sans antialiased transition-colors duration-300"
        style={{ backgroundColor: "var(--jevah-auth-root)" }}
      >
        <aside className="auth-promo relative hidden h-full w-[45%] shrink-0 flex-col justify-between overflow-hidden lg:flex xl:w-[42%]">
          <img
            src="https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
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
                  ? "Sign in to apply, manage your artist profile, and publish tracks to the Artists shelf."
                  : "Official administration console for managing audio, users, moderation, and platform health."}
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
                    <span className="text-sm font-semibold text-white/90">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto border-t border-white/15 pt-6">
              <p className="text-xs font-semibold text-white/60">
                {isCreator
                  ? "Jevah Creator Studio · Artists & ministers"
                  : "Jevah Admin Portal · Authorized Personnel Only"}
              </p>
            </div>
          </div>
        </aside>

        <div className="auth-form-panel jevah-auth-form flex min-w-0 flex-1 flex-col overflow-y-auto border-l border-jevah-border transition-colors duration-300">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-jevah-border bg-[var(--jevah-auth-form-bg)]/95 px-5 py-4 backdrop-blur-sm">
            <Link
              to={isCreator ? "/creators" : "/"}
              className="inline-flex rounded-xl bg-jevah-elevated px-2.5 py-1.5 ring-1 ring-jevah-border lg:hidden"
            >
              <JevahLogo width={88} height={40} />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle variant="icon" />
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white ${
                  isCreator
                    ? "bg-[var(--jevah-auth-creator-accent)]"
                    : "bg-jevah-accent"
                }`}
              >
                {isCreator ? "Creator" : "Admin"}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 md:px-12 lg:px-14 xl:px-16">
            <div className="w-full max-w-[420px]">
              <div className="mb-6 hidden lg:flex lg:items-center lg:justify-between">
                <Link
                  to={isCreator ? "/creators" : "/"}
                  className="inline-flex rounded-2xl bg-jevah-elevated px-3.5 py-2 ring-1 ring-jevah-border transition hover:opacity-90"
                >
                  <JevahLogo width={108} height={48} />
                </Link>
                <ThemeToggle variant="icon" />
              </div>

              <AuthPortalTabs active={isCreator ? "creator" : "admin"} />

              <h1 className="text-[1.85rem] font-extrabold tracking-tight text-jevah-text">
                {isCreator ? "Welcome back, creator" : "Sign in to Admin"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                {isCreator
                  ? "Use your Jevah account to open the studio, continue an application, or manage your catalog."
                  : "Enter your administrator credentials to access platform controls and management dashboards."}
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-jevah-text">
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
                    className="jevah-marketing-input"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="jevah-marketing-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-jevah-border text-jevah-accent focus:ring-jevah-accent/20"
                  />
                  <span className="text-sm font-medium text-jevah-text-muted">
                    {isCreator ? "Keep me signed in" : "Remember admin session"}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`auth-submit-btn relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${submitClass}`}
                >
                  {submitting
                    ? "Signing in…"
                    : isCreator
                      ? "Enter Creator Studio"
                      : "Sign In to Admin Console"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-jevah-text-muted">
                {isCreator ? (
                  <>
                    New here?{" "}
                    <Link
                      to="/creators"
                      className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
                    >
                      Learn about Creator Studio
                    </Link>
                  </>
                ) : (
                  <>
                    Return to{" "}
                    <Link
                      to="/"
                      className="font-bold text-jevah-accent underline-offset-2 hover:underline"
                    >
                      main website
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
