'use client';

import { FILTER_TREE, type FilterTree } from '@/lib/library/data';
import { type FilterState, EMPTY_FILTERS, isFilterActive } from '@/lib/library/filters';
import FilterDropdown from './FilterDropdown';
import TreeFilterDropdown from './TreeFilterDropdown';

interface Props {
  state: FilterState;
  onChange: (next: FilterState) => void;
  /** Asset-scoped filter tree. Defaults to the Alnyx tree so existing
   *  call sites are unchanged; the Library passes the active asset's tree. */
  tree?: FilterTree;
}

export default function FilterToolbar({ state, onChange, tree = FILTER_TREE }: Props) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...state, ...partial });
  }

  const productTree = tree.products.map(p => ({ parent: p.group, children: p.children }));
  const categoryTree = tree.categories.map(c => ({
    parent: c.category,
    children: c.subcategories,
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TreeFilterDropdown
        label="Products"
        tree={productTree}
        selectedParents={state.productGroups}
        selectedChildren={state.products}
        onChange={(parents, children) =>
          update({ productGroups: parents, products: children })
        }
      />
      <FilterDropdown
        label="Indication"
        options={tree.indications}
        selected={state.indications}
        onChange={v => update({ indications: v })}
      />
      <FilterDropdown
        label="Pub type"
        options={tree.pub_types}
        selected={state.pubTypes}
        onChange={v => update({ pubTypes: v })}
      />
      <FilterDropdown
        label="Study type"
        options={tree.study_types}
        selected={state.studyTypes}
        onChange={v => update({ studyTypes: v })}
      />
      <FilterDropdown
        label="Geography"
        options={tree.geographies}
        selected={state.geographies}
        onChange={v => update({ geographies: v })}
      />
      <FilterDropdown
        label="Sponsor"
        options={tree.sponsors}
        selected={state.sponsors}
        onChange={v => update({ sponsors: v })}
      />
      {tree.funnel_levels && tree.funnel_levels.length > 0 && (
        <FilterDropdown
          label="Funnel level"
          options={tree.funnel_levels}
          selected={state.funnelLevels}
          onChange={v => update({ funnelLevels: v })}
        />
      )}
      <TreeFilterDropdown
        label="Category"
        tree={categoryTree}
        selectedParents={state.categoryParents}
        selectedChildren={state.categories}
        onChange={(parents, children) =>
          update({ categoryParents: parents, categories: children })
        }
      />
      {isFilterActive(state) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="ml-1 px-2 py-1 text-xs text-serif-muted-foreground hover:text-serif-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
