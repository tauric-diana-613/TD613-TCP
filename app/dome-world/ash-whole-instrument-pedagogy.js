export const ASH_WHOLE_INSTRUMENT_PEDAGOGY_VERSION = 'td613.ash.whole-instrument-pedagogy/v0.1-a2-a5';

const host = globalThis.window;
const doc = globalThis.document;
const STYLE_URL = '/dome-world/ash-whole-instrument-pedagogy.css?v=20260723-a2-a5-v1';
const ROUTE_KEY = 'td613:ash-keep:aia-route:v0.1';
const MENU_DISCOVERY_KEY = 'td613:ash:command-menu-discovered:v0.1';

const ROUTE_PRESENTATIONS = Object.freeze({
  EXPERIENTIAL: Object.freeze({
    label: 'Learn by doing',
    eyebrow: 'Follow one consequence at a time',
    heading: 'See the relation form through an explicit action.',
    emphasis: ['plain consequence', 'next bounded gesture', 'visible world answer'],
    order: ['condition', 'action', 'world answer', 'rest and return']
  }),
  CUSTODIAL: Object.freeze({
    label: 'Protect the source',
    eyebrow: 'Keep custody and boundary posture visible',
    heading: 'Trace what stays local before any derivative or crossing.',
    emphasis: ['local source', 'custody boundary', 'human authorization'],
    order: ['source posture', 'boundary', 'authorized action', 'continuity']
  }),
  AUDIT: Object.freeze({
    label: 'Check the evidence',
    eyebrow: 'Keep support, contradiction, and missingness together',
    heading: 'Inspect what the current evidence supports and withholds.',
    emphasis: ['source status', 'contradiction', 'missingness', 'claim ceiling'],
    order: ['evidence basis', 'causal trace', 'unresolved seam', 'claim ceiling']
  }),
  IMPLEMENTATION: Object.freeze({
    label: 'Inspect the machinery',
    eyebrow: 'Descend into exact state without widening authority',
    heading: 'Inspect lifecycle, receipts, digests, and deterministic rules.',
    emphasis: ['exact lifecycle', 'render receipt', 'action receipt', 'compiler rule'],
    order: ['state', 'receipt', 'digest', 'rule']
  })
});

const WORKSPACE_SCENES = Object.freeze({
  ingress: Object.freeze({
    title: 'Local source → lawful boundary → reference → relation → rest',
    condition: 'A source is present locally before custody or transport authority exists.',
    topology: ['local source', 'lawful boundary', 'reference', 'relation', 'rest'],
    consequence: 'Raw bytes remain local; a reference may form only through a lawful explicit action.',
    missingness: ['future custody and Case Map relations remain unearned'],
    anchor: 'ashFlowcoreTitle'
  }),
  home: Object.freeze({
    title: 'Priority → obligation → next bounded action → continuity',
    condition: 'The current case posture and next lawful action are gathered here.',
    topology: ['priority', 'obligation', 'bounded action', 'continuity'],
    consequence: 'Orientation changes; custody, source bytes, and release posture remain unchanged.',
    missingness: ['human review and later closure remain open'],
    anchor: 'premiumHomeBody'
  }),
  map: Object.freeze({
    title: 'Object → relation → route consequence → unresolved seam',
    condition: 'Objects and relations remain distinct from claims about truth or identity.',
    topology: ['object', 'relation', 'route consequence', 'unresolved seam'],
    consequence: 'The Case Map can expose structure while missingness and contradiction stay visible.',
    missingness: ['unresolved seams remain visible'],
    anchor: 'mapStage'
  }),
  work: Object.freeze({
    title: 'Task → local document or draft → human review → receipt',
    condition: 'Work remains local until an exact human-reviewed action changes its posture.',
    topology: ['task', 'local document or draft', 'human review', 'receipt'],
    consequence: 'A work product may advance without becoming transport, truth, or automatic release.',
    missingness: ['human review and recipient authority remain separate'],
    anchor: 'premiumWorkBody'
  }),
  choir: Object.freeze({
    title: 'Singleton A + singleton B → pair field → residue → rest',
    condition: 'Pairwise residue can be observed without becoming attribution or intent.',
    topology: ['singleton A', 'singleton B', 'pair field', 'residue', 'rest'],
    consequence: 'Interference remains evidence for human interpretation and carries no automatic Ash action.',
    missingness: ['matched controls and wider interpretation remain held'],
    anchor: 'choirProjectionList'
  }),
  capsule: Object.freeze({
    title: 'Preserved state → seal posture → destination boundary → return',
    condition: 'Continuity can be sealed locally while destination authority remains separate.',
    topology: ['preserved state', 'seal posture', 'destination boundary', 'return'],
    consequence: 'A Capsule preserves continuity; it proves neither external deletion nor universal transport.',
    missingness: ['recipient behavior and external state remain unknown'],
    anchor: 'premiumCapsuleBody'
  })
});

const WORKSPACE_ALIASES = Object.freeze({
  custody: 'map',
  rooms: 'map',
  routes: 'map',
  test: 'choir',
  draft: 'work',
  save: 'capsule'
});

const CHANNELS = Object.freeze({
  NOTICE: Object.freeze({ glyph:true, motion:false, shape:true, language:true, inspection:true }),
  ACT: Object.freeze({ glyph:false, motion:true, shape:true, language:true, inspection:true }),
  WORLD_ANSWERS: Object.freeze({ glyph:false, motion:true, shape:true, language:true, inspection:true }),
  NAME: Object.freeze({ glyph:true, motion:false, shape:true, language:true, inspection:true }),
  REST: Object.freeze({ glyph:true, motion:false, shape:true, language:true, inspection:true })
});

const CHANNEL_COPY = Object.freeze({
  glyph: 'Glyph names a preserved relation without certifying truth or identity.',
  motion: 'Motion shows causal order only while the explicit field clock is playing.',
  shape: 'Shape keeps source, boundary, relation, residue, and rest spatially distinct.',
  language: 'Language states the current consequence in plain terms before technical descent.',
  inspection: 'Inspection alone opens exact lifecycle, receipt, digest, and compiler state.'
});

let currentScene = null;
let currentNavigationReceipt = null;
let currentTransitionDelta = null;
let installed = false;
let landingComplete = false;

const reducedMotion = () => host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[character]);

function ensureStyle() {
  if (!doc?.head || doc.querySelector('link[data-ash-whole-instrument-pedagogy]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_URL;
  link.dataset.ashWholeInstrumentPedagogy = 'true';
  doc.head.append(link);
}

function exactRoute() {
  const live = host?.__td613AshLiveAIA?.current?.()?.route;
  if (ROUTE_PRESENTATIONS[live]) return live;
  try {
    const stored = host?.sessionStorage?.getItem(ROUTE_KEY);
    return ROUTE_PRESENTATIONS[stored] ? stored : 'EXPERIENTIAL';
  } catch {
    return 'EXPERIENTIAL';
  }
}

function lifecycleState() {
  return String(
    host?.__td613AshLiveAIA?.current?.()?.lifecycle_state
    || doc?.body?.dataset?.ashLifecycle
    || 'ARRIVAL_UNPERSISTED'
  ).toUpperCase();
}

function activeProfile() {
  return host?.__td613AshPremiumUI?.snapshot?.()?.profile
    || doc?.getElementById('newProfile')?.value
    || 'UNSELECTED';
}

function activeTask() {
  return host?.__td613AshLiveAIA?.current?.()?.task || 'setup';
}

function activeWorkspace() {
  const declared = doc?.documentElement?.dataset?.ashPremiumWorkspace;
  if (declared) return declared;
  const panel = doc?.querySelector?.('.workspace.active[id^="workspace-"]');
  return panel?.id?.replace('workspace-', '') || (doc?.getElementById('launch')?.classList.contains('hidden') ? 'home' : 'ingress');
}

function sceneKey(workspace = activeWorkspace()) {
  if (workspace === 'ingress') return 'ingress';
  return WORKSPACE_ALIASES[workspace] || workspace || 'home';
}

function freezeScene(value) {
  const copy = {
    ...value,
    topology: Object.freeze([...(value.topology || [])]),
    missingness: Object.freeze([...(value.missingness || [])]),
    contradictions: Object.freeze([...(value.contradictions || [])]),
    claim_ceiling: Object.freeze({
      allowed: Object.freeze([...(value.claim_ceiling?.allowed || [])]),
      forbidden: Object.freeze([...(value.claim_ceiling?.forbidden || [])])
    }),
    authority: Object.freeze({ ...(value.authority || {}) })
  };
  return Object.freeze(copy);
}

export function compileAshWorkspaceScene({
  workspace = activeWorkspace(),
  route = exactRoute(),
  lifecycle = lifecycleState(),
  profile = activeProfile(),
  task = activeTask()
} = {}) {
  const key = sceneKey(workspace);
  const base = WORKSPACE_SCENES[key] || WORKSPACE_SCENES.home;
  return freezeScene({
    schema: 'td613.ash.workspace-scene/v0.1',
    scene_id: `ash_scene_${key}_${String(lifecycle).toLowerCase()}`,
    workspace,
    workspace_scene: key,
    profile,
    lifecycle_state: lifecycle,
    aia_route: route,
    active_task: task,
    title: base.title,
    visible_condition: base.condition,
    topology: base.topology,
    consequence: base.consequence,
    missingness: base.missingness,
    contradictions: [],
    claim_ceiling: {
      allowed: ['presentation of current Ash posture', 'bounded causal relation', 'visible missingness'],
      forbidden: ['truth', 'identity', 'authorship', 'intent', 'automatic custody', 'automatic transport', 'automatic release', 'human closure']
    },
    anchor: base.anchor,
    static_parity: true,
    authority: {
      station_owner: 'ASH_KEEP',
      flowcore_commands_station: false,
      automatic_ash_action: false,
      source_bytes_moved: false,
      human_closure_required: true,
      route_inference: false
    }
  });
}

export function compileAshChannelState(phase = 'NOTICE', scene = currentScene || compileAshWorkspaceScene()) {
  const normalized = String(phase || 'NOTICE').toUpperCase();
  const states = CHANNELS[normalized] || CHANNELS.NOTICE;
  return Object.freeze({
    schema: 'td613.ash.channel-state/v0.1',
    phase: normalized,
    workspace_scene: scene.workspace_scene,
    glyph: Object.freeze({ active: states.glyph, meaning: CHANNEL_COPY.glyph }),
    motion: Object.freeze({ active: states.motion && !reducedMotion(), meaning: CHANNEL_COPY.motion }),
    shape: Object.freeze({ active: states.shape, meaning: CHANNEL_COPY.shape }),
    language: Object.freeze({ active: states.language, meaning: CHANNEL_COPY.language }),
    inspection: Object.freeze({ active: states.inspection, meaning: CHANNEL_COPY.inspection })
  });
}

function ensureFieldGrammar() {
  const field = doc?.querySelector?.('.ash-flowcore-field');
  if (!field) return false;
  const scene = currentScene || compileAshWorkspaceScene();
  const phase = field.dataset.flowcorePhaseName || doc.documentElement.dataset.ashFlowcorePhase || 'NOTICE';
  const channels = compileAshChannelState(phase, scene);

  field.dataset.ashWorkspaceScene = scene.workspace_scene;
  field.dataset.ashWorkspace = scene.workspace;
  field.dataset.ashAiaRoute = scene.aia_route;
  field.dataset.ashChannelState = channels.phase;
  field.setAttribute('aria-describedby', 'ashWholeInstrumentStaticTruth');

  const title = field.querySelector('#ashFlowcoreTitle');
  if (title) title.textContent = scene.title;
  const svgTitle = field.querySelector('#ashFlowcoreSvgTitle');
  if (svgTitle) svgTitle.textContent = `${scene.workspace_scene} consequence topology`;
  const svgDesc = field.querySelector('#ashFlowcoreSvgDesc');
  if (svgDesc) svgDesc.textContent = `${scene.visible_condition} ${scene.consequence} Missingness: ${scene.missingness.join(' ')}`;

  const play = doc.querySelector('[data-aia-play]');
  if (play) {
    play.textContent = '▶ Play Consequence Field';
    play.classList.add('ash-whole-instrument-play');
    play.setAttribute('aria-describedby', 'ashWholeInstrumentStaticTruth');
    if (play.parentElement !== field) field.append(play);
  }

  const footer = field.querySelector('.ash-flowcore-field__inspection');
  if (footer) {
    footer.classList.add('ash-channel-legend');
    footer.setAttribute('aria-label', 'How this scene is speaking');
    footer.innerHTML = `
      <span data-flowcore-channel="glyph">Glyph</span>
      <span data-flowcore-channel="motion">Motion</span>
      <span data-flowcore-channel="shape">Shape</span>
      <span data-flowcore-channel="language">Language</span>
      <button type="button" data-flowcore-channel="inspection">Inspection</button>
      <strong data-flowcore-exact-state>${escapeHtml(scene.lifecycle_state.replaceAll('_', ' '))}</strong>
      <em>visual coherence ≠ Ash authority</em>`;
    for (const [name, channel] of Object.entries(channels)) {
      if (!['glyph','motion','shape','language','inspection'].includes(name)) continue;
      const node = footer.querySelector(`[data-flowcore-channel="${name}"]`);
      if (!node) continue;
      node.dataset.channelActive = String(channel.active);
      node.setAttribute('aria-current', channel.active ? 'true' : 'false');
      node.title = channel.meaning;
    }
    const inspection = footer.querySelector('[data-flowcore-channel="inspection"]');
    inspection?.addEventListener('click', openInspection, { once:false });
  }

  let speaking = field.querySelector('.ash-channel-disclosure');
  if (!speaking) {
    speaking = doc.createElement('details');
    speaking.className = 'ash-channel-disclosure';
    speaking.innerHTML = '<summary>How this scene is speaking</summary><div></div>';
    field.append(speaking);
  }
  speaking.querySelector('div').innerHTML = ['glyph','motion','shape','language','inspection']
    .map(name => {
      const channel = channels[name];
      return `<p data-channel-explanation="${name}" data-channel-active="${channel.active}"><strong>${name[0].toUpperCase() + name.slice(1)}</strong><span>${escapeHtml(channel.meaning)}</span></p>`;
    }).join('');

  let staticTruth = field.querySelector('#ashWholeInstrumentStaticTruth');
  if (!staticTruth) {
    staticTruth = doc.createElement('section');
    staticTruth.id = 'ashWholeInstrumentStaticTruth';
    staticTruth.className = 'ash-whole-instrument-static';
    field.append(staticTruth);
  }
  staticTruth.innerHTML = `
    <h5>${escapeHtml(scene.workspace_scene === 'ingress' ? 'Ingress scene' : `${scene.workspace_scene[0].toUpperCase() + scene.workspace_scene.slice(1)} scene`)}</h5>
    <p><strong>Condition:</strong> ${escapeHtml(scene.visible_condition)}</p>
    <p><strong>Consequence:</strong> ${escapeHtml(scene.consequence)}</p>
    <p><strong>Route:</strong> ${escapeHtml(ROUTE_PRESENTATIONS[scene.aia_route]?.label || scene.aia_route)}</p>
    <p><strong>Missingness:</strong> ${escapeHtml(scene.missingness.join(' · ') || 'None declared')}</p>
    <p><strong>Claim ceiling:</strong> ${escapeHtml(scene.claim_ceiling.forbidden.join(' · '))}</p>`;
  return true;
}

function openInspection() {
  const exact = doc?.querySelector?.('[data-aia-exact]');
  if (!exact) return;
  exact.open = true;
  const summary = exact.querySelector('summary');
  summary?.focus?.({ preventScroll:true });
  exact.scrollIntoView?.({ block:'start', behavior:reducedMotion() ? 'auto' : 'smooth' });
  doc.documentElement.dataset.ashInspectionOpened = 'true';
}

function ensureAiaRouteSurface() {
  const membrane = doc?.getElementById?.('ashAiaMembrane');
  if (!membrane) return false;
  const eyebrow = membrane.querySelector('.ash-aia__eyebrow');
  const title = membrane.querySelector('#ashAiaTitle');
  const posture = membrane.querySelector('.ash-aia__posture');
  if (eyebrow) eyebrow.textContent = 'Your case path';
  if (title) title.textContent = 'Your case path';
  if (posture) posture.textContent = 'See what stays local, what may change, and where a human decision is still required.';

  membrane.querySelectorAll('[data-aia-route]').forEach(button => {
    const presentation = ROUTE_PRESENTATIONS[button.dataset.aiaRoute];
    if (!presentation) return;
    button.textContent = presentation.label;
    button.setAttribute('aria-label', `${presentation.label}: ${presentation.eyebrow}`);
  });

  const nav = membrane.querySelector('.ash-aia__routes');
  let surface = membrane.querySelector('[data-ash-route-surface]');
  if (!surface) {
    surface = doc.createElement('section');
    surface.className = 'ash-route-surface';
    surface.dataset.ashRouteSurface = 'true';
    surface.setAttribute('aria-live', 'polite');
    nav?.insertAdjacentElement('afterend', surface);
  }
  renderRouteSurface(surface);
  return true;
}

export function compileAshTransitionDelta(route = exactRoute(), previousRoute = null) {
  const presentation = ROUTE_PRESENTATIONS[route] || ROUTE_PRESENTATIONS.EXPERIENTIAL;
  const previous = ROUTE_PRESENTATIONS[previousRoute] || null;
  return Object.freeze({
    schema: 'td613.ash.transition-delta/v0.1',
    changed: Object.freeze([
      `explanation emphasis → ${presentation.emphasis.join(', ')}`,
      `visible order → ${presentation.order.join(' → ')}`,
      previous ? `route label → ${previous.label} to ${presentation.label}` : `route label → ${presentation.label}`
    ]),
    unchanged: Object.freeze([
      'case state',
      'authority',
      'source bytes',
      'custody',
      'claim ceiling',
      'release posture',
      'station ownership',
      'human closure'
    ]),
    world_delta_reference: currentScene?.scene_id || null,
    invariants_preserved: true,
    authority_changed: false,
    source_bytes_moved: false,
    custody_changed: false,
    claim_ceiling_changed: false,
    release_posture_changed: false,
    closure_changed: false
  });
}

function renderRouteSurface(surface, previousRoute = null) {
  const route = exactRoute();
  const presentation = ROUTE_PRESENTATIONS[route] || ROUTE_PRESENTATIONS.EXPERIENTIAL;
  currentTransitionDelta = compileAshTransitionDelta(route, previousRoute);
  surface.dataset.route = route;
  surface.innerHTML = `
    <div class="ash-route-surface__copy">
      <p>${escapeHtml(presentation.eyebrow)}</p>
      <h3>${escapeHtml(presentation.heading)}</h3>
      <ol>${presentation.order.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
    </div>
    <details class="ash-route-delta" open>
      <summary>What changed—and what did not</summary>
      <div>
        <section><h4>Changed in explanation</h4><ul>${currentTransitionDelta.changed.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
        <section><h4>Preserved exactly</h4><ul>${currentTransitionDelta.unchanged.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
      </div>
    </details>`;
  doc.documentElement.dataset.ashAiaHumanRoute = presentation.label;
  doc.documentElement.dataset.ashRouteDelta = 'PRESERVED_INVARIANTS';
}

function destinationForControl(control) {
  if (!control) return null;
  if (control.matches('[data-premium-workspace]')) return { workspace:control.dataset.premiumWorkspace, anchor:null };
  if (control.matches('[data-route-workspace]')) return { workspace:control.dataset.routeWorkspace, anchor:null };
  if (control.matches('[data-command-workspace]')) return { workspace:control.dataset.commandWorkspace, anchor:null };
  if (control.id === 'premiumReturnHome') return { workspace:'home', anchor:null };
  if (control.id === 'premiumContinuityButton') return { workspace:'capsule', anchor:null };
  if (control.dataset.commandAction === 'receipts') return { workspace:'work', anchor:'premiumReceiptInventory' };
  return null;
}

function sourceControlName(control) {
  return control.id
    || control.dataset.premiumWorkspace
    || control.dataset.routeWorkspace
    || control.dataset.commandWorkspace
    || control.dataset.commandAction
    || control.textContent?.trim()?.slice(0, 80)
    || 'unknown-control';
}

function semanticPanel(workspace) {
  return doc.getElementById(`workspace-${workspace}`);
}

function semanticHeading(panel) {
  return panel?.querySelector('.workspace-head h2, .premium-workspace-head h2, h2, h3') || null;
}

function updatePremiumSelection(workspace) {
  doc.querySelectorAll('[data-premium-workspace]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.premiumWorkspace === workspace));
  });
  doc.documentElement.dataset.ashPremiumWorkspace = workspace;
}

export function navigateAshWorkspace(workspace, {
  source_control = 'whole-instrument-api',
  anchor = null,
  open = true,
  return_path = activeWorkspace(),
  behavior = reducedMotion() ? 'auto' : 'smooth'
} = {}) {
  const destination = String(workspace || 'home');
  const before = return_path || activeWorkspace();
  const opener = host?.__td613OpenAshWorkspace || host?.__td613AshKeep?.openWorkspace;
  if (open && typeof opener === 'function') opener(destination);
  updatePremiumSelection(destination);
  if (['home','work','choir','capsule'].includes(sceneKey(destination))) {
    host?.__td613AshPremiumUI?.refresh?.();
  }

  const panel = semanticPanel(destination);
  const heading = semanticHeading(panel);
  const destinationAnchor = anchor ? doc.getElementById(anchor) : (panel?.querySelector(`#${WORKSPACE_SCENES[sceneKey(destination)]?.anchor}`) || panel);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll:true });
  }
  (destinationAnchor || panel || heading)?.scrollIntoView?.({ block:'start', inline:'nearest', behavior });

  currentNavigationReceipt = Object.freeze({
    schema: 'td613.ash.navigation-receipt/v0.1',
    source_control,
    source_workspace: before,
    destination_workspace: destination,
    destination_heading: heading?.textContent?.trim() || destination,
    destination_anchor: destinationAnchor?.id || panel?.id || null,
    prior_viewport_owner: 'ENTRANT',
    new_viewport_owner: 'EXPLICIT_NAVIGATION_GESTURE',
    return_path: before,
    result: panel ? 'ARRIVED' : 'HELD_DESTINATION_UNAVAILABLE'
  });
  doc.documentElement.dataset.ashNavigationReceipt = currentNavigationReceipt.result;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:navigation-receipt', {
    detail: currentNavigationReceipt
  }));
  refreshWholeInstrument('EXPLICIT_NAVIGATION');
  return currentNavigationReceipt;
}

function interceptExplicitNavigation(event) {
  const control = event.target?.closest?.(
    '[data-premium-workspace],[data-route-workspace],[data-command-workspace],#premiumReturnHome,#premiumContinuityButton,[data-command-action="receipts"]'
  );
  const destination = destinationForControl(control);
  if (!control || !destination) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  doc.getElementById('premiumCommandSheet')?.close?.();
  navigateAshWorkspace(destination.workspace, {
    source_control: sourceControlName(control),
    anchor: destination.anchor,
    open: true,
    return_path: activeWorkspace()
  });
}

function updateCommandDiscovery() {
  const button = doc.getElementById('premiumMenuButton');
  if (!button) return;
  let discovered = false;
  try { discovered = host.sessionStorage.getItem(MENU_DISCOVERY_KEY) === 'true'; } catch {}
  button.classList.toggle('ash-command-undiscovered', !discovered);
  button.classList.toggle('ash-command-discovered', discovered);
}

function discoverCommandMenu() {
  try { host.sessionStorage.setItem(MENU_DISCOVERY_KEY, 'true'); } catch {}
  updateCommandDiscovery();
}

function explicitHomeLanding(source) {
  if (landingComplete) return;
  landingComplete = true;
  queueMicrotask(() => navigateAshWorkspace('home', {
    source_control: source,
    open: false,
    return_path: 'ingress',
    behavior: 'auto'
  }));
}

export function refreshWholeInstrument(source = 'EXPLICIT_REFRESH') {
  currentScene = compileAshWorkspaceScene();
  ensureAiaRouteSurface();
  ensureFieldGrammar();
  updateCommandDiscovery();
  doc.documentElement.dataset.ashWholeInstrumentPedagogy = ASH_WHOLE_INSTRUMENT_PEDAGOGY_VERSION;
  host?.dispatchEvent?.(new CustomEvent('td613:ash:whole-instrument-refreshed', {
    detail: {
      version: ASH_WHOLE_INSTRUMENT_PEDAGOGY_VERSION,
      source,
      scene: currentScene,
      navigation_receipt: currentNavigationReceipt,
      transition_delta: currentTransitionDelta,
      authority_changed: false,
      source_bytes_moved: false
    }
  }));
  return currentScene;
}

function bindEvents() {
  doc.addEventListener('click', interceptExplicitNavigation, true);
  doc.addEventListener('click', event => {
    if (event.target?.closest?.('#premiumMenuButton')) discoverCommandMenu();
    const routeButton = event.target?.closest?.('[data-aia-route]');
    if (routeButton) {
      const previous = currentScene?.aia_route || null;
      queueMicrotask(() => {
        currentScene = compileAshWorkspaceScene();
        const surface = doc.querySelector('[data-ash-route-surface]');
        if (surface) renderRouteSurface(surface, previous);
        ensureFieldGrammar();
      });
    }
  });

  for (const type of [
    'aia-ready',
    'flowcore-field-mounted',
    'flowcore-field-phase',
    'lifecycle-updated',
    'core-mutated',
    'case-closed'
  ]) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => refreshWholeInstrument(`EVENT_${type.toUpperCase()}`)));
  }

  for (const type of ['case-opened','case-created','profile-demo-hydrated','capsule-opened']) {
    host.addEventListener(`td613:ash:${type}`, () => {
      explicitHomeLanding(`ingress-${type}`);
      queueMicrotask(() => refreshWholeInstrument(`EVENT_${type.toUpperCase()}`));
    });
  }

  host.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
    refreshWholeInstrument('MOTION_PREFERENCE_CHANGED');
  });
}

export function installAshWholeInstrumentPedagogy() {
  if (!host || !doc?.body || installed) return false;
  installed = true;
  ensureStyle();
  bindEvents();
  host.__td613AshWholeInstrument = Object.freeze({
    version: ASH_WHOLE_INSTRUMENT_PEDAGOGY_VERSION,
    refresh: refreshWholeInstrument,
    navigate: navigateAshWorkspace,
    current: () => Object.freeze({
      scene: currentScene,
      navigation_receipt: currentNavigationReceipt,
      transition_delta: currentTransitionDelta,
      route: exactRoute(),
      workspace: activeWorkspace(),
      authority_changed: false,
      source_bytes_moved: false,
      automatic_release: false,
      human_closure_required: true
    })
  });
  queueMicrotask(() => refreshWholeInstrument('INSTALL'));
  return true;
}

if (host && doc) installAshWholeInstrumentPedagogy();
