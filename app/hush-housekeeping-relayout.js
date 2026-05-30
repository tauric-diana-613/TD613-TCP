const relocateHushCustodyPanel = () => {
  const panel = document.getElementById('hushHousekeepingPanel');
  const outputCard = document.getElementById('protectedOutputHeading')?.closest('.hush-output-card') || document.getElementById('protectedOutputInput')?.closest('section');
  if (!panel || !outputCard || !outputCard.parentNode) return false;
  panel.classList.add('hush-housekeeping-compact');
  if (panel.previousElementSibling === outputCard) return true;
  outputCard.parentNode.insertBefore(panel, outputCard.nextSibling);
  return true;
};

function bindRelayout() {
  let tries = 0;
  const tick = () => {
    tries += 1;
    const moved = relocateHushCustodyPanel();
    if (!moved && tries < 20) window.setTimeout(tick, 100);
  };
  tick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindRelayout);
else bindRelayout();
window.addEventListener('load', () => window.setTimeout(relocateHushCustodyPanel, 160));
window.__TD613_HUSH_HOUSEKEEPING_RELAYOUT__ = { relocateHushCustodyPanel };
