import assert from 'node:assert/strict';
import { compileAuthorityContext } from '../../app/engine/ash-constitutional-convergence.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration-binding.js';
import {
  compileOrderedRouteSequence,
  replayOrderedRouteSequence,
  verifyOrderedRouteSequence,
  verifyOrderedRouteSequenceReplay
} from '../../app/engine/ash-keep-ordered-route-sequence.js';
import { bindingInput, targetBundle } from './suite.mjs';

const digest = letter => `sha256:${letter.repeat(64)}`;
const calibrationBinding = await compileChoirCalibrationBinding(bindingInput);
const authorityContext = await compileAuthorityContext({
  caseId: targetBundle.caseMap.case_id,
  caseMapDigest: targetBundle.caseMap.case_map_digest,
  routeMemoryDigest: targetBundle.routeMemory.route_memory_digest,
  lifecycleRank: 'REBUILD_ELIGIBLE',
  current: true,
  closureStatus: 'OPEN'
});

const stepReceipts = {
  intake: digest('a'),
  aperture: digest('b'),
  choir: digest('c')
};

function steps(order, transitionLetter) {
  return order.map((stepId, index) => ({
    step_id: stepId,
    step_receipt_digest: stepReceipts[stepId],
    ...(index > 0 ? {
      transition_id: `${order[index - 1]}_to_${stepId}`,
      transition_receipt_digest: digest(transitionLetter),
      from_step_id: order[index - 1],
      to_step_id: stepId
    } : {})
  }));
}

const input = {
  recoveryId: 'orderedroute_verified_fixture',
  createdAt: '2026-07-16T21:00:00.000Z',
  caseMap: targetBundle.caseMap,
  routeMemory: targetBundle.routeMemory,
  authorityContext,
  calibrationBinding,
  target: {
    sequence_id: 'target_declared_route',
    state: 'OBSERVED',
    steps: steps(['intake', 'aperture', 'choir'], 'd'),
    result_components: { exposure_millipoints: 120, custody_millipoints: 80 }
  },
  controls: [
    {
      sequence_id: 'control_reordered',
      control_kind: 'REORDERED',
      state: 'OBSERVED',
      steps: steps(['aperture', 'intake', 'choir'], 'e'),
      result_components: { exposure_millipoints: 90, custody_millipoints: 76 }
    },
    {
      sequence_id: 'control_truncated',
      control_kind: 'TRUNCATED',
      state: 'OBSERVED',
      steps: steps(['intake', 'aperture'], 'f'),
      result_components: { exposure_millipoints: 70, custody_millipoints: 55 }
    }
  ]
};

const receipt = await compileOrderedRouteSequence(input);
assert.equal(receipt.state, 'ORDERED_SEQUENCE_ELIGIBLE');
assert.equal(receipt.sequence_recovery_eligible, true);
assert.equal(receipt.target.steps.length, 3);
assert.equal(receipt.controls.length, 2);
assert.equal(receipt.checks.target_receipt_continuity, true);
assert.equal(receipt.checks.reordered_control_observed, true);
assert.equal(receipt.checks.truncated_control_observed, true);
assert.equal(receipt.componentwise_sequence_deltas.exposure_millipoints[0].numerator, 30);
assert.equal(receipt.componentwise_sequence_deltas.exposure_millipoints[1].numerator, 50);
assert.equal(receipt.ordered_sequence_effect_is_causation, false);
assert.equal(receipt.surveillance_probability, null);
assert.equal(receipt.prediction_authorized, false);
assert.equal(receipt.release_authorized, false);
assert.equal(receipt.transport_authorized, false);
assert.equal(receipt.suppression_authorized, false);
assert.equal(receipt.cinder_action_authorized, false);
assert.equal(receipt.readers_reexecuted, false);
assert.equal(await verifyOrderedRouteSequence(receipt), true);

const replay = await replayOrderedRouteSequence(receipt, input);
assert.equal(replay.status, 'ORDERED_ROUTE_REPLAY_VERIFIED');
assert.equal(replay.exact_recomputation_verified, true);
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_called, false);
assert.equal(await verifyOrderedRouteSequenceReplay(replay), true);

const missingControl = await compileOrderedRouteSequence({ ...input, controls: input.controls.slice(0, 1) });
assert.equal(missingControl.state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(missingControl.sequence_recovery_eligible, false);

const duplicateStep = await compileOrderedRouteSequence({
  ...input,
  target: {
    ...input.target,
    steps: [input.target.steps[0], input.target.steps[0], input.target.steps[2]]
  }
});
assert.equal(duplicateStep.state, 'SEQUENCE_INTEGRITY_HOLD');
assert.equal(duplicateStep.sequence_recovery_eligible, false);

const tampered = await compileOrderedRouteSequence({
  ...input,
  controls: input.controls.map((control, index) => index ? control : {
    ...control,
    steps: control.steps.map((step, stepIndex) => stepIndex ? step : { ...step, step_receipt_digest: digest('9') })
  })
});
assert.equal(tampered.state, 'TAMPER_HOLD');
assert.equal(tampered.sequence_recovery_eligible, false);

const staleAuthority = await compileOrderedRouteSequence({
  ...input,
  authorityContext: { ...authorityContext, current: false }
});
assert.equal(staleAuthority.state, 'STALE_CASE_HOLD');
assert.equal(staleAuthority.sequence_recovery_eligible, false);

const cancelled = await compileOrderedRouteSequence({ ...input, cancelled: true });
assert.equal(cancelled.state, 'CANCELLED_HOLD');
assert.equal(cancelled.sequence_recovery_eligible, false);

console.log('ordered-route-sequence.test.mjs passed');
