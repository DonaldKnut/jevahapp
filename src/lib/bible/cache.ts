const store = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 6 * 60 * 60 * 1000;

export function bibleCacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return null;
  }
  return hit.data as T;
}

export function bibleCacheSet(key: string, data: unknown) {
  store.set(key, { at: Date.now(), data });
}

export async function bibleCached<T>(
  key: string,
  loader: () => Promise<T>
): Promise<T> {
  const existing = bibleCacheGet<T>(key);
  if (existing !== null) return existing;
  const data = await loader();
  bibleCacheSet(key, data);
  return data;
}
