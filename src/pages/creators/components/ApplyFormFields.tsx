import type { CreatorApplyFieldErrors, CreatorApplyInput } from "../schemas/creatorApply";
import {
  CREATOR_APPLY_FIELDS,
  CREATOR_TYPE_OPTIONS,
  GENRE_OPTIONS,
} from "../schemas/creatorApply";
import { genreLabel } from "../../../lib/mediaParts/genres";

const inputClass =
  "w-full rounded-xl border border-jevah-border bg-jevah-input px-4 py-3 text-sm text-jevah-text outline-none transition placeholder:text-jevah-text-muted focus:border-jevah-accent focus:ring-2 focus:ring-jevah-accent/15";

const inputErrorClass =
  "border-red-400/70 focus:border-red-400 focus:ring-red-400/20";

type Props = {
  values: CreatorApplyInput;
  errors: CreatorApplyFieldErrors;
  busy: boolean;
  onChange: (
    key: keyof CreatorApplyInput,
    value: CreatorApplyInput[keyof CreatorApplyInput]
  ) => void;
  onToggleType: (id: CreatorApplyInput["creatorTypes"][number]) => void;
  onToggleGenre: (g: (typeof GENRE_OPTIONS)[number]) => void;
};

function FieldLabel({
  field,
}: {
  field: keyof typeof CREATOR_APPLY_FIELDS;
}) {
  const meta = CREATOR_APPLY_FIELDS[field];
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-sm font-medium text-jevah-text">{meta.label}</span>
      {meta.required ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-jevah-accent">
          Required
        </span>
      ) : (
        <span className="text-[10px] font-medium uppercase tracking-wider text-jevah-text-muted">
          Optional
        </span>
      )}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
      {message}
    </p>
  );
}

export default function ApplyFormFields({
  values,
  errors,
  busy,
  onChange,
  onToggleType,
  onToggleGenre,
}: Props) {
  return (
    <div className="space-y-7">
      <section>
        <FieldLabel field="creatorTypes" />
        <div className="grid gap-2 sm:grid-cols-3">
          {CREATOR_TYPE_OPTIONS.map((t) => {
            const on = values.creatorTypes.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                disabled={busy}
                onClick={() => onToggleType(t.id)}
                aria-pressed={on}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  on
                    ? "border-jevah-accent bg-jevah-accent text-white shadow-sm"
                    : "border-jevah-border bg-jevah-surface text-jevah-text hover:border-jevah-accent/40"
                }`}
              >
                <span className="block text-sm font-semibold">{t.label}</span>
                <span
                  className={`mt-0.5 block text-[11px] ${
                    on ? "text-white/80" : "text-jevah-text-muted"
                  }`}
                >
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError message={errors.creatorTypes} />
      </section>

      <label className="block">
        <FieldLabel field="displayName" />
        <input
          value={values.displayName}
          onChange={(e) => onChange("displayName", e.target.value)}
          disabled={busy}
          autoComplete="nickname"
          className={`${inputClass} ${errors.displayName ? inputErrorClass : ""}`}
          placeholder="Grace Collective"
          aria-invalid={Boolean(errors.displayName)}
        />
        <FieldError message={errors.displayName} />
      </label>

      <section>
        <FieldLabel field="genres" />
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const on = values.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                disabled={busy}
                onClick={() => onToggleGenre(g)}
                aria-pressed={on}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  on
                    ? "bg-jevah-brand text-white"
                    : "border border-jevah-border text-jevah-text-muted hover:border-jevah-accent/40"
                }`}
              >
                {genreLabel(g)}
              </button>
            );
          })}
        </div>
        <FieldError message={errors.genres} />
      </section>

      <label className="block">
        <FieldLabel field="bio" />
        <textarea
          rows={4}
          value={values.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          disabled={busy}
          className={`${inputClass} ${errors.bio ? inputErrorClass : ""}`}
          placeholder="Gospel worship from Lagos. Leading youth nights since 2019."
          maxLength={500}
          aria-invalid={Boolean(errors.bio)}
        />
        <div className="mt-1 flex justify-between gap-2">
          <FieldError message={errors.bio} />
          <p className="ml-auto text-[10px] text-jevah-text-muted">
            {values.bio.trim().length}/500
          </p>
        </div>
      </label>

      <section>
        <p className="mb-2 text-sm font-medium text-jevah-text">
          Social proof
          <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-jevah-text-muted">
            Optional
          </span>
        </p>
        <p className="mb-3 text-xs text-jevah-text-muted">
          Handles or profile URLs help reviewers verify you — same as Spotify for
          Artists social links.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-jevah-text-muted">
              Instagram
            </span>
            <input
              value={values.instagram}
              onChange={(e) => onChange("instagram", e.target.value)}
              disabled={busy}
              className={`${inputClass} ${errors.instagram ? inputErrorClass : ""}`}
              placeholder="@yourname"
              aria-invalid={Boolean(errors.instagram)}
            />
            <FieldError message={errors.instagram} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-jevah-text-muted">
              YouTube
            </span>
            <input
              value={values.youtube}
              onChange={(e) => onChange("youtube", e.target.value)}
              disabled={busy}
              className={`${inputClass} ${errors.youtube ? inputErrorClass : ""}`}
              placeholder="channel URL or @handle"
              aria-invalid={Boolean(errors.youtube)}
            />
            <FieldError message={errors.youtube} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-jevah-text-muted">
              Spotify
            </span>
            <input
              value={values.spotify}
              onChange={(e) => onChange("spotify", e.target.value)}
              disabled={busy}
              className={`${inputClass} ${errors.spotify ? inputErrorClass : ""}`}
              placeholder="open.spotify.com/artist/…"
              aria-invalid={Boolean(errors.spotify)}
            />
            <FieldError message={errors.spotify} />
          </label>
        </div>
      </section>

      <label className="block">
        <FieldLabel field="avatarUrl" />
        <input
          value={values.avatarUrl}
          onChange={(e) => onChange("avatarUrl", e.target.value)}
          disabled={busy}
          className={`${inputClass} ${errors.avatarUrl ? inputErrorClass : ""}`}
          placeholder="https://…"
          aria-invalid={Boolean(errors.avatarUrl)}
        />
        <FieldError message={errors.avatarUrl} />
      </label>

      <label className="block">
        <FieldLabel field="applicationNote" />
        <textarea
          rows={3}
          value={values.applicationNote}
          onChange={(e) => onChange("applicationNote", e.target.value)}
          disabled={busy}
          className={`${inputClass} ${
            errors.applicationNote ? inputErrorClass : ""
          }`}
          placeholder="We lead youth worship at…"
          maxLength={1000}
          aria-invalid={Boolean(errors.applicationNote)}
        />
        <FieldError message={errors.applicationNote} />
      </label>
    </div>
  );
}
