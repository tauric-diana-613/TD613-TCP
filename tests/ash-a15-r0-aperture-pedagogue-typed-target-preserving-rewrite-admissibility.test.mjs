import assert from 'node:assert/strict';

import {
  TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_SCHEMA,
  applyTypedRkRewrite,
  findRkRedexes,
  runTypedTargetPreservingRewriteAdmissibilityAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-typed-target-preserving-rewrite-admissibility.js';
import { deriveRecurrenceHistoryUniverse } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-temporal-recurrence-phase-aliasing.js';

const result = runTypedTargetPreservingRewriteAdmissibilityAssay();

assert.equal(result.schema, TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_SCHEMA);
assert.equal(result.passed, true, 'The preregistered typed rewrite audition must satisfy typing, complete-target preservation, termination, overlap completeness, joinability, hostile controls, and parent custody or fail loudly.');
assert.equal(result.status, 'TYPED_TARGET_PRESERVING_REWRITE_ADMISSIBILITY_ROUND_CLOSED');
assert.equal(
  result.canonical_classification,
  'TYPED_TARGET_PRESERVING_TERMINATING_LOCALLY_CONFLUENT_RK_REWRITE_SYSTEM_IN_AUTHORED_DOMAIN',
);

assert.equal(result.source_domain.path_object, 'K_period4');
assert.equal(result.source_domain.last_action, 'Q_PHASE_PULSE');
assert.deepEqual(result.source_domain.forcing_seasons_retained, ['S0', 'S1', 'S2', 'S3']);
assert.deepEqual(result.source_domain.generators, ['T', 'Q']);
assert.equal(result.source_domain.finite_control_quotient_applied, false);
assert.equal(result.source_domain.source_season_erased, false);

assert.equal(result.rule_schema.id, 'R_k');
assert.equal(result.rule_schema.formal_k_domain, 'k >= 0 integer');
assert.equal(result.rule_schema.left, 'T Q^k T Q');
assert.equal(result.rule_schema.right, 'Q T Q^k T');
assert.equal(result.rule_schema.direction, 'LEFT_TO_RIGHT_ONLY');
assert.equal(result.rule_schema.inverse_semantics, false);

const typing = result.typing_certificate;
assert.equal(typing.passed, true);
assert.equal(typing.consequence, 'EVERY_SYNTACTIC_RK_REDEX_IN_A_WORD_FROM_AN_AUTHORED_Q_SOURCE_IS_TYPED');
assert.ok(typing.control_rows.length > 0);
for (const row of typing.control_rows) assert.equal(row.passed, true, `${row.source_season} prefix invariant must remain typed.`);

const target = result.target_preservation_certificate;
assert.equal(target.passed, true);
assert.equal(target.parent_all_formal_k_target_equality_inherited, true);
assert.equal(target.context_closure.passed, true);
assert.equal(target.complete_operational_target_not_endpoint_only, true);
assert.equal(target.route_provenance_erased, false);
assert.equal(target.classification, 'TYPED_R_K_REWRITE_PRESERVES_COMPLETE_OPERATIONAL_TARGET');
assert.equal(target.concrete_context_controls.role, 'CONCRETE_CONTEXT_CONTROLS_ONLY_NOT_BASIS_OF_ALL_FORMAL_K_PROOF');
assert.equal(target.concrete_context_controls.rows.length, 240);
for (const row of target.concrete_context_controls.rows) {
  assert.equal(row.passed, true, `${row.source_season} k=${row.k} context control must preserve the complete target.`);
}

const termination = result.termination_certificate;
assert.equal(termination.passed, true);
assert.equal(termination.alphabet_order, 'Q < T');
assert.equal(termination.length_preserved_for_all_formal_k, true);
assert.equal(termination.first_differing_symbol_changes_T_to_Q, true);
assert.equal(termination.whole_word_lexicographic_descent_under_context, true);
assert.equal(termination.fixed_length_word_set_finite, true);
assert.equal(termination.termination_conclusion, 'NO_FINITE_WORD_ADMITS_AN_INFINITE_RK_REWRITE_CHAIN');
for (const row of termination.sampled_arithmetic_controls_only) {
  assert.equal(row.length_preserved, true);
  assert.equal(row.lexicographic_descent, true);
}

const overlap = result.critical_overlap_certificate;
assert.equal(overlap.passed, true);
assert.equal(overlap.symbolic_overlap_completeness, true);
assert.equal(overlap.overlap_grammar.complete_nontrivial_overlap_family, 'W_(i,j)=T Q^i T Q^j T Q for i>=0, j>=1');
assert.equal(overlap.overlap_grammar.inclusion_overlap.startsWith('NONE'), true);
assert.equal(overlap.formal_join.formal_domain, 'i>=0 integer, j>=1 integer');
assert.equal(overlap.formal_join.common_join, 'N_(i,j)=Q^j T Q^(i+1) T T');
assert.equal(
  overlap.critical_pair_classification,
  'ALL_TYPED_NONTRIVIAL_RK_CRITICAL_OVERLAPS_SYMBOLICALLY_CLASSIFIED_AND_JOINABLE',
);
assert.equal(overlap.sampled_string_arithmetic_controls_only.length, 30);
for (const row of overlap.sampled_string_arithmetic_controls_only) {
  assert.equal(row.passed, true, `critical overlap i=${row.i}, j=${row.j} must join at the symbolic target shape.`);
}
const i0j1 = overlap.sampled_string_arithmetic_controls_only.find((row) => row.i === 0 && row.j === 1);
assert.deepEqual(i0j1.critical_word, ['T', 'T', 'Q', 'T', 'Q']);
assert.deepEqual(i0j1.expected_join, ['Q', 'T', 'Q', 'T', 'T']);

const local = result.local_confluence_certificate;
assert.equal(local.passed, true);
assert.equal(local.symbolic_critical_overlap_family_complete, true);
assert.equal(local.all_typed_critical_pairs_joinable, true);
assert.equal(local.disjoint_redexes_commute, true);
assert.equal(local.identical_redex_choice_trivial, true);
assert.equal(local.classification, 'TYPED_RK_REWRITE_RELATION_IS_LOCALLY_CONFLUENT_IN_AUTHORED_Q_SOURCE_DOMAIN');

// Hostile: raw textual occurrence outside the Q-last-action source domain must abstain.
const recurrence = deriveRecurrenceHistoryUniverse();
assert.equal(recurrence.status, 'RECURRENCE_HISTORY_UNIVERSE_DERIVED_FROM_PARENT_TEMPORAL_CUSTODY');
const untypedSource = recurrence.histories.find((history) => history.id === 'R_AB_S0');
assert.ok(untypedSource);
const textualL0 = ['T', 'T', 'Q'];
assert.equal(findRkRedexes(textualL0).length, 1, 'The hostile word must contain a textual L_0 redex.');
const untypedAttempt = applyTypedRkRewrite(untypedSource, textualL0, 0);
assert.equal(untypedAttempt.status, 'REWRITE_SOURCE_OUTSIDE_Q_LAST_ACTION_JURISDICTION');
assert.equal(untypedAttempt.disposition, 'ABSTAIN_BEFORE_TYPED_REWRITE');

// Hostile: undeclared inverse labels are not rewrite generators and cannot instantiate R_k.
assert.deepEqual(findRkRedexes(['T_INV', 'Q', 'T', 'Q']), []);
assert.deepEqual(findRkRedexes(['T', 'Q_INV', 'T', 'Q']), []);

const hostile = result.bounded_target_equivalence_hostile;
assert.equal(hostile.passed, true);
assert.equal(hostile.maximum_word_length, 7);
assert.ok(hostile.equal_target_pair_count > 0, 'The hostile search must include actual equal-target route collisions.');
assert.ok(hostile.target_classes_with_multiple_routes > 0);
assert.equal(hostile.authority, 'BOUNDED_HOSTILE_ONLY_NOT_A_GLOBAL_TARGET_EQUIVALENCE_COMPLETENESS_THEOREM');
assert.equal(hostile.anti_equivalence, 'BOUNDED_NORMAL_FORM_AGREEMENT_IS_NOT_COMPLETE_OPERATIONAL_TARGET_EQUIVALENCE');
for (const row of hostile.rows) {
  assert.equal(row.all_normalizations_completed, true);
  assert.ok([
    'CONNECTED_BY_TYPED_RK_REWRITES',
    'NOT_CONNECTED_WITHIN_DECLARED_SEARCH_BOUND',
  ].includes(row.classification));
}

assert.equal(result.route_provenance.erased, false);
assert.equal(result.route_provenance.rewrite_identifies_a_normalization_step_not_history_identity, true);
assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_720_723_724_725_CUSTODY_UNCHANGED');

assert.equal(result.claim_ceiling.complete_operational_target_equivalence_by_rewrite_normal_form, false);
assert.equal(result.claim_ceiling.finite_control_quotient, false);
assert.equal(result.claim_ceiling.source_season_erasure, false);
assert.equal(result.claim_ceiling.endpoint_erasure, false);
assert.equal(result.claim_ceiling.ambient_church_rosser, false);
assert.equal(result.claim_ceiling.rewrite_completion, false);
assert.equal(result.claim_ceiling.global_td613_confluence, false);
assert.equal(result.claim_ceiling.inverse_generator, false);
assert.equal(result.claim_ceiling.groupoid, false);
assert.equal(result.claim_ceiling.holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_SEPARATE_REWRITE_NORMAL_FORM_TARGET_EQUIVALENCE_COMPLETENESS_AUDITION');

console.log('A15-R0 typed rewrite-admissibility summary:', JSON.stringify({
  classification: result.canonical_classification,
  overlap_family: overlap.overlap_grammar.complete_nontrivial_overlap_family,
  formal_join: overlap.formal_join.common_join,
  bounded_hostile: {
    max_length: hostile.maximum_word_length,
    equal_target_pairs: hostile.equal_target_pair_count,
    multi_route_target_classes: hostile.target_classes_with_multiple_routes,
    split_normal_form_classes: hostile.target_classes_with_multiple_rewrite_normal_forms,
    observation: hostile.observation,
  },
}));
console.log('Ash A15-R0 Aperture × Pedagogue typed target-preserving rewrite-admissibility tests passed.');