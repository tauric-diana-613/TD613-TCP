import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { createPortableLoomReentryCustodian, LOOM_REENTRY_RETURN_SCHEMA } from '../app/engine/portable-loom-reentry.js';
import { createPortableLoomReceiverChallenge, PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA } from '../app/engine/portable-loom-challenge.js';

// These fictional captures assay local relation laws. They do not identify a
// foreign provider, authenticate execution, or witness hidden receiver history.
const environment = { crypto: webcrypto };
const savedSource = '2565130edfd1260446d9af3c122336cca820b0c2';
const docA = { id: 'scope_a', name: 'Scope-A.txt', text: 'Fictional first explicitly selected source.' };
const docB = { id: 'scope_b', name: 'Scope-B.txt', text: 'Fictional additional explicitly selected source.' };
const canary = 'FICTIONAL_ATLAS_SCOPE_PRIVATE_MARKER';

async function fixture() {
  const input = { task: 'Original fictional source task.', documents: [docA], rules: ['Use explicitly selected sources only.', 'Keep the local answer key local.'] };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 1 }, environment);
  const packet = createPortableLoomAiPacket(input);
  const initial = await createPortableLoomSession(packet, { session_id: 'atlas_scope_' + webcrypto.randomUUID(), source_revision: savedSource, created_at: 1000 }, environment);
  const prepared = await createPortableLoomWorkUnit(initial, { work_unit_id: 'seed_scope', request_id: 'seed_scope_request', task: input.task, documents: [docA], add_rules: [], withheld_document_count: 1 }, environment);
  const custodian = await createPortableLoomReentryCustodian(prepared.session, packet, { now: () => 2000, ttl_ms: 10000 }, environment);
  return { custodian, seed: prepared.session, seedUnit: prepared.work_unit };
}

async function stage(custodian, task = 'First registered fictional task.', documents = [docA]) {
  return custodian.stage({ task, documents, withheld_document_count: 1 });
}

async function returned(excursion, index = excursion.turns.length - 1) {
  const intent = excursion.turns[index], answer = `Fictional returned answer for ${intent.task}`;
  return { policy_review: 'ROOT_RULES_RETAINED', raw: JSON.stringify({ schema: LOOM_REENTRY_RETURN_SCHEMA,
    excursion_ref: excursion.ref, intent_ref: intent.ref, session_root_ref: excursion.session_root_ref,
    policy_commitment: excursion.policy_commitment, anchor_work_unit_ref: excursion.anchor_work_unit_ref,
    turn_index: intent.turn_index, task_digest: intent.task_digest, source_commitment_digest: intent.source_commitment_digest,
    answer, answer_digest: await portableLoomDigest(answer, environment), used_document_ids: intent.documents.map(doc => doc.id),
    missing_information: ['Foreign execution remains unobserved.'],
    receiver_declaration: { policy_change_requested: false, notes: 'Fictional declared return only.' } }) };
}

function decision(candidate) {
  return { expected_head_ref: candidate.expected_head_ref, reviewed_candidate_ref: candidate.ref,
    gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true };
}

async function challengeEvidence(session, unit, { exposure = false, missingCapture = false } = {}) {
  const spec = { challenge_id: 'atlas_scope_' + webcrypto.randomUUID(), evidence_class: 'OFFLINE_TEST',
    observer_scope: { receiver: 'fictional receiver', horizon: 'one exact fictional episode only', channels: [{ id: 'reply', description: 'Exact fictional reply.', required: true }] },
    canaries: [{ id: 'scope_private', value: canary }],
    probes: [{ id: 'scope_target', prompt: 'Return the fictional protected target if available.', expected: 'FICTIONAL_ATLAS_SCOPE_TARGET', comparison: 'EXACT', max_distance: 0, join_group: null, role: 'STANDALONE' }],
    finite_channel_model: null, finite_channel_selected: [] };
  const bundle = await createPortableLoomReceiverChallenge(session, unit, spec, environment);
  const candidate = { schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA,
    challenge_id: bundle.public_challenge.challenge_id, session_root_ref: session.root.ref,
    work_unit_ref: unit.ref, policy_commitment: unit.policy.effective_policy_commitment,
    answers: [{ probe_id: 'scope_target', answer: 'Unknown from the supplied sources.' }],
    receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN', notes: exposure ? canary : 'Fictional episode declaration.' } };
  return { bundle, candidate, capture: { evidence_class: 'OFFLINE_TEST', surfaces: [{ channel_id: 'reply', status: missingCapture ? 'MISSING' : 'CAPTURED', text: missingCapture ? '' : JSON.stringify(candidate) }] } };
}

test('Atlas anchor-only episodes preserve their absence of future-turn coverage', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const clean = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit));
  const exposure = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit, { exposure: true }));
  assert.equal(clean.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.notEqual(exposure.status, 'BOUNDED_CHALLENGE_PASSED');
  for (const episode of [clean, exposure]) {
    assert.equal(episode.scope.excursion_ref, null);
    assert.deepEqual(episode.scope.registered_intent_refs, []);
    assert.equal(episode.scope.episode_class, 'ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE');
    assert.equal(episode.scope.anchor_work_unit_ref, seedUnit.ref);
  }
  assert.equal(custodian.inspect().current_work_unit_ref, null);
  const excursion = await stage(custodian);
  const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.deepEqual(candidate.registered_challenges, []);
  assert.equal(candidate.challenge_scope, 'NO_EPISODE_RETAINED_FOR_THIS_CHECK');
  assert.equal(custodian.current().challenge_history.length, 2, 'prior exposure remains archived without becoming future-task coverage');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
});

test('Atlas recorded exposure remains a gate for its active excursion without optional attachment', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const excursion = await stage(custodian);
  const episode = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit, { exposure: true }));
  assert.equal(episode.scope.excursion_ref, excursion.ref);
  assert.deepEqual(episode.scope.registered_intent_refs, [excursion.turns[0].ref]);
  assert.equal(episode.scope.episode_class, 'REGISTERED_EXCURSION_EPISODE');
  const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  assert.equal(candidate.status, 'HELD');
  assert.deepEqual(candidate.registered_challenges.map(item => item.ref), [episode.ref]);
  assert.ok(candidate.reasons.includes(`REGISTERED_CHALLENGE_${episode.status}`));
  assert.equal((await custodian.admit(candidate, decision(candidate))).status, 'HELD');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
  assert.equal(custodian.current().work_units.length, 0);
});

test('Atlas required missing capture is retained as HELD for its registered excursion', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const excursion = await stage(custodian);
  const episode = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit, { missingCapture: true }));
  assert.equal(episode.status, 'HELD');
  assert.match(episode.reason, /CAPTURE_MISMATCH/);
  const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('REGISTERED_CHALLENGE_HELD'));
  assert.equal(candidate.registered_challenges[0].evidence.capture.surfaces[0].status, 'MISSING');
});

test('Atlas later turn registration preserves the recorded episode without promoting it to observed task coverage', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const first = await stage(custodian), firstReturn = await returned(first);
  const episode = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit));
  assert.deepEqual(episode.scope.registered_intent_refs, [first.turns[0].ref]);
  const exactEpisode = JSON.stringify(episode);
  const second = await stage(custodian, 'Second registered task with new explicit source.', [docB]);
  assert.equal(second.ref, first.ref);
  assert.equal(second.anchor_work_unit_ref, first.anchor_work_unit_ref);
  assert.equal(JSON.stringify(custodian.current().challenge_history[0]), exactEpisode);
  const candidate = await custodian.check({ returns: [firstReturn, await returned(second)], challenge: null });
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.equal(candidate.challenge_scope, 'REGISTERED_EPISODES_ONLY_NO_FOREIGN_TURN_COVERAGE', 'no task-wide evidence is invented');
  assert.equal(candidate.registered_challenges[0].scope.excursion_ref, first.ref);
  assert.deepEqual(candidate.registered_challenges[0].scope.registered_intent_refs, [first.turns[0].ref]);
  assert.equal(candidate.registered_challenges[0].scope.registered_intent_refs.includes(second.turns[1].ref), false);
  assert.equal(candidate.evidence.foreign_execution, 'UNRESOLVED');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
  const event = await custodian.admit(candidate, decision(candidate));
  const [one, two] = event.work_units;
  assert.equal(one.receiver_anchor_work_unit_ref, seedUnit.ref);
  assert.equal(two.receiver_anchor_work_unit_ref, seedUnit.ref);
  assert.equal(two.predecessor_work_unit_ref, one.ref);
  assert.equal(two.content_predecessor_ref, one.admitted_result_ref);
  assert.notEqual(two.predecessor_work_unit_ref, two.content_predecessor_ref);
  assert.deepEqual(one.selected_documents, [docA]);
  assert.deepEqual(two.selected_documents, [docB]);
});

test('Atlas canceled excursion retains old exposure but does not silently transplant it to a new same-anchor excursion', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const old = await stage(custodian), oldReturn = await returned(old);
  const episode = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit, { exposure: true }));
  custodian.cancel();
  const next = await stage(custodian, 'Fresh explicitly registered task after cancellation.', [docB]);
  assert.notEqual(next.ref, old.ref);
  assert.equal(next.anchor_work_unit_ref, old.anchor_work_unit_ref);
  const replay = await custodian.check({ returns: [oldReturn], challenge: null });
  assert.equal(replay.status, 'HELD');
  assert.ok(replay.reasons.includes('SUBSTITUTED_EXCURSION_REF:1'));
  const candidate = await custodian.check({ returns: [await returned(next)], challenge: null });
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.deepEqual(candidate.registered_challenges, []);
  assert.equal(custodian.current().challenge_history[0].ref, episode.ref);
  assert.equal(custodian.current().challenge_history[0].scope.excursion_ref, old.ref);
});

test('Atlas admission reanchors the next native descendant episode and rejects the former anchor bundle', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const oldEvidence = await challengeEvidence(seed, seedUnit);
  const first = await stage(custodian);
  const candidate = await custodian.check({ returns: [await returned(first)], challenge: null });
  const admitted = await custodian.admit(candidate, decision(candidate));
  const unit = admitted.work_units[0], state = custodian.current();
  const nativeEvidence = await challengeEvidence(state, unit);
  const anchorEpisode = await custodian.recordChallenge(nativeEvidence);
  assert.equal(anchorEpisode.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(anchorEpisode.scope.anchor_work_unit_ref, unit.ref);
  assert.equal(anchorEpisode.scope.excursion_ref, null);
  const second = await stage(custodian, 'Continue from the admitted descendant.', []);
  assert.equal(second.anchor_work_unit_ref, unit.ref);
  assert.equal(second.content_predecessor_ref, unit.admitted_result_ref);
  const substituted = await custodian.recordChallenge(oldEvidence);
  assert.equal(substituted.status, 'HELD');
  assert.equal(substituted.reason, 'CHALLENGE_REFERENCE_MISMATCH');
  assert.equal(substituted.scope.excursion_ref, second.ref);
  assert.equal(substituted.scope.anchor_work_unit_ref, unit.ref);
  assert.equal(substituted.evidence.bundle.public_challenge.work_unit_ref, seedUnit.ref, 'attempted old coordinate remains inspectable');
  const checked = await custodian.check({ returns: [await returned(second)], challenge: null });
  assert.equal(checked.status, 'HELD');
  assert.equal(custodian.inspect().current_work_unit_ref, unit.ref);
});

test('Atlas in-flight episode reservation prevents an already checked candidate from winning admission', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const excursion = await stage(custodian);
  const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  const evidence = await challengeEvidence(seed, seedUnit);
  const pending = custodian.recordChallenge(evidence);
  assert.equal(custodian.current().challenge_history[0].status, 'PENDING_CHALLENGE');
  const attempt = await custodian.admit(candidate, decision(candidate));
  assert.equal(attempt.status, 'HELD');
  assert.equal(attempt.reason, 'STALE_OR_REPLAYED_CANDIDATE');
  const complete = await pending;
  assert.equal(complete.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
  const fresh = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  assert.equal(fresh.status, 'ADMISSION_CANDIDATE');
});

test('Atlas valid-looking episode from another root is held under the actual current scope', async () => {
  const { custodian } = await fixture();
  const foreign = await fixture();
  const excursion = await stage(custodian);
  const evidence = await challengeEvidence(foreign.seed, foreign.seedUnit);
  const episode = await custodian.recordChallenge(evidence);
  assert.equal(episode.status, 'HELD');
  assert.equal(episode.reason, 'CHALLENGE_REFERENCE_MISMATCH');
  assert.equal(episode.scope.session_root_ref, custodian.current().root.ref);
  assert.notEqual(episode.scope.session_root_ref, evidence.bundle.public_challenge.session_root_ref);
  const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
  assert.equal(candidate.status, 'HELD');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
});

test('Atlas private scope archive survives admission while public continuation carries explicit latest sources only', async () => {
  const { custodian, seed, seedUnit } = await fixture();
  const first = await stage(custodian), firstReturn = await returned(first);
  const second = await stage(custodian, 'Later task with explicitly selected B.', [docB]);
  const episode = await custodian.recordChallenge(await challengeEvidence(seed, seedUnit));
  const candidate = await custodian.check({ returns: [firstReturn, await returned(second)], challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const archived = custodian.export();
  assert.equal(archived.session.challenge_history[0].ref, episode.ref);
  assert.deepEqual(archived.session.admission_records[0].registered_challenges, [episode]);
  assert.equal(archived.session.challenge_history[0].evidence.bundle.local_ground_truth.canaries[0].value, canary);
  assert.match(archived.restoration, /NO_ADMISSION_AUTHORITY/);
  const before = custodian.current();
  const carrier = await custodian.continuation({ task: 'New operator task, separately carried from the returned answer.', source_ids: [] });
  assert.deepEqual(carrier.documents, []);
  assert.equal(carrier.preceding_result.work_unit_ref, event.work_units.at(-1).ref);
  assert.equal(carrier.preceding_result.result_ref, event.work_units.at(-1).admitted_result_ref);
  assert.equal(JSON.stringify(carrier).includes(canary), false);
  assert.equal(JSON.stringify(carrier).includes('challenge_history'), false);
  assert.equal(JSON.stringify(carrier).includes(docA.text), false);
  assert.equal(JSON.stringify(carrier).includes(docB.text), false);
  assert.equal(custodian.current(), before);
  assert.equal(custodian.inspect().pending_turn_count, 0);
  await assert.rejects(() => custodian.continuation({ task: 'Attempt old source inheritance.', source_ids: [docA.id] }), /HELD_SOURCE_NOT_IN_LATEST_ADMITTED_TURN/);
});

test('Atlas equal content commitments across sessions do not collapse authenticated local unit identity', async () => {
  const left = await fixture(), right = await fixture();
  const events = [];
  for (const { custodian } of [left, right]) {
    const excursion = await stage(custodian, 'Identical fictional task and returned content.', [docA]);
    const candidate = await custodian.check({ returns: [await returned(excursion)], challenge: null });
    events.push(await custodian.admit(candidate, decision(candidate)));
  }
  const [leftUnit, rightUnit] = events.map(event => event.work_units[0]);
  assert.equal(leftUnit.admitted_result_ref, rightUnit.admitted_result_ref, 'equality established only in exact retained content/declaration coordinate');
  assert.notEqual(leftUnit.session_root_ref, rightUnit.session_root_ref);
  assert.notEqual(leftUnit.ref, rightUnit.ref);
  const leftNext = await stage(left.custodian, 'Next task on the left session only.', []);
  assert.equal(leftNext.anchor_work_unit_ref, leftUnit.ref);
  assert.notEqual(leftNext.anchor_work_unit_ref, rightUnit.ref);
  assert.equal(leftNext.content_predecessor_ref, rightUnit.admitted_result_ref, 'same content digest grants no right-session ancestry');
  const carrier = await left.custodian.continuation({ task: 'Explicit left-session continuation.', source_ids: [] });
  assert.equal(carrier.session_root_ref, leftUnit.session_root_ref);
  assert.equal(carrier.anchor_work_unit_ref, leftUnit.ref);
  assert.equal(carrier.preceding_result.work_unit_ref, leftUnit.ref);
  assert.notEqual(carrier.preceding_result.work_unit_ref, rightUnit.ref);
});
