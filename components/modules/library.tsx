'use client';

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, CalendarClock, Clock, FileText, Pencil } from 'lucide-react';
import { type Article } from '@/lib/library/data';
import {
  EMPTY_FILTERS,
  applyFilters,
  isFilterActive,
  dateThresholdCounts,
  type FilterState,
  type DateThresholdKey,
} from '@/lib/library/filters';
import { LIBRARY_DATASETS } from '@/lib/library/datasets';
import { useProduct } from '@/lib/products/context';
import { useLibraryStore } from '@/lib/library/istent-store';
import { useAdminMode } from '@/lib/admin/AdminModeContext';
import {
  useChatPanel,
  type CustomSuggestedQuestion,
} from '@/components/chat/ChatPanelContext';
import FilterToolbar from '@/components/library/FilterToolbar';
import LibraryTable from '@/components/library/LibraryTable';
import Pagination from '@/components/library/Pagination';
import DossierTagModal from '@/components/library/DossierTagModal';
import { seedDossierDemo } from '@/lib/dossier/seed';
import {
  listDossiers,
  getArticleSectionNumbers,
  getDossierSections,
  flattenSectionTree,
  linkArticle,
  unlinkArticle,
  getArticleNumber,
} from '@/lib/dossier/store';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 50;
/** Max articles attached to a single Summarise request — keeps the
 *  system prompt within Claude's context budget for the demo. */
const SUMMARISE_CAP = 30;

/** Shorten verbose region labels so the dossier columns stay narrow. */
function shortenRegion(region: string): string {
  if (region === 'United Kingdom') return 'UK';
  return region;
}

/** Section IDs an article is currently linked to within a given dossier —
 *  seeds the tag modal's checkbox state. */
function linkedSectionIdsFor(dossierId: string, articleId: string): string[] {
  return flattenSectionTree(getDossierSections(dossierId))
    .filter(s => s.articleLinks.some(l => l.libraryArticleId === articleId))
    .map(s => s.id);
}

/** Build the per-row AttachedItem shape used everywhere selection feeds chat. */
function toAttachedItem(a: Article) {
  return {
    id: a.id,
    title: a.title || a.id,
    subtitle: `${a.product_display} · ${a.indication ?? '—'} · ${a.pub_year ?? '—'}`,
    kind: 'publication' as const,
  };
}

/**
 * The Suspense wrapper exists for `useSearchParams` — Next.js requires
 * routes that read search params to be wrapped during static generation,
 * otherwise build fails on this page. The inner component owns all the
 * actual state and rendering.
 */
export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageInner />
    </Suspense>
  );
}

function LibraryPageInner() {
  // Active asset drives dataset, filter tree, presets and dossier features.
  const { productId: activeAsset } = useProduct();
  const dataset = LIBRARY_DATASETS[activeAsset];
  const isIstent = dataset.hasDossiers;

  // iStent uses the in-session store (inline-edit overlay); Alnyx reads the
  // static dataset unchanged. Hooks are called unconditionally (rules of
  // hooks); the Alnyx path simply ignores the store's articles.
  const { allArticles: istentArticles, updateArticleField } = useLibraryStore();
  const { isAdminMode, toggleAdminMode } = useAdminMode();
  const articles = isIstent ? istentArticles : dataset.articles;
  const adminActive = isIstent && isAdminMode;

  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [dossierColumns, setDossierColumns] = useState<{ id: string; label: string }[]>([]);
  const [dossierSectionLookup, setDossierSectionLookup] = useState<
    Record<string, Record<string, string[]>>
  >({});

  // Admin-mode tag-to-section modal target (article × dossier), null when closed.
  const [tagTarget, setTagTarget] = useState<{
    article: Article;
    dossierId: string;
    label: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const targetArticleId = searchParams?.get('article') ?? null;

  // Reset transient view state whenever the active asset changes — filters,
  // selection and page belong to one dataset and must not leak across the
  // switch (e.g. a funnel-level filter set under iStent would empty Alnyx).
  useEffect(() => {
    setFilterState(EMPTY_FILTERS);
    setSelectedIds(new Set());
    setPage(1);
  }, [activeAsset]);

  // Deep-link handler — citation chips link to /library?article=<id>. Clears
  // filters so the row is in the visible set, jumps to its page, then scrolls
  // + tints it mint for ~2.4s. Silent no-op when the ID isn't in the set.
  useEffect(() => {
    if (!targetArticleId) return;
    const idx = articles.findIndex(a => a.id === targetArticleId);
    if (idx < 0) return;

    setFilterState(EMPTY_FILTERS);
    setSelectedIds(new Set());
    setPage(Math.floor(idx / PAGE_SIZE) + 1);
    setHighlightedId(targetArticleId);

    const scrollT = setTimeout(() => {
      const el = document.getElementById(`article-${targetArticleId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    const clearT = setTimeout(() => setHighlightedId(null), 2400);
    return () => {
      clearTimeout(scrollT);
      clearTimeout(clearT);
    };
  }, [targetArticleId, articles]);

  // Build the per-dossier columns + article→section-number lookup from the
  // in-memory dossier store (iStent only). Extracted so admin-mode tagging can
  // refresh the table cells immediately after linking/unlinking.
  const refreshDossierData = useCallback(() => {
    if (!isIstent) {
      setDossierColumns([]);
      setDossierSectionLookup({});
      return;
    }
    const dossiers = listDossiers();
    setDossierColumns(dossiers.map(d => ({ id: d.id, label: shortenRegion(d.region) })));

    const lookup: Record<string, Record<string, string[]>> = {};
    for (const d of dossiers) {
      const byArticle: Record<string, string[]> = {};
      for (const a of articles) {
        const nums = getArticleSectionNumbers(d.id, a.id);
        if (nums.length > 0) byArticle[a.id] = nums;
      }
      lookup[d.id] = byArticle;
    }
    setDossierSectionLookup(lookup);
  }, [isIstent, articles]);

  useEffect(() => {
    if (isIstent) seedDossierDemo();
    refreshDossierData();
  }, [isIstent, refreshDossierData]);

  const filtered = useMemo(
    () => applyFilters(articles, filterState, dataset.dateThresholds),
    [articles, filterState, dataset.dateThresholds],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const dateCounts = useMemo(
    () => dateThresholdCounts(articles, dataset.dateThresholds),
    [articles, dataset.dateThresholds],
  );

  useEffect(() => {
    // Skip the auto-page-reset while a deep-link is targeting a specific row.
    if (targetArticleId) return;
    setPage(1);
  }, [filterState, targetArticleId]);

  const {
    setAttachedItems,
    setIsOpen,
    sendMessage,
    isStreaming,
    setCustomSuggestedQuestions,
  } = useChatPanel();

  // Selection → chat attachments.
  useEffect(() => {
    const items = articles.filter(a => selectedIds.has(a.id)).map(toAttachedItem);
    setAttachedItems(items);
  }, [selectedIds, setAttachedItems, articles]);

  function toggleSelected(id: string) {
    setSelectedIds(curr => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage(ids: string[]) {
    setSelectedIds(curr => {
      const allOn = ids.every(i => curr.has(i));
      const next = new Set(curr);
      if (allOn) {
        for (const i of ids) next.delete(i);
      } else {
        for (const i of ids) next.add(i);
      }
      return next;
    });
  }

  function toggleDateThreshold(key: DateThresholdKey) {
    setFilterState(s => ({
      ...s,
      dateThreshold: s.dateThreshold === key ? null : key,
    }));
  }

  // Shared helper — all Summarise entry points route through this. Attaches the
  // subset (capped at SUMMARISE_CAP), opens the chat panel, and sends a
  // summarise request worded by the caller's `contextPhrase`.
  const summariseSubset = useCallback(
    (items: Article[], contextPhrase: string) => {
      const total = items.length;
      if (total === 0) return;

      const subset = items.slice(0, SUMMARISE_CAP);
      const attached = subset.map(toAttachedItem);

      setAttachedItems(attached);
      setIsOpen(true);

      const phrase =
        total <= SUMMARISE_CAP
          ? `Summarise the ${total} ${contextPhrase}.`
          : `Summarise the top ${SUMMARISE_CAP} of ${total} ${contextPhrase}.`;

      void sendMessage({
        content: phrase,
        isSuggestedQuestion: true,
        attachedItemIdsOverride: attached.map(a => a.id),
      });
    },
    [setAttachedItems, setIsOpen, sendMessage],
  );

  // Register the active asset's presets as the chat panel's custom suggested
  // questions while this page is mounted. Each preset visibly applies its
  // filter spec, clears selection, then summarises the filtered result.
  useEffect(() => {
    const presets: CustomSuggestedQuestion[] = dataset.presets.map(p => ({
      id: p.id,
      label: p.label,
      onClick: () => {
        const newFilter = p.buildFilter();
        setFilterState(newFilter);
        setSelectedIds(new Set());
        const matched = applyFilters(articles, newFilter, dataset.dateThresholds);
        summariseSubset(matched, p.contextPhrase);
      },
    }));
    setCustomSuggestedQuestions(presets);
    return () => setCustomSuggestedQuestions(null);
  }, [setCustomSuggestedQuestions, summariseSubset, articles, dataset]);

  // Summarise-button visibility + label
  const filtersActive = useMemo(() => isFilterActive(filterState), [filterState]);
  const hasSelection = selectedIds.size > 0;
  const showSummarise = hasSelection || filtersActive;
  const summariseCountLabel = useMemo(() => {
    if (hasSelection) return String(selectedIds.size);
    if (filtersActive) {
      const m = filtered.length;
      return m <= SUMMARISE_CAP ? String(m) : `top ${SUMMARISE_CAP} of ${m}`;
    }
    return null;
  }, [hasSelection, filtersActive, selectedIds.size, filtered.length]);

  const handleSummariseClick = useCallback(() => {
    if (hasSelection) {
      const selected = articles.filter(a => selectedIds.has(a.id));
      const noun = selected.length === 1 ? 'selected article' : 'selected articles';
      summariseSubset(selected, noun);
    } else if (filtersActive) {
      summariseSubset(filtered, 'articles matching the current filters');
    }
  }, [hasSelection, filtersActive, selectedIds, filtered, summariseSubset, articles]);

  // Indicator 1 label adapts: "119 articles" when no filters, "47 of 119" when filtered.
  const isFiltered = filtered.length !== articles.length;
  const primaryLabel = isFiltered
    ? `${filtered.length} of ${articles.length} articles`
    : `${articles.length} articles`;

  return (
    <div className="px-8 py-7">
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h1 className="font-playfair text-3xl text-serif-foreground">Library</h1>
        <div className="flex items-center gap-2">
          {isIstent && (
            <button
              type="button"
              onClick={toggleAdminMode}
              aria-pressed={isAdminMode}
              title={isAdminMode ? 'Exit admin mode' : 'Enter admin mode — edit cells & tag publications to dossier sections'}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                isAdminMode
                  ? 'text-white'
                  : 'border border-serif-border bg-white text-serif-muted-foreground hover:text-serif-foreground',
              )}
              style={isAdminMode ? { backgroundColor: 'var(--evhub-navy)' } : undefined}
            >
              <Pencil size={13} className={isAdminMode ? 'text-[color:var(--evhub-mint)]' : undefined} />
              <span>Admin</span>
            </button>
          )}
          {showSummarise && (
            <button
              type="button"
              data-chat-trigger
              onClick={handleSummariseClick}
              disabled={isStreaming}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--evhub-mint)' }}
            >
              <FileText size={14} />
              <span>Summarise</span>
              {summariseCountLabel && (
                <span className="text-xs font-mono opacity-90">
                  ({summariseCountLabel})
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            data-chat-trigger
            onClick={() => setIsOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90',
              showSummarise
                ? 'border border-[color:var(--evhub-navy)] bg-white text-[color:var(--evhub-navy)]'
                : 'text-white',
            )}
            style={
              showSummarise ? undefined : { backgroundColor: 'var(--evhub-navy)' }
            }
          >
            <Sparkles size={14} className="text-[color:var(--evhub-mint)]" />
            <span className="inline-flex items-baseline gap-px">
              <span>Ask</span>
              <sup className="text-[0.7em] font-semibold tracking-normal -translate-y-px">AI</sup>
            </span>
          </button>
        </div>
      </div>

      {/* Stats + date quick-action chips. The first slot is the dynamic
          counter (total / filtered + selected). The next two are the
          static-count date quick-filters; clicking applies a date filter
          on top of any other active filters. Mutually exclusive. */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground">
          <span className="text-serif-foreground font-semibold">{primaryLabel}</span>
          {selectedIds.size > 0 && (
            <>
              {' · '}
              <span className="text-serif-foreground font-semibold">{selectedIds.size}</span>{' '}
              selected
            </>
          )}
        </span>

        <span className="text-serif-muted-foreground/40">|</span>

        <DateChip
          icon={<CalendarClock size={12} />}
          label="Since last GVD"
          count={dateCounts.SINCE_LAST_GVD}
          active={filterState.dateThreshold === 'SINCE_LAST_GVD'}
          onClick={() => toggleDateThreshold('SINCE_LAST_GVD')}
        />
        <DateChip
          icon={<Clock size={12} />}
          label="Last 3 months"
          count={dateCounts.LAST_3_MONTHS}
          active={filterState.dateThreshold === 'LAST_3_MONTHS'}
          onClick={() => toggleDateThreshold('LAST_3_MONTHS')}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-serif-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={filterState.search}
            onChange={e => setFilterState(s => ({ ...s, search: e.target.value }))}
            placeholder="Search title, authors, abstract..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-serif-border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)] focus:border-transparent"
          />
        </div>
        <FilterToolbar state={filterState} onChange={setFilterState} tree={dataset.filterTree} />
      </div>

      <LibraryTable
        articles={paged}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleAllOnPage={toggleAllOnPage}
        highlightedId={highlightedId}
        dossierColumns={dossierColumns}
        dossierSectionLookup={dossierSectionLookup}
        isAdminMode={adminActive}
        onEditField={updateArticleField}
        onTagDossier={(article, dossierId) => {
          const label = dossierColumns.find(c => c.id === dossierId)?.label ?? 'dossier';
          setTagTarget({ article, dossierId, label });
        }}
      />

      {tagTarget && (
        <DossierTagModal
          article={{
            id: tagTarget.article.id,
            title: tagTarget.article.title ?? tagTarget.article.id,
            number: getArticleNumber(tagTarget.article.id),
          }}
          dossierLabel={tagTarget.label}
          sections={getDossierSections(tagTarget.dossierId)}
          linkedSectionIds={linkedSectionIdsFor(tagTarget.dossierId, tagTarget.article.id)}
          onSave={(added, removed) => {
            for (const sid of added) linkArticle(tagTarget.dossierId, sid, tagTarget.article.id);
            for (const sid of removed) unlinkArticle(tagTarget.dossierId, sid, tagTarget.article.id);
            refreshDossierData();
          }}
          onClose={() => setTagTarget(null)}
        />
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        totalCount={filtered.length}
        onChange={setPage}
      />
    </div>
  );
}

/**
 * Date quick-action chip. Carries a preview count (e.g. "86") that doesn't
 * change with other filters; click toggles the chip on/off and applies the
 * date filter. Styling matches the FilterDropdown active state.
 */
function DateChip({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors',
        active
          ? 'border-[color:var(--evhub-mint)] bg-[rgba(93,202,165,0.12)] text-serif-foreground font-semibold'
          : 'border-serif-border bg-white text-serif-foreground hover:border-serif-muted-foreground/50',
      )}
    >
      <span className="text-[color:var(--evhub-navy)]">{icon}</span>
      <span>{label}</span>
      <span
        className={cn(
          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
          active ? 'text-white' : 'text-serif-muted-foreground bg-serif-muted',
        )}
        style={active ? { backgroundColor: 'var(--evhub-mint)' } : undefined}
      >
        {count}
      </span>
    </button>
  );
}
