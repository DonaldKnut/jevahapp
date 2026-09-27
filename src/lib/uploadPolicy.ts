import { ApiError } from "./api";
import type { RightsType, UploadPolicy } from "../types/creator";

export type { RightsType, UploadPolicy };

export const RIGHTS_TYPE_OPTIONS: { value: RightsType; label: string }[] = [
  { value: "original", label: "I wrote and recorded this" },
  { value: "licensed", label: "I have a license to publish this" },
  { value: "public_domain", label: "Public domain" },
];

/** Last-resort copy if GET /creators/me omits uploadPolicy. Prefer API text. */
export const FALLBACK_UPLOAD_POLICY: UploadPolicy = {
  rightsCopy:
    "I confirm I own this recording or have a license to publish it on Jevah.",
  gospelCopy:
    "This song is worship, Scripture, or teaching centered on Jesus Christ — not a secular cover.",
};

export const CREATOR_HOLD_COPY =
  "Jevah publishes worship, Scripture, and teaching centered on Jesus Christ.";

export type RightsAttestation = {
  rightsAttested: boolean;
  gospelAttested: boolean;
  rightsType: "" | RightsType;
  licenseNote: string;
};

export const EMPTY_ATTESTATION: RightsAttestation = {
  rightsAttested: false,
  gospelAttested: false,
  rightsType: "",
  licenseNote: "",
};

export function resolveUploadPolicy(policy?: UploadPolicy | null): UploadPolicy {
  const rightsCopy = policy?.rightsCopy?.trim();
  const gospelCopy = policy?.gospelCopy?.trim();
  return {
    rightsCopy: rightsCopy || FALLBACK_UPLOAD_POLICY.rightsCopy,
    gospelCopy: gospelCopy || FALLBACK_UPLOAD_POLICY.gospelCopy,
    policyVersion: policy?.policyVersion,
    updatedAt: policy?.updatedAt,
  };
}

export function normalizeUploadPolicy(raw: unknown): UploadPolicy | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const rightsCopy = typeof o.rightsCopy === "string" ? o.rightsCopy.trim() : "";
  const gospelCopy = typeof o.gospelCopy === "string" ? o.gospelCopy.trim() : "";
  if (!rightsCopy && !gospelCopy) return null;
  return {
    rightsCopy,
    gospelCopy,
    policyVersion:
      typeof o.policyVersion === "string" ? o.policyVersion : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export function attestationReady(input: RightsAttestation): boolean {
  if (!input.rightsAttested || !input.gospelAttested || !input.rightsType) {
    return false;
  }
  if (input.rightsType === "licensed" && !input.licenseNote.trim()) {
    return false;
  }
  return true;
}

export function attestationBlockReason(input: RightsAttestation): string | null {
  if (!input.rightsAttested) {
    return "Confirm you have the rights to publish this recording.";
  }
  if (!input.gospelAttested) {
    return "Confirm this song is worship, Scripture, or teaching centered on Jesus Christ.";
  }
  if (!input.rightsType) {
    return "Choose how you hold the rights to this recording.";
  }
  if (input.rightsType === "licensed" && !input.licenseNote.trim()) {
    return "Add who licensed this recording, or the license name.";
  }
  return null;
}

export function intentRightsBody(input: RightsAttestation) {
  return {
    rightsAttested: input.rightsAttested,
    gospelAttested: input.gospelAttested,
    rightsType: input.rightsType || undefined,
    licenseNote:
      input.rightsType === "licensed" ? input.licenseNote.trim() : null,
  };
}

const ATTEST_CODES = new Set([
  "RIGHTS_ATTESTATION_REQUIRED",
  "GOSPEL_ATTESTATION_REQUIRED",
  "INVALID_RIGHTS_TYPE",
  "LICENSE_NOTE_REQUIRED",
]);

export function attestationApiMessage(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  const code = err.body?.code;
  if (code && ATTEST_CODES.has(code)) return err.message;
  return null;
}
