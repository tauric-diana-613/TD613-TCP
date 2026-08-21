import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_CORRELATED_NOISE_GEOMETRY_SCHEMA,
  classifyCovariance2,
  cholesky2,
  whitenByFullCovariance,
  evaluateCorrelatedNoiseCandidate,
  selectCorrelatedNoiseWidening,
  runCorrelatedNoiseGeometryGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-correlated-noise-geometry.js';

const near=(left,right,tolerance=1e-12)=>Math.abs(left-right)<=tolerance;
const covariance=[[1,0.9],[0.9,1]];

const valid=classifyCovariance2(covariance);
assert.equal(valid.status,'VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE');
assert.equal(valid.positive_definite,true);
assert.ok(near(valid.eigen_min,0.1));
assert.ok(near(valid.eigen_max,1.9));
assert.ok(near(valid.correlation,0.9));

const invalid=classifyCovariance2([[1,1.05],[1.05,1]]);
assert.equal(invalid.status,'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE');
assert.equal(invalid.positive_definite,false);
assert.throws(()=>cholesky2([[1,1.05],[1.05,1]]),error=>error?.code==='INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE');
assert.equal(classifyCovariance2([[1,0.2],[0.3,1]]).status,'INVALID_NOISE_GEOMETRY_NONSYMMETRIC');

const L=cholesky2(covariance);
assert.ok(near(L[0][0],1));
assert.ok(near(L[1][0],0.9));
assert.ok(L[1][1]>0.435 && L[1][1]<0.437);

const orth=evaluateCorrelatedNoiseCandidate({probe_id:'P_ORTH',gradient:[0,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'});
const diag=evaluateCorrelatedNoiseCandidate({probe_id:'P_DIAG',gradient:[1,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'});
assert.equal(orth.rank_lift,1);
assert.equal(diag.rank_lift,1);
assert.deepEqual(orth.marginal_variances,[1,1]);
assert.deepEqual(diag.marginal_variances,[1,1]);
assert.ok(near(orth.correlation,0.9));
assert.ok(near(diag.correlation,0.9));
assert.ok(orth.sigma_min_full_covariance>0.72 && orth.sigma_min_full_covariance<0.73);
assert.ok(diag.sigma_min_full_covariance>0.94 && diag.sigma_min_full_covariance<0.95);
assert.ok(orth.condition_number_full_covariance>4.35 && orth.condition_number_full_covariance<4.37);
assert.ok(diag.condition_number_full_covariance>1.8 && diag.condition_number_full_covariance<1.81);
assert.ok(diag.sigma_min_full_covariance>orth.sigma_min_full_covariance);

const whitenedOrth=whitenByFullCovariance([[1,0],[0,1]],covariance);
assert.equal(whitenedOrth.length,2);
assert.equal(whitenedOrth[0].length,2);

const complete=selectCorrelatedNoiseWidening([
 {probe_id:'P_ORTH',gradient:[0,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'},
 {probe_id:'P_DIAG',gradient:[1,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'}
]);
assert.equal(complete.selected_probe_id,'P_DIAG');
assert.equal(complete.selection_status,'FULL_COVARIANCE_WIDENING_PROPOSED');
assert.equal(complete.held_out_used_for_selection,false);
assert.equal(complete.automatic_widening_execution,false);

const missing=selectCorrelatedNoiseWidening([
 {probe_id:'P_ORTH',gradient:[0,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'},
 {probe_id:'P_DIAG',gradient:[1,1],covariance:null,covariance_source_status:'UNRESOLVED'}
]);
assert.equal(missing.selected_probe_id,null);
assert.equal(missing.selection_status,'NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY');
assert.deepEqual(missing.missing_joint_noise_probe_ids,['P_DIAG']);
assert.equal(missing.best_declared_subset_probe_id,'P_ORTH');

const invalidSelection=selectCorrelatedNoiseWidening([
 {probe_id:'P_ORTH',gradient:[0,1],covariance,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'},
 {probe_id:'P_BAD',gradient:[1,1],covariance:[[1,1.05],[1.05,1]],covariance_source_status:'DECLARED_SYNTHETIC_INVALID_CONTROL'}
]);
assert.equal(invalidSelection.selected_probe_id,null);
assert.equal(invalidSelection.selection_status,'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION');
assert.deepEqual(invalidSelection.invalid_probe_ids,['P_BAD']);

const receipt=runCorrelatedNoiseGeometryGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_CORRELATED_NOISE_GEOMETRY_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.diagonal_only_baseline.selected_probe_id,'P_ORTH');
assert.equal(receipt.full_covariance_selection.selected_probe_id,'P_DIAG');
assert.equal(receipt.missing_joint_noise_geometry_control.selected_probe_id,null);
assert.equal(receipt.missing_joint_noise_geometry_control.selection_status,'NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY');
assert.equal(receipt.invalid_covariance_control.evaluation.positive_definite_status,'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE');
assert.equal(receipt.invalid_covariance_control.selection.selection_status,'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION');
assert.ok(receipt.validation_witnesses.P_DIAG.reconstruction_error<receipt.validation_witnesses.P_ORTH.reconstruction_error);
assert.ok(receipt.validation_witnesses.P_DIAG.held_out_residual<receipt.validation_witnesses.P_ORTH.held_out_residual);
assert.ok(receipt.bounded_results.includes('CORRELATED_NOISE_WIDENING_REFINEMENT_CANDIDATE'));
assert.ok(receipt.bounded_results.includes('MISSING_JOINT_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'));
assert.ok(receipt.anti_equivalences.includes('different probe directions != independent noise directions'));
assert.ok(receipt.anti_equivalences.includes('same marginal variances != same joint noise geometry'));
assert.equal(receipt.next_learning_action,'TEST_JOINT_OPERATOR_AND_UNCERTAINTY_DIVERSITY_AS_ONE_EXPERIMENT_DESIGN_STATE_WITHOUT_PROMOTING_TO_INFORMATION_GEOMETRY');
for(const claim of Object.values(receipt.claims)) assert.equal(claim,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.standalone_aperture_ui_mutated,false);
assert.equal(receipt.live_ash_binding,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CORRELATED_NOISE_GEOMETRY_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/different probe directions[\s\S]*independent uncertainty directions/i);
assert.match(spec,/same marginal variances != same joint noise geometry/i);
assert.match(spec,/INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE/);
assert.match(spec,/NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY/);
assert.match(spec,/No standalone Aperture UI mutation is permitted/i);

console.log(JSON.stringify({
 ok:true,
 schema:receipt.schema,
 diagonal_only_choice:receipt.diagonal_only_baseline.selected_probe_id,
 full_covariance_choice:receipt.full_covariance_selection.selected_probe_id,
 orth_sigma_min_full:receipt.full_covariance_selection.scores.find(item=>item.probe_id==='P_ORTH').sigma_min_full_covariance,
 diag_sigma_min_full:receipt.full_covariance_selection.scores.find(item=>item.probe_id==='P_DIAG').sigma_min_full_covariance,
 orth_condition_full:receipt.full_covariance_selection.scores.find(item=>item.probe_id==='P_ORTH').condition_number_full_covariance,
 diag_condition_full:receipt.full_covariance_selection.scores.find(item=>item.probe_id==='P_DIAG').condition_number_full_covariance,
 orth_error:receipt.validation_witnesses.P_ORTH.reconstruction_error,
 diag_error:receipt.validation_witnesses.P_DIAG.reconstruction_error,
 missing_joint_noise_status:receipt.missing_joint_noise_geometry_control.selection_status,
 invalid_covariance_status:receipt.invalid_covariance_control.evaluation.positive_definite_status,
 next_learning_action:receipt.next_learning_action,
 promotion_authority:receipt.promotion_authority
},null,2));
