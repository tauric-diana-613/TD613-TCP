import assert from 'node:assert/strict';

import {
  degreeOneCupCollapseCertificate,
  degreeTwoBasisCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-mod2-ring-essential-degree-two.js';
import {
  correctedBetaFiberLHSCertificate,
  correctedEssentialDegreeTwoAlgebraCertificate,
  correctedModTwoRingEssentialDegreeTwoAggregate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-mod2-ring-essential-degree-two-correction-001.js';

const degreeOne = degreeOneCupCollapseCertificate();
assert.equal(degreeOne.passed, true);
assert.deepEqual(degreeOne.cohomology_relations, ['u^2=0', 'v^2=0', 'uv=0']);
assert.equal(degreeOne.all_rows_pass, true);
assert.equal(degreeOne.inherited_omega_twice_primitive, true);
assert.equal(degreeOne.uv_primitive, 'E mod 2');

const degreeTwo = degreeTwoBasisCertificate();
assert.equal(degreeTwo.passed, true);
assert.equal(degreeTwo.H2_mod2_dimension, 2);
assert.deepEqual(degreeTwo.basis, ['kappa_bar', 'beta']);
assert.deepEqual(degreeTwo.pairing_matrix, [[1, 0], [0, 1]]);
assert.equal(degreeTwo.determinant_mod2, 1);
assert.equal(degreeTwo.kappa_bar_integral_reduction, true);
assert.equal(degreeTwo.beta_integral_reduction, false);
assert.match(degreeTwo.beta_nonlift_reason, /theta/);

const lhs = correctedBetaFiberLHSCertificate();
assert.equal(lhs.passed, true);
assert.equal(lhs.beta_restriction_e_o, 1);
assert.equal(lhs.H1_fiber_invariants_dimension, 1);
assert.equal(lhs.H1_fiber_coinvariants_dimension, 1);
assert.equal(lhs.H2_fiber_invariants_dimension, 1);
assert.equal(lhs.H2_fiber_coinvariants_dimension, 1);
assert.deepEqual(lhs.mod2_cohomology_dimensions, { H0: 1, H1: 2, H2: 2, H3: 1 });
assert.match(lhs.u_beta_product, /Omega !=0/);
assert.equal(lhs.kappa_fraction_group_restriction_claimed, false);
assert.equal(lhs.v_kappa_product_claimed, false);

const certificate = correctedEssentialDegreeTwoAlgebraCertificate();
assert.equal(certificate.passed, true);
assert.equal(certificate.decomposable_H2_dimension, 0);
assert.equal(certificate.indecomposable_H2_dimension, 2);
assert.equal(certificate.minimum_essential_degree_two_generators, 2);
assert.equal(certificate.algebra_generated_in_degree_one, false);
assert.equal(certificate.top_class, 'Omega=[u][beta]');
assert.equal(certificate.top_class_generated_by_degree_one_only, false);
assert.equal(certificate.out_of_domain_kappa_restriction_used, false);
assert.equal(certificate.uncertified_v_kappa_relation_claimed, false);
assert.equal(
  certificate.classification_if_passed,
  'THE_MOD_TWO_COHOMOLOGY_ALGEBRA_IS_NOT_GENERATED_IN_DEGREE_ONE_AND_REQUIRES_TWO_ESSENTIAL_DEGREE_TWO_GENERATORS',
);

const aggregate = correctedModTwoRingEssentialDegreeTwoAggregate();
assert.equal(aggregate.passed, true);
assert.equal(
  aggregate.preserved_correction_scar,
  'OUT_OF_DOMAIN_COCHAIN_EVALUATION != ZERO_COCHAIN_VALUE',
);
assert.ok(aggregate.candidate_classifications.includes('DEGREE_ONE_MOD_TWO_CUP_SUBALGEBRA_HAS_ZERO_DEGREE_TWO_IMAGE'));
assert.ok(aggregate.candidate_classifications.includes('H_TWO_MOD_TWO_HAS_TWO_INDEPENDENT_INDECOMPOSABLE_CLASSES_KAPPA_BAR_AND_BETA'));
assert.ok(aggregate.candidate_classifications.includes('THE_UNIQUE_NONZERO_H_THREE_MOD_TWO_CLASS_IS_REACHED_BY_U_BETA'));

// Hostile: a nonzero degree-one cup image would contradict the explicit primitive certificates.
const fakeDegreeOneCupImageDimension = 1;
assert.notEqual(fakeDegreeOneCupImageDimension, certificate.decomposable_H2_dimension);

// Hostile: collapsing H^2 to one dimension destroys the inherited pairing determinant/basis.
const fakeH2Dimension = 1;
assert.notEqual(fakeH2Dimension, degreeTwo.H2_mod2_dimension);

// Hostile: beta cannot be declared an integral reduction because beta(theta)=1 on order-two theta.
const fakeBetaIntegralLift = true;
assert.notEqual(fakeBetaIntegralLift, degreeTwo.beta_integral_reduction);

// Hostile: one essential degree-two generator cannot span a two-dimensional H^2 when Dec^2=0.
const fakeMinimumDegreeTwoGenerators = 1;
assert.notEqual(fakeMinimumDegreeTwoGenerators, certificate.minimum_essential_degree_two_generators);

// Hostile: the top mod-two class is not zero.
const fakeH3Dimension = 0;
assert.notEqual(fakeH3Dimension, lhs.mod2_cohomology_dimensions.H3);

// Preserve the exact implementation scar: JS numerical coercion would turn null into zero.
const coercedNullMod2 = ((null % 2) + 2) % 2;
assert.equal(coercedNullMod2, 0);
assert.equal(certificate.out_of_domain_kappa_restriction_used, false);

// Ceiling hostiles.
assert.equal(certificate.physical_Z2_gauge_authority, false);
assert.equal(certificate.operational_route_ring_authority, false);

console.log('Ash A15-R0 corrected mod-two ring essential degree-two tests passed.');
