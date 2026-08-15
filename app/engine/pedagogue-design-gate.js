import {
  compilePedagogicalScene,
  compilePedagogicalTransition,
  compileRestState,
  compileTransferEncounter
} from './flowcore-pedagogue-core.js';
import {
  AIA_ROUTE_IDS,
  compileAIAView,
  verifyAIAInvariants
} from './flowcore-pedagogue-aia.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compareBurdenModels,
  compileRouteGraph
} from './flowcore-route-burden.js';

export const PEDAGOGUE_DESIGN_FIXTURE_SCHEMA = 'td613.pedagogue-design-fixture/v0.1';
export const PEDAGOGUE_DESIGN_REVIEW_SCHEMA = 'td613.pedagogue-design-review/v0.1';

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function staticEquivalent(summary, steps) {
  return { summary, steps, claim_ceiling_visible: true, missingness_visible: true, contradictions_visible: true, station_ownership_visible: true, rest_visible: true, exit_visible: true };
}

function routeTotals(comparison) {
  return Object.fromEntries(comparison.model_results.map((item) => [item.model_id, item.total_millipoints]));
}

function compareTotals(baseline, proposed) {
  const baselineTotals = routeTotals(baseline);
  const proposedTotals = routeTotals(proposed);
  const deltas = Object.fromEntries(ROUTE_BURDEN_MODEL_IDS.map((model) => [model, proposedTotals[model] - baselineTotals[model]]));
  return {
    baseline: baselineTotals,
    proposed: proposedTotals,
    delta_millipoints: deltas,
    non_worsening_model_count: Object.values(deltas).filter((value) => value <= 0).length,
    improved_model_count: Object.values(deltas).filter((value) => value < 0).length,
    all_models_non_worsening: Object.values(deltas).every((value) => value <= 0)
  };
}

async function compileCycle(fixture, options) {
  const scene = await compilePedagogicalScene(fixture.scene_input, options);
  const notice = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'NOTICE',
    staticEquivalent: staticEquivalent(scene.visible_condition.plain_language, ['visible condition', 'source and claim ceiling'])
  });
  const act = await compilePedagogicalTransition(scene, fixture.action, null, {
    ...options,
    phase: 'ACT',
    priorTransitions: [notice],
    staticEquivalent: staticEquivalent('Declared action, authority, reversibility, rest, and exit remain visible.', ['action', 'authority', 'reversibility', 'rest', 'exit'])
  });
  const answer = await compilePedagogicalTransition(scene, fixture.action, fixture.world_delta, {
    ...options,
    phase: 'WORLD_ANSWERS',
    priorTransitions: [notice, act]
  });
  const name = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'NAME',
    priorTransitions: [notice, act, answer],
    name: fixture.name,
    staticEquivalent: staticEquivalent(fixture.name.plain_language, ['plain relation', 'technical term after consequence', 'non-equivalence'])
  });
  const rest = await compilePedagogicalTransition(scene, null, null, {
    ...options,
    phase: 'REST',
    priorTransitions: [notice, act, answer, name],
    staticEquivalent: staticEquivalent('Demand stops while consequence, return, and exit remain available.', ['withhold new prompts', 'preserve consequence', 'return', 'exit'])
  });
  const restState = await compileRestState(scene, rest, options);
  const transfer = await compileTransferEncounter(name, fixture.transfer_context, options);
  return { scene, transitions: [notice, act, answer, name, rest], notice, act, answer, name, rest, restState, transfer };
}

export async function compilePedagogueDesignReview(fixture, options = {}) {
  if (!fixture || fixture.schema !== PEDAGOGUE_DESIGN_FIXTURE_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_DESIGN_FIXTURE_SCHEMA}.`);
  if (typeof fixture.surface_reference !== 'string' || !fixture.surface_reference.trim()) throw new Error('Design fixture requires a Dome-hosted surface_reference.');
  if (fixture.scene_input?.station_owner !== 'Dome-World') throw new Error('Pedagogue design scenes remain hosted by Dome-World; use surface_reference for nested product surfaces.');
  if (!Array.isArray(fixture.baseline_route_steps) || !fixture.baseline_route_steps.length) throw new Error('Design fixture requires baseline_route_steps.');
  if (!Array.isArray(fixture.scene_input?.route_topology?.steps) || !fixture.scene_input.route_topology.steps.length) throw new Error('Design fixture requires proposed scene_input.route_topology.steps.');

  const deterministic = { ...fixture.determinism, ...options };
  const cycle = await compileCycle(fixture, deterministic);
  const aiaViews = [];
  for (const route of AIA_ROUTE_IDS) aiaViews.push(await compileAIAView(cycle.scene, cycle.name, route, deterministic));
  const aiaReport = verifyAIAInvariants(cycle.scene, aiaViews);

  const proposedGraph = await compileRouteGraph(cycle.scene, cycle.transitions, deterministic);
  const proposedBurden = compareBurdenModels(proposedGraph, ROUTE_BURDEN_MODEL_IDS);

  const baselineInput = clone(fixture.scene_input);
  baselineInput.route_topology = { ...baselineInput.route_topology, steps: clone(fixture.baseline_route_steps) };
  const baselineScene = await compilePedagogicalScene(baselineInput, { ...deterministic, idScope: `${deterministic.idScope || fixture.design_id}:baseline` });
  const baselineGraph = await compileRouteGraph(baselineScene, [], { ...deterministic, idScope: `${deterministic.idScope || fixture.design_id}:baseline` });
  const baselineBurden = compareBurdenModels(baselineGraph, ROUTE_BURDEN_MODEL_IDS);
  const burdenComparison = compareTotals(baselineBurden, proposedBurden);

  return Object.freeze({
    schema: PEDAGOGUE_DESIGN_REVIEW_SCHEMA,
    design_id: fixture.design_id,
    surface_reference: fixture.surface_reference,
    scene_host: 'Dome-World',
    governance_context: fixture.governance_context || 'TD613',
    scene: cycle.scene,
    phases: cycle.transitions.map((item) => item.phase),
    rest: cycle.restState,
    transfer: cycle.transfer,
    aia_report: aiaReport,
    baseline_route_graph: baselineGraph,
    proposed_route_graph: proposedGraph,
    baseline_burden: baselineBurden,
    proposed_burden: proposedBurden,
    burden_comparison: burdenComparison,
    design_gate: {
      consequence_before_ontology: true,
      rest_and_exit_preserved: cycle.restState.penalty === false && cycle.restState.exit_available === true,
      aia_invariants_preserved: aiaReport.all_invariants_preserved === true && aiaReport.all_surfaces_non_equivalent === true,
      route_burden_non_worsening: burdenComparison.all_models_non_worsening,
      user_level_score_forbidden: proposedGraph.user_level_score_forbidden === true,
      automatic_redesign_forbidden: proposedGraph.automatic_redesign_forbidden === true,
      human_closure_required: true
    }
  });
}
