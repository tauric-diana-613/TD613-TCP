import {
  compilePedagogicalScene,
  compilePedagogicalTransition,
  compileRestState,
  compileTransferEncounter,
  comparePedagogueRouteMemory,
  compilePedagogueLineageReview,
  compilePedagogueLineageSecondPass,
  compileInstitutionalTimeAudit,
  compileDromologicalSequenceAudit
} from './flowcore-pedagogue-core.js';
import {
  AIA_ROUTE_IDS,
  compileAIAView,
  verifyAIAInvariants
} from './flowcore-pedagogue-aia.js';
import {
  compileAiaSurfaceBinding,
  compileAiaSurfaceProjection,
  verifyAiaSurfaceProjectionFamily
} from './flowcore-aia-surface-binding.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compareBurdenModels,
  compileRouteGraph
} from './flowcore-route-burden.js';
import {
  compilePedagogueInterfaceDiagnosis,
  PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA,
  PEDAGOGUE_INTERFACE_SPECIMEN_SCHEMA
} from './pedagogue-interface-diagnosis.js';

export const PEDAGOGUE_DESIGN_FIXTURE_SCHEMA = 'td613.pedagogue-design-fixture/v0.1';
export const PEDAGOGUE_DESIGN_REVIEW_SCHEMA = 'td613.pedagogue-design-review/v0.5';

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

function compileSurfaceFamily(fixture, cycle, aiaViews) {
  const binding = compileAiaSurfaceBinding({
    surface_reference: fixture.surface_reference,
    host_station: 'Dome-World',
    governance_context: fixture.governance_context || 'TD613',
    nested_surface: true,
    routes: AIA_ROUTE_IDS,
    route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_inference_forbidden: true,
    internal_legibility: 'NOW_WHY_EXACT',
    outside_posture: 'MINIMUM_DISCLOSURE_NON_AUTHORITATIVE',
    fabricated_decoys: false,
    rest: { available: true, penalty: false },
    exit: { available: true, penalty: false },
    authority: {
      station_mutation_authorized: false,
      automatic_release: false,
      automatic_redesign: false,
      route_inference_allowed: false,
      authority_may_cross: false,
      human_closure_required: true
    }
  });
  const governedReference = `${cycle.scene.scene_id}:${cycle.name.transition_id}`;
  const projections = aiaViews.map((view) => compileAiaSurfaceProjection(binding, view.route, {
    governed_reference: governedReference,
    invariants: view.invariants,
    surface: view.surface
  }));
  const report = verifyAiaSurfaceProjectionFamily(binding, projections);
  return { binding, projections, report };
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
  const surfaceFamily = compileSurfaceFamily(fixture, cycle, aiaViews);

  const proposedGraph = await compileRouteGraph(cycle.scene, cycle.transitions, deterministic);
  const proposedBurden = compareBurdenModels(proposedGraph, ROUTE_BURDEN_MODEL_IDS);

  const baselineInput = clone(fixture.scene_input);
  baselineInput.route_topology = { ...baselineInput.route_topology, steps: clone(fixture.baseline_route_steps) };
  const baselineScene = await compilePedagogicalScene(baselineInput, { ...deterministic, idScope: `${deterministic.idScope || fixture.design_id}:baseline` });
  const baselineGraph = await compileRouteGraph(baselineScene, [], { ...deterministic, idScope: `${deterministic.idScope || fixture.design_id}:baseline` });
  const baselineBurden = compareBurdenModels(baselineGraph, ROUTE_BURDEN_MODEL_IDS);
  const burdenComparison = compareTotals(baselineBurden, proposedBurden);
  const routeMemoryComparison = comparePedagogueRouteMemory(
    fixture.baseline_route_steps,
    fixture.scene_input.route_topology.steps,
    {
      expectedEndpoint: fixture.surface_reference,
      observedEndpoint: fixture.surface_reference
    }
  );
  const interfaceDiagnosis = fixture.interface_specimen
    ? compilePedagogueInterfaceDiagnosis(fixture.interface_specimen)
    : null;
  const lineageReview = fixture.lineage_review
    ? compilePedagogueLineageReview(fixture.lineage_review)
    : null;
  const institutionalTimeAudit = fixture.institutional_time_case
    ? compileInstitutionalTimeAudit(fixture.institutional_time_case)
    : null;
  const cadenceAudit = fixture.cadence_case
    ? compileDromologicalSequenceAudit(fixture.cadence_case)
    : null;
  const lineageSecondPass = compilePedagogueLineageSecondPass({
    pass_id: `${fixture.design_id}:lineage-second-pass`,
    interface_diagnosis: interfaceDiagnosis,
    institutional_time_audit: institutionalTimeAudit,
    cadence_audit: cadenceAudit,
    burden_comparison: burdenComparison,
    declared_system_signals: fixture.lineage_second_pass_signals || []
  });

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
    aia_surface_binding: surfaceFamily.binding,
    aia_surface_projections: surfaceFamily.projections,
    aia_surface_family_report: surfaceFamily.report,
    baseline_route_graph: baselineGraph,
    proposed_route_graph: proposedGraph,
    route_memory_comparison: routeMemoryComparison,
    baseline_burden: baselineBurden,
    proposed_burden: proposedBurden,
    burden_comparison: burdenComparison,
    interface_diagnosis: interfaceDiagnosis,
    lineage_review: lineageReview,
    institutional_time_audit: institutionalTimeAudit,
    cadence_audit: cadenceAudit,
    lineage_second_pass: lineageSecondPass,
    design_gate: {
      consequence_before_ontology: true,
      rest_and_exit_preserved: cycle.restState.penalty === false && cycle.restState.exit_available === true,
      aia_invariants_preserved: aiaReport.all_invariants_preserved === true && aiaReport.all_surfaces_non_equivalent === true,
      aia_surface_bound: surfaceFamily.report.all_invariants_preserved === true && surfaceFamily.report.all_surfaces_non_equivalent === true && surfaceFamily.report.authority_transferred === false,
      route_history_explicit: routeMemoryComparison.endpoint_equivalent === true && routeMemoryComparison.authority.route_history_may_be_discarded === false,
      route_burden_non_worsening: burdenComparison.all_models_non_worsening,
      user_level_score_forbidden: proposedGraph.user_level_score_forbidden === true,
      automatic_redesign_forbidden: proposedGraph.automatic_redesign_forbidden === true,
      interface_diagnosis_non_authoritative: !interfaceDiagnosis || (
        interfaceDiagnosis.authority.product_mutation_authorized === false &&
        interfaceDiagnosis.authority.automatic_redesign === false &&
        interfaceDiagnosis.authority.human_closure_required === true
      ),
      lineage_review_non_authoritative: !lineageReview || (
        lineageReview.product_mutation_authorized === false &&
        lineageReview.automatic_redesign === false &&
        lineageReview.human_closure_required === true
      ),
      institutional_time_audit_non_authoritative: !institutionalTimeAudit || (
        institutionalTimeAudit.authority.production_mutation_authorized === false &&
        institutionalTimeAudit.authority.human_closure_required === true
      ),
      cadence_audit_non_authoritative: !cadenceAudit || (
        cadenceAudit.authority.production_mutation_authorized === false &&
        cadenceAudit.authority.automatic_redesign === false &&
        cadenceAudit.authority.human_closure_required === true
      ),
      lineage_second_pass_non_authoritative: (
        lineageSecondPass.authority.product_mutation_authorized === false &&
        lineageSecondPass.authority.production_mutation_authorized === false &&
        lineageSecondPass.authority.automatic_redesign === false &&
        lineageSecondPass.authority.human_closure_required === true
      ),
      human_closure_required: surfaceFamily.report.human_closure_required === true
    }
  });
}

export {
  compilePedagogueInterfaceDiagnosis,
  PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA,
  PEDAGOGUE_INTERFACE_SPECIMEN_SCHEMA
};
