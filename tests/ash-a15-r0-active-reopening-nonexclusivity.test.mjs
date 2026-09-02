import assert from 'node:assert/strict';
import {
  ACTIVE_REOPENING_ANALYTIC_PAIR,
  ACTIVE_REOPENING_EXTERNAL_WITNESSES,
  runActiveReopeningCounterexample
} from '../app/dome-world/previews/a15-r0/active-reopening-nonexclusivity.js';

const earned=runActiveReopeningCounterexample();
assert.equal(earned.status,'ACTIVE_REOPENING_NONEXCLUSIVITY_EARNED');
assert.equal(earned.rest_symbol,'𝄐');
assert.equal(earned.observational_equivalence,true);
assert.deepEqual(earned.observational_law_model_1,earned.observational_law_model_2);
assert.deepEqual(earned.observational_law_model_1.cov,[[1,1],[1,2]]);
assert.equal(earned.deterministic_verifier_equal,true);
assert.equal(earned.randomized_verifier_output_distributions_equal,true);
assert.equal(earned.post_intervention_y_mean_model_1,1);
assert.equal(earned.post_intervention_y_mean_model_2,0);
assert.equal(earned.intervention_separates_models,true);
assert.equal(earned.passive_closed_record_stopping_rule_preserved,true);
assert.equal(earned.active_experiment_reopening_operator_admitted,true);
assert.equal(earned.exogenous_witness_admission_unique_reopening_operator,false);
assert.equal(earned.new_interventional_distribution_not_transformation_of_fixed_A,true);
assert.equal(earned.external_2026_intervention_witnesses_admitted,true);
assert.equal(ACTIVE_REOPENING_EXTERNAL_WITNESSES.length,3);
assert.equal(ACTIVE_REOPENING_EXTERNAL_WITNESSES[0].code_head,'624e21b2207d10eb6eb13d908bc4271e636cdf1e');
assert.equal(earned.external_empirical_exteriority_witness_acquired,false);
assert.equal(earned.empirical_exteriority_information_gain_measured,false);
assert.equal(earned.external_origin_of_artifact_proven,false);
assert.deepEqual(earned.exact_golden_egg_surfaces_added,[]);
assert.equal(earned.empirical_credit_to_golden_egg,0);
assert.equal(earned.golden_egg_earned,false);
assert.equal(earned.sequence_authority,false);
assert.equal(earned.merge_authority,false);
assert.equal(earned.production_authority,false);
assert.equal(earned.deployment_authority,false);
assert.equal(earned.publication_authority,false);

const noSeparation=structuredClone(ACTIVE_REOPENING_ANALYTIC_PAIR);
noSeparation.intervention={kind:'do',target:'X',value:0};
assert.equal(runActiveReopeningCounterexample(noSeparation).status,'INADMISSIBLE','A non-separating intervention must not earn active reopening.');

const observationalLeak=structuredClone(ACTIVE_REOPENING_ANALYTIC_PAIR);
observationalLeak.model_2.x_noise_variance=0.6;
assert.equal(runActiveReopeningCounterexample(observationalLeak).status,'INADMISSIBLE','If observational A already distinguishes the models, the closed-record equivalence counterexample is invalid.');

for(const forbidden of [
  ['external_empirical_exteriority_witness_acquired',true],
  ['empirical_exteriority_information_gain_measured',true],
  ['external_origin_of_artifact_proven',true],
  ['golden_egg_earned',true],
  ['empirical_credit_to_golden_egg',1]
]){
  const [field,value]=forbidden;
  assert.notEqual(earned[field],value,`${field} must remain below the active-reopening claim ceiling.`);
}

console.log('Active reopening non-exclusivity tests passed.');
