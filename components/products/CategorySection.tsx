'use client';

import { ChevronDown } from 'lucide-react';
import { useProduct } from '@/lib/products/context';
import type { CategoryDef, ResolvedModule } from '@/lib/products/registry';
import { cn } from '@/lib/cn';
import ModuleCard from './ModuleCard';

/**
 * One collapsible landing category. The whole header row is the toggle
 * (button semantics, `aria-expanded`). Expanded renders the module grid;
 * collapsed renders an icon-only row (no count badges) — live modules tinted
 * with the product accent, coming-soon modules in plain muted colour.
 */
export default function CategorySection({
  category,
  modules,
  collapsed,
  onToggle,
}: {
  category: CategoryDef;
  modules: ResolvedModule[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { productId } = useProduct();

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <ChevronDown
          size={16}
          className={cn(
            'text-serif-muted-foreground transition-transform duration-200 shrink-0',
            collapsed && '-rotate-90',
          )}
        />
        <h2 className="font-sans text-sm font-medium text-serif-foreground">
          {category.label}
        </h2>
        <span className="font-sans text-xs text-serif-muted-foreground">
          {category.description}
        </span>
      </button>

      {collapsed ? (
        <div className="flex items-center gap-3 pl-7 pb-3">
          {modules.map(m => {
            const Icon = m.icon;
            const isLive = m.resolvedStatus === 'live';
            const label = isLive ? m.label : `${m.label} — coming soon`;
            return (
              <span
                key={m.id}
                title={label}
                aria-label={label}
                className="inline-flex items-center justify-center w-7 h-7"
                style={{
                  color: isLive ? 'var(--product-accent)' : 'var(--serif-muted-foreground)',
                }}
              >
                <Icon size={16} strokeWidth={1.8} />
              </span>
            );
          })}
        </div>
      ) : (
        <div
          className="grid gap-[10px] pl-7 pb-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}
        >
          {modules.map(m => (
            <ModuleCard key={m.id} module={m} productId={productId} />
          ))}
        </div>
      )}
    </section>
  );
}
