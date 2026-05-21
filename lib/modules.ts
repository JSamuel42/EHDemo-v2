import {
  FolderOpen, BookOpen, FlaskConical, FileText,
  MessageSquareWarning, GitCompare, Brain, FolderArchive, BarChart3,
  Handshake, Users,
} from 'lucide-react';

export type ModuleGroup = 'core' | 'country-readiness' | 'evidence-synthesis';

export interface ModuleGroupDef {
  key: ModuleGroup;
  label: string;
  sublabel?: string;
}

export const MODULE_GROUPS: ModuleGroupDef[] = [
  { key: 'core', label: 'Evidence Layer' },
  { key: 'country-readiness', label: 'Core Readiness Pack' },
  { key: 'evidence-synthesis', label: 'Custom Applications' },
];

export type ModuleKey =
  | 'library'
  | 'projects'
  | 'scientific-narrative'
  | 'payer-value-story'
  | 'objection-handling'
  | 'ask-gvd'
  | 'document-hub'
  | 'comparative-data'
  | 'epidemiology'
  | 'ai-mock-negotiations'
  | 'synthetic-ad-boards';

export interface ModuleDef {
  key: ModuleKey;
  group: ModuleGroup;
  name: string;
  shortName: string;
  href: string;
  icon: typeof FolderOpen;
  cardBlurb: string;
  cardCta: string;
  /** When true the landing-page card renders 'Coming Soon' instead of the
   *  CTA arrow and the card is non-clickable; the sidebar nav skips it. */
  comingSoon?: boolean;
}

export const MODULES: ModuleDef[] = [
  // Core
  { key: 'library', group: 'core', name: 'Library', shortName: 'Library',
    href: '/library', icon: BookOpen,
    cardBlurb: 'Browse a comprehensive collection of available evidence.',
    cardCta: 'Discover Library' },
  { key: 'document-hub', group: 'core', name: 'Document Hub', shortName: 'DocHub',
    href: '/document-hub', icon: FolderArchive,
    cardBlurb: 'Quickly access global publication documents in one place.',
    cardCta: 'Browse Documents' },
  { key: 'projects', group: 'core', name: 'Projects', shortName: 'Projects',
    href: '/projects', icon: FolderOpen,
    cardBlurb: 'View timeline of key global and local evidence generation activities.',
    cardCta: 'Discover Projects' },

  // Country readiness
  { key: 'scientific-narrative', group: 'country-readiness', name: 'Scientific Narrative', shortName: 'Sci Narrative',
    href: '/scientific-narrative', icon: FlaskConical,
    cardBlurb: "Explore your product's Scientific Communication platform.",
    cardCta: 'Explore Narrative' },
  { key: 'payer-value-story', group: 'country-readiness', name: 'Payer Value Story', shortName: 'Value Story',
    href: '/payer-value-story', icon: FileText,
    cardBlurb: 'Explore value narratives across key domains for your brand.',
    cardCta: 'Explore Insights' },
  { key: 'objection-handling', group: 'country-readiness', name: 'Objection Handling', shortName: 'Objections',
    href: '/objection-handling', icon: MessageSquareWarning,
    cardBlurb: 'Field-ready responses to anticipated payer and HCP objections.',
    cardCta: 'Browse Objections' },
  { key: 'ask-gvd', group: 'country-readiness', name: 'Ask GVD', shortName: 'Ask GVD',
    href: '/ask-gvd', icon: Brain,
    cardBlurb: 'Use AI to quickly search your GVD for brand-specific insights.',
    cardCta: 'Explore GVD' },

  // Evidence synthesis
  { key: 'comparative-data', group: 'evidence-synthesis', name: 'Comparative Data', shortName: 'Comparative',
    href: '/comparative-data', icon: GitCompare,
    cardBlurb: 'Bespoke visualisations of evidence gaps, strengths, and opportunities vs competition.',
    cardCta: 'Compare Evidence' },
  { key: 'epidemiology', group: 'evidence-synthesis', name: 'Epidemiology', shortName: 'Epidemiology',
    href: '/epidemiology', icon: BarChart3,
    cardBlurb: 'Explore patient funnels and target population estimates for key markets.',
    cardCta: 'Explore Patient Funnels' },
  { key: 'ai-mock-negotiations', group: 'evidence-synthesis', name: 'AI Mock Negotiations', shortName: 'Mock Negotiations',
    href: '/ai-mock-negotiations', icon: Handshake,
    cardBlurb: 'Simulate payer pressure. Strengthen value arguments. Improve negotiation readiness.',
    cardCta: 'Coming Soon',
    comingSoon: true },
  { key: 'synthetic-ad-boards', group: 'evidence-synthesis', name: 'Synthetic Ad-boards', shortName: 'Ad-boards',
    href: '/synthetic-ad-boards', icon: Users,
    cardBlurb: 'Test value hypotheses rapidly with AI-simulated HCP & Payer perspectives.',
    cardCta: 'Coming Soon',
    comingSoon: true },
];

export const MODULES_BY_KEY: Record<ModuleKey, ModuleDef> =
  Object.fromEntries(MODULES.map(m => [m.key, m])) as Record<ModuleKey, ModuleDef>;

export function getModulesByGroup(group: ModuleGroup): ModuleDef[] {
  return MODULES.filter(m => m.group === group);
}
