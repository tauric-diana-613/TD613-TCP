import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_INTERLEAVED_NONINTERFERENCE_ASSAY_SCHEMA,
  MARROWLINE_INTERLEAVED_PACKET_SPECS,
  MARROWLINE_INTERLEAVED_SCHEDULES,
  runMarrowlineInterleavedNoninterferenceAssay
} from '../scripts/marrowline-interleaved-noninterference-assay.mjs';

const report = runMarrowlineInterleavedNoninterferenceAssay();

assert.equal(report.schema, MARROWLINE_INTERLEAVED_NONINTERFERENCE_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(report.packet_labels, ['A', 'B']);
assert.equal(MARROWLINE_INTERLEAVED_PACKET_SPECS.A.rule_id, 'EMAIL_IDENTIFIER');
assert.equal(MARROWLINE_INTERLEAVED_PACKET_SPECS.A.matching_action, 'CHANGE');
assert.equal(MARROWLINE_INTERLEAVED_PACKET_SPECS.B.rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.equal(MARROWLINE_INTERLEAVED_PACKET_SPECS.B.matching_action, 'REMOVE');
assert.deepEqual(MARROWLINE_INTERLEAVED_SCHEDULES, [['A', 'B', 'A'], ['B', 'A', 'B']]);
assert.equal(report.portable_schedule_index, false);
assert.equal(report.prior_packet_identity_carried, false);
assert.equal(report.route_history_carried, false);
assert.equal(report.packets_distinguishable, true);
assert.equal(report.outer_occurrences_byte_identical, true);
assert.equal(report.schedule_steps_match_packet_baseline, true);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-packet-two-schedule-interleaved-noninterference-only');

for (const key of ['source_packet', 'carry_case', 'return_envelope', 'combined_transport']) {
  assert.notEqual(report.baseline.A[key].sha256, report.baseline.B[key].sha256, `A/B ${key} must remain distinguishable`);
}

assert.equal(report.schedules.length, 2);
for (const [scheduleIndex, schedule] of report.schedules.entries()) {
  assert.equal(schedule.assay_schedule_index, scheduleIndex + 1);
  assert.equal(schedule.assay_local_only, true);
  assert.deepEqual(schedule.schedule, MARROWLINE_INTERLEAVED_SCHEDULES[scheduleIndex]);
  assert.equal(schedule.steps.length, 3);
  for (const [stepIndex, step] of schedule.steps.entries()) {
    const label = schedule.schedule[stepIndex];
    assert.equal(step.assay_step_index, stepIndex + 1);
    assert.equal(step.assay_packet_label, label);
    assert.equal(step.assay_local_only, true);
    assert.deepEqual(step.surfaces, report.baseline[label]);
    assert.deepEqual(step.forbidden_interference_paths, []);
    assert.equal(step.revalidation.status, 'PRESENT_TO_HUMAN');
    assert.equal(step.revalidation.candidate_trusted, false);
    assert.equal(step.revalidation.release_authority, false);
    assert.equal(step.revalidation.human_closure_required, true);
    assert.equal(step.revalidation.local_binding_retained, true);
  }
  assert.deepEqual(schedule.steps[0].surfaces, schedule.steps[2].surfaces,
    `${schedule.schedule.join('→')} outer packet occurrences must remain byte-identical`);
}

assert.equal(report.controls.A.status, 'HOLD');
assert.equal(report.controls.A.return_envelope_distinguishable, true);
assert.equal(report.controls.B.status, 'HOLD');
assert.equal(report.controls.B.return_envelope_distinguishable, true);

const portableBaselines = JSON.stringify(report.baseline);
for (const forbidden of [
  'schedule_index',
  'sequence_index',
  'step_index',
  'prior_packet',
  'previous_packet',
  'prior_rule',
  'previous_rule',
  'prior_action',
  'previous_action',
  'route_history',
  'journey_history',
  'boundary_history',
  'receipt_chain',
  'prior_receipt',
  'previous_receipt',
  'receipt_id',
  'nonce',
  'sha256:'
]) {
  assert.equal(portableBaselines.includes(forbidden), false, `portable surface accumulated interleaving carrier: ${forbidden}`);
}

const source = fs.readFileSync('scripts/marrowline-interleaved-noninterference-assay.mjs', 'utf8');
assert.match(source, /bounded-two-packet-two-schedule-interleaved-noninterference-only/);
assert.match(source, /assay_schedule_index: scheduleIndex \+ 1/);
assert.match(source, /assay_step_index: stepIndex \+ 1/);
assert.match(source, /portable_schedule_index: false/);
assert.match(source, /prior_packet_identity_carried: false/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(schedule|step|prior|previous)/i,
  'Schedule or prior-packet state may not enter the carry-case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(schedule|step|prior|previous)/i,
  'Schedule or prior-packet state may not enter the return-envelope compiler input.');

console.log('Marrowline interleaved packet non-interference hostile contract: PASS');

await import('./marrowline-three-packet-permutation.test.mjs');
