import assert from 'node:assert/strict';
import {
  ACQUISITION_COVER_FIXTURE,
  MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_CERTIFICATE as C,
  evaluateAcquisitionSet,
  runMinimalTargetSeparatingAcquisitionCover
} from '../app/dome-world/previews/a15-r0/minimal-target-separating-acquisition-cover.js';

assert.equal(C.status,'MINIMAL_TARGET_SEPARATING_ACQUISITION_COVER_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.unresolved_target_pair_count,3);
assert.equal(C.complete_plan_exists,true);
assert.equal(C.minimum_cardinality_complete_plan.cardinality,1);
assert.equal(C.minimum_cardinality_complete_plan.total_cost,3);
assert.deepEqual(C.minimum_cardinality_complete_plan.candidate_ids,['Z_ONE_SHOT_FULL']);
assert.equal(C.minimum_cost_complete_plan.cardinality,2);
assert.equal(C.minimum_cost_complete_plan.total_cost,2);
assert.equal(C.minimum_cost_complete_plan.complete_target_separation,true);
assert.equal(C.minimum_cardinality_differs_from_minimum_cost,true);
assert.equal(C.optimization_objective_must_be_declared,true);
assert.equal(C.complete_identification_plan_is_target_pair_cover,true);
assert.equal(C.pair_cover_is_finite_fixture_application_not_new_set_cover_theorem,true);
assert.equal(C.adaptive_outcome_contingent_policy_earned,false);
assert.equal(C.stochastic_acquisition_cost_model_earned,false);
assert.equal(C.empirical_resource_cost_measured,false);
assert.equal(C.empirical_exteriority_information_gain_measured,false);
assert.equal(C.external_origin_of_artifact_proven,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const partialA=evaluateAcquisitionSet([ACQUISITION_COVER_FIXTURE.candidates.find(x=>x.id==='Z_A_SPLITTER')]);
assert.equal(partialA.resolved_pair_count,2);
assert.equal(partialA.unresolved_pair_count,1);
assert.equal(partialA.complete_target_separation,false);

const useless=evaluateAcquisitionSet([ACQUISITION_COVER_FIXTURE.candidates.find(x=>x.id==='Z_NOVEL_NO_TARGET_VALUE')]);
assert.equal(useless.resolved_pair_count,0);
assert.equal(useless.unresolved_pair_count,3);
assert.equal(useless.complete_target_separation,false);

const noFull=structuredClone(ACQUISITION_COVER_FIXTURE);
noFull.candidates=noFull.candidates.filter(x=>x.id!=='Z_ONE_SHOT_FULL');
const noFullResult=runMinimalTargetSeparatingAcquisitionCover(noFull);
assert.equal(noFullResult.status,'INADMISSIBLE','Fixture-specific certificate must not silently change when the preregistered one-shot comparator is removed.');

const badCost=structuredClone(ACQUISITION_COVER_FIXTURE);
badCost.candidates[0].cost=-1;
assert.throws(()=>runMinimalTargetSeparatingAcquisitionCover(badCost),/NONNEGATIVE_FINITE_COST_REQUIRED/);

const outOfUniverse=structuredClone(ACQUISITION_COVER_FIXTURE);
outOfUniverse.candidates[0].resolves.push(['THETA_A','THETA_D']);
assert.throws(()=>runMinimalTargetSeparatingAcquisitionCover(outOfUniverse),/CANDIDATE_MAY_ONLY_RESOLVE_DECLARED_TARGET_PAIR/);

console.log('Minimal target-separating acquisition-cover tests passed.');
