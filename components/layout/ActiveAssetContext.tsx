'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ACTIVE_ASSET_DEFAULT,
  ACTIVE_ASSET_STORAGE_KEY,
  isAssetKey,
  type AssetKey,
} from '@/lib/assets';

/**
 * Active-asset context (Phase 0). Holds the asset the user is working in
 * (Alnyx ↔ iStent) and persists it to localStorage so the choice survives
 * navigation and reloads. This is the single source of truth the Library reads
 * to resolve its dataset + column config; Alnyx remains the default.
 */
interface ActiveAssetContextValue {
  activeAsset: AssetKey;
  setActiveAsset: (key: AssetKey) => void;
}

const ActiveAssetContext = createContext<ActiveAssetContextValue | null>(null);

export function ActiveAssetProvider({ children }: { children: React.ReactNode }) {
  const [activeAsset, setActiveAssetState] = useState<AssetKey>(ACTIVE_ASSET_DEFAULT);

  // Rehydrate the persisted selection on mount (client-only). Falls back to
  // the default when absent or invalid.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_ASSET_STORAGE_KEY);
      if (isAssetKey(stored)) setActiveAssetState(stored);
    } catch {
      /* localStorage unavailable — keep default */
    }
  }, []);

  const setActiveAsset = useCallback((key: AssetKey) => {
    setActiveAssetState(key);
    try {
      window.localStorage.setItem(ACTIVE_ASSET_STORAGE_KEY, key);
    } catch {
      /* swallow — selection still applies for the session */
    }
  }, []);

  const value = useMemo<ActiveAssetContextValue>(
    () => ({ activeAsset, setActiveAsset }),
    [activeAsset, setActiveAsset],
  );

  return (
    <ActiveAssetContext.Provider value={value}>
      {children}
    </ActiveAssetContext.Provider>
  );
}

export function useActiveAsset(): ActiveAssetContextValue {
  const ctx = useContext(ActiveAssetContext);
  if (!ctx) {
    throw new Error('useActiveAsset must be used within an ActiveAssetProvider');
  }
  return ctx;
}
