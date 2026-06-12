const TD613_HUSH_PHASE39_VERSION = '202605301720';
const TD613_HUSH_OUTBOUND_PACKET_EXPORT_VERSION = '202606121823';
const TD613_HUSH_HOUSEKEEPING_RELAYOUT_VERSION = '202606121846';

const ensureHushPhase39Assets = () => {
  if (!document.querySelector('link[data-td613-hush-phase39="css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./hush-phase39.css?v=${TD613_HUSH_PHASE39_VERSION}`;
    link.dataset.td613HushPhase39 = 'css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[data-td613-hush-phase39="ui"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `./hush-phase39-ui.js?v=${TD613_HUSH_PHASE39_VERSION}`;
    script.dataset.td613HushPhase39 = 'ui';
    document.body.appendChild(script);
  }
  if (!document.querySelector('script[data-td613-hush-outbound-packet-export="ui"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `./hush-outbound-packet-export.js?v=${TD613_HUSH_OUTBOUND_PACKET_EXPORT_VERSION}`;
    script.dataset.td613HushOutboundPacketExport = 'ui';
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
  panel.setAttribute('aria-label', 'Private text custody controls');

  const kicker = panel.querySelector('.hush-housekeeping-kicker');
  const title = panel.querySelector('.hush-housekeeping-title');
  const copy = panel.querySelector('.hush-housekeeping-copy');
  const details = panel.querySelector('.hush-housekeeping-details summary');
  if (kicker) kicker.textContent = 'Private text';
  if (title) title.textContent = 'Custody';
  if (copy) copy.textContent = 'Receipts only; private passages stay out.';
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

  if (panel.parentNode !== outputCard.parentNode || panel.previousElementSibling !== outputCard) {
    outputCard.insertAdjacentElement('afterend', panel);
  }
  return panel.previousElementSibling === outputCard;
};

function bindRelayout() {
  ensureHushPhase39Assets();
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
window.__TD613_HUSH_HOUSEKEEPING_RELAYOUT__ = { version: TD613_HUSH_HOUSEKEEPING_RELAYOUT_VERSION, relocateHushCustodyPanel, ensureHushPhase39Assets, orderCustodySecondaryActions };
