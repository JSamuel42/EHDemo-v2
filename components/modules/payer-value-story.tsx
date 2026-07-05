'use client';

import { useState } from 'react';
import { useProduct } from '@/lib/products/context';
import type { DomainKey as AlnyxDomainKey } from '@/lib/value-story/data';
import AlnyxSelectorPage from '@/components/value-story/SelectorPage';
import AlnyxDomainsPage from '@/components/value-story/DomainsPage';
import AlnyxDomainDetailPage from '@/components/value-story/DomainDetailPage';
import type { DomainKey as IstentDomainKey } from '@/lib/value-story/istent-data';
import IstentSelectorPage from '@/components/value-story/istent/SelectorPage';
import IstentDomainsPage from '@/components/value-story/istent/DomainsPage';
import IstentDomainDetailPage from '@/components/value-story/istent/DomainDetailPage';

type PageKey = 'selector' | 'domains' | 'detail';

/**
 * Value Story module — three-page internal flow driven by component state.
 * The AppShell wrapper lives in app/(app)/layout.tsx; the chat panel rail
 * is already mounted there and detects this route via ChatPanelHost.
 */
function AlnyxPayerValueStory() {
  const [currentPage, setCurrentPage] = useState<PageKey>('selector');
  const [selectedIndication, setSelectedIndication] = useState<string | null>(null);
  // Start with nothing pre-selected; the user can tick any combination
  // of payer-issue chips on the selector page.
  const [selectedPayerIssues, setSelectedPayerIssues] = useState<Set<string>>(new Set());
  const [activeDomain, setActiveDomain] = useState<AlnyxDomainKey | null>(null);

  if (currentPage === 'selector') {
    return (
      <AlnyxSelectorPage
        selectedIndication={selectedIndication}
        setSelectedIndication={setSelectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        setSelectedPayerIssues={setSelectedPayerIssues}
        onContinue={() => setCurrentPage('domains')}
      />
    );
  }

  if (currentPage === 'domains') {
    return (
      <AlnyxDomainsPage
        selectedIndication={selectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        onRemovePayerIssue={id => {
          const next = new Set(selectedPayerIssues);
          next.delete(id);
          setSelectedPayerIssues(next);
        }}
        onClearIndication={() => setSelectedIndication(null)}
        onSelectDomain={d => {
          setActiveDomain(d);
          setCurrentPage('detail');
        }}
        onBack={() => setCurrentPage('selector')}
      />
    );
  }

  if (currentPage === 'detail' && activeDomain) {
    return (
      <AlnyxDomainDetailPage
        domainKey={activeDomain}
        onChangeDomain={setActiveDomain}
        onBack={() => setCurrentPage('domains')}
      />
    );
  }

  // Fallback (e.g. activeDomain is null but currentPage is 'detail') — return to grid.
  return (
    <AlnyxDomainsPage
      selectedIndication={selectedIndication}
      selectedPayerIssues={selectedPayerIssues}
      onRemovePayerIssue={id => {
        const next = new Set(selectedPayerIssues);
        next.delete(id);
        setSelectedPayerIssues(next);
      }}
      onClearIndication={() => setSelectedIndication(null)}
      onSelectDomain={d => {
        setActiveDomain(d);
        setCurrentPage('detail');
      }}
      onBack={() => setCurrentPage('selector')}
    />
  );
}

function IstentPayerValueStory() {
  const [currentPage, setCurrentPage] = useState<PageKey>('selector');
  const [selectedIndication, setSelectedIndication] = useState<string | null>(null);
  const [selectedPayerIssues, setSelectedPayerIssues] = useState<Set<string>>(new Set());
  const [activeDomain, setActiveDomain] = useState<IstentDomainKey | null>(null);

  if (currentPage === 'selector') {
    return (
      <IstentSelectorPage
        selectedIndication={selectedIndication}
        setSelectedIndication={setSelectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        setSelectedPayerIssues={setSelectedPayerIssues}
        onContinue={() => setCurrentPage('domains')}
      />
    );
  }

  if (currentPage === 'domains') {
    return (
      <IstentDomainsPage
        selectedIndication={selectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        onRemovePayerIssue={id => {
          const next = new Set(selectedPayerIssues);
          next.delete(id);
          setSelectedPayerIssues(next);
        }}
        onClearIndication={() => setSelectedIndication(null)}
        onSelectDomain={d => {
          setActiveDomain(d);
          setCurrentPage('detail');
        }}
        onBack={() => setCurrentPage('selector')}
      />
    );
  }

  if (currentPage === 'detail' && activeDomain) {
    return (
      <IstentDomainDetailPage
        domainKey={activeDomain}
        onChangeDomain={setActiveDomain}
        onBack={() => setCurrentPage('domains')}
      />
    );
  }

  // Fallback (e.g. activeDomain is null but currentPage is 'detail') — return to grid.
  return (
    <IstentDomainsPage
      selectedIndication={selectedIndication}
      selectedPayerIssues={selectedPayerIssues}
      onRemovePayerIssue={id => {
        const next = new Set(selectedPayerIssues);
        next.delete(id);
        setSelectedPayerIssues(next);
      }}
      onClearIndication={() => setSelectedIndication(null)}
      onSelectDomain={d => {
        setActiveDomain(d);
        setCurrentPage('detail');
      }}
      onBack={() => setCurrentPage('selector')}
    />
  );
}

export default function PayerValueStoryPage() {
  const { productId } = useProduct();
  return productId === 'istent' ? <IstentPayerValueStory /> : <AlnyxPayerValueStory />;
}
