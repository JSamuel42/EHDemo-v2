import corpusJson from '@/data/askgvd/corpus.json';
import navJson from '@/data/askgvd/nav.json';
import suggestedJson from '@/data/askgvd/suggested-questions.json';
import type { ProductId } from '@/lib/products/registry';

export interface GvdSection {
  number: string;
  title: string;
  page_start: number;
  pages_covered: number[];
  text: string;
}

export interface GvdChapter {
  number: string;
  title: string;
  page_num: number;
  sections: { number: string; title: string; page_num: number }[];
}

export interface GvdCorpus {
  document_id: string;
  document_title: string;
  total_pages: number;
  sections: GvdSection[];
}

export interface GvdNav {
  document_title: string;
  chapters: GvdChapter[];
}

export interface GvdSuggestedQuestion {
  id: string;
  category: string;
  text: string;
}

const ALNYX_CORPUS = corpusJson as unknown as GvdCorpus;
const ALNYX_NAV = navJson as unknown as GvdNav;
const ALNYX_SUGGESTED_QUESTIONS = suggestedJson as unknown as GvdSuggestedQuestion[];

/** Product-keyed GVD data. Only `alnyx` is populated — AskGVD is
 *  `coming-soon` for iStent and gets an entry here when it's ported. */
const CORPUS_BY_PRODUCT: Partial<Record<ProductId, GvdCorpus>> = { alnyx: ALNYX_CORPUS };
const NAV_BY_PRODUCT: Partial<Record<ProductId, GvdNav>> = { alnyx: ALNYX_NAV };
const SUGGESTED_QUESTIONS_BY_PRODUCT: Partial<Record<ProductId, GvdSuggestedQuestion[]>> = {
  alnyx: ALNYX_SUGGESTED_QUESTIONS,
};

export function getGvdCorpus(productId: ProductId): GvdCorpus {
  return CORPUS_BY_PRODUCT[productId] ?? ALNYX_CORPUS;
}
export function getGvdNav(productId: ProductId): GvdNav {
  return NAV_BY_PRODUCT[productId] ?? ALNYX_NAV;
}
export function getGvdSuggestedQuestions(productId: ProductId): GvdSuggestedQuestion[] {
  return SUGGESTED_QUESTIONS_BY_PRODUCT[productId] ?? ALNYX_SUGGESTED_QUESTIONS;
}
export function getSectionsByNumber(productId: ProductId): Record<string, GvdSection> {
  return Object.fromEntries(getGvdCorpus(productId).sections.map(s => [s.number, s]));
}

// Flat Alnyx-scoped exports — unchanged values, kept for existing consumers
// (ChatPanel's suggestedQuestionsByCategory below) that are Alnyx-only today.
// The AskGVD module page resolves via the product-keyed getters above.
export const GVD_CORPUS = ALNYX_CORPUS;
export const GVD_NAV = ALNYX_NAV;
export const GVD_SUGGESTED_QUESTIONS = ALNYX_SUGGESTED_QUESTIONS;
export const GVD_SECTIONS_BY_NUMBER = getSectionsByNumber('alnyx');

/** All sections belonging to a chapter (by chapter number, e.g. "5"). */
export function getSectionsForChapter(chapterNumber: string): GvdSection[] {
  return GVD_CORPUS.sections.filter(
    s => s.number === chapterNumber || s.number.startsWith(chapterNumber + '.'),
  );
}

/** Group suggested questions by category, preserving the order they appear in the JSON. */
export function suggestedQuestionsByCategory(): { category: string; questions: GvdSuggestedQuestion[] }[] {
  const seen: string[] = [];
  const groups: Record<string, GvdSuggestedQuestion[]> = {};
  for (const q of GVD_SUGGESTED_QUESTIONS) {
    if (!groups[q.category]) {
      groups[q.category] = [];
      seen.push(q.category);
    }
    groups[q.category].push(q);
  }
  return seen.map(c => ({ category: c, questions: groups[c] }));
}
