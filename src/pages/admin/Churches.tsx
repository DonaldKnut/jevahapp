import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createAdminChurch,
  listChurches,
  patchAdminChurch,
  verifyChurch,
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
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { matchesSearch } from "../../lib/searchMatch";
import {
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Church = {
  id?: string;
  _id?: string;
  name?: string;
  state?: string;
  lga?: string;
  address?: string;
  isVerified?: boolean;
  verified?: boolean;
  isListed?: boolean;
  city?: string;
  country?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  source?: string;
};

function churchId(c: Church) {
  return String(c.id || c._id || "");
}

const emptyForm = {
  name: "",
  state: "",
  lga: "",
  address: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  source: "outreach",
  isListed: true,
  isVerified: false,
};

export default function ChurchesPage() {
  const { toast } = useFeedback();
  const [churches, setChurches] = useState<Church[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const loadedOnce = useRef(false);
  const [verifiedFilter, setVerifiedFilter] = useState<"" | "true" | "false">("");
  const [listedFilter, setListedFilter] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!loadedOnce.current) setLoading(true);
    setError(null);
    try {
      const res = await listChurches({
        search: debouncedSearch || undefined,
        isVerified:
          verifiedFilter === "" ? undefined : verifiedFilter === "true",
        isListed: listedFilter === "" ? undefined : listedFilter === "true",
        page: 1,
        limit: 50,
      });
      setChurches(res.churches as Church[]);
      loadedOnce.current = true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load churches.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, verifiedFilter, listedFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleChurches = useMemo(
    () =>
      churches.filter((c) =>
        matchesSearch(search, [
          c.name,
          c.city,
          c.state,
          c.lga,
          c.address,
          c.country,
          c.contactEmail,
          c.contactName,
          c.contactPhone,
        ])
      ),
    [churches, search]
  );

  function closeCreate() {
    if (busy) return;
    setCreateOpen(false);
  }

  async function toggleVerify(c: Church) {
    const id = churchId(c);
    if (!id) return;
    const next = !(c.isVerified ?? c.verified);
    setBusy(true);
    try {
      await verifyChurch(id, next);
      toast.success(
        next ? "Church verified" : "Church unverified",
        c.name || id
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
      toast.error(
        "Verification failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleListed(c: Church) {
    const id = churchId(c);
    if (!id) return;
    const next = !(c.isListed !== false);
    setBusy(true);
    try {
      await patchAdminChurch(id, { isListed: next });
      toast.success(next ? "Listed in onboarding" : "Hidden from onboarding");
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createAdminChurch({
        name: form.name.trim(),
        state: form.state.trim(),
        lga: form.lga.trim() || undefined,
        address: form.address.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        source: form.source || undefined,
        isListed: form.isListed,
        isVerified: form.isVerified,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success("Church created");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed.");
      toast.error(
        "Create failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  const verifiedCount = churches.filter((c) => c.isVerified || c.verified).length;
  const listedCount = churches.filter((c) => c.isListed !== false).length;

  return (
    <PageEnter>
      <PageHeader
        title="Church Directory"
        subtitle="Catalog of affiliated ministry bodies & worship spaces listed in community search."
        badgeText="Congregations"
        actions={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Add New Church
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-jevah-border/80 bg-jevah-surface p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-text-muted">Total Directory</p>
          <p className="mt-1 text-2xl font-black text-jevah-text">{churches.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Verified Congregations</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{verifiedCount}</p>
        </div>
        <div className="rounded-2xl border border-jevah-accent/20 bg-jevah-accent/10 p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-jevah-accent">Listed in Onboarding</p>
          <p className="mt-1 text-2xl font-black text-jevah-accent">{listedCount}</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <Panel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, phone, email…"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={verifiedFilter}
            onChange={(e) =>
              setVerifiedFilter(e.target.value as "" | "true" | "false")
            }
            className={inputClass}
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
          <select
            value={listedFilter}
            onChange={(e) =>
              setListedFilter(e.target.value as "" | "true" | "false")
            }
            className={inputClass}
          >
            <option value="">All Listing Status</option>
            <option value="true">Listed in Search</option>
            <option value="false">Hidden from Search</option>
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
      ) : visibleChurches.length === 0 ? (
        <EmptyState
          title="No Churches Found"
          description="Add a new congregation to the onboarding catalog or adjust filter criteria."
          icon={BuildingLibraryIcon}
          action={
            <Button
              onClick={() => {
                setForm(emptyForm);
                setCreateOpen(true);
              }}
            >
              Add Church
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleChurches.map((c, i) => {
            const verified = Boolean(c.isVerified ?? c.verified);
            const listed = c.isListed !== false;
            const location = [c.lga, c.city, c.state, c.country].filter(Boolean).join(", ");

            return (
              <div
                key={churchId(c)}
                className="admin-list-item group flex flex-col justify-between rounded-3xl border border-jevah-border/80 bg-jevah-surface p-5 shadow-sm transition hover:-translate-y-1 hover:border-jevah-accent/30 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-jevah-border/40 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20">
                        <BuildingLibraryIcon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-jevah-text text-base">
                          {c.name || "Untitled Church"}
                        </p>
                        {c.contactName && (
                          <p className="truncate text-xs font-semibold text-jevah-text-muted flex items-center gap-1 mt-0.5">
                            <UserIcon className="h-3 w-3" /> {c.contactName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge tone={verified ? "success" : "neutral"} size="sm" dot>
                        {verified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge tone={listed ? "brand" : "warning"} size="sm">
                        {listed ? "Listed" : "Hidden"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-medium text-jevah-text-muted">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-jevah-accent" />
                      <span className="truncate">{location || "Location not specified"}</span>
                    </div>
                    {c.contactEmail && (
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 shrink-0 text-sky-500" />
                        <span className="truncate">{c.contactEmail}</span>
                      </div>
                    )}
                    {c.contactPhone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="truncate">{c.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-3 border-t border-jevah-border/40">
                  <Button
                    variant={verified ? "secondary" : "primary"}
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => void toggleVerify(c)}
                  >
                    {verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => void toggleListed(c)}
                  >
                    {listed ? "Hide" : "List"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <AdminModal
        open={createOpen}
        onClose={closeCreate}
        title="Add New Church Congregation"
        subtitle="Cataloged churches appear in onboarding suggestion lists."
        busy={busy}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={closeCreate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="church-create-form"
              className="flex-1"
              disabled={busy || !form.name.trim() || !form.state.trim()}
            >
              {busy ? "Registering..." : "Register Church"}
            </Button>
          </div>
        }
      >
        <form
          id="church-create-form"
          onSubmit={(e) => void onCreate(e)}
          className="space-y-4"
        >
          <Field label="Church / Ministry Name">
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Grace Assembly Cathedral"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <input
                required
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className={inputClass}
                placeholder="Lagos"
              />
            </Field>
            <Field label="LGA">
              <input
                value={form.lga}
                onChange={(e) => setForm((f) => ({ ...f, lga: e.target.value }))}
                className={inputClass}
                placeholder="Ikeja"
              />
            </Field>
          </div>
          <Field label="Address Description">
            <input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className={inputClass}
              placeholder="12 Commercial Avenue"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pastor / Contact Name">
              <input
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
                className={inputClass}
                placeholder="Pastor John"
              />
            </Field>
            <Field label="Contact Phone">
              <input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
                className={inputClass}
                placeholder="+234..."
              />
            </Field>
          </div>
          <Field label="Contact Email">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactEmail: e.target.value }))
              }
              className={inputClass}
              placeholder="info@grace chapel.org"
            />
          </Field>
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-jevah-text">
              <input
                type="checkbox"
                checked={form.isListed}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isListed: e.target.checked }))
                }
                className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
              />
              Publish in user onboarding search catalog
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-jevah-text">
              <input
                type="checkbox"
                checked={form.isVerified}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isVerified: e.target.checked }))
                }
                className="h-4 w-4 rounded border-jevah-border text-jevah-accent"
              />
              Mark congregation as verified
            </label>
          </div>
        </form>
      </AdminModal>
    </PageEnter>
  );
}

