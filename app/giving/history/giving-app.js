import {
  CUSTODY_MODE,
  IDENTITY_STATUS,
  addSearchPage,
  committeeLedger,
  compactText,
  createDossier,
  dossierCsv,
  exactNameMatch,
  formatCurrency,
  recordDigest,
  safeFilename,
  setIdentityDecision
} from './giving-model.js';
import { GivingApiClient, GivingApiError } from './giving-api.js';
import { openGivingStore } from './giving-store.js';
import { decryptDossier, encryptDossier, fromHostedVaultRow, toHostedVaultPayload } from './giving-vault.js';
import { createGivingField } from './giving-field.js';

const MAX_SOURCE_CONCURRENCY = 3;
const MAX_REVIEW_RENDER = 300;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const api = new GivingApiClient();
const givingField = createGivingField($('#givingFieldCanvas'));

const state = {
  store: null,
  registry: null,
  dossier: createDossier(),
  dirty: true,
  run: { active: false, cancelRequested: false, queue: [], controllers: new Map(), workers: [] },
  peopleContinuation: null,
  selectedPersonId: null,
  vaultVersions: [],
  saveTimer: null,
  holdReview: false,
  reviewSort: { key: null, direction: 'asc' }
};

function updateField(view) {
  const sources = (state.dossier.source_ids || []).map((id) => ({
    id,
    status: state.dossier.source_states?.[id]?.status || 'IDLE'
  }));
  const confirmed = Object.values(state.dossier.decisions || {})
    .filter((status) => status === IDENTITY_STATUS.CONFIRMED).length;
  givingField.update({
    ...(view ? { view } : {}),
    sources,
    confirmed,
    custody: state.dossier.custody || CUSTODY_MODE.LOCAL
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function humanError(error) {
  if (error instanceof GivingApiError) return error.message;
  return compactText(error?.message || error) || 'The operation did not complete.';
}

function toast(message, kind = 'info') {
  const item = document.createElement('div');
  item.className = `toast ${kind === 'error' ? 'error' : ''}`;
  item.textContent = message;
  $('#toastStack').append(item);
  setTimeout(() => item.remove(), 5200);
}

function dataOf(result, key) {
  if (key && result?.data?.[key] !== undefined) return result.data[key];
  return result?.data ?? result ?? null;
}

function receiptOf(result) {
  return result?.receipt || result?.data?.receipt || null;
}

function addReceipt(receipt, kind = 'operation') {
  if (!receipt) return;
  const value = typeof receipt === 'string'
    ? { schema: 'td613.giving.client-receipt/v1', at: new Date().toISOString(), event: receipt }
    : receipt;
  state.dossier.operator_receipts = [...state.dossier.operator_receipts, { ...value, client_kind: kind }];
  renderReceipts();
}

function download(filename, body, type) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sessionOpen() {
  document.documentElement.dataset.session = 'open';
  $('#sessionMembrane').hidden = true;
  $('#operatorShell').hidden = false;
  givingField.update({ sessionOpen: true });
}

function sessionClosed(message = 'Enter the operator secret to continue.') {
  document.documentElement.dataset.session = 'closed';
  $('#sessionMembrane').hidden = false;
  $('#operatorShell').hidden = true;
  $('#sessionMessage').textContent = message;
  givingField.update({ sessionOpen: false });
  $('#accessSecret').focus();
}

function queryFromForm() {
  return {
    name: compactText($('#searchName').value),
    aliases: $('#searchAliases').value.split(/\r?\n|;/).map(compactText).filter(Boolean),
    hints: compactText($('#searchHints').value),
    date_from: $('#dateFrom').value,
    date_to: $('#dateTo').value,
    exact_match: Boolean($('#exactMatchToggle')?.checked)
  };
}

function renderHoldState() {
  const button = $('#holdReviewButton');
  if (!button) return;
  button.dataset.held = state.holdReview ? 'true' : 'false';
  button.setAttribute('aria-pressed', String(state.holdReview));
  button.title = state.holdReview
    ? 'Held: later searches append to this Identity Review. Activate to release.'
    : 'Keep this Identity Review in place and append results from later searches.';
}

function resetReviewControls() {
  state.reviewSort = { key: null, direction: 'asc' };
  if ($('#reviewFilter')) $('#reviewFilter').value = 'ALL';
  if ($('#reviewSearch')) $('#reviewSearch').value = '';
}

function hydrateForm() {
  const dossier = state.dossier;
  $('#dossierTitle').value = dossier.title || '';
  $('#custodyMode').value = dossier.custody || CUSTODY_MODE.LOCAL;
  $('#searchName').value = dossier.query?.name || '';
  $('#searchAliases').value = (dossier.query?.aliases || []).join('\n');
  $('#searchHints').value = dossier.query?.hints || '';
  $('#dateFrom').value = dossier.query?.date_from || '2000-01-01';
  $('#dateTo').value = dossier.query?.date_to || new Date().toISOString().slice(0, 10);
  if ($('#exactMatchToggle')) $('#exactMatchToggle').checked = Boolean(dossier.query?.exact_match);
  for (const input of $$('#sourceRegistry input[type="checkbox"]')) input.checked = dossier.source_ids?.includes(input.value) || false;
  updateSelectedSourceCount();
  renderHoldState();
}

function updateDossierFromForm() {
  state.dossier = {
    ...state.dossier,
    title: compactText($('#dossierTitle').value) || state.dossier.title,
    custody: $('#custodyMode').value,
    query: queryFromForm(),
    source_ids: selectedSourceIds(),
    updated_at: new Date().toISOString()
  };
}

function markDirty({ localAutosave = true } = {}) {
  state.dirty = true;
  $('#saveState').textContent = 'unsaved';
  if (localAutosave && [CUSTODY_MODE.LOCAL, CUSTODY_MODE.HYBRID].includes(state.dossier.custody) && state.store) {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(async () => {
      try {
        updateDossierFromForm();
        await state.store.writeDossier(state.dossier);
        $('#saveState').textContent = state.dossier.custody === CUSTODY_MODE.HYBRID ? 'local branch saved' : 'saved local';
        state.dirty = false;
        await renderLocalDossiers();
      } catch (error) {
        $('#saveState').textContent = 'save failed';
      }
    }, 500);
  }
}

async function renderLocalDossiers() {
  if (!state.store) return;
  const dossiers = await state.store.listDossiers();
  const select = $('#localDossierSelect');
  const current = select.value;
  select.innerHTML = '<option value="">No local dossier selected</option>' + dossiers.map((dossier) =>
    `<option value="${escapeHtml(dossier.id)}">${escapeHtml(dossier.title)} · ${escapeHtml(dossier.updated_at?.slice(0, 10))}</option>`
  ).join('');
  if (dossiers.some((dossier) => dossier.id === current)) select.value = current;
}

function newDossier() {
  const selected = selectedSourceIds();
  state.dossier = createDossier({ sourceIds: selected, query: { date_from: '2000-01-01', date_to: new Date().toISOString().slice(0, 10) } });
  state.dirty = true;
  state.selectedPersonId = null;
  state.peopleContinuation = null;
  state.holdReview = false;
  resetReviewControls();
  hydrateForm();
  renderAll();
  toast('New local-first dossier opened.');
}

async function openLocalDossier() {
  const id = $('#localDossierSelect').value;
  if (!id || !state.store) return toast('Select a local dossier first.', 'error');
  const dossier = await state.store.readDossier(id);
  if (!dossier) return toast('That dossier is no longer present.', 'error');
  state.dossier = dossier;
  state.dirty = false;
  state.holdReview = false;
  resetReviewControls();
  hydrateForm();
  renderAll();
  $('#saveState').textContent = 'saved local';
  toast('Dossier opened from local custody.');
}

async function saveDossier({ forceVault = false } = {}) {
  updateDossierFromForm();
  const mode = state.dossier.custody;
  try {
    if (mode === CUSTODY_MODE.LOCAL && !forceVault) {
      if (!state.store) throw new Error('IndexedDB is unavailable. Use an encrypted export.');
      await state.store.writeDossier(state.dossier);
      $('#saveState').textContent = 'saved local';
      state.dirty = false;
      await renderLocalDossiers();
      toast('Dossier saved to local custody.');
      return;
    }
    if (mode === CUSTODY_MODE.HYBRID && state.store) await state.store.writeDossier(state.dossier);
    await syncVault();
    if (mode === CUSTODY_MODE.HOSTED && state.store) await state.store.deleteDossier(state.dossier.id);
    await renderLocalDossiers();
  } catch (error) {
    $('#saveState').textContent = 'save failed';
    toast(humanError(error), 'error');
  }
}

function selectedSourceIds() {
  return $$('#sourceRegistry input[type="checkbox"]:checked').map((input) => input.value);
}

function updateSelectedSourceCount() {
  const count = selectedSourceIds().length;
  $('#selectedSourceCount').textContent = `${count} source${count === 1 ? '' : 's'}`;
}

function sourceById(id) {
  return state.registry?.instances?.find((source) => source.id === id) || { id, custodian: id, family: 'UNKNOWN', state: 'UNAVAILABLE' };
}

function renderRegistry() {
  const instances = state.registry?.instances || [];
  if (!instances.length) {
    $('#sourceRegistry').innerHTML = '<div class="empty-state"><strong>Registry unavailable.</strong><span>Refresh readiness before searching.</span></div>';
    return;
  }
  const selected = new Set(state.dossier.source_ids || []);
  const families = new Map();
  for (const source of instances) {
    const list = families.get(source.family) || [];
    list.push(source);
    families.set(source.family, list);
  }
  $('#sourceRegistry').innerHTML = [...families.entries()].map(([family, sources]) => `
    <div class="source-family-label">${escapeHtml(family)} · ${sources.length}</div>
    ${sources.map((source) => {
      const available = source.state !== 'UNAVAILABLE';
      return `<label class="source-option ${available ? '' : 'unavailable'}">
        <input type="checkbox" value="${escapeHtml(source.id)}" ${selected.has(source.id) ? 'checked' : ''} ${available ? '' : 'disabled'}>
        <span><strong>${escapeHtml(source.custodian)}</strong><small>${escapeHtml(source.jurisdiction)} · ${escapeHtml(source.electronic_scope)}</small></span>
        <em>${escapeHtml(source.state)}</em>
      </label>`;
    }).join('')}
  `).join('');
  $$('#sourceRegistry input').forEach((input) => input.addEventListener('change', () => {
    updateSelectedSourceCount();
    markDirty();
  }));
  updateSelectedSourceCount();
}

async function loadRegistry() {
  const result = await api.call('registry.read', {}, { mutation: false });
  const data = dataOf(result, 'registry');
  state.registry = data?.instances ? data : data?.registry || data;
  addReceipt(receiptOf(result), 'registry');
  renderRegistry();
  hydrateForm();
}

function sourceState(sourceId, patch = {}) {
  const previous = state.dossier.source_states[sourceId] || {};
  state.dossier.source_states = {
    ...state.dossier.source_states,
    [sourceId]: { ...previous, ...patch, updated_at: new Date().toISOString() }
  };
  renderSourceProgress();
}

function recordName(record) {
  return compactText(record.contributor_name_raw || record.contributor_name || record.raw_contributor_name || record.contributor_name_parsed?.display || 'Name unavailable');
}

function recordCommittee(record) {
  return compactText(record.committee || record.committee_name || record.candidate || record.candidate_name || 'Committee not stated');
}

async function runSourceTask(task) {
  const { sourceId, continuation = null, pendingContinuations = [] } = task;
  const controller = new AbortController();
  state.run.controllers.set(sourceId, controller);
  sourceState(sourceId, { status: 'RUNNING', continuation_requested: continuation, error: null });
  try {
    const variants = continuation
      ? [{ name: continuation.query_name || state.dossier.query.name, token: continuation.token || continuation }]
      : [state.dossier.query.name, ...(state.dossier.query.aliases || [])].map((name) => ({ name, token: null }));
    const continuations = [...pendingContinuations];
    let returned = 0;
    let lastCoverage = null;
    let lastReceipt = null;
    const variantReceipts = [];
    for (const variant of variants) {
      const result = await api.call('search.page', {
        source_instance_id: sourceId,
        query: {
          name: variant.name,
          start_date: state.dossier.query.date_from,
          end_date: state.dossier.query.date_to,
          page_size: 200
        },
        continuation: variant.token
      }, { mutation: false, signal: controller.signal, timeoutMs: 18000, purpose: `retrieve ${sourceId}` });
      const data = dataOf(result, 'page');
      const rawPage = data?.records ? data : data?.page || data || { records: [] };
      const rawRecords = Array.isArray(rawPage.records) ? rawPage.records : [];
      const records = state.dossier.query?.exact_match
        ? rawRecords.filter((record) => exactNameMatch(recordName(record), variant.name))
        : rawRecords;
      const page = records === rawRecords ? rawPage : {
        ...rawPage,
        records,
        client_exact_match: {
          enabled: true,
          observed_records: rawRecords.length,
          retained_records: records.length,
          query_name: variant.name
        }
      };
      const receipt = page.receipt || receiptOf(result) || { source_instance_id: sourceId, state: 'READY' };
      const previousCount = state.dossier.source_states[sourceId]?.count || 0;
      state.dossier = addSearchPage(state.dossier, sourceId, page, receipt);
      returned += page.records?.length || 0;
      lastCoverage = page.coverage || data?.coverage || receipt.coverage || lastCoverage;
      lastReceipt = receipt;
      variantReceipts.push({
        query_name: variant.name,
        state: compactText(receipt?.state || page.source_status || 'READY').toUpperCase(),
        receipt,
        ...(page.client_exact_match ? { exact_match: page.client_exact_match } : {})
      });
      const next = page.continuation || data?.continuation || null;
      if (next) continuations.push({ query_name: variant.name, token: next });
      state.dossier.source_states[sourceId].count = previousCount + (page.records?.length || 0);
    }
    const nextContinuation = continuations[0] || null;
    const badVariants = variantReceipts.filter((item) => item.state !== 'READY');
    const goodVariants = variantReceipts.filter((item) => item.state === 'READY');
    const settledStatus = badVariants.length
      ? (goodVariants.length ? 'PARTIAL' : badVariants[0].state)
      : 'COMPLETE';
    state.dossier.source_states[sourceId] = {
      ...state.dossier.source_states[sourceId],
      status: continuations.length ? 'PARTIAL' : settledStatus,
      continuation: nextContinuation,
      pending_continuations: continuations.slice(1),
      returned_this_run: returned,
      variant_receipts: variantReceipts,
      coverage: lastCoverage,
      receipt: lastReceipt
    };
    markDirty();
  } catch (error) {
    const cancelled = error?.code === 'REQUEST_CANCELLED';
    sourceState(sourceId, {
      status: cancelled ? 'CANCELLED' : 'FAILED',
      error: humanError(error),
      retryable: cancelled ? true : error?.retryable !== false,
      continuation
    });
    if (error?.receipt) addReceipt(error.receipt, 'error');
  } finally {
    state.run.controllers.delete(sourceId);
    renderAll();
  }
}

async function runQueue() {
  if (state.run.active) return;
  state.run.active = true;
  state.run.cancelRequested = false;
  $('#cancelSearchButton').disabled = false;
  $('#runSearchButton').disabled = true;
  const worker = async () => {
    while (!state.run.cancelRequested) {
      const task = state.run.queue.shift();
      if (!task) break;
      await runSourceTask(task);
    }
  };
  state.run.workers = Array.from({ length: Math.min(MAX_SOURCE_CONCURRENCY, state.run.queue.length) }, () => worker());
  await Promise.allSettled(state.run.workers);
  state.run.active = false;
  state.run.workers = [];
  $('#cancelSearchButton').disabled = true;
  $('#runSearchButton').disabled = false;
  renderAll();
}

function clearReviewForNewSearch() {
  state.dossier = {
    ...state.dossier,
    records: [],
    decisions: {},
    clusters: [],
    source_states: {}
  };
  resetReviewControls();
  renderReview();
  renderLedger();
  renderCampaign();
}

async function startSearch(event) {
  event.preventDefault();
  const ids = selectedSourceIds();
  if (!ids.length) return toast('Select at least one electronic source.', 'error');
  const query = queryFromForm();
  if (!query.name) return toast('Enter a contributor name.', 'error');
  if (!query.date_from || !query.date_to || query.date_from > query.date_to) return toast('Use a valid beginning and ending date.', 'error');
  updateDossierFromForm();
  if (!state.holdReview) clearReviewForNewSearch();
  state.dossier.version += 1;
  state.dossier.source_ids = ids;
  state.run.queue = ids.map((sourceId) => ({ sourceId, continuation: null }));
  for (const sourceId of ids) sourceState(sourceId, { status: 'QUEUED', count: 0, continuation: null, error: null });
  markDirty();
  switchView('search');
  await runQueue();
}

function cancelSearch() {
  state.run.cancelRequested = true;
  for (const controller of state.run.controllers.values()) controller.abort(new DOMException('Operator cancelled.', 'AbortError'));
  for (const task of state.run.queue) sourceState(task.sourceId, { status: 'CANCELLED', error: 'Cancelled before dispatch.', retryable: true });
  state.run.queue = [];
  toast('Cancellation sent. Completed source evidence remains in the dossier.');
}

async function enqueueSource(sourceId, continuation = null, pendingContinuations = []) {
  if (state.run.active) return toast('Let the current three-wide source queue settle first.', 'error');
  state.run.queue = [{ sourceId, continuation, pendingContinuations }];
  await runQueue();
}

function renderSourceProgress() {
  const ids = state.dossier.source_ids || [];
  if (!ids.length) {
    $('#sourceProgress').innerHTML = '<div class="empty-state"><strong>Waiting for a query.</strong><span>Choose searchable electronic custodians from the left rail.</span></div>';
    $('#runSummary').textContent = 'No search has run.';
    $('#coverageWarning').hidden = true;
    updateField();
    return;
  }
  const states = ids.map((id) => state.dossier.source_states[id] || { status: 'NOT_RUN', count: 0 });
  const completed = states.filter((item) => ['COMPLETE', 'PARTIAL'].includes(item.status)).length;
  const failed = states.filter((item) => ['FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(item.status)).length;
  const running = states.filter((item) => item.status === 'RUNNING').length;
  $('#runSummary').textContent = `${completed}/${ids.length} returned · ${running} active · ${failed} held`;
  $('#coverageWarning').hidden = failed === 0 && !states.some((item) => item.status === 'PARTIAL');
  $('#sourceProgress').innerHTML = ids.map((id) => {
    const source = sourceById(id);
    const item = state.dossier.source_states[id] || { status: 'NOT_RUN', count: 0 };
    const continuation = item.continuation;
    const canRetry = ['FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(item.status);
    return `<article class="source-run-card" data-status="${escapeHtml(item.status)}">
      <div class="source-run-head"><strong>${escapeHtml(source.custodian)}</strong><span class="source-run-status">${escapeHtml(item.status)}</span></div>
      <div class="source-run-meta">
        <span>${escapeHtml(source.family)} · ${escapeHtml(source.jurisdiction)}</span>
        <span>${Number(item.count || 0).toLocaleString()} records retained</span>
        ${item.coverage ? `<span>${escapeHtml(typeof item.coverage === 'string' ? item.coverage : JSON.stringify(item.coverage))}</span>` : ''}
        ${item.error ? `<span>${escapeHtml(item.error)}</span>` : ''}
      </div>
      ${item.status === 'RUNNING' ? '<div class="progress-line"><span></span></div>' : ''}
      <div class="source-run-actions">
        ${continuation ? `<button class="mini-button" type="button" data-source-continue="${escapeHtml(id)}">Continue next page</button>` : ''}
        ${canRetry ? `<button class="mini-button" type="button" data-source-retry="${escapeHtml(id)}">Retry source</button>` : ''}
      </div>
    </article>`;
  }).join('');
  $$('[data-source-continue]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.sourceContinue;
    const source = state.dossier.source_states[id] || {};
    const current = source.continuation;
    const pending = source.pending_continuations || [];
    source.continuation = pending[0] || null;
    source.pending_continuations = pending.slice(1);
    enqueueSource(id, current, pending);
  }));
  $$('[data-source-retry]').forEach((button) => button.addEventListener('click', () => enqueueSource(button.dataset.sourceRetry)));
  updateField();
}

function clusterFor(digest) {
  return state.dossier.clusters?.find((cluster) => cluster.members.includes(digest));
}

function reviewSortValue(record, key) {
  if (key === 'contributor') return recordName(record);
  if (key === 'committee') return recordCommittee(record);
  if (key === 'status') return state.dossier.decisions[recordDigest(record)] || IDENTITY_STATUS.UNREVIEWED;
  if (key === 'amount') return Number.isSafeInteger(record.amount_cents) ? record.amount_cents : null;
  return '';
}

function compareReviewRecords(left, right) {
  const { key, direction } = state.reviewSort;
  if (!key) return 0;
  const a = reviewSortValue(left, key);
  const b = reviewSortValue(right, key);
  let result = 0;
  if (key === 'amount') {
    if (a === null && b === null) result = 0;
    else if (a === null) return 1;
    else if (b === null) return -1;
    else result = a - b;
  } else {
    result = String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
  }
  return direction === 'desc' ? -result : result;
}

function renderReviewSortControls() {
  $$('[data-review-sort]').forEach((button) => {
    const active = button.dataset.reviewSort === state.reviewSort.key;
    const label = button.dataset.label || button.textContent.replace(/[↑↓]/g, '').trim();
    button.dataset.label = label;
    button.dataset.active = active ? 'true' : 'false';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = `${label}${active ? (state.reviewSort.direction === 'asc' ? ' ↑' : ' ↓') : ''}`;
  });
}

function setReviewSort(key) {
  if (state.reviewSort.key === key) {
    state.reviewSort.direction = state.reviewSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.reviewSort = { key, direction: 'asc' };
  }
  renderReview();
}

function renderReview() {
  const statusFilter = $('#reviewFilter')?.value || 'ALL';
  const phrase = compactText($('#reviewSearch')?.value).toUpperCase();
  const records = state.dossier.records.filter((record) => {
    const status = state.dossier.decisions[recordDigest(record)] || IDENTITY_STATUS.UNREVIEWED;
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (!phrase) return true;
    return [recordName(record), recordCommittee(record), record.city, record.state, record.employer, record.occupation]
      .some((value) => compactText(value).toUpperCase().includes(phrase));
  });
  if (state.reviewSort.key) records.sort(compareReviewRecords);
  renderReviewSortControls();
  renderHoldState();
  $('#reviewCount').textContent = String(state.dossier.records.length);
  const clusters = state.dossier.clusters || [];
  $('#clusterNotice').textContent = clusters.length
    ? `${clusters.length} candidate cluster${clusters.length === 1 ? '' : 's'} suggested. Similarity is an inspection aid, never an identity decision.`
    : 'No candidate clusters have been proposed.';
  if (!records.length) {
    $('#recordList').innerHTML = '<div class="empty-state"><strong>No matching records.</strong><span>Search results will arrive with their source lineage intact.</span></div>';
    return;
  }
  const visible = records.slice(0, MAX_REVIEW_RENDER);
  $('#recordList').innerHTML = visible.map((record) => {
    const digest = recordDigest(record);
    const status = state.dossier.decisions[digest] || IDENTITY_STATUS.UNREVIEWED;
    const cluster = clusterFor(digest);
    const comparison = cluster?.comparisons?.find((item) => item.left === digest || item.right === digest);
    const amount = Number.isSafeInteger(record.amount_cents) ? formatCurrency(record.amount_cents) : 'amount missing';
    return `<article class="record-card" data-record="${escapeHtml(digest)}">
      <div class="record-main">
        <div class="record-person"><strong>${escapeHtml(recordName(record))}</strong><small>${escapeHtml([record.address, record.city, record.state, record.zip].filter(Boolean).join(' · '))}</small></div>
        <div class="record-committee"><strong>${escapeHtml(recordCommittee(record))}</strong><small>${escapeHtml([record.office, record.election || record.cycle, record.contribution_date].filter(Boolean).join(' · '))}</small></div>
        <div class="record-amount"><strong>${escapeHtml(amount)}</strong><small>${escapeHtml(record.contribution_type || record.amendment_status || '')}</small></div>
        <div class="record-actions">
          ${Object.values(IDENTITY_STATUS).map((choice) => `<button class="decision-button" type="button" data-decision="${choice}" data-digest="${escapeHtml(digest)}" ${choice === status ? 'disabled' : ''}>${choice}</button>`).join('')}
        </div>
      </div>
      <div class="record-lineage">
        <span class="identity-state" data-state="${escapeHtml(status)}">${escapeHtml(status)}</span>
        · ${escapeHtml(record.source_family)} / ${escapeHtml(record.source_instance_id || record.source_instance)}
        · ${escapeHtml(record.evidence_status || 'OBSERVED')}
        · digest ${escapeHtml(digest.slice(0, 18))}…
        ${comparison ? `<span class="record-reasons"> · suggested: ${escapeHtml(comparison.reasons.join(', ') || 'weak shared fields')}${comparison.cautions.length ? `; caution: ${escapeHtml(comparison.cautions.join(', '))}` : ''}</span>` : ''}
      </div>
    </article>`;
  }).join('') + (records.length > visible.length ? `<div class="coverage-warning">Showing the first ${visible.length} of ${records.length} filtered records after sorting. Narrow the review filter to inspect the remainder.</div>` : '');
  $$('[data-decision]').forEach((button) => button.addEventListener('click', () => {
    try {
      state.dossier = setIdentityDecision(state.dossier, button.dataset.digest, button.dataset.decision);
      markDirty();
      renderReview();
      renderLedger();
      renderCampaign();
      renderReceipts();
    } catch (error) {
      toast(humanError(error), 'error');
    }
  }));
}

function renderLedger() {
  const groups = committeeLedger(state.dossier);
  const total = groups.reduce((sum, group) => sum + group.amount_cents, 0);
  const recordCount = groups.reduce((sum, group) => sum + group.records.length, 0);
  $('#ledgerCount').textContent = String(groups.length);
  $('#confirmedTotal').textContent = formatCurrency(total);
  $('#confirmedRecordCount').textContent = `${recordCount} confirmed record${recordCount === 1 ? '' : 's'}`;
  $('#committeeSelect').innerHTML = '<option value="">Select a confirmed committee</option>' + groups.map((group) =>
    `<option value="${escapeHtml(group.committee)}">${escapeHtml(group.committee)} · ${escapeHtml(formatCurrency(group.amount_cents))}</option>`
  ).join('');
  if (!groups.length) {
    $('#committeeLedger').innerHTML = '<div class="empty-state"><strong>No confirmed giving.</strong><span>Committee totals remain asleep until you confirm record identity.</span></div>';
    return;
  }
  $('#committeeLedger').innerHTML = groups.map((group) => `<article class="committee-card">
    <div class="committee-summary">
      <strong>${escapeHtml(group.committee)}</strong>
      <span class="money">${escapeHtml(formatCurrency(group.amount_cents))}</span>
      <small>${escapeHtml([group.jurisdiction, group.office, group.cycle].filter(Boolean).join(' · '))} · ${group.records.length} confirmed${group.provisional ? ' · ' : ''}${group.provisional ? '<span class="provisional">PROVISIONAL LINEAGE</span>' : ''}</small>
    </div>
    <div class="committee-records">${group.records.map((record) => `${escapeHtml(record.contribution_date || 'date missing')} · ${escapeHtml(formatCurrency(record.amount_cents || 0))} · ${escapeHtml(record.source_family)}`).join('<br>')}</div>
  </article>`).join('');
}

async function exportEncrypted() {
  const passphrase = $('#vaultPassphrase').value;
  if (passphrase.length < 12) {
    switchView('vault');
    $('#vaultPassphrase').focus();
    return toast('Enter the separate vault passphrase before encrypted export.', 'error');
  }
  try {
    updateDossierFromForm();
    const envelope = await encryptDossier(state.dossier, passphrase);
    download(`${safeFilename(state.dossier.title)}.encrypted.json`, JSON.stringify(envelope, null, 2), 'application/json');
    addReceipt({ schema: 'td613.giving.export-receipt/v1', at: new Date().toISOString(), kind: 'ENCRYPTED_JSON', dossier_id: state.dossier.id, envelope_digest: envelope.digest }, 'export');
    toast('Encrypted recovery export prepared.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

async function syncVault({ mergeParentVersionIds = [], operation = 'vault.write' } = {}) {
  const passphrase = $('#vaultPassphrase').value;
  if (passphrase.length < 12) {
    switchView('vault');
    $('#vaultPassphrase').focus();
    throw new Error('Enter a separate vault passphrase of at least 12 characters.');
  }
  updateDossierFromForm();
  const envelope = await encryptDossier(state.dossier, passphrase);
  const hostedPayload = toHostedVaultPayload(envelope, {
    parentVersionId: mergeParentVersionIds.length ? null : state.dossier.vault_head_version_id || null,
    mergeParentVersionIds,
    custodyMode: state.dossier.custody
  });
  const result = await api.call(operation, hostedPayload, {
    mutation: true,
    purpose: mergeParentVersionIds.length ? 'record human-reconciled encrypted dossier branch' : 'write encrypted dossier branch'
  });
  const data = dataOf(result);
  addReceipt(receiptOf(result), data?.conflict ? 'conflict' : 'vault');
  if (data?.conflict || data?.branches?.length > 1) {
    state.vaultVersions = data.branches || data.versions || (data.head_version_ids || []).map((version_id) => ({ version_id, branch_head: true }));
    renderVaultVersions();
    $('#conflictPanel').hidden = false;
    $('#saveState').textContent = 'parallel branch';
    toast('A parallel vault branch was preserved for human reconciliation.', 'error');
    return;
  }
  state.dossier = {
    ...state.dossier,
    version: state.dossier.version + 1,
    ancestry: [envelope.digest],
    vault_head_version_id: data?.version_id || envelope.version_id,
    updated_at: new Date().toISOString()
  };
  if (state.dossier.custody === CUSTODY_MODE.HYBRID && state.store) await state.store.writeDossier(state.dossier);
  state.dirty = false;
  $('#saveState').textContent = state.dossier.custody === CUSTODY_MODE.HYBRID ? 'hybrid synced' : 'vault saved';
  toast('Encrypted dossier branch stored; plaintext remained in this browser.');
  await listVaultVersions();
}

async function listVaultVersions() {
  try {
    const result = await api.call('vault.list', { dossier_id: state.dossier.id }, { mutation: false });
    const data = dataOf(result);
    state.vaultVersions = Array.isArray(data) ? data : data?.versions || [];
    addReceipt(receiptOf(result), 'vault');
    renderVaultVersions();
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

function renderVaultVersions() {
  const versions = state.vaultVersions || [];
  if (!versions.length) {
    $('#vaultVersions').innerHTML = '<span class="muted">No hosted versions loaded.</span>';
    $('#conflictPanel').hidden = true;
    return;
  }
  $('#vaultVersions').innerHTML = versions.map((version) => {
    const versionId = version.version_id || version.digest || version.envelope_digest;
    return `<div class="version-item">
      <span class="state-badge">v${escapeHtml(version.version || version.dossier_version || '?')}</span>
      <span><strong>${escapeHtml(String(versionId || '').slice(0, 24))}…</strong><small>${escapeHtml(version.created_at || version.updated_at || '')}</small></span>
      <button class="mini-button" type="button" data-vault-open="${escapeHtml(versionId)}">Open</button>
    </div>`;
  }).join('');
  $$('[data-vault-open]').forEach((button) => button.addEventListener('click', () => openVaultVersion(button.dataset.vaultOpen)));
  const branches = versions.filter((version) => version.conflict || version.branch_head);
  $('#conflictPanel').hidden = branches.length < 2;
  $('#conflictActions').innerHTML = branches.map((version) => {
    const versionId = version.version_id || version.digest || version.envelope_digest;
    return `<button class="button" type="button" data-resolve-branch="${escapeHtml(versionId)}">Use ${escapeHtml(String(versionId).slice(0, 10))}… as reconciled parent</button>`;
  }).join('');
  $$('[data-resolve-branch]').forEach((button) => button.addEventListener('click', () => resolveVaultConflict(button.dataset.resolveBranch)));
}

async function openVaultVersion(versionId) {
  const passphrase = $('#vaultPassphrase').value;
  if (passphrase.length < 12) return toast('Enter the separate vault passphrase first.', 'error');
  try {
    const result = await api.call('vault.read', { dossier_id: state.dossier.id, version_id: versionId }, { mutation: false });
    const data = dataOf(result);
    const envelope = fromHostedVaultRow(data?.envelope || data);
    const dossier = await decryptDossier(envelope, passphrase);
    state.dossier = dossier;
    state.dirty = false;
    state.holdReview = false;
    resetReviewControls();
    hydrateForm();
    renderAll();
    addReceipt(receiptOf(result), 'vault');
    toast('Encrypted version opened in browser memory.');
    return true;
  } catch (error) {
    toast(humanError(error), 'error');
    return false;
  }
}

async function resolveVaultConflict(chosenVersionId) {
  const branchVersionIds = state.vaultVersions
    .filter((version) => version.conflict || version.branch_head)
    .map((version) => version.version_id || version.digest || version.envelope_digest)
    .filter(Boolean);
  try {
    const opened = await openVaultVersion(chosenVersionId);
    if (!opened) return;
    state.dossier = {
      ...state.dossier,
      version: state.dossier.version + 1,
      vault_head_version_id: null,
      updated_at: new Date().toISOString()
    };
    await syncVault({ mergeParentVersionIds: branchVersionIds, operation: 'vault.resolve-conflict' });
    markDirty();
    $('#conflictPanel').hidden = true;
    toast('Reconciliation ancestry recorded. Competing ciphertext versions were preserved.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

function personDisplay(person) {
  const name = compactText(person.display_name || person.name?.displayName || person.name?.fullName || [person.firstName, person.lastName].filter(Boolean).join(' ') || person.name);
  return name || `Person ${person.id}`;
}

async function loadPeoplePage(reset = true) {
  try {
    const continuation = reset ? null : state.peopleContinuation;
    const result = await api.call('campaign-deputy.people-page', { last_evaluated_key: continuation }, { mutation: false });
    const data = dataOf(result);
    const people = data?.people || data?.items || data?.records || [];
    const current = reset ? [] : state.dossier.campaign_deputy.people_index;
    const map = new Map(current.map((person) => [person.id, person]));
    people.forEach((person) => { if (person?.id) map.set(person.id, person); });
    state.dossier.campaign_deputy.people_index = [...map.values()];
    state.peopleContinuation = data?.continuation || data?.lastEvaluatedKey || null;
    addReceipt(receiptOf(result), 'campaign-deputy-index');
    markDirty();
    renderPeopleIndex();
    toast(`${people.length} Campaign Deputy people added to this dossier index.`);
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

function renderPeopleIndex() {
  const phrase = compactText($('#peopleFilter')?.value).toUpperCase();
  const people = (state.dossier.campaign_deputy?.people_index || []).filter((person) =>
    !phrase || [personDisplay(person), person.primaryEmailAddress, person.email, person.primaryPhone, person.phone]
      .some((value) => compactText(value).toUpperCase().includes(phrase))
  );
  if (!people.length) {
    $('#peopleIndex').innerHTML = '<span class="muted">No Campaign Deputy people match the loaded dossier index.</span>';
  } else {
    $('#peopleIndex').innerHTML = people.slice(0, 250).map((person) => `<label class="person-option">
      <input type="radio" name="campaign_person" value="${escapeHtml(person.id)}" ${state.selectedPersonId === person.id ? 'checked' : ''}>
      <span><strong>${escapeHtml(personDisplay(person))}</strong><small>${escapeHtml(person.primaryEmailAddress || person.email || '')} · ${escapeHtml(person.primaryPhone || person.phone || '')}</small></span>
      <em class="state-badge">exact ID</em>
    </label>`).join('');
    $$('#peopleIndex input[type="radio"]').forEach((input) => input.addEventListener('change', () => {
      state.selectedPersonId = input.value;
      updateCampaignButtons();
    }));
  }
  $('#morePeopleButton').hidden = !state.peopleContinuation;
  updateCampaignButtons();
}

function confirmedRecords() {
  return state.dossier.records.filter((record) => state.dossier.decisions[recordDigest(record)] === IDENTITY_STATUS.CONFIRMED);
}

function renderCampaign() {
  renderPeopleIndex();
  const records = confirmedRecords();
  const current = $('#createRecordSelect')?.value;
  $('#createRecordSelect').innerHTML = '<option value="">Select a confirmed record</option>' + records.map((record) =>
    `<option value="${escapeHtml(recordDigest(record))}">${escapeHtml(recordName(record))} · ${escapeHtml(recordCommittee(record))}</option>`
  ).join('');
  if (records.some((record) => recordDigest(record) === current)) $('#createRecordSelect').value = current;
  updateCampaignButtons();
  const receipts = state.dossier.campaign_deputy?.write_receipts || [];
  $('#campaignReceipts').innerHTML = receipts.map((receipt) => receiptMarkup(receipt)).join('');
}

function updateCampaignButtons() {
  const committee = $('#committeeSelect')?.value;
  $('#linkExistingButton').disabled = !state.selectedPersonId || !committee;
  $('#createContactButton').disabled = !$('#createRecordSelect')?.value || !committee;
}

function appendCampaignReceipt(receipt) {
  state.dossier.campaign_deputy.write_receipts = [...(state.dossier.campaign_deputy.write_receipts || []), receipt];
  addReceipt(receipt, 'campaign-deputy-write');
  markDirty();
  renderCampaign();
}

async function linkExisting() {
  const committee = $('#committeeSelect').value;
  if (!state.selectedPersonId || !committee) return;
  try {
    const result = await api.call('campaign-deputy.link-existing', {
      dossier_id: state.dossier.id,
      person_id: state.selectedPersonId,
      committee,
      confirmed: true
    }, { mutation: true, purpose: 'link exact Campaign Deputy person to reviewed committee list' });
    const receipt = receiptOf(result) || dataOf(result)?.receipt;
    appendCampaignReceipt(receipt || { at: new Date().toISOString(), event: 'CAMPAIGN_DEPUTY_LINKED', person_id: state.selectedPersonId, committee });
    toast('Exact Campaign Deputy person linked idempotently.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

function contactPayload(record, fields) {
  const parsed = record.contributor_name_parsed || {};
  const fallbackTokens = recordName(record).split(/\s+/).filter(Boolean);
  const include = (field) => fields.includes(field);
  const person = {};
  if (include('name')) person.name = {
    givenName: parsed.given || fallbackTokens[0] || null,
    middleName: parsed.middle || null,
    familyName: parsed.family || fallbackTokens.slice(1).join(' ') || fallbackTokens[0] || null,
    suffix: parsed.suffix || null
  };
  if (include('email')) person.primaryEmailAddress = record.email || record.email_address || null;
  if (include('phone')) person.primaryPhone = record.phone || record.phone_number || null;
  if (include('employer')) person.employer = record.employer || null;
  if (include('occupation')) person.occupation = record.occupation || null;
  if (include('city_state_zip') || include('street_address')) {
    person.primaryAddress = {
      deliveryLine1: include('street_address') ? record.address || null : null,
      city: include('city_state_zip') ? record.city || null : null,
      stateProvince: include('city_state_zip') ? record.state || null : null,
      postalCode: include('city_state_zip') ? record.zip || null : null
    };
  }
  return person;
}

function campaignDeputySelectedFields(fields) {
  const selected = new Set(fields);
  const mapped = ['name'];
  if (selected.has('email')) mapped.push('primaryEmailAddress');
  if (selected.has('phone')) mapped.push('primaryPhone');
  if (selected.has('employer')) mapped.push('employer');
  if (selected.has('occupation')) mapped.push('occupation');
  if (selected.has('city_state_zip') || selected.has('street_address')) mapped.push('primaryAddress');
  return [...new Set(mapped)];
}

async function createContact() {
  const digest = $('#createRecordSelect').value;
  const committee = $('#committeeSelect').value;
  const record = state.dossier.records.find((item) => recordDigest(item) === digest);
  if (!record || state.dossier.decisions[digest] !== IDENTITY_STATUS.CONFIRMED || !committee) return;
  if (record.contributor_name_parsed?.kind === 'ORGANIZATION') return toast('This endpoint creates people, not organization contacts. Withhold or link an existing exact person instead.', 'error');
  const fields = $$('#createFieldChoices input:checked').map((input) => input.value);
  if (!fields.includes('name')) return toast('A name is required for explicit contact creation.', 'error');
  if (!window.confirm('Create a new Campaign Deputy person after duplicate review, then add that exact returned person to the selected committee list?')) return;
  try {
    const result = await api.call('campaign-deputy.create-confirmed', {
      dossier_id: state.dossier.id,
      record_digest: digest,
      selected_fields: campaignDeputySelectedFields(fields),
      person: contactPayload(record, fields),
      committee,
      confirmed: true,
      duplicate_reviewed: true,
      create_new_confirmed: true
    }, { mutation: true, purpose: 'explicitly create Campaign Deputy person and committee link' });
    const receipt = receiptOf(result) || dataOf(result)?.receipt;
    appendCampaignReceipt(receipt || { at: new Date().toISOString(), event: 'CAMPAIGN_DEPUTY_CREATED', record_digest: digest, committee });
    toast('New Campaign Deputy person created and linked from the synchronous response.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

async function withholdWriteback() {
  try {
    const result = await api.call('campaign-deputy.withhold', {
      dossier_id: state.dossier.id,
      reviewed_at: new Date().toISOString()
    }, { mutation: true, purpose: 'record explicit Campaign Deputy withhold' });
    appendCampaignReceipt(receiptOf(result) || { schema: 'td613.giving.writeback-receipt/v1', at: new Date().toISOString(), action: 'WITHHOLD', dossier_id: state.dossier.id });
    toast('WITHHOLD recorded; Campaign Deputy was not mutated.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

function receiptMarkup(receipt) {
  const kind = /error|fail/i.test(receipt?.status || receipt?.client_kind || '') ? 'error' : /withhold/i.test(receipt?.action || receipt?.status || receipt?.client_kind || '') ? 'withheld' : 'normal';
  const title = receipt?.action || receipt?.event || receipt?.status || receipt?.schema || 'Operator receipt';
  return `<article class="receipt-card" data-kind="${kind}"><strong>${escapeHtml(title)}</strong><pre>${escapeHtml(JSON.stringify(receipt, null, 2))}</pre></article>`;
}

function renderReceipts() {
  const receipts = state.dossier.operator_receipts || [];
  $('#receiptList').innerHTML = receipts.length
    ? [...receipts].reverse().map(receiptMarkup).join('')
    : '<div class="empty-state"><strong>No receipts yet.</strong><span>Retrieval and operator decisions will be recorded here without donor search inputs.</span></div>';
}

function renderAll() {
  renderSourceProgress();
  renderReview();
  renderLedger();
  renderCampaign();
  renderReceipts();
  $('#saveState').textContent = state.dirty ? 'unsaved' : 'saved';
  const sourceStates = Object.values(state.dossier.source_states || {});
  const running = sourceStates.filter((item) => item.status === 'RUNNING').length;
  const returned = sourceStates.filter((item) => ['COMPLETE', 'PARTIAL'].includes(item.status)).length;
  const confirmed = Object.values(state.dossier.decisions || {})
    .filter((status) => status === IDENTITY_STATUS.CONFIRMED).length;
  $('#wakeSourceState').textContent = running
    ? `${running} source${running === 1 ? '' : 's'} active`
    : returned
      ? `${returned} source${returned === 1 ? '' : 's'} returned`
      : 'sources quiet';
  $('#wakeIdentityState').textContent = `${confirmed} confirmed`;
  $('#wakeCustodyState').textContent = `${String(state.dossier.custody || CUSTODY_MODE.LOCAL).toLowerCase()} custody`;
  updateField();
}

function switchView(name) {
  $$('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === name));
  $$('[data-view-panel]').forEach((panel) => {
    const active = panel.dataset.viewPanel === name;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
  updateField(name);
  if (window.matchMedia('(max-width: 760px)').matches) {
    $('#givingControlRail').classList.remove('mobile-open');
    $('#mobileControlToggle').setAttribute('aria-expanded', 'false');
  }
}

async function readiness() {
  try {
    const result = await api.call('readiness', {}, { mutation: false });
    addReceipt(receiptOf(result) || dataOf(result), 'readiness');
    switchView('receipts');
    toast('Giving readiness receipt added.');
  } catch (error) {
    toast(humanError(error), 'error');
  }
}

async function bootAuthenticated() {
  sessionOpen();
  try {
    await Promise.all([loadRegistry(), renderLocalDossiers()]);
  } catch (error) {
    toast(`Signed session opened, but registry readiness is held: ${humanError(error)}`, 'error');
  }
  hydrateForm();
  renderAll();
}

function bindEvents() {
  $('#sessionForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const secret = $('#accessSecret').value;
    $('#sessionMessage').textContent = 'Opening signed session…';
    try {
      await api.createSession(secret);
      $('#accessSecret').value = '';
      await bootAuthenticated();
    } catch (error) {
      $('#accessSecret').value = '';
      sessionClosed(humanError(error));
    }
  });
  $('#signOutButton').addEventListener('click', async () => {
    cancelSearch();
    try { await api.closeSession(); } catch (error) {}
    state.dossier = createDossier();
    state.holdReview = false;
    resetReviewControls();
    sessionClosed('Signed session closed. Local dossiers remain under browser custody.');
  });
  $('#readinessButton').addEventListener('click', readiness);
  $('#mobileControlToggle').addEventListener('click', () => {
    const open = $('#givingControlRail').classList.toggle('mobile-open');
    $('#mobileControlToggle').setAttribute('aria-expanded', String(open));
  });
  $('#newDossierButton').addEventListener('click', newDossier);
  $('#openDossierButton').addEventListener('click', openLocalDossier);
  $('#saveDossierButton').addEventListener('click', () => saveDossier());
  $('#searchForm').addEventListener('submit', startSearch);
  $('#cancelSearchButton').addEventListener('click', cancelSearch);
  $('#selectAllSources').addEventListener('click', () => {
    $$('#sourceRegistry input:not(:disabled)').forEach((input) => { input.checked = true; });
    updateSelectedSourceCount();
    markDirty();
  });
  $('#clearSources').addEventListener('click', () => {
    $$('#sourceRegistry input').forEach((input) => { input.checked = false; });
    updateSelectedSourceCount();
    markDirty();
  });
  $$('.tab').forEach((tab) => tab.addEventListener('click', () => switchView(tab.dataset.view)));
  $('#reviewFilter').addEventListener('change', renderReview);
  $('#reviewSearch').addEventListener('input', renderReview);
  $('#holdReviewButton').addEventListener('click', () => {
    state.holdReview = !state.holdReview;
    renderHoldState();
    toast(state.holdReview
      ? 'Identity Review held. Later searches will append to this review.'
      : 'Hold released. The next search will replace this Identity Review.');
  });
  $$('[data-review-sort]').forEach((button) => button.addEventListener('click', () => setReviewSort(button.dataset.reviewSort)));
  $('#exactMatchToggle').addEventListener('change', () => markDirty());
  $('#exportCsvButton').addEventListener('click', () => {
    updateDossierFromForm();
    download(`${safeFilename(state.dossier.title)}.csv`, dossierCsv(state.dossier), 'text/csv;charset=utf-8');
    addReceipt({ schema: 'td613.giving.export-receipt/v1', at: new Date().toISOString(), kind: 'CSV', dossier_id: state.dossier.id, record_count: state.dossier.records.length }, 'export');
    toast('CSV export prepared with identity state and source lineage.');
  });
  $('#exportEncryptedButton').addEventListener('click', exportEncrypted);
  $('#syncVaultButton').addEventListener('click', () => saveDossier({ forceVault: true }));
  $('#refreshVaultButton').addEventListener('click', listVaultVersions);
  $('#loadPeopleButton').addEventListener('click', () => loadPeoplePage(true));
  $('#morePeopleButton').addEventListener('click', () => loadPeoplePage(false));
  $('#peopleFilter').addEventListener('input', renderPeopleIndex);
  $('#committeeSelect').addEventListener('change', updateCampaignButtons);
  $('#createRecordSelect').addEventListener('change', updateCampaignButtons);
  $('#linkExistingButton').addEventListener('click', linkExisting);
  $('#createContactButton').addEventListener('click', createContact);
  $('#withholdButton').addEventListener('click', withholdWriteback);
  $('#copyReceiptsButton').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state.dossier.operator_receipts || [], null, 2));
      toast('Receipt ledger copied.');
    } catch (error) { toast('Clipboard access was refused.', 'error'); }
  });
  ['dossierTitle', 'searchName', 'searchAliases', 'searchHints', 'dateFrom', 'dateTo'].forEach((id) => {
    $(`#${id}`).addEventListener('input', () => markDirty());
  });
  $('#custodyMode').addEventListener('change', () => {
    updateDossierFromForm();
    markDirty({ localAutosave: state.dossier.custody !== CUSTODY_MODE.HOSTED });
    if (state.dossier.custody === CUSTODY_MODE.HOSTED) toast('Hosted mode will remove this dossier’s local plaintext after its encrypted branch is accepted.');
    updateField();
  });
}

async function boot() {
  bindEvents();
  $('#dateFrom').value = '2000-01-01';
  $('#dateTo').value = new Date().toISOString().slice(0, 10);
  try { state.store = await openGivingStore(); } catch (error) { state.store = null; }
  try {
    await api.status();
    await bootAuthenticated();
  } catch (error) {
    sessionClosed('Enter the operator access secret to open this private ledger.');
  }
}

boot();
