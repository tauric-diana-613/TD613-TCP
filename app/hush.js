import { buildHushReadinessDashboard, summarizeHushReadinessDashboard } from './engine/hush-readiness-dashboard.js';
import { buildHushProductState } from './engine/hush-product-state.js';
import { buildHushEvidenceCockpit, summarizeHushEvidenceCockpit } from './engine/hush-evidence-cockpit.js';
import { listHushMasks } from './engine/hush-mask-studio.js';
import { renderHushPersonaGallery, summarizeHushPersonaGallery } from './hush-persona-gallery.js';

function pill(label, status) {
  return `<article class="dashboard-pill ${status || 'gray'}"><strong>${label}</strong><span>${status || 'gray'}</span></article>`;
}

function row(label, value) {
  return `<div class="cockpit-row"><span>${label}</span><strong>${value ?? 'pending'}</strong></div>`;
}

function lossBar(label, value) {
  const pct = Math.round((Number(value) || 0) * 100);
  return `<div class="loss-row"><div class="loss-label"><span>${label}</span><strong>${pct}%</strong></div><div class="loss-track"><i style="width:${pct}%"></i></div></div>`;
}

function ensureCockpitShell() {
  let cockpit = document.getElementById('hushEvidenceCockpit');
  const dashboard = document.getElementById('hushReadinessDashboard');
  if (cockpit || !dashboard) return cockpit;
  cockpit = document.createElement('section');
  cockpit.id = 'hushEvidenceCockpit';
  cockpit.className = 'hush-product-card cockpit-card';
  cockpit.innerHTML = `
    <div class="card-heading-row"><div><p class="eyebrow">Phase 31</p><h2>Evidence Cockpit</h2></div><div id="hushRouteState" class="route-state">booting</div></div>
    <div class="cockpit-grid">
      <article class="instrument-panel wide"><h3>Signal Bus</h3><div id="hushSignalBus" class="bus-grid"></div></article>
      <article class="instrument-panel"><h3>Narrowing Losses</h3><div id="hushNarrowingLosses" class="loss-stack"></div></article>
      <article class="instrument-panel"><h3>Export Receipt v2</h3><div id="hushExportReceipt" class="readout-stack"></div></article>
      <article class="instrument-panel"><h3>Self-Test</h3><div id="hushSelfTest" class="readout-stack"></div></article>
      <article class="instrument-panel"><h3>Operator Actions</h3><ul id="hushOperatorActions" class="action-list"></ul></article>
    </div>`;
  dashboard.parentNode.insertBefore(cockpit, dashboard);
  return cockpit;
}

function bindPersonaSelection() {
  document.getElementById('hushPersonaGallery')?.addEventListener('click', (event) => {
    const button = event.target?.closest?.('.persona-select');
    if (!button) return;
    const maskId = button.getAttribute('data-mask-id');
    window.__TD613_HUSH_SELECTED_PERSONA__ = maskId;
    button.textContent = 'Selected';
  });
}

async function renderDashboard() {
  const dashboard = buildHushReadinessDashboard({ exportReady: true, operatorReady: true });
  const state = buildHushProductState({ dashboard, currentMode: 'phase-31-visual-system' });
  const cockpit = await buildHushEvidenceCockpit({ reports: { exportReady: true, operatorReady: true }, dashboard, mode: 'phase-31-visual-system', maskId: 'persona-gallery' });
  const gallery = renderHushPersonaGallery(document.getElementById('hushPersonaGallery'), listHushMasks());
  ensureCockpitShell();
  bindPersonaSelection();

  const target = document.getElementById('hushDashboardSummary');
  const notice = document.getElementById('hushDashboardNotice');
  if (target) target.innerHTML = Object.values(state.dashboard.surfaces || {}).map((surface) => pill(surface.name, surface.status)).join('');
  if (notice) {
    const summary = summarizeHushReadinessDashboard(state.dashboard);
    notice.textContent = `Surfaces: ${summary.surfaceCount}. Blockers: ${summary.blockers.length}. Warnings: ${summary.warnings.length}.`;
  }

  const routeState = document.getElementById('hushRouteState');
  if (routeState) routeState.textContent = cockpit.routeState;
  const bus = document.getElementById('hushSignalBus');
  if (bus) {
    const registers = cockpit.signalBusSnapshot?.registers || {};
    bus.innerHTML = Object.entries(registers).map(([key, value]) => row(key, value)).join('');
  }
  const losses = document.getElementById('hushNarrowingLosses');
  if (losses) losses.innerHTML = Object.entries(cockpit.narrowingLosses?.losses || {}).map(([key, value]) => lossBar(key, value)).join('');
  const receipt = document.getElementById('hushExportReceipt');
  if (receipt) receipt.innerHTML = [row('complete', cockpit.exportReceiptSummary?.complete), row('private text', cockpit.exportReceiptSummary?.privateTextStored ? 'stored' : 'excluded'), row('claim ceiling', cockpit.claimCeiling), row('route', cockpit.routeState)].join('');
  const self = document.getElementById('hushSelfTest');
  if (self) self.innerHTML = [row('passed', cockpit.selfTestSummary?.passed), row('failures', cockpit.selfTestSummary?.hardFailures?.length || 0), row('warnings', cockpit.selfTestSummary?.warnings?.length || 0)].join('');
  const actions = document.getElementById('hushOperatorActions');
  if (actions) actions.innerHTML = cockpit.operatorActions.map((action) => `<li>${action}</li>`).join('');

  window.__TD613_HUSH_PRODUCT_STATE__ = state;
  window.__TD613_HUSH_EVIDENCE_COCKPIT__ = summarizeHushEvidenceCockpit(cockpit);
  window.__TD613_HUSH_PERSONA_GALLERY__ = summarizeHushPersonaGallery(gallery);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboard);
  else renderDashboard();
}

export { renderDashboard, ensureCockpitShell, bindPersonaSelection };
