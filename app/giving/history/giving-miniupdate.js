const $ = (selector) => document.querySelector(selector);

const PRACTICE_ACTIVE_ATTR = 'givingPractice';
let closeAfterPracticeExit = false;
let bypassCloseIntercept = false;

function practiceActive() {
  return document.documentElement.dataset[PRACTICE_ACTIVE_ATTR] === 'true';
}

function installMobileRangeHooks() {
  $('#dateFrom')?.closest('.split-fields')?.classList.add('giving-date-range-filter');
  $('#amountMin')?.closest('.split-fields')?.classList.add('giving-amount-range-filter');
}

function moveDossierActionsToTitle() {
  const titleInput = $('#dossierTitle');
  const field = titleInput?.closest('.field');
  const actions = $('.dossier-control .dossier-actions');
  const label = field?.querySelector(':scope > span');
  if (!field || !actions || !label || field.querySelector('.research-file-title-row')) return;

  const row = document.createElement('div');
  row.className = 'research-file-title-row';
  label.before(row);
  row.append(label, actions);
}

function externalizeDossierPickerLabel(selectId) {
  const picker = document.querySelector(`[data-dossier-picker-for="${selectId}"]`);
  const field = picker?.closest('.field');
  const summary = picker?.querySelector(':scope > summary');
  if (!picker || !field || !summary || field.querySelector(`.dossier-external-label[data-for="${selectId}"]`)) return;

  const existingLine = summary.querySelector('.research-dossier-field-label-line');
  const label = existingLine || summary.querySelector(':scope > span');
  if (!label) return;

  const external = document.createElement('div');
  external.className = 'dossier-external-label';
  external.dataset.for = selectId;
  external.id = `${selectId}VisibleLabel`;
  label.before(external);
  external.append(label);
  picker.before(external);
  picker.setAttribute('aria-labelledby', external.id);
}

function hydrateCustodyLanguage() {
  const select = $('#custodyMode');
  if (select) {
    const labels = {
      LOCAL: 'Local — this browser',
      HOSTED: 'Hosted — encrypted Vault only',
      HYBRID: 'Hybrid — browser + encrypted Vault'
    };
    let changed = false;
    for (const option of select.options) {
      if (labels[option.value] && option.textContent !== labels[option.value]) {
        option.textContent = labels[option.value];
        changed = true;
      }
    }
    if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const custodyHelp = $('#custodyModeHelpText');
  if (custodyHelp) {
    custodyHelp.textContent = [
      'Choose where this research file lives after you save it.',
      '',
      'Local — keeps the readable working file in this browser. Behind the scenes, the browser uses IndexedDB: its built-in private database. You never need to manage IndexedDB yourself.',
      '',
      'Hosted — your browser encrypts first, then the Vault receives ciphertext rather than the readable file.',
      '',
      'Hybrid — keeps the readable working file in this browser and an encrypted Vault copy.',
      '',
      'Changing custody mode never runs a search. Saving changes storage; it does not change the evidence.'
    ].join('\n');
    custodyHelp.dataset.pedagogueHydrated = 'true';
  }

  const fileHelp = $('#researchDossierHelpText');
  if (fileHelp) {
    fileHelp.textContent = [
      'One contributor research file keeps one investigation together.',
      '',
      'It carries search settings, retrieved public records, identity decisions, committee totals, receipts, and custody history.',
      '',
      'Save preserves the current file. Save never starts another search. Vault creates or updates an encrypted hosted copy only when you explicitly choose that route.'
    ].join('\n');
    fileHelp.dataset.pedagogueHydrated = 'true';
  }
}

function renameAndMarkDemoButton() {
  const button = $('#loadResearchSampleButton');
  if (!button) return;
  button.textContent = 'Load Fictional Demo';
  button.classList.add('load-fictional-demo-button');
}

function demoConfirmDialog() {
  let dialog = $('#givingDemoClearConfirm');
  if (dialog) return dialog;
  dialog = document.createElement('div');
  dialog.id = 'givingDemoClearConfirm';
  dialog.className = 'giving-demo-clear-confirm';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'givingDemoClearConfirmTitle');
  dialog.hidden = true;
  dialog.innerHTML = `
    <strong id="givingDemoClearConfirmTitle">Clear session and begin demo?</strong>
    <small>Unsaved work may be lost.</small>
    <div class="giving-demo-confirm-actions">
      <button type="button" data-demo-clear="yes">Begin demo</button>
      <button type="button" data-demo-clear="no">Cancel</button>
    </div>`;
  document.body.append(dialog);
  return dialog;
}

function closeDemoConfirm() {
  const dialog = demoConfirmDialog();
  dialog.hidden = true;
}

function clearWorkingSessionForDemo() {
  const cancel = $('#cancelSearchButton');
  if (cancel && !cancel.disabled) cancel.click();

  const clearQueue = $('#clearContactQueueButton');
  if (clearQueue && !clearQueue.disabled) clearQueue.click();

  $('#newDossierButton')?.click();
  const localFiles = $('#localDossierSelect');
  if (localFiles) localFiles.value = '';

  const campaignQuery = $('#campaignDirectoryQuery');
  if (campaignQuery) campaignQuery.value = '';
  for (const selector of ['#campaignDirectoryCandidates', '#campaignDirectoryCommittees', '#campaignDirectoryOpenSecrets']) {
    const node = $(selector);
    if (node) node.innerHTML = '<span class="muted">Search to begin.</span>';
  }
  const activity = $('#campaignActivitySection');
  if (activity) activity.hidden = true;
  const status = $('#campaignToolsStatus');
  if (status) status.textContent = 'Ready for campaign / PC lookup.';
  document.querySelector('.tab[data-view="search"]')?.click();
}

function beginDemoAfterConfirmation() {
  closeDemoConfirm();
  clearWorkingSessionForDemo();
  document.dispatchEvent(new CustomEvent('td613:giving-practice-load-request'));
}

function installDemoLoadConfirmation() {
  demoConfirmDialog();
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#loadResearchSampleButton');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const dialog = demoConfirmDialog();
    dialog.hidden = false;
    dialog.querySelector('[data-demo-clear="no"]')?.focus();
  }, true);

  document.addEventListener('click', (event) => {
    const choice = event.target?.closest?.('[data-demo-clear]');
    if (!choice) return;
    if (choice.dataset.demoClear === 'yes') beginDemoAfterConfirmation();
    else closeDemoConfirm();
  });
}

function showSharedPracticeExit() {
  const sourceExit = $('#practiceExitButton');
  if (sourceExit) {
    sourceExit.click();
    return true;
  }
  const confirm = $('#practiceExitConfirm');
  if (confirm) {
    confirm.hidden = false;
    confirm.querySelector('[data-practice-exit="no"]')?.focus();
    return true;
  }
  return false;
}

function installCloseSessionPracticeExit() {
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#signOutButton');
    if (!button || bypassCloseIntercept || !practiceActive()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeAfterPracticeExit = true;
    if (!showSharedPracticeExit()) closeAfterPracticeExit = false;
  }, true);

  document.addEventListener('click', (event) => {
    const choice = event.target?.closest?.('[data-practice-exit]');
    if (!choice || !closeAfterPracticeExit) return;
    if (choice.dataset.practiceExit === 'no') {
      closeAfterPracticeExit = false;
      return;
    }
    if (choice.dataset.practiceExit !== 'yes') return;
    queueMicrotask(() => {
      closeAfterPracticeExit = false;
      bypassCloseIntercept = true;
      $('#signOutButton')?.click();
      bypassCloseIntercept = false;
    });
  });
}

function annotateFecPartialState() {
  const button = document.querySelector('[data-source-continue="fec-schedule-a"]');
  const card = button?.closest('.source-run-card');
  const meta = card?.querySelector('.source-run-meta');
  if (!card || !meta || card.dataset.status !== 'PARTIAL' || meta.querySelector('.fec-partial-guidance')) return;
  const note = document.createElement('span');
  note.className = 'fec-partial-guidance';
  note.textContent = 'OpenFEC returned a bounded page or paused at its provider window. Continue next page keeps retrieval explicit; partial coverage never means zero giving.';
  meta.append(note);
}

function installFecPartialObserver() {
  const progress = $('#sourceProgress');
  if (!progress) return;
  new MutationObserver(annotateFecPartialState).observe(progress, { childList: true, subtree: true });
  annotateFecPartialState();
}

function installMiniupdate() {
  installMobileRangeHooks();
  moveDossierActionsToTitle();
  externalizeDossierPickerLabel('custodyMode');
  externalizeDossierPickerLabel('localDossierSelect');
  hydrateCustodyLanguage();
  renameAndMarkDemoButton();
  installDemoLoadConfirmation();
  installCloseSessionPracticeExit();
  installFecPartialObserver();
  document.documentElement.dataset.givingMiniupdate = '20260818-1';
}

installMiniupdate();

export const _givingMiniupdate = Object.freeze({
  clearWorkingSessionForDemo,
  hydrateCustodyLanguage,
  installMobileRangeHooks,
  moveDossierActionsToTitle,
  externalizeDossierPickerLabel
});
