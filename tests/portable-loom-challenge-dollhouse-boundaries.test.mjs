import assert from 'node:assert/strict';
import test from 'node:test';
import { webcrypto } from 'node:crypto';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, admitPortableLoomWorkUnitResult, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import {
  createPortableLoomReceiverChallenge, verifyPortableLoomReceiverChallenge,
  auditPortableLoomChallengeWithDollhouse, PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA
} from '../app/engine/portable-loom-challenge.js';

const environment = { crypto: webcrypto };

async function fixture() {
  const input = {
    task: 'Review one explicitly selected fictional source.',
    documents: [{ id: 'selected', name: 'Selected.md', text: 'Fictional public evidence.' }],
    rules: ['Use selected evidence only.', 'Keep missing evidence missing.']
  };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 1 }, environment);
  const packet = createPortableLoomAiPacket(input);
  const root = await createPortableLoomSession(packet, {
    session_id: 'challenge_dollhouse_boundary', source_revision: 'de0cbe3589f3f9055061370279d7e41b4ccb980a', created_at: 1
  }, environment);
  const prepared = await createPortableLoomWorkUnit(root, {
    work_unit_id: 'anchor', request_id: 'anchor_request', task: input.task,
    documents: input.documents, add_rules: [], withheld_document_count: 1
  }, environment);
  const admitted = await admitPortableLoomWorkUnitResult(prepared.session, prepared.work_unit, {
    schema: 'td613.loom.ai-task-result/v0.1', request_id: 'anchor_request', status: 'completed',
    answer: 'Fictional locally admitted result.', used_document_ids: ['selected'], missing_information: [], suggested_next_step: 'Inspect the bounded record.'
  }, environment);
  const session = admitted.session;
  const unit = session.work_units.at(-1);
  const probe = (id, role, join_group = null) => ({
    id, prompt: `Fictional ${id} probe.`, expected: role === 'STANDALONE' ? 'FICTIONAL-STANDALONE-TARGET' : 'FICTIONAL-JOINED-TARGET',
    comparison: 'EXACT', max_distance: 0, join_group, role
  });
  const bundle = await createPortableLoomReceiverChallenge(session, unit, {
    challenge_id: 'challenge_boundary', evidence_class: 'OFFLINE_TEST',
    observer_scope: {
      receiver: 'synthetic foreign declaration fixture', horizon: 'structured reply and visible error channel only',
      channels: [{ id: 'reply', description: 'Structured reply.', required: true }, { id: 'error', description: 'Error/status channel.', required: true }]
    },
    canaries: [{ id: 'canary', value: 'FICTIONAL-LITERAL-CANARY' }],
    probes: [probe('standalone', 'STANDALONE'), probe('marginal_a', 'MARGINAL', 'join'), probe('marginal_b', 'MARGINAL', 'join'), probe('joined', 'JOINED', 'join')],
    finite_channel_model: null, finite_channel_selected: []
  }, environment);
  const challenge = bundle.public_challenge;
  const returned = {
    schema: PORTABLE_LOOM_CHALLENGE_RETURN_SCHEMA,
    challenge_id: challenge.challenge_id, session_root_ref: challenge.session_root_ref,
    work_unit_ref: challenge.work_unit_ref, policy_commitment: challenge.policy_commitment,
    answers: challenge.probes.map(item => ({ probe_id: item.id, answer: 'UNKNOWN' })),
    receiver_declaration: { tools_used: 'UNKNOWN', network_used: 'UNKNOWN', memory_used: 'UNKNOWN', notes: 'Synthetic declaration only.' }
  };
  return { session, unit, bundle, returned };
}

async function verifyAndAudit(f, options = {}) {
  const capture = {
    evidence_class: 'OFFLINE_TEST',
    surfaces: [
      { channel_id: 'reply', status: 'CAPTURED', text: JSON.stringify(f.returned) },
      { channel_id: 'error', status: options.missingError ? 'MISSING' : 'CAPTURED', text: options.missingError ? '' : 'synthetic status' }
    ]
  };
  const verification = await verifyPortableLoomReceiverChallenge(f.bundle, f.returned, capture, environment);
  const audit = await auditPortableLoomChallengeWithDollhouse(f.session, f.unit, f.bundle, verification, environment);
  return { verification, audit };
}

test('challenge Pedagogue holds without inventing STAGE/SEND gesture observations', async () => {
  const f = await fixture();
  const before = JSON.stringify(f.session);
  const { verification, audit } = await verifyAndAudit(f);
  assert.equal(verification.status, 'BOUNDED_CHALLENGE_PASSED');
  assert.equal(audit.pedagogue.classification, 'HELD_INPUT_CLASS');
  assert.equal(audit.pedagogue.compatibility_object_fabricated, false);
  assert.equal(audit.pedagogue.gesture_trace_observed, false);
  assert.equal(audit.pedagogue.notice_visibility_observed, false);
  assert.equal(Object.hasOwn(audit.pedagogue, 'steps'), false);
  assert.equal(Object.hasOwn(audit.pedagogue, 'comparisons'), false);
  assert.equal(audit.subagent_coverage.find(item => item.id === 'pedagogue-gesture-consequence').status, 'HELD_INPUT_CLASS');
  assert.equal(audit.dossier.findings.find(item => item.agent === 'PEDAGOGUE').verdict, 'HELD');
  assert.equal(audit.dossier.decision, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(JSON.stringify(f.session), before);
});

for (const [field, coordinate] of [
  ['session_root_ref', 'original_ref'], ['work_unit_ref', 'predecessor_ref'], ['policy_commitment', 'policy_commitment']
]) {
  test(`Atlas challenge audit compares actual substituted ${field}`, async () => {
    const f = await fixture();
    f.returned[field] = 'f'.repeat(64);
    const { verification, audit } = await verifyAndAudit(f);
    assert.equal(verification.status, 'HOLD_REFERENCE_MISMATCH');
    assert.equal(audit.atlas.returned_references[field], f.returned[field]);
    assert.equal(audit.atlas.audit.verdict, 'HOLD');
    assert.equal(audit.atlas.audit.challenge_return_bound, false);
    const compared = audit.atlas.differences.find(item => item.coordinate === coordinate);
    assert.equal(compared.to.value, f.returned[field]);
    assert.equal(audit.dossier.findings.find(item => item.agent === 'ATLAS').verdict, 'HELD');
    const policyPlan = audit.aperture.claims.find(item => item.claim_id === 'policy-binding');
    assert.match(policyPlan.declaration.statement, /mismatches/);
    assert.equal(policyPlan.claim_verified, false);
    assert.equal(audit.fadt.actual_return_state, 'RETURN_HELD_REFERENCE');
  });
}

test('challenge episode mismatch holds Atlas even with matching root/unit/policy', async () => {
  const f = await fixture();
  f.returned.challenge_id = 'different_episode';
  const { audit } = await verifyAndAudit(f);
  assert.equal(audit.atlas.audit.verdict, 'HOLD');
  assert.equal(audit.atlas.challenge_reference_match, false);
});

test('unknown returned reference fields cannot be filled with expected Loom coordinates', async () => {
  const f = await fixture();
  const { verification } = await verifyAndAudit(f);
  const missing = JSON.parse(JSON.stringify(verification));
  delete missing.returned_references;
  delete missing.ref;
  missing.ref = await portableLoomDigest(missing, environment);
  const audit = await auditPortableLoomChallengeWithDollhouse(f.session, f.unit, f.bundle, missing, environment);
  assert.equal(audit.atlas.audit.verdict, 'HOLD');
  assert.equal(audit.atlas.returned_references, null);
  for (const field of ['original_ref', 'predecessor_ref', 'policy_commitment']) {
    assert.equal(audit.atlas.differences.find(item => item.coordinate === field).to.state, 'UNKNOWN');
  }
});

test('Aperture states literal exposure positively and cannot assert clean exclusion', async () => {
  const f = await fixture();
  f.returned.receiver_declaration.notes = 'FICTIONAL-LITERAL-CANARY';
  const { verification, audit } = await verifyAndAudit(f);
  assert.equal(verification.literal_exclusion.status, 'OBSERVED_LITERAL_DISCLOSURE');
  const plan = audit.aperture.claims.find(item => item.claim_id === 'literal-exclusion');
  assert.match(plan.declaration.statement, /At least one.*appeared/);
  assert.doesNotMatch(plan.declaration.statement, /^No declared/);
  assert.equal(plan.claim_verified, false);
  assert.equal(audit.fadt.actual_return_state, 'RETURN_CHECKED_EXPOSURE');
});

test('Aperture retains missing capture rather than naming a complete clean horizon', async () => {
  const { verification, audit } = await verifyAndAudit(await fixture(), { missingError: true });
  assert.equal(verification.status, 'HELD_INCOMPLETE_OBSERVATION');
  const plan = audit.aperture.claims.find(item => item.claim_id === 'literal-exclusion');
  assert.match(plan.declaration.statement, /held.*error/);
  assert.equal(audit.fadt.actual_return_state, 'RETURN_HELD_CAPTURE');
  assert.equal(audit.dossier.findings.find(item => item.agent === 'APERTURE').verdict, 'HELD');
});

test('mixed binding HOLD retains joined exposure and cannot become admitted in FADT', async () => {
  const f = await fixture();
  f.returned.policy_commitment = 'f'.repeat(64);
  f.returned.answers.find(item => item.probe_id === 'joined').answer = 'FICTIONAL-JOINED-TARGET';
  const { verification, audit } = await verifyAndAudit(f);
  assert.equal(verification.status, 'HOLD_REFERENCE_MISMATCH');
  assert.equal(verification.literal_exclusion.status, 'FINITE_LITERAL_EXCLUSION_SUPPORTED');
  assert.equal(verification.protected_reconstruction.joining[0].classification, 'JOINING_EXPOSURE_OBSERVED');
  assert.equal(audit.atlas.audit.verdict, 'HOLD');
  const reconstruction = audit.aperture.claims.find(item => item.claim_id === 'scoped-reconstruction');
  assert.match(reconstruction.declaration.statement, /recover 1.*joined-only/);
  assert.match(reconstruction.declaration.statement, /foreign attribution depends/);
  assert.equal(audit.fadt.actual_return_state, 'RETURN_HELD_REFERENCE_WITH_EXPOSURE');
  assert.equal(audit.fadt.local_admission_performed, false);
  assert.equal(audit.fadt.actual_support_authorized, false);
});

test('FADT retains observed reconstruction alongside incomplete capture', async () => {
  const f = await fixture();
  f.returned.answers.find(item => item.probe_id === 'joined').answer = 'FICTIONAL-JOINED-TARGET';
  const { verification, audit } = await verifyAndAudit(f, { missingError: true });
  assert.equal(verification.status, 'OBSERVED_EXPOSURE');
  assert.equal(audit.fadt.actual_return_state, 'RETURN_HELD_CAPTURE_WITH_EXPOSURE');
  const actual = audit.fadt.preserving.occupied_states.find(item => item.id === audit.fadt.actual_return_state);
  assert.equal(actual.conditioning.exposure, 'OBSERVED_IN_CAPTURE');
  assert.equal(actual.conditioning.capture, 'INCOMPLETE');
  assert.ok(actual.support.includes('PRESERVE_EXPOSURE_FINDING'));
  assert.ok(actual.support.includes('COMPLETE_DECLARED_CAPTURE'));
  assert.equal(actual.support.includes('PREPARE_REENTRY_CANDIDATE'), false);
  assert.equal(audit.fadt.actual_support_authorized, false);
});

test('FADT model distinguishes checked return, held return, and separately admitted local descendant', async () => {
  const { audit } = await verifyAndAudit(await fixture());
  assert.equal(audit.fadt.input_class, 'DECLARED_FINITE_ACTION_SUPPORT_MODEL');
  assert.equal(audit.fadt.model_only, true);
  assert.equal(audit.fadt.actual_return_state, 'RETURN_CHECKED_CLEAN');
  const states = audit.fadt.preserving.occupied_states;
  const checked = states.find(item => item.id === 'RETURN_CHECKED_CLEAN');
  const admitted = states.find(item => item.id === 'RETURN_ADMITTED_LOCAL');
  assert.ok(checked.support.includes('PREPARE_REENTRY_CANDIDATE'));
  assert.equal(checked.support.includes('CONTINUE_FROM_LOCAL_HEAD'), false);
  assert.ok(admitted.support.includes('CONTINUE_FROM_LOCAL_HEAD'));
  assert.equal(audit.fadt.preserving.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(audit.fadt.erasing_phase.verdict, 'HOLD');
  assert.equal(audit.fadt.erasing_return_evidence.verdict, 'HOLD');
  assert.equal(audit.fadt.preserving.evidence_boundary.stage_admission_verified, false);
  assert.equal(audit.fadt.preserving.evidence_boundary.actions_executed, false);
  assert.equal(audit.evidence_class_promotion, false);
  assert.equal(audit.majority_vote, false);
});
