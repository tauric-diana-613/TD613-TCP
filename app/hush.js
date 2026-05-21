import { buildHushReadinessDashboard, summarizeHushReadinessDashboard } from './engine/hush-readiness-dashboard.js';
import { buildHushProductState } from './engine/hush-product-state.js';

function pill(label, status) {
  return `<article class="dashboard-pill ${status || 'gray'}"><strong>${label}</strong><span>${status || 'gray'}</span></article>`;
}

function renderDashboard() {
  const dashboard = buildHushReadinessDashboard({ exportReady: false, operatorReady: false });
  const state = buildHushProductState({ dashboard });
  const target = document.getElementById('hushDashboardSummary');
  const notice = document.getElementById('hushDashboardNotice');
  if (!target) return;
  const summary = summarizeHushReadinessDashboard(state.dashboard);
  target.innerHTML = Object.values(state.dashboard.surfaces || {}).map((surface) => pill(surface.name, surface.status)).join('');
  if (notice) notice.textContent = `Surfaces: ${summary.surfaceCount}. Blockers: ${summary.blockers.length}. Warnings: ${summary.warnings.length}.`;
  window.__TD613_HUSH_PRODUCT_STATE__ = state;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboard);
  else renderDashboard();
}

export { renderDashboard };
