import type { ProductId } from './registry';

/**
 * Product-scoped source-data directory convention.
 *
 * Raw source artefacts (spreadsheets, GVD PDFs — the inputs to the offline
 * `scripts/<area>/ingest.py` pipelines) live under `data/source/<product>/`.
 *
 * NOTE: the app's *runtime* datasets are static JSON imports under
 * `data/<module>/…` and are already product-scoped in code (see
 * `lib/library/datasets.ts`, which resolves the dataset/filter-tree/presets
 * from the active product). There is therefore no runtime data path to
 * re-route here; this helper anchors the source-artefact convention so future
 * per-product ingests (e.g. iStent) have one canonical location.
 */
export function productDataDir(productId: ProductId): string {
  return `data/source/${productId}`;
}
