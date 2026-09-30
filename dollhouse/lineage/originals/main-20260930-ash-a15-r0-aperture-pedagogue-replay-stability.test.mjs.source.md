import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_REPLAY_STABILITY_SCHEMA,
  runAperturePedagogueReplayStabilityGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-replay-stability.js';
import {
  APERTURE_V32_REPLAY_STABILITY
} from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const receipt = runAperturePedagogueReplayStabilityGauntlet();

assert.equal(receipt.schema, APERTURE_PEDAGOGUE_REPLAY_STABILITY_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.experiment_host, 'DOME_WORLD_A15_R0');

const structural = receipt.replay_families.structural_interior;
assert.equal(structural.replay_count, 9);
assert.equal(structural.diagnostic_stable, true);
assert.equal(structural.question_selection_stable, true);
assert.ok(structural.replays.every(item => item.diagnostic.deficit_class === 'STRUCTURAL_RANK_DEFICIT'));
assert.ok(structural.replays.every(item => item.diagnostic.disposition === 'PROPOSE'));
assert.ok(structural.replays.every(item => item.selected_probe_id === 'R_ORTH'));
assert.equal(structural.classification, 'STABLE_STRUCTURAL_INTERIOR_WITHIN_DECLARED_THRESHOLD_ENVELOPE');

const threshold = receipt.replay_families.threshold_boundary;
assert.equal(threshold.diagnostic_stable, false);
assert.equal(threshold.expected_boundary_exposed, true);
assert.deepEqual(threshold.replays.map(item => item.sigma_min_floor), [0.24,0.25,0.26]);
assert.deepEqual(threshold.replays.map(item => item.deficit_class), [
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NUMERICAL_STABILITY_DEFICIT'
]);
assert.ok(threshold.replays.every(item => item.sigma_min === 0.25));
assert.ok(threshold.replays.every(item => item.condition_number === 4));
assert.equal(threshold.classification, 'THRESHOLD_SENSITIVE_DIAGNOSTIC_CLASSIFICATION');

const noise = receipt.replay_families.noise_model_boundary;
assert.equal(noise.raw_operator_unchanged, true);
assert.equal(noise.diagnostic_stable, false);
assert.equal(noise.expected_boundary_exposed, true);
assert.deepEqual(noise.replays.map(item => item.rho), [0.978,0.98,0.982]);
assert.ok(noise.replays.every(item => item.covariance_status === 'VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE'));
assert.deepEqual(noise.replays.map(item => item.deficit_class), [
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
  'NUMERICAL_STABILITY_DEFICIT'
]);
assert.ok(noise.replays[0].condition_number > 9.47 && noise.replays[0].condition_number < 9.50);
assert.ok(noise.replays[1].condition_number > 9.94 && noise.replays[1].condition_number < 9.96);
assert.ok(noise.replays[2].condition_number > 10.48 && noise.replays[2].condition_number < 10.51);
assert.equal(noise.classification, 'VALID_NOISE_MODEL_PERTURBATION_CAN_CHANGE_DIAGNOSTIC_CLASSIFICATION');

const selection = receipt.replay_families.selection_boundary;
assert.equal(selection.diagnostic_stable, true);
assert.equal(selection.question_selection_stable, false);
assert.equal(selection.expected_selection_flip, true);
assert.deepEqual(selection.replays.map(item => item.rho), [0.545,0.547]);
assert.ok(selection.replays.every(item => item.deficit_class === 'STRUCTURAL_RANK_DEFICIT'));
assert.ok(selection.replays.every(item => item.disposition === 'PROPOSE'));
assert.deepEqual(selection.replays.map(item => item.selected_probe_id), ['P_ORTH','P_DIAG']);
assert.equal(selection.classification, 'DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY');

const controls = receipt.replay_families.invalid_incomplete_controls;
assert.equal(controls.categorical_gate_preserved, true);
assert.equal(controls.incomplete.deficit_class, 'NOISE_GEOMETRY_INCOMPLETE');
assert.equal(controls.incomplete.selected_probe_id, null);
assert.equal(controls.invalid.deficit_class, 'INVALID_NOISE_GEOMETRY');
assert.equal(controls.invalid.selected_probe_id, null);

assert.ok(receipt.replay_dimensions.includes('diagnostic_class'));
assert.ok(receipt.replay_dimensions.includes('selected_probe'));
assert.ok(receipt.bounded_results.includes('DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE'));
assert.ok(receipt.anti_equivalences.includes('diagnostic stability != question-selection stability'));
assert.equal(receipt.no_scalar_crown, true);
assert.equal(receipt.installed_aperture_replay_flag_mutated, false);
assert.equal(receipt.installed_aperture_replay_flag_expected, 'HELD_NOT_YET_WITNESSED');
assert.equal(APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.automatic_execution, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.standalone_aperture_ui_mutated, false);
assert.equal(receipt.human_closure_required, true);
for (const claim of Object.values(receipt.claims)) assert.equal(claim, false);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_REPLAY_STABILITY_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec, /diagnostic stability\s*!=\s*question-selection stability/);
assert.match(spec, /THRESHOLD_SENSITIVE_DIAGNOSTIC_CLASSIFICATION/);
assert.match(spec, /DIAGNOSTIC_STABILITY_WITH_QUESTION_SELECTION_SENSITIVITY/);
assert.match(spec, /No claim that `0\.25` is a universal stability floor/);
assert.match(spec, /installed Aperture classification_replay_stability[\s\S]*remains HELD_NOT_YET_WITNESSED/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  structural_replay_count:structural.replay_count,
  structural_diagnostic_stable:structural.diagnostic_stable,
  threshold_classes:threshold.replays.map(item => item.deficit_class),
  noise_conditions:noise.replays.map(item => ({rho:item.rho,condition_number:item.condition_number,deficit_class:item.deficit_class})),
  selection_replay:selection.replays.map(item => ({rho:item.rho,deficit_class:item.deficit_class,selected_probe_id:item.selected_probe_id})),
  no_scalar_crown:receipt.no_scalar_crown,
  installed_replay_flag:APERTURE_V32_REPLAY_STABILITY,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
