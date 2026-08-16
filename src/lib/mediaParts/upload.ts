import type { PresignSlot, TrackUploadIntent } from "../../types/media";

export async function putPresignedFile(
  putUrl: string,
  file: File,
  headers?: Record<string, string>,
  onByteProgress?: (loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", putUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        xhr.setRequestHeader(k, v);
      }
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

