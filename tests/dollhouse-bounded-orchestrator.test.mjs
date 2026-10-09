import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { runBoundedDollhouseOrchestrator } from '../app/engine/dollhouse-bounded-orchestrator.js';
import { listDollhouseAgents } from '../app/engine/dollhouse-agent-registry.js';
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/dollhouse/bounded-orchestrator-case.json', import.meta.url)));
const copy = value => structuredClone(value);

test('bounded runner consumes fifth jurisdiction separately without promoting the installed registry', () => {
  const input = fixture(), snapshot = copy(input), result = runBoundedDollhouseOrchestrator(input);
  assert.equal(result.role_coverage.filter(item => item.present).length, 5);
  assert.equal(listDollhouseAgents().length, 4);
  assert.equal(result.recommendation, 'PRESENT_TO_HUMAN'); assert.equal(result.decision, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(result.temporal_sidecar.agent, 'TEMPORAL_CUSTODIAN');
  assert.equal(result.evidence_posture.automatic_temporal_sidecar_consumed, true);
  assert.equal(result.evidence_posture.model_scheduler, false);
  assert.equal(result.evidence_posture.artifact_bytes_checked, false);
  for (const [key, value] of Object.entries(result.authority)) assert.equal(value, key === 'human_closure_required');
  assert.deepEqual(input, snapshot); assert.ok(Object.isFrozen(result.dossier.findings[0]));
});
test('four unanimous role findings cannot override the temporal whole-route veto', () => {
  const input = fixture(); input.temporal.phases.receiver.status = 'UNKNOWN';
  const result = runBoundedDollhouseOrchestrator(input);
  assert.equal(result.recommendation, 'HELD'); assert.equal(result.dossier.unresolved_finding_ids.length, 0);
  assert.ok(result.holds.some(item => item.code === 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION'));
  assert.deepEqual(result.dossier.findings, input.findings);
});
test('missing, malformed and contradictory temporal evidence cannot synthesize completion', () => {
  for (const temporal of [null, {}, { ...fixture().temporal, baseline_entries: null }, { ...fixture().temporal, ledger_entries: [] }]) {
    const result = runBoundedDollhouseOrchestrator({ ...fixture(), temporal });
    assert.equal(result.recommendation, 'HELD'); assert.equal(result.authority.execute, false);
  }
  const input = fixture(); input.temporal.ledger_entries[0].authority = 'RETROACTIVE_NEW_AUTHORITY';
  assert.equal(runBoundedDollhouseOrchestrator(input).recommendation, 'HELD');
});
test('case, episode and source mismatches hold even with a locally passing temporal audit', () => {
  for (const [key, value] of [['case_id', 'another-case'], ['episode_id', 'another-episode'], ['source_revision', 'c'.repeat(40)]]) {
    const input = fixture(); input.temporal[key] = value;
    const result = runBoundedDollhouseOrchestrator(input);
    assert.equal(result.temporal_sidecar.verdict, 'PASS'); assert.equal(result.recommendation, 'HELD');
    assert.ok(result.holds.some(item => item.code === 'TEMPORAL_IDENTITY_MISMATCH'));
  }
});
test('role disagreement and incomplete coverage stay unresolved rather than becoming votes', () => {
  const input = fixture(); input.findings[1].verdict = 'HELD';
  const result = runBoundedDollhouseOrchestrator(input);
  assert.equal(result.recommendation, 'HELD'); assert.equal(result.dossier.disagreements.length, 1);
  assert.equal(result.dossier.disagreements[0].finding_ids.length, 4);
  assert.equal(result.evidence_posture.majority_vote, false); assert.equal(result.evidence_posture.global_score, null);
  const fewer = fixture(); fewer.findings.pop();
  assert.ok(runBoundedDollhouseOrchestrator(fewer).holds.some(item => item.code === 'ROLE_MISSING' && item.agent === 'FADT'));
});
test('caller evidence labels do not authenticate providers or grant action authority', () => {
  const input = fixture(); input.findings.forEach(item => { item.evidence_class = 'PROVIDER_RESPONSE'; });
  const result = runBoundedDollhouseOrchestrator(input);
  assert.equal(result.evidence_posture.provider_origin_authenticated, false);
  assert.equal(result.dossier.evidence_posture.reference_authentication, 'UNVERIFIED');
  assert.equal(result.decision, 'HUMAN_REVIEW_REQUIRED');
});
test('action-bearing, renamed-fifth-role and getter inputs reject without executing getters', () => {
  let reads = 0;
  const getter = fixture(); Object.defineProperty(getter, 'temporal', { enumerable: true, get() { reads++; return fixture().temporal; } });
  const action = { ...fixture(), execute: true };
  const renamed = fixture(); renamed.findings[0].agent = 'TEMPORAL_CUSTODIAN';
  for (const input of [getter, action, renamed]) assert.throws(() => runBoundedDollhouseOrchestrator(input), TypeError);
  assert.equal(reads, 0);
});
test('CLI binds its actual input bytes and separates review, HOLD and invalid input exit codes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'td613-bounded-'));
  const script = new URL('../scripts/run-dollhouse-bounded-orchestrator.mjs', import.meta.url);
  try {
    const path = join(dir, 'case.json'), input = fixture(), bytes = JSON.stringify(input);
    writeFileSync(path, bytes);
    const run = () => spawnSync(process.execPath, [script.pathname, path], { encoding: 'utf8' });
    const pass = run(); assert.equal(pass.status, 0);
    const receipt = JSON.parse(pass.stdout); assert.equal(receipt.input_sha256, createHash('sha256').update(bytes).digest('hex'));
    assert.equal(receipt.source_authentication, 'UNVERIFIED_DECLARATION');
    input.temporal.phases.return.status = 'HELD'; writeFileSync(path, JSON.stringify(input));
    assert.equal(run().status, 1);
    writeFileSync(path, '{}'); const invalid = run(); assert.equal(invalid.status, 2);
    assert.equal(JSON.parse(invalid.stderr).status, 'HELD_INVALID_INPUT');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
