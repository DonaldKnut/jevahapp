import type { PresignSlot, TrackUploadIntent } from "../../types/media";

export async function putPresignedFile(
  putUrl: string,
  file: File,
  headers?: Record<string, string>
) {
  const res = await fetch(putUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      ...(headers || {}),
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
}

async function putSlot(slot: PresignSlot, file: File) {
  await putPresignedFile(slot.putUrl, file, slot.headers);
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
}) {
  const { intent, audioFile, coverFile, finalize, onProgress } = options;
  onProgress?.("Uploading audio…");
  await putSlot(intent.audio, audioFile);

  if (coverFile && intent.cover?.putUrl) {
    onProgress?.("Uploading cover…");
    await putSlot(intent.cover, coverFile);
  }

  onProgress?.("Finalizing…");
  return finalize(intent.trackId);
}
