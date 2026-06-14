/**
 * Simple in-memory TTL cache. No external dependencies.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheClear(key?: string): void {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}

export function cacheStats(): { keys: string[]; count: number } {
  const keys = Array.from(store.keys());
  return { keys, count: keys.length };
}
