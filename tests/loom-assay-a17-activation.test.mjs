import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSAY_RECOVERY_POLICY_SCHEMA, ASSAY_RECOVERY_PROGRAM, ASSAY_RECOVERY_RUN_IDS, validateAssayPolicy, requireTrialFamily } from '../server/loom-assay-contract.js';

test('a17 admits exactly R06-2 with three calls inside unchanged program caps', () => {
  const run_id = 'portable-loom-first-receiver-20261009-a17';
  const config = JSON.parse(readFileSync(new URL('../server/loom-assay-run-config.json', import.meta.url)));
  assert.ok(ASSAY_RECOVERY_RUN_IDS.includes(run_id));
  assert.deepEqual(config.run_ids, ASSAY_RECOVERY_RUN_IDS);
  assert.equal(ASSAY_RECOVERY_PROGRAM.max_calls, 80);
  assert.equal(ASSAY_RECOVERY_PROGRAM.max_cost_usd, 10);
  const p = JSON.parse(readFileSync(new URL('../research/portable-loom-server-transport-20261009/POLICY.template.json', import.meta.url)));
  Object.assign(p, { schema: ASSAY_RECOVERY_POLICY_SCHEMA, run_id, protocol_commit: 'a'.repeat(40), artifact_sha256: 'b'.repeat(64), expires_at: '2099-01-01T00:00:00Z', program: structuredClone(ASSAY_RECOVERY_PROGRAM) });
  p.binding.protocol_commit = p.protocol_commit;
  Object.assign(p.binding.limits, { max_calls: 3, max_cost_usd: 0.54216, timeout_ms: 240000 });
  validateAssayPolicy(p);
  for (const turn_index of [0, 1, 2]) requireTrialFamily(p, { trial_id: 'FIRST_CONFIGURED_RECEIVER-R06-2', case_id: 'R06', role: 'RECEIVER', turn_index });
  for (const mutate of [x => x.binding.limits.max_calls = 4, x => x.binding.limits.max_cost_usd = 0.542160001]) {
    const changed = structuredClone(p); mutate(changed);
    assert.throws(() => validateAssayPolicy(changed), /A17_SCOPE_UNBOUND/);
  }
  for (const trial of [
    { trial_id: 'FIRST_CONFIGURED_RECEIVER-R09-1', case_id: 'R09', role: 'RECEIVER', turn_index: 0 },
    { trial_id: 'FIRST_CONFIGURED_RECEIVER-R06-2', case_id: 'R06', role: 'RECEIVER', turn_index: 3 }
  ]) assert.throws(() => requireTrialFamily(p, trial), /A17_TRIAL_UNBOUND/);
  const unknown = structuredClone(p); unknown.run_id = unknown.run_id.replace('a17', 'a18');
  assert.throws(() => validateAssayPolicy(unknown), /RECOVERY_PROGRAM_UNBOUND/);
});
