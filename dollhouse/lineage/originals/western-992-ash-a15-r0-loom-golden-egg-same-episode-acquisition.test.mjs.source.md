import assert from 'node:assert/strict';
import {
  LOOM_GOLDEN_EGG_ACQUISITION_CERTIFICATE as C,
  LOOM_GOLDEN_EGG_ACQUISITION_PARENT,
  LOOM_RUNTIME_SOURCE_CUSTODY,
  canonicalLoomGoldenEggEpisode,
  evaluateLoomGoldenEggAcquisitionEpisode
} from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

assert.equal(C.passed,true);
assert.equal(LOOM_GOLDEN_EGG_ACQUISITION_PARENT,'28ba14628326db37282d3d78335d6ee707b087b4');
assert.deepEqual(C.statuses,{candidate:'CANDIDATE',held:'HELD',failed:'FAILED'});
assert.equal(C.golden_egg_earned,false);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);

assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.commit,'d652c5e151471be7e40ff6a08936ba26c0cef1ad');
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.blob,'695d22ec77339bc54512fe6a6a7c0203240ff135');
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.display,'Loom Room');
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.receives.includes('motif-return'),true);
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.preserves.includes('holonomy'),true);
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.preserves.includes('anti-equivalence-edge'),true);
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.emits.includes('cloth-map'),true);
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.emits.includes('route-deformation'),true);
assert.equal(LOOM_RUNTIME_SOURCE_CUSTODY.claim_ceiling,'route-deformation-record-not-truth-proof');

const candidate=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode());
assert.equal(candidate.status,'CANDIDATE');
assert.deepEqual(candidate.exact_required_surfaces,['observer','reconstruction','joining','geometry','matched_return']);
assert.equal(candidate.operational_missing.length,0);
assert.equal(candidate.thresholds_pass,true);
assert.equal(candidate.geometry_witness_pass,true);
assert.equal(candidate.matched_return_witness_pass,true);
assert.equal(candidate.parent_operational_return_eligible,true);
assert.equal(candidate.route_contract.route_identity_distinct,true);
assert.equal(candidate.golden_egg_earned,false);
assert.equal(candidate.child_message,'ALL FIVE THREADS RETURNED TO ONE JOURNEY. THIS IS A CANDIDATE, NOT THE EGG.');

const held=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode({includeReturn:false}));
assert.equal(held.status,'HELD');
assert.equal(held.operational_missing.includes('matched_return'),true);
assert.equal(held.golden_egg_earned,false);

const failed=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode({observer:0.9}));
assert.equal(failed.status,'FAILED');
assert.equal(failed.thresholds_pass,false);
assert.equal(failed.golden_egg_earned,false);

assert.equal(candidate.laws.loom_observation_not_golden_egg_adjudication,true);
assert.equal(candidate.laws.holonomy_not_truth_proof,true);
assert.equal(candidate.laws.route_deformation_not_causal_proof,true);
assert.equal(candidate.laws.science_ancestry_not_source_custody,true);

console.log('A15-R0 Loom-compatible Golden Egg same-episode acquisition canonical tests passed.');
