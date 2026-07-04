'use client';

import { PRODUCT_ORDER, PRODUCTS, type ProductId } from '@/lib/products/registry';
import { useProduct } from '@/lib/products/context';
import { cn } from '@/lib/cn';

/**
 * Segmented product switcher. Purely presentational + URL-driven — callers
 * own navigation via `onSelect` (the landing goes straight to the target
 * product's landing; the shell resolves the smarter same-module-if-live rule
 * via `resolveProductSwitchHref`). The active segment fills with the CURRENT
 * product's accent (`--product-accent`), read from the scoped CSS var set by
 * `ProductProvider` so re-tinting on switch is automatic.
 */
export default function ProductSwitcher({
  onSelect,
  variant = 'light',
}: {
  onSelect: (productId: ProductId) => void;
  /** 'light' for white/landing surfaces, 'dark' for the navy top bar. */
  variant?: 'light' | 'dark';
}) {
  const { productId: activeProductId } = useProduct();

  const containerClass = variant === 'dark' ? 'bg-white/10' : 'bg-serif-muted';
  const inactiveClass =
    variant === 'dark'
      ? 'text-white/70 hover:text-white'
      : 'text-serif-muted-foreground hover:text-serif-foreground';

  return (
    <nav
      className={cn('inline-flex items-center gap-1 rounded-full p-0.5', containerClass)}
      aria-label="Switch product"
    >
      {PRODUCT_ORDER.map(id => {
        const product = PRODUCTS[id];
        const isActive = id === activeProductId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={isActive}
            title={`${product.name} — ${product.subtitle}`}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap',
              isActive ? 'text-[color:var(--evhub-navy)]' : inactiveClass,
            )}
            style={isActive ? { backgroundColor: 'var(--product-accent)' } : undefined}
          >
            {product.name}
          </button>
        );
      })}
    </nav>
  );
}
