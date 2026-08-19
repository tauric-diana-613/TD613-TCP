const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const BUILD = '20260818-1';
let bypassSavedPracticeBoundary = false;
let pendingSavedPracticeValue = null;

function practiceActive() {
  return document.documentElement.dataset.givingPractice === 'true';
}

function compact(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function moveStateBelowHints() {
  const state = $('#givingStateFilter');
  const hints = $('#searchHints')?.closest('.field');
  if (!state || !hints || state.previousElementSibling === hints) return;
  hints.insertAdjacentElement('afterend', state);
  state.dataset.repairPlacement = 'after-search-hints';
}

function moveCommitteeFilterBeforeSources() {
  const control = $('#committeeContextFilterControl');
  const picker = $('#searchForm .source-picker');
  if (!control || !picker) return;
  if (control.nextElementSibling !== picker) picker.insertAdjacentElement('beforebegin', control);
  const title = control.querySelector('label strong');
  const copy = control.querySelector('label small');
  const jump = $('#committeeFilterJump');
  if (title && title.textContent !== 'Filter by loaded committee') title.textContent = 'Filter by loaded committee';
  if (copy) copy.textContent = 'Limit this contributor search to the committee you deliberately load in Candidate & committee lookup.';
  if (jump) {
    jump.textContent = 'Choose a committee ↓';
    jump.setAttribute('aria-label', 'Jump to Candidate and committee lookup below');
    jump.title = 'Jump to Candidate & committee lookup';
  }
  control.dataset.repairPlacement = 'before-filing-sources';
}

function renameFilingSources() {
  const picker = $('#searchForm .source-picker');
  const legend = picker?.querySelector(':scope > legend');
  const actions = picker?.querySelector('.source-picker-actions');
  if (!picker || !legend || !actions) return;
  legend.textContent = 'Campaign finance filing sources';
  let help = picker.querySelector('.filing-source-help');
  if (!help) {
    help = document.createElement('p');
    help.className = 'filing-source-help';
    help.textContent = 'Choose the filing databases Giving should search. Each source keeps its own coverage and completion receipt.';
    actions.insertAdjacentElement('beforebegin', help);
  }
}

function markMobileGeometryOwners() {
  $('#dateFrom')?.closest('.split-fields')?.classList.add('giving-date-range-filter');
  $('#amountMin')?.closest('.split-fields')?.classList.add('giving-amount-range-filter');
  $('#view-ledger .section-head .button-row')?.classList.add('committee-ledger-toolbar', 'committee-ledger-toolbar-repair');
  $('#committeeSearchWorkspace')?.classList.add('committee-search-workspace-repair');
}

function installPracticeExactQueueDefault() {
  document.addEventListener('click', (event) => {
    if (!practiceActive() || !event.target?.closest?.('#addContactQueueButton')) return;
    const exact = $('#exactMatchToggle');
    if (!exact || exact.checked) return;
    exact.checked = true;
    exact.dispatchEvent(new Event('change', { bubbles: true }));
  }, true);
}

function translateQueueStates() {
  const list = $('#contactQueueList');
  if (!list) return;
  for (const row of list.querySelectorAll('.contact-queue-item')) {
    const state = row.querySelector('.contact-queue-state');
    if (!state) continue;
    if (row.dataset.status === 'SOURCE HOLD') {
      if (state.textContent !== 'NEEDS SOURCE RETRY') state.textContent = 'NEEDS SOURCE RETRY';
      state.title = 'At least one selected filing source did not complete. Successful source results remain usable; retry the named source for fuller coverage.';
      if (!row.querySelector('.queue-source-retry-note')) {
        const note = document.createElement('p');
        note.className = 'queue-source-retry-note';
        note.textContent = 'At least one filing source needs another retrieval attempt. This does not erase results returned by sources that completed.';
        row.append(note);
      }
    } else if (row.dataset.status === 'CLIENT HOLD') {
      if (state.textContent !== 'SEARCH PAUSED') state.textContent = 'SEARCH PAUSED';
      state.title = 'The browser did not receive a terminal search receipt for this contact.';
    } else {
      row.querySelector('.queue-source-retry-note')?.remove();
    }
  }
  const message = $('#contactQueueMessage');
  if (message) {
    const next = String(message.textContent || '')
      .replace(/held custodians\/routes:/gi, 'sources needing retry:')
      .replace(/(\d+) held\b/gi, '$1 needing retry');
    if (next !== message.textContent) message.textContent = next;
  }
}

function installQueueLanguageObserver() {
  const list = $('#contactQueueList');
  const message = $('#contactQueueMessage');
  if (list) new MutationObserver(() => queueMicrotask(translateQueueStates)).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status'] });
  if (message) new MutationObserver(() => queueMicrotask(translateQueueStates)).observe(message, { childList: true, subtree: true, characterData: true });
  translateQueueStates();
}

function clearField(selector, value = '') {
  const node = $(selector);
  if (!node || node.value === value) return;
  node.value = value;
  node.dispatchEvent(new Event('input', { bubbles: true }));
  node.dispatchEvent(new Event('change', { bubbles: true }));
}

function purgePracticeTransientState() {
  document.dispatchEvent(new CustomEvent('td613:giving-clear-all'));
  clearField('#searchName');
  clearField('#searchAliases');
  clearField('#searchHints');
  clearField('#amountMin');
  clearField('#amountMax');
  clearField('#contactQueueInput');
  clearField('#campaignDirectoryQuery');
  clearField('#reviewSearch');
  clearField('#dateFrom', '2020-01-01');
  clearField('#dateTo', new Date().toISOString().slice(0, 10));
  const exact = $('#exactMatchToggle');
  if (exact?.checked) {
    exact.checked = false;
    exact.dispatchEvent(new Event('change', { bubbles: true }));
  }
  for (const state of $$('#givingStateFilter input[type="checkbox"]:checked')) {
    state.checked = false;
    state.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const localFiles = $('#localDossierSelect');
  if (localFiles) localFiles.value = '';
  $('#campaignDirectoryCandidates')?.replaceChildren(Object.assign(document.createElement('span'), { className: 'muted', textContent: 'Search to begin.' }));
  $('#campaignDirectoryCommittees')?.replaceChildren(Object.assign(document.createElement('span'), { className: 'muted', textContent: 'Search to begin.' }));
  $('#campaignDirectoryOpenSecrets')?.replaceChildren(Object.assign(document.createElement('span'), { className: 'muted', textContent: 'Search to begin.' }));
}

function installPracticeExitPurge() {
  document.addEventListener('td613:giving-practice-source-registry', (event) => {
    if (event.detail?.action !== 'remove') return;
    queueMicrotask(purgePracticeTransientState);
  });
}

function savedPracticeOption() {
  const option = $('#localDossierSelect')?.selectedOptions?.[0];
  if (!option?.value) return null;
  const label = compact(option.textContent);
  return /\bSAMPLE\b|BIKINI BOTTOM|FICTIONAL/i.test(label) ? option : null;
}

function practiceFileBoundaryDialog() {
  let dialog = $('#practiceFileBoundaryDialog');
  if (dialog) return dialog;
  dialog = document.createElement('div');
  dialog.id = 'practiceFileBoundaryDialog';
  dialog.className = 'practice-file-boundary-dialog';
  dialog.hidden = true;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'practiceFileBoundaryTitle');
  dialog.innerHTML = `
    <strong id="practiceFileBoundaryTitle">Open this saved file in Demo mode?</strong>
    <p>This saved research file belongs to the fictional practice universe. Opening it will clear the current unsaved working session, put real filing sources to sleep, enter Demo mode, then restore the selected file. Saved Local Files and Vault custody are preserved.</p>
    <div>
      <button type="button" class="button primary" data-practice-file-boundary="enter">Enter Demo &amp; open file</button>
      <button type="button" class="button" data-practice-file-boundary="cancel">Cancel</button>
    </div>`;
  document.body.append(dialog);
  return dialog;
}

function closePracticeFileBoundary() {
  practiceFileBoundaryDialog().hidden = true;
  pendingSavedPracticeValue = null;
}

function enterPracticeAndOpenSavedFile() {
  const value = pendingSavedPracticeValue;
  if (!value) return closePracticeFileBoundary();
  practiceFileBoundaryDialog().hidden = true;
  $('#newDossierButton')?.click();
  const onRegistry = (event) => {
    if (event.detail?.action !== 'register') return;
    document.removeEventListener('td613:giving-practice-source-registry', onRegistry);
    const select = $('#localDossierSelect');
    if (select) select.value = value;
    pendingSavedPracticeValue = null;
    bypassSavedPracticeBoundary = true;
    $('#openDossierButton')?.click();
    queueMicrotask(() => { bypassSavedPracticeBoundary = false; });
  };
  document.addEventListener('td613:giving-practice-source-registry', onRegistry);
  document.dispatchEvent(new CustomEvent('td613:giving-practice-load-request'));
}

function installSavedPracticeBoundary() {
  practiceFileBoundaryDialog();
  document.addEventListener('click', (event) => {
    const open = event.target?.closest?.('#openDossierButton');
    if (!open || bypassSavedPracticeBoundary || practiceActive()) return;
    const option = savedPracticeOption();
    if (!option) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    pendingSavedPracticeValue = option.value;
    const dialog = practiceFileBoundaryDialog();
    dialog.hidden = false;
    dialog.querySelector('[data-practice-file-boundary="cancel"]')?.focus();
  }, true);
  document.addEventListener('click', (event) => {
    const action = event.target?.closest?.('[data-practice-file-boundary]')?.dataset.practiceFileBoundary;
    if (!action) return;
    if (action === 'enter') enterPracticeAndOpenSavedFile();
    else closePracticeFileBoundary();
  });
}

function ensurePracticeLoadButtons() {
  if (!practiceActive()) return;
  for (const card of $$('.practice-directory-card[data-practice-object]')) {
    if (card.querySelector('[data-practice-load-context]')) continue;
    const committeeId = card.dataset.practiceObject || '';
    const committeeName = compact(card.querySelector('strong')?.textContent);
    if (!committeeName) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'practice-load-context-button repair-practice-load-context';
    button.dataset.practiceLoadContext = 'true';
    button.dataset.committeeId = committeeId;
    button.dataset.committeeName = committeeName;
    button.dataset.sourceId = 'practice-bikini-bottom-votes';
    button.textContent = 'Load committee → Contributions';
    card.append(button);
  }
}

function ensureLiveWorkspaceFallback() {
  if (practiceActive()) return;
  const workspace = $('#committeeSearchWorkspaceList');
  const summary = $('#committeeSearchWorkspaceSummary');
  if (!workspace || !summary || !/no committee search loaded/i.test(summary.textContent || '')) return;
  const originals = $$('#campaignDirectoryCandidates [data-load-campaign], #campaignDirectoryCommittees [data-load-campaign]');
  if (!originals.length) return;
  workspace.replaceChildren();
  for (const original of originals.slice(0, 12)) {
    const row = document.createElement('article');
    row.className = 'committee-workspace-row repair-workspace-fallback';
    const copy = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = original.dataset.committeeName || original.dataset.candidateName || compact(original.textContent).replace(/Load.*$/i, '') || 'Committee result';
    const small = document.createElement('small');
    small.textContent = [original.dataset.committeeId, original.dataset.candidateId].filter(Boolean).join(' · ') || 'Reviewed lookup result';
    copy.append(strong, small);
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'button repair-workspace-load';
    action.textContent = 'Load → Contributions';
    action.addEventListener('click', () => original.click());
    row.append(copy, action);
    workspace.append(row);
  }
  summary.textContent = `${originals.length} lookup result${originals.length === 1 ? '' : 's'} ready to load.`;
}

function installCommitteeWorkspaceAssurance() {
  const roots = [$('#campaignDirectoryCandidates'), $('#campaignDirectoryCommittees'), $('#committeeSearchWorkspaceList')].filter(Boolean);
  const refresh = () => queueMicrotask(() => {
    ensurePracticeLoadButtons();
    ensureLiveWorkspaceFallback();
  });
  for (const root of roots) new MutationObserver(refresh).observe(root, { childList: true, subtree: true });
  document.addEventListener('submit', (event) => {
    if (event.target?.id === 'campaignDirectoryForm') setTimeout(refresh, 0);
  }, true);
  refresh();
}

function normalizeSourceMessages() {
  for (const note of $$('.fec-partial-guidance')) {
    const next = 'OpenFEC returned one bounded provider page. More matching filings may exist; Continue next page extends coverage. Yellow means incomplete coverage—not a failed search and never zero giving.';
    if (note.textContent !== next) note.textContent = next;
  }
  for (const card of $$('.source-run-card')) {
    const sourceId = card.querySelector('[data-source-retry]')?.dataset.sourceRetry || card.querySelector('[data-source-continue]')?.dataset.sourceContinue || '';
    if (!sourceId.startsWith('easyvote-')) continue;
    for (const detail of card.querySelectorAll('[data-source-error-detail]')) {
      if (!/response boundary|lower the page size/i.test(detail.textContent || '')) continue;
      detail.textContent = 'EasyVote returned more raw data than one Giving response can safely carry. Giving now requests smaller EasyVote pages; retry this source. If the provider still overfills a page, narrow the date window.';
    }
  }
}

function installSourceMessageObserver() {
  const progress = $('#sourceProgress');
  if (progress) new MutationObserver(() => queueMicrotask(normalizeSourceMessages)).observe(progress, { childList: true, subtree: true, characterData: true });
  normalizeSourceMessages();
}

function install() {
  moveStateBelowHints();
  moveCommitteeFilterBeforeSources();
  renameFilingSources();
  markMobileGeometryOwners();
  installPracticeExactQueueDefault();
  installQueueLanguageObserver();
  installPracticeExitPurge();
  installSavedPracticeBoundary();
  installCommitteeWorkspaceAssurance();
  installSourceMessageObserver();
  document.documentElement.dataset.givingRepairBundle = BUILD;
  globalThis.__TD613_GIVING_REPAIR_DIAGNOSIS__ = Object.freeze({
    schema: 'td613.giving.repair-diagnosis/v0.1',
    build: BUILD,
    principles: Object.freeze([
      'advisory controls must expose their route',
      'practice custody cannot cross into live retrieval without an explicit universe transition',
      'partial source coverage remains usable evidence and must not masquerade as zero',
      'responsive controls may change geometry without losing semantic role'
    ]),
    automatic_repo_propagation: false,
    human_closure_required: true
  });
}

install();

export const _givingRepair20260818 = Object.freeze({
  moveStateBelowHints,
  moveCommitteeFilterBeforeSources,
  renameFilingSources,
  purgePracticeTransientState,
  savedPracticeOption,
  ensurePracticeLoadButtons,
  ensureLiveWorkspaceFallback
});
