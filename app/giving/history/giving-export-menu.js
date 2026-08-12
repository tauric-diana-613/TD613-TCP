const xlsxButton = document.querySelector('#exportSpreadsheetButton');
const csvButton = document.querySelector('#exportCsvButton');

if (xlsxButton && csvButton && !document.querySelector('#exportMenu')) {
  const parent = xlsxButton.parentElement;
  const details = document.createElement('details');
  details.id = 'exportMenu';
  details.className = 'export-menu';

  const summary = document.createElement('summary');
  summary.id = 'exportMenuButton';
  summary.className = 'button';
  summary.textContent = 'Export';
  summary.setAttribute('aria-label', 'Export spreadsheet');

  const menu = document.createElement('div');
  menu.className = 'export-menu-popover';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Spreadsheet export formats');

  xlsxButton.textContent = 'Excel (.xlsx)';
  csvButton.textContent = 'CSV (.csv)';
  xlsxButton.className = 'export-format-option';
  csvButton.className = 'export-format-option';
  xlsxButton.setAttribute('role', 'menuitem');
  csvButton.setAttribute('role', 'menuitem');

  parent.insertBefore(details, xlsxButton);
  details.append(summary, menu);
  menu.append(xlsxButton, csvButton);

  for (const button of [xlsxButton, csvButton]) {
    button.addEventListener('click', () => queueMicrotask(() => details.removeAttribute('open')));
  }

  document.addEventListener('click', (event) => {
    if (details.open && !details.contains(event.target)) details.removeAttribute('open');
  });

  const style = document.createElement('style');
  style.id = 'givingExportMenuStyle';
  style.textContent = `
    .export-menu { position: relative; z-index: 8; }
    .export-menu > summary { list-style: none; display: inline-flex; align-items: center; gap: 7px; user-select: none; }
    .export-menu > summary::-webkit-details-marker { display: none; }
    .export-menu > summary::after { content: '▾'; font-size: 9px; opacity: .75; }
    .export-menu[open] > summary::after { content: '▴'; }
    .export-menu-popover {
      position: absolute; top: calc(100% + 5px); right: 0; display: grid; min-width: 158px;
      padding: 5px; border: 1px solid rgba(200, 235, 213, .2); background: rgba(3, 18, 14, .99);
      box-shadow: 0 15px 34px rgba(0, 0, 0, .38);
    }
    .export-format-option {
      width: 100%; min-height: 32px; padding: 7px 9px; border: 0; cursor: pointer;
      color: var(--text); background: transparent; font: 700 9px/1.2 var(--mono); text-align: left;
    }
    .export-format-option:hover, .export-format-option:focus-visible {
      color: var(--bright); background: rgba(118, 234, 212, .07); outline: none;
    }
    @media (max-width: 760px) {
      .export-menu-popover { position: fixed; top: auto; right: 12px; bottom: 62px; left: 12px; min-width: 0; }
    }
  `;
  document.head.append(style);
}
