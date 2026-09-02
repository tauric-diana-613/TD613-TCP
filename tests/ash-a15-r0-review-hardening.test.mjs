import assert from 'node:assert/strict';
import fs from 'node:fs';

await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');
await import('./western-horizon-main-accession-constitution.test.mjs');
await import('./western-horizon-executable-accession.test.mjs');
await import('./ash-a16-current-estate-readmission-audit.test.mjs');

const { validateGovernedTaskFixture } = await import('../app/dome-world/previews/a15-r0/a15-r0-contracts.js');
const { createObservableEventRecorder } = await import('../app/dome-world/previews/a15-r0/observable-event-recorder.js');
const { createAshKernelAdapter } = await import('../app/dome-world/previews/a15-r0/ash-kernel-adapter.js');
const fixture = JSON.parse(fs.readFileSync('app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json', 'utf8'));

for (const [label, mutate] of [
  ['created_at', copy => { copy.created_at = '2026-02-30T12:00:00Z'; }],
  ['action_time', copy => { copy.action_times.ARRIVE = '2026-02-30T12:00:00Z'; }]
]) {
  const invalid = structuredClone(fixture);
  mutate(invalid);
  assert.throws(() => validateGovernedTaskFixture(invalid), /calendar-valid RFC 3339/i, `${label} must reject a nonexistent calendar date.`);
}

const recorder = createObservableEventRecorder();
await assert.rejects(
  recorder.record({ actionId:'A', kernelReceiptId:'R', worldAnswerId:'W', controlId:'control' }),
  /taskStateBefore is required/i,
  'Observable events must identify the pre-action task state before coercion.'
);
await assert.rejects(
  recorder.record({ actionId:'A', kernelReceiptId:'R', worldAnswerId:'W', taskStateBefore:'ARRIVE' }),
  /controlId is required/i,
  'Observable events must identify the visible control before coercion.'
);

const mutableBoundary = { edge:'alpha' };
const mutableSeam = { seam:'beta' };
const mutableMissingness = { message:'original' };
const pendingEvent = recorder.record({
  actionId:'OBSERVE',
  kernelReceiptId:'receipt_observe',
  worldAnswerId:'world_observe',
  taskStateBefore:'ARRIVE',
  controlId:'control_observe',
  boundaryCrossings:[mutableBoundary],
  unexplainedSeams:[mutableSeam],
  missingness:[mutableMissingness]
});
mutableBoundary.edge = 'mutated';
mutableSeam.seam = 'mutated';
mutableMissingness.message = 'mutated';
await pendingEvent;
const retainedEvent = recorder.snapshot().at(-1);
assert.equal(retainedEvent.boundary_crossings[0].edge, 'alpha', 'Boundary-crossing inputs must be copied before asynchronous hashing.');
assert.equal(retainedEvent.unexplained_seams[0].seam, 'beta', 'Unexplained-seam inputs must be copied before asynchronous hashing.');
assert.equal(retainedEvent.missingness[0].message, 'original', 'Missingness inputs must be copied before asynchronous hashing.');
assert.equal(Object.isFrozen(retainedEvent.boundary_crossings[0]), true, 'Retained nested event inputs must be recursively frozen.');
assert.equal(Object.isFrozen(retainedEvent.unexplained_seams[0]), true, 'Retained nested event inputs must be recursively frozen.');
assert.equal(Object.isFrozen(retainedEvent.missingness[0]), true, 'Retained nested event inputs must be recursively frozen.');

const adapter = await createAshKernelAdapter(fixture);
assert.equal('state' in adapter, false, 'Adapter state must not remain on the public governance surface.');
assert.equal('sequence' in adapter, false, 'Adapter receipt sequence must not remain on the public governance surface.');
assert.equal(adapter.state, undefined, 'Adapter state reads must not expose mutable governance state.');
assert.equal(adapter.sequence, undefined, 'Adapter receipt identity state must not remain on the public governance surface.');
assert.throws(() => { adapter.state = { taskState:'RETURN' }; }, /private governance state/i);
assert.throws(() => { adapter.sequence = 0; }, /private governance state/i);
for (const internal of ['sealReceipt','restoreMutationCheckpoint','mutationCheckpoint','transition','hold','enqueueMutation','stateSummary','caseMapInput','options','assertAvailable']) {
  assert.equal(adapter[internal], undefined, `${internal} must not be callable through the public adapter membrane.`);
  assert.equal(internal in adapter, false, `${internal} must not be enumerable as public adapter capability.`);
}
assert.throws(() => { adapter.sealReceipt = () => null; }, /private governance state/i, 'Receipt sealing may not be installed onto the public adapter membrane.');
assert.equal(typeof adapter.cryptoImpl, 'object', 'The declared digest-injection test seam remains readable.');
adapter.cryptoImpl = adapter.cryptoImpl;
assert.equal((await adapter.snapshot()).task_state, 'ARRIVE', 'Public membrane writes must not alter governed adapter state.');
await adapter.dispose();

const empiricalSource = fs.readFileSync('scripts/ash-a15-empirical-profile-journeys-browser-probe.mjs', 'utf8');
assert.match(empiricalSource, /schema, version, \.\.\.publicPayload/, 'Leak scanning must exclude schema/version metadata.');
assert.match(empiricalSource, /profile\.replaceAll\('_', ' '\)/, 'Profile chip comparison must use the UI display normalization.');
assert.match(empiricalSource, /visible\.visible_text !== answer\.message/, 'Visible world-answer text must equal the emitted message.');
assert.match(empiricalSource, /assertClosedWorldAnswer/, 'World-answer authority must be validated before certification.');

const transitionSource = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
assert.match(transitionSource, /automatic_ash_action === false/, 'Transition hydration must require closed automatic-action authority.');
assert.match(transitionSource, /hydrationReceipt\.automatic_ash_action !== false/, 'Transition hydration receipts must be rejected if authority widens.');

const a12Source = fs.readFileSync('scripts/ash-a12-browser-probe.mjs', 'utf8');
assert.match(a12Source, /case_closed:document\.body\.dataset\.ashCaseClosed === 'true'/, 'A12 must observe whether the reusable Investigation case is already closed.');
assert.match(a12Source, /existing\.case_closed === true/, 'A12 must reactivate a matching but closed Investigation case.');

console.log('Ash A15-R0 release-boundary hardening tests passed.');