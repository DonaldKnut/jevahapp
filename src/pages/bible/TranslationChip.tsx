import { useState } from "react";
import { useBible } from "./BibleContext";
import TranslationSheet from "./TranslationSheet";

type Props = {
  className?: string;
};

export default function TranslationChip({ className = "" }: Props) {
  const { translations, currentTranslation, catalogFailed } = useBible();
  const [open, setOpen] = useState(false);

  if (catalogFailed || !translations.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-[#c4a574]/40 bg-white/80 px-3 text-xs font-extrabold tracking-wide text-[#1f2a24] shadow-sm backdrop-blur-md hover:border-[#256E63] dark:bg-white/10 dark:text-[#e4ebe9] ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Translation: ${currentTranslation?.name || "World English Bible"}`}
      >
        {currentTranslation?.abbreviation || "WEB"}
        <span className="text-[#9a7b3c] dark:text-[#c8d5d2]" aria-hidden>
          ▾
        </span>
      </button>
      <TranslationSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
