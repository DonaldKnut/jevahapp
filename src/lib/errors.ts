import { ApiError } from "./api";

/** Normalize thrown values into a user-facing message. */
export function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

type ErrorToast = {
  error: (title: string, detail?: string) => void;
};

/** One toast for a failed request. Do not also render an inline banner. */
export function toastApiError(
  toast: ErrorToast,
  title: string,
  err: unknown,
  fallback: string
) {
  toast.error(title, getErrorMessage(err, fallback));
}
