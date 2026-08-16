/**
 * Live search that treats spaces as AND-tokens and keeps
 * digits, hyphens, apostrophes, colons, &, #, +.
 */
function fold(s: string): string {
  return s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Letters + digits only, so "psalm 23" and "psalm23" and "Psalm-23" meet. */
function compact(s: string): string {
  return fold(s).replace(/[^\p{L}\p{N}]+/gu, "");
}

export function matchesSearch(
  query: string,
  fields: Array<string | number | null | undefined>
): boolean {
  const raw = query.replace(/^\s+/, "");
  if (!raw.trim()) return true;

  const hay = fields
    .map((f) => (f == null || f === "" ? "" : String(f)))
    .filter(Boolean)
    .join(" ");
  if (!hay) return false;

  const hayFold = fold(hay);
  const hayCompact = compact(hay);
  const qFold = fold(raw).trim();
  const qCompact = compact(raw);

  if (qFold && hayFold.includes(qFold)) return true;
  if (qCompact.length > 0 && hayCompact.includes(qCompact)) return true;

  const tokens = qFold.split(/\s+/).filter(Boolean);
  return tokens.every((tok) => {
    if (hayFold.includes(tok)) return true;
    const c = compact(tok);
    return c.length > 0 && hayCompact.includes(c);
  });
}
