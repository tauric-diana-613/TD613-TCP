export const ASH_DEMO_ENTRY_CONVERGENCE_VERSION = 'td613.ash.demo-entry-convergence/v0.1-two-frame-visible-workspace';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const ENTRY_FALLBACK = Object.freeze({
  investigation:'home',
  political_campaign:'map',
  fundraiser:'work',
  research:'work',
  legal:'home'
});
let token = 0;
let frame = 0;
let timeout = 0;
let state = Object.freeze({ profile:null, workspace:null, posture:'IDLE', stable_frames:0 });

function visible(node) {
  if (!node) return false;
  const style = getComputedStyle(node), rect = node.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
}

function intendedWorkspace(profile) {
  if (profile === 'research') return 'work';
  return host.__td613AshDemoPedagogy?.manifests?.[profile]?.entry_workspace || ENTRY_FALLBACK[profile] || 'home';
}

function openWorkspace(workspace) {
  const open = host.__td613AshUiUxRescue?.open || host.__td613AshPremiumUI?.open || host.__td613OpenAshWorkspace || host.__td613AshKeep?.openWorkspace;
  if (typeof open !== 'function') return false;
  open(workspace);
  return true;
}

function ensureStyles() {
  if (byId('td613-ash-demo-entry-convergence-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-demo-entry-convergence-css';
  style.textContent = `
    html[data-ash-demo-entry-hydrating="true"] body>main{opacity:0!important;pointer-events:none!important;user-select:none!important}
    #ashDemoEntryStatus{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin-top:7px;padding:7px 9px;border:1px solid rgba(228,198,108,.24);background:rgba(228,198,108,.05);color:var(--muted);font:700 .56rem/1.3 var(--mono);text-transform:uppercase}
    #ashDemoEntryStatus strong{color:var(--gold)}
    #ashDemoEntryStatus[data-posture="READY"]{border-color:rgba(118,234,212,.25);color:var(--mint)}
    #ashDemoEntryStatus[data-posture="HELD"]{border-color:rgba(255,139,157,.45);color:var(--rose)}
  `;
  doc.head.append(style);
}

function renderStatus(profile, workspace, posture, detail) {
  const context = byId('premiumContextBar');
  if (!context) return null;
  let node = byId('ashDemoEntryStatus');
  if (!node) {
    node = doc.createElement('div');
    node.id = 'ashDemoEntryStatus';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    context.append(node);
  }
  node.dataset.posture = posture;
  node.innerHTML = `<strong>${profile.replaceAll('_',' ')}</strong><span>${detail || `${workspace} workspace`}</span>`;
  return node;
}

function exactReady(workspace) {
  const panel = byId(`workspace-${workspace}`);
  const main = doc.querySelector('body > main');
  const rail = doc.querySelector('body > .workspace-rail');
  return Boolean(panel?.classList.contains('active'))
    && doc.documentElement.dataset.ashPremiumWorkspace === workspace
    && visible(panel)
    && visible(main)
    && visible(rail)
    && !main?.hasAttribute('inert')
    && !rail?.hasAttribute('inert');
}

function publish(profile, workspace, posture, stableFrames) {
  state = Object.freeze({ profile, workspace, posture, stable_frames:stableFrames });
  doc.documentElement.dataset.ashDemoEntryConvergence = ASH_DEMO_ENTRY_CONVERGENCE_VERSION;
  doc.documentElement.dataset.ashDemoEntryPosture = posture;
  host.__td613AshDemoEntryConvergenceState = state;
}

function release(profile, workspace, stableFrames) {
  clearTimeout(timeout);
  delete doc.documentElement.dataset.ashDemoEntryHydrating;
  doc.documentElement.dataset.ashDemoEntryReady = `${profile}:${workspace}`;
  publish(profile, workspace, 'READY', stableFrames);
  renderStatus(profile, workspace, 'READY', `${workspace} ready · four-step route remains available`);
  host.dispatchEvent(new CustomEvent('td613:ash:demo-entry-ready', { detail:{ profile, workspace, stable_frames:stableFrames, version:ASH_DEMO_ENTRY_CONVERGENCE_VERSION } }));
  host.setTimeout(() => byId('ashDemoEntryStatus')?.remove(), 1200);
}

function converge(profile, workspace, currentToken, stableFrames = 0) {
  if (currentToken !== token) return;
  const ready = exactReady(workspace);
  const nextStable = ready ? stableFrames + 1 : 0;
  if (nextStable >= 2) {
    release(profile, workspace, nextStable);
    return;
  }
  if (!ready) openWorkspace(workspace);
  publish(profile, workspace, 'OPENING', nextStable);
  frame = host.requestAnimationFrame(() => converge(profile, workspace, currentToken, nextStable));
}

function begin(event) {
  const profile = event?.detail?.profile || doc.documentElement.dataset.ashDemoProfile || null;
  if (!profile) return false;
  const workspace = intendedWorkspace(profile);
  const currentToken = ++token;
  if (frame) host.cancelAnimationFrame(frame);
  clearTimeout(timeout);
  delete doc.documentElement.dataset.ashDemoEntryReady;
  doc.documentElement.dataset.ashDemoEntryHydrating = 'true';
  publish(profile, workspace, 'OPENING', 0);
  renderStatus(profile, workspace, 'OPENING', `opening ${workspace} workspace…`);
  openWorkspace(workspace);
  frame = host.requestAnimationFrame(() => converge(profile, workspace, currentToken, 0));
  timeout = host.setTimeout(() => {
    if (currentToken !== token || exactReady(workspace)) return;
    publish(profile, workspace, 'HELD', 0);
    doc.documentElement.dataset.ashDemoEntryHold = `WORKSPACE_NOT_VISIBLE:${profile}:${workspace}`;
    renderStatus(profile, workspace, 'HELD', `${workspace} held · exact work did not become visible`);
    host.dispatchEvent(new CustomEvent('td613:ash:demo-entry-held', { detail:{ profile, workspace, code:'WORKSPACE_NOT_VISIBLE', version:ASH_DEMO_ENTRY_CONVERGENCE_VERSION } }));
  }, 5000);
  return true;
}

export function installAshDemoEntryConvergence() {
  if (!host || !doc?.body || host.__td613AshDemoEntryConvergence) return false;
  ensureStyles();
  host.addEventListener('td613:ash:profile-demo-hydrated', begin);
  host.__td613AshDemoEntryConvergence = Object.freeze({
    version:ASH_DEMO_ENTRY_CONVERGENCE_VERSION,
    begin,
    current:() => state,
    ready:() => state.posture === 'READY'
  });
  doc.documentElement.dataset.ashDemoEntryConvergence = ASH_DEMO_ENTRY_CONVERGENCE_VERSION;
  return true;
}

if (host && doc) installAshDemoEntryConvergence();
