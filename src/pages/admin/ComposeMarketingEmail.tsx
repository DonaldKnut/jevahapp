import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  previewMarketingCount,
  sendMarketingEmail,
  type MarketingSegment,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  PageEnter,
  inputClass,
  cn,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import {
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import EmailComposeTabs from "./components/EmailComposeTabs";

const ROLE_OPTIONS = [
  "learner",
  "parent",
  "educator",
  "artist",
  "content_creator",
  "church_admin",
  "vendor",
] as const;

export default function ComposeMarketingEmailPage() {
  const { toast } = useFeedback();
  const [segment, setSegment] = useState<MarketingSegment>("all_opted_in");
  const [roles, setRoles] = useState<string[]>(["learner", "artist"]);
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [preview, setPreview] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIds = useMemo(
    () =>
      userIdsRaw
        .split(/[,;\n\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [userIdsRaw]
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
  }, [segment, roles, userIdsRaw, emailsRaw]);

  function toggleRole(role: string) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function runPreview() {
    setBusy(true);
    setError(null);
    try {
      if (segment === "role" && roles.length === 0) {
        throw new Error("Select at least one role.");
      }
      if (segment === "userIds" && userIds.length === 0) {
        throw new Error("Enter at least one user id.");
      }
      if (segment === "emails" && emails.length === 0) {
        throw new Error("Enter at least one email.");
      }
      const count = await previewMarketingCount({
        segment,
        roles:
          segment === "role" || segment === "all_opted_in"
            ? roles
            : undefined,
        userIds: segment === "userIds" ? userIds : undefined,
        emails: segment === "emails" ? emails : undefined,
      });
      setPreview(count);
      toast.success("Preview ready", `${count} opted-in recipient(s)`);
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (segment === "role" && roles.length === 0) {
        throw new Error("Select at least one role.");
      }
      if (segment === "userIds" && userIds.length === 0) {
        throw new Error("Enter at least one user id.");
      }
      if (segment === "emails" && emails.length === 0) {
        throw new Error("Enter at least one email.");
      }
      await sendMarketingEmail({
        subject: subject.trim(),
        message: message.trim(),
        segment,
        roles:
          segment === "role" || roles.length
            ? roles.length
              ? roles
              : undefined
            : undefined,
        userIds: segment === "userIds" ? userIds : undefined,
        emails: segment === "emails" ? emails : undefined,
        dryRun,
        limit: 500,
      });
      toast.success(
        dryRun ? "Marketing dry run complete" : "Marketing email queued",
        preview != null ? `${preview} in last preview` : undefined
      );
      if (!dryRun) {
        setSubject("");
        setMessage("");
      }
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
        title="Marketing email"
        subtitle="Only users with marketing enabled. Every send includes an Unsubscribe footer."
        badgeText="Marketing"
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
        <EmailComposeTabs active="/admin/email/marketing" />

        <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm sm:p-6">
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <Alert tone="warning">
              Do not use this for password resets, security alerts, or artist
              onboard invites — use Ops or Artist onboard instead.
            </Alert>

            <Field label="Segment">
              <select
                value={segment}
                onChange={(e) =>
                  setSegment(e.target.value as MarketingSegment)
                }
                className={inputClass}
              >
                <option value="all_opted_in">All opted-in</option>
                <option value="role">By role (opted-in)</option>
                <option value="userIds">Specific user IDs (opted-in)</option>
                <option value="emails">Specific emails (platform users)</option>
              </select>
            </Field>

            {(segment === "all_opted_in" || segment === "role") && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                  Roles {segment === "role" ? "(required)" : "(optional filter)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const on = roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition",
                          on
                            ? "bg-jevah-accent/15 text-jevah-accent ring-jevah-accent/30"
                            : "bg-jevah-card text-jevah-text-muted ring-jevah-border"
                        )}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {segment === "userIds" && (
              <Field
                label="User IDs"
                helperText="Comma or newline separated"
              >
                <textarea
                  rows={3}
                  value={userIdsRaw}
                  onChange={(e) => setUserIdsRaw(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  placeholder="64f…"
                />
              </Field>
            )}

            {segment === "emails" && (
              <Field
                label="Emails"
                helperText="Must match platform users unless backend allowRawEmails"
              >
                <textarea
                  rows={3}
                  value={emailsRaw}
                  onChange={(e) => setEmailsRaw(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  placeholder="user@example.com"
                />
              </Field>
            )}

            <Field label="Subject">
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="New on Jevah this week"
              />
            </Field>

            <Field label="Message (plain text)">
              <textarea
                required
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} font-mono text-sm`}
                placeholder="Write the marketing body…"
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
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Count + log without sending. Cap 500.
                </p>
              </div>
            </label>

            {preview != null && (
              <div className="rounded-2xl border border-jevah-border/60 bg-jevah-card px-4 py-3 text-sm text-jevah-text">
                Preview count:{" "}
                <span className="font-bold">{preview}</span> opted-in
                recipient(s)
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
              <Button
                type="submit"
                disabled={busy || !subject.trim() || !message.trim()}
                className="flex-1"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {busy
                  ? "Working…"
                  : dryRun
                    ? "Run dry run"
                    : "Send marketing"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageEnter>
  );
}
