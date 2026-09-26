import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const LEN = 6;

export default function OtpBoxes({
  value,
  onChange,
  disabled,
  shake,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  shake?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LEN }, (_, i) => value[i] ?? "");

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, LEN));
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!text) return;
    onChange(text);
    const focusAt = Math.min(text.length, LEN - 1);
    refs.current[focusAt]?.focus();
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < LEN - 1) refs.current[index + 1]?.focus();
  }

  return (
    <div
      className={`flex justify-between gap-2 ${shake ? "animate-pulse" : ""}`}
      role="group"
      aria-label="Verification code"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={d}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, "").slice(-1);
            setDigit(i, char);
            if (char && i < LEN - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          className={`h-12 w-11 rounded-xl border text-center text-lg font-extrabold text-jevah-text outline-none transition sm:h-14 sm:w-12 ${
            shake
              ? "border-red-400 bg-red-50 dark:bg-red-500/10"
              : "border-jevah-border bg-jevah-elevated focus:border-[var(--jevah-auth-creator-accent)] focus:ring-2 focus:ring-amber-400/25"
          }`}
        />
      ))}
    </div>
  );
}
