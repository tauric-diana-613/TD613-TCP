import fs from 'node:fs';
import crypto, { webcrypto } from 'node:crypto';
import { compileAshCustodyPedagogueScene } from '../../../engine/ash-pedagogue-adapter.js';
import {
  ROUTE_BURDEN_MODEL_IDS,
  compileRouteGraph,
  compareBurdenModels,
  compileBurdenReceipt
} from '../../../engine/flowcore-route-burden.js';
import {
  LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_CERTIFICATE as WIRING_PARENT
} from './live-principal-route-burden-wiring-null.js';

export const A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_SCHEMA = 'td613.dome-world.a16-single-splice-instrument-fidelity-preflight/v0.1';
export const A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_PARENT = '8cbd1c30b30afef0402783a8a610780287b921b1';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const read = path => fs.readFileSync(path, 'utf8');
const scenarioData = () => JSON.parse(read('app/dome-world/fixtures/pedagogue/ash-custody-pedagogue-scenarios.json'));

function scenarioSnapshot(data, name) {
  const source = structuredClone(data.scenarios[name].snapshot);
  if (source.readinessReceipt === '$shared.readinessReceipt') source.readinessReceipt = structuredClone(data.shared.readinessReceipt);
  if (source.custodyReceipt === '$shared.custodyReceipt') source.custodyReceipt = structuredClone(data.shared.custodyReceipt);
  if (source.caseMap === '$scenarios.case_bound.snapshot.caseMap') source.caseMap = structuredClone(data.scenarios.case_bound.snapshot.caseMap);
  return source;
}

export async function runA16SingleSpliceInstrumentFidelityPreflight() {
  if (WIRING_PARENT.status !== 'LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_LOCALIZED') {
    return freeze({ status: 'INADMISSIBLE', errors: ['LIVE_WIRING_NULL_PARENT_REQUIRED'] });
  }

  const liveOwner = read('app/dome-world/ash-keep-aia.js');
  const handoff = read('app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md');
  const release = read('app/dome-world/docs/ash/closure/ASH_KEEP_A15_PRODUCTION_RELEASE_RELOCK_RECEIPT_V0_1.md');

  const livePackageMaterialized = /packageView\s*=.*compileAshCustodyPedagogueScene\(\{\s*lifecycle\s*\}/s.test(liveOwner);
  const livePackageRetained = /state\.lifecycleReceipt\s*=\s*receipt;\s*state\.packageView\s*=\s*packageView;/s.test(liveOwner);
  const liveRenderConsumesSamePackage = /compileAshLiveRenderReceipt\(\{\s*packageView,\s*route:\s*state\.route,\s*animationPlan:\s*state\.animationPlan\s*\}/s.test(liveOwner);
  const operatorReviewRequired = /operator review recorded = required/i.test(handoff) && /A16 start before review = forbidden/i.test(handoff);
  const operatorReviewOpen = /operator visual review\s*=\s*OPEN/i.test(release);

  const data = scenarioData();
  const options = {
    ...data.determinism,
    idSeed: `${data.determinism.idSeed}:a16-single-splice-preflight`,
    cryptoImpl: webcrypto,
    beforeSnapshot: scenarioSnapshot(data, 'verified')
  };
  const snapshot = scenarioSnapshot(data, 'case_bound');
  const packageView = await compileAshCustodyPedagogueScene(snapshot, options);
  const packageBefore = JSON.stringify(packageView);

  const graph = await compileRouteGraph(packageView.scene, packageView.phase_sequence, options);
  const comparison = compareBurdenModels(graph, ROUTE_BURDEN_MODEL_IDS);
  const burdenReceipt = await compileBurdenReceipt(comparison, options);

  const packageAfter = JSON.stringify(packageView);
  const directCanonicalAcceptance = Boolean(
    graph.schema === 'td613.flowcore.route-graph/v0.1' &&
    comparison.model_results.length === ROUTE_BURDEN_MODEL_IDS.length &&
    burdenReceipt.schema === 'td613.flowcore.route-burden-receipt/v0.1'
  );
  const packageUnmutated = packageBefore === packageAfter;
  const noTranslationLayer = directCanonicalAcceptance;
  const authorityConserved = Boolean(
    packageView.authority?.flowcore_commands_station === false &&
    packageView.authority?.automatic_ash_action === false &&
    packageView.authority?.station_authority_transferred === false &&
    graph.authority?.flowcore_commands_station === false &&
    graph.authority?.automatic_ash_action === false &&
    graph.authority?.station_mutation_authorized === false &&
    comparison.authority?.observatory_only === true &&
    comparison.authority?.flowcore_commands_station === false &&
    comparison.authority?.automatic_ash_action === false &&
    burdenReceipt.authority?.authority_may_cross === false &&
    burdenReceipt.authority?.automatic_ash_action === false
  );

  const lowerBoundCrossSubsystemEdges = WIRING_PARENT.direct_live_route_burden_wiring_observed === false ? 1 : 0;
  const upperBoundCrossSubsystemEdges = directCanonicalAcceptance && noTranslationLayer ? 1 : Number.POSITIVE_INFINITY;
  const exactMinimumCrossSubsystemEdges = lowerBoundCrossSubsystemEdges === 1 && upperBoundCrossSubsystemEdges === 1 ? 1 : null;

  const passed = Boolean(
    livePackageMaterialized &&
    livePackageRetained &&
    liveRenderConsumesSamePackage &&
    WIRING_PARENT.pre_a16_wiring_debt_localized === true &&
    directCanonicalAcceptance &&
    packageUnmutated &&
    authorityConserved &&
    exactMinimumCrossSubsystemEdges === 1 &&
    operatorReviewRequired &&
    operatorReviewOpen
  );

  const subject = {
    exact_parent: A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_PARENT,
    wiring_parent_digest: WIRING_PARENT.wiring_null_digest,
    ash_package_digest: packageView.package_digest,
    route_graph_digest: graph.graph_digest,
    burden_receipt_digest: burdenReceipt.receipt_digest,
    minimum_new_cross_subsystem_edges: exactMinimumCrossSubsystemEdges,
    package_unmutated: packageUnmutated,
    authority_conserved: authorityConserved,
    operator_review_open: operatorReviewOpen
  };

  return freeze({
    schema: A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_SCHEMA,
    exact_parent: A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_PARENT,
    status: passed ? 'A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_EARNED' : 'INADMISSIBLE',
    errors: passed ? [] : ['A16_SINGLE_SPLICE_PREFLIGHT_FAILED'],
    rest_symbol: passed ? '𝄐' : null,
    preflight_digest: digest(subject),
    source_class: 'PRE_A16_ARCHITECTURAL_SUFFICIENCY_AND_INSTRUMENT_FIDELITY_ASSAY',
    live_owner_materializes_canonical_package_view: livePackageMaterialized,
    live_owner_retains_same_package_view: livePackageRetained,
    live_render_consumes_same_package_view: liveRenderConsumesSamePackage,
    package_scene_directly_accepted_by_compile_route_graph: directCanonicalAcceptance,
    package_phase_sequence_directly_accepted_by_compile_route_graph: directCanonicalAcceptance,
    translation_layer_required: !noTranslationLayer,
    scene_adapter_required: !noTranslationLayer,
    transition_adapter_required: !noTranslationLayer,
    ontology_rewrite_required: false,
    package_digest: packageView.package_digest,
    package_byte_serialization_unchanged_after_burden_compilation: packageUnmutated,
    route_graph_digest: graph.graph_digest,
    burden_receipt_digest: burdenReceipt.receipt_digest,
    all_declared_burden_models_evaluated: comparison.model_results.length === ROUTE_BURDEN_MODEL_IDS.length,
    burden_models_remain_uncrowned: comparison.crowned_model === null && comparison.crowned_score === null,
    burden_interaction_evidence_still_required: comparison.model_results.every(result => result.route_design_hypothesis_requires_interaction_evidence === true),
    authority_conserved_across_candidate_splice: authorityConserved,
    minimum_new_cross_subsystem_coupling_edges_under_current_api: exactMinimumCrossSubsystemEdges,
    lower_bound_new_cross_subsystem_edges: lowerBoundCrossSubsystemEdges,
    upper_bound_new_cross_subsystem_edges: Number.isFinite(upperBoundCrossSubsystemEdges) ? upperBoundCrossSubsystemEdges : null,
    candidate_splice_boundary: 'packageView.{scene,phase_sequence} -> compileRouteGraph(scene, transitions)',
    existing_downstream_burden_pipeline: 'compileRouteGraph -> compareBurdenModels -> compileBurdenReceipt',
    operator_review_required_before_a16: operatorReviewRequired,
    operator_review_recorded: !operatorReviewOpen,
    operator_review_gate_state: operatorReviewOpen ? 'OPEN' : 'NOT_OPEN',
    a16_preflight_architectural_sufficiency_earned: passed,
    a16_live_product_wiring_performed: false,
    a16_live_principal_journey_observed: false,
    a16_live_route_burden_compilation_earned: false,
    a16_readmission_earned: false,
    a16_implementation_authority: false,
    a16_product_mutation_authority: false,
    a19_whole_program_closure_earned: false,
    empirical_interaction_evidence_acquired: false,
    exact_golden_egg_surfaces_added: freeze([]),
    empirical_credit_to_golden_egg: 0,
    golden_egg_earned: false,
    sequence_authority: false,
    merge_authority: false,
    production_authority: false,
    deployment_authority: false,
    publication_authority: false,
    laws: freeze({
      wiring_null_plus_direct_acceptance_bounds_minimum_cross_subsystem_edge_count: true,
      one_cross_subsystem_edge_not_one_total_function_call: true,
      single_splice_sufficiency_not_a16_implementation: true,
      schema_acceptance_not_live_principal_journey: true,
      package_nonmutation_not_operator_review: true,
      authority_conservation_not_authority_grant: true,
      burden_compilation_not_interaction_evidence: true,
      preflight_not_a16_readmission: true,
      preflight_not_golden_egg_measurement: true
    }),
    theorem: 'UNDER_THE_CURRENT_CANONICAL_APIS_THE_PRE_A16_LIVE_ROUTE_BURDEN_INTEGRATION_FRONTIER_HAS_EXACT_CROSS_SUBSYSTEM_EDGE_NUMBER_ONE: THE_LIVE_OWNER_ALREADY_MATERIALIZES_THE_CANONICAL_PACKAGE_VIEW; ITS_SCENE_AND_PHASE_SEQUENCE_ARE_DIRECTLY_ACCEPTED_BY_THE_EXISTING_FLOWCORE_BURDEN_PIPELINE_WITHOUT_TRANSLATION_OR_PACKAGE_MUTATION_AND_WITHOUT_WIDENING_STATION_AUTHORITY, WHILE_THE_OPEN_OPERATOR_REVIEW_GATE_CONTINUES_TO_FORBID_A16_PRODUCT_MUTATION',
    child_message: 'ASH ALREADY HOLDS THE RIGHT PLUG. FLOW-CORE ALREADY HAS THE RIGHT SOCKET. ONE CROSSING CONNECTS THEM, BUT THE HUMAN GATE STILL HOLDS.'
  });
}

export const A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_CERTIFICATE = await runA16SingleSpliceInstrumentFidelityPreflight();
