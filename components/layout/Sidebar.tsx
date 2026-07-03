'use client';

import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  getCategoriesForProduct,
  moduleHref,
} from '@/lib/products/registry';
import { useProduct } from '@/lib/products/context';
import { cn } from '@/lib/cn';
import SidebarNavItem from './SidebarNavItem';
import { useSidebar } from './SidebarContext';

/** Two-letter avatar initials from the product name (e.g. Alnyx → AL). */
function productInitials(name: string): string {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const { productId, product } = useProduct();

  // Nav shows a product's live modules only, grouped by category in fixed
  // order; empty categories (e.g. Evidence Synthesis for Alnyx) are skipped.
  const categories = getCategoriesForProduct(productId)
    .map(c => ({
      ...c,
      modules: c.modules.filter(m => m.resolvedStatus === 'live'),
    }))
    .filter(c => c.modules.length > 0);

  const initials = productInitials(product.name);

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-14 bottom-0 z-30 bg-white border-r border-serif-border transition-all duration-200 flex-col',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-serif-border">
        {!collapsed && (
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-serif-muted transition-colors"
            aria-label="Brand selector"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--evhub-mint), var(--evhub-purple))' }}
            >
              {initials}
            </span>
            <span className="font-playfair text-base text-serif-foreground">{product.name}</span>
            <ChevronDown size={14} className="text-serif-muted-foreground" />
          </button>
        )}
        {collapsed && (
          <span
            className="flex items-center justify-center w-8 h-8 mx-auto rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--evhub-mint), var(--evhub-purple))' }}
          >
            {initials}
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded hover:bg-serif-muted text-serif-muted-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {categories.map(({ category, modules }, idx) => (
          <div key={category.id}>
            {idx > 0 && <hr className="my-2 border-t border-serif-border" />}
            {!collapsed && (
              <div
                className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-[0.16em] font-semibold"
                style={{ color: 'var(--evhub-navy)' }}
              >
                {category.label}
              </div>
            )}
            <ul>
              {modules.map(m => {
                const href = moduleHref(productId, m.slug);
                const active = pathname === href || pathname?.startsWith(href + '/');
                return (
                  <li key={m.id}>
                    <SidebarNavItem
                      href={href}
                      label={m.label}
                      icon={m.icon}
                      active={!!active}
                      collapsed={collapsed}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
