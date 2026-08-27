import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalS3ScheduleAtlasCertificate,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from './dromological-schedule-state-identifiability-lag.js';
import {
  enumerateReplayMinors,
} from './dromological-baseline-replay-rescue-aperture.js';
import {
  deriveReplayMinorLinearForms,
  evaluateReplayMinorLinearForm,
} from './dromological-replay-transversality-unimodular-locus.js';
import {
  DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR,
  dromologicalRepairSignature,
  canonicalReplayRepairRepresentative,
  replayRepairDeterminantAtlas,
  dromologicalReplayRepairQuotientCertificate,
} from './dromological-replay-repair-quotient-canonical-section.js';

export const P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_SCHEMA =
  'td613.dome-world.p-first-side-minor-replay-identifiability/v0.1';
export const P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_PARENT_RECEIPT =
  '2cc95613969951afc96c638c316ae70007560f16';

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

let coordinateAtlasCache = null;
let certificateCache = null;

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

function canonicalizeZero(value) {
  return value === 0 ? 0 : value;
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function assertIntegerVector(vector, length, label) {
  if (!Array.isArray(vector) || vector.length !== length || !vector.every(Number.isInteger)) {
    throw new Error(`${label} must be an integer vector of length ${length}`);
  }
}

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => canonicalizeZero(dot(row, vector)));
}

function inverseUnimodular3(matrix) {
  const det = determinant3(matrix);
  if (Math.abs(det) !== 1) throw new Error('P-first side-minor coefficient matrix must be unimodular');
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adjugate = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  const inverse = adjugate.map(row => row.map(value => canonicalizeZero(value / det)));
  if (!inverse.flat().every(Number.isInteger)) {
    throw new Error('P-first side-minor inverse must be integral');
  }
  return freeze(inverse.map(row => freeze(row)));
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function pFirstSchedulesFromWitness() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  if (!atlas.passed) throw new Error('witnessed S3 atlas must pass before P-first side-minor analysis');
  return freeze(atlas.schedules
    .filter(row => row.observation_rank === 3)
    .map(row => freeze([...row.schedule])));
}

function actualReplaySideMinorTriple(schedule, replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const sideMinors = enumerateReplayMinors(schedule, replayRow)
    .filter(minor => minor.rows.includes(3));
  if (sideMinors.length !== 3) throw new Error('expected exactly three replay-dependent side minors');
  return freeze(sideMinors.map(minor => canonicalizeZero(minor.determinant)));
}

function coordinateRowForSchedule(schedule) {
  const sideForms = deriveReplayMinorLinearForms(schedule)
    .filter(form => form.replay_dependent);
  if (sideForms.length !== 3) throw new Error('expected exactly three derived replay-dependent forms');
  const coefficientMatrix = freeze(sideForms.map(form => freeze([...form.coefficients])));
  const determinant = determinant3(coefficientMatrix);
  const inverse = inverseUnimodular3(coefficientMatrix);
  const slopes = freeze(coefficientMatrix.map(row => dot(row, DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR)));
  const sensitiveIndices = freeze(slopes
    .map((slope, index) => ({ slope, index }))
    .filter(row => Math.abs(row.slope) === 1)
    .map(row => row.index));
  const blindIndices = freeze(slopes
    .map((slope, index) => ({ slope, index }))
    .filter(row => row.slope === 0)
    .map(row => row.index));

  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: scheduleId(schedule),
    replay_side_minor_rows: freeze(sideForms.map(form => freeze([...form.rows]))),
    coefficient_matrix: coefficientMatrix,
    determinant,
    inverse_matrix: inverse,
    fiber_slopes: slopes,
    fiber_sensitive_indices: sensitiveIndices,
    fiber_blind_indices: blindIndices,
    all_sensitive_slopes_are_units: sensitiveIndices.length === 2
      && sensitiveIndices.every(index => Math.abs(slopes[index]) === 1),
    exactly_one_fiber_blind_minor: blindIndices.length === 1,
  });
}

export function pFirstSideMinorCoordinateAtlas() {
  if (coordinateAtlasCache !== null) return coordinateAtlasCache;
  const schedules = pFirstSchedulesFromWitness();
  coordinateAtlasCache = freeze(schedules.map(coordinateRowForSchedule));
  return coordinateAtlasCache;
}

function coordinateRow(schedule) {
  const id = scheduleId(schedule);
  const row = pFirstSideMinorCoordinateAtlas().find(candidate => candidate.schedule_id === id);
  if (!row) throw new Error('side-minor replay inverse is authorized only for witnessed P-first schedules');
  return row;
}

export function pFirstReplaySideMinorTriple(schedule, replayRow) {
  return actualReplaySideMinorTriple(schedule, replayRow);
}

export function invertPFirstReplaySideMinorTriple(schedule, sideMinorTriple) {
  assertIntegerVector(sideMinorTriple, 3, 'P-first replay side-minor triple');
  const row = coordinateRow(schedule);
  return freeze(matrixTimesVector(row.inverse_matrix, sideMinorTriple));
}

export function identifyReplayFiberCoordinateFromSensitiveMinor(
  repairSignature,
  schedule,
  sideMinorIndex,
  sideMinorValue,
) {
  assertIntegerVector(repairSignature, 2, 'repair signature');
  if (!Number.isInteger(sideMinorIndex) || sideMinorIndex < 0 || sideMinorIndex > 2) {
    throw new Error('side-minor index must be one of 0,1,2');
  }
  if (!Number.isInteger(sideMinorValue)) throw new Error('side-minor value must be an integer');

  const row = coordinateRow(schedule);
  const slope = row.fiber_slopes[sideMinorIndex];
  if (Math.abs(slope) !== 1) {
    throw new Error('selected P-first side minor is fiber-blind in the declared fixture');
  }

  const representative = canonicalReplayRepairRepresentative(repairSignature);
  const baselineTriple = actualReplaySideMinorTriple(schedule, representative);
  const numerator = sideMinorValue - baselineTriple[sideMinorIndex];
  const fiberCoordinate = numerator / slope;
  if (!Number.isInteger(fiberCoordinate)) {
    throw new Error('unit-slope side minor produced a noninteger fiber coordinate');
  }
  return canonicalizeZero(fiberCoordinate);
}

export function reconstructReplayRowFromRepairSignatureAndSensitiveMinor(
  repairSignature,
  schedule,
  sideMinorIndex,
  sideMinorValue,
) {
  const t = identifyReplayFiberCoordinateFromSensitiveMinor(
    repairSignature,
    schedule,
    sideMinorIndex,
    sideMinorValue,
  );
  const representative = canonicalReplayRepairRepresentative(repairSignature);
  return freeze(representative.map((value, index) => (
    value + t * DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR[index]
  )));
}

function finiteReplayCubeAudit(limit = 4) {
  const atlas = pFirstSideMinorCoordinateAtlas();
  let replayRows = 0;
  let scheduleReconstructions = 0;
  let coefficientEvaluations = 0;
  let fiberReconstructions = 0;
  let exact = true;
  const rows = [];

  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const replayRow = freeze([a, b, c]);
        const repairSignature = dromologicalRepairSignature(replayRow);
        const triples = [];
        for (const coordinate of atlas) {
          const triple = actualReplaySideMinorTriple(coordinate.schedule, replayRow);
          const predicted = matrixTimesVector(coordinate.coefficient_matrix, replayRow);
          const recovered = invertPFirstReplaySideMinorTriple(coordinate.schedule, triple);
          triples.push(triple);
          scheduleReconstructions += 1;
          coefficientEvaluations += 1;
          if (!same(triple, predicted) || !same(recovered, replayRow)) exact = false;

          for (const index of coordinate.fiber_sensitive_indices) {
            const recoveredT = identifyReplayFiberCoordinateFromSensitiveMinor(
              repairSignature,
              coordinate.schedule,
              index,
              triple[index],
            );
            const recoveredRow = reconstructReplayRowFromRepairSignatureAndSensitiveMinor(
              repairSignature,
              coordinate.schedule,
              index,
              triple[index],
            );
            fiberReconstructions += 1;
            if (recoveredT !== a || !same(recoveredRow, replayRow)) exact = false;
          }
        }
        rows.push(freeze({ replay_row: replayRow, repair_signature: repairSignature, side_triples: freeze(triples) }));
        replayRows += 1;
      }
    }
  }

  return freeze({
    replay_cube_limit: limit,
    rows: freeze(rows),
    checked_replay_rows: replayRows,
    expected_replay_rows: 729,
    checked_schedule_reconstructions: scheduleReconstructions,
    expected_schedule_reconstructions: 1458,
    checked_coefficient_evaluations: coefficientEvaluations,
    expected_coefficient_evaluations: 1458,
    checked_sensitive_minor_fiber_reconstructions: fiberReconstructions,
    expected_sensitive_minor_fiber_reconstructions: 2916,
    exact: exact
      && replayRows === 729
      && scheduleReconstructions === 1458
      && coefficientEvaluations === 1458
      && fiberReconstructions === 2916,
  });
}

function finitePairPartitionAudit(rows) {
  let unorderedPairs = 0;
  let injectivityChecks = 0;
  let sameRepairSignaturePairs = 0;
  let strictRefinementChecks = 0;
  let exact = true;

  for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
    const left = rows[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
      const right = rows[rightIndex];
      unorderedPairs += 1;
      const sameRepairSignature = same(left.repair_signature, right.repair_signature);
      if (sameRepairSignature) sameRepairSignaturePairs += 1;

      for (let scheduleIndex = 0; scheduleIndex < 2; scheduleIndex += 1) {
        const sameTriple = same(left.side_triples[scheduleIndex], right.side_triples[scheduleIndex]);
        injectivityChecks += 1;
        if (sameTriple) exact = false;
        if (sameRepairSignature) {
          strictRefinementChecks += 1;
          if (sameTriple) exact = false;
        }
      }
    }
  }

  return freeze({
    unordered_replay_row_pairs: unorderedPairs,
    expected_unordered_replay_row_pairs: 265356,
    p_first_pairwise_injectivity_checks: injectivityChecks,
    expected_p_first_pairwise_injectivity_checks: 530712,
    same_repair_signature_pairs: sameRepairSignaturePairs,
    expected_same_repair_signature_pairs: 1296,
    strict_refinement_checks: strictRefinementChecks,
    expected_strict_refinement_checks: 2592,
    exact: exact
      && unorderedPairs === 265356
      && injectivityChecks === 530712
      && sameRepairSignaturePairs === 1296
      && strictRefinementChecks === 2592,
  });
}

function finiteFiberTranslationAudit(baseLimit = 3, translationLimit = 4) {
  const atlas = pFirstSideMinorCoordinateAtlas();
  let translationMinorChecks = 0;
  let exact = true;

  for (let a = -baseLimit; a <= baseLimit; a += 1) {
    for (let b = -baseLimit; b <= baseLimit; b += 1) {
      for (let c = -baseLimit; c <= baseLimit; c += 1) {
        const base = [a, b, c];
        for (let n = -translationLimit; n <= translationLimit; n += 1) {
          const translated = base.map((value, index) => (
            value + n * DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR[index]
          ));
          for (const coordinate of atlas) {
            const baseTriple = actualReplaySideMinorTriple(coordinate.schedule, base);
            const translatedTriple = actualReplaySideMinorTriple(coordinate.schedule, translated);
            for (let minorIndex = 0; minorIndex < 3; minorIndex += 1) {
              translationMinorChecks += 1;
              const expectedDifference = n * coordinate.fiber_slopes[minorIndex];
              const actualDifference = translatedTriple[minorIndex] - baseTriple[minorIndex];
              if (actualDifference !== expectedDifference) exact = false;
            }
          }
        }
      }
    }
  }

  const expected = ((2 * baseLimit + 1) ** 3)
    * (2 * translationLimit + 1)
    * 2
    * 3;
  return freeze({
    base_cube_limit: baseLimit,
    translation_limit: translationLimit,
    side_minor_translation_checks: translationMinorChecks,
    expected_side_minor_translation_checks: expected,
    exact: exact && translationMinorChecks === expected,
  });
}

function namedFiberBlindControl() {
  const left = freeze([1, 0, 0]);
  const right = freeze([2, -1, -1]);
  const leftSignature = dromologicalRepairSignature(left);
  const rightSignature = dromologicalRepairSignature(right);
  const repairAtlasesEqual = same(
    replayRepairDeterminantAtlas(left),
    replayRepairDeterminantAtlas(right),
  );
  const rows = pFirstSideMinorCoordinateAtlas().map((coordinate) => {
    const leftTriple = actualReplaySideMinorTriple(coordinate.schedule, left);
    const rightTriple = actualReplaySideMinorTriple(coordinate.schedule, right);
    const blindIndex = coordinate.fiber_blind_indices[0];
    const sensitiveIndices = coordinate.fiber_sensitive_indices;
    return freeze({
      schedule_id: coordinate.schedule_id,
      left_triple: leftTriple,
      right_triple: rightTriple,
      triples_distinct: !same(leftTriple, rightTriple),
      blind_minor_equal: leftTriple[blindIndex] === rightTriple[blindIndex],
      all_sensitive_minors_differ: sensitiveIndices.every(index => leftTriple[index] !== rightTriple[index]),
    });
  });

  return freeze({
    left,
    right,
    same_repair_signature: same(leftSignature, rightSignature),
    repair_atlases_equal: repairAtlasesEqual,
    p_first_rows: freeze(rows),
    passed: same(leftSignature, rightSignature)
      && repairAtlasesEqual
      && rows.every(row => row.triples_distinct && row.blind_minor_equal && row.all_sensitive_minors_differ),
  });
}

export function pFirstSideMinorReplayIdentifiabilityCertificate() {
  if (certificateCache !== null) return certificateCache;

  const parent = dromologicalReplayRepairQuotientCertificate();
  const atlas = pFirstSideMinorCoordinateAtlas();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const exactExpectedMatrices = same(
    atlas.map(row => row.coefficient_matrix),
    [
      [[0, 0, -1], [0, 1, -1], [1, 2, 0]],
      [[0, 1, 0], [0, 1, -1], [-1, -1, -1]],
    ],
  );
  const exactExpectedInverses = same(
    atlas.map(row => row.inverse_matrix),
    [
      [[2, -2, 1], [-1, 1, 0], [-1, 0, 0]],
      [[-2, 1, -1], [1, 0, 0], [1, -1, 0]],
    ],
  );
  const exactExpectedSlopes = same(
    atlas.map(row => row.fiber_slopes),
    [[1, 0, -1], [-1, 0, 1]],
  );
  const allCoordinateSystemsUnimodular = atlas.length === 2
    && atlas.every(row => row.determinant === 1);
  const fiberSensitivityExact = atlas.every(row => (
    row.all_sensitive_slopes_are_units
    && row.exactly_one_fiber_blind_minor
    && row.fiber_sensitive_indices.length === 2
    && row.fiber_blind_indices.length === 1
  ));

  const cube = finiteReplayCubeAudit(4);
  const pairs = finitePairPartitionAudit(cube.rows);
  const translations = finiteFiberTranslationAudit(3, 4);
  const named = namedFiberBlindControl();
  const historicalAtlas = dromologicalS3ScheduleAtlasCertificate();
  const historicalRanksPreserved = same(
    historicalAtlas.schedules.map(row => row.observation_rank),
    [3, 3, 2, 2, 2, 2],
  );
  const scheduleIdentitySeparate = lag.passed && lag.minimal_schedule_identification_prefix === 2;

  const passed = parent.passed
    && exactExpectedMatrices
    && exactExpectedInverses
    && exactExpectedSlopes
    && allCoordinateSystemsUnimodular
    && fiberSensitivityExact
    && cube.exact
    && pairs.exact
    && translations.exact
    && named.passed
    && historicalRanksPreserved
    && scheduleIdentitySeparate;

  certificateCache = freeze({
    schema: P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_SCHEMA,
    parent_receipt: P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_PARENT_RECEIPT,
    coordinate_atlas: atlas,
    all_p_first_side_minor_coordinate_systems_unimodular: allCoordinateSystemsUnimodular,
    fiber_sensitivity_classification_exact: fiberSensitivityExact,
    finite_replay_cube_audit: freeze({ ...cube, rows: undefined }),
    finite_pair_partition_audit: pairs,
    finite_fiber_translation_audit: translations,
    named_fiber_blind_control: named,
    replay_removal_preserves_historical_rank_profile: historicalRanksPreserved,
    schedule_identity_already_exact_at_prefix_two: scheduleIdentitySeparate,
    passed,
    replay_identifiability_classification: passed
      ? 'EACH_P_FIRST_REPLAY_DEPENDENT_SIDE_MINOR_TRIPLE_IS_A_UNIMODULAR_INTEGER_COORDINATE_SYSTEM_ON_THE_DECLARED_REPLAY_LATTICE_AND_EXACTLY_IDENTIFIES_THE_REPLAY_ROW_IN_THE_FIXED_S3_FIXTURE'
      : 'P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_NOT_ESTABLISHED',
    partition_classification: passed
      ? 'THE_P_FIRST_SIDE_MINOR_PARTITION_STRICTLY_REFINES_THE_REPAIR_QUOTIENT_PARTITION_BECAUSE_THE_FOUR_HISTORICALLY_SINGULAR_REPAIR_ATLASES_FACTOR_THROUGH_Q_WHILE_EITHER_P_FIRST_SIDE_MINOR_TRIPLE_IS_INJECTIVE_ON_INTEGER_REPLAY_ROWS'
      : 'P_FIRST_SIDE_MINOR_STRICT_REFINEMENT_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'IN_THE_FIXED_S3_FIXTURE_A_REPLAY_FIBER_COORDINATE_CAN_BE_INVISIBLE_TO_THE_SINGULAR_SCHEDULE_REPAIR_PHENOTYPE_YET_EXACTLY_IDENTIFIABLE_FROM_EITHER_P_FIRST_REPLAY_SIDE_MINOR_TRIPLE_WITH_ZERO_AUTHORITY_WIDENING'
      : 'P_FIRST_SIDE_MINOR_FIBER_IDENTIFIABILITY_NOT_ESTABLISHED',
    scars: freeze([
      'P_FIRST_SIDE_MINOR_IDENTIFIABILITY != OPERATIONAL_REPLAY_INVERSE_ROUTE',
      'UNIMODULAR_SIDE_MINOR_COORDINATES != UNIVERSAL_SENSOR_COORDINATES',
      'SIDE_MINOR_PARTITION_REFINEMENT != SEMANTIC_HIERARCHY',
      'FIBER_SENSITIVE_MINOR != PHYSICAL_FIBER_SENSOR',
      'FIBER_BLIND_MINOR != INFORMATION_ABSENCE_FROM_THE_FULL_RECORD',
      'SAME_REPAIR_SIGNATURE != SAME_P_FIRST_SIDE_MINOR_TRIPLE',
      'REPLAY_ROW_IDENTIFIED_FROM_DECLARED_MINORS != LATENT_STATE_OR_SOURCE_IDENTITY',
      'FINITE_INTEGER_INVERSE != CONTINUUM_TOMOGRAPHY_INVERSE',
    ]),
  });
  return certificateCache;
}

export function compilePFirstSideMinorReplayIdentifiabilityProjection(receiver) {
  const certificate = pFirstSideMinorReplayIdentifiabilityCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified P-first side-minor replay identifiability');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.p-first-side-minor-child-legible/v0.1',
      truths: freeze([
        'TWO_GOOD_ORDERS_KEEP_ENOUGH_EXTRA_DETAIL_TO_TELL_WHICH_EXTRA_CHECK_WAS_USED',
        'THE_REPAIR_EFFECT_ALONE_CAN_FORGET_A_DETAIL_THAT_THE_GOOD_ORDER_SIDE_CLUES_STILL_KEEP',
        'ONE_KIND_OF_SIDE_CLUE_STAYS_THE_SAME_ALONG_A_REPAIR_FAMILY_WHILE_OTHER_SIDE_CLUES_CHANGE',
      ]),
      replay_vectors_exposed: false,
      coefficient_matrices_exposed: false,
      determinant_formulas_exposed: false,
      inverse_formulas_exposed: false,
      fiber_vector_exposed: false,
      quotient_matrix_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.p-first-side-minor-loom-technical/v0.1',
      coordinate_atlas: certificate.coordinate_atlas,
      finite_replay_cube_audit: certificate.finite_replay_cube_audit,
      finite_pair_partition_audit: certificate.finite_pair_partition_audit,
      finite_fiber_translation_audit: certificate.finite_fiber_translation_audit,
    });
  } else {
    throw new Error(`undeclared AIA receiver for P-first side-minor replay identifiability: ${receiver}`);
  }

  return freeze({
    schema: P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_side_minor_identifiability: true,
      universal_replay_theorem: false,
      universal_side_minor_theorem: false,
      universal_sensor_coordinates: false,
      universal_minimal_sufficient_statistic: false,
      operational_replay_inverse_route: false,
      live_sensor_reconstruction: false,
      physical_fiber_sensor: false,
      continuum_tomography: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      semantic_hierarchy: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectPFirstSideMinorReplayIdentifiabilityOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const universal = ceiling.universal_replay_theorem === true
    || ceiling.universal_side_minor_theorem === true
    || ceiling.universal_sensor_coordinates === true
    || ceiling.universal_minimal_sufficient_statistic === true;
  const operational = ceiling.operational_replay_inverse_route === true
    || ceiling.live_sensor_reconstruction === true;
  const physical = ceiling.physical_fiber_sensor === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true;
  const continuum = ceiling.continuum_tomography === true;
  const semantic = ceiling.semantic_hierarchy === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.coefficient_matrices_exposed === true
    || candidate?.payload?.determinant_formulas_exposed === true
    || candidate?.payload?.inverse_formulas_exposed === true
    || candidate?.payload?.fiber_vector_exposed === true
    || candidate?.payload?.quotient_matrix_exposed === true
    || candidate?.payload?.latent_coordinates_exposed === true
  );
  const accepted = !authorityWidened
    && !runtime
    && !universal
    && !operational
    && !physical
    && !continuum
    && !semantic
    && !ashTechnicalLeak;
  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    universal_claim_attempted: universal,
    operational_inverse_attempted: operational,
    physical_claim_attempted: physical,
    continuum_claim_attempted: continuum,
    semantic_hierarchy_attempted: semantic,
    ash_technical_leak_attempted: ashTechnicalLeak,
  });
}
