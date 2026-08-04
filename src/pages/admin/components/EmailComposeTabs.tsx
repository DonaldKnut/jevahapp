import { Link } from "react-router-dom";
import { cn } from "../../../components/admin/ui";
import {
  EnvelopeIcon,
  MegaphoneIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  {
    to: "/admin/email",
    label: "Ops / 1:1",
    desc: "Users, churches — no marketing filter",
    icon: EnvelopeIcon,
    end: true,
  },
  {
    to: "/admin/email/marketing",
    label: "Marketing",
    desc: "Opted-in users only + unsubscribe footer",
    icon: MegaphoneIcon,
    end: false,
  },
  {
    to: "/admin/email/artist-onboard",
    label: "Artist onboard",
    desc: "Creator invite — not marketing opt-out",
    icon: MusicalNoteIcon,
    end: false,
  },
] as const;

export default function EmailComposeTabs({ active }: { active: string }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-3xl border border-jevah-border bg-jevah-card p-1.5 sm:grid-cols-3">
      {tabs.map(({ to, label, desc, icon: Icon }) => {
        const on = active === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-2xl p-3.5 text-left transition",
              on
                ? "bg-jevah-surface shadow-sm"
                : "text-jevah-text-muted hover:text-jevah-text"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={cn("h-4 w-4", on && "text-jevah-accent")}
              />
              <span className="text-sm font-bold text-jevah-text">{label}</span>
            </div>
            <span className="text-[11px] opacity-70">{desc}</span>
          </Link>
        );
      })}
    </div>
  );
}
