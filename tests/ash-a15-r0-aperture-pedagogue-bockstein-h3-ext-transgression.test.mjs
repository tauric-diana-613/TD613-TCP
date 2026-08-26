import assert from 'node:assert/strict';

import {
  BOCKSTEIN_H3_EXT_TRANSGRESSION_PARENT_RECEIPT,
  mappingTorusThirdHomologyCertificate,
  integralThirdCohomologyExtCertificate,
  explicitBocksteinLiftCertificate,
  bocksteinNontrivialityCertificate,
  bocksteinQuotientTransgressionCertificate,
  periodBlindDegreeThreeObstructionCertificate,
  bocksteinH3ExtTransgressionHostileCertificate,
  bocksteinH3ExtTransgressionCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bockstein-h3-ext-transgression.js';

assert.equal(
  BOCKSTEIN_H3_EXT_TRANSGRESSION_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
  'the chamber must parent directly to witnessed #775 rather than unearned #778',
);

const homology = mappingTorusThirdHomologyCertificate();
assert.equal(homology.status, 'MAPPING_TORUS_THIRD_BAR_HOMOLOGY_CERTIFICATE_PASSED');
assert.equal(homology.passed, true);
assert.equal(homology.inherited_H2_fiber_action, -1, 'the swap reverses the T² orientation class');
assert.equal(homology.inherited_I_minus_H2_action, 2);
assert.equal(homology.wang_degree_three_segment, '0 -> H3_bar(B;Z) -> Z --2--> Z');
assert.equal(homology.kernel_times_two_on_Z, 0);
assert.equal(homology.H3_bar, '0');
assert.equal(homology.mapping_torus_is_physical_spacetime, false);

const cohomology = integralThirdCohomologyExtCertificate();
assert.equal(cohomology.status, 'INTEGRAL_THIRD_BAR_COHOMOLOGY_EXT_CERTIFICATE_PASSED');
assert.equal(cohomology.passed, true);
assert.equal(cohomology.H2_bar, 'Z ⊕ Z/2');
assert.equal(cohomology.H3_bar, '0');
assert.equal(cohomology.Ext_Z1_Z_Z, '0');
assert.equal(cohomology.Ext_Z1_Z_over_2_Z, 'Z/2');
assert.equal(cohomology.Hom_H3_Z, '0');
assert.equal(cohomology.H3_cohomology, 'Z/2');
assert.equal(cohomology.pure_Ext, true);

// Central degree-jump scar: vanishing homology in degree three does not kill
// degree-three integral cohomology because the UCT Ext term is nonzero.
assert.equal(homology.H3_bar, '0');
assert.notEqual(cohomology.H3_cohomology, '0');

const lift = explicitBocksteinLiftCertificate();
assert.equal(lift.status, 'EXPLICIT_BOCKSTEIN_LIFT_THREE_COCYCLE_CERTIFICATE_PASSED');
assert.equal(lift.passed, true);
assert.equal(lift.residue_group_order, 8);
assert.equal(lift.triple_count, 512);
assert.equal(lift.all_lifted_beta_coboundaries_even, true);
assert.equal(lift.gamma_definition, 'gamma=(d beta_tilde)/2');
assert.equal(lift.gamma_normalized, true);
assert.ok(lift.gamma_nonzero_row_count > 0, 'a zero integer lift defect everywhere would contradict the nontrivial Bockstein target');
assert.ok(lift.gamma_value_set.every((value) => [-1, 0, 1].includes(value)), 'an even coboundary of a {0,1}-valued 2-cochain can only yield gamma values -1,0,1');
assert.ok(lift.gamma_value_set.includes(0));
assert.ok(lift.gamma_value_set.some((value) => value !== 0), 'the preregistered theorem requires a nonzero lift row but does not prescribe its sign');
assert.equal(lift.quadruple_count, 4096);
assert.equal(lift.all_4096_degree_four_coboundaries_zero, true);
assert.equal(lift.physical_flux_authority, false);
assert.equal(lift.curvature_authority, false);

const nontrivial = bocksteinNontrivialityCertificate();
assert.equal(nontrivial.status, 'BOCKSTEIN_NONTRIVIALITY_CERTIFICATE_PASSED');
assert.equal(nontrivial.passed, true);
assert.equal(nontrivial.coefficient_sequence, '0 -> Z --×2--> Z -> Z/2 -> 0');
assert.equal(nontrivial.inherited_beta_theta, 1);
assert.equal(nontrivial.inherited_kappa_theta, 0);
assert.equal(nontrivial.reduction_image_annihilates_theta, true);
assert.equal(nontrivial.beta_outside_integral_reduction_image, true);
assert.equal(nontrivial.bockstein_class, '[gamma]=delta([beta]) != 0');
assert.equal(nontrivial.H3_cohomology, 'Z/2');
assert.match(nontrivial.generator_statement, /unique nonzero generator/);

const quotient = bocksteinQuotientTransgressionCertificate();
assert.equal(quotient.status, 'BOCKSTEIN_QUOTIENT_TRANSGRESSION_CERTIFICATE_PASSED');
assert.equal(quotient.passed, true);
assert.equal(quotient.multiplication_by_two_on_target, '0');
assert.equal(quotient.delta_surjective, true);
assert.equal(quotient.quotient, 'H^2_bar(B;Z/2)/red_2(H^2_bar(B;Z)) ≅ Z/2');
assert.match(quotient.induced_isomorphism, /isomorphism/);
assert.equal(quotient.relies_on_778, false);

const periodBlind = periodBlindDegreeThreeObstructionCertificate();
assert.equal(periodBlind.status, 'PERIOD_BLIND_DEGREE_THREE_OBSTRUCTION_CERTIFICATE_PASSED');
assert.equal(periodBlind.passed, true);
assert.equal(periodBlind.H3_bar, '0');
assert.equal(periodBlind.H3_cohomology, 'Z/2');
assert.equal(periodBlind.Hom_H3_Z, '0');
assert.equal(periodBlind.all_closed_integer_H3_period_characters_trivial, true);
assert.equal(periodBlind.nonzero_cohomology_class, '[gamma]=delta([beta])');
assert.equal(
  periodBlind.scar,
  'NONZERO_INTEGRAL_DEGREE_THREE_COHOMOLOGY != NONZERO_CLOSED_H3_PERIOD_CHARACTER',
);
assert.match(periodBlind.transgression_statement, /pure Ext\/Bockstein class/);
assert.equal(periodBlind.geometric_three_holonomy_authority, false);
assert.equal(periodBlind.gerbe_authority, false);
assert.equal(periodBlind.anomaly_inflow_authority, false);

const hostiles = bocksteinH3ExtTransgressionHostileCertificate();
assert.equal(hostiles.status, 'BOCKSTEIN_H3_EXT_TRANSGRESSION_HOSTILES_PASSED');
assert.equal(hostiles.passed, true);
assert.equal(hostiles.rows.length, 8);
assert.equal(hostiles.rows.every((row) => row.rejected), true);
const wrongAction = hostiles.rows.find((row) => row.hostile === 'WRONG_SWAP_ACTION_PLUS_ONE');
assert.equal(wrongAction.wrong_result, 'H3 would be Z');
const malformedLift = hostiles.rows.find((row) => row.hostile === 'MALFORMED_BETA_INTEGER_LIFT_ODD_COBOUNDARY');
assert.ok(malformedLift.odd_defect_rows > 0, 'a one-bit corruption of the lift must destroy even divisibility somewhere');
const malformedGamma = hostiles.rows.find((row) => row.hostile === 'MALFORMED_GAMMA_NONCOCYCLE');
assert.ok(malformedGamma.nonzero_degree_four_defect_rows > 0, 'a one-entry gamma corruption must break the 3-cocycle condition');

const aggregate = bocksteinH3ExtTransgressionCertificate();
assert.equal(aggregate.status, 'BOCKSTEIN_H3_EXT_TRANSGRESSION_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.parent_receipt, '39b8f6e8ba319154378d03c28a1bf42c02870de1');
assert.equal(aggregate.gate_issue, 737);
assert.equal(aggregate.relies_on_778, false);
assert.equal(aggregate.earned_if_passed.length, 7);
assert.equal(aggregate.ceilings.geometric_three_holonomy_authority, false);
assert.equal(aggregate.ceilings.physical_flux_authority, false);
assert.equal(aggregate.ceilings.gerbe_authority, false);
assert.equal(aggregate.ceilings.curvature_authority, false);
assert.equal(aggregate.ceilings.anomaly_inflow_authority, false);
assert.equal(aggregate.ceilings.operational_inverse_route_authority, false);

console.log('Ash A15-R0 Bockstein H3 Ext transgression tests passed.');
