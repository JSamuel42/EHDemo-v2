import { redirect } from 'next/navigation';
import { DEFAULT_PRODUCT, productHref } from '@/lib/products/registry';

/** Root → default product landing. */
export default function RootPage() {
  redirect(productHref(DEFAULT_PRODUCT));
}
