const $ = (selector) => document.querySelector(selector);

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
  if (!form || $('#campaignDirectoryJurisdiction')) return;
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
  if (!grid || $('#vaultChildLegibleGuide')) return;
  const guide = document.createElement('section');
  guide.id = 'vaultChildLegibleGuide';
  guide.className = 'vault-child-legible-guide';
  guide.setAttribute('aria-label', 'How the Vault works');
  guide.innerHTML = `
    <p class="vault-case-metaphor">Think of the Vault as a locked field case: TD613 can shelve the case and track its versions, but only your passphrase opens what is inside.</p>
    <div class="vault-beats">
      <div><span>1</span><strong>Lock here</strong><small>Your browser encrypts the dossier before anything leaves this page.</small></div>
      <div><span>2</span><strong>Store the sealed copy</strong><small>TD613 receives ciphertext, version metadata, digests, and ancestry—not the readable dossier.</small></div>
      <div><span>3</span><strong>Unlock here</strong><small>Your passphrase stays in browser memory for the operation and cannot be recovered by TD613.</small></div>
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

installCoverageNote();
installCampaignLookupShell();
installCommitteeToolbar();
installVaultGuide();
installMatchLanguage();
