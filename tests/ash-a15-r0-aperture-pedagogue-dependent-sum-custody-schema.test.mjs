import assert from 'node:assert/strict';

import {
  DEPENDENT_SUM_CUSTODY_SCHEMA_PARENT_RECEIPT,
  decodeDependentAddress,
  dependentSumSchemaProfile,
  encodeDependentAddress,
  materializeDependentSumSchema,
  productAdmissibilityMask,
  routeRespectingProductCriterion,
  runDependentSumCustodySchemaChamber,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-dependent-sum-custody-schema.js';

assert.equal(DEPENDENT_SUM_CUSTODY_SCHEMA_PARENT_RECEIPT, '7bc793cbe843f0c9ca0f56a3e2a8337f348f3ba9');

const inherited = dependentSumSchemaProfile(3, 1, 1, 3);
assert.equal(inherited.status, 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED');
assert.deepEqual(inherited.route_conditional_cardinalities, [4, 1]);
assert.equal(inherited.dependent_sum_cardinality, 5);
assert.equal(inherited.lawful_joint_cardinality, 5);
assert.equal(inherited.padding_cells, 0);
assert.equal(inherited.minimal_product_capacity, 8);
assert.equal(inherited.minimal_product_padding, 3);
assert.equal(inherited.route_respecting_product_exactness_possible, false);

const inheritedCriterion = routeRespectingProductCriterion(3, 1, 1, 3);
assert.equal(inheritedCriterion.status, 'ROUTE_RESPECTING_PRODUCT_EXACTNESS_CRITERION_DERIVED');
assert.equal(inheritedCriterion.uniform, false);
assert.equal(inheritedCriterion.route_respecting_padding_free_product_exists, false);

const inheritedMask = productAdmissibilityMask(3, 1, 1, 3);
assert.equal(inheritedMask.status, 'EXACT_PRODUCT_ADMISSIBILITY_MASK_DERIVED');
assert.equal(inheritedMask.capacity, 8);
assert.equal(inheritedMask.admitted_cells, 5);
assert.equal(inheritedMask.rejected_cells, 3);

const strict = dependentSumSchemaProfile(3, 1, 2, 4);
assert.deepEqual(strict.route_conditional_cardinalities, [6, 2]);
assert.equal(strict.dependent_sum_cardinality, 8);
assert.equal(strict.minimal_product_capacity, 12);
assert.equal(strict.minimal_product_padding, 4);
assert.equal(routeRespectingProductCriterion(3, 1, 2, 4).route_respecting_padding_free_product_exists, false);

const uniform = dependentSumSchemaProfile(5, 0, 3, 9);
assert.equal(uniform.status, 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED');
assert.equal(uniform.route_count, 2);
assert.deepEqual(uniform.route_conditional_cardinalities, [4, 4]);
assert.equal(uniform.dependent_sum_cardinality, 8);
assert.equal(uniform.minimal_product_capacity, 8);
assert.equal(uniform.minimal_product_padding, 0);
assert.equal(uniform.route_respecting_product_exactness_possible, true);

const uniformCriterion = routeRespectingProductCriterion(5, 0, 3, 9);
assert.equal(uniformCriterion.uniform, true);
assert.equal(uniformCriterion.route_respecting_padding_free_product_exists, true);
assert.equal(uniformCriterion.product_secondary_alphabet_size_if_exact, 4);
assert.equal(uniformCriterion.explicit_uniform_round_trip_witnessed, true);

for (const args of [[3, 1, 1, 3], [3, 1, 2, 4], [5, 0, 3, 9], [2, 2, 3, 5], [1, 2, 3, 3], [0, 7, 0, 0]]) {
  const schema = materializeDependentSumSchema(...args);
  assert.equal(schema.status, 'EXACT_DEPENDENT_SUM_SCHEMA_MATERIALIZED');
  assert.equal(schema.padding_cells, 0);
  for (const row of schema.addresses) {
    const encoded = encodeDependentAddress(...args, row.blocks, row.seams);
    assert.equal(encoded.status, 'EXACT_DEPENDENT_ADDRESS_ENCODED');
    const decoded = decodeDependentAddress(...args, encoded.route_label, encoded.local_label);
    assert.equal(decoded.status, 'EXACT_DEPENDENT_ADDRESS_DECODED');
    assert.deepEqual(decoded.blocks, row.blocks);
    assert.deepEqual(decoded.seams, row.seams);
  }
}

const paddingNonmember = decodeDependentAddress(3, 1, 1, 3, 1, 1);
assert.equal(paddingNonmember.status, 'DEPENDENT_ADDRESS_DECODER_NONMEMBER_ABSTAINS');
assert.equal(paddingNonmember.classification, 'OUT_OF_RANGE_ROUTE_LOCAL_LABEL_IS_NOT_A_MEMBER_OF_THE_DEPENDENT_SCHEMA');

const t0 = dependentSumSchemaProfile(0, 7, 0, 0);
assert.equal(t0.route_count, 1);
assert.deepEqual(t0.route_conditional_cardinalities, [1]);
assert.equal(t0.dependent_sum_cardinality, 1);
assert.equal(t0.minimal_product_padding, 0);
assert.equal(routeRespectingProductCriterion(0, 7, 0, 0).route_respecting_padding_free_product_exists, true);

const t1 = dependentSumSchemaProfile(1, 4, 3, 3);
assert.equal(t1.route_count, 1);
assert.deepEqual(t1.route_conditional_cardinalities, [1]);
assert.equal(t1.dependent_sum_cardinality, 1);
assert.equal(t1.minimal_product_padding, 0);

const chamber = runDependentSumCustodySchemaChamber();
assert.equal(chamber.status, 'DEPENDENT_SUM_CUSTODY_SCHEMA_CHAMBER_PASSED');
assert.equal(chamber.passed, true);
assert.ok(Object.values(chamber.certificates).every((certificate) => certificate.passed));
assert.equal(
  chamber.consequential_candidate,
  'A_PADDING_FREE_ROUTE_RESPECTING_CARTESIAN_PRODUCT_REPRESENTATION_EXISTS_IF_AND_ONLY_IF_ALL_ROUTE_CONDITIONED_SEAM_FIBERS_HAVE_EQUAL_CARDINALITY',
);

console.log('Ash A15-R0 dependent-sum custody schema tests passed.');
