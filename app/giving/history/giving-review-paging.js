import './giving-page-size.js?v=20260814-1';
import './giving-fec-resilience.js?v=20260814-1';
import './giving-review-paging-core.js?v=20260813-3&repair=20260818-1';

if (!document.getElementById('givingReviewPagingStylesheet')) {
  const link = document.createElement('link');
  link.id = 'givingReviewPagingStylesheet';
  link.rel = 'stylesheet';
  link.href = new URL('./giving-review-paging.css?v=20260813-3', import.meta.url).href;
  document.head.appendChild(link);
}
