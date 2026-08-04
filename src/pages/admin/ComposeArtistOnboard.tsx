import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  previewArtistOnboardCount,
  sendArtistOnboardEmail,
  type ArtistOnboardSegment,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import {
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import EmailComposeTabs from "./components/EmailComposeTabs";

export default function ComposeArtistOnboardPage() {
  const { toast } = useFeedback();
  const [segment, setSegment] =
    useState<ArtistOnboardSegment>("active_missing_onboard");
  const [idsRaw, setIdsRaw] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [preview, setPreview] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ids = useMemo(
    () =>
      idsRaw
        .split(/[,;\n\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [idsRaw]
  );
  const emails = useMemo(
    () =>
      emailsRaw
        .split(/[,;\n\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [emailsRaw]
  );

  useEffect(() => {
    setPreview(null);
  }, [segment, idsRaw, emailsRaw]);

  async function runPreview() {
    setBusy(true);
    setError(null);
    try {
      validateSegment();
      const count = await previewArtistOnboardCount({
        segment,
        artistIds: segment === "artistIds" ? ids : undefined,
        userIds: segment === "userIds" ? ids : undefined,
        emails: segment === "emails" ? emails : undefined,
      });
      setPreview(count);
      toast.success("Preview ready", `${count} recipient(s)`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Preview failed.";
      setError(msg);
      toast.error("Preview failed", msg);
    } finally {
      setBusy(false);
    }
  }

  function validateSegment() {
    if (segment === "artistIds" && ids.length === 0) {
      throw new Error("Enter at least one artist id.");
    }
    if (segment === "userIds" && ids.length === 0) {
      throw new Error("Enter at least one user id.");
    }
    if (segment === "emails" && emails.length === 0) {
      throw new Error("Enter at least one email.");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      validateSegment();
      await sendArtistOnboardEmail({
        segment,
        artistIds: segment === "artistIds" ? ids : undefined,
        userIds: segment === "userIds" ? ids : undefined,
        emails: segment === "emails" ? emails : undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        dryRun,
        limit: 100,
      });
      toast.success(
        dryRun ? "Onboard dry run complete" : "Onboard email queued",
        preview != null ? `${preview} in last preview` : undefined
      );
      if (!dryRun) setMessage("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Send failed.";
      setError(msg);
      toast.error("Send failed", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageEnter>
      <PageHeader
        title="Artist onboard email"
        subtitle="Ops invite after activating a creator — not subject to marketing opt-out."
        badgeText="Onboard"
        actions={
          <Link
            to="/admin/email/log"
            className="flex items-center gap-1.5 rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2 text-sm font-semibold text-jevah-text transition hover:border-jevah-accent hover:text-jevah-accent"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Email Log
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl space-y-5">
        <EmailComposeTabs active="/admin/email/artist-onboard" />

        <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm sm:p-6">
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <Alert tone="warning">
              Default segment targets active artists who have not received an
              onboard email yet. You can also send when activating an artist
              (`sendOnboardEmail: true`).
            </Alert>

            <Field label="Segment">
              <select
                value={segment}
                onChange={(e) =>
                  setSegment(e.target.value as ArtistOnboardSegment)
                }
                className={inputClass}
              >
                <option value="active_missing_onboard">
                  Active · missing onboard email
                </option>
                <option value="active">All active artists</option>
                <option value="pending">Pending applications</option>
                <option value="artistIds">Specific artist IDs</option>
                <option value="userIds">Specific user IDs</option>
                <option value="emails">Specific emails</option>
              </select>
            </Field>

            {(segment === "artistIds" || segment === "userIds") && (
              <Field
                label={segment === "artistIds" ? "Artist IDs" : "User IDs"}
              >
                <textarea
                  rows={3}
                  value={idsRaw}
                  onChange={(e) => setIdsRaw(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                />
              </Field>
            )}

            {segment === "emails" && (
              <Field label="Emails">
                <textarea
                  rows={3}
                  value={emailsRaw}
                  onChange={(e) => setEmailsRaw(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                />
              </Field>
            )}

            <Field
              label="Subject (optional)"
              helperText="Default: You're invited to create on Jevah"
            >
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Personal note (optional)"
              helperText="Injected into the onboard template"
            >
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
                placeholder="Congrats — you're live on Music → Artists."
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
              />
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  <BeakerIcon className="mr-1 inline h-4 w-4" />
                  Dry run
                </p>
                <p className="text-xs text-amber-600/70">Cap 100 recipients.</p>
              </div>
            </label>

            {preview != null && (
              <div className="rounded-2xl border border-jevah-border/60 bg-jevah-card px-4 py-3 text-sm">
                Preview count: <span className="font-bold">{preview}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={busy}
                onClick={() => void runPreview()}
              >
                Preview count
              </Button>
              <Button type="submit" disabled={busy} className="flex-1">
                <PaperAirplaneIcon className="h-4 w-4" />
                {busy
                  ? "Working…"
                  : dryRun
                    ? "Run dry run"
                    : "Send onboard emails"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageEnter>
  );
}
