import assert from 'node:assert/strict';
import {
  CHOIR_CALIBRATION_REPLAY_SCHEMA,
  replayChoirCalibrationBinding,
  verifyChoirCalibrationReplay
} from '../../app/engine/ash-keep-choir-calibration.js';
import { bindingInput } from './suite.mjs';
import { binding } from './eligible.test.mjs';

const replay = await replayChoirCalibrationBinding(binding, { ...bindingInput, replayId: 'choircalreplay_verified_fixture' });
assert.equal(replay.schema, CHOIR_CALIBRATION_REPLAY_SCHEMA);
assert.equal(replay.status, 'CHOIR_CALIBRATION_REPLAY_VERIFIED');
assert.equal(replay.componentwise_comparison_recomputed, false);
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_called, false);
assert.equal(replay.transport_authorized, false);
assert.equal(replay.automatic_hold, false);
assert.equal(await verifyChoirCalibrationReplay(replay), true);

const tamperedBinding = structuredClone(binding);
tamperedBinding.calibration_eligible = false;
const heldReplay = await replayChoirCalibrationBinding(tamperedBinding, { ...bindingInput, replayId: 'choircalreplay_held_fixture' });
assert.equal(heldReplay.status, 'CHOIR_CALIBRATION_REPLAY_HELD');
assert.equal(heldReplay.readers_reexecuted, false);
