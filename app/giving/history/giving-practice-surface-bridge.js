const PRACTICE_SOURCE_ID = 'practice-bikini-bottom-votes';
const PRACTICE_PRIMARY_NAME = 'SpongeBob SquarePants';
const PRACTICE_DATE_FROM = '2020-01-01';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let practiceSource = null;
let injecting = false;

function duringPracticeLoad() {
  return document.documentElement.dataset.givingPracticeLoad === 'true';
}

function practiceActive() {
  return document.documentElement.dataset.givingPractice === 'true';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function practiceRecordsExist() {
  return Boolean($('#recordList .record-card[data-fictional-sample="true"]')) ||
    [...$$('#recordList .record-card')].some((card) => String(card.dataset.record || '').startsWith('practice:giving.bikini-bottom-practice/'));
}

// Canonical fixture load must remain zero-effect. The existing Giving shell uses
// input/change events for ordinary autosave, so stop those events only during the
// bounded fixture-load instant. Search, Save, and Vault remain separate gestures.
document.addEventListener('input', (event) => {
  if (!duringPracticeLoad()) return;
  if (['dossierTitle', 'searchName', 'searchAliases', 'searchHints', 'dateFrom', 'dateTo', 'contactQueueInput'].includes(event.target?.id)) event.stopImmediatePropagation();
}, true);

document.addEventListener('change', (event) => {
  if (!duringPracticeLoad()) return;
  if (event.target?.id === 'exactMatchToggle' || event.target?.closest?.('#sourceRegistry')) event.stopImmediatePropagation();
}, true);

function practiceSourceMarkup(source) {
  const block = document.createElement('div');
  block.dataset.practiceSourceBlock = 'true';
  block.innerHTML = `
    <div class="source-family-label">FICTIONAL PRACTICE · 1</div>
    <label class="source-option practice-source-option">
      <input type="checkbox" value="${source.id}" checked>
      <span><strong>${source.custodian}</strong><small>${source.jurisdiction} · ${source.electronic_scope}</small></span>
      <em>READY</em>
    </label>`;
  return block;
}

function ensurePracticeSource() {
  if (!practiceSource || injecting) return;
  const registry = $('#sourceRegistry');
  if (!registry || registry.querySelector('[data-practice-source-block]')) return;
  injecting = true;
  registry.prepend(practiceSourceMarkup(practiceSource));
  injecting = false;
}

function enforcePracticeSourceSelection() {
  if (!practiceActive() || !practiceSource) return;
  ensurePracticeSource();
  for (const input of $$('#sourceRegistry input[type="checkbox"]')) input.checked = input.value === PRACTICE_SOURCE_ID;
  const sourceCount = $('#selectedSourceCount');
  if (sourceCount) sourceCount.textContent = '1 source';
}

function enforcePracticeSearchPosture() {
  if (!practiceActive()) return;
  enforcePracticeSourceSelection();
  const exact = $('#exactMatchToggle');
  if (exact) exact.checked = true;
  const from = $('#dateFrom');
  const to = $('#dateTo');
  if (from) from.value = PRACTICE_DATE_FROM;
  if (to) to.value = today();

  // Before the first fictional record exists, the initial search belongs to the
  // authored SpongeBob seed even if a late authenticated hydrateForm() restored
  // the pre-demo query. Once the first result exists, queued contributor searches
  // keep their own current names while exact-match/source/date posture stays fixed.
  if (!practiceRecordsExist()) {
    const name = $('#searchName');
    if (name) name.value = PRACTICE_PRIMARY_NAME;
  }
}

function removePracticeSource() {
  $('#sourceRegistry [data-practice-source-block]')?.remove();
  practiceSource = null;
}

document.addEventListener('td613:giving-practice-source-registry', (event) => {
  const action = event.detail?.action;
  if (action === 'register' && event.detail?.source) {
    practiceSource = event.detail.source;
    ensurePracticeSource();
    queueMicrotask(enforcePracticeSearchPosture);
  } else if (action === 'remove') {
    removePracticeSource();
  }
});

// Ordinary authenticated hydration may finish after the sample was loaded.
// Reassert the closed practice aperture at the explicit SEARCH gesture boundary,
// before Giving's bubble-phase startSearch reads the current form.
$('#searchForm')?.addEventListener('submit', enforcePracticeSearchPosture, true);

const registry = $('#sourceRegistry');
if (registry) {
  new MutationObserver(() => {
    if (!practiceActive()) return;
    ensurePracticeSource();
    queueMicrotask(enforcePracticeSearchPosture);
  }).observe(registry, { childList: true, subtree: false });
}

function decoratePracticeRuns() {
  for (const card of $$('#sourceProgress .source-run-card')) {
    const strong = card.querySelector('.source-run-head strong');
    if (!strong || strong.textContent.trim() !== PRACTICE_SOURCE_ID) continue;
    strong.textContent = 'BikiniBottomVotes';
    const meta = card.querySelector('.source-run-meta span');
    if (meta) meta.textContent = 'FICTIONAL PRACTICE · Bikini Bottom, Oceania';
    card.dataset.practiceSource = 'true';
  }
}

function decoratePracticeRecords() {
  for (const card of $$('#recordList .record-card')) {
    if (!String(card.dataset.record || '').startsWith('practice:giving.bikini-bottom-practice/')) continue;
    if (card.querySelector('.fictional-sample-chip')) continue;
    const person = card.querySelector('.record-person strong');
    if (!person) continue;
    const chip = document.createElement('span');
    chip.className = 'fictional-sample-chip';
    chip.textContent = 'FICTIONAL SAMPLE';
    person.before(chip);
    card.dataset.fictionalSample = 'true';
  }
}

for (const [selector, decorator] of [['#sourceProgress', decoratePracticeRuns], ['#recordList', decoratePracticeRecords]]) {
  const node = $(selector);
  if (!node) continue;
  new MutationObserver(decorator).observe(node, { childList: true, subtree: true });
  decorator();
}

const blockedCampaignActions = new Set([
  'loadPeopleButton', 'morePeopleButton', 'linkExistingButton', 'syncTargetButton',
  'createContactButton', 'prepareGivingHistoryButton', 'bulkGivingHistoryButton',
  'withholdButton', 'syncLoadedCommitteeButton', 'bulkExactContactsButton'
]);

document.addEventListener('click', (event) => {
  const button = event.target?.closest?.('button');
  if (!button || !blockedCampaignActions.has(button.id)) return;
  const hasPracticeRecords = Boolean($('#recordList .record-card[data-fictional-sample="true"]'));
  if (!hasPracticeRecords && !practiceActive()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const message = 'FICTIONAL PRACTICE · Campaign Deputy remains closed. Exit the demo and open a non-fictional research file before any CRM action.';
  for (const id of ['campaignToolsStatus', 'campaignDeputyToolsStatus']) {
    const status = document.getElementById(id);
    if (status) status.textContent = message;
  }
}, true);

export const _givingPracticeSurfaceBridge = Object.freeze({
  PRACTICE_SOURCE_ID,
  PRACTICE_PRIMARY_NAME,
  ensurePracticeSource,
  enforcePracticeSourceSelection,
  enforcePracticeSearchPosture,
  decoratePracticeRecords
});
