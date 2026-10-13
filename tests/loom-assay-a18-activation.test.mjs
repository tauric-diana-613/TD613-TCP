import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSAY_A18_PROGRAM, ASSAY_RECOVERY_PROGRAM, ASSAY_RECOVERY_RUN_IDS, ASSAY_ACTIVATION_RUN_IDS, ASSAY_RECOVERY_POLICY_SCHEMA, validateAssayPolicy, requireTrialFamily } from '../server/loom-assay-contract.js';

test('a18 alone admits the full five-call queue and two additional historical-counted slots', () => {
  const config = JSON.parse(readFileSync(new URL('../server/loom-assay-run-config.json', import.meta.url)));
  assert.deepEqual(config.run_ids, ASSAY_ACTIVATION_RUN_IDS);
  assert.equal(ASSAY_RECOVERY_PROGRAM.max_calls, 80);
  assert.equal(ASSAY_A18_PROGRAM.max_calls, 82);
  assert.equal(ASSAY_A18_PROGRAM.max_cost_usd, 10);
  assert.deepEqual(ASSAY_A18_PROGRAM.run_ids.slice(0, -1), ASSAY_RECOVERY_PROGRAM.run_ids);
  const p = JSON.parse(readFileSync(new URL('../research/portable-loom-server-transport-20261009/POLICY.template.json', import.meta.url)));
  Object.assign(p, { schema: ASSAY_RECOVERY_POLICY_SCHEMA, run_id: ASSAY_A18_PROGRAM.run_ids.at(-1), protocol_commit: 'a'.repeat(40), artifact_sha256: 'b'.repeat(64), expires_at: '2099-01-01T00:00:00Z', program: structuredClone(ASSAY_A18_PROGRAM) });
  p.binding.protocol_commit = p.protocol_commit;
  Object.assign(p.binding.limits, { max_calls: 5, max_cost_usd: 0.9036, timeout_ms: 240000 });
  validateAssayPolicy(p);
  for (const [case_id, repetition, turns] of [['R06', 2, [0, 1, 2]], ['R09', 1, [0, 1]]]) {
    for (const turn_index of turns) requireTrialFamily(p, {trial_id: `FIRST_CONFIGURED_RECEIVER-${case_id}-${repetition}`,case_id,role:'RECEIVER',turn_index});
  }
  for (const mutate of [x=>x.program.max_calls=83,x=>x.program.max_cost_usd=11,x=>x.program.run_ids.shift(),x=>x.run_id=x.run_id.replace('a18','a16'),x=>x.run_id=x.run_id.replace('a18','a19')]) {
    const q=structuredClone(p);mutate(q);assert.throws(()=>validateAssayPolicy(q),/RECOVERY_PROGRAM_UNBOUND/);
  }
  for (const mutate of [x=>x.binding.limits.max_calls=6,x=>x.binding.limits.max_cost_usd=0.903600001]) {
    const q=structuredClone(p);mutate(q);assert.throws(()=>validateAssayPolicy(q),/A18_SCOPE_UNBOUND/);
  }
  for (const trial of [{trial_id:'FIRST_CONFIGURED_RECEIVER-R02-1',case_id:'R02',role:'RECEIVER',turn_index:0},{trial_id:'FIRST_CONFIGURED_RECEIVER-R09-1',case_id:'R09',role:'RECEIVER',turn_index:2}]) assert.throws(()=>requireTrialFamily(p,trial),/A18_TRIAL_UNBOUND/);
});
