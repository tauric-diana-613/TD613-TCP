import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA,
  DEFAULT_FIXTURE_THRESHOLDS,
  diagnoseExperimentDesignState,
  runTypedExperimentDesignStateGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-experiment-design-state.js';

assert.deepEqual(DEFAULT_FIXTURE_THRESHOLDS, {
  sigma_min_floor:0.25,
  condition_number_ceiling:10,
  minimum_sigma_min_gain_for_stability_widening:0.05
});
assert.throws(()=>diagnoseExperimentDesignState({operator:[[1,0]],latent_dimension:3}),/latent_dimension=2/);
assert.throws(()=>diagnoseExperimentDesignState({operator:[[1,0,0]]}),/two finite values/);

const rankDeficit=diagnoseExperimentDesignState({
  operator:[[1,0]],
  candidates:[
    {probe_id:'R_DUP',gradient:[1,0]},
    {probe_id:'R_NEAR',gradient:[1,0.001]},
    {probe_id:'R_ORTH',gradient:[0,1]}
  ]
});
assert.equal(rankDeficit.deficit_class,'STRUCTURAL_RANK_DEFICIT');
assert.equal(rankDeficit.current_rank,1);
assert.equal(rankDeficit.current_nullity,1);
assert.equal(rankDeficit.selected_probe_id,'R_ORTH');
assert.equal(rankDeficit.selection_posture,'REQUIRE_POSITIVE_RANK_LIFT_THEN_AUDIT_STABILITY');
const rById=Object.fromEntries(rankDeficit.candidate_probe_receipts.map(x=>[x.probe_id,x]));
assert.equal(rById.R_DUP.rank_lift,0);
assert.equal(rById.R_NEAR.rank_lift,1);
assert.equal(rById.R_ORTH.rank_lift,1);
assert.ok(rById.R_NEAR.condition_number_after>1900);
assert.equal(rById.R_ORTH.condition_number_after,1);

const fragile=diagnoseExperimentDesignState({
  operator:[[1,0],[0.999999500000375,0.000999999500000375]],
  candidates:[
    {probe_id:'Q_DUP',gradient:[1,0]},
    {probe_id:'Q_NEAR',gradient:[1,0.002]},
    {probe_id:'Q_DIAG',gradient:[1,1]},
    {probe_id:'Q_STAB',gradient:[0,1]}
  ]
});
assert.equal(fragile.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
assert.equal(fragile.current_rank,2);
assert.equal(fragile.current_nullity,0);
assert.ok(fragile.current_sigma_min>0.0007 && fragile.current_sigma_min<0.00071);
assert.ok(fragile.current_condition_number>1999 && fragile.current_condition_number<2001);
assert.equal(fragile.selected_probe_id,'Q_STAB');
assert.equal(fragile.selection_posture,'REQUIRE_STABILITY_GAIN_WITHOUT_REQUIRING_RANK_LIFT');
const qById=Object.fromEntries(fragile.candidate_probe_receipts.map(x=>[x.probe_id,x]));
assert.equal(qById.Q_DUP.rank_lift,0);
assert.equal(qById.Q_NEAR.rank_lift,0);
assert.equal(qById.Q_DIAG.rank_lift,0);
assert.equal(qById.Q_STAB.rank_lift,0);
assert.ok(qById.Q_DUP.sigma_min_gain<0.001);
assert.ok(qById.Q_DIAG.sigma_min_gain>0.61);
assert.ok(qById.Q_STAB.sigma_min_gain>0.99);
assert.equal(qById.Q_STAB.sigma_min_after,1);
assert.ok(qById.Q_STAB.condition_number_after>1.41 && qById.Q_STAB.condition_number_after<1.42);

const good=diagnoseExperimentDesignState({
  operator:[[1,0],[0,1]],
  candidates:[
    {probe_id:'N_DUP_X',gradient:[1,0]},
    {probe_id:'N_DUP_Y',gradient:[0,1]},
    {probe_id:'N_DIAG',gradient:[1,1]}
  ]
});
assert.equal(good.deficit_class,'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(good.current_rank,2);
assert.equal(good.current_nullity,0);
assert.equal(good.current_sigma_min,1);
assert.equal(good.current_condition_number,1);
assert.equal(good.selected_probe_id,null);
assert.equal(good.selection_status,'NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT');
assert.equal(good.selection_posture,'DO_NOT_MANUFACTURE_A_QUESTION');

const incomplete=diagnoseExperimentDesignState({
  operator:[[1,0]],
  candidates:[
    {probe_id:'M_ORTH',gradient:[0,1],noise_geometry_status:'DECLARED_EQUAL_VARIANCE'},
    {probe_id:'M_DIAG',gradient:[1,1],noise_geometry_status:'UNRESOLVED'}
  ]
});
assert.equal(incomplete.deficit_class,'NOISE_GEOMETRY_INCOMPLETE');
assert.equal(incomplete.selected_probe_id,null);
assert.equal(incomplete.selection_status,'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY');
assert.deepEqual(incomplete.missingness,['noise_geometry:M_DIAG']);

const invalid=diagnoseExperimentDesignState({
  operator:[[1,0]],
  candidates:[
    {probe_id:'I_ORTH',gradient:[0,1],noise_geometry_status:'DECLARED_EQUAL_VARIANCE'},
    {probe_id:'I_BAD',gradient:[1,1],noise_geometry_status:'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE'}
  ]
});
assert.equal(invalid.deficit_class,'INVALID_NOISE_GEOMETRY');
assert.equal(invalid.selected_probe_id,null);
assert.equal(invalid.selection_status,'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION');
assert.equal(invalid.selection_posture,'REJECT_BEFORE_RANKING');

const receipt=runTypedExperimentDesignStateGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.contexts.structural_rank_deficit.selected_probe_id,'R_ORTH');
assert.equal(receipt.contexts.numerical_stability_deficit.selected_probe_id,'Q_STAB');
assert.equal(receipt.contexts.no_declared_local_deficit.selected_probe_id,null);
assert.equal(receipt.contexts.noise_geometry_incomplete.selected_probe_id,null);
assert.equal(receipt.contexts.invalid_noise_geometry.selected_probe_id,null);
assert.ok(receipt.bounded_results.includes('TYPED_EXPERIMENT_DESIGN_STATE_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURES'));
assert.ok(receipt.bounded_results.includes('DEFICIT_CONDITIONAL_QUESTION_DESIGN_REFINEMENT_CANDIDATE'));
assert.ok(receipt.bounded_results.includes('NO_DEFICIT_NO_QUESTION_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'));
assert.ok(receipt.anti_equivalences.includes('rank deficit != stability deficit'));
assert.ok(receipt.anti_equivalences.includes('rank_lift = 0 != useless observation'));
assert.ok(receipt.anti_equivalences.includes('available candidate != needed question'));
assert.equal(receipt.scalar_magic_score_used,false);
assert.equal(receipt.held_out_used_for_selection,false);
assert.equal(receipt.oracle_identity_consulted,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.next_learning_action,'TEST_REPLAY_STABILITY_OF_TYPED_EXPERIMENT_DESIGN_STATE_UNDER_SMALL_THRESHOLD_AND_NOISE_MODEL_PERTURBATIONS_BEFORE_ANY_OPTIMAL_DESIGN_OR_INFORMATION_GEOMETRY_PROMOTION');
for(const claim of Object.values(receipt.claims)) assert.equal(claim,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.standalone_aperture_ui_mutated,false);
assert.equal(receipt.live_ash_binding,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_EXPERIMENT_DESIGN_STATE_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/rank_lift = 0 != useless observation/);
assert.match(spec,/NO_WIDENING_PROPOSED_NO_DECLARED_LOCAL_DEFICIT/);
assert.match(spec,/one scalar score determines all deficit classes/);
assert.match(spec,/Major-breakpoint criterion/);
assert.match(spec,/No standalone Aperture UI mutation is permitted/i);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  rank_deficit_class:receipt.contexts.structural_rank_deficit.deficit_class,
  rank_deficit_choice:receipt.contexts.structural_rank_deficit.selected_probe_id,
  stability_deficit_class:receipt.contexts.numerical_stability_deficit.deficit_class,
  stability_deficit_choice:receipt.contexts.numerical_stability_deficit.selected_probe_id,
  stability_choice_rank_lift:receipt.contexts.numerical_stability_deficit.candidate_probe_receipts.find(x=>x.probe_id==='Q_STAB').rank_lift,
  stability_choice_sigma_min_gain:receipt.contexts.numerical_stability_deficit.candidate_probe_receipts.find(x=>x.probe_id==='Q_STAB').sigma_min_gain,
  no_deficit_class:receipt.contexts.no_declared_local_deficit.deficit_class,
  no_deficit_choice:receipt.contexts.no_declared_local_deficit.selected_probe_id,
  incomplete_noise_class:receipt.contexts.noise_geometry_incomplete.deficit_class,
  invalid_noise_class:receipt.contexts.invalid_noise_geometry.deficit_class,
  scalar_magic_score_used:receipt.scalar_magic_score_used,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
