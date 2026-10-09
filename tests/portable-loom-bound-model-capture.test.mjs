import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateTransportBinding, buildBoundedWire, extractCapturedModel, captureOneBoundCall,
  prepareComparisonPrompt, prepareReceiverMessages, loadRetainedCapture, validateRoleReturn,
  admitGovernedRoleCaptures, sha256 } from '../research/portable-loom-provider-conduit-20261009/assay-harness.mjs';

const binding = () => ({ schema: 'td613.loom.bound-model-transport/v0.1', protocol_commit: 'a'.repeat(40),
  provider: 'GEMINI_GENERATE_CONTENT', model: 'gemini-fictional-test', response_model_ids: ['gemini-fictional-test'],
  credential_env: 'TD613_FICTIONAL_TEST_KEY', generation_parameters: { temperature: null, top_p: null, thinking_level: null },
  limits: { max_calls: 1, max_input_tokens_per_call: 100000, max_output_tokens_per_call: 8192, max_cost_usd: 1,
    timeout_ms: 2000, max_response_bytes: 100000 },
  pricing: { input_usd_per_million: 1, output_usd_per_million: 1, source: 'FICTIONAL_TEST_RATE_NOT_PROVIDER_PRICING', verified_at: '2026-10-09T00:00:00Z' },
  authorization: { record: 'LOCAL_ENGINEERING_FIXTURE_ONLY', scope: 'No real model request' }, tools: 'DISABLED', retrieval: 'DISABLED', retries: 0 });
const mockPayload = (text = 'fictional answer') => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }],
  modelVersion: 'gemini-fictional-test', usageMetadata: { promptTokenCount: 5, totalTokenCount: 15 } });
const temporary = () => mkdtempSync(join(tmpdir(), 'td613-model-capture-'));

test('missing financial, exact model or no-retry binding fails closed', () => {
  for (const mutate of [b => b.limits.max_cost_usd = null, b => b.model = 'gemini-latest', b => b.retries = 1, b => b.tools = 'ENABLED']) {
    const b = binding(); mutate(b); assert.throws(() => validateTransportBinding(b));
  }
});
test('wire enforces per-role output, conservative input and financial bounds', () => {
  const b = binding(), messages = [{ role: 'user', content: 'Public fixture.' }];
  const wire = buildBoundedWire(b, messages, 2048), decoded = JSON.parse(wire.bytes);
  assert.equal(decoded.generationConfig.maxOutputTokens, 2048);
  assert.equal(decoded.generationConfig.candidateCount, 1); assert.equal(decoded.tools, undefined);
  b.limits.max_output_tokens_per_call = 100; assert.throws(() => buildBoundedWire(b, messages, 2048));
  b.limits.max_output_tokens_per_call = 8192; b.limits.max_input_tokens_per_call = 100;
  assert.throws(() => buildBoundedWire(b, messages, 2048));
});
test('OpenAI wire keeps explicit bound completion cap and disables storage', () => {
  const b = binding(); b.provider = 'OPENAI_CHAT_COMPLETIONS'; b.model = 'fictional-test-model'; b.response_model_ids = [b.model];
  const wire = buildBoundedWire(b, [{ role: 'user', content: 'Public fixture.' }], 2048), body = JSON.parse(wire.bytes);
  assert.equal(body.max_completion_tokens, 2048); assert.equal(body.store, false); assert.equal(body.n, 1);
});
test('all four role requests share case evidence and exclude scorer/key inputs', () => {
  const prompts = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'].map(role => prepareComparisonPrompt('K01', role));
  for (const p of prompts) {
    assert.equal(p.maximum_output_tokens, 2048);
    assert.equal(p.prompt.slice(p.prompt.lastIndexOf('\n') + 1), prompts[0].prompt.slice(prompts[0].prompt.lastIndexOf('\n') + 1));
    assert.equal(p.prompt.includes('private_scoring_key_sha256'), false);
    assert.equal(p.prompt.includes('expected_recommendation'), false);
  }
});
test('receiver continuation retains actual captured text; altered predecessor rejected', () => {
  const initial = prepareReceiverMessages('R02'); assert.equal(initial.messages.length, 1);
  const text = 'Captured fixture text only.';
  const continued = prepareReceiverMessages('R02', [{ case_id: 'R02', turn_index: 0, text, capture_sha256: sha256(text) }]);
  assert.equal(continued.messages[1].content, text); assert.equal(continued.messages[2].role, 'user');
  assert.throws(() => prepareReceiverMessages('R02', [{ case_id: 'R02', turn_index: 0, text: 'altered', capture_sha256: sha256(text) }]));
});
test('response model, usage, completeness and tool invocation checked independently', () => {
  const b = binding(); assert.equal(extractCapturedModel(b, Buffer.from(JSON.stringify(mockPayload()))).text, 'fictional answer');
  for (const mutate of [p => p.modelVersion = 'unbound-model', p => delete p.usageMetadata,
    p => p.candidates[0].finishReason = 'MAX_TOKENS', p => p.candidates[0].content.parts = [{ functionCall: { name: 'external' } }]]) {
    const p = mockPayload(); mutate(p); assert.throws(() => extractCapturedModel(b, Buffer.from(JSON.stringify(p))));
  }
});
test('missing credential causes zero transport calls and creates no attempt', async () => {
  const d = temporary(); let calls = 0;
  try {
    const b = binding(), wire = buildBoundedWire(b, [{ role: 'user', content: 'fixture' }], 2048);
    await assert.rejects(captureOneBoundCall(b, wire, join(d, 'attempt'), join(d, 'budget.json'), {
      environment: {}, fetchImpl: async () => { calls++; }, fixture: true }), /MISSING_CONFIGURED_CREDENTIAL/);
    assert.equal(calls, 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
test('mock transport always retains fixture class; exact raw bytes and budget reservation survive', async () => {
  const d = temporary(); let calls = 0;
  try {
    const b = binding(), wire = buildBoundedWire(b, [{ role: 'user', content: 'fixture' }], 2048);
    const bytes = JSON.stringify(mockPayload());
    const options = { environment: { TD613_FICTIONAL_TEST_KEY: 'FICTIONAL_SECRET_43' },
      fetchImpl: async () => { calls++; return new Response(bytes, { status: 200 }); }, fixture: false };
    const cap = await captureOneBoundCall(b, wire, join(d, 'attempt'), join(d, 'budget.json'), options);
    assert.equal(cap.evidence_class, 'LOCAL_STRUCTURAL_TEST'); assert.equal(cap.fixture_transport, true);
    assert.equal(readFileSync(join(d, 'attempt/response.body.bin'), 'utf8'), bytes);
    assert.equal(readFileSync(join(d, 'attempt/request.json'), 'utf8').includes('FICTIONAL_SECRET_43'), false);
    const retained = loadRetainedCapture(join(d, 'attempt'), b, { case_id: 'K01', role: 'ATLAS', capture_id: 'fixture' });
    assert.equal(retained.independent_local_byte_check, true);
    await assert.rejects(captureOneBoundCall(b, wire, join(d, 'another'), join(d, 'budget.json'), options), /BUDGET_OR_BINDING/);
    assert.equal(calls, 1);
    writeFileSync(join(d, 'attempt/response.body.bin'), 'altered');
    assert.throws(() => loadRetainedCapture(join(d, 'attempt'), b, { case_id: 'K01', role: 'ATLAS', capture_id: 'fixture' }), /mismatch/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
test('transport error retains the original partial attempt without retry', async () => {
  const d = temporary(); let calls = 0;
  try {
    const b = binding(), wire = buildBoundedWire(b, [{ role: 'user', content: 'fixture' }], 2048);
    const cap = await captureOneBoundCall(b, wire, join(d, 'attempt'), join(d, 'budget.json'), {
      environment: { TD613_FICTIONAL_TEST_KEY: 'FICTIONAL_SECRET_43' }, fetchImpl: async () => { calls++; throw new Error('fixture network failure'); } });
    assert.equal(cap.status, 'HELD_EVIDENCE_GAP'); assert.equal(cap.response_bytes, 0); assert.equal(calls, 1);
    assert.equal(JSON.parse(readFileSync(join(d, 'budget.json'))).calls_reserved, 1);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
test('typed role outputs retain HOLDs and reject authority widening or wrong role', () => {
  const out = { schema: 'td613.loom.model-role-finding/v0.1', case_id: 'K01', agent: 'ATLAS', verdict: 'HELD', finding: 'missing evidence', limitations: ['Local declarations only.'] };
  assert.equal(validateRoleReturn(out, 'ATLAS', 'K01').verdict, 'HELD');
  assert.throws(() => validateRoleReturn({ ...out, execute: true }, 'ATLAS', 'K01'));
  assert.throws(() => validateRoleReturn(out, 'FADT', 'K01'));
});
test('forged capture objects cannot enter governed model-role synthesis', () => {
  const corpus = JSON.parse(readFileSync('research/portable-loom-dollhouse-execution-20261009/CASE_SET.json'));
  const result = admitGovernedRoleCaptures(corpus.cases[0], Array.from({ length: 4 }, () => ({ status: 'CAPTURED_NOT_ADMITTED', evidence_class: 'ACTUAL_RECEIVER_TEST' })));
  assert.equal(result.status, 'HELD_EVIDENCE_GAP');
  assert.equal(result.original_captures.length, 4);
});
