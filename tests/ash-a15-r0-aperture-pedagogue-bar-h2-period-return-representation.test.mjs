import assert from 'node:assert/strict';
import {
  barH2Period,
  barH2PeriodReturn,
  boundaryOfBar3Chain,
  addBar2Chains,
  scaleBar2Chain,
  barH2PeriodReturnRepresentationCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  relationBarCycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

const cert = barH2PeriodReturnRepresentationCertificate();
assert.equal(cert.passed, true);
assert.equal(cert.explicit_period.period, 2);
assert.equal(cert.explicit_return.represented_translation, 'tau_2');
assert.equal(cert.explicit_return.output, 2);

// Cycle authority only: a raw bar 2-simplex has nonzero boundary and must abstain.
const T = Object.freeze({ t: 1, E: 0, O: 0 });
const Q = Object.freeze({ t: 0, E: 1, O: 0 });
const noncycle = Object.freeze([
  Object.freeze({ coefficient: 1, left: T, right: Q, label: '[T|Q]' }),
]);
assert.equal(barH2Period(noncycle).status, 'BAR_H2_PERIOD_ABSTAINS_NONCYCLE');

// Explicit 3-boundaries are 2-cycles and carry zero period.
const b3 = boundaryOfBar3Chain(Object.freeze([
  Object.freeze({ coefficient: 1, x: T, y: Q, z: T }),
]));
assert.equal(b3.status, 'NORMALIZED_BAR_3_BOUNDARY_DERIVED');
assert.equal(b3.is_bar2_cycle, true);
assert.equal(barH2Period(b3.chain).period, 0);

// Changing a representative by a 3-boundary preserves the period exactly.
const z = relationBarCycle();
assert.equal(z.passed, true);
const shifted = addBar2Chains(z.chain, b3.chain);
assert.equal(shifted.status, 'BAR_2_CHAIN_NORMALIZED');
assert.equal(barH2Period(z.chain).period, 2);
assert.equal(barH2Period(shifted.chain).period, 2);

// Orientation and additive pasting behave as an integer period representation.
const minusZ = scaleBar2Chain(z.chain, -1);
const twiceZ = scaleBar2Chain(z.chain, 2);
const cancelled = addBar2Chains(z.chain, minusZ.chain);
assert.equal(barH2Period(minusZ.chain).period, -2);
assert.equal(barH2Period(twiceZ.chain).period, 4);
assert.equal(barH2Period(cancelled.chain).period, 0);

const out = barH2PeriodReturn(z.chain, 9);
const back = barH2PeriodReturn(minusZ.chain, out.output);
assert.equal(out.output, 11);
assert.equal(back.output, 9);

// Pointwise cocycle presentation can move while cycle authority remains fixed.
assert.equal(cert.section_change_cycle_invariance.passed, true);
assert.equal(cert.section_change_cycle_invariance.omega_T_Q, 1);
assert.equal(cert.section_change_cycle_invariance.changed_omega_T_Q, 0);
assert.equal(cert.section_change_cycle_invariance.original_period, 2);
assert.equal(cert.section_change_cycle_invariance.transformed_period, 2);

// The known infinite-order class generates exactly the even period translations.
assert.equal(cert.cyclic_subgroup_generated_by_z.passed, true);
assert.equal(cert.cyclic_subgroup_generated_by_z.image, '2Z');
assert.equal(cert.cyclic_subgroup_generated_by_z.full_period_image_claimed, false);
for (const row of cert.cyclic_subgroup_generated_by_z.rows) {
  assert.equal(row.period, 2 * row.n);
}

// No accidental promotion to higher holonomy language.
assert.deepEqual(cert.canonical_classifications, [
  'NORMALIZED_INTEGER_TRANSPORT_TWO_COCYCLE_INDUCES_A_WELL_DEFINED_ADDITIVE_BAR_H2_PERIOD_HOMOMORPHISM_IN_THE_DECLARED_BAR_COMPLEX',
  'THE_EXPLICIT_RELATION_HOMOLOGY_CLASS_[z]_HAS_PERIOD_TWO_AND_INDUCES_A_NONIDENTITY_INTEGER_TORSOR_RETURN_TRANSLATION_TAU_2',
  'BAR_H2_PERIOD_IS_INVARIANT_UNDER_COHOMOLOGOUS_SECTION_PRESENTATIONS_AND_UNDER_CHANGE_OF_CYCLE_REPRESENTATIVE_BY_BAR_3_BOUNDARIES',
  'THE_CYCLIC_SUBGROUP_GENERATED_BY_[z]_MAPS_INJECTIVELY_TO_THE_EVEN_INTEGER_TRANSLATIONS_WITH_PERIOD_n[z]_EQUAL_2n',
]);
assert.equal(cert.quarantines.includes('BAR_H2_PERIOD_REPRESENTATION_NOT_2_HOLONOMY'), true);

console.log('Ash A15-R0 #765 bar-H2 period return representation tests passed.');
