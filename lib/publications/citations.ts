import { ARTICLES, type Article } from '@/lib/library/data';
import { ISTENT_ARTICLES } from '@/lib/library/istent-data';
import type { ProductId } from '@/lib/products/registry';

/**
 * Reverse-lookup helper for the publication-to-message linkages applied
 * in articles.json.
 *
 * The publications data is the source of truth: each Library entry
 * declares which Scientific Narrative / Value Message / Objection
 * Handler IDs it supports via the *_link fields. This module flips
 * that index — given a module + message ID, return the list of
 * supporting publications. Module pages call it from SupportingArticles
 * to slot live references into their per-message placeholder lists.
 *
 * Linkage fields are `string | null` in the JSON. Today every link is
 * a single ID, but the asArray() helper transparently handles a
 * comma-separated form so we can extend a publication to support
 * multiple IDs in one module without a schema bump.
 *
 * Product-keyed: Alnyx and iStent each declare their own message IDs
 * (e.g. Alnyx "C2" vs iStent "U2") against their own article set, so the
 * lookup must search the active product's articles only.
 */

const ARTICLES_BY_PRODUCT: Record<ProductId, Article[]> = {
  alnyx: ARTICLES,
  istent: ISTENT_ARTICLES,
};

export type CitationModule = 'scientific-narrative' | 'value-message' | 'objection-handler';

export interface PublicationRef {
  id: string;
  title: string;
  journal: string | null;
  date: string | null;
  url: string | null;
}

const FIELD_BY_MODULE: Record<CitationModule, keyof Article> = {
  'scientific-narrative': 'scientific_narrative_link',
  'value-message':        'value_message_link',
  'objection-handler':    'objection_handler_link',
};

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export function findPublicationsForMessage(
  module: CitationModule,
  messageId: string,
  productId: ProductId,
): PublicationRef[] {
  const field = FIELD_BY_MODULE[module];
  return ARTICLES_BY_PRODUCT[productId].filter(a => asArray(a[field]).includes(messageId)).map(a => ({
    id: a.id,
    title: a.title ?? a.id,
    journal: a.journal,
    date: a.pub_date,
    url: a.pub_link ?? a.url,
  }));
}
