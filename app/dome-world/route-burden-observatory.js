import {
  compilePedagogicalScene,
  compilePedagogicalTransition
} from '../engine/flowcore-pedagogue-core.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compileRouteGraph,
  compareBurdenModels,
  compileBurdenReceipt
} from '../engine/flowcore-route-burden.js';

const state = { graph: null, comparison: null, receipt: null, selectedModel: 'FIELD_COUNT_BASELINE' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function list(title, values) {
  const section = el('section', 'route-burden__panel');
  section.append(el('h3', null, title));
  const ul = el('ul');
  for (const value of values || []) ul.append(el('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!ul.childElementCount) ul.append(el('li', null, 'None declared.'));
  section.append(ul);
  return section;
}

function resultFor(model) {
  return state.comparison.model_results.find(result => result.model_id === model);
}

function render() {
  const root = document.querySelector('[data-route-burden]');
  const result = resultFor(state.selectedModel);
  for (const button of root.querySelectorAll('[data-model]')) {
    button.setAttribute('aria-pressed', String(button.dataset.model === state.selectedModel));
  }

  root.querySelector('[data-bounded-live]').textContent = `${result.model_id}: ${result.total_millipoints} millipoints. This is a design hypothesis, not a user score.`;
  root.querySelector('[data-consensus]').textContent = state.comparison.comparative_consensus.route_design_hypothesis;

  const stage = root.querySelector('[data-observatory-stage]');
  stage.replaceChildren();

  const route = el('section', 'route-burden__panel route-burden__route');
  route.append(el('h2', null, 'Declared Custody Root passage'));
  for (const node of state.graph.nodes) {
    const row = el('article', 'route-burden__step');
    row.append(el('h3', null, node.label));
    row.append(el('p', null, `Fields ${node.required_fields.length} · dependencies ${node.dependencies.length} · downstream ${node.downstream_dependency_count}`));
    row.append(el('p', null, `Legibility ${node.legibility_millipoints} · affordance ${node.affordance_millipoints} · obstruction ${node.gluing_obstruction_millipoints}`));
    route.append(row);
  }
  stage.append(route);

  const score = el('section', 'route-burden__panel');
  score.append(el('h2', null, result.model_id));
  const meter = el('div', 'route-burden__meter');
  meter.setAttribute('role', 'img');
  meter.setAttribute('aria-label', `${result.total_millipoints} of 1000 structural burden millipoints`);
  meter.style.setProperty('--route-burden', `${result.total_millipoints / 10}%`);
  meter.append(el('span', null, `${result.total_millipoints} / 1000`));
  score.append(meter);
  score.append(el('p', null, result.route_design_hypothesis));
  score.append(el('p', 'route-burden__nonclaim', 'Structural route burden is not cognition, mastery, distress, identity, or user deficiency.'));
  stage.append(score);

  stage.append(list('Model assumptions', result.model_assumptions));
  stage.append(list('Raw components', Object.entries(result.raw_components).map(([key, value]) => `${key}: ${value}`)));
  stage.append(list('Normalized components', Object.entries(result.normalized_components_millipoints).map(([key, value]) => `${key}: ${value} millipoints`)));
  stage.append(list('Sensitivity', [
    `minus ten percent: ${result.sensitivity.minus_ten_percent}`,
    `plus ten percent: ${result.sensitivity.plus_ten_percent}`
  ]));
  stage.append(list('Model disagreements', state.comparison.model_disagreements.map(item => `${item.left_model} ↔ ${item.right_model}: ${item.absolute_delta_millipoints}`)));
  stage.append(list('Missing interaction evidence', state.comparison.missing_inputs));

  const inspection = el('section', 'route-burden__panel');
  inspection.append(el('h3', null, 'Bounded receipt inspection'));
  inspection.append(el('pre', 'route-burden__inspection', JSON.stringify({
    graph_id: state.graph.graph_id,
    graph_digest: state.graph.graph_digest,
    receipt_id: state.receipt.receipt_id,
    receipt_digest: state.receipt.receipt_digest,
    crowned_model: state.comparison.crowned_model,
    user_level_score: result.user_level_score,
    automatic_redesign_command: result.automatic_redesign_command,
    authority: state.receipt.authority,
    closure: state.receipt.closure
  }, null, 2)));
  stage.append(inspection);
}

async function load() {
  const response = await fetch('./fixtures/pedagogue/ash-custody-root-route.json');
  if (!response.ok) throw new Error('Custody Root route fixture could not be loaded.');
  const fixture = await response.json();
  const options = { ...fixture.determinism, cryptoImpl: globalThis.crypto };
  const scene = await compilePedagogicalScene(fixture.scene_input, options);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'NOTICE',
    staticEquivalent: { summary: scene.visible_condition.plain_language, steps: ['condition', 'source boundary', 'claim ceiling'] }
  });
  const act = await compilePedagogicalTransition(scene, fixture.action, null, {
    ...options,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: { summary: 'Inspect the declared route without changing Ash.', steps: ['purpose', 'authority', 'reversibility'] }
  });
  const answer = await compilePedagogicalTransition(scene, fixture.action, fixture.world_delta, {
    ...options,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });

  state.graph = await compileRouteGraph(scene, [notice, act, answer], options);
  state.comparison = compareBurdenModels(state.graph, ROUTE_BURDEN_MODEL_IDS);
  state.receipt = await compileBurdenReceipt(state.comparison, options);

  const nav = document.querySelector('[data-model-nav]');
  for (const model of ROUTE_BURDEN_MODEL_IDS) {
    const button = el('button', 'route-burden__choice', model.replaceAll('_', ' '));
    button.type = 'button';
    button.dataset.model = model;
    button.setAttribute('aria-pressed', String(model === state.selectedModel));
    button.addEventListener('click', () => {
      state.selectedModel = model;
      render();
    });
    nav.append(button);
  }

  document.querySelector('[data-route-burden]').removeAttribute('aria-busy');
  render();
}

load().catch(error => {
  const root = document.querySelector('[data-route-burden]');
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  root.querySelector('[data-bounded-live]').textContent = `Route-burden observatory held: ${error.message}`;
});
