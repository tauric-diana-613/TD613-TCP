import assert from 'node:assert/strict';
import {
  CHOIR_CALIBRATION_BINDING_SCHEMA,
  compileChoirCalibrationBinding,
  verifyChoirCalibrationBinding
} from '../../app/engine/ash-keep-choir-calibration.js';
import { bindingInput, controlBank } from './suite.mjs';

export const binding = await compileChoirCalibrationBinding(bindingInput);
assert.equal(binding.schema, CHOIR_CALIBRATION_BINDING_SCHEMA);
assert.equal(binding.binding_state, 'CALIBRATION_ELIGIBLE');
assert.equal(binding.calibration_eligible, true);
assert.equal(binding.free_calibration_booleans_accepted, false);
assert.equal(binding.binding_checks.verified_receipts, true);
assert.equal(binding.binding_checks.current_case_binding, true);
assert.equal(binding.binding_checks.receipt_case_binding, true);
assert.equal(binding.binding_checks.source_drift_held, true);
assert.equal(binding.binding_checks.control_bank_eligible, true);
assert.equal(binding.universal_calibration_score, null);
assert.equal(binding.real_surveillance_probability, null);
assert.equal(binding.readers_executed_by_binding, false);
assert.equal(binding.provider_call_performed, false);
assert.equal(binding.network_called, false);
assert.equal(binding.storage_mutated, false);
assert.equal(binding.release_authorized, false);
assert.equal(binding.transport_authorized, false);
assert.equal(binding.cinder_action_authorized, false);
assert.equal(binding.automatic_hold, false);
assert.equal(binding.automatic_ash_action, false);
assert.deepEqual(binding.componentwise_comparison.set_components, controlBank.set_component_comparisons);
assert.equal(await verifyChoirCalibrationBinding(binding), true);

await assert.rejects(
  compileChoirCalibrationBinding({ ...bindingInput, calibration: { benignControl: true } }),
  /rejects free calibration claims/
);
