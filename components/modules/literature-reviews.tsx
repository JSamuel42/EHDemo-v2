import SearchQueryPage from '@/components/litsearch/SearchQueryPage';
import { OAG_SAVED_SEARCH } from '@/data/istent/demo/litSearchExample';

export default function LiteratureReviewsModule() {
  return <SearchQueryPage initialSavedSearch={OAG_SAVED_SEARCH} />;
}
