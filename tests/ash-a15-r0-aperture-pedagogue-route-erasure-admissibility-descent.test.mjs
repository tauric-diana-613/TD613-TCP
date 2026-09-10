import assert from 'node:assert/strict';

import {
  ROUTE_ERASURE_ADMISSIBILITY_DESCENT_PARENT_RECEIPT,
  auditRouteIndependentRawSeamRule,
  rawSeamSupportForBlocks,
  rawSupportInjectivityProfile,
  recoverBlocksFromC1AndRawSupport,
  routeErasureAdmissibilityProfile,
  runRouteErasureAdmissibilityDescentChamber,
  supportCoordinateMaxima,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-route-erasure-admissibility-descent.js';
import {
  routeRespectingProductCriterion,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-dependent-sum-custody-schema.js';

assert.equal(
  ROUTE_ERASURE_ADMISSIBILITY_DESCENT_PARENT_RECEIPT,
  'de1cc600b330e90fa237c8984379ee08a787b0f7',
);

const support = rawSeamSupportForBlocks([0, 0, 0, 3, 0, 0]);
assert.equal(support.status, 'EXACT_RAW_SEAM_SUPPORT_FOR_BLOCKS_DERIVED');
assert.equal(support.cardinality, 4);
assert.deepEqual(support.rows, [
  [0, 0, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 2, 0],
  [0, 0, 3, 0],
]);
const maxima = supportCoordinateMaxima(support.rows);
assert.equal(maxima.status, 'SUPPORT_COORDINATE_MAXIMA_DERIVED');
assert.deepEqual(maxima.maxima, [0, 0, 3, 0]);
const recovered = recoverBlocksFromC1AndRawSupport(5, 0, 3, 9, support.rows);
assert.equal(recovered.status, 'EXACT_ROUTE_BLOCKS_RECOVERED_FROM_C1_AND_RAW_SUPPORT');
assert.deepEqual(recovered.blocks, [0, 0, 0, 3, 0, 0]);

const equalCardinality = routeErasureAdmissibilityProfile(5, 0, 3, 9);
assert.equal(equalCardinality.status, 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED');
assert.equal(equalCardinality.route_count, 2);
assert.deepEqual(equalCardinality.raw_support_cardinalities, [4, 4]);
assert.equal(equalCardinality.all_raw_supports_equal, false);
assert.equal(equalCardinality.exact_route_independent_raw_seam_admissibility_descends, false);
assert.equal(equalCardinality.exact_descent_iff_route_fiber_singleton, true);
assert.deepEqual(equalCardinality.routes.map((route) => route.blocks), [
  [0, 0, 0, 3, 0, 0],
  [0, 1, 0, 1, 0, 1],
]);
assert.equal(equalCardinality.union_cardinality, 6);
assert.equal(equalCardinality.intersection_cardinality, 2);
assert.equal(equalCardinality.descent_gap_cardinality, 4);
assert.deepEqual(equalCardinality.intersection_support, [
  [0, 0, 0, 0],
  [0, 0, 1, 0],
]);

const product = routeRespectingProductCriterion(5, 0, 3, 9);
assert.equal(product.status, 'ROUTE_RESPECTING_PRODUCT_EXACTNESS_CRITERION_DERIVED');
assert.equal(product.route_respecting_padding_free_product_exists, true);
assert.equal(product.product_secondary_alphabet_size_if_exact, 4);
assert.equal(equalCardinality.exact_route_independent_raw_seam_admissibility_descends, false);

const inherited = routeErasureAdmissibilityProfile(3, 1, 1, 3);
assert.equal(inherited.status, 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED');
assert.equal(inherited.route_count, 2);
assert.equal(inherited.union_cardinality, 4);
assert.equal(inherited.intersection_cardinality, 1);
assert.equal(inherited.descent_gap_cardinality, 3);
const inheritedUnion = auditRouteIndependentRawSeamRule(3, 1, 1, 3, inherited.union_support);
assert.equal(inheritedUnion.status, 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDITED');
assert.equal(inheritedUnion.universally_complete, true);
assert.equal(inheritedUnion.universally_sound, false);
assert.equal(inheritedUnion.exact, false);
const inheritedIntersection = auditRouteIndependentRawSeamRule(3, 1, 1, 3, inherited.intersection_support);
assert.equal(inheritedIntersection.status, 'ROUTE_INDEPENDENT_RAW_SEAM_RULE_AUDITED');
assert.equal(inheritedIntersection.universally_sound, true);
assert.equal(inheritedIntersection.universally_complete, false);
assert.equal(inheritedIntersection.exact, false);

const singleton = routeErasureAdmissibilityProfile(3, 0, 1, 1);
assert.equal(singleton.status, 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED');
assert.equal(singleton.route_count, 1);
assert.deepEqual(singleton.routes[0].blocks, [0, 1, 0, 0]);
assert.deepEqual(singleton.routes[0].support, [[0, 0], [1, 0]]);
assert.equal(singleton.union_cardinality, 2);
assert.equal(singleton.intersection_cardinality, 2);
assert.equal(singleton.descent_gap_cardinality, 0);
assert.equal(singleton.exact_route_independent_raw_seam_admissibility_descends, true);
const singletonAudit = auditRouteIndependentRawSeamRule(3, 0, 1, 1, singleton.union_support);
assert.equal(singletonAudit.exact, true);

for (const args of [
  [0, 5, 0, 0],
  [1, 2, 3, 3],
  [2, 1, 2, 4],
  [3, 0, 1, 1],
  [3, 1, 1, 3],
  [3, 1, 2, 4],
  [3, 2, 2, 6],
  [4, 2, 2, 6],
  [5, 0, 3, 9],
]) {
  const injective = rawSupportInjectivityProfile(...args);
  assert.equal(injective.status, 'RAW_SEAM_SUPPORT_INJECTIVITY_PROFILE_DERIVED');
  assert.equal(injective.support_map_injective, true);
  assert.equal(injective.route_count, injective.unique_support_count);
  for (const route of injective.routes) {
    assert.deepEqual(route.coordinate_maxima, route.blocks.slice(1, -1));
    assert.deepEqual(route.recovered_blocks, route.blocks);
  }
  const descent = routeErasureAdmissibilityProfile(...args);
  assert.equal(descent.status, 'EXACT_ROUTE_ERASURE_ADMISSIBILITY_PROFILE_DERIVED');
  assert.equal(
    descent.exact_route_independent_raw_seam_admissibility_descends,
    descent.route_count === 1,
  );
  assert.equal(descent.descent_gap_cardinality === 0, descent.route_count === 1);
}

const chamber = runRouteErasureAdmissibilityDescentChamber();
assert.equal(chamber.status, 'ROUTE_ERASURE_ADMISSIBILITY_DESCENT_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.ok(Object.values(chamber.certificates).every((certificate) => certificate.passed));
assert.equal(
  chamber.consequential_candidate,
  'EXACT_ROUTE_INDEPENDENT_RAW_SEAM_ADMISSIBILITY_DESCENDS_THROUGH_ROUTE_ERASURE_IF_AND_ONLY_IF_THE_EXACT_FIXED_C1_ROUTE_FIBER_IS_SINGLETON',
);

console.log('Ash A15-R0 route-erasure admissibility descent tests passed.');
