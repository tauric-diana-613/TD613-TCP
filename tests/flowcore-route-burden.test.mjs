import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  compilePedagogicalScene,
  compilePedagogicalTransition
} from '../app/engine/flowcore-pedagogue-core.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compileRouteGraph,
  computeDeclaredBurden,
  compareBurdenModels,
  compileBurdenReceipt
} from '../app/engine/flowcore-route-burden.js';

const fixturePath = 'app/dome-world/fixtures/pedagogue/ash-custody-root-route.json';
const fixture = () => JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const options = value => ({ ...value.determinism, cryptoImpl: webcrypto });

async function compile(value = fixture()) {
  const opts = options(value);
  const scene = await compilePedagogicalScene(value.scene_input, opts);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...opts,
    phase: 'NOTICE',
    staticEquivalent: { summary: scene.visible_condition.plain_language, steps: ['condition', 'source boundary', 'claim ceiling'] }
  });
  const act = await compilePedagogicalTransition(scene, value.action, null, {
    ...opts,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: { summary: 'Inspect the declared route.', steps: ['purpose', 'authority', 'reversibility'] }
  });
  const answer = await compilePedagogicalTransition(scene, value.action, value.world_delta, {
    ...opts,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });
  const graph = await compileRouteGraph(scene, [notice, act, answer], opts);
  const comparison = compareBurdenModels(graph, ROUTE_BURDEN_MODEL_IDS);
  const receipt = await compileBurdenReceipt(comparison, opts);
  return { opts, scene, notice, act, answer, graph, comparison, receipt };
}

test('P5 exposes four declared models without a crown', () => {
  assert.deepEqual(ROUTE_BURDEN_MODEL_IDS, [
    'FIELD_COUNT_BASELINE',
    'DEPENDENCY_COUNT',
    'AIA_TRANSPORT_SURROGATE',
    'HETEROSTRATIGRAPHIC_EXTENSION'
  ]);
});

test('Custody Root is a cross-model high-load design candidate, not a diagnosis', async () => {
  const result = await compile();
  assert.equal(result.comparison.model_results.length, 4);
  assert.equal(result.comparison.model_disagreements.length, 6);
  assert.equal(result.comparison.crowned_model, null);
  assert.equal(result.comparison.crowned_score, null);
  assert.equal(result.comparison.no_user_level_score, true);
  assert.equal(result.comparison.no_diagnosis, true);
  assert.equal(result.comparison.no_automatic_redesign_command, true);
  assert.equal(result.comparison.comparative_consensus.route_design_hypothesis, 'HIGH_LOAD_PASSAGE_FROM_DECLARED_STRUCTURE');
  assert.equal(result.comparison.comparative_consensus.requires_interaction_evidence, true);
  for (const model of result.comparison.model_results) {
    assert.equal(model.user_level_score, null);
    assert.equal(model.diagnostic_claim, null);
    assert.equal(model.automatic_redesign_command, null);
    assert.equal(model.route_design_hypothesis_requires_interaction_evidence, true);
    assert.ok(Number.isSafeInteger(model.total_millipoints));
  }
});

test('route graph preserves exact structural inputs and open human closure', async () => {
  const { graph } = await compile();
  assert.equal(graph.nodes.length, 6);
  assert.equal(graph.totals.required_field_count, 24);
  assert.equal(graph.totals.projection_crossing_count, 4);
  assert.equal(graph.diagnostic_use_forbidden, true);
  assert.equal(graph.user_level_score_forbidden, true);
  assert.equal(graph.automatic_redesign_forbidden, true);
  assert.equal(graph.authority.automatic_ash_action, false);
  assert.equal(graph.authority.station_mutation_authorized, false);
  assert.equal(graph.closure.status, 'OPEN');
});

test('same governed inputs yield deterministic graph and burden receipt', async () => {
  const left = await compile();
  const right = await compile();
  assert.equal(left.graph.graph_id, right.graph.graph_id);
  assert.equal(left.graph.graph_digest, right.graph.graph_digest);
  assert.equal(left.receipt.receipt_id, right.receipt.receipt_id);
  assert.equal(left.receipt.receipt_digest, right.receipt.receipt_digest);
  assert.deepEqual(left.comparison, right.comparison);
});

test('models remain non-equivalent and expose sensitivity', async () => {
  const { graph, comparison } = await compile();
  const totals = comparison.model_results.map(result => result.total_millipoints);
  assert.ok(new Set(totals).size > 1);
  for (const result of comparison.model_results) {
    assert.ok(result.sensitivity.minus_ten_percent <= result.total_millipoints);
    assert.ok(result.sensitivity.plus_ten_percent >= result.total_millipoints);
  }
  assert.throws(() => computeDeclaredBurden(graph, 'CROWNED_SCORE'), /Unknown/);
  assert.throws(() => compareBurdenModels(graph, ['FIELD_COUNT_BASELINE']), /At least two/);
});

test('missing dependency references reject rather than fabricate a graph', async () => {
  const value = fixture();
  value.scene_input.route_topology.steps[2].dependencies.push('not_a_real_step');
  const opts = options(value);
  const scene = await compilePedagogicalScene(value.scene_input, opts);
  await assert.rejects(() => compileRouteGraph(scene, [], opts), /Unknown route dependency/);
});

test('observatory surface preserves model choice, nonclaim, mobile, and reduced-motion contracts', () => {
  const html = fs.readFileSync('app/dome-world/route-burden-observatory.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/route-burden-observatory.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/route-burden-observatory.css', 'utf8');
  assert.match(html, /data-model-nav/);
  assert.match(html, /Burden model ≠ cognition/);
  assert.match(js, /data-model/);
  assert.match(js, /automatic_redesign_command/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
});
