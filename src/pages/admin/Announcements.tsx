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
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

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
      toast.success("Published");
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast drafts and publish to the app."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            New draft
          </Button>
        }
      />

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No announcements"
          action={<Button onClick={() => setOpen(true)}>New draft</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Panel key={annId(a)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#0B1A1F]">
                    {a.title || "Untitled"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {a.body || a.message}
                  </p>
                </div>
                <Badge
                  tone={
                    a.status === "published" ? "success" : "neutral"
                  }
                >
                  {a.status || "draft"}
                </Badge>
              </div>
              {a.status !== "published" && (
                <Button
                  className="mt-3"
                  disabled={busy}
                  onClick={() => void publish(a)}
                >
                  Publish
                </Button>
              )}
            </Panel>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <form
            onSubmit={(e) => void onCreate(e)}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-2xl"
          >
            <h3 className="text-lg font-semibold">New announcement</h3>
            <div className="mt-4 space-y-3">
              <Field label="Title">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Body">
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={busy}>
                Save draft
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
