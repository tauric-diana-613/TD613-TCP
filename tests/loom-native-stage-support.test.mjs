import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { runFadtStageAudit } from '../app/engine/dollhouse-continuity-audit.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  bindLoomDemoRequest, createLoomDemoActivation, exportLoomDemoCurrent,
  loomDemoDigest, loomDemoReceiptDigest, LOOM_DEMO_REQUEST_SCHEMA,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';

const environment = { crypto: webcrypto };
const stages = JSON.parse(fs.readFileSync(new URL('./fixtures/dollhouse/loom-native-stage-support.json', import.meta.url)));

test('native presentation can be shared while retained stage and head preserve declared lawful support', () => {
  const kept = runFadtStageAudit(stages);
  assert.equal(kept.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(kept.finite_audit.all_fibres_exact, true);
  assert.deepEqual(kept.erased_coordinates, ['surface']);
  assert.equal(kept.evidence_boundary.stage_admission_verified, false);
  const erased = runFadtStageAudit({ states: stages.states, retain: ['surface'] });
  assert.equal(erased.verdict, 'HOLD');
  assert.deepEqual(erased.finite_audit.fibres[0].intersection, ['EXIT', 'REST']);
  assert.deepEqual(erased.finite_audit.fibres[0].irreducible_gap,
    ['EXPORT_CURRENT', 'SEND_AIA', 'SEND_FILES', 'SEND_FOLLOWUP', 'SEND_ORDINARY', 'STAGE_AIA', 'STAGE_FILES', 'STOP']);
});

test('stage alone cannot conflate current and stale admitted continuations', () => {
  const report = runFadtStageAudit({ states: stages.states, retain: ['stage', 'admission'] });
  assert.equal(report.verdict, 'HOLD');
  const fibre = report.finite_audit.fibres.find(value => value.antecedents.some(item => item.id === 'historic-admitted'));
  assert.deepEqual(fibre.intersection, ['EXIT', 'REST']);
  assert.deepEqual(fibre.irreducible_gap, ['EXPORT_CURRENT', 'SEND_FOLLOWUP']);
});

const response = (requestId, answer, used = []) => ({
  schema: 'td613.loom.ai-task-result/v0.1', request_id: requestId, status: 'completed',
  answer, missing_information: [], used_document_ids: used, suggested_next_step: 'Review the selected record.'
});

async function fixture() {
  const packet = { task: 'Count the fictional workstreams.',
    documents: [{ id: 'selected', name: 'selected.txt', text: 'There are three fictional workstreams.' }],
    rules: ['Use only the selected record.', 'Do not request the local identity ledger.'] };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, environment);
  const activation = await createLoomDemoActivation(packet, environment);
  const request = (id, phase, predecessor = null, prior = null) => ({
    schema: LOOM_DEMO_REQUEST_SCHEMA, request_id: id, phase, activation,
    documents: phase === 'ACTIVATE' ? [] : packet.documents,
    operator_request: 'Please continue.', predecessor, prior_result: prior
  });
  const activationRequest = request('activation', 'ACTIVATE');
  const activated = await bindLoomDemoRequest(activationRequest, environment);
  const activationResult = response('activation', 'I received the task and rules. The selected file contents are still pending.');
  assert.equal(activated.admit(activationResult).allowed, true);
  const receipt = async (req, binding, output, parent = null) => ({
    schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: activation.activation_digest,
    phase: req.phase, request_id: req.request_id, request_digest: await loomDemoDigest(req, environment),
    current_input_digest: binding.governance.input_digest, prior_result_digest: binding.receipt.prior_result_digest,
    result_digest: await loomDemoDigest(output, environment),
    predecessor_receipt_digest: parent ? await loomDemoReceiptDigest(parent, environment) : null,
    expires_at: activation.expires_at, admission_state: 'ADMITTED',
    stage_policy: req.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND', authority_transferred: false,
    auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) }
  });
  const parent = await receipt(activationRequest, activated, activationResult);
  return { packet, activation, request, receipt, parent, activated };
}

test('ordinary, held, unsupported-source and wrong-turn answers cannot become a native governed export', async () => {
  const f = await fixture();
  try {
    assert.throws(() => exportLoomDemoCurrent(f.activated), /CURRENT_RESULT_NOT_ADMITTED/);
    const hostile = [
      { content: 'An ordinary chat reply.', role: 'assistant' },
      { ...response('files', 'Held candidate.', ['selected']), status: 'held' },
      response('files', 'A claim attributed to a local file.', ['local-identity']),
      response('other-turn', 'A reply to a different request.', ['selected'])
    ];
    for (const output of hostile) {
      const binding = await bindLoomDemoRequest(f.request('files', 'CONTINUE', f.parent), environment);
      try {
        try { assert.equal(binding.admit(output).allowed, false); } catch (error) {
          assert.match(error.message, /PRIOR_RESULT_HELD/);
        }
        assert.equal(binding.getAdmittedResult(), null);
        assert.throws(() => exportLoomDemoCurrent(binding), /CURRENT_RESULT_NOT_ADMITTED/);
      } finally { binding.governor.close(); }
    }
  } finally { f.activated.governor.close(); }
});

test('held follow-up retains prior export and the next admitted turn binds its actual immediate predecessor', async () => {
  const f = await fixture();
  const firstRequest = f.request('files', 'CONTINUE', f.parent);
  const first = await bindLoomDemoRequest(firstRequest, environment);
  const answer = response('files', 'The selected record lists three fictional workstreams.', ['selected']);
  let failed, next;
  try {
    assert.equal(first.admit(answer).allowed, true);
    const parent = await f.receipt(firstRequest, first, answer, f.parent);
    const priorExport = exportLoomDemoCurrent(first);
    failed = await bindLoomDemoRequest(f.request('followup-held', 'CONTINUE', parent, answer), environment);
    assert.throws(() => failed.admit({ ...response('followup-held', 'No admitted result.', ['selected']), status: 'held' }), /PRIOR_RESULT_HELD/);
    assert.throws(() => exportLoomDemoCurrent(failed), /CURRENT_RESULT_NOT_ADMITTED/);
    assert.deepEqual(exportLoomDemoCurrent(first), priorExport);
    next = await bindLoomDemoRequest(f.request('followup-retry', 'CONTINUE', parent, answer), environment);
    assert.equal(next.receipt.predecessor_request_id, 'files');
    assert.equal(next.receipt.prior_result_digest, parent.result_digest);
    const latest = response('followup-retry', 'Three fictional workstreams remain; no extra source has arrived.', ['selected']);
    assert.equal(next.admit(latest).allowed, true);
    const exported = exportLoomDemoCurrent(next);
    assert.equal(exported.continuation.prior_result.request_id, 'followup-retry');
    assert.equal(exported.governance.withheld_document_count, 1);
    assert.equal(JSON.stringify(exported).includes('local-identity'), false);
    assert.throws(() => exportLoomDemoCurrent(next, answer), /EXPORT_RESULT_MISMATCH/);
  } finally { [f.activated, first, failed, next].forEach(binding => binding?.governor.close()); }
});
