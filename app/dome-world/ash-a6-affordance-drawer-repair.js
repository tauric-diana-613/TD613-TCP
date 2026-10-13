export const ASH_A6_AFFORDANCE_VERSION = 'td613.ash.a6-affordance-drawer-repair/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const LESSON_ORDER = Object.freeze(['setup', 'document', 'custody', 'work']);
const PRINCIPAL_ROOT_SELECTOR = '#ashAiaMembrane,#workspace-home,#workspace-work,#workspace-choir,#workspace-capsule,#premiumCommandSheet';
const REST_DEMAND_SELECTOR = [
  '[data-aia-play]',
  '[data-aia-previous]',
  '[data-aia-next]',
  '[data-aia-task]',
  '[data-aia-primary-task]',
  '[data-aia-open-workspace]',
  '[data-aia-route]'
].join(',');

const HELD_COPY = Object.freeze({
  runPremiumChoir: Object.freeze({
    missing: 'two recorded Route Memory entries',
    why: 'A pairwise assay cannot compare fewer than two bounded routes.',
    satisfy: 'Record a second route, then return to Choir.',
    change: 'The local deterministic pairwise assay becomes available.',
    unchanged: 'Case state, custody, transport, release posture, and human closure remain unchanged.'
  }),
  replayPremiumChoir: Object.freeze({
    missing: 'a completed pairwise assay receipt',
    why: 'Replay requires an exact prior assay receipt.',
    satisfy: 'Run one pairwise assay first.',
    change: 'The exact receipt may be replayed without rerunning the Reader.',
    unchanged: 'Storage, case state, custody, transport, release posture, and human closure remain unchanged.'
  }),
  downloadPremiumChoir: Object.freeze({
    missing: 'a completed pairwise assay receipt',
    why: 'There is no bounded receipt to export yet.',
    satisfy: 'Run one pairwise assay first.',
    change: 'A local JSON copy of the exact receipt may be downloaded.',
    unchanged: 'Export grants no transport authority, custody authority, release authority, or human closure.'
  }),
  premiumSealSave: Object.freeze({
    missing: 'an open local case',
    why: 'A Save Point requires a current Case Map and local continuity state.',
    satisfy: 'Open or create a case.',
    change: 'The existing Ash continuity engine may seal a local Save Point.',
    unchanged: 'Sealing proves neither external deletion, destination acceptance, release authority, nor human closure.'
  }),
  premiumExportCapsule: Object.freeze({
    missing: 'an open local case',
    why: 'An encrypted Capsule copy requires current local case continuity.',
    satisfy: 'Open or create a case.',
    change: 'The existing Ash continuity engine may prepare an encrypted local copy.',
    unchanged: 'No destination crossing, recipient authority, release authority, or human closure is created.'
  }),
  premiumInspectSave: Object.freeze({
    missing: 'a completed local Save Point',
    why: 'There is no exact continuity receipt to inspect yet.',
    satisfy: 'Seal one Save Point through the existing Ash control.',
    change: 'The exact local continuity receipt becomes inspectable.',
    unchanged: 'The current Case Map is not overwritten and custody, release, transport, and closure authority remain unchanged.'
  })
});

let installed = false;
let lastWorldAnswer = null;
let lastReceipt = null;
const contracts = new Map();

const byId = id => doc?.getElementById(id);
const reducedMotion = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[character]);

function visible(node) {
  if (!node?.isConnected || node.hidden) return false;
  const style = host.getComputedStyle?.(node);
  if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0) return false;
  const rect = node.getBoundingClientRect?.();
  return Boolean(rect && rect.width > 0 && rect.height > 0);
}

function ensureStyles() {
  if (!doc?.head || byId('td613-ash-a6-affordance-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-a6-affordance-css';
  style.textContent = `
    .ash-a6-work-affordances{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 14px}
    .ash-a6-surface{min-width:0;padding:15px;border:1px solid rgba(118,234,212,.24);background:rgba(3,15,12,.82)}
    .ash-a6-surface:focus-within{border-color:rgba(228,198,108,.62);box-shadow:0 0 0 1px rgba(228,198,108,.12)}
    .ash-a6-surface h3{margin:3px 0 7px;font:500 1.25rem/1.05 var(--serif,Georgia,serif)}
    .ash-a6-surface p{margin:6px 0;color:var(--muted,#9ab4aa);font-size:.76rem;line-height:1.5}
    .ash-a6-surface textarea{width:100%;min-height:150px;margin-top:9px;padding:10px;border:1px solid rgba(118,234,212,.24);background:#010806;color:var(--paper,#fff8da);line-height:1.5;resize:vertical}
    .ash-a6-world-answer{min-height:1.35em;margin:8px 0 0;color:var(--mint,#76ead4);font:650 .66rem/1.45 var(--mono,ui-monospace,monospace)}
    .ash-a6-held-explanation{margin:5px 0 9px;padding:8px 9px;border-left:2px solid rgba(228,198,108,.62);background:rgba(228,198,108,.055);color:var(--muted,#9ab4aa);font-size:.68rem;line-height:1.45}
    .ash-a6-transition-intro{margin:0 0 10px;padding:8px 10px;border-left:2px solid rgba(118,234,212,.55);background:rgba(118,234,212,.045);font-size:.74rem;line-height:1.5}
    .ash-a6-empty-repair{margin:8px 0;padding:9px 10px;border:1px dashed rgba(118,234,212,.2);color:var(--muted,#9ab4aa);font-size:.72rem;line-height:1.5}
    [data-ash-affordance-state="LEGEND_ONLY"]{cursor:default!important;pointer-events:none!important}
    button[data-ash-affordance-state="HELD_WITH_EXPLANATION"]{cursor:not-allowed!important}
    @media(max-width:760px){.ash-a6-work-affordances{grid-template-columns:1fr}.ash-a6-surface textarea{min-height:132px}}
  `;
  doc.head.append(style);
}

function activeWorkspace() {
  return doc?.documentElement?.dataset?.ashPremiumWorkspace
    || doc?.querySelector?.('.workspace.active[id^="workspace-"]')?.id?.replace('workspace-', '')
    || 'home';
}

function publishWorldAnswer(controlId, message, detail = {}) {
  lastWorldAnswer = Object.freeze({
    schema:'td613.ash.a6-world-answer/v0.1',
    control_id:controlId,
    message,
    observed_at:new Date().toISOString(),
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    release_posture_changed:false,
    closure_changed:false,
    ...detail
  });
  const status = byId('ashA6GlobalStatus') || byId('ashA6LessonStatus') || doc?.querySelector?.('[data-aia-live]');
  if (status) status.textContent = message;
  doc.documentElement.dataset.ashA6WorldAnswer = controlId;
  host.dispatchEvent(new CustomEvent('td613:ash:a6-world-answer', { detail:lastWorldAnswer }));
  return lastWorldAnswer;
}

function createContract(control, {
  state = 'READY',
  prerequisites = [],
  destination = null,
  expectedWorldDelta = null,
  heldExplanation = null
} = {}) {
  if (!control) return null;
  const contract = Object.freeze({
    schema:'td613.ash.affordance-contract/v0.1',
    control_id:control.id || control.dataset.aiaTask || control.dataset.commandAction || control.textContent?.trim() || 'unnamed-control',
    visible_label:control.textContent?.trim() || control.getAttribute('aria-label') || 'Unnamed control',
    state,
    prerequisites:Object.freeze([...prerequisites]),
    action_owner:'ASH_KEEP',
    expected_world_delta:expectedWorldDelta,
    destination,
    held_explanation:heldExplanation,
    rest_preserved:true,
    return_preserved:true,
    authority_changed:false,
    source_bytes_moved:false
  });
  contracts.set(contract.control_id, contract);
  control.dataset.ashAffordanceState = state;
  return contract;
}

function ensureGlobalStatus() {
  const membrane = byId('ashAiaMembrane');
  if (!membrane) return null;
  let status = byId('ashA6GlobalStatus');
  if (!status) {
    status = doc.createElement('p');
    status.id = 'ashA6GlobalStatus';
    status.className = 'ash-a6-world-answer';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Every principal control now publishes a visible world answer or a complete held explanation.';
    membrane.querySelector('.ash-aia__body')?.insertAdjacentElement('afterend', status);
  }
  return status;
}

function focusSurface(surface, focusTarget) {
  surface?.scrollIntoView?.({ block:'start', inline:'nearest', behavior:reducedMotion() ? 'auto' : 'smooth' });
  queueMicrotask(() => focusTarget?.focus?.({ preventScroll:true }));
}

function navigateToWork({ anchor, focusId, sourceControl, answer }) {
  ensureWorkSurfaces();
  const navigate = host?.__td613AshWholeInstrument?.navigate;
  if (typeof navigate === 'function') {
    lastReceipt = navigate('work', {
      source_control:sourceControl,
      anchor,
      open:true,
      return_path:activeWorkspace(),
      behavior:reducedMotion() ? 'auto' : 'smooth'
    });
  } else {
    host?.__td613AshPremiumUI?.open?.('work');
    lastReceipt = Object.freeze({
      schema:'td613.ash.navigation-receipt/v0.1',
      source_control:sourceControl,
      source_workspace:activeWorkspace(),
      destination_workspace:'work',
      destination_heading:'Work Queue',
      destination_anchor:anchor,
      prior_viewport_owner:'ENTRANT',
      new_viewport_owner:'EXPLICIT_NAVIGATION_GESTURE',
      return_path:activeWorkspace(),
      result:'ARRIVED'
    });
  }
  const surface = byId(anchor);
  focusSurface(surface, byId(focusId) || surface);
  publishWorldAnswer(sourceControl, answer, { navigation_receipt:lastReceipt });
  return lastReceipt;
}

function syncDraftProxy() {
  const proxy = byId('ashA6DraftBody');
  const exact = byId('draftBody');
  if (!proxy || !exact || doc.activeElement === proxy) return;
  if (proxy.value !== exact.value) proxy.value = exact.value;
}

function ensureWorkSurfaces() {
  const workspace = byId('workspace-work');
  const premiumBody = byId('premiumWorkBody');
  if (!workspace || !premiumBody) return false;
  let root = byId('ashA6WorkAffordances');
  if (!root) {
    root = doc.createElement('section');
    root.id = 'ashA6WorkAffordances';
    root.className = 'ash-a6-work-affordances';
    root.setAttribute('aria-label', 'Local document and draft surfaces');
    root.innerHTML = `
      <section class="ash-a6-surface" id="ashA6LocalDocumentSurface" aria-labelledby="ashA6LocalDocumentTitle">
        <p class="premium-kicker">Local document</p>
        <h3 id="ashA6LocalDocumentTitle" tabindex="-1">Open a local document</h3>
        <p>Choose a text, Markdown, CSV, or JSON file. Its bytes remain in this browser and are not transported by the pedagogy layer.</p>
        <button type="button" class="premium-action primary" id="ashA6ChooseLocalDocument">Choose local document</button>
        <p class="ash-a6-world-answer" id="ashA6LocalDocumentStatus" role="status" aria-live="polite">No local document selected in this session.</p>
      </section>
      <section class="ash-a6-surface" id="ashA6DraftSurface" aria-labelledby="ashA6DraftTitle">
        <p class="premium-kicker">Draft surface</p>
        <h3 id="ashA6DraftTitle" tabindex="-1">Draft locally in Work</h3>
        <p>This field mirrors the exact Ash draft body. Editing here changes only the local draft surface and performs no release or transport.</p>
        <label for="ashA6DraftBody" class="sr-only">Local draft body</label>
        <textarea id="ashA6DraftBody" aria-describedby="ashA6DraftStatus"></textarea>
        <p class="ash-a6-world-answer" id="ashA6DraftStatus" role="status" aria-live="polite">Local draft ready. Human review remains required.</p>
      </section>`;
    premiumBody.insertAdjacentElement('beforebegin', root);
  }

  const choose = byId('ashA6ChooseLocalDocument');
  const fileInput = byId('localTextFile');
  if (choose && choose.dataset.ashA6Bound !== 'true') {
    choose.dataset.ashA6Bound = 'true';
    choose.addEventListener('click', () => {
      if (!fileInput) {
        publishWorldAnswer('ashA6ChooseLocalDocument', 'Local document control held: the exact browser-local file input has not mounted yet. Retry after Ash finishes opening Work.');
        return;
      }
      fileInput.click();
      publishWorldAnswer('ashA6ChooseLocalDocument', 'The browser-local file chooser opened. Choosing a file will not upload, release, or transport it.');
    });
    createContract(choose, {
      destination:{ workspace:'work', anchor:'ashA6LocalDocumentSurface' },
      expectedWorldDelta:{ file_picker:'OPENED_BY_EXPLICIT_GESTURE', transport:false }
    });
  }
  if (fileInput && fileInput.dataset.ashA6Bound !== 'true') {
    fileInput.dataset.ashA6Bound = 'true';
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0] || null;
      const status = byId('ashA6LocalDocumentStatus');
      const message = file
        ? `${file.name} is visible to the local Ash draft surface. Its bytes remain in this browser.`
        : 'No local document selected in this session.';
      if (status) status.textContent = message;
      publishWorldAnswer('localTextFile', message, { local_file_selected:Boolean(file), transport:false });
    });
  }

  const proxy = byId('ashA6DraftBody');
  const exact = byId('draftBody');
  if (proxy && proxy.dataset.ashA6Bound !== 'true') {
    proxy.dataset.ashA6Bound = 'true';
    proxy.addEventListener('input', () => {
      if (exact && exact.value !== proxy.value) {
        exact.value = proxy.value;
        exact.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:null }));
      }
      const message = proxy.value.trim()
        ? 'The local draft changed. Review, custody, release, transport, and closure remain separate human-gated actions.'
        : 'The local draft is empty. Human review remains required before any later action.';
      const status = byId('ashA6DraftStatus');
      if (status) status.textContent = message;
      publishWorldAnswer('ashA6DraftBody', message, { local_draft_changed:true, transport:false });
    });
    createContract(proxy, {
      destination:{ workspace:'work', anchor:'ashA6DraftSurface' },
      expectedWorldDelta:{ local_draft_changed:true, transport:false, release:false }
    });
  }
  syncDraftProxy();
  return true;
}

function interceptWorkAffordance(event) {
  const control = event.target?.closest?.('[data-aia-primary-task],[data-aia-open-workspace]');
  if (!control || host?.__td613AshLiveAIA?.current?.()?.task !== 'document') return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (control.matches('[data-aia-primary-task]')) {
    navigateToWork({
      anchor:'ashA6LocalDocumentSurface',
      focusId:'ashA6ChooseLocalDocument',
      sourceControl:'openLocalDocument',
      answer:'Work opened at the local-document surface. The source remains browser-local and no transport occurred.'
    });
  } else {
    navigateToWork({
      anchor:'ashA6DraftSurface',
      focusId:'ashA6DraftBody',
      sourceControl:'openDraftWorkspace',
      answer:'Work opened at the local draft surface. Editing remains local; review and release authority did not change.'
    });
  }
  return true;
}

function lessonIndex() {
  const frame = doc?.querySelector?.('[data-aia-stage]')?.dataset?.frame || LESSON_ORDER[0];
  const index = LESSON_ORDER.indexOf(frame);
  return index >= 0 ? index : 0;
}

function lessonHoldText(direction, index) {
  if (direction === 'previous' && index === 0) {
    return 'Missing: an earlier lesson. This control is held because the current scene is already first. Moving backward would change nothing; the current consequence, inspection, return, custody, release posture, and human closure remain unchanged.';
  }
  if (direction === 'next' && index === LESSON_ORDER.length - 1) {
    return 'Missing: a later lesson. This control is held because the current scene is already last. Moving forward would change nothing; the current consequence, inspection, return, custody, release posture, and human closure remain unchanged.';
  }
  return null;
}

function ensureLessonStatus() {
  const controls = doc?.querySelector?.('.ash-aia__lesson-controls');
  if (!controls) return null;
  let status = byId('ashA6LessonStatus');
  if (!status) {
    status = doc.createElement('p');
    status.id = 'ashA6LessonStatus';
    status.className = 'ash-a6-world-answer';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    controls.insertAdjacentElement('afterend', status);
  }
  return status;
}

function updateLessonControls(source = 'REFRESH') {
  const previous = doc?.querySelector?.('[data-aia-previous]');
  const next = doc?.querySelector?.('[data-aia-next]');
  const status = ensureLessonStatus();
  if (!previous || !next || !status) return;
  previous.textContent = 'Previous Lesson';
  next.textContent = 'Next Lesson';
  const index = lessonIndex();
  const resting = doc.body?.dataset?.ashAiaResting === 'true';

  for (const [control, direction, boundary] of [
    [previous, 'previous', index === 0],
    [next, 'next', index === LESSON_ORDER.length - 1]
  ]) {
    const held = resting || boundary;
    control.disabled = held;
    control.setAttribute('aria-disabled', String(held));
    control.setAttribute('aria-describedby', 'ashA6LessonStatus');
    if (held) {
      const explanation = resting
        ? 'Structural Rest is active. Return first; the current consequence remains inspectable and no new demand advances.'
        : lessonHoldText(direction, index);
      createContract(control, { state:'HELD_WITH_EXPLANATION', prerequisites:[resting ? 'return from structural Rest' : direction === 'previous' ? 'a prior lesson' : 'a later lesson'], heldExplanation:explanation });
    } else {
      createContract(control, {
        state:'READY',
        destination:{ workspace:activeWorkspace(), anchor:doc.querySelector('[data-aia-stage]')?.id || 'ashAiaMembrane' },
        expectedWorldDelta:{ lesson_index:index + (direction === 'next' ? 1 : -1), ash_action:false }
      });
    }
  }

  status.textContent = source === 'LESSON_GESTURE'
    ? `Lesson ${index + 1} of ${LESSON_ORDER.length}: ${LESSON_ORDER[index]}. The explanation changed; no Ash action, custody action, transport, release, or closure occurred.`
    : lessonHoldText('previous', index) || lessonHoldText('next', index) || `Lesson ${index + 1} of ${LESSON_ORDER.length} is active. Previous and Next change only the deterministic explanation.`;
}

function restoreControlFromRest(control) {
  if (!control?.dataset.ashA6DisabledBeforeRest) return;
  control.disabled = control.dataset.ashA6DisabledBeforeRest === 'true';
  delete control.dataset.ashA6DisabledBeforeRest;
  control.removeAttribute('data-ash-a6-rest-held');
}

function updateRestState(source = 'REFRESH') {
  const resting = doc.body?.dataset?.ashAiaResting === 'true';
  const rest = doc?.querySelector?.('[data-aia-rest]');
  const returning = doc?.querySelector?.('[data-aia-return]');
  const status = ensureLessonStatus();
  if (rest) {
    rest.textContent = '𝄐 Rest';
    rest.dataset.ashAffordanceState = 'READY';
    rest.setAttribute('aria-describedby', 'ashA6LessonStatus');
  }
  if (returning) {
    returning.textContent = 'Return';
    returning.dataset.ashAffordanceState = 'READY';
    returning.setAttribute('aria-describedby', 'ashA6LessonStatus');
  }

  doc.querySelectorAll(REST_DEMAND_SELECTOR).forEach(control => {
    if (control.matches('[data-aia-rest],[data-aia-return]')) return;
    if (resting) {
      if (!control.dataset.ashA6DisabledBeforeRest) control.dataset.ashA6DisabledBeforeRest = String(Boolean(control.disabled));
      control.disabled = true;
      control.dataset.ashA6RestHeld = 'true';
      control.dataset.ashAffordanceState = 'HELD_WITH_EXPLANATION';
      control.setAttribute('aria-describedby', 'ashA6LessonStatus');
    } else restoreControlFromRest(control);
  });

  doc.documentElement.dataset.ashA6Rest = resting ? 'STRUCTURAL_REST' : 'AVAILABLE';
  if (status && resting) {
    status.textContent = '𝄐 Structural Rest: new lesson, route, task, and Play demands are held. The current consequence, exact inspection, continuity, return, exit, and human closure posture remain available.';
  } else if (status && source === 'RETURN_GESTURE') {
    status.textContent = 'Returned from structural Rest. The same case and consequence remain; explicit explanation controls are available again.';
  }
  updateLessonControls(source);
}

function interceptRestDemand(event) {
  if (doc.body?.dataset?.ashAiaResting !== 'true') return false;
  const control = event.target?.closest?.(REST_DEMAND_SELECTOR);
  if (!control || control.matches('[data-aia-rest],[data-aia-return]')) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  publishWorldAnswer(control.id || control.dataset.aiaTask || 'rest-held-control', 'Structural Rest is active. Return first; the current consequence remains inspectable and no new demand, Ash action, transport, release, or closure occurred.');
  return true;
}

function heldMessage(copy) {
  return `Missing: ${copy.missing}. ${copy.why} Lawful step: ${copy.satisfy} When satisfied: ${copy.change} Preserved: ${copy.unchanged}`;
}

function explainHeldControl(control, copy) {
  if (!control || !copy) return;
  const id = `${control.id}A6Hold`;
  let note = byId(id);
  if (control.disabled) {
    if (!note) {
      note = doc.createElement('p');
      note.id = id;
      note.className = 'ash-a6-held-explanation';
      control.insertAdjacentElement('afterend', note);
    }
    const message = heldMessage(copy);
    note.textContent = message;
    control.setAttribute('aria-describedby', id);
    createContract(control, { state:'HELD_WITH_EXPLANATION', prerequisites:[copy.missing], heldExplanation:message });
  } else {
    note?.remove();
    if (control.getAttribute('aria-describedby') === id) control.removeAttribute('aria-describedby');
    createContract(control, { state:'READY' });
  }
}

function updateHeldControls() {
  for (const [id, copy] of Object.entries(HELD_COPY)) explainHeldControl(byId(id), copy);

  const profile = doc?.querySelector?.('[data-command-action="profile"]');
  if (profile) {
    profile.querySelector('strong')?.replaceChildren('Cases & profiles');
    createContract(profile, {
      state:'READY',
      destination:{ workspace:'ingress', anchor:'newProfile' },
      expectedWorldDelta:{ case_profile_switcher:'OPEN', automatic_profile_inference:false }
    });
  }

  const setup = doc?.querySelector?.('[data-aia-primary-task]');
  if (setup && host?.__td613AshLiveAIA?.current?.()?.task === 'setup') {
    setup.textContent = 'Open Workspace Setup';
    createContract(setup, {
      state:'READY',
      destination:{ workspace:'ingress', anchor:'newProfile' },
      expectedWorldDelta:{ setup_surface:'OPEN', custody:false, transport:false }
    });
  }
}

function renderTransitionDelta() {
  const delta = host?.__td613AshWholeInstrument?.current?.()?.transition_delta || null;
  const routeDrawer = doc?.querySelector?.('.ash-route-delta');
  if (routeDrawer) {
    let intro = routeDrawer.querySelector('.ash-a6-transition-intro');
    if (!intro) {
      intro = doc.createElement('p');
      intro.className = 'ash-a6-transition-intro';
      routeDrawer.querySelector('summary')?.insertAdjacentElement('afterend', intro);
    }
    intro.innerHTML = '<strong>You changed how Ash explains this case.</strong><br>The underlying case state did not change.';
    if (!routeDrawer.querySelector('section,ul,ol')) {
      const body = doc.createElement('div');
      body.className = 'ash-a6-empty-repair';
      body.textContent = delta
        ? `Explanation changed: ${delta.changed.join(' · ')}. Preserved: ${delta.unchanged.join(' · ')}.`
        : 'No route transition has occurred yet. Case state, source bytes, custody, claim ceiling, release posture, station ownership, and human closure remain unchanged.';
      routeDrawer.append(body);
    }
  }

  const legacyDrawer = doc?.querySelector?.('.ash-aia__consequences');
  const legacyBody = legacyDrawer?.querySelector?.('[data-aia-five]');
  if (legacyDrawer && legacyBody && !legacyBody.textContent.trim()) {
    legacyBody.innerHTML = '<p class="ash-a6-empty-repair">No state delta has been observed yet. The current case, source bytes, custody, claim ceiling, release posture, and human closure remain unchanged.</p>';
  }
}

function repairEmptyDisclosures() {
  doc.querySelectorAll(`${PRINCIPAL_ROOT_SELECTOR} details`).forEach(details => {
    const content = [...details.children].filter(child => child.tagName !== 'SUMMARY');
    const meaningful = content.some(child => child.textContent?.trim() || child.querySelector?.('input,button,textarea,select,pre,table,svg'));
    if (meaningful || details.querySelector('.ash-a6-empty-repair')) return;
    const note = doc.createElement('p');
    note.className = 'ash-a6-empty-repair';
    note.textContent = 'No additional state is available in this disclosure. Nothing changed; case state, source bytes, custody, claim ceiling, release posture, and human closure remain unchanged.';
    details.append(note);
  });
}

function markLegends() {
  doc.querySelectorAll('[data-flowcore-channel]:not(button),.premium-chip,.workspace-mark').forEach(node => {
    node.dataset.ashAffordanceState = 'LEGEND_ONLY';
    node.setAttribute('role', node.matches('.premium-chip') ? 'status' : 'note');
    if (!node.getAttribute('aria-label')) node.setAttribute('aria-label', `${node.textContent?.trim() || 'Visual marker'}; informational legend only`);
  });
}

function normalizeDocumentControls() {
  const task = host?.__td613AshLiveAIA?.current?.()?.task;
  const primary = doc?.querySelector?.('[data-aia-primary-task]');
  const exact = doc?.querySelector?.('[data-aia-open-workspace]');
  if (task === 'document') {
    if (primary) {
      primary.textContent = 'Open Local Document';
      primary.setAttribute('aria-label', 'Open Local Document in Work');
      createContract(primary, {
        state:'READY',
        destination:{ workspace:'work', anchor:'ashA6LocalDocumentSurface' },
        expectedWorldDelta:{ local_document_surface:'FOCUSED', transport:false }
      });
    }
    if (exact) {
      exact.textContent = 'Open Draft Workspace';
      exact.hidden = false;
      exact.setAttribute('aria-label', 'Open Draft Workspace in Work');
      createContract(exact, {
        state:'READY',
        destination:{ workspace:'work', anchor:'ashA6DraftSurface' },
        expectedWorldDelta:{ local_draft_surface:'FOCUSED', transport:false, release:false }
      });
    }
  }
}

export function refreshAshA6Affordances(source = 'EXPLICIT_REFRESH') {
  if (!doc?.body) return false;
  ensureStyles();
  ensureGlobalStatus();
  ensureWorkSurfaces();
  normalizeDocumentControls();
  updateRestState(source);
  updateHeldControls();
  renderTransitionDelta();
  repairEmptyDisclosures();
  markLegends();
  syncDraftProxy();
  doc.documentElement.dataset.ashA6AffordanceRepair = ASH_A6_AFFORDANCE_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:a6-affordance-refreshed', {
    detail:{
      version:ASH_A6_AFFORDANCE_VERSION,
      source,
      contract_count:contracts.size,
      rest_state:doc.documentElement.dataset.ashA6Rest,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      closure_changed:false
    }
  }));
  return true;
}

function bindEvents() {
  doc.addEventListener('click', event => {
    if (interceptRestDemand(event)) return;
    interceptWorkAffordance(event);
  }, true);

  doc.addEventListener('click', event => {
    const control = event.target?.closest?.('[data-aia-previous],[data-aia-next],[data-aia-rest],[data-aia-return],[data-aia-route],[data-command-action="profile"]');
    if (!control) return;
    queueMicrotask(() => {
      const source = control.matches('[data-aia-previous],[data-aia-next]')
        ? 'LESSON_GESTURE'
        : control.matches('[data-aia-rest]')
          ? 'REST_GESTURE'
          : control.matches('[data-aia-return]')
            ? 'RETURN_GESTURE'
            : 'CONTROL_GESTURE';
      refreshAshA6Affordances(source);
      if (control.matches('[data-command-action="profile"]')) {
        publishWorldAnswer('casesAndProfiles', 'The explicit case and profile switcher opened. No profile was inferred and no case state changed merely by opening the selector.');
      }
    });
  });

  for (const type of [
    'aia-ready',
    'whole-instrument-refreshed',
    'premium-ready',
    'case-opened',
    'case-created',
    'profile-demo-hydrated',
    'core-mutated',
    'rebuild-kept',
    'continuity-kept',
    'capsule-opened',
    'case-closed'
  ]) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => refreshAshA6Affordances(`EVENT_${type.toUpperCase()}`)));
  }
}

export function installAshA6AffordanceRepair() {
  if (!host || !doc?.body || installed) return false;
  installed = true;
  ensureStyles();
  bindEvents();
  host.__td613AshA6Affordances = Object.freeze({
    version:ASH_A6_AFFORDANCE_VERSION,
    refresh:refreshAshA6Affordances,
    current:() => Object.freeze({
      rest_state:doc.documentElement.dataset.ashA6Rest || 'UNKNOWN',
      contract_count:contracts.size,
      contracts:Object.freeze([...contracts.values()]),
      last_world_answer:lastWorldAnswer,
      last_navigation_receipt:lastReceipt,
      authority_changed:false,
      source_bytes_moved:false,
      custody_changed:false,
      release_posture_changed:false,
      closure_changed:false,
      human_closure_required:true
    })
  });
  queueMicrotask(() => refreshAshA6Affordances('INSTALL'));
  return true;
}

if (host && doc) installAshA6AffordanceRepair();
