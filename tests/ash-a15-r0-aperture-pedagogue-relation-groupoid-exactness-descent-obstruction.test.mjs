import assert from 'node:assert/strict';
import {
  relationGroupoidOneCocycle,
  routeWiseTrivializedComparison,
  closedRelationComparisonCycle,
  relationGroupoidExactnessDescentObstructionCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-relation-groupoid-exactness-descent-obstruction.js';

const cert = relationGroupoidExactnessDescentObstructionCertificate();
assert.equal(cert.passed, true);
assert.equal(
  cert.status,
  'RELATION_GROUPOID_EXACTNESS_AND_DOWNSTAIRS_DESCENT_OBSTRUCTION_CERTIFIED',
);

const ttq = Object.freeze(['T', 'T', 'Q']);
const qtt = Object.freeze(['Q', 'T', 'T']);
const wound = relationGroupoidOneCocycle(ttq, qtt);
assert.equal(wound.status, 'RELATION_GROUPOID_EXACT_ONE_COCYCLE_DERIVED');
assert.deepEqual(wound.base, { t: 2, E: 1, O: 0 });
assert.equal(wound.P_target, 2);
assert.equal(wound.P_source, 0);
assert.equal(wound.c, 2);
assert.equal(wound.exact_potential_identity, true);

// Route-wise coordinates trivialize the comparison representation exactly.
for (const n of [-11, 0, 8]) {
  const trivialized = routeWiseTrivializedComparison(ttq, qtt, n);
  assert.equal(trivialized.status, 'ROUTE_WISE_COMPARISON_TRIVIALIZATION_DERIVED');
  assert.equal(trivialized.target_gauged_coordinate, n);
  assert.equal(trivialized.identity_after_conjugation, true);
}

// A closed comparison cycle has zero circulation by exact telescoping.
const u = Object.freeze(['T', 'T', 'Q', 'Q']);
const v = Object.freeze(['Q', 'T', 'T', 'Q']);
const w = Object.freeze(['Q', 'Q', 'T', 'T']);
const cycle = closedRelationComparisonCycle(Object.freeze([u, v, w]));
assert.equal(cycle.status, 'CLOSED_RELATION_COMPARISON_CIRCULATION_DERIVED');
assert.equal(cycle.total_translation, 0);
assert.equal(cycle.zero_circulation, true);
assert.deepEqual(cycle.arrows.map((row) => row.c), [-2, -2, 4]);

// A different-base pseudo-cycle abstains instead of fabricating composability.
const badCycle = closedRelationComparisonCycle(Object.freeze([
  Object.freeze(['T']),
  Object.freeze(['Q']),
]));
assert.equal(badCycle.status, 'RELATION_COMPARISON_CYCLE_ABSTAINS_NONCOMPOSABLE');

assert.equal(cert.exact_relation_groupoid_one_cocycle.passed, true);
assert.equal(cert.route_wise_trivialization.passed, true);
assert.equal(cert.base_section_nontrivialization.passed, true);
assert.equal(cert.base_section_nontrivialization.original.c, 2);
assert.equal(cert.base_section_nontrivialization.section_a.transformed_translation, 2);
assert.equal(cert.base_section_nontrivialization.section_b.transformed_translation, 2);

// Critical free-monoid lemma closes the converse coboundary->descent direction.
assert.equal(cert.descent_coboundary_equivalence.free_monoid_homomorphism_descent.passed, true);
assert.equal(cert.descent_coboundary_equivalence.pulled_back_cocycle_identity.passed, true);
assert.equal(cert.descent_coboundary_equivalence.inherited_bar_cycle.boundary_zero, true);
assert.equal(cert.descent_coboundary_equivalence.inherited_bar_cycle.omega_pairing, 2);
assert.equal(cert.descent_coboundary_equivalence.concrete_non_descent_witness.return_translation, 2);

assert.deepEqual(cert.canonical_classifications, [
  'THE_SAME_BASE_RETURN_REPRESENTATION_IS_AN_EXACT_RELATION_GROUPOID_ONE_COBOUNDARY_UPSTAIRS_AND_HAS_ZERO_CLOSED_COMPARISON_CIRCULATION',
  'TRIVIALITY_OF_ALL_SAME_BASE_RETURNS_IS_EQUIVALENT_IN_THE_AUTHORED_FREE_MONOID_QUOTIENT_TO_DESCENT_OF_P_AND_TO_COBOUNDARY_TRIVIALITY_OF_THE_DOWNSTAIRS_INTEGER_TWO_COCYCLE',
  'THE_NONZERO_DOWNSTAIRS_TWO_COHOMOLOGY_CLASS_IS_EXACTLY_THE_OBSTRUCTION_TO_DESCENDING_THE_ROUTE_WISE_TRIVIALIZING_PRIMITIVE_THROUGH_THE_TARGET_QUOTIENT',
]);

assert.equal(
  cert.bearing,
  'THE_CURRENT_NONIDENTITY_COMPARISON_RETURNS_ARE_NOT_INTRINSIC_ONE_HOLONOMY_OF_THE_ROUTE_RELATION_GROUPOID; THEIR_NONTRIVIAL_BASE_DESCENT_CONTENT_LIVES_ONE_COHOMOLOGICAL_DEGREE_HIGHER_IN_THE_DOWNSTAIRS_TWO_COCYCLE_OBSTRUCTION.',
);

assert.deepEqual(cert.claim_ceiling, [
  'NO_OPERATIONAL_TQ_LOOP_OR_PATH_GROUPOID',
  'NO_HOLONOMY_REPRESENTATION_PROMOTION',
  'NO_CONNECTION_OR_CURVATURE',
  'NO_TWO_HOLONOMY_OR_GERBE_PROMOTION',
  'NO_BERRY_OR_QUANTUM_ANALOGY',
  'NO_PROTO_LOOM_A16_MERGE_PUBLICATION_PRODUCTION_OR_VERCEL',
]);

console.log('Ash A15-R0 #764 relation-groupoid exactness/descent obstruction tests passed.');
