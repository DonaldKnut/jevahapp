import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  previewArtistOnboardCount,
  sendArtistOnboardEmail,
  type ArtistOnboardSegment,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import { unwrapData } from "../../lib/api/unwrap";
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
  CheckCircleIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import EmailComposeTabs from "./components/EmailComposeTabs";

const SEGMENTS: {
  value: ArtistOnboardSegment;
  label: string;
  hint: string;
}[] = [
  {
    value: "active_missing_onboard",
    label: "Approved artists who haven’t gotten this email yet",
    hint: "Best default — catches people you activated without inviting.",
  },
  {
    value: "active",
    label: "All approved artists",
    hint: "Everyone currently live, even if they already got an invite.",
  },
  {
    value: "pending",
    label: "Artists still waiting for approval",
    hint: "Applications that are not approved yet.",
  },
  {
    value: "artistIds",
    label: "Pick specific artists",
    hint: "Paste artist IDs from the Artists page.",
  },
  {
    value: "userIds",
    label: "Pick specific accounts",
    hint: "Paste user IDs if you have them.",
  },
  {
    value: "emails",
    label: "Send to email addresses",
    hint: "One address per line (or commas).",
  },
];

function resultSummary(payload: unknown): string | undefined {
  const data = unwrapData(payload);
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const sent =
    (typeof o.sent === "number" && o.sent) ||
    (typeof o.queued === "number" && o.queued) ||
    (typeof o.accepted === "number" && o.accepted) ||
    (typeof o.count === "number" && o.count) ||
    null;
  if (sent == null) return undefined;
  return `${sent} artist${sent === 1 ? "" : "s"}`;
}

export default function ComposeArtistOnboardPage() {
  const { toast } = useFeedback();
  const [segment, setSegment] =
    useState<ArtistOnboardSegment>("active_missing_onboard");
  const [idsRaw, setIdsRaw] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testOnly, setTestOnly] = useState(true);
  const [preview, setPreview] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
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

  const segmentMeta = SEGMENTS.find((s) => s.value === segment);

  useEffect(() => {
    setPreview(null);
    setLastResult(null);
  }, [segment, idsRaw, emailsRaw]);

  function validateWho() {
    if (segment === "artistIds" && ids.length === 0) {
      throw new Error("Add at least one artist ID.");
    }
    if (segment === "userIds" && ids.length === 0) {
      throw new Error("Add at least one account ID.");
    }
    if (segment === "emails" && emails.length === 0) {
      throw new Error("Add at least one email address.");
    }
  }

  async function runPreview() {
    setBusy(true);
    setError(null);
    try {
      validateWho();
      const count = await previewArtistOnboardCount({
        segment,
        artistIds: segment === "artistIds" ? ids : undefined,
        userIds: segment === "userIds" ? ids : undefined,
        emails: segment === "emails" ? emails : undefined,
        limit: 100,
      });
      setPreview(count);
      toast.success(
        count === 0 ? "Nobody in this list" : "Ready to send",
        count === 0
          ? "Try another audience."
          : `${count} artist${count === 1 ? "" : "s"} would get this email`
      );
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not check the list.";
      setError(msg);
      toast.error("Could not check the list", msg);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLastResult(null);
    try {
      validateWho();
      const res = await sendArtistOnboardEmail({
        segment,
        artistIds: segment === "artistIds" ? ids : undefined,
        userIds: segment === "userIds" ? ids : undefined,
        emails: segment === "emails" ? emails : undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        dryRun: testOnly,
        limit: 100,
      });
      const summary = resultSummary(res);
      setLastResult(
        testOnly
          ? summary
            ? `Test complete — would reach ${summary}.`
            : "Test complete — no real emails were sent."
          : summary
            ? `Invite sent to ${summary}.`
            : "Invite emails are on their way."
      );
      toast.success(
        testOnly ? "Test complete" : "Invites sent",
        summary || (testOnly ? "No real emails went out" : undefined)
      );
      if (!testOnly) setMessage("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Send failed.";
      setError(msg);
      toast.error("Could not send", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageEnter>
      <PageHeader
        title="Welcome artists"
        subtitle="Send a short invite so approved creators know how to open Studio and upload."
        badgeText="Invite"
        actions={
          <Link
            to="/admin/email/log"
            className="flex items-center gap-1.5 rounded-2xl border border-jevah-border bg-jevah-surface px-4 py-2 text-sm font-semibold text-jevah-text transition hover:border-jevah-accent hover:text-jevah-accent"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Past emails
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl space-y-5">
        <EmailComposeTabs active="/admin/email/artist-onboard" />

        <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm sm:p-6">
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
            {error && <Alert tone="error">{error}</Alert>}

            <div className="rounded-2xl border border-jevah-accent/25 bg-jevah-accent/5 px-4 py-3.5 text-sm text-jevah-text">
              <p className="font-semibold text-jevah-accent">What this is</p>
              <p className="mt-1 text-xs leading-relaxed text-jevah-text-muted">
                A welcome email for creators you approve. It is{" "}
                <span className="font-semibold text-jevah-text">
                  not a marketing blast
                </span>{" "}
                — people still get it even if they turned off promos. You can
                also send one when you activate someone on the Artists page.
              </p>
            </div>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-jevah-accent" />
                <h2 className="text-sm font-bold text-jevah-text">
                  1. Who should get it?
                </h2>
              </div>
              <div className="space-y-2">
                {SEGMENTS.map((s) => {
                  const on = segment === s.value;
                  return (
                    <label
                      key={s.value}
                      className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition ${
                        on
                          ? "border-jevah-accent bg-jevah-accent/10"
                          : "border-jevah-border bg-jevah-card/40 hover:border-jevah-accent/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="onboard-segment"
                        className="mt-1 h-4 w-4 border-jevah-border text-jevah-accent"
                        checked={on}
                        onChange={() => setSegment(s.value)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-jevah-text">
                          {s.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-jevah-text-muted">
                          {s.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {(segment === "artistIds" || segment === "userIds") && (
                <Field
                  label={
                    segment === "artistIds"
                      ? "Artist IDs"
                      : "Account (user) IDs"
                  }
                  helperText="Paste one per line, or separate with commas."
                >
                  <textarea
                    rows={3}
                    value={idsRaw}
                    onChange={(e) => setIdsRaw(e.target.value)}
                    className={`${inputClass} font-mono text-sm`}
                    placeholder="665f…&#10;666a…"
                  />
                </Field>
              )}

              {segment === "emails" && (
                <Field
                  label="Email addresses"
                  helperText="Paste one per line, or separate with commas."
                >
                  <textarea
                    rows={3}
                    value={emailsRaw}
                    onChange={(e) => setEmailsRaw(e.target.value)}
                    className={`${inputClass} text-sm`}
                    placeholder="artist@example.com"
                  />
                </Field>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-jevah-text">
                2. What should the email say?
              </h2>
              <Field
                label="Subject line"
                helperText="Leave blank to use: You're invited to create on Jevah"
              >
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                  placeholder="You're invited to create on Jevah"
                />
              </Field>
              <Field
                label="Short personal note"
                helperText="Optional. Shows inside the welcome email."
              >
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                  placeholder="Congrats — you're live. Open Studio and upload your first track."
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-jevah-text">
                3. Send safely
              </h2>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-400/35 bg-amber-400/10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={testOnly}
                  onChange={(e) => setTestOnly(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-jevah-border text-jevah-accent"
                />
                <span>
                  <span className="block text-sm font-bold text-amber-800 dark:text-amber-200">
                    Test first (recommended)
                  </span>
                  <span className="mt-0.5 block text-xs text-amber-700/80 dark:text-amber-300/70">
                    Counts who would get the email without sending anything.
                    Sends are capped at 100 people at a time.
                    {segmentMeta ? ` · ${segmentMeta.hint}` : ""}
                  </span>
                </span>
              </label>

              {preview != null && (
                <div className="flex items-center gap-2 rounded-2xl border border-jevah-border bg-jevah-card px-4 py-3 text-sm text-jevah-text">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-jevah-accent" />
                  <span>
                    <span className="font-bold">{preview}</span>{" "}
                    {preview === 1 ? "person" : "people"} in this list
                  </span>
                </div>
              )}

              {lastResult && (
                <Alert tone="success">{lastResult}</Alert>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => void runPreview()}
                >
                  Check how many
                </Button>
                <Button type="submit" disabled={busy} className="flex-1">
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {busy
                    ? "Working…"
                    : testOnly
                      ? "Run test"
                      : "Send welcome emails"}
                </Button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </PageEnter>
  );
}
