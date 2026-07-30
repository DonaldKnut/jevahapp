import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  banUser,
  fetchPresence,
  fetchUsers,
  getAdminUser,
  patchUserRole,
  patchVerification,
  sendAdminEmail,
  unbanUser,
  warnUser,
} from "../../services/adminApi";
import type { AdminUser } from "../../types/admin";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  addToAdminLoginAllowlist,
  isSuperAdminEmail,
  removeFromAdminLoginAllowlist,
  SUPER_ADMIN_EMAIL,
} from "../../lib/superAdmin";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  OnlineDot,
  PageHeader,
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

const ROLES = [
  "learner",
  "artist",
  "content_creator",
  "vendor",
  "church_admin",
  "moderator",
  "admin",
  "educator",
  "parent",
];

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useFeedback();
  const [params, setParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(params.get("search") || "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(7);
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [warnTarget, setWarnTarget] = useState<AdminUser | null>(null);
  const [warnSubject, setWarnSubject] = useState("Notice from Jevah");
  const [warnMessage, setWarnMessage] = useState("");
  const [warnEmail, setWarnEmail] = useState(true);
  const [detailUser, setDetailUser] = useState<Record<string, unknown> | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const role = params.get("role") || "";
  const isBanned = params.get("isBanned");
  const presence = params.get("presence") || "";
  const page = Number(params.get("page") || "1");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (presence === "online" || presence === "offline") {
        const res = await fetchPresence({
          status: presence,
          page,
          limit: 20,
          search: search || undefined,
        });
        setUsers(res.users);
        setOnlineCount(res.onlineCount);
        setTotal(res.total ?? res.users.length);
      } else {
        const res = await fetchUsers({
          page,
          limit: 20,
          search: search || undefined,
          role: role || undefined,
          isBanned:
            isBanned === "true" ? true : isBanned === "false" ? false : undefined,
        });
        setUsers(res.users);
        setOnlineCount(res.onlineCount);
        setTotal(res.total ?? res.users.length);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, presence, role, isBanned, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedEmails = useMemo(
    () =>
      users
        .filter((u) => selected.has(u.id))
        .map((u) => u.email)
        .filter(Boolean),
    [users, selected]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search) next.set("search", search);
    else next.delete("search");
    next.set("page", "1");
    setParams(next);
  }

  async function submitBan() {
    if (!banTarget) return;
    setBusy(true);
    try {
      await banUser(banTarget.id, {
        reason: banReason || "Banned by admin",
        duration: banDays,
        revokeSessions,
      });
      toast.success(`Banned ${banTarget.email}`);
      setBanTarget(null);
      setBanReason("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ban failed.");
      toast.error("Ban failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function submitWarn() {
    if (!warnTarget) return;
    setBusy(true);
    try {
      await warnUser(warnTarget.id, {
        subject: warnSubject,
        message: warnMessage,
        sendEmail: warnEmail,
      });
      toast.success(`Warned ${warnTarget.email}`);
      setWarnTarget(null);
      setWarnMessage("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Warn failed.");
      toast.error("Warn failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function openDetail(user: AdminUser) {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const data = (await getAdminUser(user.id)) as Record<string, unknown>;
      setDetailUser(data);
    } catch (err) {
      toast.error(
        "Could not load user detail",
        err instanceof ApiError ? err.message : undefined
      );
      setDetailUser({
        user,
        note: "Detail endpoint unavailable — showing list card fields.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleVerify(
    user: AdminUser,
    field: "isVerifiedArtist" | "isVerifiedCreator"
  ) {
    setBusy(true);
    try {
      await patchVerification(user.id, { [field]: !user[field] });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(user: AdminUser, nextRole: string) {
    if (!isSuperAdmin) {
      setError("Only support@jevahapp.com can change roles.");
      return;
    }
    if (isSuperAdminEmail(user.email) && nextRole !== "admin") {
      setError("Cannot demote the master support account.");
      return;
    }
    setBusy(true);
    try {
      await patchUserRole(user.id, nextRole);
      if (nextRole === "admin") {
        addToAdminLoginAllowlist(user.email);
        toast.success(`${user.email} is now admin`, "They can log into the web console.");
      } else if (user.role === "admin") {
        removeFromAdminLoginAllowlist(user.email);
        toast.success(`${user.email} demoted`, "Web console access revoked.");
      } else {
        toast.success(`Role updated to ${nextRole}`);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Role update failed.");
      toast.error("Role update failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function doUnban(user: AdminUser) {
    setBusy(true);
    try {
      await unbanUser(user.id);
      toast.success(`Unbanned ${user.email}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unban failed.");
      toast.error("Unban failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sendAdminEmail({
        userIds: Array.from(selected),
        emails: selectedEmails,
        subject,
        message,
      });
      toast.success("Email sent");
      setEmailOpen(false);
      setSubject("");
      setMessage("");
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Email failed.");
      toast.error("Email failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  function UserCard({ u }: { u: AdminUser }) {
    const name =
      [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed user";
    return (
      <div className="rounded-2xl border border-jevah-border bg-jevah-surface p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={selected.has(u.id)}
            onChange={() => toggle(u.id)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-jevah-text">{name}</p>
              {isSuperAdminEmail(u.email) && <Badge tone="warning">Master</Badge>}
              {u.isBanned && <Badge tone="danger">Banned</Badge>}
            </div>
            <p className="truncate text-sm text-jevah-text-muted">{u.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <OnlineDot online={u.isOnline} />
              {isSuperAdmin && !isSuperAdminEmail(u.email) ? (
                <select
                  value={u.role}
                  disabled={busy}
                  onChange={(e) => void changeRole(u, e.target.value)}
                  className="rounded-lg border border-jevah-border px-2 py-1 text-xs capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs capitalize text-jevah-text-muted">{u.role}</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="min-h-9 px-3 text-xs"
                disabled={busy}
                onClick={() => void openDetail(u)}
              >
                Detail
              </Button>
              <Button
                variant="secondary"
                className="min-h-9 px-3 text-xs"
                disabled={busy}
                onClick={() => void toggleVerify(u, "isVerifiedArtist")}
              >
                Artist: {u.isVerifiedArtist ? "yes" : "no"}
              </Button>
              <Button
                variant="secondary"
                className="min-h-9 px-3 text-xs"
                disabled={busy}
                onClick={() => void toggleVerify(u, "isVerifiedCreator")}
              >
                Creator: {u.isVerifiedCreator ? "yes" : "no"}
              </Button>
              <Button
                variant="secondary"
                className="min-h-9 px-3 text-xs"
                disabled={busy || isSuperAdminEmail(u.email)}
                onClick={() => {
                  setWarnTarget(u);
                  setWarnSubject("Notice from Jevah");
                  setWarnMessage("");
                }}
              >
                Warn
              </Button>
              {u.isBanned ? (
                <Button
                  variant="primary"
                  className="min-h-9 px-3 text-xs"
                  onClick={() => void doUnban(u)}
                >
                  Unban
                </Button>
              ) : (
                <Button
                  variant="danger"
                  className="min-h-9 px-3 text-xs"
                  disabled={isSuperAdminEmail(u.email)}
                  onClick={() => setBanTarget(u)}
                >
                  Ban
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        subtitle={`${onlineCount} online · ${total} in this view${
          isSuperAdmin ? ` · Master: ${SUPER_ADMIN_EMAIL}` : ""
        }`}
        actions={
          <Button
            disabled={selected.size === 0}
            onClick={() => setEmailOpen(true)}
            className="w-full sm:w-auto"
          >
            Email selected ({selected.size})
          </Button>
        }
      />

      <Panel>
        <form onSubmit={onSearch} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className={inputClass}
          />
          <select
            value={role}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("role", e.target.value);
              else next.delete("role");
              next.delete("presence");
              next.set("page", "1");
              setParams(next);
            }}
            className={inputClass}
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={presence || (isBanned === "true" ? "banned" : "")}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.delete("isBanned");
              next.delete("presence");
              if (e.target.value === "online" || e.target.value === "offline") {
                next.set("presence", e.target.value);
              } else if (e.target.value === "banned") {
                next.set("isBanned", "true");
              }
              next.set("page", "1");
              setParams(next);
            }}
            className={inputClass}
          >
            <option value="">All status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="banned">Banned</option>
          </select>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>
      </Panel>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={5} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try another filter or search." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="admin-list-item"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <UserCard u={u} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("page", String(page - 1));
            setParams(next);
          }}
        >
          Previous
        </Button>
        <span className="px-2 text-sm text-jevah-text-muted">Page {page}</span>
        <Button
          variant="secondary"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("page", String(page + 1));
            setParams(next);
          }}
        >
          Next
        </Button>
      </div>

      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-jevah-surface p-6 shadow-xl sm:rounded-2xl">
            <h3 className="text-lg font-semibold">Ban {banTarget.email}</h3>
            <div className="mt-4 space-y-3">
              <Field label="Reason">
                <input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Duration (days)">
                <input
                  type="number"
                  min={1}
                  value={banDays}
                  onChange={(e) => setBanDays(Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-jevah-text-muted">
                <input
                  type="checkbox"
                  checked={revokeSessions}
                  onChange={(e) => setRevokeSessions(e.target.checked)}
                  className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
                />
                Revoke sessions (force logout)
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setBanTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={busy}
                onClick={() => void submitBan()}
              >
                Confirm ban
              </Button>
            </div>
          </div>
        </div>
      )}

      {warnTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-jevah-surface p-6 shadow-xl sm:rounded-2xl">
            <h3 className="text-lg font-semibold">Warn {warnTarget.email}</h3>
            <div className="mt-4 space-y-3">
              <Field label="Subject">
                <input
                  value={warnSubject}
                  onChange={(e) => setWarnSubject(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Message">
                <textarea
                  required
                  rows={4}
                  value={warnMessage}
                  onChange={(e) => setWarnMessage(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-jevah-text-muted">
                <input
                  type="checkbox"
                  checked={warnEmail}
                  onChange={(e) => setWarnEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
                />
                Also send email
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setWarnTarget(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={busy || !warnMessage.trim()}
                onClick={() => void submitWarn()}
              >
                Send warning
              </Button>
            </div>
          </div>
        </div>
      )}

      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={sendEmail}
            className="w-full max-w-lg rounded-t-3xl bg-jevah-surface p-6 shadow-xl sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">Compose email</h3>
            <p className="mt-1 text-xs text-jevah-text-muted">
              To: {selectedEmails.join(", ") || "—"}
            </p>
            <div className="mt-4 space-y-3">
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
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setEmailOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={busy}>
                Send
              </Button>
            </div>
          </form>
        </div>
      )}

      {(detailLoading || detailUser) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-jevah-surface p-6 shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">User detail</h3>
              <Button variant="ghost" onClick={() => setDetailUser(null)}>
                Close
              </Button>
            </div>
            {detailLoading ? (
              <p className="mt-6 text-sm text-jevah-text-muted">Loading…</p>
            ) : (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-jevah-muted p-3 text-[11px] leading-relaxed text-jevah-text">
                {JSON.stringify(detailUser, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
