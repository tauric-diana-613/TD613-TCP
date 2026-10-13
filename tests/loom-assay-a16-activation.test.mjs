import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSAY_RECOVERY_POLICY_SCHEMA, ASSAY_RECOVERY_PROGRAM, ASSAY_RECOVERY_RUN_IDS, ASSAY_ACTIVATION_RUN_IDS, validateAssayPolicy } from '../server/loom-assay-contract.js';

test('the historical a16 activation prefix and frozen program ceilings remain retained', () => {
  const base = 'portable-loom-first-receiver-20261009';
  const expected = Array.from({ length: 13 }, (_, i) => `${base}-a${i + 4}`);
  const config = JSON.parse(readFileSync(new URL('../server/loom-assay-run-config.json', import.meta.url)));
  assert.deepEqual(ASSAY_RECOVERY_RUN_IDS.slice(0, expected.length), expected);
  assert.deepEqual(config.run_ids.slice(0, expected.length), expected);
  assert.deepEqual(ASSAY_RECOVERY_PROGRAM.run_ids.slice(0, expected.length + 3), [base, `${base}-a2`, `${base}-a3`, ...expected]);
  assert.equal(ASSAY_RECOVERY_PROGRAM.max_calls, 80);
  assert.equal(ASSAY_RECOVERY_PROGRAM.max_cost_usd, 10);
});

test('a16 is accepted only with the current program; a18 and widened caps remain closed', () => {
  const policy = JSON.parse(readFileSync(new URL('../research/portable-loom-server-transport-20261009/POLICY.template.json', import.meta.url)));
  policy.schema = ASSAY_RECOVERY_POLICY_SCHEMA;
  policy.run_id = 'portable-loom-first-receiver-20261009-a16';
  policy.protocol_commit = policy.binding.protocol_commit = 'a'.repeat(40);
  policy.artifact_sha256 = 'b'.repeat(64);
  policy.expires_at = '2099-01-01T00:00:00Z';
  policy.program = structuredClone(ASSAY_RECOVERY_PROGRAM);
  policy.binding.limits.max_calls = 5;
  policy.binding.limits.max_cost_usd = 0.9036;
  policy.binding.limits.timeout_ms = 240000;
  validateAssayPolicy(policy);
  for (const mutate of [p => p.run_id = p.run_id.replace('a16', 'a18'), p => p.program.max_calls++, p => p.program.max_cost_usd++, p => p.program.run_ids.pop()]) {
    const changed = structuredClone(policy); mutate(changed);
    assert.throws(() => validateAssayPolicy(changed), /RECOVERY_PROGRAM_UNBOUND/);
  }
});

