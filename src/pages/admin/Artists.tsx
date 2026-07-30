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
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

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
};

function artistId(a: Artist) {
  return String(a.id || a._id || "");
}

function artistName(a: Artist) {
  return a.displayName || a.name || "Unnamed artist";
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Artists"
        subtitle="Review creator applications — activate unlocks studio upload."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
            Add stub
          </Button>
        }
      />

      <Panel>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artists"
            className={inputClass}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={inputClass}
          >
            <option value="pending">Pending review</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="">All statuses</option>
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
              ? "No pending applications"
              : "No artists in this view"
          }
          description="Creators apply via /creators — or add a stub for outreach."
          action={
            <Button onClick={() => setCreateOpen(true)}>Add stub</Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {artists.map((a, i) => {
            const verified = Boolean(a.isVerified ?? a.isVerifiedArtist);
            const st = a.status || (a.isActive === false ? "suspended" : "active");
            return (
              <div
                key={artistId(a)}
                className="admin-list-item rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0B1A1F]">
                      {artistName(a)}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {a.email || "No email"}
                    </p>
                    {a.creatorTypes?.length ? (
                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {a.creatorTypes.join(" · ")}
                      </p>
                    ) : null}
                    {a.applicationNote && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                        {a.applicationNote}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      tone={
                        st === "pending"
                          ? "warning"
                          : st === "suspended"
                            ? "danger"
                            : "brand"
                      }
                    >
                      {st}
                    </Badge>
                    <Badge tone={verified ? "success" : "neutral"}>
                      {verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {st === "pending" && (
                    <Button
                      variant="primary"
                      className="min-h-9 flex-1 text-xs"
                      disabled={busy}
                      onClick={() =>
                        void setFlags(
                          a,
                          {
                            status: "active",
                            isActive: true,
                            isVerified: true,
                          },
                          "Activated — creator can upload"
                        )
                      }
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="min-h-9 flex-1 text-xs"
                    disabled={busy}
                    onClick={() =>
                      void setFlags(
                        a,
                        { isVerified: !verified, isVerifiedArtist: !verified },
                        verified ? "Unverified" : "Verified"
                      )
                    }
                  >
                    {verified ? "Unverify" : "Verify"}
                  </Button>
                  {st !== "pending" && (
                    <Button
                      variant={st === "suspended" ? "primary" : "danger"}
                      className="min-h-9 flex-1 text-xs"
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
                      {st === "suspended" ? "Activate" : "Suspend"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={(e) => void onCreate(e)}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">Add artist stub</h3>
            <p className="mt-1 text-xs text-slate-500">
              Outreach / manual — not the public apply funnel.
            </p>
            <div className="mt-4 space-y-3">
              <Field label="Display name">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
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
