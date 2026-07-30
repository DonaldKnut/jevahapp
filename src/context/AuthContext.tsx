import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setAuthSession,
  ApiError,
} from "../lib/api";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  unwrapUser,
} from "../services/authApi";
import {
  canEmailLoginToAdmin,
  isSuperAdminEmail,
} from "../lib/superAdmin";
import type { AdminUser } from "../types/admin";

export type LoginOptions = {
  /** When true (default), only allowlisted admins may sign in. */
  requireAdmin?: boolean;
};

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    options?: LoginOptions
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function passesAdminGate(user: AdminUser) {
  return user.role === "admin" && canEmailLoginToAdmin(user.email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() =>
    getStoredUser<AdminUser>()
  );
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((accessToken: string, nextUser: AdminUser) => {
    setAuthSession(accessToken, nextUser);
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await refreshRequest();
      const nextToken = refreshed.accessToken || refreshed.token;
      if (!nextToken) return false;
      const me = unwrapUser(await meRequest());
      applySession(nextToken, me);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const existing = getAccessToken();
      if (!existing) {
        if (!cancelled) {
          setLoading(false);
          setUser(null);
          setToken(null);
        }
        return;
      }

      try {
        const me = unwrapUser(await meRequest());
        if (!cancelled) applySession(existing, me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const ok = await refreshSession();
          if (!ok) clearSession();
        } else {
          clearSession();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession, refreshSession]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
      options: LoginOptions = {}
    ) => {
      const requireAdmin = options.requireAdmin !== false;
      try {
        if (requireAdmin && !canEmailLoginToAdmin(email)) {
          return {
            ok: false as const,
            error:
              "This account cannot access the web admin console. Ask support@jevahapp.com to grant access.",
          };
        }

        const res = await loginRequest(email, password, rememberMe);
        const accessToken = res.accessToken || res.token;
        if (!accessToken) {
          return { ok: false as const, error: "No access token returned from server." };
        }

        if (requireAdmin) {
          if (res.user.role !== "admin") {
            return {
              ok: false as const,
              error: "This account is not an admin.",
            };
          }
          if (!canEmailLoginToAdmin(res.user.email)) {
            return {
              ok: false as const,
              error: "This account cannot access the web admin console.",
            };
          }
        }

        applySession(accessToken, res.user);
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to sign in. Check your connection and try again.";
        return { ok: false as const, error: message };
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // still clear local session
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(token) && !!user && passesAdminGate(user),
      isSuperAdmin: isSuperAdminEmail(user?.email),
      login,
      logout,
      refreshSession,
    }),
    [user, token, loading, login, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
