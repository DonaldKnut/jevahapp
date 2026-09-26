import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TrackCard } from "../lib/media";

/** How the player sits on the page. */
export type PlayerSize = "bar" | "window" | "full";

type PlayerContextValue = {
  track: TrackCard | null;
  queue: TrackCard[];
  shelfLabel?: string;
  isPlaying: boolean;
  size: PlayerSize;
  start: (
    next: TrackCard,
    opts?: { queue?: TrackCard[]; shelfLabel?: string; size?: PlayerSize }
  ) => void;
  setTrack: (next: TrackCard | null) => void;
  setPlaying: (playing: boolean) => void;
  setSize: (size: PlayerSize) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrackState] = useState<TrackCard | null>(null);
  const [queue, setQueue] = useState<TrackCard[]>([]);
  const [shelfLabel, setShelfLabel] = useState<string | undefined>();
  const [isPlaying, setPlaying] = useState(false);
  const [size, setSize] = useState<PlayerSize>("bar");

  const start = useCallback(
    (
      next: TrackCard,
      opts?: { queue?: TrackCard[]; shelfLabel?: string; size?: PlayerSize }
    ) => {
      setTrackState(next);
      if (opts?.queue) setQueue(opts.queue);
      if (opts?.shelfLabel !== undefined) setShelfLabel(opts.shelfLabel);
      if (opts?.size) setSize(opts.size);
      setPlaying(true);
    },
    []
  );

  const setTrack = useCallback((next: TrackCard | null) => {
    setTrackState(next);
    if (!next) {
      setPlaying(false);
      setQueue([]);
    }
  }, []);

  const close = useCallback(() => {
    setTrackState(null);
    setQueue([]);
    setPlaying(false);
    setSize("bar");
  }, []);

  const value = useMemo(
    () => ({
      track,
      queue,
      shelfLabel,
      isPlaying,
      size,
      start,
      setTrack,
      setPlaying,
      setSize,
      close,
    }),
    [track, queue, shelfLabel, isPlaying, size, start, setTrack, close]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }
  return ctx;
}

export function usePlayerOptional() {
  return useContext(PlayerContext);
}
