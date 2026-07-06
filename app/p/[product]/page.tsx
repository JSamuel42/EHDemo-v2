import { notFound } from 'next/navigation';
import { getProduct, isProductId } from '@/lib/products/registry';
import ProductLandingClient from '@/components/products/ProductLandingClient';

export default async function ProductLanding({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  if (!isProductId(product)) notFound();

  return <ProductLandingClient product={getProduct(product)} />;
}
