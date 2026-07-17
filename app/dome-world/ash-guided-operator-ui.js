export const ASH_GUIDED_OPERATOR_UI_VERSION = 'td613.ash.guided-operator-ui/v0.1-investigation-flight';

const installedHosts = new WeakSet();
const RECEIPT_LABELS = Object.freeze({
  testReceipt: 'View exact Rebuild receipt',
  replayReceipt: 'View exact replay receipt',
  releaseReceipt: 'View exact Release receipt',
  providerPacket: 'View exact provider packet',
  premiumChoirReceipt: 'View exact Choir receipt'
});

const byId = (doc, id) => doc.getElementById(id);

function ensureStyles(doc) {
  if (byId(doc, 'td613-ash-guided-operator-css')) return;
  const link = doc.createElement('link');
  link.id = 'td613-ash-guided-operator-css';
  link.rel = 'stylesheet';
  link.href = '/dome-world/ash-guided-operator-ui.css';
  doc.head.append(link);
}

function ensureLaunchPromise(doc) {
  const panel = doc.querySelector('.launch-panel');
  if (!panel || byId(doc, 'guidedLaunchPromise')) return;
  const promise = doc.createElement('section');
  promise.id = 'guidedLaunchPromise';
  promise.className = 'guided-launch-promise';
  promise.innerHTML = `
    <div><p class="guided-kicker">Custodial AI-access protocol</p><h3>Protect the case before AI sees the case.</h3></div>
    <p>Ash keeps the private structure local, tests what a purpose-shaped fragment could make recoverable, screens a bounded AI packet, and seals portable continuity into an encrypted Capsule.</p>
    <ol><li><b>Protect</b><span>Bind custody and preserve originals.</span></li><li><b>Test</b><span>Measure reconstruction exposure before sharing.</span></li><li><b>Share</b><span>Release only the reviewed derivative.</span></li><li><b>Replay</b><span>Open authenticated Capsules inside the Dome.</span></li></ol>
    <small>Early warning ≠ guilt, intent, identity, authorship, truth, surveillance probability, or prediction.</small>`;
  panel.querySelector('.field-grid')?.insertAdjacentElement('beforebegin', promise);
}

function ensureMapControls(doc) {
  const tools = doc.querySelector('#workspace-map .map-tools');
  const canvas = byId(doc, 'caseCanvas');
  const workspace = byId(doc, 'workspace-map');
  if (!tools || !canvas || !workspace || byId(doc, 'guidedMapFocus')) return;

  const zoom = (deltaY, label) => {
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }));
    const status = byId(doc, 'guidedMapStatus');
    if (status) status.textContent = label;
  };

  const out = doc.createElement('button');
  out.className = 'icon-btn guided-map-control';
  out.id = 'guidedMapZoomOut';
  out.type = 'button';
  out.title = 'Zoom map out';
  out.setAttribute('aria-label', 'Zoom map out');
  out.textContent = '−';
  out.addEventListener('click', () => zoom(120, 'Map zoomed out'));

  const inside = doc.createElement('button');
  inside.className = 'icon-btn guided-map-control';
  inside.id = 'guidedMapZoomIn';
  inside.type = 'button';
  inside.title = 'Zoom map in';
  inside.setAttribute('aria-label', 'Zoom map in');
  inside.textContent = '+';
  inside.addEventListener('click', () => zoom(-120, 'Map zoomed in'));

  const focus = doc.createElement('button');
  focus.className = 'icon-btn guided-map-control';
  focus.id = 'guidedMapFocus';
  focus.type = 'button';
  focus.title = 'Expand map';
  focus.setAttribute('aria-label', 'Expand map');
  focus.setAttribute('aria-pressed', 'false');
  focus.textContent = '⛶';
  focus.addEventListener('click', () => {
    const active = workspace.classList.toggle('guided-map-focus');
    focus.setAttribute('aria-pressed', String(active));
    focus.title = active ? 'Restore map workspace' : 'Expand map';
    const status = byId(doc, 'guidedMapStatus');
    if (status) status.textContent = active ? 'Map expanded. Pinch, drag, or use + and −.' : 'Map workspace restored.';
  });

  tools.append(out, inside, focus);
  const status = doc.createElement('span');
  status.id = 'guidedMapStatus';
  status.className = 'guided-map-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Pinch, drag, or use + and −.';
  tools.append(status);
}

function wrapReceipt(doc, receipt) {
  if (!receipt || receipt.hidden || receipt.closest('details.guided-receipt')) return;
  const details = doc.createElement('details');
  details.className = 'guided-receipt';
  const summary = doc.createElement('summary');
  summary.textContent = RECEIPT_LABELS[receipt.id] || 'View exact receipt';
  receipt.before(details);
  details.append(summary, receipt);
}

function compressReceipts(doc) {
  doc.querySelectorAll('pre.receipt').forEach(receipt => wrapReceipt(doc, receipt));
  const inventory = byId(doc, 'premiumReceiptInventory');
  const list = inventory?.querySelector('.receipt-list');
  if (inventory && list && !list.closest('details.guided-receipt')) {
    const details = doc.createElement('details');
    details.className = 'guided-receipt guided-receipt-inventory';
    const summary = doc.createElement('summary');
    summary.textContent = `View ${list.querySelectorAll('code').length} exact receipt references`;
    list.before(details);
    details.append(summary, list);
  }
}

function taskStep(label, note, workspace, state = '') {
  return `<button type="button" data-route-workspace="${workspace}" data-step-state="${state}"><b>${label}</b><span>${note}</span></button>`;
}

function investigationStepState(snapshot, step) {
  const rank = snapshot?.lifecycle?.exact || 'ARRIVAL_UNPERSISTED';
  const ranks = ['ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CUSTODY_ROOT_PROVISIONAL', 'CUSTODY_ROOT_VERIFIED', 'CASE_BOUND', 'REBUILD_ELIGIBLE', 'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED'];
  const current = Math.max(0, ranks.indexOf(rank));
  const thresholds = { protect: 4, map: 4, test: 5, share: 6, seal: 7 };
  const threshold = thresholds[step] || 0;
  return current > threshold ? 'complete' : current === threshold ? 'current' : 'held';
}

function renderInvestigationGuidance(doc, snapshot) {
  const home = byId(doc, 'premiumHomeBody');
  const work = byId(doc, 'premiumWorkBody');
  if (!home || !work || snapshot?.profile !== 'investigation') return;
  doc.documentElement.dataset.ashGuidedProfile = 'investigation';

  if (!byId(doc, 'investigationTaskSpine')) {
    const spine = doc.createElement('section');
    spine.id = 'investigationTaskSpine';
    spine.className = 'guided-task-spine';
    spine.innerHTML = `
      <div class="guided-section-head"><div><p class="guided-kicker">Investigation flight</p><h3>Protect → Map → Test → Share → Seal</h3></div><span>One task spine</span></div>
      <div class="guided-spine-steps">
        ${taskStep('Protect', 'Bind custody and preserve originals', 'custody', investigationStepState(snapshot, 'protect'))}
        ${taskStep('Map', 'Separate claims, chronology, people, and gaps', 'map', investigationStepState(snapshot, 'map'))}
        ${taskStep('Test', 'Check what the proposed fragment makes recoverable', 'test', investigationStepState(snapshot, 'test'))}
        ${taskStep('Share', 'Screen and review one bounded AI packet', 'draft', investigationStepState(snapshot, 'share'))}
        ${taskStep('Seal', 'Keep continuity or export an encrypted Capsule', 'capsule', investigationStepState(snapshot, 'seal'))}
      </div>
      <p>Start with the highlighted step. Exact receipts remain available underneath each decision, but they stay folded until deliberately opened.</p>`;
    home.querySelector('.premium-hero')?.insertAdjacentElement('afterend', spine);
  }

  if (!byId(doc, 'investigationAiShareGuide')) {
    const guide = doc.createElement('section');
    guide.id = 'investigationAiShareGuide';
    guide.className = 'guided-ai-share';
    guide.innerHTML = `
      <div class="guided-section-head"><div><p class="guided-kicker">AI sharing guide</p><h3>Send the question, not the whole investigation.</h3></div><span>Provider boundary</span></div>
      <ol>
        <li><b>Choose exact references.</b><span>Keep source identities, joining keys, personal data, and the full Case Map local.</span></li>
        <li><b>Run Rebuild.</b><span>Observe what the selected fragment adds beyond what already left.</span></li>
        <li><b>Run Choir when routes interact.</b><span>Preserve interference residue for human interpretation without attribution.</span></li>
        <li><b>Screen with Hush.</b><span>Quarantine copied instructions and protected literals before provider approval.</span></li>
        <li><b>Review the exact route.</b><span>Keep a Release Receipt or return to local drafting.</span></li>
        <li><b>Seal or record.</b><span>Export an encrypted Capsule for Dome replay, or record what actually left.</span></li>
      </ol>
      <div class="guided-action-row"><button type="button" class="premium-action primary" data-route-workspace="test">Test current AI packet</button><button type="button" class="premium-action" data-route-workspace="draft">Prepare bounded AI share</button><button type="button" class="premium-action gold" data-route-workspace="capsule">Seal for replay</button></div>
      <details class="guided-claim-ceiling"><summary>What this warning can and cannot mean</summary><p>Ash can surface reconstruction exposure under declared Readers and routes. It cannot establish guilt, intent, identity, authorship, truth, surveillance probability, future conduct, or automatic action.</p></details>`;
    work.prepend(guide);
  }

  const primary = home.querySelector('.priority-sheet [data-route-workspace="work"]');
  if (primary) primary.textContent = 'Open investigation flight';
}

function removeInvestigationGuidance(doc) {
  byId(doc, 'investigationTaskSpine')?.remove();
  byId(doc, 'investigationAiShareGuide')?.remove();
  delete doc.documentElement.dataset.ashGuidedProfile;
}

function enhance(doc, host) {
  ensureLaunchPromise(doc);
  ensureMapControls(doc);
  compressReceipts(doc);
  const snapshot = host.__td613AshPremiumUI?.snapshot?.();
  if (snapshot?.profile === 'investigation') renderInvestigationGuidance(doc, snapshot);
  else removeInvestigationGuidance(doc);
  doc.documentElement.dataset.ashGuidedUI = ASH_GUIDED_OPERATOR_UI_VERSION;
}

export function installAshGuidedOperatorUI(doc = globalThis.document, host = globalThis.window) {
  if (!doc?.body || !host || installedHosts.has(host)) return false;
  ensureStyles(doc);
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    host.setTimeout(() => {
      scheduled = false;
      enhance(doc, host);
    }, 40);
  };
  for (const type of ['core-ready', 'case-opened', 'case-created', 'profile-demo-hydrated', 'core-mutated', 'rebuild-kept', 'draft-kept', 'review-kept', 'release-kept', 'continuity-kept', 'capsule-opened']) {
    host.addEventListener(`td613:ash:${type}`, schedule);
  }
  if (typeof host.MutationObserver === 'function') {
    new host.MutationObserver(schedule).observe(doc.body, { childList: true, subtree: true });
  }
  installedHosts.add(host);
  schedule();
  host.__td613AshGuidedOperatorUI = Object.freeze({ version: ASH_GUIDED_OPERATOR_UI_VERSION, refresh: schedule });
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshGuidedOperatorUI(document, window);
}
