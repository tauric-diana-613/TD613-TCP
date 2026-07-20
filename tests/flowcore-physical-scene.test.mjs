import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { webcrypto } from 'node:crypto';

import {
  compilePhysicalFlowCoreModel,
  compilePhysicalFlowCoreScene,
  PHYSICAL_FLOWCORE_MODEL_SCHEMA,
  PHYSICAL_FLOWCORE_PACKAGE_SCHEMA
} from '../app/engine/flowcore-physical-scene.js';

const fixture = () => JSON.parse(fs.readFileSync('app/dome-world/fixtures/pedagogue/physical-flowcore-cycle.json', 'utf8'));
const options = { cryptoImpl: webcrypto };

test('P8 physical ledger computes bounded integer energy accounting', () => {
  const model = compilePhysicalFlowCoreModel(fixture().model_input);
  assert.equal(model.schema, PHYSICAL_FLOWCORE_MODEL_SCHEMA);
  assert.equal(model.mechanical_ledger.potential_capacity_millijoules, 1_961_330);
  assert.equal(model.mechanical_ledger.lifted_stored_millijoules, 1_961_330);
  assert.equal(model.mechanical_ledger.lift_loss_millijoules, 538_670);
  assert.equal(model.mechanical_ledger.descent_available_millijoules, 1_667_130);
  assert.equal(model.mechanical_ledger.pipe_friction_loss_millijoules, 166_713);
  assert.equal(model.mechanical_ledger.delivered_work_millijoules, 1_500_417);
  assert.equal(model.mechanical_ledger.optional_output_millijoules, 1_000_000);
  assert.equal(model.mechanical_ledger.unserved_optional_load_millijoules, 0);
  assert.equal(model.mechanical_ledger.next_reserve_millijoules, 1_000_417);
  assert.equal(model.mechanical_ledger.essential_reserve_protected, true);
  assert.ok(model.mechanical_ledger.delivered_work_millijoules < model.mechanical_ledger.lifted_stored_millijoules);
});

test('P8 keeps the thermal ledger mechanically unavailable without a converter', () => {
  const model = compilePhysicalFlowCoreModel(fixture().model_input);
  assert.equal(model.thermal_ledger.stored_thermal_energy_millijoules, 750_000);
  assert.equal(model.thermal_ledger.converter_present, false);
  assert.equal(model.thermal_ledger.thermal_to_mechanical_transfer_millijoules, 0);
  assert.equal(model.thermal_ledger.mechanically_spendable, false);
  assert.ok(model.equations.includes('thermal_store ≠ mechanical_reserve without a modeled converter'));
});

test('P8 refuses essential-service dependence, unprotected reserve, and undeclared conversion', () => {
  const base = fixture().model_input;
  assert.throws(() => compilePhysicalFlowCoreModel({ ...base, participant_input_class: 'ESSENTIAL_SERVICE' }), /optional surplus/i);
  assert.throws(() => compilePhysicalFlowCoreModel({ ...base, prior_reserve_millijoules: 399_999 }), /essential reserve/i);
  assert.throws(() => compilePhysicalFlowCoreModel({ ...base, thermal_converter_present: true }), /does not yet model/i);
  assert.throws(() => compilePhysicalFlowCoreModel({ ...base, lift_efficiency_ppm: 1_000_001 }), /parts-per-million|safe integer/i);
});

test('optional output can never cross the protected reserve floor', () => {
  const base = fixture().model_input;
  const model = compilePhysicalFlowCoreModel({
    ...base,
    mechanical_input_millijoules: 0,
    optional_surplus_load_millijoules: 1_000_000
  });
  assert.equal(model.mechanical_ledger.delivered_work_millijoules, 0);
  assert.equal(model.mechanical_ledger.optional_output_millijoules, 100_000);
  assert.equal(model.mechanical_ledger.unserved_optional_load_millijoules, 900_000);
  assert.equal(model.mechanical_ledger.next_reserve_millijoules, 400_000);
  assert.equal(model.child_safety.essential_service_depends_on_participant_input, false);
  assert.equal(model.child_safety.participant_nonperformance_penalty, false);
});

test('P8 compiles a complete consequence-first scene with four bounded AIA views', async () => {
  const packageView = await compilePhysicalFlowCoreScene(fixture(), options);
  assert.equal(packageView.schema, PHYSICAL_FLOWCORE_PACKAGE_SCHEMA);
  assert.equal(packageView.receipt_verification.valid, true);
  assert.deepEqual(packageView.phase_sequence.map(item => item.phase), ['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST']);
  assert.deepEqual(Object.keys(packageView.aia_views), ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
  assert.equal(packageView.aia_invariant_report.all_invariants_preserved, true);
  assert.equal(packageView.aia_invariant_report.authority_transferred, false);
  assert.equal(packageView.child_safety.essential_service_depends_on_participant_input, false);
  assert.equal(packageView.child_safety.essential_reserve_floor_protected, true);
  assert.equal(packageView.authority.flowcore_commands_physical_system, false);
  assert.equal(packageView.authority.essential_service_control_authorized, false);
  assert.equal(packageView.authority.automatic_ash_action, false);
  assert.equal(packageView.authority.release_authorized, false);
  assert.equal(packageView.closure.status, 'OPEN');
  for (const frame of Object.values(packageView.reduced_mobile_frames)) {
    assert.equal(frame.reduced_motion, true);
    assert.equal(frame.viewport.layout, 'SINGLE_COLUMN_390');
    assert.equal(frame.scheduler.owns_animation_loop, false);
    assert.equal(frame.viewport.horizontal_overflow_allowed, false);
  }
});

test('P8 scene package is deterministic under the frozen fixture', async () => {
  const left = await compilePhysicalFlowCoreScene(fixture(), options);
  const right = await compilePhysicalFlowCoreScene(fixture(), options);
  assert.equal(left.package_id, right.package_id);
  assert.equal(left.package_digest, right.package_digest);
  assert.equal(left.pedagogue_receipt.receipt_digest, right.pedagogue_receipt.receipt_digest);
  assert.deepEqual(left.model, right.model);
});

test('P8 static proving surface exposes ledgers, controls, mobile, and reduced-motion parity', () => {
  const html = fs.readFileSync('app/dome-world/physical-flowcore.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/physical-flowcore.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/physical-flowcore.css', 'utf8');
  const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/flowcore-physical-scene-v01.schema.json', 'utf8'));
  assert.match(html, /data-route-nav/);
  assert.match(html, /Optional surplus only/);
  assert.match(html, /Thermal storage kept on a separate ledger/);
  for (const control of ['data-rest', 'data-return', 'data-replay', 'data-exit']) assert.match(html, new RegExp(control));
  assert.match(js, /compilePhysicalFlowCoreScene/);
  assert.match(js, /Mechanical ledger/);
  assert.match(js, /Thermal ledger/);
  assert.doesNotMatch(js, /requestAnimationFrame/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.equal(schema.$id, 'td613.flowcore.physical-scene/v0.1');
});
