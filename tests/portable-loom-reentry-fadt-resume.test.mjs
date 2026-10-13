import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { createPortableLoomReentryCustodian, LOOM_REENTRY_RETURN_SCHEMA } from '../app/engine/portable-loom-reentry.js';
import {
  createPortableLoomReceiverChallenge, verifyPortableLoomReceiverChallenge,
  auditPortableLoomChallengeWithDollhouse, PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA
} from '../app/engine/portable-loom-challenge.js';
import { runFadtStageAudit } from '../app/engine/dollhouse-continuity-audit.js';

const environment = { crypto: webcrypto };
const copy = value => JSON.parse(JSON.stringify(value));
const INSPECT = 'REST_AND_INSPECT';
const ADMIT = 'ADMIT_WITH_EXACT_REVIEW_GESTURE';
const KEEP = 'RETAIN_HEAD_AND_INSPECT_PRIOR_CHALLENGE';

async function fixture() {
  const input = {
    task: 'Review explicitly selected fictional material.',
    documents: [{ id: 'public', name: 'Public.txt', text: 'Fictional retained public material.' }],
    rules: ['Use only explicitly selected sources.', 'Keep missing evidence missing.']
  };
  input.governance = await createLoomAiGovernance(input, {}, environment);
  const packet = createPortableLoomAiPacket(input);
  const seed = await createPortableLoomSession(packet, {
    session_id: webcrypto.randomUUID(), source_revision: '2565130edfd1260446d9af3c122336cca820b0c2', created_at: 1000
  }, environment);
  const prepared = await createPortableLoomWorkUnit(seed, {
    work_unit_id: 'seed', request_id: 'seed-request', task: input.task,
    documents: input.documents, add_rules: [], withheld_document_count: 0
  }, environment);
  const custody = await createPortableLoomReentryCustodian(prepared.session, packet, { now: () => 1000 }, environment);
  return { input, packet, prepared, custody };
}

async function stage(f) {
  f.departure = await f.custody.stage({ task: 'Proceed with this exact selected source.', documents: f.input.documents, withheld_document_count: 1 });
  const intent = f.departure.turns.at(-1), answer = 'Synthetic bound capture, with foreign execution unresolved.';
  f.returned = {
    schema: LOOM_REENTRY_RETURN_SCHEMA, excursion_ref: f.departure.ref, intent_ref: intent.ref,
    session_root_ref: f.departure.session_root_ref, policy_commitment: f.departure.policy_commitment,
    anchor_work_unit_ref: f.departure.anchor_work_unit_ref, turn_index: intent.turn_index,
    task_digest: intent.task_digest, source_commitment_digest: intent.source_commitment_digest,
    answer, answer_digest: await portableLoomDigest(answer, environment), used_document_ids: ['public'],
    missing_information: ['A separately signed original remains absent.'],
    receiver_declaration: { policy_change_requested: false, notes: 'Synthetic declaration; no foreign provider contacted.' }
  };
  return f;
}

async function assay(f, options = {}) {
  const bundle = await createPortableLoomReceiverChallenge(f.prepared.session, f.prepared.work_unit, {
    challenge_id: `fadt_${webcrypto.randomUUID().replaceAll('-', '_')}`, evidence_class: 'OFFLINE_TEST',
    observer_scope: { receiver: 'synthetic receiver', horizon: 'exact structured reply and required visible error/status capture',
      channels: [{ id: 'reply', description: 'Structured reply.', required: true }, { id: 'error', description: 'Visible status.', required: true }] },
    canaries: [{ id: 'canary', value: 'FADT-RESUME-FICTIONAL-CANARY' }],
    probes: [{ id: 'standalone', role: 'STANDALONE', join_group: null, prompt: 'Synthetic bounded reconstruction probe.',
      expected: 'FICTIONAL TARGET', comparison: 'EXACT', max_distance: 0 }],
    finite_channel_model: null, finite_channel_selected: []
  }, environment);
  const publicChallenge = bundle.public_challenge;
  const candidate = {
    schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA, challenge_id: publicChallenge.challenge_id,
    session_root_ref: publicChallenge.session_root_ref, work_unit_ref: publicChallenge.work_unit_ref,
    policy_commitment: publicChallenge.policy_commitment,
    answers: [{ probe_id: 'standalone', answer: 'UNKNOWN' }],
    receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN',
      notes: options.literal ? 'FADT-RESUME-FICTIONAL-CANARY' : 'Synthetic declared response; no provider contacted.' }
  };
  if (options.wrongReference) candidate.policy_commitment = 'f'.repeat(64);
  const capture = { evidence_class: 'OFFLINE_TEST', surfaces: [
    { channel_id: 'reply', status: options.missingReply ? 'MISSING' : 'CAPTURED', text: options.missingReply ? '' : JSON.stringify(candidate) },
    { channel_id: 'error', status: options.missingError ? 'MISSING' : 'CAPTURED', text: options.missingError ? '' : 'synthetic visible status' }
  ] };
  if (options.malformed) capture.surfaces[0].text = '{ malformed captured return';
  return { bundle, candidate, capture };
}

const check = f => f.custody.check({ returns: [{ raw: JSON.stringify(f.returned), policy_review: 'ROOT_RULES_RETAINED' }], challenge: null });
const decision = candidate => ({ expected_head_ref: candidate.expected_head_ref, reviewed_candidate_ref: candidate.ref,
  gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true });
const historyStatuses = f => f.custody.current().challenge_history.map(episode => episode.status);

test('latest clean projection erases an occupied difference in actual bounded admission support', async () => {
  const clean = await stage(await fixture()), exposed = await stage(await fixture());
  await clean.custody.recordChallenge(await assay(clean));
  await exposed.custody.recordChallenge(await assay(exposed, { literal: true }));
  await exposed.custody.recordChallenge(await assay(exposed));
  assert.equal(historyStatuses(clean).at(-1), 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(historyStatuses(exposed).at(-1), 'BOUNDED_CHALLENGE_PASSED');
  const eligible = await check(clean), held = await check(exposed);
  assert.equal(eligible.status, 'ADMISSION_CANDIDATE');
  assert.equal(held.status, 'HELD');
  assert.equal(held.challenge_evidence, null);
  assert.equal(held.registered_challenges.length, 2);
  assert.ok(held.reasons.includes('REGISTERED_CHALLENGE_OBSERVED_EXPOSURE'));
  assert.equal((await clean.custody.admit(eligible, decision(eligible))).status, 'ADMITTED');
  assert.equal((await exposed.custody.admit(held, decision(held))).status, 'HELD');
  assert.equal(exposed.custody.inspect().current_work_unit_ref, null);

  // Compare own-root relations, not absolute roots or equality of raw receipts.
  // The supports below are declared from this bounded protocol and corroborated
  // by the actual operations above; FADT itself does not authenticate supports.
  const states = [
    { id: 'clean-only', conditioning: { binding: 'OWN_REGISTERED_ROUTE', latest: 'BOUNDED_CHALLENGE_PASSED',
      retained_history: historyStatuses(clean).join('|') }, support: [INSPECT, ADMIT] },
    { id: 'prior-linked-exposure-then-clean', conditioning: { binding: 'OWN_REGISTERED_ROUTE', latest: 'BOUNDED_CHALLENGE_PASSED',
      retained_history: historyStatuses(exposed).join('|') }, support: [INSPECT, KEEP] }
  ];
  const erased = runFadtStageAudit({ states, retain: ['binding', 'latest'] });
  assert.equal(erased.verdict, 'HOLD');
  assert.equal(erased.finite_audit.occupied_fibre_count, 1);
  assert.deepEqual(erased.finite_audit.fibres[0].intersection, [INSPECT]);
  assert.deepEqual(erased.finite_audit.fibres[0].irreducible_gap, [ADMIT, KEEP].sort());
  const retained = runFadtStageAudit({ states, retain: ['binding', 'latest', 'retained_history'] });
  assert.equal(retained.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(retained.finite_audit.occupied_fibre_count, 2);
  assert.equal(retained.evidence_boundary.support_authenticated, false);
  assert.equal(retained.evidence_boundary.actions_executed, false);
});

for (const [name, options, status] of [
  ['required status channel missing', { missingError: true }, 'HELD_INCOMPLETE_OBSERVATION'],
  ['structured capture missing', { missingReply: true }, 'HELD'],
  ['malformed structured capture', { malformed: true }, 'HELD'],
  ['substituted receiver policy reference', { wrongReference: true }, 'HOLD_REFERENCE_MISMATCH']
]) test(`later clean assay cannot erase prior linked ${name}`, async () => {
  const f = await stage(await fixture()), evidence = await assay(f, options);
  const first = await f.custody.recordChallenge(evidence);
  assert.equal(first.status, status);
  assert.deepEqual(first.evidence, evidence);
  assert.equal(first.scope.excursion_ref, f.departure.ref);
  assert.deepEqual(first.scope.registered_intent_refs, f.departure.turns.map(turn => turn.ref));
  const latest = await f.custody.recordChallenge(await assay(f));
  assert.equal(latest.status, 'BOUNDED_CHALLENGE_PASSED');
  const candidate = await check(f);
  assert.equal(candidate.status, 'HELD');
  assert.deepEqual(candidate.registered_challenges.map(item => item.ref), [first.ref, latest.ref]);
  assert.ok(candidate.reasons.includes(`REGISTERED_CHALLENGE_${status}`));
  assert.equal((await f.custody.admit(candidate, decision(candidate))).status, 'HELD');
  assert.equal(f.custody.inspect().current_work_unit_ref, null);
});

test('anchor-only episode and true absence admit bounded returns while retaining different assay scope', async () => {
  const absent = await fixture(), anchorOnly = await fixture();
  const anchorEpisode = await anchorOnly.custody.recordChallenge(await assay(anchorOnly));
  assert.equal(anchorEpisode.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(anchorEpisode.scope.excursion_ref, null);
  assert.deepEqual(anchorEpisode.scope.registered_intent_refs, []);
  assert.equal(anchorEpisode.scope.episode_class, 'ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE');
  await stage(absent); await stage(anchorOnly);
  const absentCandidate = await check(absent), anchorCandidate = await check(anchorOnly);
  for (const candidate of [absentCandidate, anchorCandidate]) {
    assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
    assert.deepEqual(candidate.registered_challenges, []);
    assert.equal(candidate.challenge_scope, 'NO_EPISODE_RETAINED_FOR_THIS_CHECK');
  }
  assert.equal(absent.custody.export().session.challenge_history.length, 0);
  assert.equal(anchorOnly.custody.export().session.challenge_history.length, 1);
  assert.equal((await absent.custody.admit(absentCandidate, decision(absentCandidate))).status, 'ADMITTED');
  assert.equal((await anchorOnly.custody.admit(anchorCandidate, decision(anchorCandidate))).status, 'ADMITTED');

  // Erasing scope preserves ONLY the next bounded admission action here.
  const states = [
    { id: 'no-assay', conditioning: { return: 'EXACT_BOUND_CANDIDATE', assay_scope: 'ABSENT' }, support: [INSPECT, ADMIT] },
    { id: 'anchor-assay', conditioning: { return: 'EXACT_BOUND_CANDIDATE', assay_scope: 'ANCHOR_ONLY' }, support: [INSPECT, ADMIT] }
  ];
  const admissionOnly = runFadtStageAudit({ states, retain: ['return'] });
  assert.equal(admissionOnly.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(admissionOnly.finite_audit.occupied_fibre_count, 1);
  assert.equal(admissionOnly.finite_audit.fibres[0].gap_size, 0);
  const scopeReporting = states.map(item => ({ ...item, support: [INSPECT,
    item.conditioning.assay_scope === 'ABSENT' ? 'REPORT_NO_ASSAY_RECORDED' : 'REPORT_ANCHOR_ASSAY_WITH_NO_FOREIGN_TURN_COVERAGE'] }));
  assert.equal(runFadtStageAudit({ states: scopeReporting, retain: ['return'] }).verdict, 'HOLD');
  assert.equal(runFadtStageAudit({ states: scopeReporting, retain: ['return', 'assay_scope'] }).verdict, 'CONSISTENT_DECLARATIONS');
});

test('registering even a clean challenge invalidates an older candidate and cannot advance ancestry', async () => {
  const f = await stage(await fixture()), prior = await check(f);
  const recording = f.custody.recordChallenge(await assay(f));
  assert.equal(f.custody.current().challenge_history.at(-1).status, 'PENDING_CHALLENGE');
  assert.equal(f.custody.inspect().current_work_unit_ref, null);
  const oldGesture = await f.custody.admit(prior, decision(prior));
  assert.equal(oldGesture.status, 'HELD');
  assert.equal(oldGesture.reason, 'STALE_OR_REPLAYED_CANDIDATE');
  assert.equal((await recording).status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(f.custody.inspect().current_work_unit_ref, null);
  const refreshed = await check(f);
  assert.equal(refreshed.status, 'ADMISSION_CANDIDATE');
  assert.equal(refreshed.registered_challenges.length, 1);
  assert.equal((await f.custody.admit(refreshed, decision(refreshed))).status, 'ADMITTED');
});

test('checked challenge, insufficient return, candidate and admitted descendant remain separate phases', async () => {
  const f = await stage(await fixture()), evidence = await assay(f);
  assert.equal((await f.custody.recordChallenge(evidence)).status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(f.custody.inspect().current_work_unit_ref, null);
  const unbound = copy(f.returned); unbound.answer = 'Substituted answer without matching commitment.';
  const held = await f.custody.check({ returns: [{ raw: JSON.stringify(unbound), policy_review: 'ROOT_RULES_RETAINED' }], challenge: null });
  assert.equal(held.status, 'HELD');
  const candidate = await check(f);
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
  assert.equal(f.custody.inspect().current_work_unit_ref, null);
  assert.equal((await f.custody.admit(candidate, { ...decision(candidate), gesture: 'CHECK_RETURN' })).status, 'HELD');
  const admitted = await f.custody.admit(candidate, decision(candidate));
  assert.equal(admitted.status, 'ADMITTED');
  assert.notEqual(f.custody.inspect().current_work_unit_ref, null);
  const states = [
    ['CHALLENGED', ['CHECK_BOUND_RETURN', INSPECT]],
    ['HELD', ['RETAIN_HEAD_AND_EXPLAIN_HOLD', INSPECT]],
    ['ADMISSION_CANDIDATE', [ADMIT, INSPECT]],
    ['ADMITTED', ['CONTINUE_FROM_LOCAL_DESCENDANT', INSPECT]]
  ].map(([phase, support]) => ({ id: phase, conditioning: { surface: 'return-card', phase }, support }));
  const erased = runFadtStageAudit({ states, retain: ['surface'] });
  assert.equal(erased.verdict, 'HOLD');
  assert.deepEqual(erased.finite_audit.fibres[0].intersection, [INSPECT]);
  assert.equal(erased.finite_audit.fibres[0].gap_size, 4);
  assert.equal(runFadtStageAudit({ states, retain: ['phase'] }).verdict, 'CONSISTENT_DECLARATIONS');
});

test('runtime role adapters preserve input-class HOLD and declared finite model boundaries', async () => {
  const f = await fixture(), evidence = await assay(f);
  const verified = await verifyPortableLoomReceiverChallenge(evidence.bundle, evidence.candidate, evidence.capture, environment);
  const audit = await auditPortableLoomChallengeWithDollhouse(f.prepared.session, f.prepared.work_unit, evidence.bundle, verified, environment);
  assert.equal(audit.pedagogue.classification, 'HELD_INPUT_CLASS');
  assert.equal(audit.pedagogue.compatibility_object_fabricated, false);
  assert.equal(audit.pedagogue.gesture_trace_observed, false);
  assert.equal(audit.subagent_coverage.find(item => item.id === 'dollhouse-portable-aia-roundtrip').status, 'HELD_INPUT_CLASS');
  assert.equal(audit.fadt.input_class, 'DECLARED_FINITE_ACTION_SUPPORT_MODEL');
  assert.equal(audit.fadt.model_only, true);
  assert.equal(audit.fadt.local_admission_performed, false);
  assert.equal(audit.fadt.actual_support_authorized, false);
  assert.equal(audit.majority_vote, false);
});
