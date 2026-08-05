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
  PageEnter,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import AdminModal from "../../components/admin/AdminModal";
import { useFeedback } from "../../components/admin/Feedback";
import {
  DEFAULT_MEDIA_CATEGORIES,
  normalizeCategoryList,
  type CategoryOption,
} from "../../lib/categories";
import {
  TagIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const CATEGORY_COLORS = [
  "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-600 dark:text-violet-300",
  "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-600 dark:text-blue-300",
  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-300",
  "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-300",
  "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-600 dark:text-rose-300",
  "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-300",
];

export default function CategoriesPage() {
  const { confirm, toast } = useFeedback();
  const [items, setItems] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await listCategories();
      setItems(normalizeCategoryList(raw as Array<Record<string, unknown>>));
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

  function closeModal() {
    if (busy) return;
    setOpen(false);
  }

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
      setOpen(false);
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

  async function seedDefaults() {
    const existing = new Set(items.map((c) => c.name.toLowerCase()));
    const missing = DEFAULT_MEDIA_CATEGORIES.filter(
      (n) => !existing.has(n.toLowerCase())
    );
    if (missing.length === 0) {
      toast.success("All defaults already present");
      return;
    }
    const ok = await confirm({
      title: "Seed default categories?",
      message: `Add ${missing.length} missing defaults: ${missing.join(", ")}.`,
      confirmLabel: "Seed Now",
      tone: "primary",
    });
    if (!ok) return;
    setBusy(true);
    try {
      for (const n of missing) {
        await createCategory({ name: n });
      }
      toast.success("Defaults seeded", `${missing.length} categories added`);
      await load();
    } catch (err) {
      toast.error(
        "Seed failed",
        err instanceof ApiError ? err.message : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(c: CategoryOption) {
    const ok = await confirm({
      title: "Delete category?",
      message: `"${c.name}" will be removed from the registry and may break any media tagged with it.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteCategory(c.id);
      toast.success("Category deleted");
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
    <PageEnter>
      <PageHeader
        title="Content Categories"
        subtitle="Registry used by Audio Library uploads and media filters. Changes reflect immediately across the platform."
        badgeText="Categories"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void seedDefaults()}
            >
              <SparklesIcon className="h-4 w-4" />
              Seed Defaults
            </Button>
            <Button
              onClick={() => {
                setName("");
                setDescription("");
                setOpen(true);
              }}
            >
              <PlusIcon className="h-4 w-4" />
              New Category
            </Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="flex items-center gap-4 rounded-2xl border border-jevah-border/60 bg-jevah-surface px-5 py-4 shadow-sm">
        <TagIcon className="h-5 w-5 text-jevah-accent shrink-0" />
        <div>
          <p className="text-sm font-bold text-jevah-text">{items.length} Categories Registered</p>
          <p className="text-xs text-jevah-text-muted">Available as filters in the Audio Library and upload flows.</p>
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
          title="No categories registered"
          description="Create categories used by the Audio Library, or seed the curated defaults."
          icon={TagIcon}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => void seedDefaults()}>
                Seed Defaults
              </Button>
              <Button onClick={() => setOpen(true)}>New Category</Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((c, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <div
                key={c.id}
                className={`group relative flex flex-col justify-between rounded-3xl border bg-gradient-to-br p-5 shadow-sm transition hover:shadow-md ${color}`}
              >
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/30 dark:bg-black/20">
                    <TagIcon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-extrabold capitalize tracking-tight">
                    {c.name.replace(/_/g, " ")}
                  </p>
                  {c.slug && (
                    <p className="mt-1 font-mono text-xs opacity-60">
                      /{c.slug}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onDelete(c)}
                  className="mt-4 flex items-center gap-1.5 self-start rounded-xl border border-current/20 bg-white/20 px-3 py-1.5 text-xs font-bold opacity-0 transition hover:bg-white/30 group-hover:opacity-100"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AdminModal
        open={open}
        onClose={closeModal}
        title="Create Category"
        subtitle="Visible immediately in Audio Library dropdowns."
        busy={busy}
        icon={<TagIcon className="h-5 w-5" />}
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
              form="category-create-form"
              className="flex-1"
              disabled={busy || !name.trim()}
            >
              {busy ? "Creating..." : "Create Category"}
            </Button>
          </div>
        }
      >
        <form
          id="category-create-form"
          onSubmit={(e) => void onCreate(e)}
          className="space-y-4"
        >
          <Field label="Category Name">
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. worship, sermons, gospel"
            />
          </Field>
          <Field label="Description (optional)">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="e.g. Worship & praise tracks"
            />
          </Field>
        </form>
      </AdminModal>
    </PageEnter>
  );
}
