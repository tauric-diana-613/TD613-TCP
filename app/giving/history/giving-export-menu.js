const stylesheetHref = new URL('./giving-export-actions.css?v=20260812-1', import.meta.url).href;
if (!document.querySelector('link[data-giving-export-actions-style]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = stylesheetHref;
  link.setAttribute('data-giving-export-actions-style', 'true');
  document.head.appendChild(link);
}

const xlsxButton = document.querySelector('#exportSpreadsheetButton');
const csvButton = document.querySelector('#exportCsvButton');
const encryptedButton = document.querySelector('#exportEncryptedButton');

const exports = [
  { source: csvButton, label: '.CSV', id: 'reviewExportCsvButton' },
  { source: xlsxButton, label: '.XLSX', id: 'reviewExportXlsxButton' },
  { source: encryptedButton, label: 'Encrypted JSON', id: 'reviewExportEncryptedButton' }
];

if (exports.every(({ source }) => source)) {
  const ledgerCluster = xlsxButton.parentElement;
  ledgerCluster.classList.add('export-action-cluster');

  for (const { source, label } of exports) {
    source.textContent = label;
    source.className = 'export-action-button';
  }

  const reviewHead = document.querySelector('#view-review .section-head');
  if (reviewHead && !document.querySelector('#reviewExportActions')) {
    const reviewCluster = document.createElement('div');
    reviewCluster.id = 'reviewExportActions';
    reviewCluster.className = 'export-action-cluster contributions-export-actions';
    reviewCluster.setAttribute('aria-label', 'Contribution exports');

    for (const { source, label, id } of exports) {
      const button = document.createElement('button');
      button.id = id;
      button.type = 'button';
      button.className = 'export-action-button';
      button.textContent = label;
      button.addEventListener('click', () => source.click());
      reviewCluster.appendChild(button);
    }

    reviewHead.appendChild(reviewCluster);
  }
}