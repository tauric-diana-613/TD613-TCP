const PRACTICE_SOURCE_ID = 'practice-bikini-bottom-votes';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const receipt = {
  schema: 'td613.giving.20260818-repair-browser-sentinel/v0.2',
  attached: true,
  desktop_structure: false,
  mobile_geometry: false,
  exact_queue_default: false,
  exit_purge: false,
  saved_practice_provenance: false,
  failures: []
};
globalThis.__TD613_GIVING_REPAIR_BROWSER_SENTINEL__ = receipt;

let failed = false;
let mobileWitnessed = false;
let queueProbeArmed = false;
let exitWitnessRunning = false;

function compact(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function fail(message, details = null) {
  if (failed) return;
  failed = true;
  const payload = details ? `${message}: ${JSON.stringify(details)}` : message;
  receipt.failures.push(payload);
  setTimeout(() => { throw new Error(`[Giving repair sentinel] ${payload}`); }, 0);
}

function assert(condition, message, details = null) {
  if (!condition) fail(message, details);
  return condition;
}

function rect(node) {
  const box = node?.getBoundingClientRect?.();
  return box ? { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height } : null;
}

function witnessDesktopStructure() {
  const hints = $('#searchHints')?.closest('.field');
  const state = $('#givingStateFilter');
  const filter = $('#committeeContextFilterControl');
  const picker = $('#searchForm .source-picker');
  const jump = $('#committeeFilterJump');
  const legend = picker?.querySelector(':scope > legend');
  if (!hints || !state || !filter || !picker || !jump || !legend) return false;
  if (!assert(state.previousElementSibling === hints, 'State must sit directly below Search Hints')) return false;
  if (!assert(filter.nextElementSibling === picker, 'committee filter must sit immediately above filing sources')) return false;
  if (!assert(compact(legend.textContent) === 'Campaign finance filing sources', 'filing-source heading must use field-legible language', { text: compact(legend.textContent) })) return false;
  const jumpStyle = getComputedStyle(jump);
  if (!assert(jumpStyle.textDecorationLine.includes('underline'), 'committee jump must visibly read as a link', { textDecorationLine: jumpStyle.textDecorationLine })) return false;
  receipt.desktop_structure = true;
  return true;
}

function witnessMobileGeometry() {
  if (failed || mobileWitnessed || innerWidth > 430) return;
  const datePair = $('.giving-date-range-filter');
  const dates = [$('#dateFrom'), $('#dateTo')].filter(Boolean);
  const presets = $('#givingDatePresets') || $('.giving-date-presets');
  const filter = $('#committeeContextFilterControl');
  const jump = $('#committeeFilterJump');
  const filterHelper = filter?.querySelector('label small');
  const picker = $('#searchForm .source-picker');
  const legend = picker?.querySelector(':scope > legend');
  const actions = picker?.querySelector('.source-picker-actions');
  const toolbar = $('.committee-ledger-toolbar-repair');
  if (!datePair || dates.length !== 2 || !presets || !filter || !jump || !picker || !legend || !actions || !toolbar) return;

  const pairRect = rect(datePair);
  const dateRects = dates.map(rect);
  const dateStyles = dates.map((node) => getComputedStyle(node));
  const dateFonts = dateStyles.map((style) => Number.parseFloat(style.fontSize));
  const legendRect = rect(legend);
  const actionsRect = rect(actions);
  const filterRect = rect(filter);
  const jumpRect = rect(jump);
  const filterHelperStyle = filterHelper ? getComputedStyle(filterHelper) : null;
  const toolbarStyle = getComputedStyle(toolbar);
  const presetStyle = getComputedStyle(presets);
  const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth;

  const boundedDates = dateRects.every((item) => item && pairRect && item.left >= pairRect.left - 1.5 && item.right <= pairRect.right + 1.5);
  const compactDates = dateRects.every((item) => item && item.height <= 38);
  const quietDateChrome = dateStyles.every((style) =>
    Number.parseFloat(style.borderTopLeftRadius || '0') <= 1.5 &&
    Number.parseFloat(style.borderTopRightRadius || '0') <= 1.5 &&
    style.boxShadow === 'none'
  );
  const jumpCentered = filterRect && jumpRect
    ? Math.abs(((jumpRect.left + jumpRect.right) / 2) - ((filterRect.left + filterRect.right) / 2)) <= 24
    : false;
  const compactCommitteeModifier = Boolean(filterRect && filterRect.height <= 82);
  const helperDemoted = !filterHelperStyle || filterHelperStyle.display === 'none';
  const sourceStackSeparated = legendRect && actionsRect
    ? legendRect.bottom <= actionsRect.top + 2 || actionsRect.bottom <= legendRect.top + 2
    : false;

  if (!assert(boundedDates, 'mobile date controls must remain inside their own pair', { pairRect, dateRects })) return;
  if (!assert(compactDates, 'mobile dates must remain quiet constraints rather than tall control chambers', { dateRects })) return;
  if (!assert(quietDateChrome, 'mobile dates must not restore rounded chamber chrome or box shadow', { styles: dateStyles.map((style) => ({ borderRadius: style.borderRadius, boxShadow: style.boxShadow })) })) return;
  if (!assert(dateFonts.every((value) => value >= 16), 'mobile native date text must remain legible without replacing the native control', { dateFonts })) return;
  if (!assert(overflow <= 2, 'mobile repair must not create horizontal page spill', { overflow, viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })) return;
  if (!assert(presetStyle.justifyContent === 'center', 'Quick Start presets must remain centered', { justifyContent: presetStyle.justifyContent })) return;
  if (!assert(compactCommitteeModifier, 'optional committee filtering must remain a compact modifier rather than a subsection', { filterRect })) return;
  if (!assert(helperDemoted, 'mobile committee modifier must demote the long explanatory sentence', { display: filterHelperStyle?.display || null })) return;
  if (!assert(jumpCentered, 'committee route must be centered rather than shoved into the left rail edge', { filterRect, jumpRect })) return;
  if (!assert(sourceStackSeparated, 'filing-source heading and actions must not collide on mobile', { legendRect, actionsRect })) return;
  if (!assert(toolbarStyle.display === 'flex' && toolbarStyle.flexWrap === 'wrap', 'Committee Workspace controls must use a wrapped natural-width mobile cluster', { display: toolbarStyle.display, flexWrap: toolbarStyle.flexWrap, gridTemplateColumns: toolbarStyle.gridTemplateColumns })) return;
  if (!assert(toolbarStyle.gridTemplateColumns === 'none' || toolbarStyle.gridTemplateColumns === '', 'Committee Workspace must not regress to equal-width mobile grid pancakes', { gridTemplateColumns: toolbarStyle.gridTemplateColumns })) return;

  mobileWitnessed = true;
  receipt.mobile_geometry = true;
}

function armExactQueueProbe() {
  if (queueProbeArmed) return;
  queueProbeArmed = true;
  const exact = $('#exactMatchToggle');
  if (!exact) return;
  exact.checked = false;
  exact.dispatchEvent(new Event('change', { bubbles: true }));
}

function witnessExactQueueDefault() {
  if (!queueProbeArmed || failed) return;
  const exact = $('#exactMatchToggle');
  const rows = $$('#contactQueueList .contact-queue-item');
  const rowToggles = rows.map((row) => row.querySelector('.contact-queue-exact')).filter(Boolean);
  if (!assert(Boolean(exact?.checked), 'Demo Add Contact must restore Exact before queue settings are captured')) return;
  if (!assert(rows.length > 0 && rowToggles.length === rows.length && rowToggles.every((button) => button.getAttribute('aria-pressed') === 'true'), 'every newly captured Demo contact must inherit Exact', { rowCount: rows.length, exactStates: rowToggles.map((button) => button.getAttribute('aria-pressed')) })) return;
  receipt.exact_queue_default = true;
}

async function witnessExitPurgeAndProvenance() {
  if (exitWitnessRunning || failed) return;
  exitWitnessRunning = true;
  await new Promise((resolve) => setTimeout(resolve, 30));
  const transient = {
    searchName: $('#searchName')?.value || '',
    aliases: $('#searchAliases')?.value || '',
    hints: $('#searchHints')?.value || '',
    amountMin: $('#amountMin')?.value || '',
    amountMax: $('#amountMax')?.value || '',
    queueInput: $('#contactQueueInput')?.value || '',
    campaignQuery: $('#campaignDirectoryQuery')?.value || '',
    reviewSearch: $('#reviewSearch')?.value || '',
    queueRows: $$('#contactQueueList .contact-queue-item').length,
    exact: Boolean($('#exactMatchToggle')?.checked),
    selectedStates: $$('#givingStateFilter input[type="checkbox"]:checked').length,
    filter: Boolean($('#committeeContextFilterToggle')?.checked),
    loaded: $('#loadedCampaignContext')?.dataset.loaded || '',
    loadedText: compact($('#loadedCampaignContext')?.textContent)
  };
  const clear = transient.searchName === '' && transient.aliases === '' && transient.hints === '' && transient.amountMin === '' && transient.amountMax === '' && transient.queueInput === '' && transient.campaignQuery === '' && transient.reviewSearch === '' && transient.queueRows === 0 && transient.exact === false && transient.selectedStates === 0 && transient.filter === false && transient.loaded !== 'true';
  if (!assert(clear, 'Exit Demo must purge transient search, queue, filter, and loaded-committee state', transient)) return;
  receipt.exit_purge = true;

  const select = $('#localDossierSelect');
  const option = [...(select?.options || [])].find((item) => /SAMPLE — Bikini Bottom contributor review/.test(item.textContent || ''));
  if (!assert(Boolean(option?.value), 'saved practice dossier must remain in local custody after Demo exit')) return;
  const prior = select.value;
  select.value = option.value;
  try {
    const repair = await import('/giving/history/giving-20260818-repair.js?v=20260818-2');
    const classified = await repair._givingRepair20260818.savedPracticeOption();
    if (!assert(classified?.value === option.value, 'saved practice dossier must be classified from source/record provenance after Demo exit', { expected: option.value, observed: classified?.value || null })) return;
    receipt.saved_practice_provenance = true;
  } finally {
    select.value = prior;
  }
}

function install() {
  const settle = () => {
    if (failed) return;
    witnessDesktopStructure();
    if (innerWidth <= 430) setTimeout(witnessMobileGeometry, 90);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(settle, 0), { once: true });
  else setTimeout(settle, 0);

  addEventListener('resize', () => {
    if (innerWidth <= 430) setTimeout(witnessMobileGeometry, 90);
  });

  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#holdReviewButton') && document.documentElement.dataset.givingPractice === 'true') {
      queueMicrotask(armExactQueueProbe);
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target?.closest?.('#addContactQueueButton') || document.documentElement.dataset.givingPractice !== 'true') return;
    queueMicrotask(witnessExactQueueDefault);
  });

  document.addEventListener('td613:giving-practice-source-registry', (event) => {
    if (event.detail?.action !== 'remove') return;
    witnessExitPurgeAndProvenance().catch((error) => fail('exit/provenance witness threw', { message: error?.message || String(error) }));
  });
}

install();