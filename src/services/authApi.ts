import { apiRequest } from "../lib/api";
import type { AdminUser, LoginResponse } from "../types/admin";

export type RegisterBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe?: boolean;
  source?: "creators_web" | "ios" | "android" | "web";
};

export type RegistrationStatus = {
  success?: boolean;
  registrationEnabled: boolean;
  message?: string | null;
};

export async function registrationStatusRequest() {
  return apiRequest<RegistrationStatus>("/auth/registration-status", {
    method: "GET",
    auth: false,
  });
}

export async function registerRequest(body: RegisterBody) {
  return apiRequest<LoginResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body,
  });
}

export async function verifyEmailRequest(body: {
  code: string;
  email?: string;
}) {
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));
  return apiRequest<LoginResponse>("/auth/verify-email", {
    method: "POST",
    auth: hasToken,
    body: hasToken
      ? { code: body.code }
      : { email: body.email, code: body.code },
  });
}

export async function resendVerificationRequest(email: string) {
  return apiRequest<{
    success?: boolean;
    message?: string;
    retryAfterSec?: number;
  }>("/auth/resend-verification", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function forgotPasswordRequest(email: string) {
  return apiRequest<{ success?: boolean; message?: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      auth: false,
      body: { email },
    }
  );
}

export async function resetPasswordRequest(token: string, password: string) {
  return apiRequest<{ success?: boolean; message?: string }>(
    "/auth/reset-password",
    {
      method: "POST",
      auth: false,
      body: { token, password },
    }
  );
}

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
