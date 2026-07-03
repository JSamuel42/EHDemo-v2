import { Clock, Hammer } from 'lucide-react';

export type ComingSoonVariant = 'coming-soon' | 'in-progress';

/**
 * Shared placeholder for modules that aren't reachable yet — two variants:
 *
 *  • 'coming-soon'  — the module isn't on this product's live set (design intent
 *                     is a future roadmap item).
 *  • 'in-progress'  — the module IS live in the registry but its content isn't
 *                     wired in this build yet ("arriving in this demo build").
 *
 * Rendered server-side from the module route; the active product accent is
 * passed in as a palette CSS var so no dead ends and everything stays on-brand.
 * Reused by the landing page later.
 */
export default function ComingSoon({
  variant,
  moduleLabel,
  categoryLabel,
  accentToken,
}: {
  variant: ComingSoonVariant;
  moduleLabel: string;
  categoryLabel: string;
  accentToken: string;
}) {
  const isInProgress = variant === 'in-progress';
  const Icon = isInProgress ? Hammer : Clock;
  const badge = isInProgress ? 'IN PROGRESS' : 'COMING SOON';
  const descriptor = isInProgress
    ? 'This module is live in the platform — its content is arriving in this demo build.'
    : 'This module is on the roadmap for this product and will light up in a future release.';

  return (
    <div className="px-8 py-12">
      <div className="max-w-2xl">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6"
          style={{ backgroundColor: accentToken, color: '#fff' }}
        >
          <Icon size={22} strokeWidth={1.8} />
        </div>

        <div className="text-[11px] uppercase tracking-[0.16em] font-mono text-serif-muted-foreground mb-2">
          {categoryLabel}
        </div>

        <h1 className="font-playfair text-3xl text-serif-foreground mb-3">
          {moduleLabel}
        </h1>

        <p className="text-serif-muted-foreground leading-relaxed mb-6">
          {descriptor}
        </p>

        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] font-mono font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentToken} 14%, transparent)`,
            color: accentToken,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accentToken }}
          />
          {badge}
        </span>
      </div>
    </div>
  );
}
