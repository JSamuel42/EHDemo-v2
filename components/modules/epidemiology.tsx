'use client';

import { useState } from 'react';
import { useProduct } from '@/lib/products/context';
import { FUNNELS } from '@/lib/epidemiology/data';
import { FunnelWorkspace } from '@/components/epidemiology/FunnelWorkspace';
import { SavedFunnelsList } from '@/components/epidemiology/SavedFunnelsList';
import { FUNNELS as ISTENT_FUNNELS } from '@/lib/epidemiology/istent-data';
import { FunnelWorkspace as IstentFunnelWorkspace } from '@/components/epidemiology/istent/FunnelWorkspace';
import { SavedFunnelsList as IstentSavedFunnelsList } from '@/components/epidemiology/istent/SavedFunnelsList';

/**
 * Epidemiology — Target Population Funnels.
 *
 * Two stacked sections:
 *   - Top: live workspace with one or two funnels (Add comparison /
 *     Close comparison toggle).
 *   - Bottom: saved-funnels table — View/Compare actions swap funnels
 *     in and out of the workspace slots above.
 *
 * No chat integration; the platform chat panel still renders globally
 * with its stub config for this route, which is fine.
 *
 * Alnyx (4L+ MM funnels) and iStent (OAG surgical-eligible funnels) are
 * entirely separate, namespaced component + data trees — see
 * components/epidemiology/istent/ and lib/epidemiology/istent-data.ts.
 * This file only picks which one to mount.
 */
function AlnyxEpidemiology() {
  const [primaryId, setPrimaryId] = useState<string>(FUNNELS[0].id);
  const [comparisonId, setComparisonId] = useState<string | null>(null);

  function handleCompare(id: string) {
    if (id === primaryId) return; // already in primary slot
    setComparisonId(id);
  }

  function handleView(id: string) {
    // Switching primary to whatever is currently in comparison would
    // leave the same funnel in both slots — clear comparison instead.
    if (id === comparisonId) {
      setComparisonId(null);
    }
    setPrimaryId(id);
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-screen-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-playfair text-3xl text-serif-foreground leading-tight">
          Epidemiology — Target Population Funnels
        </h1>
        <p className="text-sm text-serif-muted-foreground mt-1">
          4L+ MM target population estimates by country
        </p>
      </header>

      <div className="grid gap-6 grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
        <FunnelWorkspace
          primaryId={primaryId}
          comparisonId={comparisonId}
          onChangePrimary={setPrimaryId}
          onChangeComparison={setComparisonId}
        />
        <SavedFunnelsList
          primaryId={primaryId}
          comparisonId={comparisonId}
          onView={handleView}
          onCompare={handleCompare}
        />
      </div>
    </div>
  );
}

function IstentEpidemiology() {
  const [primaryId, setPrimaryId] = useState<string>(ISTENT_FUNNELS[0].id);
  const [comparisonId, setComparisonId] = useState<string | null>(null);

  function handleCompare(id: string) {
    if (id === primaryId) return; // already in primary slot
    setComparisonId(id);
  }

  function handleView(id: string) {
    // Switching primary to whatever is currently in comparison would
    // leave the same funnel in both slots — clear comparison instead.
    if (id === comparisonId) {
      setComparisonId(null);
    }
    setPrimaryId(id);
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-screen-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-playfair text-3xl text-serif-foreground leading-tight">
          Epidemiology — Target Population Funnels
        </h1>
        <p className="text-sm text-serif-muted-foreground mt-1">
          Open-Angle Glaucoma surgical-eligible (MIGS) population estimates by country
        </p>
      </header>

      <div className="grid gap-6 grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
        <IstentFunnelWorkspace
          primaryId={primaryId}
          comparisonId={comparisonId}
          onChangePrimary={setPrimaryId}
          onChangeComparison={setComparisonId}
        />
        <IstentSavedFunnelsList
          primaryId={primaryId}
          comparisonId={comparisonId}
          onView={handleView}
          onCompare={handleCompare}
        />
      </div>
    </div>
  );
}

export default function EpidemiologyPage() {
  const { productId } = useProduct();
  return productId === 'istent' ? <IstentEpidemiology /> : <AlnyxEpidemiology />;
}
