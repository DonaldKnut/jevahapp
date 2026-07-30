import { FormEvent, useCallback, useEffect, useState } from "react";
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
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

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
  const [verifiedFilter, setVerifiedFilter] = useState<"" | "true" | "false">("");
  const [listedFilter, setListedFilter] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listChurches({
        search: search || undefined,
        isVerified:
          verifiedFilter === "" ? undefined : verifiedFilter === "true",
        isListed: listedFilter === "" ? undefined : listedFilter === "true",
        page: 1,
        limit: 50,
      });
      setChurches(res.churches as Church[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load churches.");
    } finally {
      setLoading(false);
    }
  }, [search, verifiedFilter, listedFilter]);

  useEffect(() => {
    void load();
  }, [load]);

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
      toast.error("Verification failed", err instanceof ApiError ? err.message : undefined);
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
        name: form.name,
        state: form.state,
        lga: form.lga || undefined,
        address: form.address || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
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
      toast.error("Create failed", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Churches"
        subtitle="Onboarding catalog — listed churches appear in places suggest."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
            Add church
          </Button>
        }
      />

      <Panel>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search churches"
            className={inputClass}
          />
          <select
            value={verifiedFilter}
            onChange={(e) =>
              setVerifiedFilter(e.target.value as "" | "true" | "false")
            }
            className={inputClass}
          >
            <option value="">All verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            value={listedFilter}
            onChange={(e) =>
              setListedFilter(e.target.value as "" | "true" | "false")
            }
            className={inputClass}
          >
            <option value="">All listing</option>
            <option value="true">Listed</option>
            <option value="false">Hidden</option>
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
      ) : churches.length === 0 ? (
        <EmptyState
          title="No churches yet"
          description="Add a church or adjust filters."
          action={<Button onClick={() => setCreateOpen(true)}>Add church</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {churches.map((c, i) => {
            const verified = Boolean(c.isVerified ?? c.verified);
            const listed = c.isListed !== false;
            return (
              <div
                key={churchId(c)}
                className="admin-list-item rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0B1A1F]">
                      {c.name || "Untitled church"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {[c.lga, c.city, c.state, c.country]
                        .filter(Boolean)
                        .join(" · ") || "No location"}
                    </p>
                    {c.contactEmail && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {c.contactEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={verified ? "success" : "neutral"}>
                      {verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge tone={listed ? "brand" : "warning"}>
                      {listed ? "Listed" : "Hidden"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant={verified ? "secondary" : "primary"}
                    className="flex-1 min-h-9 text-xs"
                    disabled={busy}
                    onClick={() => void toggleVerify(c)}
                  >
                    {verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 min-h-9 text-xs"
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

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={onCreate}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">Add church</h3>
            <div className="mt-4 space-y-3">
              <Field label="Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="State">
                <input
                  required
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="LGA (optional)">
                <input
                  value={form.lga}
                  onChange={(e) => setForm((f) => ({ ...f, lga: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="Address (optional)">
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Contact name">
                <input
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Contact email">
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactEmail: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Contact phone">
                <input
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactPhone: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isListed}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isListed: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#256E63]"
                />
                List in onboarding search
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isVerified: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#256E63]"
                />
                Mark verified
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={busy}>
                Create
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
