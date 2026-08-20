import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_COVARIANCE_WHITENED_WIDENING_SCHEMA,
  whitenTwoChannelOperator,
  evaluateWhitenedCandidate,
  selectCovarianceWhitenedWidening,
  runCovarianceWhitenedWideningGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-covariance-whitened-widening.js';

assert.deepEqual(whitenTwoChannelOperator([[1,0],[0,1]],[1,100]),[[1,0],[0,0.1]]);
assert.throws(()=>whitenTwoChannelOperator([[1,0],[0,1]],[1,0]),/positive finite/);

const orth=evaluateWhitenedCandidate({probe_id:'P_ORTH',gradient:[0,1],variance:100,variance_source_status:'DECLARED_SYNTHETIC'});
const diag=evaluateWhitenedCandidate({probe_id:'P_DIAG',gradient:[1,1],variance:1,variance_source_status:'DECLARED_SYNTHETIC'});
const missing=evaluateWhitenedCandidate({probe_id:'P_DIAG',gradient:[1,1],variance:null,variance_source_status:'UNRESOLVED'});
assert.equal(orth.sigma_min_whitened,0.1);
assert.equal(orth.condition_number_whitened,10);
assert.ok(diag.sigma_min_whitened>0.54 && diag.sigma_min_whitened<0.55);
assert.equal(missing.complete_noise_geometry,false);
assert.equal(missing.sigma_min_whitened,null);

const complete=selectCovarianceWhitenedWidening([
 {probe_id:'P_DUP',gradient:[1,0],variance:1},
 {probe_id:'P_ORTH',gradient:[0,1],variance:100},
 {probe_id:'P_DIAG',gradient:[1,1],variance:1}
]);
assert.equal(complete.selected_probe_id,'P_DIAG');
assert.equal(complete.complete_noise_geometry,true);
assert.equal(complete.held_out_used_for_selection,false);

const incomplete=selectCovarianceWhitenedWidening([
 {probe_id:'P_DUP',gradient:[1,0],variance:1},
 {probe_id:'P_ORTH',gradient:[0,1],variance:100},
 {probe_id:'P_DIAG',gradient:[1,1],variance:null,variance_source_status:'UNRESOLVED'}
]);
assert.equal(incomplete.selected_probe_id,null);
assert.equal(incomplete.selection_status,'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY');
assert.deepEqual(incomplete.missing_rank_lifting_probe_ids,['P_DIAG']);
assert.equal(incomplete.best_declared_subset_probe_id,'P_ORTH');

const receipt=runCovarianceWhitenedWideningGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_COVARIANCE_WHITENED_WIDENING_SCHEMA);
assert.equal(receipt.euclidean_conditioning_baseline.selected_probe_id,'P_ORTH');
assert.equal(receipt.covariance_whitened_selection.selected_probe_id,'P_DIAG');
assert.equal(receipt.missing_noise_geometry_control.selected_probe_id,null);
assert.equal(receipt.missing_noise_geometry_control.selection_status,'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY');
assert.ok(receipt.validation_witnesses.P_ORTH.reconstruction_error>receipt.validation_witnesses.P_DIAG.reconstruction_error);
assert.ok(receipt.validation_witnesses.P_ORTH.held_out_residual>receipt.validation_witnesses.P_DIAG.held_out_residual);
assert.ok(receipt.bounded_results.includes('UNCERTAINTY_WEIGHTED_WIDENING_REFINEMENT_CANDIDATE'));
assert.ok(receipt.bounded_results.includes('MISSING_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'));
assert.ok(receipt.anti_equivalences.includes('missing covariance != unit covariance'));
assert.equal(receipt.next_learning_action,'TEST_CORRELATED_COVARIANCE_AND_JOINT_NOISE_DIRECTIONS_BEFORE_ANY_INFORMATION_GEOMETRY_PROMOTION');
for(const claim of Object.values(receipt.claims)) assert.equal(claim,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.standalone_aperture_ui_mutated,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_COVARIANCE_WHITENED_WIDENING_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/missing covariance != unit covariance/i);
assert.match(spec,/NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY/);
assert.match(spec,/Sigma\^\(-1\/2\) A/);
assert.match(spec,/No standalone Aperture UI mutation is permitted/i);

console.log(JSON.stringify({
 ok:true,
 schema:receipt.schema,
 euclidean_choice:receipt.euclidean_conditioning_baseline.selected_probe_id,
 whitened_choice:receipt.covariance_whitened_selection.selected_probe_id,
 orth_sigma_min_whitened:receipt.covariance_whitened_selection.scores.find(x=>x.probe_id==='P_ORTH').sigma_min_whitened,
 diag_sigma_min_whitened:receipt.covariance_whitened_selection.scores.find(x=>x.probe_id==='P_DIAG').sigma_min_whitened,
 orth_error:receipt.validation_witnesses.P_ORTH.reconstruction_error,
 diag_error:receipt.validation_witnesses.P_DIAG.reconstruction_error,
 missing_noise_status:receipt.missing_noise_geometry_control.selection_status,
 selected_when_missing:receipt.missing_noise_geometry_control.selected_probe_id,
 next_learning_action:receipt.next_learning_action,
 promotion_authority:receipt.promotion_authority
},null,2));
