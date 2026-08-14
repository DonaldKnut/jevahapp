/**
 * Where a signed-in user should land from public chrome ("Dashboard").
 * Guests see Admin / Creator login instead.
 */
export function sessionDashboardPath(opts: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}): string | null {
  if (!opts.isAuthenticated) return null;
  return opts.isAdmin ? "/admin" : "/creators/studio";
}
