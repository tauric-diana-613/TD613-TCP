const $ = (selector) => document.querySelector(selector);

const PRACTICE_ACTIVE_ATTR = 'givingPractice';
let closeAfterPracticeExit = false;
let bypassCloseIntercept = false;

function practiceActive() {
  return document.documentElement.dataset[PRACTICE_ACTIVE_ATTR] === 'true';
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
}

function scrollViewToTop(viewId) {
  const view = document.getElementById(viewId);
  if (!view) return;
  requestAnimationFrame(() => {
    const top = Math.max(0, view.getBoundingClientRect().top + window.scrollY - 82);
    window.scrollTo({ top, left: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
}

function activateView(viewName) {
  document.querySelector(`.tab[data-view="${viewName}"]`)?.click();
  scrollViewToTop(`view-${viewName}`);
}

function installBrandHomeLink() {
  const mark = $('.masthead .brand-mark');
  if (!mark) return;
  if (mark instanceof HTMLAnchorElement) {
    mark.href = 'https://td613.com/';
    mark.removeAttribute('target');
    mark.removeAttribute('aria-hidden');
    mark.setAttribute('aria-label', 'Return to TD613 home');
    mark.title = 'TD613 home';
    return;
  }

  const link = document.createElement('a');
  link.className = mark.className;
  link.href = 'https://td613.com/';
  link.textContent = mark.textContent || '𝌋';
  link.setAttribute('aria-label', 'Return to TD613 home');
  link.title = 'TD613 home';
  mark.replaceWith(link);
}

function installMobileRangeHooks() {
  $('#dateFrom')?.closest('.split-fields')?.classList.add('giving-date-range-filter');
  $('#amountMin')?.closest('.split-fields')?.classList.add('giving-amount-range-filter');
}

function moveContactQueueAfterSearchActions() {
  const form = $('#searchForm');
  const panel = $('#contactQueuePanel');
  const run = $('#runSearchButton');
  const actionRow = run?.closest('.button-row');
  if (!form || !panel || !actionRow || panel.dataset.postSourceOrder === 'true') return;
  actionRow.insertAdjacentElement('afterend', panel);
  panel.dataset.postSourceOrder = 'true';
  panel.setAttribute('aria-label', 'Optional batch contact queue after source selection and primary search controls');
}

function moveDossierActionsToTitle() {
  const titleInput = $('#dossierTitle');
  let field = titleInput?.closest('.field');
  const actions = $('.dossier-control .dossier-actions');
  let label = field?.querySelector(':scope > span');
  if (!field || !actions || !label || field.querySelector('.research-file-title-row')) return;

  // New/Save are interactive controls, so do not leave them nested inside the
  // legacy <label> that wraps the title input. Preserve the visible label through
  // aria-labelledby while changing only this one field wrapper to a neutral div.
  if (field.tagName === 'LABEL') {
    const replacement = document.createElement('div');
    replacement.className = field.className;
    while (field.firstChild) replacement.append(field.firstChild);
    field.replaceWith(replacement);
    field = replacement;
    label = field.querySelector(':scope > span');
  }
  if (!label) return;
  label.id = label.id || 'dossierTitleVisibleLabel';
  titleInput.setAttribute('aria-labelledby', label.id);

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
      'New starts a fresh research context and returns you to Search. Save preserves this current file and leaves you here. Open selected file restores that file and returns you to Search.',
      '',
      'Vault creates or updates an encrypted hosted copy only when you explicitly choose that route.'
    ].join('\n');
    fileHelp.dataset.pedagogueHydrated = 'true';
  }
}

function installDossierActionPedagogy() {
  const panel = $('.dossier-control');
  const open = $('#openDossierButton');
  const newButton = $('#newDossierButton');
  const save = $('#saveDossierButton');
  if (!panel || !open || !newButton || !save) return;

  newButton.setAttribute('aria-label', 'New research file; clear the active working context and return to Search');
  save.setAttribute('aria-label', 'Save this research file; remain in the current Giving view');
  open.setAttribute('aria-label', 'Open the selected saved local research file and return to Search');

  if (!$('#dossierActionRouteHint')) {
    const hint = document.createElement('p');
    hint.id = 'dossierActionRouteHint';
    hint.className = 'dossier-action-route-hint';
    hint.innerHTML = '<strong>New</strong> → fresh Search · <strong>Save</strong> → stay here · <strong>Open</strong> → restore file + Search';
    open.insertAdjacentElement('beforebegin', hint);
  }

  if (panel.dataset.actionNavigationBound === 'true') return;
  panel.dataset.actionNavigationBound = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target?.closest?.('#newDossierButton, #openDossierButton');
    if (!target || !panel.contains(target)) return;

    if (target.id === 'newDossierButton') {
      queueMicrotask(() => activateView('search'));
      return;
    }

    const stack = $('#toastStack');
    if (!stack) return;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      activateView('search');
    };
    const observeOpenedFile = () => {
      const opened = [...stack.children].some((node) => /Dossier opened from local custody\./i.test(node.textContent || ''));
      if (opened) finish();
    };
    const observer = new MutationObserver(observeOpenedFile);
    observer.observe(stack, { childList: true, subtree: true });
    const timer = setTimeout(() => observer.disconnect(), 5000);
    queueMicrotask(observeOpenedFile);
  }, true);
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
  const workspace = $('#committeeSearchWorkspaceList');
  if (workspace) workspace.innerHTML = '<span class="muted">No campaign or committee identities were observed in the loaded search.</span>';
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

function installCampaignLookupScroll() {
  document.addEventListener('submit', (event) => {
    if (event.target?.id !== 'campaignDirectoryForm') return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const ledger = $('#view-ledger');
      if (ledger && !ledger.hidden) scrollViewToTop('view-ledger');
    }));
  }, true);
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

function normalizeContributionCardAddresses() {
  const list = $('#recordList');
  if (!list) return;
  for (const small of list.querySelectorAll('.record-person > small')) {
    if (small.dataset.addressNormalized === 'true') continue;
    const parts = String(small.textContent || '')
      .split(/\s+·\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length < 2) continue;

    let street = parts[0];
    let locality = parts.slice(1).join(', ');
    if (parts.length >= 4) {
      const zip = parts.at(-1);
      const state = parts.at(-2);
      const city = parts.at(-3);
      street = parts.slice(0, -3).join(' · ');
      locality = `${city}, ${state} ${zip}`.trim();
    } else if (parts.length === 3) {
      locality = `${parts[1]}, ${parts[2]}`;
    }

    const streetLine = document.createElement('span');
    streetLine.className = 'record-address-line1';
    streetLine.textContent = street;
    const localityLine = document.createElement('span');
    localityLine.className = 'record-address-locality';
    localityLine.textContent = locality;
    small.replaceChildren(streetLine, localityLine);
    small.classList.add('record-address-normalized');
    small.dataset.addressNormalized = 'true';
  }
}

function installContributionAddressObserver() {
  const list = $('#recordList');
  if (!list) return;
  new MutationObserver(() => queueMicrotask(normalizeContributionCardAddresses))
    .observe(list, { childList: true, subtree: true });
  normalizeContributionCardAddresses();
}

function installMiniupdate() {
  installBrandHomeLink();
  installMobileRangeHooks();
  moveContactQueueAfterSearchActions();
  moveDossierActionsToTitle();
  externalizeDossierPickerLabel('custodyMode');
  externalizeDossierPickerLabel('localDossierSelect');
  hydrateCustodyLanguage();
  installDossierActionPedagogy();
  renameAndMarkDemoButton();
  installDemoLoadConfirmation();
  installCloseSessionPracticeExit();
  installCampaignLookupScroll();
  installFecPartialObserver();
  installContributionAddressObserver();
  document.documentElement.dataset.givingMiniupdate = '20260818-4';
}

installMiniupdate();

export const _givingMiniupdate = Object.freeze({
  activateView,
  clearWorkingSessionForDemo,
  hydrateCustodyLanguage,
  installBrandHomeLink,
  installMobileRangeHooks,
  moveContactQueueAfterSearchActions,
  moveDossierActionsToTitle,
  normalizeContributionCardAddresses,
  externalizeDossierPickerLabel
});