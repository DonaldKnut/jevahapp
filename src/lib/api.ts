import type { ApiErrorBody } from "../types/admin";

/**
 * Resolve API base. Routes are mounted under `/api`, so every base ends there
 * and callers pass paths like `/auth/login`.
 *
 * VITE_API_URL is accepted with or without the `/api` suffix; an origin-only
 * value is upgraded so we never ship `https://api.jevahapp.com/auth/login`
 * (that 404s as "Route not found").
 */
function withApiSuffix(base: string): string {
  const trimmed = base.replace(/\/+$/, "");
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
}

function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv) return withApiSuffix(fromEnv);

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host === "jevahapp.com" ||
      host.endsWith(".jevahapp.com") ||
      host.endsWith(".vercel.app")
    ) {
      return "https://api.jevahapp.com/api";
    }
  }

  return "http://localhost:4000/api";
}

const API_BASE = resolveApiBase();

const TOKEN_KEY = "accessToken";
const USER_KEY = "adminUser";

/** GET in-flight collapse (Strict Mode remounts + overlapping widgets). */
const inflightGets = new Map<string, Promise<unknown>>();
let rateLimitedUntil = 0;

export function isApiRateLimited() {
  return Date.now() < rateLimitedUntil;
}

export function getRateLimitWaitMs() {
  return Math.max(0, rateLimitedUntil - Date.now());
}

function markRateLimited(res: Response) {
  const raw = res.headers.get("Retry-After");
  const sec = raw ? Number(raw) : NaN;
  const waitMs =
    Number.isFinite(sec) && sec > 0 ? Math.min(sec * 1000, 120000) : 45000;
  rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + waitMs);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;
  const method = String(rest.method || "GET").toUpperCase();
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  if (method === "GET" && body === undefined) {
    const existing = inflightGets.get(url);
    if (existing) return existing as Promise<T>;
  }

  const run = (async () => {
    const headers = new Headers(customHeaders);

    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (auth) {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const res = await fetch(url, {
      credentials: "include",
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { message: text };
      }
    }

    if (!res.ok) {
      if (res.status === 429) markRateLimited(res);
      const errBody = (parsed || {}) as ApiErrorBody;
      throw new ApiError(
        res.status,
        errBody.message || errBody.error || `Request failed (${res.status})`,
        errBody
      );
    }

    return parsed as T;
  })();

  if (method === "GET" && body === undefined) {
    inflightGets.set(url, run);
    void run.finally(() => {
      inflightGets.delete(url);
    });
  }

  return run;
}

export { API_BASE };
