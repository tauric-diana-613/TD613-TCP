import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A16_OPERATOR_WITNESS_EXTERIORITY_CERTIFICATE as C,
  runA16OperatorWitnessExteriority
} from '../app/dome-world/previews/a15-r0/a16-operator-witness-exteriority.js';

assert.equal(C.status, 'A16_OPERATOR_WITNESS_EXTERIORITY_EARNED');
assert.equal(C.rest_symbol, '𝄐');
assert.equal(C.source_class, 'CROSS_LINEAGE_A16_GOVERNANCE_NONBOOTSTRAP_COROLLARY');
assert.equal(C.code_side_architectural_sufficiency_earned, true);
assert.equal(C.operator_review_mandatory_before_a16, true);
assert.equal(C.operator_review_recorded_required, true);
assert.equal(C.a16_start_before_review_forbidden, true);
assert.equal(C.green_browser_packet_substitutes_for_operator_review, false);
assert.equal(C.deployed_body_substitutes_for_operator_acceptance, false);
assert.equal(C.browser_evidence_substitutes_for_operator_visual_review, false);
assert.equal(C.operator_review_finding_recorded, false);
assert.equal(C.operator_review_gate_state, 'OPEN');
assert.equal(C.a16_implementation_authority_state, 'HELD');
assert.equal(C.human_closure_required, true);
assert.equal(C.required_operator_review_record_field_count, 10);
assert.equal(C.current_repository_ci_evidence_class, 'INTERNAL_CODE_STATIC_AND_BROWSER_WITNESS');
assert.equal(C.required_missing_gate_evidence_class, 'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD');
assert.equal(C.evidence_class_mismatch_established, true);
assert.equal(C.closed_system_repository_transform_can_satisfy_operator_review_gate, false);
assert.equal(C.additional_ci_green_can_satisfy_operator_review_gate, false);
assert.equal(C.synthetic_preflight_can_satisfy_operator_review_gate, false);
assert.equal(C.self_authored_review_receipt_without_observation_admissible, false);
assert.equal(C.minimum_new_evidence_classes_for_this_gate, 1);
assert.equal(C.required_new_evidence_class_for_this_gate, 'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD');
assert.equal(C.a16_operator_witness_exteriority_earned, true);
assert.equal(C.structural_convergence_with_western_horizon_exteriority_nonbootstrap, true);
assert.equal(C.western_horizon_empirical_shore_rest_preserved, true);
assert.equal(C.western_horizon_sequence_authority, false);
assert.equal(C.western_horizon_successor_stage_claimed, false);
assert.equal(C.a16_product_mutation_performed, false);
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
assert.match(C.exteriority_digest, /^[0-9a-f]{64}$/);

const receipt = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/A16_OPERATOR_WITNESS_EXTERIORITY_RECEIPT_V0_1.md',
  'utf8'
);
assert.match(receipt, /CODE SUFFICIENCY != GOVERNANCE ADMISSION/);
assert.match(receipt, /BROWSER EVIDENCE != OPERATOR VISUAL REVIEW/);
assert.match(receipt, /SELF-ATTESTATION != OBSERVATION/);
assert.match(receipt, /INTERNAL TRANSFORMATION != NEW HUMAN WITNESS/);
assert.match(receipt, /STRUCTURAL CONVERGENCE != LINEAGE MERGE/);
assert.match(receipt, /A16 GOVERNANCE COROLLARY != WESTERN HORIZON SUCCESSOR/);

const rerun = runA16OperatorWitnessExteriority();
assert.equal(rerun.status, C.status);
assert.equal(rerun.exteriority_digest, C.exteriority_digest);

console.log('A16 operator-witness exteriority tests passed.');
