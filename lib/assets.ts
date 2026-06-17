// Active-asset model (Phase 0).
//
// The demo carries two *populated* assets, each backed by its own canonical
// Library dataset:
//   • alnyx  — Alnyx (alphabetinib), R/R multiple myeloma — the original 119
//              article set and all its downstream modules.
//   • istent — iStent infinite (Open-Angle Glaucoma) — the 22-article set with
//              per-dossier linking columns and admin tagging.
//
// `activeAsset` is the single source of truth the Library reads to resolve its
// dataset, filter tree and column config. Switching assets never mutates the
// Alnyx path — iStent-only affordances are additive and gated on this key.

export type AssetKey = 'alnyx' | 'istent';

export interface AssetDef {
  key: AssetKey;
  /** Pill label. */
  name: string;
  /** Indication shown under the name in the switcher. */
  indication: string;
}

export const ASSETS: AssetDef[] = [
  { key: 'alnyx', name: 'Alnyx', indication: 'R/R Multiple Myeloma' },
  { key: 'istent', name: 'iStent infinite', indication: 'Open-Angle Glaucoma' },
];

export const ACTIVE_ASSET_DEFAULT: AssetKey = 'alnyx';

/** localStorage key for the persisted active-asset selection. */
export const ACTIVE_ASSET_STORAGE_KEY = 'evhub-active-asset';

export function isAssetKey(v: unknown): v is AssetKey {
  return v === 'alnyx' || v === 'istent';
}
