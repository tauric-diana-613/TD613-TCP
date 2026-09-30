import assert from 'node:assert/strict';
import {
  ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA,
  ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_PARENT_RECEIPT,
  atlasTutteRankGeneratingCompressionCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-tutte-rank-generating-compression.js';

assert.equal(ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA,'td613.dome-world.atlas-tutte-rank-generating-compression/v0.1');
assert.equal(ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_PARENT_RECEIPT,'62722caea3f35bd520a2a1bfa5163f8cd2e14c26');

const c=atlasTutteRankGeneratingCompressionCertificate();
assert.equal(c.passed,true);
assert.equal(c.parent_exact,true);

assert.deepEqual(c.D.rank_generating_terms,[
  {u:0,v:0,c:2},{u:0,v:1,c:5},{u:0,v:2,c:4},{u:0,v:3,c:1},{u:1,v:0,c:1},{u:1,v:1,c:2},{u:1,v:2,c:1},
]);
assert.deepEqual(c.Q.rank_generating_terms,[
  {u:0,v:0,c:3},{u:0,v:1,c:4},{u:0,v:2,c:1},{u:1,v:0,c:3},{u:1,v:1,c:3},{u:2,v:0,c:1},{u:2,v:1,c:1},
]);
assert.equal(c.D.rank_generating_coefficient_sum,16);
assert.equal(c.Q.rank_generating_coefficient_sum,16);

assert.deepEqual(c.D.tutte_terms,[{x:0,y:3,c:1},{x:1,y:2,c:1}]);
assert.deepEqual(c.Q.tutte_terms,[{x:0,y:2,c:1},{x:1,y:1,c:1},{x:2,y:1,c:1}]);
assert.equal(c.D.raw_substitution_contributions,22);
assert.equal(c.Q.raw_substitution_contributions,21);

assert.deepEqual(c.D.specializations,{'1,1':2,'2,1':3,'1,2':12,'2,2':16});
assert.deepEqual(c.Q.specializations,{'1,1':3,'2,1':7,'1,2':8,'2,2':16});
assert.deepEqual(c.D.specialization_cross_checks,{bases:true,independent_sets:true,spanning_sets:true,all_subsets:true});
assert.deepEqual(c.Q.specialization_cross_checks,{bases:true,independent_sets:true,spanning_sets:true,all_subsets:true});

assert.deepEqual(c.D.spanning_slice_deletion_coefficients,[1,4,5,2,0]);
assert.deepEqual(c.Q.spanning_slice_deletion_coefficients,[1,4,3,0,0]);
assert.equal(c.D.deletion_enumerator_recovered,true);
assert.equal(c.Q.deletion_enumerator_recovered,true);

assert.deepEqual(c.D.element_classes,['loop','ordinary','ordinary','loop']);
assert.deepEqual(c.Q.element_classes,['ordinary','ordinary','ordinary','loop']);
assert.equal(c.D.recurrence.length,4);
assert.equal(c.Q.recurrence.length,4);
assert.equal(c.D.recurrence.every(r=>r.passed),true);
assert.equal(c.Q.recurrence.every(r=>r.passed),true);
assert.equal(c.D.recurrence_failures,0);
assert.equal(c.Q.recurrence_failures,0);
assert.equal(c.D.minor_type_polynomial_failures,0);
assert.equal(c.Q.minor_type_polynomial_failures,0);

assert.deepEqual(c.aggregate,{
  parent_subset_rank_terms:32,
  coefficient_sum_identities:2,
  raw_substitution_contributions:43,
  minor_rank_terms:128,
  deletion_contraction_identities:8,
  loop_identities:3,
  coloop_identities:0,
  ordinary_identities:5,
  specialization_identities:8,
  deletion_enumerator_recoveries:2,
  failures:0,
});

assert.equal(c.laws.exact_rank_generating_compression,true);
assert.equal(c.laws.exact_tutte_polynomials,true);
assert.equal(c.laws.all_elementwise_deletion_contraction_identities,true);
assert.equal(c.laws.standard_specializations_recover_earned_counts,true);
assert.equal(c.laws.spanning_slice_recovers_earned_deletion_enumerators,true);
assert.equal(c.laws.complete_matroid_isomorphism_invariant_claimed,false);
assert.equal(c.laws.lossless_history_reconstruction_claimed,false);
assert.equal(c.laws.universal_statistic_sufficiency_claimed,false);
assert.equal(c.laws.physical_reliability_claimed,false);
assert.equal(c.laws.causal_deletion_contraction_claimed,false);

for(const membrane of [
  'TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT',
  'CORANK_NULLITY_COMPRESSION != LOSSLESS_HISTORY_RECONSTRUCTION',
  'POLYNOMIAL_SPECIALIZATION != UNIVERSAL_STATISTIC_SUFFICIENCY',
  'DELETION_CONTRACTION_RECURRENCE != CAUSAL_REMOVAL_OR_INTERVENTION',
  'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
]) assert.equal(c.membranes.includes(membrane),true,`missing membrane: ${membrane}`);

console.log('Ash A15-R0 Atlas Tutte rank-generating compression canonical tests passed.');
