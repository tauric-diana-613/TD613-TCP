export const ASH_CLOSE_INGRESS_ANIMATION_BOUNDARY_VERSION = 'td613.ash.close-ingress-animation-boundary/v0.4-coherent-closed-ingress';

const host = globalThis.window;
const doc = globalThis.document;
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const REDUCED = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
let observer = null;
let enforcing = false;
let settleToken = 0;

const byId = id => doc?.getElementById(id);

function activeCasePointer() {
  try { return host?.localStorage?.getItem?.(POINTER_KEY) || null; }
  catch { return null; }
}

function localValue(key) {
  try { return host?.localStorage?.getItem?.(key) || null; }
  catch { return null; }
}

function installPointerAuthoritativeCoreView() {
  const core = host?.__td613AshKeep;
  if (!core || core.pointer_authoritative_session === true || typeof core.current !== 'function') return Boolean(core?.pointer_authoritative_session);
  const current = core.current.bind(core);
  const refresh = typeof core.refresh === 'function' ? core.refresh.bind(core) : null;
  host.__td613AshKeep = Object.freeze({
    ...core,
    pointer_authoritative_session:true,
    current:() => activeCasePointer() ? current() : Object.freeze({ case_id:null, case_map_digest:null, route_memory_digest:null }),
    refresh:async () => activeCasePointer() && refresh ? refresh() : null
  });
  doc.documentElement.dataset.ashPointerAuthoritativeSession = 'true';
  return true;
}

function setAttribute(node, name, value) {
  if (!node || node.getAttribute(name) === value) return false;
  node.setAttribute(name, value);
  return true;
}

function setData(node, key, value) {
  if (!node || node.dataset[key] === value) return false;
  node.dataset[key] = value;
  return true;
}

function setInert(node, inert) {
  if (!node) return false;
  let changed = false;
  if (inert) {
    if (!node.hasAttribute('inert')) { node.setAttribute('inert', ''); changed = true; }
    changed = setAttribute(node, 'aria-hidden', 'true') || changed;
  } else {
    if (node.hasAttribute('inert')) { node.removeAttribute('inert'); changed = true; }
    if (node.hasAttribute('aria-hidden')) { node.removeAttribute('aria-hidden'); changed = true; }
  }
  return changed;
}

function ensureAnimationAffordance() {
  const play = doc?.querySelector?.('[data-aia-play]');
  if (!play) return false;
  if (play.dataset.ashArtifactRequired !== 'false') play.dataset.ashArtifactRequired = 'false';
  if (play.title !== 'Runs immediately. No artifact upload is required.') play.title = 'Runs immediately. No artifact upload is required.';
  if (play.getAttribute('aria-label') !== 'Play the four-step explanation; no artifact upload is required') play.setAttribute('aria-label', 'Play the four-step explanation; no artifact upload is required');

  let note = byId('ashExplanationAvailability');
  if (!note) {
    note = doc.createElement('p');
    note.id = 'ashExplanationAvailability';
    note.className = 'ash-explanation-availability';
    note.setAttribute('role', 'note');
    play.closest('.ash-aia__guide-head')?.insertAdjacentElement('afterend', note);
  }
  const copy = REDUCED()
    ? 'Ready now · no artifact upload required. Reduced motion is on, so Ash shows the four deterministic frames statically.'
    : 'Ready now · no artifact upload required. Compact screens use the four-step motion track.';
  if (note.textContent !== copy) note.textContent = copy;
  setData(doc.documentElement, 'ashExplanationArtifactGate', 'NONE');
  setData(doc.documentElement, 'ashExplanationPresentation', REDUCED() ? 'STATIC_REDUCED_MOTION' : 'FINITE_FOUR_STEP_MOTION');
  return true;
}

function reconcileIngressDemoControls() {
  if (activeCasePointer()) return false;
  const profile = byId('newProfile');
  const button = byId('startDemo');
  const status = byId('demoProfileStatus');
  if (!profile || !button) return false;

  button.disabled = false;
  button.setAttribute('aria-disabled', 'false');
  button.setAttribute('aria-busy', 'false');
  button.classList.remove('demo-unavailable');
  button.classList.add('demo-available');
  for (const key of ['ashResearchControlState', 'ashLegalControlState', 'ashMethodDemoState']) delete button.dataset[key];
  if (/opening|hydrating|compiling/i.test(button.textContent || '')) button.textContent = 'Start a demo';

  profile.dispatchEvent(new Event('change', { bubbles:true }));
  if (profile.value === 'research') {
    host.__td613AshResearchControlState?.reconcile?.();
    if (status) status.innerHTML = '<strong>Research project demo available.</strong> Open the saved project below or start a fresh synthetic Research demo.';
  } else if (profile.value === 'legal') {
    host.__td613AshLegalControlState?.reconcile?.();
  }
  setData(doc.documentElement, 'ashClosedIngressControls', 'READY');
  return true;
}

function closedPresentationMatches() {
  if (!doc?.documentElement || activeCasePointer()) return false;
  const launch = byId('launch');
  const main = doc.querySelector('body > main');
  const rail = doc.querySelector('body > .workspace-rail');
  const startDemo = byId('startDemo');
  return Boolean(launch && main && rail)
    && doc.documentElement.dataset.ashSessionOpen === 'false'
    && doc.body.dataset.ashAiaCaseOpen === 'false'
    && !doc.documentElement.classList.contains('ash-has-current-case')
    && !launch.classList.contains('hidden')
    && !launch.hasAttribute('inert')
    && launch.getAttribute('aria-hidden') !== 'true'
    && main.hasAttribute('inert')
    && main.getAttribute('aria-hidden') === 'true'
    && rail.hasAttribute('inert')
    && rail.getAttribute('aria-hidden') === 'true'
    && startDemo?.getAttribute('aria-busy') !== 'true'
    && !/opening|hydrating|compiling/i.test(startDemo?.textContent || '')
    && host.__td613AshKeep?.pointer_authoritative_session === true
    && host.__td613AshKeep?.current?.().case_id == null;
}

function enforceClosedPresentation(reason = 'SESSION_POINTER_CLEARED') {
  if (!doc?.documentElement || activeCasePointer() || enforcing) return false;
  installPointerAuthoritativeCoreView();
  ensureAnimationAffordance();
  reconcileIngressDemoControls();
  if (closedPresentationMatches() && !localValue(SESSION_EPOCH_KEY)) return true;

  enforcing = true;
  try {
    const launch = byId('launch');
    const main = doc.querySelector('body > main');
    const rail = doc.querySelector('body > .workspace-rail');
    const closeLayout = doc.documentElement.dataset.ashSessionOpen !== 'false'
      || launch?.classList.contains('hidden')
      || Boolean(localValue(SESSION_EPOCH_KEY));

    doc.documentElement.classList.remove('ash-has-current-case');
    setData(doc.documentElement, 'ashSessionOpen', 'false');
    setData(doc.documentElement, 'ashCloseIngressBoundary', reason);
    setData(doc.body, 'ashAiaCaseOpen', 'false');
    setData(doc.body, 'ashCaseClosed', 'true');

    launch?.classList.remove('hidden');
    launch?.removeAttribute('inert');
    launch?.removeAttribute('aria-hidden');
    launch?.scrollTo?.({ top:0, behavior:'auto' });
    doc.querySelector('#launch .launch-panel')?.scrollTo?.({ top:0, behavior:'auto' });

    setInert(main, true);
    setInert(rail, true);
    if (rail?.dataset.ashAiaExactNavigation === 'RESTORED_FOR_OPEN_CASE') {
      main?.style.removeProperty('display');
      main?.style.removeProperty('visibility');
      for (const property of ['display', 'visibility', 'min-height', 'max-height', 'opacity']) rail.style.removeProperty(property);
      delete rail.dataset.ashAiaExactNavigation;
    }

    if (closeLayout) host.__td613AshIngressLayout?.closeSession?.();
    reconcileIngressDemoControls();
    setData(doc.documentElement, 'ashMembraneReady', 'true');
    host.dispatchEvent(new CustomEvent('td613:ash:close-ingress-restored', {
      detail:{ version:ASH_CLOSE_INGRESS_ANIMATION_BOUNDARY_VERSION, reason, case_pointer:null, animation_artifact_required:false }
    }));
    return true;
  } finally {
    enforcing = false;
  }
}

function settleClosedPresentation(reason) {
  const token = ++settleToken;
  const settle = () => {
    if (token !== settleToken || activeCasePointer()) return;
    enforceClosedPresentation(reason);
  };
  queueMicrotask(settle);
  host.requestAnimationFrame(() => host.requestAnimationFrame(settle));
  for (const delay of [80, 240, 800]) host.setTimeout(settle, delay);
}

function installStyles() {
  if (byId('td613-ash-close-ingress-animation-boundary-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-close-ingress-animation-boundary-css';
  style.textContent = `
    .ash-explanation-availability{margin:5px 0 8px;color:var(--aia-mint,var(--mint,#76ead4));font:700 .58rem/1.45 var(--mono,ui-monospace,monospace);letter-spacing:.02em}
    html[data-ash-session-open="false"] #launch.launch:not(.hidden){display:flex!important}
    html[data-ash-session-open="false"] #launch .launch-panel>*{position:relative!important;inset:auto!important;transform:none!important}
    html[data-ash-session-open="false"] #launch .launch-panel>p,
    html[data-ash-session-open="false"] #launch .launch-panel>[role="note"]{display:block!important;margin:8px 0 14px!important;line-height:1.55!important;max-width:680px!important}
    @media(max-width:760px){.ash-explanation-availability{font-size:.53rem;margin:4px 0 6px}}
  `;
  doc.head.append(style);
}

function installObserver() {
  if (observer) return;
  observer = new MutationObserver(() => {
    ensureAnimationAffordance();
    if (!activeCasePointer() && !closedPresentationMatches()) queueMicrotask(() => enforceClosedPresentation('POINTER_ABSENT_MUTATION_REPAIR'));
  });
  observer.observe(doc.documentElement, { attributes:true, attributeFilter:['class','data-ash-session-open'] });
  observer.observe(doc.body, { attributes:true, childList:true, subtree:true, attributeFilter:['class','hidden','inert','aria-hidden','data-ash-aia-case-open'] });
}

export function installAshCloseIngressAnimationBoundary() {
  if (!host || !doc?.body || host.__td613AshCloseIngressAnimationBoundary) return false;
  installStyles();
  installPointerAuthoritativeCoreView();
  ensureAnimationAffordance();
  installObserver();

  for (const type of ['core-ready', 'aia-ready', 'aia3-ready', 'composition-stable', 'case-closed']) {
    host.addEventListener(`td613:ash:${type}`, () => {
      if (type === 'core-ready') installPointerAuthoritativeCoreView();
      ensureAnimationAffordance();
      if (type === 'case-closed') settleClosedPresentation('CASE_CLOSED_EVENT');
    });
  }
  host.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change', ensureAnimationAffordance);
  if (!activeCasePointer()) settleClosedPresentation('BOOT_WITHOUT_ACTIVE_POINTER');

  host.__td613AshCloseIngressAnimationBoundary = Object.freeze({
    version:ASH_CLOSE_INGRESS_ANIMATION_BOUNDARY_VERSION,
    enforce:reason => enforceClosedPresentation(reason || 'EXPLICIT_ENFORCEMENT'),
    refresh:() => {
      installPointerAuthoritativeCoreView();
      ensureAnimationAffordance();
      reconcileIngressDemoControls();
      return activeCasePointer() ? false : enforceClosedPresentation('EXPLICIT_REFRESH');
    },
    current:() => Object.freeze({
      case_pointer:activeCasePointer(),
      session_open:activeCasePointer() !== null,
      launch_visible:Boolean(byId('launch') && getComputedStyle(byId('launch')).display !== 'none' && !byId('launch').classList.contains('hidden')),
      animation_artifact_required:false,
      reduced_motion:REDUCED(),
      explanation_presentation:doc.documentElement.dataset.ashExplanationPresentation || null,
      core_pointer_authoritative:Boolean(host.__td613AshKeep?.pointer_authoritative_session),
      closed_presentation_matches:closedPresentationMatches(),
      demo_control_busy:byId('startDemo')?.getAttribute('aria-busy') === 'true'
    })
  });
  doc.documentElement.dataset.ashCloseIngressAnimationBoundary = ASH_CLOSE_INGRESS_ANIMATION_BOUNDARY_VERSION;
  return true;
}

if (host && doc) installAshCloseIngressAnimationBoundary();
