'use client';

import { ASSETS, type AssetKey } from '@/lib/assets';
import { useActiveAsset } from './ActiveAssetContext';
import { cn } from '@/lib/cn';

/**
 * Asset switcher pill (Phase 0) — the Alnyx ↔ iStent toggle. Lives in the
 * global TopBar so every module (the Library in particular) shares one source
 * of truth via ActiveAssetContext. Sits on the navy bar, so the active pill is
 * light-on-navy and inactive pills are muted.
 */
export default function AssetSwitcher() {
  const { activeAsset, setActiveAsset } = useActiveAsset();

  return (
    <nav
      className="flex items-center gap-1 rounded-full p-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
      aria-label="Active asset"
    >
      {ASSETS.map(a => {
        const isActive = a.key === activeAsset;
        return (
          <button
            key={a.key}
            type="button"
            onClick={() => setActiveAsset(a.key as AssetKey)}
            aria-pressed={isActive}
            title={`${a.name} — ${a.indication}`}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap',
              isActive
                ? 'bg-white text-[color:var(--evhub-navy)]'
                : 'text-white/70 hover:text-white',
            )}
          >
            {a.name}
          </button>
        );
      })}
    </nav>
  );
}
