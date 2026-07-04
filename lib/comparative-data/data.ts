import nuroJson from '@/data/comparative-data/products-nuro.json'
import { ALNYX_DATA } from './alnyx-data'
import type { ProductEntry, RegulatoryApproval, HtaOutcome, PivotalStudy } from './types'
import type { ProductId } from '@/lib/products/registry'

interface NuroIngestionOutput {
  ingestedAt: string
  products: Array<{
    brandName: string
    regulatoryApprovals: RegulatoryApproval[]
    htaOutcomes: HtaOutcome[]
    pivotalStudies: PivotalStudy[]
    ingestionNotes?: string
  }>
}

const nuroData = nuroJson as unknown as NuroIngestionOutput

const MODALITY_MAP: Record<string, 'bispecific' | 'car-t' | 'adc'> = {
  Tecvayli: 'bispecific',
  Elrexfio: 'bispecific',
  Talvey: 'bispecific',
  Lynozyfic: 'bispecific',
  Carvykti: 'car-t',
  Abecma: 'car-t',
  Blenrep: 'adc',
}

const ALNYX_ALL_PRODUCTS: ProductEntry[] = [
  ...nuroData.products.map((p) => ({
    brandName: p.brandName,
    isFictional: false,
    modalityCategory: MODALITY_MAP[p.brandName] ?? 'bispecific',
    regulatoryApprovals: p.regulatoryApprovals,
    htaOutcomes: p.htaOutcomes,
    pivotalStudies: p.pivotalStudies,
  })),
  {
    brandName: ALNYX_DATA.brandName,
    isFictional: true,
    modalityCategory: ALNYX_DATA.modalityCategory,
    regulatoryApprovals: [],
    htaOutcomes: [],
    pivotalStudies: [],
    alnyxData: ALNYX_DATA,
  },
]

/** Product-keyed competitive-landscape product lists. Only `alnyx` is
 *  populated — Comparative Data is `coming-soon` for iStent. */
const ALL_PRODUCTS_BY_PRODUCT: Partial<Record<ProductId, ProductEntry[]>> = {
  alnyx: ALNYX_ALL_PRODUCTS,
}

export function getAllProducts(productId: ProductId): ProductEntry[] {
  return ALL_PRODUCTS_BY_PRODUCT[productId] ?? ALNYX_ALL_PRODUCTS
}

// Flat Alnyx-scoped exports — unchanged values, kept for existing consumers
// (EvidenceSpiderChart, ProductTimeline, EvidenceGridTab, HtaOutcomesTable,
// StageMilestones, lib/chat/corpus.ts) that are Alnyx-only today. The
// Comparative Data module page resolves via getAllProducts above.
export const ALL_PRODUCTS: ProductEntry[] = ALNYX_ALL_PRODUCTS

export const PRODUCT_BY_NAME: Record<string, ProductEntry> = Object.fromEntries(
  ALL_PRODUCTS.map((p) => [p.brandName, p]),
)

export function getProductsByModality(
  category: 'bispecific' | 'car-t' | 'adc',
): ProductEntry[] {
  return ALL_PRODUCTS.filter((p) => p.modalityCategory === category)
}
