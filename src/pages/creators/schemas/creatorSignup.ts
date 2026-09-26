import { z } from "zod";
import { isCommonPassword, PASSWORD_HINT } from "../../../lib/passwordPolicy";

export const creatorSignupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(40, "Keep first name under 40 characters"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(40, "Keep last name under 40 characters"),
    email: z.string().trim().email("Enter a valid email"),
    password: z
      .string()
      .min(8, PASSWORD_HINT)
      .max(72, "Password must be 72 characters or fewer")
      .regex(/[A-Za-z]/, "Add a letter")
      .regex(/[0-9]/, "Add a number"),
    rememberMe: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (isCommonPassword(val.password, val.email)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Choose a less common password.",
      });
    }
  });

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, PASSWORD_HINT)
    .max(72, "Password must be 72 characters or fewer")
    .regex(/[A-Za-z]/, "Add a letter")
    .regex(/[0-9]/, "Add a number"),
});

export type CreatorSignupInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe: boolean;
};

export type CreatorSignupFieldErrors = Partial<
  Record<keyof CreatorSignupInput, string>
>;

export function fieldErrorsFromZod(
  error: z.ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

export function parseCreatorSignup(values: CreatorSignupInput):
  | { ok: true; data: z.output<typeof creatorSignupSchema> }
  | { ok: false; errors: CreatorSignupFieldErrors } {
  const parsed = creatorSignupSchema.safeParse(values);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, errors: fieldErrorsFromZod(parsed.error) };
}
