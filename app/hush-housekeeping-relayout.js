const relocateHushCustodyPanel = () => {
  const panel = document.getElementById('hushHousekeepingPanel');
  const outputCard = document.getElementById('protectedOutputHeading')?.closest('.hush-output-card') || document.getElementById('protectedOutputInput')?.closest('section');
  if (!panel || !outputCard || !outputCard.parentNode) return false;

  panel.classList.add('hush-housekeeping-compact');
  panel.setAttribute('aria-label', 'Compact private text custody controls');

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
    hushCopyCleanReceiptBtn: 'Copy receipt'
  };
  for (const [id, label] of Object.entries(labels)) {
    const button = document.getElementById(id);
    if (button) button.textContent = label;
  }

  if (panel.previousElementSibling === outputCard) return true;
  outputCard.parentNode.insertBefore(panel, outputCard.nextSibling);
  return true;
};

function bindRelayout() {
  let tries = 0;
  const tick = () => {
    tries += 1;
    relocateHushCustodyPanel();
    if (tries < 80) window.setTimeout(tick, 75);
  };
  tick();

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(relocateHushCustodyPanel);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindRelayout);
else bindRelayout();
window.addEventListener('load', () => window.setTimeout(relocateHushCustodyPanel, 160));
window.__TD613_HUSH_HOUSEKEEPING_RELAYOUT__ = { relocateHushCustodyPanel };
