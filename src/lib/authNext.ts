import type { AdminUser, ApiErrorBody, AuthNextStep } from "../types/admin";

const VERIFY_EMAIL_KEY = "jevah.verifyEmail";
const VERIFY_NAME_KEY = "jevah.verifyFirstName";

export function fieldErrorsFromBody(
  body: ApiErrorBody | null | undefined
): Record<string, string> {
  return body?.fields ?? {};
}

export function rememberVerifyEmail(email: string, firstName?: string) {
  try {
    sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
    if (firstName) sessionStorage.setItem(VERIFY_NAME_KEY, firstName);
  } catch {
    /* private mode */
  }
}

export function readVerifyEmail(): { email: string; firstName: string } {
  try {
    return {
      email: sessionStorage.getItem(VERIFY_EMAIL_KEY) || "",
      firstName: sessionStorage.getItem(VERIFY_NAME_KEY) || "",
    };
  } catch {
    return { email: "", firstName: "" };
  }
}

export function needsEmailVerification(user: AdminUser | null | undefined) {
  if (!user) return false;
  return user.isEmailVerified === false || user.nextStep === "verify_email";
}

export function creatorDestination(
  user: AdminUser | null | undefined,
  fallback = "/creators/apply"
): string {
  if (!user) return "/creators/login";
  if (user.isBanned) return "/contact";
  if (needsEmailVerification(user)) return "/creators/verify";

  const step = user.nextStep as AuthNextStep | undefined;
  switch (step) {
    case "apply":
      return "/creators/apply";
    case "wait_review":
    case "studio":
      return "/creators/studio";
    case "home":
      return "/creators";
    case "contact_support":
      return "/contact";
    default:
      return fallback;
  }
}

/** Honor an in-app `from` only after email is verified. */
export function safeCreatorFrom(
  from: string | undefined,
  user: AdminUser | null | undefined
): string {
  if (needsEmailVerification(user)) return "/creators/verify";
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return creatorDestination(user);
  }
  if (!from.startsWith("/creators")) return creatorDestination(user);
  return from;
}
