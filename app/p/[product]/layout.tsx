import { notFound } from 'next/navigation';
import { isProductId } from '@/lib/products/registry';
import { ProductProvider } from '@/lib/products/context';
import AppShell from '@/components/layout/AppShell';

/**
 * Product-scoped layout. Validates the [product] segment against the registry
 * (unknown → 404), mounts the URL-derived ProductProvider, and renders the
 * shared shell (top bar / sidebar / chat). The active product flows from the
 * URL, not client state, so refreshes and deep links are stable.
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  if (!isProductId(product)) notFound();

  return (
    <ProductProvider productId={product}>
      <AppShell>{children}</AppShell>
    </ProductProvider>
  );
}
