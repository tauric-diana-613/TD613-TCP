import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_CARTESIAN_FINDING_DECISION_SEPARABILITY_ASSAY_SCHEMA,
  MARROWLINE_CARTESIAN_DECISION_VECTORS,
  runMarrowlineCartesianFindingDecisionSeparabilityAssay
} from '../scripts/marrowline-cartesian-finding-decision-separability-assay.mjs';

const report = runMarrowlineCartesianFindingDecisionSeparabilityAssay();

assert.equal(report.schema, MARROWLINE_CARTESIAN_FINDING_DECISION_SEPARABILITY_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(report.shared_case.finding_count, 2);
assert.deepEqual(report.shared_case.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.shared_case.hosted_findings_distinguishable, true);
assert.equal(report.shared_case.local_binding_carried, false);
assert.equal(report.shared_case.release_authority, false);
assert.equal(report.shared_case.human_closure_required, true);
assert.deepEqual(report.shared_case.forbidden_transport_paths, []);
assert.notEqual(report.shared_case.hosted_findings.A.sha256, report.shared_case.hosted_findings.B.sha256);

assert.deepEqual(MARROWLINE_CARTESIAN_DECISION_VECTORS.map(vector => vector.id), [
  'MATCH_MATCH',
  'MATCH_MISMATCH',
  'MISMATCH_MATCH',
  'MISMATCH_MISMATCH'
]);
assert.equal(report.primary_schedule.length, 4);
assert.equal(report.replay_schedule.length, 4);

const expected = {
  MATCH_MATCH: { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' },
  MATCH_MISMATCH: { A: 'PRESENT_TO_HUMAN', B: 'HOLD' },
  MISMATCH_MATCH: { A: 'HOLD', B: 'PRESENT_TO_HUMAN' },
  MISMATCH_MISMATCH: { A: 'HOLD', B: 'HOLD' }
};
const primary = Object.fromEntries(report.primary_schedule.map(vector => [vector.vector_id, vector]));
const replay = Object.fromEntries(report.replay_schedule.map(vector => [vector.vector_id, vector]));

for (const id of Object.keys(expected)) {
  assert.deepEqual(primary[id].statuses, expected[id]);
  assert.deepEqual(replay[id].statuses, expected[id]);
  assert.equal(primary[id].carry_case_unchanged, true);
  assert.equal(primary[id].envelopes_unchanged, true);
  assert.equal(primary[id].authority_closed, true);
  assert.equal(replay[id].carry_case_unchanged, true);
  assert.equal(replay[id].envelopes_unchanged, true);
  assert.equal(replay[id].authority_closed, true);
  assert.deepEqual(primary[id].envelope_surfaces, replay[id].envelope_surfaces);
}

assert.deepEqual(report.coordinate_sensitivity, {
  A_match_B_changes_only_B: true,
  A_mismatch_B_changes_only_B: true,
  B_match_A_changes_only_A: true,
  B_mismatch_A_changes_only_A: true
});
assert.equal(report.controls.A_with_B_binding.rejected, true);
assert.match(report.controls.A_with_B_binding.error, /local binding does not match portable projection/);
assert.equal(report.controls.B_with_A_binding.rejected, true);
assert.match(report.controls.B_with_A_binding.error, /local binding does not match portable projection/);
assert.equal(report.all_four_cartesian_corners_observed, true);
assert.equal(report.per_finding_coordinate_separable, true);
assert.equal(report.shared_carry_case_unchanged, true);
assert.equal(report.replay_order_invariant, true);
assert.equal(report.wrong_rule_binding_rejected, true);
assert.equal(report.whole_case_status_carried, false);
assert.equal(report.portable_vector_state_carried, false);
assert.equal(report.sibling_result_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-one-carry-case-four-corner-cartesian-decision-separability-only');

const source = fs.readFileSync('scripts/marrowline-cartesian-finding-decision-separability-assay.mjs', 'utf8');
assert.match(source, /FINDING_VECTOR|vector/i);
assert.match(source, /wrong-rule local binding was accepted/);
assert.match(source, /Cartesian coordinate sensitivity collapsed/);
assert.match(source, /bounded-two-finding-one-carry-case-four-corner-cartesian-decision-separability-only/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(vector|status|decision|history|schedule)/i,
  'Vector or decision state may not enter the shared Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(sibling|prior|previous|vector|status)/i,
  'Sibling or vector state may not enter the return-envelope compiler input.');

console.log('Marrowline Cartesian finding decision separability hostile contract: PASS');
