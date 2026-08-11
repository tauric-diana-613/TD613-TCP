import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAshKernelAdapter } from '../app/dome-world/previews/a15-r0/ash-kernel-adapter.js';
import { validateGovernedTaskFixture } from '../app/dome-world/previews/a15-r0/a15-r0-contracts.js';
import {
  OBSERVABILITY_MODELS,
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

const disposedAdapter = await createAshKernelAdapter(fixture);
const disposal = await disposedAdapter.dispose();
assert.equal(disposal.preview_memory_released, true);
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

console.log(JSON.stringify({
  contract:'td613.ash.a15-r0.review-hardening/v0.1',
  incomplete_fixture_rejected:true,
  assay_samples_deep_frozen:true,
  reconstruction_parameters_bounded:true,
  adapter_fixture_deep_frozen:true,
  transitions_serialized:true,
  disposed_adapter_terminal:true,
  envelope_finding_state_derived:true
}, null, 2));
