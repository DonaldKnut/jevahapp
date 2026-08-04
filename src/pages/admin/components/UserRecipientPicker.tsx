import type { AdminUser } from "../../../types/admin";
import { Button, Field, inputClass, cn } from "../../../components/admin/ui";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function userLabel(u: AdminUser) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return name || u.username || u.email;
}

type Props = {
  users: AdminUser[];
  userTotal: number;
  userSearch: string;
  selectedUserIds: Set<string>;
  selectedUsers: AdminUser[];
  usersLoading: boolean;
  manualEmails: string;
  allVisibleSelected: boolean;
  onUserSearchChange: (v: string) => void;
  onSearch: () => void;
  onToggleUser: (id: string) => void;
  onSelectVisible: () => void;
  onClearVisible: () => void;
  onSelectAllInDb: () => void;
  onClearSelection: () => void;
  onLoadMore: () => void;
  onManualEmailsChange: (v: string) => void;
};

export default function UserRecipientPicker({
  users,
  userTotal,
  userSearch,
  selectedUserIds,
  selectedUsers,
  usersLoading,
  manualEmails,
  allVisibleSelected,
  onUserSearchChange,
  onSearch,
  onToggleUser,
  onSelectVisible,
  onClearVisible,
  onSelectAllInDb,
  onClearSelection,
  onLoadMore,
  onManualEmailsChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-jevah-text">
          Recipients from users
        </p>
        <p className="text-xs text-jevah-text-muted">
          {selectedUserIds.size} selected
          {userTotal > 0 ? ` · ${userTotal} in directory` : ""}
        </p>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
        <input
          value={userSearch}
          onChange={(e) => onUserSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSearch();
            }
          }}
          className={`${inputClass} pl-9`}
          placeholder="Search users by name or email…"
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
          disabled={!users.length}
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
          disabled={usersLoading}
          onClick={onSelectAllInDb}
        >
          <UserGroupIcon className="h-3.5 w-3.5" />
          Select all in DB
        </Button>
        {selectedUserIds.size > 0 && (
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
        {usersLoading && users.length === 0 ? (
          <p className="p-4 text-center text-sm text-jevah-text-muted">
            Loading users…
          </p>
        ) : users.length === 0 ? (
          <p className="p-4 text-center text-sm text-jevah-text-muted">
            No users with emails found.
          </p>
        ) : (
          users.map((u) => {
            const on = selectedUserIds.has(u.id);
            return (
              <label
                key={u.id}
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
                  onChange={() => onToggleUser(u.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-jevah-text">
                    {userLabel(u)}
                  </span>
                  <span className="block truncate text-xs text-jevah-text-muted">
                    {u.email}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-jevah-text-muted">
                  {u.role}
                </span>
              </label>
            );
          })
        )}
      </div>

      {users.length < userTotal && (
        <Button
          type="button"
          variant="secondary"
          className="w-full min-h-9 text-xs"
          disabled={usersLoading}
          onClick={onLoadMore}
        >
          {usersLoading ? "Loading…" : "Load more users"}
        </Button>
      )}

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.slice(0, 8).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onToggleUser(u.id)}
              className="rounded-full bg-jevah-accent/10 px-2.5 py-1 text-[11px] font-semibold text-jevah-accent ring-1 ring-jevah-accent/20"
              title="Remove"
            >
              {u.email} ×
            </button>
          ))}
          {selectedUsers.length > 8 && (
            <span className="rounded-full bg-jevah-card px-2.5 py-1 text-[11px] text-jevah-text-muted">
              +{selectedUsers.length - 8} more
            </span>
          )}
        </div>
      )}

      <Field
        label="Extra emails (optional)"
        helperText="Addresses not in the user directory — commas, semicolons, or new lines"
      >
        <textarea
          rows={2}
          value={manualEmails}
          onChange={(e) => onManualEmailsChange(e.target.value)}
          className={inputClass}
          placeholder="guest@example.com"
        />
      </Field>
    </div>
  );
}
