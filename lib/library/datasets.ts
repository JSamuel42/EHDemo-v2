// Per-asset Library configuration registry.
//
// The Library is a single component parameterised by `activeAsset`: dataset,
// filter tree, date thresholds, chat presets and whether per-dossier columns +
// admin tagging are available all resolve from here. Alnyx is the default and
// keeps its original dataset, tree and presets verbatim; iStent adds the
// 22-article set with the funnel facet and dossier features.

import { ARTICLES, FILTER_TREE, type Article, type FilterTree } from './data';
import { ISTENT_ARTICLES, ISTENT_FILTER_TREE } from './istent-data';
import {
  EMPTY_FILTERS,
  DATE_THRESHOLDS,
  type FilterState,
  type DateThresholds,
} from './filters';
import type { AssetKey } from '@/lib/assets';

/** A chat-panel empty-state preset: applies a filter, then summarises it. */
export interface LibraryPresetSpec {
  id: string;
  label: string;
  buildFilter: () => FilterState;
  contextPhrase: string;
}

export interface LibraryDataset {
  /** Static seed set for the asset. iStent's live set comes from the store
   *  (edit overlay); this static set still powers date-chip counts. */
  articles: Article[];
  filterTree: FilterTree;
  dateThresholds: DateThresholds;
  presets: LibraryPresetSpec[];
  /** iStent: render per-dossier columns + admin tagging. Alnyx: false. */
  hasDossiers: boolean;
}

/** iStent dataset spans 2019–2025, so its quick-date thresholds differ. */
const ISTENT_DATE_THRESHOLDS: DateThresholds = {
  SINCE_LAST_GVD: '2024-01-01',
  LAST_3_MONTHS: '2025-01-01',
};

const ALNYX_PRESETS: LibraryPresetSpec[] = [
  {
    id: 'last-3-months',
    label: "See what's new in the last 3 months.",
    buildFilter: () => ({ ...EMPTY_FILTERS, dateThreshold: 'LAST_3_MONTHS' }),
    contextPhrase: 'articles published in the last 3 months',
  },
  {
    id: 'comparative-effectiveness',
    label: "What's new on comparative effectiveness?",
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      categories: new Set(['Comparative effectiveness']),
    }),
    contextPhrase: 'articles on comparative effectiveness',
  },
  {
    id: 'recommendations-management',
    label: "What's current recommendations on management?",
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      categoryParents: new Set(['Management']),
      categories: new Set(['Guidelines/recommendations']),
      dateThreshold: 'LAST_3_MONTHS',
    }),
    contextPhrase: 'articles on current recommendations for management',
  },
];

const ISTENT_PRESETS: LibraryPresetSpec[] = [
  {
    id: 'migs-evidence',
    label: 'Summarise the MIGS evidence.',
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      funnelLevels: new Set(['L5 Surgical-eligible (MIGS)', 'L5 Surgical-eligible']),
    }),
    contextPhrase: 'MIGS and surgical-eligible articles',
  },
  {
    id: 'advanced-burden',
    label: 'What do we know about the burden of advanced glaucoma?',
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      funnelLevels: new Set(['L4 Uncontrolled / advanced']),
    }),
    contextPhrase: 'articles on advanced / uncontrolled glaucoma burden',
  },
  {
    id: 'treatment-patterns',
    label: 'What are the current treatment patterns?',
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      categoryParents: new Set(['Management']),
    }),
    contextPhrase: 'articles on glaucoma treatment and management patterns',
  },
];

export const LIBRARY_DATASETS: Record<AssetKey, LibraryDataset> = {
  alnyx: {
    articles: ARTICLES,
    filterTree: FILTER_TREE,
    dateThresholds: DATE_THRESHOLDS,
    presets: ALNYX_PRESETS,
    hasDossiers: false,
  },
  istent: {
    articles: ISTENT_ARTICLES,
    filterTree: ISTENT_FILTER_TREE,
    dateThresholds: ISTENT_DATE_THRESHOLDS,
    presets: ISTENT_PRESETS,
    hasDossiers: true,
  },
};
