import { useCallback, useEffect, useState } from "react";
import {
  fetchMyMarketingEmail,
  patchMyMarketingEmail,
} from "../services/marketingEmail";
import { ApiError } from "../lib/api";
import { useFeedback } from "./admin/Feedback";
import { cn } from "./admin/ui";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

/** Per-user product & marketing email preference (GET/PATCH /me/marketing-email). */
export default function MarketingEmailPrefsCard() {
  const { toast } = useFeedback();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const prefs = await fetchMyMarketingEmail();
      setEnabled(prefs.enabled);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle() {
    const next = !enabled;
    setBusy(true);
    try {
      await patchMyMarketingEmail(next);
      setEnabled(next);
      toast.success(
        next ? "Marketing emails enabled" : "Marketing emails disabled"
      );
    } catch (err) {
      toast.error(
        "Could not update preference",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  if (unavailable && !loading) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
          <EnvelopeIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-jevah-text">
            Product &amp; marketing emails
          </h2>
          <p className="mt-1 text-xs text-jevah-text-muted">
            News, tips, and product updates. Security and account emails are
            always sent. You can also unsubscribe from any marketing message
            footer.
          </p>
        </div>
        <button
          type="button"
          disabled={loading || busy}
          onClick={() => void toggle()}
          aria-pressed={enabled}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition",
            enabled ? "bg-jevah-accent" : "bg-jevah-border"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
