import assert from 'node:assert/strict';
import test from 'node:test';
import { webcrypto } from 'node:crypto';
import { runFadtStageAudit } from '../app/engine/dollhouse-continuity-audit.js';
import {
  createLoomAiGovernance, createPortableLoomAiPacket
} from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import {
  createPortableLoomSession, createPortableLoomWorkUnit,
  admitPortableLoomWorkUnitResult, verifyPortableLoomReceiverTurnReceipt,
  portableLoomDigest
} from '../app/engine/portable-loom-session.js';

// These supports are a declared finite protocol model, not an admission engine.
// A FADT consistency result cannot authenticate any of these conditioning labels.
const INSPECT = 'REST_AND_INSPECT';
const ADVANCE = 'ADMIT_AND_ADVANCE_LOCAL_HEAD';
const HOLD = 'RETAIN_HEAD_AND_EXPLAIN_HOLD';
const conditioning = {
  surface: 'returned-turn-card',
  stage: 'ADMISSION_CANDIDATE',
  evidence_class: 'LOCAL_CAPTURE_AND_RECOMPUTED_BINDINGS',
  session_root: 'root-A',
  root_policy: 'policy-A',
  current_head: 'admitted-head-A',
  task_digest: 'operator-task-A',
  source_commitments: 'intentionally-admitted-source-A:bytes-A',
  answer_digest: 'captured-answer-A',
  candidate_digest: 'exact-candidate-A',
  work_predecessor: 'admitted-head-A',
  content_predecessor: 'captured-foreign-answer-parent-A',
  turn_state: 'receiver-turns-1-through-2-unconsumed-in-order',
  operator_intent: 'admit-returned-work-under-root-policy',
  operator_gesture: 'NOTICE_THEN_GESTURE_FOR_EXACT_CANDIDATE_A',
  capture_boundary: 'complete-declared-channels-with-private-state-unobserved'
};
const retained = Object.keys(conditioning).filter(key => key !== 'surface');

function state(id, changes = {}, support = [INSPECT, ADVANCE]) {
  return { id, conditioning: { ...conditioning, ...changes }, support };
}

const hostileChanges = {
  stage: 'ADMITTED_ALREADY_CONSUMED',
  evidence_class: 'RECEIVER_DECLARATION_ONLY',
  session_root: 'root-B',
  root_policy: 'policy-A-with-undeclared-relaxation',
  current_head: 'head-B-after-other-local-admission',
  task_digest: 'substituted-operator-task-B',
  source_commitments: 'source-A:substituted-bytes-B',
  answer_digest: 'substituted-answer-B',
  candidate_digest: 'unrecomputed-or-substituted-candidate-B',
  work_predecessor: 'foreign-declared-parent-promoted-to-local-head',
  content_predecessor: 'work-head-incorrectly-used-as-content-parent',
  turn_state: 'receiver-turns-1-through-2-already-consumed',
  operator_intent: 'check-only-without-local-admission-intent',
  operator_gesture: 'GESTURE_FOR_DIFFERENT_CANDIDATE',
  capture_boundary: 'required-visible-error-channel-missing'
};

for (const [coordinate, changed] of Object.entries(hostileChanges)) {
  test(`FADT erasing ${coordinate} merges locally admissible and held histories`, () => {
    const states = [state('eligible'), state('hostile', { [coordinate]: changed }, [INSPECT, HOLD])];
    const report = runFadtStageAudit({ states, retain: retained.filter(key => key !== coordinate) });
    assert.equal(report.verdict, 'HOLD');
    assert.equal(report.finite_audit.occupied_fibre_count, 1);
    const fibre = report.finite_audit.fibres[0];
    assert.deepEqual(fibre.intersection, [INSPECT]);
    assert.deepEqual(fibre.irreducible_gap, [ADVANCE, HOLD].sort());
    assert.equal(fibre.support_constant_on_fibre, false);
    assert.equal(report.evidence_boundary.stage_admission_verified, false);
    assert.equal(report.evidence_boundary.actions_executed, false);

    const preserved = runFadtStageAudit({ states, retain: retained });
    assert.equal(preserved.verdict, 'CONSISTENT_DECLARATIONS');
    assert.equal(preserved.finite_audit.occupied_fibre_count, 2);
    assert.equal(preserved.evidence_boundary.support_authenticated, false);
  });
}

test('FADT labels DECLARED, RECOMPUTED, HELD, ADMISSIBLE and ADMITTED carry different finite supports', () => {
  const stages = [
    ['DECLARED', ['CHECK_RETURN', INSPECT]],
    ['RECOMPUTED', ['PREPARE_ADMISSION_CANDIDATE', INSPECT]],
    ['HELD', [HOLD, INSPECT]],
    ['ADMISSIBLE', ['SHOW_ADMISSION_CONSEQUENCE', INSPECT]],
    ['ADMITTED', ['CONTINUE_FROM_NEW_LOCAL_HEAD', INSPECT]]
  ].map(([stage, support]) => ({
    id: stage, conditioning: { surface: 'returned-turn-card', stage }, support
  }));
  const erased = runFadtStageAudit({ states: stages, retain: ['surface'] });
  assert.equal(erased.verdict, 'HOLD');
  assert.deepEqual(erased.finite_audit.fibres[0].intersection, [INSPECT]);
  assert.equal(erased.finite_audit.fibres[0].gap_size, 5);
  assert.equal(runFadtStageAudit({ states: stages, retain: ['stage'] }).verdict, 'CONSISTENT_DECLARATIONS');
});

test('FADT sufficient retained projection is finite and allows different presentations', () => {
  const states = [
    state('eligible-desktop'),
    state('eligible-mobile', { surface: 'mobile-progressive-disclosure' }),
    ...Object.entries(hostileChanges).map(([key, value]) => state(`hostile-${key}`, { [key]: value }, [INSPECT, HOLD]))
  ];
  const report = runFadtStageAudit({ states, retain: retained });
  assert.equal(report.verdict, 'CONSISTENT_DECLARATIONS');
  assert.deepEqual(report.erased_coordinates, ['surface']);
  assert.equal(report.finite_audit.occupied_fibre_count, states.length - 1);
  const shared = report.finite_audit.fibres.find(fibre => fibre.antecedents.length === 2);
  assert.deepEqual(shared.antecedents.map(item => item.id), ['eligible-desktop', 'eligible-mobile']);
  assert.equal(report.evidence_boundary.stage_admission_verified, false);
  assert.equal(report.evidence_boundary.authority_transferred, false);
  assert.deepEqual(report, runFadtStageAudit({
    states: [...states].reverse().map(item => ({ ...item, support: [...item.support].reverse() })),
    retain: [...retained].reverse()
  }));
});

function challengeState(id, changes = {}, support = [INSPECT, 'RETAIN_BOUNDED_CHALLENGE_EVIDENCE']) {
  return {
    id,
    conditioning: {
      surface: 'challenge-return-card',
      literal: 'FINITE_LITERAL_EXCLUSION',
      standalone: 'BOUNDED_FAILED_RECONSTRUCTION_PROBES',
      joining: 'BOUNDED_FAILED_JOINED_PROBES',
      capture: 'COMPLETE_REQUIRED_CHANNELS',
      binding: 'EXACT_CHALLENGE_FOR_CANDIDATE_A',
      ...changes
    },
    support
  };
}

for (const [coordinate, value] of [
  ['standalone', 'PROTECTED_TARGET_RECONSTRUCTED'],
  ['joining', 'JOINED_ONLY_RECONSTRUCTION_OBSERVED'],
  ['capture', 'REQUIRED_CHANNEL_MISSING'],
  ['binding', 'VALID_CHALLENGE_FROM_OTHER_SESSION']
]) {
  test(`FADT a clean literal result cannot erase hostile ${coordinate}`, () => {
    const states = [challengeState('clean'), challengeState('hostile', { [coordinate]: value }, [INSPECT, HOLD])];
    const keys = Object.keys(states[0].conditioning).filter(key => key !== 'surface');
    assert.equal(runFadtStageAudit({ states, retain: keys.filter(key => key !== coordinate) }).verdict, 'HOLD');
    assert.equal(runFadtStageAudit({ states, retain: keys }).verdict, 'CONSISTENT_DECLARATIONS');
  });
}

test('FADT equal-cardinality source sets with different commitments carry different actions', () => {
  const states = [
    { id: 'intentionally-admitted', conditioning: { count: '1', sources: 'source-A:bytes-A' }, support: [INSPECT, ADVANCE] },
    { id: 'substituted', conditioning: { count: '1', sources: 'source-A:bytes-B' }, support: [INSPECT, HOLD] }
  ];
  const report = runFadtStageAudit({ states, retain: ['count'] });
  assert.equal(report.verdict, 'HOLD');
  assert.equal(report.finite_audit.fibres[0].gap_size, 2);
});

test('FADT preserves withheld, absent and unknown as different declared input coordinates', () => {
  const states = [
    { id: 'withheld', conditioning: { surface: 'no-source-body', source_boundary: 'INTENTIONALLY_WITHHELD' }, support: [INSPECT, 'CONTINUE_WITHOUT_BODY'] },
    { id: 'absent', conditioning: { surface: 'no-source-body', source_boundary: 'NOT_SUPPLIED' }, support: [INSPECT, 'REQUEST_EXPLICIT_SOURCE_ADMISSION'] },
    { id: 'unknown', conditioning: { surface: 'no-source-body', source_boundary: 'CAPTURE_MISSING' }, support: [INSPECT, HOLD] }
  ];
  const coarse = runFadtStageAudit({ states, retain: ['surface'] });
  assert.equal(coarse.verdict, 'HOLD');
  assert.equal(coarse.finite_audit.fibres[0].gap_size, 3);
  assert.equal(runFadtStageAudit({ states, retain: ['source_boundary'] }).verdict, 'CONSISTENT_DECLARATIONS');
});

test('legacy receipt revalidation is identical for different unbound answer captures and never advances the head', async () => {
  const environment = { crypto: webcrypto };
  const task = { task: 'Read the explicitly selected fictional source.', documents: [{ id: 'note', name: 'Note.md', text: 'Fictional public source.' }], rules: ['Use selected sources only.'] };
  task.governance = await createLoomAiGovernance(task, { withheldDocumentCount: 1 }, environment);
  const packet = createPortableLoomAiPacket(task);
  const origin = await createPortableLoomSession(packet, {
    session_id: 'fadt_reentry_fixture', source_revision: 'de0cbe3589f3f9055061370279d7e41b4ccb980a', created_at: 1
  }, environment);
  const prepared = await createPortableLoomWorkUnit(origin, {
    work_unit_id: 'anchor', request_id: 'anchor_request', task: task.task, documents: task.documents, add_rules: [], withheld_document_count: 1
  }, environment);
  const admitted = await admitPortableLoomWorkUnitResult(prepared.session, prepared.work_unit, {
    schema: 'td613.loom.ai-task-result/v0.1', request_id: 'anchor_request', status: 'completed', answer: 'Fictional admitted origin answer.',
    used_document_ids: ['note'], missing_information: [], suggested_next_step: 'Inspect the bounded record.'
  }, environment);
  assert.equal(admitted.status, 'ADMITTED');
  const session = admitted.session;
  const receipt = {
    schema: 'td613.loom.portable-session-receiver-turn/v0.1', session_root_ref: session.root.ref,
    policy_commitment: session.work_units.at(-1).policy.effective_policy_commitment,
    anchor_work_unit_ref: session.continuity.current_work_unit_ref, turn_index: 1,
    operator_task: 'Continue the fictional task.', used_document_ids: ['note'], missing_information: [],
    receiver_declaration: 'I declare that I used the selected note.'
  };
  const before = JSON.stringify(session);
  const historyA = { receipt, captured_answer: 'Public bounded answer.' };
  const historyB = { receipt, captured_answer: 'LOCAL_PRIVATE_LITERAL disclosed.' };
  assert.notEqual(await portableLoomDigest(historyA.captured_answer, environment), await portableLoomDigest(historyB.captured_answer, environment));
  const options = { expected_task: receipt.operator_task, allowed_document_ids: ['note'] };
  const verificationA = await verifyPortableLoomReceiverTurnReceipt(session, historyA.receipt, options, environment);
  const verificationB = await verifyPortableLoomReceiverTurnReceipt(session, historyB.receipt, options, environment);
  assert.equal(verificationA.status, 'DECLARED_TURN_MATCH');
  assert.deepEqual(verificationA, verificationB);
  assert.equal(verificationA.local_ledger_advanced, false);
  assert.equal(verificationA.receiver_declaration_promoted_to_observed_fact, false);
  assert.equal(JSON.stringify(session), before);
  const states = [
    { id: 'captured-clean', conditioning: { receipt_ref: verificationA.ref, answer_capture: historyA.captured_answer }, support: [INSPECT, 'PREPARE_BOUNDED_CANDIDATE'] },
    { id: 'captured-exposure', conditioning: { receipt_ref: verificationB.ref, answer_capture: historyB.captured_answer }, support: [INSPECT, HOLD] }
  ];
  assert.equal(runFadtStageAudit({ states, retain: ['receipt_ref'] }).verdict, 'HOLD');
  assert.equal(runFadtStageAudit({ states, retain: ['receipt_ref', 'answer_capture'] }).verdict, 'CONSISTENT_DECLARATIONS');
});
