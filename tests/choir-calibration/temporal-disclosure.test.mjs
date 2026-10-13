import assert from 'node:assert/strict';
import { compileAuthorityContext } from '../../app/engine/ash-constitutional-convergence.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration-binding.js';
import { compileOrderedRouteSequence } from '../../app/engine/ash-keep-ordered-route-sequence.js';
import {
  compileTemporalDisclosureAssay,
  replayTemporalDisclosureAssay,
  verifyTemporalDisclosureAssay,
  verifyTemporalDisclosureReplay
} from '../../app/engine/ash-keep-temporal-disclosure.js';
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

const stepReceipts = { intake: digest('a'), aperture: digest('b'), choir: digest('c') };
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

const sequenceInput = {
  recoveryId: 'orderedroute_temporal_fixture',
  createdAt: '2026-07-16T22:00:00.000Z',
  caseMap: targetBundle.caseMap,
  routeMemory: targetBundle.routeMemory,
  authorityContext,
  calibrationBinding,
  target: {
    sequence_id: 'target_temporal_route',
    state: 'OBSERVED',
    steps: steps(['intake', 'aperture', 'choir'], 'd'),
    result_components: { exposure_millipoints: 100, custody_millipoints: 80 }
  },
  controls: [
    {
      sequence_id: 'control_temporal_reordered',
      control_kind: 'REORDERED',
      state: 'OBSERVED',
      steps: steps(['aperture', 'intake', 'choir'], 'e'),
      result_components: { exposure_millipoints: 82, custody_millipoints: 72 }
    },
    {
      sequence_id: 'control_temporal_truncated',
      control_kind: 'TRUNCATED',
      state: 'OBSERVED',
      steps: steps(['intake', 'aperture'], 'f'),
      result_components: { exposure_millipoints: 65, custody_millipoints: 50 }
    }
  ]
};
const sequenceReceipt = await compileOrderedRouteSequence(sequenceInput);
assert.equal(sequenceReceipt.state, 'ORDERED_SEQUENCE_ELIGIBLE');

const disclosure = digest('1');
const resetDisclosure = digest('2');
const crossDisclosure = digest('3');
const input = {
  assayId: 'temporal_verified_fixture',
  createdAt: '2026-07-16T22:15:00.000Z',
  caseMap: targetBundle.caseMap,
  routeMemory: targetBundle.routeMemory,
  authorityContext,
  calibrationBinding,
  sequenceReceipt,
  sourceDigest: digest('4'),
  readerRegistryDigest: digest('5'),
  observations: [
    {
      observation_id: 'within_immediate',
      control_kind: 'IMMEDIATE',
      session_id: 'session-a',
      session_boundary_digest: digest('6'),
      position: 0,
      monotonic_offset_ms: 0,
      disclosure_digest: disclosure,
      result_components: { exposure_millipoints: 100, custody_millipoints: 80 }
    },
    {
      observation_id: 'within_delayed',
      control_kind: 'DELAYED',
      session_id: 'session-a',
      session_boundary_digest: digest('6'),
      position: 1,
      monotonic_offset_ms: 1200,
      disclosure_digest: disclosure,
      result_components: { exposure_millipoints: 120, custody_millipoints: 84 }
    },
    {
      observation_id: 'within_none',
      control_kind: 'NO_DISCLOSURE',
      session_id: 'session-a',
      session_boundary_digest: digest('6'),
      position: 2,
      monotonic_offset_ms: 2400,
      disclosure_digest: null,
      result_components: { exposure_millipoints: 60, custody_millipoints: 52 }
    },
    {
      observation_id: 'reset_before',
      control_kind: 'RESET_BEFORE',
      session_id: 'session-a',
      session_boundary_digest: digest('6'),
      position: 3,
      monotonic_offset_ms: 3600,
      disclosure_digest: resetDisclosure,
      context_reset_id: 'reset-1',
      reset_epoch: 0,
      result_components: { exposure_millipoints: 90, custody_millipoints: 70 }
    },
    {
      observation_id: 'reset_after',
      control_kind: 'RESET_AFTER',
      session_id: 'session-a',
      session_boundary_digest: digest('6'),
      position: 4,
      monotonic_offset_ms: 4800,
      disclosure_digest: resetDisclosure,
      context_reset_id: 'reset-1',
      reset_epoch: 1,
      result_components: { exposure_millipoints: 95, custody_millipoints: 73 }
    },
    {
      observation_id: 'cross_baseline',
      control_kind: 'CROSS_SESSION_BASELINE',
      session_id: 'session-b',
      session_boundary_digest: digest('7'),
      position: 0,
      monotonic_offset_ms: 0,
      disclosure_digest: crossDisclosure,
      result_components: { exposure_millipoints: 105, custody_millipoints: 75 }
    },
    {
      observation_id: 'cross_delayed',
      control_kind: 'CROSS_SESSION_DELAYED',
      session_id: 'session-c',
      session_boundary_digest: digest('8'),
      position: 0,
      monotonic_offset_ms: 0,
      operator_declared_spacing_ms: 86400000,
      disclosure_digest: crossDisclosure,
      result_components: { exposure_millipoints: 110, custody_millipoints: 77 }
    }
  ]
};

const receipt = await compileTemporalDisclosureAssay(input);
assert.equal(receipt.state, 'TEMPORAL_ASSAY_ELIGIBLE');
assert.equal(receipt.temporal_assay_eligible, true);
assert.equal(receipt.checks.within_session_delay_observed, true);
assert.equal(receipt.checks.cross_session_declared_spacing_observed, true);
assert.equal(receipt.checks.context_reset_comparison_observed, true);
assert.equal(receipt.componentwise_temporal_results.exposure_millipoints.within_session_delay.numerator, 20);
assert.equal(receipt.componentwise_temporal_results.exposure_millipoints.no_disclosure_contrast.numerator, 60);
assert.equal(receipt.componentwise_temporal_results.exposure_millipoints.context_reset_comparison.numerator, 5);
assert.equal(receipt.componentwise_temporal_results.exposure_millipoints.cross_session_declared_spacing.numerator, 5);
assert.equal(receipt.trusted_external_time_observed, false);
assert.equal(receipt.browser_clock_is_trusted_time, false);
assert.equal(receipt.operator_declared_spacing_is_trusted_time, false);
assert.equal(receipt.temporal_effect_is_causation, false);
assert.equal(receipt.prediction_authorized, false);
assert.equal(receipt.release_authorized, false);
assert.equal(receipt.transport_authorized, false);
assert.equal(receipt.cinder_action_authorized, false);
assert.equal(await verifyTemporalDisclosureAssay(receipt), true);

const replay = await replayTemporalDisclosureAssay(receipt, input);
assert.equal(replay.status, 'TEMPORAL_DISCLOSURE_REPLAY_VERIFIED');
assert.equal(replay.exact_recomputation_verified, true);
assert.equal(replay.readers_reexecuted, false);
assert.equal(await verifyTemporalDisclosureReplay(replay), true);

const missingSlice = await compileTemporalDisclosureAssay({
  ...input,
  observations: input.observations.map(value => value.observation_id === 'within_delayed' ? { ...value, state: 'MISSING', result_components: {} } : value)
});
assert.equal(missingSlice.state, 'MISSING_INTERVAL_HOLD');
assert.equal(missingSlice.temporal_assay_eligible, false);

const staleSequence = await compileTemporalDisclosureAssay({
  ...input,
  sequenceReceipt: { ...sequenceReceipt, sequence_recovery_eligible: false }
});
assert.equal(staleSequence.state, 'SEQUENCE_COMPATIBILITY_HOLD');

const externalTime = await compileTemporalDisclosureAssay({ ...input, claimTrustedExternalTime: true });
assert.equal(externalTime.state, 'CLOCK_AMBIGUITY_HOLD');

const leaked = await compileTemporalDisclosureAssay({ ...input, providerCalled: true });
assert.equal(leaked.state, 'LEAKAGE_HOLD');

const tampered = await compileTemporalDisclosureAssay({
  ...input,
  observations: input.observations.map(value => value.observation_id === 'within_immediate' ? { ...value, disclosure_digest: 'sha256:not-a-digest' } : value)
});
assert.equal(tampered.state, 'TAMPER_HOLD');

const cancelled = await compileTemporalDisclosureAssay({ ...input, cancelled: true });
assert.equal(cancelled.state, 'CANCELLED_HOLD');

console.log('temporal-disclosure.test.mjs passed');
