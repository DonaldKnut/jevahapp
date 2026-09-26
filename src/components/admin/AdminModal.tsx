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
  size?: "md" | "lg" | "xl" | "full";
  /** Prevent close while submitting */
  busy?: boolean;
  /** Solid white panel — readable over dark dashboards */
  paper?: boolean;
  /** Theme tone — "brand" uses Jevah's signature dark/gold gradient background */
  tone?: "default" | "brand" | "paper";
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
  paper = false,
  tone,
}: AdminModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  const isBrand = tone === "brand";
  const isPaper = paper || tone === "paper";

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
          "relative z-10 flex max-h-[min(92dvh,900px)] w-full flex-col overflow-hidden rounded-t-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out sm:rounded-3xl",
          isPaper
            ? "border-slate-200 bg-white text-slate-900"
            : isBrand
              ? "border-amber-400/40 bg-gradient-to-b from-[#0a1f24] via-[#071518] to-[#04090c] text-white backdrop-blur-2xl shadow-[0_32px_90px_rgba(0,0,0,0.65)]"
              : "border-jevah-border bg-jevah-surface text-jevah-text",
          size === "xl" || size === "full"
            ? size === "full"
              ? "max-w-none sm:max-w-6xl"
              : "max-w-none sm:max-w-2xl"
            : size === "lg"
              ? "max-w-none sm:max-w-xl"
              : "max-w-none sm:max-w-md",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-[0.96] opacity-0 sm:translate-y-4"
        )}
      >
        {/* Top glowing brand accent gradient */}
        <div
          className={cn(
            "h-1 w-full",
            isBrand
              ? "bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400"
              : "bg-gradient-to-r from-jevah-accent via-[#4ECDC4] to-emerald-500"
          )}
        />

        <div
          className={cn(
            "flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4 sm:px-6",
            isPaper
              ? "border-slate-200 bg-white"
              : isBrand
                ? "border-white/15 bg-black/20"
                : "border-jevah-border bg-jevah-surface"
          )}
        >
          <div className="flex min-w-0 items-start gap-3.5">
            {icon && (
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                  isBrand
                    ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30 shadow-amber-400/10"
                    : "bg-gradient-to-br from-jevah-accent/20 to-teal-500/10 text-jevah-accent ring-1 ring-jevah-accent/25"
                )}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0 pt-0.5">
              <h3
                id={titleId}
                className={cn(
                  "text-lg font-black tracking-tight",
                  isPaper ? "text-slate-900" : isBrand ? "text-white" : "text-jevah-text"
                )}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  className={cn(
                    "mt-0.5 text-xs font-semibold leading-relaxed",
                    isPaper
                      ? "text-slate-500"
                      : isBrand
                        ? "text-amber-200/90"
                        : "text-jevah-text-muted"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:rotate-90 active:scale-95 disabled:opacity-40",
              isPaper
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : isBrand
                  ? "text-white/70 hover:bg-white/15 hover:text-white"
                  : "text-jevah-text-muted hover:bg-jevah-card hover:text-jevah-text"
            )}
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6",
            isPaper && "bg-white",
            isBrand && "bg-[#061114]",
            !isPaper && !isBrand && "bg-jevah-surface"
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              "shrink-0 border-t px-5 py-4 sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-4",
              isPaper
                ? "border-slate-200 bg-white"
                : isBrand
                  ? "border-white/15 bg-[#071114]"
                  : "border-jevah-border bg-jevah-elevated"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

