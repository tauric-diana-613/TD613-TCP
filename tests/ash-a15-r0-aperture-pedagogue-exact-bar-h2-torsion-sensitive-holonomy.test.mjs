import assert from 'node:assert/strict';

import {
  EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_PARENT_RECEIPT,
  prefixBar2Chain,
  z0RelationCycle,
  z1RelationCycle,
  thetaTorsionCycle,
  explicitThetaOrderTwoBoundaryCertificate,
  integerFractionGroupMultiply,
  integerFractionGroupInverse,
  rightOreCommonMultiple,
  rightFractionRepresentation,
  oreLocalizationCertificate,
  exactBarH2GlobalCertificate,
  torsionBeta,
  modTwoTorsionDetectorCertificate,
  primitiveIntegralCocycle,
  primitiveIntegralCocycleCertificate,
  omegaTwicePrimitiveCertificate,
  explicitBarH2BasisCertificate,
  torsionSensitiveFormalHolonomyCertificate,
  exactBarH2TorsionSensitiveHolonomyCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';
import {
  T_COORDINATE,
  Q_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

assert.equal(
  EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_PARENT_RECEIPT,
  '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f',
);

const prefix = prefixBar2Chain(['T', 'Q', 'T', 'Q']);
assert.equal(prefix.status, 'PREFIX_BAR_2_CHAIN_DERIVED');
assert.equal(prefix.chain.length, 3);
assert.deepEqual(prefix.product, { t: 2, E: 1, O: 1 });
assert.equal(prefix.t_count, 2);
assert.equal(prefix.q_count, 2);

const z0 = z0RelationCycle();
assert.equal(z0.status, 'Z0_RELATION_CYCLE_DERIVED');
assert.equal(z0.passed, true);
assert.equal(z0.exact_inherited_735_match, true, 'z0 must be exactly the inherited #735/#765 relation cycle');
assert.equal(z0.boundary.is_cycle, true);

const z1 = z1RelationCycle();
assert.equal(z1.status, 'Z1_RELATION_CYCLE_DERIVED');
assert.equal(z1.passed, true);
assert.equal(z1.boundary.is_cycle, true);
assert.equal(z1.chain.length, 6);

const theta = thetaTorsionCycle();
assert.equal(theta.status, 'THETA_TORSION_BAR_2_CYCLE_DERIVED');
assert.equal(theta.passed, true);
assert.equal(theta.boundary.is_cycle, true);
assert.equal(theta.chain.length, 8, 'the shared -[Q|T] term must cancel in z1-z0');

const orderTwoBoundary = explicitThetaOrderTwoBoundaryCertificate();
assert.equal(orderTwoBoundary.status, 'EXPLICIT_THETA_ORDER_DIVIDES_TWO_BOUNDARY_CERTIFICATE_PASSED');
assert.equal(orderTwoBoundary.passed, true);
assert.equal(orderTwoBoundary.bar3_chain.length, 10, 'the preregistered exact B3 witness must remain ten terms');
assert.equal(orderTwoBoundary.bar3_boundary.is_bar2_cycle, true);
assert.equal(orderTwoBoundary.identity, '∂B_3=2θ.');
assert.equal(orderTwoBoundary.nontriviality_not_implied_by_this_certificate, true);

const unreachableOre = rightOreCommonMultiple(
  { t: 0, E: 0, O: 1 },
  T_COORDINATE,
);
assert.equal(
  unreachableOre.status,
  'RIGHT_ORE_COMMON_MULTIPLE_ABSTAINS_UNREACHABLE',
  'ambient triples outside the authored quotient image may not be smuggled into B',
);

const orePair = rightOreCommonMultiple(
  { t: 3, E: 2, O: 4 },
  { t: 2, E: 5, O: 1 },
);
assert.equal(orePair.status, 'RIGHT_ORE_COMMON_MULTIPLE_DERIVED');
assert.equal(orePair.passed, true);
assert.ok(orePair.left_factor.t >= 1);
assert.ok(orePair.right_factor.t >= 1);
assert.deepEqual(orePair.common_multiple, { t: 4, E: 5, O: 4 });

const groupElement = { t: -3, E: -4, O: 5 };
const inverse = integerFractionGroupInverse(groupElement);
assert.deepEqual(
  integerFractionGroupMultiply(groupElement, inverse),
  { t: 0, E: 0, O: 0 },
);
assert.deepEqual(
  integerFractionGroupMultiply(inverse, groupElement),
  { t: 0, E: 0, O: 0 },
);

const fraction = rightFractionRepresentation(groupElement);
assert.equal(fraction.status, 'RIGHT_FRACTION_REPRESENTATION_DERIVED');
assert.equal(fraction.passed, true);
assert.ok(fraction.numerator.t >= 1);
assert.ok(fraction.denominator.t >= 1);
assert.deepEqual(fraction.reconstructed, groupElement);

const ore = oreLocalizationCertificate();
assert.equal(ore.status, 'BAR_MONOID_ORE_LOCALIZATION_CERTIFICATE_PASSED');
assert.equal(ore.passed, true);
assert.equal(ore.cancellation.passed, true);
assert.equal(ore.right_ore_rows.every((row) => row.passed), true);
assert.equal(ore.group_inverse_rows.every((row) => row.passed), true);
assert.equal(ore.fraction_rows.every((row) => row.passed), true);
assert.equal(ore.directed_translation_poset.passed, true);
assert.match(ore.directed_translation_poset.classification_if_passed, /K\(G,1\)/);
assert.equal(ore.operational_route_inversion_authority, false);
assert.equal(ore.geometric_space_authority, false);

const global = exactBarH2GlobalCertificate();
assert.equal(global.status, 'EXACT_BAR_H2_GLOBAL_CERTIFICATE_PASSED');
assert.equal(global.passed, true);
assert.equal(global.H2_fiber_action, -1);
assert.equal(global.I_minus_H2_action, 2);
assert.equal(global.coker_I_minus_H2_action, 'Z/2');
assert.deepEqual(global.kernel_I_minus_swap.basis, [1, 1]);
assert.equal(global.wang_degree_two_sequence, '0 -> Z/2 -> H2 -> Z -> 0');
assert.equal(global.H2_bar, 'Z ⊕ Z/2');
assert.equal(global.inherited_H1_consistency, true);
assert.equal(global.mapping_torus_is_physical_surface, false);

assert.equal(torsionBeta({ t: 0, E: 0, O: 1 }, Q_COORDINATE), null, 'unreachable actual bases must abstain before mod-two pullback');

const beta = modTwoTorsionDetectorCertificate();
assert.equal(beta.status, 'MOD_TWO_TORSION_DETECTOR_CERTIFICATE_PASSED');
assert.equal(beta.passed, true);
assert.equal(beta.support_size, 16);
assert.equal(beta.parity_reduction_homomorphism_rows.length, 64);
assert.equal(beta.parity_reduction_homomorphism_rows.every((row) => row.equal), true);
assert.equal(beta.exhaustive_cocycle_triples, 512);
assert.equal(beta.all_512_cocycle_defects_zero, true);
assert.equal(beta.beta_z0, 0);
assert.equal(beta.beta_z1, 1);
assert.equal(beta.beta_theta, 1, 'theta must be independently visible mod two');
assert.equal(beta.physical_Z2_gauge_authority, false);

assert.equal(primitiveIntegralCocycle(T_COORDINATE, Q_COORDINATE), 1);
assert.equal(primitiveIntegralCocycle({ t: 2, E: 0, O: 0 }, Q_COORDINATE), 1);
assert.equal(primitiveIntegralCocycle({ t: 3, E: 0, O: 0 }, Q_COORDINATE), 2);

const primitive = primitiveIntegralCocycleCertificate();
assert.equal(primitive.status, 'PRIMITIVE_INTEGRAL_COCYCLE_CERTIFICATE_PASSED');
assert.equal(primitive.passed, true);
assert.equal(primitive.sample_defects.every((row) => row.defect === 0), true);
assert.equal(primitive.recurrence_rows.every((row) => row.equal), true);
assert.equal(primitive.kappa_z0, 1);
assert.equal(primitive.kappa_z1, 1);
assert.equal(primitive.kappa_theta, 0);

const omega = omegaTwicePrimitiveCertificate();
assert.equal(omega.status, 'OMEGA_TWICE_PRIMITIVE_CERTIFICATE_PASSED');
assert.equal(omega.passed, true);
assert.equal(omega.rows.every((row) => row.equal), true);
assert.equal(omega.rows.some((row) => row.parity === 0), true);
assert.equal(omega.rows.some((row) => row.parity === 1), true);
assert.equal(omega.cohomology_identity, '[ω]=2[κ] in H²_bar(B;Z)');

const basis = explicitBarH2BasisCertificate();
assert.equal(basis.status, 'EXPLICIT_BAR_H2_BASIS_CERTIFICATE_PASSED');
assert.equal(basis.passed, true);
assert.equal(basis.global_H2, 'Z ⊕ Z/2');
assert.equal(basis.theta_exact_order_two, true);
assert.equal(basis.z0_primitive_free_coordinate, true);
assert.equal(basis.theta_in_kappa_kernel, true);
assert.equal(basis.explicit_decomposition, 'H2_bar(B;Z) ≅ Z<[z_0]> ⊕ (Z/2)<[θ]>');
assert.equal(basis.z1_relation, '[z_1]=[z_0]+[θ]');
assert.equal(basis.omega_class, '[ω]=2[κ] in H²_bar(B;Z)');

const holonomy = torsionSensitiveFormalHolonomyCertificate();
assert.equal(holonomy.status, 'TORSION_SENSITIVE_FORMAL_HOLONOMY_CERTIFICATE_PASSED');
assert.equal(holonomy.passed, true);
assert.deepEqual(holonomy.psi_z0, { integer: 1, mod2: 0 });
assert.deepEqual(holonomy.psi_theta, { integer: 0, mod2: 1 });
assert.deepEqual(holonomy.psi_z1, { integer: 1, mod2: 1 });
assert.equal(holonomy.additive_control, true);
assert.equal(holonomy.integer_holonomy_torsion_blindness, true);
assert.match(holonomy.all_integer_characters_blind_to_theta_proof, /order-two element/);
assert.match(holonomy.full_character_isomorphism, /isomorphism/);
assert.equal(
  holonomy.classification,
  'TORSION_SENSITIVE_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_WITH_COEFFICIENTS_Z_CROSS_Z_OVER_TWO_SEPARATES_ALL_SECOND_BAR_HOMOLOGY_CLASSES_IN_THE_DECLARED_JURISDICTION',
);
assert.equal(holonomy.geometric_two_holonomy_authority, false);
assert.equal(holonomy.physical_gauge_group_authority, false);

// The central scar of this chamber: two distinct H2 classes can be identical
// to every Z-valued character because their difference is torsion.
assert.notDeepEqual(holonomy.psi_z0, holonomy.psi_z1);
assert.equal(holonomy.psi_z0.integer, holonomy.psi_z1.integer);
assert.notEqual(holonomy.psi_z0.mod2, holonomy.psi_z1.mod2);

const aggregate = exactBarH2TorsionSensitiveHolonomyCertificate();
assert.equal(aggregate.status, 'EXACT_BAR_H2_TORSION_SENSITIVE_HOLONOMY_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.parent_receipt, '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f');
assert.equal(aggregate.earned_if_passed.length, 7);
assert.equal(aggregate.authority_ceiling.geometric_two_holonomy, false);
assert.equal(aggregate.authority_ceiling.physical_two_holonomy, false);
assert.equal(aggregate.authority_ceiling.connection, false);
assert.equal(aggregate.authority_ceiling.operational_inverse_route, false);
assert.equal(aggregate.authority_ceiling.production, false);
assert.equal(aggregate.authority_ceiling.vercel, false);

console.log('Ash A15-R0 exact bar-H2 and torsion-sensitive formal 2-holonomy tests passed.');
