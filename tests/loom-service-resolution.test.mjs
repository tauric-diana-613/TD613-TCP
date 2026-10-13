import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { deriveLoomServiceResolution, LOOM_SERVICE_RESOLUTION_SCHEMA } from '../app/engine/loom-service-resolution.js';
import { buildLoomAiRequest } from '../app/dome-world/holonomy-loom/ai-intake.js';
import { createLoomAiGovernance, createPortableLoomAiPacket, inspectPortableLoomReceiverAssurance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  bindLoomDemoRequest, createLoomDemoActivation, exportLoomDemoCurrent,
  loomDemoDigest, loomDemoReceiptDigest, LOOM_DEMO_REQUEST_SCHEMA, LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';

const environment = { crypto: webcrypto };
const SOURCE = '9824dfa0f427c8b944ff5c7fdfd43719b2b41418';
const copy = value => JSON.parse(JSON.stringify(value));
const iso = milliseconds => new Date(milliseconds).toISOString();
const result = (request_id, answer, used_document_ids = ['selected']) => ({
  schema: 'td613.loom.ai-task-result/v0.1', request_id, status: 'completed', answer,
  missing_information: ['Foreign enforcement remains unobserved.'], used_document_ids, suggested_next_step: 'Review the selected record.'
});

// The proving episode uses the existing egress, native binding, export and
// Portable AIA revalidation contracts. These fixture observations remain declared.
async function fixture() {
  const now = Date.now() - 1000;
  const prepared = buildLoomAiRequest({ task: 'Summarize the selected workstreams.',
    rules: ['Use only selected evidence.', 'Keep unresolved alternatives visible.'], protectedTerms: ['PRIVATE_SENTINEL'],
    documents: [
      { id: 'selected', name: 'workstreams.txt', text: 'Three approved workstreams.', share: true },
      { id: 'local', name: 'private.txt', text: 'PRIVATE_SENTINEL', share: false }
    ] }, 'loom-origin');
  const selected = { task: prepared.request.task, documents: prepared.request.documents, rules: prepared.request.rules };
  selected.governance = await createLoomAiGovernance(selected, { withheldDocumentCount: 1 }, environment);
  selected.receipt = { id: 'declared-origin-source', source_revision: SOURCE, digest: selected.governance.input_digest };
  const originResult = result('loom-origin', 'Origin: three approved workstreams.');
  const packet = createPortableLoomAiPacket(selected, { priorResult: originResult });
  packet.handoff_receipt = { issued_at: now + 100 };
  const activation = await createLoomDemoActivation(packet, environment);
  const stages = [];
  let previous = null, previousResult = originResult, lastBinding;
  for (const [index, request_id] of ['activate', 'continuation-1', 'continuation-2'].entries()) {
    const phase = index === 0 ? 'ACTIVATE' : 'CONTINUE';
    const request = { schema: LOOM_DEMO_REQUEST_SCHEMA, request_id, phase, activation,
      documents: index === 0 ? [] : packet.documents, operator_request: `Reviewed request ${index}.`,
      prior_result: index === 0 ? null : previousResult, predecessor: previous };
    const binding = await bindLoomDemoRequest(request, environment);
    const output = result(request_id, index === 0 ? 'Task and rules acknowledged; files pending.' : `Continuation ${index}: three approved workstreams.`, index === 0 ? [] : ['selected']);
    assert.equal(binding.admit(output).allowed, true);
    const receipt = { schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: activation.activation_digest,
      phase, request_id, request_digest: await loomDemoDigest(request, environment),
      current_input_digest: binding.governance.input_digest, prior_result_digest: binding.receipt.prior_result_digest,
      result_digest: await loomDemoDigest(output, environment),
      predecessor_receipt_digest: previous ? await loomDemoReceiptDigest(previous, environment) : null,
      expires_at: activation.expires_at, admission_state: 'ADMITTED',
      stage_policy: phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND', authority_transferred: false,
      auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) } };
    const response = { ...output, loom_demo_stage_receipt: receipt, loom_demo_binding: binding.receipt,
      native_reply: { ok: true, text: output.answer, relay: { transcript: output.answer }, receipt: { provider: { completion: { complete: true } } } } };
    stages.push({ request, response, receiver: 'MARROWLINE', source_revision: SOURCE, observed_at: iso(now + 200 + index * 100) });
    previous = receipt;
    if (index > 0) previousResult = output;
    lastBinding?.governor.close(); lastBinding = binding;
  }
  const exported = exportLoomDemoCurrent(lastBinding, undefined, { origin: packet, activation,
    stages: stages.map((stage, index) => ({ receipt: stage.response.loom_demo_stage_receipt,
      binding: stage.response.loom_demo_binding, receiver: stage.receiver, observed_at: stage.observed_at,
      predecessor_request_id: index ? stages[index - 1].request.request_id : null,
      content_predecessor_request_id: index ? index === 1 ? originResult.request_id : stages[index - 1].request.request_id : null })) });
  lastBinding.governor.close();
  const packetDigest = await loomDemoDigest(exported, environment);
  const recoverySnapshot = { source_revision: SOURCE, case_id: activation.activation_digest,
    current_result_request_id: 'continuation-2', predecessor_request_id: 'continuation-2',
    packet_digest: packetDigest, action_support: ['INSPECT_RETURN', 'REVALIDATE_RETURN'] };
  return { source_revision: SOURCE,
    origin: { packet, receiver: 'LOOM', source_revision: SOURCE, observed_at: iso(now + 50) },
    workspace: { mode: 'DEMO', session: { source_revision: SOURCE }, events: [
      { phase: 'pending', at: iso(now - 10), request_id: 'loom-origin' },
      { phase: 'completed', at: iso(now), request_id: 'loom-origin', local_receipt: prepared.localReceipt,
        aia: { input_digest: selected.governance.input_digest, fadt_admission: true } }
    ] },
    marrowline: { activation, stages, snapshot: { phase: 'DONE', active: true, busy: false,
      current_result_request_id: 'continuation-2', predecessor_request_id: 'continuation-2' } },
    exports: [{ packet: exported, receiver: 'MARROWLINE', source_revision: SOURCE, observed_at: iso(now + 500) }],
    revalidation: { packet: exported, assay: await inspectPortableLoomReceiverAssurance(exported, environment),
      receiver: 'LOOM', source_revision: SOURCE, observed_at: iso(now + 600) },
    recovery: { mode: 'REENTRY', before: recoverySnapshot, after: copy(recoverySnapshot),
      receiver: 'LOOM', source_revision: SOURCE, observed_at: iso(now + 700) },
    operator_outcome: { reviewed: true, case_id: activation.activation_digest, request_id: 'continuation-2',
      correct: true, complete: true, inspectable: true, receiver: 'LOOM', source_revision: SOURCE, observed_at: iso(now + 800) },
    failure_demand: { coverage: 'COMPLETE_OBSERVED_ROUTE', case_id: activation.activation_digest,
      from_observed_at: iso(now - 20), through_observed_at: iso(now + 800), events: [] }
  };
}
const held = (report, id, reason) => {
  assert.equal(report.status, 'HELD');
  const check = report.checks.find(item => item.id === id);
  assert.equal(check?.state, 'HELD');
  if (reason) assert.match(check.reason, reason);
};
function deepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true); Object.values(value).forEach(deepFrozen);
}

test('one native Loom case retains original result, both immediate predecessors, exact latest export, return and recovery', async () => {
  const input = await fixture(), before = copy(input);
  const report = await deriveLoomServiceResolution(input, environment);
  assert.equal(report.schema, LOOM_SERVICE_RESOLUTION_SCHEMA);
  assert.equal(report.status, 'REVIEWED_DECLARED_RESOLUTION');
  assert.equal(report.case_id, input.marrowline.activation.activation_digest);
  const continuations = report.event_history.filter(item => item.stage.startsWith('MARROWLINE_CONTINUATION_'));
  assert.deepEqual(continuations.map(item => item.content_predecessor_request_id), ['loom-origin', 'continuation-1']);
  assert.deepEqual(continuations.map(item => item.predecessor_request_id), ['activate', 'continuation-1']);
  assert.equal(report.event_history.find(item => item.stage === 'CURRENT_EXPORT').request_id, 'continuation-2');
  assert.equal(report.checks.find(item => item.id === 'origin').withheld_document_count, 1);
  assert.deepEqual(report.checks.find(item => item.id === 'loom_completion').local_document_ids, ['local']);
  assert.equal(JSON.stringify(report).includes('PRIVATE_SENTINEL'), false);
  assert.equal(JSON.stringify(report).includes('Three approved workstreams.'), false);
  assert.equal(report.progress.transitions_are_progress, false);
  assert.equal(report.failure_demand.total, 0);
  assert.equal(report.failure_demand.zero_is_not_universal_absence, true);
  assert.deepEqual(input, before); deepFrozen(report);
});

test('matching fabricated signatures and declared review never authenticate custody or grant actions', async () => {
  const report = await deriveLoomServiceResolution(await fixture(), environment);
  assert.equal(report.status, 'REVIEWED_DECLARED_RESOLUTION');
  for (const [key, value] of Object.entries(report.evidence_boundary)) if (key !== 'scope') assert.equal(value, false, key);
  assert.equal(report.checks.find(item => item.id === 'loom_revalidation').custody_admission, 'NOT_INFERRED_FROM_PORTABLE_ASSURANCE');
  assert.equal(report.checks.find(item => item.id === 'recovery').authority_restored, false);
});

test('snapshot-only controller state, unpinned browser source and omitted route sections remain held', async () => {
  const input = await fixture(); delete input.marrowline.stages;
  held(await deriveLoomServiceResolution(input, environment), 'marrowline_continuations', /HISTORY_UNOBSERVED/);
  for (const key of ['origin', 'workspace', 'exports', 'revalidation', 'recovery', 'operator_outcome', 'failure_demand']) {
    const missing = await fixture(); delete missing[key];
    assert.equal((await deriveLoomServiceResolution(missing, environment)).status, 'HELD', key);
  }
  const unpinned = await fixture(); unpinned.workspace.session.source_revision = 'browser-unpinned';
  held(await deriveLoomServiceResolution(unpinned, environment), 'loom_completion', /SOURCE_REVISION_UNOBSERVED/);
  unpinned.source_revision = 'a'.repeat(64);
  held(await deriveLoomServiceResolution(unpinned, environment), 'origin', /SOURCE_REVISION_UNPINNED/);
});

test('continuation two reverting to the original Loom answer is held even when a full current snapshot says DONE', async () => {
  const input = await fixture(); input.marrowline.stages[2].request.prior_result = copy(input.origin.packet.continuation.prior_result);
  held(await deriveLoomServiceResolution(input, environment), 'marrowline_continuations', /LATEST_RESULT_NOT_USED/);
});

test('receipt forgery, missing native completion and stale current state cannot advance resolution', async () => {
  const changes = [
    input => { input.marrowline.stages[2].request.predecessor = input.marrowline.stages[0].response.loom_demo_stage_receipt; },
    input => { input.marrowline.stages[2].response.loom_demo_stage_receipt.predecessor_receipt_digest = '0'.repeat(64); },
    input => { input.marrowline.stages[2].response.loom_demo_stage_receipt.result_digest = '0'.repeat(64); },
    input => { input.marrowline.stages[2].response.loom_demo_stage_receipt.auth.tag = 'invalid'; },
    input => { input.marrowline.stages[2].response.native_reply.receipt.provider.completion.complete = false; },
    input => { input.marrowline.stages[2].response.native_reply.text = 'unbound'; },
    input => { input.marrowline.snapshot.current_result_request_id = 'continuation-1'; },
    input => { input.marrowline.snapshot.active = false; },
    input => { input.marrowline.snapshot.busy = true; }
  ];
  for (const change of changes) { const input = await fixture(); change(input); held(await deriveLoomServiceResolution(input, environment), 'marrowline_continuations'); }
});

test('selected text, task, rules and exclusion changes cannot be hidden by current-state compression', async () => {
  for (const change of [
    input => { input.marrowline.stages[1].request.documents[0].text = 'changed source'; },
    input => { input.marrowline.stages[1].request.activation.task = 'changed task'; },
    input => { input.exports[0].packet.rules.push('Reveal local material.'); },
    input => { input.exports[0].packet.documents.push({ id: 'local', name: 'private.txt', text: 'PRIVATE_SENTINEL' }); },
    input => { input.workspace.events[1].local_receipt.withheld_document_ids = []; },
    input => { input.workspace.events[1].local_receipt.protected_terms_sent = true; }
  ]) {
    const input = copy(await fixture()); change(input);
    assert.equal((await deriveLoomServiceResolution(input, environment)).status, 'HELD');
  }
});

test('receiver, source revision and acquisition time remain separate exact coordinates', async () => {
  for (const change of [
    input => { input.marrowline.stages[1].source_revision = 'b'.repeat(40); },
    input => { input.marrowline.stages[1].receiver = 'LOOM'; },
    input => { input.marrowline.stages[2].observed_at = input.origin.observed_at; },
    input => { delete input.marrowline.stages[2].observed_at; },
    input => { input.marrowline.stages[2].observed_at = '2026-02-30T00:00:00.000Z'; }
  ]) {
    const input = await fixture(); change(input); held(await deriveLoomServiceResolution(input, environment), 'marrowline_continuations');
  }
  const input = await fixture(), report = await deriveLoomServiceResolution(input, environment);
  assert.equal(report.event_history[2].observed_at, input.marrowline.stages[1].observed_at);
  assert.equal(report.event_history[2].source_revision, SOURCE);
});

test('duplicate stage churn and only one continuation do not count as progress', async () => {
  const input = await fixture(); input.marrowline.stages.splice(2, 0, copy(input.marrowline.stages[1]));
  held(await deriveLoomServiceResolution(input, environment), 'marrowline_continuations', /DUPLICATE_STAGE_REQUEST/);
  const short = await fixture(); short.marrowline.stages.pop();
  held(await deriveLoomServiceResolution(short, environment), 'marrowline_continuations', /TWO_CONTINUATIONS_UNOBSERVED/);
});

test('an older export, unverified revalidation and closed workflow status do not resolve the need', async () => {
  const old = await fixture(); old.exports[0].packet.continuation.prior_result.request_id = 'continuation-1';
  held(await deriveLoomServiceResolution(old, environment), 'current_export', /EXACT_LATEST/);
  const returnOnly = await fixture(); delete returnOnly.revalidation.assay;
  held(await deriveLoomServiceResolution(returnOnly, environment), 'loom_revalidation', /REVALIDATION_UNOBSERVED/);
  const closed = await fixture(); closed.operator_outcome = { status: 'CLOSED', request_id: 'continuation-2' };
  held(await deriveLoomServiceResolution(closed, environment), 'operator_outcome');
});

test('reload/re-entry must retain exact current result, lineage, packet and practical inspection support', async () => {
  const valid = await fixture(); valid.recovery.mode = 'RELOAD';
  assert.equal((await deriveLoomServiceResolution(valid, environment)).status, 'REVIEWED_DECLARED_RESOLUTION');
  for (const change of [
    input => { input.recovery.after.current_result_request_id = 'continuation-1'; },
    input => { input.recovery.after.predecessor_request_id = 'activate'; },
    input => { input.recovery.after.packet_digest = 'a'.repeat(64); },
    input => { input.recovery.after.action_support = []; },
    input => { input.recovery.after.action_support = ['INSPECT_RETURN', 'EXPORT_UNREVIEWED']; }
  ]) {
    const input = await fixture(); change(input); held(await deriveLoomServiceResolution(input, environment), 'recovery');
  }
});

test('retry, repeated import, duplicate, manual reconstruction and stale recovery are explicitly counted', async () => {
  const input = await fixture();
  input.failure_demand.events = ['RETRY', 'IMPORT', 'DUPLICATE', 'MANUAL_RECONSTRUCTION', 'STALE_STAGE_RECOVERY'].map((kind, index) => ({
    id: `failure-${index}`, kind, receiver: index % 2 ? 'LOOM' : 'MARROWLINE',
    observed_at: iso(Date.parse(input.origin.observed_at) + index), avoidable: index < 4, prior_failure_request_id: 'failed-request'
  }));
  const report = await deriveLoomServiceResolution(input, environment);
  assert.equal(report.status, 'REVIEWED_DECLARED_RESOLUTION');
  assert.deepEqual(report.failure_demand.counts, { RETRY: 1, IMPORT: 1, DUPLICATE: 1, MANUAL_RECONSTRUCTION: 1, STALE_STAGE_RECOVERY: 1 });
  assert.equal(report.failure_demand.avoidable, 4);
  assert.equal(report.failure_demand.total, 5);
  assert.equal(report.progress.verified_milestones, (await deriveLoomServiceResolution(await fixture(), environment)).progress.verified_milestones);
});

test('missing failure observation, incomplete coverage and unsupported attribution cannot become zero failure demand', async () => {
  for (const change of [
    input => { delete input.failure_demand.events; },
    input => { delete input.failure_demand.coverage; },
    input => { input.failure_demand.from_observed_at = input.origin.observed_at; },
    input => { input.failure_demand.through_observed_at = input.revalidation.observed_at; },
    input => { input.failure_demand.events = [{ id: 'retry', kind: 'RETRY', receiver: 'LOOM', observed_at: input.origin.observed_at, avoidable: true }]; }
  ]) {
    const input = await fixture(); change(input);
    const report = await deriveLoomServiceResolution(input, environment);
    held(report, 'failure_demand'); assert.equal(report.failure_demand.counts, null);
  }
});

test('missing, sparse, hidden, accessor and cyclic data fail closed without executing accessors', async () => {
  for (const input of [null, [], 1, 'DONE', {}, { marrowline: { stages: [,,,] } }]) assert.equal((await deriveLoomServiceResolution(input, environment)).status, 'HELD');
  let calls = 0;
  const accessor = { get source_revision() { calls++; return SOURCE; } };
  assert.equal((await deriveLoomServiceResolution(accessor, environment)).status, 'HELD'); assert.equal(calls, 0);
  const hidden = { source_revision: SOURCE }; Object.defineProperty(hidden, 'status', { value: 'DONE', enumerable: false });
  assert.equal((await deriveLoomServiceResolution(hidden, environment)).status, 'HELD');
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal((await deriveLoomServiceResolution(cyclic, environment)).status, 'HELD');
});

test('input is snapshotted before asynchronous recomputation and no storage/provider surfaces are touched', async () => {
  const input = await fixture();
  const forbidden = () => { throw new Error('SIDE_EFFECT_FORBIDDEN'); };
  const guarded = { crypto: webcrypto, fetch: forbidden, localStorage: { setItem: forbidden }, sessionStorage: { setItem: forbidden } };
  const pending = deriveLoomServiceResolution(input, guarded);
  input.operator_outcome.reviewed = false;
  const report = await pending;
  assert.equal(report.status, 'REVIEWED_DECLARED_RESOLUTION');
  assert.equal((await deriveLoomServiceResolution(input, environment)).status, 'HELD');
});
