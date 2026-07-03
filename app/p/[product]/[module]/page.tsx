import { notFound } from 'next/navigation';
import {
  CATEGORIES,
  getModule,
  getModuleStatus,
  getProduct,
  isModuleWired,
  isProductId,
} from '@/lib/products/registry';
import ComingSoon from '@/components/products/ComingSoon';
import { ModuleHost } from '@/components/modules/registry';

/**
 * Module resolution for /p/[product]/[module]:
 *   • unknown product / unknown slug / hidden  → 404
 *   • coming-soon                              → ComingSoon (coming-soon)
 *   • live but not wired in this build         → ComingSoon (in-progress)
 *   • live and wired                           → the real module component
 */
export default async function ModulePage({
  params,
}: {
  params: Promise<{ product: string; module: string }>;
}) {
  const { product, module: slug } = await params;
  if (!isProductId(product)) notFound();

  const mod = getModule(product, slug);
  if (!mod) notFound();

  const status = getModuleStatus(product, slug);
  if (status === 'hidden') notFound();

  const accentToken = getProduct(product).accentToken;
  const categoryLabel =
    CATEGORIES.find(c => c.id === mod.categoryId)?.label ?? '';

  if (status === 'coming-soon') {
    return (
      <ComingSoon
        variant="coming-soon"
        moduleLabel={mod.label}
        categoryLabel={categoryLabel}
        accentToken={accentToken}
      />
    );
  }

  // status === 'live'
  if (!isModuleWired(product, slug)) {
    return (
      <ComingSoon
        variant="in-progress"
        moduleLabel={mod.label}
        categoryLabel={categoryLabel}
        accentToken={accentToken}
      />
    );
  }

  return <ModuleHost slug={slug} />;
}
