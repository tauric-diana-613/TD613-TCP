import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { projectLoomRequestField } from '../app/dome-world/holonomy-loom/ai-request-field.js';
const answer = JSON.parse(fs.readFileSync(new URL('../docs/research/receipts/2026-09-10-loom-live-receiver/receiver-answer.json', import.meta.url), 'utf8'));
const event = () => ({ phase: 'completed', shared: 3, local: 1, selected_document_ids: ['requirements', 'offer', 'comparison'], used_document_ids: answer.used_document_ids, missing_information: answer.missing_information });
test('receiver answer keeps three source strands, one local pocket and six model-reported gaps', () => {
  const field = projectLoomRequestField(event());
  assert.equal(field.outgoing.strands.length, 3); assert.equal(field.retained.pockets.length, 1);
  assert.equal(field.returning.gaps.length, 6); assert.equal((field.returning.path.match(/M/g) || []).length, 7);
  assert.ok(field.outgoing.strands.every(strand => strand.source_reference === 'MODEL_REPORTED'));
  assert.ok(field.returning.gaps.every(gap => gap.evidence === 'MODEL_REPORTED_MISSING_INFORMATION'));
  assert.equal(field.measurement_of_hidden_state, false);
});
test('static/rest frame retains every distinction without animation; zero missingness erases only gap marks', () => {
  assert.deepEqual(projectLoomRequestField(event(), 0), projectLoomRequestField(event(), 1));
  const complete = projectLoomRequestField({ ...event(), missing_information: [] });
  assert.equal(complete.returning.gaps.length, 0); assert.equal(complete.outgoing.strands.length, 3);
  assert.equal(complete.returning.visible, true); assert.equal(complete.retained.pockets.length, 1);
});
test('prepared/pending cannot draw a received response; failure keeps a known return only when observed', () => {
  for (const phase of ['prepared', 'checking', 'pending']) {
    const field = projectLoomRequestField({ phase, shared: 3, local: 1 });
    assert.equal(field.returning.visible, false); assert.equal(field.cause.source_references, null);
  }
  const failed = projectLoomRequestField({ phase: 'held', shared: 3, local: 1 });
  assert.equal(failed.gate.blocked, true); assert.equal(failed.returning.visible, false);
  assert.equal(projectLoomRequestField({ ...event(), phase: 'held', response_received: true }).returning.visible, true);
});
test('bounded renderer rejects unselected/duplicate references and invalid geometry inputs', () => {
  assert.throws(() => projectLoomRequestField({ ...event(), used_document_ids: ['private-ledger'] }));
  assert.throws(() => projectLoomRequestField({ ...event(), used_document_ids: ['offer', 'offer'] }));
  assert.throws(() => projectLoomRequestField({ ...event(), shared: 9 }));
  assert.throws(() => projectLoomRequestField(event(), NaN));
  assert.throws(() => projectLoomRequestField({ ...event(), missing_information: new Array(3) }));
  const many = projectLoomRequestField({ ...event(), missing_information: Array.from({ length: 32 }, (_, i) => `Gap ${i}`) });
  assert.equal(many.returning.gaps.length, 8); assert.equal(many.returning.additional_gap_count, 24);
});
