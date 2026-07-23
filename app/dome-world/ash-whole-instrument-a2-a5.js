export const ASH_WHOLE_INSTRUMENT_A2_A5_VERSION = 'td613.ash.whole-instrument-a2-a5/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
const LEGACY = typeof location !== 'undefined' && new URLSearchParams(location.search).get('presentation') === 'legacy';
const STYLE_URL = '/dome-world/ash-whole-instrument-a2-a5.css?v=20260723-a2-a5-v1';
const RECEIPT_KEY = 'td613:ash:navigation-receipts:v0.1';

const ROUTES = Object.freeze({
  EXPERIENTIAL: Object.freeze({
    label: 'Learn by doing',
    purpose: 'Lead with one bounded action and let the visible consequence teach the relation.',
    emphasis: ['plain consequence', 'one explicit gesture', 'rest and return'],
    order: ['condition', 'action', 'world answer', 'name', 'rest']
  }),
  CUSTODIAL: Object.freeze({
    label: 'Protect the source',
    purpose: 'Lead with local custody, source boundaries, and the human decision that remains open.',
    emphasis: ['what stays local', 'custody posture', 'unearned authority'],
    order: ['local source', 'boundary', 'reference', 'human decision', 'rest']
  }),
  AUDIT: Object.freeze({
    label: 'Check the evidence',
    purpose: 'Lead with provenance, missingness, contradictions, receipts, and the claim ceiling.',
    emphasis: ['source status', 'missingness', 'contradictions', 'receipt limits'],
    order: ['evidence', 'gap', 'world delta', 'receipt', 'claim ceiling']
  }),
  IMPLEMENTATION: Object.freeze({
    label: 'Inspect the machinery',
    purpose: 'Expose the exact lifecycle, compiler, route topology, and presentation-only authority.',
    emphasis: ['exact state', 'compiler route', 'render receipt', 'non-authority'],
    order: ['state', 'compiler', 'topology', 'receipt', 'boundary']
  })
});

const WORKSPACES = Object.freeze({
  ingress: Object.freeze({
    title: 'Local source → lawful boundary → reference → relation → rest',
    condition: 'Begin with a local source and an explicit human choice.',
    consequence: 'Nothing enters custody or crosses a destination boundary during ingress.',
    topology: ['local source', 'lawful boundary', 'reference', 'relation', 'rest']
  }),
  home: Object.freeze({
    title: 'Priority → obligation → next bounded action → continuity',
    condition: 'See what needs attention before opening a deeper instrument.',
    consequence: 'The next action remains bounded; continuity and uncertainty stay visible.',
    topology: ['priority', 'obligation', 'bounded action', 'continuity', 'rest']
  }),
  map: Object.freeze({
    title: 'Object → relation → route consequence → unresolved seam',
    condition: 'Read the case through objects, relations, and unresolved seams.',
    consequence: 'A relation can become visible without becoming identity, intent, or truth.',
    topology: ['object', 'relation', 'route consequence', 'unresolved seam', 'rest']
  }),
  work: Object.freeze({
    title: 'Task → local draft → human review → receipt',
    condition: 'Bring one bounded task into a local work surface.',
    consequence: 'Drafting and review remain local until a separate authorized boundary is crossed.',
    topology: ['task', 'local draft', 'human review', 'receipt', 'rest']
  }),
  choir: Object.freeze({
    title: 'Singleton A + singleton B → pair field → residue → rest',
    condition: 'Compare only the operator-selected pair.',
    consequence: 'Observed residue remains a bounded comparison, never attribution or truth.',
    topology: ['singleton A', 'singleton B', 'pair field', 'residue', 'rest']
  }),
  capsule: Object.freeze({
    title: 'Preserved state → seal posture → destination boundary → return',
    condition: 'Inspect continuity before sealing, exporting, opening, or returning.',
    consequence: 'A local seal preserves continuity without proving remote deletion or release authority.',
    topology: ['preserved state', 'seal posture', 'destination boundary', 'return', 'rest']
  })
});

const CHANNELS = Object.freeze({
  NOTICE: ['glyph', 'shape', 'language'],
  ACT: ['glyph', 'motion', 'shape', 'language'],
  WORLD_ANSWERS: ['glyph', 'motion', 'shape', 'language'],
  NAME: ['glyph', 'shape', 'language', 'inspection'],
  REST: ['glyph', 'shape', 'language', 'inspection']
});

const HEADING_BY_WORKSPACE = Object.freeze({
  home: '#workspace-home h2',
  map: '#workspace-map h2',
  work: '#workspace-work h2',
  choir: '#workspace-choir h2',
  capsule: '#workspace-capsule h2',
  custody: '#workspace-custody h2',
  rooms: '#workspace-rooms h2',
  routes: '#workspace-routes h2',
  test: '#workspace-test h2',
  draft: '#workspace-draft h2',
  save: '#workspace-save h2'
});

let currentWorkspace = 'ingress';
let currentRoute = 'EXPERIENTIAL';
let lastNavigationReceipt = null;
let firstMenuUse = false;

function ensureStyle() {
  if (!doc?.head || doc.querySelector('link[data-ash-a2-a5-style]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = STYLE_URL;
  link.dataset.ashA2A5Style = 'true';
  doc.head.append(link);
}

function exactLifecycle() {
  return host?.__td613AshLiveAIA?.current?.()?.lifecycle_state || doc?.body?.dataset?.ashLifecycle || 'ARRIVAL_UNPERSISTED';
}

function routeFromPage() {
  const raw = String(host?.__td613AshLiveAIA?.current?.()?.route || doc?.body?.dataset?.ashAiaRoute || currentRoute).toUpperCase();
  return ROUTES[raw] ? raw : 'EXPERIENTIAL';
}

function workspaceFromName(name) {
  if (WORKSPACES[name]) return name;
  if (['custody', 'rooms', 'routes'].includes(name)) return 'map';
  if (['test', 'draft'].includes(name)) return 'work';
  if (name === 'save') return 'capsule';
  return 'home';
}

function channelMeaning(name, scene) {
  const meanings = {
    glyph: `Glyph names the ${scene.topology[0]} relation without certifying it.`,
    motion: 'Motion shows change only while the canonical explicit field clock is active.',
    shape: `Shape holds the ${scene.topology.join(' → ')} topology.`,
    language: scene.consequence,
    inspection: `Inspection opens exact state ${exactLifecycle()} and presentation-only authority.`
  };
  return meanings[name];
}

function ensureCompositionSurface() {
  const membrane = doc?.getElementById('ashAiaMembrane');
  if (!membrane) return false;
  const eyebrow = membrane.querySelector('.ash-aia__eyebrow');
  if (eyebrow) eyebrow.textContent = 'Your case path';
  const title = membrane.querySelector('#ashAiaTitle');
  if (title) title.textContent = 'See what stays local, what may change, and where a human decision is still required.';

  const routes = membrane.querySelector('.ash-aia__routes');
  if (routes) {
    routes.setAttribute('aria-label', 'Choose how this case path is explained');
    routes.querySelectorAll('[data-aia-route]').forEach(button => {
      const route = button.dataset.aiaRoute;
      if (ROUTES[route]) {
        button.textContent = ROUTES[route].label;
        button.title = ROUTES[route].purpose;
      }
    });
    if (!membrane.querySelector('[data-a2-a5-route-surface]')) {
      const surface = doc.createElement('section');
      surface.className = 'ash-a2-a5-route-surface';
      surface.dataset.a2A5RouteSurface = 'true';
      surface.setAttribute('aria-live', 'polite');
      routes.insertAdjacentElement('afterend', surface);
    }
  }

  const play = membrane.querySelector('[data-aia-play]');
  if (play && !play.textContent.trim().startsWith('▶')) play.textContent = '▶ Play Consequence Field';

  if (!membrane.querySelector('[data-a2-a5-navigation-receipt]')) {
    const receipt = doc.createElement('output');
    receipt.className = 'ash-a2-a5-navigation-receipt';
    receipt.dataset.a2A5NavigationReceipt = 'true';
    receipt.setAttribute('aria-live', 'polite');
    receipt.hidden = true;
    membrane.append(receipt);
  }
  return true;
}

function ensureFieldGrammar() {
  const field = doc?.querySelector('.ash-flowcore-field');
  if (!field) return false;
  const footer = field.querySelector('.ash-flowcore-field__inspection');
  if (footer) {
    footer.classList.add('ash-a2-a5-channel-legend');
    footer.setAttribute('aria-label', 'How this scene is speaking');
    footer.querySelectorAll('span').forEach(span => {
      const channel = span.textContent.trim().toLowerCase();
      if (!['glyph', 'motion', 'shape', 'language', 'inspection'].includes(channel)) return;
      span.dataset.flowcoreChannel = channel;
      span.setAttribute('role', channel === 'inspection' ? 'button' : 'status');
      span.tabIndex = channel === 'inspection' ? 0 : -1;
    });
    let disclosure = field.querySelector('[data-a2-a5-channel-disclosure]');
    if (!disclosure) {
      disclosure = doc.createElement('details');
      disclosure.className = 'ash-a2-a5-channel-disclosure';
      disclosure.dataset.a2A5ChannelDisclosure = 'true';
      disclosure.innerHTML = '<summary>How this scene is speaking</summary><div data-a2-a5-channel-copy></div>';
      footer.insertAdjacentElement('afterend', disclosure);
    }
  }
  const canvas = field.querySelector('.ash-flowcore-field__canvas');
  let control = field.querySelector('[data-a2-a5-play]');
  if (canvas && !control) {
    control = doc.createElement('button');
    control.type = 'button';
    control.className = 'ash-a2-a5-play';
    control.dataset.a2A5Play = 'true';
    control.textContent = '▶ Play Consequence Field';
    control.addEventListener('click', () => host?.__td613AshFlowcoreField?.play?.());
    canvas.append(control);
  }
  return true;
}

function renderChannels() {
  const field = doc?.querySelector('.ash-flowcore-field');
  if (!field) return;
  const phase = String(field.dataset.flowcorePhaseName || 'NOTICE').toUpperCase();
  const active = new Set(CHANNELS[phase] || CHANNELS.NOTICE);
  const scene = WORKSPACES[currentWorkspace] || WORKSPACES.ingress;
  field.querySelectorAll('[data-flowcore-channel]').forEach(node => {
    const name = node.dataset.flowcoreChannel;
    const on = active.has(name);
    node.dataset.channelActive = String(on);
    node.setAttribute('aria-current', on ? 'true' : 'false');
    node.setAttribute('aria-label', `${name}: ${on ? 'active' : 'inactive'} in ${phase.replaceAll('_', ' ')}`);
  });
  const copy = field.querySelector('[data-a2-a5-channel-copy]');
  if (copy) {
    copy.innerHTML = ['glyph', 'motion', 'shape', 'language', 'inspection']
      .map(name => `<p data-channel-copy="${name}"><strong>${name}</strong><span>${channelMeaning(name, scene)}</span></p>`)
      .join('');
  }
  field.dataset.a2A5StaticParity = 'condition action route consequence missingness claim-ceiling rest return';
}

function renderRouteSurface(reason = 'STATE_OBSERVED') {
  currentRoute = routeFromPage();
  const surface = doc?.querySelector('[data-a2-a5-route-surface]');
  if (!surface) return;
  const route = ROUTES[currentRoute];
  surface.dataset.route = currentRoute;
  surface.innerHTML = `
    <div><p>Selected explanation route</p><h3>${route.label}</h3><span>${route.purpose}</span></div>
    <ol aria-label="Route emphasis">${route.order.map(item => `<li>${item}</li>`).join('')}</ol>
    <details open><summary>What changed—and what did not</summary>
      <div class="ash-a2-a5-route-delta">
        <section><h4>Changed</h4><p>Explanation order and emphasis: ${route.emphasis.join(', ')}.</p></section>
        <section><h4>Unchanged</h4><p>Case state, authority, source bytes, custody, provenance, missingness, contradictions, causal structure, claim ceiling, station ownership, observation status, and release posture.</p></section>
      </div>
    </details>`;
  doc.documentElement.dataset.ashA2A5Route = currentRoute;
  doc.documentElement.dataset.ashA2A5RouteReason = reason;
}

function renderWorkspaceScene(name, reason = 'STATE_OBSERVED') {
  currentWorkspace = workspaceFromName(name);
  const scene = WORKSPACES[currentWorkspace];
  const field = doc?.querySelector('.ash-flowcore-field');
  if (!field) return;
  field.dataset.a2A5Workspace = currentWorkspace;
  field.dataset.a2A5Scene = `td613.ash.workspace-scene/${currentWorkspace}/v0.1`;
  field.dataset.a2A5SingleClock = 'true';
  const heading = field.querySelector('.ash-flowcore-field__header h4');
  if (heading) heading.textContent = scene.title;
  const consequence = field.querySelector('[data-flowcore-consequence]');
  if (consequence) consequence.textContent = scene.condition;
  const technical = field.querySelector('[data-flowcore-technical]');
  if (technical) technical.textContent = scene.consequence;
  field.querySelectorAll('.ash-flowcore-static li p').forEach((node, index) => {
    const relation = scene.topology[index] || 'rest';
    node.textContent = `${relation}: ${index === 0 ? scene.condition : scene.consequence}`;
  });
  const svgTitle = field.querySelector('#ashFlowcoreSvgTitle');
  if (svgTitle) svgTitle.textContent = `${currentWorkspace} consequence topology`;
  const svgDesc = field.querySelector('#ashFlowcoreSvgDesc');
  if (svgDesc) svgDesc.textContent = `${scene.title}. ${scene.consequence}`;
  renderChannels();
  renderRouteSurface(reason);
  doc.documentElement.dataset.ashA2A5Workspace = currentWorkspace;
  host?.dispatchEvent(new CustomEvent('td613:ash:a2-a5-scene-compiled', {
    detail: Object.freeze({
      schema: 'td613.ash.workspace-scene/v0.1',
      workspace: currentWorkspace,
      route: currentRoute,
      lifecycle_state: exactLifecycle(),
      topology: [...scene.topology],
      one_field: true,
      one_clock: true,
      automatic_ash_action: false,
      source_bytes_moved: false,
      authority_changed: false,
      human_closure_required: true,
      reason
    })
  }));
}

function rememberReceipt(receipt) {
  lastNavigationReceipt = Object.freeze(receipt);
  try {
    const prior = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || '[]');
    prior.push(receipt);
    sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(prior.slice(-40)));
  } catch {}
  const output = doc?.querySelector('[data-a2-a5-navigation-receipt]');
  if (output) {
    output.hidden = false;
    output.textContent = `Arrived at ${receipt.destination_heading}. Return path: ${receipt.return_path}.`;
  }
}

function semanticArrival({ sourceControl, sourceWorkspace, destination, returnPath = 'home' }) {
  const selector = HEADING_BY_WORKSPACE[destination] || HEADING_BY_WORKSPACE[workspaceFromName(destination)];
  const heading = doc?.querySelector(selector);
  const panel = heading?.closest('.workspace') || doc?.getElementById(`workspace-${destination}`);
  if (!heading || !panel) return null;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  panel.scrollIntoView({ block: 'start', behavior: host?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const receipt = {
    schema: 'td613.ash.navigation-receipt/v0.1',
    source_control: sourceControl || 'unknown',
    source_workspace: sourceWorkspace || currentWorkspace,
    destination_workspace: destination,
    destination_heading: heading.textContent.trim(),
    destination_anchor: panel.id,
    prior_viewport_owner: 'ENTRANT',
    new_viewport_owner: 'EXPLICIT_NAVIGATION_GESTURE',
    return_path: returnPath,
    completion_state: 'ARRIVED',
    result: 'ARRIVED',
    automatic_background_scroll: false
  };
  rememberReceipt(receipt);
  renderWorkspaceScene(destination, 'EXPLICIT_NAVIGATION_GESTURE');
  host?.dispatchEvent(new CustomEvent('td613:ash:navigation-arrived', { detail: receipt }));
  return receipt;
}

function destinationForControl(control) {
  return control?.dataset?.premiumWorkspace
    || control?.dataset?.routeWorkspace
    || control?.dataset?.commandWorkspace
    || control?.dataset?.workspace
    || null;
}

function bindNavigation() {
  host?.addEventListener('click', event => {
    const menuButton = event.target?.closest?.('#premiumMenuButton');
    if (menuButton) {
      firstMenuUse = true;
      menuButton.dataset.discovered = 'true';
    }
    const control = event.target?.closest?.('[data-premium-workspace],[data-route-workspace],[data-command-workspace],.work-tab[data-workspace]');
    const destination = destinationForControl(control);
    if (!destination) return;
    const sourceWorkspace = currentWorkspace;
    queueMicrotask(() => semanticArrival({
      sourceControl: control.id || control.dataset.premiumWorkspace || control.dataset.routeWorkspace || control.dataset.commandWorkspace || control.dataset.workspace,
      sourceWorkspace,
      destination,
      returnPath: sourceWorkspace === 'ingress' ? 'home' : sourceWorkspace
    }));
  }, true);

  doc?.addEventListener('click', event => {
    const routeButton = event.target?.closest?.('[data-aia-route]');
    if (routeButton) queueMicrotask(() => {
      currentRoute = routeButton.dataset.aiaRoute;
      renderRouteSurface('EXPLICIT_ROUTE_SELECTION');
      renderWorkspaceScene(currentWorkspace, 'EXPLICIT_ROUTE_SELECTION');
    });
    const inspection = event.target?.closest?.('[data-flowcore-channel="inspection"]');
    if (inspection) doc.querySelector('[data-aia-exact]')?.setAttribute('open', '');
  });

  doc?.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target?.matches?.('[data-flowcore-channel="inspection"]')) {
      event.preventDefault();
      doc.querySelector('[data-aia-exact]')?.setAttribute('open', '');
    }
  });

  for (const type of ['case-opened', 'case-created', 'profile-demo-hydrated', 'capsule-opened']) {
    host?.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => {
      semanticArrival({ sourceControl: `event:${type}`, sourceWorkspace: 'ingress', destination: 'home', returnPath: 'home' });
    }));
  }

  host?.addEventListener('td613:ash:flowcore-field-phase', () => renderChannels());
  host?.addEventListener('td613:ash:aia-ready', () => {
    ensureCompositionSurface();
    ensureFieldGrammar();
    renderWorkspaceScene(currentWorkspace, 'AIA_READY');
  });
}

function exposeApi() {
  host.__td613AshWholeInstrumentA2A5 = Object.freeze({
    version: ASH_WHOLE_INSTRUMENT_A2_A5_VERSION,
    navigate: (destination, sourceControl = 'EXPLICIT_API') => semanticArrival({
      sourceControl,
      sourceWorkspace: currentWorkspace,
      destination,
      returnPath: currentWorkspace
    }),
    setWorkspace: name => renderWorkspaceScene(name, 'EXPLICIT_API'),
    refresh: () => {
      ensureCompositionSurface();
      ensureFieldGrammar();
      renderWorkspaceScene(currentWorkspace, 'EXPLICIT_REFRESH');
    },
    current: () => Object.freeze({
      workspace: currentWorkspace,
      route: currentRoute,
      lifecycle_state: exactLifecycle(),
      last_navigation_receipt: lastNavigationReceipt,
      one_field: doc.querySelectorAll('.ash-flowcore-field').length === 1,
      one_clock: true,
      menu_discovered: firstMenuUse,
      automatic_ash_action: false,
      source_bytes_moved: false,
      authority_changed: false,
      human_closure_required: true
    })
  });
}

function boot() {
  if (!host || !doc?.body || LEGACY || host.__td613AshWholeInstrumentA2A5) return false;
  ensureStyle();
  exposeApi();
  bindNavigation();
  ensureCompositionSurface();
  ensureFieldGrammar();
  renderWorkspaceScene(doc.querySelector('.workspace.active')?.id?.replace('workspace-', '') || 'ingress', 'BOOT');
  doc.documentElement.dataset.ashA2A5Ready = 'true';
  doc.documentElement.dataset.ashA2A5Version = ASH_WHOLE_INSTRUMENT_A2_A5_VERSION;
  host.dispatchEvent(new CustomEvent('td613:ash:a2-a5-ready', { detail: host.__td613AshWholeInstrumentA2A5.current() }));
  return true;
}

boot();
