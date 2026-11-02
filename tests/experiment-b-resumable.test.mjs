import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { Journal, digest, canonical } from '../scripts/experiment-b-resumable/journal.mjs';
import { ResumableFlight, ARMS, rounds } from '../scripts/experiment-b-resumable/engine.mjs';
import { resourceState, usageRecord, validatePolicy } from '../scripts/experiment-b-resumable/resources.mjs';
import { protectedBroker, ledgerMirror, nativeTransport, verifyExecutionAuthorization } from '../scripts/experiment-b-resumable/boundaries.mjs';
import { runProtectedConfiguration } from '../scripts/experiment-b-resumable/runner.mjs';
import { parseCodexEvents } from '../scripts/experiment-b-codex-exec-adapter.mjs';
import { syntheticCapture } from './experiment-b-capture-fixture.mjs';
import {conservativeInputMeasurement} from '../scripts/experiment-b-operational/input-accounting.mjs';

const KEY = 'SYNTHETIC-TEST-ONLY-NOT-AN-OPERATOR-KEY-000';
const EVIDENCE = [];
after(() => {
  if (process.env.TD613_SYNTHETIC_RECEIPT_FILE) fs.writeFileSync(process.env.TD613_SYNTHETIC_RECEIPT_FILE, JSON.stringify({ evidence_class: 'DETERMINISTIC_SYNTHETIC_ONLY_NO_MODEL_INFERENCE', checkpoint_key: KEY, observations: EVIDENCE }, null, 2) + '\n');
});
const IDENTITY = { requested_model: 'SYNTHETIC_MODEL', effort: 'SYNTHETIC', evidence_class: 'DETERMINISTIC_SYNTHETIC_TRANSPORT', model_served_independently_attested: false };
const SOURCES = { D1: 'Invented proposition: every positive integer is even.', D2: 'Invented contradiction: 3 is positive and odd.', D3: 'Invented revision: every positive integer divisible by 2 is even.' };
const POLICY = { accountClass: 'subscription-only', accountingBasis: 'conservative-reservation', maxEpisodeAttempts: 100, maxWindowAttempts: 100, reservationTokens: 10000, maxAccountedTokens: 1000000, reservationUSD: 0, maxUSD: 0, maxRejectedRetries: 1 };
const makePlan = () => ({ experiment: 'SYNTHETIC-ONLY', episode: 'SYNTHETIC-EPISODE', model: { requested: 'SYNTHETIC_MODEL', effort: 'SYNTHETIC' }, runtimeBinding: digest(IDENTITY), context: { inputLimit: 10000, outputLimit: 10, tokenizerBinding: 'SYNTHETIC_CHARACTER_COUNTER_NOT_MODEL_TOKENIZER' }, protocolBinding: 'SYNTHETIC_PROTOCOL', analysisBinding: 'SYNTHETIC_ANALYSIS', baselineBinding: 'SYNTHETIC_BASELINES', kernelBinding: 'SYNTHETIC_KERNEL_PARITY', toolPolicyBinding: 'NO_TOOLS', stage2Binding: 'SYNTHETIC_STAGE2_NOT_EXECUTED', definitiveRejectionBinding: digest('SYNTHETIC_DEFINITIVE_NO_EXECUTION'), lanes: [{ id: 'L1', sourceOrder: ['D1', 'D2', 'D3'], custodyLineage: { raw: 'SYNTHETIC_RAW', derived: 'SYNTHETIC_DERIVED', inference: 'SYNTHETIC_INFERENCE' }, templates: { baseline: 'Commit before evidence.', modular1: 'Track exact claims and uncertainty.', modular2: 'Assess actual handoffs and retain revisions.', union1: 'Use full equal-capability source context.', union2: 'Challenge or revise with full source context.', synthesis: 'Report claims, revisions and warrant distinctions.' } }] });
const broker = (sources = SOURCES) => ({ manifest: () => Object.entries(sources).map(([id, content]) => ({ id, sha256: digest(content) })), prefix: ids => ({ sources: ids.map(id => ({ id, content: sources[id] })), commitment: digest(ids.map(id => [id, digest(sources[id])])) }) });
function result(request, options = {}) {
  return { status: 'COMPLETED', response: `FINAL:${request.turn}:commitment-retained`, observedIdentity: IDENTITY, completeEvidence: { evidence_class: 'DETERMINISTIC_SYNTHETIC_TRANSPORT', final_event: 'SYNTHETIC_COMPLETE' }, tools: [], kernelActivity: [], usage: { input_tokens: 23, output_tokens: 7, cached_input_tokens: 12 }, ...options };
}
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'td613-resume-synthetic-'));
  t.after(() => { if (!path.basename(dir).startsWith('td613-resume-synthetic-') || path.dirname(dir) !== os.tmpdir()) throw Error('TEST_CLEANUP_SCOPE'); fs.rmSync(dir, { recursive: true, force: true }); });
  const filename = path.join(dir, 'journal.sqlite');
  return { dir, filename };
}
function engine(journal, options = {}) {
  return new ResumableFlight({ journal, plan: makePlan(), policy: POLICY, broker: broker(), transport: async r => result(r), measureInput: p => p.length, observeRuntime: async () => IDENTITY, ...options });
}
const resume = (f, windowId = 'SYNTHETIC-WINDOW-1') => f.run({ windowId, policyAuthorization: 'SYNTHETIC_POLICY_TEST_ONLY', runtimeAuthorization: 'SYNTHETIC_RUNTIME_TEST_ONLY' });
const successes = j => j.events().filter(e => e.type === 'TURN_ACCEPTED');

test('D04 production measurement policy retains bound and reported usage as different coordinates',async t=>{
  const {filename}=fixture(t);const j=new Journal(filename,KEY);
  const p={model:'gpt-6.1-sol',algorithm:'UTF8_BYTES_PLUS_ENVELOPE_BOUND_V1',
    tokenizer:{property:'NONEMPTY_BYTE_TOKENS_WITH_NO_TEXT_EXPANSION',implementation:'SYNTHETIC_BYTE_ASSUMPTION',version:'TEST_ONLY',modelMapping:'SYNTHETIC_NOT_LIVE',mappingEvidenceDigest:'a'.repeat(64)},
    envelopeUpperBoundTokens:0,envelopeEvidenceDigest:'a'.repeat(64),acceptanceDigest:'a'.repeat(64),
    overheadAssumptions:['SYNTHETIC_NO_PROVIDER_ATTESTATION'],
    envelopeScopes:['native_instructions','tool_definitions','bounded_tool_exchanges','structural_tokens','provider_transforms']};
  const plan=makePlan();plan.context.tokenizerBinding=digest(p);plan.context.requireCompleteMeasurement=true;
  const f=engine(j,{plan,measureInput:text=>conservativeInputMeasurement(text,p),policy:{...POLICY,maxWindowAttempts:1}});
  assert.equal((await resume(f)).reason,'RESOURCE_AUTHORITY_PAUSE');
  const turn=successes(j)[0].payload;
  assert.equal(turn.input_tokens_measured,null);assert.equal(turn.input_tokens_upper_bound,Buffer.byteLength(turn.rendered.prompt));
  assert.equal(turn.input_count_comparison.providerReportedTokens,23);
  assert.equal(turn.input_count_comparison.comparison,'UNAVAILABLE_OR_NONCOMPARABLE');
  j.close();
});
test('D04 unknown overhead or policy drift stops before durable dispatch intent',async t=>{
  for(const measureInput of [()=>{throw Object.assign(Error('UNKNOWN'),{code:'D04_UNKNOWN_OVERHEAD'});},()=>12]){
    const {filename}=fixture(t);const j=new Journal(filename,KEY);const plan=makePlan();plan.context.requireCompleteMeasurement=true;
    const r=await resume(engine(j,{plan,measureInput}));assert.equal(r.reason,'INPUT_MEASUREMENT_HOLD');
    assert.equal(j.events().filter(e=>e.type==='DISPATCH_INTENT').length,0);j.close();
  }
});

test('paired quota pause survives close/reopen, accepted answers never rerun, episode accounting never resets', async t => {
  const { filename } = fixture(t); let calls = [];
  let j = new Journal(filename, KEY);
  const limited = { ...POLICY, maxWindowAttempts: 1 };
  let f = engine(j, { policy: limited, transport: async r => { calls.push(r.turn); return result(r); } });
  assert.equal((await resume(f)).reason, 'RESOURCE_AUTHORITY_PAUSE');
  assert.equal(successes(j).length, 1);
  assert.equal(j.events().filter(e => e.type === 'PAIR_COMMITTED').length, 0);
  const first = successes(j)[0]; j.close();
  j = new Journal(filename, KEY, { anchor: { seq: first.seq, hash: first.hash } });
  f = engine(j, { policy: limited, transport: async r => { calls.push(r.turn); return result(r); } });
  assert.equal((await resume(f, 'SYNTHETIC-WINDOW-2')).reason, 'RESOURCE_AUTHORITY_PAUSE');
  assert.equal(calls.filter(c => c === first.payload.turn).length, 1);
  assert.equal(j.events().filter(e => e.type === 'PAIR_COMMITTED').length, 1);
  assert.equal(resourceState(j.events(), limited, 'SYNTHETIC-WINDOW-2').attempts, 2);
  EVIDENCE.push({ scenario: 'PAIRED_QUOTA_REOPEN', transport_calls: calls, events: j.events() });
  j.close();
});

test('complete three-document bookkeeping schedule, exact local replay, no future/raw chamber leakage, idempotent completion', async t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY); const calls = [];
  const f = engine(j, { transport: async r => { calls.push(r); return result(r); } });
  assert.equal((await resume(f)).status, 'REASONING_COMPLETE_STAGE2_REQUIRED');
  const n = rounds(makePlan().lanes[0]).length * 2;
  assert.equal(calls.length, n); assert.equal(successes(j).length, n);
  for (const r of calls) {
    const input = JSON.parse(r.rendered.prompt);
    assert(input.history.every(h => h.turn.endsWith(r.arm)));
    assert(input.sources.length <= r.rendered.source_position);
    if (r.rendered.source_position < 2) assert(!r.rendered.prompt.includes(SOURCES.D2));
    if (r.arm === ARMS[0] && ['STAGE2', 'SYNTHESIS'].includes(r.rendered.phase)) assert.deepEqual(input.sources, []);
    for (const h of r.rendered.history) assert.equal(h.response_digest, digest(h.response));
  }
  const afterD2 = calls.find(r => r.arm === ARMS[1] && r.round === 4);
  assert(afterD2.rendered.history.length >= 4);
  assert.equal((await resume(f)).status, 'REASONING_COMPLETE_STAGE2_REQUIRED'); assert.equal(calls.length, n);
  EVIDENCE.push({ scenario: 'THREE_DOCUMENT_BOOKKEEPING_NOT_SCIENTIFIC_FLIGHT', transport_calls: calls.length, events: j.events() });
  j.close();
});

test('captured answer is accepted after interruption without transport execution', async t => {
  const { filename } = fixture(t); let j = new Journal(filename, KEY); let dispatched = 0;
  const one = { ...POLICY, maxWindowAttempts: 1 };
  const f = engine(j, { policy: one, transport: async r => { dispatched++; return result(r); }, afterCapture: () => { throw Error('SYNTHETIC_INTERRUPT_AFTER_CAPTURE'); } });
  assert.equal((await resume(f)).reason, 'UNCERTAIN_CALL_HOLD'); assert.equal(successes(j).length, 0); j.close();
  j = new Journal(filename, KEY);
  assert.equal((await resume(engine(j, { policy: one, transport: async () => { throw Error('MUST_NOT_RERUN'); } }))).reason, 'RESOURCE_AUTHORITY_PAUSE');
  assert.equal(successes(j).length, 1); assert.equal(dispatched, 1);
  EVIDENCE.push({ scenario: 'CAPTURE_RECOVERY_WITHOUT_RERUN', transport_calls: dispatched, events: j.events() }); j.close();
});

test('actual local process death after durable intent leaves uncertain unit, never retries', async t => {
  const { filename } = fixture(t);
  const code = `import {Journal} from ${JSON.stringify(new URL('../scripts/experiment-b-resumable/journal.mjs', import.meta.url).href)};
    import {ResumableFlight} from ${JSON.stringify(new URL('../scripts/experiment-b-resumable/engine.mjs', import.meta.url).href)};
    const [file,key,plan,policy,sources,identity] = process.argv.slice(1).map(JSON.parse);
    const {digest}=await import(${JSON.stringify(new URL('../scripts/experiment-b-resumable/journal.mjs', import.meta.url).href)});
    const j=new Journal(file,key);
    const broker={manifest:()=>Object.entries(sources).map(([id,content])=>({id,sha256:digest(content)})),prefix:ids=>({sources:ids.map(id=>({id,content:sources[id]})),commitment:digest(ids.map(id=>[id,digest(sources[id])]))})};
    const f=new ResumableFlight({journal:j,plan,policy,broker,measureInput:p=>p.length,observeRuntime:async()=>identity,transport:async()=>process.exit(19)});
    await f.run({windowId:'SYNTHETIC-WINDOW-1',policyAuthorization:'SYNTHETIC_POLICY_TEST_ONLY',runtimeAuthorization:'SYNTHETIC_RUNTIME_TEST_ONLY'});`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', code, ...[filename, KEY, makePlan(), POLICY, SOURCES, IDENTITY].map(JSON.stringify)], { encoding: 'utf8' });
  assert.equal(child.status, 19);
  const j = new Journal(filename, KEY);
  const f = engine(j, { transport: async () => { throw Error('MUST_NOT_RETRY_UNCERTAIN'); } });
  assert.equal((await resume(f)).reason, 'UNCERTAIN_CALL_HOLD'); assert.equal(successes(j).length, 0);
  EVIDENCE.push({ scenario: 'REAL_LOCAL_PROCESS_EXIT_SYNTHETIC_TRANSPORT', child_exit_code: child.status, model_calls: 0, events: j.events() }); j.close();
});

test('writer exclusion, key authentication, byte tamper, and trusted anchor rollback detection', t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY);
  const a = j.append('SYNTHETIC_A', { value: 1 }); const b = j.append('SYNTHETIC_B', { value: 2 });
  assert.throws(() => new Journal(filename, KEY), /WRITER_ACTIVE/); j.close();
  assert.throws(() => new Journal(filename, 'WRONG-SYNTHETIC-KEY-00000000000000000'), /INTEGRITY/);
  const raw = new DatabaseSync(filename);
  raw.prepare('DELETE FROM events WHERE seq=?').run(b.seq); raw.prepare('UPDATE control SET head=?').run(a.hash); raw.close();
  assert.throws(() => new Journal(filename, KEY, { anchor: { seq: b.seq, hash: b.hash } }), /ANCHOR/);
  const tamper = new DatabaseSync(filename); tamper.prepare('UPDATE events SET body=? WHERE seq=1').run(canonical({ seq: 1, previous: '', type: 'SYNTHETIC_A', payload: { value: 999 } })); tamper.close();
  assert.throws(() => new Journal(filename, KEY), /INTEGRITY/);
});

test('operator pause, source drift, model drift, and context limit preserve completed progress', async t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY);
  assert.equal((await resume(engine(j, { pauseRequested: () => true }))).reason, 'OPERATOR_PAUSE');
  assert.equal((await resume(engine(j, { observeRuntime: async () => ({ changed: true }) }))).reason, 'MODEL_OR_RUNTIME_DRIFT_HOLD');
  assert.throws(() => engine(j, { broker: broker({ ...SOURCES, D1: 'CHANGED' }) }), /SOURCE_MANIFEST/);
  assert.equal((await resume(engine(j, { measureInput: () => 10001 }))).reason, 'PHYSICAL_CONTEXT_OR_RESERVATION_HOLD');
  assert.equal(j.events().filter(e => e.type === 'DISPATCH_INTENT').length, 0); j.close();
});

test('unknown accounting remains unknown and reserved; spending stop is not scientific invalidation', async t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY);
  const policy = { ...POLICY, maxAccountedTokens: POLICY.reservationTokens };
  assert.equal((await resume(engine(j, { policy, transport: async r => result(r, { usage: null }) }))).reason, 'RESOURCE_AUTHORITY_PAUSE');
  const u = successes(j)[0].payload.usage;
  assert.equal(u.input_tokens, null); assert.equal(u.billable_usd, null); assert.equal(u.subscription_quota_units, null);
  assert.equal(resourceState(j.events(), policy, 'SYNTHETIC-WINDOW-1').accounted_tokens, policy.reservationTokens);
  assert.equal(usageRecord({ usage: { input_tokens: 10, output_tokens: 5, cached_input_tokens: 8, reasoning_tokens: 3 } }).reported_input_plus_output, 15);
  assert.throws(() => validatePolicy({}), /FINITE/); j.close();
});

test('definitively rejected no-execution attempt can resume within frozen retry authority', async t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY); let n = 0;
  const f = engine(j, { transport: async r => ++n === 1 ? { status: 'REJECTED_NO_EXECUTION', definitiveRejectionEvidence: { standard: 'SYNTHETIC_DEFINITIVE_NO_EXECUTION', evidence_class: 'SYNTHETIC_NOT_PROVIDER_ATTESTATION' } } : result(r) });
  assert.equal((await resume(f)).reason, 'PROVIDER_REJECTION_PAUSE');
  assert.equal((await resume(f, 'SYNTHETIC-WINDOW-2')).status, 'REASONING_COMPLETE_STAGE2_REQUIRED');
  assert.equal(j.events().filter(e => e.type === 'REJECTED_NO_EXECUTION').length, 1);
  assert.equal(n, successes(j).length + 1); j.close();
});

test('mirror is derived/idempotent; loss of mirror cannot cause accepted inference rerun', async t => {
  const { filename } = fixture(t); const j = new Journal(filename, KEY); let calls = 0;
  const mirror = { ledgerData: { turns: [] }, recordEvent() {} };
  await resume(engine(j, { transport: async r => { calls++; return result(r); }, mirror: ledgerMirror(mirror) }));
  const n = calls; mirror.ledgerData.turns = [];
  await resume(engine(j, { transport: async () => { calls++; throw Error('MUST_NOT_CALL'); }, mirror: ledgerMirror(mirror) }));
  assert.equal(calls, n); assert.equal(mirror.ledgerData.turns.length, n); j.close();
});

test('protected WeakMap capability cannot be minted by copied fixture or grant labels; live entry is fail-closed', async () => {
  assert.throws(() => protectedBroker([{ id: 'D1', content: 'SYNTHETIC', raw_bytes: Buffer.from('SYNTHETIC'), archive_intake_verified: true }]), /ORIGINAL_AUTHENTICATED/);
  assert.throws(() => verifyExecutionAuthorization({ operation: 'EXPERIMENT_B_RESUMABLE_FLIGHT' }, {}, {}), /AUTHORIZATION/);
  await assert.rejects(runProtectedConfiguration(), /EXPLICIT_PRIVATE/);
});

test('native utility wiring uses deterministic injected spawn, retains full JSONL and flags, flags unexpected tools', async t => {
  let seen;
  const stdout = [ {type:'thread.started', thread_id:'SYNTHETIC_THREAD'}, {type:'item.completed',item:{type:'agent_message',text:'SYNTHETIC_FINAL'}}, {type:'turn.completed',usage:{input_tokens:3,output_tokens:1}} ].map(JSON.stringify).join('\n');
  const fake=syntheticCapture(t);
  const identity={...IDENTITY,cliExecutableSHA256:'0'.repeat(64)};
  const transport = nativeTransport({ workspace: os.tmpdir(), model: 'SYNTHETIC_MODEL', effort: 'high', observeRuntime: async () => identity, captureService:fake.service, spawnNative: async args => { seen=args;return fake.spawnNative(args); } });
  const r = await transport({ attempt:'SYNTHETIC', rendered: { prompt: 'SYNTHETIC_PROMPT' }, runtime: identity, capture() {} });
  assert(seen.args.includes('--ephemeral')); assert(seen.args.includes('model_reasoning_effort="high"'));
  assert.equal(r.completeEvidence.stdout, stdout); assert.equal(r.completeEvidence.model_served_independently_attested, false);
  assert.equal(r.response, 'SYNTHETIC_FINAL');
});


test('Codex native parser retains last completed agent message, not concatenated commentary', () => {
  const stdout = [
    { type: 'thread.started', thread_id: 'SYNTHETIC_THREAD' },
    { type: 'item.completed', item: { type: 'agent_message', text: 'SYNTHETIC_INTERMEDIATE' } },
    { type: 'item.completed', item: { type: 'agent_message', text: 'SYNTHETIC_FINAL_ONLY' } },
    { type: 'turn.completed', usage: { input_tokens: 5, output_tokens: 2 } }
  ].map(JSON.stringify).join('\n');
  const observed = parseCodexEvents(stdout);
  assert.equal(observed.output, 'SYNTHETIC_FINAL_ONLY');
  assert.equal(observed.usage_reported.input_tokens, 5);
});

test('Codex native parser refuses agent output or any extra events after terminal turn', () => {
  const base = [
    { type: 'thread.started', thread_id: 'SYNTHETIC_THREAD' },
    { type: 'item.completed', item: { type: 'agent_message', text: 'SYNTHETIC_FINAL' } },
    { type: 'turn.completed' }
  ];
  assert.throws(() => parseCodexEvents([...base, { type: 'item.completed', item: { type: 'agent_message', text: 'SYNTHETIC_POST_TERMINAL' } }].map(JSON.stringify).join('\n')), /NATIVE_POST_TERMINAL_EVENT_REFUSED/);
});

test('Codex native parser rejects started, updated and completed tool activity', () => {
  const baseStart = { type: 'thread.started', thread_id: 'SYNTHETIC_THREAD' };
  const final = { type: 'item.completed', item: { type: 'agent_message', text: 'SYNTHETIC_FINAL' } };
  const terminal = { type: 'turn.completed' };
  for (const type of ['item.started', 'item.updated', 'item.completed']) {
    const toolEvent = { type, item: { type: 'command_execution', id: 'SYNTHETIC_TOOL' } };
    const stdout = [baseStart, toolEvent, final, terminal].map(JSON.stringify).join('\n');
    assert.throws(() => parseCodexEvents(stdout), /NATIVE_TOOL_ACTIVITY_REFUSED/, type);
  }
  const incompleteMcp = [baseStart, { type: 'item.started', item: { type: 'mcp_tool_call', id: 'SYNTHETIC_MCP' } }, final, terminal].map(JSON.stringify).join('\n');
  assert.throws(() => parseCodexEvents(incompleteMcp), /NATIVE_TOOL_ACTIVITY_REFUSED/);
});

test('Codex native parser retains fail-closed full JSONL size bound', () => {
  const big = 'X'.repeat(16 * 1024 * 1024 + 1);
  assert.throws(() => parseCodexEvents(big), /CODEX_JSONL_MISSING_OR_OVERSIZED/);
});
