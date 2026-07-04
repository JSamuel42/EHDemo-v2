'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getGvdNav,
  getSectionsByNumber,
  type GvdNav,
  type GvdSection,
} from '@/lib/askgvd/data';
import {
  GVD_DOCUMENTS,
  DEFAULT_DOCUMENT_ID,
  getDocumentById,
} from '@/lib/askgvd/documents';
import { useChatPanel } from '@/components/chat/ChatPanelContext';
import { useProduct } from '@/lib/products/context';
import ChapterNav from '@/components/askgvd/ChapterNav';
import DocumentSelector from '@/components/askgvd/DocumentSelector';
import PdfViewer from '@/components/askgvd/PdfViewer';
import { cn } from '@/lib/cn';

// First chapter starts on page 7 — sensible default landing page so the
// reader sees real content rather than the cover or TOC.
const DEFAULT_PAGE = 7;

// Citation-flash visible duration. Matches the citation-banner-fade keyframe
// in globals.css — change both together if tuning.
const FLASH_MS = 8000;

interface CitationFlash {
  section: string;
  page: number;
  title: string;
  /** Date.now() at click time. Doubles as a remount key for the animation. */
  key: number;
}

/** Best-effort title lookup for a cited section number. Tries the corpus
 *  section map first, then the chapter list, then sub-section lookups in
 *  nav. Falls back to a generic label if nothing matches. */
function lookupSectionTitle(
  section: string,
  nav: GvdNav,
  sectionsByNumber: Record<string, GvdSection>,
): string {
  const sec = sectionsByNumber[section];
  if (sec?.title) return sec.title;
  const chap = nav.chapters.find(c => c.number === section);
  if (chap?.title) return chap.title;
  for (const ch of nav.chapters) {
    const s = ch.sections.find(s => s.number === section);
    if (s?.title) return s.title;
  }
  return `Section ${section}`;
}

export default function AskGvdPage() {
  const { productId } = useProduct();
  const GVD_NAV = getGvdNav(productId);
  const GVD_SECTIONS_BY_NUMBER = getSectionsByNumber(productId);

  const [activeDocumentId, setActiveDocumentId] = useState(DEFAULT_DOCUMENT_ID);
  const [activeChapter, setActiveChapter] = useState('1');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE);
  const [citationFlash, setCitationFlash] = useState<CitationFlash | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDoc = getDocumentById(activeDocumentId);

  const { setOnCitationClick, isOpen: chatOpen } = useChatPanel();

  // Citations in chat responses come as (Section X.Y, p. N). The page
  // number is the most useful signal — drive the PDF viewer directly off
  // it. We also update activeChapter/Section so the ChapterNav highlights
  // the cited location, and surface a transient banner + ChapterNav pulse
  // as a "where in the doc this came from" cue (the PDF itself can't be
  // overlaid because it renders in the browser's built-in viewer).
  const handleCitationClick = useCallback((section: string, page: number) => {
    const chapter = section.split('.')[0];
    setActiveChapter(chapter);
    setActiveSection(section);
    if (Number.isFinite(page) && page > 0) {
      setActivePage(page);
    }
    setCitationFlash({
      section,
      page,
      title: lookupSectionTitle(section, GVD_NAV, GVD_SECTIONS_BY_NUMBER),
      key: Date.now(),
    });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setCitationFlash(null), FLASH_MS);
  }, [GVD_NAV, GVD_SECTIONS_BY_NUMBER]);

  useEffect(() => {
    setOnCitationClick(handleCitationClick);
    return () => setOnCitationClick(undefined);
  }, [setOnCitationClick, handleCitationClick]);

  // Clear any pending flash-clear timer if the page unmounts mid-flash.
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  function selectChapter(chapterNumber: string) {
    setActiveChapter(chapterNumber);
    setActiveSection(null);
    const chapter = GVD_NAV.chapters.find(c => c.number === chapterNumber);
    if (chapter) setActivePage(chapter.page_num);
  }

  function selectSection(sectionNumber: string) {
    const chapter = sectionNumber.split('.')[0];
    setActiveChapter(chapter);
    setActiveSection(sectionNumber);
    const section = GVD_SECTIONS_BY_NUMBER[sectionNumber];
    if (section) {
      setActivePage(section.page_start);
    }
  }

  return (
    // Reserve space for the chat panel on Ask GVD when it's open, since
    // defaultOpen is true here — otherwise the panel overlays the right
    // edge of the PDF and important figures/tables get hidden.
    <div
      className={cn(
        'flex flex-col min-h-[calc(100vh-3.5rem)] transition-[padding] duration-300',
        chatOpen && 'md:pr-[380px]',
      )}
    >
      <div className="px-8 pt-7 pb-4">
        <h1 className="font-playfair text-3xl text-serif-foreground mb-4">Ask GVD</h1>
        <div className="flex flex-wrap items-center gap-3">
          <DocumentSelector
            documents={GVD_DOCUMENTS}
            activeId={activeDocumentId}
            onSelect={setActiveDocumentId}
          />
          {activeDoc?.populated && (
            <ChapterNav
              nav={GVD_NAV}
              activeChapter={activeChapter}
              activeSection={activeSection}
              onSelectChapter={selectChapter}
              onSelectSection={selectSection}
              flashKey={citationFlash?.key}
            />
          )}
        </div>
      </div>

      <div className="flex-1 px-8 pb-6">
        {/* Citation-source banner. Re-mounts on every citation click (key
            changes) so the fade animation restarts; auto-clears after
            FLASH_MS via the setTimeout in handleCitationClick. */}
        {citationFlash && (
          <div
            key={citationFlash.key}
            className="mb-3 px-4 py-2.5 rounded-md flex items-center gap-3 text-sm animate-citation-banner-fade"
            style={{
              backgroundColor: 'rgba(255, 230, 50, 0.18)',
              border: '1px solid rgba(220, 180, 0, 0.4)',
            }}
            role="status"
            aria-live="polite"
          >
            <span className="font-mono text-[11px] text-[color:var(--evhub-navy)] font-semibold tracking-wider">
              §{citationFlash.section} · p.{citationFlash.page}
            </span>
            <span className="text-serif-foreground truncate">{citationFlash.title}</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-serif-muted-foreground font-mono whitespace-nowrap">
              From citation
            </span>
          </div>
        )}
        {activeDoc?.populated && activeDoc.pdfPath ? (
          <PdfViewer pdfPath={activeDoc.pdfPath} page={activePage} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-serif-muted-foreground">
            <p className="text-base font-medium text-serif-foreground mb-1">
              {activeDoc?.label ?? 'GVD'} not yet available
            </p>
            <p className="text-sm">This document is in development. Pick another GVD above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
