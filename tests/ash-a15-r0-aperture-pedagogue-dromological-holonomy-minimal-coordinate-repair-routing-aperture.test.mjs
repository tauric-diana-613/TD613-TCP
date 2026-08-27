import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalRepairSignature,
} from '../app/dome-world/previews/a15-r0/dromological-replay-repair-quotient-canonical-section.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
  dromologicalHolonomyCoarsenedReplayInverseDesignCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_SCHEMA,
  DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_PARENT_RECEIPT,
  derivePrimaryHolonomyRepairMask,
  deriveAlternateHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
  dromologicalRawHolonomyCoordinateApertureAtlas,
  dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate,
  compileDromologicalHolonomyMinimalCoordinateRepairRoutingProjection,
  rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';

assert.equal(
  DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_PARENT_RECEIPT,
  '4cb6cf23c8fbb0b596e75f0827e5a8c8436d08b5',
);
assert.equal(dromologicalHolonomyCoarsenedReplayInverseDesignCertificate().passed, true);

const classes = deriveDromologicalTerminalHolonomyClasses();
const policy = dromologicalHolonomyClassReplayPolicy();
assert.equal(classes.length, 4);
assert.equal(policy.length, 4);

// Independently enumerate every raw matrix coordinate and every unordered pair.
const rawCoordinates = [];
for (let row = 0; row < 3; row += 1) {
  for (let column = 0; column < 3; column += 1) rawCoordinates.push([row, column]);
}
assert.equal(rawCoordinates.length, 9);

const rawValue = (matrix, coordinate) => matrix[coordinate[0]][coordinate[1]];
const project = (matrix, coordinates) => coordinates.map(coordinate => rawValue(matrix, coordinate));
const distinctCount = values => new Set(values.map(value => JSON.stringify(value))).size;
const coordinateKey = coordinate => `${coordinate[0]},${coordinate[1]}`;
const apertureKey = aperture => aperture.map(coordinateKey).join('|');

const singletonCounts = rawCoordinates.map((coordinate) => distinctCount(
  classes.map(holonomyClass => [rawValue(holonomyClass.terminal_formal_holonomy, coordinate)]),
));
assert.deepEqual(singletonCounts, [2, 1, 2, 1, 2, 2, 1, 1, 1]);
assert.equal(Math.max(...singletonCounts), 2);
assert.equal(singletonCounts.some(count => count === 4), false);

const independentlyEnumeratedPairs = [];
for (let left = 0; left < rawCoordinates.length; left += 1) {
  for (let right = left + 1; right < rawCoordinates.length; right += 1) {
    const coordinates = [rawCoordinates[left], rawCoordinates[right]];
    const projections = classes.map(holonomyClass => project(
      holonomyClass.terminal_formal_holonomy,
      coordinates,
    ));
    independentlyEnumeratedPairs.push({
      coordinates,
      distinct: distinctCount(projections),
      projections,
    });
  }
}
assert.equal(independentlyEnumeratedPairs.length, 36);

const pairDistribution = independentlyEnumeratedPairs.reduce((counts, row) => {
  counts[row.distinct] = (counts[row.distinct] ?? 0) + 1;
  return counts;
}, {});
assert.deepEqual(pairDistribution, { 1: 10, 2: 21, 3: 3, 4: 2 });

const independentInjectivePairs = independentlyEnumeratedPairs
  .filter(row => row.distinct === 4)
  .map(row => row.coordinates);
assert.deepEqual(independentInjectivePairs, [
  [[0, 0], [1, 2]],
  [[1, 1], [1, 2]],
]);

// Implementation atlas must match the independently enumerated hostile exactly.
const apertureAtlas = dromologicalRawHolonomyCoordinateApertureAtlas();
assert.equal(apertureAtlas.raw_coordinate_count, 9);
assert.equal(apertureAtlas.singleton_aperture_count, 9);
assert.equal(apertureAtlas.unordered_pair_aperture_count, 36);
assert.equal(apertureAtlas.singleton_max_distinct_projected_classes, 2);
assert.deepEqual(apertureAtlas.pair_distinct_class_count_distribution, pairDistribution);
assert.equal(apertureAtlas.injective_pair_count, 2);
assert.deepEqual(apertureAtlas.injective_pairs, independentInjectivePairs);

for (const singleton of apertureAtlas.singletons) {
  assert.equal(singleton.injective_over_repair_classes, false);
}
const implementationPairMap = new Map(apertureAtlas.pairs.map(row => [row.aperture_key, row]));
for (const independent of independentlyEnumeratedPairs) {
  const implementation = implementationPairMap.get(apertureKey(independent.coordinates));
  assert.ok(implementation);
  assert.equal(implementation.distinct_projected_class_count, independent.distinct);
  assert.deepEqual(implementation.class_projections, independent.projections);
}

// Primary two-entry aperture derives exact binary repair masks from terminal formal holonomy.
const expectedPrimaryRaw = [
  [2, 0],
  [1, 0],
  [1, 1],
  [2, 1],
];
const expectedMasks = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const expectedReplayRows = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
];
assert.deepEqual(
  classes.map(row => project(row.terminal_formal_holonomy, [[0, 0], [1, 2]])),
  expectedPrimaryRaw,
);

const primaryMasks = classes.map(row => derivePrimaryHolonomyRepairMask(row.terminal_formal_holonomy));
const alternateMasks = classes.map(row => deriveAlternateHolonomyRepairMask(row.terminal_formal_holonomy));
assert.deepEqual(primaryMasks, expectedMasks);
assert.deepEqual(alternateMasks, expectedMasks);
assert.deepEqual(primaryMasks, policy.map(row => row.repair_signature));

// Closed-form decoder must recover the already-earned minimum-cost policy rather than copy it.
const decodedRows = primaryMasks.map(mask => decodeMinimumCostReplayFromRepairMask(mask));
assert.deepEqual(decodedRows, expectedReplayRows);
assert.deepEqual(decodedRows, policy.map(row => row.replay_row));
for (let index = 0; index < classes.length; index += 1) {
  const decoded = decodedRows[index];
  const mask = primaryMasks[index];
  assert.deepEqual(dromologicalRepairSignature(decoded), mask);
  assert.equal(decoded.filter(value => value !== 0).length, policy[index].l0_cost);
  assert.equal(decoded.reduce((sum, value) => sum + Math.abs(value), 0), policy[index].l1_cost);
  const actual = classifyReplayAgainstHolonomyClass(classes[index], decoded);
  assert.equal(actual.actual_class_robust_rank_rescue, true);
  assert.equal(actual.actual_class_robust_unimodular_rescue, true);
}
assert.throws(() => decodeMinimumCostReplayFromRepairMask([2, 0]), /binary vector/);
assert.throws(() => decodeMinimumCostReplayFromRepairMask([1]), /binary vector/);

// Negative controls: each selected raw entry alone loses one repair-routing bit.
const h00 = classes.map(row => row.terminal_formal_holonomy[0][0]);
const h12 = classes.map(row => row.terminal_formal_holonomy[1][2]);
const h01 = classes.map(row => row.terminal_formal_holonomy[0][1]);
assert.deepEqual(h00, [2, 1, 1, 2]);
assert.deepEqual(h12, [0, 0, 1, 1]);
assert.deepEqual(h01, [-1, -1, -1, -1]);
assert.equal(new Set(h00).size, 2);
assert.equal(new Set(h12).size, 2);
assert.equal(new Set(h01).size, 1);

// Exact repair routing must not be laundered into schedule reconstruction.
const mixed = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
assert.ok(mixed);
assert.deepEqual(mixed.schedule_ids, ['H-I-P', 'I-H-P']);
assert.deepEqual(derivePrimaryHolonomyRepairMask(mixed.terminal_formal_holonomy), [1, 1]);
assert.equal(mixed.schedule_ids.length, 2);

const certificate = dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate();
assert.equal(certificate.passed, true);
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_SCHEMA);
assert.equal(certificate.minimality_certificate.exact, true);
assert.equal(certificate.minimality_certificate.no_single_raw_coordinate_is_injective, true);
assert.equal(certificate.minimality_certificate.exactly_two_injective_raw_pairs, true);
assert.equal(certificate.minimality_certificate.raw_coordinate_cardinality_two_minimal, true);
assert.equal(certificate.routing_mask_certificate.primary_raw_projections_exact, true);
assert.equal(certificate.routing_mask_certificate.repair_masks_exact, true);
assert.equal(certificate.routing_mask_certificate.equivalent_apertures_same_mask, true);
assert.equal(certificate.routing_mask_certificate.masks_equal_inherited_repair_signatures, true);
assert.equal(certificate.decoder_certificate.exact, true);
assert.equal(certificate.negative_controls_certificate.exact, true);
assert.equal(
  certificate.primary_classification,
  'THE_TWO_ENTRY_RAW_TERMINAL_FORMAL_HOLONOMY_APERTURE_H00_H12_EXACTLY_RECOVERS_THE_EARNED_REPAIR_DEFECT_MASK_AND_THEREFORE_EXACTLY_ROUTES_THE_MINIMUM_COST_CLASS_ROBUST_UNIMODULAR_REPLAY_POLICY_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.minimality_classification,
  'NO_SINGLE_RAW_TERMINAL_FORMAL_HOLONOMY_MATRIX_ENTRY_SEPARATES_ALL_FOUR_EARNED_REPAIR_CLASSES_WHILE_EXACTLY_TWO_UNORDERED_RAW_TWO_ENTRY_APERTURES_DO_SO_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'A_RECEIVER_CAN_RETAIN_STRICTLY_LESS_THAN_THE_FULL_TERMINAL_FORMAL_HOLONOMY_MATRIX_YET_PRESERVE_EXACT_REPAIR_ROUTING_WHEN_THE_RETAINED_COORDINATE_APERTURE_IS_ALIGNED_WITH_THE_EARNED_DEFECT_PARTITION',
);

// AIA projection membrane: Ash gets truths only; Loom gets the bounded technical aperture atlas.
const ash = compileDromologicalHolonomyMinimalCoordinateRepairRoutingProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyMinimalCoordinateRepairRoutingProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.deepEqual(ash.payload.truths, [
  'THE_WHOLE_LAST_PATTERN_IS_NOT_NEEDED_TO_CHOOSE_THE_RIGHT_KIND_OF_EXTRA_CHECK',
  'TWO_SMALL_CLUES_ARE_ENOUGH_HERE',
  'ONE_SMALL_CLUE_IS_NOT_ENOUGH_HERE',
  'THE_TWO_CLUES_DO_NOT_TELL_US_EVERY_STEP_THAT_HAPPENED',
]);
for (const key of [
  'terminal_holonomy_matrices_exposed',
  'raw_coordinate_locations_exposed',
  'repair_masks_exposed',
  'defect_vectors_exposed',
  'replay_vectors_exposed',
  'decoder_formulas_exposed',
  'inverse_formulas_exposed',
  'latent_coordinates_exposed',
]) {
  assert.equal(ash.payload[key], false);
}
assert.deepEqual(loom.payload.minimality_certificate.injective_pairs, independentInjectivePairs);
assert.deepEqual(
  loom.payload.routing_mask_certificate.rows.map(row => row.primary_repair_mask),
  expectedMasks,
);
assert.deepEqual(
  loom.payload.decoder_certificate.rows.map(row => row.decoded_replay_row),
  expectedReplayRows,
);
assert.throws(
  () => compileDromologicalHolonomyMinimalCoordinateRepairRoutingProjection('UNDECLARED'),
  /undeclared AIA receiver/,
);

// Boundary hostiles.
assert.equal(rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach(loom).accepted, true);
for (const forbidden of [
  'arbitrary_encoding_minimality',
  'information_theoretic_minimality',
  'complete_schedule_reconstruction',
  'full_terminal_holonomy_reconstruction',
  'universal_holonomy_coordinate_theorem',
  'universal_optimal_sensor_theorem',
  'physical_holonomy',
  'physical_quasicrystal',
  'continuum_tomography',
  'operational_sensor_control',
  'operational_inverse_route',
  'semantic_equivalence',
]) {
  const bad = {
    ...loom,
    claim_ceiling: {
      ...loom.claim_ceiling,
      [forbidden]: true,
    },
  };
  const rejected = rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach(bad);
  assert.equal(rejected.accepted, false, `expected overreach rejection for ${forbidden}`);
  assert.equal(rejected.overclaim_attempted, true);
}
assert.equal(rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach({
  ...loom,
  authority: { ...loom.authority, production: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach({
  ...loom,
  runtime_binding: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach({
  ...ash,
  payload: { ...ash.payload, raw_coordinate_locations_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy minimal-coordinate repair-routing aperture hostile tests passed.');
