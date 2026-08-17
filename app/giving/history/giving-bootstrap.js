import './giving-ux-resilience-shell.js?v=20260817-2';

const GIVING_ASSET_EPOCH = '20260816-4';
const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1';
const GIVING_PEDAGOGUE_EPOCH = '20260817-2';
const epochUrl = (path) => new URL(`${path}?v=${GIVING_ASSET_EPOCH}`, import.meta.url).href;
const repairUrl = (path) => new URL(`${path}?v=${GIVING_SEARCH_BACKPRESSURE_EPOCH}`, import.meta.url).href;
const pedagogueUrl = (path) => new URL(`${path}?v=${GIVING_PEDAGOGUE_EPOCH}`, import.meta.url).href;
const sourceUrl = (path) => new URL(path, import.meta.url).href;

// Apply the product name before loading the heavier module graph so even a
// browser arriving from an older Giving build sees the current membrane name.
document.title = 'TD613 Giving';
const ingressTitle = document.querySelector('#sessionTitle');
if (ingressTitle) ingressTitle.textContent = 'TD613 Giving';
const shellTitle = document.querySelector('.masthead .brand-block h1');
if (shellTitle) shellTitle.textContent = 'TD613 Giving';
const retrievalLabel = document.querySelector('.search-control .panel-heading .eyebrow');
if (retrievalLabel) retrievalLabel.textContent = 'GIVING HISTORY';

afterStylesheet('givingCampaignToolsStylesheet', epochUrl('./giving-campaign-tools-v3.css'));
afterStylesheet('givingSearchControlsStylesheet', epochUrl('./giving-search-controls.css'));
afterStylesheet('givingStateFilterStylesheet', epochUrl('./giving-state-filter.css'));
afterStylesheet('givingClarityStylesheet', epochUrl('./giving-clarity.css'));
afterStylesheet('givingUxResilienceStylesheet', epochUrl('./giving-ux-resilience.css'));
afterStylesheet('givingPracticeHydrationStylesheet', pedagogueUrl('./giving-practice-hydration.css'));

function afterStylesheet(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// The core app imports API/model without query strings. Review paging keeps stable
// child URLs for its earlier repairs, so explicitly revalidate those bytes before
// the fresh wrappers enter. This changes only the new Pedagogue/FEC repair entry;
// the coordinated Giving graph remains sealed at 20260816-4.
try {
  await Promise.all([
    fetch(sourceUrl('./giving-model.js'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-api.js'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-review-paging-core.js?v=20260813-3'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-fec-resilience.js?v=20260814-1'), { cache: 'reload', credentials: 'same-origin' })
  ]);
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
await import(repairUrl('./giving-review-paging.js'));
await import(repairUrl('./giving-search-render-backpressure.js'));
await import(epochUrl('./giving-run-settled.js'));
await import(epochUrl('./giving-contact-queue-v2.js'));
// Practice hydration must wrap fetch before the core app captures its API client.
await import(pedagogueUrl('./giving-practice-hydration.js'));
await import(epochUrl('./giving-app.js'));
// The surface bridge needs the core app bindings present, but adds no second route.
await import(pedagogueUrl('./giving-practice-surface-bridge.js'));
await import(epochUrl('./giving-shared-access.js'));
await import(epochUrl('./giving-search-controls.js'));
await import(epochUrl('./giving-campaign-tools-v3.js'));
await import(epochUrl('./giving-visible-language.js'));
await import(epochUrl('./giving-contributions-copy.js'));
await import(epochUrl('./giving-date-sort.js'));
await import(pedagogueUrl('./giving-dossier-help.js'));
