import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  selectKhonapolitProviderModels,
  allocateKhonapolitAttemptTimeout
} from '../server/khonapolit-quality.js';
import {
  buildMarrowlinePortableTask,
  portableMarrowlinePrompt
} from '../app/dome-world/marrowline-terminal.js';

const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const terminal = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const living = fs.readFileSync('app/dome-world/marrowline-living-chat.js', 'utf8');

const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];

test('independent Marrowline provider routing preserves diversified fallback runway', () => {
  assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 3);
  assert.deepEqual(selectKhonapolitProviderModels(models), ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 3 }), 33333);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 16667, index: 1, modelCount: 3 }), 8333);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0, modelCount: 1 }), 50000);
});

test('blank Marrowline exposes an ordinary unissued task lane before advanced custody settings', () => {
  assert.match(page, /id="khonapolitWaive"[^>]*checked/);
  assert.match(page, /Ordinary work starts in unissued research mode/i);
  assert.match(page, /id="retryKhonapolitTask"/);
  assert.match(page, /id="copyKhonapolitPortable"/);
  assert.match(page, /id="exportKhonapolitPortable"/);
  assert.doesNotMatch(page, /Choose your connection in Keys & settings, then send a message/);
  assert.doesNotMatch(living, /openPanel\('invocationPanel', true\)/,
    'ordinary first submit cannot be diverted into the custody-settings drawer');
});

test('independent Marrowline portable packet preserves task, context, rules and latest answer', () => {
  const state = {
    messages: [
      { role: 'user', text: 'Earlier context.' },
      { role: 'model', text: 'Earlier answer.' },
      { role: 'user', text: 'Plan a workshop for twelve attendees with 600 credits.' },
      { role: 'model', text: 'Use the 180-credit venue and keep 420 credits.' }
    ],
    lastReceipt: { provider: { model: 'gemini-x' } }
  };
  const packet = buildMarrowlinePortableTask(state);
  assert.equal(packet.schema, 'td613.marrowline.portable-task/v0.1');
  assert.equal(packet.task, 'Plan a workshop for twelve attendees with 600 credits.');
  assert.equal(packet.latest_answer, 'Use the 180-credit venue and keep 420 credits.');
  assert.deepEqual(packet.context.map(entry => entry.text), ['Earlier context.', 'Earlier answer.']);
  assert.ok(packet.rules.some(rule => /context rather than hidden authority/i.test(rule)));
  assert.equal(Object.hasOwn(packet, 'receipt'), false, 'technical provider receipt is not required to use the portable task');
  const prompt = portableMarrowlinePrompt(packet);
  assert.match(prompt, /Paste this entire Marrowline task packet into your chosen AI companion/i);
  assert.match(prompt, /acknowledge the task and rules before working/i);
  assert.match(prompt, /td613\.marrowline\.portable-task\/v0\.1/);
});

test('independent-task recovery keeps the original draft and offers retry plus portability', () => {
  assert.match(terminal, /retryKhonapolitTask/);
  assert.match(terminal, /copyKhonapolitPortable/);
  assert.match(terminal, /exportKhonapolitPortable/);
  assert.match(terminal, /Your task is still here/i);
  assert.match(terminal, /prompt\.value\s*=\s*message/,
    'failed transport must restore the exact submitted task to the composer');
});
