import assert from 'node:assert/strict';
import {
  ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA,
  ATLAS_TUTTE_COLLISION_NONISOMORPHISM_PARENT_RECEIPT,
  atlasTutteCollisionNonisomorphismCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-tutte-collision-nonisomorphism.js';

assert.equal(ATLAS_TUTTE_COLLISION_NONISOMORPHISM_SCHEMA,'td613.dome-world.atlas-tutte-collision-nonisomorphism/v0.1');
assert.equal(ATLAS_TUTTE_COLLISION_NONISOMORPHISM_PARENT_RECEIPT,'b34d04f078791bada782bdb88d2d22307c891595');

const c=atlasTutteCollisionNonisomorphismCertificate();
assert.equal(c.parent_exact,true);
assert.equal(c.passed,true);
assert.equal(c.rank_axiom_failure_total,0);
assert.deepEqual(c.M_disj.rank_frequency,{'0':1,'1':6,'2':17,'3':40});
assert.deepEqual(c.M_meet.rank_frequency,{'0':1,'1':6,'2':17,'3':40});
assert.deepEqual(c.M_disj.circuit_hyperplanes,[7,56]);
assert.deepEqual(c.M_meet.circuit_hyperplanes,[7,25]);
assert.deepEqual(c.M_disj.circuit_hyperplane_intersection_profile,[0]);
assert.deepEqual(c.M_meet.circuit_hyperplane_intersection_profile,[1]);

const R={'0,0':18,'0,1':15,'0,2':6,'0,3':1,'1,0':15,'1,1':2,'2,0':6,'3,0':1};
const T={'0,1':4,'0,2':3,'0,3':1,'1,0':4,'1,1':2,'2,0':3,'3,0':1};
assert.deepEqual(c.M_disj.rank_generating,R);
assert.deepEqual(c.M_meet.rank_generating,R);
assert.deepEqual(c.common_rank_generating,R);
assert.deepEqual(c.common_tutte,T);
assert.equal(c.laws.exact_tutte_collision,true);

assert.deepEqual(c.cross_isomorphism,{permutations:720,rank_comparisons:46080,match_count:0,match_permutation_indices:[]});
assert.equal(c.self_automorphisms.M_disj.permutations,720);
assert.equal(c.self_automorphisms.M_disj.rank_comparisons,46080);
assert.equal(c.self_automorphisms.M_disj.match_count,72);
assert.equal(c.self_automorphisms.M_meet.permutations,720);
assert.equal(c.self_automorphisms.M_meet.rank_comparisons,46080);
assert.equal(c.self_automorphisms.M_meet.match_count,8);
assert.deepEqual(c.aggregate_burden,{rank_entries_constructed:128,rank_bound_checks:128,monotonicity_candidate_pairs:8192,monotonicity_premises:1458,submodularity_pairs:8192,polynomial_subset_terms:128,permutation_searches:2160,permutation_rank_comparisons:138240});

assert.equal(c.laws.both_declared_controls_are_matroids,true);
assert.equal(c.laws.exhaustive_cross_isomorphism_search_has_zero_matches,true);
assert.equal(c.laws.circuit_hyperplane_intersection_geometry_differs,true);
assert.equal(c.laws.automorphism_group_orders_differ,true);
assert.equal(c.laws.tutte_is_complete_matroid_isomorphism_invariant_in_this_control,false);
assert.equal(c.laws.universal_tutte_collision_rate_claimed,false);
assert.equal(c.laws.physical_system_nonidentity_claimed,false);
assert.equal(c.laws.history_nonidentity_inferred_from_tutte_claimed,false);
assert.ok(c.membranes.includes('TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT'));

console.log('Ash A15-R0 Atlas Tutte collision nonisomorphism canonical contract passed.');
