import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TRANSITION_OPERATOR_IDENTIFIABILITY_SCHEMA,
  buildTransitionOperatorIdentifiabilityFixture,
  validateCompatibleFamilyRepresentation,
  validateProbeSelectionInput,
  evaluateProbeCandidate,
  ambiguityOnlyHostileProbeSelector,
  stabilityAwareProbeSelector,
  reconstructLinearOperatorFromTwoProbes,
  runTransitionOperatorIdentifiabilityGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transition-operator-identifiability.js';

const stable=value=>JSON.stringify(value);
const fixture=buildTransitionOperatorIdentifiabilityFixture();
const before=stable(fixture);

assert.equal(fixture.model_class,'REAL_LINEAR_2X2');
assert.deepEqual(fixture.initial_probe,[1,0]);
assert.deepEqual(fixture.initial_observation,[2,1]);
assert.equal(fixture.affine_compatible_family.representation,'AFFINE_NULLSPACE_CONTINUOUS');
assert.deepEqual(fixture.affine_compatible_family.free_parameters,['a:REAL','b:REAL']);
assert.equal(fixture.affine_compatible_family.compatible_dimension,2);
assert.equal(validateCompatibleFamilyRepresentation(fixture.affine_compatible_family),true);
assert.equal(Object.isFrozen(fixture),true);

const selectionSurface={
  current_probes:[fixture.initial_probe],
  current_observations:[fixture.initial_observation],
  operator_nullspace_basis:fixture.affine_compatible_family.nullspace_basis,
  candidates:fixture.probe_candidates,
  probe_condition_number_ceiling:fixture.probe_condition_number_ceiling
};
assert.equal(validateProbeSelectionInput(selectionSurface),true);

const evaluations=Object.fromEntries(
  fixture.probe_candidates.map(candidate=>[
    candidate.candidate_id,
    evaluateProbeCandidate(candidate,fixture.initial_probe,fixture.affine_compatible_family.nullspace_basis)
  ])
);

assert.equal(evaluations.Q_REPEAT.remaining_operator_dimension,2);
assert.equal(evaluations.Q_REPEAT.classification,'OPERATOR_COMPATIBLE_FAMILY_UNCHANGED');
assert.deepEqual(evaluations.Q_REPEAT.nullspace_actions,[[0,0],[0,0]]);
assert.equal(evaluations.Q_REPEAT.separates_operator_nullspace,false);

assert.equal(evaluations.Q_FRAGILE_SPANNING.remaining_operator_dimension,0);
assert.equal(evaluations.Q_FRAGILE_SPANNING.classification,'OPERATOR_UNIQUE_BUT_PROBE_GEOMETRY_NUMERICALLY_FRAGILE');
assert.equal(evaluations.Q_FRAGILE_SPANNING.stable_identification,false);
assert.ok(evaluations.Q_FRAGILE_SPANNING.probe_geometry.condition_number>fixture.probe_condition_number_ceiling);
assert.deepEqual(evaluations.Q_FRAGILE_SPANNING.nullspace_actions,[[0.001,0],[0,0.001]]);

assert.equal(evaluations.Q_STABLE_BASIS.remaining_operator_dimension,0);
assert.equal(evaluations.Q_STABLE_BASIS.classification,'OPERATOR_STABLY_IDENTIFIABLE_AFTER_PROBE');
assert.equal(evaluations.Q_STABLE_BASIS.stable_identification,true);
assert.equal(evaluations.Q_STABLE_BASIS.probe_geometry.condition_number,1);
assert.deepEqual(evaluations.Q_STABLE_BASIS.nullspace_actions,[[1,0],[0,1]]);

const hostile=ambiguityOnlyHostileProbeSelector(selectionSurface);
assert.equal(hostile.selected_candidate_id,'Q_FRAGILE_SPANNING');
assert.equal(hostile.candidate_future_outputs_consulted,false);
assert.equal(hostile.automatic_execution,false);

const stableSelector=stabilityAwareProbeSelector(selectionSurface);
assert.equal(stableSelector.selected_candidate_id,'Q_STABLE_BASIS');
assert.equal(stableSelector.candidate_future_outputs_consulted,false);
assert.equal(stableSelector.automatic_execution,false);
assert.equal(stableSelector.promotion_authority,false);

assert.throws(
  ()=>validateProbeSelectionInput({...selectionSurface,synthetic_oracle:[[2,1],[1,3]]}),
  /REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION/
);

assert.throws(
  ()=>validateCompatibleFamilyRepresentation({
    ...structuredClone(fixture.affine_compatible_family),
    representation:'FINITE_SAMPLES',
    members:[[[2,1],[1,3]],[[2,-4],[1,7]]]
  }),
  /REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY/
);

const selected=fixture.probe_candidates.find(candidate=>candidate.candidate_id==='Q_STABLE_BASIS');
const reconstruction=reconstructLinearOperatorFromTwoProbes(
  fixture.initial_probe,
  fixture.initial_observation,
  selected.x,
  [1,3]
);
assert.deepEqual(reconstruction.reconstructed_operator,[[2,1],[1,3]]);
assert.equal(reconstruction.operator_unique,true);
assert.equal(reconstruction.compatible_dimension,0);
assert.equal(reconstruction.training_pair_residual,0);
assert.equal(reconstruction.probe_geometry.condition_number,1);

const receipt=runTransitionOperatorIdentifiabilityGauntlet();
assert.equal(receipt.schema,TRANSITION_OPERATOR_IDENTIFIABILITY_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.initial_operator_compatible_dimension,2);
assert.equal(receipt.compatible_family_representation,'AFFINE_NULLSPACE_CONTINUOUS');
assert.equal(receipt.nullspace_basis_annihilates_initial_probe,true);
assert.equal(receipt.explicit_alternative_matches_initial_observation,true);
assert.equal(receipt.explicit_alternative_differs_on_heldout,true);
assert.equal(receipt.ambiguity_only_hostile_selector.selected_candidate_id,'Q_FRAGILE_SPANNING');
assert.equal(receipt.stability_aware_selector.selected_candidate_id,'Q_STABLE_BASIS');
assert.equal(receipt.selected_probe_output_generated_only_after_selection,true);
assert.deepEqual(receipt.reconstruction.reconstructed_operator,[[2,1],[1,3]]);
assert.equal(receipt.reconstruction.training_pair_residual,0);
assert.deepEqual(receipt.heldout.predicted,[3,4]);
assert.equal(receipt.heldout.in_family_status,'HELDOUT_LINEAR_TRANSITION_PREDICTION_MATCH');
assert.deepEqual(receipt.heldout.open_set_observed,[3,5]);
assert.equal(receipt.heldout.open_set_status,'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION');
assert.equal(receipt.hostile_rejections.oracle_output_leakage_rejected,true);
assert.equal(receipt.hostile_rejections.finite_sample_laundering_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.match(receipt.gauntlet_status,/TRANSITION_OPERATOR_IDENTIFIABILITY_BOUNDARY_VALIDATED/);
assert.match(receipt.bounded_refinement_candidate,/affine operator-compatible family/);
assert.equal(receipt.next_learning_action,'TEST_TRANSITION_OPERATOR_IDENTIFICATION_UNDER_BOUNDED_OBSERVATION_NOISE_WITH_COMPATIBLE_OPERATOR_SETS_CONDITION_AWARE_PROBE_DESIGN_HELDOUT_COVERAGE_AND_MODEL_MISSPECIFICATION_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_CATEGORY_OR_HOLONOMY_PROMOTION');
assert.equal(receipt.claims.general_system_identification_theorem,false);
assert.equal(receipt.claims.noise_robustness,false);
assert.equal(receipt.claims.operator_tomography,false);
assert.equal(receipt.claims.path_category_theorem,false);
assert.equal(receipt.claims.path_dependent_transport,false);
assert.equal(receipt.claims.loop_endomorphism,false);
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

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TRANSITION_OPERATOR_IDENTIFIABILITY_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/system-identification entrance exam/);
assert.match(spec,/It is not operator tomography/);
assert.match(spec,/full probe rank != stable operator identifiability/);
assert.match(spec,/REJECT_ORACLE_OUTPUT_LEAKAGE_IN_PROBE_SELECTION/);
assert.match(spec,/REJECT_FINITE_SAMPLE_LAUNDERING_OF_CONTINUOUS_OPERATOR_FAMILY/);
assert.match(spec,/A16 remains held/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  initial_operator_compatible_dimension:receipt.initial_operator_compatible_dimension,
  ambiguity_only_selection:receipt.ambiguity_only_hostile_selector.selected_candidate_id,
  stability_aware_selection:receipt.stability_aware_selector.selected_candidate_id,
  selected_probe_condition_number:receipt.reconstruction.probe_geometry.condition_number,
  heldout_in_family_status:receipt.heldout.in_family_status,
  heldout_open_set_status:receipt.heldout.open_set_status,
  next_learning_action:receipt.next_learning_action,
  operator_tomography:receipt.claims.operator_tomography,
  holonomy:receipt.claims.holonomy,
  promotion_authority:receipt.promotion_authority
},null,2));
