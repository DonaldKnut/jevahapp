import { Link } from "react-router-dom";
import { LockClosedIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";

export default function AuthPortalTabs({
  active,
}: {
  active: "admin" | "creator";
}) {
  const tabs = [
    {
      id: "admin" as const,
      label: "Admin Console",
      to: "/login",
      icon: LockClosedIcon,
    },
    {
      id: "creator" as const,
      label: "Creator Studio",
      to: "/creators/login",
      icon: MusicalNoteIcon,
    },
  ];

  return (
    <div
      className="mb-6 flex rounded-2xl border border-jevah-border p-1"
      style={{ backgroundColor: "var(--jevah-mobile-section-bg)" }}
      role="tablist"
      aria-label="Sign-in portal"
    >
      {tabs.map(({ id, label, to, icon: Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            to={to}
            role="tab"
            aria-selected={isActive}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-xs font-bold transition sm:text-sm ${
              isActive
                ? id === "creator"
                  ? "bg-[var(--jevah-auth-creator-accent)] text-white shadow-sm"
                  : "bg-jevah-accent text-white shadow-sm"
                : "text-jevah-text-muted hover:text-jevah-text"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
