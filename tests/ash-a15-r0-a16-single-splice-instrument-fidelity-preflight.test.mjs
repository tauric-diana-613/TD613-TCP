import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_CERTIFICATE as C,
  runA16SingleSpliceInstrumentFidelityPreflight
} from '../app/dome-world/previews/a15-r0/a16-single-splice-instrument-fidelity-preflight.js';

assert.equal(C.status, 'A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_EARNED');
assert.equal(C.rest_symbol, '𝄐');
assert.equal(C.source_class, 'PRE_A16_ARCHITECTURAL_SUFFICIENCY_AND_INSTRUMENT_FIDELITY_ASSAY');
assert.equal(C.live_owner_materializes_canonical_package_view, true);
assert.equal(C.live_owner_retains_same_package_view, true);
assert.equal(C.live_render_consumes_same_package_view, true);
assert.equal(C.package_scene_directly_accepted_by_compile_route_graph, true);
assert.equal(C.package_phase_sequence_directly_accepted_by_compile_route_graph, true);
assert.equal(C.translation_layer_required, false);
assert.equal(C.scene_adapter_required, false);
assert.equal(C.transition_adapter_required, false);
assert.equal(C.ontology_rewrite_required, false);
assert.equal(C.package_byte_serialization_unchanged_after_burden_compilation, true);
assert.equal(C.all_declared_burden_models_evaluated, true);
assert.equal(C.burden_models_remain_uncrowned, true);
assert.equal(C.burden_interaction_evidence_still_required, true);
assert.equal(C.authority_conserved_across_candidate_splice, true);
assert.equal(C.lower_bound_new_cross_subsystem_edges, 1);
assert.equal(C.upper_bound_new_cross_subsystem_edges, 1);
assert.equal(C.minimum_new_cross_subsystem_coupling_edges_under_current_api, 1);
assert.equal(C.candidate_splice_boundary, 'packageView.{scene,phase_sequence} -> compileRouteGraph(scene, transitions)');
assert.equal(C.existing_downstream_burden_pipeline, 'compileRouteGraph -> compareBurdenModels -> compileBurdenReceipt');
assert.equal(C.operator_review_required_before_a16, true);
assert.equal(C.operator_review_recorded, false);
assert.equal(C.operator_review_gate_state, 'OPEN');
assert.equal(C.a16_preflight_architectural_sufficiency_earned, true);
assert.equal(C.a16_live_product_wiring_performed, false);
assert.equal(C.a16_live_principal_journey_observed, false);
assert.equal(C.a16_live_route_burden_compilation_earned, false);
assert.equal(C.a16_readmission_earned, false);
assert.equal(C.a16_implementation_authority, false);
assert.equal(C.a16_product_mutation_authority, false);
assert.equal(C.a19_whole_program_closure_earned, false);
assert.equal(C.empirical_interaction_evidence_acquired, false);
assert.deepEqual(C.exact_golden_egg_surfaces_added, []);
assert.equal(C.empirical_credit_to_golden_egg, 0);
assert.equal(C.golden_egg_earned, false);
assert.equal(C.sequence_authority, false);
assert.equal(C.merge_authority, false);
assert.equal(C.production_authority, false);
assert.equal(C.deployment_authority, false);
assert.equal(C.publication_authority, false);
assert.match(C.package_digest, /^[0-9a-f]{64}$/);
assert.match(C.route_graph_digest, /^[0-9a-f]{64}$/);
assert.match(C.burden_receipt_digest, /^[0-9a-f]{64}$/);
assert.match(C.preflight_digest, /^[0-9a-f]{64}$/);

const receipt = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/A16_SINGLE_SPLICE_INSTRUMENT_FIDELITY_PREFLIGHT_RECEIPT_V0_1.md',
  'utf8'
);
assert.match(receipt, /WIRING NULL \+ DIRECT ACCEPTANCE => EXACTLY ONE NEW CROSS-SUBSYSTEM EDGE/);
assert.match(receipt, /ONE CROSS-SUBSYSTEM EDGE != ONE TOTAL FUNCTION CALL/);
assert.match(receipt, /SINGLE-SPLICE SUFFICIENCY != A16 IMPLEMENTATION/);
assert.match(receipt, /PACKAGE NONMUTATION != OPERATOR REVIEW/);
assert.match(receipt, /AUTHORITY CONSERVATION != AUTHORITY GRANT/);

const rerun = await runA16SingleSpliceInstrumentFidelityPreflight();
assert.equal(rerun.status, C.status);
assert.equal(rerun.preflight_digest, C.preflight_digest);

console.log('A16 single-splice instrument-fidelity preflight tests passed.');
