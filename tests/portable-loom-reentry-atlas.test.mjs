import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, admitPortableLoomWorkUnitResult, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { createPortableLoomReentryCustodian, createPortableLoomReentryPrompt, LOOM_REENTRY_RETURN_SCHEMA } from '../app/engine/portable-loom-reentry.js';
import { createPortableLoomReceiverChallenge, verifyPortableLoomReceiverChallenge, auditPortableLoomChallengeWithDollhouse, PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA } from '../app/engine/portable-loom-challenge.js';

const environment = { crypto: webcrypto };
const sourceRevision = 'de0cbe3589f3f9055061370279d7e41b4ccb980a';
const docA = { id: 'aggregate_a', name: 'Aggregate-A.csv', text: 'FICTIONAL public cohort A: 20 completers.' };
const docB = { id: 'new_methods_b', name: 'New-methods-B.md', text: 'FICTIONAL new explicit method B: 28-day follow-up.' };
const clone = value => JSON.parse(JSON.stringify(value));

async function fixture({ admittedSeed = false } = {}) {
  const input = { task: 'Review the fictional aggregate source.', documents: [docA], rules: ['Use only explicitly supplied sources.', 'Keep local-only participants local.'] };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 1 }, environment);
  const packet = createPortableLoomAiPacket(input);
  const session = await createPortableLoomSession(packet, { session_id: 'atlas_reentry_' + webcrypto.randomUUID(), source_revision: sourceRevision, created_at: 1000 }, environment);
  const prepared = await createPortableLoomWorkUnit(session, { work_unit_id: 'seed_a', request_id: 'request_a', task: input.task, documents: input.documents, add_rules: [], withheld_document_count: 1 }, environment);
  let seed = prepared.session;
  if (admittedSeed) {
    const admission = await admitPortableLoomWorkUnitResult(seed, prepared.work_unit, { schema: 'td613.loom.ai-task-result/v0.1', request_id: 'request_a', status: 'completed', answer: 'Fictional origin result A.', used_document_ids: [docA.id], missing_information: [], suggested_next_step: 'Continue the registered route.' }, environment);
    assert.equal(admission.status, 'ADMITTED');
    seed = admission.session;
  }
  const custodian = await createPortableLoomReentryCustodian(seed, packet, { now: () => 2000, ttl_ms: 10000 }, environment);
  return { custodian, seed, packet };
}

async function returned(excursion, index = excursion.turns.length - 1, answer = `Fictional returned answer ${index + 1}.`, overrides = {}) {
  const turn = excursion.turns[index];
  const value = { schema: LOOM_REENTRY_RETURN_SCHEMA, excursion_ref: excursion.ref, intent_ref: turn.ref, session_root_ref: excursion.session_root_ref, policy_commitment: excursion.policy_commitment, anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: turn.turn_index, task_digest: turn.task_digest, source_commitment_digest: turn.source_commitment_digest, answer, answer_digest: await portableLoomDigest(answer, environment), used_document_ids: turn.documents.map(doc => doc.id), missing_information: [], receiver_declaration: { policy_change_requested: false, notes: 'Fictional receiver declaration; execution unobserved.' }, ...overrides };
  return { raw: JSON.stringify(value), policy_review: 'ROOT_RULES_RETAINED' };
}
function decision(candidate) { return { expected_head_ref: candidate.expected_head_ref, reviewed_candidate_ref: candidate.ref, gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true }; }
async function batchFixture(options) {
  const fixtureResult = await fixture(options);
  const first = await fixtureResult.custodian.stage({ task: 'Calculate fictional aggregate A.', documents: [docA], withheld_document_count: 1 });
  const firstReturn = await returned(first);
  const second = await fixtureResult.custodian.stage({ task: 'Review newly supplied fictional method B.', documents: [docB], withheld_document_count: 2 });
  const secondReturn = await returned(second);
  return { ...fixtureResult, first, second, returns: [firstReturn, secondReturn] };
}

// These are process-local custody controls over fictional captures. They cannot
// authenticate foreign execution, source use, global latest state or exteriority.
test('Atlas registration and checking preserve null admitted head and explicit preparation seed', async () => {
  const { custodian, seed, second, returns } = await batchFixture();
  const before = custodian.current();
  assert.equal(before.seed.class, 'VERIFIED_PREPARATION');
  assert.equal(before.seed.anchor_ref, seed.continuity.current_work_unit_ref);
  assert.equal(before.continuity.current_work_unit_ref, null);
  assert.equal(before.continuity.current_admitted_result_ref, null);
  assert.equal(before.work_units.length, 0);
  assert.equal(second.anchor_work_unit_ref, before.seed.anchor_ref);
  assert.equal(second.turns.length, 2);
  const checked = await custodian.check({ returns, challenge: null });
  assert.equal(checked.status, 'ADMISSION_CANDIDATE');
  assert.equal(custodian.current(), before, 'a check must not install new ancestry');
  assert.equal(custodian.inspect().current_work_unit_ref, null);
  assert.equal(custodian.inspect().pending_turn_count, 2);
});

test('Atlas batch distinguishes fixed foreign anchor from sequential local work/result predecessors', async () => {
  const { custodian, seed, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const admitted = await custodian.admit(candidate, decision(candidate));
  assert.equal(admitted.status, 'ADMITTED');
  assert.equal(admitted.work_units.length, 2);
  const [one, two] = admitted.work_units;
  assert.equal(one.predecessor_work_unit_ref, seed.continuity.current_work_unit_ref);
  assert.equal(one.content_predecessor_ref, null);
  assert.equal(two.predecessor_work_unit_ref, one.ref);
  assert.equal(two.content_predecessor_ref, one.admitted_result_ref);
  assert.notEqual(two.predecessor_work_unit_ref, two.content_predecessor_ref);
  for (const unit of admitted.work_units) {
    assert.equal(unit.receiver_anchor_work_unit_ref, seed.continuity.current_work_unit_ref);
    assert.equal(unit.admitted_result.foreign_origin_authenticated, false);
  }
  assert.equal(custodian.current().continuity.current_work_unit_ref, two.ref);
  assert.equal(custodian.current().continuity.current_admitted_result_ref, two.admitted_result_ref);
  assert.equal(custodian.current().continuity.work_unit_count, 2);
  assert.equal(custodian.current().route_history[1].local_parent_ref, one.ref);
  assert.equal(custodian.current().route_history[1].receiver_anchor_ref, seed.continuity.current_work_unit_ref);
});

test('Atlas previously admitted seed carries only its verified content predecessor into the new local chain', async () => {
  const { custodian, seed, returns } = await batchFixture({ admittedSeed: true });
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  assert.equal(event.status, 'ADMITTED');
  assert.equal(event.work_units[0].content_predecessor_ref, seed.continuity.current_admitted_result_ref);
  assert.notEqual(event.work_units[0].content_predecessor_ref, event.work_units[0].predecessor_work_unit_ref);
  assert.equal(event.work_units[1].content_predecessor_ref, event.work_units[0].admitted_result_ref);
});

test('Atlas each turn carries its own explicit newly supplied source commitments and task', async () => {
  const { custodian, first, second, returns } = await batchFixture();
  assert.equal(first.ref, second.ref, 'excursion departure identity stays fixed');
  assert.equal(second.turns[1].previous_intent_ref, first.turns[0].ref);
  assert.deepEqual(second.turns.map(turn => turn.documents.map(doc => doc.id)), [[docA.id], [docB.id]]);
  assert.notEqual(second.turns[0].source_commitment_digest, second.turns[1].source_commitment_digest);
  assert.equal(second.turns[1].selected_commitments[0].sha256, await portableLoomDigest(docB.text, environment));
  const prompt = createPortableLoomReentryPrompt(second);
  assert.ok(prompt.includes(docB.text));
  assert.equal(prompt.includes(docA.text), false, 'latest task source bodies are explicit rather than inherited');
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  assert.deepEqual(event.work_units.map(unit => unit.selected_commitments.map(doc => doc.id)), [[docA.id], [docB.id]]);
  assert.deepEqual(event.work_units.map(unit => unit.withheld_document_count), [1, 2]);
  assert.notEqual(event.work_units[0].task_digest, event.work_units[1].task_digest);
});

test('Atlas a bad second returned turn holds the entire batch without a partial ancestor', async () => {
  const { custodian, returns } = await batchFixture();
  const before = custodian.current();
  const badSecond = JSON.parse(returns[1].raw);
  badSecond.answer = 'Substituted answer without updating its binding.';
  const candidate = await custodian.check({ returns: [returns[0], { ...returns[1], raw: JSON.stringify(badSecond) }], challenge: null });
  assert.equal(candidate.status, 'HELD');
  assert.ok(candidate.reasons.includes('ANSWER_SUBSTITUTION:2'));
  const event = await custodian.admit(candidate, decision(candidate));
  assert.equal(event.status, 'HELD');
  assert.equal(event.local_ledger_advanced, false);
  assert.equal(custodian.current(), before);
  assert.equal(custodian.current().work_units.length, 0);
});

test('Atlas omitted or out-of-order returns remain held without mutation', async () => {
  const { custodian, returns } = await batchFixture();
  const before = custodian.current();
  const omitted = await custodian.check({ returns: [returns[1]], challenge: null });
  assert.equal(omitted.status, 'HELD');
  assert.ok(omitted.reasons.includes('INCOMPLETE_REGISTERED_TURN_RANGE'));
  const swapped = await custodian.check({ returns: [...returns].reverse(), challenge: null });
  assert.equal(swapped.status, 'HELD');
  assert.ok(swapped.reasons.includes('SUBSTITUTED_TURN_INDEX:1'));
  assert.ok(swapped.reasons.includes('SUBSTITUTED_INTENT_REF:2'));
  assert.equal(custodian.current(), before);
});

test('Atlas duplicate admission, copied candidate and old departure replay cannot append descendants', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const copied = await custodian.admit(clone(candidate), decision(candidate));
  assert.equal(copied.status, 'HELD');
  assert.equal(copied.reason, 'UNISSUED_OR_INSUFFICIENT_CANDIDATE');
  const admitted = await custodian.admit(candidate, decision(candidate));
  assert.equal(admitted.status, 'ADMITTED');
  const after = custodian.current();
  const replay = await custodian.admit(candidate, decision(candidate));
  assert.equal(replay.status, 'HELD');
  const noExcursion = await custodian.check({ returns, challenge: null });
  assert.equal(noExcursion.status, 'HELD');
  assert.ok(noExcursion.reasons.includes('NO_REGISTERED_EXCURSION'));
  assert.equal(custodian.current(), after);
  assert.equal(after.work_units.length, 2);
});

test('Atlas staging another turn invalidates an earlier candidate until the whole updated range is checked', async () => {
  const { custodian } = await fixture();
  const first = await custodian.stage({ task: 'First registered task.', documents: [docA], withheld_document_count: 1 });
  const firstReturn = await returned(first);
  const candidate = await custodian.check({ returns: [firstReturn], challenge: null });
  const second = await custodian.stage({ task: 'Second registered task.', documents: [docB], withheld_document_count: 1 });
  const event = await custodian.admit(candidate, decision(candidate));
  assert.equal(event.status, 'HELD');
  assert.equal(event.reason, 'STALE_OR_REPLAYED_CANDIDATE');
  assert.equal(custodian.current().continuity.current_work_unit_ref, null);
  const fresh = await custodian.check({ returns: [firstReturn, await returned(second)], challenge: null });
  assert.equal(fresh.status, 'ADMISSION_CANDIDATE');
  assert.equal((await custodian.admit(fresh, decision(fresh))).work_units.length, 2);
});

test('Atlas next excursion reanchors at the admitted descendant and inherits no prior source body', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const last = event.work_units.at(-1);
  const next = await custodian.stage({ task: 'Continue without any newly selected document.', documents: [], withheld_document_count: 2 });
  assert.equal(next.anchor_work_unit_ref, last.ref);
  assert.equal(next.content_predecessor_ref, last.admitted_result_ref);
  assert.equal(next.turns[0].turn_index, 1, 'local turn index restarts for the new explicit excursion');
  assert.deepEqual(next.turns[0].documents, []);
  assert.deepEqual(next.turns[0].selected_commitments, []);
  assert.deepEqual(next.effective_rules, last.policy.effective_rules);
  const bad = await custodian.check({ returns: [await returned(next, 0, 'Claims a prior source.', { used_document_ids: [docB.id] })], challenge: null });
  assert.equal(bad.status, 'HELD');
  assert.ok(bad.reasons.includes('UNDECLARED_SOURCE:1'));
  const after = custodian.current();
  assert.equal(after.continuity.current_work_unit_ref, last.ref);
  const good = await custodian.check({ returns: [await returned(next)], challenge: null });
  const resumed = await custodian.admit(good, decision(good));
  assert.equal(resumed.status, 'ADMITTED');
  assert.equal(resumed.work_units[0].predecessor_work_unit_ref, last.ref);
  assert.equal(resumed.work_units[0].content_predecessor_ref, last.admitted_result_ref);
  assert.equal(custodian.current().continuity.work_unit_count, 3);
});

test('Atlas exported review record retains latest local result without granting parsed custody authority', async () => {
  const { custodian, packet, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const exported = custodian.export();
  assert.equal(exported.restoration, 'REVIEW_ONLY_UNAUTHENTICATED_NO_ADMISSION_AUTHORITY');
  assert.equal(exported.pending_excursion, null);
  assert.equal(exported.session.continuity.current_work_unit_ref, event.work_units.at(-1).ref);
  assert.equal(exported.session.work_units.at(-1).admitted_result.answer, JSON.parse(returns[1].raw).answer);
  await assert.rejects(() => createPortableLoomReentryCustodian(clone(exported.session), packet, {}, environment), /HELD_IMPORTED_CUSTODY/);
});

function challengeSpec() {
  return { challenge_id: 'atlas_admitted_descendant', evidence_class: 'OFFLINE_TEST', observer_scope: { receiver: 'fictional companion', horizon: 'one exact fictional captured response', channels: [{ id: 'reply', description: 'Fictional captured reply.', required: true }] }, canaries: [{ id: 'local_marker', value: 'FICTIONAL_LOCAL_ONLY_MARKER' }], probes: [{ id: 'protected_target', prompt: 'Return the fictional protected target if known.', expected: 'FICTIONAL_PROTECTED_TARGET', comparison: 'EXACT', max_distance: 0, join_group: null, role: 'STANDALONE' }], finite_channel_model: null, finite_channel_selected: [] };
}

test('Atlas Challenge Receiver consumes native v0.2 admitted descendant without fake v0.1 wrapping', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const state = custodian.current(), unit = event.work_units.at(-1);
  const before = state.continuity.current_work_unit_ref;
  const bundle = await createPortableLoomReceiverChallenge(state, unit, challengeSpec(), environment);
  assert.equal(bundle.public_challenge.work_unit_ref, unit.ref);
  assert.equal(bundle.public_challenge.content_predecessor_ref, event.work_units[0].admitted_result_ref);
  const response = { schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA, challenge_id: bundle.public_challenge.challenge_id, session_root_ref: state.root.ref, work_unit_ref: unit.ref, policy_commitment: unit.policy.effective_policy_commitment, answers: [{ probe_id: 'protected_target', answer: 'Unknown from approved sources.' }], receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN', notes: 'Fictional declared episode only.' } };
  const verification = await verifyPortableLoomReceiverChallenge(bundle, response, { evidence_class: 'OFFLINE_TEST', surfaces: [{ channel_id: 'reply', status: 'CAPTURED', text: JSON.stringify(response) }] }, environment);
  assert.equal(verification.status, 'BOUNDED_CHALLENGE_PASSED');
  const dossier = await auditPortableLoomChallengeWithDollhouse(state, unit, bundle, verification, environment);
  assert.equal(dossier.subagent_coverage.find(item => item.id === 'dollhouse-portable-aia-roundtrip').status, 'HELD_INPUT_CLASS');
  assert.equal(custodian.current().continuity.current_work_unit_ref, before);
  assert.equal(verification.receiver_declaration.promoted_to_observed_fact, false);
  assert.equal(verification.hidden_host.retention, 'UNRESOLVED');
});

test('Atlas admitted evidence preserves selected source bodies and captured return with exact commitments', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  for (const [index, unit] of event.work_units.entries()) {
    assert.deepEqual(unit.selected_documents, [index === 0 ? docA : docB]);
    assert.equal(unit.selected_commitments[0].sha256, await portableLoomDigest(unit.selected_documents[0].text, environment));
    assert.equal(unit.captured_return, returns[index].raw);
    assert.equal(unit.capture_digest, await portableLoomDigest(unit.captured_return, environment));
    assert.equal(unit.receipt_digest, await portableLoomDigest(JSON.parse(unit.captured_return), environment));
    assert.equal(Object.isFrozen(unit.selected_documents[0]), true);
  }
  const record = custodian.export();
  assert.deepEqual(record.session.work_units.at(-1).selected_documents, [docB]);
  assert.equal(record.session.work_units.at(-1).captured_return, returns[1].raw);
});

test('Atlas governed continuation needs an admitted descendant and never silently carries the original task', async () => {
  const { custodian } = await fixture();
  await assert.rejects(() => custodian.continuation({ task: 'New continuation task.', source_ids: [] }), /HELD_NO_ADMITTED_DESCENDANT/);
  const excursion = await custodian.stage({ task: 'Review fictional new method.', documents: [docB], withheld_document_count: 1 });
  const candidate = await custodian.check({ returns: [await returned(excursion, 0, 'LATEST_ADMITTED_ANSWER_B')], challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const before = custodian.current();
  const carrier = await custodian.continuation({ task: 'Turn the latest method assessment into questions.', source_ids: [docB.id] });
  assert.equal(carrier.schema, 'td613.loom.governed-continuation/v0.2');
  assert.equal(carrier.task, 'Turn the latest method assessment into questions.');
  assert.equal(carrier.preceding_result.result.answer, 'LATEST_ADMITTED_ANSWER_B');
  assert.equal(carrier.preceding_result.work_unit_ref, event.work_units[0].ref);
  assert.equal(carrier.preceding_result.result_ref, event.work_units[0].admitted_result_ref);
  assert.equal(carrier.anchor_work_unit_ref, event.work_units[0].ref);
  assert.equal(carrier.content_predecessor_ref, event.work_units[0].admitted_result_ref);
  assert.equal(carrier.session_root_ref, before.root.ref);
  assert.equal(carrier.root_policy_commitment, before.root.policy_commitment);
  assert.deepEqual(carrier.rules, event.work_units[0].policy.effective_rules);
  assert.deepEqual(carrier.documents, [docB]);
  assert.equal(carrier.authority.head_advanced, false);
  assert.equal(carrier.authority.receiver_enforcement_authenticated, false);
  assert.equal(carrier.authority.imported_records_authoritative, false);
  assert.equal(custodian.current(), before);
  assert.equal(custodian.inspect().pending_turn_count, 0, 'carriage alone cannot register a new admission excursion');
  assert.equal(JSON.stringify(carrier).includes(docA.text), false);
  assert.equal(JSON.stringify(carrier).includes('Review the fictional aggregate source.'), false);
  assert.equal(JSON.stringify(carrier).includes('captured_return'), false);
  const { ref, ...body } = carrier;
  assert.equal(ref, await portableLoomDigest(body, environment));
});

test('Atlas continuation source selection is explicit, latest-turn-only and empty by default only when chosen', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const admitted = await custodian.admit(candidate, decision(candidate));
  const before = custodian.current();
  const empty = await custodian.continuation({ task: 'Read the separately carried latest answer.', source_ids: [] });
  assert.deepEqual(empty.documents, []);
  assert.deepEqual(empty.selected_commitments, []);
  assert.equal(empty.preceding_result.result.answer, admitted.work_units.at(-1).admitted_result.answer);
  await assert.rejects(() => custodian.continuation({ task: 'Silently inherit an older source.', source_ids: [docA.id] }), /HELD_SOURCE_NOT_IN_LATEST_ADMITTED_TURN/);
  await assert.rejects(() => custodian.continuation({ task: 'Invent source selection.', source_ids: ['unknown_source'] }), /HELD_SOURCE_NOT_IN_LATEST_ADMITTED_TURN/);
  await assert.rejects(() => custodian.continuation({ task: 'Duplicate a source.', source_ids: [docB.id, docB.id] }), /unique bounded strings/);
  await assert.rejects(() => custodian.continuation({ task: 'Omit explicit selection.' }), /exactly its declared fields/);
  assert.equal(custodian.current(), before);
  assert.equal(custodian.inspect().pending_turn_count, 0);
});

test('Atlas declined pending excursion preserves admitted ancestry and future continuation anchor', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  await custodian.admit(candidate, decision(candidate));
  const before = custodian.current();
  await custodian.stage({ task: 'Pending next task.', documents: [docB], withheld_document_count: 1 });
  assert.equal(custodian.inspect().pending_turn_count, 1);
  custodian.cancel();
  assert.equal(custodian.current(), before);
  assert.equal(custodian.inspect().pending_turn_count, 0);
  const carrier = await custodian.continuation({ task: 'Continue after declining a pending excursion.', source_ids: [] });
  assert.equal(carrier.anchor_work_unit_ref, before.continuity.current_work_unit_ref);
  assert.equal(carrier.content_predecessor_ref, before.continuity.current_admitted_result_ref);
});

test('Atlas native Challenge Receiver rejects a substituted shadow unit and a noncurrent local parent', async () => {
  const { custodian, returns } = await batchFixture();
  const candidate = await custodian.check({ returns, challenge: null });
  const event = await custodian.admit(candidate, decision(candidate));
  const state = custodian.current(), current = event.work_units.at(-1);
  const shadow = { ...current, content_predecessor_ref: 'f'.repeat(64) };
  await assert.rejects(() => createPortableLoomReceiverChallenge(state, shadow, challengeSpec(), environment), /matching|current|retained|binding|substitut|integrity|ledger/i);
  await assert.rejects(() => createPortableLoomReceiverChallenge(state, event.work_units[0], challengeSpec(), environment), /matching|current|retained|binding|substitut|integrity|ledger/i);
  assert.equal(custodian.current(), state);
});
