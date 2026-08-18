import {
  PRACTICE_COMMITTEES,
  expendituresForCommittee,
  expenditureCoverageAudit
} from './giving-practice-expenditures.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const key = (value) => compact(value).toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, ' ').trim();
const money = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100);

let loadedCommittee = null;
let clusterInspectionActive = false;
let queueCueArmed = false;
const zeroResultTargets = new Set();

function practiceActive() {
  return document.documentElement.dataset.givingPractice === 'true';
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
}

function scrollToElement(node, offset = 84) {
  if (!node) return;
  const top = Math.max(0, node.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top, left: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

function setText(node, next) {
  if (node && node.textContent !== next) node.textContent = next;
}

function practiceCommitteeById(id) {
  return PRACTICE_COMMITTEES.find((committee) => committee.id === id) || null;
}

function normalizeCommitteeContext(value = {}) {
  const name = compact(value.committee_name || value.committeeName || '');
  if (!name) return null;
  return Object.freeze({
    committee_id: compact(value.committee_id || value.committeeId || '') || null,
    committee_name: name,
    candidate_name: compact(value.candidate_name || value.candidateName || '') || null,
    source_id: compact(value.source_id || value.sourceId || '') || null,
    practice: value.practice === true
  });
}

function loadedContextTitle() {
  return loadedCommittee?.committee_name || 'No candidate or committee loaded.';
}

function renderLoadedFilterHint() {
  const banner = $('#loadedCampaignContext');
  if (!banner) return;
  let hint = banner.querySelector('.loaded-context-filter-hint');
  if (!hint) {
    hint = document.createElement('small');
    hint.className = 'loaded-context-filter-hint';
    banner.append(hint);
  }
  const next = loadedCommittee
    ? 'This reviewed committee can filter the next contributor retrieval when “Filter by loaded committee” is checked in Search terms.'
    : 'Optional context only. Ordinary contributor search works without this. Load a committee below if you want to constrain a contributor retrieval to one committee.';
  setText(hint, next);
}

function setPracticeLoadedContext(context) {
  loadedCommittee = normalizeCommitteeContext({ ...context, practice: true });
  const banner = $('#loadedCampaignContext');
  if (banner && loadedCommittee) {
    banner.dataset.loaded = 'true';
    banner.innerHTML = `<span class="eyebrow">LOADED CAMPAIGN / COMMITTEE</span><strong>${loadedCommittee.committee_name}</strong><small>${[loadedCommittee.candidate_name, loadedCommittee.committee_id, 'BikiniBottomVotes · FICTIONAL SAMPLE'].filter(Boolean).join(' · ')}</small>`;
  }
  renderLoadedFilterHint();
  updateCommitteeFilterSummary();
  document.querySelector('.tab[data-view="review"]')?.click();
  scrollToElement($('#view-review'));
}

function captureLoadedCampaignClicks() {
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('[data-load-campaign], [data-practice-load-context]');
    if (!button) return;
    const context = normalizeCommitteeContext({
      committee_id: button.dataset.committeeId,
      committee_name: button.dataset.committeeName,
      candidate_name: button.dataset.candidateName,
      source_id: button.dataset.sourceId,
      practice: button.dataset.practiceLoadContext === 'true'
    });
    if (context) loadedCommittee = context;
    if (button.dataset.practiceLoadContext === 'true') {
      event.preventDefault();
      event.stopPropagation();
      setPracticeLoadedContext(context);
      return;
    }
    queueMicrotask(() => {
      renderLoadedFilterHint();
      updateCommitteeFilterSummary();
    });
  }, true);
}

function committeeFilterDialog() {
  let dialog = $('#committeeFilterGuardDialog');
  if (dialog) return dialog;
  dialog = document.createElement('div');
  dialog.id = 'committeeFilterGuardDialog';
  dialog.className = 'committee-filter-guard-dialog';
  dialog.hidden = true;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'committeeFilterGuardTitle');
  dialog.innerHTML = `
    <strong id="committeeFilterGuardTitle">Load a committee first</strong>
    <p>This filter keeps only contribution records for the committee loaded from Candidate &amp; committee lookup. Load a committee there, or uncheck the filter to run an ordinary contributor search.</p>
    <div>
      <button type="button" class="button primary" data-committee-filter-guard="lookup">Choose committee ↓</button>
      <button type="button" class="button" data-committee-filter-guard="uncheck">Uncheck filter</button>
      <button type="button" class="text-button" data-committee-filter-guard="cancel">Cancel</button>
    </div>`;
  document.body.append(dialog);
  return dialog;
}

function closeCommitteeFilterDialog() {
  committeeFilterDialog().hidden = true;
}

function jumpToCommitteeLookup() {
  closeCommitteeFilterDialog();
  const panel = $('#campaignDirectoryPanel');
  scrollToElement(panel);
  setTimeout(() => $('#campaignDirectoryQuery')?.focus(), reducedMotion() ? 0 : 320);
}

function installCommitteeFilterGuardActions() {
  committeeFilterDialog();
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('[data-committee-filter-guard]');
    if (!button) return;
    const action = button.dataset.committeeFilterGuard;
    if (action === 'lookup') jumpToCommitteeLookup();
    if (action === 'uncheck') {
      const toggle = $('#committeeContextFilterToggle');
      if (toggle) toggle.checked = false;
      closeCommitteeFilterDialog();
      updateCommitteeFilterSummary();
      $('#runSearchButton')?.focus();
    }
    if (action === 'cancel') closeCommitteeFilterDialog();
  });
}

function updateCommitteeFilterSummary() {
  const summary = $('#committeeContextFilterSummary');
  const toggle = $('#committeeContextFilterToggle');
  if (!summary || !toggle) return;
  summary.dataset.ready = loadedCommittee ? 'true' : 'false';
  setText(summary, loadedCommittee
    ? `Loaded: ${loadedContextTitle()}${toggle.checked ? ' · filter armed' : ''}`
    : 'No committee loaded yet.');
}

function guardMissingLoadedCommittee(event) {
  const toggle = $('#committeeContextFilterToggle');
  if (!toggle?.checked || loadedCommittee?.committee_name) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  const dialog = committeeFilterDialog();
  dialog.hidden = false;
  dialog.querySelector('[data-committee-filter-guard="lookup"]')?.focus();
  return true;
}

function installCommitteeFilterControl() {
  const amount = $('#amountMin')?.closest('.split-fields');
  if (!amount || $('#committeeContextFilterControl')) return;
  const control = document.createElement('section');
  control.id = 'committeeContextFilterControl';
  control.className = 'committee-context-filter';
  control.innerHTML = `
    <label>
      <input id="committeeContextFilterToggle" type="checkbox">
      <span><strong>Filter by loaded committee</strong><small>Keep only contribution records for the committee loaded in Candidate &amp; committee lookup.</small></span>
    </label>
    <button type="button" class="committee-filter-jump" id="committeeFilterJump">Choose committee below ↓</button>
    <small class="committee-filter-summary" id="committeeContextFilterSummary">No committee loaded yet.</small>`;
  amount.insertAdjacentElement('beforebegin', control);
  $('#committeeFilterJump')?.addEventListener('click', jumpToCommitteeLookup);
  $('#committeeContextFilterToggle')?.addEventListener('change', updateCommitteeFilterSummary);
  updateCommitteeFilterSummary();

  document.addEventListener('click', (event) => {
    if (!event.target?.closest?.('#runSearchButton')) return;
    guardMissingLoadedCommittee(event);
  }, true);

  document.addEventListener('submit', (event) => {
    if (event.target?.id !== 'searchForm') return;
    guardMissingLoadedCommittee(event);
  }, true);
}

function recordCommitteeName(record = {}) {
  return compact(record.committee_name || record.committee || record.recipient_name || record.filer || record.raw_source_row?.committee_name || record.raw_source_row?.committee || '');
}

function recordCommitteeIds(record = {}) {
  return [record.committee_id, record.fec_committee_id, record.raw_source_row?.committee_id]
    .map(compact)
    .filter(Boolean);
}

function recordMatchesLoadedCommittee(record, context) {
  if (!context) return true;
  if (context.committee_id && recordCommitteeIds(record).includes(context.committee_id)) return true;
  return key(recordCommitteeName(record)) === key(context.committee_name);
}

function installCommitteeFilterFetchProjection() {
  const marker = Symbol.for('td613.giving.loaded-committee-filter/v1');
  if (globalThis.fetch?.[marker]) return;
  const prior = globalThis.fetch?.bind(globalThis);
  if (!prior) return;
  const wrapped = async (input, init = {}) => {
    let envelope = null;
    try { if (typeof init.body === 'string') envelope = JSON.parse(init.body); } catch {}
    const toggle = $('#committeeContextFilterToggle');
    const context = toggle?.checked && loadedCommittee ? { ...loadedCommittee } : null;
    const response = await prior(input, init);
    if (!context || envelope?.operation !== 'search.page' || !response.ok) return response;
    const body = await response.clone().json().catch(() => null);
    const page = body?.data?.page;
    if (!page || !Array.isArray(page.records)) return response;
    const observed = page.records.length;
    const records = page.records.filter((record) => recordMatchesLoadedCommittee(record, context));
    const headers = new Headers(response.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.set('cache-control', 'no-store');
    return new Response(JSON.stringify({
      ...body,
      data: {
        ...body.data,
        page: {
          ...page,
          records,
          client_committee_filter: {
            enabled: true,
            committee_id: context.committee_id,
            committee_name: context.committee_name,
            observed_records: observed,
            retained_records: records.length,
            source_receipt_rewritten: false
          }
        }
      }
    }), { status: response.status, statusText: response.statusText, headers });
  };
  Object.defineProperty(wrapped, marker, { value: true });
  globalThis.fetch = wrapped;
}

function annotateCommitteeFilteredRun() {
  const toggle = $('#committeeContextFilterToggle');
  if (!toggle?.checked || !loadedCommittee) return;
  for (const card of $$('.source-run-card')) {
    const meta = card.querySelector('.source-run-meta');
    if (!meta || meta.querySelector('.committee-filter-applied-note')) continue;
    const note = document.createElement('span');
    note.className = 'committee-filter-applied-note';
    note.textContent = `Contributor retrieval filtered to loaded committee: ${loadedCommittee.committee_name}. Custodian receipts remain unrewritten.`;
    meta.append(note);
  }
}

document.addEventListener('td613:giving-run-settled', () => queueMicrotask(annotateCommitteeFilteredRun));

function decorateCommitteeWorkspace() {
  const ledger = $('#view-ledger');
  if (!ledger) return;
  const tab = $('.tab[data-view="ledger"]');
  if (tab && tab.dataset.workspaceNamed !== 'true') {
    const count = tab.querySelector('#ledgerCount');
    tab.replaceChildren(document.createTextNode('Committee workspace '), ...(count ? [count] : []));
    tab.dataset.workspaceNamed = 'true';
  }
  setText(ledger.querySelector('.section-head .eyebrow'), 'COMMITTEE SEARCH + ATTRIBUTED DONOR TOTALS');
  setText(ledger.querySelector('.section-head h2'), 'Committee workspace');

  const workspaceHead = $('#committeeSearchWorkspace .committee-search-workspace-head');
  if (workspaceHead) {
    setText(workspaceHead.querySelector('strong'), 'Committee search results');
    if (!workspaceHead.querySelector('.committee-search-lane-copy')) {
      const copy = document.createElement('p');
      copy.className = 'committee-search-lane-copy';
      copy.textContent = 'Candidate & committee lookup lands here immediately. Record attribution is not required to inspect a committee search result.';
      workspaceHead.append(copy);
    }
  }

  const totals = ledger.querySelector('.total-banner');
  if (totals && !$('#confirmedGivingLaneHeading')) {
    const lane = document.createElement('section');
    lane.id = 'confirmedGivingLaneHeading';
    lane.className = 'confirmed-giving-lane-heading';
    lane.innerHTML = '<span>Attributed giving totals</span><strong>A separate derived lane</strong><small>Only contribution records you mark Record attributed in Contributions are allowed into these totals. Committee search results above remain usable whether or not this lane has records.</small>';
    totals.insertAdjacentElement('beforebegin', lane);
  }
}

function normalizeLedgerEmptyState() {
  const empty = $('#committeeLedger .empty-state');
  if (!empty) return;
  setText(empty.querySelector('strong'), 'No attributed donor totals yet.');
  setText(empty.querySelector('span'), 'Committee search results above are independent and ready to inspect. Attribute a contribution record only when you want reviewed donor records included in this totals lane.');
}

let ledgerClarityQueued = false;
function queueLedgerClarity() {
  if (ledgerClarityQueued) return;
  ledgerClarityQueued = true;
  queueMicrotask(() => {
    ledgerClarityQueued = false;
    normalizeLedgerEmptyState();
  });
}

function installLedgerClarityObserver() {
  const ledger = $('#committeeLedger');
  if (!ledger) return;
  new MutationObserver(queueLedgerClarity).observe(ledger, { childList: true, subtree: true });
  normalizeLedgerEmptyState();
}

function practiceLane() {
  return $('[name="campaign-directory-activity"]:checked')?.value || $('#campaignDirectoryActivity')?.value || 'CONTRIBUTIONS';
}

function visiblePracticeCommitteeIds() {
  const nodes = $$('#campaignDirectoryCommittees .practice-directory-card[data-practice-object]');
  return [...new Set(nodes.map((node) => node.dataset.practiceObject).filter(Boolean))];
}

function decoratePracticeCommitteeCards() {
  if (!practiceActive()) return;
  for (const card of $$('.practice-directory-card[data-practice-object]')) {
    if (card.querySelector('[data-practice-load-context]')) continue;
    const committee = practiceCommitteeById(card.dataset.practiceObject);
    if (!committee) continue;
    const actions = document.createElement('div');
    actions.className = 'practice-committee-context-actions';
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'practice-load-context-button';
    load.dataset.practiceLoadContext = 'true';
    load.dataset.committeeId = committee.id;
    load.dataset.committeeName = committee.name;
    load.dataset.candidateName = committee.candidate || '';
    load.dataset.sourceId = 'practice-bikini-bottom-votes';
    load.textContent = 'Load committee → Contributions';
    actions.append(load);
    card.append(actions);
  }
}

function renderPracticeExpenditureLane() {
  if (!practiceActive()) return;
  const section = $('#campaignActivitySection');
  const results = $('#campaignActivityResults');
  const heading = $('#campaignActivityHeading');
  if (!section || !results || !heading) return;
  if (practiceLane() !== 'EXPENDITURES') {
    section.hidden = true;
    return;
  }
  const ids = visiblePracticeCommitteeIds();
  const records = ids.flatMap((id) => expendituresForCommittee(id));
  setText(heading, 'Expenditure receipts · BikiniBottomVotes');
  section.hidden = false;
  if (!records.length) {
    results.innerHTML = '<span class="muted">No fictional expenditure receipts matched this committee search.</span>';
    return;
  }
  const committees = new Map(PRACTICE_COMMITTEES.map((committee) => [committee.id, committee]));
  results.innerHTML = `
    <div class="practice-expenditure-pedagogy">
      <span>FICTIONAL SAMPLE</span>
      <strong>Read the lane before the name.</strong>
      <p>Contributions ask who gave to a committee. Expenditures ask whom the committee paid. Some names intentionally appear in both lanes so you can practice noticing role before inferring identity or meaning.</p>
    </div>
    <div class="practice-expenditure-list">
      ${records.map((record) => `<article class="practice-expenditure-card" data-cross-lane="${record.cross_lane_overlap_candidate ? 'true' : 'false'}">
        <div><strong>${record.payee_name}</strong><small>${committees.get(record.committee_id)?.name || record.committee_name}</small></div>
        <div><b>${money(record.amount_cents)}</b><small>${record.expenditure_date}</small></div>
        <p>${record.purpose}</p>
      </article>`).join('')}
    </div>`;
}

let practiceEnhancementQueued = false;
function queuePracticeEnhancements() {
  if (practiceEnhancementQueued) return;
  practiceEnhancementQueued = true;
  queueMicrotask(() => {
    practiceEnhancementQueued = false;
    if (!practiceActive()) return;
    decoratePracticeCommitteeCards();
    renderPracticeExpenditureLane();
  });
}

function refreshPracticeDirectoryEnhancements() {
  if (!practiceActive()) return;
  decoratePracticeCommitteeCards();
  renderPracticeExpenditureLane();
}

function installPracticeDirectoryEnhancements() {
  const form = $('#campaignDirectoryForm');
  if (form) {
    document.addEventListener('submit', (event) => {
      if (event.target !== form || !practiceActive()) return;
      requestAnimationFrame(() => requestAnimationFrame(refreshPracticeDirectoryEnhancements));
    }, true);
  }
  document.addEventListener('change', (event) => {
    if (!practiceActive() || event.target?.name !== 'campaign-directory-activity') return;
    requestAnimationFrame(renderPracticeExpenditureLane);
  });
  const roots = [$('#campaignDirectoryCommittees'), $('#committeeSearchWorkspaceList')].filter(Boolean);
  for (const root of roots) new MutationObserver(queuePracticeEnhancements).observe(root, { childList: true, subtree: true });
}

function queueCountValue() {
  const match = compact($('#contactQueueCount')?.textContent).match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

function ensureDemoQueueCue() {
  const add = $('#addContactQueueButton');
  if (!add) return;
  let cue = $('#demoAddContactCue');
  if (!cue && practiceActive() && queueCueArmed) {
    cue = document.createElement('span');
    cue.id = 'demoAddContactCue';
    cue.className = 'demo-add-contact-cue';
    cue.textContent = '→';
    cue.setAttribute('aria-hidden', 'true');
    add.insertAdjacentElement('beforebegin', cue);
  }
  if (!cue) return;
  const loaded = queueCountValue() > 0;
  cue.hidden = !practiceActive() || !queueCueArmed || loaded;
  if (loaded) queueCueArmed = false;
}

function installDemoQueueCue() {
  const count = $('#contactQueueCount');
  document.addEventListener('td613:giving-practice-source-registry', (event) => {
    if (event.detail?.action === 'register') {
      setTimeout(() => {
        const input = $('#contactQueueInput');
        if (input) {
          input.value = ['Patrick Star', 'Sandy Cheeks', 'Gary Snail', 'Eugene H. Krabs', 'Squidward Q. Tentacles'].join('\n');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        queueCueArmed = true;
        ensureDemoQueueCue();
      }, 0);
    }
    if (event.detail?.action === 'remove') {
      loadedCommittee = null;
      const toggle = $('#committeeContextFilterToggle');
      if (toggle) toggle.checked = false;
      queueCueArmed = false;
      $('#demoAddContactCue')?.remove();
      updateCommitteeFilterSummary();
    }
  });
  if (count) new MutationObserver(() => queueMicrotask(ensureDemoQueueCue)).observe(count, { childList: true, subtree: true, characterData: true });
  ensureDemoQueueCue();
}

function targetOptionCount(targetId) {
  const option = [...($('#reviewTargetFilter')?.options || [])].find((item) => item.value === targetId);
  if (!option) return null;
  const match = String(option.textContent || '').match(/·\s*([\d,]+)\s+records?\b/i);
  return match ? Number(match[1].replaceAll(',', '')) : null;
}

function annotateZeroResultRows() {
  const list = $('#contactQueueList');
  if (!list) return;
  for (const row of list.querySelectorAll('.contact-queue-item')) {
    const targetId = row.dataset.targetId;
    const zero = zeroResultTargets.has(targetId);
    if (row.dataset.zeroRecords !== String(zero)) row.dataset.zeroRecords = String(zero);
    const state = row.querySelector('.contact-queue-state');
    const note = row.querySelector('.contact-queue-zero-result');
    if (!zero) {
      note?.remove();
      if (state?.textContent === 'NO RECORDS') {
        setText(state, row.dataset.status || 'SEARCHED');
        state.hidden = row.dataset.status === 'QUEUED';
      }
      continue;
    }
    if (state) {
      state.hidden = false;
      setText(state, 'NO RECORDS');
    }
    if (!note) {
      const next = document.createElement('p');
      next.className = 'contact-queue-zero-result';
      next.textContent = 'No contribution records returned for this contact in the selected sources and date window. That is an observed zero-result search—not proof that the person or entity never donated elsewhere.';
      row.append(next);
    }
  }
  const running = list.querySelector('.contact-queue-item[data-status="RUNNING"]');
  const message = $('#contactQueueMessage');
  if (!running && message && zeroResultTargets.size && !/no-record result/i.test(message.textContent || '')) {
    message.textContent = `${message.textContent || 'Queue finished.'} · ${zeroResultTargets.size} no-record result${zeroResultTargets.size === 1 ? '' : 's'}.`;
  }
}

let zeroAnnotationQueued = false;
function queueZeroAnnotation() {
  if (zeroAnnotationQueued) return;
  zeroAnnotationQueued = true;
  queueMicrotask(() => {
    zeroAnnotationQueued = false;
    annotateZeroResultRows();
  });
}

function installZeroResultPedagogy() {
  const list = $('#contactQueueList');
  if (!list) return;
  document.addEventListener('td613:giving-run-settled', (event) => {
    const running = list.querySelector('.contact-queue-item[data-status="RUNNING"]');
    const targetId = running?.dataset.targetId;
    if (!targetId) return;
    const heldSources = Array.isArray(event.detail?.held_sources) ? event.detail.held_sources : [];
    const held = event.detail?.status === 'HELD' || heldSources.length > 0;
    setTimeout(() => {
      const observedCount = targetOptionCount(targetId);
      if (!held && observedCount === 0) zeroResultTargets.add(targetId);
      else zeroResultTargets.delete(targetId);
      annotateZeroResultRows();
    }, 0);
  });
  new MutationObserver(queueZeroAnnotation).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status'] });
  $('#clearContactQueueButton')?.addEventListener('click', () => {
    setTimeout(() => {
      if (!list.querySelector('.contact-queue-item')) zeroResultTargets.clear();
      annotateZeroResultRows();
    }, 0);
  });
  document.addEventListener('td613:giving-clear-all', () => {
    zeroResultTargets.clear();
    queueZeroAnnotation();
  });
}

function clusterCards() {
  return $$('#recordList .record-card').filter((card) => card.querySelector('.record-reasons'));
}

function renderClusterInspection() {
  const notice = $('#clusterNotice');
  if (!notice) return;
  const cards = clusterCards();
  for (const card of $$('#recordList .record-card')) card.classList.toggle('cluster-suggested-card', cards.includes(card));
  let button = notice.querySelector('#inspectClustersButton');
  if (!cards.length) {
    clusterInspectionActive = false;
    document.documentElement.dataset.clusterInspection = 'false';
    button?.remove();
    return;
  }
  document.documentElement.dataset.clusterInspection = clusterInspectionActive ? 'true' : 'false';
  if (!button) {
    button = document.createElement('button');
    button.id = 'inspectClustersButton';
    button.type = 'button';
    button.className = 'cluster-inspect-button';
    button.addEventListener('click', () => {
      clusterInspectionActive = !clusterInspectionActive;
      renderClusterInspection();
      if (clusterInspectionActive) scrollToElement(clusterCards()[0]);
    });
    notice.append(document.createTextNode(' '), button);
  }
  setText(button, clusterInspectionActive ? 'Show all records' : 'Inspect suggested records →');
}

let clusterQueued = false;
function queueClusterInspection() {
  if (clusterQueued) return;
  clusterQueued = true;
  queueMicrotask(() => {
    clusterQueued = false;
    renderClusterInspection();
  });
}

function installClusterInspection() {
  const notice = $('#clusterNotice');
  const list = $('#recordList');
  if (!notice || !list) return;
  new MutationObserver(queueClusterInspection).observe(notice, { childList: true, subtree: true, characterData: true });
  new MutationObserver(queueClusterInspection).observe(list, { childList: true, subtree: true });
  renderClusterInspection();
}

function installLoadedContextObserver() {
  const banner = $('#loadedCampaignContext');
  if (!banner) return;
  new MutationObserver(() => queueMicrotask(renderLoadedFilterHint)).observe(banner, { childList: true, subtree: true });
  renderLoadedFilterHint();
}

function install() {
  decorateCommitteeWorkspace();
  installLedgerClarityObserver();
  captureLoadedCampaignClicks();
  installCommitteeFilterGuardActions();
  installCommitteeFilterControl();
  installCommitteeFilterFetchProjection();
  installLoadedContextObserver();
  installPracticeDirectoryEnhancements();
  installDemoQueueCue();
  installZeroResultPedagogy();
  installClusterInspection();
  document.documentElement.dataset.givingTwelveStepBundle = '20260818-2';
  globalThis.__TD613_GIVING_EXPENDITURE_AUDIT__ = expenditureCoverageAudit();
}

install();

export const _givingTwelveStepBundle = Object.freeze({
  expenditureCoverageAudit,
  recordMatchesLoadedCommittee,
  targetOptionCount,
  loadedCommittee: () => loadedCommittee,
  refreshPracticeDirectoryEnhancements
});
