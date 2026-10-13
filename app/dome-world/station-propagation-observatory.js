import { compileStationPropagationBundle } from '../engine/flowcore-station-propagation.js';

const ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
const state = { bundle: null, stationIndex: 0, route: 'EXPERIENTIAL', resting: false };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function list(title, values, className = '') {
  const section = el('section', `station-propagation__panel ${className}`.trim());
  section.append(el('h3', null, title));
  const ul = el('ul');
  for (const value of values || []) ul.append(el('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!ul.childElementCount) ul.append(el('li', null, 'None declared.'));
  section.append(ul);
  return section;
}

function setPressed(root, selector, value, key) {
  for (const button of root.querySelectorAll(selector)) button.setAttribute('aria-pressed', String(button.dataset[key] === String(value)));
}

function renderResponsibility(root) {
  const matrix = root.querySelector('[data-responsibility-matrix]');
  matrix.replaceChildren();
  for (const [role, stations] of Object.entries(state.bundle.responsibility_matrix)) {
    const row = el('article', 'station-propagation__responsibility');
    row.append(el('h3', null, role));
    row.append(el('p', null, stations.join(' · ')));
    matrix.append(row);
  }
}

function render() {
  const root = document.querySelector('[data-station-propagation]');
  const packageView = state.bundle.station_packages[state.stationIndex];
  const view = packageView.aia_views[state.route];
  const frame = matchMedia('(prefers-reduced-motion: reduce)').matches
    ? packageView.reduced_mobile_frames[state.route]
    : packageView.desktop_frames[state.route];

  setPressed(root, '[data-station-index]', state.stationIndex, 'stationIndex');
  setPressed(root, '[data-route]', state.route, 'route');
  root.dataset.resting = String(state.resting);
  root.querySelector('[data-origin-station]').textContent = packageView.origin_station;
  root.querySelector('[data-bounded-live]').textContent = state.resting
    ? 'Rest holds the station result. Provenance, responsibility, replay, return, and exit remain available.'
    : `${packageView.origin_station}: ${packageView.phase_sequence[2].static_equivalent.summary}`;

  const stage = root.querySelector('[data-station-stage]');
  stage.replaceChildren();
  stage.append(list('Station responsibility', [
    `origin station: ${packageView.origin_station}`,
    `roles: ${packageView.station_responsibility.responsibility_roles.join(', ')}`,
    `operational action: ${packageView.station_responsibility.operational_action_reference}`,
    `action authority: ${packageView.station_responsibility.operational_action_authority}`,
    'Dome-World hosts the scene; Flow-Core contextualizes only.'
  ]));
  stage.append(list('Station-specific evidence', Object.entries(packageView.station_responsibility.evidence).map(([key, value]) => `${key}: ${value}`)));
  stage.append(list(`${view.route} route`, [view.purpose, `order: ${view.surface.order.join(' → ')}`]));
  stage.append(list('Causal trace', packageView.phase_sequence[2].causal_trace.map(item => item.step)));
  stage.append(list('Missingness', view.invariants.missingness));
  stage.append(list('Contradictions', view.invariants.contradictions));
  stage.append(list('Allowed claims', view.claim_ceiling.allowed_claims));
  stage.append(list('Forbidden claims', view.claim_ceiling.forbidden_claims, 'station-propagation__nonclaim'));
  stage.append(list('Annotation-only sidecars', packageView.sidecars.map(sidecar => `${sidecar.station}: ${sidecar.observation_summary} · advance=${sidecar.can_advance_cycle} · mutate=${sidecar.can_mutate_station}`)));

  const inspection = el('section', 'station-propagation__panel');
  inspection.append(el('h3', null, 'Propagation receipt inspection'));
  inspection.append(el('pre', 'station-propagation__inspection', JSON.stringify({
    bundle_id: state.bundle.bundle_id,
    bundle_digest: state.bundle.bundle_digest,
    station_package_id: packageView.package_id,
    station_package_digest: packageView.package_digest,
    selected_route: view.route,
    reduced_motion: frame.reduced_motion,
    responsibility_matrix: state.bundle.responsibility_matrix,
    station_receipt: packageView.pedagogue_receipt.receipt_id,
    propagation_receipt: state.bundle.propagation_receipt.receipt_id,
    receipts_may_cross: state.bundle.propagation_receipt.receipts_may_cross,
    observations_may_cross: state.bundle.propagation_receipt.observations_may_cross,
    raw_content_may_cross: state.bundle.propagation_receipt.raw_content_may_cross,
    authority_may_cross: state.bundle.propagation_receipt.authority_may_cross,
    automatic_phase_advance: state.bundle.propagation_receipt.automatic_phase_advance,
    automatic_station_mutation: state.bundle.propagation_receipt.automatic_station_mutation,
    release_authorized: state.bundle.propagation_receipt.release_authorized,
    closure: state.bundle.propagation_receipt.closure
  }, null, 2)));
  stage.append(inspection);
}

async function compile() {
  const response = await fetch('./fixtures/pedagogue/cross-station-propagation.json');
  if (!response.ok) throw new Error('Cross-station propagation fixtures could not be loaded.');
  const data = await response.json();
  state.bundle = await compileStationPropagationBundle(data.fixtures, { cryptoImpl: globalThis.crypto });
}

async function replay() {
  const root = document.querySelector('[data-station-propagation]');
  root.setAttribute('aria-busy', 'true');
  await compile();
  root.removeAttribute('aria-busy');
  state.resting = false;
  renderResponsibility(root);
  render();
}

async function load() {
  await compile();
  const root = document.querySelector('[data-station-propagation]');
  const stationNav = root.querySelector('[data-station-nav]');
  state.bundle.station_packages.forEach((packageView, index) => {
    const button = el('button', 'station-propagation__choice', packageView.origin_station);
    button.type = 'button';
    button.dataset.stationIndex = String(index);
    button.setAttribute('aria-pressed', String(index === state.stationIndex));
    button.addEventListener('click', () => {
      state.stationIndex = index;
      state.resting = false;
      render();
    });
    stationNav.append(button);
  });

  const routeNav = root.querySelector('[data-route-nav]');
  for (const route of ROUTES) {
    const button = el('button', 'station-propagation__choice', route);
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
  root.querySelector('[data-replay]').addEventListener('click', () => replay().catch(hold));

  root.removeAttribute('aria-busy');
  renderResponsibility(root);
  render();
}

function hold(error) {
  const root = document.querySelector('[data-station-propagation]');
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  root.querySelector('[data-bounded-live]').textContent = `Station propagation held: ${error.message}`;
}

load().catch(hold);
