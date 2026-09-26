/**
 * Where a signed-in user should land from public chrome ("Dashboard").
 * Guests see Admin / Creator login instead.
 */
import type { AdminUser } from "../types/admin";
import { needsEmailVerification } from "./authNext";

export function sessionDashboardPath(opts: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: AdminUser | null;
}): string | null {
  if (!opts.isAuthenticated) return null;
  if (needsEmailVerification(opts.user)) return "/creators/verify";
  return opts.isAdmin ? "/admin" : "/creators/studio";
}
