import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { forgotPasswordRequest } from "../../services/authApi";
import CreatorAuthShell from "./components/CreatorAuthShell";

const FEATURES = [
  { icon: EnvelopeIcon, text: "We email a reset link if the account exists" },
  { icon: ShieldCheckIcon, text: "Same password rules as signup" },
];

export default function CreatorForgot() {
  useDocumentMeta({
    title: "Reset your Jevah password",
    description: "Request a password reset link for your Jevah creator account.",
    canonicalPath: "/creators/forgot",
  });

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await forgotPasswordRequest(trimmed);
    } catch {
      /* always show success — do not leak whether the email exists */
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <CreatorAuthShell
      headline="We’ll send a reset if that inbox is ours."
      blurb="Forgot the password? Same Jevah account — web and the app."
      features={FEATURES}
      badge="Reset"
    >
      <h1 className="text-[1.85rem] font-extrabold tracking-tight text-jevah-text">
        Forgot password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
        Enter the email you use for Jevah. If an account exists, we send a reset
        link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-6">
          <p className="text-sm font-bold text-jevah-text">Check your email</p>
          <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
            If an account needs a reset, we sent a link. It may take a minute.
          </p>
          <Link
            to="/creators/login"
            className="mt-4 inline-flex text-sm font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-jevah-text">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ministry.com"
              className="jevah-marketing-input"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit-btn w-full rounded-xl bg-[var(--jevah-auth-creator-accent)] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-jevah-text-muted">
        Remembered it?{" "}
        <Link
          to="/creators/login"
          className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </CreatorAuthShell>
  );
}
