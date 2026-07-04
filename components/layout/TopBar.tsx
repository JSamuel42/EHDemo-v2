'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import EvHubLogo from '@/components/brand/EvHubLogo';
import ProductSwitcher from '@/components/products/ProductSwitcher';
import { useProduct } from '@/lib/products/context';
import { productHref, resolveProductSwitchHref, type ProductId } from '@/lib/products/registry';

export default function TopBar() {
  const { productId } = useProduct();
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch(target: ProductId) {
    if (target === productId) return;
    router.push(resolveProductSwitchHref(pathname, target));
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-6"
      style={{ backgroundColor: 'var(--evhub-navy)' }}
    >
      <Link href={productHref(productId)} className="text-white">
        <EvHubLogo />
      </Link>
      <div className="flex items-center gap-4">
        <ProductSwitcher variant="dark" onSelect={handleSwitch} />
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold"
          style={{ backgroundColor: 'rgba(175,169,236,0.35)', color: '#FFFFFF' }}
          aria-label="User avatar"
        >
          J
        </div>
      </div>
    </header>
  );
}
