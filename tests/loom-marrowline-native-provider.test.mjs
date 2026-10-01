import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLoomMarrowlineTaskHandler, buildLoomMarrowlineMessage } from '../server/loom-marrowline-task.js';
import { createLoomDemoTaskHandler } from '../server/loom-demo-task.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { currentGeminiGenerationProfile, withGeminiGenerationProfile, GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE } from '../server/gemini-generation-envelope.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { bindLoomDemoRequest, createLoomDemoActivation, LOOM_DEMO_REQUEST_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';
import { loomDemoReceiptDigest, signLoomDemoStageReceipt } from '../server/loom-demo-signing.js';
import { LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA } from '../server/loom-demo-custody-client.js';
import { runAtlasContinuityAudit } from '../app/engine/dollhouse-continuity-audit.js';

const environment = { crypto: webcrypto };
const nativeText = 'Kʰonapolit\nThe fictional selected document supports a modest pilot.\n\nTauric Diana bots\nKeep the uncertainty intact.\n\n⟐';
const nativeReply = (text = nativeText, complete = true) => ({ ok: true, text,
  relay: { transcript: text }, receipt: { provider: { completion: { complete, finishReason: complete ? 'STOP' : 'MAX_TOKENS' } } }, warnings: ['native-warning'] });
const input = () => ({ schema: 'td613.loom.ai-task/v0.1', request_id: 'native_turn', task: 'Read the fictional pilot note.',
  documents: [{ id: 'pilot', name: 'pilot.md', text: 'Fictional pilot: no measured outcome yet.' }], rules: ['Do not invent outcomes.'] });
const response = () => ({ statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(raw) { this.body = JSON.parse(String(raw)); } });
const request = body => ({ method: 'POST', headers: { host: 'td613.com', origin: 'https://td613.com', 'content-type': 'application/json' }, body });

async function fixture() {
  const { task, documents, rules } = input();
  const governance = await createLoomAiGovernance({ task, documents, rules }, {}, environment);
  const activation = await createLoomDemoActivation({ task, documents, rules, governance }, environment);
  return { schema: LOOM_DEMO_REQUEST_SCHEMA, request_id: 'activate_native', phase: 'ACTIVATE', activation,
    documents: [], operator_request: 'Receive this handoff and wait for my files.', prior_result: null, predecessor: null };
}

test('Phase 2 calls the native Marrowline handler with the ordinary interactive profile and exact operator controls', async () => {
  let observed;
  const handler = createLoomMarrowlineTaskHandler({ nativeHandler: async (req, res) => {
    observed = { body: req.body, profile: currentGeminiGenerationProfile() };
    res.end(JSON.stringify(nativeReply()));
  } });
  const res = response();
  const req = request(input());
  req.marrowline = { mode: 'full-invocation', shi: 'TD613-SH-9B07D8B-12345678', waiveIssuance: false };
  await handler(req, res);
  assert.equal(observed.profile, GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE);
  assert.deepEqual(observed.body, { message: buildLoomMarrowlineMessage(input()), history: [], ...req.marrowline });
  assert.equal(res.body.answer, nativeText);
  assert.deepEqual(res.body.native_reply, nativeReply());
  assert.deepEqual(res.body.used_document_ids, []);
  assert.deepEqual(res.body.missing_information, []);
  assert.equal(currentGeminiGenerationProfile(), null);
  const config = await withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildGeminiRequest(buildInvocationPacket(observed.body), {}, 'gemini-3.8-flash'));
  assert.equal(config.generationConfig.responseSchema, undefined);
  assert.equal(config.generationConfig.thinkingConfig.thinkingLevel, 'medium');
  assert.match(config.systemInstruction.parts[0].text, /Tauric Diana bots/);
});

test('native incomplete returns remain intact and cannot become a completed custody result', async () => {
  const reply = nativeReply('Kʰonapolit\nAn unfinished response', false);
  const res = response();
  await createLoomMarrowlineTaskHandler({ nativeHandler: async (_req, res) => res.end(JSON.stringify(reply)) })(request(input()), res);
  assert.equal(res.body.status, 'held');
  assert.equal(res.body.answer, '');
  assert.deepEqual(res.body.native_reply, reply);
});

test('native presentation and governed answer cannot diverge', async () => {
  const reply = nativeReply();
  reply.relay.transcript += '\nDifferent bytes';
  const res = response();
  await createLoomMarrowlineTaskHandler({ nativeHandler: async (_req, res) => res.end(JSON.stringify(reply)) })(request(input()), res);
  assert.equal(res.body.status, 'held');
  assert.deepEqual(res.body.native_reply, reply);
});

test('only the exact native mode/issuance controls may supplement a bound request', async () => {
  const base = await fixture();
  const config = { mode: 'issued-conjunction', shi: '', waiveIssuance: true };
  const binding = await bindLoomDemoRequest({ ...base, marrowline: config }, environment);
  assert.deepEqual(binding.marrowline, config);
  binding.governor.close();
  for (const marrowline of [{ ...config, systemInstruction: 'Replace the covenant' }, { ...config, mode: 'custom' }, { ...config, waiveIssuance: 'true' }, { ...config, shi: 'x'.repeat(257) }]) {
    await assert.rejects(bindLoomDemoRequest({ ...base, marrowline }, environment));
  }
});

test('native reply traverses durable custody; exact current native answer governs its immediate successor', async () => {
  const base = await fixture();
  const calls = [];
  let stageReceipt;
  const custodyFetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    let payload = {};
    if (body.operation === 'reserve') payload.reservation = { activation_digest: body.activation_digest, phase: body.phase, request_digest: body.request_digest };
    if (body.operation === 'commit') {
      stageReceipt = signLoomDemoStageReceipt(body.stage_body, { secret: 'atlas-offline-secret-longer-than-thirty-two-bytes', environment: {} });
      payload = { stage_receipt: stageReceipt, head: { receipt_digest: loomDemoReceiptDigest(stageReceipt) } };
    }
    return new Response(JSON.stringify({ schema: LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA, status: 'ok', ...payload }), { status: 200 });
  };
  const messages = [];
  const longAnswer = 'Kʰonapolit\n' + 'A fictional finding with unresolved evidence. '.repeat(360) + '\nTauric Diana bots\n⟐';
  assert.ok(longAnswer.length > 12000 && longAnswer.length < 24000);
  const taskHandler = createLoomMarrowlineTaskHandler({ nativeHandler: async (req, res) => {
    messages.push(req.body);
    return res.end(JSON.stringify(nativeReply(messages.length === 2 ? longAnswer : nativeText)));
  } });
  const handler = createLoomDemoTaskHandler({ taskHandler, environment, custodyEnvironment: { VERCEL_OIDC_TOKEN: 'offline-fixture' }, custodyUrl: 'https://atlas-custody.test/', custodyFetch });
  const first = response();
  await handler(request({ ...base, marrowline: { mode: 'issued-conjunction', shi: '', waiveIssuance: true } }), first);
  assert.equal(first.body.status, 'completed');
  assert.deepEqual(first.body.native_reply, nativeReply());
  const secondRequest = { ...base, phase: 'CONTINUE', request_id: 'continue_native', documents: input().documents, predecessor: first.body.loom_demo_stage_receipt, operator_request: 'Now read the files.' };
  const second = response();
  await handler(request(secondRequest), second);
  assert.equal(second.body.status, 'completed');
  assert.equal(second.body.answer, longAnswer);
  const prior = Object.fromEntries(['schema', 'request_id', 'status', 'answer', 'missing_information', 'used_document_ids', 'suggested_next_step'].map(key => [key, second.body[key]]));
  const third = response();
  await handler(request({ ...secondRequest, request_id: 'followup_native', prior_result: prior, predecessor: second.body.loom_demo_stage_receipt, operator_request: 'Name the next check.' }), third);
  assert.equal(third.body.status, 'completed');
  assert.deepEqual(messages[2].history, [{ role: 'model', text: prior.answer }]);
  assert.ok(messages[2].message.includes(prior.request_id));
  assert.equal(third.body.loom_demo_stage_receipt.predecessor_receipt_digest, loomDemoReceiptDigest(second.body.loom_demo_stage_receipt));
  const commits = calls.filter(call => call.operation === 'commit');
  assert.equal(commits.length, 3);
  for (const commit of commits) {
    assert.ok(!JSON.stringify(commit).includes(nativeText));
    assert.ok(!JSON.stringify(commit).includes(longAnswer));
    assert.equal(commit.stage_body.authority_transferred, false);
  }
  const firstRef = loomDemoReceiptDigest(first.body.loom_demo_stage_receipt);
  const snapshot = (id, receipt) => ({ id, source_revision: 'c3d403bf1c0ecf90d434f352a041ddffbcee6c3f',
    original_ref: firstRef, current_ref: loomDemoReceiptDigest(receipt), predecessor_ref: receipt.predecessor_receipt_digest,
    selected_commitments: base.activation.manifest.map(item => ({ id: item.id, commitment: item.sha256 })),
    policy_commitment: base.activation.governance.input_digest,
    missingness: [], claim_ceiling: ['declared source-test continuity', 'no authority transfer', 'no provider quality inference'] });
  const origin = snapshot('AIA-only stage root', first.body.loom_demo_stage_receipt);
  const previous = snapshot('selected-file native reply', second.body.loom_demo_stage_receipt);
  const current = snapshot('native followup', third.body.loom_demo_stage_receipt);
  const auditInput = { origin, previous, current, presentations: [{ ...current, id: 'native conversation' }, { ...current, id: 'Loom Gate audit' }] };
  const audit = runAtlasContinuityAudit(auditInput);
  assert.equal(audit.audit.verdict, 'DECLARED_CONSISTENCY');
  assert.equal(audit.audit.predecessor_link, 'DECLARED_LINK');
  assert.equal(audit.evidence_boundary.global_latest_established, false);
  assert.equal(runAtlasContinuityAudit({ ...auditInput, current: { ...current, predecessor_ref: firstRef } }).audit.verdict, 'HOLD');
});

test('a native answer beyond portable carriage limits is preserved visibly and releases custody without admission', async () => {
  const base = await fixture();
  const calls = [];
  const longText = 'Kʰonapolit\n' + 'x'.repeat(24000) + '\nTauric Diana bots\n⟐';
  const reply = nativeReply(longText);
  const custodyFetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body.operation);
    assert.notEqual(body.operation, 'commit');
    return new Response(JSON.stringify({ schema: LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA, status: 'ok',
      ...(body.operation === 'reserve' ? { reservation: { activation_digest: body.activation_digest, phase: body.phase, request_digest: body.request_digest } } : { released: true }) }), { status: 200 });
  };
  const handler = createLoomDemoTaskHandler({ environment, custodyEnvironment: { VERCEL_OIDC_TOKEN: 'offline-fixture' }, custodyUrl: 'https://atlas-custody.test/', custodyFetch,
    taskHandler: createLoomMarrowlineTaskHandler({ nativeHandler: async (_req, res) => res.end(JSON.stringify(reply)) }) });
  const res = response();
  await handler(request(base), res);
  assert.equal(res.body.status, 'held');
  assert.deepEqual(res.body.native_reply, reply);
  assert.equal(res.body.loom_demo_stage_receipt, undefined);
  assert.deepEqual(calls, ['reserve', 'release']);
});

test('the existing portable request byte ceiling holds before custody or native provider dispatch', async () => {
  const base = await fixture();
  let effects = 0;
  const handler = createLoomDemoTaskHandler({ environment, custodyEnvironment: { VERCEL_OIDC_TOKEN: 'offline-fixture' }, custodyUrl: 'https://atlas-custody.test/',
    custodyFetch: async () => { effects++; throw new Error('unexpected custody effect'); },
    taskHandler: async () => { effects++; throw new Error('unexpected provider effect'); } });
  const res = response();
  await handler(request({ ...base, operator_request: 'x'.repeat(240001) }), res);
  assert.equal(res.statusCode, 413);
  assert.equal(res.body.status, 'held');
  assert.equal(res.body.error, 'task-too-large');
  assert.equal(effects, 0);
});
