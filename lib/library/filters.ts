import type { Article } from './data';
import { ARTICLES } from './data';

// Demo-time date thresholds. ISO strings so pub_date (also ISO) compares
// lexicographically (which is correct for YYYY-MM-DD prefixed strings).
export const DATE_THRESHOLDS = {
  SINCE_LAST_GVD: '2025-11-01',
  LAST_3_MONTHS: '2026-01-01',
} as const;

export type DateThresholdKey = keyof typeof DATE_THRESHOLDS;

/** A pair of demo-time date thresholds — asset-scoped (Alnyx default below). */
export type DateThresholds = Record<DateThresholdKey, string>;

/**
 * Article counts for each date threshold, evaluated against the supplied
 * article list (ignoring other filters). Powers the "Since last GVD (86)" /
 * "Last 3 months (12)" chip labels. Asset-scoped so the iStent dataset (with
 * its own thresholds + article set) gets its own preview counts.
 */
export function dateThresholdCounts(
  articles: Article[],
  thresholds: DateThresholds,
): Record<DateThresholdKey, number> {
  return {
    SINCE_LAST_GVD: articles.filter(
      a => a.pub_date && a.pub_date >= thresholds.SINCE_LAST_GVD,
    ).length,
    LAST_3_MONTHS: articles.filter(
      a => a.pub_date && a.pub_date >= thresholds.LAST_3_MONTHS,
    ).length,
  };
}

/** Alnyx (default-asset) preview counts — preserved for existing consumers. */
export const DATE_THRESHOLD_COUNTS: Record<DateThresholdKey, number> =
  dateThresholdCounts(ARTICLES, DATE_THRESHOLDS);

export interface FilterState {
  products: Set<string>;
  productGroups: Set<string>;
  indications: Set<string>;
  pubTypes: Set<string>;
  studyTypes: Set<string>;
  geographies: Set<string>;
  sponsors: Set<string>;
  /** iStent-only patient-funnel facet; stays empty (inert) for Alnyx. */
  funnelLevels: Set<string>;
  categories: Set<string>;
  categoryParents: Set<string>;
  search: string;
  /** Quick date filter — mutually exclusive between thresholds. */
  dateThreshold: DateThresholdKey | null;
}

export const EMPTY_FILTERS: FilterState = {
  products: new Set(),
  productGroups: new Set(),
  indications: new Set(),
  pubTypes: new Set(),
  studyTypes: new Set(),
  geographies: new Set(),
  sponsors: new Set(),
  funnelLevels: new Set(),
  categories: new Set(),
  categoryParents: new Set(),
  search: '',
  dateThreshold: null,
};

export function isFilterActive(s: FilterState): boolean {
  return (
    s.products.size > 0 ||
    s.productGroups.size > 0 ||
    s.indications.size > 0 ||
    s.pubTypes.size > 0 ||
    s.studyTypes.size > 0 ||
    s.geographies.size > 0 ||
    s.sponsors.size > 0 ||
    s.funnelLevels.size > 0 ||
    s.categories.size > 0 ||
    s.categoryParents.size > 0 ||
    s.search.trim() !== '' ||
    s.dateThreshold !== null
  );
}

export function applyFilters(
  articles: Article[],
  s: FilterState,
  thresholds: DateThresholds = DATE_THRESHOLDS,
): Article[] {
  const q = s.search.trim().toLowerCase();
  const dateMin = s.dateThreshold ? thresholds[s.dateThreshold] : null;

  return articles.filter(a => {
    // Products: parent OR child match
    if (s.productGroups.size > 0 || s.products.size > 0) {
      const groupMatch = a.product_group ? s.productGroups.has(a.product_group) : false;
      const childMatch = s.products.has(a.product_display);
      if (!groupMatch && !childMatch) return false;
    }
    if (s.indications.size > 0 && (!a.indication || !s.indications.has(a.indication))) return false;
    if (s.pubTypes.size > 0 && (!a.pub_type || !s.pubTypes.has(a.pub_type))) return false;
    if (s.studyTypes.size > 0 && (!a.study_type || !s.studyTypes.has(a.study_type))) return false;
    if (s.geographies.size > 0 && (!a.geography || !s.geographies.has(a.geography))) return false;
    if (s.sponsors.size > 0 && (!a.sponsor || !s.sponsors.has(a.sponsor))) return false;
    if (s.funnelLevels.size > 0 && (!a.funnel_level || !s.funnelLevels.has(a.funnel_level))) return false;

    if (s.categoryParents.size > 0 || s.categories.size > 0) {
      const matches = a.categories.some(c => {
        if (s.categoryParents.has(c.category)) return true;
        return c.subcategories.some(sub => s.categories.has(sub));
      });
      if (!matches) return false;
    }

    if (dateMin && (!a.pub_date || a.pub_date < dateMin)) return false;

    if (q) {
      const haystack = [a.title, a.authors, a.abstract, a.product_display]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
