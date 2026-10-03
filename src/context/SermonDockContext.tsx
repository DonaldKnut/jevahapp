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

function sameBox(a: StageBox | null, b: StageBox | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

export function SermonDockProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SermonDockSession | null>(null);
  const [stageBox, setStageBox] = useState<StageBox | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageBoxRef = useRef<StageBox | null>(null);

  const refreshStageBox = useCallback(() => {
    const el = stageRef.current;
    if (!el) {
      if (stageBoxRef.current !== null) {
        stageBoxRef.current = null;
        setStageBox(null);
      }
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) {
      if (stageBoxRef.current !== null) {
        stageBoxRef.current = null;
        setStageBox(null);
      }
      return;
    }
    const next: StageBox = {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
    if (sameBox(stageBoxRef.current, next)) return;
    stageBoxRef.current = next;
    setStageBox(next);
  }, []);

  const open = useCallback(
    (
      sermon: SermonCard,
      opts?: { mini?: boolean; resumeAt?: number; wantPlaying?: boolean }
    ) => {
      setSession((prev) => {
        if (prev?.sermon.id === sermon.id) {
          const mini = opts?.mini ?? prev.mini;
          const resumeAt = opts?.resumeAt ?? prev.resumeAt;
          const wantPlaying = opts?.wantPlaying ?? prev.wantPlaying;
          if (
            prev.sermon === sermon &&
            prev.mini === mini &&
            prev.resumeAt === resumeAt &&
            prev.wantPlaying === wantPlaying
          ) {
            return prev;
          }
          return { ...prev, sermon, mini, resumeAt, wantPlaying };
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
    setSession((prev) => {
      if (!prev || prev.mini === mini) return prev;
      return { ...prev, mini };
    });
  }, []);

  const setResumeAt = useCallback((resumeAt: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      // Ignore tiny timeupdate jitter so we don't thrash context consumers
      if (Math.abs(prev.resumeAt - resumeAt) < 0.5) return prev;
      return { ...prev, resumeAt };
    });
  }, []);

  const setWantPlaying = useCallback((wantPlaying: boolean) => {
    setSession((prev) => {
      if (!prev || prev.wantPlaying === wantPlaying) return prev;
      return { ...prev, wantPlaying };
    });
  }, []);

  const close = useCallback(() => {
    setSession(null);
    stageBoxRef.current = null;
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
