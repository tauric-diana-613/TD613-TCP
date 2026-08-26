import assert from 'node:assert/strict';

import {
  UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT,
  finitelyGeneratedAbelianGroup,
  coefficientElement,
  addCoefficientElements,
  scaleCoefficientElement,
  twoTorsionCertificate,
  coefficientTransportClassStructure,
  h2Character,
  evaluateH2Character,
  faithfulCharacterCriterion,
  coefficientHomomorphism,
  pushCharacterForward,
  universalCoefficientTheoremCertificate,
  universalIdentityTransportCertificate,
  coefficientNaturalityCertificate,
  cyclicCoefficientParityCertificate,
  faithfulTargetCriterionCertificate,
  universalCoefficientHolonomyRepresentabilityCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-universal-coefficient-holonomy-representability.js';
import {
  correctedUniversalCoefficientTheoremCertificate,
  correctedUniversalCoefficientHolonomyRepresentabilityCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-universal-coefficient-holonomy-representability-correction-001.js';

assert.equal(
  UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
  'the universal coefficient chamber must remain bound to exact #775 receipt ancestry',
);

const originalUct = universalCoefficientTheoremCertificate();
assert.equal(originalUct.passed, false, 'the preserved first aggregate must retain its exact parent-payload wrapper mismatch');
assert.equal(originalUct.inherited_H2, 'Z ⊕ Z/2');

const correctedUct = correctedUniversalCoefficientTheoremCertificate();
assert.equal(correctedUct.status, 'UNIVERSAL_COEFFICIENT_THEOREM_CERTIFICATE_PASSED');
assert.equal(correctedUct.passed, true);
assert.equal(correctedUct.inherited_H2, 'Z ⊕ Z/2');
assert.equal(correctedUct.theorem_changed, false);
assert.match(correctedUct.ext_vanishing_for_every_A, /every abelian A/);
assert.match(correctedUct.transport_classification, /naturally in every abelian coefficient group A/);
assert.match(correctedUct.coefficient_formula, /A⊕A\[2\]/);

const Z = finitelyGeneratedAbelianGroup({ name: 'test-Z', free_rank: 1 });
const Z2 = finitelyGeneratedAbelianGroup({ name: 'test-Z2', torsion_moduli: [2] });
const Z3 = finitelyGeneratedAbelianGroup({ name: 'test-Z3', torsion_moduli: [3] });
const Z4 = finitelyGeneratedAbelianGroup({ name: 'test-Z4', torsion_moduli: [4] });
const H = finitelyGeneratedAbelianGroup({ name: 'test-H', free_rank: 1, torsion_moduli: [2] });
const ZplusZ4 = finitelyGeneratedAbelianGroup({ name: 'test-ZplusZ4', free_rank: 1, torsion_moduli: [4] });
const Zsq = finitelyGeneratedAbelianGroup({ name: 'test-Zsq', free_rank: 2 });

for (const group of [Z, Z2, Z3, Z4, H, ZplusZ4, Zsq]) {
  assert.equal(group.status, 'FG_ABELIAN_GROUP_DERIVED');
}
assert.equal(finitelyGeneratedAbelianGroup({ name: 'bad', torsion_moduli: [1] }).status, 'FG_ABELIAN_GROUP_ABSTAINS');

const zTwo = twoTorsionCertificate(Z);
const z2Two = twoTorsionCertificate(Z2);
const z3Two = twoTorsionCertificate(Z3);
const z4Two = twoTorsionCertificate(Z4);
assert.equal(zTwo.generators.length, 0);
assert.equal(z2Two.generators.length, 1);
assert.equal(z3Two.generators.length, 0);
assert.equal(z4Two.generators.length, 1);
assert.deepEqual(z4Two.generators[0].torsion, [2]);

const zStructure = coefficientTransportClassStructure(Z);
const z2Structure = coefficientTransportClassStructure(Z2);
const z3Structure = coefficientTransportClassStructure(Z3);
const z4Structure = coefficientTransportClassStructure(Z4);
const hStructure = coefficientTransportClassStructure(H);
assert.deepEqual(zStructure.torsion_moduli, []);
assert.deepEqual(z2Structure.torsion_moduli, [2, 2]);
assert.deepEqual(z3Structure.torsion_moduli, [3]);
assert.deepEqual(z4Structure.torsion_moduli, [4, 2]);
assert.deepEqual(hStructure.torsion_moduli, [2, 2]);
assert.match(hStructure.formula, /Hom\(Z⊕Z\/2,A\)/);

const hA = coefficientElement(H, { free: [1], torsion: [0] });
const hB = coefficientElement(H, { free: [0], torsion: [1] });
const identity = h2Character(H, hA, hB);
assert.equal(identity.status, 'H2_CHARACTER_DERIVED');
assert.deepEqual(evaluateH2Character(H, identity, { n: -7, epsilon: 1 }).free, [-7]);
assert.deepEqual(evaluateH2Character(H, identity, { n: -7, epsilon: 1 }).torsion, [1]);

const invalidB = coefficientElement(H, { free: [1], torsion: [0] });
assert.equal(
  h2Character(H, hA, invalidB).status,
  'H2_CHARACTER_ABSTAINS',
  'the torsion generator image must satisfy 2b=0; an infinite-order b is not a character of Z/2',
);

const Hfaithful = faithfulCharacterCriterion(H, hA, hB);
assert.equal(Hfaithful.faithful, true);
assert.equal(Hfaithful.a_infinite_order_in_fg_model, true);
assert.equal(Hfaithful.b_nonzero_two_torsion, true);
assert.equal(Hfaithful.bounded_corroboration.no_collision_in_window, true);

const Zzero = coefficientElement(Z, { free: [0] });
const Zone = coefficientElement(Z, { free: [1] });
const Zblind = faithfulCharacterCriterion(Z, Zone, Zzero);
assert.equal(Zblind.faithful, false);
assert.equal(Zblind.b_nonzero_two_torsion, false);

const z2One = coefficientElement(Z2, { torsion: [1] });
const finiteOnly = faithfulCharacterCriterion(Z2, z2One, z2One);
assert.equal(finiteOnly.faithful, false);
assert.equal(finiteOnly.a_infinite_order_in_fg_model, false);
assert.equal(finiteOnly.b_nonzero_two_torsion, true);

const zSqA = coefficientElement(Zsq, { free: [1, 0] });
const zSqZero = coefficientElement(Zsq, { free: [0, 0] });
const torsionFreeLarge = faithfulCharacterCriterion(Zsq, zSqA, zSqZero);
assert.equal(torsionFreeLarge.faithful, false, 'multiple free directions do not substitute for nonzero two-torsion');

const bigA = coefficientElement(ZplusZ4, { free: [1], torsion: [0] });
const bigB = coefficientElement(ZplusZ4, { free: [0], torsion: [2] });
const largerHost = faithfulCharacterCriterion(ZplusZ4, bigA, bigB);
assert.equal(largerHost.faithful, true);
assert.equal(largerHost.bounded_corroboration.no_collision_in_window, true);

const universal = universalIdentityTransportCertificate();
assert.equal(universal.status, 'UNIVERSAL_IDENTITY_TRANSPORT_CERTIFICATE_PASSED');
assert.equal(universal.passed, true);
assert.match(universal.universal_class, /corresponds to id_H/);
assert.match(universal.unique_pushforward_statement, /unique/);
assert.equal(universal.inherited_775_character.psi_z0.integer, 1);
assert.equal(universal.inherited_775_character.psi_z0.mod2, 0);
assert.equal(universal.inherited_775_character.psi_theta.integer, 0);
assert.equal(universal.inherited_775_character.psi_theta.mod2, 1);

const naturality = coefficientNaturalityCertificate();
assert.equal(naturality.status, 'COEFFICIENT_NATURALITY_CERTIFICATE_PASSED');
assert.equal(naturality.passed, true);
assert.equal(naturality.rows.length, 5);
assert.ok(naturality.rows.every((row) => row.passed));
assert.match(naturality.naturality_identity, /f∘h/);

const malformedSource = finitelyGeneratedAbelianGroup({ name: 'source-Z2', torsion_moduli: [2] });
const malformedTarget = finitelyGeneratedAbelianGroup({ name: 'target-Z', free_rank: 1 });
const malformed = coefficientHomomorphism({
  name: 'forbidden_Z2_to_Z_sends_1_to_1',
  source: malformedSource,
  target: malformedTarget,
  map: (x) => coefficientElement(malformedTarget, { free: [x.torsion[0]] }),
});
assert.equal(malformed.status, 'COEFFICIENT_HOMOMORPHISM_FAILED');
assert.equal(malformed.passed, false);
assert.ok(malformed.torsion_relation_rows.some((row) => row.relation_preserved === false));

const cyclic = cyclicCoefficientParityCertificate();
assert.equal(cyclic.status, 'CYCLIC_COEFFICIENT_PARITY_CERTIFICATE_PASSED');
assert.equal(cyclic.passed, true);
for (const row of cyclic.rows) {
  assert.equal(row.two_torsion_generators, row.n % 2 === 0 ? 1 : 0);
}
assert.match(cyclic.theorem, /no finite cyclic target is raw-H2 faithful/);

const faithfulTargets = faithfulTargetCriterionCertificate();
assert.equal(faithfulTargets.status, 'FAITHFUL_TARGET_CRITERION_CERTIFICATE_PASSED');
assert.equal(faithfulTargets.passed, true);
assert.deepEqual(
  Object.fromEntries(faithfulTargets.rows.map((row) => [row.name, row.result.faithful])),
  { Z: false, 'Z/2': false, H: true, 'Z⊕Z/4': true, 'Z²': false },
);
assert.match(faithfulTargets.exact_iff, /iff A contains an infinite-order element/);
assert.match(faithfulTargets.minimal_core_image, /im\(h\)≅H/);
assert.match(faithfulTargets.uniqueness_ceiling, /undeclared ordering/);

// Explicit pushforward control independent of the built-in naturality suite.
const HtoZ4host = coefficientHomomorphism({
  name: 'explicit_H_to_ZplusZ4',
  source: H,
  target: ZplusZ4,
  map: (x) => coefficientElement(ZplusZ4, { free: [x.free[0]], torsion: [2 * x.torsion[0]] }),
});
assert.equal(HtoZ4host.status, 'COEFFICIENT_HOMOMORPHISM_DERIVED');
const pushed = pushCharacterForward(H, ZplusZ4, identity, HtoZ4host);
assert.equal(pushed.status, 'H2_CHARACTER_DERIVED');
assert.deepEqual(pushed.a.free, [1]);
assert.deepEqual(pushed.a.torsion, [0]);
assert.deepEqual(pushed.b.free, [0]);
assert.deepEqual(pushed.b.torsion, [2]);
assert.equal(faithfulCharacterCriterion(ZplusZ4, pushed.a, pushed.b).faithful, true);

const originalAggregate = universalCoefficientHolonomyRepresentabilityCertificate();
assert.equal(originalAggregate.passed, false, 'the first aggregate remains provenance for the pre-witness wrapper mismatch');

const aggregate = correctedUniversalCoefficientHolonomyRepresentabilityCertificate();
assert.equal(aggregate.status, 'UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_CERTIFICATE_PASSED');
assert.equal(aggregate.passed, true);
assert.equal(aggregate.prewitness_wrapper_correction_applied, true);
assert.equal(aggregate.original_aggregate_passed, false);
assert.equal(aggregate.uct.passed, true);
assert.equal(aggregate.universal_identity.passed, true);
assert.equal(aggregate.coefficient_naturality.passed, true);
assert.equal(aggregate.cyclic_parity.passed, true);
assert.equal(aggregate.faithful_target_criterion.passed, true);
assert.equal(aggregate.represented_functor, 'T_2(-) ≅ Hom(H2_bar(B;Z),-) naturally on Ab.');
assert.equal(aggregate.coefficient_classification, 'T_2(A) ≅ A⊕A[2] for every abelian A.');
assert.match(aggregate.universal_class, /unique coefficient pushforward/);
assert.equal(aggregate.classifications.length, 5);
assert.equal(aggregate.consequential_bearing, 'UNIVERSAL_COEFFICIENT_FORMAL_TWO_HOLONOMY_REPRESENTABILITY_EARNED');
assert.equal(aggregate.authority_ceiling.geometric_two_holonomy, false);
assert.equal(aggregate.authority_ceiling.physical_two_holonomy, false);
assert.equal(aggregate.authority_ceiling.operational_path_two_groupoid, false);
assert.ok(aggregate.scars.includes('exact parent payload != prose wrapper string'));
assert.ok(aggregate.scars.includes('minimal faithful image != unique smallest ambient abelian group under an undeclared ordering'));

console.log('UNIVERSAL_COEFFICIENT_HOLONOMY_REPRESENTABILITY_TEST_PASSED');
