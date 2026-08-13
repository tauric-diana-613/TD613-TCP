const GIVING_ASSET_EPOCH = '20260813-3';
const epochUrl = (path) => new URL(`${path}?v=${GIVING_ASSET_EPOCH}`, import.meta.url).href;

// Apply the product name before loading the heavier module graph so even a
// browser arriving from an older Giving build sees the current membrane name.
document.title = 'TD613 Giving';
const ingressTitle = document.querySelector('#sessionTitle');
if (ingressTitle) ingressTitle.textContent = 'TD613 Giving';
const shellTitle = document.querySelector('.masthead .brand-block h1');
if (shellTitle) shellTitle.textContent = 'TD613 Giving';
const retrievalLabel = document.querySelector('.search-control .panel-heading .eyebrow');
if (retrievalLabel) retrievalLabel.textContent = 'GIVING HISTORY';

afterStylesheet('givingCampaignToolsStylesheet', './giving-campaign-tools-v2.css');
afterStylesheet('givingSearchControlsStylesheet', './giving-search-controls.css');
afterStylesheet('givingStateFilterStylesheet', './giving-state-filter.css');

function afterStylesheet(id, path) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = epochUrl(path);
  document.head.appendChild(link);
}

try {
  await fetch(epochUrl('./giving-model.js'), { cache: 'reload', credentials: 'same-origin' });
} catch {
  // Dynamic imports below remain authoritative.
}

await import(epochUrl('./giving-left-rail-order.js'));
await import(epochUrl('./giving-contact-queue.js'));
await import(epochUrl('./giving-export-menu.js'));
await import(epochUrl('./giving-contribution-amount-filter.js'));
await import(epochUrl('./giving-state-filter.js'));
await import(epochUrl('./giving-review-paging.js'));
await import(epochUrl('./giving-app.js'));
await import(epochUrl('./giving-search-controls.js'));
await import(epochUrl('./giving-campaign-tools-v2.js'));
await import(epochUrl('./giving-contributions-copy.js'));
await import(epochUrl('./giving-date-sort.js'));
await import(epochUrl('./giving-dossier-help.js'));
