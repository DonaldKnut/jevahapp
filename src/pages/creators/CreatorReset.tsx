import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useFeedback } from "../../components/admin/Feedback";
import { toastApiError } from "../../lib/errors";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { resetPasswordRequest } from "../../services/authApi";
import { PASSWORD_HINT } from "../../lib/passwordPolicy";
import CreatorAuthShell from "./components/CreatorAuthShell";
import PasswordStrength from "./components/PasswordStrength";
import {
  fieldErrorsFromZod,
  resetPasswordSchema,
} from "./schemas/creatorSignup";

export default function CreatorReset() {
  useDocumentMeta({
    title: "Choose a new Jevah password",
    description: "Set a new password for your Jevah account.",
    canonicalPath: "/creators/reset",
  });

  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const token = search.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("Reset failed", "This reset link is missing a token. Request a new one.");
      return;
    }
    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      const fields = fieldErrorsFromZod(parsed.error);
      setFieldError(fields.password || PASSWORD_HINT);
      return;
    }
    setSubmitting(true);
    setFieldError(null);
    try {
      await resetPasswordRequest(token, parsed.data.password);
      toast.success("Password updated", "Sign in with your new password.");
      navigate("/creators/login", { replace: true });
    } catch (err) {
      toastApiError(toast, "Reset failed", err, "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreatorAuthShell
        headline="Pick a new password."
        blurb="Eight characters, a letter and a number. Then sign in to the studio."
        badge="Reset"
      >
        <h1 className="text-[1.85rem] font-extrabold tracking-tight text-jevah-text">
          New password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
          {PASSWORD_HINT}
        </p>

        {!token ? (
          <div className="mt-8 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-6">
            <p className="text-sm font-bold text-jevah-text">Link incomplete</p>
            <p className="mt-2 text-sm text-jevah-text-muted">
              Open the reset link from your email, or request a new one.
            </p>
            <Link
              to="/creators/forgot"
              className="mt-4 inline-flex text-sm font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-jevah-text">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldError(null);
                  }}
                  className="jevah-marketing-input pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-jevah-text-muted hover:bg-jevah-card"
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
              <PasswordStrength password={password} />
              {fieldError ? (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {fieldError}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn w-full rounded-xl bg-[var(--jevah-auth-creator-accent)] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-jevah-text-muted">
          <Link
            to="/creators/login"
            className="font-bold text-[var(--jevah-auth-creator-accent)] underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CreatorAuthShell>
  );
}
