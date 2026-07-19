import { compileInformationDomeField } from '../engine/information-dome-field.js';

const FIXTURES = Object.freeze([
  './fixtures/pedagogue/gluing-soft-fold.json',
  './fixtures/pedagogue/phason-content-invariant.json',
  './fixtures/pedagogue/moire-pair-emergence.json'
]);

const ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
const state = { field: null, sceneIndex: 0, route: 'EXPERIENTIAL', resting: false };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function list(title, values) {
  const section = element('section', 'flowcore-pedagogue__channel');
  section.append(element('h3', null, title));
  const items = element('ul');
  for (const value of values || []) items.append(element('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!items.childElementCount) items.append(element('li', null, 'None declared.'));
  section.append(items);
  return section;
}

function setPressed(container, selector, value, attribute) {
  for (const button of container.querySelectorAll(selector)) {
    button.setAttribute('aria-pressed', String(button.dataset[attribute] === String(value)));
  }
}

function sceneLabel(sceneKind) {
  return {
    GLUING_OBSTRUCTION: 'Rooms and the visible seam',
    CONTENT_INVARIANT_PHASON: 'Fixed source, changed projection',
    PAIR_EMERGENT_MOIRE: 'Pair-only bridge'
  }[sceneKind] || sceneKind;
}

function render() {
  const root = document.querySelector('[data-flowcore-pedagogue]');
  const packageView = state.field.scene_packages[state.sceneIndex];
  const view = packageView.aia_views[state.route];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = reduced ? packageView.reduced_mobile_frames[state.route] : packageView.desktop_frames[state.route];

  setPressed(root, '[data-scene-index]', state.sceneIndex, 'sceneIndex');
  setPressed(root, '[data-route]', state.route, 'route');

  const title = root.querySelector('[data-scene-title]');
  title.textContent = sceneLabel(packageView.scene_kind);

  const live = root.querySelector('[data-bounded-live]');
  live.textContent = state.resting
    ? 'Rest holds the recent consequence. Return, replay, and exit remain available.'
    : `${view.route}: ${view.purpose}`;

  const stage = root.querySelector('[data-scene-stage]');
  stage.replaceChildren();

  const consequence = element('section', 'flowcore-pedagogue__channel');
  consequence.append(element('h3', null, 'What the world answered'));
  consequence.append(element('p', null, packageView.phase_sequence[3].name?.plain_language || packageView.phase_sequence[2].static_equivalent.summary));
  consequence.append(element('p', 'information-dome__nonclaim', packageView.required_nonclaim));
  stage.append(consequence);

  const route = element('section', 'flowcore-pedagogue__channel');
  route.append(element('h3', null, `${view.route} route`));
  route.append(element('p', null, view.purpose));
  route.append(element('p', null, `Order: ${view.surface.order.join(' → ')}`));
  stage.append(route);

  stage.append(list('Causal trace', packageView.phase_sequence[2].causal_trace.map(item => item.step)));
  stage.append(list('Missingness', view.invariants.missingness));
  stage.append(list('Contradictions', view.invariants.contradictions));
  stage.append(list('Alternative explanations', packageView.research_frame.alternative_explanations));
  stage.append(list('Falsifier', packageView.research_frame.falsifier));
  stage.append(list('Claim ceiling — allowed', view.claim_ceiling.allowed_claims));
  stage.append(list('Claim ceiling — forbidden', view.claim_ceiling.forbidden_claims));

  const inspection = element('section', 'flowcore-pedagogue__channel');
  inspection.append(element('h3', null, 'Inspection'));
  inspection.append(element('pre', 'information-dome__inspection', JSON.stringify({
    scene_kind: packageView.scene_kind,
    field_model: packageView.field_model,
    station_owner: view.station_owner,
    authorized_actions: view.authorized_actions,
    reduced_motion: frame.reduced_motion,
    closure: view.closure,
    authority: view.authority
  }, null, 2)));
  stage.append(inspection);

  root.dataset.resting = String(state.resting);
}

async function load() {
  const responses = await Promise.all(FIXTURES.map(path => fetch(path)));
  for (const response of responses) if (!response.ok) throw new Error(`Fixture load failed: ${response.url}`);
  const fixtures = await Promise.all(responses.map(response => response.json()));
  state.field = await compileInformationDomeField(fixtures, { cryptoImpl: globalThis.crypto });

  const root = document.querySelector('[data-flowcore-pedagogue]');
  const sceneNav = root.querySelector('[data-scene-nav]');
  state.field.scene_packages.forEach((scene, index) => {
    const button = element('button', 'information-dome__choice', sceneLabel(scene.scene_kind));
    button.type = 'button';
    button.dataset.sceneIndex = String(index);
    button.setAttribute('aria-pressed', String(index === state.sceneIndex));
    button.addEventListener('click', () => {
      state.sceneIndex = index;
      state.resting = false;
      render();
    });
    sceneNav.append(button);
  });

  const routeNav = root.querySelector('[data-route-nav]');
  for (const route of ROUTES) {
    const button = element('button', 'information-dome__choice', route);
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
  root.querySelector('[data-replay]').addEventListener('click', () => {
    state.resting = false;
    render();
  });

  root.removeAttribute('aria-busy');
  render();
}

load().catch(error => {
  const root = document.querySelector('[data-flowcore-pedagogue]');
  root.removeAttribute('aria-busy');
  const live = root.querySelector('[data-bounded-live]');
  live.textContent = `Information Dome held: ${error.message}`;
  root.dataset.held = 'true';
});
