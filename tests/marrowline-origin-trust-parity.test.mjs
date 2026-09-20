import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  KHONAPOLIT_MAX_PROVIDER_CALLS,
  KHONAPOLIT_MAX_STRUCTURAL_REPAIRS,
  KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS,
  selectKhonapolitProviderModels,
  selectKhonapolitProviderModelsFromPlan,
  allocateKhonapolitAttemptTimeout
} from '../server/khonapolit-quality.js';
import {
  buildMarrowlinePortableTask,
  portableMarrowlinePrompt
} from '../app/dome-world/marrowline-terminal.js';

const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const terminal = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const living = fs.readFileSync('app/dome-world/marrowline-living-chat.js', 'utf8');

const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

test('independent Marrowline provider routing is frontier-only with bounded 3.x fallback runway', () => {
  assert.equal(KHONAPOLIT_MAX_PROVIDER_CALLS, 5, 'five remains the distinct frontier-seat ceiling');
  assert.equal(KHONAPOLIT_MAX_STRUCTURAL_REPAIRS, 1, 'only one same-provider structural repair may follow the frontier cascade');
  assert.equal(KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS, 6, 'five distinct seats plus one bounded repair is the complete request ceiling');
  assert.deepEqual(selectKhonapolitProviderModels(models), ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview'],
    '2.5 and every Lite candidate remain excluded even when the credential advertises them');
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 205000, index: 0, modelCount: 5, fairShare: true }), 50000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 155000, index: 1, modelCount: 5, fairShare: true }), 75000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 80000, index: 2, modelCount: 5, fairShare: true }), 40000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 40000, index: 3, modelCount: 5, fairShare: true }), 30000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 10000, index: 4, modelCount: 5, fairShare: true }), 10000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 205000, index: 0, modelCount: 1, fairShare: true }), 50000);
});

test('frontier custody keeps healthy seats ahead of cooling and soft-absent current seats', () => {
  const eligible = Object.freeze({ eligible: true, reasons: Object.freeze([]) });
  const absent = Object.freeze({ eligible: false, reasons: Object.freeze(['provider-absent']) });
  const available = Object.freeze({ mayCall: true, state: 'available' });
  const cooling = Object.freeze({ mayCall: false, state: 'cooling_down', retryAfterSeconds: 20 });
  const current = Object.freeze({ lifecycle: 'current' });
  const plan = {
    callableModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'],
    rows: [
      { model: 'gemini-3.8-flash', eligibility: eligible, state: cooling, metadata: current },
      { model: 'gemini-3.7-flash', eligibility: eligible, state: available, metadata: current },
      { model: 'gemini-3.6-flash', eligibility: eligible, state: available, metadata: current },
      { model: 'gemini-3.5-flash', eligibility: eligible, state: available, metadata: current },
      { model: 'gemini-3-flash-preview', eligibility: absent, state: available, metadata: current }
    ]
  };
  assert.deepEqual(selectKhonapolitProviderModelsFromPlan(plan), [
    'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3-flash-preview'
  ], 'healthy observed seats run first; cooling and one-snapshot provider absence cannot erase the frontier');
});

test('blank Marrowline exposes an ordinary unissued task lane before advanced custody settings', () => {
  assert.match(page, /id="khonapolitWaive"[^>]*checked/);
  assert.match(page, /Ordinary work starts in unissued research mode/i);
  assert.match(page, /id="retryKhonapolitTask"/);
  assert.doesNotMatch(page, /marrowlinePortableActions|copyKhonapolitPortable|exportKhonapolitPortable|Continue with your own AI/,
    'ordinary Chat must not advertise emergency portability chrome');
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

test('independent-task recovery keeps the original draft and offers retry without advertising portability', () => {
  assert.match(terminal, /retryKhonapolitTask/);
  assert.doesNotMatch(terminal, /copyKhonapolitPortable|exportKhonapolitPortable/,
    'ordinary terminal listeners must not recreate the retired portable buttons');
  assert.match(terminal, /Your task is still here/i);
  assert.match(terminal, /prompt\.value\s*=\s*message/,
    'failed transport must restore the exact submitted task to the composer');
});
