import documentsJson from '@/data/dochub/documents.json';
import type { ProductId } from '@/lib/products/registry';

export interface DocHubDocument {
  id: string;
  date: string | null;
  product: string | null;
  geography: string | null;
  title: string;
  description: string | null;
  type: 'Internal' | 'External' | null;
  tag: string | null;
  agency: string | null;
  summary: string | null;
  has_summary: boolean;
}

export interface DocHubGroup {
  product: string;
  geography: string;
  doc_ids: string[];
  count: number;
}

export interface DocHubFilterTree {
  products: string[];
  geographies: string[];
  types: string[];
  tags: string[];
}

interface DocHubData {
  documents: DocHubDocument[];
  filter_tree: DocHubFilterTree;
  groups: DocHubGroup[];
}

const ALNYX_DOCHUB_DATA = documentsJson as unknown as DocHubData;

/** Product-keyed Document Hub data. Only `alnyx` is populated — Document Hub
 *  is `coming-soon` for iStent and gets an entry here when it's ported. */
const DOCHUB_DATA_BY_PRODUCT: Partial<Record<ProductId, DocHubData>> = {
  alnyx: ALNYX_DOCHUB_DATA,
};

export function getDochubData(productId: ProductId): DocHubData {
  return DOCHUB_DATA_BY_PRODUCT[productId] ?? ALNYX_DOCHUB_DATA;
}
export function getDochubById(productId: ProductId): Record<string, DocHubDocument> {
  return Object.fromEntries(getDochubData(productId).documents.map(d => [d.id, d]));
}

// Flat Alnyx-scoped exports — unchanged values. Document Hub's own module
// page resolves via the product-keyed getters above.
export const DOCHUB_DATA = ALNYX_DOCHUB_DATA;

export const DOCHUB_BY_ID: Record<string, DocHubDocument> = getDochubById('alnyx');
