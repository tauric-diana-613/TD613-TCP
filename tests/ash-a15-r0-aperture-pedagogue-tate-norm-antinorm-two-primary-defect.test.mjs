import assert from 'node:assert/strict';

import {
  integerFractionGroupMultiply,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-exact-bar-h2-torsion-sensitive-holonomy.js';
import {
  TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
  orientationParityCharacter,
  parityKernelAndDeckCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-tate-norm-antinorm-two-primary-defect.js';
import {
  correctedNormAntiNormLatticeCertificate,
  correctedInvertTwoProjectorCertificate,
  correctedModTwoCollapseCertificate,
  correctedDeckLefschetzCertificate,
  correctedTateHostileCertificate,
  correctedTateNormAntiNormTwoPrimaryDefectCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-tate-norm-antinorm-two-primary-defect-correction-001.js';

assert.equal(
  TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
);

const T = { t: 1, E: 0, O: 0 };
const e = { t: 0, E: 1, O: 0 };
const o = { t: 0, E: 0, O: 1 };
const s = { t: 2, E: 0, O: 0 };

assert.equal(orientationParityCharacter(T), -1);
assert.equal(orientationParityCharacter(e), 1);
assert.equal(orientationParityCharacter(s), 1);

// Hostile: E-parity is not the authored deck character.
const wrongECharacter = (value) => (((value.E % 2) + 2) % 2 === 0 ? 1 : -1);
const Te = integerFractionGroupMultiply(T, e);
assert.notEqual(
  wrongECharacter(Te),
  wrongECharacter(T) * wrongECharacter(e),
  '(-1)^E must fail as a group character on the semidirect product',
);

const cover = parityKernelAndDeckCertificate();
assert.equal(cover.status, 'PARITY_KERNEL_AND_DECK_CERTIFICATE_PASSED');
assert.equal(cover.passed, true);
assert.equal(cover.kernel_condition, 't even');
assert.match(cover.kernel_isomorphism, /Z\^3/);
assert.equal(cover.det_A1, -1);
assert.deepEqual(cover.conjugation.e, o);
assert.deepEqual(cover.conjugation.o, e);
assert.deepEqual(cover.conjugation.s, s);
assert.deepEqual(cover.A0, [[1]]);
assert.deepEqual(cover.A1, [[0, 1, 0], [1, 0, 0], [0, 0, 1]]);
assert.deepEqual(cover.A2, [[-1, 0, 0], [0, 0, 1], [0, 1, 0]]);
assert.deepEqual(cover.A3, [[-1]]);
assert.notEqual(cover.det_A1, 1, 'deck determinant +1 must be rejected');
assert.notEqual(cover.A2[0][0], 1, 'e∧o must reverse under the deck involution');
assert.notEqual(cover.A3[0][0], 1, 'top class upstairs must be anti-invariant');

// Rank-two hostile: e, o, and s=T^2 give three independent kernel directions
// under the authored map (t,E,O)->(E,O,t/2).
const kernelGeneratorImages = [
  [e.E, e.O, e.t / 2],
  [o.E, o.O, o.t / 2],
  [s.E, s.O, s.t / 2],
];
assert.deepEqual(kernelGeneratorImages, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);

const lattice = correctedNormAntiNormLatticeCertificate();
assert.equal(lattice.status, 'TATE_CORRECTION_001_LATTICE_PASSED');
assert.equal(lattice.passed, true);
assert.equal(lattice.rows.length, 4);
assert.deepEqual(lattice.zero_rank_cases, { degree0_minus: true, degree3_plus: true });
assert.deepEqual(lattice.table, [
  { q: 0, hat_H0: 'Z/2', hat_H_minus1: '0' },
  { q: 1, hat_H0: 'Z/2', hat_H_minus1: '0' },
  { q: 2, hat_H0: '0', hat_H_minus1: 'Z/2' },
  { q: 3, hat_H0: '0', hat_H_minus1: 'Z/2' },
]);
assert.equal(lattice.no_odd_primary_torsion, true);

for (const row of lattice.rows) {
  assert.equal(row.passed, true, `degree ${row.q} lattice row must pass`);
  assert.equal(row.identities.A2eqI, true);
  assert.equal(row.identities.ND0, true);
  assert.equal(row.identities.DN0, true);
  assert.equal(row.identities.NplusD2I, true);
  assert.equal(row.plus.passed, true);
  assert.equal(row.minus.passed, true);
  assert.equal(row.N_image.exact, true);
  assert.equal(row.D_image.exact, true);
}

// Explicit image-index scars.
assert.equal(lattice.rows[0].N_image.index, 2);
assert.equal(lattice.rows[1].N_image.index, 2);
assert.equal(lattice.rows[1].D_image.index, 1);
assert.equal(lattice.rows[2].N_image.index, 1);
assert.equal(lattice.rows[2].D_image.index, 2);
assert.equal(lattice.rows[3].D_image.index, 2);

const localized = correctedInvertTwoProjectorCertificate();
assert.equal(localized.status, 'TATE_CORRECTION_001_INVERT_TWO_PASSED');
assert.equal(localized.passed, true);
assert.equal(localized.integral_projectors_over_Z, false);
assert.equal(localized.all_tate_defects_vanish_after_inverting_two, true);
assert.match(localized.localized_splitting, /Z\[1\/2\]/);
assert.equal(localized.rows.every((row) => row.passed), true);
assert.equal(localized.rows.some((row) => row.has_fractional_entry), true);
for (const row of localized.rows) {
  assert.equal(Object.values(row.identities).every(Boolean), true);
}

const mod2 = correctedModTwoCollapseCertificate();
assert.equal(mod2.status, 'TATE_CORRECTION_001_MOD2_PASSED');
assert.equal(mod2.passed, true);
assert.equal(mod2.characters_coincide_mod2, true);
assert.equal(mod2.trivial_character_mod2, 1);
assert.equal(mod2.sign_character_mod2, 1);
assert.equal(mod2.rows.every((row) => row.equal), true);

const lefschetz = correctedDeckLefschetzCertificate();
assert.equal(lefschetz.status, 'TATE_CORRECTION_001_LEFSCHETZ_PASSED');
assert.equal(lefschetz.passed, true);
assert.deepEqual(lefschetz.traces, [1, 1, -1, -1]);
assert.equal(lefschetz.lefschetz_number, 0);
assert.equal(lefschetz.consistency_only, true);
assert.equal(lefschetz.zero_lefschetz_proves_freeness, false);

const hostiles = correctedTateHostileCertificate();
assert.equal(hostiles.status, 'TATE_CORRECTION_001_HOSTILES_PASSED');
assert.equal(hostiles.passed, true);
assert.equal(hostiles.physical_anomaly_authority, false);
assert.equal(hostiles.physical_Z2_topological_order_authority, false);

const aggregate = correctedTateNormAntiNormTwoPrimaryDefectCertificate();
assert.equal(aggregate.status, 'TATE_NORM_ANTINORM_TWO_PRIMARY_DEFECT_CORRECTION_001_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.parent_receipt, '39b8f6e8ba319154378d03c28a1bf42c02870de1');
assert.equal(aggregate.correction, 'ZERO_RANK_EIGENSPACE_IMAGE_HANDLING');
assert.equal(aggregate.earned_if_passed.length, 7);
assert.equal(aggregate.authority_ceiling.operational_route_cover, false);
assert.equal(aggregate.authority_ceiling.physical_spacetime_torus, false);
assert.equal(aggregate.authority_ceiling.physical_parity_symmetry, false);
assert.equal(aggregate.authority_ceiling.physical_anomaly, false);
assert.equal(aggregate.authority_ceiling.physical_Z2_topological_order, false);
assert.equal(aggregate.authority_ceiling.ontology, false);
assert.equal(aggregate.authority_ceiling.production, false);
assert.equal(aggregate.authority_ceiling.vercel, false);

console.log('Ash A15-R0 Tate norm/anti-norm two-primary defect tests passed.');
