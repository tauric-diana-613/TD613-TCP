import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { primaryCallPlan, continuationCallPlan, runFirstReceiver } from '../research/portable-loom-assay-activation-20261009/run-first-receiver.mjs';
import { loadServerManifest } from '../research/portable-loom-server-transport-20261009/server-client.mjs';
import { sha256, canonicalJson, inspectAssayResponse } from '../server/loom-assay-contract.js';
const { manifest } = loadServerManifest();
function policy() {
  const p = JSON.parse(readFileSync('research/portable-loom-server-transport-20261009/POLICY.template.json'));
  p.protocol_commit = p.binding.protocol_commit = 'a'.repeat(40); p.expires_at = '2099-01-01T00:00:00Z';
  p.binding.limits.max_cost_usd = 10;
  p.binding.pricing = { input_usd_per_million: 0.75, output_usd_per_million: 3.75, source: 'synthetic test pricing', verified_at: '2026-10-01T00:00:00Z' };
  return p;
}
test('the primary plan contains 54 frozen calls, three independent repetitions and ordered continuations', () => {
  const plan = primaryCallPlan(manifest);
  assert.equal(plan.length, 54); assert.equal(new Set(plan.map(x => x.trial_id)).size, 36);
  for (const c of manifest.receivers) for (let repetition = 1; repetition <= 3; repetition++) {
    assert.deepEqual(plan.filter(x => x.trial_id === `FIRST_CONFIGURED_RECEIVER-${c.case_id}-${repetition}`).map(x => x.turn_index),
      Array.from({ length: c.later_user_messages.length + 1 }, (_, i) => i));
  }
  const changed = structuredClone(manifest); changed.receivers.pop();
  assert.throws(() => primaryCallPlan(changed), /PRIMARY_CASE_SET/);
});
test('a held call retains its result, stops subsequent execution and cannot overwrite the attempt', async () => {
  const root = mkdtempSync(join(tmpdir(), 'td613-primary-stop-')), output = join(root, 'run');
  try {
    let calls = 0;
    const capture = async () => { calls++; return { status: 'HELD_EVIDENCE_GAP', evidence_class: 'LOCAL_STRUCTURAL_TEST', returned: null }; };
    const result = await runFirstReceiver(policy(), output, { capture });
    assert.equal(calls, 1); assert.equal(result.attempted_calls, 1); assert.equal(result.unattempted_calls, 53);
    assert.equal(result.evidence_class, 'LOCAL_STRUCTURAL_TEST'); assert.equal(result.retry_authorized, false);
    assert.equal(JSON.parse(readFileSync(join(output, 'progress.json'))).length, 1);
    assert.equal(JSON.parse(readFileSync(join(output, 'completion.json'))).status, 'HELD_EVIDENCE_GAP');
    await assert.rejects(runFirstReceiver(policy(), output, { capture }), /ATTEMPT_EXISTS/);
    assert.equal(calls, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('the runner rejects a widened budget or call count before opening a run or generating', async () => {
  const root = mkdtempSync(join(tmpdir(), 'td613-primary-budget-'));
  try {
    let calls = 0;
    for (const change of [p => p.binding.limits.max_cost_usd = 11, p => p.binding.limits.max_calls = 55]) {
      const p = policy(); change(p);
      await assert.rejects(runFirstReceiver(p, join(root, 'run'), { capture: async () => { calls++; } }), /AUTHORIZED_RUN_BOUND/);
    }
    assert.equal(calls, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
function continuationFixture(root, n = 2) {
  const old = policy(), p = policy(); old.run_id = 'synthetic-old'; p.run_id = 'synthetic-new';
  p.protocol_commit = p.binding.protocol_commit = 'b'.repeat(40);
  p.binding.limits.max_calls = 54 - n; p.binding.limits.max_cost_usd = 9.45784; p.binding.limits.timeout_ms = 240000;
  const predecessor_policy_path = join(root, 'old-policy.json'); writeFileSync(predecessor_policy_path, JSON.stringify(old));
  const completed_prefix = primaryCallPlan(manifest).slice(0, n).map((trial, i) => {
    const directory = join(root, `synthetic-prefix-${i}`); mkdirSync(directory);
    const provider = Buffer.from(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Synthetic fixture only.' }] } }],
      modelVersion: old.binding.response_model_ids[0], usageMetadata: { promptTokenCount: 100, totalTokenCount: 115 } }));
    const returned = inspectAssayResponse(provider, old, 8192);
    const response = { source_commit: old.protocol_commit, response_complete: true, provider_requests: 1, retries: 0,
      provider_response_base64: provider.toString('base64'), provider_response_sha256: sha256(provider), returned };
    const wrapper = Buffer.from(JSON.stringify(response)); writeFileSync(join(directory, 'response.body.bin'), wrapper);
    const cap = { trial, status: 'CAPTURED_NOT_ADMITTED', evidence_class: 'ACTUAL_RECEIVER_TEST', fixture_transport: false,
      source_commit: old.protocol_commit, artifact_sha256: old.artifact_sha256, response_sha256: sha256(wrapper), response, returned };
    const bytes = Buffer.from(JSON.stringify(cap)), capture_path = join(directory, 'capture.json'); writeFileSync(capture_path, bytes);
    return { capture_path, capture_sha256: sha256(bytes) };
  });
  return { p, continuation: { schema: 'td613.loom.first-receiver-continuation/v0.1', authorization_record: 'SYNTHETIC_LOCAL_TEST_ONLY',
    prior_reserved_cost_nanos: '542160000', predecessor_policy_path, predecessor_policy_sha256: sha256(canonicalJson(old)), completed_prefix } };
}
test('a continuation preserves the two complete trials, starts at the failed third trial, and remains under the aggregate $10 cap', () => {
  const root = mkdtempSync(join(tmpdir(), 'td613-continuation-'));
  try {
    const { p, continuation } = continuationFixture(root), plan = continuationCallPlan(p, manifest, continuation);
    assert.equal(plan.length, 52); assert.equal(plan[0].trial_id, 'FIRST_CONFIGURED_RECEIVER-R01-3');
    assert.equal(plan[0].turn_index, 0); assert.equal(plan.at(-1).trial_id, 'FIRST_CONFIGURED_RECEIVER-R12-3');
    p.binding.limits.max_cost_usd = 9.457840001; assert.throws(() => continuationCallPlan(p, manifest, continuation), /AGGREGATE_BUDGET/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('a continuation rejects changed capture bytes, skipped trials, changed decoding and partial multi-turn carryover', () => {
  for (const mutation of ['bytes', 'skip', 'decoding', 'partial']) {
    const root = mkdtempSync(join(tmpdir(), 'td613-continuation-reject-'));
    try {
      const { p, continuation } = continuationFixture(root, mutation === 'partial' ? 4 : 2);
      if (mutation === 'bytes') writeFileSync(continuation.completed_prefix[0].capture_path, '{}');
      if (mutation === 'skip') continuation.completed_prefix.reverse();
      if (mutation === 'decoding') p.binding.generation_parameters.thinking_level = 'low';
      assert.throws(() => continuationCallPlan(p, manifest, continuation), /CONTINUATION_(PREFIX_CAPTURE|MEASUREMENT_CHANGED|PARTIAL_TRIAL)/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }
});
