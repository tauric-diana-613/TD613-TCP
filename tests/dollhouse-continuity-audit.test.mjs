import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ATLAS_CONTINUITY_AUDIT_SCHEMA,
  FADT_STAGE_AUDIT_SCHEMA,
  runAtlasContinuityAudit,
  runFadtStageAudit
} from '../app/engine/dollhouse-continuity-audit.js';

function loomSnapshots() {
  const origin = {
    id: 'fictional Loom origin', source_revision: 'source-r1',
    original_ref: 'answer-A', current_ref: 'answer-A', predecessor_ref: null,
    selected_commitments: [{ id: 'selected-note', commitment: 'fictional-commitment-1' }],
    policy_commitment: 'fictional-policy-1', missingness: ['contents pending'],
    claim_ceiling: ['no empirical exteriority', 'no authority transfer']
  };
  const previous = { ...origin, id: 'fictional continuation B', current_ref: 'answer-B', predecessor_ref: 'answer-A', missingness: [] };
  const current = { ...previous, id: 'fictional continuation C', current_ref: 'answer-C', predecessor_ref: 'answer-B' };
  return { origin, previous, current, presentations: [{ ...current, id: 'child receiver' }, { ...current, id: 'auditor receiver' }] };
}

function exhibitSnapshots() {
  const origin = {
    id: 'fictional exhibit root', source_revision: 'exhibit-source-2',
    original_ref: 'exhibit-v1', current_ref: 'exhibit-v1', predecessor_ref: null,
    selected_commitments: [{ id: 'exhibit-a', commitment: 'declared-hash-a' }, { id: 'exhibit-b', commitment: 'declared-hash-b' }],
    policy_commitment: 'read-only-review', missingness: [],
    claim_ceiling: ['reference comparison only']
  };
  const current = { ...origin, id: 'fictional exhibit review', current_ref: 'exhibit-v2', predecessor_ref: 'exhibit-v1', missingness: ['external author unverified'] };
  return { origin, previous: origin, current, presentations: [{ ...current, id: 'review panel', selected_commitments: [...current.selected_commitments].reverse() }] };
}

function deepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  Object.values(value).forEach(deepFrozen);
}

test('Atlas separates original A, previous B, current C and receiver-invariant controls', () => {
  const input = loomSnapshots();
  const result = runAtlasContinuityAudit(input);
  assert.equal(result.schema, ATLAS_CONTINUITY_AUDIT_SCHEMA);
  assert.equal(result.audit.verdict, 'DECLARED_CONSISTENCY');
  assert.equal(result.audit.predecessor_link, 'DECLARED_LINK');
  assert.equal(result.differences.find(item => item.coordinate === 'current_ref').state, 'CHANGED');
  assert.equal(result.differences.find(item => item.coordinate === 'original_ref').state, 'PRESERVED');
  assert.equal(result.evidence_boundary.result_admission_verified, false);
  assert.equal(result.evidence_boundary.global_latest_established, false);
  assert.equal(result.evidence_boundary.fork_exclusion_established, false);
  assert.equal(result.evidence_boundary.replay_exclusion_established, false);
  deepFrozen(result);
  assert.equal(Object.isFrozen(input.current), false);
  assert.deepEqual(result, runAtlasContinuityAudit(input));
});

test('Atlas second proving workflow compares selected sets and retains advisory missingness changes', () => {
  const result = runAtlasContinuityAudit(exhibitSnapshots());
  assert.equal(result.audit.verdict, 'DECLARED_CONSISTENCY');
  assert.equal(result.differences.find(item => item.coordinate === 'missingness').state, 'CHANGED');
  assert.equal(result.receiver_comparisons[0].differences.find(item => item.coordinate === 'selected_commitments').state, 'PRESERVED');
  assert.equal(result.evidence_boundary.commitments_authenticated, false);
});

test('Atlas holds a forged predecessor and altered receiver controls', () => {
  const forged = loomSnapshots();
  forged.current.predecessor_ref = 'never-declared-parent';
  assert.equal(runAtlasContinuityAudit(forged).audit.predecessor_link, 'MISMATCH');
  assert.equal(runAtlasContinuityAudit(forged).audit.verdict, 'HOLD');
  for (const field of ['policy_commitment', 'source_revision', 'original_ref', 'claim_ceiling', 'selected_commitments']) {
    const input = loomSnapshots();
    input.presentations[0][field] = field === 'claim_ceiling' ? ['widened authority']
      : field === 'selected_commitments' ? [{ id: 'private-note', commitment: 'unauthorized-commitment' }] : 'altered-control';
    const report = runAtlasContinuityAudit(input);
    assert.equal(report.audit.verdict, 'HOLD');
    assert.equal(report.receiver_comparisons[0].differences.find(item => item.coordinate === field).state, 'CHANGED');
  }
});

test('Atlas matching fabricated declarations never become admitted or signature-verified results', () => {
  const input = exhibitSnapshots();
  input.origin.original_ref = 'fabricated-root';
  input.origin.current_ref = 'fabricated-root';
  input.current.original_ref = 'fabricated-root';
  input.current.predecessor_ref = 'fabricated-root';
  input.presentations[0].original_ref = 'fabricated-root';
  input.presentations[0].predecessor_ref = 'fabricated-root';
  const report = runAtlasContinuityAudit(input);
  assert.equal(report.audit.verdict, 'DECLARED_CONSISTENCY');
  for (const field of ['commitments_authenticated', 'source_revision_authenticated', 'result_admission_verified', 'signature_verification_performed', 'authority_transferred']) {
    assert.equal(report.evidence_boundary[field], false);
  }
});

test('Atlas distinguishes unknown from explicit withheld without inferring exclusions from silence', () => {
  const input = loomSnapshots();
  delete input.current.policy_commitment;
  input.current.selected_commitments = { withheld: true, reason: 'custodian retains local selection' };
  const report = runAtlasContinuityAudit(input);
  assert.equal(report.audit.verdict, 'HOLD');
  assert.equal(report.differences.find(item => item.coordinate === 'policy_commitment').state, 'UNKNOWN');
  assert.equal(report.differences.find(item => item.coordinate === 'selected_commitments').state, 'WITHHELD');
  assert.equal(report.origin_binding.find(item => item.coordinate === 'selected_commitments').to.reason, 'custodian retains local selection');
});

test('Atlas rejects malformed, sparse, duplicated, accessor and hidden declarations', () => {
  const sparse = loomSnapshots();
  sparse.current.selected_commitments = new Array(1);
  assert.throws(() => runAtlasContinuityAudit(sparse), /missing entries/);
  const duplicate = loomSnapshots();
  duplicate.current.selected_commitments.push({ ...duplicate.current.selected_commitments[0] });
  assert.throws(() => runAtlasContinuityAudit(duplicate), /duplicate id/);
  const accessor = loomSnapshots();
  Object.defineProperty(accessor.current, 'current_ref', { get() { throw new Error('must not execute'); }, enumerable: true });
  assert.throws(() => runAtlasContinuityAudit(accessor), /cannot contain accessors/);
  const hidden = loomSnapshots();
  Object.defineProperty(hidden.current, 'authority', { value: true });
  assert.throws(() => runAtlasContinuityAudit(hidden), /hidden fields/);
  const mismatchedRoot = loomSnapshots();
  mismatchedRoot.origin.current_ref = 'root-that-changed';
  assert.equal(runAtlasContinuityAudit(mismatchedRoot).audit.verdict, 'HOLD');
  assert.throws(() => runAtlasContinuityAudit({ ...loomSnapshots(), signature_verified: true }), /unsupported field/);
  assert.throws(() => runAtlasContinuityAudit({ ...loomSnapshots(), presentations: null }), /must be an array/);
});

function loomStages() {
  return [
    { id: 'before-admitted-activation', conditioning: { receiver: 'reference-host', stage: 'pending' }, support: ['REST', 'SEND_ACTIVATION'] },
    { id: 'after-admitted-activation', conditioning: { receiver: 'reference-host', stage: 'activated' }, support: ['REST', 'SEND_DOCUMENTS'] }
  ];
}

test('FADT exposes exact stage-erasure gap for fictional two-step governance', () => {
  const result = runFadtStageAudit({ states: loomStages(), retain: ['receiver'] });
  assert.equal(result.schema, FADT_STAGE_AUDIT_SCHEMA);
  assert.equal(result.verdict, 'HOLD');
  assert.deepEqual(result.erased_coordinates, ['stage']);
  const fibre = result.finite_audit.fibres[0];
  assert.deepEqual(fibre.union, ['REST', 'SEND_ACTIVATION', 'SEND_DOCUMENTS']);
  assert.deepEqual(fibre.intersection, ['REST']);
  assert.deepEqual(fibre.irreducible_gap, ['SEND_ACTIVATION', 'SEND_DOCUMENTS']);
  assert.equal(fibre.support_constant_on_fibre, false);
  assert.equal(result.evidence_boundary.stage_admission_verified, false);
  assert.equal(result.evidence_boundary.actions_executed, false);
  deepFrozen(result);
});

test('FADT preserves conditioning without manufacturing an action grant', () => {
  const result = runFadtStageAudit({ states: loomStages(), retain: ['receiver', 'stage'] });
  assert.equal(result.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(result.finite_audit.occupied_fibre_count, 2);
  assert.deepEqual(result.erased_coordinates, []);
  assert.equal(result.evidence_boundary.support_authenticated, false);
  assert.equal(result.evidence_boundary.authority_transferred, false);
});

test('FADT second proving workflow holds equal-cardinality incompatible exhibit custody supports', () => {
  const states = [
    { id: 'exhibit-sealed', conditioning: { exhibit: 'fictional-exhibit', custody: 'sealed' }, support: ['INSPECT_ENVELOPE', 'REST'] },
    { id: 'exhibit-reviewed', conditioning: { exhibit: 'fictional-exhibit', custody: 'reviewed' }, support: ['INSPECT_CONTENT', 'REST'] }
  ];
  const result = runFadtStageAudit({ states, retain: ['exhibit'] });
  assert.equal(result.verdict, 'HOLD');
  assert.deepEqual(result.finite_audit.fibres[0].irreducible_gap, ['INSPECT_CONTENT', 'INSPECT_ENVELOPE']);
  assert.deepEqual(result.finite_audit.fibres[0].largest_universally_sound_rule, ['REST']);
});

test('FADT exact report remains invariant under occupied-state and support order', () => {
  const states = loomStages();
  const left = runFadtStageAudit({ states, retain: ['receiver'] });
  const right = runFadtStageAudit({ states: [...states].reverse().map(item => ({ ...item, support: [...item.support].reverse() })), retain: ['receiver'] });
  assert.deepEqual(left, right);
  assert.equal(Object.isFrozen(states), false);
});

test('FADT rejects absent conditioning, sparse state/support arrays and unoccupied projection authority', () => {
  assert.throws(() => runFadtStageAudit({ states: [], retain: [] }), /occupied declared states/);
  assert.throws(() => runFadtStageAudit({ states: new Array(2), retain: [] }), /missing entries/);
  const missing = loomStages();
  delete missing[1].conditioning.stage;
  assert.throws(() => runFadtStageAudit({ states: missing, retain: ['receiver'] }), /same conditioning coordinates/);
  const sparseSupport = loomStages();
  sparseSupport[0].support = new Array(1);
  assert.throws(() => runFadtStageAudit({ states: sparseSupport, retain: ['receiver'] }), /missing entries/);
  assert.throws(() => runFadtStageAudit({ states: loomStages(), retain: ['nonexistent-state'] }), /Every retained coordinate/);
  const duplicate = loomStages();
  duplicate[1].id = duplicate[0].id;
  assert.throws(() => runFadtStageAudit({ states: duplicate, retain: [] }), /Duplicate declared state/);
});
