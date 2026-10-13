import assert from 'node:assert/strict';
import { GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_CERTIFICATE as C, GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_PARENT, GOLDEN_EGG_CORE_SURFACES, GOLDEN_EGG_GEOMETRIC_SURFACES, GOLDEN_EGG_OPERATIONAL_SURFACES, evaluateGoldenEggEvidenceClosure, exhaustFrozenGoldenEggEvidenceSubsets } from '../app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js';
import { goldenEggRepositoryCandidateInventory } from '../app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js';

assert.equal(GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_PARENT,'4474b65c5ecd6dfc8c19cbaf0146bfdeea078a4d');
assert.deepEqual(GOLDEN_EGG_CORE_SURFACES,['observer','reconstruction','joining']);
assert.deepEqual(GOLDEN_EGG_GEOMETRIC_SURFACES,['observer','reconstruction','joining','geometry']);
assert.deepEqual(GOLDEN_EGG_OPERATIONAL_SURFACES,['observer','reconstruction','joining','geometry','matched_return']);

const inventory=goldenEggRepositoryCandidateInventory();
const closure=evaluateGoldenEggEvidenceClosure(inventory);
assert.equal(inventory.length,4);
assert.equal(closure.empirical_episode_count,2);
assert.deepEqual(closure.all_class_operational_marginal_support,['observer','reconstruction','joining','geometry']);
assert.deepEqual(closure.all_class_operational_marginal_missing,['matched_return']);
assert.deepEqual(closure.empirical_operational_marginal_support,[]);
assert.deepEqual(closure.empirical_operational_marginal_missing,['observer','reconstruction','joining','geometry','matched_return']);
assert.equal(closure.counts.core_joint_realized_episodes,0);
assert.equal(closure.counts.geometric_joint_realized_episodes,0);
assert.equal(closure.counts.operational_return_eligible_episodes,0);
assert.equal(closure.episodes.length,2);
for(const episode of closure.episodes){
  assert.deepEqual(episode.exact_required_surfaces,[]);
  assert.equal(episode.core_missing.length,3);
  assert.equal(episode.geometric_missing.length,4);
  assert.equal(episode.operational_missing.length,5);
  assert.equal(episode.core_joint_realized,false);
  assert.equal(episode.geometric_joint_realized,false);
  assert.equal(episode.operational_return_eligible,false);
}

const exhaustion=exhaustFrozenGoldenEggEvidenceSubsets();
assert.deepEqual(exhaustion,{subset_count:16,core_realizable_subset_count:0,geometric_realizable_subset_count:0,operational_realizable_subset_count:0});
assert.deepEqual(C.minimum_new_required_measurements_on_existing_empirical_episode,{core:3,geometric:4,operational:5});
assert.equal(C.hostiles.same_episode_split_positive_control,true);
assert.equal(C.hostiles.cross_episode_frankenstein_rejected,true);
assert.equal(C.hostiles.mixed_synthetic_empirical_laundering_rejected,true);
assert.equal(C.hostiles.proxy_return_label_rejected,true);
assert.equal(C.hostiles.threshold_laundering_rejected,true);
assert.equal(C.hostiles.contradictory_duplicate_required_surface_rejected,true);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.passed,true);
assert.match(C.candidate_theorem,/NO_ADMISSIBLE_EMPIRICAL_CLOSURE_ROUTE/);
assert.match(C.candidate_theorem,/AT_LEAST_FIVE_NEW_REQUIRED_MEASUREMENTS/);

console.log('Ash A15-R0 Golden Egg evidence-closure no-go tests passed.');
