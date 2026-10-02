import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { createPortableLoomReentryCustodian, LOOM_REENTRY_RETURN_SCHEMA } from '../app/engine/portable-loom-reentry.js';
import { createPortableLoomReceiverChallenge, PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA } from '../app/engine/portable-loom-challenge.js';

// Finite synthetic engine witnesses. No provider response or browser observation.
const SOURCE = '2565130edfd1260446d9af3c122336cca820b0c2';
const normal = { crypto: webcrypto };
const clone = value => JSON.parse(JSON.stringify(value));

function gatedEnvironment() {
  let pending = null;
  const environment = { crypto: {
    randomUUID: () => webcrypto.randomUUID(),
    subtle: { async digest(...args) {
      if (pending) {
        const gate = pending; pending = null; gate.enter(); await gate.released;
      }
      return webcrypto.subtle.digest(...args);
    } }
  } };
  return { environment, pause() {
    let enter, release;
    const entered = new Promise(resolve => { enter = resolve; });
    const released = new Promise(resolve => { release = resolve; });
    pending = { enter, released };
    return { entered, release };
  } };
}

async function fixture() {
  const gate = gatedEnvironment();
  const input = { task: 'Fictional observation-boundary assay.',
    documents: [{ id: 'selected', name: 'Synthetic.md', text: 'Fictional selected source only.' }],
    rules: ['Use only deliberately selected source bodies.', 'Do not execute tools.'] };
  input.governance = await createLoomAiGovernance(input, {}, normal);
  const packet = createPortableLoomAiPacket(input);
  const session = await createPortableLoomSession(packet, {
    session_id: webcrypto.randomUUID(), source_revision: SOURCE, created_at: 1000
  }, normal);
  const prepared = await createPortableLoomWorkUnit(session, {
    work_unit_id: 'seed', request_id: 'seed_request', task: input.task,
    documents: input.documents, add_rules: [], withheld_document_count: 0
  }, normal);
  const custody = await createPortableLoomReentryCustodian(prepared.session, packet,
    { now: () => 1000, ttl_ms: 1000 }, gate.environment);
  return { ...gate, input, prepared, custody };
}

async function stage(f) {
  return f.custody.stage({ task: 'Proceed with the fictional selected support.',
    documents: f.input.documents, withheld_document_count: 0 });
}

async function checkInput(departure) {
  return { returns: await Promise.all(departure.turns.map(async intent => {
    const answer = 'A synthetic return, without any witnessed foreign execution.';
    const value = { schema: LOOM_REENTRY_RETURN_SCHEMA,
      excursion_ref: departure.ref, intent_ref: intent.ref,
      session_root_ref: departure.session_root_ref, policy_commitment: departure.policy_commitment,
      anchor_work_unit_ref: departure.anchor_work_unit_ref, turn_index: intent.turn_index,
      task_digest: intent.task_digest, source_commitment_digest: intent.source_commitment_digest,
      answer, answer_digest: await portableLoomDigest(answer, normal),
      used_document_ids: ['selected'], missing_information: [],
      receiver_declaration: { policy_change_requested: false, notes: 'Declared synthetic response only.' } };
    return { raw: JSON.stringify(value), policy_review: 'ROOT_RULES_RETAINED' };
  })), challenge: null };
}

async function evidence(f, answer = 'UNKNOWN', joined = false) {
  const probes = joined
    ? ['m1', 'm2', 'j1'].map((id, index) => ({ id, prompt: `Fictional protected-token ${id} assay.`,
      expected: 'SYNTHETIC_TARGET', comparison: 'EXACT', max_distance: 0, join_group: 'synthetic_join',
      role: index < 2 ? 'MARGINAL' : 'JOINED' }))
    : [{ id: 'p1', prompt: 'Fictional protected-token assay.', expected: 'SYNTHETIC_TARGET',
      comparison: 'EXACT', max_distance: 0, join_group: null, role: 'STANDALONE' }];
  const bundle = await createPortableLoomReceiverChallenge(f.prepared.session, f.prepared.work_unit, {
    challenge_id: webcrypto.randomUUID(), evidence_class: 'OFFLINE_TEST',
    observer_scope: { receiver: 'synthetic receiver', horizon: 'one synthetic captured reply',
      channels: [{ id: 'reply', description: 'Exact supplied synthetic reply.', required: true }] },
    canaries: [], probes,
    finite_channel_model: null, finite_channel_selected: []
  }, normal);
  const candidate = { schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA,
    challenge_id: bundle.public_challenge.challenge_id, session_root_ref: bundle.public_challenge.session_root_ref,
    work_unit_ref: bundle.public_challenge.work_unit_ref, policy_commitment: bundle.public_challenge.policy_commitment,
    answers: probes.map(probe => ({ probe_id: probe.id, answer: joined && probe.role === 'MARGINAL' ? 'UNKNOWN' : answer })),
    receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN',
      notes: 'Synthetic declaration. No provider execution was observed.' } };
  return { bundle, candidate, capture: { evidence_class: 'OFFLINE_TEST',
    surfaces: [{ channel_id: 'reply', status: 'CAPTURED', text: JSON.stringify(candidate) }] } };
}

const gesture = candidate => ({ expected_head_ref: candidate.expected_head_ref,
  reviewed_candidate_ref: candidate.ref, gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true });

test('known exposed excursion cannot be omitted from Check by passing challenge:null', async () => {
  const f = await fixture(), departure = await stage(f);
  const episode = await f.custody.recordChallenge(await evidence(f, 'SYNTHETIC_TARGET'));
  assert.equal(episode.status, 'OBSERVED_EXPOSURE');
  const candidate = await f.custody.check(await checkInput(departure));
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_OBSERVED_EXPOSURE'));
  assert.equal(candidate.registered_challenges[0].ref, episode.ref);
  assert.equal(f.custody.inspect().work_unit_count, 0);
});

test('later clean challenge cannot erase malformed HOLD or earlier exposure', async () => {
  const f = await fixture(), departure = await stage(f);
  const malformed = await f.custody.recordChallenge({ malformed_capture: 'Explicit malformed synthetic attempt.' });
  const exposed = await f.custody.recordChallenge(await evidence(f, 'SYNTHETIC_TARGET'));
  const clean = await f.custody.recordChallenge(await evidence(f));
  assert.deepEqual([malformed.status, exposed.status, clean.status], ['HELD', 'OBSERVED_EXPOSURE', 'BOUNDED_CHALLENGE_PASSED']);
  const candidate = await f.custody.check(await checkInput(departure));
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_HELD'));
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_OBSERVED_EXPOSURE'));
  assert.deepEqual(candidate.registered_challenges.map(item => item.ref), [malformed.ref, exposed.ref, clean.ref]);
  assert.equal(f.custody.current().challenge_history.length, 3);
});

test('anchor-only episode remains recorded but covers no later registered task', async () => {
  const f = await fixture();
  const exposed = await f.custody.recordChallenge(await evidence(f, 'SYNTHETIC_TARGET'));
  assert.equal(exposed.scope.excursion_ref, null);
  assert.equal(exposed.scope.episode_class, 'ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE');
  const departure = await stage(f), candidate = await f.custody.check(await checkInput(departure));
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.deepEqual(candidate.registered_challenges, []);
  assert.equal(f.custody.current().challenge_history[0].status, 'OBSERVED_EXPOSURE');
  assert.equal(candidate.evidence.foreign_execution, 'UNRESOLVED');
});

test('cancel retires applicability without deleting the earlier adverse episode', async () => {
  const f = await fixture(), first = await stage(f);
  const exposed = await f.custody.recordChallenge(await evidence(f, 'SYNTHETIC_TARGET'));
  f.custody.cancel();
  const second = await stage(f), candidate = await f.custody.check(await checkInput(second));
  assert.notEqual(first.ref, second.ref);
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.deepEqual(candidate.registered_challenges, []);
  assert.equal(f.custody.current().challenge_history[0].scope.excursion_ref, first.ref);
  assert.equal(f.custody.current().challenge_history[0].ref, exposed.ref);
});

test('clean registered evidence is private replay data and never authenticates foreign execution', async () => {
  const f = await fixture(), departure = await stage(f), raw = await evidence(f);
  const clean = await f.custody.recordChallenge(raw);
  const candidate = await f.custody.check(await checkInput(departure));
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.equal(candidate.registered_challenges[0].verification.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.deepEqual(candidate.registered_challenges[0].evidence, raw);
  assert.equal(candidate.evidence.foreign_origin, 'DECLARED_UNAUTHENTICATED');
  const admitted = await f.custody.admit(candidate, gesture(candidate));
  assert.equal(admitted.status, 'ADMITTED');
  assert.equal(admitted.foreign_execution_authenticated, false);
  assert.equal(f.custody.current().admission_records[0].registered_challenges[0].ref, clean.ref);
  const carrier = await f.custody.continuation({ task: 'Continue locally admitted synthetic content.', source_ids: [] });
  assert.equal('challenge_history' in carrier, false);
  assert.equal('admission_records' in carrier, false);
  assert.equal(JSON.stringify(carrier).includes('SYNTHETIC_TARGET'), false);
});

test('synchronous PENDING reservation invalidates an already checked admission capability', async () => {
  const f = await fixture(), departure = await stage(f), raw = await evidence(f, 'SYNTHETIC_TARGET');
  const candidate = await f.custody.check(await checkInput(departure));
  const gate = f.pause(), recording = f.custody.recordChallenge(raw);
  await gate.entered;
  assert.equal(f.custody.current().challenge_history[0].status, 'PENDING_CHALLENGE');
  const result = await f.custody.admit(candidate, gesture(candidate));
  assert.equal(result.status, 'HELD');
  assert.equal(result.reason, 'STALE_OR_REPLAYED_CANDIDATE');
  gate.release(); await recording;
  assert.equal(f.custody.inspect().work_unit_count, 0);
});

test('challenge reservation crosses in-flight admission and prevents its final append', async () => {
  const f = await fixture(), departure = await stage(f);
  const candidate = await f.custody.check(await checkInput(departure));
  const raw = await evidence(f, 'SYNTHETIC_TARGET'), gate = f.pause();
  const admitting = f.custody.admit(candidate, gesture(candidate));
  await gate.entered;
  await f.custody.recordChallenge(raw);
  gate.release();
  const result = await admitting;
  assert.equal(result.status, 'HELD');
  assert.equal(result.reason, 'HEAD_COMPARE_AND_SWAP_FAILED');
  assert.equal(f.custody.inspect().work_unit_count, 0);
});

test('Check performed during PENDING challenge cannot create an admissible candidate', async () => {
  const f = await fixture(), departure = await stage(f), raw = await evidence(f), input = await checkInput(departure);
  const gate = f.pause(), recording = f.custody.recordChallenge(raw);
  await gate.entered;
  const candidate = await f.custody.check(input);
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_PENDING_CHALLENGE'));
  assert.equal(candidate.registered_challenges[0].ref, null);
  gate.release(); await recording;
  const refreshed = await f.custody.check(input);
  assert.equal(refreshed.status, 'ADMISSION_CANDIDATE');
});

test('concurrent challenge completion retains both records rather than last-write replacement', async () => {
  const f = await fixture(); await stage(f);
  const adverse = await evidence(f, 'SYNTHETIC_TARGET'), clean = await evidence(f), gate = f.pause();
  const first = f.custody.recordChallenge(adverse); await gate.entered;
  const second = await f.custody.recordChallenge(clean);
  gate.release(); const completed = await first;
  assert.equal(second.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(completed.status, 'OBSERVED_EXPOSURE');
  assert.deepEqual(f.custody.current().challenge_history.map(item => item.status), ['OBSERVED_EXPOSURE', 'BOUNDED_CHALLENGE_PASSED']);
});

test('cancel during challenge qualification preserves its retired exact excursion scope', async () => {
  const f = await fixture(), first = await stage(f), raw = await evidence(f, 'SYNTHETIC_TARGET'), gate = f.pause();
  const recording = f.custody.recordChallenge(raw); await gate.entered;
  f.custody.cancel(); const second = await stage(f);
  gate.release(); const record = await recording;
  assert.equal(record.scope.excursion_ref, first.ref);
  assert.notEqual(record.scope.excursion_ref, second.ref);
  const candidate = await f.custody.check(await checkInput(second));
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.deepEqual(candidate.registered_challenges, []);
  assert.equal(f.custody.current().challenge_history[0].status, 'OBSERVED_EXPOSURE');
});

test('closing during challenge qualification cannot mutate closed custody after await', async () => {
  const f = await fixture(); await stage(f);
  const raw = await evidence(f), gate = f.pause(), recording = f.custody.recordChallenge(raw);
  await gate.entered;
  f.custody.close(); const closedState = f.custody.current();
  gate.release(); const returned = await recording;
  assert.equal(returned.status, 'HELD');
  assert.equal(returned.reason, 'CUSTODY_LANE_CLOSED_DURING_CHALLENGE');
  assert.equal(f.custody.current(), closedState);
  assert.equal(f.custody.inspect().status, 'CLOSED');
  assert.equal(f.custody.inspect().work_unit_count, 0);
});

test('challenge snapshot resists caller edits and rejects accessors without invoking them', async () => {
  const f = await fixture(); await stage(f);
  const raw = clone(await evidence(f)), gate = f.pause(), recording = f.custody.recordChallenge(raw);
  await gate.entered;
  raw.candidate.answers[0].answer = 'SYNTHETIC_TARGET';
  gate.release(); const record = await recording;
  assert.equal(record.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(record.evidence.candidate.answers[0].answer, 'UNKNOWN');
  let invoked = false;
  const hostile = Object.defineProperty({}, 'bundle', { enumerable: true, get() { invoked = true; return null; } });
  await assert.rejects(f.custody.recordChallenge(hostile), /accessor/);
  assert.equal(invoked, false);
  assert.equal(f.custody.current().challenge_history.length, 1);
});

test('clean literal and marginal probes cannot hide retained joined-only reconstruction exposure', async () => {
  const f = await fixture(), departure = await stage(f);
  const record = await f.custody.recordChallenge(await evidence(f, 'SYNTHETIC_TARGET', true));
  assert.equal(record.verification.literal_exclusion.status, 'FINITE_LITERAL_EXCLUSION_SUPPORTED');
  assert.deepEqual(record.verification.protected_reconstruction.probes.filter(probe => probe.role === 'MARGINAL').map(probe => probe.recovered), [false, false]);
  assert.equal(record.verification.protected_reconstruction.joining[0].classification, 'JOINING_EXPOSURE_OBSERVED');
  const candidate = await f.custody.check(await checkInput(departure));
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_OBSERVED_EXPOSURE'));
  assert.ok(candidate.claim_ceiling.includes('JOINED_EPISODE_CLASSIFICATION != GOLDEN_EGG_J'));
});

test('capture intent snapshot does not retroactively cover another task registered later', async () => {
  const f = await fixture(), first = await stage(f);
  const clean = await f.custody.recordChallenge(await evidence(f));
  const second = await stage(f), candidate = await f.custody.check(await checkInput(second));
  assert.equal(second.ref, first.ref);
  assert.deepEqual(clean.scope.registered_intent_refs, [first.turns[0].ref]);
  assert.equal(second.turns.length, 2);
  assert.deepEqual(candidate.registered_challenges[0].scope.registered_intent_refs, [first.turns[0].ref]);
  assert.equal(candidate.challenge_scope, 'REGISTERED_EPISODES_ONLY_NO_FOREIGN_TURN_COVERAGE');
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.equal(candidate.evidence.foreign_execution, 'UNRESOLVED');
});
