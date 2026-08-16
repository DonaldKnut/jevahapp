import {
  Bars3BottomLeftIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import type { MusicView } from "../../lib/musicView";

function DiscIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

const OPTIONS: {
  id: MusicView;
  label: string;
  hint: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    id: "list",
    label: "List",
    hint: "Editorial rows",
    Icon: Bars3BottomLeftIcon,
  },
  {
    id: "gallery",
    label: "Gallery",
    hint: "Cover grid",
    Icon: Squares2X2Icon,
  },
  {
    id: "salon",
    label: "Salon",
    hint: "Vinyl stage",
    Icon: DiscIcon,
  },
];

export function MusicViewToggle({
  value,
  onChange,
}: {
  value: MusicView;
  onChange: (view: MusicView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Catalog view"
      className="inline-flex items-center rounded-full border border-jevah-border/80 bg-jevah-card/80 p-1 shadow-sm backdrop-blur-md"
    >
      {OPTIONS.map(({ id, label, hint, Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            title={hint}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition ${
              selected
                ? "bg-jevah-text text-jevah-surface shadow-sm"
                : "text-jevah-text-muted hover:text-jevah-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
