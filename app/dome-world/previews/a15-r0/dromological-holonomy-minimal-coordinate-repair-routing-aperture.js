import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalRepairSignature,
} from './dromological-replay-repair-quotient-canonical-section.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
  dromologicalHolonomyCoarsenedReplayInverseDesignCertificate,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';

export const DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_SCHEMA =
  'td613.dome-world.dromological-holonomy-minimal-coordinate-repair-routing-aperture/v0.1';
export const DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_PARENT_RECEIPT =
  '4cb6cf23c8fbb0b596e75f0827e5a8c8436d08b5';

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

const RAW_COORDINATES = Object.freeze([
  Object.freeze([0, 0]),
  Object.freeze([0, 1]),
  Object.freeze([0, 2]),
  Object.freeze([1, 0]),
  Object.freeze([1, 1]),
  Object.freeze([1, 2]),
  Object.freeze([2, 0]),
  Object.freeze([2, 1]),
  Object.freeze([2, 2]),
]);

const PRIMARY_APERTURE = Object.freeze([
  Object.freeze([0, 0]),
  Object.freeze([1, 2]),
]);
const ALTERNATE_APERTURE = Object.freeze([
  Object.freeze([1, 1]),
  Object.freeze([1, 2]),
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function coordinateKey(coordinate) {
  return `${coordinate[0]},${coordinate[1]}`;
}

function apertureKey(aperture) {
  return aperture.map(coordinateKey).join('|');
}

function coordinateValue(matrix, coordinate) {
  return matrix[coordinate[0]][coordinate[1]];
}

function projectMatrix(matrix, aperture) {
  return freeze(aperture.map(coordinate => coordinateValue(matrix, coordinate)));
}

function distinctProjectionCount(projectedRows) {
  return new Set(projectedRows.map(row => JSON.stringify(row))).size;
}

function unorderedCoordinatePairs() {
  const pairs = [];
  for (let left = 0; left < RAW_COORDINATES.length; left += 1) {
    for (let right = left + 1; right < RAW_COORDINATES.length; right += 1) {
      pairs.push(freeze([RAW_COORDINATES[left], RAW_COORDINATES[right]]));
    }
  }
  return freeze(pairs);
}

function l0(vector) {
  return vector.filter(value => value !== 0).length;
}

function l1(vector) {
  return vector.reduce((sum, value) => sum + Math.abs(value), 0);
}

function assertBinaryMask(mask) {
  if (!Array.isArray(mask) || mask.length !== 2 || !mask.every(value => value === 0 || value === 1)) {
    throw new Error('repair-routing mask must be a binary vector of length two');
  }
}

export function derivePrimaryHolonomyRepairMask(matrix) {
  const mask = [2 - matrix[0][0], matrix[1][2]];
  assertBinaryMask(mask);
  return freeze(mask);
}

export function deriveAlternateHolonomyRepairMask(matrix) {
  const mask = [matrix[1][1] - 1, matrix[1][2]];
  assertBinaryMask(mask);
  return freeze(mask);
}

export function decodeMinimumCostReplayFromRepairMask(mask) {
  assertBinaryMask(mask);
  const [dH, dI] = mask;
  return freeze([
    dH * dI,
    dH * (1 - dI),
    (1 - dH) * dI,
  ]);
}

export function dromologicalRawHolonomyCoordinateApertureAtlas() {
  const parent = dromologicalHolonomyCoarsenedReplayInverseDesignCertificate();
  if (!parent.passed) throw new Error('cannot derive coordinate aperture atlas from uncertified #818 parent');
  const classes = deriveDromologicalTerminalHolonomyClasses();

  const singletons = freeze(RAW_COORDINATES.map((coordinate) => {
    const projections = freeze(classes.map(row => freeze([
      coordinateValue(row.terminal_formal_holonomy, coordinate),
    ])));
    const distinct = distinctProjectionCount(projections);
    return freeze({
      coordinates: freeze([coordinate]),
      aperture_key: coordinateKey(coordinate),
      class_projections: projections,
      distinct_projected_class_count: distinct,
      injective_over_repair_classes: distinct === classes.length,
    });
  }));

  const pairs = freeze(unorderedCoordinatePairs().map((coordinates) => {
    const projections = freeze(classes.map(row => projectMatrix(
      row.terminal_formal_holonomy,
      coordinates,
    )));
    const distinct = distinctProjectionCount(projections);
    return freeze({
      coordinates,
      aperture_key: apertureKey(coordinates),
      class_projections: projections,
      distinct_projected_class_count: distinct,
      injective_over_repair_classes: distinct === classes.length,
    });
  }));

  const injectivePairs = freeze(pairs
    .filter(row => row.injective_over_repair_classes)
    .map(row => row.coordinates));
  const distribution = {};
  pairs.forEach((row) => {
    const key = String(row.distinct_projected_class_count);
    distribution[key] = (distribution[key] ?? 0) + 1;
  });

  return freeze({
    raw_coordinate_count: RAW_COORDINATES.length,
    singleton_aperture_count: singletons.length,
    unordered_pair_aperture_count: pairs.length,
    singletons,
    pairs,
    singleton_max_distinct_projected_classes: Math.max(
      ...singletons.map(row => row.distinct_projected_class_count),
    ),
    pair_distinct_class_count_distribution: freeze(distribution),
    injective_pair_count: injectivePairs.length,
    injective_pairs: injectivePairs,
  });
}

function minimalityCertificate() {
  const atlas = dromologicalRawHolonomyCoordinateApertureAtlas();
  const expectedDistribution = freeze({ 1: 10, 2: 21, 3: 3, 4: 2 });
  const expectedInjectivePairs = freeze([
    PRIMARY_APERTURE,
    ALTERNATE_APERTURE,
  ]);
  const noSingletonInjective = atlas.singletons.every(row => !row.injective_over_repair_classes);
  const exactPairs = same(atlas.injective_pairs, expectedInjectivePairs);
  const exactDistribution = same(atlas.pair_distinct_class_count_distribution, expectedDistribution);

  return freeze({
    atlas,
    injective_pairs: atlas.injective_pairs,
    expected_pair_distinct_class_count_distribution: expectedDistribution,
    expected_injective_pairs: expectedInjectivePairs,
    no_single_raw_coordinate_is_injective: noSingletonInjective,
    singleton_max_distinct_projected_classes: atlas.singleton_max_distinct_projected_classes,
    exactly_two_injective_raw_pairs: atlas.injective_pair_count === 2,
    injective_pairs_match_expected: exactPairs,
    pair_distribution_exact: exactDistribution,
    raw_coordinate_cardinality_two_minimal: noSingletonInjective && atlas.injective_pair_count > 0,
    exact: atlas.raw_coordinate_count === 9
      && atlas.singleton_aperture_count === 9
      && atlas.unordered_pair_aperture_count === 36
      && atlas.singleton_max_distinct_projected_classes === 2
      && noSingletonInjective
      && atlas.injective_pair_count === 2
      && exactPairs
      && exactDistribution,
  });
}

function routingMaskCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const inheritedPolicy = dromologicalHolonomyClassReplayPolicy();

  const rows = freeze(classes.map((holonomyClass, index) => {
    const matrix = holonomyClass.terminal_formal_holonomy;
    const primaryRaw = projectMatrix(matrix, PRIMARY_APERTURE);
    const alternateRaw = projectMatrix(matrix, ALTERNATE_APERTURE);
    const primaryMask = derivePrimaryHolonomyRepairMask(matrix);
    const alternateMask = deriveAlternateHolonomyRepairMask(matrix);
    const inheritedSignature = inheritedPolicy[index].repair_signature;
    return freeze({
      holonomy_class_id: holonomyClass.holonomy_class_id,
      schedule_ids: holonomyClass.schedule_ids,
      primary_raw_projection: primaryRaw,
      alternate_raw_projection: alternateRaw,
      primary_repair_mask: primaryMask,
      alternate_repair_mask: alternateMask,
      inherited_repair_signature: inheritedSignature,
      primary_equals_alternate_mask: same(primaryMask, alternateMask),
      mask_equals_inherited_repair_signature: same(primaryMask, inheritedSignature),
    });
  }));

  const expectedPrimaryRaw = freeze([
    freeze([2, 0]),
    freeze([1, 0]),
    freeze([1, 1]),
    freeze([2, 1]),
  ]);
  const expectedMasks = freeze([
    freeze([0, 0]),
    freeze([1, 0]),
    freeze([1, 1]),
    freeze([0, 1]),
  ]);

  return freeze({
    primary_aperture: PRIMARY_APERTURE,
    alternate_aperture: ALTERNATE_APERTURE,
    rows,
    expected_primary_raw_projections: expectedPrimaryRaw,
    expected_repair_masks: expectedMasks,
    primary_raw_projections_exact: same(
      rows.map(row => row.primary_raw_projection),
      expectedPrimaryRaw,
    ),
    repair_masks_exact: same(rows.map(row => row.primary_repair_mask), expectedMasks),
    equivalent_apertures_same_mask: rows.every(row => row.primary_equals_alternate_mask),
    masks_equal_inherited_repair_signatures: rows.every(
      row => row.mask_equals_inherited_repair_signature,
    ),
  });
}

function decoderCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const inheritedPolicy = dromologicalHolonomyClassReplayPolicy();
  const rows = freeze(classes.map((holonomyClass, index) => {
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const decodedReplay = decodeMinimumCostReplayFromRepairMask(mask);
    const decodedSignature = dromologicalRepairSignature(decodedReplay);
    const inherited = inheritedPolicy[index];
    const actual = classifyReplayAgainstHolonomyClass(holonomyClass, decodedReplay);
    return freeze({
      holonomy_class_id: holonomyClass.holonomy_class_id,
      repair_mask: mask,
      decoded_replay_row: decodedReplay,
      decoded_repair_signature: decodedSignature,
      inherited_policy_replay_row: inherited.replay_row,
      inherited_policy_l0_cost: inherited.l0_cost,
      inherited_policy_l1_cost: inherited.l1_cost,
      decoded_l0_cost: l0(decodedReplay),
      decoded_l1_cost: l1(decodedReplay),
      decoded_row_equals_inherited_policy: same(decodedReplay, inherited.replay_row),
      decoded_signature_equals_mask: same(decodedSignature, mask),
      actual_class_robust_unimodular_rescue: actual.actual_class_robust_unimodular_rescue,
      inherited_minimum_cost_retained:
        l0(decodedReplay) === inherited.l0_cost && l1(decodedReplay) === inherited.l1_cost,
    });
  }));

  return freeze({
    rows,
    exact_closed_form_policy_rows: rows.every(row => row.decoded_row_equals_inherited_policy),
    q_of_decoded_row_equals_mask: rows.every(row => row.decoded_signature_equals_mask),
    every_decoded_row_actually_class_robust_unimodular: rows.every(
      row => row.actual_class_robust_unimodular_rescue,
    ),
    inherited_l0_l1_minima_retained: rows.every(row => row.inherited_minimum_cost_retained),
    exact: rows.every(row => row.decoded_row_equals_inherited_policy
      && row.decoded_signature_equals_mask
      && row.actual_class_robust_unimodular_rescue
      && row.inherited_minimum_cost_retained),
  });
}

function negativeControlsCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const projectionsFor = coordinate => classes.map(row => (
    coordinateValue(row.terminal_formal_holonomy, coordinate)
  ));
  const h00 = projectionsFor([0, 0]);
  const h12 = projectionsFor([1, 2]);
  const h01 = projectionsFor([0, 1]);
  const mixedClass = classes.find(row => row.schedule_ids.length > 1 && row.defect_directions.length === 2);

  return freeze({
    h00_values: freeze(h00),
    h12_values: freeze(h12),
    h01_values: freeze(h01),
    h00_distinct_class_count: new Set(h00).size,
    h12_distinct_class_count: new Set(h12).size,
    h01_distinct_class_count: new Set(h01).size,
    h00_alone_insufficient: new Set(h00).size === 2,
    h12_alone_insufficient: new Set(h12).size === 2,
    constant_entry_collapses_all_classes: new Set(h01).size === 1,
    mixed_class_schedule_ids: mixedClass ? mixedClass.schedule_ids : freeze([]),
    aperture_does_not_reconstruct_schedule_identity:
      Boolean(mixedClass) && mixedClass.schedule_ids.length === 2,
    exact: new Set(h00).size === 2
      && new Set(h12).size === 2
      && new Set(h01).size === 1
      && Boolean(mixedClass)
      && mixedClass.schedule_ids.length === 2,
  });
}

export function dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate() {
  const parent = dromologicalHolonomyCoarsenedReplayInverseDesignCertificate();
  const minimality = minimalityCertificate();
  const routing = routingMaskCertificate();
  const decoder = decoderCertificate();
  const negatives = negativeControlsCertificate();

  const passed = parent.passed
    && minimality.exact
    && routing.primary_raw_projections_exact
    && routing.repair_masks_exact
    && routing.equivalent_apertures_same_mask
    && routing.masks_equal_inherited_repair_signatures
    && decoder.exact
    && negatives.exact;

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_PARENT_RECEIPT,
    parent_schema: parent.schema,
    minimality_certificate: minimality,
    routing_mask_certificate: routing,
    decoder_certificate: decoder,
    negative_controls_certificate: negatives,
    passed,
    primary_classification: passed
      ? 'THE_TWO_ENTRY_RAW_TERMINAL_FORMAL_HOLONOMY_APERTURE_H00_H12_EXACTLY_RECOVERS_THE_EARNED_REPAIR_DEFECT_MASK_AND_THEREFORE_EXACTLY_ROUTES_THE_MINIMUM_COST_CLASS_ROBUST_UNIMODULAR_REPLAY_POLICY_IN_THE_FIXED_S3_FIXTURE'
      : 'TWO_ENTRY_FORMAL_HOLONOMY_REPAIR_ROUTING_APERTURE_NOT_ESTABLISHED',
    minimality_classification: passed
      ? 'NO_SINGLE_RAW_TERMINAL_FORMAL_HOLONOMY_MATRIX_ENTRY_SEPARATES_ALL_FOUR_EARNED_REPAIR_CLASSES_WHILE_EXACTLY_TWO_UNORDERED_RAW_TWO_ENTRY_APERTURES_DO_SO_IN_THE_FIXED_S3_FIXTURE'
      : 'RAW_FORMAL_HOLONOMY_COORDINATE_MINIMALITY_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'A_RECEIVER_CAN_RETAIN_STRICTLY_LESS_THAN_THE_FULL_TERMINAL_FORMAL_HOLONOMY_MATRIX_YET_PRESERVE_EXACT_REPAIR_ROUTING_WHEN_THE_RETAINED_COORDINATE_APERTURE_IS_ALIGNED_WITH_THE_EARNED_DEFECT_PARTITION'
      : 'SELECTIVE_FORMAL_HOLONOMY_APERTURE_REPAIR_ROUTING_NOT_ESTABLISHED',
    scars: freeze([
      'TWO_RAW_COORDINATES_SUFFICIENT_FOR_REPAIR_ROUTING != TWO_COORDINATES_SUFFICIENT_FOR_SCHEDULE_RECONSTRUCTION',
      'RAW_COORDINATE_MINIMALITY != INFORMATION_THEORETIC_MINIMALITY',
      'RAW_COORDINATE_MINIMALITY != UNIVERSAL_FEATURE_MINIMALITY',
      'DEFECT_MASK != COMPLETE_FORMAL_HOLONOMY',
      'DEFECT_MASK != SEMANTIC_STATE',
      'REPAIR_ROUTING_KEY != OPERATIONAL_SENSOR_CONTROL',
      'MINIMUM_COST_INTEGER_REPLAY_ROW != UNIVERSAL_OPTIMAL_EXPERIMENT',
      'FORMAL_HOLONOMY_ENTRY != PHYSICAL_HOLONOMY_OBSERVABLE',
      'SELECTIVE_AIA_APERTURE != AUTHORITY_WIDENING',
    ]),
  });
}

export function compileDromologicalHolonomyMinimalCoordinateRepairRoutingProjection(receiver) {
  const certificate = dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified minimal holonomy repair-routing aperture');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-minimal-coordinate-repair-routing-child-legible/v0.1',
      truths: freeze([
        'THE_WHOLE_LAST_PATTERN_IS_NOT_NEEDED_TO_CHOOSE_THE_RIGHT_KIND_OF_EXTRA_CHECK',
        'TWO_SMALL_CLUES_ARE_ENOUGH_HERE',
        'ONE_SMALL_CLUE_IS_NOT_ENOUGH_HERE',
        'THE_TWO_CLUES_DO_NOT_TELL_US_EVERY_STEP_THAT_HAPPENED',
      ]),
      terminal_holonomy_matrices_exposed: false,
      raw_coordinate_locations_exposed: false,
      repair_masks_exposed: false,
      defect_vectors_exposed: false,
      replay_vectors_exposed: false,
      decoder_formulas_exposed: false,
      inverse_formulas_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-minimal-coordinate-repair-routing-loom-technical/v0.1',
      minimality_certificate: certificate.minimality_certificate,
      routing_mask_certificate: certificate.routing_mask_certificate,
      decoder_certificate: certificate.decoder_certificate,
      negative_controls_certificate: certificate.negative_controls_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for minimal holonomy repair-routing aperture: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_MINIMAL_COORDINATE_APERTURE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_raw_coordinate_repair_routing_minimality: true,
      arbitrary_encoding_minimality: false,
      information_theoretic_minimality: false,
      complete_schedule_reconstruction: false,
      full_terminal_holonomy_reconstruction: false,
      universal_holonomy_coordinate_theorem: false,
      universal_optimal_sensor_theorem: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      continuum_tomography: false,
      operational_sensor_control: false,
      operational_inverse_route: false,
      semantic_equivalence: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyMinimalCoordinateRepairRoutingOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const overclaim = ceiling.arbitrary_encoding_minimality === true
    || ceiling.information_theoretic_minimality === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.full_terminal_holonomy_reconstruction === true
    || ceiling.universal_holonomy_coordinate_theorem === true
    || ceiling.universal_optimal_sensor_theorem === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true
    || ceiling.continuum_tomography === true
    || ceiling.operational_sensor_control === true
    || ceiling.operational_inverse_route === true
    || ceiling.semantic_equivalence === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.terminal_holonomy_matrices_exposed === true
    || candidate?.payload?.raw_coordinate_locations_exposed === true
    || candidate?.payload?.repair_masks_exposed === true
    || candidate?.payload?.defect_vectors_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.decoder_formulas_exposed === true
    || candidate?.payload?.inverse_formulas_exposed === true
    || candidate?.payload?.latent_coordinates_exposed === true
  );

  const accepted = !authorityWidened && !runtime && !overclaim && !ashTechnicalLeak;
  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    overclaim_attempted: overclaim,
    ash_technical_leak_attempted: ashTechnicalLeak,
    classification: accepted
      ? 'HOLONOMY_MINIMAL_COORDINATE_REPAIR_ROUTING_BOUNDARY_PRESERVED'
      : 'HOLONOMY_MINIMAL_COORDINATE_REPAIR_ROUTING_OVERREACH_REJECTED',
  });
}