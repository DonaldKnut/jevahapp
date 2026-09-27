import {
  RIGHTS_TYPE_OPTIONS,
  type RightsAttestation,
  type UploadPolicy,
} from "../../../lib/uploadPolicy";

type Props = {
  policy: UploadPolicy;
  value: RightsAttestation;
  onChange: (next: RightsAttestation) => void;
  error?: string | null;
  disabled?: boolean;
};

function CheckRow({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-4 transition hover:bg-jevah-card/70 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-jevah-border text-jevah-accent focus:ring-jevah-accent/30"
      />
      <span className="text-sm font-semibold leading-snug text-jevah-text">
        {label}
      </span>
    </label>
  );
}

export default function UploadRightsGate({
  policy,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  return (
    <div className="space-y-3 overflow-hidden rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-6 shadow-[0_4px_20px_var(--jevah-shadow)]">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-jevah-text">
          Rights & gospel
        </h2>
        <p className="mt-1 text-xs font-medium text-jevah-text-muted">
          Required before we accept the file. Checking the box is a dated legal
          record — it does not prove ownership from the audio.
        </p>
      </div>

      <CheckRow
        checked={value.rightsAttested}
        disabled={disabled}
        onChange={(rightsAttested) => onChange({ ...value, rightsAttested })}
        label={policy.rightsCopy}
      />
      <CheckRow
        checked={value.gospelAttested}
        disabled={disabled}
        onChange={(gospelAttested) => onChange({ ...value, gospelAttested })}
        label={policy.gospelCopy}
      />

      <label className="block space-y-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-jevah-text-muted">
          How you hold the rights
        </span>
        <select
          value={value.rightsType}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              ...value,
              rightsType: e.target.value as RightsAttestation["rightsType"],
            })
          }
          className="h-11 w-full rounded-2xl border border-jevah-border/80 bg-jevah-card/60 px-3 text-sm font-bold text-jevah-text focus:border-jevah-accent focus:outline-none focus:ring-2 focus:ring-jevah-accent/20 disabled:opacity-60"
        >
          <option value="">Select rights type…</option>
          {RIGHTS_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {value.rightsType === "licensed" && (
        <label className="block space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-jevah-text-muted">
            License note
          </span>
          <input
            type="text"
            value={value.licenseNote}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, licenseNote: e.target.value })}
            placeholder="Who licensed it, or the license name"
            className="h-11 w-full rounded-2xl border border-jevah-border/80 bg-jevah-card/60 px-3 text-sm font-bold text-jevah-text placeholder:text-jevah-text-muted/70 focus:border-jevah-accent focus:outline-none focus:ring-2 focus:ring-jevah-accent/20 disabled:opacity-60"
          />
        </label>
      )}

      {error ? (
        <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
