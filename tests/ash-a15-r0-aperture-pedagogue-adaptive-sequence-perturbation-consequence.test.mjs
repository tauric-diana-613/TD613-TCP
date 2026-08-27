import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ADAPTIVE_SEQUENCE_PERTURBATION_CONSEQUENCE_SCHEMA,
  EPSILON,
  LOCAL_DELTAS,
  STRESS_DELTA,
  CONSEQUENCE_LEDGER,
  perturbedQAMatrix,
  consequenceForAperture,
  evaluatePerturbationPoint,
  evaluateConfirmatoryDelta,
  runAdaptiveSequencePerturbationConsequenceGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-adaptive-sequence-perturbation-consequence.js';

assert.equal(EPSILON, 0.001);
assert.deepEqual([...LOCAL_DELTAS], [-1e-4,-1e-5,-1e-6,0,1e-6,1e-5,1e-4]);
assert.equal(STRESS_DELTA, -0.0007);
assert.equal(Object.isFrozen(LOCAL_DELTAS), true);
assert.equal(Object.isFrozen(CONSEQUENCE_LEDGER), true);
assert.equal(Object.isFrozen(CONSEQUENCE_LEDGER.ASK_NOTHING), true);
assert.equal(Object.isFrozen(CONSEQUENCE_LEDGER.PROPOSE), true);
assert.deepEqual(perturbedQAMatrix(1e-4), [[1,0],[0.0011,1]]);
assert.throws(() => perturbedQAMatrix(Number.NaN), /finite/);
assert.throws(() => evaluatePerturbationPoint(Number.POSITIVE_INFINITY), /finite/);
assert.throws(() => evaluateConfirmatoryDelta(STRESS_DELTA), /frozen local grid/);
assert.throws(() => consequenceForAperture({ disposition:'UNKNOWN' }), /No declared consequence row/);

for (const delta of LOCAL_DELTAS) {
  const point = evaluateConfirmatoryDelta(delta);
  assert.equal(point.confirmatory, true);
  assert.equal(point.q_b_parent_matrix_reused, true);
  assert.ok(point.analytic_error.AB <= 1e-9);
  assert.ok(point.analytic_error.BA <= 1e-9);
  assert.equal(point.sequence_ab.steps[0].post_step_aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
  assert.equal(point.sequence_ab.steps[0].post_step_aperture.disposition, 'PROPOSE');
  assert.equal(point.sequence_ba.steps[0].post_step_aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
  assert.equal(point.sequence_ba.steps[0].post_step_aperture.disposition, 'PROPOSE');
  assert.equal(point.sequence_ab.final.aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
  assert.equal(point.sequence_ab.final.aperture.disposition, 'ASK_NOTHING');
  assert.equal(point.sequence_ba.final.aperture.disposition, 'PROPOSE');
  assert.equal(point.consequence_ab.selected_action, 'STOP');
  assert.equal(point.consequence_ba.selected_action, 'CONTINUE_ONE_DECLARED_QUESTION');
  assert.equal(point.consequence_ab.optimal_design_claim, false);
  assert.equal(point.consequence_ba.decision_theory_theorem_claim, false);

  if (delta === 0) {
    assert.equal(point.sequence_ba.final.geometry.rank, 1);
    assert.equal(point.sequence_ba.final.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
  } else {
    assert.equal(point.sequence_ba.final.geometry.rank, 2);
    assert.equal(point.sequence_ba.final.aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
  }
}

const stress = evaluatePerturbationPoint(STRESS_DELTA);
assert.equal(stress.confirmatory, false);
assert.equal(stress.sequence_ab.final.aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(stress.sequence_ab.final.aperture.disposition, 'PROPOSE');
assert.equal(stress.sequence_ba.final.aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(stress.sequence_ba.final.aperture.disposition, 'PROPOSE');
assert.equal(stress.consequence_ab.selected_action, 'CONTINUE_ONE_DECLARED_QUESTION');
assert.equal(stress.consequence_ba.selected_action, 'CONTINUE_ONE_DECLARED_QUESTION');
assert.ok(stress.sequence_ab.final.geometry.sigma_min < 0.25);

const receipt = runAdaptiveSequencePerturbationConsequenceGauntlet();
assert.equal(receipt.schema, ADAPTIVE_SEQUENCE_PERTURBATION_CONSEQUENCE_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.local_pass_count, LOCAL_DELTAS.length);
assert.deepEqual(receipt.local_pass_vector, [true,true,true,true,true,true,true]);
assert.equal(receipt.local_disposition_contrast_robust, true);
assert.equal(receipt.ba_structural_subtype_robust, false);
assert.equal(receipt.ba_structural_subtype_classification, 'KNIFE_EDGE_AT_DELTA_ZERO_WITH_LOCAL_NONZERO_RANK_LIFT');
assert.equal(receipt.nonzero_local_ba_rank_lift_count, 6);
assert.equal(receipt.stress_collapses_disposition_contrast, true);
assert.equal(receipt.stress_control.confirmatory, false);
assert.equal(receipt.missing_transition_held, true);
assert.equal(receipt.missing_transition_control.terminal_status, 'SEQUENCE_OPERATOR_MODEL_INCOMPLETE');
assert.equal(receipt.gauntlet_status, 'LOCAL_ORDER_CONSEQUENCE_ROBUSTNESS_WITH_KNIFE_EDGE_DEFICIT_SUBTYPE');
assert.ok(receipt.anti_equivalences.includes('robust terminal disposition != robust deficit subtype'));
assert.ok(receipt.anti_equivalences.includes('noncommuting transition products != holonomy'));
assert.match(receipt.next_learning_action, /BRANCHING_ADAPTIVE_POLICY_REPLAY/);
assert.equal(receipt.claims.active_learning_optimality, false);
assert.equal(receipt.claims.optimal_experimental_design, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.quantum_measurement_disturbance, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.claims.vercel_authority, false);
assert.equal(receipt.installed_aperture_mutated, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.automatic_experiment_execution, false);
assert.equal(receipt.promotion_authority, false);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ADAPTIVE_SEQUENCE_PERTURBATION_CONSEQUENCE_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec, /frozen before executable implementation/i);
assert.match(spec, /robust terminal disposition != robust deficit subtype/);
assert.match(spec, /delta_stress = -0\.0007/);
assert.match(spec, /LOCAL_ORDER_CONSEQUENCE_ROBUSTNESS_WITH_KNIFE_EDGE_DEFICIT_SUBTYPE/);
assert.match(spec, /BRANCHING_ADAPTIVE_POLICY_REPLAY/);
assert.match(spec, /noncommuting transition products != holonomy/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  local_grid_size:receipt.local_deltas.length,
  local_pass_count:receipt.local_pass_count,
  disposition_contrast_robust:receipt.local_disposition_contrast_robust,
  ba_zero_deficit:receipt.local_results.find(point => point.delta === 0).sequence_ba.final.aperture.deficit_class,
  ba_nonzero_deficits:[...new Set(receipt.local_results.filter(point => point.delta !== 0).map(point => point.sequence_ba.final.aperture.deficit_class))],
  stress_ab_disposition:receipt.stress_control.sequence_ab.final.aperture.disposition,
  stress_ba_disposition:receipt.stress_control.sequence_ba.final.aperture.disposition,
  gauntlet_status:receipt.gauntlet_status,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
