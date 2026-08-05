/** Fallback labels when /admin/categories is empty or offline. */
export const DEFAULT_MEDIA_CATEGORIES = [
  "worship",
  "praise",
  "kids",
  "sermons",
  "hymns",
  "gospel",
  "afro_gospel",
  "choir",
  "instrumental",
  "devotional",
] as const;

export type CategoryOption = {
  id: string;
  name: string;
  slug?: string;
};

export function normalizeCategoryList(
  raw: Array<Record<string, unknown>> | null | undefined
): CategoryOption[] {
  if (!raw?.length) return [];
  const seen = new Set<string>();
  const out: CategoryOption[] = [];
  for (const c of raw) {
    const name = String(c.name || c.slug || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: String(c.id || c._id || key),
      name,
      slug: c.slug ? String(c.slug) : undefined,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function withCategoryFallbacks(options: CategoryOption[]): CategoryOption[] {
  if (options.length > 0) return options;
  return DEFAULT_MEDIA_CATEGORIES.map((name) => ({
    id: name,
    name,
    slug: name,
  }));
}
