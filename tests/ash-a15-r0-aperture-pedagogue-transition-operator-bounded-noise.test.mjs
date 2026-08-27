import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TRANSITION_OPERATOR_BOUNDED_NOISE_SCHEMA,
  buildTransitionOperatorBoundedNoiseFixture,
  validateNoiseProbeCandidate,
  validateNoiseSelectionCandidate,
  validateNoiseAwareSelectionInput,
  deriveCompatibleOperatorSet,
  validateCompatibleOperatorSetRepresentation,
  predictHeldoutBox,
  observationBox,
  classifyHeldoutAgainstOperatorSet,
  noiseBlindHostileSelector,
  boundedNoiseAwareSelector,
  classifyDeclaredNoiseBound,
  runTransitionOperatorBoundedNoiseGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transition-operator-bounded-noise.js';

const stable=value=>JSON.stringify(value);
const approx=(actual,expected,tol=1e-12)=>assert.ok(Math.abs(actual-expected)<=tol,`${actual} != ${expected}`);
const approxIntervals=(actual,expected,tol=1e-12)=>{
  assert.equal(actual.length,expected.length);
  actual.forEach((pair,i)=>pair.forEach((value,j)=>approx(value,expected[i][j],tol)));
};

const fixture=buildTransitionOperatorBoundedNoiseFixture();
const before=stable(fixture);
assert.equal(fixture.delta,0.0001);
assert.equal(fixture.epsilon,0.001);
assert.deepEqual(fixture.exact_calibration_probe,[1,0]);
assert.deepEqual(fixture.exact_calibration_observation,[2,1]);
assert.deepEqual(fixture.exact_first_column,[2,1]);
assert.equal(Object.isFrozen(fixture),true);
fixture.candidates.forEach(candidate=>assert.equal(validateNoiseProbeCandidate(candidate),true));

const selectionCandidates=fixture.candidates.map(candidate=>({
  candidate_id:candidate.candidate_id,
  x:candidate.x,
  probe_cost:candidate.probe_cost
}));
selectionCandidates.forEach(candidate=>assert.equal(validateNoiseSelectionCandidate(candidate),true));
assert.equal(selectionCandidates.some(candidate=>'observed_center' in candidate),false);

const selectionSurface={
  current_probe:fixture.exact_calibration_probe,
  current_observation:fixture.exact_calibration_observation,
  candidates:selectionCandidates,
  declared_delta:fixture.delta
};
assert.equal(validateNoiseAwareSelectionInput(selectionSurface),true);

const repeat=deriveCompatibleOperatorSet(fixture.candidates.find(candidate=>candidate.candidate_id==='Q_REPEAT'),fixture.delta);
assert.equal(repeat.representation,'UNBOUNDED_SECOND_COLUMN');
assert.equal(repeat.operator_set_status,'OPERATOR_SECOND_COLUMN_UNBOUNDED');
assert.equal(repeat.exact_remaining_operator_dimension,2);
assert.equal(repeat.operator_entry_radius,Infinity);

const fragile=deriveCompatibleOperatorSet(fixture.candidates.find(candidate=>candidate.candidate_id==='Q_FRAGILE_SPANNING'),fixture.delta);
assert.equal(fragile.representation,'EXACT_INTERVAL_SECOND_COLUMN');
assert.equal(fragile.exact_remaining_operator_dimension,0);
approx(fragile.operator_entry_radius,0.1);
approxIntervals(fragile.second_column_intervals,[[0.9,1.1],[2.9,3.1]]);
assert.ok(fragile.probe_geometry.condition_number>10);

const stableSet=deriveCompatibleOperatorSet(fixture.candidates.find(candidate=>candidate.candidate_id==='Q_STABLE_BASIS'),fixture.delta);
assert.equal(stableSet.representation,'EXACT_INTERVAL_SECOND_COLUMN');
assert.equal(stableSet.exact_remaining_operator_dimension,0);
approx(stableSet.operator_entry_radius,0.0001);
approxIntervals(stableSet.second_column_intervals,[[0.9999,1.0001],[2.9999,3.0001]]);
approx(stableSet.probe_geometry.condition_number,1);
approx(fragile.operator_entry_radius/stableSet.operator_entry_radius,1000,1e-9);

assert.equal(validateCompatibleOperatorSetRepresentation(fragile),true);
assert.equal(validateCompatibleOperatorSetRepresentation(stableSet),true);
assert.throws(
  ()=>validateCompatibleOperatorSetRepresentation({representation:'POINT_ESTIMATE'}),
  /REJECT_POINT_ESTIMATE_LAUNDERING_OF_COMPATIBLE_OPERATOR_SET/
);
assert.throws(
  ()=>validateCompatibleOperatorSetRepresentation({representation:'FINITE_SAMPLES'}),
  /REJECT_FINITE_SAMPLE_LAUNDERING_OF_EXACT_INTERVAL_OPERATOR_SET/
);

const hostile=noiseBlindHostileSelector(selectionSurface);
assert.equal(hostile.selected_candidate_id,'Q_FRAGILE_SPANNING');
assert.equal(hostile.declared_noise_used,false);
assert.equal(hostile.future_outputs_consulted,false);
assert.equal(hostile.automatic_execution,false);

const aware=boundedNoiseAwareSelector(selectionSurface);
assert.equal(aware.selected_candidate_id,'Q_STABLE_BASIS');
assert.equal(aware.declared_noise_used,true);
assert.equal(aware.future_outputs_consulted,false);
assert.equal(aware.automatic_execution,false);
assert.equal(aware.promotion_authority,false);
const awareById=Object.fromEntries(aware.evaluations.map(item=>[item.candidate_id,item]));
assert.equal(awareById.Q_REPEAT.predicted_operator_entry_radius,Infinity);
approx(awareById.Q_FRAGILE_SPANNING.predicted_operator_entry_radius,0.1);
approx(awareById.Q_STABLE_BASIS.predicted_operator_entry_radius,0.0001);

assert.throws(
  ()=>validateNoiseAwareSelectionInput({...selectionSurface,synthetic_oracle:[[2,1],[1,3]]}),
  /REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION/
);
assert.throws(
  ()=>validateNoiseSelectionCandidate({...selectionCandidates[1],observed_center:[2.001,1.003]}),
  /REJECT_NOISE_SELECTION_CANDIDATE_MUTATION|REJECT_ORACLE_OUTPUT_LEAKAGE_IN_NOISE_AWARE_PROBE_SELECTION/
);

const stablePrediction=predictHeldoutBox(stableSet,fixture.heldout_probe);
const fragilePrediction=predictHeldoutBox(fragile,fixture.heldout_probe);
approxIntervals(stablePrediction.intervals,[[2.9999,3.0001],[3.9999,4.0001]]);
approxIntervals(fragilePrediction.intervals,[[2.9,3.1],[3.9,4.1]]);

const inBox=observationBox(fixture.in_family_heldout_center,fixture.delta);
approxIntervals(inBox,[[2.9999,3.0001],[3.9999,4.0001]]);
const stableIn=classifyHeldoutAgainstOperatorSet(stableSet,fixture.in_family_heldout_center,fixture.delta);
const fragileIn=classifyHeldoutAgainstOperatorSet(fragile,fixture.in_family_heldout_center,fixture.delta);
assert.equal(stableIn.intersects,true);
assert.equal(fragileIn.intersects,true);
assert.equal(stableIn.status,'HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET');
assert.equal(fragileIn.status,'HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET');

const stableMiss=classifyHeldoutAgainstOperatorSet(stableSet,fixture.misspecified_heldout_center,fixture.delta);
const fragileMiss=classifyHeldoutAgainstOperatorSet(fragile,fixture.misspecified_heldout_center,fixture.delta);
assert.equal(stableMiss.intersects,false);
assert.equal(stableMiss.status,'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_BOUNDED_HELDOUT_OBSERVATION');
assert.equal(fragileMiss.intersects,true);
assert.equal(fragileMiss.status,'HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET');

const underdeclared=classifyDeclaredNoiseBound({
  declared_delta:0.00001,
  actual_error_magnitude:0.0001,
  synthetic_truth_available:true
});
assert.equal(underdeclared.status,'DECLARED_OBSERVATION_ERROR_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH');
const noTruth=classifyDeclaredNoiseBound({
  declared_delta:0.00001,
  actual_error_magnitude:0.0001,
  synthetic_truth_available:false
});
assert.equal(noTruth.status,'ACTUAL_ERROR_NOT_OBSERVABLE_WITHOUT_SYNTHETIC_TRUTH');

const receipt=runTransitionOperatorBoundedNoiseGauntlet();
assert.equal(receipt.schema,TRANSITION_OPERATOR_BOUNDED_NOISE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.error_model.type,'COMPONENTWISE_DETERMINISTIC_BOUND');
assert.equal(receipt.error_model.probability_distribution,null);
assert.equal(receipt.error_model.exact_calibration_anchor,true);
approx(receipt.amplification.fragile_operator_entry_radius,0.1);
approx(receipt.amplification.stable_operator_entry_radius,0.0001);
approx(receipt.amplification.radius_ratio,1000,1e-9);
assert.equal(receipt.noise_blind_hostile_selector.selected_candidate_id,'Q_FRAGILE_SPANNING');
assert.equal(receipt.bounded_noise_aware_selector.selected_candidate_id,'Q_STABLE_BASIS');
assert.equal(receipt.heldout.stable_in_family.intersects,true);
assert.equal(receipt.heldout.fragile_in_family.intersects,true);
assert.equal(receipt.heldout.stable_misspecified.status,'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_BOUNDED_HELDOUT_OBSERVATION');
assert.equal(receipt.heldout.fragile_misspecified.status,'HELDOUT_OBSERVATION_COMPATIBLE_WITH_OPERATOR_SET');
assert.equal(receipt.hostile_rejections.point_estimate_laundering_rejected,true);
assert.equal(receipt.hostile_rejections.finite_sample_laundering_rejected,true);
assert.equal(receipt.hostile_rejections.selector_oracle_leakage_rejected,true);
assert.equal(receipt.hostile_rejections.underdeclared_noise_bound_status,'DECLARED_OBSERVATION_ERROR_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH');
assert.equal(receipt.source_inputs_preserved,true);
assert.match(receipt.gauntlet_status,/TRANSITION_OPERATOR_BOUNDED_NOISE_COMPATIBLE_SET_BOUNDARY_VALIDATED/);
assert.match(receipt.bounded_refinement_candidate,/ill-conditioned probe geometry amplifies operator uncertainty/);
assert.equal(receipt.next_learning_action,'TEST_MULTI_PROBE_TRANSITION_OPERATOR_COMPATIBLE_SET_CONTRACTION_UNDER_BOUNDED_NOISE_WITH_ADAPTIVE_STOPPING_HELDOUT_COVERAGE_AND_OPEN_SET_MODEL_ORDER_CHALLENGES_BEFORE_ANY_OPERATOR_TOMOGRAPHY_OR_PATH_TRANSPORT_PROMOTION');
assert.equal(receipt.claims.general_robust_system_identification_theorem,false);
assert.equal(receipt.claims.statistical_consistency,false);
assert.equal(receipt.claims.probabilistic_calibration,false);
assert.equal(receipt.claims.operator_tomography,false);
assert.equal(receipt.claims.path_category_theorem,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.curvature,false);
assert.equal(receipt.claims.proto_loom,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_observation,false);
assert.equal(receipt.automatic_experiment_execution,false);
assert.equal(receipt.sequence_authority,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.production_mutation,false);
assert.equal(receipt.human_closure_required,true);
assert.equal(Object.isFrozen(receipt),true);
assert.equal(stable(fixture),before);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TRANSITION_OPERATOR_BOUNDED_NOISE_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/same observation-error bound != same operator-identification uncertainty/);
assert.match(spec,/fragile_radius \/ stable_radius = 1000/);
assert.match(spec,/nominal reconstruction != bounded-error compatible set/);
assert.match(spec,/It is not a statistical consistency result/);
assert.match(spec,/operator tomography/);
assert.match(spec,/A16 remains held/);

const implementation=fs.readFileSync('app/dome-world/previews/a15-r0/aperture-pedagogue-transition-operator-bounded-noise.js','utf8');
assert.match(implementation,/candidates:fixture\.candidates\.map\(selectionCandidateFromFull\)/);
const projectionBody=implementation.match(/function selectionCandidateFromFull\(candidate\) \{([\s\S]*?)\n\}/)?.[1] || '';
assert.ok(projectionBody,'Selection projection function must remain discoverable.');
assert.doesNotMatch(projectionBody,/observed_center/);
assert.match(projectionBody,/candidate_id/);
assert.match(projectionBody,/probe_cost/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  fragile_radius:receipt.amplification.fragile_operator_entry_radius,
  stable_radius:receipt.amplification.stable_operator_entry_radius,
  amplification_ratio:receipt.amplification.radius_ratio,
  noise_blind_selection:receipt.noise_blind_hostile_selector.selected_candidate_id,
  noise_aware_selection:receipt.bounded_noise_aware_selector.selected_candidate_id,
  stable_misspecified_status:receipt.heldout.stable_misspecified.status,
  fragile_misspecified_status:receipt.heldout.fragile_misspecified.status,
  next_learning_action:receipt.next_learning_action,
  operator_tomography:receipt.claims.operator_tomography,
  holonomy:receipt.claims.holonomy
},null,2));
