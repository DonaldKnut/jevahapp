import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  EnvelopeIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../components/admin/Feedback";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import {
  creatorDestination,
  needsEmailVerification,
  readVerifyEmail,
  rememberVerifyEmail,
} from "../../lib/authNext";
import { resendVerificationRequest } from "../../services/authApi";
import CreatorAuthShell from "./components/CreatorAuthShell";
import OtpBoxes from "./components/OtpBoxes";

const FEATURES = [
  { icon: EnvelopeIcon, text: "We emailed a 6-digit code (about 12 minutes)" },
  { icon: SparklesIcon, text: "Five tries, then request a new code" },
  { icon: CheckBadgeIcon, text: "Then apply — ministry name comes next" },
];

export default function CreatorVerify() {
  useDocumentMeta({
    title: "Verify your Jevah email",
    description:
      "Enter the 6-digit code we sent to finish creating your Jevah account.",
    canonicalPath: "/creators/verify",
  });

  const { user, verifyEmail, refreshSession, isAuthenticated, loading } =
    useAuth();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const stored = readVerifyEmail();
  const email = (
    search.get("email") ||
    user?.email ||
    stored.email ||
    ""
  ).trim();
  const firstName = user?.firstName || stored.firstName || "";
  const status = search.get("status");

  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendWait, setResendWait] = useState(0);
  const [magicNote, setMagicNote] = useState<string | null>(null);

  const greeting = useMemo(
    () => (firstName ? `Welcome, ${firstName}` : "Check your inbox"),
    [firstName]
  );

  useEffect(() => {
    if (email) rememberVerifyEmail(email, firstName);
  }, [email, firstName]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = window.setTimeout(() => setResendWait((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendWait]);

  useEffect(() => {
    if (status !== "ok" && status !== "expired") return;
    let alive = true;
    (async () => {
      if (status === "expired") {
        if (alive) {
          setMagicNote("That link expired. Enter a new code or resend.");
        }
        return;
      }
      const ok = await refreshSession();
      if (!alive) return;
      if (ok) {
        navigate("/creators/apply", { replace: true });
        return;
      }
      setMagicNote(
        "You're verified. Sign in on this device to continue — mail may have opened on another phone."
      );
    })();
    return () => {
      alive = false;
    };
    // user is read after refresh; destination uses latest store on next render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!loading && isAuthenticated && user && !needsEmailVerification(user) && status !== "ok") {
    return <Navigate to={creatorDestination(user)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Verification", "Enter the 6-digit code from your email.");
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      return;
    }
    setSubmitting(true);
    const result = await verifyEmail({ code, email: email || undefined });
    setSubmitting(false);
    if (!result.ok) {
      if (result.code === "ALREADY_VERIFIED") {
        navigate("/creators/apply", { replace: true });
        return;
      }
      if (result.code === "INVALID_CODE" || result.code === "CODE_EXPIRED") {
        setShake(true);
        window.setTimeout(() => setShake(false), 600);
      }
      toast.error(
        "Verification",
        result.code === "CODE_EXPIRED"
          ? "That code expired. Resend a new one."
          : result.error
      );
      return;
    }
    toast.success("Email verified", "You can apply as a creator now.");
    navigate(creatorDestination(result.user), { replace: true });
  }

  async function onResend() {
    if (!email || resendWait > 0) return;
    try {
      const res = await resendVerificationRequest(email);
      const wait = res.retryAfterSec ?? 60;
      setResendWait(wait);
      toast.success("Code sent", res.message || "Check your inbox for a new code.");
    } catch {
      setResendWait(60);
      toast.success(
        "Code sent",
        "If an account needs verification, we sent a new code."
      );
    }
  }

  return (
    <CreatorAuthShell
        headline="One code. Then you apply."
        blurb="We sent a 6-digit code to your email. Studio comes after review — this step is just identity."
        features={FEATURES}
        badge="Verify"
      >
        <h1 className="text-[1.85rem] font-extrabold tracking-tight text-jevah-text">
          {greeting}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
          {email
            ? `Enter the code we sent to ${email}. It expires in about 12 minutes.`
            : "Enter the code from your email. If you opened mail on another device, you can sign in after verifying."}
        </p>

        {magicNote ? (
          <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-jevah-text">
            {magicNote}{" "}
            {magicNote.includes("Sign in") ? (
              <Link
                to="/creators/login"
                className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <OtpBoxes
            value={code}
            onChange={(next) => {
              setCode(next);
            }}
            disabled={submitting}
            shake={shake}
          />

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="auth-submit-btn relative w-full overflow-hidden rounded-xl bg-[var(--jevah-auth-creator-accent)] py-3.5 text-sm font-bold text-white shadow-md shadow-black/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-jevah-text-muted">
          {resendWait > 0 ? (
            <span>Resend a new code in {resendWait}s</span>
          ) : (
            <button
              type="button"
              onClick={() => void onResend()}
              disabled={!email}
              className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline disabled:opacity-50"
            >
              Resend a new code
            </button>
          )}
        </p>

        {!email ? (
          <p className="mt-4 text-center text-xs text-jevah-text-muted">
            Missing your email?{" "}
            <Link
              to="/creators/signup"
              className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              Create an account
            </Link>{" "}
            or{" "}
            <Link
              to="/creators/login"
              className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              sign in
            </Link>
            .
          </p>
        ) : (
          <p className="mt-4 text-center text-xs text-jevah-text-muted">
            Wrong email?{" "}
            <Link
              to="/creators/signup"
              className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              Start over
            </Link>
          </p>
        )}
      </CreatorAuthShell>
  );
}
