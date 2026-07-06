'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  getCategoriesForProduct,
  productHref,
  type CategoryId,
  type ProductDef,
} from '@/lib/products/registry';
import {
  getCollapsedIdsServerSnapshot,
  getCollapsedIdsSnapshot,
  setCollapsedIds,
  subscribeCollapsedIds,
} from '@/lib/products/landing-collapse-store';
import ProductSwitcher from './ProductSwitcher';
import CategorySection from './CategorySection';

export default function ProductLandingClient({
  product,
}: {
  product: ProductDef;
}) {
  const router = useRouter();
  const categories = useMemo(() => getCategoriesForProduct(product.id), [product.id]);

  // Default first load: all expanded. Collapse state is global across
  // products (the four categories are shared) and persists across reload +
  // navigation. The store's server snapshot is always "all expanded" so
  // there's no hydration mismatch against the real localStorage value.
  const collapsedArray = useSyncExternalStore(
    subscribeCollapsedIds,
    getCollapsedIdsSnapshot,
    getCollapsedIdsServerSnapshot,
  );
  const collapsedIds = useMemo(() => new Set(collapsedArray), [collapsedArray]);

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      const next = new Set(collapsedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setCollapsedIds(Array.from(next));
    },
    [collapsedIds],
  );

  const expandAll = useCallback(() => setCollapsedIds([]), []);
  const collapseAll = useCallback(
    () => setCollapsedIds(CATEGORIES.map(c => c.id)),
    [],
  );

  const visibleCategories = categories.filter(({ modules }) => modules.length > 0);

  return (
    <div className="px-8 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <ProductSwitcher
            variant="light"
            onSelect={id => router.push(productHref(id))}
          />
          <p className="font-mono text-xs text-serif-muted-foreground mt-2">
            {product.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-sans font-medium pt-1">
          <button
            type="button"
            onClick={expandAll}
            className="text-serif-muted-foreground hover:text-serif-foreground transition-colors"
          >
            Expand all
          </button>
          <span className="text-serif-border">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-serif-muted-foreground hover:text-serif-foreground transition-colors"
          >
            Collapse all
          </button>
        </div>
      </header>

      <div>
        {visibleCategories.map(({ category, modules }, idx) => (
          <div key={category.id}>
            <CategorySection
              category={category}
              modules={modules}
              collapsed={collapsedIds.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
            />
            {idx < visibleCategories.length - 1 && (
              <hr className="border-t border-serif-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
