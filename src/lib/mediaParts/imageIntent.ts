import type { PresignSlot } from "../../types/media";

/** Pull a PUT slot out of the various presign shapes the API returns. */
export function extractPutSlot(raw: unknown): PresignSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const nestedKeys = [
    "cover",
    "avatar",
    "banner",
    "image",
    "upload",
    "slot",
    "file",
  ];
  for (const key of nestedKeys) {
    const inner = o[key];
    if (inner && typeof inner === "object") {
      const slot = extractPutSlot(inner);
      if (slot) return slot;
    }
  }
  const putUrl = String(o.putUrl || o.url || o.uploadUrl || "");
  if (!putUrl.startsWith("http")) return null;
  const headers =
    o.headers && typeof o.headers === "object"
      ? (o.headers as Record<string, string>)
      : undefined;
  return {
    putUrl,
    key: String(o.key || ""),
    headers,
  };
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function assertImageFile(file: File, maxBytes: number) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`Image must be under ${mb}MB.`);
  }
}
