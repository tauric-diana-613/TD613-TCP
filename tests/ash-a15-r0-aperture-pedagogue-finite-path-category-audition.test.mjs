import assert from 'node:assert/strict';

import {
  FINITE_PATH_CATEGORY_AUDITION_SCHEMA,
  runFinitePathCategoryAudition,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-finite-path-category-audition.js';

const result = runFinitePathCategoryAudition();

assert.equal(result.schema, FINITE_PATH_CATEGORY_AUDITION_SCHEMA);
assert.equal(result.passed, true, 'The preregistered finite path-category audition must pass before a finite slice category classification is emitted.');
assert.equal(result.status, 'FINITE_PATH_CATEGORY_AUDITION_CLOSED');
assert.equal(
  result.canonical_classification,
  'FINITE_ACYCLIC_OPERATIONALLY_REALIZED_PATH_CATEGORY_ON_DECLARED_S3_SLICE_WITH_IDENTITY_ASSOCIATIVITY_AND_GROUPOID_QUARANTINE',
);

assert.equal(result.slice_id, 'S3');
assert.equal(result.finite_slice.max_root_depth, 3);
assert.ok(result.finite_slice.node_count > 1, 'The finite slice must contain more than the anchor object.');
assert.ok(result.finite_slice.edge_count > 0, 'The finite slice must contain directed generator edges.');
assert.deepEqual(result.finite_slice.node_derivation_failures, []);
assert.deepEqual(result.finite_slice.edge_derivation_failures, []);
assert.equal(result.cycle_control.acyclic, true, 'The declared S3 slice must be acyclic before its complete internal path set can be finite.');
assert.equal(result.cycle_control.cycle, null);

assert.ok(result.arrow_count >= result.finite_slice.node_count, 'The complete internal arrow set must include at least one identity per object.');
assert.equal(result.identity_arrows.length, result.finite_slice.node_count);
assert.equal(result.identity_unique, true, 'Exactly one structural empty path must serve as identity per object.');
for (const identity of result.identity_arrows) {
  assert.equal(identity.length, 0);
  assert.equal(identity.is_identity, true);
  assert.deepEqual(identity.edge_ids, []);
  assert.deepEqual(identity.generator_word, []);
  assert.equal(identity.source_key, identity.target_key);
}

assert.equal(result.composition.composable_failures.length, 0, 'Every typed composable pair in the complete S3 path set must have an internal composite.');
assert.ok(result.composition.composable_pair_count > 0);
assert.ok(result.composition.noncomposable_pair_count > 0);
assert.equal(result.composition.noncomposable_all_abstain, true, 'Every source/target mismatch must abstain rather than fabricate a composite.');

assert.equal(result.identity_laws.passed, true);
assert.deepEqual(result.identity_laws.failures, []);
assert.equal(result.identity_laws.checks.length, result.arrow_count);
for (const check of result.identity_laws.checks) {
  assert.equal(check.left_equal, true, `Left identity must hold for ${check.arrow_id}.`);
  assert.equal(check.right_equal, true, `Right identity must hold for ${check.arrow_id}.`);
}

assert.equal(result.associativity.passed, true);
assert.deepEqual(result.associativity.failures, []);
assert.ok(result.associativity.checks.length > 0, 'Associativity must be exhaustively tested on a nonempty set of composable triples.');
for (const check of result.associativity.checks) {
  assert.equal(check.equal, true, `Associativity must hold for ${check.f}, ${check.g}, ${check.h}.`);
  assert.equal(check.left_arrow_id, check.right_arrow_id);
}

assert.equal(result.identity_realization.passed, true, 'Every identity arrow must realize as an exact no-op on every retained custody representative.');
assert.deepEqual(result.identity_realization.failures, []);
assert.ok(result.identity_realization.checks.length >= result.finite_slice.node_count * 2, 'The non-vacuous receipt pair should propagate at least two retained representatives per discovered object.');
for (const check of result.identity_realization.checks) {
  assert.equal(check.byte_equal, true);
  assert.equal(check.same_reference, true);
  assert.equal(check.equal, true);
}

assert.equal(result.operational_realization.passed, true, 'Every internal path arrow must realize to its declared target from every retained source representative.');
assert.deepEqual(result.operational_realization.failures, []);
assert.ok(result.operational_realization.checks.length >= result.arrow_count * 2);
for (const check of result.operational_realization.checks) {
  assert.equal(check.equal, true, `Operational realization must respect target typing for ${check.arrow_id}.`);
  assert.equal(check.receipt_variant_before, check.receipt_variant_after, 'Receipt identity may persist in custody but may not select a different target object.');
}

assert.equal(result.composition_realization.passed, true, 'Composite path realization must agree with sequential realization for every typed pair and retained source representative.');
assert.deepEqual(result.composition_realization.failures, []);
assert.ok(result.composition_realization.checks.length > 0);
for (const check of result.composition_realization.checks) {
  assert.equal(check.equal, true, `Composite realization must match sequential realization for ${check.first} then ${check.second}.`);
  assert.equal(check.direct_target_key, check.sequential_target_key);
}

assert.equal(result.duplicate_identity_control.unique, true);
assert.equal(
  result.duplicate_identity_control.classification,
  'COSMETIC_EMPTY_PATH_LABEL_NORMALIZES_TO_EXISTING_IDENTITY',
);
assert.equal(
  result.duplicate_identity_control.existing_identity_arrow_id,
  result.duplicate_identity_control.normalized_arrow_id,
);

assert.ok(result.reverse_path_quarantine.witness, 'At least one nonidentity arrow must lack any reverse path so finite category success cannot be laundered into groupoid structure.');
assert.equal(result.reverse_path_quarantine.witness.has_reverse_path, false);
assert.equal(
  result.reverse_path_quarantine.classification,
  'NONIDENTITY_ARROW_WITHOUT_REVERSE_PATH_WITNESSED',
);

assert.deepEqual(result.closed_nonidentity_paths, [], 'The preregistered acyclic S3 slice should contain no nonidentity closed path.');
assert.equal(result.closed_path_classification, 'NO_NONIDENTITY_CLOSED_PATH_IN_FINITE_SLICE');

assert.equal(result.parent_custody_unchanged, true, 'The finite path-category audition may index #716 but may not mutate its parent custody.');
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_FINITE_ACYCLIC_S3_SLICE_/);
assert.equal(result.claim_ceiling.ambient_td613_category, false);
assert.equal(result.claim_ceiling.free_category_of_ambient_grammar, false);
assert.equal(result.claim_ceiling.groupoid, false);
assert.equal(result.claim_ceiling.inverse_morphisms, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.loop_endomorphism_or_holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.a16, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(
  result.stop,
  'HUMAN_𝄐_QUALIFIED_TO_CHOOSE_BETWEEN_GENERATOR_BROADENING_AND_FIRST_INVERTIBILITY_AUDITION',
);

console.log('Ash A15-R0 Aperture × Pedagogue finite path-category audition tests passed.');
