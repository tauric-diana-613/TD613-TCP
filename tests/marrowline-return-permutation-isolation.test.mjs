import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_RETURN_PERMUTATION_ISOLATION_ASSAY_SCHEMA,
  MARROWLINE_RETURN_PERMUTATION_SCHEDULES,
  runMarrowlineReturnPermutationIsolationAssay
} from '../scripts/marrowline-return-permutation-isolation-assay.mjs';

const report = runMarrowlineReturnPermutationIsolationAssay();

assert.equal(report.schema, MARROWLINE_RETURN_PERMUTATION_ISOLATION_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(report.packet_labels, ['A', 'B']);
assert.equal(report.shared_case.finding_count, 2);
assert.deepEqual(report.shared_case.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.shared_case.local_binding_carried, false);
assert.equal(report.shared_case.release_authority, false);
assert.equal(report.shared_case.human_closure_required, true);
assert.deepEqual(report.shared_case.forbidden_portable_state_paths, []);
assert.notEqual(report.shared_case.hosted_findings.A.sha256, report.shared_case.hosted_findings.B.sha256);

assert.deepEqual(
  MARROWLINE_RETURN_PERMUTATION_SCHEDULES.map(({ id, sequence }) => [id, [...sequence]]),
  [
    ['AB', ['A_MATCH', 'B_MATCH']],
    ['BA', ['B_MATCH', 'A_MATCH']],
    ['A_ONLY', ['A_MATCH']],
    ['B_ONLY', ['B_MATCH']],
    ['AAB', ['A_MATCH', 'A_MATCH', 'B_MATCH']],
    ['BBA', ['B_MATCH', 'B_MATCH', 'A_MATCH']],
    ['A_BHOLD_A', ['A_MATCH', 'B_HOLD', 'A_MATCH']],
    ['B_AHOLD_B', ['B_MATCH', 'A_HOLD', 'B_MATCH']]
  ]
);

const byId = Object.fromEntries(report.schedules.map(schedule => [schedule.schedule_id, schedule]));
assert.deepEqual(Object.keys(byId), ['AB', 'BA', 'A_ONLY', 'B_ONLY', 'AAB', 'BBA', 'A_BHOLD_A', 'B_AHOLD_B']);

function statuses(id) {
  return byId[id].steps.map(step => step.status);
}
function tokens(id) {
  return byId[id].steps.map(step => step.assay_token);
}

assert.deepEqual(tokens('AB'), ['A_MATCH', 'B_MATCH']);
assert.deepEqual(statuses('AB'), ['PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN']);
assert.deepEqual(tokens('BA'), ['B_MATCH', 'A_MATCH']);
assert.deepEqual(statuses('BA'), ['PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN']);

assert.deepEqual(tokens('A_ONLY'), ['A_MATCH']);
assert.deepEqual(statuses('A_ONLY'), ['PRESENT_TO_HUMAN']);
assert.equal(byId.A_ONLY.omitted_sibling, 'B');
assert.equal(byId.A_ONLY.omitted_sibling_result_created, false);
assert.deepEqual(byId.A_ONLY.observed_labels, ['A']);

assert.deepEqual(tokens('B_ONLY'), ['B_MATCH']);
assert.deepEqual(statuses('B_ONLY'), ['PRESENT_TO_HUMAN']);
assert.equal(byId.B_ONLY.omitted_sibling, 'A');
assert.equal(byId.B_ONLY.omitted_sibling_result_created, false);
assert.deepEqual(byId.B_ONLY.observed_labels, ['B']);

assert.deepEqual(tokens('AAB'), ['A_MATCH', 'A_MATCH', 'B_MATCH']);
assert.deepEqual(statuses('AAB'), ['PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN']);
assert.deepEqual(byId.AAB.steps[0].result_surface, byId.AAB.steps[1].result_surface);
assert.deepEqual(byId.AAB.steps[2].result_surface, report.baseline_results.B_MATCH);

assert.deepEqual(tokens('BBA'), ['B_MATCH', 'B_MATCH', 'A_MATCH']);
assert.deepEqual(statuses('BBA'), ['PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN', 'PRESENT_TO_HUMAN']);
assert.deepEqual(byId.BBA.steps[0].result_surface, byId.BBA.steps[1].result_surface);
assert.deepEqual(byId.BBA.steps[2].result_surface, report.baseline_results.A_MATCH);

assert.deepEqual(tokens('A_BHOLD_A'), ['A_MATCH', 'B_HOLD', 'A_MATCH']);
assert.deepEqual(statuses('A_BHOLD_A'), ['PRESENT_TO_HUMAN', 'HOLD', 'PRESENT_TO_HUMAN']);
assert.deepEqual(byId.A_BHOLD_A.steps[0].result_surface, byId.A_BHOLD_A.steps[2].result_surface);
assert.deepEqual(byId.A_BHOLD_A.steps[1].result_surface, report.baseline_results.B_HOLD);

assert.deepEqual(tokens('B_AHOLD_B'), ['B_MATCH', 'A_HOLD', 'B_MATCH']);
assert.deepEqual(statuses('B_AHOLD_B'), ['PRESENT_TO_HUMAN', 'HOLD', 'PRESENT_TO_HUMAN']);
assert.deepEqual(byId.B_AHOLD_B.steps[0].result_surface, byId.B_AHOLD_B.steps[2].result_surface);
assert.deepEqual(byId.B_AHOLD_B.steps[1].result_surface, report.baseline_results.A_HOLD);

for (const schedule of report.schedules) {
  assert.equal(schedule.assay_local_only, true);
  assert.equal(schedule.carry_case_unchanged, true);
  assert.equal(schedule.envelopes_unchanged, true);
  assert.equal(schedule.portable_schedule_state_created, false);
  for (const step of schedule.steps) {
    assert.equal(step.assay_local_only, true);
    assert.equal(step.candidate_trusted, false);
    assert.equal(step.release_authority, false);
    assert.equal(step.human_closure_required, true);
    assert.equal(step.local_binding_retained, true);
    assert.deepEqual(step.result_surface, report.baseline_results[step.assay_token]);
  }
}

assert.equal(report.controls.A_with_B_binding.rejected, true);
assert.match(report.controls.A_with_B_binding.error, /local binding does not match portable projection/);
assert.equal(report.controls.B_with_A_binding.rejected, true);
assert.match(report.controls.B_with_A_binding.error, /local binding does not match portable projection/);

assert.equal(report.order_invariant_for_observed_matching_returns, true);
assert.equal(report.sibling_omission_created_no_portable_closure_state, true);
assert.equal(report.duplicate_return_transferred_no_sibling_authority, true);
assert.equal(report.interposed_hold_changed_no_sibling_match_result, true);
assert.equal(report.shared_carry_case_unchanged_across_schedules, true);
assert.equal(report.wrong_rule_binding_rejected, true);
assert.equal(report.portable_return_ordinal_carried, false);
assert.equal(report.portable_duplicate_counter_carried, false);
assert.equal(report.portable_completion_map_carried, false);
assert.equal(report.replay_protection_claimed, false);
assert.equal(report.exactly_once_semantics_claimed, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-return-order-omission-repetition-nontransfer-only');

const source = fs.readFileSync('scripts/marrowline-return-permutation-isolation-assay.mjs', 'utf8');
assert.match(source, /bounded-two-finding-return-order-omission-repetition-nontransfer-only/);
assert.match(source, /replay_protection_claimed: false/);
assert.match(source, /exactly_once_semantics_claimed: false/);
assert.match(source, /wrong-rule local binding was accepted/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(schedule|return_index|duplicate|completion|prior|previous)/i,
  'Return schedule or duplicate state may not enter the shared Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(schedule|return_index|duplicate|completion|prior|previous|sibling)/i,
  'Return schedule or sibling state may not enter the return-envelope compiler input.');

console.log('Marrowline return permutation isolation hostile contract: PASS');
