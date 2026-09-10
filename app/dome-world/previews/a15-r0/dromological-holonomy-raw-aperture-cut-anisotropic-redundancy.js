import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate,
} from './dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';

export const DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_SCHEMA =
  'td613.dome-world.dromological-holonomy-raw-aperture-cut-anisotropic-redundancy/v0.1';
export const DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_PARENT_RECEIPT =
  '7693b0823968d5e20dca8fdc9145452934377fc0';

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

export const RAW_HOLONOMY_COORDINATES = Object.freeze([
  Object.freeze([0, 0]), Object.freeze([0, 1]), Object.freeze([0, 2]),
  Object.freeze([1, 0]), Object.freeze([1, 1]), Object.freeze([1, 2]),
  Object.freeze([2, 0]), Object.freeze([2, 1]), Object.freeze([2, 2]),
]);

export const RAW_HOLONOMY_H00 = Object.freeze([0, 0]);
export const RAW_HOLONOMY_H11 = Object.freeze([1, 1]);
export const RAW_HOLONOMY_H12 = Object.freeze([1, 2]);

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

function includesCoordinate(aperture, target) {
  return aperture.some(coordinate => same(coordinate, target));
}

function coordinateValue(matrix, coordinate) {
  return matrix[coordinate[0]][coordinate[1]];
}

function projection(matrix, aperture) {
  return freeze(aperture.map(coordinate => coordinateValue(matrix, coordinate)));
}

function distinctCount(rows) {
  return new Set(rows.map(row => JSON.stringify(row))).size;
}

function allRawApertures() {
  const result = [];
  const count = 1 << RAW_HOLONOMY_COORDINATES.length;
  for (let mask = 0; mask < count; mask += 1) {
    const aperture = [];
    for (let index = 0; index < RAW_HOLONOMY_COORDINATES.length; index += 1) {
      if ((mask & (1 << index)) !== 0) aperture.push(RAW_HOLONOMY_COORDINATES[index]);
    }
    result.push(freeze(aperture));
  }
  return freeze(result);
}

function predictedRouter(aperture) {
  return includesCoordinate(aperture, RAW_HOLONOMY_H12)
    && (includesCoordinate(aperture, RAW_HOLONOMY_H00)
      || includesCoordinate(aperture, RAW_HOLONOMY_H11));
}

export function deriveHolonomyRepairClassDifferenceSupports() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const rows = [];
  for (let left = 0; left < classes.length; left += 1) {
    for (let right = left + 1; right < classes.length; right += 1) {
      const support = RAW_HOLONOMY_COORDINATES.filter(coordinate => (
        coordinateValue(classes[left].terminal_formal_holonomy, coordinate)
        !== coordinateValue(classes[right].terminal_formal_holonomy, coordinate)
      ));
      rows.push(freeze({
        left_class_id: classes[left].holonomy_class_id,
        right_class_id: classes[right].holonomy_class_id,
        left_schedule_ids: classes[left].schedule_ids,
        right_schedule_ids: classes[right].schedule_ids,
        difference_support: freeze(support),
        difference_support_key: apertureKey(support),
        difference_support_size: support.length,
      }));
    }
  }
  return freeze(rows);
}

export function classifyRawHolonomyRepairAperture(aperture) {
  if (!Array.isArray(aperture)) throw new Error('raw holonomy aperture must be an array');
  for (const coordinate of aperture) {
    if (!RAW_HOLONOMY_COORDINATES.some(declared => same(declared, coordinate))) {
      throw new Error(`undeclared raw holonomy coordinate: ${JSON.stringify(coordinate)}`);
    }
  }
  const keys = aperture.map(coordinateKey);
  if (new Set(keys).size !== keys.length) throw new Error('raw holonomy aperture contains duplicate coordinates');

  const classes = deriveDromologicalTerminalHolonomyClasses();
  const classProjections = freeze(classes.map(row => projection(row.terminal_formal_holonomy, aperture)));
  const actual = distinctCount(classProjections) === classes.length;
  const predicted = predictedRouter(aperture);
  return freeze({
    aperture: freeze(aperture.map(coordinate => freeze([...coordinate]))),
    aperture_key: apertureKey(aperture),
    cardinality: aperture.length,
    class_projections: classProjections,
    distinct_projected_class_count: distinctCount(classProjections),
    actual_exact_repair_router: actual,
    logical_cut_predicate_predicts_router: predicted,
    predicate_matches_actual: actual === predicted,
  });
}

function deletionProfile(aperture) {
  const original = classifyRawHolonomyRepairAperture(aperture);
  const deletions = freeze(aperture.map((coordinate, index) => {
    const surviving = aperture.filter((_, candidateIndex) => candidateIndex !== index);
    const classification = classifyRawHolonomyRepairAperture(surviving);
    return freeze({
      erased_coordinate: coordinate,
      surviving_aperture: classification.aperture,
      surviving_exact_repair_router: classification.actual_exact_repair_router,
      surviving_distinct_class_count: classification.distinct_projected_class_count,
    });
  }));
  return freeze({
    aperture: original.aperture,
    original_exact_repair_router: original.actual_exact_repair_router,
    deletions,
    tolerated_single_coordinate_erasures: deletions.filter(row => row.surviving_exact_repair_router).length,
    failed_single_coordinate_erasures: deletions.filter(row => !row.surviving_exact_repair_router).length,
    all_single_coordinate_erasures_tolerated:
      deletions.length > 0 && deletions.every(row => row.surviving_exact_repair_router),
  });
}

function powersetCertificate() {
  const apertures = allRawApertures();
  const rows = freeze(apertures.map(classifyRawHolonomyRepairAperture));
  const routers = rows.filter(row => row.actual_exact_repair_router);
  const byCardinality = Array.from({ length: 10 }, () => 0);
  routers.forEach(row => { byCardinality[row.cardinality] += 1; });
  const expectedByCardinality = [0, 0, 2, 13, 36, 55, 50, 27, 8, 1];

  const withBothHBackups = routers.filter(row => (
    includesCoordinate(row.aperture, RAW_HOLONOMY_H00)
    && includesCoordinate(row.aperture, RAW_HOLONOMY_H11)
  ));
  const withExactlyOneHBackup = routers.filter(row => (
    includesCoordinate(row.aperture, RAW_HOLONOMY_H00)
    !== includesCoordinate(row.aperture, RAW_HOLONOMY_H11)
  ));

  return freeze({
    raw_coordinate_count: RAW_HOLONOMY_COORDINATES.length,
    audited_aperture_count: rows.length,
    expected_aperture_count: 512,
    exact_repair_router_count: routers.length,
    expected_exact_repair_router_count: 192,
    nonrouter_count: rows.length - routers.length,
    expected_nonrouter_count: 320,
    routing_counts_by_cardinality: freeze(byCardinality),
    expected_routing_counts_by_cardinality: freeze(expectedByCardinality),
    every_aperture_matches_logical_cut_predicate: rows.every(row => row.predicate_matches_actual),
    every_router_contains_h12: routers.every(row => includesCoordinate(row.aperture, RAW_HOLONOMY_H12)),
    every_router_contains_h00_or_h11: routers.every(row => (
      includesCoordinate(row.aperture, RAW_HOLONOMY_H00)
      || includesCoordinate(row.aperture, RAW_HOLONOMY_H11)
    )),
    routers_with_both_h_backups: withBothHBackups.length,
    expected_routers_with_both_h_backups: 64,
    routers_with_exactly_one_h_backup: withExactlyOneHBackup.length,
    expected_routers_with_exactly_one_h_backup: 128,
    cardinality_two_routers: freeze(routers
      .filter(row => row.cardinality === 2)
      .map(row => row.aperture)),
    rows,
    exact: rows.length === 512
      && routers.length === 192
      && rows.length - routers.length === 320
      && same(byCardinality, expectedByCardinality)
      && rows.every(row => row.predicate_matches_actual)
      && withBothHBackups.length === 64
      && withExactlyOneHBackup.length === 128,
  });
}

function supportCertificate() {
  const supports = deriveHolonomyRepairClassDifferenceSupports();
  const emptyVsH = supports.find(row => (
    row.left_schedule_ids.includes('P-H-I') && row.right_schedule_ids.includes('H-P-I')
  ));
  const hVsMixed = supports.find(row => (
    row.left_schedule_ids.includes('H-P-I')
    && row.right_schedule_ids.includes('H-I-P')
  ));
  const expectedEmptyVsH = [RAW_HOLONOMY_H00, RAW_HOLONOMY_H11];
  const expectedHVsMixed = [RAW_HOLONOMY_H12];

  return freeze({
    pairwise_difference_supports: supports,
    pairwise_support_count: supports.length,
    empty_vs_h_only_support: emptyVsH?.difference_support ?? null,
    h_only_vs_mixed_support: hVsMixed?.difference_support ?? null,
    empty_vs_h_only_exactly_h00_h11:
      Boolean(emptyVsH) && same(emptyVsH.difference_support, expectedEmptyVsH),
    h_only_vs_mixed_exactly_h12:
      Boolean(hVsMixed) && same(hVsMixed.difference_support, expectedHVsMixed),
    h12_is_forced_by_singleton_difference_support:
      Boolean(hVsMixed) && hVsMixed.difference_support.length === 1
        && same(hVsMixed.difference_support[0], RAW_HOLONOMY_H12),
    h00_or_h11_is_forced_by_two_coordinate_difference_support:
      Boolean(emptyVsH) && same(emptyVsH.difference_support, expectedEmptyVsH),
    exact: supports.length === 6
      && Boolean(emptyVsH)
      && Boolean(hVsMixed)
      && same(emptyVsH.difference_support, expectedEmptyVsH)
      && same(hVsMixed.difference_support, expectedHVsMixed),
  });
}

function erasureCertificate() {
  const full = deletionProfile(RAW_HOLONOMY_COORDINATES);
  const tripleAperture = [RAW_HOLONOMY_H00, RAW_HOLONOMY_H11, RAW_HOLONOMY_H12];
  const triple = deletionProfile(tripleAperture);
  const h12FullDeletion = full.deletions.find(row => same(row.erased_coordinate, RAW_HOLONOMY_H12));
  const h12TripleDeletion = triple.deletions.find(row => same(row.erased_coordinate, RAW_HOLONOMY_H12));
  const power = powersetCertificate();
  const noRouterSurvivesOwnH12Erasure = power.rows
    .filter(row => row.actual_exact_repair_router)
    .every((row) => {
      const surviving = row.aperture.filter(coordinate => !same(coordinate, RAW_HOLONOMY_H12));
      return classifyRawHolonomyRepairAperture(surviving).actual_exact_repair_router === false;
    });

  return freeze({
    full_nine_entry_profile: full,
    three_entry_redundancy_profile: triple,
    full_matrix_tolerated_erasures: full.tolerated_single_coordinate_erasures,
    expected_full_matrix_tolerated_erasures: 8,
    full_matrix_h12_erasure_fails: Boolean(h12FullDeletion)
      && h12FullDeletion.surviving_exact_repair_router === false,
    three_entry_tolerated_erasures: triple.tolerated_single_coordinate_erasures,
    expected_three_entry_tolerated_erasures: 2,
    three_entry_h12_erasure_fails: Boolean(h12TripleDeletion)
      && h12TripleDeletion.surviving_exact_repair_router === false,
    no_exact_raw_router_survives_h12_erasure: noRouterSurvivesOwnH12Erasure,
    no_raw_aperture_is_universally_one_erasure_robust:
      power.rows.filter(row => row.actual_exact_repair_router)
        .every(row => deletionProfile(row.aperture).all_single_coordinate_erasures_tolerated === false),
    exact: full.original_exact_repair_router
      && full.tolerated_single_coordinate_erasures === 8
      && full.failed_single_coordinate_erasures === 1
      && Boolean(h12FullDeletion)
      && h12FullDeletion.surviving_exact_repair_router === false
      && triple.original_exact_repair_router
      && triple.tolerated_single_coordinate_erasures === 2
      && triple.failed_single_coordinate_erasures === 1
      && Boolean(h12TripleDeletion)
      && h12TripleDeletion.surviving_exact_repair_router === false
      && noRouterSurvivesOwnH12Erasure,
  });
}

export function dromologicalHolonomyRawApertureCutCertificate() {
  const parent = dromologicalHolonomyMinimalCoordinateRepairRoutingApertureCertificate();
  const support = supportCertificate();
  const power = powersetCertificate();
  const erasure = erasureCertificate();
  const passed = parent.passed && support.exact && power.exact && erasure.exact;

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_PARENT_RECEIPT,
    parent_schema: parent.schema,
    support_certificate: support,
    powerset_certificate: power,
    erasure_certificate: erasure,
    passed,
    all_aperture_classification: passed
      ? 'EXACT_REPAIR_ROUTING_BY_RAW_TERMINAL_FORMAL_HOLONOMY_COORDINATES_OCCURS_IFF_H12_IS_RETAINED_AND_AT_LEAST_ONE_OF_H00_OR_H11_IS_RETAINED_IN_THE_FIXED_S3_FIXTURE'
      : 'RAW_HOLONOMY_ALL_APERTURE_REPAIR_ROUTING_CLASSIFICATION_NOT_ESTABLISHED',
    anisotropic_redundancy_classification: passed
      ? 'THE_FIXED_S3_RAW_HOLONOMY_REPAIR_ROUTING_APERTURE_HAS_AN_ANISOTROPIC_REDUNDANCY_PROFILE_IN_WHICH_H00_AND_H11_ARE_SUBSTITUTABLE_WHILE_H12_IS_AN_IRREPLACEABLE_SINGLE_COORDINATE_CUT'
      : 'RAW_HOLONOMY_ANISOTROPIC_REDUNDANCY_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'SELECTIVE_AIA_LEGIBILITY_CAN_HAVE_COORDINATE_SPECIFIC_REDUNDANCY_AND_COORDINATE_SPECIFIC_FRAGILITY_WHILE_CUSTODY_AND_RECEIVER_AUTHORITY_REMAIN_INVARIANT'
      : 'SELECTIVE_AIA_REDUNDANCY_FRAGILITY_LAW_NOT_ESTABLISHED',
    scars: freeze([
      'RAW_COORDINATE_REDUNDANCY != INFORMATION_THEORETIC_REDUNDANCY',
      'RAW_COORDINATE_CUT != PHYSICAL_SINGLE_POINT_OF_FAILURE',
      'FULL_MATRIX_VISIBILITY != ONE_ERASURE_ROBUST_REPAIR_ROUTING',
      'EXTRA_COORDINATE != REDUNDANT_REPAIR_COORDINATE',
      'H12_ESSENTIAL_IN_THIS_FIXTURE != UNIVERSAL_HOLONOMY_OBSERVABLE',
      'ANISOTROPIC_REDUNDANCY != PHYSICAL_ANISOTROPIC_MEDIUM',
      'ERASURE_OF_RAW_ENTRY != PHYSICAL_SENSOR_FAILURE',
      'REPAIR_ROUTING_FAILURE != CUSTODY_FAILURE',
      'REPAIR_ROUTING_APERTURE != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'FINITE_POWERSET_CLASSIFICATION != UNIVERSAL_CODING_THEOREM',
    ]),
  });
}

export function compileDromologicalHolonomyRawApertureCutProjection(receiver) {
  const certificate = dromologicalHolonomyRawApertureCutCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified raw holonomy aperture-cut chamber');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-raw-aperture-cut-child-legible/v0.1',
      truths: freeze([
        'SOME_CLUES_HAVE_A_BACKUP_HERE',
        'ONE_IMPORTANT_CLUE_HAS_NO_RAW_BACKUP_HERE',
        'KEEPING_MORE_DETAILS_IS_NOT_THE_SAME_AS_BACKING_UP_EVERY_IMPORTANT_DETAIL',
        'LOSING_THE_UNIQUE_CLUE_BREAKS_THE_REPAIR_CHOICE_BUT_DOES_NOT_CHANGE_WHERE_THE_RECORD_CAME_FROM',
      ]),
      matrices_exposed: false,
      coordinate_locations_exposed: false,
      subset_masks_exposed: false,
      repair_vectors_exposed: false,
      decoder_formulas_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-raw-aperture-cut-loom-technical/v0.1',
      support_certificate: certificate.support_certificate,
      powerset_summary: freeze({
        audited_aperture_count: certificate.powerset_certificate.audited_aperture_count,
        exact_repair_router_count: certificate.powerset_certificate.exact_repair_router_count,
        nonrouter_count: certificate.powerset_certificate.nonrouter_count,
        routing_counts_by_cardinality: certificate.powerset_certificate.routing_counts_by_cardinality,
        routers_with_both_h_backups: certificate.powerset_certificate.routers_with_both_h_backups,
        routers_with_exactly_one_h_backup:
          certificate.powerset_certificate.routers_with_exactly_one_h_backup,
      }),
      erasure_certificate: certificate.erasure_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for raw holonomy aperture-cut chamber: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_RAW_APERTURE_CUT_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_raw_aperture_cut: true,
      information_theoretic_redundancy: false,
      coding_theorem: false,
      universal_feature_minimality: false,
      complete_schedule_reconstruction: false,
      operational_sensor_failure_model: false,
      physical_holonomy: false,
      physical_anisotropic_medium: false,
      physical_quasicrystal: false,
      continuum_tomography: false,
      semantic_equivalence: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyRawApertureCutOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const overclaim = ceiling.information_theoretic_redundancy === true
    || ceiling.coding_theorem === true
    || ceiling.universal_feature_minimality === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_sensor_failure_model === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_anisotropic_medium === true
    || ceiling.physical_quasicrystal === true
    || ceiling.continuum_tomography === true
    || ceiling.semantic_equivalence === true
    || ceiling.operational_inverse_route === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.matrices_exposed === true
    || candidate?.payload?.coordinate_locations_exposed === true
    || candidate?.payload?.subset_masks_exposed === true
    || candidate?.payload?.repair_vectors_exposed === true
    || candidate?.payload?.decoder_formulas_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  const accepted = !authorityWidened && !runtime && !overclaim && !ashLeak;
  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    overclaim_attempted: overclaim,
    ash_technical_leak_attempted: ashLeak,
  });
}
