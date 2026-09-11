import test from 'node:test';
import assert from 'node:assert/strict';
import { projectLivingRoomState } from '../app/dome-world/holonomy-loom/living-room-state.js';

const packet = (phase = 'prepared', extra = {}) => ({
  phase, shared: 2, local: 1, selected_document_ids: ['brief', 'data'],
  scene: { rules_count: 3, documents: [
    { id: 'brief', name: 'Project brief.txt', text: 'Payload must never enter the projection', share: true },
    { id: 'data', name: 'Source notes.txt', share: true },
    { id: 'private', name: 'IDENTITY_CANARY.txt', text: 'RAW_PRIVATE_CANARY', share: false }
  ] }, ...extra
});

test('a local packet becomes one bounded outgoing manifest while private material stays absent', () => {
  const result = projectLivingRoomState(packet());
  assert.equal(result.selectedCount, 2); assert.equal(result.localCount, 1); assert.equal(result.rulesCount, 3);
  assert.deepEqual(result.documents.map(doc => doc.name), ['Project brief.txt', 'Source notes.txt']);
  assert.equal(JSON.stringify(result).includes('CANARY'), false);
  assert.equal(JSON.stringify(result).includes('Payload'), false);
  assert.equal(result.outgoingSubmitted, false); assert.equal(result.responseObserved, false);
  assert.ok(result.glyphs.some(g => g.glyph === 'cōl'));
  assert.equal(result.glyphs.some(g => g.glyph === '出'), false);
});

test('plain, auditor, reduced motion and replay preserve the same route evidence', () => {
  const event = packet('pending', { binding_verified: true, outbound_submitted: true, request_id: 'live-request' });
  const first = projectLivingRoomState(event, { progress: .2, motionTimeMs: 1500 });
  const later = projectLivingRoomState(event, { progress: 1, motionTimeMs: 32000 });
  const still = projectLivingRoomState(event, { progress: 1, motionTimeMs: 32000, reducedMotion: true });
  assert.deepEqual(first.control, later.control); assert.deepEqual(first.control, still.control);
  assert.notEqual(first.copy.plain.now, first.copy.auditor.now);
  assert.equal(first.motion.courierProgress, .2); assert.equal(later.motion.courierProgress, 1);
  assert.equal(first.responseObserved, false); assert.equal(first.provider.state, 'UNOBSERVED');
  assert.equal(first.control.providerActivity, 'UNKNOWN');
  assert.equal(still.motion.enabled, false); assert.equal(still.motion.waitingPhase, 0);
  assert.deepEqual(first, projectLivingRoomState(event, { progress: .2, motionTimeMs: 1500 }));
  assert.ok(Object.isFrozen(first.control));
});

test('a blocked attempt preserves whether submission and a return already happened', () => {
  const before = projectLivingRoomState(packet('held'));
  const submitted = projectLivingRoomState(packet('held', { outbound_submitted: true }));
  const returned = projectLivingRoomState(packet('held', { outbound_submitted: true, response_received: true }));
  assert.equal(before.outgoingSubmitted, false); assert.equal(submitted.outgoingSubmitted, true);
  assert.equal(submitted.responseObserved, false); assert.equal(returned.responseObserved, true);
  for (const result of [before, submitted, returned]) {
    assert.equal(result.control.releaseState, 'HELD'); assert.equal(result.motion.enabled, false);
    assert.equal(result.gate.blocked, true);
  }
  assert.match(submitted.copy.plain.why, /cannot pull it back/);
  assert.match(returned.copy.plain.why, /answer stays held/);
});

test('provider transport failure receipt does not masquerade as an AI answer return', () => {
  const result = projectLivingRoomState(packet('held', {
    outbound_submitted: true,
    response_received: true,
    provider_failure: {
      error: 'provider-request-failed',
      diagnostic: { schema: 'td613.loom.ai-task-diagnostic/v0.1', stage: 'provider-transport', code: 'PROVIDER_HTTP_ERROR' },
      observations: { model: 'gemini-3.8-flash', http_status: 503, provider_calls: 1 }
    },
    observations: { model: 'gemini-3.8-flash', http_status: 503, provider_calls: 1 }
  }));
  assert.equal(result.outgoingSubmitted, true);
  assert.equal(result.responseObserved, false);
  assert.equal(result.failureReceiptObserved, true);
  assert.equal(result.provider.state, 'PROVIDER_FAILURE_OBSERVED');
  assert.match(result.provider.label, /HTTP 503/);
  assert.match(result.copy.plain.now, /before an answer came back/);
  assert.match(result.copy.plain.why, /HTTP 503/);
  assert.match(result.copy.plain.next, /No answer or source references were admitted/);
  assert.equal(result.reportedSourceCount, null);
  assert.doesNotMatch(JSON.stringify(result), /Unknown source references reported/);
});

test('received, admitted and unreported missingness remain separate', () => {
  const received = projectLivingRoomState(packet('received'));
  assert.equal(received.control.releaseState, 'UNAVAILABLE'); assert.equal(received.missingCount, null);
  const result = projectLivingRoomState(packet('completed', { binding_verified: true,
    used_document_ids: ['brief'], missing_information: Array.from({ length: 12 }, (_, i) => `Unanswered ${i}`) }));
  assert.equal(result.control.releaseState, 'ADMITTED_FOR_HUMAN_REVIEW');
  assert.equal(result.reportedSourceCount, 1); assert.equal(result.missingCount, 12); assert.equal(result.additionalMissingCount, 4);
  assert.equal(result.documents[1].sourceReference, 'NOT_REFERENCED_BY_MODEL');
  assert.equal(result.motion.enabled, false); assert.equal(result.motion.returnProgress, 1);
  assert.equal(JSON.stringify(result).includes('Unanswered'), false);
  assert.equal(projectLivingRoomState(packet('completed', { missing_information: [] })).missingCount, 0);
});

test('display names truncate visibly without splitting Unicode scalars; mismatched manifest grants no identity', () => {
  const input = packet(); input.scene.documents[0].name = '𐐀'.repeat(70);
  input.scene.documents[1].id = 'different';
  const result = projectLivingRoomState(input);
  assert.equal(Array.from(result.documents[0].name).length, 60);
  assert.ok(result.documents[0].name.endsWith('…'));
  assert.equal(result.documents[1].name, 'Selected document 2');
  assert.equal(input.scene.documents[0].name.length, 140);
});


test('completed return may reveal once while admitted authority stays constant and reduced motion settles immediately', () => {
  const event = packet('completed', { presentation: { settling: true }, binding_verified: true });
  const moving = projectLivingRoomState(event, { progress: .4 });
  const settled = projectLivingRoomState(event, { progress: 1 });
  const reduced = projectLivingRoomState(event, { progress: .4, reducedMotion: true });
  const stopped = projectLivingRoomState(event, { progress: .4, rest: true });
  assert.equal(moving.settled, true);
  assert.equal(moving.control.releaseState, 'ADMITTED_FOR_HUMAN_REVIEW');
  assert.equal(moving.motion.enabled, true); assert.equal(moving.motion.returnProgress, .4);
  assert.equal(moving.glyphs.some(g => g.glyph === '𝄐'), false);
  for (const result of [settled, reduced, stopped]) {
    assert.deepEqual(result.control, moving.control);
    assert.equal(result.motion.enabled, false); assert.equal(result.motion.returnProgress, 1);
    assert.ok(result.glyphs.some(g => g.glyph === '𝄐'));
  }
});

test('an over-limit local rule draft keeps its real count for display before intake rejects it', () => {
  const input = packet(); input.scene.rules_count = 41;
  assert.equal(projectLivingRoomState(input).rulesCount, 41);
});
