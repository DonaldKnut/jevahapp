import { useState, useRef, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useTheme, type ThemeMode } from "../context/ThemeContext";

const options: { mode: ThemeMode; label: string; icon: typeof SunIcon }[] = [
  { mode: "light", label: "Light", icon: SunIcon },
  { mode: "dark", label: "Dark", icon: MoonIcon },
  { mode: "system", label: "System", icon: ComputerDesktopIcon },
];

export default function ThemeToggle({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "icon";
  className?: string;
}) {
  const { mode, resolved, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const ActiveIcon =
    resolved === "dark" ? MoonIcon : SunIcon;

  if (variant === "icon") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--jevah-border)] bg-[var(--jevah-surface)] text-[var(--jevah-text-muted)] transition hover:border-[var(--jevah-accent)]/40 hover:text-[var(--jevah-accent)]"
          aria-label="Change theme"
        >
          <ActiveIcon className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-[var(--jevah-border)] bg-[var(--jevah-elevated)] p-1 shadow-xl shadow-black/10">
            {options.map(({ mode: m, label, icon: Icon }) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  mode === m
                    ? "bg-[var(--jevah-accent)]/10 text-[var(--jevah-accent)]"
                    : "text-[var(--jevah-text-muted)] hover:bg-[var(--jevah-surface-muted)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--jevah-border)] bg-[var(--jevah-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--jevah-text-muted)] transition hover:border-[var(--jevah-accent)]/30 hover:text-[var(--jevah-accent)]"
        aria-label="Change theme"
      >
        <ActiveIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline capitalize">{mode}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-[var(--jevah-border)] bg-[var(--jevah-elevated)] p-1 shadow-xl shadow-black/10">
          {options.map(({ mode: m, label, icon: Icon }) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                mode === m
                  ? "bg-[var(--jevah-accent)]/10 text-[var(--jevah-accent)]"
                  : "text-[var(--jevah-text-muted)] hover:bg-[var(--jevah-surface-muted)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
