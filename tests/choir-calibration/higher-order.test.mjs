import assert from 'node:assert/strict';
import { compileAuthorityContext } from '../../app/engine/ash-constitutional-convergence.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration-binding.js';
import {
  compileHigherOrderInterference,
  replayHigherOrderInterference,
  verifyHigherOrderInterference,
  verifyHigherOrderInterferenceReplay
} from '../../app/engine/ash-keep-higher-order-interference.js';
import { bindingInput, targetBundle } from './suite.mjs';

const calibrationBinding = await compileChoirCalibrationBinding(bindingInput);
const authorityContext = await compileAuthorityContext({
  caseId: targetBundle.caseMap.case_id,
  caseMapDigest: targetBundle.caseMap.case_map_digest,
  routeMemoryDigest: targetBundle.routeMemory.route_memory_digest,
  lifecycleRank: 'REBUILD_ELIGIBLE',
  current: true,
  closureStatus: 'OPEN'
});

const dimensions = ['route', 'reader', 'time'];
const observations = [];
for (let mask = 0; mask < 8; mask += 1) {
  const subset = dimensions.filter((_, index) => mask & (1 << index));
  const base = 10;
  const main = subset.includes('route') ? 2 : 0;
  const reader = subset.includes('reader') ? 3 : 0;
  const time = subset.includes('time') ? 5 : 0;
  const triple = subset.length === 3 ? 7 : 0;
  observations.push({ subset, state: 'OBSERVED', components: { exposure_millipoints: base + main + reader + time + triple } });
}

const input = {
  assayId: 'higherorder_verified_fixture',
  createdAt: '2026-07-16T20:00:00.000Z',
  dimensions,
  observations,
  caseMap: targetBundle.caseMap,
  routeMemory: targetBundle.routeMemory,
  authorityContext,
  calibrationBinding
};

const receipt = await compileHigherOrderInterference(input);
assert.equal(receipt.state, 'INTERFERENCE_ELIGIBLE');
assert.equal(receipt.interference_eligible, true);
assert.equal(receipt.order_k, 3);
assert.equal(receipt.required_subset_count, 8);
assert.equal(receipt.observed_subset_count, 8);
assert.equal(receipt.componentwise_residue.exposure_millipoints.numerator, 7);
assert.equal(receipt.componentwise_residue.exposure_millipoints.direction, 'POSITIVE');
assert.equal(receipt.emergent_residue_is_causation, false);
assert.equal(receipt.surveillance_probability, null);
assert.equal(receipt.release_authorized, false);
assert.equal(receipt.transport_authorized, false);
assert.equal(receipt.cinder_action_authorized, false);
assert.equal(await verifyHigherOrderInterference(receipt), true);

const replay = await replayHigherOrderInterference(receipt, input);
assert.equal(replay.status, 'HIGHER_ORDER_REPLAY_VERIFIED');
assert.equal(replay.exact_recomputation_verified, true);
assert.equal(replay.readers_reexecuted, false);
assert.equal(await verifyHigherOrderInterferenceReplay(replay), true);

const missing = await compileHigherOrderInterference({ ...input, observations: observations.slice(0, -1) });
assert.equal(missing.state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(missing.interference_eligible, false);
assert.ok(missing.failed_checks.some(value => value.startsWith('missing-required-subset')));

const cancelled = await compileHigherOrderInterference({ ...input, cancelled: true });
assert.equal(cancelled.state, 'CANCELLED_HOLD');
assert.equal(cancelled.interference_eligible, false);

const capped = await compileHigherOrderInterference({ ...input, maxSubsets: 4 });
assert.equal(capped.state, 'COMBINATORIAL_CAP_HOLD');
assert.equal(capped.interference_eligible, false);

const staleAuthority = await compileHigherOrderInterference({
  ...input,
  authorityContext: { ...authorityContext, current: false }
});
assert.equal(staleAuthority.state, 'TAMPER_HOLD');
assert.equal(staleAuthority.interference_eligible, false);

console.log('higher-order.test.mjs passed');
