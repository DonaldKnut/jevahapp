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
  API_BASE,
} from "../lib/api";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
  unwrapUser,
  verifyEmailRequest,
  type RegisterBody,
} from "../services/authApi";
import {
  canEmailLoginToAdmin,
  isSuperAdminEmail,
} from "../lib/superAdmin";
import { fieldErrorsFromBody } from "../lib/authNext";
import type { AdminUser, AuthNextStep, LoginResponse } from "../types/admin";

export type LoginOptions = {
  /** When true (default), only allowlisted admins may sign in. */
  requireAdmin?: boolean;
};

export type AuthFailure = {
  ok: false;
  error: string;
  code?: string;
  email?: string;
  fields?: Record<string, string>;
};

export type AuthSuccess = {
  ok: true;
  user: AdminUser;
  nextStep?: AuthNextStep;
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
  ) => Promise<AuthSuccess | AuthFailure>;
  register: (body: RegisterBody) => Promise<AuthSuccess | AuthFailure>;
  verifyEmail: (body: {
    code: string;
    email?: string;
  }) => Promise<AuthSuccess | AuthFailure>;
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

  const failFromUnknown = useCallback((err: unknown, verb: string): AuthFailure => {
    if (err instanceof ApiError) {
      return {
        ok: false,
        error: err.message,
        code: err.body?.code,
        email: err.body?.email,
        fields: fieldErrorsFromBody(err.body),
      };
    }
    const raw = err instanceof Error ? err.message : "";
    const hint =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      API_BASE.startsWith("http://")
        ? " Production site cannot call an http:// API (blocked). Set VITE_API_URL to https://api.jevahapp.com/api on Vercel."
        : API_BASE.includes("localhost")
          ? " App is still pointing at localhost — set VITE_API_URL to your Contabo API and redeploy."
          : " Check network, CORS, or that the API is reachable.";
    return {
      ok: false,
      error: `Unable to ${verb} (${raw || "network error"}).${hint}`,
    };
  }, []);

  const persistAuth = useCallback(
    (res: LoginResponse): AuthSuccess | AuthFailure => {
      const accessToken = res.accessToken || res.token;
      if (!accessToken) {
        return { ok: false, error: "No access token returned from server." };
      }
      const user = unwrapUser(res);
      applySession(accessToken, user);
      return { ok: true, user, nextStep: res.nextStep || user.nextStep };
    },
    [applySession]
  );

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
      options: LoginOptions = {}
    ): Promise<AuthSuccess | AuthFailure> => {
      const requireAdmin = options.requireAdmin !== false;
      try {
        if (requireAdmin && !canEmailLoginToAdmin(email)) {
          return {
            ok: false,
            error:
              "This account cannot access the web admin console. Ask support@jevahapp.com to grant access.",
          };
        }

        const res = await loginRequest(email, password, rememberMe);
        const persisted = persistAuth(res);
        if (!persisted.ok) return persisted;

        if (requireAdmin) {
          if (persisted.user.role !== "admin") {
            clearSession();
            return { ok: false, error: "This account is not an admin." };
          }
          if (!canEmailLoginToAdmin(persisted.user.email)) {
            clearSession();
            return {
              ok: false,
              error: "This account cannot access the web admin console.",
            };
          }
        }

        return persisted;
      } catch (err) {
        return failFromUnknown(err, "sign in");
      }
    },
    [clearSession, failFromUnknown, persistAuth]
  );

  const register = useCallback(
    async (body: RegisterBody): Promise<AuthSuccess | AuthFailure> => {
      try {
        const res = await registerRequest(body);
        return persistAuth(res);
      } catch (err) {
        return failFromUnknown(err, "create account");
      }
    },
    [failFromUnknown, persistAuth]
  );

  const verifyEmail = useCallback(
    async (body: {
      code: string;
      email?: string;
    }): Promise<AuthSuccess | AuthFailure> => {
      try {
        const res = await verifyEmailRequest(body);
        return persistAuth(res);
      } catch (err) {
        return failFromUnknown(err, "verify email");
      }
    },
    [failFromUnknown, persistAuth]
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
      register,
      verifyEmail,
      logout,
      refreshSession,
    }),
    [user, token, loading, login, register, verifyEmail, logout, refreshSession]
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
