import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A15_R0_INTERACTION_OWNERS,
  getInteractionOwner
} from '../app/dome-world/previews/a15-r0/interaction-owner-registry.js';
import { createObservableEventRecorder } from '../app/dome-world/previews/a15-r0/observable-event-recorder.js';

const harness = fs.readFileSync('app/dome-world/previews/a15-r0/a15-r0-harness.js', 'utf8');
const html = fs.readFileSync('app/dome-world/previews/a15-r0/index.html', 'utf8');

assert.equal(A15_R0_INTERACTION_OWNERS.length, 7);
assert.equal(new Set(A15_R0_INTERACTION_OWNERS.map(record => record.control_id)).size, 7);
for (const record of A15_R0_INTERACTION_OWNERS) {
  assert.equal(record.projection_owner, 'A15_R0_HARNESS');
  assert.equal(record.action_owner, 'ASH_KERNEL_ADAPTER');
  assert.equal(record.event_phase, 'bubble');
  assert.equal(record.delegated, true);
  assert.equal(record.competing_owner_detected, false);
  assert.ok(html.includes(`id="${record.control_id}"`), `Declared control ${record.control_id} is not visible in the preview.`);
}
assert.equal(getInteractionOwner('compare-route').action_owner, 'ASH_KERNEL_ADAPTER');
assert.equal(getInteractionOwner('unknown'), null);
assert.doesNotMatch(harness, /addEventListener\([^)]*,\s*true\s*\)|stopImmediatePropagation|\.click\(\)|MutationObserver/);
assert.equal((harness.match(/button\.addEventListener\('click'/g) || []).length, 1);

const recorder = createObservableEventRecorder({
  runId: 'a15r0_run_test',
  projectionId: 'FIXED_KERNEL_ASSAY'
});
const event = await recorder.record({
  taskStateBefore: 'ARRIVE',
  controlId: 'bind-reference',
  controlVisible: true,
  controlEnabled: true,
  gesture: 'click',
  actionId: 'BIND_REFERENCE',
  kernelReceiptId: 'a15r0_receipt_test',
  worldAnswerId: 'world_bind_reference',
  actionToConsequenceDistance: 1,
  boundaryCrossings: [],
  unexplainedSeams: ['external response unavailable'],
  backtrack: false,
  helpRequested: false,
  restAvailable: true,
  returnAvailable: false,
  missingness: ['external response unavailable']
});
assert.equal(event.source_status, 'OBSERVED');
assert.equal(event.sensor_id, 'browser-interface-observation');
assert.equal(event.authority_class, 'A1_OBSERVATIONAL');
assert.equal(event.control_visible, true);
assert.equal(event.control_enabled, true);
assert.match(event.event_digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(JSON.stringify(event).match(/cognition|intelligence|mastery|emotion|psychological|authorship|intent|consent|moral|clinical/gi), null);
assert.deepEqual(recorder.snapshot(), [event]);
assert.equal(recorder.reset(), true);
assert.deepEqual(recorder.snapshot(), []);

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.interaction-ownership-test/v0.1',
  declared_controls: A15_R0_INTERACTION_OWNERS.length,
  bubble_phase_only: true,
  competing_owner_detected: false,
  observable_event_receipted: true,
  participant_inference: false
}, null, 2));
