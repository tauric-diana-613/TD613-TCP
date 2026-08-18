import './giving-ux-resilience-shell.js?v=20260817-2';

const GIVING_ASSET_EPOCH = '20260816-4';
const GIVING_SEARCH_BACKPRESSURE_EPOCH = '20260817-1';
const GIVING_PRACTICE_EPOCH = '20260817-12';
const GIVING_OBSERVER_IDEMPOTENCE_EPOCH = '20260818-1';
const GIVING_PAGING_FIX_EPOCH = '20260818-1';
const GIVING_MINIUPDATE_EPOCH = '20260818-4';
const epochUrl = (path) => new URL(`${path}?v=${GIVING_ASSET_EPOCH}`, import.meta.url).href;
const repairUrl = (path) => new URL(`${path}?v=${GIVING_SEARCH_BACKPRESSURE_EPOCH}`, import.meta.url).href;
const practiceUrl = (path) => new URL(`${path}?v=${GIVING_PRACTICE_EPOCH}`, import.meta.url).href;
const observerUrl = (path) => new URL(`${path}?v=${GIVING_ASSET_EPOCH}&observer=${GIVING_OBSERVER_IDEMPOTENCE_EPOCH}`, import.meta.url).href;
const pagingUrl = (path) => new URL(`${path}?v=${GIVING_SEARCH_BACKPRESSURE_EPOCH}&pagefix=${GIVING_PAGING_FIX_EPOCH}`, import.meta.url).href;
const miniupdateUrl = (path) => new URL(`${path}?v=${GIVING_MINIUPDATE_EPOCH}`, import.meta.url).href;
const sourceUrl = (path) => new URL(path, import.meta.url).href;

document.title = 'TD613 Giving';
const ingressTitle = document.querySelector('#sessionTitle');
if (ingressTitle) ingressTitle.textContent = 'TD613 Giving';
const shellTitle = document.querySelector('.masthead .brand-block h1');
if (shellTitle) shellTitle.textContent = 'TD613 Giving';
const retrievalLabel = document.querySelector('.search-control .panel-heading .eyebrow');
if (retrievalLabel) retrievalLabel.textContent = 'GIVING HISTORY';

afterStylesheet('givingCampaignToolsStylesheet', epochUrl('./giving-campaign-tools-v3.css'));
afterStylesheet('givingContributorHandoffStylesheet', epochUrl('./giving-contributor-handoff.css'));
afterStylesheet('givingTransactionClassStylesheet', epochUrl('./giving-transaction-classification.css'));
afterStylesheet('givingSearchControlsStylesheet', epochUrl('./giving-search-controls.css'));
afterStylesheet('givingStateFilterStylesheet', epochUrl('./giving-state-filter.css'));
afterStylesheet('givingClarityStylesheet', epochUrl('./giving-clarity.css'));
afterStylesheet('givingUxResilienceStylesheet', epochUrl('./giving-ux-resilience.css'));
afterStylesheet('givingPracticeHydrationStylesheet', practiceUrl('./giving-practice-hydration.css'));
afterStylesheet('givingMiniupdateStylesheet', miniupdateUrl('./giving-miniupdate.css'));
afterStylesheet('givingMiniupdateControlsStylesheet', miniupdateUrl('./giving-miniupdate-controls.css'));

function afterStylesheet(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

try {
  await Promise.all([
    fetch(sourceUrl('./giving-model.js'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-api.js'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-review-paging-core.js?v=20260813-3&repair=20260818-1&pagefix=20260818-1'), { cache: 'reload', credentials: 'same-origin' }),
    fetch(sourceUrl('./giving-fec-resilience.js?v=20260814-1'), { cache: 'reload', credentials: 'same-origin' })
  ]);
} catch {
  // Dynamic imports below remain authoritative.
}

const apertureContext = await import(epochUrl('./giving-aperture-context.js'));
apertureContext.installGivingApertureContext(globalThis);
const surfaceRuntime = await import(epochUrl('./giving-surface-runtime.js'));
surfaceRuntime.installGivingSurfaceRuntime(globalThis);

await import(epochUrl('./giving-left-rail-order.js'));
await import(epochUrl('./giving-export-menu.js'));
await import(epochUrl('./giving-contribution-amount-filter.js'));
await import(epochUrl('./giving-state-filter.js'));
await import(pagingUrl('./giving-review-paging.js'));
await import(repairUrl('./giving-search-render-backpressure.js'));
await import(epochUrl('./giving-run-settled.js'));
await import(epochUrl('./giving-contact-queue-v2.js'));

// Contributor handoff is deliberately loaded without a per-import query string.
// Practice directory imports the same URL, so browser ESM installs its listener once.
await import(sourceUrl('./giving-contributor-handoff.js'));
await import(observerUrl('./giving-transaction-classification.js'));
await import(miniupdateUrl('./giving-fec-client-budget.js'));

// One versioned root owns the fictional fetch-wrapper stack. Internal relative
// imports resolve to one stable module identity and are reused by later practice
// surfaces instead of multiplying global wrappers/listeners.
await import(practiceUrl('./giving-practice-runtime.js'));
await import(epochUrl('./giving-app.js'));
await import(practiceUrl('./giving-practice-surface-bridge.js'));

// The practice directory owns capture-phase lookup before the real campaign
// directory installs its own capture listener. Its committee graph imports the
// already-loaded unversioned practice modules and therefore adds no side effects.
await import(practiceUrl('./giving-practice-directory.js'));
await import(epochUrl('./giving-shared-access.js'));
await import(epochUrl('./giving-search-controls.js'));
await import(epochUrl('./giving-campaign-tools-v3.js'));
await import(epochUrl('./giving-activity-contributor-handoff.js'));
await import(observerUrl('./giving-visible-language.js'));
await import(epochUrl('./giving-contributions-copy.js'));
await import(observerUrl('./giving-date-sort.js'));
await import(practiceUrl('./giving-dossier-help.js'));
await import(miniupdateUrl('./giving-miniupdate.js'));
await import(miniupdateUrl('./giving-miniupdate-controls.js'));