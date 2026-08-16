const GIVING_ASSET_EPOCH = '20260816-4';
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

afterStylesheet('givingCampaignToolsStylesheet', './giving-campaign-tools-v3.css');
afterStylesheet('givingSearchControlsStylesheet', './giving-search-controls.css');
afterStylesheet('givingStateFilterStylesheet', './giving-state-filter.css');
afterStylesheet('givingClarityStylesheet', './giving-clarity.css');
afterStylesheet('givingUxResilienceStylesheet', './giving-ux-resilience.css');

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

const apertureContext = await import(epochUrl('./giving-aperture-context.js'));
apertureContext.installGivingApertureContext(globalThis);

// Install the non-visual structural runtime before the product module graph.
const surfaceRuntime = await import(epochUrl('./giving-surface-runtime.js'));
surfaceRuntime.installGivingSurfaceRuntime(globalThis);

await import(epochUrl('./giving-left-rail-order.js'));
await import(epochUrl('./giving-export-menu.js'));
await import(epochUrl('./giving-contribution-amount-filter.js'));
await import(epochUrl('./giving-state-filter.js'));
await import(epochUrl('./giving-review-paging.js'));
await import(epochUrl('./giving-ux-resilience-shell.js'));
await import(epochUrl('./giving-run-settled.js'));
await import(epochUrl('./giving-contact-queue-v2.js'));
await import(epochUrl('./giving-app.js'));
await import(epochUrl('./giving-shared-access.js'));
await import(epochUrl('./giving-search-controls.js'));
await import(epochUrl('./giving-campaign-tools-v3.js'));
await import(epochUrl('./giving-visible-language.js'));
await import(epochUrl('./giving-contributions-copy.js'));
await import(epochUrl('./giving-date-sort.js'));
await import(epochUrl('./giving-dossier-help.js'));
