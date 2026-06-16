const TD613_HUSH_CUSTODY_EXPORT_WAKE_VERSION = '202606171506';
const TD613_HUSH_HOUSEKEEPING_RELAYOUT_VERSION = '202606171506';

const ensureHousekeepingExportAssets = () => {
  if (!document.querySelector('script[data-td613-hush-custody-export-wake="ui"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `./hush-custody-export-wake.js?v=${TD613_HUSH_CUSTODY_EXPORT_WAKE_VERSION}`;
    script.dataset.td613HushCustodyExportWake = 'ui';
    document.body.appendChild(script);
  }
};

const outputCardAnchor = () =>
  document.getElementById('protectedOutputInput')?.closest('.hush-output-card') ||
  document.getElementById('protectedOutputHeading')?.closest('.hush-output-card') ||
  document.querySelector('.hush-output-card');

const ensureProviderLogButton = (row) => {
  if (!row) return null;
  let button = document.getElementById('hushExportProviderLogBtn');
  if (!button) {
    button = document.createElement('button');
    button.id = 'hushExportProviderLogBtn';
    button.type = 'button';
    button.className = 'hush-export-provider-log-btn';
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Export provider log';
  }
  return button;
};

const orderCustodySecondaryActions = (panel) => {
  const row = panel?.querySelector('.hush-housekeeping-secondary-actions');
  if (!row) return;
  const packet = document.getElementById('hushExportPacketBtn');
  const provider = ensureProviderLogButton(row);
  const anatomy = panel.querySelector('.hush-housekeeping-details');
  for (const node of [packet, provider, anatomy].filter(Boolean)) row.appendChild(node);
};

const relocateHushCustodyPanel = () => {
  const panel = document.getElementById('hushHousekeepingPanel');
  const outputCard = outputCardAnchor();
  if (!panel || !outputCard || !outputCard.parentNode) return false;

  panel.classList.add('hush-housekeeping-compact');
  panel.dataset.hushCustodyLocation = 'below-output-chamber';
  panel.setAttribute('aria-label', 'Custody controls');

  const kicker = panel.querySelector('.hush-housekeeping-kicker');
  const title = panel.querySelector('.hush-housekeeping-title');
  const copy = panel.querySelector('.hush-housekeeping-copy');
  const details = panel.querySelector('.hush-housekeeping-details summary');
  if (kicker) kicker.textContent = 'Custody';
  if (title) title.textContent = 'Custody';
  if (copy) copy.textContent = 'Receipts stay clean; packets and logs are diagnostic.';
  if (details) details.textContent = 'Mask anatomy';

  const labels = {
    hushClearSamplesBtn: 'Clear samples',
    hushClearCustomMaskBtn: 'Clear mask',
    hushExportCleanReceiptBtn: 'Export receipt',
    hushCopyCleanReceiptBtn: 'Copy receipt',
    hushExportPacketBtn: 'Export packet',
    hushExportProviderLogBtn: 'Export provider log'
  };
  for (const [id, label] of Object.entries(labels)) {
    const button = document.getElementById(id);
    if (button) button.textContent = label;
  }

  orderCustodySecondaryActions(panel);
  window.__TD613_HUSH_CUSTODY_EXPORT_WAKE__?.updateButtons?.();

  if (panel.parentNode !== outputCard.parentNode || panel.previousElementSibling !== outputCard) {
    outputCard.insertAdjacentElement('afterend', panel);
  }
  return panel.previousElementSibling === outputCard;
};

function bindRelayout() {
  ensureHousekeepingExportAssets();
  let tries = 0;
  const tick = () => {
    tries += 1;
    const moved = relocateHushCustodyPanel();
    if (!moved && tries < 120) window.setTimeout(tick, 100);
  };
  tick();
  window.addEventListener('load', () => window.setTimeout(relocateHushCustodyPanel, 160));
  window.addEventListener('td613:hush:patch38-result', () => window.setTimeout(relocateHushCustodyPanel, 80));
  window.addEventListener('td613:hush:outbound-packet', () => window.setTimeout(relocateHushCustodyPanel, 80));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindRelayout, { once: true });
else bindRelayout();
window.__TD613_HUSH_HOUSEKEEPING_RELAYOUT__ = { version: TD613_HUSH_HOUSEKEEPING_RELAYOUT_VERSION, relocateHushCustodyPanel, ensureHousekeepingExportAssets, orderCustodySecondaryActions };
