import { ApiError } from "./api";

/** Normalize thrown values into a user-facing message. */
export function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
