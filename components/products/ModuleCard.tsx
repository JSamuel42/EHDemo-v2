import Link from 'next/link';
import { moduleHref, type ProductId, type ResolvedModule } from '@/lib/products/registry';

/**
 * Landing-grid tile for a single module, keyed off its resolved status.
 * `live` renders as a whole-card link (routing itself decides whether the
 * destination shows real content or the in-progress placeholder — this
 * component doesn't need to know about `wired`). `coming-soon` renders as an
 * inert, non-focusable card. `hidden` modules never reach this component —
 * `getCategoriesForProduct` filters them out upstream.
 */
export default function ModuleCard({
  module: m,
  productId,
}: {
  module: ResolvedModule;
  productId: ProductId;
}) {
  const Icon = m.icon;
  const isLive = m.resolvedStatus === 'live';

  const icon = (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-md mb-2 shrink-0"
      style={{
        backgroundColor: isLive
          ? 'color-mix(in srgb, var(--product-accent) 14%, transparent)'
          : 'rgba(107,107,107,0.10)',
        color: isLive ? 'var(--product-accent)' : 'var(--serif-muted-foreground)',
      }}
    >
      <Icon size={16} strokeWidth={1.7} />
    </span>
  );

  if (isLive) {
    return (
      <Link
        href={moduleHref(productId, m.slug)}
        className="eh-live-card flex flex-col rounded-lg border border-serif-border bg-white p-4 transition-colors"
      >
        {icon}
        <span className="font-sans text-sm font-medium text-serif-foreground mb-1">
          {m.label}
        </span>
        <span className="font-sans text-xs text-serif-muted-foreground leading-snug">
          {m.blurb}
        </span>
      </Link>
    );
  }

  return (
    <div
      className="flex flex-col rounded-lg border border-dashed border-serif-border bg-serif-muted/40 p-4"
      aria-disabled="true"
    >
      {icon}
      <span className="font-sans text-sm font-medium text-serif-muted-foreground mb-1">
        {m.label}
      </span>
      <span className="font-sans text-xs text-serif-muted-foreground leading-snug mb-2">
        {m.blurb}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-serif-muted-foreground self-start px-2 py-0.5 rounded-full bg-white border border-serif-border">
        Coming soon
      </span>
    </div>
  );
}
