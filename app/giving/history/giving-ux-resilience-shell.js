const $ = (selector) => document.querySelector(selector);

function emitInput(element) {
  element?.dispatchEvent(new Event('input', { bubbles: true }));
}

function installCoverageNote() {
  const chip = $('#dateCoverageChip');
  if (!chip || $('#dateCoverageNote')) return;
  chip.textContent = chip.textContent.replace(/bounded\.?$/, 'bounded.*');
  const note = document.createElement('p');
  note.id = 'dateCoverageNote';
  note.className = 'coverage-scope-note';
  note.textContent = '* Each custodian receipt—not the requested year—defines the searchable coverage actually returned.';
  chip.insertAdjacentElement('afterend', note);
}

function installCampaignLookupShell() {
  const form = $('#campaignDirectoryForm');
  if (!form || form.querySelector('.campaign-scope-block')) return;
  const queryField = $('#campaignDirectoryQuery')?.closest('.field');
  const oldGrid = form.querySelector('.campaign-directory-scope-grid');
  const searchButton = $('#campaignDirectorySearchButton');
  if (!queryField || !oldGrid || !searchButton) return;

  const scope = document.createElement('div');
  scope.className = 'campaign-scope-block';
  scope.id = 'campaignDirectoryJurisdiction';
  scope.setAttribute('role', 'group');
  scope.setAttribute('aria-label', 'Campaign filing jurisdictions');
  scope.innerHTML = `
    <span class="campaign-scope-label">Jurisdiction</span>
    <div class="campaign-chip-row">
      <label class="campaign-chip"><input type="checkbox" name="campaign-directory-jurisdiction" value="FEDERAL" checked><span>Federal</span></label>
      <label class="campaign-chip"><input type="checkbox" name="campaign-directory-jurisdiction" value="STATE"><span>State</span></label>
      <label class="campaign-chip"><input type="checkbox" name="campaign-directory-jurisdiction" value="MUNICIPAL"><span>Municipal</span></label>
    </div>`;

  const pickers = document.createElement('div');
  pickers.className = 'campaign-pickers';
  pickers.innerHTML = `
    <details class="giving-state-filter campaign-state-picker" id="campaignDirectoryState">
      <summary><span>State</span><strong id="campaignDirectoryStateCount">FL</strong></summary>
      <div class="campaign-picker-menu">
        <div class="campaign-picker-actions"><button class="text-button" id="campaignDirectoryStateAll" type="button">All</button><button class="text-button" id="campaignDirectoryStateClear" type="button">Clear</button></div>
        <div class="giving-state-filter-menu" id="campaignDirectoryStateMenu" role="group" aria-label="Campaign lookup states"></div>
      </div>
    </details>
    <details class="giving-state-filter campaign-local-picker" id="campaignDirectoryMunicipal">
      <summary><span>Municipal</span><strong id="campaignDirectoryMunicipalCount" hidden></strong></summary>
      <div class="campaign-picker-menu">
        <div class="campaign-picker-actions"><button class="text-button" id="campaignDirectoryMunicipalAll" type="button">All</button><button class="text-button" id="campaignDirectoryMunicipalClear" type="button">Clear</button></div>
        <div class="giving-state-filter-menu" id="campaignDirectoryMunicipalMenu" role="group" aria-label="Municipal filing custodians"></div>
      </div>
    </details>`;

  const ledger = document.createElement('fieldset');
  ledger.className = 'campaign-segmented-control';
  ledger.id = 'campaignDirectoryActivity';
  ledger.innerHTML = `
    <legend>Ledger lane</legend>
    <div class="campaign-segmented-row">
      <label><input type="radio" name="campaign-directory-activity" value="CONTRIBUTIONS" checked><span>Contributions</span></label>
      <label><input type="radio" name="campaign-directory-activity" value="EXPENDITURES"><span>Expenditures</span></label>
    </div>`;

  oldGrid.replaceWith(scope, pickers, ledger);
  const note = $('#campaignDirectoryPanel .fine-print');
  if (note) note.textContent = 'Only selected filing lanes and custodians run. Each route keeps its own completion/hold receipt. Expenditure receipts remain separate campaign activity and never enter donor Giving History. OpenSecrets remains aggregate organization context only.';
}

function normalizeDefaultResearchTitle() {
  const title = $('#dossierTitle');
  if (!title || !/^Giving history \d{4}-\d{2}-\d{2}$/.test(title.value.trim())) return;
  title.value = 'Untitled contributor research';
  emitInput(title);
}

function normalizeLocalFileOptions() {
  const select = $('#localDossierSelect');
  if (!select) return;
  for (const option of select.options) {
    const current = option.textContent;
    const normalized = current.replace(/^Giving history \d{4}-\d{2}-\d{2}(?=\s*·)/, 'Untitled contributor research');
    if (normalized !== current) option.textContent = normalized;
  }
}

function scrollViewToTop(viewId) {
  const view = document.getElementById(viewId);
  if (!view) return;
  requestAnimationFrame(() => {
    const top = Math.max(0, view.getBoundingClientRect().top + window.scrollY - 82);
    window.scrollTo({ top, left: 0, behavior: 'smooth' });
  });
}

function installResearchFileGuide() {
  const panel = $('.dossier-control');
  const heading = panel?.querySelector('.panel-heading');
  if (!panel || !heading || $('#researchFileGuide')) return;

  const guide = document.createElement('section');
  guide.id = 'researchFileGuide';
  guide.className = 'research-file-guide';
  guide.setAttribute('aria-label', 'How the contributor research file works');
  guide.innerHTML = `
    <p class="research-file-purpose"><strong>One contributor research file = one investigation.</strong> It keeps search settings, retrieved public records, your identity decisions, receipts, and custody state together. Saving the file never runs another search.</p>
    <div class="research-file-route" aria-label="Contributor research file route">
      <span><b>1</b> Search + review</span>
      <span><b>2</b> Save the working file</span>
      <button class="research-file-vault-link" id="researchFileVaultButton" type="button"><b>3</b> Encrypt a Vault copy →</button>
    </div>
    <p class="research-file-storage"><strong>Local</strong> stays in this browser. <strong>Hosted</strong> stores only browser-encrypted ciphertext. <strong>Hybrid</strong> keeps the local working file plus an encrypted hosted branch.</p>
    <div class="research-file-sample">
      <button class="text-button" id="loadResearchSampleButton" type="button">Load fictional sample</button>
      <small>SAMPLE only · loads a manifestly fictional practice case. SEARCH is a separate gesture and never contacts a real custodian while the demo is active.</small>
    </div>
    <p class="research-file-sample-status" id="researchFileSampleStatus" role="status" hidden></p>`;
  heading.insertAdjacentElement('afterend', guide);

  $('#researchFileVaultButton')?.addEventListener('click', () => {
    document.querySelector('.tab[data-view="vault"]')?.click();
    scrollViewToTop('view-vault');
  });

  $('#loadResearchSampleButton')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('td613:giving-practice-load-request'));
  });
}

function installResearchFileLanguage() {
  const panel = $('.dossier-control');
  if (!panel) return;
  for (const label of panel.querySelectorAll('.field > span')) {
    if (label.textContent.trim() === 'Dossier title') label.textContent = 'Research file title';
    if (label.textContent.trim() === 'Local dossiers') label.textContent = 'Saved local files';
  }
  const open = $('#openDossierButton');
  if (open) open.textContent = 'Open selected file';
  const fine = panel.querySelector('.fine-print');
  if (fine) fine.textContent = 'Local keeps the working file in this browser. Hosted stores only browser-encrypted ciphertext. Hybrid keeps both. Use Vault when you want an encrypted hosted branch.';

  const select = $('#localDossierSelect');
  if (select && !$('#localDossierHint')) {
    const hint = document.createElement('p');
    hint.id = 'localDossierHint';
    hint.className = 'research-file-local-hint';
    hint.textContent = 'A fresh LOCAL working file is an empty research container. In the fictional practice case, SEARCH fills the practice review; Save is the explicit gesture that makes it appear here.';
    select.insertAdjacentElement('afterend', hint);
    const observer = new MutationObserver(normalizeLocalFileOptions);
    observer.observe(select, { childList: true, subtree: true });
    normalizeLocalFileOptions();
  }

  const newButton = $('#newDossierButton');
  if (newButton && newButton.dataset.researchTitleBound !== 'true') {
    newButton.dataset.researchTitleBound = 'true';
    newButton.addEventListener('click', () => setTimeout(() => {
      normalizeDefaultResearchTitle();
      normalizeLocalFileOptions();
    }, 0));
  }
  window.addEventListener('load', () => {
    normalizeDefaultResearchTitle();
    normalizeLocalFileOptions();
  }, { once: true });
}

function installSingleColumnPicker(selectId, fallbackLabel) {
  const select = document.getElementById(selectId);
  if (!select || document.querySelector(`[data-dossier-picker-for="${selectId}"]`)) return;
  const wrapper = select.closest('.field');
  if (!wrapper) return;
  if (wrapper.tagName === 'LABEL') {
    const replacement = document.createElement('div');
    replacement.className = wrapper.className;
    replacement.id = wrapper.id;
    while (wrapper.firstChild) replacement.appendChild(wrapper.firstChild);
    wrapper.replaceWith(replacement);
  }
  const field = select.closest('.field');
  const originalLabel = field?.querySelector(':scope > span');
  const labelText = originalLabel?.textContent?.trim() || fallbackLabel;
  originalLabel?.remove();
  select.classList.add('dossier-picker-native');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  const picker = document.createElement('details');
  picker.className = 'giving-state-filter dossier-single-picker';
  picker.dataset.dossierPickerFor = selectId;
  picker.innerHTML = `<summary><span>${labelText}</span><strong></strong></summary><div class="giving-state-filter-menu dossier-single-picker-menu" role="listbox"></div>`;
  select.insertAdjacentElement('afterend', picker);
  const summary = picker.querySelector('summary strong');
  const menu = picker.querySelector('.dossier-single-picker-menu');

  const render = () => {
    const options = [...select.options];
    const selected = options.find((option) => option.value === select.value) || options[0];
    summary.textContent = selected?.textContent || fallbackLabel;
    summary.title = selected?.textContent || '';
    menu.replaceChildren(...options.map((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dossier-picker-option';
      button.dataset.value = option.value;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(option.value === select.value));
      button.innerHTML = `<span>${option.textContent}</span>${option.value === select.value ? '<small>selected</small>' : ''}`;
      button.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        picker.open = false;
        render();
      });
      return button;
    }));
  };
  new MutationObserver(render).observe(select, { childList: true, subtree: true });
  select.addEventListener('change', render);
  render();
}

function installDossierPickers() {
  installSingleColumnPicker('custodyMode', 'Custody mode');
  installSingleColumnPicker('localDossierSelect', 'Saved local files');
}

function installVaultLanguage() {
  const panel = $('#view-vault .vault-grid .inner-panel');
  if (!panel) return;
  const heading = panel.querySelector('h3');
  const copy = panel.querySelector('p');
  const label = $('#vaultPassphrase')?.closest('.field')?.querySelector('span');
  const sync = $('#syncVaultButton');
  if (heading) heading.textContent = 'Create or enter Vault passphrase';
  if (copy) copy.textContent = 'First encrypted save: choose a passphrase here. Opening an existing hosted version: enter the same passphrase used for that version. TD613 never receives, stores, or recovers it.';
  if (label) label.textContent = 'Vault passphrase · 12+ characters';
  if (sync) sync.textContent = 'Encrypt & save with this passphrase';
}

function installCommitteeToolbar() {
  const view = $('#view-ledger');
  const head = view?.querySelector('.section-head');
  const oldRow = head?.querySelector('.button-row');
  if (!head || !oldRow || oldRow.classList.contains('committee-ledger-toolbar')) return;

  const byId = (id) => document.getElementById(id);
  const hold = byId('holdCommitteeButton');
  const clear = byId('clearCommitteeListButton');
  const date = byId('ledgerDateSortButton');
  const cd = byId('exportCampaignDeputyBundleButton');
  const reviewed = byId('exportReviewedSummaryButton');
  const spreadsheet = byId('exportSpreadsheetButton');
  const csv = byId('exportCsvButton');
  const encrypted = byId('exportEncryptedButton');
  if (![hold, clear, date, cd, reviewed, spreadsheet, csv, encrypted].every(Boolean)) return;

  const toolbar = document.createElement('div');
  toolbar.className = 'committee-ledger-toolbar';
  const listGroup = document.createElement('div');
  listGroup.className = 'committee-toolbar-group committee-toolbar-list';
  listGroup.dataset.label = 'List';
  listGroup.append(hold, clear);
  const viewGroup = document.createElement('div');
  viewGroup.className = 'committee-toolbar-group committee-toolbar-view';
  viewGroup.dataset.label = 'View';
  viewGroup.append(date);
  const exportGroup = document.createElement('div');
  exportGroup.className = 'committee-toolbar-group committee-toolbar-export';
  exportGroup.dataset.label = 'Export';
  cd.textContent = 'CD import .zip';
  reviewed.textContent = 'Reviewed .csv';
  exportGroup.append(cd, reviewed);
  const forensic = document.createElement('details');
  forensic.className = 'committee-forensic-menu';
  const summary = document.createElement('summary');
  summary.className = 'button';
  summary.textContent = 'Forensic ▾';
  const menu = document.createElement('div');
  menu.className = 'committee-forensic-menu-items';
  spreadsheet.textContent = 'Spreadsheet';
  csv.textContent = 'CSV';
  encrypted.textContent = 'Encrypted JSON';
  menu.append(spreadsheet, csv, encrypted);
  forensic.append(summary, menu);
  exportGroup.append(forensic);
  toolbar.append(listGroup, viewGroup, exportGroup);
  oldRow.replaceWith(toolbar);
}

function installVaultGuide() {
  const grid = $('#view-vault .vault-grid');
  if (!grid || $('#vaultGuide')) return;
  const guide = document.createElement('section');
  guide.id = 'vaultGuide';
  guide.className = 'vault-guide';
  guide.setAttribute('aria-label', 'How the Vault works');
  guide.innerHTML = `
    <p class="vault-case-metaphor">Think of the Vault as a locked field case: TD613 can shelve the case and track its versions, but only your passphrase opens what is inside.</p>
    <div class="vault-beats">
      <div><span>1</span><strong>Choose the key</strong><small>For a new encrypted branch, create a passphrase here. For an existing branch, reuse the passphrase that originally locked it.</small></div>
      <div><span>2</span><strong>Store the sealed copy</strong><small>Your browser encrypts first. TD613 receives ciphertext, version metadata, digests, and ancestry—not the readable research file. In the fictional practice case the same browser encryption runs, while the hosted write is replaced by a reversible in-memory practice shelf.</small></div>
      <div><span>3</span><strong>Unlock here</strong><small>The passphrase stays in browser memory for the operation and cannot be recovered by TD613.</small></div>
    </div>`;
  grid.insertAdjacentElement('beforebegin', guide);
}

function installMatchLanguage() {
  const candidateLegend = $('#view-review .legend [data-state="CANDIDATE"]');
  if (candidateLegend) candidateLegend.textContent = 'match';
  const candidateOption = $('#reviewFilter option[value="CANDIDATE"]');
  if (candidateOption) candidateOption.textContent = 'Match';
  const cluster = $('#clusterNotice');
  if (cluster && /candidate clusters/i.test(cluster.textContent)) cluster.textContent = cluster.textContent.replace(/candidate clusters/ig, 'match clusters');
}

function installReadinessFocusState() {
  const root = document.documentElement;
  if (root.dataset.readinessFocusDelegated === 'true') return;
  root.dataset.readinessFocusDelegated = 'true';

  const controlFor = (target) => target?.closest?.('#readinessButton')?.closest('.readiness-control') || null;
  document.addEventListener('focusin', (event) => {
    const control = controlFor(event.target);
    if (control) control.dataset.focusOpen = 'true';
  });
  document.addEventListener('focusout', (event) => {
    const control = controlFor(event.target);
    if (!control) return;
    if (event.relatedTarget && control.contains(event.relatedTarget)) return;
    delete control.dataset.focusOpen;
  });

  const button = $('#readinessButton');
  const control = button?.closest('.readiness-control');
  if (button && control && document.activeElement === button) control.dataset.focusOpen = 'true';
}

installCoverageNote();
installCampaignLookupShell();
installResearchFileGuide();
installResearchFileLanguage();
installDossierPickers();
installVaultLanguage();
installCommitteeToolbar();
installVaultGuide();
installMatchLanguage();
installReadinessFocusState();
