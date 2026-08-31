import assert from 'node:assert/strict';
import {
  ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,
  ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_PARENT_RECEIPT,
  atlasMatroidalReceiverClosureBasisExchangeCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-matroidal-receiver-closure-basis-exchange.js';

const c=atlasMatroidalReceiverClosureBasisExchangeCertificate();
assert.equal(ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,'td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange/v0.1');
assert.equal(ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_PARENT_RECEIPT,'ae53ebdc5fa970c162768fb694e826edc23fb0bb');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.ground_set,['q00','q01','q10','q11']);
assert.equal(c.D.matroid_type,'U_1_2_PLUS_TWO_LOOPS');
assert.equal(c.Q.matroid_type,'U_2_3_PLUS_ONE_LOOP');
assert.equal(c.D.rank.full_rank,1);
assert.equal(c.Q.rank.full_rank,2);
assert.deepEqual(c.D.rank.frequency,{'0':4,'1':12});
assert.deepEqual(c.Q.rank.frequency,{'0':2,'1':6,'2':8});
assert.deepEqual(c.D.combinatorics.independent_masks,[0,2,4]);
assert.deepEqual(c.Q.combinatorics.independent_masks,[0,1,2,3,4,5,6]);
assert.deepEqual(c.D.combinatorics.basis_masks,[2,4]);
assert.deepEqual(c.Q.combinatorics.basis_masks,[3,5,6]);
assert.deepEqual(c.D.combinatorics.circuit_masks,[1,6,8]);
assert.deepEqual(c.Q.combinatorics.circuit_masks,[7,8]);
assert.deepEqual(c.D.combinatorics.loop_indices,[0,3]);
assert.deepEqual(c.Q.combinatorics.loop_indices,[3]);
assert.deepEqual(c.D.combinatorics.nonloop_parallel_pairs,[[1,2]]);
assert.deepEqual(c.Q.combinatorics.nonloop_parallel_pairs,[]);
assert.equal(c.D.closure_axioms.steinitz_true_antecedents,16);
assert.equal(c.Q.closure_axioms.steinitz_true_antecedents,30);
assert.equal(c.D.closure_axioms.steinitz_failures,0);
assert.equal(c.Q.closure_axioms.steinitz_failures,0);
assert.equal(c.D.combinatorics.basis_exchange_obligations,2);
assert.equal(c.Q.combinatorics.basis_exchange_obligations,6);
assert.equal(c.D.combinatorics.basis_exchange_failures,0);
assert.equal(c.Q.combinatorics.basis_exchange_failures,0);
assert.deepEqual(c.combined_burden,{extensivity_checks:32,idempotence_checks:32,monotonicity_candidate_pairs:512,monotonicity_inclusion_premises:162,steinitz_candidate_triples:512,steinitz_true_antecedents:46,rank_closure_equivalence_checks:128,rank_submodularity_pairs:512,basis_exchange_obligations:8});
assert.equal(c.failure_total,0);
assert.equal(c.laws.declared_native_receiver_closures_are_matroidal,true);
assert.equal(c.laws.minimum_faithful_receivers_are_exactly_matroid_bases,true);
assert.equal(c.laws.native_receiver_separation_rank_equals_matroid_rank,true);
assert.equal(c.laws.globally_fixed_refinements_are_matroid_loops,true);
assert.equal(c.laws.D_moving_refinements_form_unique_nonloop_parallel_pair,true);
assert.equal(c.laws.universal_receiver_matroid_theorem_claimed,false);
assert.equal(c.laws.physical_matroid_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas matroidal receiver closure basis exchange canonical contract passed.');