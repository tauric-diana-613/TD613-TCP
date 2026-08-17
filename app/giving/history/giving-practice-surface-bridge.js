const PRACTICE_SOURCE_ID = 'practice-bikini-bottom-votes';
const PRACTICE_PRIMARY_NAME = 'SpongeBob SquarePants';
const PRACTICE_DATE_FROM = '2020-01-01';
const PRACTICE_NAMES = Object.freeze([
  'SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles',
  'Pearl Krabs', 'Sandy Grouper', 'Sandra Cheeks', 'Squidward Tennisballs', 'Squidward Tentpoles', 'Squidward Tortellini',
  'Rick Star', 'Sponge Bob Squarepants', 'Spongebob Square Pants', 'Patrick Staar', 'Sandy Cheecks'
]);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let practiceSource = null;
let injecting = false;
let touched = { name: false, exact: false, from: false, to: false };

function duringPracticeLoad() { return document.documentElement.dataset.givingPracticeLoad === 'true'; }
function practiceActive() { return document.documentElement.dataset.givingPractice === 'true'; }
function today() { return new Date().toISOString().slice(0, 10); }
function practiceRecordsExist() {
  return Boolean($('#recordList .record-card[data-fictional-sample="true"]')) ||
    [...$$('#recordList .record-card')].some((card) => String(card.dataset.record || '').startsWith('practice:giving.bikini-bottom-practice/'));
}
function normalize(value) { return String(value ?? '').normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s+/g, ' ').trim(); }

function broadenPracticeNameWhenRequested() {
  const exact = $('#exactMatchToggle');
  const input = $('#searchName');
  if (!input || exact?.checked !== false) return;
  const needle = normalize(input.value);
  if (!needle) return;
  const matches = PRACTICE_NAMES.filter((name) => normalize(name).includes(needle));
  if (matches.length === 1) input.value = matches[0];
}

function showPracticeExitConfirmation() {
  const sourceExit = $('#practiceExitButton');
  if (sourceExit) { sourceExit.click(); return true; }
  return false;
}

function ensureFloatingExit() {
  if (!practiceActive()) { $('#practiceFloatingExitButton')?.remove(); return; }
  if ($('#practiceFloatingExitButton')) return;
  const button = document.createElement('button');
  button.id = 'practiceFloatingExitButton';
  button.className = 'practice-floating-exit';
  button.type = 'button';
  button.textContent = 'Exit Demo';
  button.setAttribute('aria-label', 'Exit fictional sample demo');
  button.addEventListener('click', showPracticeExitConfirmation);
  document.body.append(button);
}

function syncPracticeChrome() {
  ensureFloatingExit();
  const campaignTab = $('.tab[data-view="campaign"]');
  if (campaignTab) {
    campaignTab.dataset.practiceAsleep = practiceActive() ? 'true' : 'false';
    if (practiceActive()) campaignTab.setAttribute('aria-describedby', 'practiceCampaignSleepHint');
    else campaignTab.removeAttribute('aria-describedby');
  }
}
function resetTouched() { touched = { name: false, exact: false, from: false, to: false }; }

document.addEventListener('input', (event) => {
  if (duringPracticeLoad()) {
    if (['dossierTitle', 'searchName', 'searchAliases', 'searchHints', 'dateFrom', 'dateTo', 'contactQueueInput'].includes(event.target?.id)) event.stopImmediatePropagation();
    return;
  }
  if (!practiceActive()) return;
  if (event.target?.id === 'searchName') touched.name = true;
  if (event.target?.id === 'dateFrom') touched.from = true;
  if (event.target?.id === 'dateTo') touched.to = true;
}, true);

document.addEventListener('change', (event) => {
  if (duringPracticeLoad()) {
    if (event.target?.id === 'exactMatchToggle' || event.target?.closest?.('#sourceRegistry')) event.stopImmediatePropagation();
    return;
  }
  if (practiceActive() && event.target?.id === 'exactMatchToggle') touched.exact = true;
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
  injecting = true; registry.prepend(practiceSourceMarkup(practiceSource)); injecting = false;
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
  const initial = !practiceRecordsExist();
  const exact = $('#exactMatchToggle');
  const from = $('#dateFrom');
  const to = $('#dateTo');
  const name = $('#searchName');
  if (initial && !touched.exact && exact) exact.checked = true;
  if (initial && !touched.from && from) from.value = PRACTICE_DATE_FROM;
  if (initial && !touched.to && to) to.value = today();
  if (initial && !touched.name && name) name.value = PRACTICE_PRIMARY_NAME;
  broadenPracticeNameWhenRequested();
}
function removePracticeSource() {
  $('#sourceRegistry [data-practice-source-block]')?.remove();
  practiceSource = null; resetTouched(); $('#practiceFloatingExitButton')?.remove(); syncPracticeChrome();
}

document.addEventListener('td613:giving-practice-source-registry', (event) => {
  const action = event.detail?.action;
  if (action === 'register' && event.detail?.source) {
    resetTouched(); practiceSource = event.detail.source; ensurePracticeSource();
    queueMicrotask(() => { enforcePracticeSearchPosture(); syncPracticeChrome(); });
  } else if (action === 'remove') removePracticeSource();
});

$('#searchForm')?.addEventListener('submit', enforcePracticeSearchPosture, true);
const registry = $('#sourceRegistry');
if (registry) new MutationObserver(() => {
  if (!practiceActive()) return;
  ensurePracticeSource(); queueMicrotask(enforcePracticeSourceSelection);
}).observe(registry, { childList: true, subtree: false });

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
    chip.className = 'fictional-sample-chip'; chip.textContent = 'FICTIONAL SAMPLE'; person.before(chip); card.dataset.fictionalSample = 'true';
  }
}
for (const [selector, decorator] of [['#sourceProgress', decoratePracticeRuns], ['#recordList', decoratePracticeRecords]]) {
  const node = $(selector); if (!node) continue;
  new MutationObserver(decorator).observe(node, { childList: true, subtree: true }); decorator();
}

const blockedCampaignActions = new Set(['loadPeopleButton', 'morePeopleButton', 'linkExistingButton', 'syncTargetButton', 'createContactButton', 'prepareGivingHistoryButton', 'bulkGivingHistoryButton', 'withholdButton', 'syncLoadedCommitteeButton', 'bulkExactContactsButton']);
document.addEventListener('click', (event) => {
  const button = event.target?.closest?.('button'); if (!button) return;
  if (practiceActive() && button.matches('.tab[data-view="campaign"]')) {
    event.preventDefault(); event.stopImmediatePropagation(); showPracticeExitConfirmation(); return;
  }
  if (!blockedCampaignActions.has(button.id)) return;
  const hasPracticeRecords = Boolean($('#recordList .record-card[data-fictional-sample="true"]'));
  if (!hasPracticeRecords && !practiceActive()) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const status = $('#campaignDeputyToolsStatus');
  if (status) status.textContent = 'FICTIONAL PRACTICE · Campaign Deputy is asleep. Exit the demo before opening or mutating any real CRM surface.';
}, true);

const sleepHint = document.createElement('span');
sleepHint.id = 'practiceCampaignSleepHint'; sleepHint.hidden = true;
sleepHint.textContent = 'Campaign Deputy sleeps during the fictional sample. Activating this tab opens the shared Exit Sample Demo confirmation.';
document.body.append(sleepHint); syncPracticeChrome();

export const _givingPracticeSurfaceBridge = Object.freeze({
  PRACTICE_SOURCE_ID, PRACTICE_PRIMARY_NAME, PRACTICE_NAMES,
  ensurePracticeSource, enforcePracticeSourceSelection, enforcePracticeSearchPosture,
  broadenPracticeNameWhenRequested, ensureFloatingExit, showPracticeExitConfirmation, decoratePracticeRecords
});
