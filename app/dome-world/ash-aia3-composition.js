export const ASH_AIA3_COMPOSITION_VERSION = 'td613.ash.aia3-composition/v0.4-open-case-render-readiness';

const POINTER_KEY = 'td613.ash-keep.current-case';
const DEFAULT_PROFILE = 'investigation';
const REQUIRED_ROUTE_COUNT = 4;
const REQUIRED_TASK_COUNT = 4;
const host = globalThis.window;
const doc = globalThis.document;

let syncQueued = false;
let observer = null;
let readinessTimer = 0;
let lastReady = null;
let lastHold = null;

const byId = id => doc?.getElementById(id);

function currentCaseId() {
  try {
    return host.__td613AshKeep?.current?.().case_id || host.localStorage?.getItem?.(POINTER_KEY) || null;
  } catch {
    return host.__td613AshKeep?.current?.().case_id || null;
  }
}

const caseOpen = () => Boolean(currentCaseId());

function readLifecycleState() {
  const liveState = host.__td613AshLiveAIA?.current?.()?.lifecycle_state;
  if (liveState) return liveState;
  try {
    return JSON.parse(byId('lifecycleReceipt')?.textContent || 'null')?.lifecycle?.state || null;
  } catch {
    return null;
  }
}

function renderedMembraneState() {
  const root = byId('ashAiaMembrane');
  return Object.freeze({
    root,
    route_count: root?.querySelectorAll('[data-aia-route]').length || 0,
    task_count: root?.querySelectorAll('[data-aia-task]').length || 0
  });
}

function openCaseReadiness() {
  const lifecycleState = readLifecycleState();
  const membrane = renderedMembraneState();
  if (!host.__td613AshLiveAIA) return Object.freeze({ ready:false, hold:'WAITING_LIVE_AIA', lifecycle_state:lifecycleState, ...membrane });
  if (!lifecycleState) return Object.freeze({ ready:false, hold:'WAITING_LIFECYCLE_STATE', lifecycle_state:null, ...membrane });
  if (!membrane.root) return Object.freeze({ ready:false, hold:'WAITING_AIA_MEMBRANE', lifecycle_state:lifecycleState, ...membrane });
  if (membrane.route_count < REQUIRED_ROUTE_COUNT || membrane.task_count < REQUIRED_TASK_COUNT) {
    return Object.freeze({ ready:false, hold:'WAITING_COMPLETE_ROUTE_TASK_GRAPH', lifecycle_state:lifecycleState, ...membrane });
  }
  return Object.freeze({ ready:true, hold:null, lifecycle_state:lifecycleState, ...membrane });
}

function setExactWork(available) {
  const main = doc.querySelector('body > main');
  const rail = doc.querySelector('body > .workspace-rail');
  if (!main || !rail) return;
  if (available) {
    main.removeAttribute('inert');
    main.removeAttribute('aria-hidden');
    rail.removeAttribute('inert');
    rail.removeAttribute('aria-hidden');
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('visibility', 'visible', 'important');
    rail.style.setProperty('display', 'grid', 'important');
    rail.style.setProperty('visibility', 'visible', 'important');
    rail.style.setProperty('min-height', '54px', 'important');
    rail.style.setProperty('max-height', 'none', 'important');
    rail.style.setProperty('opacity', '1', 'important');
    return;
  }
  main.setAttribute('inert', '');
  main.setAttribute('aria-hidden', 'true');
  rail.setAttribute('inert', '');
  rail.setAttribute('aria-hidden', 'true');
}

function updateLaunchPromise() {
  const promise = byId('guidedLaunchPromise');
  if (!promise || promise.dataset.ashAia3 === 'true') return;
  promise.dataset.ashAia3 = 'true';
  promise.innerHTML = `<div><p class="guided-kicker">Four exact steps · one local case</p><h3>Start here. Ash explains the consequence after each deliberate action.</h3></div><p>Your case structure and document bytes remain in this browser. A custody reference, Case Map change, test, review, or Capsule appears only after the named Ash action completes.</p><ol><li><b>1 · Set up</b><span>Choose a profile and open a private case.</span></li><li><b>2 · Open</b><span>Bring a local text document into view without uploading it.</span></li><li><b>3 · Keep + check</b><span>Create or verify a separate custody reference.</span></li><li><b>4 · Work</b><span>Map, test, review, save, or seal through exact Ash controls.</span></li></ol><small>Explanation ≠ action. Early warning ≠ guilt, intent, identity, authorship, truth, surveillance probability, or prediction.</small>`;
}

function ensureDefaultProfile() {
  const select = byId('newProfile');
  if (!select || caseOpen()) return false;
  const option = select.querySelector(`option[value="${DEFAULT_PROFILE}"]`);
  if (!option) return false;
  if (select.value !== DEFAULT_PROFILE) {
    select.value = DEFAULT_PROFILE;
    select.dispatchEvent(new Event('input', { bubbles:true }));
    select.dispatchEvent(new Event('change', { bubbles:true }));
  }
  const title = byId('newTitle');
  if (title && (!title.value || /^(Untitled|unclassified · Ash) case$/i.test(title.value))) title.value = 'New investigation case';
  const button = byId('newCase');
  if (button && select.value === DEFAULT_PROFILE) {
    button.disabled = false;
    button.setAttribute('aria-disabled', 'false');
  }
  select.dataset.ashAia3Default = DEFAULT_PROFILE;
  return Boolean(button && !button.disabled && select.value === DEFAULT_PROFILE);
}

function closeDeepPanels() {
  doc.querySelector('#ashAiaMembrane .ash-aia__consequences')?.removeAttribute('open');
  doc.querySelectorAll('#ashAiaMembrane .ash-aia__depths details').forEach(details => details.removeAttribute('open'));
}

function addRestoreNote() {
  const panel = doc.querySelector('#launch .launch-panel');
  if (!panel || panel.querySelector('.aia3-restore-note')) return;
  const note = doc.createElement('p');
  note.className = 'aia3-restore-note';
  note.textContent = 'Saved cases and encrypted copies remain separate. A cache transition may close the active session without deleting IndexedDB case data.';
  panel.append(note);
}

function publishReadiness(ready, hold, detail) {
  doc.documentElement.dataset.ashMembraneReady = String(ready);
  doc.documentElement.dataset.ashAia3Ready = String(ready);
  doc.body.dataset.ashAiaCaseReady = String(ready);
  if (hold) doc.documentElement.dataset.ashAia3ReadinessHold = hold;
  else delete doc.documentElement.dataset.ashAia3ReadinessHold;
  if (ready === lastReady && hold === lastHold) return;
  lastReady = ready;
  lastHold = hold;
  host.dispatchEvent(new CustomEvent('td613:ash:aia3-readiness-changed', {
    detail:{
      version:ASH_AIA3_COMPOSITION_VERSION,
      ready,
      hold,
      session_open:caseOpen(),
      case_id:currentCaseId(),
      lifecycle_state:detail.lifecycle_state || null,
      route_count:detail.route_count || 0,
      task_count:detail.task_count || 0
    }
  }));
}

function sync() {
  if (!doc?.documentElement || !doc.body) return;
  const open = caseOpen();
  const openState = open ? openCaseReadiness() : null;
  const ready = open ? openState.ready : ensureDefaultProfile();
  const hold = open ? openState.hold : ready ? null : 'WAITING_INGRESS_PROFILE';
  const detail = openState || { lifecycle_state:null, route_count:0, task_count:0 };

  doc.documentElement.dataset.ashAia3 = ASH_AIA3_COMPOSITION_VERSION;
  doc.documentElement.dataset.ashSessionOpen = String(open);
  doc.body.dataset.ashAiaCaseOpen = String(open);
  updateLaunchPromise();
  addRestoreNote();
  closeDeepPanels();
  setExactWork(open && ready);

  const launch = byId('launch');
  if (open) launch?.classList.add('hidden');
  else launch?.classList.remove('hidden');

  publishReadiness(ready, hold, detail);
  clearTimeout(readinessTimer);
  if (!ready) readinessTimer = host.setTimeout(schedule, 75);
}

function schedule() {
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    sync();
  });
}

export function installAshAia3Composition() {
  if (!host || !doc?.body || host.__td613AshAia3Composition) return false;
  doc.documentElement.dataset.ashAia3 = ASH_AIA3_COMPOSITION_VERSION;
  sync();
  for (const type of ['core-ready', 'aia-ready', 'case-opened', 'case-created', 'profile-demo-hydrated', 'case-closed', 'lifecycle-updated']) {
    host.addEventListener(`td613:ash:${type}`, schedule);
  }
  doc.addEventListener('change', event => {
    if (event.target?.id === 'newProfile') schedule();
  });
  observer = new MutationObserver(records => {
    if (records.some(record => record.addedNodes.length || record.removedNodes.length)) schedule();
  });
  observer.observe(doc.body, { childList:true, subtree:true });
  host.__td613AshAia3Composition = Object.freeze({
    version:ASH_AIA3_COMPOSITION_VERSION,
    refresh:sync,
    current:() => {
      const open = caseOpen();
      const state = open ? openCaseReadiness() : { ready:doc.documentElement.dataset.ashMembraneReady === 'true', hold:doc.documentElement.dataset.ashAia3ReadinessHold || null, lifecycle_state:null, route_count:0, task_count:0 };
      return Object.freeze({
        session_open:open,
        case_id:currentCaseId(),
        profile:byId('newProfile')?.value || null,
        membrane_ready:state.ready,
        hold:state.hold,
        lifecycle_state:state.lifecycle_state,
        route_count:state.route_count,
        task_count:state.task_count
      });
    }
  });
  host.dispatchEvent(new CustomEvent('td613:ash:aia3-ready', { detail:host.__td613AshAia3Composition.current() }));
  return true;
}

if (host && doc) installAshAia3Composition();
