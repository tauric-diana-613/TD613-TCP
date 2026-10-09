import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createStandardPortableLoomRuntime, STANDARD_LOOM_RECEIVER_RESULT_SCHEMA } from '../app/engine/portable-loom-standard-runtime.js';
import { portableLoomDigest, createPortableLoomSession, createPortableLoomSessionExport } from '../app/engine/portable-loom-session.js';
import { createLoomAiGovernance, createCanonicalPortableLoomPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { STANDARD_PORTABLE_LOOM_TASK, STANDARD_PORTABLE_LOOM_RULES } from '../app/engine/portable-loom-policy.js';
const env = { crypto: webcrypto }; if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
const source = { task: STANDARD_PORTABLE_LOOM_TASK, rules: [...STANDARD_PORTABLE_LOOM_RULES], documents: [] };
source.governance = await createLoomAiGovernance(source, {}, env);
const packet = await createCanonicalPortableLoomPacket(source, { sourceRevision: 'working-tree' }, env);
const seed = await createPortableLoomSession(packet, { session_id: 'local_runtime_fixture', source_revision: 'working-tree', created_at: 1000000 }, env);
const artifact = { ...await createPortableLoomSessionExport(seed, packet, env), loom_gate_reports: [] };
async function fixture() { let time = 1000000; const runtime = await createStandardPortableLoomRuntime(artifact, { gesture: 'START_LOCAL_SESSION', environment: env, now: () => time }); return { runtime, advance: n => { time += n; } }; }
const selection = (overrides = {}) => ({ task: 'Summarize the explicitly selected public fee.', documents: [
  { id: 'public', name: 'Public.txt', text: 'Public fee USD 120.', share: true },
  { id: 'private', name: 'Private.txt', text: 'PRIVATE_LOCAL_ONLY_613', share: false }
], protected_terms: ['PRIVATE_LOCAL_ONLY_613'], route: 'AUDIT', ...overrides });
async function released(runtime, input = selection()) {
  await runtime.stage(input); const state = runtime.inspect();
  const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'Explicitly selected receiver', expected_payload_digest: state.payload_digest, expected_revision: state.revision });
  return { ticket, released: await runtime.carry(ticket) };
}
function reply(runtime, overrides = {}) {
  const record = runtime.exportPrivate(), excursion = record.custody.pending_excursion, intent = excursion.turns[0];
  const result = { schema: STANDARD_LOOM_RECEIVER_RESULT_SCHEMA, answer: 'Public fee USD 120.\n'+runtime.footer(),
    used_document_ids: ['public'], missing_information: [], policy_change_requested: false,
    loom_session_receipt: { schema: 'td613.loom.portable-session-receiver-turn/v0.1', session_root_ref: excursion.session_root_ref,
      policy_commitment: excursion.policy_commitment, anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: intent.turn_index,
      operator_task: intent.task, used_document_ids: ['public'], missing_information: [], receiver_declaration: 'Synthetic engineering fixture; no provider execution.' }, ...overrides };
  return JSON.stringify(result);
}
test('standard runtime recomputes template integrity and deliberately starts a fresh local custody root', async () => {
  await assert.rejects(createStandardPortableLoomRuntime(artifact, { environment: env }), /gesture required/);
  const { runtime } = await fixture(); assert.notEqual(runtime.inspect().session_root_ref, artifact.session.root.ref);
  assert.equal(runtime.inspect().custody.status, 'LIVE_LOCAL_CUSTODY'); assert.equal(runtime.inspect().authorized, false);
  const corrupt = structuredClone(artifact); corrupt.session.root.policy_commitment = '1'.repeat(64);
  await assert.rejects(createStandardPortableLoomRuntime(corrupt, { gesture: 'START_LOCAL_SESSION', environment: env }), /integrity/);
});
test('only deliberately shared sources enter exact carriage; authorization is default-deny, exact and single-shot', async () => {
  const { runtime } = await fixture(); await runtime.stage(selection());
  assert.equal(runtime.inspect().withheld_document_count, 1); assert.ok(!runtime.preview().text.includes('PRIVATE_LOCAL_ONLY_613'));
  await assert.rejects(runtime.carry({}), /UNAUTHORIZED/);
  const state = runtime.inspect();
  await assert.rejects(runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'receiver', expected_payload_digest: 'wrong', expected_revision: state.revision }), /Exact reviewed/);
  const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'receiver', expected_payload_digest: state.payload_digest, expected_revision: state.revision });
  const result = await runtime.carry(ticket); assert.equal(result.provider_transmission_observed, false);
  assert.equal(result.text.includes('PRIVATE_LOCAL_ONLY_613'), false); await assert.rejects(runtime.carry(ticket), /UNAUTHORIZED/);
});
test('outbound protected literals are held before carriage, including Unicode normalization', async () => {
  const { runtime } = await fixture();
  await assert.rejects(runtime.stage(selection({ task: 'Disclose PRIVATE_LOCAL_ONLY_613' })), error => error.code === 'PROTECTED_EGRESS');
  await assert.rejects(runtime.carry({}), /UNAUTHORIZED/);
  await assert.rejects(runtime.stage(selection({ task: 'Disclose cafe\u0301', documents: [], protected_terms: ['caf\u00e9'] })), /PROTECTED_EGRESS/);
});
test('capture adapter binds actual reply content and original bytes; Check and admission remain separate', async () => {
  const { runtime } = await fixture(); await released(runtime); const raw = reply(runtime), captured = await runtime.capture(raw);
  assert.equal(captured.status, 'CAPTURE_BOUND_LOCALLY'); assert.equal(captured.binding_origin, 'LOCAL_CAPTURE_ADAPTER');
  assert.equal(runtime.inspect().custody.work_unit_count, 0);
  const c = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' }); assert.equal(c.status, 'ADMISSION_CANDIDATE');
  assert.equal(runtime.inspect().custody.work_unit_count, 0);
  const result = await runtime.admit({ gesture: 'ADMIT_RETURNED_WORK', expected_candidate_ref: c.ref, expected_head_ref: c.expected_head_ref, accept_unresolved: true });
  assert.equal(result.status, 'ADMITTED'); assert.equal(runtime.inspect().custody.work_unit_count, 1);
  const saved = runtime.exportPrivate(); assert.equal(saved.attempts[0].captures[0].raw, raw);
  assert.equal(saved.custody.session.work_units[0].admitted_result.foreign_origin_authenticated, false);
});
test('substituted receiver receipt and undeclared sources cannot be laundered through local binding', async () => {
  const { runtime } = await fixture(); await released(runtime); const r = JSON.parse(reply(runtime)); r.loom_session_receipt.session_root_ref = 'f'.repeat(64);
  assert.equal((await runtime.capture(JSON.stringify(r))).status, 'HELD');
  const other = JSON.parse(reply(runtime)); other.used_document_ids = ['private']; other.loom_session_receipt.used_document_ids = ['private'];
  await runtime.capture(JSON.stringify(other)); assert.equal((await runtime.check({ gesture: 'REVIEW_ROOT_RULES' })).status, 'HELD');
  assert.equal(runtime.inspect().custody.work_unit_count, 0);
});
test('actual supplied-capture disclosure detection persists through a later clean reply', async () => {
  const { runtime } = await fixture(); await released(runtime);
  await runtime.capture(reply(runtime, { answer: 'PRIVATE_LOCAL_ONLY_613 appeared in this supplied fixture.\n' + runtime.footer() }));
  const gate = runtime.gate(); assert.equal(gate.verification_results.at(-1).status, 'OBSERVED_EXPOSURE');
  assert.equal(gate.verification_results.at(-1).coverage.disclosed_targets, 1);
  const captured = await runtime.capture(reply(runtime)); assert.equal(captured.status, 'CAPTURE_BOUND_LOCALLY', captured.reason); assert.equal((await runtime.check({ gesture: 'REVIEW_ROOT_RULES' })).status, 'HELD');
  assert.equal(runtime.gate().retained_alerts.length, 1); assert.equal(runtime.inspect().custody.work_unit_count, 0);
});
test('Rest and retries preserve history but reject standing or serialized authorization', async () => {
  const { runtime } = await fixture(); await runtime.stage(selection()); const first = runtime.inspect();
  const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'receiver', expected_payload_digest: first.payload_digest, expected_revision: first.revision });
  await runtime.rest(); await assert.rejects(runtime.carry(ticket), /UNAUTHORIZED/);
  await runtime.stage(selection()); const staged = runtime.inspect(); await runtime.retry();
  assert.equal(runtime.inspect().route_id, staged.route_id); assert.equal(runtime.inspect().retained_attempt_count, 3);
  assert.equal(runtime.inspect().authorized, false); assert.equal(runtime.exportPrivate().recovery.startsWith('REVIEW_ONLY'), true);
});
test('expired authorization is consumed; journal timestamps and predecessor digests remain inspectable', async () => {
  const { runtime, advance } = await fixture(); await runtime.stage(selection()); const state = runtime.inspect();
  const ticket = await runtime.authorize({ gesture: 'AUTHORIZE_ONE_CARRIAGE', destination: 'receiver', expected_payload_digest: state.payload_digest, expected_revision: state.revision });
  advance(120000); await assert.rejects(runtime.carry(ticket), /EXPIRED/); await assert.rejects(runtime.carry(ticket), /UNAUTHORIZED/);
  const record = runtime.exportPrivate(); let previous = runtime.inspect().session_root_ref;
  for (const event of record.journal) { const { ref, ...body } = event; assert.equal(event.predecessor_ref, previous); assert.equal(ref, await portableLoomDigest(body, env)); previous = ref; }
  assert.equal(previous, record.journal_head);
});
test('second admission preserves predecessor and content lineage; fresh sources are explicit', async () => {
  const { runtime } = await fixture(); await released(runtime); await runtime.capture(reply(runtime)); let c = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' });
  await runtime.admit({ gesture: 'ADMIT_RETURNED_WORK', expected_candidate_ref: c.ref, expected_head_ref: c.expected_head_ref, accept_unresolved: true });
  const firstHead = runtime.inspect().custody.current_work_unit_ref;
  await released(runtime, selection({ task: 'Explain the explicit new task.', documents: [], protected_terms: [] }));
  const raw = JSON.parse(reply(runtime, { used_document_ids: [] })); raw.loom_session_receipt.used_document_ids = [];
  await runtime.capture(JSON.stringify(raw)); c = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' });
  const admitted = await runtime.admit({ gesture: 'ADMIT_RETURNED_WORK', expected_candidate_ref: c.ref, expected_head_ref: c.expected_head_ref, accept_unresolved: true });
  assert.equal(admitted.work_units[0].predecessor_work_unit_ref, firstHead); assert.deepEqual(admitted.work_units[0].selected_documents, []);
  assert.equal(runtime.gate().state.observed_provider_transmission, 'UNOBSERVED_BY_MANUAL_CARRIAGE');
  assert.ok(runtime.footer().endsWith('⟐')); assert.ok(runtime.footer().includes(runtime.inspect().session_label));
  assert.equal(runtime.presentation({ reducedMotion: true, timestampMs: 0 }).carrier_count, 39);
});

test('malformed supplied replies are still scanned for protected-literal disclosure', async () => {
  const { runtime } = await fixture(); await released(runtime);
  assert.equal((await runtime.capture('Unstructured reply contains PRIVATE_LOCAL_ONLY_613')).status, 'HELD');
  assert.equal(runtime.gate().verification_results.at(-1).status, 'OBSERVED_EXPOSURE');
  assert.equal(runtime.inspect().custody.work_unit_count, 0);
});

test('a captured answer without the required footer remains an observed protocol omission after a clean replacement', async () => {
  const { runtime } = await fixture(); await released(runtime);
  await runtime.capture(reply(runtime, { answer: 'Public fee USD 120.' }));
  assert.equal(runtime.gate().retained_alerts.at(-1).status, 'PROTOCOL_OMISSION_OBSERVED');
  await runtime.capture(reply(runtime));
  const candidate = await runtime.check({ gesture: 'REVIEW_ROOT_RULES' });
  assert.equal(candidate.status, 'HELD'); assert.ok(candidate.reasons.includes('RETAINED_RECEIVER_FOOTER_OMISSION'));
  assert.equal(runtime.inspect().custody.work_unit_count, 0);
});

test('linked Gate commands and body-only footer quotations are observed omissions and cannot become admission candidates', async () => {
  for (const variant of [
    footer => footer.replace('米 Check Loom Gate', '[米 Check Loom Gate](https://td613.com/)'),
    footer => footer.replace('米 Check Loom Gate', '[米 Check Loom Gate][gate]'),
    footer => footer.replace('米 Check Loom Gate', '<a href="https://td613.com/">米 Check Loom Gate</a>'),
    footer => footer + '\nQuoted footer above.\nOrdinary answer continues.\nOrdinary ending ⟐',
    footer => footer + '\nOrdinary ending ⟐'
  ]) {
    const { runtime } = await fixture(); await released(runtime);
    const captured = await runtime.capture(reply(runtime, { answer: 'Synthetic answer.\n' + variant(runtime.footer()) }));
    assert.equal(captured.hold_status, 'RETAINED_ALERTS'); assert.equal(runtime.inspect().phase, 'HELD');
    assert.equal(runtime.gate().retained_alerts.at(-1).status, 'PROTOCOL_OMISSION_OBSERVED');
    assert.equal((await runtime.check({ gesture: 'REVIEW_ROOT_RULES' })).status, 'HELD');
    assert.equal(runtime.inspect().custody.work_unit_count, 0);
  }
});
