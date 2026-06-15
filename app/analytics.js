// Vercel Web Analytics initialization
window.va = window.va || function(...params) {
  (window.vaq = window.vaq || []).push(params);
};

(function repairSealSpacingPanel() {
  const path = window.location.pathname + window.location.search + window.location.hash;
  const isFlight = path.includes('/safe-harbor/td613-flight.html') || /TD613 Flight/i.test(document.title || '');
  if (!isFlight) return;

  function installStyle() {
    if (document.getElementById('td613SealSpacingPanelRepair')) return;
    const style = document.createElement('style');
    style.id = 'td613SealSpacingPanelRepair';
    style.textContent = `
      html body .seal-card .section-split-row.seal-spacing-grid {
        display: grid !important;
        grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr) !important;
        grid-template-areas: "target zwnj" !important;
        gap: .46rem !important;
        align-items: stretch !important;
        width: 100% !important;
      }
      html body .seal-card .section-split-row.seal-spacing-grid > .seal-target-panel {
        grid-area: target !important;
        min-width: 0 !important;
        width: auto !important;
        max-width: none !important;
        margin-top: 0 !important;
        transform: none !important;
      }
      html body .seal-card .section-split-row.seal-spacing-grid > .seal-zwnj-panel {
        grid-area: zwnj !important;
        min-width: 0 !important;
        width: auto !important;
        max-width: none !important;
        margin-top: 0 !important;
        transform: none !important;
      }
      html body .seal-card .seal-target-panel #sealTargetWord {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
      }
      @media (max-width: 520px) {
        html body .seal-card .section-split-row.seal-spacing-grid {
          grid-template-columns: 1fr !important;
          grid-template-areas: "target" "zwnj" !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    installStyle();
    const grid = document.querySelector('.seal-card .section-split-row.seal-spacing-grid');
    if (!grid) return;
    const target = grid.querySelector('.seal-target-panel') || grid.children[0];
    const zwnj = grid.querySelector('.seal-zwnj-panel') || grid.children[1];
    if (!target || !zwnj) return;

    target.classList.add('seal-target-panel');
    zwnj.classList.add('seal-zwnj-panel');

    const stacked = window.matchMedia && window.matchMedia('(max-width: 520px)').matches;
    grid.style.setProperty('display', 'grid', 'important');
    grid.style.setProperty('grid-template-columns', stacked ? '1fr' : 'minmax(0, .86fr) minmax(0, 1.14fr)', 'important');
    grid.style.setProperty('grid-template-areas', stacked ? '"target" "zwnj"' : '"target zwnj"', 'important');
    grid.style.setProperty('gap', '.46rem', 'important');
    grid.style.setProperty('align-items', 'stretch', 'important');
    grid.style.setProperty('width', '100%', 'important');

    target.style.setProperty('grid-area', 'target', 'important');
    target.style.setProperty('min-width', '0', 'important');
    target.style.setProperty('width', 'auto', 'important');
    target.style.setProperty('max-width', 'none', 'important');
    target.style.setProperty('margin-top', '0', 'important');
    target.style.setProperty('transform', 'none', 'important');

    zwnj.style.setProperty('grid-area', 'zwnj', 'important');
    zwnj.style.setProperty('min-width', '0', 'important');
    zwnj.style.setProperty('width', 'auto', 'important');
    zwnj.style.setProperty('max-width', 'none', 'important');
    zwnj.style.setProperty('margin-top', '0', 'important');
    zwnj.style.setProperty('transform', 'none', 'important');

    const input = grid.querySelector('#sealTargetWord');
    if (input) {
      input.style.setProperty('width', '100%', 'important');
      input.style.setProperty('max-width', '100%', 'important');
      input.style.setProperty('min-width', '0', 'important');
    }
  }

  function schedule() {
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 100);
    setTimeout(apply, 350);
    setTimeout(apply, 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
  window.addEventListener('load', schedule, { passive: true });
  window.addEventListener('pageshow', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
})();

(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();