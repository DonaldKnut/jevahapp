import { API_BASE, getAccessToken } from "./api";

export type FeedEventType =
  | "impression"
  | "watch_time"
  | "skip"
  | "like"
  | "save"
  | "share";

export type FeedEvent = {
  contentId: string;
  contentType?: string;
  eventType: FeedEventType;
  watchMs?: number;
  progressPct?: number;
  sessionId?: string;
  source?: string;
};

const USE_MUSIC_FOR_YOU = true;

const queue: FeedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function resetFeedSession() {
  sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function enqueueFeedEvent(e: FeedEvent) {
  queue.push({ ...e, sessionId: e.sessionId ?? sessionId });
  if (queue.length >= 12) void flushFeedEvents();
  else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flushFeedEvents();
    }, 2500);
  }
}

export async function flushFeedEvents() {
  if (!queue.length) return;
  const token = getAccessToken();
  if (!token) {
    queue.length = 0;
    return;
  }
  const batch = queue.splice(0, 50);
  try {
    await fetch(`${API_BASE}/feed/events`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    /* soft-fail — never block playback */
  }
}

export type MusicForYouPage = {
  tracks: unknown[];
  items: unknown[];
  cursor: string | null;
  hasMore: boolean;
  lane: string;
};

export async function fetchMusicForYou(opts?: {
  cursor?: string | null;
  limit?: number;
  lane?: "artist" | "curated";
}): Promise<MusicForYouPage> {
  if (!USE_MUSIC_FOR_YOU) throw new Error("music-for-you disabled");
  const token = getAccessToken();
  if (!token) throw new Error("auth required");

  const q = new URLSearchParams({
    limit: String(opts?.limit ?? 20),
    lane: opts?.lane ?? "artist",
  });
  if (opts?.cursor) q.set("cursor", opts.cursor);

  const res = await fetch(`${API_BASE}/feed/music-for-you?${q}`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`music-for-you ${res.status}`);
  const json = (await res.json()) as {
    data?: MusicForYouPage;
  };
  const data = json.data;
  if (!data) throw new Error("music-for-you empty");
  return data;
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushFeedEvents();
  });
  window.addEventListener("pagehide", () => {
    void flushFeedEvents();
  });
}
