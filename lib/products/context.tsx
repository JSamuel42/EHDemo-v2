'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  getProduct,
  type ProductDef,
  type ProductId,
} from './registry';

/**
 * Product context. The active product is derived from the URL param
 * (`/p/[product]`) and passed in by the product layout — it is NOT client
 * state, so refreshes and deep links resolve to a stable product. This
 * replaces the old localStorage-backed active-asset model.
 */
interface ProductContextValue {
  productId: ProductId;
  product: ProductDef;
  /** The product's accent as a palette CSS var, e.g. "var(--evhub-mint)". */
  accentToken: string;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({
  productId,
  children,
}: {
  productId: ProductId;
  children: React.ReactNode;
}) {
  const value = useMemo<ProductContextValue>(() => {
    const product = getProduct(productId);
    return { productId, product, accentToken: product.accentToken };
  }, [productId]);

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return ctx;
}
