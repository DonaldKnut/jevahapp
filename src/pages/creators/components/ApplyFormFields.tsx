import { useRef, useState, type ComponentType, type FormEvent } from "react";
import type {
  CreatorApplyFieldErrors,
  CreatorApplyInput,
} from "../schemas/creatorApply";
import {
  CREATOR_APPLY_FIELDS,
  CREATOR_TYPE_OPTIONS,
  GENRE_OPTIONS,
} from "../schemas/creatorApply";
import { CREATOR_ROLE_ART } from "../roleArt";
import { genreLabel } from "../../../lib/mediaParts/genres";
import { IMAGE_ACCEPT } from "../../../lib/media";
import ApplyBioEditor from "./ApplyBioEditor";
import {
  MusicalNoteIcon,
  MicrophoneIcon,
  RadioIcon,
  CheckIcon,
  CameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#08131d] px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/15";

const inputErrorClass =
  "border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/15";

type CreatorTypeId = CreatorApplyInput["creatorTypes"][number];
type IconCmp = ComponentType<{ className?: string }>;

type Props = {
  values: CreatorApplyInput;
  errors: CreatorApplyFieldErrors;
  busy: boolean;
  onChange: (
    key: keyof CreatorApplyInput,
    value: CreatorApplyInput[keyof CreatorApplyInput]
  ) => void;
  onToggleType: (id: CreatorTypeId) => void;
  onToggleGenre: (g: string) => void;
  onAddCustomGenre: (raw: string) => boolean;
  avatarPreview: string | null;
  onPickAvatar: (file: File) => void;
  onClearAvatar: () => void;
};

const ROLE_ICON: Record<CreatorTypeId, IconCmp> = {
  artist: MusicalNoteIcon,
  minister: MicrophoneIcon,
  podcaster: RadioIcon,
};

function FieldLabel({
  field,
}: {
  field: keyof typeof CREATOR_APPLY_FIELDS;
}) {
  const meta = CREATOR_APPLY_FIELDS[field];
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold text-white">
        {meta.label}
        {meta.required ? (
          <span className="ml-1 text-amber-400" aria-hidden>
            *
          </span>
        ) : null}
      </span>
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-rose-300" role="alert">
      {message}
    </p>
  );
}

function sectionClass(error?: string) {
  return `rounded-2xl border bg-[#0c1822]/80 p-5 sm:p-6 ${
    error ? "border-rose-400/35" : "border-white/10"
  }`;
}

function ApplyPhotoPicker({
  preview,
  illustration,
  error,
  busy,
  onPick,
  onClear,
}: {
  preview: string | null;
  illustration: string;
  error?: string;
  busy: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = preview || illustration;

  return (
    <div className="flex items-stretch gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={`relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition ${
          error
            ? "border-rose-400/60"
            : preview
              ? "border-amber-400/40"
              : "border-dashed border-white/15 hover:border-amber-400/40"
        }`}
      >
        <img
          src={shown}
          alt={preview ? "Profile photo preview" : ""}
          className={`h-full w-full object-cover ${preview ? "" : "opacity-40"}`}
        />
        {!preview ? (
          <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 text-slate-200">
            <CameraIcon className="h-6 w-6 text-amber-300" />
            <span className="text-[10px] font-semibold">Add photo</span>
          </span>
        ) : null}
        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
          {preview ? "Change" : "Upload"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        tabIndex={-1}
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
      <div className="relative min-h-28 min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#08131d]">
        <img
          src={shown}
          alt={preview ? "Profile photo preview" : ""}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1822]/10 to-[#0c1822]/40" />
        {preview ? (
          <button
            type="button"
            disabled={busy}
            onClick={onClear}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[11px] font-semibold text-white hover:bg-black/70"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : (
          <p className="absolute bottom-2 left-3 right-3 text-[11px] font-medium text-white/85">
            Your photo will preview here.
          </p>
        )}
      </div>
    </div>
  );
}

function GenrePicker({
  selected,
  error,
  busy,
  onToggle,
  onAddCustom,
}: {
  selected: string[];
  error?: string;
  busy: boolean;
  onToggle: (g: string) => void;
  onAddCustom: (raw: string) => boolean;
}) {
  const [draft, setDraft] = useState("");
  const extras = selected.filter(
    (g) => !(GENRE_OPTIONS as readonly string[]).includes(g)
  );

  function addDraft(e?: FormEvent) {
    e?.preventDefault();
    if (onAddCustom(draft)) setDraft("");
  }

  return (
    <section data-apply-field="genres" className={sectionClass(error)}>
      <FieldLabel field="genres" />
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        Pick a shelf or type your own. We send both to review.
      </p>
      <div className="flex flex-wrap gap-2">
        {GENRE_OPTIONS.map((g) => {
          const on = selected.includes(g);
          return (
            <button
              key={g}
              type="button"
              disabled={busy}
              onClick={() => onToggle(g)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                on
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 bg-[#08131d] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {on ? <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" /> : null}
              <span>{genreLabel(g)}</span>
            </button>
          );
        })}
        {extras.map((g) => (
          <button
            key={g}
            type="button"
            disabled={busy}
            onClick={() => onToggle(g)}
            aria-pressed
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950"
          >
            <span>{genreLabel(g)}</span>
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          disabled={busy}
          className={inputClass}
          placeholder="Type a genre — Fuji, worship jazz…"
          maxLength={40}
          aria-label="Add a custom genre"
        />
        <button
          type="button"
          disabled={busy || !draft.trim()}
          onClick={() => addDraft()}
          className="shrink-0 rounded-xl border border-white/10 px-4 text-xs font-semibold text-slate-200 transition hover:border-amber-400/40 hover:text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <FieldError message={error} />
    </section>
  );
}

export default function ApplyFormFields({
  values,
  errors,
  busy,
  onChange,
  onToggleType,
  onToggleGenre,
  onAddCustomGenre,
  avatarPreview,
  onPickAvatar,
  onClearAvatar,
}: Props) {
  const illustration =
    CREATOR_ROLE_ART[values.creatorTypes[0] ?? "artist"];

  return (
    <div className="space-y-5">
      <section
        data-apply-field="creatorTypes"
        className={sectionClass(errors.creatorTypes)}
      >
        <FieldLabel field="creatorTypes" />
        <p className="mb-4 text-xs leading-relaxed text-slate-400">
          Choose every role that fits. One catalog can hold music and teaching.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {CREATOR_TYPE_OPTIONS.map((t) => {
            const on = values.creatorTypes.includes(t.id);
            const Icon = ROLE_ICON[t.id];
            return (
              <button
                key={t.id}
                type="button"
                disabled={busy}
                onClick={() => onToggleType(t.id)}
                aria-pressed={on}
                className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
                  on
                    ? "border-amber-400/70 bg-amber-500/10 ring-1 ring-amber-400/25"
                    : "border-white/10 bg-[#08131d] hover:border-white/20"
                }`}
              >
                <div className="relative h-20 overflow-hidden bg-slate-950">
                  <img
                    src={CREATOR_ROLE_ART[t.id]}
                    alt=""
                    className={`h-full w-full object-cover transition duration-500 ${
                      on
                        ? "scale-105 brightness-100"
                        : "brightness-75 group-hover:scale-105 group-hover:brightness-90"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08131d] via-transparent to-transparent" />
                  {on ? (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={`h-4 w-4 ${on ? "text-amber-300" : "text-slate-500"}`}
                    />
                    <span className="text-sm font-semibold text-white">
                      {t.label}
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {t.hint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <FieldError message={errors.creatorTypes} />
      </section>

      <section
        data-apply-field="displayName"
        className={sectionClass()}
      >
        <FieldLabel field="displayName" />
        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          The name listeners will see on your profile and tracks.
        </p>
        <input
          value={values.displayName}
          onChange={(e) => onChange("displayName", e.target.value)}
          disabled={busy}
          autoComplete="nickname"
          className={`${inputClass} ${errors.displayName ? inputErrorClass : ""}`}
          placeholder="Grace Collective"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? "apply-displayName-error" : undefined}
        />
        <FieldError id="apply-displayName-error" message={errors.displayName} />
      </section>

      <GenrePicker
        selected={values.genres}
        error={errors.genres}
        busy={busy}
        onToggle={onToggleGenre}
        onAddCustom={onAddCustomGenre}
      />

      <section data-apply-field="bio" className={sectionClass()}>
        <FieldLabel field="bio" />
        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          Your public story — format it how you want it read.
        </p>
        <ApplyBioEditor
          value={values.bio}
          onChange={(html) => onChange("bio", html)}
          disabled={busy}
          invalid={Boolean(errors.bio)}
        />
        <FieldError message={errors.bio} />
      </section>

      <section className={sectionClass()}>
        <p className="text-sm font-semibold text-white">Socials</p>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-slate-400">
          Handles or profile links help reviewers confirm who you are.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block" data-apply-field="instagram">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
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

          <label className="block" data-apply-field="youtube">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              YouTube
            </span>
            <input
              value={values.youtube}
              onChange={(e) => onChange("youtube", e.target.value)}
              disabled={busy}
              className={`${inputClass} ${errors.youtube ? inputErrorClass : ""}`}
              placeholder="@channel"
              aria-invalid={Boolean(errors.youtube)}
            />
            <FieldError message={errors.youtube} />
          </label>

          <label className="block" data-apply-field="spotify">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              Spotify
            </span>
            <input
              value={values.spotify}
              onChange={(e) => onChange("spotify", e.target.value)}
              disabled={busy}
              className={`${inputClass} ${errors.spotify ? inputErrorClass : ""}`}
              placeholder="Artist URL"
              aria-invalid={Boolean(errors.spotify)}
            />
            <FieldError message={errors.spotify} />
          </label>
        </div>
      </section>

      <section className={`${sectionClass()} space-y-5`}>
        <div data-apply-field="avatarUrl">
          <FieldLabel field="avatarUrl" />
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            Square JPG, PNG, or WebP · under 5MB. You can change it later in
            Studio.
          </p>
          <ApplyPhotoPicker
            preview={avatarPreview}
            illustration={illustration}
            error={errors.avatarUrl}
            busy={busy}
            onPick={onPickAvatar}
            onClear={onClearAvatar}
          />
          <FieldError message={errors.avatarUrl} />
        </div>

        <label className="block" data-apply-field="applicationNote">
          <FieldLabel field="applicationNote" />
          <p className="mb-3 text-xs leading-relaxed text-slate-400">
            Anything the review team should know.
          </p>
          <textarea
            rows={3}
            value={values.applicationNote}
            onChange={(e) => onChange("applicationNote", e.target.value)}
            disabled={busy}
            className={`${inputClass} resize-none ${
              errors.applicationNote ? inputErrorClass : ""
            }`}
            placeholder="Youth worship at Lagos Central. Debut EP next month."
            maxLength={1000}
            aria-invalid={Boolean(errors.applicationNote)}
          />
          <FieldError message={errors.applicationNote} />
        </label>
      </section>
    </div>
  );
}
