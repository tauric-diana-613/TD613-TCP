import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAshKernelAdapter } from '../app/dome-world/previews/a15-r0/ash-kernel-adapter.js';
import { validateGovernedTaskFixture } from '../app/dome-world/previews/a15-r0/a15-r0-contracts.js';
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

for (const requiredField of ['action_times', 'route_observations']) {
  const incomplete = structuredClone(fixture);
  delete incomplete[requiredField];
  assert.throws(
    () => validateGovernedTaskFixture(incomplete),
    new RegExp(`${requiredField} is required`, 'i'),
    `Fixture validation must reject a missing ${requiredField} before adapter initialization.`
  );
}

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
const originalReference = immutableAdapter.fixture.route_observations.route_a.proposed_references[0];
assert.throws(() => {
  immutableAdapter.fixture.route_observations.route_a.proposed_references[0] = 'mutated_reference';
}, TypeError);
assert.equal(immutableAdapter.fixture.route_observations.route_a.proposed_references[0], originalReference);

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
  contract:'td613.ash.a15-r0.review-hardening/v0.3-review-round-two',
  incomplete_fixture_rejected:true,
  adapter_required_rooms_enforced:true,
  route_rules_enforced_before_adapter_initialization:true,
  fixture_authority_keys_closed:true,
  assay_samples_deep_frozen:true,
  mutual_information_categories_total:true,
  mutual_information_joint_keys_unambiguous:true,
  matrix_rank_numeric_domain_checked:true,
  reconstruction_parameters_bounded:true,
  adapter_fixture_deep_frozen:true,
  transitions_serialized:true,
  receipt_seal_atomic_with_state:true,
  disposed_adapter_terminal:true,
  disposed_fixture_reference_released:true,
  envelope_finding_state_derived:true,
  envelope_gate_receipt_self_consistent:true,
  mobius_synergy_level_correspondence:true,
  geometric_curvature_claim:false
}, null, 2));
