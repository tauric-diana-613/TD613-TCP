import assert from 'node:assert/strict';
import {
  finiteBoundaryFraming,
  separatelyFramedBar2Gluing,
  commonRezeroingSeparatelyFramedGluing,
  separatelyFramedBar2GluingSeamDefectCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-separately-framed-bar-2-gluing-seam-defect.js';
import {
  associativityPasting,
  defaultOpenCellPhi,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';
import {
  T_COORDINATE,
  Q_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

const cert = separatelyFramedBar2GluingSeamDefectCertificate();
assert.equal(cert.passed, true);
assert.equal(cert.status, 'SEPARATELY_FRAMED_BAR_2_GLUING_SEAM_DEFECT_CERTIFICATE_PASSED');

// Primary matched/mismatch hostile: same exterior decoration, same lawful seam,
// only the right seam frame changes 2 -> 5.
assert.equal(cert.matched_and_mismatch.passed, true);
assert.equal(cert.matched_and_mismatch.matched.seam_defect, 0);
assert.equal(cert.matched_and_mismatch.matched.seam_matched, true);
assert.equal(cert.matched_and_mismatch.matched.exact_gluing_law_passed, true);
assert.equal(cert.matched_and_mismatch.mismatch.seam_defect, -3);
assert.equal(cert.matched_and_mismatch.mismatch.seam_matched, false);
assert.equal(cert.matched_and_mismatch.mismatch.exact_gluing_law_passed, true);
assert.equal(
  cert.matched_and_mismatch.mismatch.facewise_relative_sum
    - cert.matched_and_mismatch.matched.facewise_relative_sum,
  -3,
);

// Wrong orientation is rejected even with equal numerical seam framing.
assert.equal(cert.wrong_orientation.passed, true);
assert.equal(
  cert.wrong_orientation.rejected.status,
  'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_UNLAWFUL_SEAM_ORIENTATION',
);
assert.equal(cert.wrong_orientation.rejected.seam_coefficient_a, -1);
assert.equal(cert.wrong_orientation.rejected.seam_coefficient_b, -1);
assert.equal(cert.wrong_orientation.rejected.lawful_orientation, false);

// One common cohomological re-zeroing preserves both the facewise relative
// sum and any already-present seam mismatch.
assert.equal(cert.common_rezeroing.passed, true);
assert.equal(cert.common_rezeroing.result.passed, true);
assert.equal(cert.common_rezeroing.result.original.seam_defect, -3);
assert.equal(cert.common_rezeroing.result.transformed.seam_defect, -3);
assert.equal(cert.common_rezeroing.result.facewise_sum_invariant, true);
assert.equal(cert.common_rezeroing.result.seam_defect_invariant, true);

// Alternate inherited associativity decompositions may carry different
// INTERNAL frame values, yet agree exactly when their exterior decoration is
// fixed and each internal seam is matched within its own decomposition.
assert.equal(cert.associative_decomposition.passed, true);
assert.equal(cert.associative_decomposition.left_internal_frame, 7);
assert.equal(cert.associative_decomposition.right_internal_frame, -5);
assert.equal(cert.associative_decomposition.left.seam_defect, 0);
assert.equal(cert.associative_decomposition.right.seam_defect, 0);
assert.equal(
  cert.associative_decomposition.left.external_frame_pairing,
  cert.associative_decomposition.right.external_frame_pairing,
);
assert.equal(
  cert.associative_decomposition.left.raw_pasted_interior,
  cert.associative_decomposition.right.raw_pasted_interior,
);
assert.equal(
  cert.associative_decomposition.left.facewise_relative_sum,
  cert.associative_decomposition.right.facewise_relative_sum,
);

// Translation composition, orientation inverse, identity, and closed tau_2
// reduction are all part of the same frozen entrance exam.
assert.equal(cert.translation_composition.passed, true);
assert.equal(
  cert.translation_composition.composition_probe.composed,
  cert.translation_composition.composition_probe.direct,
);
assert.equal(
  cert.translation_composition.orientation_inverse_probe.after_forward_and_reverse,
  cert.translation_composition.orientation_inverse_probe.probe,
);
assert.equal(cert.translation_composition.zero.value, 0);
assert.equal(cert.translation_composition.closed.value, 2);
assert.equal(cert.translation_composition.inherited.period, 2);

// Declared-paste impersonation and invalid framing/seam inputs fail visibly.
assert.equal(cert.false_declared_paste.passed, true);
assert.equal(
  cert.false_declared_paste.result.status,
  'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_FALSE_DECLARED_PASTE',
);
assert.equal(cert.invalid_framing_and_seam.passed, true);
assert.equal(
  cert.invalid_framing_and_seam.receipt_labeled_seam.status,
  'SEPARATELY_FRAMED_BAR_2_GLUING_ABSTAINS',
);
assert.equal(
  cert.invalid_framing_and_seam.absent_seam.status,
  'SEPARATELY_FRAMED_BAR_2_GLUING_REJECTS_UNLAWFUL_SEAM_ORIENTATION',
);

// Direct finite fixture: independently reconstruct the gluing law rather than
// relying only on the aggregate certificate.
const paste = associativityPasting(T_COORDINATE, Q_COORDINATE, T_COORDINATE);
assert.equal(paste.status, 'BAR_2_ASSOCIATIVITY_PASTING_DERIVED');
const exterior = [
  { coordinate: paste.x, value: 4 },
  { coordinate: paste.y, value: -2 },
  { coordinate: paste.z, value: 4 },
  { coordinate: paste.xyz, value: 1 },
];
const lambdaA = finiteBoundaryFraming([...exterior, { coordinate: paste.xy, value: 6 }]);
const lambdaB = finiteBoundaryFraming([...exterior, { coordinate: paste.xy, value: 9 }]);
assert.equal(typeof lambdaA, 'function');
assert.equal(typeof lambdaB, 'function');
const faceA = Object.freeze([
  Object.freeze({ coefficient: 1, left: paste.x, right: paste.y, label: '[x|y]' }),
]);
const faceB = Object.freeze([
  Object.freeze({ coefficient: 1, left: paste.xy, right: paste.z, label: '[x★y|z]' }),
]);
const direct = separatelyFramedBar2Gluing({
  faceA,
  faceB,
  seam: paste.xy,
  lambdaA,
  lambdaB,
  declaredPaste: paste.left_chain,
});
assert.equal(direct.status, 'SEPARATELY_FRAMED_BAR_2_GLUING_DERIVED');
assert.equal(direct.seam_coefficient_a, -1);
assert.equal(direct.seam_coefficient_b, 1);
assert.equal(direct.seam_defect, -3);
assert.equal(direct.exact_gluing_law_passed, true);
assert.equal(
  direct.facewise_relative_sum,
  direct.raw_pasted_interior - direct.external_frame_pairing + direct.seam_defect,
);

const rezeroed = commonRezeroingSeparatelyFramedGluing({
  faceA,
  faceB,
  seam: paste.xy,
  lambdaA,
  lambdaB,
  declaredPaste: paste.left_chain,
}, defaultOpenCellPhi);
assert.equal(rezeroed.status, 'SEPARATELY_FRAMED_COMMON_REZEROING_DERIVED');
assert.equal(rezeroed.passed, true);
assert.equal(rezeroed.original.seam_defect, -3);
assert.equal(rezeroed.transformed.seam_defect, -3);

// Capacity is not compatibility: duplicate finite framing instructions with
// conflicting values do not silently choose one.
assert.equal(finiteBoundaryFraming([
  { coordinate: paste.xy, value: 1 },
  { coordinate: paste.xy, value: 2 },
]), null);

assert.deepEqual(cert.canonical_classifications, [
  'SEPARATELY_FRAMED_LAWFUL_BAR_TWO_FACES_GLUE_WITH_AN_EXACT_ORIENTED_SEAM_FRAMING_DEFECT_EQUAL_TO_THE_LEFT_MINUS_RIGHT_SEAM_FRAME_VALUE',
  'MATCHED_INTERNAL_SEAM_FRAMINGS_CANCEL_EXACTLY_AND_THE_RESULTING_FRAMED_RELATIVE_VALUE_IS_INDEPENDENT_OF_THE_INHERITED_ASSOCIATIVE_BAR_TWO_DECOMPOSITION_WHEN_THE_EXTERNAL_FRAMING_IS_FIXED',
  'MATCHED_FRAMED_BAR_TWO_GLUING_INDUCES_ADDITIVE_INTEGER_TORSOR_TRANSLATION_COMPOSITION_WITH_ORIENTATION_REVERSAL_AS_INVERSE_AND_CLOSED_CYCLE_REDUCTION_TO_THE_INHERITED_TAU_2_RETURN',
]);
assert.equal(cert.quarantines.includes('integer torsor translation composition != transport 2-functor'), true);
assert.equal(cert.quarantines.includes('closed tau_2 return != geometric 2-holonomy'), true);
assert.equal(cert.quarantines.includes('bar-3 decomposition independence != arbitrary triangulation invariance'), true);
assert.equal(cert.formal_framed_degree_two_transport_composition_candidate_bearing, true);
assert.equal(cert.transport_two_functor_promoted, false);
assert.equal(cert.two_holonomy_promoted, false);
assert.equal(cert.connection_promoted, false);

console.log('Ash A15-R0 separately framed bar-2 gluing and seam-defect tests passed.');
