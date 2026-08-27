import assert from 'node:assert/strict';
import {
  sameBaseComparisonArrow,
  invertSameBaseComparisonArrow,
  composeSameBaseComparisonArrows,
  generatedReturnTranslationSubgroupProfile,
  sectionRezeroedComparisonReturn,
  sameBaseComparisonRepresentationCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-same-base-comparison-representation.js';

const cert = sameBaseComparisonRepresentationCertificate();
assert.equal(cert.passed, true);
assert.equal(
  cert.status,
  'SAME_BASE_COMPARISON_REPRESENTATION_AND_SECTION_REZEROING_INVARIANCE_CERTIFIED',
);

// Foundational nonidentity return survives as a represented comparison arrow.
const ttq = Object.freeze(['T', 'T', 'Q']);
const qtt = Object.freeze(['Q', 'T', 'T']);
const wound = sameBaseComparisonArrow(ttq, qtt);
assert.equal(wound.status, 'FORMAL_SAME_BASE_COMPARISON_ARROW_DERIVED');
assert.deepEqual(wound.base, { t: 2, E: 1, O: 0 });
assert.equal(wound.translation, 2);
assert.equal(wound.kernel_arrow, false);
assert.equal(wound.parent_return_consistent, true);

const inverse = invertSameBaseComparisonArrow(wound);
assert.equal(inverse.translation, -2);
assert.deepEqual(inverse.source, ttq);
assert.deepEqual(inverse.target, qtt);

// Formal comparison composition is functorial but remains formal comparison structure only.
const u = Object.freeze(['T', 'T', 'Q', 'Q']);
const v = Object.freeze(['Q', 'T', 'T', 'Q']);
const w = Object.freeze(['Q', 'Q', 'T', 'T']);
const uv = sameBaseComparisonArrow(u, v);
const vw = sameBaseComparisonArrow(v, w);
const uw = composeSameBaseComparisonArrows(uv, vw);
assert.equal(uv.translation, 2);
assert.equal(vw.translation, 2);
assert.equal(uw.status, 'FORMAL_SAME_BASE_COMPARISON_COMPOSITION_DERIVED');
assert.equal(uw.functorial, true);
assert.equal(uw.translation_sum, 4);
assert.equal(uw.composed.translation, 4);

// Noncomposable formal arrows must abstain rather than being coerced.
const badComposition = composeSameBaseComparisonArrows(uv, uv);
assert.equal(badComposition.status, 'SAME_BASE_COMPARISON_COMPOSITION_ABSTAINS_NONCOMPOSABLE');

// Different bases cannot share a comparison arrow.
assert.equal(
  sameBaseComparisonArrow(Object.freeze(['T']), Object.freeze(['Q'])).status,
  'SAME_BASE_COMPARISON_ARROW_ABSTAINS_DIFFERENT_BASE',
);

// Exact kernel hostile: distinct route spellings, same base, same first moment.
const samePLeft = Object.freeze(['T', 'Q', 'T', 'Q', 'T']);
const samePRight = Object.freeze(['Q', 'T', 'T', 'T', 'Q']);
const kernelArrow = sameBaseComparisonArrow(samePLeft, samePRight);
assert.notDeepEqual(samePLeft, samePRight);
assert.equal(kernelArrow.P_source, 3);
assert.equal(kernelArrow.P_target, 3);
assert.equal(kernelArrow.translation, 0);
assert.equal(kernelArrow.kernel_arrow, true);

// Literal represented differences are finite; only their generated subgroup can be 2Z.
const variable = generatedReturnTranslationSubgroupProfile({ t: 2, E: 1, O: 7 });
assert.equal(variable.passed, true);
assert.equal(variable.literal_return_difference_set, 'FINITE_SUBSET_OF_2Z');
assert.equal(variable.generated_subgroup, '2Z');
assert.equal(variable.generated_subgroup_step, 2);
assert.equal(variable.generator_witness.translation, 2);

const variableOdd = generatedReturnTranslationSubgroupProfile({ t: 3, E: 0, O: 1 });
assert.equal(variableOdd.passed, true);
assert.equal(variableOdd.generated_subgroup, '2Z');
assert.equal(variableOdd.generator_witness.translation, 2);

const noFreedom = generatedReturnTranslationSubgroupProfile({ t: 1, E: 17, O: 23 });
assert.equal(noFreedom.passed, true);
assert.equal(noFreedom.generated_subgroup, '{0}');
assert.equal(noFreedom.generated_subgroup_step, 0);

const noFreedomOddOnly = generatedReturnTranslationSubgroupProfile({ t: 2, E: 0, O: 9 });
assert.equal(noFreedomOddOnly.passed, true);
assert.equal(noFreedomOddOnly.generated_subgroup, '{0}');

// Lawful #734-style base section re-zeroing cancels exactly on same-base returns.
const phi = (base) => (base.t * base.t) + base.E + base.O;
const rezeroed = sectionRezeroedComparisonReturn(ttq, qtt, phi);
assert.equal(rezeroed.status, 'LAWFUL_SECTION_REZEROED_COMPARISON_RETURN_DERIVED');
assert.equal(rezeroed.original_translation, 2);
assert.equal(rezeroed.transformed_translation, 2);
assert.equal(rezeroed.invariant, true);

// Non-normalized section is outside the declared inherited section domain.
const nonnormalized = () => 1;
assert.equal(
  sectionRezeroedComparisonReturn(ttq, qtt, nonnormalized).status,
  'SECTION_REZEROED_COMPARISON_ABSTAINS_NONNORMALIZED_SECTION',
);

assert.equal(cert.route_dependent_fake_section_hostile.passed, true);
assert.equal(
  cert.route_dependent_fake_section_hostile.classification,
  'ROUTE_DEPENDENT_REZEROING_IS_OUTSIDE_#734_BASE_SECTION_JURISDICTION',
);

assert.deepEqual(cert.canonical_classifications, [
  'FORMAL_SAME_BASE_ROUTE_PAIR_GROUPOID_ADMITS_A_RETURN_TRANSLATION_REPRESENTATION_INTO_AUT_Z',
  'REPRESENTATION_KERNEL_IS_EXACTLY_EQUAL_FIRST_MOMENT_P_AND_IS_NONFAITHFUL_ON_WITNESSED_ROUTE_FIBERS',
  'GENERATED_RETURN_TRANSLATION_SUBGROUP_IS_TRIVIAL_WITHOUT_BLOCK_FREEDOM_AND_2Z_WITH_BLOCK_FREEDOM',
  'SAME_BASE_RETURN_REPRESENTATION_IS_EXACTLY_INVARIANT_UNDER_LAWFUL_NORMALIZED_BASE_SECTION_REZEROING',
]);

assert.deepEqual(cert.quarantines, [
  'FORMAL_COMPARISON_GROUPOID_NOT_OPERATIONAL_TQ_PATH_GROUPOID',
  'COMPARISON_REPRESENTATION_NOT_HOLONOMY_REPRESENTATION',
  'SECTION_REZEROING_INVARIANCE_NOT_CONNECTION_GAUGE_INVARIANCE',
  'GENERATED_RETURN_SUBGROUP_NOT_HOLONOMY_GROUP',
]);

console.log('Ash A15-R0 #763 same-base comparison representation tests passed.');
