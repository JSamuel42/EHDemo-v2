'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProduct } from '@/lib/products/context';
import {
  getModuleStatus,
  isModuleWired,
  moduleHref,
  productHref,
  type ProductId,
} from '@/lib/products/registry';

/**
 * Compatibility bridge over the URL-derived product context.
 *
 * The active asset is now the product taken from the URL (`/p/[product]`) — no
 * longer localStorage-backed client state. This shim keeps existing consumers
 * (the Library's dataset resolution, the TopBar switcher) working unchanged:
 * `activeAsset` is the URL product, and `setActiveAsset` navigates. Switching
 * stays on the current module when that module is live + wired for the target
 * product; otherwise it lands on the target product's landing page.
 */
export type AssetKey = ProductId;

export function useActiveAsset(): {
  activeAsset: AssetKey;
  setActiveAsset: (key: AssetKey) => void;
} {
  const { productId } = useProduct();
  const router = useRouter();
  const pathname = usePathname();

  const setActiveAsset = useCallback(
    (key: AssetKey) => {
      if (key === productId) return;
      // pathname shape: /p/<product>/<slug>
      const parts = (pathname ?? '').split('/').filter(Boolean);
      const slug = parts[0] === 'p' ? parts[2] : undefined;
      if (
        slug &&
        getModuleStatus(key, slug) === 'live' &&
        isModuleWired(key, slug)
      ) {
        router.push(moduleHref(key, slug));
      } else {
        router.push(productHref(key));
      }
    },
    [productId, pathname, router],
  );

  return { activeAsset: productId, setActiveAsset };
}
