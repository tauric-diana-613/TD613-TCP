import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAshKernelAdapter } from '../app/dome-world/previews/a15-r0/ash-kernel-adapter.js';
import { validateGovernedTaskFixture } from '../app/dome-world/previews/a15-r0/a15-r0-contracts.js';
import { createObservableEventRecorder } from '../app/dome-world/previews/a15-r0/observable-event-recorder.js';
import { runBooleanMobiusInteractionAssay } from '../app/dome-world/previews/a15-r0/boolean-mobius-interaction.js';
import {
  OBSERVABILITY_MODELS,
  matrixRank,
  mutualInformationBits,
  runObservabilityAssay,
  runOpenResearchField,
  runReconstructionAssay
} from '../app/dome-world/previews/a15-r0/open-research-field.js';
import { runBoundedTransformationEnvelope } from '../app/dome-world/previews/a15-r0/bounded-transformation-envelope.js';

const fixture = JSON.parse(fs.readFileSync('app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json', 'utf8'));
const consolidatedWorkflow = fs.readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const completeAshWitnessChamber = consolidatedWorkflow.match(
  /- name: Run the complete Ash witness through each installed engine[\s\S]*?- name: Run complete Flow-Core runtime evidence through the same browser installation/
)?.[0] || '';
assert.ok(completeAshWitnessChamber, 'The complete inherited Ash browser chamber must remain discoverable.');
assert.doesNotMatch(
  completeAshWitnessChamber,
  /timeout --foreground/,
  'Canonical inherited Ash browser probes must remain in timeout-owned process groups so Playwright descendants are killable with the probe.'
);
assert.match(
  consolidatedWorkflow,
  /Run changed-risk lifecycle closure preflight[\s\S]*timeout --foreground --signal=INT --kill-after=15s 420s node scripts\/run-ash-keep-a1-production-probe\.mjs/,
  'The lifecycle closure preflight keeps its constitutionally declared foreground timeout topology.'
);

for (const requiredField of ['action_times', 'route_observations']) {
  const incomplete = structuredClone(fixture);
  delete incomplete[requiredField];
  assert.throws(
    () => validateGovernedTaskFixture(incomplete),
    new RegExp(`${requiredField} is required`, 'i'),
    `Fixture validation must reject a missing ${requiredField} before adapter initialization.`
  );
}

const topLevelExtra = structuredClone(fixture);
topLevelExtra.unregistered_surface = false;
assert.throws(() => validateGovernedTaskFixture(topLevelExtra), /unregistered_surface is undeclared/i);

const namespaceExtra = structuredClone(fixture);
namespaceExtra.namespace.alias = 'flattened';
assert.throws(() => validateGovernedTaskFixture(namespaceExtra), /namespace\.alias is undeclared/i);

const localSourceExtra = structuredClone(fixture);
localSourceExtra.local_source.remote_hint = false;
assert.throws(() => validateGovernedTaskFixture(localSourceExtra), /local_source\.remote_hint is undeclared/i);

const invalidFixturePrefix = structuredClone(fixture);
invalidFixturePrefix.fixture_id = 'fixture_a15r0_wrong';
assert.throws(() => validateGovernedTaskFixture(invalidFixturePrefix), /Fixture ID has an invalid namespace prefix/i);

const invalidCasePrefix = structuredClone(fixture);
invalidCasePrefix.case_id = 'a15r0_case_wrong';
assert.throws(() => validateGovernedTaskFixture(invalidCasePrefix), /Case ID has an invalid namespace prefix/i);

const invalidTimestamp = structuredClone(fixture);
invalidTimestamp.created_at = '2026-08-11';
assert.throws(() => validateGovernedTaskFixture(invalidTimestamp), /RFC 3339 date-time/i);

const invalidActionTimestamp = structuredClone(fixture);
invalidActionTimestamp.action_times.RESET = 'Aug 11 2026';
assert.throws(() => validateGovernedTaskFixture(invalidActionTimestamp), /RFC 3339 date-time/i);

const nonFiniteFixture = structuredClone(fixture);
nonFiniteFixture.question.score = Number.POSITIVE_INFINITY;
assert.throws(() => validateGovernedTaskFixture(nonFiniteFixture), /numbers must be finite/i);

const missingAdapterRoom = structuredClone(fixture);
missingAdapterRoom.rooms = missingAdapterRoom.rooms.filter(room => room.id !== 'room_source');
assert.throws(() => validateGovernedTaskFixture(missingAdapterRoom), /adapter-required Room room_source/i);

const duplicateRoom = structuredClone(fixture);
duplicateRoom.rooms.push(structuredClone(duplicateRoom.rooms[0]));
assert.throws(() => validateGovernedTaskFixture(duplicateRoom), /Room IDs must be unique/i);

const invalidRouteRuleReference = structuredClone(fixture);
invalidRouteRuleReference.route_observations.route_b.proposed_references.push(fixture.question.node_id);
assert.throws(() => validateGovernedTaskFixture(invalidRouteRuleReference), /violates declared (?:Room|node-type) rules/i);

const invalidLocalLink = structuredClone(fixture);
invalidLocalLink.route_rules[0].local_link_keys.push('undeclared_link_target');
assert.throws(() => validateGovernedTaskFixture(invalidLocalLink), /local link .* is undeclared/i);

const widenedAuthority = structuredClone(fixture);
widenedAuthority.authority.shadow_override = false;
assert.throws(() => validateGovernedTaskFixture(widenedAuthority), /shadow_override is undeclared/i);

const mutableAttemptBefore = runObservabilityAssay().models.find(model => model.model_id === 'ACTIVE_BOUNDARY').mutual_information_bits;
assert.equal(mutableAttemptBefore, 1.584963);
assert.equal(Object.isFrozen(OBSERVABILITY_MODELS), true);
assert.equal(Object.isFrozen(OBSERVABILITY_MODELS[0]), true);
assert.equal(Object.isFrozen(OBSERVABILITY_MODELS[0].samples), true);
assert.equal(Object.isFrozen(OBSERVABILITY_MODELS[0].samples[0]), true);
assert.throws(() => {
  OBSERVABILITY_MODELS[0].samples[0].strategy = 'MUTATED';
}, TypeError);
assert.equal(runObservabilityAssay().models.find(model => model.model_id === 'ACTIVE_BOUNDARY').mutual_information_bits, 1.584963);

assert.equal(mutualInformationBits([
  { strategy:0, observation:false },
  { strategy:1, observation:true }
]), 1, 'Zero and false are valid categorical values rather than missing data.');
assert.equal(mutualInformationBits([
  { strategy:'A\u0000B', observation:'C' },
  { strategy:'A', observation:'B\u0000C' }
]), 1, 'Embedded NULs must not collide inside the joint-category representation.');

assert.equal(matrixRank([[1, 0], [0, 1]]), 2);
for (const invalidMatrix of [
  [[1, Number.NaN]],
  [[1, Number.POSITIVE_INFINITY]],
  [[1], [1, 2]]
]) assert.throws(() => matrixRank(invalidMatrix), TypeError);
assert.throws(() => matrixRank([[1]], -1), TypeError);
assert.throws(() => matrixRank([[1]], Number.NaN), TypeError);

for (const invalid of [
  { k: 1.5 },
  { k: 0 },
  { k: 10 },
  { epsilon: -0.01 },
  { epsilon: 1.01 },
  { epsilon: Number.NaN }
]) assert.throws(() => runReconstructionAssay(invalid), TypeError);

const immutableAdapter = await createAshKernelAdapter(fixture);
assert.equal(Object.isFrozen(immutableAdapter.fixture), true);
assert.equal(Object.isFrozen(immutableAdapter.fixture.route_observations), true);
assert.equal(Object.isFrozen(immutableAdapter.fixture.route_observations.route_a.proposed_references), true);
const originalFixtureReference = immutableAdapter.fixture;
const originalReference = immutableAdapter.fixture.route_observations.route_a.proposed_references[0];
assert.throws(() => {
  immutableAdapter.fixture = null;
}, TypeError);
assert.equal(immutableAdapter.fixture, originalFixtureReference, 'The public fixture surface must be read-only.');
assert.throws(() => {
  immutableAdapter.fixture.route_observations.route_a.proposed_references[0] = 'mutated_reference';
}, TypeError);
assert.equal(immutableAdapter.fixture.route_observations.route_a.proposed_references[0], originalReference);
assert.equal(typeof immutableAdapter.initializeState, 'undefined', 'Legacy initialization must not be publicly callable.');
assert.equal(typeof immutableAdapter.buildInitialState, 'undefined', 'Replacement state construction must not leak onto the adapter surface.');

const serializedAdapter = await createAshKernelAdapter(fixture);
const concurrent = await Promise.all([
  serializedAdapter.bindReference(),
  serializedAdapter.bindReference()
]);
assert.deepEqual(concurrent.map(receipt => receipt.status).sort(), ['HELD', 'OPEN']);
const serializedSnapshot = await serializedAdapter.snapshot();
assert.equal(serializedSnapshot.task_state, 'BIND_REFERENCE');
assert.equal(serializedSnapshot.case_map.nodes.filter(node => node.id === fixture.local_source.reference_id).length, 1);
assert.equal(serializedSnapshot.case_map.relationships.filter(relation => relation.id === 'relation_reference_attached').length, 1);

const monotonicResetAdapter = await createAshKernelAdapter(fixture);
const firstBind = await monotonicResetAdapter.bindReference();
const firstReset = await monotonicResetAdapter.resetFixture();
const secondReset = await monotonicResetAdapter.resetFixture();
assert.match(firstBind.receipt_id, /_001_bind_reference$/);
assert.match(firstReset.receipt_id, /_002_reset$/);
assert.match(secondReset.receipt_id, /_003_reset$/);
assert.notEqual(firstReset.receipt_id, secondReset.receipt_id, 'Reset receipts must never reuse sequence identity within one adapter lifetime.');

const receiptAtomicAdapter = await createAshKernelAdapter(fixture);
const beforeReceiptFailure = await receiptAtomicAdapter.snapshot();
const workingCrypto = globalThis.crypto;
receiptAtomicAdapter.cryptoImpl = {
  subtle: {
    digest: async (algorithm, material) => {
      const text = new TextDecoder().decode(material);
      if (text.startsWith('TD613:ASH:A15-R0:PROJECTION-RUN-RECEIPT:v1\n')) {
        throw new Error('forced projection receipt digest failure');
      }
      return workingCrypto.subtle.digest(algorithm, material);
    }
  }
};
await assert.rejects(() => receiptAtomicAdapter.bindReference(), /forced projection receipt digest failure/);
const afterReceiptFailure = await receiptAtomicAdapter.snapshot();
assert.deepEqual(afterReceiptFailure, beforeReceiptFailure, 'A failed receipt seal must roll back every staged transition mutation.');
receiptAtomicAdapter.cryptoImpl = workingCrypto;
const recoveredReceipt = await receiptAtomicAdapter.bindReference();
assert.equal(recoveredReceipt.status, 'OPEN');
assert.match(recoveredReceipt.receipt_id, /_001_bind_reference$/);

const recorder = createObservableEventRecorder();
await assert.rejects(() => recorder.record({}), /actionId is required/i);
await assert.rejects(() => recorder.record({ actionId:'ARRIVE' }), /kernelReceiptId is required/i);
await assert.rejects(() => recorder.record({ actionId:'ARRIVE', kernelReceiptId:'receipt' }), /worldAnswerId is required/i);
await assert.rejects(() => recorder.record({
  actionId:'ARRIVE',
  kernelReceiptId:'receipt',
  worldAnswerId:'world',
  actionToConsequenceDistance:-1
}), /non-negative safe integer/i);

let releaseFirstDigest;
const firstDigestGate = new Promise(resolve => { releaseFirstDigest = resolve; });
let releaseSecondDigest;
const secondDigestGate = new Promise(resolve => { releaseSecondDigest = resolve; });
let digestCall = 0;
const orderedRecorder = createObservableEventRecorder({
  cryptoImpl:{ subtle:{ digest: async () => {
    digestCall += 1;
    if (digestCall === 1) await firstDigestGate;
    else if (digestCall === 2) await secondDigestGate;
    return new Uint8Array([digestCall]).buffer;
  } } }
});
const orderedInput = n => ({
  taskStateBefore:'ARRIVE',
  controlId:`control_${n}`,
  actionId:`ACTION_${n}`,
  kernelReceiptId:`receipt_${n}`,
  worldAnswerId:`world_${n}`
});
const firstPending = orderedRecorder.record(orderedInput(1));
const secondPending = orderedRecorder.record(orderedInput(2));
releaseSecondDigest();
await Promise.resolve();
assert.equal(orderedRecorder.snapshot().length, 0, 'Later digest completion may not commit ahead of an earlier event ID.');
releaseFirstDigest();
const orderedResults = await Promise.all([firstPending, secondPending]);
assert.deepEqual(orderedResults.map(record => record.event_id), ['a15r0_event_001', 'a15r0_event_002']);
assert.deepEqual(orderedRecorder.snapshot().map(record => record.event_id), ['a15r0_event_001', 'a15r0_event_002']);

let releaseResetDigest;
const resetDigestGate = new Promise(resolve => { releaseResetDigest = resolve; });
const resetRaceRecorder = createObservableEventRecorder({
  cryptoImpl:{ subtle:{ digest: async () => {
    await resetDigestGate;
    return new Uint8Array([9]).buffer;
  } } }
});
const stalePending = resetRaceRecorder.record(orderedInput(9));
assert.equal(resetRaceRecorder.reset(), true);
releaseResetDigest();
await stalePending;
assert.deepEqual(resetRaceRecorder.snapshot(), [], 'A record begun before reset may not resurrect after the reset generation advances.');

const disposedAdapter = await createAshKernelAdapter(fixture);
const disposal = await disposedAdapter.dispose();
assert.equal(disposal.preview_memory_released, true);
assert.equal(disposedAdapter.fixture, null, 'Disposal must release the retained immutable fixture reference.');
await assert.rejects(() => disposedAdapter.resetFixture(), /terminal|disposed/i);
await assert.rejects(() => disposedAdapter.bindReference(), /disposed/i);
await assert.rejects(() => disposedAdapter.snapshot(), /disposed/i);

const field = runOpenResearchField();
const permissiveEnvelope = runBoundedTransformationEnvelope({
  field,
  observer_family_leakage_bits: 2,
  reconstruction_distance: 0.4,
  joining_synergy_bits: 1
});
assert.equal(permissiveEnvelope.all_declared_metric_gates_pass, true);
assert.equal(permissiveEnvelope.all_promotion_gates_pass, false);
assert.match(permissiveEnvelope.finding, /passes every declared metric gate/i);
assert.doesNotMatch(permissiveEnvelope.finding, /fails every metric gate/i);
assert.match(permissiveEnvelope.finding, /lacks empirical evidence class and human closure/i);

const roundingField = structuredClone(field);
roundingField.reconstruction.anisotropic_reconstruction_floor = 0.87654346;
const roundingEnvelope = runBoundedTransformationEnvelope({
  field:roundingField,
  observer_family_leakage_bits: 2,
  reconstruction_distance: 0.12345653,
  joining_synergy_bits: 2
});
const roundingGate = roundingEnvelope.metric_gates.find(gate => gate.gate_id === 'RECONSTRUCTION_FLOOR_DISTANCE');
assert.equal(roundingGate.value, 0.123457);
assert.equal(roundingGate.threshold, 0.123457);
assert.equal(roundingGate.pass, true, 'The pass bit must be derivable from the values recorded in the gate receipt.');

const mobius = runBooleanMobiusInteractionAssay();
assert.equal(mobius.function_count, 16);
assert.deepEqual(
  mobius.magnitude_groups.map(group => [group.absolute_mobius_interaction, group.joining_synergy_levels_bits]),
  [[0, [0]], [1, [0.188722]], [2, [1]]]
);
assert.equal(mobius.exact_synergy_level_by_absolute_mobius_magnitude, true);
assert.equal(mobius.strictly_monotone_synergy_across_mobius_magnitude_levels, true);
assert.equal(mobius.zero_mobius_magnitude_iff_zero_joining_excess_in_declared_family, true);
assert.equal(mobius.xor_xnor_share_maximum_magnitude, true);
assert.equal(mobius.discrete_hessian_interpretation_available, true);
assert.equal(mobius.riemannian_metric_declared, false);
assert.equal(mobius.affine_connection_declared, false);
assert.equal(mobius.curvature_tensor_declared, false);
assert.equal(mobius.intrinsic_geometric_curvature_claim, false);

console.log(JSON.stringify({
  contract:'td613.ash.a15-r0.review-hardening/v0.5-private-initializer-timeout-law',
  incomplete_fixture_rejected:true,
  schema_closed_records_enforced:true,
  fixture_and_case_prefixes_enforced:true,
  rfc3339_timestamps_enforced:true,
  json_numbers_finite:true,
  adapter_required_rooms_enforced:true,
  route_rules_enforced_before_adapter_initialization:true,
  fixture_authority_keys_closed:true,
  assay_samples_deep_frozen:true,
  mutual_information_categories_total:true,
  mutual_information_joint_keys_unambiguous:true,
  matrix_rank_numeric_domain_checked:true,
  reconstruction_parameters_bounded:true,
  adapter_fixture_deep_frozen:true,
  adapter_fixture_property_read_only:true,
  adapter_initialization_private:true,
  adapter_replacement_initializer_absent:true,
  transitions_serialized:true,
  reset_receipt_identity_monotonic:true,
  receipt_seal_atomic_with_state:true,
  recorder_required_ids_checked_before_coercion:true,
  recorder_distance_domain_checked:true,
  recorder_commit_order_serialized:true,
  recorder_reset_generation_barrier:true,
  inherited_ash_probe_process_groups_killable:true,
  lifecycle_closure_foreground_law_preserved:true,
  disposed_adapter_terminal:true,
  disposed_fixture_reference_released:true,
  envelope_finding_state_derived:true,
  envelope_gate_receipt_self_consistent:true,
  mobius_synergy_level_correspondence:true,
  geometric_curvature_claim:false
}, null, 2));
