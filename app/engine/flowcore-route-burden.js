import { canonicalDigest, canonicalJson } from '../dome-world/ash/canonical-json.js';
import { deterministic, freeze, noForbidden } from './flowcore-pedagogue-utils.js';
import { validateScene, validateTransition } from './flowcore-pedagogue-validators.js';

export const ROUTE_GRAPH_SCHEMA = 'td613.flowcore.route-graph/v0.1';
export const ROUTE_BURDEN_RESULT_SCHEMA = 'td613.flowcore.route-burden-result/v0.1';
export const ROUTE_BURDEN_COMPARISON_SCHEMA = 'td613.flowcore.route-burden-comparison/v0.1';
export const ROUTE_BURDEN_RECEIPT_SCHEMA = 'td613.flowcore.route-burden-receipt/v0.1';

export const ROUTE_BURDEN_MODELS = Object.freeze({
  FIELD_COUNT_BASELINE: Object.freeze({
    assumptions: Object.freeze([
      'declared fields and actions approximate structural handling demand',
      'field count does not measure cognition, ability, distress, or user quality'
    ])
  }),
  DEPENDENCY_COUNT: Object.freeze({
    assumptions: Object.freeze([
      'downstream dependencies increase recovery and sequencing demand',
      'dependency structure does not establish observed difficulty or causality'
    ])
  }),
  AIA_TRANSPORT_SURROGATE: Object.freeze({
    assumptions: Object.freeze([
      'declared demand is moderated by declared legibility and affordance',
      'transport burden is a design surrogate rather than a user score'
    ])
  }),
  HETEROSTRATIGRAPHIC_EXTENSION: Object.freeze({
    assumptions: Object.freeze([
      'gluing obstruction, route memory, and projection crossings add structural demand',
      'heterostratigraphic burden remains a comparative hypothesis requiring interaction evidence'
    ])
  })
});

export const ROUTE_BURDEN_MODEL_IDS = Object.freeze(Object.keys(ROUTE_BURDEN_MODELS));

function text(value, label) {
  if (typeof value !== 'string' || !value.length) throw new TypeError(`${label} must be a non-empty string.`);
  return value;
}

function strings(value = [], label = 'value') {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new TypeError(`${label} must be an array of strings.`);
  return [...new Set(value)].sort();
}

function integer(value, label, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new TypeError(`${label} must be a safe integer from ${minimum} through ${maximum}.`);
  return value;
}

function clampMillipoints(value) {
  return Math.max(0, Math.min(1000, Math.round(value)));
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function routeSteps(scene, transitions) {
  const declared = scene.route_topology?.steps;
  if (Array.isArray(declared) && declared.length) return declared;
  return transitions.map((transition, index) => ({
    step_id: transition.transition_id,
    label: transition.phase,
    phase: transition.phase,
    required_fields: transition.selected_action ? ['declared action', 'action authority', 'reversibility'] : ['visible consequence'],
    dependencies: index === 0 ? [] : [transitions[index - 1].transition_id],
    legibility_millipoints: transition.static_equivalent?.claim_ceiling_visible === true ? 800 : 500,
    affordance_millipoints: transition.rest_available && transition.exit_available ? 900 : 300,
    gluing_obstruction_millipoints: (transition.contradictions || []).length ? 350 : 0,
    projection_crossings: transition.phase === 'TRANSFER' ? 1 : 0,
    route_memory_edges: (transition.prior_transition_references || []).length
  }));
}

function normalizeStep(input, index) {
  const step = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    step_id: text(String(step.step_id || `route_step_${index + 1}`), `steps[${index}].step_id`),
    label: text(String(step.label || step.phase || `Step ${index + 1}`), `steps[${index}].label`),
    phase: String(step.phase || 'DECLARED'),
    required_fields: strings(step.required_fields || [], `steps[${index}].required_fields`),
    dependencies: strings(step.dependencies || [], `steps[${index}].dependencies`),
    legibility_millipoints: integer(step.legibility_millipoints ?? 500, `steps[${index}].legibility_millipoints`, 0, 1000),
    affordance_millipoints: integer(step.affordance_millipoints ?? 500, `steps[${index}].affordance_millipoints`, 1, 1000),
    gluing_obstruction_millipoints: integer(step.gluing_obstruction_millipoints ?? 0, `steps[${index}].gluing_obstruction_millipoints`, 0, 1000),
    projection_crossings: integer(step.projection_crossings ?? 0, `steps[${index}].projection_crossings`, 0, 1000),
    route_memory_edges: integer(step.route_memory_edges ?? 0, `steps[${index}].route_memory_edges`, 0, 1000),
    operator_action_required: step.operator_action_required !== false
  };
}

export async function compileRouteGraph(scene, transitions = [], options = {}) {
  validateScene(scene);
  if (!Array.isArray(transitions)) throw new TypeError('transitions must be an array.');
  transitions.forEach(validateTransition);
  deterministic(options);
  noForbidden({ scene, transitions });

  const nodes = routeSteps(scene, transitions).map(normalizeStep);
  if (!nodes.length) throw new Error('A route graph requires at least one declared step.');
  const ids = new Set(nodes.map(node => node.step_id));
  if (ids.size !== nodes.length) throw new Error('Route step identifiers must be unique.');
  for (const node of nodes) {
    for (const dependency of node.dependencies) if (!ids.has(dependency)) throw new Error(`Unknown route dependency: ${dependency}`);
  }

  const downstream = Object.fromEntries(nodes.map(node => [node.step_id, 0]));
  for (const node of nodes) {
    const seen = new Set();
    const visit = id => {
      if (seen.has(id)) return;
      seen.add(id);
      downstream[id] += 1;
      for (const parent of nodes.find(item => item.step_id === id)?.dependencies || []) visit(parent);
    };
    for (const dependency of node.dependencies) visit(dependency);
  }

  const graphSubject = {
    scene_reference: scene.scene_id,
    transition_references: transitions.map(item => item.transition_id),
    nodes: nodes.map(node => ({ ...node, downstream_dependency_count: downstream[node.step_id] })),
    missing_inputs: strings(scene.route_topology?.missing_inputs || scene.missingness || [], 'missing_inputs')
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:ROUTE-GRAPH:v1', graphSubject, options);
  const graph = {
    schema: ROUTE_GRAPH_SCHEMA,
    graph_id: `flowcore_route_${digest.slice(-24)}`,
    graph_digest: digest,
    scene_reference: scene.scene_id,
    transition_references: graphSubject.transition_references,
    nodes: graphSubject.nodes,
    totals: {
      step_count: nodes.length,
      required_field_count: nodes.reduce((sum, node) => sum + node.required_fields.length, 0),
      dependency_edge_count: nodes.reduce((sum, node) => sum + node.dependencies.length, 0),
      projection_crossing_count: nodes.reduce((sum, node) => sum + node.projection_crossings, 0),
      route_memory_edge_count: nodes.reduce((sum, node) => sum + node.route_memory_edges, 0)
    },
    missing_inputs: graphSubject.missing_inputs,
    station_owner: scene.station_owner,
    diagnostic_use_forbidden: true,
    user_level_score_forbidden: true,
    automatic_redesign_forbidden: true,
    design_hypothesis_only: true,
    authority: {
      flowcore_commands_station: false,
      automatic_ash_action: false,
      station_mutation_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(graph);
  return freeze(graph);
}

function fieldCountComponents(graph) {
  const fields = graph.totals.required_field_count;
  const actions = graph.nodes.filter(node => node.operator_action_required).length;
  return {
    raw: { required_fields: fields, operator_actions: actions, steps: graph.totals.step_count },
    normalized: {
      required_fields: clampMillipoints(fields * 70),
      operator_actions: clampMillipoints(actions * 110),
      steps: clampMillipoints(graph.totals.step_count * 90)
    }
  };
}

function dependencyComponents(graph) {
  const maximumDownstream = Math.max(...graph.nodes.map(node => node.downstream_dependency_count));
  return {
    raw: {
      dependency_edges: graph.totals.dependency_edge_count,
      maximum_downstream_dependencies: maximumDownstream,
      branching_steps: graph.nodes.filter(node => node.downstream_dependency_count > 1).length
    },
    normalized: {
      dependency_edges: clampMillipoints(graph.totals.dependency_edge_count * 120),
      maximum_downstream_dependencies: clampMillipoints(maximumDownstream * 140),
      branching_steps: clampMillipoints(graph.nodes.filter(node => node.downstream_dependency_count > 1).length * 180)
    }
  };
}

function transportComponents(graph) {
  const nodeScores = graph.nodes.map(node => {
    const demand = node.required_fields.length * 130 + node.dependencies.length * 170 + (node.operator_action_required ? 120 : 0);
    const support = Math.max(100, Math.round((node.legibility_millipoints + node.affordance_millipoints) / 2));
    return clampMillipoints(Math.round((demand * 1000) / (support * 2)));
  });
  return {
    raw: {
      demand_units: graph.nodes.reduce((sum, node) => sum + node.required_fields.length * 130 + node.dependencies.length * 170 + (node.operator_action_required ? 120 : 0), 0),
      average_legibility_millipoints: average(graph.nodes.map(node => node.legibility_millipoints)),
      average_affordance_millipoints: average(graph.nodes.map(node => node.affordance_millipoints))
    },
    normalized: {
      transport_surrogate: average(nodeScores),
      low_legibility_exposure: clampMillipoints(1000 - average(graph.nodes.map(node => node.legibility_millipoints))),
      low_affordance_exposure: clampMillipoints(1000 - average(graph.nodes.map(node => node.affordance_millipoints)))
    }
  };
}

function heterostratigraphicComponents(graph) {
  return {
    raw: {
      average_gluing_obstruction_millipoints: average(graph.nodes.map(node => node.gluing_obstruction_millipoints)),
      projection_crossings: graph.totals.projection_crossing_count,
      route_memory_edges: graph.totals.route_memory_edge_count
    },
    normalized: {
      gluing_obstruction: average(graph.nodes.map(node => node.gluing_obstruction_millipoints)),
      projection_crossings: clampMillipoints(graph.totals.projection_crossing_count * 190),
      route_memory: clampMillipoints(graph.totals.route_memory_edge_count * 90)
    }
  };
}

const COMPONENT_BUILDERS = Object.freeze({
  FIELD_COUNT_BASELINE: fieldCountComponents,
  DEPENDENCY_COUNT: dependencyComponents,
  AIA_TRANSPORT_SURROGATE: transportComponents,
  HETEROSTRATIGRAPHIC_EXTENSION: heterostratigraphicComponents
});

export function computeDeclaredBurden(routeGraph, model, options = {}) {
  if (!routeGraph || routeGraph.schema !== ROUTE_GRAPH_SCHEMA) throw new Error('A canonical route graph is required.');
  const modelId = String(model || '').toUpperCase();
  if (!ROUTE_BURDEN_MODEL_IDS.includes(modelId)) throw new Error('Unknown route-burden model.');
  const components = COMPONENT_BUILDERS[modelId](routeGraph);
  const total = average(Object.values(components.normalized));
  const result = {
    schema: ROUTE_BURDEN_RESULT_SCHEMA,
    graph_reference: routeGraph.graph_id,
    model_id: modelId,
    model_assumptions: [...ROUTE_BURDEN_MODELS[modelId].assumptions],
    raw_components: components.raw,
    normalized_components_millipoints: components.normalized,
    total_millipoints: total,
    sensitivity: {
      minus_ten_percent: clampMillipoints(Math.round(total * 900 / 1000)),
      plus_ten_percent: clampMillipoints(Math.round(total * 1100 / 1000)),
      parameterization_is_declared: true
    },
    missing_inputs: [...routeGraph.missing_inputs],
    observed_interaction_outcomes_included: options.observedInteractionOutcomes === true,
    correlation_is_causality: false,
    route_design_hypothesis: total >= (options.highLoadThresholdMillipoints ?? 650)
      ? 'STRUCTURALLY_HIGH_LOAD_CANDIDATE'
      : 'STRUCTURALLY_MODERATE_OR_LOW_CANDIDATE',
    route_design_hypothesis_requires_interaction_evidence: true,
    automatic_redesign_command: null,
    user_level_score: null,
    diagnostic_claim: null,
    authority: {
      flowcore_commands_station: false,
      automatic_ash_action: false,
      station_mutation_authorized: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  noForbidden(result);
  canonicalJson(result);
  return freeze(result);
}

export function compareBurdenModels(routeGraph, models = ROUTE_BURDEN_MODEL_IDS, options = {}) {
  if (!Array.isArray(models) || models.length < 2) throw new Error('At least two burden models are required.');
  const ids = [...new Set(models.map(model => String(model).toUpperCase()))];
  const results = ids.map(model => computeDeclaredBurden(routeGraph, model, options));
  const disagreements = [];
  for (let index = 0; index < results.length; index += 1) {
    for (let other = index + 1; other < results.length; other += 1) {
      disagreements.push({
        left_model: results[index].model_id,
        right_model: results[other].model_id,
        absolute_delta_millipoints: Math.abs(results[index].total_millipoints - results[other].total_millipoints)
      });
    }
  }
  const highLoadCount = results.filter(result => result.route_design_hypothesis === 'STRUCTURALLY_HIGH_LOAD_CANDIDATE').length;
  const comparison = {
    schema: ROUTE_BURDEN_COMPARISON_SCHEMA,
    graph_reference: routeGraph.graph_id,
    model_results: results,
    model_disagreements: disagreements,
    inspection_order: [...results].sort((left, right) => right.total_millipoints - left.total_millipoints).map(result => result.model_id),
    crowned_model: null,
    crowned_score: null,
    comparative_consensus: {
      high_load_model_count: highLoadCount,
      model_count: results.length,
      route_design_hypothesis: highLoadCount >= Math.ceil(results.length / 2)
        ? 'HIGH_LOAD_PASSAGE_FROM_DECLARED_STRUCTURE'
        : 'NO_CROSS_MODEL_HIGH_LOAD_CONSENSUS',
      requires_interaction_evidence: true
    },
    missing_inputs: [...routeGraph.missing_inputs],
    no_automatic_redesign_command: true,
    no_user_level_score: true,
    no_diagnosis: true,
    authority: {
      observatory_only: true,
      flowcore_commands_station: false,
      automatic_ash_action: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(comparison);
  return freeze(comparison);
}

export async function compileBurdenReceipt(results, options = {}) {
  if (!results || results.schema !== ROUTE_BURDEN_COMPARISON_SCHEMA) throw new Error('A route-burden comparison is required.');
  deterministic(options);
  const subject = {
    graph_reference: results.graph_reference,
    model_results: results.model_results,
    model_disagreements: results.model_disagreements,
    comparative_consensus: results.comparative_consensus,
    missing_inputs: results.missing_inputs
  };
  const digest = await canonicalDigest('TD613:FLOWCORE:ROUTE-BURDEN-RECEIPT:v1', subject, options);
  const receipt = {
    schema: ROUTE_BURDEN_RECEIPT_SCHEMA,
    receipt_id: `flowcore_burden_${digest.slice(-24)}`,
    receipt_digest: digest,
    observed_at: options.frozenClock,
    graph_reference: results.graph_reference,
    models: results.model_results.map(result => result.model_id),
    comparative_consensus: results.comparative_consensus,
    model_disagreements: results.model_disagreements,
    missing_inputs: results.missing_inputs,
    no_crowned_model: results.crowned_model === null,
    no_user_level_score: true,
    no_automatic_redesign_command: true,
    design_hypothesis_only: true,
    authority: {
      receipt_may_cross: true,
      authority_may_cross: false,
      automatic_ash_action: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null }
  };
  canonicalJson(receipt);
  return freeze(receipt);
}
