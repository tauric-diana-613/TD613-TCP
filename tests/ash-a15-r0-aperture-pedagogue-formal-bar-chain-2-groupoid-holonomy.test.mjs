import assert from 'node:assert/strict';
import {
  normalizeFormalBar1Chain,
  addFormalBar1Chains,
  scaleFormalBar1Chain,
  sameFormalBar1Chain,
  formalBar2Cell,
  formalBar2CellFromSource,
  identityFormalBar2Cell,
  inverseFormalBar2Cell,
  verticalComposeFormalBar2Cells,
  horizontalComposeFormalBar2Cells,
  formalBar2Transport,
  formalBar2Holonomy,
  formalBarChainTwoGroupoidHolonomyCertificate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-formal-bar-chain-2-groupoid-holonomy.js';
import {
  T_COORDINATE,
  Q_COORDINATE,
  relationBarCycle,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  scaleBar2Chain,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  finiteBoundaryFraming,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-separately-framed-bar-2-gluing-seam-defect.js';

const cert = formalBarChainTwoGroupoidHolonomyCertificate();
assert.equal(cert.status, 'FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_CERTIFICATE_PASSED');
assert.equal(cert.passed, true);

// Repair 001: the word "2-groupoid" requires the formal C1 1-cells themselves
// to carry the declared additive identity, inverse, and associativity laws.
// This is chain-group authority only; it creates no inverse operational route.
const u1 = normalizeFormalBar1Chain([
  { coordinate: T_COORDINATE, coefficient: 2 },
  { coordinate: Q_COORDINATE, coefficient: -1 },
]);
const v1 = normalizeFormalBar1Chain([
  { coordinate: T_COORDINATE, coefficient: -3 },
  { coordinate: Q_COORDINATE, coefficient: 4 },
]);
const w1 = normalizeFormalBar1Chain([
  { coordinate: T_COORDINATE, coefficient: 1 },
  { coordinate: Q_COORDINATE, coefficient: 2 },
]);
const zero1 = normalizeFormalBar1Chain([]);
assert.equal(u1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(v1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(w1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(zero1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');

const minusU1 = scaleFormalBar1Chain(u1.chain, -1);
assert.equal(minusU1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
const uPlusMinusU = addFormalBar1Chains(u1.chain, minusU1.chain);
const minusUPlusU = addFormalBar1Chains(minusU1.chain, u1.chain);
assert.equal(uPlusMinusU.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(minusUPlusU.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(uPlusMinusU.is_zero, true);
assert.equal(minusUPlusU.is_zero, true);
assert.equal(sameFormalBar1Chain(uPlusMinusU.chain, zero1.chain), true);
assert.equal(sameFormalBar1Chain(minusUPlusU.chain, zero1.chain), true);

const leftIdentity1 = addFormalBar1Chains(zero1.chain, u1.chain);
const rightIdentity1 = addFormalBar1Chains(u1.chain, zero1.chain);
assert.equal(sameFormalBar1Chain(leftIdentity1.chain, u1.chain), true);
assert.equal(sameFormalBar1Chain(rightIdentity1.chain, u1.chain), true);

const uv1 = addFormalBar1Chains(u1.chain, v1.chain);
const lhsAssoc1 = addFormalBar1Chains(uv1.chain, w1.chain);
const vw1 = addFormalBar1Chains(v1.chain, w1.chain);
const rhsAssoc1 = addFormalBar1Chains(u1.chain, vw1.chain);
assert.equal(lhsAssoc1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(rhsAssoc1.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
assert.equal(sameFormalBar1Chain(lhsAssoc1.chain, rhsAssoc1.chain), true);

// Source/target typing is mathematical authority. An open basis 2-cell has a
// lawful transport value but is forbidden from borrowing the holonomy name.
assert.equal(cert.source_target_typing.passed, true);
assert.equal(cert.source_target_typing.open.status, 'FORMAL_BAR_TWO_CELL_DERIVED');
assert.equal(cert.source_target_typing.open.closed, false);
assert.equal(cert.source_target_typing.transport.status, 'FORMAL_BAR_TWO_TRANSPORT_DERIVED');
assert.equal(
  cert.source_target_typing.holonomy_rejected.status,
  'FORMAL_BAR_TWO_HOLONOMY_REJECTS_OPEN_TWO_CELL',
);
assert.equal(
  cert.source_target_typing.counterfeit.status,
  'FORMAL_BAR_TWO_CELL_REJECTS_SOURCE_TARGET_BOUNDARY_MISMATCH',
);

// Vertical composition requires exact middle 1-cell equality. Numeric
// transport additivity cannot rescue an ill-typed paste.
assert.equal(cert.vertical_composition.passed, true);
assert.equal(
  cert.vertical_composition.rejected.status,
  'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_REJECTS_MIDDLE_ONE_CELL_MISMATCH',
);
assert.equal(cert.vertical_composition.round_trip.chain.length, 0);
assert.equal(cert.vertical_composition.inverse.status, 'FORMAL_BAR_TWO_CELL_DERIVED');

// Horizontal composition is the declared additive finite substitute, and its
// associativity/unit laws stay in linearized chain jurisdiction.
assert.equal(cert.horizontal_composition.passed, true);
assert.equal(cert.vertical_associativity.passed, true);

// The nontrivial 2x2 fixture must satisfy strict interchange at chain,
// source/target, and transported-integer levels. A fake grid must reject.
assert.equal(cert.interchange.passed, true);
assert.equal(
  cert.interchange.left_transport_value,
  cert.interchange.right_transport_value,
);
assert.equal(
  cert.interchange.fake_grid_rejection.status,
  'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_REJECTS_MIDDLE_ONE_CELL_MISMATCH',
);

// Bar-3 representative shifts and paired cohomological re-zeroing preserve
// the formal 2-transport value exactly.
assert.equal(cert.representative_and_rezeroing_descent.passed, true);
assert.equal(
  cert.representative_and_rezeroing_descent.original_transport.value,
  cert.representative_and_rezeroing_descent.shifted_transport.value,
);
assert.equal(cert.representative_and_rezeroing_descent.paired_rezeroing.delta, 0);

// Strict B^2 Z representation laws preserve both formal compositions,
// identities, and inverses.
assert.equal(cert.strict_two_transport_representation.passed, true);
assert.equal(
  cert.strict_two_transport_representation.vertical.value,
  cert.strict_two_transport_representation.first.value
    + cert.strict_two_transport_representation.second.value,
);
assert.equal(
  cert.strict_two_transport_representation.horizontal.value,
  cert.strict_two_transport_representation.first.value
    + cert.strict_two_transport_representation.horizontal_other.value,
);
assert.equal(cert.strict_two_transport_representation.identity.value, 0);
assert.equal(
  cert.strict_two_transport_representation.inverse.value,
  -cert.strict_two_transport_representation.first.value,
);

// The inherited relation cycle becomes a closed formal 2-endomorphism and
// earns the internal formal bar-complex 2-holonomy name tau_2.
assert.equal(cert.closed_formal_two_holonomy.passed, true);
assert.equal(
  cert.closed_formal_two_holonomy.holonomy.status,
  'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED',
);
assert.equal(cert.closed_formal_two_holonomy.holonomy.value, 2);
assert.equal(cert.closed_formal_two_holonomy.negative_holonomy.value, -2);
assert.equal(cert.closed_formal_two_holonomy.zero_holonomy.value, 0);
for (const probe of cert.closed_formal_two_holonomy.finite_integer_probes) {
  assert.equal(probe.value, probe.expected);
  assert.equal(probe.passed, true);
}
assert.equal(
  cert.closed_formal_two_holonomy.shifted_holonomy.value,
  cert.closed_formal_two_holonomy.holonomy.value,
);
assert.equal(cert.closed_formal_two_holonomy.paired_rezeroing.delta, 0);

// Direct reconstruction hostile: [z] must type as 0=>0 and act as tau_2.
const z = relationBarCycle();
assert.equal(z.passed, true);
const zCell = formalBar2Cell({ chain: z.chain, source: [], target: [] });
assert.equal(zCell.status, 'FORMAL_BAR_TWO_CELL_DERIVED');
assert.equal(zCell.closed, true);
const zHol = formalBar2Holonomy(zCell, finiteBoundaryFraming([]));
assert.equal(zHol.status, 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED');
assert.equal(zHol.translation.apply(17), 19);

const minusZ = scaleBar2Chain(z.chain, -1);
const minusZCell = formalBar2Cell({ chain: minusZ.chain, source: [], target: [] });
const minusZHol = formalBar2Holonomy(minusZCell, finiteBoundaryFraming([]));
assert.equal(minusZHol.translation.apply(zHol.translation.apply(17)), 17);

// Explicit composition fixture outside the certificate.
const source = normalizeFormalBar1Chain([
  { coordinate: T_COORDINATE, coefficient: 1 },
  { coordinate: Q_COORDINATE, coefficient: 1 },
]);
assert.equal(source.status, 'FORMAL_BAR_1_CHAIN_NORMALIZED');
const first = formalBar2CellFromSource([
  { left: T_COORDINATE, right: Q_COORDINATE, coefficient: 1 },
], source.chain);
assert.equal(first.status, 'FORMAL_BAR_TWO_CELL_DERIVED');
const second = formalBar2CellFromSource([
  { left: Q_COORDINATE, right: T_COORDINATE, coefficient: 1 },
], first.target);
assert.equal(second.status, 'FORMAL_BAR_TWO_CELL_DERIVED');
const vertical = verticalComposeFormalBar2Cells(first, second);
assert.equal(vertical.status, 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED');

const otherSource = normalizeFormalBar1Chain([
  { coordinate: T_COORDINATE, coefficient: 2 },
]);
const other = formalBar2CellFromSource([
  { left: T_COORDINATE, right: T_COORDINATE, coefficient: 1 },
], otherSource.chain);
const horizontal = horizontalComposeFormalBar2Cells(first, other);
assert.equal(horizontal.status, 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED');

const lambda = finiteBoundaryFraming([]);
const fFirst = formalBar2Transport(first, lambda);
const fSecond = formalBar2Transport(second, lambda);
const fVertical = formalBar2Transport({
  status: 'FORMAL_BAR_TWO_CELL_DERIVED',
  chain: vertical.chain,
  source: vertical.source,
  target: vertical.target,
  boundary: vertical.boundary,
  closed: vertical.closed,
  jurisdiction: vertical.jurisdiction,
  operational_path_authority: false,
}, lambda);
assert.equal(fVertical.value, fFirst.value + fSecond.value);

const id = identityFormalBar2Cell(first.source);
const inv = inverseFormalBar2Cell(first);
assert.equal(formalBar2Transport(id, lambda).value, 0);
assert.equal(formalBar2Transport(inv, lambda).value, -fFirst.value);

// Invalid normalized-chain jurisdiction cannot be decorated into existence.
assert.equal(cert.invalid_jurisdiction_abstention.passed, true);

assert.deepEqual(cert.canonical_classifications, [
  'THE_DECLARED_NORMALIZED_INTEGER_BAR_CHAIN_COMPLEX_IN_DEGREES_ONE_AND_TWO_WITH_BAR_THREE_BOUNDARY_REPRESENTATIVE_IDENTIFICATION_SUPPORTS_A_ONE_OBJECT_STRICT_FORMAL_TWO_GROUPOID_WITH_EXACT_SOURCE_TARGET_TYPING_VERTICAL_COMPOSITION_HORIZONTAL_ADDITIVE_COMPOSITION_AND_INTERCHANGE',
  'THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_DESCENDS_TO_A_STRICT_FORMAL_TWO_TRANSPORT_REPRESENTATION_FROM_THE_BAR_CHAIN_TWO_GROUPOID_TO_B_SQUARED_Z_AND_PRESERVES_VERTICAL_AND_HORIZONTAL_COMPOSITION_IDENTITIES_AND_INVERSES',
  'CLOSED_FORMAL_BAR_TWO_ENDOMORPHISMS_ADMIT_A_WELL_DEFINED_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_TRANSLATION_REPRESENTATION_WITH_THE_INHERITED_RELATION_CLASS_[z]_MAPPING_TO_TAU_2',
]);

assert.equal(cert.quarantines.includes('formal bar-chain 2-groupoid != operational T/Q path 2-groupoid'), true);
assert.equal(cert.quarantines.includes('formal bar-complex 2-holonomy != geometric / physical / Berry / gerbe 2-holonomy'), true);
assert.equal(cert.formal_bar_complex_two_holonomy_representation_promoted, true);
assert.equal(cert.geometric_two_holonomy_promoted, false);
assert.equal(cert.connection_promoted, false);
assert.equal(cert.operational_path_two_groupoid_promoted, false);
assert.equal(cert.proto_loom_or_a16_promoted, false);

console.log('Ash A15-R0 formal bar-chain 2-groupoid holonomy tests passed.');
