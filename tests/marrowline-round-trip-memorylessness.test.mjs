import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_ASSAY_SCHEMA,
  MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_CYCLE_COUNT,
  runMarrowlineRoundTripMemorylessnessAssay
} from '../scripts/marrowline-round-trip-memorylessness-assay.mjs';

const report = runMarrowlineRoundTripMemorylessnessAssay();

assert.equal(report.schema, MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(report.cycle_count, 3);
assert.equal(report.cycle_count, MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_CYCLE_COUNT);
assert.equal(report.portable_cycle_index, false);
assert.equal(report.route_history_carried, false);
assert.equal(report.packet_byte_identical, true);
assert.equal(report.carry_case_byte_identical, true);
assert.equal(report.return_envelope_byte_identical, true);
assert.equal(report.combined_transport_byte_identical, true);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-three-cycle-compositional-memorylessness-only');

assert.equal(report.cycles.length, 3);
for (const [index, cycle] of report.cycles.entries()) {
  assert.equal(cycle.assay_cycle_index, index + 1);
  assert.equal(cycle.assay_local_only, true);
  assert.deepEqual(cycle.surfaces, report.canonical_surface);
  assert.deepEqual(cycle.forbidden_history_keys, []);
  assert.equal(cycle.revalidation.status, 'PRESENT_TO_HUMAN');
  assert.equal(cycle.revalidation.candidate_trusted, false);
  assert.equal(cycle.revalidation.release_authority, false);
  assert.equal(cycle.revalidation.human_closure_required, true);
  assert.equal(cycle.revalidation.local_binding_retained, true);
}

assert.equal(report.controls.mismatch_action_status, 'HOLD');
assert.equal(report.controls.mismatch_return_distinguishable, true);
assert.equal(report.controls.alternate_rule_carry_case_distinguishable, true);

const canonicalTransportSummary = JSON.stringify(report.canonical_surface);
for (const forbidden of [
  'cycle_count',
  'cycle_index',
  'route_history',
  'journey_history',
  'boundary_history',
  'receipt_chain',
  'prior_boundary',
  'previous_boundary',
  'prior_receipt',
  'previous_receipt',
  'receipt_id',
  'nonce',
  'sha256:'
]) {
  assert.equal(canonicalTransportSummary.includes(forbidden), false, `portable surface accumulated history carrier: ${forbidden}`);
}

const source = fs.readFileSync('scripts/marrowline-round-trip-memorylessness-assay.mjs', 'utf8');
assert.match(source, /bounded-three-cycle-compositional-memorylessness-only/);
assert.match(source, /assay_cycle_index: index \+ 1/);
assert.match(source, /assay_local_only: true/);
assert.match(source, /portable_cycle_index: false/);
assert.match(source, /route_history_carried: false/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*cycle/i,
  'Cycle index may not enter the carry-case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*cycle/i,
  'Cycle index may not enter the return-envelope compiler input.');

console.log('Marrowline bounded round-trip memorylessness hostile contract: PASS');
