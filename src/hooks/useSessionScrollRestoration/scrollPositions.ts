export interface ScrollPosition {
  left: number;
  top: number;
}

export type ScrollPositions = Record<string, ScrollPosition>;

interface ScrollEntry {
  key: string;
  url: string;
  positions: ScrollPositions;
}

export const SCROLL_STORAGE_KEY = 'competition-groups:session-scroll:v1';

const isPosition = (value: unknown): value is ScrollPosition => {
  if (!value || typeof value !== 'object') return false;
  const { left, top } = value as ScrollPosition;
  return Number.isFinite(left) && left >= 0 && Number.isFinite(top) && top >= 0;
};

/** Only page-session storage: never the durable settings/query cache. */
export function createScrollPositionStore() {
  const entries = new Map<string, ScrollEntry>();
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(SCROLL_STORAGE_KEY) || 'null');
    if (Array.isArray(stored)) {
      for (const value of stored) {
        if (!value || typeof value !== 'object') continue;
        const entry = value as Record<string, unknown>;
        if (
          typeof entry.key === 'string' &&
          typeof entry.url === 'string' &&
          entry.positions &&
          typeof entry.positions === 'object' &&
          !Array.isArray(entry.positions)
        ) {
          const positions = Object.fromEntries(
            Object.entries(entry.positions).filter(([, position]) => isPosition(position)),
          ) as ScrollPositions;
          entries.set(entry.key, { key: entry.key, url: entry.url, positions });
        }
      }
    }
  } catch {
    // Storage can be disabled, full, or left over from a malformed session.
  }

  return {
    get(key: string, url: string): ScrollPositions | undefined {
      const entry = entries.get(key);
      // The initial React Router key can be "default" on different documents.
      return entry?.url === url ? entry.positions : undefined;
    },
    set(key: string, url: string, positions: ScrollPositions) {
      entries.delete(key);
      entries.set(key, { key, url, positions });
      try {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify([...entries.values()]));
      } catch {
        // Back/Forward still works in memory when sessionStorage is unavailable.
      }
    },
  };
}
