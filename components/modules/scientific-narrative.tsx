'use client';

import { useState } from 'react';
import { useProduct } from '@/lib/products/context';
import type { PillarKey as AlnyxPillarKey } from '@/lib/scientific-narrative/data';
import AlnyxPillarsPage from '@/components/scientific-narrative/PillarsPage';
import AlnyxPillarDetailPage from '@/components/scientific-narrative/PillarDetailPage';
import type { PillarKey as IstentPillarKey } from '@/lib/scientific-narrative/istent-data';
import IstentPillarsPage from '@/components/scientific-narrative/istent/PillarsPage';
import IstentPillarDetailPage from '@/components/scientific-narrative/istent/PillarDetailPage';

type PageKey = 'pillars' | 'detail';

function AlnyxScientificNarrative() {
  const [currentPage, setCurrentPage] = useState<PageKey>('pillars');
  const [activePillar, setActivePillar] = useState<AlnyxPillarKey | null>(null);

  if (currentPage === 'pillars' || !activePillar) {
    return (
      <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
        <AlnyxPillarsPage
          onSelectPillar={p => {
            setActivePillar(p);
            setCurrentPage('detail');
          }}
        />
      </div>
    );
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      <AlnyxPillarDetailPage
        pillarKey={activePillar}
        onChangePillar={setActivePillar}
        onBack={() => setCurrentPage('pillars')}
      />
    </div>
  );
}

function IstentScientificNarrative() {
  const [currentPage, setCurrentPage] = useState<PageKey>('pillars');
  const [activePillar, setActivePillar] = useState<IstentPillarKey | null>(null);

  if (currentPage === 'pillars' || !activePillar) {
    return (
      <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
        <IstentPillarsPage
          onSelectPillar={p => {
            setActivePillar(p);
            setCurrentPage('detail');
          }}
        />
      </div>
    );
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      <IstentPillarDetailPage
        pillarKey={activePillar}
        onChangePillar={setActivePillar}
        onBack={() => setCurrentPage('pillars')}
      />
    </div>
  );
}

/**
 * Scientific Narrative module — two-page internal flow driven by component
 * state. AppShell + chat panel are mounted by app/(app)/layout.tsx, so this
 * page wires only the inner content. Branches by product: Alnyx keeps its
 * original R/R MM pillars flow untouched; iStent renders the namespaced
 * Open-Angle Glaucoma pillars flow.
 */
export default function ScientificNarrativePage() {
  const { productId } = useProduct();
  return productId === 'istent' ? <IstentScientificNarrative /> : <AlnyxScientificNarrative />;
}
