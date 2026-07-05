'use client';

import type { ComponentType } from 'react';
import LibraryModule from './library';
import DocumentHubModule from './document-hub';
import ProjectsModule from './projects';
import ScientificNarrativeModule from './scientific-narrative';
import PayerValueStoryModule from './payer-value-story';
import ObjectionHandlingModule from './objection-handling';
import AskGvdModule from './ask-gvd';
import ComparativeDataModule from './comparative-data';
import EpidemiologyModule from './epidemiology';
import LiteratureReviewsModule from './literature-reviews';
import DossierBuilderModule from './dossier-builder';

/**
 * Maps a module slug to the client component that renders it. Only wired
 * modules appear here; the module route guards on `isModuleWired` before
 * reaching `ModuleHost`, so a missing entry is a programming error, not a
 * user-reachable state. Each module resolves its own data from the active
 * product via `useProduct()` / the Library dataset registry.
 */
const MODULE_COMPONENTS: Record<string, ComponentType> = {
  library: LibraryModule,
  'document-hub': DocumentHubModule,
  projects: ProjectsModule,
  'scientific-narrative': ScientificNarrativeModule,
  'payer-value-story': PayerValueStoryModule,
  'objection-handling': ObjectionHandlingModule,
  'ask-gvd': AskGvdModule,
  'comparative-data': ComparativeDataModule,
  epidemiology: EpidemiologyModule,
  'literature-reviews': LiteratureReviewsModule,
  'dossier-builder': DossierBuilderModule,
};

export function ModuleHost({ slug }: { slug: string }) {
  const Component = MODULE_COMPONENTS[slug];
  if (!Component) return null;
  return <Component />;
}
