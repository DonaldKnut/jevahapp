import { Button, inputClass, cn } from "../../../components/admin/ui";
import {
  BuildingLibraryIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export type ChurchOption = { id: string; name: string; email?: string };

type Props = {
  churchOptions: ChurchOption[];
  churchTotal: number;
  churchSearch: string;
  churchIds: Set<string>;
  churchesLoading: boolean;
  allVisibleSelected: boolean;
  onChurchSearchChange: (v: string) => void;
  onSearch: () => void;
  onToggleChurch: (id: string) => void;
  onSelectVisible: () => void;
  onClearVisible: () => void;
  onSelectAllInDb: () => void;
  onClearSelection: () => void;
  onLoadMore: () => void;
};

export default function ChurchRecipientPicker({
  churchOptions,
  churchTotal,
  churchSearch,
  churchIds,
  churchesLoading,
  allVisibleSelected,
  onChurchSearchChange,
  onSearch,
  onToggleChurch,
  onSelectVisible,
  onClearVisible,
  onSelectAllInDb,
  onClearSelection,
  onLoadMore,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-jevah-text">Church contacts</p>
        <p className="text-xs text-jevah-text-muted">
          {churchIds.size} selected
          {churchTotal > 0 ? ` · ${churchTotal} with email` : ""}
        </p>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
        <input
          value={churchSearch}
          onChange={(e) => onChurchSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch();
            }
          }}
          className={`${inputClass} pl-9`}
          placeholder="Search churches…"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 text-xs"
          onClick={onSearch}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-9 text-xs"
          disabled={!churchOptions.length}
          onClick={() =>
            allVisibleSelected ? onClearVisible() : onSelectVisible()
          }
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </Button>
        <Button
          type="button"
          variant="primary"
          className="min-h-9 text-xs"
          disabled={churchesLoading}
          onClick={onSelectAllInDb}
        >
          <BuildingLibraryIcon className="h-3.5 w-3.5" />
          Select all in DB
        </Button>
        {churchIds.size > 0 && (
          <Button
            type="button"
            variant="ghost"
            className="min-h-9 text-xs"
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
        )}
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-jevah-border bg-jevah-card p-2 sm:max-h-72">
        {churchesLoading && churchOptions.length === 0 ? (
          <p className="p-4 text-center text-sm text-jevah-text-muted">
            Loading churches…
          </p>
        ) : churchOptions.length === 0 ? (
          <p className="p-4 text-center text-sm text-jevah-text-muted">
            No churches with contact emails found.
          </p>
        ) : (
          churchOptions.map((c) => {
            const on = churchIds.has(c.id);
            return (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  on ? "bg-jevah-accent/10" : "hover:bg-jevah-surface"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                    on
                      ? "border-jevah-accent bg-jevah-accent text-white"
                      : "border-jevah-border bg-jevah-surface"
                  )}
                >
                  {on && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => onToggleChurch(c.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-jevah-text">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-jevah-text-muted">
                    {c.email}
                  </span>
                </span>
              </label>
            );
          })
        )}
      </div>

      {churchOptions.length < churchTotal && (
        <Button
          type="button"
          variant="secondary"
          className="w-full min-h-9 text-xs"
          disabled={churchesLoading}
          onClick={onLoadMore}
        >
          {churchesLoading ? "Loading…" : "Load more churches"}
        </Button>
      )}
    </div>
  );
}
