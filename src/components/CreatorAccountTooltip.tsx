import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  InformationCircleIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function useNarrow() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export default function CreatorAccountTooltip({
  children,
  triggerText = "Have a normal Jevah account?",
  variant = "inline",
}: {
  children?: ReactNode;
  triggerText?: string;
  variant?: "inline" | "badge" | "banner";
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placed, setPlaced] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mobile = useNarrow();

  function close() {
    setOpen(false);
    setPlaced(false);
  }

  function placePanel() {
    const trigger = triggerRef.current;
    if (!trigger || mobile) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 32);
    const height = panelRef.current?.offsetHeight || 280;
    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - 16 - width;
    }
    if (left < 16) left = 16;
    let top = rect.bottom + 10;
    if (top + height > window.innerHeight - 16) {
      top = Math.max(16, rect.top - height - 10);
    }
    setCoords({ top, left });
  }

  useLayoutEffect(() => {
    if (!open) return;
    if (mobile) {
      setPlaced(true);
      return;
    }
    placePanel();
    setPlaced(true);
  }, [open, mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onReposition = () => {
      if (!mobile) placePanel();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, mobile]);

  const panel =
    open && placed
      ? createPortal(
          <div className="fixed inset-0 z-[998]">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close"
              onClick={close}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={
                mobile
                  ? "absolute left-1/2 top-1/2 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-amber-400/35 bg-[#0e1620] p-4 text-slate-100 shadow-2xl"
                  : "absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-amber-400/35 bg-[#0e1620] p-4 text-slate-100 shadow-2xl"
              }
              style={mobile ? undefined : { top: coords.top, left: coords.left }}
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                    <SparklesIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h4
                      id={titleId}
                      className="text-xs font-bold uppercase tracking-wider text-amber-400"
                    >
                      Have a Jevah account?
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      One email and password for everything
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-200">
                <p>
                  If you aren’t an approved creator yet, type your regular{" "}
                  <strong className="font-semibold text-amber-300">
                    Jevah account password
                  </strong>{" "}
                  in the password box.
                </p>
                <p className="text-slate-300">
                  Sign in takes you to apply as an artist. You don’t need a second
                  account.
                </p>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-200">
                  <span>Listener password</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="font-semibold text-amber-300">
                    Artist application
                  </span>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="w-full rounded-xl bg-amber-400 py-2 text-xs font-bold text-slate-950"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    onClick: () => setOpen((v) => !v),
    onMouseEnter: () => {
      if (!mobile) setOpen(true);
    },
    "aria-expanded": open,
  };

  if (variant === "banner") {
    return (
      <>
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              Not a creator yet?
            </span>{" "}
            <span className="text-jevah-text-muted">
              Use your regular Jevah password. Sign-in sends you to apply.
            </span>
          </div>
          <button
            {...triggerProps}
            className="shrink-0 rounded-xl bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300"
          >
            How it works
          </button>
        </div>
        {panel}
      </>
    );
  }

  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        {children}
        <button
          {...triggerProps}
          aria-label="How signing in works for listeners"
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-[var(--jevah-auth-creator-accent)]"
        >
          <InformationCircleIcon className="h-3.5 w-3.5 text-amber-500" />
          <span>{triggerText}</span>
        </button>
      </span>
      {panel}
    </>
  );
}
