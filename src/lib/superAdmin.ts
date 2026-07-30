/**
 * Master console account — email only.
 * NEVER put passwords in frontend source. Create this user on the backend/Mongo.
 */
export const SUPER_ADMIN_EMAIL = "support@jevahapp.com";

const ALLOWLIST_KEY = "adminLoginAllowlist";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSuperAdminEmail(email?: string | null) {
  return normalizeEmail(email || "") === normalizeEmail(SUPER_ADMIN_EMAIL);
}

/** Emails allowed to sign into the web admin console. */
export function getAdminLoginAllowlist(): string[] {
  const base = [normalizeEmail(SUPER_ADMIN_EMAIL)];
  try {
    const raw = localStorage.getItem(ALLOWLIST_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return base;
    const extra = parsed
      .filter((e): e is string => typeof e === "string")
      .map(normalizeEmail);
    return Array.from(new Set([...base, ...extra]));
  } catch {
    return base;
  }
}

export function canEmailLoginToAdmin(email: string) {
  return getAdminLoginAllowlist().includes(normalizeEmail(email));
}

/** When super-admin promotes someone to admin, grant web login access. */
export function addToAdminLoginAllowlist(email: string) {
  const next = Array.from(
    new Set([...getAdminLoginAllowlist(), normalizeEmail(email)])
  );
  localStorage.setItem(ALLOWLIST_KEY, JSON.stringify(next));
}

/** When demoting from admin, revoke web login (except super admin). */
export function removeFromAdminLoginAllowlist(email: string) {
  const target = normalizeEmail(email);
  if (target === normalizeEmail(SUPER_ADMIN_EMAIL)) return;
  const next = getAdminLoginAllowlist().filter((e) => e !== target);
  localStorage.setItem(ALLOWLIST_KEY, JSON.stringify(next));
}
