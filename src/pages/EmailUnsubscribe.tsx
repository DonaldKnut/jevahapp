import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  confirmUnsubscribe,
  getUnsubscribeStatus,
} from "../services/marketingEmail";
import { ApiError } from "../lib/api";
import JevahLogo from "../components/JevahLogo";
import ThemeToggle from "../components/ThemeToggle";

type Phase = "loading" | "ready" | "done" | "error" | "missing";

export default function EmailUnsubscribe() {
  const [params] = useSearchParams();
  const token = (params.get("token") || "").trim();
  const [phase, setPhase] = useState<Phase>(token ? "loading" : "missing");
  const [message, setMessage] = useState(
    "Confirm below to stop product & marketing emails from Jevah."
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    void (async () => {
      try {
        const res = await getUnsubscribeStatus(token);
        if (!alive) return;
        const data =
          res && typeof res === "object"
            ? ((res as { data?: Record<string, unknown> }).data ??
              (res as Record<string, unknown>))
            : {};
        const enabled = (data as { enabled?: boolean }).enabled;
        if (enabled === false) {
          setPhase("done");
          setMessage("You’re already unsubscribed from marketing emails.");
        } else {
          setPhase("ready");
        }
      } catch {
        if (!alive) return;
        // Status GET is optional — still allow confirm.
        setPhase("ready");
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  async function onConfirm() {
    if (!token) return;
    setBusy(true);
    try {
      await confirmUnsubscribe(token);
      setPhase("done");
      setMessage(
        "You’re unsubscribed. You won’t receive product & marketing emails. Transactional mail (security, receipts) may still arrive."
      );
    } catch (err) {
      setPhase("error");
      setMessage(
        err instanceof ApiError
          ? err.message
          : "We couldn’t complete unsubscribe. The link may have expired."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-jevah-bg font-sans text-jevah-text antialiased">
      <header className="flex items-center justify-between border-b border-jevah-border px-4 py-3 sm:px-6">
        <Link to="/" className="inline-flex rounded-xl bg-white px-2 py-1 shadow-sm">
          <JevahLogo width={72} height={30} />
        </Link>
        <ThemeToggle variant="icon" />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-jevah-border bg-jevah-surface p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-jevah-accent">
            Email preferences
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">
            Unsubscribe
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-jevah-text-muted">
            {message}
          </p>

          {phase === "loading" && (
            <p className="mt-6 text-sm text-jevah-text-muted">Checking link…</p>
          )}

          {phase === "missing" && (
            <p className="mt-6 text-sm text-rose-600">
              Missing unsubscribe token. Open the link from your email, or
              manage preferences in the app after signing in.
            </p>
          )}

          {phase === "ready" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onConfirm()}
              className="mt-6 w-full rounded-2xl bg-jevah-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-jevah-accent-hover disabled:opacity-60"
            >
              {busy ? "Unsubscribing…" : "Confirm unsubscribe"}
            </button>
          )}

          {(phase === "done" || phase === "error") && (
            <Link
              to="/"
              className="mt-6 inline-flex text-sm font-bold text-jevah-accent hover:underline"
            >
              Back to Jevah
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
