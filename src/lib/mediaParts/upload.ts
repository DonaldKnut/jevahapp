import type { PresignSlot, TrackUploadIntent } from "../../types/media";

function uploadTarget(putUrl: string) {
  if (!import.meta.env.DEV) return putUrl;
  try {
    const u = new URL(putUrl);
    if (!u.hostname.endsWith(".r2.cloudflarestorage.com")) return putUrl;
    return `/__r2/${u.hostname}${u.pathname}${u.search}`;
  } catch {
    return putUrl;
  }
}

function signedHeaderNames(putUrl: string) {
  try {
    const raw = new URL(putUrl).searchParams.get("X-Amz-SignedHeaders") || "";
    return new Set(
      raw
        .split(";")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
  } catch {
    return new Set<string>();
  }
}

export function uploadFailureMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : "Upload failed";
  if (
    /cors|access-control|failed to fetch|network error/i.test(msg) ||
    msg === "Network error during upload"
  ) {
    return "The file store blocked this browser upload. Refresh and try again. If it still fails, storage must allow this site (R2 CORS for www.jevahapp.com).";
  }
  return msg;
}

export async function putPresignedFile(
  putUrl: string,
  file: File,
  headers?: Record<string, string>,
  onByteProgress?: (loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadTarget(putUrl));
    const signed = signedHeaderNames(putUrl);
    const extras = headers || {};

    const contentType =
      extras["Content-Type"] ||
      extras["content-type"] ||
      (signed.has("content-type")
        ? file.type || "application/octet-stream"
        : "");
    if (contentType) {
      xhr.setRequestHeader("Content-Type", contentType);
    }

    for (const [k, v] of Object.entries(extras)) {
      if (k.toLowerCase() === "content-type") continue;
      if (k.toLowerCase() === "host") continue;
      xhr.setRequestHeader(k, v);
    }

    if (xhr.upload && onByteProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          onByteProgress(e.loaded, e.total);
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

async function putSlot(
  slot: PresignSlot,
  file: File,
  onByteProgress?: (loaded: number, total: number) => void
) {
  await putPresignedFile(slot.putUrl, file, slot.headers, onByteProgress);
}

/**
 * Shared upload pipeline: PUT audio → optional cover → finalize.
 * Intent creation stays with the caller (admin vs creator endpoints).
 */
export async function runPresignedTrackUpload(options: {
  intent: TrackUploadIntent;
  audioFile: File;
  coverFile?: File | null;
  finalize: (trackId: string) => Promise<unknown>;
  onProgress?: (label: string) => void;
  onProgressPct?: (pct: number, label: string) => void;
}) {
  const { intent, audioFile, coverFile, finalize, onProgress, onProgressPct } =
    options;

  const notify = (pct: number, label: string) => {
    onProgress?.(label);
    onProgressPct?.(pct, label);
  };

  notify(10, "Uploading audio file…");
  await putSlot(intent.audio, audioFile, (loaded, total) => {
    const audioRatio = total > 0 ? loaded / total : 0;
    const currentPct = 10 + Math.round(audioRatio * 65);
    const bytePct = Math.round(audioRatio * 100);
    notify(currentPct, `Uploading audio (${bytePct}%)…`);
  });

  if (coverFile && intent.cover?.putUrl) {
    notify(78, "Uploading cover art…");
    await putSlot(intent.cover, coverFile, (loaded, total) => {
      const coverRatio = total > 0 ? loaded / total : 0;
      const currentPct = 78 + Math.round(coverRatio * 12);
      const bytePct = Math.round(coverRatio * 100);
      notify(currentPct, `Uploading cover (${bytePct}%)…`);
    });
  }

  notify(92, "Finalizing track metadata…");
  const res = await finalize(intent.trackId);
  notify(100, "Uploaded & Published ✓");
  return res;
}
