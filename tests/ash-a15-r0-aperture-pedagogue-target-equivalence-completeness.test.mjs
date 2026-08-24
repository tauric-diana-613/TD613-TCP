import assert from 'node:assert/strict';

import {
  TARGET_EQUIVALENCE_COMPLETENESS_SCHEMA,
  blockDecomposeTqWord,
  canonicalParityBlockNormalForm,
  runTargetEquivalenceCompletenessAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-target-equivalence-completeness.js';

const result = runTargetEquivalenceCompletenessAssay();

assert.equal(result.schema, TARGET_EQUIVALENCE_COMPLETENESS_SCHEMA);
assert.equal(result.passed, true, 'The preregistered source-relative completeness theorem must satisfy the symbolic certificate, larger bounded hostile, and parent custody or fail loudly.');
assert.equal(result.status, 'SOURCE_RELATIVE_TARGET_EQUIVALENCE_COMPLETENESS_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'SOURCE_RELATIVE_ALL_FINITE_TQ_OPERATIONAL_TARGET_EQUIVALENCE_IFF_RK_NORMAL_FORM_EQUALITY',
);

assert.equal(result.source_domain.source_relative, true);
assert.deepEqual(result.source_domain.source_seasons, ['S0', 'S1', 'S2', 'S3']);
assert.equal(result.source_domain.last_action, 'Q_PHASE_PULSE');
assert.deepEqual(result.source_domain.generators, ['T', 'Q']);
assert.equal(result.source_domain.source_erasure_authorized, false);

const block = blockDecomposeTqWord(['Q', 'Q', 'T', 'Q', 'T', 'Q', 'Q', 'Q']);
assert.equal(block.status, 'UNIQUE_TQ_Q_BLOCK_DECOMPOSITION_DERIVED');
assert.equal(block.t, 2);
assert.deepEqual(block.blocks, [2, 1, 3]);
assert.equal(block.E, 5);
assert.equal(block.O, 1);
assert.equal(block.potential, 7);

const canonical = canonicalParityBlockNormalForm(['Q', 'Q', 'T', 'Q', 'T', 'Q', 'Q', 'Q']);
assert.equal(canonical.status, 'PARITY_BLOCK_CANONICAL_NORMAL_FORM_DERIVED');
assert.deepEqual(canonical.normal_form, ['Q', 'Q', 'Q', 'Q', 'Q', 'T', 'Q', 'T']);
assert.equal(canonical.t, 2);
assert.equal(canonical.E, 5);
assert.equal(canonical.O, 1);

const noTick = canonicalParityBlockNormalForm(['Q', 'Q', 'Q']);
assert.deepEqual(noTick.normal_form, ['Q', 'Q', 'Q']);
const oneTick = canonicalParityBlockNormalForm(['Q', 'T', 'Q', 'Q']);
assert.deepEqual(oneTick.normal_form, ['Q', 'T', 'Q', 'Q']);
assert.equal(blockDecomposeTqWord(['T_INV']).status, 'UNDECLARED_PATH_GENERATOR_ABSTAINS');

const symbolic = result.symbolic_certificate;
assert.equal(symbolic.passed, true);
assert.equal(symbolic.status, 'ALL_FINITE_SOURCE_RELATIVE_TARGET_EQUIVALENCE_SYMBOLIC_CERTIFICATE_EARNED');
assert.equal(symbolic.unique_block_decomposition, true);
assert.equal(symbolic.rewrite_block_action, 'a_i += 1; a_(i+2) -= 1');
assert.deepEqual(symbolic.rewrite_invariants, ['t', 'E', 'O']);
assert.equal(symbolic.irreducible_characterization, 'R_k-irreducible iff a_i=0 for every i>=2');
assert.equal(symbolic.canonical_form, 't=0: Q^E; t>=1: Q^E T Q^O T^(t-1)');
assert.match(symbolic.redex_existence_argument, /a_j>0 for j>=2/);
assert.match(symbolic.descent_potential, /decreases P by exactly 2/);
assert.equal(symbolic.bounded_enumeration_used_as_universal_proof, false);
assert.equal(symbolic.synthetic_dependency_controls.period_two_question_delta_mutation_rejected, true);
assert.equal(symbolic.synthetic_dependency_controls.all_t_cycle_witness_coordinates_poisoned_and_rejected, true);

const injectivity = symbolic.operational_injectivity;
assert.equal(injectivity.passed, true);
assert.equal(injectivity.status, 'SOURCE_RELATIVE_TARGET_INJECTIVITY_TABLE_PREMISES_CERTIFIED');
assert.deepEqual(injectivity.forcing_four_cycle_sum, [3, 3, 3, 3]);
assert.ok(injectivity.nonzero_t_cycle_witness_coordinates.length >= 1);
assert.ok(injectivity.q_invisible_endpoint_coordinates.length >= 1);
for (const row of injectivity.source_rows) {
  assert.equal(row.passed, true, `${row.source_season} must retain period-two question deltas and rank-two parity vectors.`);
  assert.equal(row.period_two_question_delta, true);
  assert.equal(row.parity_vectors_rank_two, true);
}
assert.match(injectivity.formal_t_argument, /t_prime-t=4m/);
assert.match(injectivity.formal_parity_argument, /rank two/);
assert.match(symbolic.theorem, /Target_s\(u\)=Target_s\(v\)/);

const hostile = result.bounded_hostile;
assert.equal(hostile.passed, true);
assert.equal(hostile.maximum_word_length, 8, 'The corroborating hostile must exceed #726\'s maximum word length 7.');
assert.equal(hostile.word_count_per_source, 511);
assert.ok(hostile.equal_target_pair_count > 2036, 'The widened hostile must contain more equal-target collisions than #726.');
assert.equal(hostile.equal_target_pair_count, hostile.same_normal_form_pair_count);
assert.equal(hostile.normalization_failures, 0);
assert.equal(hostile.target_classes_split_across_normal_forms, 0);
assert.equal(hostile.normal_form_classes_split_across_targets, 0);
assert.equal(hostile.observation, 'LENGTH_8_EXHAUSTIVE_PARTITIONS_MATCH_EXACTLY_WITHOUT_SOURCE_ERASURE');
assert.equal(hostile.undeclared_inverse_label_rejected, true);
assert.equal(hostile.authority, 'BOUNDED_HOSTILE_CORROBORATION_ONLY_SYMBOLIC_CERTIFICATE_CARRIES_ALL_FINITE_WORD_CLAIM');
for (const row of hostile.source_rows) {
  assert.equal(row.passed, true);
  assert.equal(row.t_zero_one_failures, 0);
  assert.ok(row.t_zero_one_controls > 0);
  assert.equal(row.multi_transfer_passed, true);
  assert.ok(row.multi_transfer_steps >= 3);
  assert.equal(row.distinct_route_same_normal_form_control, true);
  assert.equal(row.target_class_count, row.normal_form_class_count);
}
assert.equal(
  hostile.cross_source_control.classification,
  'SOURCE_RELATIVE_INVARIANT_DOES_NOT_AUTHORIZE_SOURCE_ERASURE',
);
assert.ok(hostile.cross_source_control.distinct_complete_target_count_across_sources > 1);

assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_720_723_724_725_726_CUSTODY_UNCHANGED');

for (const forbidden of [
  'source_season_erasure',
  'cross_source_operational_quotient',
  'ambient_td613_church_rosser',
  'rewrite_completion_beyond_authored_jurisdiction',
  'finite_state_automaton_for_unbounded_endpoint',
  'lattice_or_domain_theory',
  'causal_set',
  'inverse_generator',
  'inverse_morphism',
  'groupoid',
  'transport_or_connection',
  'loop_endomorphism',
  'holonomy',
  'curvature',
  'berry_or_quantum',
  'proto_loom',
  'a16',
  'live_ash',
  'merge',
  'production',
  'vercel',
]) {
  assert.equal(result.claim_ceiling[forbidden], false, `${forbidden} must remain outside #728 authority.`);
}

assert.equal(
  result.next_learning_action,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_TARGET_EQUIVALENCE_QUOTIENT_OR_PATH_OBJECT_PROMOTION_AUDITION',
);

console.log('A15-R0 target-equivalence completeness summary:', JSON.stringify({
  classification: result.canonical_classification,
  normal_form: symbolic.canonical_form,
  forcing_cycle: injectivity.forcing_four_cycle_sum,
  hostile: {
    max_length: hostile.maximum_word_length,
    words_per_source: hostile.word_count_per_source,
    equal_target_pairs: hostile.equal_target_pair_count,
    equal_normal_form_pairs: hostile.same_normal_form_pair_count,
    target_splits: hostile.target_classes_split_across_normal_forms,
    normal_form_splits: hostile.normal_form_classes_split_across_targets,
    cross_source_target_diversity: hostile.cross_source_control.distinct_complete_target_count_across_sources,
  },
}));
console.log('Ash A15-R0 Aperture × Pedagogue source-relative target-equivalence completeness tests passed.');
