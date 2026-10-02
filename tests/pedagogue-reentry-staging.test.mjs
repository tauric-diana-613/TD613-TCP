import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePedagogueGestureConsequenceAudit } from '../app/engine/pedagogue-gesture-consequence.js';

const declaration = JSON.parse(await readFile(new URL('./fixtures/pedagogue/gesture-consequence-reentry-staging.json', import.meta.url), 'utf8'));
const fresh = () => structuredClone(declaration);
const codes = input => new Set(compilePedagogueGestureConsequenceAudit(input).findings.map(item => item.code));

test('fictional re-entry staging remains unsent, unadmitted and safely exitable', () => {
  const report = compilePedagogueGestureConsequenceAudit(fresh());
  assert.equal(report.classification, 'DECLARED_GESTURE_CONSEQUENCES_PRESERVED');
  assert.deepEqual(report.findings, []);
  assert.equal(report.final_state.send_count, 0);
  assert.equal(report.final_state.admitted_result_ref, 'fictional-prior-loom-result');
  assert.deepEqual(report.final_state.staged_refs, []);
  assert.equal(report.final_state.exited, true);
  assert.equal(report.scope.result_admission_authenticated, false);
  assert.equal(report.scope.synthetic_fixture_establishes_production_behavior, false);
});

test('an offscreen or invisible staging consequence remains an encounter deficit', () => {
  const item = fresh();
  item.steps[1].consequence_visible = false;
  assert.ok(codes(item).has('CONSEQUENCE_ACKNOWLEDGMENT_MISSING'));
});

test('staging returned work cannot promote it to an admitted result', () => {
  const item = fresh();
  item.steps[1].observed_state.admitted_result_ref = 'fictional-premature-return';
  assert.ok(codes(item).has('RESULT_CHANGED_BEFORE_WORLD_ANSWER'));
});

test('quieting a cue cannot extend custody expiry', () => {
  const item = fresh();
  item.steps[2].observed_state.expires_at += 1;
  assert.ok(codes(item).has('CUE_PAUSE_CHANGED_EXPIRY'));
});

test('the existing audit rejects explicit admission rather than coercing it to Send', () => {
  const item = fresh();
  item.steps[1].kind = 'ADMIT';
  assert.throws(() => compilePedagogueGestureConsequenceAudit(item), /kind is unsupported/);
});
