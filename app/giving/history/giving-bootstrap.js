import './giving-left-rail-order.js?v=20260812-1';
import './giving-state-filter.js?v=20260813-1';
import './giving-contact-queue.js?v=20260812-5';
import './giving-export-menu.js?v=20260812-5';

if (!document.getElementById('givingCampaignToolsStylesheet')) {
  const link = document.createElement('link');
  link.id = 'givingCampaignToolsStylesheet';
  link.rel = 'stylesheet';
  link.href = new URL('./giving-campaign-tools-v2.css?v=20260812-1', import.meta.url).href;
  document.head.appendChild(link);
}

if (!document.getElementById('givingSearchControlsStylesheet')) {
  const link = document.createElement('link');
  link.id = 'givingSearchControlsStylesheet';
  link.rel = 'stylesheet';
  link.href = new URL('./giving-search-controls.css?v=20260812-2', import.meta.url).href;
  document.head.appendChild(link);
}

if (!document.getElementById('givingStateFilterStylesheet')) {
  const link = document.createElement('link');
  link.id = 'givingStateFilterStylesheet';
  link.rel = 'stylesheet';
  link.href = new URL('./giving-state-filter.css?v=20260813-1', import.meta.url).href;
  document.head.appendChild(link);
}

// Force revalidation of the shared matcher before the application module imports it.
try {
  await fetch(new URL('./giving-model.js?v=20260813-1', import.meta.url), { cache: 'reload', credentials: 'same-origin' });
} catch (error) {
  // The application import below remains authoritative; this is cache hygiene only.
}

await import('./giving-contribution-amount-filter.js?v=20260812-2');
await import('./giving-app.js?v=20260813-1');
await import('./giving-search-controls.js?v=20260812-7');
await import('./giving-campaign-tools-v2.js?v=20260812-1');
await import('./giving-contributions-copy.js?v=20260812-1');
await import('./giving-date-sort.js?v=20260813-1');
await import('./giving-dossier-help.js?v=20260812-8');