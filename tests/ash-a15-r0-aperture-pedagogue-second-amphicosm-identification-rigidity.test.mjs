import assert from 'node:assert/strict';

import {
  conwayRossettiGeneratorCertificate,
  firstAmphicosmExclusionCertificate,
  amphicosmH1FingerprintCertificate,
  secondAmphicosmHostileCertificate,
  SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_PARENT_RECEIPT,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-second-amphicosm-identification-rigidity.js';
import {
  reverseTietzeCertificate,
  exactSecondAmphicosmIdentificationCertificate,
  exactBieberbachRigidityCertificate,
  secondAmphicosmTietzeRigidityGlobalCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-second-amphicosm-tietze-exactification.js';

const PARENT_775_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
assert.equal(SECOND_AMPHICOSM_IDENTIFICATION_RIGIDITY_PARENT_RECEIPT, PARENT_775_RECEIPT);

const presentation = conwayRossettiGeneratorCertificate();
assert.equal(presentation.passed, true);
assert.equal(presentation.status, 'CONWAY_ROSSETTI_NEGATIVE_AMPHICOSM_GENERATOR_CERTIFICATE_PASSED');
assert.deepEqual(presentation.generators.W, { t: 1, E: 0, O: 0 });
assert.deepEqual(presentation.generators.X, { t: 1, E: 1, O: 0 });
assert.deepEqual(presentation.generators.Z, { t: 0, E: 1, O: -1 });
assert.deepEqual(presentation.derived.Z_inverse, { t: 0, E: -1, O: 1 });
assert.deepEqual(presentation.derived.WConjugatesZ, presentation.derived.Z_inverse);
assert.deepEqual(presentation.derived.XConjugatesZ, presentation.derived.Z_inverse);
assert.deepEqual(presentation.derived.commutator_X_W, presentation.generators.Z);
assert.notDeepEqual(presentation.derived.commutator_X_W, { t: 0, E: 0, O: 0 });
assert.equal(Object.values(presentation.negative_amphicosm_relations).every(Boolean), true);
assert.equal(Object.values(presentation.generation).every(Boolean), true);
assert.deepEqual(presentation.recovered_parent_generators.T, { t: 1, E: 0, O: 0 });
assert.deepEqual(presentation.recovered_parent_generators.e, { t: 0, E: 1, O: 0 });
assert.deepEqual(presentation.recovered_parent_generators.o, { t: 0, E: 0, O: 1 });

const firstExclusion = firstAmphicosmExclusionCertificate();
assert.equal(firstExclusion.passed, true);
assert.equal(firstExclusion.positive_amphicosm_required_relation, '[X,W]=1');
assert.equal(firstExclusion.positive_relation_fails, true);
assert.equal(firstExclusion.exact_negative_relation_witness, true);

const h1 = amphicosmH1FingerprintCertificate();
assert.equal(h1.passed, true);
assert.equal(h1.inherited_parent_H1, 'Z^2');
assert.equal(h1.source_fingerprints.positive_first_amphicosm, 'Z^2 ⊕ Z/2');
assert.equal(h1.source_fingerprints.negative_second_amphicosm, 'Z^2');
assert.equal(h1.matches_negative_second, true);
assert.equal(h1.excludes_positive_first, true);

const tietze = reverseTietzeCertificate();
assert.equal(tietze.passed, true);
assert.equal(tietze.proof_step_ids_complete, true);
assert.equal(tietze.proof_steps.length, 7);
assert.deepEqual(
  tietze.proof_steps.map((step) => step.id),
  [
    'E_COMMUTES_Z',
    'COMMUTATOR_REWRITE',
    'OPPOSITE_CONJUGATION',
    'O_EQUALS_E_Z_INVERSE',
    'E_O_COMMUTE',
    'T_SWAPS_E_TO_O',
    'T_SWAPS_O_TO_E',
  ],
);
assert.equal(
  tietze.classification_if_passed,
  'THE_PARENT_AND_NEGATIVE_AMPHICOSM_PRESENTATIONS_ARE_TIETZE_EQUIVALENT.',
);
assert.equal(
  tietze.scar,
  'RELATION_MATCH_PLUS_GENERATION != PRESENTATION_ISOMORPHISM_WITHOUT_REVERSE_TIETZE_CERTIFICATE',
);

const exact = exactSecondAmphicosmIdentificationCertificate();
assert.equal(exact.passed, true);
assert.equal(exact.classical_name, 'second amphicosm');
assert.equal(exact.conway_rossetti_symbol, '-a1');
assert.equal(exact.wolf_label, 'B2');
assert.equal(exact.exact_group_isomorphism_if_passed, 'G ≅ pi_1(second amphicosm -a1)');

const rigidity = exactBieberbachRigidityCertificate();
assert.equal(rigidity.passed, true);
assert.equal(rigidity.flat_affine_type, 'second/negative amphicosm -a1');
assert.equal(rigidity.unique_metric_claim, false);
assert.equal(rigidity.physical_spacetime_authority, false);
assert.match(rigidity.standard_theorem.statement, /affine conjugacy/);

const hostiles = secondAmphicosmHostileCertificate();
assert.equal(hostiles.passed, true);
assert.equal(hostiles.wrong_commutator_identity_detected, true);
assert.equal(hostiles.wrong_Z_identity_detected, true);
assert.equal(hostiles.wrong_W_fixes_Z_detected, true);
assert.equal(hostiles.wrong_X_fixes_Z_detected, true);
assert.equal(hostiles.parent_generators_recovered, true);
assert.equal(hostiles.wrong_positive_H1_detected, true);
assert.equal(hostiles.point_group_C2_alone_is_not_classifier, true);
assert.equal(hostiles.torus_double_cover_alone_is_not_classifier, true);
assert.equal(hostiles.unique_isometric_metric_overclaim_rejected, true);

// Independent malformed-classifier controls.
const malformedPointGroupOnlyClassifier = ({ pointGroup }) => pointGroup === 'C2' ? 'AMPHICOSM_UNRESOLVED' : 'OTHER';
assert.equal(malformedPointGroupOnlyClassifier({ pointGroup: 'C2' }), 'AMPHICOSM_UNRESOLVED');
const malformedDoubleCoverOnlyClassifier = ({ cover }) => cover === 'T^3' ? 'AMPHICOSM_UNRESOLVED' : 'OTHER';
assert.equal(malformedDoubleCoverOnlyClassifier({ cover: 'T^3' }), 'AMPHICOSM_UNRESOLVED');

// The two decisive fingerprints must agree and the positive fingerprint must fail.
assert.deepEqual(
  {
    presentation: exact.tietze_equivalence.passed,
    inheritedH1: exact.H1_fingerprint.inherited_parent_H1,
    positiveExcluded: exact.positive_first_exclusion.passed,
  },
  { presentation: true, inheritedH1: 'Z^2', positiveExcluded: true },
);

const global = secondAmphicosmTietzeRigidityGlobalCertificate();
assert.equal(global.passed, true);
assert.equal(global.status, 'SECOND_AMPHICOSM_TIETZE_RIGIDITY_GLOBAL_CERTIFICATE_PASSED');
assert.equal(global.parent_receipt, PARENT_775_RECEIPT);
assert.equal(global.no_dependency_on_778_780_781_782_783, true);
assert.deepEqual(global.earned_if_witnessed, [
  'THE_775_FRACTION_GROUP_PRESENTATION_IS_TIETZE_EQUIVALENT_TO_THE_CONWAY_ROSSETTI_SECOND_NEGATIVE_AMPHICOSM_PRESENTATION',
  'THE_INHERITED_H1_Z_SQUARED_FINGERPRINT_INDEPENDENTLY_EXCLUDES_THE_FIRST_POSITIVE_AMPHICOSM',
  'THE_775_K_G_1_HOMOTOPY_TYPE_IS_THE_SECOND_NEGATIVE_AMPHICOSM_HOMOTOPY_TYPE',
  'BIEBERBACH_AFFINE_RIGIDITY_FIXES_THE_ASSOCIATED_FLAT_MANIFOLD_AFFINE_TYPE_AS_SECOND_NEGATIVE_AMPHICOSM',
  'SECOND_AMPHICOSM_IDENTIFICATION_AND_BIEBERBACH_RIGIDITY_EARNED',
]);

console.log('Ash A15-R0 second-amphicosm identification and Bieberbach-rigidity hostile assay passed.');
