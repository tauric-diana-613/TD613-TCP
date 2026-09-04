import assert from 'node:assert/strict';
import {
  A16_HUMAN_OPERATOR_LAUNCH_CERTIFICATE as cert,
  A16_OPERATOR_REVIEW_PROMPTS,
  A16_OPERATOR_REVIEW_RECORD_TEMPLATE
} from '../app/dome-world/previews/a15-r0/a16-human-operator-launch-readiness.js';
import { inspectA16OperatorWitnessRecord } from '../app/dome-world/previews/a15-r0/a16-operator-witness-socket.js';

await import('./ash-a16-r0-holonomy-loom-local-pocket.test.mjs');

assert.equal(cert.status, 'A16_HUMAN_OPERATOR_REVIEW_LAUNCH_READY');
assert.equal(cert.exact_parent, '951807bc76ee2ba5f72fa7bd643fa8e53521ccf8');
assert.equal(cert.parent_exact_head_green_witness.pr, 1025);
assert.equal(cert.parent_exact_head_green_witness.run, '2556 / 33818189211');
assert.equal(cert.parent_exact_head_green_witness.conclusion, 'SUCCESS');
assert.equal(cert.parent_exact_head_green_witness.exact_head, '951807bc76ee2ba5f72fa7bd643fa8e53521ccf8');
assert.equal(cert.parent_exact_head_green_witness.exact_tree, '018610e90be185ac7bf5e89e7fb10da987b99590');
assert.equal(cert.parent_exact_head_green_witness.firefox_artifact_id, 9917621496);
assert.equal(cert.parent_exact_head_green_witness.firefox_artifact_digest, 'sha256:148d736160001127dc24fe4877df3869b583fab397cc4e0529bf934e8bfc50c6');
assert.equal(cert.parent_exact_head_green_witness.firefox_live_field_schema, 'td613.ash.flowcore-live-field-browser/v0.17-live-field-name-settlement-diagnostics');
assert.equal(cert.parent_exact_head_green_witness.firefox_live_field_status, 'PASS');

assert.equal(cert.residual_frontier.entry_gate_count, 7);
assert.equal(cert.residual_frontier.satisfied_gate_count, 3);
assert.equal(cert.residual_frontier.residual_gate_count, 4);
assert.deepEqual([...cert.residual_frontier.residual_gate_ids], ['G3','G4','G5','G6']);
assert.equal(cert.residual_frontier.immediately_machine_reducible_residual_gate_count, 0);
assert.equal(cert.residual_frontier.exogenous_operator_governance_event_lower_bound, 1);
assert.equal(cert.residual_frontier.exact_minimum_distinct_operator_event_count, 'UNIDENTIFIABLE_FROM_CURRENT_CONTRACT');

assert.equal(cert.witness_socket_status, 'A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED');
assert.equal(cert.required_operator_review_field_count, 10);
assert.equal(cert.required_operator_review_fields.length, 10);
assert.equal(Object.keys(A16_OPERATOR_REVIEW_PROMPTS).length, 10);
assert.equal(cert.prompt_coverage_complete, true);
assert.equal(cert.next_admissible_evidence_class, 'HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD');
assert.equal(cert.human_operator_review_request_ready, true);
assert.equal(cert.human_observation_required, true);

const emptyInspection=inspectA16OperatorWitnessRecord(A16_OPERATOR_REVIEW_RECORD_TEMPLATE);
assert.equal(cert.empty_review_record_status, 'AWAITING_HUMAN_OPERATOR_OBSERVATION');
assert.equal(emptyInspection.status, 'AWAITING_HUMAN_OPERATOR_OBSERVATION');
assert.equal(emptyInspection.record_shape_complete, false);
for (const field of cert.required_operator_review_fields) {
  assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE[field], null, `${field} must remain empty before the human observation.`);
}
assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE.visual_control_or_authority_defects, null, 'Zero defects may only become [] after explicit human observation; null means unobserved.');
assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE.operator_finding, null);
assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE.bounded_a15_visual_repair_erratum_required, null);
assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE.provenance_claim.observer_identity_disclosed_to_repository, null);
assert.equal(A16_OPERATOR_REVIEW_RECORD_TEMPLATE.provenance_claim.observation_recorded_at, null);

for (const key of [
  'operator_review_recorded',
  'operator_review_admitted',
  'explicit_review_waiver_recorded',
  'visual_errata_disposition_recorded',
  'a16_0_scope_accepted',
  'a16_candidate_registered',
  'a16_gate_open',
  'a16_readmission_earned',
  'a16_implementation_authority',
  'a16_product_mutation_authority',
  'western_horizon_successor_stage_claimed',
  'golden_egg_earned',
  'merge_authority',
  'production_authority',
  'deployment_authority',
  'publication_authority'
]) assert.equal(cert[key], false, `${key} must remain closed at launch readiness.`);
assert.equal(cert.empirical_credit_to_golden_egg, 0);

for (const law of Object.values(cert.laws)) assert.equal(law, true);
assert.match(cert.theorem, /NEXT_ADMISSIBLE_NEW_EVIDENCE_CLASS_IS_A_REAL_HUMAN_OPERATOR_PRODUCTION_OBSERVATION_RECORD/);
assert.match(cert.child_message, /NEXT NEW THING MUST COME FROM A HUMAN LOOKING AT THE LIVE INSTRUMENT/);

console.log('A16 human-operator launch readiness tests passed.');
