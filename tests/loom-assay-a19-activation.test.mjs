import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSAY_A18_PROGRAM, ASSAY_A19_PROGRAM, ASSAY_ACTIVATION_RUN_IDS, ASSAY_RECOVERY_POLICY_SCHEMA, validateAssayPolicy, requireTrialFamily } from '../server/loom-assay-contract.js';

test('a19 alone admits R09-1 turns 0 and 1 under the operator-authorized 88-call cap', () => {
  const config = JSON.parse(readFileSync(new URL('../server/loom-assay-run-config.json', import.meta.url)));
  assert.deepEqual(config.run_ids, ASSAY_ACTIVATION_RUN_IDS);
  assert.equal(ASSAY_A18_PROGRAM.max_calls, 82);
  assert.equal(ASSAY_A18_PROGRAM.max_cost_usd, 10);
  assert.equal(ASSAY_A19_PROGRAM.max_calls, 88);
  assert.equal(ASSAY_A19_PROGRAM.max_cost_usd, 10);
  assert.deepEqual(ASSAY_A19_PROGRAM.run_ids.slice(0, -1), ASSAY_A18_PROGRAM.run_ids);
  const p = JSON.parse(readFileSync(new URL('../research/portable-loom-server-transport-20261009/POLICY.template.json', import.meta.url)));
  Object.assign(p, { schema: ASSAY_RECOVERY_POLICY_SCHEMA, run_id: ASSAY_A19_PROGRAM.run_ids.at(-1), protocol_commit: 'a'.repeat(40), artifact_sha256: 'b'.repeat(64), expires_at: '2099-01-01T00:00:00Z', program: structuredClone(ASSAY_A19_PROGRAM) });
  p.binding.protocol_commit = p.protocol_commit;
  Object.assign(p.binding.limits, { max_calls: 2, max_cost_usd: 0.3, timeout_ms: 240000 });
  validateAssayPolicy(p);
  for (const turn_index of [0, 1]) requireTrialFamily(p, {trial_id:'FIRST_CONFIGURED_RECEIVER-R09-1',case_id:'R09',role:'RECEIVER',turn_index});
  for (const mutate of [x=>x.program.max_calls=89,x=>x.program.max_cost_usd=11,x=>x.program.run_ids.pop(),x=>x.run_id=x.run_id.replace('a19','a18')]) { const q=structuredClone(p);mutate(q);assert.throws(()=>validateAssayPolicy(q),/RECOVERY_PROGRAM_UNBOUND/); }
  for (const mutate of [x=>x.binding.limits.max_calls=3,x=>x.binding.limits.max_cost_usd=0.300000001]) { const q=structuredClone(p);mutate(q);assert.throws(()=>validateAssayPolicy(q),/A19_SCOPE_UNBOUND/); }
  for (const trial of [{trial_id:'FIRST_CONFIGURED_RECEIVER-R09-1',case_id:'R09',role:'RECEIVER',turn_index:2},{trial_id:'FIRST_CONFIGURED_RECEIVER-R06-2',case_id:'R06',role:'RECEIVER',turn_index:0}]) assert.throws(()=>requireTrialFamily(p,trial),/A19_TRIAL_UNBOUND/);
});
