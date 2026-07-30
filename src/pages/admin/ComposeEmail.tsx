import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { sendAdminEmail, listChurches } from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  Panel,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import { useEffect } from "react";

export default function ComposeEmailPage() {
  const { toast } = useFeedback();
  const [mode, setMode] = useState<"emails" | "churches">("emails");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [churchIds, setChurchIds] = useState<string[]>([]);
  const [churchOptions, setChurchOptions] = useState<
    Array<{ id: string; name: string; email?: string }>
  >([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listChurches({ hasContactEmail: true, limit: 100 })
      .then((res) => {
        setChurchOptions(
          res.churches.map((c) => ({
            id: String(c.id || c._id || ""),
            name: String(c.name || "Church"),
            email: c.contactEmail ? String(c.contactEmail) : undefined,
          })).filter((c) => c.id)
        );
      })
      .catch(() => setChurchOptions([]));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const emails = emailsRaw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await sendAdminEmail({
        emails: mode === "emails" ? emails : undefined,
        churchIds: mode === "churches" ? churchIds : undefined,
        subject,
        message,
        dryRun,
      });
      toast.success(
        dryRun ? "Dry run complete" : "Email queued",
        mode === "emails"
          ? `${emails.length} email(s)`
          : `${churchIds.length} church(es)`
      );
      if (!dryRun) {
        setSubject("");
        setMessage("");
        setEmailsRaw("");
        setChurchIds([]);
      }
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to send email.";
      setError(msg);
      toast.error("Send failed", msg);
    } finally {
      setBusy(false);
    }
  }

  function toggleChurch(id: string) {
    setChurchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Compose email"
        subtitle="Users by email or churches by contactEmail."
        actions={
          <Link
            to="/admin/email/log"
            className="text-sm font-semibold text-[#256E63] hover:underline"
          >
            View email log →
          </Link>
        }
      />

      <Panel>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("emails")}
            className={`rounded-lg py-2 text-sm font-medium ${
              mode === "emails" ? "bg-white shadow-sm" : "text-slate-500"
            }`}
          >
            Emails
          </button>
          <button
            type="button"
            onClick={() => setMode("churches")}
            className={`rounded-lg py-2 text-sm font-medium ${
              mode === "churches" ? "bg-white shadow-sm" : "text-slate-500"
            }`}
          >
            Churches
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          {mode === "emails" ? (
            <Field label="Recipients (emails, comma-separated)">
              <textarea
                required={mode === "emails"}
                rows={3}
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                className={inputClass}
                placeholder="user@example.com, another@jevahapp.com"
              />
            </Field>
          ) : (
            <Field label="Churches with contact email">
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {churchOptions.length === 0 ? (
                  <p className="text-xs text-slate-500">No churches with email.</p>
                ) : (
                  churchOptions.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={churchIds.includes(c.id)}
                        onChange={() => toggleChurch(c.id)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span>
                        {c.name}
                        {c.email ? (
                          <span className="block text-xs text-slate-400">
                            {c.email}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </Field>
          )}

          <Field label="Subject">
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Message">
            <textarea
              required
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#256E63]"
            />
            Dry run (no send)
          </label>

          <Button
            type="submit"
            disabled={
              busy ||
              (mode === "emails" ? !emailsRaw.trim() : churchIds.length === 0)
            }
            className="w-full"
          >
            {busy ? "Sending…" : dryRun ? "Run dry run" : "Send email"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
