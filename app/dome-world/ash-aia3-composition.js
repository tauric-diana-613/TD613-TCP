export const ASH_AIA3_COMPOSITION_VERSION = 'td613.ash.aia3-composition/v0.1-ingress-first-compact-guide';
const POINTER_KEY = 'td613.ash-keep.current-case';
const DEFAULT_PROFILE = 'investigation';
const host = globalThis.window;
const doc = globalThis.document;
let syncQueued = false;
let observer = null;
const byId = id => doc?.getElementById(id);
const caseOpen = () => { try { return Boolean(host.__td613AshKeep?.current?.().case_id || host.localStorage?.getItem?.(POINTER_KEY)); } catch { return Boolean(host.__td613AshKeep?.current?.().case_id); } };
function setExactWork(open) {
  const main = doc.querySelector('body > main');
  const rail = doc.querySelector('body > .workspace-rail');
  if (!main || !rail) return;
  if (open) {
    main.removeAttribute('inert'); main.removeAttribute('aria-hidden'); rail.removeAttribute('inert'); rail.removeAttribute('aria-hidden');
    main.style.setProperty('display', 'block', 'important'); main.style.setProperty('visibility', 'visible', 'important');
    rail.style.setProperty('display', 'grid', 'important'); rail.style.setProperty('visibility', 'visible', 'important'); rail.style.setProperty('min-height', '54px', 'important'); rail.style.setProperty('max-height', 'none', 'important'); rail.style.setProperty('opacity', '1', 'important');
  } else {
    main.setAttribute('inert', ''); main.setAttribute('aria-hidden', 'true'); rail.setAttribute('inert', ''); rail.setAttribute('aria-hidden', 'true');
  }
}
function updateLaunchPromise() {
  const promise = byId('guidedLaunchPromise');
  if (!promise || promise.dataset.ashAia3 === 'true') return;
  promise.dataset.ashAia3 = 'true';
  promise.innerHTML = `<div><p class="guided-kicker">Four exact steps · one local case</p><h3>Start here. Ash explains the consequence after each deliberate action.</h3></div><p>Your case structure and document bytes remain in this browser. A custody reference, Case Map change, test, review, or Capsule appears only after the named Ash action completes.</p><ol><li><b>1 · Set up</b><span>Choose a profile and open a private case.</span></li><li><b>2 · Open</b><span>Bring a local text document into view without uploading it.</span></li><li><b>3 · Keep + check</b><span>Create or verify a separate custody reference.</span></li><li><b>4 · Work</b><span>Map, test, review, save, or seal through exact Ash controls.</span></li></ol><small>Explanation ≠ action. Early warning ≠ guilt, intent, identity, authorship, truth, surveillance probability, or prediction.</small>`;
}
function ensureDefaultProfile() {
  const select = byId('newProfile');
  if (!select || caseOpen()) return;
  const option = select.querySelector(`option[value="${DEFAULT_PROFILE}"]`);
  if (!option) return;
  if (!select.value) {
    select.value = DEFAULT_PROFILE;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const title = byId('newTitle');
  if (title && (!title.value || /^(Untitled|unclassified · Ash) case$/i.test(title.value))) title.value = 'New investigation case';
  select.dataset.ashAia3Default = DEFAULT_PROFILE;
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
function sync() {
  if (!doc?.documentElement || !doc.body) return;
  const open = caseOpen();
  doc.documentElement.dataset.ashAia3 = ASH_AIA3_COMPOSITION_VERSION;
  doc.documentElement.dataset.ashSessionOpen = String(open);
  doc.body.dataset.ashAiaCaseOpen = String(open);
  updateLaunchPromise(); addRestoreNote(); ensureDefaultProfile(); closeDeepPanels(); setExactWork(open);
  const launch = byId('launch');
  if (open) launch?.classList.add('hidden'); else launch?.classList.remove('hidden');
  doc.documentElement.dataset.ashMembraneReady = 'true';
  doc.documentElement.dataset.ashAia3Ready = 'true';
}
function schedule() { if (syncQueued) return; syncQueued = true; queueMicrotask(() => { syncQueued = false; sync(); }); }
export function installAshAia3Composition() {
  if (!host || !doc?.body || host.__td613AshAia3Composition) return false;
  doc.documentElement.dataset.ashAia3 = ASH_AIA3_COMPOSITION_VERSION;
  sync();
  for (const type of ['core-ready', 'case-opened', 'case-created', 'profile-demo-hydrated', 'case-closed', 'lifecycle-updated']) host.addEventListener(`td613:ash:${type}`, schedule);
  doc.addEventListener('change', event => { if (event.target?.id === 'newProfile') schedule(); });
  observer = new MutationObserver(schedule);
  observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'disabled'] });
  host.__td613AshAia3Composition = Object.freeze({ version: ASH_AIA3_COMPOSITION_VERSION, refresh: sync, current: () => Object.freeze({ session_open: caseOpen(), profile: byId('newProfile')?.value || null, membrane_ready: doc.documentElement.dataset.ashMembraneReady === 'true' }) });
  host.dispatchEvent(new CustomEvent('td613:ash:aia3-ready', { detail: host.__td613AshAia3Composition.current() }));
  return true;
}
if (host && doc) installAshAia3Composition();
