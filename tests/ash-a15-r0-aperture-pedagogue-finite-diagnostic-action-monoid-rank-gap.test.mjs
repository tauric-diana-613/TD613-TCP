import assert from 'node:assert/strict';
import { finiteDiagnosticActionMonoidRankGapCertificate } from '../app/dome-world/previews/a15-r0/finite-diagnostic-action-monoid-rank-gap.js';

const cert=finiteDiagnosticActionMonoidRankGapCertificate();

assert.equal(cert.parent_receipt,'2f0567e34dca5fc766f0858a6440db18e828bf00');
assert.equal(cert.parent_exact,true);
assert.equal(cert.passed,true);

assert.deepEqual(cert.domain.task_points,['A','B','T','M','R']);
assert.equal(cert.domain.calibration_point,'A');
assert.equal(cert.domain.self_function_count,3125);
assert.equal(cert.domain.continuous_endomorphism_count,128);
assert.equal(cert.domain.immediate_observation_class_count,3);
assert.deepEqual(cert.domain.observation,{A:1,B:1,T:2,M:2,R:4});

assert.equal(cert.action_monoid.size,128);
assert.equal(cert.action_monoid.composition_closure_checks,16384);
assert.equal(cert.action_monoid.composition_closure_failures,0);
assert.equal(cert.action_monoid.syntactic_action_quotient_size,128);
assert.equal(cert.action_monoid.K_lower_bound,5);
assert.equal(cert.action_monoid.K_power_K_upper_bound,3125);

assert.equal(cert.state_quotient.residual_state_index,5);
assert.equal(cert.state_quotient.universal_distinguishing_depth,1);
assert.deepEqual(cert.state_quotient.pair_depths,{
  'A:B':1,'A:T':0,'A:M':0,'A:R':0,
  'B:T':0,'B:M':0,'B:R':0,
  'T:M':1,'T:R':0,'M:R':0,
});
assert.deepEqual(cert.state_quotient.evaluation_fiber_counts_at_A,{A:84,B:18,T:20,M:2,R:4});

assert.equal(cert.separation.single_operator_separator_count,37);
assert.equal(cert.separation.separation_rank,1);
assert.equal(cert.separation.named_single_separator,'ATATR');
assert.equal(cert.separation.named_single_separator_profile.all_separated,true);
assert.equal(cert.separation.named_single_separator_profile.max_finite_depth,1);
assert.equal(cert.separation.named_single_separator_generated_closure_size,3);

assert.deepEqual(cert.generation.indispensable_generator_rows,[
  'AATMR','ABAMR','ABTAR','ABTTR','ABTRR','ABRMR','ATTMR','ARTMR','TATRT',
]);
assert.equal(cert.generation.indispensable_generator_count,9);
assert.equal(cert.generation.indispensable_base_closure_size,56);
assert.equal(cert.generation.missing_after_indispensable_base,72);
assert.equal(cert.generation.one_addition_candidate_count,72);
assert.equal(cert.generation.best_ten_generator_closure_size,101);
assert.equal(cert.generation.two_addition_candidate_count,2556);
assert.equal(cert.generation.full_two_completion_pair_count,16);
assert.deepEqual(cert.generation.first_full_completion_pair,['AAATM','BTBBR']);
assert.equal(cert.generation.atomic_action_generating_rank,11);
assert.equal(cert.generation.exemplar_generator_rows.length,11);
assert.equal(cert.generation.exemplar_generator_closure_size,128);

assert.equal(cert.dual_quotient.residual_state_quotient_size,5);
assert.equal(cert.dual_quotient.syntactic_action_quotient_size,128);
assert.equal(cert.dual_quotient.syntactic_congruence_strictly_refines_calibrated_state_congruence,true);
assert.deepEqual(cert.dual_quotient.witness,{
  left:'ABTMR',right:'AATMR',calibration_point:'A',shared_calibration_endpoint:'A',
  split_state:'B',left_split_endpoint:'B',right_split_endpoint:'A',
});

assert.deepEqual(cert.complexity_signature,{K:5,M:128,r_sep:1,r_gen_atom:11,D_univ:1,separation_generation_rank_gap:10});
assert.ok(cert.complexity_signature.r_sep<cert.complexity_signature.r_gen_atom);
assert.ok(cert.complexity_signature.K<cert.complexity_signature.M);

for(const membrane of [
  'SEPARATING_APERTURE_RANK != ACTION_GENERATING_RANK',
  'RESIDUAL_STATE_EQUIVALENCE != GLOBAL_ACTION_EQUIVALENCE',
  'FINITE_ACTION_MONOID != PHYSICAL_DYNAMICS',
  'DECLARED_CALIBRATION_POINT != INHERITED_SOURCE',
]) assert.ok(cert.membranes.includes(membrane));

console.log('Ash A15-R0 finite diagnostic action monoid / separation-generation rank-gap canonical tests passed.');
