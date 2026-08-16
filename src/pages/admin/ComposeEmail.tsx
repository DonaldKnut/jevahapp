import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  sendAdminEmail,
  listChurches,
  fetchUsers,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import type { AdminUser } from "../../types/admin";
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
  EnvelopeIcon,
  BuildingLibraryIcon,
  PaperAirplaneIcon,
  BeakerIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import UserRecipientPicker from "./components/UserRecipientPicker";
import ChurchRecipientPicker, {
  type ChurchOption,
} from "./components/ChurchRecipientPicker";
import EmailComposeTabs from "./components/EmailComposeTabs";
import EmailRichEditor from "../../components/admin/EmailRichEditor";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function ComposeEmailPage() {
  const { toast } = useFeedback();
  const [mode, setMode] = useState<"emails" | "churches">("emails");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const userQuery = useDebouncedValue(userSearch, 160);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [manualEmails, setManualEmails] = useState("");

  const [churchOptions, setChurchOptions] = useState<ChurchOption[]>([]);
  const [churchTotal, setChurchTotal] = useState(0);
  const [churchPage, setChurchPage] = useState(1);
  const [churchSearch, setChurchSearch] = useState("");
  const churchQuery = useDebouncedValue(churchSearch, 160);
  const [churchIds, setChurchIds] = useState<Set<string>>(new Set());
  const [churchesLoading, setChurchesLoading] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [html, setHtml] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (page: number, append: boolean, search: string) => {
      setUsersLoading(true);
      try {
        const res = await fetchUsers({
          page,
          limit: 50,
          search: search || undefined,
          isBanned: false,
        });
        const withEmail = res.users.filter((u) => Boolean(u.email));
        setUsers((prev) => (append ? [...prev, ...withEmail] : withEmail));
        setUserTotal(res.total ?? withEmail.length);
        setUserPage(page);
      } catch {
        if (!append) setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    },
    []
  );

  const loadChurches = useCallback(
    async (page: number, append: boolean, search: string) => {
      setChurchesLoading(true);
      try {
        const res = await listChurches({
          hasContactEmail: true,
          search: search || undefined,
          page,
          limit: 50,
        });
        const mapped = res.churches
          .map((c) => ({
            id: String(c.id || c._id || ""),
            name: String(c.name || "Church"),
            email: c.contactEmail ? String(c.contactEmail) : undefined,
          }))
          .filter((c) => c.id && c.email);
        setChurchOptions((prev) => (append ? [...prev, ...mapped] : mapped));
        setChurchTotal(res.total ?? mapped.length);
        setChurchPage(page);
      } catch {
        if (!append) setChurchOptions([]);
      } finally {
        setChurchesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadUsers(1, false, userQuery);
  }, [loadUsers, userQuery]);

  useEffect(() => {
    void loadChurches(1, false, churchQuery);
  }, [loadChurches, churchQuery]);

  const manualEmailList = useMemo(
    () =>
      manualEmails
        .split(/[,;\n\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [manualEmails]
  );

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedUserIds.has(u.id)),
    [users, selectedUserIds]
  );

  const allVisibleUsersSelected =
    users.length > 0 && users.every((u) => selectedUserIds.has(u.id));

  const allVisibleChurchesSelected =
    churchOptions.length > 0 &&
    churchOptions.every((c) => churchIds.has(c.id));

  function toggleUser(id: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleChurch(id: string) {
    setChurchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisibleUsers() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      users.forEach((u) => next.add(u.id));
      return next;
    });
  }

  function clearVisibleUsers() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      users.forEach((u) => next.delete(u.id));
      return next;
    });
  }

  async function selectAllUsersInDb() {
    setUsersLoading(true);
    try {
      const ids = new Set<string>();
      let page = 1;
      let totalPages = 1;
      do {
        const res = await fetchUsers({
          page,
          limit: 100,
          search: userQuery || undefined,
          isBanned: false,
        });
        res.users.forEach((u) => {
          if (u.email) ids.add(u.id);
        });
        totalPages = Math.max(1, res.totalPages || 1);
        if (page === 1) {
          setUsers(res.users.filter((u) => Boolean(u.email)));
          setUserTotal(res.total ?? ids.size);
        } else {
          setUsers((prev) => {
            const map = new Map(prev.map((u) => [u.id, u]));
            res.users.forEach((u) => {
              if (u.email) map.set(u.id, u);
            });
            return Array.from(map.values());
          });
        }
        page += 1;
      } while (page <= totalPages && page <= 50);
      setSelectedUserIds(ids);
      toast.success(
        "All users selected",
        `${ids.size} recipient${ids.size === 1 ? "" : "s"} from directory`
      );
    } catch (err) {
      toast.error(
        "Could not load all users",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setUsersLoading(false);
    }
  }

  function selectAllVisibleChurches() {
    setChurchIds((prev) => {
      const next = new Set(prev);
      churchOptions.forEach((c) => next.add(c.id));
      return next;
    });
  }

  function clearVisibleChurches() {
    setChurchIds((prev) => {
      const next = new Set(prev);
      churchOptions.forEach((c) => next.delete(c.id));
      return next;
    });
  }

  async function selectAllChurchesInDb() {
    setChurchesLoading(true);
    try {
      const ids = new Set<string>();
      const all: ChurchOption[] = [];
      let page = 1;
      let keepGoing = true;
      while (keepGoing && page <= 50) {
        const res = await listChurches({
          hasContactEmail: true,
          search: churchQuery || undefined,
          page,
          limit: 100,
        });
        const mapped = res.churches
          .map((c) => ({
            id: String(c.id || c._id || ""),
            name: String(c.name || "Church"),
            email: c.contactEmail ? String(c.contactEmail) : undefined,
          }))
          .filter((c) => c.id && c.email);
        mapped.forEach((c) => {
          ids.add(c.id);
          all.push(c);
        });
        const total = res.total ?? all.length;
        keepGoing = all.length < total && mapped.length > 0;
        page += 1;
      }
      setChurchOptions(all);
      setChurchTotal(ids.size);
      setChurchIds(ids);
      toast.success(
        "All churches selected",
        `${ids.size} contact${ids.size === 1 ? "" : "s"}`
      );
    } catch (err) {
      toast.error(
        "Could not load all churches",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setChurchesLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "emails") {
        const userIds = Array.from(selectedUserIds);
        if (userIds.length === 0 && manualEmailList.length === 0) {
          throw new Error("Select at least one user or add a manual email.");
        }
        await sendAdminEmail({
          userIds: userIds.length ? userIds : undefined,
          emails: manualEmailList.length ? manualEmailList : undefined,
          subject,
          message: message || undefined,
          html: html || undefined,
          dryRun,
        });
        toast.success(
          dryRun ? "Dry run complete" : "Email queued",
          `${userIds.length + manualEmailList.length} recipient(s)`
        );
      } else {
        const ids = Array.from(churchIds);
        if (ids.length === 0) {
          throw new Error("Select at least one church.");
        }
        await sendAdminEmail({
          churchIds: ids,
          subject,
          message: message || undefined,
          html: html || undefined,
          dryRun,
        });
        toast.success(
          dryRun ? "Dry run complete" : "Email queued",
          `${ids.length} church(es)`
        );
      }
      if (!dryRun) {
        setSubject("");
        setMessage("");
        setHtml("");
        setManualEmails("");
        setSelectedUserIds(new Set());
        setChurchIds(new Set());
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to send email.";
      setError(msg);
      toast.error("Send failed", msg);
    } finally {
      setBusy(false);
    }
  }

  const recipientSummary =
    mode === "emails"
      ? `${selectedUserIds.size} user${selectedUserIds.size !== 1 ? "s" : ""}${
          manualEmailList.length
            ? ` + ${manualEmailList.length} manual`
            : ""
        }`
      : `${churchIds.size} church${churchIds.size !== 1 ? "es" : ""}`;

  const canSend =
    mode === "emails"
      ? selectedUserIds.size > 0 || manualEmailList.length > 0
      : churchIds.size > 0;

  return (
    <PageEnter>
      <PageHeader
        title="Compose Email"
        subtitle="Broadcast to users from the directory, or church contact emails — pick one by one or select all."
        badgeText="Email"
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
        <EmailComposeTabs active="/admin/email" />

        <div className="grid grid-cols-2 gap-2 rounded-3xl border border-jevah-border bg-jevah-card p-1.5">
          {(
            [
              {
                key: "emails" as const,
                label: "Users / emails",
                icon: EnvelopeIcon,
                desc: "Pick from directory or type addresses",
              },
              {
                key: "churches" as const,
                label: "Church contacts",
                icon: BuildingLibraryIcon,
                desc: "Send to church contact emails",
              },
            ] as const
          ).map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-2xl p-4 text-left transition",
                mode === key
                  ? "bg-jevah-surface shadow-sm"
                  : "text-jevah-text-muted hover:text-jevah-text"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn("h-5 w-5", mode === key && "text-jevah-accent")}
                />
                <span className="text-sm font-bold">{label}</span>
              </div>
              <span className="text-xs opacity-60">{desc}</span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm sm:p-6">
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            {mode === "emails" ? (
              <UserRecipientPicker
                users={users}
                userTotal={userTotal}
                userSearch={userSearch}
                selectedUserIds={selectedUserIds}
                selectedUsers={selectedUsers}
                usersLoading={usersLoading}
                manualEmails={manualEmails}
                allVisibleSelected={allVisibleUsersSelected}
                onUserSearchChange={setUserSearch}
                onSearch={() => void loadUsers(1, false, userSearch)}
                onToggleUser={toggleUser}
                onSelectVisible={selectAllVisibleUsers}
                onClearVisible={clearVisibleUsers}
                onSelectAllInDb={() => void selectAllUsersInDb()}
                onClearSelection={() => setSelectedUserIds(new Set())}
                onLoadMore={() =>
                  void loadUsers(userPage + 1, true, userQuery)
                }
                onManualEmailsChange={setManualEmails}
              />
            ) : (
              <ChurchRecipientPicker
                churchOptions={churchOptions}
                churchTotal={churchTotal}
                churchSearch={churchSearch}
                churchIds={churchIds}
                churchesLoading={churchesLoading}
                allVisibleSelected={allVisibleChurchesSelected}
                onChurchSearchChange={setChurchSearch}
                onSearch={() => void loadChurches(1, false, churchSearch)}
                onToggleChurch={toggleChurch}
                onSelectVisible={selectAllVisibleChurches}
                onClearVisible={clearVisibleChurches}
                onSelectAllInDb={() => void selectAllChurchesInDb()}
                onClearSelection={() => setChurchIds(new Set())}
                onLoadMore={() =>
                  void loadChurches(churchPage + 1, true, churchQuery)
                }
              />
            )}

            <Field label="Subject">
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="e.g. Important platform update"
              />
            </Field>

            <Field
              label="Message"
              helperText="Use the toolbar for bold, lists, links, and headings."
            >
              <EmailRichEditor
                value={html}
                disabled={busy}
                placeholder="Write your email here…"
                onChange={(nextHtml, plain) => {
                  setHtml(nextHtml);
                  setMessage(plain);
                }}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "h-5 w-9 rounded-full transition",
                    dryRun ? "bg-amber-500" : "bg-jevah-border"
                  )}
                />
                <div
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    dryRun ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  <BeakerIcon className="mr-1 inline h-4 w-4" />
                  Dry run mode
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Validates without actually sending. Safe to test.
                </p>
              </div>
            </label>

            {canSend && (
              <div className="rounded-2xl border border-jevah-border/60 bg-jevah-card px-4 py-3">
                <p className="text-sm text-jevah-text-muted">
                  Ready to send to{" "}
                  <span className="font-bold text-jevah-text">
                    {recipientSummary}
                  </span>
                  {dryRun && (
                    <span className="ml-1 font-semibold text-amber-500">
                      (dry run)
                    </span>
                  )}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                busy || !canSend || !subject.trim() || !message.trim()
              }
              className="w-full"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              {busy ? "Sending…" : dryRun ? "Run dry run" : "Send email"}
            </Button>
          </form>
        </div>
      </div>
    </PageEnter>
  );
}
