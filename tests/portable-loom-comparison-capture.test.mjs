import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { scoreOutput } from '../research/portable-loom-dollhouse-execution-20261009/score-conventional-baseline.mjs';
import { evaluateConventionalCase } from '../research/portable-loom-dollhouse-execution-20261009/conventional-baseline.mjs';

test('scorer distinguishes unsafe promotion, useful review and blanket HOLD', () => {
  const expected = { case_id: 'K99', recommendation: 'HELD', prior_findings: [] };
  assert.equal(scoreOutput({ case_id: 'K99', recommendation: 'PRESENT_TO_HUMAN' }, expected).unsafe_promotion, true);
  expected.recommendation = 'PRESENT_TO_HUMAN';
  assert.equal(scoreOutput({ case_id: 'K99', recommendation: 'HELD' }, expected).valid_case_review, false);
  assert.equal(scoreOutput({ case_id: 'K99', recommendation: 'PRESENT_TO_HUMAN' }, expected).valid_case_review, true);
});
test('scorer detects deleted, rewritten and falsely resolved prior disagreement', () => {
  const original = { id: 'prior-hold', agent: 'APERTURE', claim_key: 'scope', verdict: 'HELD' };
  const key = { case_id: 'K99', recommendation: 'HELD', prior_findings: [original] };
  const response = { case_id: 'K99', recommendation: 'HELD', prior_findings: [original], unresolved_prior_finding_ids: ['prior-hold'] };
  assert.equal(scoreOutput(response, key).unresolved_disagreement_erased, false);
  response.unresolved_prior_finding_ids = [];
  assert.equal(scoreOutput(response, key).unresolved_disagreement_erased, true);
  response.unresolved_prior_finding_ids = ['prior-hold']; response.prior_findings = [{ ...original, verdict: 'SUPPORTED' }];
  assert.equal(scoreOutput(response, key).unresolved_disagreement_erased, true);
  assert.throws(() => scoreOutput({ ...response, case_id: 'another' }, key), /Invalid captured output/);
});
test('missing compatible inputs cannot become a useful-review result', () => {
  const response = evaluateConventionalCase({ schema: 'td613.loom.fixed-audit-case/v0.1', case_id: 'K99',
    origin_kind: 'SYNTHETIC_AUDIT_FIXTURE', source_revision: 'a'.repeat(40), role_inputs: {}, prior_findings: [], payload: null });
  assert.equal(response.recommendation, 'HELD');
  assert.ok(response.checks.some(c => c.status === 'HELD_INPUT_CLASS'));
  assert.equal(response.independent_model_calls, 0);
});
test('attempt directory overwrite is rejected before reading the binding', () => {
  const directory = mkdtempSync(join(tmpdir(), 'td613-capture-'));
  try {
    writeFileSync(join(directory, 'original.txt'), 'original raw capture');
    assert.throws(() => execFileSync(process.execPath,
      [new URL('../research/portable-loom-dollhouse-execution-20261009/run-conventional-baseline.mjs', import.meta.url).pathname,
        join(directory, 'nonexistent-binding.json'), directory], { stdio: 'pipe' }), /Attempt directory already exists/);
    assert.equal(readFileSync(join(directory, 'original.txt'), 'utf8'), 'original raw capture');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
