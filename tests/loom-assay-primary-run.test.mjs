import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { primaryCallPlan, runFirstReceiver } from '../research/portable-loom-assay-activation-20261009/run-first-receiver.mjs';
import { loadServerManifest } from '../research/portable-loom-server-transport-20261009/server-client.mjs';
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
