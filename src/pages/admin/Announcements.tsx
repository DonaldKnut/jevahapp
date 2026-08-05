import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createAnnouncement,
  listAnnouncements,
  patchAnnouncement,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  SkeletonRows,
  PageEnter,
  inputClass,
} from "../../components/admin/ui";
import AdminModal from "../../components/admin/AdminModal";
import { useFeedback } from "../../components/admin/Feedback";
import {
  MegaphoneIcon,
  PlusIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

type Announcement = {
  id?: string;
  _id?: string;
  title?: string;
  body?: string;
  message?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
};

function annId(a: Announcement) {
  return String(a.id || a._id || "");
}

export default function AnnouncementsPage() {
  const { toast } = useFeedback();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems((await listAnnouncements({ limit: 50 })) as Announcement[]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Announcements unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeModal() {
    if (busy) return;
    setOpen(false);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        message: body.trim(),
        status: "draft",
      });
      toast.success("Draft created");
      setOpen(false);
      setTitle("");
      setBody("");
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

  async function publish(a: Announcement) {
    const id = annId(a);
    setBusy(true);
    try {
      await patchAnnouncement(id, { status: "published", published: true });
      toast.success("Announcement published to app");
      await load();
    } catch (err) {
      toast.error(
        "Publish failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  const publishedCount = items.filter((a) => a.status === "published").length;
  const draftCount = items.filter((a) => a.status !== "published").length;

  return (
    <PageEnter>
      <PageHeader
        title="Broadcast Announcements"
        subtitle="Create & publish official messages broadcast to all platform users & congregations."
        badgeText="Announcements"
        actions={
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Published Live</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Saved Drafts</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{draftCount}</p>
        </div>
      </div>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Announcements Created"
          description="Broadcast messages will reach all active platform users and congregation members."
          icon={MegaphoneIcon}
          action={
            <Button onClick={() => setOpen(true)}>New Announcement</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((a, i) => (
            <div
              key={annId(a)}
              className="admin-list-item group rounded-3xl border border-jevah-border/80 bg-jevah-surface p-6 shadow-sm transition hover:border-jevah-accent/20 hover:shadow-md"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${a.status === "published" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
                    {a.status === "published" ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <ClockIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-jevah-text text-lg leading-snug">
                      {a.title || "Untitled Announcement"}
                    </p>
                    <p className="mt-2 text-sm text-jevah-text-muted font-medium leading-relaxed line-clamp-3">
                      {a.body || a.message}
                    </p>
                    {a.createdAt && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-jevah-text-muted">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(a.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge tone={a.status === "published" ? "success" : "warning"} size="sm" dot>
                    {a.status || "draft"}
                  </Badge>
                  {a.status !== "published" && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void publish(a)}
                    >
                      <PaperAirplaneIcon className="h-3.5 w-3.5" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={open}
        onClose={closeModal}
        title="Compose New Announcement"
        subtitle="Drafts are saved privately — publish when ready to broadcast."
        busy={busy}
        icon={<MegaphoneIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="announcement-create-form"
              className="flex-1"
              disabled={busy || !title.trim() || !body.trim()}
            >
              {busy ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        }
      >
        <form
          id="announcement-create-form"
          onSubmit={(e) => void onCreate(e)}
          className="space-y-4"
        >
          <Field label="Announcement Title">
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Sunday Service Update — Week 23"
            />
          </Field>
          <Field label="Broadcast Message Body">
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={inputClass}
              placeholder="Write the full announcement message that will be shown to all users..."
            />
          </Field>
        </form>
      </AdminModal>
    </PageEnter>
  );
}
