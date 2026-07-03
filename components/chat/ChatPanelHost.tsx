'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MODULES, type ModuleKey } from '@/lib/modules';
import { getChatConfig } from '@/lib/chat/module-registry';
import { useChatPanel } from './ChatPanelContext';
import ChatPanel from './ChatPanel';

/**
 * Derives the active moduleKey from the current pathname and renders the
 * shared ChatPanel for that module. Renders nothing on the landing page.
 *
 * Also enforces per-module defaultOpen: when navigating into a module with
 * defaultOpen: true (e.g. Ask GVD), the panel auto-opens. Otherwise the
 * panel's open/closed state persists across module navigations — once a user
 * opens the chat, it stays open as they move between modules.
 */
const VALID_MODULE_KEYS = new Set<string>(MODULES.map(m => m.key));

/**
 * Derives the active module from a product-scoped path `/p/<product>/<slug>`.
 * The slug segment is the module key. Returns null on landings (`/p/<product>`)
 * and any non-module path, which hides the chat panel there.
 */
function moduleKeyFromPath(pathname: string | null): ModuleKey | null {
  if (!pathname) return null;
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'p' || parts.length < 3) return null;
  const slug = parts[2];
  return VALID_MODULE_KEYS.has(slug) ? (slug as ModuleKey) : null;
}

export default function ChatPanelHost() {
  const pathname = usePathname();
  const moduleKey = moduleKeyFromPath(pathname);
  const { setIsOpen } = useChatPanel();

  // When entering a module with defaultOpen, auto-open the panel.
  useEffect(() => {
    if (!moduleKey) return;
    const cfg = getChatConfig(moduleKey);
    if (cfg.defaultOpen) {
      setIsOpen(true);
    }
  }, [moduleKey, setIsOpen]);

  if (!moduleKey) return null;
  return <ChatPanel moduleKey={moduleKey} />;
}
