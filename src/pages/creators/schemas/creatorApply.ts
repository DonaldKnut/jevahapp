import { z } from "zod";
import { TRACK_GENRES } from "../../../lib/mediaParts/genres";
import { htmlToPlain } from "../../../lib/htmlText";

export const CREATOR_TYPE_OPTIONS = [
  { id: "artist", label: "Artist", hint: "Music & catalogs" },
  { id: "minister", label: "Minister", hint: "Messages & worship" },
  { id: "podcaster", label: "Podcaster", hint: "Talk & shows" },
] as const;

/** Suggested chips. Typed genres are also allowed (normalized slugs). */
export const GENRE_OPTIONS = TRACK_GENRES;

const genreTag = z
  .string()
  .trim()
  .min(2, "Genre is too short")
  .max(40, "Keep each genre under 40 characters")
  .regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, "Use letters and numbers");

const emptyToUndefined = (v: string | undefined) => {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : undefined;
};

const optionalText = (max: number, msg: string) =>
  z
    .string()
    .optional()
    .transform(emptyToUndefined)
    .refine((v) => v === undefined || v.length <= max, msg);

/**
 * Spotify-for-Artists style apply payload.
 * Required fields must pass. Empty optional strings become undefined.
 * Profile photo is a File on the page — not part of this JSON.
 */
export const creatorApplySchema = z.object({
  creatorTypes: z
    .array(z.enum(["artist", "minister", "podcaster"]))
    .min(1, "Pick at least one creator type"),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name needs at least 2 characters")
    .max(80, "Keep display name under 80 characters"),
  genres: z
    .array(genreTag)
    .min(1, "Choose or type at least one genre")
    .max(8, "Keep it to 8 genres"),
  bio: z
    .string()
    .optional()
    .transform(emptyToUndefined)
    .refine(
      (v) => v === undefined || htmlToPlain(v).length <= 500,
      "Bio must be 500 characters or fewer"
    ),
  instagram: optionalText(200, "Instagram is too long"),
  youtube: optionalText(200, "YouTube is too long"),
  spotify: optionalText(200, "Spotify link is too long"),
  applicationNote: optionalText(1000, "Note must be 1000 characters or fewer"),
});

export type CreatorApplyInput = {
  creatorTypes: Array<"artist" | "minister" | "podcaster">;
  displayName: string;
  genres: string[];
  bio: string;
  instagram: string;
  youtube: string;
  spotify: string;
  applicationNote: string;
};

export type CreatorApplyValues = z.output<typeof creatorApplySchema>;

export type CreatorApplyFieldErrors = Partial<
  Record<keyof CreatorApplyInput | "avatarUrl", string>
>;

export function fieldErrorsFromZod(
  error: z.ZodError
): CreatorApplyFieldErrors {
  const out: CreatorApplyFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as keyof CreatorApplyInput] = issue.message;
    }
  }
  return out;
}

const FIELD_ORDER: Array<keyof CreatorApplyFieldErrors> = [
  "creatorTypes",
  "displayName",
  "genres",
  "bio",
  "instagram",
  "youtube",
  "spotify",
  "avatarUrl",
  "applicationNote",
];

export function firstApplyErrorKey(
  errors: CreatorApplyFieldErrors
): keyof CreatorApplyFieldErrors | null {
  return FIELD_ORDER.find((k) => Boolean(errors[k])) ?? null;
}

/** Submit-time Zod gate. Never send the API payload until this succeeds. */
export function parseCreatorApply(values: CreatorApplyInput):
  | { ok: true; data: CreatorApplyValues }
  | { ok: false; errors: CreatorApplyFieldErrors } {
  const parsed = creatorApplySchema.safeParse(values);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, errors: fieldErrorsFromZod(parsed.error) };
}

/** Required vs optional mirrors Spotify for Artists access forms. */
export const CREATOR_APPLY_FIELDS = {
  creatorTypes: { label: "Role", required: true },
  displayName: { label: "Display name", required: true },
  genres: { label: "Genres", required: true },
  bio: { label: "Bio", required: false },
  instagram: { label: "Instagram", required: false },
  youtube: { label: "YouTube", required: false },
  spotify: { label: "Spotify", required: false },
  avatarUrl: { label: "Profile photo", required: false },
  applicationNote: { label: "Note to reviewers", required: false },
} as const;
