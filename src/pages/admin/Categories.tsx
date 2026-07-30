import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

type Category = {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
};

function catId(c: Category) {
  return String(c.id || c._id || "");
}

export default function CategoriesPage() {
  const { confirm, toast } = useFeedback();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems((await listCategories()) as Category[]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Categories unavailable."
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
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Category created");
      setName("");
      setDescription("");
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

  async function onDelete(c: Category) {
    const ok = await confirm({
      title: "Delete category?",
      message: `"${c.name}" will be removed from the registry.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteCategory(catId(c));
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error(
        "Delete failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        subtitle="Content category registry for media and tracks."
      />

      <Panel>
        <form
          onSubmit={(e) => void onCreate(e)}
          className="grid gap-3 sm:grid-cols-3"
        >
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="w-full">
              Add category
            </Button>
          </div>
        </form>
      </Panel>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonRows rows={3} />
      ) : items.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Panel key={catId(c)}>
              <p className="font-semibold text-jevah-text">{c.name}</p>
              <p className="mt-1 text-xs text-jevah-text-muted">
                {c.slug || c.description || "—"}
              </p>
              <Button
                variant="danger"
                className="mt-3 min-h-9 text-xs"
                disabled={busy}
                onClick={() => void onDelete(c)}
              >
                Delete
              </Button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
