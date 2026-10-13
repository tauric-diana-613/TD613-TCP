import { compilePhysicalFlowCoreScene } from '../engine/flowcore-physical-scene.js';

const ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
const state = { packageView: null, route: 'EXPERIENTIAL', resting: false };

const root = document.querySelector('[data-physical-flowcore]');
const stage = root.querySelector('[data-stage]');
const live = root.querySelector('[data-bounded-live]');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function number(value) {
  return new Intl.NumberFormat().format(Number(value));
}

function card(title, rows = []) {
  const section = element('section', 'physical-flowcore__card');
  section.append(element('h2', null, title));
  const list = element('dl', 'physical-flowcore__ledger');
  for (const [label, value] of rows) {
    list.append(element('dt', null, label));
    list.append(element('dd', null, value));
  }
  section.append(list);
  return section;
}

function listCard(title, values = []) {
  const section = element('section', 'physical-flowcore__card');
  section.append(element('h2', null, title));
  const list = element('ul');
  for (const value of values) list.append(element('li', null, value));
  section.append(list);
  return section;
}

function render() {
  const packageView = state.packageView;
  const view = packageView.aia_views[state.route];
  const mechanical = packageView.model.mechanical_ledger;
  const thermal = packageView.model.thermal_ledger;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = reduced ? packageView.reduced_mobile_frames[state.route] : packageView.desktop_frames[state.route];

  for (const button of root.querySelectorAll('[data-route]')) {
    button.setAttribute('aria-pressed', String(button.dataset.route === state.route));
  }

  live.textContent = state.resting
    ? 'Rest holds the complete ledger. Replay, return, and exit remain available.'
    : `${state.route}: ${view.purpose}`;

  stage.replaceChildren();
  stage.append(card('Mechanical ledger', [
    ['Potential capacity', `${number(mechanical.potential_capacity_millijoules)} mJ`],
    ['Lifted and stored', `${number(mechanical.lifted_stored_millijoules)} mJ`],
    ['Lift loss', `${number(mechanical.lift_loss_millijoules)} mJ`],
    ['Pipe-friction loss', `${number(mechanical.pipe_friction_loss_millijoules)} mJ`],
    ['Delivered work', `${number(mechanical.delivered_work_millijoules)} mJ`],
    ['Optional output', `${number(mechanical.optional_output_millijoules)} mJ`],
    ['Unserved optional load', `${number(mechanical.unserved_optional_load_millijoules)} mJ`],
    ['Next reserve', `${number(mechanical.next_reserve_millijoules)} mJ`],
    ['Essential floor', `${number(mechanical.essential_reserve_floor_millijoules)} mJ`]
  ]));
  stage.append(card('Thermal ledger', [
    ['Stored thermal energy', `${number(thermal.stored_thermal_energy_millijoules)} mJ`],
    ['Converter present', String(thermal.converter_present)],
    ['Mechanical transfer', `${number(thermal.thermal_to_mechanical_transfer_millijoules)} mJ`],
    ['Mechanically spendable', String(thermal.mechanically_spendable)]
  ]));
  stage.append(card('Child-safety and reserve law', [
    ['Participant input class', packageView.model.inputs.participant_input_class],
    ['Essential service depends on participant input', String(packageView.child_safety.essential_service_depends_on_participant_input)],
    ['Essential reserve protected', String(packageView.child_safety.essential_reserve_floor_protected)],
    ['Nonperformance penalty', String(packageView.child_safety.participant_nonperformance_penalty)]
  ]));
  stage.append(listCard(`${state.route} route`, view.surface.order));
  stage.append(listCard('Visible losses and contradictions', [
    ...packageView.phase_sequence[2].losses,
    ...packageView.phase_sequence[2].contradictions
  ]));
  stage.append(listCard('Missing calibration', packageView.scene.missingness));
  stage.append(listCard('Allowed claims', packageView.model.claim_ceiling.allowed_claims));
  stage.append(listCard('Forbidden claims', packageView.model.claim_ceiling.forbidden_claims));
  stage.append(card('Render and authority', [
    ['Reduced motion', String(frame.reduced_motion)],
    ['Layout', frame.viewport.layout],
    ['Owns animation loop', String(frame.scheduler.owns_animation_loop)],
    ['Commands physical system', String(packageView.authority.flowcore_commands_physical_system)],
    ['Essential-service control authorized', String(packageView.authority.essential_service_control_authorized)],
    ['Human closure required', String(packageView.authority.human_closure_required)]
  ]));

  root.dataset.resting = String(state.resting);
}

async function load() {
  const response = await fetch('./fixtures/pedagogue/physical-flowcore-cycle.json');
  if (!response.ok) throw new Error(`Fixture load failed: ${response.status}`);
  state.packageView = await compilePhysicalFlowCoreScene(await response.json(), { cryptoImpl: globalThis.crypto });

  const nav = root.querySelector('[data-route-nav]');
  for (const route of ROUTES) {
    const button = element('button', 'physical-flowcore__choice', route);
    button.type = 'button';
    button.dataset.route = route;
    button.setAttribute('aria-pressed', String(route === state.route));
    button.addEventListener('click', () => {
      state.route = route;
      state.resting = false;
      render();
    });
    nav.append(button);
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
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  live.textContent = `Physical Flow-Core held: ${error.message}`;
});
