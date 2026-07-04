import type { CategoryId } from './registry';

/**
 * Tiny external store for the landing page's collapsed-category set,
 * persisted to localStorage under one key, shared across products (the four
 * categories are the same set regardless of active product).
 *
 * Implemented as a `useSyncExternalStore` source rather than
 * `useEffect` + `setState` — the latter reads localStorage after mount and
 * pushes it into state, which both trips the `set-state-in-effect` lint rule
 * and requires care to dodge a hydration mismatch. `useSyncExternalStore`
 * already handles the server/client snapshot swap correctly, so the "read on
 * mount, don't break SSR" requirement falls out for free.
 */
const STORAGE_KEY = 'evhub:landing:collapsed';

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedIds: CategoryId[] = [];

function readIds(raw: string | null): CategoryId[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CategoryId[];
  } catch {
    return [];
  }
}

export function subscribeCollapsedIds(listener: Listener): () => void {
  listeners.add(listener);
  // Cross-tab updates arrive as native `storage` events.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function getCollapsedIdsSnapshot(): CategoryId[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  // Cache by raw string so repeated calls between actual writes return the
  // same array reference — useSyncExternalStore requires a stable snapshot
  // to avoid re-rendering every time.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIds = readIds(raw);
  }
  return cachedIds;
}

export function getCollapsedIdsServerSnapshot(): CategoryId[] {
  return [];
}

/** Writes the collapsed set and notifies same-tab subscribers immediately
 *  (the native `storage` event only fires for other tabs/windows). */
export function setCollapsedIds(ids: CategoryId[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* swallow — collapse state still applies for the session */
  }
  listeners.forEach(l => l());
}
