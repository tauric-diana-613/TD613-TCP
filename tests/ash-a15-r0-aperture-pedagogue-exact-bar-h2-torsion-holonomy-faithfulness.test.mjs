import assert from 'node:assert/strict';

import {
  EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_PARENT_RECEIPT,
  AMBIENT_Y_COORDINATE,
  fractionGroupProduct,
  fractionGroupInverse,
  ambientBarH1CompletionCertificate,
  commonRightOreMultiple,
  commonLeftOreMultiple,
  ambientOreFractionGroupCertificate,
  mappingTorusH2Certificate,
  relationCycleK,
  primitiveBarTwoCocycle,
  auxiliaryModTwoTorsionCocycle,
  exactBarH2TorsionHolonomyFaithfulnessCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-exact-bar-h2-torsion-holonomy-faithfulness.js';
import {
  boundaryOfBar2Chain,
  pairTwoCochainWithBarChain,
  T_COORDINATE,
  Q_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  addBar2Chains,
  scaleBar2Chain,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  transportIncrementCocycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-affine-transport-increment-cocycle.js';

assert.equal(
  EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_PARENT_RECEIPT,
  '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f',
  'the chamber must stay bound to the exact #773 receipt',
);

const h1 = ambientBarH1CompletionCertificate();
assert.equal(h1.status, 'AMBIENT_BAR_H1_COMPLETION_CERTIFICATE_PASSED');
assert.equal(h1.passed, true);
assert.deepEqual(AMBIENT_Y_COORDINATE, { t: 0, E: 0, O: 1 });
assert.deepEqual(h1.TQ, { t: 1, E: 0, O: 1 });
assert.deepEqual(h1.YT, { t: 1, E: 0, O: 1 });
assert.match(h1.ambient_relation, /\[Y\]=\[Q\]/);
assert.match(h1.parent_coverage_scar, /#773 canonical-word helper abstained/);
assert.ok(
  h1.factorizations.some((row) => row.base.t === 0 && row.base.E === 2 && row.base.O === 3),
  'the full ambient t=0,O>0 stratum must be covered rather than discarded as unreachable',
);

const parityMixedLeft = { t: 1, E: 5, O: 2 };
const parityMixedRight = { t: 4, E: 1, O: 7 };
const rightOre = commonRightOreMultiple(parityMixedLeft, parityMixedRight);
const leftOre = commonLeftOreMultiple(parityMixedLeft, parityMixedRight);
assert.equal(rightOre.status, 'COMMON_RIGHT_ORE_MULTIPLE_DERIVED');
assert.equal(leftOre.status, 'COMMON_LEFT_ORE_MULTIPLE_DERIVED');
assert.deepEqual(rightOre.left_product, rightOre.right_product);
assert.deepEqual(leftOre.left_product, leftOre.right_product);
assert.ok(rightOre.left_factor.t >= 1 && rightOre.right_factor.t >= 1);
assert.ok(leftOre.left_factor.t >= 1 && leftOre.right_factor.t >= 1);

const zeroTickAmbientOre = commonRightOreMultiple(
  { t: 0, E: 0, O: 9 },
  { t: 3, E: 6, O: 0 },
);
assert.equal(zeroTickAmbientOre.passed, true, 'Ore must include the ambient non-route-generated stratum');

assert.equal(
  commonRightOreMultiple({ t: 1, E: 0, O: 0, receipt: 'not-coordinate-data' }, Q_COORDINATE).status,
  'COMMON_RIGHT_ORE_MULTIPLE_ABSTAINS',
  'receipt/provenance fields may not be smuggled into mathematical coordinates',
);

const evenInverse = fractionGroupInverse({ t: 2, E: 3, O: -4 });
assert.equal(evenInverse.status, 'FRACTION_GROUP_INVERSE_DERIVED');
assert.deepEqual(evenInverse.inverse, { t: -2, E: -3, O: 4 });

const oddInverse = fractionGroupInverse({ t: 3, E: -2, O: 7 });
assert.equal(oddInverse.status, 'FRACTION_GROUP_INVERSE_DERIVED');
assert.deepEqual(oddInverse.inverse, { t: -3, E: -7, O: 2 });

const Tinv = fractionGroupInverse(T_COORDINATE).inverse;
const TQ = fractionGroupProduct(T_COORDINATE, Q_COORDINATE).coordinate;
const derivedY = fractionGroupProduct(TQ, Tinv).coordinate;
assert.deepEqual(derivedY, AMBIENT_Y_COORDINATE);
assert.notDeepEqual(
  Tinv,
  T_COORDINATE,
  'formal fraction-group inverse must not be confused with the positive operational T route',
);

const ore = ambientOreFractionGroupCertificate();
assert.equal(ore.status, 'AMBIENT_ORE_FRACTION_GROUP_CERTIFICATE_PASSED');
assert.equal(ore.passed, true);
assert.match(ore.false_shortcut_rejected, /cancellative alone does not authorize/);
assert.match(ore.fraction_group, /Z\^2 .* Z/);

const h2 = mappingTorusH2Certificate();
assert.equal(h2.status, 'MAPPING_TORUS_H2_CERTIFICATE_PASSED');
assert.equal(h2.passed, true);
assert.deepEqual(h2.d3_generator, [2, 0, 0]);
assert.deepEqual(h2.d2_d3_generator, [0, 0, 0]);
assert.equal(h2.smith_result.free_rank, 1);
assert.deepEqual(h2.smith_result.torsion_invariants, [2]);
assert.equal(h2.smith_result.group, 'Z⊕Z/2');
assert.match(h2.identity_monodromy_hostile, /different H2/);
assert.match(h2.zero_d3_hostile, /order-two/);

const z0 = relationCycleK(0);
const z1 = relationCycleK(1);
assert.equal(z0.status, 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED');
assert.equal(z1.status, 'AUTHORED_RELATION_BAR_2_CYCLE_DERIVED');
assert.equal(z0.left_word, 'TTQ');
assert.equal(z0.right_word, 'QTT');
assert.equal(z1.left_word, 'TQTQ');
assert.equal(z1.right_word, 'QTQT');
assert.deepEqual(z0.left_endpoint, { t: 2, E: 1, O: 0 });
assert.deepEqual(z1.left_endpoint, { t: 2, E: 1, O: 1 });
assert.equal(z0.boundary.is_cycle, true);
assert.equal(z1.boundary.is_cycle, true);

const minusZ0 = scaleBar2Chain(z0.chain, -1);
assert.equal(minusZ0.status, 'BAR_2_CHAIN_NORMALIZED');
const tau = addBar2Chains(z1.chain, minusZ0.chain);
assert.equal(tau.status, 'BAR_2_CHAIN_NORMALIZED');
const tauBoundary = boundaryOfBar2Chain(tau.chain);
assert.equal(tauBoundary.is_cycle, true);

function pair(cochain, chain) {
  const out = pairTwoCochainWithBarChain(cochain, chain);
  assert.equal(out.status, 'BAR_2_COCHAIN_PAIRING_DERIVED');
  return out.value;
}

assert.equal(pair(primitiveBarTwoCocycle, z0.chain), 1);
assert.equal(pair(primitiveBarTwoCocycle, z1.chain), 1);
assert.equal(pair(primitiveBarTwoCocycle, tau.chain), 0);
assert.equal(pair(transportIncrementCocycle, z0.chain), 2);
assert.equal(pair(transportIncrementCocycle, z1.chain), 2);
assert.equal(pair(transportIncrementCocycle, tau.chain), 0);
assert.equal(pair(auxiliaryModTwoTorsionCocycle, z0.chain) & 1, 0);
assert.equal(pair(auxiliaryModTwoTorsionCocycle, z1.chain) & 1, 1);
assert.equal(pair(auxiliaryModTwoTorsionCocycle, tau.chain) & 1, 1);

assert.equal(primitiveBarTwoCocycle({ t: 1, E: 0, O: 0 }, { t: 0, E: 1, O: 0 }), 1);
assert.equal(primitiveBarTwoCocycle({ t: 2, E: 0, O: 0 }, { t: 0, E: 1, O: 0 }), 1);
assert.equal(primitiveBarTwoCocycle({ t: 3, E: 0, O: 0 }, { t: 0, E: 1, O: 0 }), 2);
assert.equal(primitiveBarTwoCocycle(UNIT_NOT_A_COORDINATE(), Q_COORDINATE), null);

function UNIT_NOT_A_COORDINATE() {
  return { t: 0, E: 0, O: 0, provenance: 'external' };
}

const aggregate = exactBarH2TorsionHolonomyFaithfulnessCertificate();
assert.equal(aggregate.status, 'EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.primitive_alpha_cocycle.passed, true);
assert.equal(aggregate.auxiliary_beta_mod2_cocycle.passed, true);
assert.equal(aggregate.auxiliary_beta_mod2_cocycle.row_count, 128);
assert.equal(aggregate.omega_double_alpha.passed, true);
assert.deepEqual(aggregate.pairings.alpha, { z0: 1, z1: 1, tau: 0 });
assert.deepEqual(aggregate.pairings.omega, { z0: 2, z1: 2, tau: 0 });
assert.deepEqual(aggregate.pairings.beta_mod2, { z0: 0, z1: 1, tau: 1 });
assert.equal(
  aggregate.exact_h2_decomposition,
  'H2_bar(B;Z) ≅ Z[z0] ⊕ (Z/2)[tau], with tau=[z1]-[z0].',
);
assert.match(aggregate.inherited_normalization_statement, /\[omega\]=2\[alpha\]/);
assert.match(aggregate.inherited_normalization_statement, /tau_1/);
assert.match(aggregate.integer_holonomy_faithfulness_boundary, /cannot distinguish z1 from z0/);
assert.equal(aggregate.authority.formal_bar_complex_two_holonomy, true);
assert.equal(aggregate.authority.formal_integer_holonomy_transport_completeness_inherited_from_773, true);
assert.equal(aggregate.authority.raw_h2_faithfulness_of_integer_holonomy, false);
assert.equal(aggregate.authority.geometric_two_holonomy, false);
assert.equal(aggregate.authority.physical_two_holonomy, false);
assert.equal(aggregate.authority.mod_two_transport_target, false);
assert.ok(aggregate.scars.includes('transport-complete integer holonomy != faithful detector of raw H2'));
assert.ok(aggregate.scars.includes('group-of-fractions inverse != operational inverse route'));

console.log('EXACT_BAR_H2_TORSION_HOLONOMY_FAITHFULNESS_TEST_PASSED');
