import assert from 'node:assert/strict';
import fs from 'node:fs';

await import('./ash-a15-r0-review-hardening-core.test.mjs');

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

const adapter = await createAshKernelAdapter(fixture);
assert.equal('state' in adapter, false, 'Adapter state must not remain on the public governance surface.');
assert.equal('sequence' in adapter, false, 'Adapter receipt sequence must not remain on the public governance surface.');
assert.equal(adapter.state, undefined, 'Adapter state reads must not expose mutable governance state.');
assert.equal(adapter.sequence, undefined, 'Adapter sequence reads must not expose receipt identity state.');
assert.throws(() => { adapter.state = { taskState:'RETURN' }; }, /private governance state/i);
assert.throws(() => { adapter.sequence = 0; }, /private governance state/i);
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
