import assert from 'node:assert/strict';

import {
  COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_GATE_ISSUE,
  COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_RECEIVING_PARENT,
  COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCIENTIFIC_PARENT,
  cocycleExtensionProduct,
  extensionIdentity,
  firstMomentRouteSection,
  normalizedOneCoboundary,
  projectExtension,
  pullbackExtensionProduct,
  runCocycleExtensionSplittingObstructionAssay,
  sectionLift,
  sectionMultiplicativityDefect,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-cocycle-extension-splitting-obstruction.js';
import {
  Q_COORDINATE,
  T_COORDINATE,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';

assert.equal(
  COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_RECEIVING_PARENT,
  'e9228f0f2225bcc5944f413197ce98bb52d45b39',
  'The extension chamber must remain pinned to the corrected #736 receiving head.',
);
assert.equal(
  COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_SCIENTIFIC_PARENT,
  'f0f8239d14fbce6ca1cc72c8588a61a8ec16149a',
  'The extension theorem must inherit the exact #735 scientific receipt.',
);
assert.equal(COCYCLE_EXTENSION_SPLITTING_OBSTRUCTION_GATE_ISSUE, 737);

const identity = extensionIdentity();
assert.deepEqual(identity, { fiber: 0, base: { t: 0, E: 0, O: 0 } });
assert.equal(Object.is(identity.fiber, 0), true, 'Extension identity must emit canonical +0.');

const zeroT = sectionLift(T_COORDINATE);
const zeroQ = sectionLift(Q_COORDINATE);
const tqProduct = cocycleExtensionProduct(zeroT, zeroQ);
assert.equal(tqProduct.fiber, 1, 'The zero-section product on T,Q must carry the exact ω(T,Q)=1 defect.');
assert.deepEqual(projectExtension(tqProduct).base, tqProduct.base);
assert.equal(sectionMultiplicativityDefect(() => 0, T_COORDINATE, Q_COORDINATE), 1);

const f = (x) => (2 * x.t) + x.E - (3 * x.O);
const dfTQ = normalizedOneCoboundary(f, T_COORDINATE, Q_COORDINATE);
assert.equal(
  sectionMultiplicativityDefect(f, T_COORDINATE, Q_COORDINATE),
  dfTQ + 1,
  'General section defect must equal df+ω under the frozen #735 sign convention.',
);

const pT = firstMomentRouteSection(['T']);
const pQ = firstMomentRouteSection(['Q']);
const pTQ = firstMomentRouteSection(['T', 'Q']);
const pProduct = pullbackExtensionProduct(pT, pQ);
assert.equal(pProduct.fiber, 1);
assert.deepEqual(pProduct.word, ['T', 'Q']);
assert.deepEqual(pProduct, {
  status: 'FREE_ROUTE_PULLBACK_COCYCLE_EXTENSION_PRODUCT_DERIVED',
  fiber: pTQ.fiber,
  word: pTQ.word,
});

const minusPT = firstMomentRouteSection(['T'], -1);
const minusPQ = firstMomentRouteSection(['Q'], -1);
const minusPTQ = firstMomentRouteSection(['T', 'Q'], -1);
const minusProduct = pullbackExtensionProduct(minusPT, minusPQ);
assert.equal(minusPTQ.fiber, -1);
assert.equal(minusProduct.fiber, 1);
assert.notEqual(minusPTQ.fiber, minusProduct.fiber, 'The wrong-sign -P section must fail on a nonzero-ω pair.');

const assay = runCocycleExtensionSplittingObstructionAssay();
assert.equal(assay.passed, true, JSON.stringify(assay, null, 2));
assert.equal(
  assay.canonical_classification,
  'DECLARED_INTEGER_COCYCLE_EXTENSION_MONOID_HAS_NONSPLITTING_PROJECTION_TO_B_WHILE_FREE_ROUTE_PULLBACK_SPLITS_BY_FIRST_MOMENT_P',
);
assert.equal(
  assay.secondary_classification,
  'SAME_QUOTIENT_BASE_CAN_CARRY_DISTINCT_COCYCLE_EXTENSION_LIFTS_WITHOUT_PROMOTING_EXTENSION_FIBER_TO_COMPLETE_ROUTE_PROVENANCE',
);

assert.equal(assay.symbolic_associativity.passed, true);
assert.equal(assay.concrete_associativity.passed, true);
assert.equal(assay.identity.passed, true);
assert.equal(assay.projection.passed, true);
assert.equal(assay.canonical_section_defect.defect_T_Q, 1);
assert.equal(assay.general_section_criterion.passed, true);

assert.equal(assay.downstairs_non_splitting.cycle_boundary_zero, true);
assert.equal(assay.downstairs_non_splitting.omega_pairing, 2);
assert.equal(assay.downstairs_non_splitting.negative_omega_pairing, -2);
assert.equal(
  assay.downstairs_non_splitting.conclusion,
  'NO_GLOBAL_MONOID_HOMOMORPHIC_SECTION_OF_p_EXISTS_ON_DECLARED_E_OMEGA_OVER_B',
);

assert.equal(assay.free_route_splitting.passed, true);
assert.equal(assay.wrong_sign_hostile.passed, true);

assert.deepEqual(assay.route_collision_fiber.common_base, { t: 2, E: 1, O: 0 });
assert.equal(assay.route_collision_fiber.left_lift.fiber, 2, 'Canonical TTQ lift must carry fiber 2.');
assert.equal(assay.route_collision_fiber.right_lift.fiber, 0, 'Canonical QTT lift must carry fiber 0.');
assert.equal(
  Object.is(assay.route_collision_fiber.right_lift.fiber, 0),
  true,
  'The zero QTT fiber must be canonical JavaScript +0.',
);
assert.deepEqual(
  assay.route_collision_fiber.left_lift.base,
  assay.route_collision_fiber.right_lift.base,
  'TTQ and QTT must retain the same #729 quotient base while their extension lifts differ.',
);

assert.equal(assay.swapped_cocycle_hostile.passed, true);
assert.equal(assay.swapped_cocycle_hostile.swapped_lift.fiber, 0);
assert.equal(assay.swapped_cocycle_hostile.witnessed_first_moment_P, 1);

assert.equal(assay.parity_fragile_hostile.passed, true);
assert.equal(assay.parity_fragile_hostile.defect_T_T_Q, 1);
assert.notDeepEqual(
  assay.parity_fragile_hostile.left_bracketing,
  assay.parity_fragile_hostile.right_bracketing,
  'The tE hostile product must expose nonassociativity rather than receiving a monoid promotion.',
);

assert.equal(assay.receipt_externality.passed, true);
assert.deepEqual(assay.receipt_externality.product_R1, assay.receipt_externality.product_R1_DUP);

assert.ok(assay.claim_ceiling.includes('NO_GENERAL_MONOID_EXTENSION_CLASSIFICATION'));
assert.ok(assay.claim_ceiling.includes('NO_OPERATIONAL_NONIDENTITY_CLOSED_LOOP'));
assert.ok(assay.claim_ceiling.includes('EXTENSION_FIBER_NOT_COMPLETE_ROUTE_LEDGER'));
assert.ok(assay.claim_ceiling.includes('NO_HIGHER_MOMENT_COMPLETENESS_OR_ASYMPTOTIC_HIERARCHY'));

console.log('A15-R0 cocycle-extension splitting obstruction tests passed.');
