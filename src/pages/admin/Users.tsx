import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import AdminModal from "../../components/admin/AdminModal";
import { useFeedback } from "../../components/admin/Feedback";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { matchesSearch } from "../../lib/searchMatch";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

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

function mergeInspect(
  fallback: AdminUser,
  detail: Record<string, unknown> | null
): AdminUser {
  const nested =
    detail && typeof detail.user === "object" && detail.user
      ? (detail.user as Record<string, unknown>)
      : detail;
  if (!nested) return fallback;
  return {
    ...fallback,
    ...(nested as Partial<AdminUser>),
    id: String(nested.id || nested._id || fallback.id),
    email: String(nested.email || fallback.email),
    role: String(nested.role || fallback.role),
  };
}

function formatWhen(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

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
  const debouncedSearch = useDebouncedValue(search, 180);
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
  const [detailUser, setDetailUser] = useState<Record<string, unknown> | null>(null);
  const [inspectTarget, setInspectTarget] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const role = params.get("role") || "";
  const isBanned = params.get("isBanned");
  const presence = params.get("presence") || "";
  const page = Number(params.get("page") || "1");
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!loadedOnce.current) setLoading(true);
    setError(null);
    try {
      if (presence === "online" || presence === "offline") {
        const res = await fetchPresence({
          status: presence,
          page,
          limit: 20,
          search: debouncedSearch || undefined,
        });
        setUsers(res.users);
        setOnlineCount(res.onlineCount);
        setTotal(res.total ?? res.users.length);
      } else {
        const res = await fetchUsers({
          page,
          limit: 20,
          search: debouncedSearch || undefined,
          role: role || undefined,
          isBanned:
            isBanned === "true" ? true : isBanned === "false" ? false : undefined,
        });
        setUsers(res.users);
        setOnlineCount(res.onlineCount);
        setTotal(res.total ?? res.users.length);
      }
      loadedOnce.current = true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, presence, role, isBanned, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleUsers = useMemo(
    () =>
      users.filter((u) =>
        matchesSearch(search, [
          u.firstName,
          u.lastName,
          u.email,
          u.username,
          u.role,
          u.id,
        ])
      ),
    [users, search]
  );

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

  function toggleAll() {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
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
    setInspectTarget(user);
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
      setDetailUser(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeInspect() {
    setInspectTarget(null);
    setDetailUser(null);
  }

  async function toggleVerify(
    user: AdminUser,
    field: "isVerifiedArtist" | "isVerifiedCreator"
  ) {
    setBusy(true);
    try {
      await patchVerification(user.id, { [field]: !user[field] });
      setInspectTarget((prev) =>
        prev && prev.id === user.id ? { ...prev, [field]: !user[field] } : prev
      );
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
      setInspectTarget((prev) =>
        prev && prev.id === user.id ? { ...prev, isBanned: false } : prev
      );
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

  return (
    <PageEnter>
      <PageHeader
        title="User Management"
        subtitle={`Directory of registered platform members · ${onlineCount} active now · ${total} records`}
        badgeText="User Directory"
        back={{ to: "/admin", label: "Overview" }}
        actions={
          <Button
            disabled={selected.size === 0}
            onClick={() => setEmailOpen(true)}
            variant="primary"
          >
            <EnvelopeIcon className="h-4 w-4" />
            Email Selected ({selected.size})
          </Button>
        }
      />

      {/* ── Metric Summary Bar ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-jevah-border/80 bg-jevah-surface p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-text-muted">Total Accounts</p>
          <p className="mt-1 text-2xl font-black text-jevah-text">{total.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Online Now</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{onlineCount}</p>
        </div>
        <div className="rounded-2xl border border-jevah-accent/20 bg-jevah-accent/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-accent">Selected</p>
          <p className="mt-1 text-2xl font-black text-jevah-accent">{selected.size}</p>
        </div>
        <div className="rounded-2xl border border-jevah-border/80 bg-jevah-surface p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-text-muted">Super Admin</p>
          <p className="mt-1 truncate text-xs font-bold text-jevah-text">{SUPER_ADMIN_EMAIL}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <Panel>
        <form onSubmit={onSearch} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, role, numbers…"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
              className={`${inputClass} w-auto min-w-[140px]`}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
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
              className={`${inputClass} w-auto min-w-[140px]`}
            >
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="banned">Banned</option>
            </select>

            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </div>
        </form>
      </Panel>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {/* ── User Directory Table ── */}
      {loading ? (
        <SkeletonRows rows={6} />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="No user accounts match your current filter parameters."
          icon={UsersIcon}
        />
      ) : (
        <Panel padding={false} className="overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-jevah-border/60 bg-jevah-card/60 text-xs font-bold uppercase tracking-wider text-jevah-text-muted">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
                      checked={selected.size === users.length && users.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5">User Profile</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Role</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Presence</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Badges</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-right min-w-[280px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jevah-border/40">
                {visibleUsers.map((u) => {
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed User";
                  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
                  return (
                    <tr key={u.id} className="transition hover:bg-jevah-card/50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
                          checked={selected.has(u.id)}
                          onChange={() => toggle(u.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-xs font-black text-white shadow-sm">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-jevah-text truncate">{name}</p>
                              {isSuperAdminEmail(u.email) && <Badge tone="warning" size="sm">Master</Badge>}
                              {u.isBanned && <Badge tone="danger" size="sm">Banned</Badge>}
                            </div>
                            <p className="text-xs text-jevah-text-muted truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {isSuperAdmin && !isSuperAdminEmail(u.email) ? (
                          <select
                            value={u.role}
                            disabled={busy}
                            onChange={(e) => void changeRole(u, e.target.value)}
                            className="rounded-xl border border-jevah-border/80 bg-jevah-surface px-2.5 py-1 text-xs font-semibold capitalize shadow-sm focus:ring-2 focus:ring-jevah-accent/30"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-bold capitalize text-jevah-text-muted">{u.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <OnlineDot online={u.isOnline} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => void toggleVerify(u, "isVerifiedArtist")}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 transition ${
                              u.isVerifiedArtist
                                ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
                                : "bg-jevah-card text-jevah-text-muted ring-jevah-border"
                            }`}
                          >
                            Artist: {u.isVerifiedArtist ? "Verified" : "No"}
                          </button>
                          <button
                            onClick={() => void toggleVerify(u, "isVerifiedCreator")}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 transition ${
                              u.isVerifiedCreator
                                ? "bg-jevah-accent/10 text-jevah-accent ring-jevah-accent/20"
                                : "bg-jevah-card text-jevah-text-muted ring-jevah-border"
                            }`}
                          >
                            Creator: {u.isVerifiedCreator ? "Verified" : "No"}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busy}
                            onClick={() => void openDetail(u)}
                          >
                            Inspect
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
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
                              variant="success"
                              size="sm"
                              onClick={() => void doUnban(u)}
                            >
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={isSuperAdminEmail(u.email)}
                              onClick={() => setBanTarget(u)}
                            >
                              Ban
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ── Pagination Footer ── */}
      <div className="flex items-center justify-between border-t border-jevah-border/50 pt-4">
        <p className="text-xs font-semibold text-jevah-text-muted">
          Showing page {page} · {users.length} items
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("page", String(page - 1));
              setParams(next);
            }}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("page", String(page + 1));
              setParams(next);
            }}
          >
            Next
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AdminModal
        open={Boolean(banTarget)}
        onClose={() => setBanTarget(null)}
        title="Restrict account"
        subtitle={banTarget?.email}
        busy={busy}
        icon={<NoSymbolIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button variant="ghost" className="flex-1" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={busy}
              onClick={() => void submitBan()}
            >
              Confirm restriction
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Ban reason">
            <input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Violating Terms of Service"
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
          <label className="flex items-center gap-2.5 text-xs font-semibold text-jevah-text">
            <input
              type="checkbox"
              checked={revokeSessions}
              onChange={(e) => setRevokeSessions(e.target.checked)}
              className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
            />
            Sign them out of every device now
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(warnTarget)}
        onClose={() => setWarnTarget(null)}
        title="Send a warning"
        subtitle={warnTarget?.email}
        busy={busy}
        icon={<ExclamationTriangleIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
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
        }
      >
        <div className="space-y-4">
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
              placeholder="Please keep comments within community guidelines…"
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2.5 text-xs font-semibold text-jevah-text">
            <input
              type="checkbox"
              checked={warnEmail}
              onChange={(e) => setWarnEmail(e.target.checked)}
              className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
            />
            Also send to their email
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Email selected users"
        subtitle={`${selected.size} recipient${selected.size === 1 ? "" : "s"}`}
        busy={busy}
        size="lg"
        icon={<EnvelopeIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setEmailOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="users-bulk-email"
              className="flex-1"
              disabled={busy}
            >
              Send
            </Button>
          </div>
        }
      >
        <form id="users-bulk-email" onSubmit={sendEmail} className="space-y-4">
          <p className="truncate text-xs font-medium text-jevah-text-muted">
            {selectedEmails.join(", ") || "—"}
          </p>
          <Field label="Subject">
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Important updates regarding your Jevah account"
              className={inputClass}
            />
          </Field>
          <Field label="Message">
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear community member..."
              className={inputClass}
            />
          </Field>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(inspectTarget)}
        onClose={closeInspect}
        title="User profile"
        subtitle="Account, role, and verification"
        busy={busy || detailLoading}
        size="xl"
        icon={<ShieldCheckIcon className="h-5 w-5" />}
        footer={
          inspectTarget ? (
            <div className="flex flex-wrap gap-2.5">
              <Button variant="ghost" className="flex-1" onClick={closeInspect}>
                Close
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={busy || isSuperAdminEmail(inspectTarget.email)}
                onClick={() => {
                  setWarnTarget(inspectTarget);
                  setWarnSubject("Notice from Jevah");
                  setWarnMessage("");
                }}
              >
                Warn
              </Button>
              {inspectTarget.isBanned ? (
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => void doUnban(inspectTarget)}
                >
                  Unban
                </Button>
              ) : (
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={isSuperAdminEmail(inspectTarget.email)}
                  onClick={() => setBanTarget(inspectTarget)}
                >
                  Ban
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {inspectTarget && (
          <InspectBody
            user={mergeInspect(inspectTarget, detailUser)}
            loading={detailLoading}
            busy={busy}
            onToggleVerify={(field) => void toggleVerify(inspectTarget, field)}
          />
        )}
      </AdminModal>
    </PageEnter>
  );
}

function InspectBody({
  user,
  loading,
  busy,
  onToggleVerify,
}: {
  user: AdminUser;
  loading: boolean;
  busy: boolean;
  onToggleVerify: (field: "isVerifiedArtist" | "isVerifiedCreator") => void;
}) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-jevah-accent/20 bg-gradient-to-br from-jevah-accent/25 via-jevah-surface to-emerald-500/10 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(37,110,99,0.35), transparent 60%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent to-[#4ECDC4] text-lg font-black text-white shadow-lg ring-2 ring-white/30">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-lg font-black tracking-tight text-jevah-text">
                {name}
              </h4>
              {isSuperAdminEmail(user.email) && (
                <Badge tone="warning" size="sm">
                  Master
                </Badge>
              )}
              {user.isBanned && (
                <Badge tone="danger" size="sm">
                  Banned
                </Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-jevah-text-muted">
              {user.email}
            </p>
            {user.username ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-jevah-accent">
                @{user.username}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="brand" size="sm">
                {String(user.role).replace("_", " ")}
              </Badge>
              <OnlineDot online={user.isOnline} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-xs font-semibold text-jevah-text-muted">
          Loading latest profile…
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-jevah-border bg-jevah-card/50 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
            <ClockIcon className="h-3.5 w-3.5" /> Last seen
          </p>
          <p className="mt-1 text-sm font-bold text-jevah-text">
            {formatWhen(user.lastSeenAt || user.lastLoginAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-jevah-border bg-jevah-card/50 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
            <CheckBadgeIcon className="h-3.5 w-3.5" /> Email
          </p>
          <p className="mt-1 text-sm font-bold text-jevah-text">
            {user.isEmailVerified ? "Verified" : "Not verified"}
          </p>
        </div>
        <div className="rounded-2xl border border-jevah-border bg-jevah-card/50 p-3.5 sm:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
            Joined
          </p>
          <p className="mt-1 text-sm font-bold text-jevah-text">
            {formatWhen(user.createdAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-jevah-border bg-jevah-card/50 p-3.5 sm:col-span-2">
          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-jevah-text-muted">
            Verification
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleVerify("isVerifiedArtist")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                user.isVerifiedArtist
                  ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
                  : "bg-jevah-surface text-jevah-text-muted ring-jevah-border"
              }`}
            >
              Artist: {user.isVerifiedArtist ? "Verified" : "No"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleVerify("isVerifiedCreator")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                user.isVerifiedCreator
                  ? "bg-jevah-accent/15 text-jevah-accent ring-jevah-accent/30"
                  : "bg-jevah-surface text-jevah-text-muted ring-jevah-border"
              }`}
            >
              Creator: {user.isVerifiedCreator ? "Verified" : "No"}
            </button>
          </div>
        </div>
      </div>

      {user.isBanned && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200">
          <p className="font-bold">This account is banned</p>
          {user.banReason && (
            <p className="mt-1 text-xs opacity-90">{user.banReason}</p>
          )}
          {user.banUntil && (
            <p className="mt-1 text-xs opacity-80">Until {formatWhen(user.banUntil)}</p>
          )}
        </div>
      )}
    </div>
  );
}

