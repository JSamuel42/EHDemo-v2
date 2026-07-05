// Product + module registry — the single source of truth for the multi-product
// platform. Routing (`/p/[product]/[module]`) resolves against this, and the
// landing page (Prompt 2) will render from it. Nothing else should hardcode the
// product/module structure.
//
// Two axes describe a module per product:
//   • `status`  — the *design intent* shown in the UI: 'live' | 'coming-soon' | 'hidden'.
//   • `wired`   — whether the module's content is actually implemented in THIS
//                 build. A module can be 'live' in the registry (so the landing
//                 shows a live pill) while not yet wired, in which case routing
//                 degrades to a graceful "in-progress" placeholder.

import {
  BookOpen,
  Files,
  CalendarRange,
  ScrollText,
  MessageSquareQuote,
  ShieldQuestion,
  FileSearch,
  ListFilter,
  FileStack,
  GitCompare,
  Users,
  Handshake,
  Presentation,
  type LucideIcon,
} from 'lucide-react';

export type ProductId = 'alnyx' | 'istent';
export type ModuleStatus = 'live' | 'coming-soon' | 'hidden';
export type CategoryId =
  | 'evidence-layer'
  | 'core-readiness'
  | 'evidence-synthesis'
  | 'custom-applications';

export interface ProductDef {
  id: ProductId;
  /** Display name, e.g. "Alnyx". */
  name: string;
  /** Subtitle shown under the name, e.g. "alphabetinib · RRMM". */
  subtitle: string;
  /** Accent as an existing palette CSS var — no new hex values. A later theme
   *  pass (Prompt 5) can retune these centrally. */
  accentToken: string;
}

/** Fixed product order (drives the switcher + default resolution). */
export const PRODUCT_ORDER: ProductId[] = ['alnyx', 'istent'];

export const DEFAULT_PRODUCT: ProductId = 'alnyx';

export const PRODUCTS: Record<ProductId, ProductDef> = {
  alnyx: {
    id: 'alnyx',
    name: 'Alnyx',
    subtitle: 'alphabetinib · RRMM',
    // Indigo-family support accent from the existing palette.
    accentToken: 'var(--evhub-purple)',
  },
  istent: {
    id: 'istent',
    name: 'iStent infinite',
    subtitle: 'Glaukos · glaucoma / MIGS',
    // Teal/mint accent from the existing palette.
    accentToken: 'var(--evhub-mint)',
  },
};

export interface CategoryDef {
  id: CategoryId;
  label: string;
  /** Short muted descriptor shown on the landing page category header. */
  description: string;
}

/** Categories in fixed display order. */
export const CATEGORIES: CategoryDef[] = [
  { id: 'evidence-layer', label: 'Evidence Layer', description: 'Curated evidence foundation' },
  { id: 'core-readiness', label: 'Core Readiness Pack', description: 'Market-ready value assets' },
  { id: 'evidence-synthesis', label: 'Evidence Synthesis', description: 'Reviews and dossier drafting' },
  { id: 'custom-applications', label: 'Custom Applications', description: 'Advanced and emerging tools' },
];

export interface ModuleDef {
  /** Stable id (mirrors slug). */
  id: string;
  label: string;
  categoryId: CategoryId;
  /** URL segment under /p/[product]/. */
  slug: string;
  icon: LucideIcon;
  /** One-line landing-card descriptor. */
  blurb: string;
  /** Per-product design-intent status. */
  status: Record<ProductId, ModuleStatus>;
}

export const MODULES: ModuleDef[] = [
  // ── Evidence Layer ──────────────────────────────────────────────
  {
    id: 'library',
    label: 'Library',
    categoryId: 'evidence-layer',
    slug: 'library',
    icon: BookOpen,
    blurb: 'Searchable evidence base',
    status: { alnyx: 'live', istent: 'live' },
  },
  {
    id: 'document-hub',
    label: 'Document Hub',
    categoryId: 'evidence-layer',
    slug: 'document-hub',
    icon: Files,
    blurb: 'Source document discovery',
    status: { alnyx: 'live', istent: 'coming-soon' },
  },
  {
    id: 'projects',
    label: 'Projects',
    categoryId: 'evidence-layer',
    slug: 'projects',
    icon: CalendarRange,
    blurb: 'Evidence generation timeline',
    status: { alnyx: 'live', istent: 'coming-soon' },
  },

  // ── Core Readiness Pack ─────────────────────────────────────────
  {
    id: 'scientific-narrative',
    label: 'Scientific Narrative',
    categoryId: 'core-readiness',
    slug: 'scientific-narrative',
    icon: ScrollText,
    blurb: 'Structured scientific story',
    status: { alnyx: 'live', istent: 'live' },
  },
  {
    id: 'payer-value-story',
    label: 'Payer Value Story',
    categoryId: 'core-readiness',
    slug: 'payer-value-story',
    icon: MessageSquareQuote,
    blurb: 'Payer-facing value messages',
    status: { alnyx: 'live', istent: 'live' },
  },
  {
    id: 'objection-handling',
    label: 'Objection Handling',
    categoryId: 'core-readiness',
    slug: 'objection-handling',
    icon: ShieldQuestion,
    blurb: 'Rebuttals and handlers',
    status: { alnyx: 'live', istent: 'coming-soon' },
  },
  {
    id: 'ask-gvd',
    label: 'AskGVD',
    categoryId: 'core-readiness',
    slug: 'ask-gvd',
    icon: FileSearch,
    blurb: 'Query the dossier',
    status: { alnyx: 'live', istent: 'coming-soon' },
  },

  // ── Evidence Synthesis ──────────────────────────────────────────
  {
    id: 'literature-reviews',
    label: 'Literature Reviews',
    categoryId: 'evidence-synthesis',
    slug: 'literature-reviews',
    icon: ListFilter,
    blurb: 'AI-assisted screening',
    status: { alnyx: 'coming-soon', istent: 'live' },
  },
  {
    id: 'dossier-builder',
    label: 'Dossier Builder',
    categoryId: 'evidence-synthesis',
    slug: 'dossier-builder',
    icon: FileStack,
    blurb: 'AI-drafted GVD sections',
    status: { alnyx: 'coming-soon', istent: 'live' },
  },

  // ── Custom Applications ─────────────────────────────────────────
  {
    id: 'comparative-data',
    label: 'Comparative Data',
    categoryId: 'custom-applications',
    slug: 'comparative-data',
    icon: GitCompare,
    blurb: 'Competitive benchmarking',
    status: { alnyx: 'live', istent: 'coming-soon' },
  },
  {
    id: 'epidemiology',
    label: 'Epidemiology',
    categoryId: 'custom-applications',
    slug: 'epidemiology',
    icon: Users,
    blurb: 'Patient population funnels',
    status: { alnyx: 'live', istent: 'live' },
  },
  {
    id: 'ai-mock-negotiations',
    label: 'AI Mock Negotiations',
    categoryId: 'custom-applications',
    slug: 'ai-mock-negotiations',
    icon: Handshake,
    blurb: 'Simulated payer negotiations',
    status: { alnyx: 'coming-soon', istent: 'coming-soon' },
  },
  {
    id: 'synthetic-adboards',
    label: 'Synthetic Adboards',
    categoryId: 'custom-applications',
    slug: 'synthetic-adboards',
    icon: Presentation,
    blurb: 'Virtual advisory boards',
    status: { alnyx: 'coming-soon', istent: 'coming-soon' },
  },
];

/**
 * Per-product `wired` manifest — modules whose content is actually implemented
 * in this build. Distinct from `status`: a 'live' module that isn't wired
 * routes to the "in-progress" placeholder.
 *
 * • alnyx  — every Alnyx module whose status is 'live' (all ported).
 * • istent — Library (dataset + dossier columns + admin tagging shipped in
 *            Phase 1) and Epidemiology (namespaced Glaukos OAG funnels,
 *            Prompt 3a). Later prompts add more slugs here.
 */
export const WIRED: Record<ProductId, Set<string>> = {
  alnyx: new Set(
    MODULES.filter(m => m.status.alnyx === 'live').map(m => m.slug),
  ),
  istent: new Set<string>(['library', 'epidemiology']),
};

// ── Lookups + helpers ─────────────────────────────────────────────

const MODULES_BY_SLUG: Record<string, ModuleDef> = Object.fromEntries(
  MODULES.map(m => [m.slug, m]),
);

export function isProductId(v: unknown): v is ProductId {
  return v === 'alnyx' || v === 'istent';
}

export function getProduct(id: ProductId): ProductDef {
  return PRODUCTS[id];
}

/** Resolve a module by slug. `productId` is accepted for call-site symmetry;
 *  module definitions themselves are product-agnostic. */
export function getModule(_productId: ProductId, slug: string): ModuleDef | undefined {
  return MODULES_BY_SLUG[slug];
}

export function getModuleStatus(productId: ProductId, slug: string): ModuleStatus {
  return MODULES_BY_SLUG[slug]?.status[productId] ?? 'hidden';
}

export function isModuleWired(productId: ProductId, slug: string): boolean {
  return WIRED[productId].has(slug);
}

/** Build an in-app module URL. The ONLY place module paths are constructed. */
export function moduleHref(productId: ProductId, slug: string): string {
  return `/p/${productId}/${slug}`;
}

/** Landing URL for a product. */
export function productHref(productId: ProductId): string {
  return `/p/${productId}`;
}

/**
 * Resolves the destination for a product switch made from `pathname`: the
 * same module (by slug) when it's `live` for the target product, otherwise
 * the target product's landing. Deliberately ignores `wired` — a live-but-
 * unwired module still renders the graceful in-progress placeholder rather
 * than a dead end, so landing there is a reasonable switch target. The one
 * place this logic lives, shared by the shell's product switcher and any
 * other in-app product-switch affordance.
 */
export function resolveProductSwitchHref(
  pathname: string | null,
  targetProductId: ProductId,
): string {
  const parts = (pathname ?? '').split('/').filter(Boolean);
  const slug = parts[0] === 'p' ? parts[2] : undefined;
  if (slug && getModuleStatus(targetProductId, slug) === 'live') {
    return moduleHref(targetProductId, slug);
  }
  return productHref(targetProductId);
}

export interface ResolvedModule extends ModuleDef {
  resolvedStatus: ModuleStatus;
  wired: boolean;
}

export interface ResolvedCategory {
  category: CategoryDef;
  modules: ResolvedModule[];
}

/**
 * Categories (fixed order) with their non-hidden modules and each module's
 * resolved status + wired flag for the given product. Drives the sidebar now
 * and the categorised landing later.
 */
export function getCategoriesForProduct(productId: ProductId): ResolvedCategory[] {
  return CATEGORIES.map(category => ({
    category,
    modules: MODULES.filter(
      m => m.categoryId === category.id && m.status[productId] !== 'hidden',
    ).map(m => ({
      ...m,
      resolvedStatus: m.status[productId],
      wired: isModuleWired(productId, m.slug),
    })),
  }));
}
