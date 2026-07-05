import type { Funnel, FunnelLevel } from './data';

export interface ComputedLevel extends FunnelLevel {
  /** Absolute headcount at this level after percentage cascade. */
  absolute: number;
}

/**
 * Cascade a funnel's percentages down from its top-level absolute,
 * optionally substituting user-edited percentages from `overrides`.
 * Recomputed on every render in the workspace so % edits feel live.
 *
 * Parameter is narrowed to just the fields this function reads (not the full
 * `Funnel` shape) so it also accepts the iStent variant's structurally
 * identical but nominally distinct `Funnel`/`FunnelLevel` types (their
 * `Country` unions differ, which otherwise trips a structural mismatch on a
 * field this function never touches) — shared by both product variants
 * rather than forked, since the cascade logic itself is product-agnostic.
 */
export function computeFunnel(
  funnel: Pick<Funnel, 'topLevelAbsolute' | 'levels'>,
  overrides?: Record<string, number>,
): ComputedLevel[] {
  const result: ComputedLevel[] = [];
  let running = funnel.topLevelAbsolute;

  for (let i = 0; i < funnel.levels.length; i++) {
    const lvl = funnel.levels[i];
    const pct = overrides?.[lvl.id] ?? lvl.percentage;
    let absolute: number;
    if (i === 0) {
      absolute = running;
    } else {
      absolute = running * (pct / 100);
      running = absolute;
    }
    result.push({ ...lvl, percentage: pct, absolute: Math.round(absolute) });
  }
  return result;
}

/** Compact display: 258M / 1.5M / 30k / 1,234 */
export function formatAbsolute(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  }
  return n.toLocaleString();
}
