import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_CROSS_BINDING_REJECTION_NONPOISONING_ASSAY_SCHEMA,
  MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES,
  runMarrowlineCrossBindingRejectionNonpoisoningAssay
} from '../scripts/marrowline-cross-binding-rejection-nonpoisoning-assay.mjs';

const report = runMarrowlineCrossBindingRejectionNonpoisoningAssay();

assert.equal(report.schema, MARROWLINE_CROSS_BINDING_REJECTION_NONPOISONING_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(report.shared_case.finding_count, 2);
assert.deepEqual(report.shared_case.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.shared_case.local_binding_carried, false);
assert.equal(report.shared_case.release_authority, false);
assert.equal(report.shared_case.human_closure_required, true);
assert.deepEqual(report.shared_case.forbidden_transport_paths, []);

assert.deepEqual(MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES.map(item => item.id), [
  'A_REJECT_THEN_A_B',
  'B_REJECT_THEN_B_A',
  'A_REJECT_THEN_B_A',
  'B_REJECT_THEN_A_B'
]);
assert.equal(report.primary_schedules.length, 4);
assert.equal(report.replay_schedules.length, 4);

for (const schedule of report.primary_schedules) {
  assert.equal(schedule.assay_local_only, true);
  assert.equal(schedule.rejected, true);
  assert.match(schedule.rejection_error, /local binding does not match portable projection/);
  assert.deepEqual(schedule.recovery_statuses, { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' });
  assert.equal(schedule.carry_case_unchanged, true);
  assert.equal(schedule.local_bindings_unchanged, true);
  assert.equal(schedule.canonical_envelopes_unchanged, true);
  assert.equal(schedule.attacked_finding_recovered_to_baseline, true);
  assert.equal(schedule.sibling_unpoisoned, true);
  assert.equal(schedule.authority_closed, true);
}

const primary = Object.fromEntries(report.primary_schedules.map(item => [item.schedule_id, item]));
const replay = Object.fromEntries(report.replay_schedules.map(item => [item.schedule_id, item]));
for (const id of Object.keys(primary)) {
  assert.ok(replay[id], `Replay omitted ${id}`);
  assert.equal(replay[id].rejected, true);
  assert.deepEqual(replay[id].recovery_statuses, primary[id].recovery_statuses);
  assert.equal(replay[id].attacked_finding_recovered_to_baseline, true);
  assert.equal(replay[id].sibling_unpoisoned, true);
  assert.equal(replay[id].carry_case_unchanged, true);
  assert.equal(replay[id].local_bindings_unchanged, true);
  assert.equal(replay[id].canonical_envelopes_unchanged, true);
}

for (const label of ['A', 'B']) {
  assert.equal(report.baseline[label].status, 'PRESENT_TO_HUMAN');
  assert.equal(report.baseline[label].candidate_trusted, false);
  assert.equal(report.baseline[label].release_authority, false);
  assert.equal(report.baseline[label].human_closure_required, true);
  assert.equal(report.baseline[label].local_binding_retained, true);
}

assert.equal(report.cross_bindings_rejected, true);
assert.equal(report.carry_case_unchanged_after_rejection, true);
assert.equal(report.local_bindings_unchanged_after_rejection, true);
assert.equal(report.canonical_envelopes_unchanged_after_rejection, true);
assert.equal(report.attacked_findings_recover_to_baseline, true);
assert.equal(report.siblings_unpoisoned, true);
assert.equal(report.replay_order_invariant, true);
assert.equal(report.portable_failure_state_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-sequential-cross-binding-rejection-nonpoisoning-only');

const source = fs.readFileSync('scripts/marrowline-cross-binding-rejection-nonpoisoning-assay.mjs', 'utf8');
assert.match(source, /REJECTION|rejected/i);
assert.match(source, /poisoned lawful/);
assert.match(source, /poisoned untouched sibling/);
assert.match(source, /bounded-two-finding-sequential-cross-binding-rejection-nonpoisoning-only/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(failure|attack|poison|history|retry)/i,
  'Failure or attack state may not enter the Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(failure|attack|poison|history|retry|sibling)/i,
  'Failure or sibling state may not enter the return-envelope compiler input.');

console.log('Marrowline cross-binding rejection non-poisoning hostile contract: PASS');

// Successor hostile contract: preserve rule-bound finding identity while the exact same
// two canonical portable findings exchange array positions. Container order must remain
// observable while per-rule Hosted projections, return envelopes, and decisions stay stable.
await import('./marrowline-finding-order-permutation-stability.test.mjs');
