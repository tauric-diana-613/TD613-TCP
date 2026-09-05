import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_THREE_PACKET_PERMUTATION_ASSAY_SCHEMA,
  MARROWLINE_THREE_PACKET_PERMUTATIONS,
  MARROWLINE_THREE_PACKET_SPECS,
  runMarrowlineThreePacketPermutationAssay
} from '../scripts/marrowline-three-packet-permutation-assay.mjs';

const report = runMarrowlineThreePacketPermutationAssay();
const surfaces = ['source_packet', 'carry_case', 'return_envelope', 'combined_transport'];

assert.equal(report.schema, MARROWLINE_THREE_PACKET_PERMUTATION_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(report.packet_labels, ['A', 'B', 'C']);
assert.equal(MARROWLINE_THREE_PACKET_SPECS.A.rule_id, 'EMAIL_IDENTIFIER');
assert.equal(MARROWLINE_THREE_PACKET_SPECS.A.matching_action, 'CHANGE');
assert.equal(MARROWLINE_THREE_PACKET_SPECS.B.rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.equal(MARROWLINE_THREE_PACKET_SPECS.B.matching_action, 'REMOVE');
assert.equal(MARROWLINE_THREE_PACKET_SPECS.C.rule_id, 'PRIVATE_KEY_BLOCK');
assert.equal(MARROWLINE_THREE_PACKET_SPECS.C.matching_action, 'REMOVE');
assert.deepEqual(MARROWLINE_THREE_PACKET_PERMUTATIONS, [
  ['A', 'B', 'C'], ['A', 'C', 'B'], ['B', 'A', 'C'],
  ['B', 'C', 'A'], ['C', 'A', 'B'], ['C', 'B', 'A']
]);
assert.equal(report.permutation_count, 6);
assert.equal(report.observed_step_count, 18);
assert.equal(report.portable_permutation_index, false);
assert.equal(report.portable_position_index, false);
assert.equal(report.prior_packet_identity_carried, false);
assert.equal(report.prior_permutation_history_carried, false);
assert.equal(report.route_history_carried, false);
assert.equal(report.packets_pairwise_distinguishable, true);
assert.equal(report.shared_remove_action_did_not_collapse_identity, true);
assert.equal(report.schedule_steps_match_packet_baseline, true);
assert.deepEqual(report.position_coverage, { A: [2, 2, 2], B: [2, 2, 2], C: [2, 2, 2] });
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-three-packet-all-six-permutation-serialized-position-noninterference-only');

for (const [left, right] of [['A', 'B'], ['A', 'C'], ['B', 'C']]) {
  for (const key of surfaces) {
    assert.notEqual(report.baseline[left][key].sha256, report.baseline[right][key].sha256,
      `${left}/${right} ${key} must remain distinguishable`);
  }
}
assert.notEqual(report.baseline.B.return_envelope.sha256, report.baseline.C.return_envelope.sha256,
  'B/C shared REMOVE action must not collapse rule-bound return identity');

assert.equal(report.schedules.length, 6);
for (const [permutationIndex, schedule] of report.schedules.entries()) {
  assert.equal(schedule.assay_permutation_index, permutationIndex + 1);
  assert.equal(schedule.assay_local_only, true);
  assert.deepEqual(schedule.schedule, MARROWLINE_THREE_PACKET_PERMUTATIONS[permutationIndex]);
  assert.equal(schedule.steps.length, 3);
  for (const [positionIndex, step] of schedule.steps.entries()) {
    const label = schedule.schedule[positionIndex];
    assert.equal(step.assay_position_index, positionIndex + 1);
    assert.equal(step.assay_packet_label, label);
    assert.equal(step.assay_local_only, true);
    assert.deepEqual(step.surfaces, report.baseline[label]);
    assert.deepEqual(step.forbidden_permutation_paths, []);
    assert.equal(step.revalidation.status, 'PRESENT_TO_HUMAN');
    assert.equal(step.revalidation.candidate_trusted, false);
    assert.equal(step.revalidation.release_authority, false);
    assert.equal(step.revalidation.human_closure_required, true);
    assert.equal(step.revalidation.local_binding_retained, true);
  }
}

for (const label of ['A', 'B', 'C']) {
  assert.equal(report.controls.mismatch[label].status, 'HOLD');
  assert.equal(report.controls.mismatch[label].return_envelope_distinguishable, true);
}
assert.equal(report.controls.cross_binding.length, 6);
for (const control of report.controls.cross_binding) {
  assert.notEqual(control.source_packet, control.foreign_binding);
  assert.equal(control.rejected, true);
  assert.equal(control.error_name, 'TypeError');
}

const portableBaselines = JSON.stringify(report.baseline);
for (const forbidden of [
  'permutation_index', 'position_index', 'schedule_index', 'sequence_index', 'step_index',
  'prior_packet', 'previous_packet', 'prior_rule', 'previous_rule', 'prior_action', 'previous_action',
  'prior_schedule', 'previous_schedule', 'prior_permutation', 'previous_permutation',
  'route_history', 'journey_history', 'boundary_history', 'receipt_chain',
  'prior_receipt', 'previous_receipt', 'receipt_id', 'nonce', 'sha256:'
]) {
  assert.equal(portableBaselines.includes(forbidden), false,
    `portable surface accumulated permutation/history carrier: ${forbidden}`);
}

const source = fs.readFileSync('scripts/marrowline-three-packet-permutation-assay.mjs', 'utf8');
assert.match(source, /bounded-three-packet-all-six-permutation-serialized-position-noninterference-only/);
assert.match(source, /assay_permutation_index: permutationIndex \+ 1/);
assert.match(source, /assay_position_index: positionIndex \+ 1/);
assert.match(source, /portable_permutation_index: false/);
assert.match(source, /prior_permutation_history_carried: false/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(permutation|position|schedule|prior|previous)/i,
  'Permutation or prior-packet state may not enter the carry-case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(permutation|position|schedule|prior|previous)/i,
  'Permutation or prior-packet state may not enter the return-envelope compiler input.');

console.log('Marrowline three-packet permutation non-interference hostile contract: PASS');
