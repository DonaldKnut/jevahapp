import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createArtist,
  listArtists,
  patchArtist,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  SkeletonRows,
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import AdminModal from "../../components/admin/AdminModal";
import { useFeedback } from "../../components/admin/Feedback";
import {
  MicrophoneIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

type Artist = {
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  status?: string;
  isVerified?: boolean;
  isVerifiedArtist?: boolean;
  isActive?: boolean;
  bio?: string;
  creatorTypes?: string[];
  applicationNote?: string;
  onboardEmailSentAt?: string | null;
};

function artistId(a: Artist) {
  return String(a.id || a._id || "");
}

function artistName(a: Artist) {
  return a.displayName || a.name || "Unnamed Artist";
}

type StatusFilter = "" | "pending" | "active" | "suspended";

export default function ArtistsPage() {
  const { toast } = useFeedback();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activateTarget, setActivateTarget] = useState<Artist | null>(null);
  const [sendOnboardEmail, setSendOnboardEmail] = useState(true);
  const [onboardMessage, setOnboardMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listArtists({
        search: search || undefined,
        status: status || undefined,
        page: 1,
        limit: 50,
      });
      setArtists(res.items as Artist[]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Artists registry unavailable yet."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createArtist({
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim() || undefined,
        status: "active",
      });
      toast.success("Artist created");
      setCreateOpen(false);
      setName("");
      setEmail("");
      setStatus("active");
      await load();
    } catch (err) {
      toast.error(
        "Create failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function setFlags(
    a: Artist,
    body: Record<string, unknown>,
    okMsg: string
  ) {
    const id = artistId(a);
    if (!id) return;
    setBusy(true);
    try {
      await patchArtist(id, body);
      toast.success(okMsg);
      await load();
    } catch (err) {
      toast.error(
        "Update failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmActivate() {
    if (!activateTarget) return;
    await setFlags(
      activateTarget,
      {
        status: "active",
        isActive: true,
        isVerified: true,
        sendOnboardEmail,
        onboardMessage: onboardMessage.trim() || undefined,
      },
      sendOnboardEmail
        ? "Activated — onboard email queued"
        : "Activated — send onboard email from Compose when ready"
    );
    setActivateTarget(null);
    setSendOnboardEmail(true);
    setOnboardMessage("");
  }
  const pendingCount = artists.filter((a) => (a.status || "") === "pending").length;
  const activeCount = artists.filter((a) => (a.status || "") === "active" || a.isActive).length;
  const verifiedCount = artists.filter((a) => a.isVerified || a.isVerifiedArtist).length;

  return (
    <PageEnter>
      <PageHeader
        title="Creator Directory"
        subtitle="Review creator & artist applications — activation unlocks Studio upload capability."
        badgeText="Artist Roster"
        actions={
          <Button
            onClick={() => {
              setName("");
              setEmail("");
              setCreateOpen(true);
            }}
          >
            <UserPlusIcon className="h-4 w-4" />
            Add Creator Stub
          </Button>
        }
      />

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Pending Review</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Active Creators</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-jevah-accent/20 bg-jevah-accent/10 p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-accent">Verified Badge Artists</p>
          <p className="mt-1 text-2xl font-black text-jevah-accent">{verifiedCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <Panel>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creator name or email..."
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={inputClass}
          >
            <option value="pending">Pending Applications</option>
            <option value="active">Active Roster</option>
            <option value="suspended">Suspended Creators</option>
            <option value="">All Applications</option>
          </select>
          <Button variant="secondary" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </Panel>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={4} />
      ) : artists.length === 0 ? (
        <EmptyState
          title={
            status === "pending"
              ? "No Pending Creator Applications"
              : "No Artists Found in View"
          }
          description="Creators submit applications via the platform or you can manually create an outreach stub."
          icon={MicrophoneIcon}
          action={
            <Button onClick={() => setCreateOpen(true)}>Add Stub</Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {artists.map((a, i) => {
            const verified = Boolean(a.isVerified ?? a.isVerifiedArtist);
            const st = a.status || (a.isActive === false ? "suspended" : "active");
            const initial = artistName(a).charAt(0).toUpperCase();

            return (
              <div
                key={artistId(a)}
                className="admin-list-item group flex flex-col justify-between rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-jevah-accent/30 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-jevah-border/40 pb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent to-purple-600 font-extrabold text-white text-lg shadow-sm">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-jevah-text text-base">
                          {artistName(a)}
                        </p>
                        {a.email && (
                          <p className="truncate text-xs font-medium text-jevah-text-muted flex items-center gap-1 mt-0.5">
                            <EnvelopeIcon className="h-3 w-3 text-sky-500" /> {a.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        tone={
                          st === "pending"
                            ? "warning"
                            : st === "suspended"
                              ? "danger"
                              : "brand"
                        }
                        size="sm"
                        dot
                      >
                        {st}
                      </Badge>
                      <Badge tone={verified ? "success" : "neutral"} size="sm">
                        {verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>

                  {a.creatorTypes?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.creatorTypes.map((t) => (
                        <Badge key={t} tone="info" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {a.applicationNote && (
                    <p className="mt-3 text-xs leading-relaxed text-jevah-text-muted font-medium bg-jevah-card p-3 rounded-2xl border border-jevah-border/50">
                      {a.applicationNote}
                    </p>
                  )}
                  {a.onboardEmailSentAt && (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Onboard email sent{" "}
                      {new Date(a.onboardEmailSentAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 pt-3 border-t border-jevah-border/40">
                  {st === "pending" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      disabled={busy}
                      onClick={() => {
                        setActivateTarget(a);
                        setSendOnboardEmail(true);
                        setOnboardMessage("");
                      }}
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Activate Application
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() =>
                      void setFlags(
                        a,
                        { isVerified: !verified, isVerifiedArtist: !verified },
                        verified ? "Unverified" : "Verified"
                      )
                    }
                  >
                    {verified ? "Unverify Badge" : "Verify Badge"}
                  </Button>
                  {st !== "pending" && (
                    <Button
                      variant={st === "suspended" ? "primary" : "danger"}
                      size="sm"
                      className="flex-1"
                      disabled={busy}
                      onClick={() =>
                        void setFlags(
                          a,
                          {
                            isActive: st === "suspended",
                            status: st === "suspended" ? "active" : "suspended",
                          },
                          st === "suspended" ? "Activated" : "Suspended"
                        )
                      }
                    >
                      {st === "suspended" ? "Reactivate" : "Suspend"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stub Creation Modal */}
      <AdminModal
        open={createOpen}
        onClose={() => {
          if (!busy) setCreateOpen(false);
        }}
        title="Add Creator Outreach Stub"
        subtitle="Manual registration for artists before user onboarding application."
        busy={busy}
        icon={<MicrophoneIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="artist-stub-form"
              className="flex-1"
              disabled={busy || !name.trim()}
            >
              <SparklesIcon className="h-4 w-4" />
              {busy ? "Registering..." : "Create Artist Stub"}
            </Button>
          </div>
        }
      >
        <form
          id="artist-stub-form"
          onSubmit={(e) => void onCreate(e)}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-jevah-accent/30 bg-gradient-to-br from-jevah-accent/15 via-jevah-surface to-jevah-surface p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jevah-accent/20 text-jevah-accent ring-1 ring-jevah-accent/30">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold leading-relaxed text-jevah-text">
              Registers an artist profile stub in outreach status. They can link this record upon sign-up.
            </p>
          </div>
          <Field label="Stage / Artist Display Name *">
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Grace Worship Collective"
            />
          </Field>
          <Field label="Contact Email Address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="artist@ministry.org"
            />
          </Field>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(activateTarget)}
        onClose={() => {
          if (!busy) setActivateTarget(null);
        }}
        title="Activate creator"
        subtitle={
          activateTarget
            ? `Unlock Studio for ${artistName(activateTarget)}`
            : undefined
        }
        busy={busy}
        icon={<CheckCircleIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={() => setActivateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={busy}
              onClick={() => void confirmActivate()}
            >
              {busy ? "Activating…" : "Activate"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-jevah-border bg-jevah-card p-3">
            <input
              type="checkbox"
              checked={sendOnboardEmail}
              onChange={(e) => setSendOnboardEmail(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-jevah-border text-jevah-accent"
            />
            <span>
              <span className="block text-sm font-bold text-jevah-text">
                Send artist onboard email
              </span>
              <span className="mt-0.5 block text-xs text-jevah-text-muted">
                Ops invite for Music → Artists upload. Not a marketing email.
              </span>
            </span>
          </label>
          {sendOnboardEmail && (
            <Field label="Optional note">
              <textarea
                rows={3}
                value={onboardMessage}
                onChange={(e) => setOnboardMessage(e.target.value)}
                className={inputClass}
                placeholder="Congrats — you're live!"
              />
            </Field>
          )}
          {!sendOnboardEmail && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Without this, use{" "}
              <a
                href="/admin/email/artist-onboard"
                className="font-bold underline"
              >
                Artist onboard compose
              </a>{" "}
              later (dashboard will remind you).
            </p>
          )}
        </div>
      </AdminModal>
    </PageEnter>
  );
}

