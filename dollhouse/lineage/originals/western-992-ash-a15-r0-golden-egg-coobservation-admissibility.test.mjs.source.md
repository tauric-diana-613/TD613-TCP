import assert from 'node:assert/strict';
import { GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_CERTIFICATE as C, GOLDEN_EGG_THRESHOLDS, goldenEggRepositoryCandidateInventory, assessGoldenEggEpisode } from '../app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js';

assert.deepEqual(GOLDEN_EGG_THRESHOLDS,{observer_leakage_bits:0.5,reconstruction_distance:0.2,joining_synergy_bits:0.1});
assert.equal(C.exact_earned_parent,'783fdf0c6fa0a75607e23845700c0963bca6e575');
assert.equal(C.counts.frozen_repository_candidates,4);
assert.equal(C.counts.non_simulated_candidate_sources,2);
assert.equal(C.counts.sources_with_original_metric_triple,1);
assert.equal(C.counts.sources_with_earned_geometry,1);
assert.equal(C.counts.sources_with_matched_counterfactual_return,0);
assert.equal(C.counts.core_empirical_joint_realizations,0);
assert.equal(C.counts.operational_return_eligible_episodes,0);
assert.equal(C.hostiles.frankenstein_union_complete,true);
assert.equal(C.hostiles.frankenstein_same_episode_intersection,0);
assert.equal(C.hostiles.cross_episode_transplant_rejected,true);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.production_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.passed,true);

const inventory=goldenEggRepositoryCandidateInventory();
const synthetic=inventory.find(x=>x.source_id==='A15_R0_FACTORIZED_SYNTHETIC_FIELD');
const geometry=inventory.find(x=>x.source_id==='GOLDEN_EGG_METRIC_CONNECTION_REOPENING_986');
const hush=inventory.find(x=>x.source_id==='ASH_HUSH_DEPLOYED_BOUNDARY_OBSERVED');
const suez=inventory.find(x=>x.source_id==='SUEZ_2021_PROPAGATION_CASE');
assert.ok(synthetic&&geometry&&hush&&suez);
const s=assessGoldenEggEpisode(synthetic);assert.equal(s.core_same_episode,true);assert.equal(s.thresholds_pass,true);assert.equal(s.empirical,false);assert.equal(s.core_joint_realized,false);
const g=assessGoldenEggEpisode(geometry);assert.equal(g.empirical,false);assert.equal(g.operational_return_eligible,false);
const h=assessGoldenEggEpisode(hush);assert.equal(h.empirical,true);assert.equal(h.core_same_episode,false);assert.equal(h.core_joint_realized,false);
const z=assessGoldenEggEpisode(suez);assert.equal(z.empirical,true);assert.equal(z.core_same_episode,false);assert.equal(z.operational_return_eligible,false);

console.log('Ash A15-R0 Golden Egg co-observation admissibility tests passed.');
