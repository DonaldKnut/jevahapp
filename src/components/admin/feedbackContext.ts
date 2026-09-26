import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "warning" | "info";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "warning";
};

export type PromptOptions = {
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  tone?: "danger" | "primary" | "warning";
};

export type FeedbackContextValue = {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const silentToast = {
  success: () => undefined,
  error: () => undefined,
  warning: () => undefined,
  info: () => undefined,
};

const fallback: FeedbackContextValue = {
  toast: silentToast,
  confirm: async () => false,
  prompt: async () => null,
};

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  return useContext(FeedbackContext) ?? fallback;
}
