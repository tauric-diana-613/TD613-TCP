import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  buildLoomTaskProviderRequest, createLoomTaskHandler, loomThinkingConfig,
  resolveLoomRuntimeProfile, LOOM_TASK_SCHEMA
} from '../server/loom-task.js';

const task = () => ({
  schema: LOOM_TASK_SCHEMA, request_id: 'profile-fixture-1',
  task: 'Compare the fictional completion record; preserve missingness and causal alternatives.',
  documents: [{ id: 'selected', name: 'fictional.log', text: 'Acknowledgement is observed; downstream effect is unknown. à 𝄐 ~sp' }],
  rules: ['Source provenance is separate from path provenance.', 'Do not infer omitted local information.']
});
const answer = () => ({
  answer: 'The fictional acknowledgement was recorded; downstream completion remains unobserved [selected].',
  missing_information: ['Independent downstream effect ledger'], used_document_ids: ['selected'],
  suggested_next_step: 'Review the missing effect evidence.'
});
const payload = (output = answer()) => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(output) }] } }] });
function harness({ fallback = false, output = answer() } = {}) {
  const calls = [];
  const handler = createLoomTaskHandler({
    env: { GEMINI_API_KEY: 'synthetic-server-key' },
    resolvePlan: async () => { calls.push({ kind: 'plan' }); return { callableModels: ['gemini-3.8-flash', 'gemini-3.5-flash'] }; },
    fetchImpl: async (url, options) => {
      calls.push({ kind: 'generate', url, body: JSON.parse(options.body) });
      if (fallback && calls.filter(item => item.kind === 'generate').length === 1) return { ok: false, status: 503 };
      return { ok: true, status: 200, json: async () => payload(output) };
    },
    recordOutcome: () => {}, rateSlot: () => ({ allowed: true, remaining: 1 }), sleep: async () => {}
  });
  const run = async (changes = {}, input = task()) => {
    const req = Object.assign(new EventEmitter(), {
      method: 'POST', url: '/api/khonapolit?operation=loom-task', body: input,
      headers: { host: 'td613.invalid', origin: 'https://td613.invalid', 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }
    }, changes);
    let result;
    const res = { setHeader() {}, end(raw) { result = JSON.parse(raw); } };
    await handler(req, res);
    return { status: res.statusCode, body: result };
  };
  return { calls, run };
}

test('Quick/Deep changes only the requested thinking configuration; selected text, rules, output contract and obligations remain equal', () => {
  const input = task(), before = structuredClone(input);
  for (const fallback of [false, true]) {
    const quick = buildLoomTaskProviderRequest(input, 'gemini-3.8-flash', { profile: 'quick', fallback });
    const deep = buildLoomTaskProviderRequest(input, 'gemini-3.8-flash', { profile: 'deep', fallback });
    assert.deepEqual(quick.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
    assert.deepEqual(deep.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
    assert.deepEqual(quick.contents, deep.contents);
    assert.deepEqual(quick.systemInstruction, deep.systemInstruction);
    const { thinkingConfig: quickEffort, ...quickOutput } = quick.generationConfig;
    const { thinkingConfig: deepEffort, ...deepOutput } = deep.generationConfig;
    assert.deepEqual(quickOutput, deepOutput);
    assert.deepEqual(JSON.parse(quick.contents[0].parts[0].text), { task: input.task, documents: input.documents, rules: input.rules });
    assert.match(quick.systemInstruction.parts[0].text, /no tools or permission to execute actions, change governance/);
  }
  assert.deepEqual(input, before);
});

test('explicit query/URL profiles resolve consistently; unsupported or ambiguous choices never infer a profile', () => {
  assert.equal(resolveLoomRuntimeProfile({}), null);
  assert.equal(resolveLoomRuntimeProfile({ query: { profile: 'quick' } }), 'quick');
  assert.equal(resolveLoomRuntimeProfile({ url: '/api/khonapolit?operation=loom-task&profile=deep' }), 'deep');
  assert.equal(resolveLoomRuntimeProfile({ query: { profile: 'quick' }, url: '/api/khonapolit?profile=quick' }), 'quick');
  for (const req of [
    { query: { profile: 'auto' } }, { query: { profile: '' } }, { query: { profile: null } },
    { query: { profile: ['quick', 'deep'] } }, { query: { profile: {} } },
    { url: '/api/khonapolit?profile=quick&profile=deep' },
    { url: '/api/khonapolit?profile=quick&profile=quick' },
    { query: { profile: 'quick' }, url: '/api/khonapolit?profile=deep' }
  ]) assert.throws(() => resolveLoomRuntimeProfile(req), TypeError);
});

test('primary and fallback attempts carry the explicit profile, with telemetry bounded to requested provider configuration', async () => {
  for (const profile of ['quick', 'deep']) for (const fallback of [false, true]) {
    const h = harness({ fallback });
    const result = await h.run({ url: `/api/khonapolit?operation=loom-task&profile=${profile}` });
    assert.equal(result.status, 200);
    const generations = h.calls.filter(item => item.kind === 'generate');
    assert.equal(generations.length, fallback ? 2 : 1);
    for (const generation of generations) {
      assert.equal(generation.body.generationConfig.thinkingConfig.thinkingLevel, profile === 'quick' ? 'low' : 'high');
      assert.deepEqual(JSON.parse(generation.body.contents[0].parts[0].text), { task: task().task, documents: task().documents, rules: task().rules });
    }
    assert.equal(result.body.observations.requested_runtime_profile, profile);
    assert.equal(result.body.observations.runtime_profile_authority, 'REQUESTED_PROVIDER_CONFIGURATION_ONLY');
    assert.equal(result.body.observations.thinking_level, profile === 'quick' ? 'low' : 'high');
    assert.equal(result.body.observations.source_claims, 'model-reported-unverified');
    assert.equal(result.body.observations.external_host_enforced, false, 'requested effort must not invent an enforcement claim');
    assert.equal(result.body.observations.runtime_profile_internal_effort_verified, false, 'requested effort is not provider-internal verification');
    assert.equal(JSON.stringify(result).includes('synthetic-server-key'), false);
  }
});

test('legacy defaults remain compatible and unsupported thinking models receive no invented effort control', async () => {
  assert.deepEqual(loomThinkingConfig('gemini-3.8-flash'), { thinkingLevel: 'high' });
  assert.deepEqual(loomThinkingConfig('gemini-3.5-flash', { fallback: true }), { thinkingLevel: 'low' });
  assert.equal(loomThinkingConfig('synthetic-no-thinking-model', { profile: 'deep' }), null);
  const legacy = await harness({ fallback: true }).run();
  assert.equal(legacy.status, 200);
  assert.equal(legacy.body.observations.requested_runtime_profile, 'legacy-default');
  assert.equal(legacy.body.observations.thinking_level, 'low');
});

test('ambiguous runtime declarations and body-side profile injection are rejected before model planning or provider access', async () => {
  for (const changes of [
    { query: { profile: 'auto' } }, { query: { profile: ['quick', 'deep'] } },
    { url: '/api/khonapolit?profile=quick&profile=deep' },
    { query: { profile: 'deep' }, url: '/api/khonapolit?profile=quick' }
  ]) {
    const h = harness(); const result = await h.run(changes);
    assert.equal(result.status, 400);
    assert.deepEqual(h.calls, []);
  }
  const h = harness();
  assert.equal((await h.run({ query: { profile: 'quick' } }, { ...task(), profile: 'quick' })).status, 400);
  assert.deepEqual(h.calls, []);
});

test('lower or higher effort never relaxes output admission, selected-source references, or action authority', async () => {
  for (const profile of ['quick', 'deep']) for (const output of [
    { ...answer(), used_document_ids: ['withheld-local'] },
    { ...answer(), execution_allowed: true },
    { ...answer(), missing_information: ['known uncertainty'], execute: 'RELEASE' }
  ]) {
    const result = await harness({ output }).run({ query: { profile } });
    assert.equal(result.status, 502);
    assert.equal(result.body.status, 'held');
    assert.equal(result.body.answer, '');
    assert.equal(result.body.observations.external_host_enforced, false);
    assert.equal(result.body.observations.runtime_profile_internal_effort_verified, false);
    assert.equal(Object.hasOwn(result.body, 'execution_allowed'), false);
    assert.equal(result.body.observations.requested_runtime_profile, profile);
  }
});
