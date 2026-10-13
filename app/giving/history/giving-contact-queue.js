import { searchTargetFromQuery } from './giving-model.js';

const queue = [];
const sourceErrors = new Map();
let queueRunning = false;
let stopRequested = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const compact = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const today = () => new Date().toISOString().slice(0, 10);
const DEFAULT_DATE_FROM = '2020-01-01';

function sourceIds() {
  return $$('#sourceRegistry input[type="checkbox"]:checked').map((input) => input.value);
}

function queueMessage(message = '', kind = 'info') {
  const node = $('#contactQueueMessage');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
  node.hidden = !message;
}

function currentSnapshot(name) {
  const aliases = ($('#searchAliases')?.value || '').split(/\r?\n|;/).map(compact).filter(Boolean);
  const hints = compact($('#searchHints')?.value);
  const dateFrom = $('#dateFrom')?.value || DEFAULT_DATE_FROM;
  const dateTo = $('#dateTo')?.value || today();
  const exactMatch = Boolean($('#exactMatchToggle')?.checked);
  const target = searchTargetFromQuery({ name, aliases, hints, date_from: dateFrom, date_to: dateTo, exact_match: exactMatch });
  return {
    id: target.id,
    name: compact(name),
    aliases,
    hints,
    dateFrom,
    dateTo,
    exactMatch,
    sourceIds: sourceIds(),
    status: 'QUEUED'
  };
}

function snapshotKey(item) {
  return JSON.stringify({
    name: item.name.toLocaleUpperCase('en-US'),
    aliases: item.aliases.map((value) => value.toLocaleUpperCase('en-US')),
    hints: item.hints.toLocaleUpperCase('en-US'),
    dateFrom: item.dateFrom,
    dateTo: item.dateTo,
    exactMatch: item.exactMatch,
    sourceIds: [...item.sourceIds].sort()
  });
}

function holdIsActive() {
  const button = $('#holdReviewButton');
  return button?.dataset.held === 'true' || button?.getAttribute('aria-pressed') === 'true';
}

function setHold(active) {
  const button = $('#holdReviewButton');
  if (!button || holdIsActive() === active) return;
  button.click();
}

function dispatchSourceChanges(nextIds) {
  const selected = new Set(nextIds);
  for (const input of $$('#sourceRegistry input[type="checkbox"]')) {
    const next = selected.has(input.value) && !input.disabled;
    if (input.checked === next) continue;
    input.checked = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function captureFormState() {
  return {
    name: $('#searchName')?.value || '',
    aliases: $('#searchAliases')?.value || '',
    hints: $('#searchHints')?.value || '',
    dateFrom: $('#dateFrom')?.value || DEFAULT_DATE_FROM,
    dateTo: $('#dateTo')?.value || today(),
    exactMatch: Boolean($('#exactMatchToggle')?.checked),
    sourceIds: sourceIds()
  };
}

function resolvedItem(item, fallback) {
  return {
    ...item,
    dateFrom: item.dateFrom || fallback.dateFrom || DEFAULT_DATE_FROM,
    dateTo: item.dateTo || fallback.dateTo || today(),
    sourceIds: item.sourceIds?.length ? item.sourceIds : fallback.sourceIds
  };
}

function applyFormState(item) {
  $('#searchName').value = item.name || '';
  $('#searchAliases').value = Array.isArray(item.aliases) ? item.aliases.join('\n') : item.aliases || '';
  $('#searchHints').value = item.hints || '';
  $('#dateFrom').value = item.dateFrom || DEFAULT_DATE_FROM;
  $('#dateTo').value = item.dateTo || today();
  $('#exactMatchToggle').checked = Boolean(item.exactMatch);
  dispatchSourceChanges(item.sourceIds || []);
}

function waitForSearchCycle(runButton, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    let sawRunning = runButton.disabled;
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    const observer = new MutationObserver(() => {
      if (runButton.disabled) sawRunning = true;
      if (sawRunning && !runButton.disabled) finish();
    });
    observer.observe(runButton, { attributes: true, attributeFilter: ['disabled'] });
    const timer = setTimeout(() => finish(new Error('Queued contact search did not settle inside the client observation window.')), timeoutMs);
    queueMicrotask(() => {
      if (runButton.disabled) sawRunning = true;
    });
  });
}

function settledQueueStatus() {
  const cards = $$('.source-run-card');
  if (!cards.length) return 'SEARCHED';
  const held = cards.some((card) => ['FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(card.dataset.status));
  return held ? 'SOURCE HOLD' : 'SEARCHED';
}

function selectTarget(item) {
  document.dispatchEvent(new CustomEvent('td613:giving-select-target', {
    detail: { targetId: item.id, targetName: item.name }
  }));
}

function renderQueue() {
  const list = $('#contactQueueList');
  const count = $('#contactQueueCount');
  const runButton = $('#runContactQueueButton');
  const clearButton = $('#clearContactQueueButton');
  const stopButton = $('#stopContactQueueButton');
  if (!list || !count || !runButton || !clearButton || !stopButton) return;
  count.textContent = `${queue.length} contact${queue.length === 1 ? '' : 's'}`;
  runButton.disabled = queueRunning || queue.length === 0;
  clearButton.disabled = queueRunning || queue.length === 0;
  stopButton.disabled = !queueRunning || stopRequested;
  stopButton.hidden = !queueRunning;
  stopButton.textContent = stopRequested ? 'Stopping…' : 'Stop queue';
  list.classList.toggle('contact-queue-scrollbox', queue.length >= 5);
  list.replaceChildren();
  if (!queue.length) {
    const empty = document.createElement('span');
    empty.className = 'contact-queue-empty';
    empty.textContent = 'No contacts queued.';
    list.append(empty);
    return;
  }
  for (const item of queue) {
    const row = document.createElement('div');
    row.className = 'contact-queue-item';
    row.dataset.status = item.status;
    row.dataset.targetId = item.id;

    const copy = document.createElement('div');
    copy.className = 'contact-queue-copy';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const meta = document.createElement('small');
    const selectedCount = item.sourceIds.length;
    meta.textContent = `${item.dateFrom || DEFAULT_DATE_FROM} → ${item.dateTo || today()} · ${selectedCount ? `${selectedCount} source${selectedCount === 1 ? '' : 's'}` : 'use current sources at run'} · ${item.exactMatch ? 'exact' : 'broad'}${item.aliases.length ? ` · ${item.aliases.length} alias${item.aliases.length === 1 ? '' : 'es'}` : ''}`;
    copy.append(name, meta);

    const state = document.createElement('span');
    state.className = 'contact-queue-state';
    state.textContent = item.status;
    state.hidden = item.status === 'QUEUED';

    const actions = document.createElement('div');
    actions.className = 'contact-queue-item-actions';
    const review = document.createElement('button');
    review.type = 'button';
    review.className = 'mini-button';
    review.textContent = 'Review';
    review.hidden = item.status === 'QUEUED' || item.status === 'RUNNING';
    review.addEventListener('click', () => selectTarget(item));

    const exact = document.createElement('button');
    exact.type = 'button';
    exact.className = `mini-button contact-queue-exact${item.exactMatch ? ' active' : ''}`;
    exact.textContent = 'Exact';
    exact.setAttribute('aria-pressed', String(Boolean(item.exactMatch)));
    exact.title = 'Use the same normalized exact-match rule as the individual contribution search for this contact.';
    exact.disabled = queueRunning;
    exact.addEventListener('click', () => {
      item.exactMatch = !item.exactMatch;
      queueMessage(`${item.name} will use ${item.exactMatch ? 'normalized exact match' : 'broad matching'} when searched.`);
      renderQueue();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'mini-button contact-queue-remove';
    remove.textContent = 'Remove';
    remove.disabled = queueRunning;
    remove.addEventListener('click', () => {
      const index = queue.findIndex((candidate) => candidate.id === item.id);
      if (index >= 0) queue.splice(index, 1);
      queueMessage(`${item.name} removed from the queue.`);
      renderQueue();
    });
    actions.append(review, exact, remove);

    row.append(copy, state, actions);
    list.append(row);
  }
}

function addContacts() {
  const input = $('#contactQueueInput');
  const rawNames = (input?.value || '').split(/\r?\n|;/).map(compact).filter(Boolean);
  const names = [...new Set(rawNames)];
  if (!names.length) {
    queueMessage('Enter a contact name first.', 'error');
    input?.focus();
    return;
  }

  const known = new Set(queue.map(snapshotKey));
  let added = 0;
  for (const name of names) {
    const item = currentSnapshot(name);
    const key = snapshotKey(item);
    if (known.has(key)) continue;
    queue.push(item);
    known.add(key);
    added += 1;
  }
  input.value = '';
  if (added) queueMessage(`${added} contact${added === 1 ? '' : 's'} added. Search settings are captured now; if no sources are selected yet, current sources will be used when the queue runs.`);
  else queueMessage('Those contacts are already queued with the same search settings.');
  renderQueue();
}

async function runContacts() {
  if (queueRunning || !queue.length) return;
  const form = $('#searchForm');
  const runButton = $('#runSearchButton');
  if (!form || !runButton) return;
  const originalForm = captureFormState();
  const originalHold = holdIsActive();

  if (!originalForm.sourceIds.length && queue.every((item) => !item.sourceIds.length)) {
    queueMessage('Select at least one source before running the queue.', 'error');
    $('#selectAllSources')?.focus();
    return;
  }
  if (!originalForm.dateFrom || !originalForm.dateTo || originalForm.dateFrom > originalForm.dateTo) {
    queueMessage('Choose a valid beginning and ending date before running the queue.', 'error');
    $('#dateFrom')?.focus();
    return;
  }

  queueRunning = true;
  stopRequested = false;
  queueMessage('Queue search running. Each name remains a separate review target.');
  renderQueue();
  try {
    for (let index = 0; index < queue.length; index += 1) {
      if (stopRequested) break;
      const item = queue[index];
      const runnable = resolvedItem(item, originalForm);
      if (!runnable.sourceIds.length) {
        item.status = 'NEEDS SOURCES';
        queueMessage(`${item.name} has no available source selection.`, 'error');
        renderQueue();
        break;
      }
      if (!runnable.dateFrom || !runnable.dateTo || runnable.dateFrom > runnable.dateTo) {
        item.status = 'NEEDS DATES';
        queueMessage(`${item.name} has an invalid date window.`, 'error');
        renderQueue();
        break;
      }
      if (index > 0) setHold(true);
      else setHold(originalHold);
      applyFormState(runnable);
      item.status = 'RUNNING';
      renderQueue();
      const cycle = waitForSearchCycle(runButton);
      form.requestSubmit(runButton);
      await cycle;
      item.status = settledQueueStatus();
      renderQueue();
    }
    if (stopRequested) queueMessage('Queue stopped after the current contact.');
    else queueMessage('Queue search finished. Use Review on any completed contact to jump to its partitioned Identity Review.');
  } catch (error) {
    const running = queue.find((item) => item.status === 'RUNNING');
    if (running) running.status = 'CLIENT HOLD';
    queueMessage(error?.message || 'Queued contact search held.', 'error');
    console.warn('[TD613 Giving] queued contact search held', error);
  } finally {
    applyFormState(originalForm);
    setHold(originalHold);
    queueRunning = false;
    stopRequested = false;
    renderQueue();
  }
}

function annotateSourceErrors() {
  for (const [sourceId, message] of sourceErrors.entries()) {
    const retry = $$('[data-source-retry]').find((button) => button.dataset.sourceRetry === sourceId);
    const card = retry?.closest('.source-run-card');
    const meta = card?.querySelector('.source-run-meta');
    if (!meta || meta.querySelector('[data-source-error-detail]')) continue;
    const detail = document.createElement('span');
    detail.dataset.sourceErrorDetail = 'true';
    detail.className = 'source-error-detail';
    detail.textContent = message;
    meta.append(detail);
  }
}

function installSourceErrorObserver() {
  const progress = $('#sourceProgress');
  if (!progress) return;
  const observer = new MutationObserver(annotateSourceErrors);
  observer.observe(progress, { childList: true, subtree: true });
  annotateSourceErrors();
}

function installFetchDiagnostics() {
  const marker = Symbol.for('td613.giving.fetch-diagnostics/v1');
  if (globalThis.fetch?.[marker]) return;
  const nativeFetch = globalThis.fetch?.bind(globalThis);
  if (!nativeFetch) return;
  const wrapped = async (input, init = {}) => {
    let envelope = null;
    try {
      if (typeof init.body === 'string') envelope = JSON.parse(init.body);
    } catch {}
    const response = await nativeFetch(input, init);
    if (envelope?.operation === 'search.page' && envelope?.payload?.source_instance_id === 'fec-schedule-a') {
      try {
        const body = await response.clone().json();
        const page = body?.data?.page || body?.data || null;
        const error = page?.error || body?.error || null;
        if (error?.message) {
          sourceErrors.set('fec-schedule-a', compact(error.message));
          queueMicrotask(annotateSourceErrors);
        } else if (response.ok && page?.source_status === 'READY') {
          sourceErrors.delete('fec-schedule-a');
        }
      } catch {}
    }
    return response;
  };
  Object.defineProperty(wrapped, marker, { value: true });
  globalThis.fetch = wrapped;
}

function installContactQueue() {
  const form = $('#searchForm');
  const sourcePicker = form?.querySelector('.source-picker');
  if (!form || !sourcePicker || $('#contactQueuePanel')) return;
  const panel = document.createElement('section');
  panel.id = 'contactQueuePanel';
  panel.className = 'contact-queue-panel';
  panel.innerHTML = `
    <div class="contact-queue-heading">
      <div><strong>Contact queue</strong><small>Add one name at a time or paste a list, one per line. Each contact remains a separate review target before Campaign Deputy handoff.</small></div>
      <span class="counter" id="contactQueueCount">0 contacts</span>
    </div>
    <label class="field contact-queue-input-field">
      <span>Contact name <small>one per line for a list; commas stay inside names</small></span>
      <textarea id="contactQueueInput" rows="3" maxlength="3000" placeholder="Jane Doe&#10;John Q. Public"></textarea>
    </label>
    <div class="button-row contact-queue-actions">
      <button class="button" id="addContactQueueButton" type="button">Add contact</button>
      <button class="button primary" id="runContactQueueButton" type="button" disabled>Search queue</button>
      <button class="button" id="stopContactQueueButton" type="button" disabled hidden>Stop queue</button>
      <button class="text-button" id="clearContactQueueButton" type="button" disabled>Clear queue</button>
    </div>
    <p class="contact-queue-message" id="contactQueueMessage" role="status" hidden></p>
    <div class="contact-queue-list" id="contactQueueList" aria-live="polite"></div>
  `;
  sourcePicker.before(panel);
  $('#addContactQueueButton').addEventListener('click', addContacts);
  $('#runContactQueueButton').addEventListener('click', runContacts);
  $('#stopContactQueueButton').addEventListener('click', () => {
    stopRequested = true;
    queueMessage('Stop requested. The active contact will finish first.');
    renderQueue();
  });
  $('#clearContactQueueButton').addEventListener('click', () => {
    if (queueRunning) return;
    queue.splice(0);
    queueMessage('Contact queue cleared.');
    renderQueue();
  });
  document.addEventListener('td613:giving-clear-all', () => {
    if (queueRunning) return;
    queue.splice(0);
    queueMessage('Contact queue cleared with the active search.');
    renderQueue();
  });
  renderQueue();
  installSourceErrorObserver();
}

installFetchDiagnostics();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installContactQueue, { once: true });
else installContactQueue();

