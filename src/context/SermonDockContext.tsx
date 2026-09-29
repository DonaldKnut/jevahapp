import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { SermonCard } from "../types/sermon";

export type SermonDockSession = {
  sermon: SermonCard;
  mini: boolean;
  /** Resume playback after remount / route change */
  resumeAt: number;
  wantPlaying: boolean;
};

type StageBox = { top: number; left: number; width: number; height: number };

type SermonDockContextValue = {
  session: SermonDockSession | null;
  stageRef: RefObject<HTMLDivElement | null>;
  stageBox: StageBox | null;
  open: (
    sermon: SermonCard,
    opts?: { mini?: boolean; resumeAt?: number; wantPlaying?: boolean }
  ) => void;
  setMini: (mini: boolean) => void;
  setResumeAt: (t: number) => void;
  setWantPlaying: (playing: boolean) => void;
  refreshStageBox: () => void;
  close: () => void;
};

const SermonDockContext = createContext<SermonDockContextValue | null>(null);

export function SermonDockProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SermonDockSession | null>(null);
  const [stageBox, setStageBox] = useState<StageBox | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const refreshStageBox = useCallback(() => {
    const el = stageRef.current;
    if (!el) {
      setStageBox(null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) {
      setStageBox(null);
      return;
    }
    setStageBox({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, []);

  const open = useCallback(
    (
      sermon: SermonCard,
      opts?: { mini?: boolean; resumeAt?: number; wantPlaying?: boolean }
    ) => {
      setSession((prev) => {
        if (prev?.sermon.id === sermon.id) {
          return {
            ...prev,
            sermon,
            mini: opts?.mini ?? prev.mini,
            resumeAt: opts?.resumeAt ?? prev.resumeAt,
            wantPlaying: opts?.wantPlaying ?? prev.wantPlaying,
          };
        }
        return {
          sermon,
          mini: opts?.mini ?? false,
          resumeAt: opts?.resumeAt ?? 0,
          wantPlaying: opts?.wantPlaying ?? false,
        };
      });
    },
    []
  );

  const setMini = useCallback((mini: boolean) => {
    setSession((prev) => (prev ? { ...prev, mini } : prev));
  }, []);

  const setResumeAt = useCallback((resumeAt: number) => {
    setSession((prev) => (prev ? { ...prev, resumeAt } : prev));
  }, []);

  const setWantPlaying = useCallback((wantPlaying: boolean) => {
    setSession((prev) => (prev ? { ...prev, wantPlaying } : prev));
  }, []);

  const close = useCallback(() => {
    setSession(null);
    setStageBox(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      stageRef,
      stageBox,
      open,
      setMini,
      setResumeAt,
      setWantPlaying,
      refreshStageBox,
      close,
    }),
    [
      session,
      stageBox,
      open,
      setMini,
      setResumeAt,
      setWantPlaying,
      refreshStageBox,
      close,
    ]
  );

  return (
    <SermonDockContext.Provider value={value}>
      {children}
    </SermonDockContext.Provider>
  );
}

export function useSermonDock() {
  const ctx = useContext(SermonDockContext);
  if (!ctx) {
    throw new Error("useSermonDock must be used inside SermonDockProvider");
  }
  return ctx;
}

export function useSermonDockOptional() {
  return useContext(SermonDockContext);
}
