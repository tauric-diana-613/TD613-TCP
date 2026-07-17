export const ASH_WORKSPACE_NAVIGATION_VERSION = 'td613.ash-keep.workspace-navigation/v1.1-capsule-recovery-entry';

const installedHosts = new WeakSet();
const POINTER_KEY = 'td613.ash-keep.current-case';
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

function hasCurrentCase(host) {
  try {
    return Boolean(host?.localStorage?.getItem?.(POINTER_KEY));
  } catch {
    return false;
  }
}

function ensureStyles(doc) {
  if (doc.getElementById('td613-ash-workspace-navigation')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-workspace-navigation';
  style.textContent = `
    .work-tab[data-lifecycle-held="true"]{color:#c7aaa9;box-shadow:inset 0 -1px rgba(255,139,157,.36)}
    .work-tab[data-lifecycle-held="true"][aria-selected="true"]{color:var(--paper);box-shadow:inset 0 -2px var(--mint),inset 0 -5px rgba(255,139,157,.2)}
    .workspace-lifecycle-note{margin:0 0 12px;padding:9px 11px;border-left:2px solid var(--rose);background:rgba(255,139,157,.055);color:#efc2c9;font:600 .64rem/1.5 var(--mono)}
    .capsule-recovery-navigation{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:11px;border:1px solid var(--line2);background:rgba(228,198,108,.055)}
    .capsule-recovery-navigation p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.5}
    .capsule-recovery-navigation[hidden]{display:none}
    @media(max-width:620px){.capsule-recovery-navigation{align-items:stretch;flex-direction:column}.capsule-recovery-navigation .btn{width:100%}}
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

function updateRecoveryPosture(doc, host) {
  const current = hasCurrentCase(host);
  const entry = doc.getElementById('openCapsuleRecovery');
  const returnBar = doc.querySelector('.capsule-recovery-navigation');
  if (entry) entry.hidden = false;
  if (returnBar) returnBar.hidden = current;
}

function ensureCapsuleRecoveryEntry(doc, host) {
  const launch = doc.getElementById('launch');
  const launchPanel = launch?.querySelector('.launch-panel');
  const launchActions = launchPanel?.querySelector('.actions');
  const savePanel = doc.getElementById('workspace-save');
  if (!launch || !launchActions || !savePanel) return false;

  let entry = doc.getElementById('openCapsuleRecovery');
  if (!entry) {
    entry = doc.createElement('button');
    entry.id = 'openCapsuleRecovery';
    entry.type = 'button';
    entry.className = 'btn';
    entry.textContent = 'Open encrypted copy';
    entry.setAttribute('aria-describedby', 'capsuleRecoveryLaunchDescription');
    launchActions.append(entry);

    const description = doc.createElement('p');
    description.id = 'capsuleRecoveryLaunchDescription';
    description.className = 'sub';
    description.textContent = 'Restore an authenticated Ash Capsule without creating or opening a case first.';
    launchActions.insertAdjacentElement('afterend', description);

    entry.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      launch.classList.add('hidden');
      const openWorkspace = host.__td613OpenAshWorkspace;
      if (typeof openWorkspace === 'function') openWorkspace('save');
      showWorkspaceNote(doc, workspacePosture(doc, 'save'));
      updateTabPostures(doc);
      updateRecoveryPosture(doc, host);
      doc.getElementById('capsuleFile')?.focus?.();
    });
  }

  let returnBar = savePanel.querySelector('.capsule-recovery-navigation');
  if (!returnBar) {
    returnBar = doc.createElement('div');
    returnBar.className = 'capsule-recovery-navigation';
    returnBar.innerHTML = '<p>Recovery mode · choose an encrypted Ash Capsule and its passphrase. No new case is required before authentication.</p>';
    const back = doc.createElement('button');
    back.id = 'returnToCaseLaunch';
    back.type = 'button';
    back.className = 'btn';
    back.textContent = 'Back to cases';
    back.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const openWorkspace = host.__td613OpenAshWorkspace;
      if (typeof openWorkspace === 'function') openWorkspace('map');
      launch.classList.remove('hidden');
      doc.getElementById('newTitle')?.focus?.();
    });
    returnBar.append(back);
    const head = savePanel.querySelector('.workspace-head');
    if (head) head.insertAdjacentElement('afterend', returnBar);
    else savePanel.prepend(returnBar);
  }

  updateRecoveryPosture(doc, host);
  return true;
}

export function installAshWorkspaceNavigation(doc = globalThis.document, host = globalThis.window) {
  if (!doc || !host || installedHosts.has(host)) return false;
  ensureStyles(doc);
  ensureCapsuleRecoveryEntry(doc, host);

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
    new host.MutationObserver(() => {
      updateTabPostures(doc);
      updateRecoveryPosture(doc, host);
    }).observe(doc.body, {
      attributes: true,
      attributeFilter: ['data-ash-lifecycle'],
      childList: true,
      subtree: true
    });
  }

  for (const type of ['core-mutated', 'case-opened', 'case-created', 'capsule-opened']) {
    host.addEventListener(`td613:ash:${type}`, () => updateRecoveryPosture(doc, host));
  }

  doc.documentElement.dataset.ashWorkspaceNavigation = ASH_WORKSPACE_NAVIGATION_VERSION;
  installedHosts.add(host);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshWorkspaceNavigation(document, window);
}
