import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  compileAshLiveActionPlan,
  compileAshLiveActionReceipt,
  compileAshLiveRenderReceipt,
  deriveAshLiveAnimationPlan,
  verifyAshLivePresentationBoundary
} from '../app/engine/ash-live-aia.js';

const lifecycle = (state, nextAction, overrides = {}) => ({
  schema: 'td613.ash.lifecycle/v0.1',
  state,
  next_action: nextAction,
  gates: {
    custody: true,
    map: Boolean(overrides.caseId),
    rooms: Boolean(overrides.caseBound),
    routes: Boolean(overrides.caseBound),
    test: Boolean(overrides.caseBound),
    draft: Boolean(overrides.rebuild),
    local_release: Boolean(overrides.review),
    save: Boolean(overrides.release)
  },
  holds: overrides.holds || [],
  references: {
    readiness_receipt: overrides.readiness || null,
    custody_receipt: overrides.custody || null,
    case_id: overrides.caseId || null,
    case_map_digest: overrides.caseMapDigest || null,
    rebuild_test: overrides.rebuild || null,
    draft: overrides.draft || null,
    release_receipt: overrides.release || null,
    save_point: overrides.save || null
  },
  non_authority: [
    'readiness is not custody',
    'custody is not authenticity',
    'case binding is not truth',
    'rebuild eligibility is not release authority',
    'continuity is not transport'
  ]
});

const before = lifecycle('CUSTODY_ROOT_VERIFIED', 'CREATE_CASE', {
  readiness: 'ash_readiness_1',
  custody: 'ash_custody_1'
});
const after = lifecycle('CASE_BOUND', 'RUN_CURRENT_REBUILD_TEST', {
  readiness: 'ash_readiness_1',
  custody: 'ash_custody_1',
  caseId: 'case_1',
  caseMapDigest: 'sha256:case-map',
  caseBound: true,
  holds: ['CURRENT_REBUILD_TEST_ABSENT']
});

const cryptoOptions = {
  frozenClock: '2026-07-20T06:13:00.000Z',
  idSeed: 'ash-live-aia-test',
  cryptoImpl: webcrypto
};

test('live AIA action planning maps exact lifecycle next actions without automatic authority', () => {
  const plan = compileAshLiveActionPlan(after);
  assert.equal(plan.command_id, 'runTest');
  assert.equal(plan.workspace, 'test');
  assert.equal(plan.operator_confirmation_required, true);
  assert.equal(plan.automatic_advance, false);
  assert.equal(plan.animation_commands_station, false);
  assert.equal(plan.station_owner, 'Ash');
  assert.equal(plan.empirical_posture.child_legible_design, true);
  assert.equal(plan.empirical_posture.adult_human_evidence_present, false);
  assert.equal(plan.empirical_posture.child_study_authorized, false);
  assert.equal(plan.empirical_posture.telemetry_present, false);
  assert.equal(plan.closure.status, 'OPEN');
});

test('animation plan is deterministic, finite, interruptible, and semantically invariant', () => {
  const left = deriveAshLiveAnimationPlan(before, after, 'EXPERIENTIAL', false);
  const right = deriveAshLiveAnimationPlan(before, after, 'EXPERIENTIAL', false);
  assert.deepEqual(left, right);
  assert.equal(left.mode, 'FINITE_GESTURE_TRIGGERED_CAUSAL_SEQUENCE');
  assert.equal(left.trigger, 'EXPLICIT_HUMAN_GESTURE_OR_EXPLICIT_REPLAY');
  assert.equal(left.autoplay_authority, false);
  assert.equal(left.station_command_authority, false);
  assert.equal(left.finite, true);
  assert.equal(left.interruptible, true);
  assert.equal(left.replay_reperforms_ash_action, false);
  assert.equal(left.continuous_animation, false);
  assert.equal(left.changed.case_map_digest_changed, true);
  assert.ok(left.semantic_topology.includes('source remains local'));
  assert.ok(left.semantic_topology.includes('case root changes only after explicit binding'));
});

test('reduced-motion plan preserves complete causal sequence as numbered frames', () => {
  const plan = deriveAshLiveAnimationPlan(before, after, 'CUSTODIAL', true);
  assert.equal(plan.mode, 'NUMBERED_STATIC_CAUSAL_FRAMES');
  assert.equal(plan.duration_ms, 0);
  assert.equal(plan.steps.length, 6);
  assert.equal(plan.steps.some(step => step.id === 'case-root' && step.complete), true);
  assert.equal(plan.steps.some(step => step.held), true);
});

test('action receipt is deterministic and records observed state rather than predicted success', async () => {
  const actionPlan = compileAshLiveActionPlan(before);
  const input = {
    beforeLifecycle: before,
    afterLifecycle: after,
    actionPlan,
    gesture: { type: 'button', target_id: 'newCase', confirmed: true },
    outcome: 'OBSERVED_AFTER_EXPLICIT_GESTURE'
  };
  const left = await compileAshLiveActionReceipt(input, cryptoOptions);
  const right = await compileAshLiveActionReceipt(input, cryptoOptions);
  assert.equal(left.receipt_digest, right.receipt_digest);
  assert.equal(left.before.state, 'CUSTODY_ROOT_VERIFIED');
  assert.equal(left.after.state, 'CASE_BOUND');
  assert.equal(left.gesture.confirmed, true);
  assert.equal(left.raw_content_recorded, false);
  assert.equal(left.transport_performed_by_membrane, false);
  assert.equal(left.station_authority_transferred, false);
  assert.equal(left.automatic_advance, false);
  assert.deepEqual(verifyAshLivePresentationBoundary(left), { valid: true, violations: [] });
});

test('action receipt rejects raw draft content from the presentation receipt lane', async () => {
  await assert.rejects(() => compileAshLiveActionReceipt({
    beforeLifecycle: before,
    afterLifecycle: after,
    actionPlan: compileAshLiveActionPlan(before),
    gesture: { type: 'button', target_id: 'newCase', confirmed: true, body: 'forbidden raw text' }
  }, cryptoOptions), /raw content/);
});

test('render receipt accepts only claims derived from the verified package', async () => {
  const animationPlan = deriveAshLiveAnimationPlan(before, after, 'EXPERIENTIAL', false);
  const packageView = {
    package_digest: 'sha256:package',
    lifecycle: after,
    lifecycle_receipt: { receipt_id: 'life_1' },
    pedagogue_receipt: { receipt_id: 'ped_1' },
    comprehension_contract: {
      what_stayed_local: 'Artifact bytes remain outside the Case Map.',
      what_ash_created: 'A custody root node.',
      what_changed_in_case: 'The Case Map digest changed.',
      what_remains_unauthorized: 'Binding does not prove truth.',
      what_may_happen_next: 'Run a current Rebuild Test or rest.'
    }
  };
  const receipt = await compileAshLiveRenderReceipt({ packageView, route: 'EXPERIENTIAL', animationPlan }, cryptoOptions);
  assert.equal(receipt.claims_derived_from_package, true);
  assert.equal(receipt.reduced_motion_equivalent_present, true);
  assert.equal(receipt.telemetry_present, false);
  assert.equal(receipt.commands_station, false);
  assert.equal(receipt.automatic_ash_action, false);
  await assert.rejects(() => compileAshLiveRenderReceipt({
    packageView,
    route: 'EXPERIENTIAL',
    animationPlan,
    visibleClaims: ['Ash proved authenticity.']
  }, cryptoOptions), /derivable/);
});
