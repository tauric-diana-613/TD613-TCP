import { compileAshCustodyPedagogueScene } from '../engine/ash-pedagogue-adapter.js';

const ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
const ORDER = Object.freeze(['arrival', 'readiness', 'provisional', 'verified', 'case_bound', 'stale_rebuild', 'rebuild_eligible']);
const PREVIOUS = Object.freeze({
  readiness: 'arrival',
  provisional: 'readiness',
  verified: 'provisional',
  case_bound: 'verified',
  stale_rebuild: 'verified',
  rebuild_eligible: 'case_bound'
});

const state = { data: null, scenario: 'arrival', route: 'EXPERIENTIAL', resting: false, packageView: null };

const clone = value => structuredClone(value);

function resolveSnapshot(name) {
  const source = clone(state.data.scenarios[name].snapshot);
  if (source.readinessReceipt === '$shared.readinessReceipt') source.readinessReceipt = clone(state.data.shared.readinessReceipt);
  if (source.custodyReceipt === '$shared.custodyReceipt') source.custodyReceipt = clone(state.data.shared.custodyReceipt);
  if (source.caseMap === '$scenarios.case_bound.snapshot.caseMap') source.caseMap = clone(state.data.scenarios.case_bound.snapshot.caseMap);
  return source;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function section(title, value, className = '') {
  const node = el('section', `ash-pedagogue__card ${className}`.trim());
  node.append(el('h3', null, title));
  node.append(el('p', null, value));
  return node;
}

function list(title, values) {
  const node = el('section', 'ash-pedagogue__card');
  node.append(el('h3', null, title));
  const ul = el('ul');
  for (const value of values || []) ul.append(el('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!ul.childElementCount) ul.append(el('li', null, 'None declared.'));
  node.append(ul);
  return node;
}

function setPressed(root, selector, value, key) {
  for (const button of root.querySelectorAll(selector)) button.setAttribute('aria-pressed', String(button.dataset[key] === String(value)));
}

async function compileCurrent() {
  const snapshot = resolveSnapshot(state.scenario);
  const previousName = PREVIOUS[state.scenario];
  const beforeSnapshot = previousName ? resolveSnapshot(previousName) : null;
  state.packageView = await compileAshCustodyPedagogueScene(snapshot, {
    ...state.data.determinism,
    idSeed: `${state.data.determinism.idSeed}:${state.scenario}`,
    cryptoImpl: globalThis.crypto,
    beforeSnapshot
  });
}

function render() {
  const root = document.querySelector('[data-ash-pedagogue]');
  const packageView = state.packageView;
  const view = packageView.aia_views[state.route];
  const frame = matchMedia('(prefers-reduced-motion: reduce)').matches
    ? packageView.reduced_mobile_frames[state.route]
    : packageView.desktop_frames[state.route];

  setPressed(root, '[data-scenario]', state.scenario, 'scenario');
  setPressed(root, '[data-route]', state.route, 'route');
  root.dataset.resting = String(state.resting);

  root.querySelector('[data-exact-state]').textContent = packageView.lifecycle.state;
  root.querySelector('[data-bounded-live]').textContent = state.resting
    ? 'Rest holds the exact local consequence. Return, recovery, replay, and exit remain available.'
    : packageView.world_delta.primary_consequence;

  const comprehension = root.querySelector('[data-comprehension]');
  comprehension.replaceChildren(
    section('What stayed local', packageView.comprehension_contract.what_stayed_local),
    section('What Ash created', packageView.comprehension_contract.what_ash_created),
    section('What changed in the case', packageView.comprehension_contract.what_changed_in_case),
    section('What did not become authorized', packageView.comprehension_contract.what_remains_unauthorized, 'ash-pedagogue__nonclaim'),
    section('What may happen next', packageView.comprehension_contract.what_may_happen_next)
  );

  const route = root.querySelector('[data-route-stage]');
  route.replaceChildren();
  route.append(section(`${view.route} route`, view.purpose));
  route.append(list('Route order', view.surface.order));
  route.append(list('Exact holds', packageView.hold_scenes.map(item => `${item.code}: ${item.consequence} Recovery: ${item.recovery}`)));
  route.append(list('Causal trace', packageView.world_delta.causal_trace));
  route.append(list('Missingness', view.invariants.missingness));
  route.append(list('Contradictions', view.invariants.contradictions));
  route.append(list('Allowed claims', view.claim_ceiling.allowed_claims));
  route.append(list('Forbidden claims', view.claim_ceiling.forbidden_claims));

  const inspection = el('section', 'ash-pedagogue__card');
  inspection.append(el('h3', null, 'Optional technical custody details'));
  inspection.append(el('pre', 'ash-pedagogue__inspection', JSON.stringify({
    lifecycle_state: packageView.lifecycle.state,
    lifecycle_next_action: packageView.lifecycle.next_action,
    lifecycle_holds: packageView.lifecycle.holds,
    lifecycle_references: packageView.lifecycle.references,
    gates: packageView.lifecycle.gates,
    world_delta: {
      case_map_digest_changed: packageView.world_delta.case_map_digest_changed,
      chronology_root_index: packageView.world_delta.chronology_root_index,
      rooms_open: packageView.world_delta.rooms_open,
      routes_open: packageView.world_delta.routes_open,
      stale_derivative_kinds: packageView.world_delta.stale_derivative_kinds,
      bytes_outside_case_map: packageView.world_delta.bytes_outside_case_map,
      transport_performed: packageView.world_delta.transport_performed
    },
    selected_route: view.route,
    reduced_motion: frame.reduced_motion,
    lifecycle_receipt: packageView.lifecycle_receipt.receipt_id,
    pedagogue_receipt: packageView.pedagogue_receipt.receipt_id,
    authority: packageView.authority,
    closure: packageView.closure
  }, null, 2)));
  route.append(inspection);
}

async function chooseScenario(name) {
  state.scenario = name;
  state.resting = false;
  const root = document.querySelector('[data-ash-pedagogue]');
  root.setAttribute('aria-busy', 'true');
  await compileCurrent();
  root.removeAttribute('aria-busy');
  render();
}

async function load() {
  const response = await fetch('./fixtures/pedagogue/ash-custody-pedagogue-scenarios.json');
  if (!response.ok) throw new Error('Ash custody pedagogue scenarios could not be loaded.');
  state.data = await response.json();
  const root = document.querySelector('[data-ash-pedagogue]');

  const scenarioNav = root.querySelector('[data-scenario-nav]');
  for (const name of ORDER) {
    const button = el('button', 'ash-pedagogue__choice', state.data.scenarios[name].label);
    button.type = 'button';
    button.dataset.scenario = name;
    button.setAttribute('aria-pressed', String(name === state.scenario));
    button.addEventListener('click', () => chooseScenario(name).catch(hold));
    scenarioNav.append(button);
  }

  const routeNav = root.querySelector('[data-route-nav]');
  for (const route of ROUTES) {
    const button = el('button', 'ash-pedagogue__choice', route);
    button.type = 'button';
    button.dataset.route = route;
    button.setAttribute('aria-pressed', String(route === state.route));
    button.addEventListener('click', () => {
      state.route = route;
      state.resting = false;
      render();
    });
    routeNav.append(button);
  }

  root.querySelector('[data-rest]').addEventListener('click', () => {
    state.resting = true;
    render();
  });
  root.querySelector('[data-return]').addEventListener('click', () => {
    state.resting = false;
    render();
  });
  root.querySelector('[data-replay]').addEventListener('click', () => chooseScenario(state.scenario).catch(hold));

  await compileCurrent();
  root.removeAttribute('aria-busy');
  render();
}

function hold(error) {
  const root = document.querySelector('[data-ash-pedagogue]');
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  root.querySelector('[data-bounded-live]').textContent = `Ash pedagogue held: ${error.message}`;
}

load().catch(hold);
