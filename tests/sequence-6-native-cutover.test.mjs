import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { bindMarrowlineResultToLoomReturn } from '../app/dome-world/marrowline-loom-demo.js';
import { portableLoomDigest } from '../app/engine/portable-loom-session.js';

test('Marrowline native adapter binds the actual completed result to the registered Loom turn', async () => {
  const packet = { reentry_contract: {
    schema: 'td613.loom.reentry-excursion/v0.2', ref: '1'.repeat(64),
    session_root_ref: '2'.repeat(64), policy_commitment: '3'.repeat(64), anchor_work_unit_ref: '4'.repeat(64),
    turns: [{ ref: '5'.repeat(64), turn_index: 1, task_digest: '6'.repeat(64), source_commitment_digest: '7'.repeat(64) }]
  }};
  const result = { status: 'completed', answer: 'Actual admitted provider result bytes.', used_document_ids: ['doc_a'], missing_information: ['One bounded gap.'] };
  const bound = await bindMarrowlineResultToLoomReturn(packet, result, { crypto: webcrypto });
  assert.equal(bound.schema, 'td613.loom.bound-receiver-turn/v0.2');
  assert.equal(bound.answer, result.answer);
  assert.equal(bound.answer_digest, await portableLoomDigest(result.answer, { crypto: webcrypto }));
  assert.equal(bound.intent_ref, packet.reentry_contract.turns[0].ref);
  assert.equal(bound.receiver_declaration.policy_change_requested, false);
  await assert.rejects(
    bindMarrowlineResultToLoomReturn(packet, result, { crypto: webcrypto }, { substantiveContinuationCount: 2 }),
    /HOLD_UNREGISTERED_MARROWLINE_CONTINUATION/
  );
});

test('Sequence 6 capability randomness has no Math.random downgrade', () => {
  const source = fs.readFileSync('app/engine/sequence-6-journey.js','utf8');
  const capability = source.slice(source.indexOf('function secureRandomBytes'), source.indexOf('function hexRandom') + 500);
  assert.match(capability, /CAPABILITY_RANDOMNESS_UNAVAILABLE/);
  assert.doesNotMatch(capability, /Math\.random/);
});

test('standalone Sequence 6 deep links are explicitly state fixtures, not native-product evidence', () => {
  const source = fs.readFileSync('app/dome-world/sequence-6-journey.html','utf8');
  assert.match(source, /BROWSER_STATE_FIXTURE/);
  assert.match(source, /STATE_FIXTURE_SYNTHETIC_GESTURE/);
  const fixtureBody = source.slice(source.indexOf('async function advanceStateFixtureToStage'), source.indexOf('// Viewport controls'));
  assert.doesNotMatch(fixtureBody, /createLoomAiHandoff\(/);
  assert.doesNotMatch(fixtureBody, /consumeLoomAiHandoff\(/);
  const product = fs.readFileSync('app/dome-world/holonomy-loom/ai-workspace.js','utf8');
  assert.match(product, /reentry\.registerDeparture/);
  assert.match(product, /createLoomAiHandoff\(task,environment,\{reentryContract\}\)/);
  assert.match(product, /reentry\.loadReturnedTurn/);
});

test('live browser witness requires native Check then explicit Admit then Rest', () => {
  const source = fs.readFileSync('scripts/loom-journey-reconstruction-live-browser.mjs','utf8');
  assert.match(source, /data-loom-reentry=check/);
  assert.match(source, /ADMISSION_CANDIDATE/);
  assert.match(source, /data-loom-reentry=admit/);
  assert.match(source, /data-loom-reentry=rest/);
  assert.match(source, /desktop-native-reduced-motion/);
});
