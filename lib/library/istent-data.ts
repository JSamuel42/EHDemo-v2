// iStent infinite — Open-Angle Glaucoma dataset (asset-scoped).
//
// The 22 iStent articles are loaded here as an asset-scoped dataset, separate
// from the canonical Alnyx 119-article set in `./data`. They share the exact
// same `Article` / `FilterTree` shape (the Article interface carries the
// optional funnel_level / theme / pmid fields these records use), so every
// shared Library component, filter and chat consumer resolves iStent data with
// no special-casing beyond which dataset the active asset selects.

import istentArticlesJson from '@/data/library/istent-articles.json';
import istentFilterTreeJson from '@/data/library/istent-filter-tree.json';
import type { Article, FilterTree } from '@/lib/library/data';

export type { Article, FilterTree } from '@/lib/library/data';

export const ISTENT_ARTICLES = istentArticlesJson as unknown as Article[];
export const ISTENT_FILTER_TREE = istentFilterTreeJson as unknown as FilterTree;
