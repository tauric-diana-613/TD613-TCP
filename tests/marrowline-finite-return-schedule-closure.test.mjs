import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_FINITE_RETURN_SCHEDULE_CLOSURE_ASSAY_SCHEMA,
  MARROWLINE_FINITE_RETURN_SCHEDULES,
  MARROWLINE_FINITE_RETURN_REPLAY_ORDER,
  runMarrowlineFiniteReturnScheduleClosureAssay
} from '../scripts/marrowline-finite-return-schedule-closure-assay.mjs';

const report = runMarrowlineFiniteReturnScheduleClosureAssay();

assert.equal(report.schema, MARROWLINE_FINITE_RETURN_SCHEDULE_CLOSURE_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(MARROWLINE_FINITE_RETURN_SCHEDULES.map(item => item.id), [
  'AB', 'BA', 'A_ONLY', 'B_ONLY', 'AAB', 'BBA', 'A_HOLD_B', 'B_HOLD_A'
]);
assert.deepEqual(MARROWLINE_FINITE_RETURN_REPLAY_ORDER, [
  'B_HOLD_A', 'A_HOLD_B', 'BBA', 'AAB', 'B_ONLY', 'A_ONLY', 'BA', 'AB'
]);
assert.deepEqual(report.primary_order, [
  'AB', 'BA', 'A_ONLY', 'B_ONLY', 'AAB', 'BBA', 'A_HOLD_B', 'B_HOLD_A'
]);
assert.deepEqual(report.replay_order, MARROWLINE_FINITE_RETURN_REPLAY_ORDER);

assert.deepEqual(report.shared_case.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.shared_case.finding_count, 2);
assert.equal(report.shared_case.local_binding_carried, false);
assert.equal(report.shared_case.release_authority, false);
assert.equal(report.shared_case.human_closure_required, true);
assert.deepEqual(report.shared_case.forbidden_portable_schedule_paths, []);

const byId = Object.fromEntries(report.primary_schedules.map(item => [item.schedule_id, item]));
const replayById = Object.fromEntries(report.replay_schedules.map(item => [item.schedule_id, item]));
for (const spec of MARROWLINE_FINITE_RETURN_SCHEDULES) {
  const first = byId[spec.id];
  const second = replayById[spec.id];
  assert.ok(first, `missing primary schedule ${spec.id}`);
  assert.ok(second, `missing replay schedule ${spec.id}`);
  assert.deepEqual(first, second, `${spec.id} drifted across family replay`);
  assert.equal(first.carry_case_unchanged, true);
  assert.equal(first.local_bindings_unchanged, true);
  assert.equal(first.canonical_envelopes_unchanged, true);
  assert.equal(first.authority_closed, true);
  for (const observation of first.observations) {
    const expected = observation.mode === 'MATCH' ? 'PRESENT_TO_HUMAN' : 'HOLD';
    assert.equal(observation.result.status, expected, `${spec.id} ${observation.label}:${observation.mode} status drift`);
    assert.equal(observation.result.candidate_trusted, false);
    assert.equal(observation.result.release_authority, false);
    assert.equal(observation.result.human_closure_required, true);
    assert.equal(observation.result.local_binding_retained, true);
  }
}

assert.equal(byId.A_ONLY.observations.length, 1);
assert.equal(byId.A_ONLY.observations[0].label, 'A');
assert.equal(byId.A_ONLY.omitted_sibling_probe.label, 'B');
assert.equal(byId.A_ONLY.omitted_sibling_probe.result.status, 'PRESENT_TO_HUMAN');
assert.equal(byId.A_ONLY.omitted_sibling_probe.remained_canonical, true);
assert.equal(byId.B_ONLY.observations.length, 1);
assert.equal(byId.B_ONLY.observations[0].label, 'B');
assert.equal(byId.B_ONLY.omitted_sibling_probe.label, 'A');
assert.equal(byId.B_ONLY.omitted_sibling_probe.result.status, 'PRESENT_TO_HUMAN');
assert.equal(byId.B_ONLY.omitted_sibling_probe.remained_canonical, true);

assert.deepEqual(byId.AAB.execution, ['A:MATCH', 'A:MATCH', 'B:MATCH']);
assert.deepEqual(byId.BBA.execution, ['B:MATCH', 'B:MATCH', 'A:MATCH']);
assert.deepEqual(byId.A_HOLD_B.execution, ['A:MISMATCH', 'B:MATCH']);
assert.deepEqual(byId.B_HOLD_A.execution, ['B:MISMATCH', 'A:MATCH']);
assert.deepEqual(byId.A_HOLD_B.observations.map(item => item.result.status), ['HOLD', 'PRESENT_TO_HUMAN']);
assert.deepEqual(byId.B_HOLD_A.observations.map(item => item.result.status), ['HOLD', 'PRESENT_TO_HUMAN']);

assert.equal(report.controls.A_with_B_binding.rejected, true);
assert.equal(report.controls.B_with_A_binding.rejected, true);
assert.match(report.controls.A_with_B_binding.error, /local binding does not match portable projection/);
assert.match(report.controls.B_with_A_binding.error, /local binding does not match portable projection/);
assert.equal(report.controls.lawful_recovery.A.status, 'PRESENT_TO_HUMAN');
assert.equal(report.controls.lawful_recovery.B.status, 'PRESENT_TO_HUMAN');
assert.equal(report.controls.transport_unchanged, true);
assert.equal(report.controls.local_bindings_unchanged, true);
assert.equal(report.controls.nonpoisoning, true);

for (const key of [
  'lawful_pair_matches_1062_parent',
  'return_order_identity_stable',
  'sibling_omission_no_closure_transfer',
  'repeated_return_no_sibling_authorization',
  'local_hold_no_sibling_decision_drift',
  'finite_schedule_no_portable_memory',
  'shared_carry_case_unchanged_across_schedules',
  'local_bindings_unchanged_across_schedules',
  'canonical_envelopes_unchanged_across_schedules',
  'wrong_rule_binding_rejected',
  'wrong_binding_nonpoisoning',
  'family_replay_invariant'
]) assert.equal(report[key], true);

assert.equal(report.portable_schedule_state_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-eight-schedule-return-nontransfer-decision-stability-only');

const assaySource = fs.readFileSync('scripts/marrowline-finite-return-schedule-closure-assay.mjs', 'utf8');
const compilerSource = fs.readFileSync('app/dome-world/marrowline-pocket-hosted-carry-case.js', 'utf8');
const projectionSource = fs.readFileSync('app/dome-world/portable-aia-three-route-invariance.js', 'utf8');
assert.match(assaySource, /Finite return schedule leaked schedule\/completion state into portable surfaces/);
assert.match(assaySource, /repeated return drifted across identical local revalidation/);
assert.match(assaySource, /local HOLD drifted sibling/);
assert.match(assaySource, /lawful P_AB drifted from #1062 parent/);
assert.match(assaySource, /bounded-two-finding-eight-schedule-return-nontransfer-decision-stability-only/);
assert.match(compilerSource, /const RETURN_ENVELOPE_KEYS = Object\.freeze\(\[/);
assert.match(compilerSource, /return Object\.freeze\(\{\n    status: result\.status,/);
assert.match(compilerSource, /local_binding_retained: true/);
assert.match(projectionSource, /local binding does not match portable projection/);
assert.doesNotMatch(assaySource, /writeFileSync|writeFile\(|localStorage\.setItem|sessionStorage\.setItem/,
  'Finite return-schedule assay may not persist schedule state.');

console.log('Marrowline finite return-schedule closure hostile contract: PASS');

// #1065 changes coordinates from finite return scheduling to validation-layer precedence.
// The descendant must distinguish packet-wide preaudit from the later sequential finding
// scan without mutating the compiler or extending the closed #1064 schedule family.
await import('./marrowline-validation-layer-precedence.test.mjs');
