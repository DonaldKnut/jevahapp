import { apiRequest } from "../lib/api";
import type { AdminUser, LoginResponse } from "../types/admin";

export async function loginRequest(
  email: string,
  password: string,
  rememberMe = false
) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password, rememberMe },
  });
}

export async function meRequest() {
  return apiRequest<{ success?: boolean; user: AdminUser } | AdminUser>(
    "/auth/me",
    { method: "GET" }
  );
}

export async function logoutRequest() {
  return apiRequest<{ success?: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function refreshRequest() {
  return apiRequest<{
    success?: boolean;
    accessToken?: string;
    token?: string;
  }>("/auth/refresh", { method: "POST" });
}

export function unwrapUser(
  payload: { success?: boolean; user: AdminUser } | AdminUser
): AdminUser {
  if (payload && typeof payload === "object" && "user" in payload && payload.user) {
    return payload.user;
  }
  return payload as AdminUser;
}
