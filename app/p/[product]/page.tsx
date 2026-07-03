import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import {
  getCategoriesForProduct,
  getProduct,
  isProductId,
  moduleHref,
} from '@/lib/products/registry';

/**
 * Minimal product landing (foundation only — the full categorised landing with
 * collapsible groups + product switcher is Prompt 2). This proves the route and
 * product context resolve, and links every non-hidden module without dead ends:
 * live+wired modules link through; everything else shows its resolved status.
 */
export default async function ProductLanding({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  if (!isProductId(product)) notFound();

  const productDef = getProduct(product);
  const categories = getCategoriesForProduct(product);
  const accent = productDef.accentToken;

  return (
    <div className="px-8 py-10">
      <header className="mb-10">
        <div
          className="text-[11px] uppercase tracking-[0.16em] font-mono mb-2"
          style={{ color: accent }}
        >
          Evidence Hub
        </div>
        <h1 className="font-playfair text-4xl text-serif-foreground">
          {productDef.name}
        </h1>
        <p className="text-serif-muted-foreground mt-1">{productDef.subtitle}</p>
      </header>

      <div className="space-y-10">
        {categories
          .filter(({ modules }) => modules.length > 0)
          .map(({ category, modules }) => (
            <section key={category.id}>
              <h2
                className="mb-4 text-xs uppercase tracking-[0.18em] font-semibold"
                style={{ color: 'var(--evhub-navy)' }}
              >
                {category.label}
              </h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {modules.map(m => {
                  const Icon = m.icon;
                  const clickable = m.resolvedStatus === 'live' && m.wired;
                  const pill =
                    m.resolvedStatus === 'live'
                      ? m.wired
                        ? null
                        : 'In progress'
                      : 'Coming soon';

                  const body = (
                    <>
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                          color: accent,
                        }}
                      >
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <h3 className="font-semibold text-serif-foreground">
                        {m.label}
                      </h3>
                      {clickable ? (
                        <span
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                          style={{ color: accent }}
                        >
                          Open
                          <ArrowRight size={14} />
                        </span>
                      ) : (
                        <span className="mt-3 inline-flex items-center self-start px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] font-mono font-semibold text-serif-muted-foreground bg-serif-muted">
                          {pill}
                        </span>
                      )}
                    </>
                  );

                  const cardClass =
                    'flex flex-col rounded-xl border border-serif-border bg-white p-5 transition-colors';

                  return clickable ? (
                    <Link
                      key={m.id}
                      href={moduleHref(product, m.slug)}
                      className={`${cardClass} hover:border-serif-muted-foreground/40`}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      key={m.id}
                      className={`${cardClass} opacity-70`}
                      aria-disabled="true"
                    >
                      {body}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
