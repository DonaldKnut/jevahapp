import { z } from "zod";
import { TRACK_GENRES } from "../../../lib/mediaParts/genres";

export const CREATOR_TYPE_OPTIONS = [
  { id: "artist", label: "Artist", hint: "Music & catalogs" },
  { id: "minister", label: "Minister", hint: "Messages & worship" },
  { id: "podcaster", label: "Podcaster", hint: "Talk & shows" },
] as const;

/** Same enum as backend TRACK_GENRES / upload. */
export const GENRE_OPTIONS = TRACK_GENRES;

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

const optionalHttpUrl = z
  .string()
  .optional()
  .transform(emptyToUndefined)
  .refine(
    (v) => v === undefined || /^https?:\/\/.+/i.test(v),
    "Enter a valid http(s) URL"
  );

/**
 * Spotify-for-Artists style apply payload.
 * Required fields must pass. Empty optional strings become undefined.
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
  genres: z.array(z.enum(GENRE_OPTIONS)).min(1, "Choose at least one genre"),
  bio: optionalText(500, "Bio must be 500 characters or fewer"),
  instagram: optionalText(200, "Instagram is too long"),
  youtube: optionalText(200, "YouTube is too long"),
  spotify: optionalText(200, "Spotify link is too long"),
  avatarUrl: optionalHttpUrl,
  applicationNote: optionalText(1000, "Note must be 1000 characters or fewer"),
});

export type CreatorApplyInput = {
  creatorTypes: Array<"artist" | "minister" | "podcaster">;
  displayName: string;
  genres: Array<(typeof GENRE_OPTIONS)[number]>;
  bio: string;
  instagram: string;
  youtube: string;
  spotify: string;
  avatarUrl: string;
  applicationNote: string;
};

export type CreatorApplyValues = z.output<typeof creatorApplySchema>;

export type CreatorApplyFieldErrors = Partial<
  Record<keyof CreatorApplyInput, string>
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

/** Required vs optional mirrors Spotify for Artists access forms. */
export const CREATOR_APPLY_FIELDS = {
  creatorTypes: { label: "I am a…", required: true },
  displayName: { label: "Display name", required: true },
  genres: { label: "Genres", required: true },
  bio: { label: "Bio", required: false },
  instagram: { label: "Instagram", required: false },
  youtube: { label: "YouTube", required: false },
  spotify: { label: "Spotify", required: false },
  avatarUrl: { label: "Avatar URL", required: false },
  applicationNote: { label: "Note to reviewers", required: false },
} as const;
