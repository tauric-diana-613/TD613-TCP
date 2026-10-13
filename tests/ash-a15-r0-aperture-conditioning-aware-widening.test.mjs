import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_CONDITIONING_WIDENING_SCHEMA,
  normalizeProbeRow,
  singularValuePosture2,
  evaluateConditioningCandidate,
  selectConditioningAwareWidening,
  runAperturePedagogueConditioningWideningGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-conditioning-widening.js';

const base = [[1,0]];
const probes = [
  { probe_id:'P_DUP', gradient:[1,0] },
  { probe_id:'P_NEAR', gradient:[1,0.001] },
  { probe_id:'P_ORTH', gradient:[0,1] }
];

assert.deepEqual(normalizeProbeRow([0,1000]), [0,1]);
assert.throws(() => normalizeProbeRow([0,0]), /cannot be normalized/);
assert.throws(() => singularValuePosture2([[1,0,0]]), /two-column/);

const duplicate = evaluateConditioningCandidate(base, probes[0]);
const near = evaluateConditioningCandidate(base, probes[1]);
const orth = evaluateConditioningCandidate(base, probes[2]);
const scaledOrth = evaluateConditioningCandidate(base, { probe_id:'P_ORTH_SCALED', gradient:[0,1000] });

assert.equal(duplicate.rank_lift, 0);
assert.equal(duplicate.conditioning_status, 'SINGULAR');
assert.equal(duplicate.condition_number_2, null);
assert.equal(near.rank_lift, 1);
assert.ok(near.sigma_min > 0.0007 && near.sigma_min < 0.00071);
assert.ok(near.condition_number_2 > 1999 && near.condition_number_2 < 2001);
assert.equal(orth.rank_lift, 1);
assert.equal(orth.sigma_min, 1);
assert.equal(orth.sigma_max, 1);
assert.equal(orth.condition_number_2, 1);
assert.deepEqual(scaledOrth.normalized_gradient, orth.normalized_gradient);
assert.equal(scaledOrth.condition_number_2, orth.condition_number_2);

const selection = selectConditioningAwareWidening(base, probes);
assert.equal(selection.selected_probe_id, 'P_ORTH');
assert.equal(selection.selected_rank_lift, 1);
assert.equal(selection.selected_sigma_min, 1);
assert.equal(selection.selected_condition_number_2, 1);
assert.equal(selection.oracle_identity_consulted, false);
assert.equal(selection.held_out_used_for_selection, false);
assert.equal(selection.automatic_widening_execution, false);

const receipt = runAperturePedagogueConditioningWideningGauntlet();
assert.equal(receipt.schema, APERTURE_PEDAGOGUE_CONDITIONING_WIDENING_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.pedagogue_rank_only_baseline.selected_probe_id, 'P_NEAR');
assert.equal(receipt.pedagogue_rank_only_baseline.law_retained, true);
assert.equal(receipt.aperture_conditioning_selection.selected_probe_id, 'P_ORTH');
assert.equal(receipt.operator_basis.held_out_used_for_selection, false);

const byId = Object.fromEntries(receipt.candidate_receipts.map(item => [item.probe_id, item]));
assert.equal(byId.P_DUP.validation_classification, 'RANK_DEFICIENT');
assert.equal(byId.P_NEAR.validation_classification, 'FULL_RANK_FRAGILE_UNDER_DECLARED_SCALE_NOISE_POSTURE');
assert.equal(byId.P_ORTH.validation_classification, 'FULL_RANK_ROBUST_RELATIVE_TO_CANDIDATE_FAMILY');
assert.ok(byId.P_NEAR.perturbation_reconstruction_error > 19);
assert.ok(byId.P_ORTH.perturbation_reconstruction_error < 0.02);
assert.ok(byId.P_NEAR.held_out_residual > 20);
assert.ok(byId.P_ORTH.held_out_residual < 0.021);

assert.equal(receipt.bounded_result, 'CONDITIONING_AWARE_IDENTIFIABILITY_REFINEMENT_CANDIDATE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /rank lift can establish formal local identifiability/);
assert.deepEqual(receipt.aperture_laws, [
  'widening != validation',
  'rank_lift != practical_recoverability',
  'formal_identifiability != stable_reconstruction'
]);
assert.equal(receipt.abstention, 'NO_AUTONOMOUS_WIDENING_OR_VALIDATION_AUTHORITY');
assert.equal(receipt.next_learning_action, 'TEST_DECLARED_NOISE_COVARIANCE_AND_WHITENED_OPERATOR_GEOMETRY_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION');

for (const claim of [
  'optimal_experimental_design','active_learning_theorem','fisher_information_optimality',
  'physical_sensor_design','physical_tomography','blind_tomography','operator_tomography',
  'live_td613_reconstruction','autonomous_aperture_widening','autonomous_experiment_execution',
  'connection','curvature','holonomy','quantum_behavior','proto_loom','production_authority'
]) assert.equal(receipt.claims[claim], false, `${claim} must remain false`);

assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.standalone_aperture_ui_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CONDITIONING_WIDENING_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /rank lift can be mathematically real while reconstruction remains numerically fragile/i);
assert.match(spec, /widening increases observability; widening does not manufacture validity/i);
assert.match(spec, /held-out performance witnesses the selected geometry.*after.*selection/is);
assert.match(spec, /standalone Aperture UI is not modified/i);
assert.match(spec, /whitened Jacobian/i);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  pedagogue_rank_only_choice:receipt.pedagogue_rank_only_baseline.selected_probe_id,
  aperture_conditioning_choice:receipt.aperture_conditioning_selection.selected_probe_id,
  near_condition_number:byId.P_NEAR.condition_number_2,
  orth_condition_number:byId.P_ORTH.condition_number_2,
  near_error:byId.P_NEAR.perturbation_reconstruction_error,
  orth_error:byId.P_ORTH.perturbation_reconstruction_error,
  near_held_out_residual:byId.P_NEAR.held_out_residual,
  orth_held_out_residual:byId.P_ORTH.held_out_residual,
  bounded_result:receipt.bounded_result,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
