import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button, cn, inputClass } from "./ui";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  FeedbackContext,
  type ConfirmOptions,
  type PromptOptions,
  type ToastTone,
} from "./feedbackContext";

export { useFeedback } from "./feedbackContext";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const toneIcon = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const toneStyles = {
  success:
    "border-emerald-500/30 bg-emerald-950/85 text-emerald-100 backdrop-blur-xl shadow-2xl shadow-emerald-950/30 ring-1 ring-emerald-400/20 dark:border-emerald-500/40 dark:bg-[#0c1a16]/90 dark:text-emerald-100",
  error:
    "border-rose-500/40 bg-rose-950/85 text-rose-100 backdrop-blur-xl shadow-2xl shadow-rose-950/40 ring-1 ring-rose-400/30 dark:border-rose-500/50 dark:bg-[#1f0a0d]/90 dark:text-rose-100",
  warning:
    "border-amber-500/30 bg-amber-950/85 text-amber-100 backdrop-blur-xl shadow-2xl shadow-amber-950/30 ring-1 ring-amber-400/20 dark:border-amber-500/40 dark:bg-[#1d150b]/90 dark:text-amber-100",
  info:
    "border-sky-500/30 bg-sky-950/85 text-sky-100 backdrop-blur-xl shadow-2xl shadow-sky-950/30 ring-1 ring-sky-400/20 dark:border-sky-500/40 dark:bg-[#0b1724]/90 dark:text-sky-100",
};

const iconTone = {
  success: "text-emerald-400 dark:text-emerald-400",
  error: "text-rose-400 dark:text-rose-400",
  warning: "text-amber-400 dark:text-amber-400",
  info: "text-sky-400 dark:text-sky-400",
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [promptState, setPromptState] = useState<PromptOptions | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const confirmResolver = useRef<((value: boolean) => void) | null>(null);
  const promptResolver = useRef<((value: string | null) => void) | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = uid();
      setToasts((prev) => [...prev, { id, title, description, tone }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const toast = useMemo(
    () => ({
      success: (title: string, description?: string) =>
        pushToast("success", title, description),
      error: (title: string, description?: string) =>
        pushToast("error", title, description),
      warning: (title: string, description?: string) =>
        pushToast("warning", title, description),
      info: (title: string, description?: string) =>
        pushToast("info", title, description),
    }),
    [pushToast]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState(options);
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      promptResolver.current = resolve;
      setPromptValue(options.defaultValue || "");
      setPromptState(options);
    });
  }, []);

  function closeConfirm(result: boolean) {
    confirmResolver.current?.(result);
    confirmResolver.current = null;
    setConfirmState(null);
  }

  function closePrompt(result: string | null) {
    promptResolver.current?.(result);
    promptResolver.current = null;
    setPromptState(null);
    setPromptValue("");
  }

  useEffect(() => {
    if (!confirmState && !promptState) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (promptState) closePrompt(null);
        else if (confirmState) closeConfirm(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmState, promptState]);

  useEffect(() => {
    if (promptState) {
      window.setTimeout(() => promptInputRef.current?.focus(), 50);
    }
  }, [promptState]);

  useEffect(() => {
    const open = Boolean(confirmState || promptState);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [confirmState, promptState]);

  const value = useMemo(
    () => ({ toast, confirm, prompt }),
    [toast, confirm, prompt]
  );

  const portal =
    typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex flex-col items-end gap-2 p-3 sm:p-4"
              aria-live="polite"
            >
              {toasts.map((t) => {
                const Icon = toneIcon[t.tone];
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "pointer-events-auto flex w-full max-w-sm items-start gap-3.5 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3",
                      toneStyles[t.tone]
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                      <Icon className={cn("h-5 w-5", iconTone[t.tone])} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-extrabold tracking-tight">{t.title}</p>
                      {t.description && (
                        <p className="mt-1 text-xs leading-relaxed font-medium opacity-90">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissToast(t.id)}
                      className="rounded-lg p-1.5 opacity-70 transition hover:bg-white/15 hover:opacity-100"
                      aria-label="Dismiss"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {confirmState && (
              <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
                <button
                  type="button"
                  className="absolute inset-0 backdrop-blur-[2px] admin-fade-in"
                  style={{ backgroundColor: "var(--jevah-overlay)" }}
                  aria-label="Close dialog"
                  onClick={() => closeConfirm(false)}
                />
                <div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="admin-confirm-title"
                  className="relative w-full max-w-md rounded-t-3xl bg-jevah-surface p-6 shadow-2xl admin-sheet-in sm:rounded-2xl"
                >
                  <h2
                    id="admin-confirm-title"
                    className="text-lg font-semibold text-jevah-text"
                  >
                    {confirmState.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                    {confirmState.message}
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto"
                      onClick={() => closeConfirm(false)}
                    >
                      {confirmState.cancelLabel || "Cancel"}
                    </Button>
                    <Button
                      variant={
                        confirmState.tone === "danger"
                          ? "danger"
                          : confirmState.tone === "warning"
                            ? "warning"
                            : "primary"
                      }
                      className="w-full sm:w-auto"
                      onClick={() => closeConfirm(true)}
                    >
                      {confirmState.confirmLabel || "Confirm"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {promptState && (
              <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
                <button
                  type="button"
                  className="absolute inset-0 backdrop-blur-[2px] admin-fade-in"
                  style={{ backgroundColor: "var(--jevah-overlay)" }}
                  aria-label="Close dialog"
                  onClick={() => closePrompt(null)}
                />
                <form
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="admin-prompt-title"
                  className="relative w-full max-w-md rounded-t-3xl bg-jevah-surface p-6 shadow-2xl admin-sheet-in sm:rounded-2xl"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const next = promptValue.trim();
                    if (promptState.required !== false && !next) return;
                    closePrompt(next || promptState.defaultValue || "");
                  }}
                >
                  <h2
                    id="admin-prompt-title"
                    className="text-lg font-semibold text-jevah-text"
                  >
                    {promptState.title}
                  </h2>
                  {promptState.message && (
                    <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                      {promptState.message}
                    </p>
                  )}
                  <label className="mt-4 block text-sm font-medium text-jevah-text">
                    <span className="mb-1.5 block">
                      {promptState.label || "Value"}
                    </span>
                    <input
                      ref={promptInputRef}
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      placeholder={promptState.placeholder}
                      className={inputClass}
                      required={promptState.required !== false}
                    />
                  </label>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full sm:w-auto"
                      onClick={() => closePrompt(null)}
                    >
                      {promptState.cancelLabel || "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      variant={
                        promptState.tone === "danger"
                          ? "danger"
                          : promptState.tone === "warning"
                            ? "warning"
                            : "primary"
                      }
                      className="w-full sm:w-auto"
                    >
                      {promptState.confirmLabel || "Continue"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>,
          document.body
        )
      : null;

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {portal}
    </FeedbackContext.Provider>
  );
}

