import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../components/admin/Feedback";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  creatorDestination,
  needsEmailVerification,
  rememberVerifyEmail,
} from "../../lib/authNext";
import { registrationStatusRequest } from "../../services/authApi";
import CreatorAuthShell from "./components/CreatorAuthShell";
import PasswordStrength from "./components/PasswordStrength";
import CreatorAccountTooltip from "../../components/CreatorAccountTooltip";
import {
  parseCreatorSignup,
  type CreatorSignupFieldErrors,
  type CreatorSignupInput,
} from "./schemas/creatorSignup";

const FEATURES = [
  { icon: SparklesIcon, text: "Create one Jevah account — web and the app" },
  { icon: MusicalNoteIcon, text: "Then apply with your ministry name" },
  { icon: MicrophoneIcon, text: "Studio unlocks after a short review" },
];

export default function CreatorSignup() {
  useDocumentMeta({
    title: "Create a Jevah creator account",
    description:
      "Sign up for a Jevah account, verify your email, then apply to publish gospel music on the Artists shelf.",
    canonicalPath: "/creators/signup",
  });

  const { register, isAuthenticated, user, loading } = useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();

  const [values, setValues] = useState<CreatorSignupInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rememberMe: true,
  });
  const [fieldErrors, setFieldErrors] = useState<CreatorSignupFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paused, setPaused] = useState<{ on: boolean; message: string } | null>(
    null
  );

  useEffect(() => {
    let alive = true;
    registrationStatusRequest()
      .then((res) => {
        if (!alive) return;
        setPaused(
          res.registrationEnabled
            ? { on: false, message: "" }
            : {
                on: true,
                message:
                  res.message ||
                  "New accounts are paused. Sign in if you already have a Jevah account.",
              }
        );
      })
      .catch(() => {
        if (alive) setPaused({ on: false, message: "" });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && isAuthenticated && user) {
    if (needsEmailVerification(user)) {
      return <Navigate to="/creators/verify" replace />;
    }
    return <Navigate to={creatorDestination(user)} replace />;
  }

  function setField<K extends keyof CreatorSignupInput>(
    key: K,
    value: CreatorSignupInput[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseCreatorSignup(values);
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      toast.error(
        "Check your details",
        Object.values(parsed.errors)[0] || "Check the highlighted fields."
      );
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    const result = await register({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.rememberMe,
      source: "creators_web",
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.code === "REGISTRATION_DISABLED") {
        setPaused({
          on: true,
          message:
            result.error ||
            "New accounts are paused. Sign in if you already have a Jevah account.",
        });
        return;
      }
      if (result.code === "BANNED") {
        toast.error(
          "Account unavailable",
          "Contact support@jevahapp.com if you think that is a mistake."
        );
        return;
      }
      if (result.code === "EMAIL_TAKEN") {
        setFieldErrors({
          email: result.fields?.email || result.error,
          ...result.fields,
        });
        return;
      }
      setFieldErrors(result.fields || {});
      toast.error("Could not create account", result.error);
      return;
    }

    rememberVerifyEmail(result.user.email, result.user.firstName);
    const step = result.nextStep || result.user.nextStep;
    if (result.user.isEmailVerified === false || step === "verify_email") {
      navigate("/creators/verify", { replace: true });
      return;
    }
    navigate(creatorDestination(result.user), { replace: true });
  }

  return (
    <CreatorAuthShell
        headline="Start with a Jevah account. Apply next."
        blurb="Identity first — then your ministry name, genres, and review. Same email works in the app."
        features={FEATURES}
        badge="New"
      >
        <h1 className="text-[1.85rem] font-extrabold tracking-tight text-jevah-text">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
          Two minutes. Verify your email, then tell us who you are as a creator.
        </p>

        {paused === null ? (
          <div className="mt-10 flex justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--jevah-auth-creator-accent)] border-t-transparent" />
          </div>
        ) : paused.on ? (
          <div className="mt-8 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-6">
            <p className="text-sm font-bold text-jevah-text">
              Registration is paused
            </p>
            <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
              {paused.message}
            </p>
            <Link
              to="/creators/login"
              className="mt-4 inline-flex text-sm font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                  First name
                </label>
                <input
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className="jevah-marketing-input"
                  placeholder="Grace"
                />
                {fieldErrors.firstName ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">
                    {fieldErrors.firstName}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                  Last name
                </label>
                <input
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className="jevah-marketing-input"
                  placeholder="Okoye"
                />
                {fieldErrors.lastName ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">
                    {fieldErrors.lastName}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                className="jevah-marketing-input"
                placeholder="you@ministry.com"
              />
              {fieldErrors.email ? (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {fieldErrors.email}{" "}
                  {fieldErrors.email.toLowerCase().includes("already") ? (
                    <Link
                      to="/creators/login"
                      className="font-bold underline-offset-2 hover:underline"
                    >
                      Sign in
                    </Link>
                  ) : null}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="At least 8 characters"
                  className="jevah-marketing-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-jevah-text-muted transition hover:bg-jevah-card hover:text-jevah-text"
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
              <PasswordStrength password={values.password} />
              {fieldErrors.password ? (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={values.rememberMe}
                onChange={(e) => setField("rememberMe", e.target.checked)}
                className="h-4 w-4 rounded border-jevah-border text-[var(--jevah-auth-creator-accent)] focus:ring-amber-400/20"
              />
              <span className="text-sm font-medium text-jevah-text-muted">
                Keep me signed in
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn relative w-full overflow-hidden rounded-xl bg-[var(--jevah-auth-creator-accent)] py-3.5 text-sm font-bold text-white shadow-md shadow-black/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-jevah-text-muted">
              By creating an account you agree to Jevah’s{" "}
              <Link
                to="/terms"
                className="font-semibold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-semibold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-center text-xs text-jevah-text-muted">
          <span>
            Already have an account?{" "}
            <Link
              to="/creators/login"
              className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </span>
          <span className="text-jevah-text-muted/40">·</span>
          <CreatorAccountTooltip triggerText="Normal Jevah listener account?" />
        </div>
      </CreatorAuthShell>
  );
}
