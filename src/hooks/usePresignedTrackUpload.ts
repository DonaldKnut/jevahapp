import { useCallback, useState } from "react";
import {
  AUDIO_MAX_BYTES,
  COVER_MAX_BYTES,
  runPresignedTrackUpload,
  type TrackUploadIntent,
} from "../lib/media";

type IntentFactory = (meta: {
  title: string;
  artistName: string;
  genre?: string;
  category?: string;
  language?: string;
  contentType: string;
  fileName: string;
  fileSizeBytes: number;
  coverContentType?: string;
  coverFileName?: string;
  coverFileSizeBytes?: number;
  releaseId?: string;
  trackNumber?: number;
}) => Promise<TrackUploadIntent>;

/**
 * Shared upload state machine for admin curated + creator studio uploads.
 * Inject lane-specific intent + finalize (OCP).
 */
export function usePresignedTrackUpload(options: {
  createIntent: IntentFactory;
  finalize: (trackId: string, publish: boolean) => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const validateFiles = useCallback((audio: File, cover?: File | null) => {
    if (audio.size > AUDIO_MAX_BYTES) {
      throw new Error("Audio max is 100MB.");
    }
    if (cover && cover.size > COVER_MAX_BYTES) {
      throw new Error("Cover max is 5MB.");
    }
  }, []);

  const upload = useCallback(
    async (args: {
      title: string;
      artistName: string;
      genre?: string;
      category?: string;
      language?: string;
      audioFile: File;
      coverFile?: File | null;
      publish?: boolean;
      extraIntent?: Record<string, unknown>;
    }) => {
      validateFiles(args.audioFile, args.coverFile);
      setBusy(true);
      setProgress("Requesting upload slots…");
      try {
        const intent = await options.createIntent({
          title: args.title.trim(),
          artistName: args.artistName.trim(),
          genre: args.genre,
          category: args.category,
          language: args.language,
          contentType: args.audioFile.type || "audio/mpeg",
          fileName: args.audioFile.name,
          fileSizeBytes: args.audioFile.size,
          coverContentType: args.coverFile?.type,
          coverFileName: args.coverFile?.name,
          coverFileSizeBytes: args.coverFile?.size,
          ...args.extraIntent,
        });

        await runPresignedTrackUpload({
          intent,
          audioFile: args.audioFile,
          coverFile: args.coverFile,
          onProgress: setProgress,
          finalize: (trackId: string) =>
            options.finalize(trackId, args.publish !== false),
        });
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [options, validateFiles]
  );

  return { upload, busy, progress, validateFiles };
}
