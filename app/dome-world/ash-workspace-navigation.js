export const ASH_WORKSPACE_NAVIGATION_VERSION = 'td613.ash-keep.workspace-navigation/v1.0';

const installedHosts = new WeakSet();
const STATE_RANK = Object.freeze({
  ARRIVAL_UNPERSISTED: 0,
  READINESS_OBSERVED: 1,
  CUSTODY_ROOT_PROVISIONAL: 2,
  CUSTODY_ROOT_VERIFIED: 3,
  CASE_BOUND: 4,
  REBUILD_ELIGIBLE: 5,
  RELEASE_ELIGIBLE: 6,
  CONTINUITY_SEALED: 7
});
const WORKSPACE_REQUIREMENTS = Object.freeze({
  rooms: 'CASE_BOUND',
  routes: 'CASE_BOUND',
  test: 'CASE_BOUND',
  draft: 'REBUILD_ELIGIBLE',
  save: 'RELEASE_ELIGIBLE'
});

function lifecycleState(doc) {
  return String(doc?.body?.dataset?.ashLifecycle || 'ARRIVAL_UNPERSISTED').toUpperCase();
}

function workspacePosture(doc, workspace) {
  const required = WORKSPACE_REQUIREMENTS[workspace] || null;
  const state = lifecycleState(doc);
  return Object.freeze({
    workspace,
    state,
    required,
    allowed: !required || (Number.isInteger(STATE_RANK[state]) && STATE_RANK[state] >= STATE_RANK[required])
  });
}

function ensureStyles(doc) {
  if (doc.getElementById('td613-ash-workspace-navigation')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-workspace-navigation';
  style.textContent = `
    .work-tab[data-lifecycle-held="true"]{color:#c7aaa9;box-shadow:inset 0 -1px rgba(255,139,157,.36)}
    .work-tab[data-lifecycle-held="true"][aria-selected="true"]{color:var(--paper);box-shadow:inset 0 -2px var(--mint),inset 0 -5px rgba(255,139,157,.2)}
    .workspace-lifecycle-note{margin:0 0 12px;padding:9px 11px;border-left:2px solid var(--rose);background:rgba(255,139,157,.055);color:#efc2c9;font:600 .64rem/1.5 var(--mono)}
  `;
  doc.head.append(style);
}

function updateTabPostures(doc) {
  doc.querySelectorAll('.work-tab[data-workspace]').forEach(tab => {
    const posture = workspacePosture(doc, tab.dataset.workspace);
    tab.dataset.lifecycleHeld = String(!posture.allowed);
    tab.setAttribute('aria-disabled', 'false');
    tab.title = posture.allowed || !posture.required
      ? `${tab.textContent.trim()} workspace`
      : `${tab.textContent.trim()} workspace opens for review; actions require ${posture.required}.`;
  });
}

function showWorkspaceNote(doc, posture) {
  if (posture.allowed || !posture.required) return;
  const panel = doc.getElementById(`workspace-${posture.workspace}`);
  if (!panel) return;
  let note = panel.querySelector('.workspace-lifecycle-note');
  if (!note) {
    note = doc.createElement('p');
    note.className = 'workspace-lifecycle-note';
    const head = panel.querySelector('.workspace-head');
    if (head) head.insertAdjacentElement('afterend', note);
    else panel.prepend(note);
  }
  note.textContent = `Workspace open for review · mutating actions remain held until ${posture.required}; current lifecycle state ${posture.state}.`;
}

export function installAshWorkspaceNavigation(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || installedHosts.has(host)) return false;
  ensureStyles(doc);

  const onClick = event => {
    const tab = event.target?.closest?.('.work-tab[data-workspace]');
    if (!tab || tab.dataset.workspace === 'custody') return;
    const openWorkspace = host.__td613OpenAshWorkspace;
    if (typeof openWorkspace !== 'function') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const posture = workspacePosture(doc, tab.dataset.workspace);
    openWorkspace(tab.dataset.workspace);
    showWorkspaceNote(doc, posture);
    updateTabPostures(doc);
  };

  host.addEventListener('click', onClick, true);
  updateTabPostures(doc);

  if (doc.body && typeof host.MutationObserver === 'function') {
    new host.MutationObserver(() => updateTabPostures(doc)).observe(doc.body, {
      attributes: true,
      attributeFilter: ['data-ash-lifecycle'],
      childList: true,
      subtree: true
    });
  }

  doc.documentElement.dataset.ashWorkspaceNavigation = ASH_WORKSPACE_NAVIGATION_VERSION;
  installedHosts.add(host);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshWorkspaceNavigation(document, window);
}
