import {
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "./ui";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional header illustration / icon chip */
  icon?: ReactNode;
  /** Wider sheet for upload / inspect forms */
  size?: "md" | "lg" | "xl";
  /** Prevent close while submitting */
  busy?: boolean;
};

/**
 * Animated admin sheet modal with visible backdrop, escape-to-close,
 * and body scroll lock. Supports enter + exit transitions.
 */
export default function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  icon,
  size = "md",
  busy = false,
}: AdminModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, busy, onClose]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  function requestClose() {
    if (busy) return;
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className={cn(
          "absolute inset-0 bg-[var(--jevah-overlay)] backdrop-blur-md transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col overflow-hidden rounded-t-3xl border border-jevah-border/80 bg-jevah-surface/95 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 ease-out sm:rounded-3xl",
          size === "xl"
            ? "max-w-none sm:max-w-2xl"
            : size === "lg"
              ? "max-w-none sm:max-w-xl"
              : "max-w-none sm:max-w-md",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-[0.96] opacity-0 sm:translate-y-4"
        )}
      >
        {/* Top glowing brand accent gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-jevah-accent via-[#4ECDC4] to-emerald-500" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-jevah-border/60 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3.5">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/25 shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0 pt-0.5">
              <h3
                id={titleId}
                className="text-lg font-bold tracking-tight text-jevah-text"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-jevah-text-muted">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-jevah-text-muted transition-all duration-200 hover:bg-jevah-card hover:text-jevah-text hover:rotate-90 active:scale-95 disabled:opacity-40"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-jevah-border/60 bg-jevah-surface/95 px-5 py-4 backdrop-blur-md sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
