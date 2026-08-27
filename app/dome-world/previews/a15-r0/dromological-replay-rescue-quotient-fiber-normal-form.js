import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from './dromological-schedule-state-identifiability-lag.js';
import {
  buildReplayAugmentedObservationMatrix,
  enumerateReplayMinors,
  observeReplayAssistedState,
} from './dromological-baseline-replay-rescue-aperture.js';
import {
  dromologicalReplayTransversalityLocusCertificate,
} from './dromological-replay-transversality-unimodular-locus.js';

export const DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_SCHEMA =
  'td613.dome-world.dromological-replay-rescue-quotient-fiber-normal-form/v0.1';
export const DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_PARENT_RECEIPT =
  '79a6533843c4133345bec3c1e83477c621230b09';

const DECLARED_FIBER_COORDINATE_ROW = Object.freeze([1, 0, 0]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

let parentCertificateCache = null;
let normalFormCache = null;

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

function gcd2(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function gcdVector(vector) {
  return vector.reduce((acc, value) => gcd2(acc, value), 0);
}

function primitiveNormalize(vector) {
  assertIntegerVector(vector, 3, 'primitive vector');
  const divisor = gcdVector(vector);
  if (divisor === 0) throw new Error('cannot primitive-normalize the zero vector');
  let result = vector.map(value => canonicalizeZero(value / divisor));
  const first = result.find(value => value !== 0);
  if (first < 0) result = result.map(value => canonicalizeZero(-value));
  return freeze(result);
}

function cross(left, right) {
  assertIntegerVector(left, 3, 'cross left');
  assertIntegerVector(right, 3, 'cross right');
  return freeze([
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ].map(canonicalizeZero));
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => canonicalizeZero(dot(row, vector)));
}

function inverseUnimodular3(matrix) {
  const det = determinant3(matrix);
  if (Math.abs(det) !== 1) throw new Error('normal-form matrix must be unimodular');
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adjugate = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  return freeze(adjugate.map(row => freeze(row.map(value => canonicalizeZero(value / det)))));
}

function parentCertificate() {
  if (parentCertificateCache === null) {
    parentCertificateCache = dromologicalReplayTransversalityLocusCertificate();
  }
  return parentCertificateCache;
}

function deriveNormalForm() {
  if (normalFormCache !== null) return normalFormCache;
  const parent = parentCertificate();
  if (!parent.passed) throw new Error('parent replay-transversality certificate is not witnessed by this tree');
  const pairingRows = parent.inherited_kernel_directions.map(row => freeze([...row]));
  if (pairingRows.length !== 2) throw new Error('normal form requires exactly two inherited rescue-pairing rows');

  const fiberGenerator = primitiveNormalize(cross(pairingRows[0], pairingRows[1]));
  const transform = freeze([
    pairingRows[0],
    pairingRows[1],
    freeze([...DECLARED_FIBER_COORDINATE_ROW]),
  ]);
  const determinant = determinant3(transform);
  const inverse = inverseUnimodular3(transform);

  normalFormCache = freeze({
    pairing_rows: freeze(pairingRows),
    fiber_generator: fiberGenerator,
    declared_fiber_coordinate_row: DECLARED_FIBER_COORDINATE_ROW,
    transform_matrix: transform,
    transform_determinant: determinant,
    inverse_transform_matrix: inverse,
    fiber_maps_to_zero_quotient: pairingRows.every(row => dot(row, fiberGenerator) === 0),
    fiber_coordinate_of_generator: dot(DECLARED_FIBER_COORDINATE_ROW, fiberGenerator),
  });
  return normalFormCache;
}

export function dromologicalReplayRescueNormalForm() {
  return deriveNormalForm();
}

export function replayRescueNormalCoordinates(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  return freeze(matrixTimesVector(deriveNormalForm().transform_matrix, replayRow));
}

export function replayRescueQuotientCoordinate(replayRow) {
  const [qH, qI] = replayRescueNormalCoordinates(replayRow);
  return freeze([qH, qI]);
}

export function replayRowFromNormalCoordinates(coordinates) {
  assertIntegerVector(coordinates, 3, 'replay normal coordinates');
  return freeze(matrixTimesVector(deriveNormalForm().inverse_transform_matrix, coordinates));
}

export function canonicalReplaySection(quotientCoordinate) {
  assertIntegerVector(quotientCoordinate, 2, 'replay quotient coordinate');
  return replayRowFromNormalCoordinates([
    quotientCoordinate[0],
    quotientCoordinate[1],
    0,
  ]);
}

export function translateAlongReplayFiber(replayRow, amount) {
  assertIntegerVector(replayRow, 3, 'replay row');
  if (!Number.isInteger(amount)) throw new Error('fiber translation amount must be an integer');
  const generator = deriveNormalForm().fiber_generator;
  return freeze(replayRow.map((value, index) => value + amount * generator[index]));
}

export function rescueClassificationFromQuotient(quotientCoordinate) {
  assertIntegerVector(quotientCoordinate, 2, 'replay quotient coordinate');
  const [qH, qI] = quotientCoordinate;
  const allSixRankThree = qH !== 0 && qI !== 0;
  const allSixUnimodular = Math.abs(qH) === 1 && Math.abs(qI) === 1;
  return freeze({
    quotient_coordinate: freeze([...quotientCoordinate]),
    all_six_rank_three: allSixRankThree,
    all_six_have_unimodular_minor: allSixUnimodular,
    class: allSixUnimodular
      ? 'UNIMODULAR_INTEGER_RESCUE'
      : allSixRankThree
        ? 'RANK_THREE_RESCUE_WITHOUT_UNIMODULAR_INTEGER_RESCUE'
        : 'INCOMPLETE_RANK_RESCUE',
  });
}

function actualRescueSignature(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const schedules = DROMOLOGICAL_S3_SCHEDULES.map((schedule) => {
    const minors = enumerateReplayMinors(schedule, replayRow);
    return freeze({
      minor_determinants: freeze(minors.map(minor => minor.determinant)),
      rank_three: minors.some(minor => minor.determinant !== 0),
      has_unimodular_minor: minors.some(minor => Math.abs(minor.determinant) === 1),
    });
  });
  return freeze({
    schedules: freeze(schedules),
    all_six_rank_three: schedules.every(row => row.rank_three),
    all_six_have_unimodular_minor: schedules.every(row => row.has_unimodular_minor),
    singular_schedule_minor_signature: freeze(
      schedules.slice(2).map(row => row.minor_determinants),
    ),
  });
}

function isIntegerMultipleOfFiber(vector) {
  assertIntegerVector(vector, 3, 'fiber difference');
  const generator = deriveNormalForm().fiber_generator;
  const pivot = generator.findIndex(value => value !== 0);
  if (pivot < 0) return false;
  if (vector[pivot] % generator[pivot] !== 0) return false;
  const multiplier = vector[pivot] / generator[pivot];
  return vector.every((value, index) => value === multiplier * generator[index]);
}

function vectorDifference(left, right) {
  return freeze(left.map((value, index) => value - right[index]));
}

function vectorAdd(left, right) {
  return freeze(left.map((value, index) => value + right[index]));
}

function scaleVector(vector, scalar) {
  return freeze(vector.map(value => value * scalar));
}

function finiteReplayCubeAudit(limit = 4) {
  const normal = deriveNormalForm();
  let checkedRows = 0;
  let coordinateRoundTrips = 0;
  let exactDecompositions = 0;
  let actualPredicateMatches = 0;
  let singularSignatureFiberMatches = 0;
  let rankRescueRows = 0;
  let unimodularRescueRows = 0;
  let exact = true;

  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const row = [a, b, c];
        const coordinates = replayRescueNormalCoordinates(row);
        const quotient = coordinates.slice(0, 2);
        const recovered = replayRowFromNormalCoordinates(coordinates);
        const section = canonicalReplaySection(quotient);
        const decomposed = vectorAdd(section, scaleVector(normal.fiber_generator, coordinates[2]));
        const predicted = rescueClassificationFromQuotient(quotient);
        const actual = actualRescueSignature(row);
        const representativeActual = actualRescueSignature(section);

        checkedRows += 1;
        if (same(recovered, row)) coordinateRoundTrips += 1;
        else exact = false;
        if (same(decomposed, row)) exactDecompositions += 1;
        else exact = false;
        if (predicted.all_six_rank_three === actual.all_six_rank_three
          && predicted.all_six_have_unimodular_minor === actual.all_six_have_unimodular_minor) {
          actualPredicateMatches += 1;
        } else exact = false;
        if (same(
          actual.singular_schedule_minor_signature,
          representativeActual.singular_schedule_minor_signature,
        )) {
          singularSignatureFiberMatches += 1;
        } else exact = false;
        if (actual.all_six_rank_three) rankRescueRows += 1;
        if (actual.all_six_have_unimodular_minor) unimodularRescueRows += 1;
      }
    }
  }

  const width = 2 * limit + 1;
  const expected = width ** 3;
  return freeze({
    replay_cube_limit: limit,
    checked_replay_rows: checkedRows,
    expected_replay_rows: expected,
    exact_coordinate_round_trips: coordinateRoundTrips,
    exact_decompositions: exactDecompositions,
    actual_rescue_predicate_matches: actualPredicateMatches,
    singular_schedule_signature_fiber_matches: singularSignatureFiberMatches,
    rank_rescue_row_count: rankRescueRows,
    unimodular_rescue_row_count: unimodularRescueRows,
    exact: exact
      && checkedRows === expected
      && coordinateRoundTrips === expected
      && exactDecompositions === expected
      && actualPredicateMatches === expected
      && singularSignatureFiberMatches === expected,
  });
}

function finiteQuotientWindowAudit(limit = 4) {
  let checkedTargets = 0;
  let sectionRoundTrips = 0;
  let actualPredicateMatches = 0;
  let rankRescueTargets = 0;
  let unimodularTargets = 0;
  let exact = true;

  for (let qH = -limit; qH <= limit; qH += 1) {
    for (let qI = -limit; qI <= limit; qI += 1) {
      const quotient = [qH, qI];
      const section = canonicalReplaySection(quotient);
      const recoveredQuotient = replayRescueQuotientCoordinate(section);
      const predicted = rescueClassificationFromQuotient(quotient);
      const actual = actualRescueSignature(section);
      checkedTargets += 1;
      if (same(recoveredQuotient, quotient)) sectionRoundTrips += 1;
      else exact = false;
      if (predicted.all_six_rank_three === actual.all_six_rank_three
        && predicted.all_six_have_unimodular_minor === actual.all_six_have_unimodular_minor) {
        actualPredicateMatches += 1;
      } else exact = false;
      if (predicted.all_six_rank_three) rankRescueTargets += 1;
      if (predicted.all_six_have_unimodular_minor) unimodularTargets += 1;
    }
  }

  const width = 2 * limit + 1;
  const expected = width ** 2;
  return freeze({
    quotient_window_limit: limit,
    checked_quotient_targets: checkedTargets,
    expected_quotient_targets: expected,
    exact_section_round_trips: sectionRoundTrips,
    actual_rescue_predicate_matches: actualPredicateMatches,
    rank_rescue_target_count: rankRescueTargets,
    unimodular_target_count: unimodularTargets,
    exact: exact
      && checkedTargets === expected
      && sectionRoundTrips === expected
      && actualPredicateMatches === expected,
  });
}

function finiteFiberTranslationAudit(baseLimit = 3, translationLimit = 4) {
  let checkedTranslations = 0;
  let quotientInvariant = 0;
  let rescueInvariant = 0;
  let singularSignatureInvariant = 0;
  let nontrivialTranslationsDistinct = 0;
  let exact = true;

  for (let a = -baseLimit; a <= baseLimit; a += 1) {
    for (let b = -baseLimit; b <= baseLimit; b += 1) {
      for (let c = -baseLimit; c <= baseLimit; c += 1) {
        const base = [a, b, c];
        const baseQ = replayRescueQuotientCoordinate(base);
        const baseActual = actualRescueSignature(base);
        for (let n = -translationLimit; n <= translationLimit; n += 1) {
          const translated = translateAlongReplayFiber(base, n);
          const translatedQ = replayRescueQuotientCoordinate(translated);
          const translatedActual = actualRescueSignature(translated);
          checkedTranslations += 1;
          if (same(baseQ, translatedQ)) quotientInvariant += 1;
          else exact = false;
          if (baseActual.all_six_rank_three === translatedActual.all_six_rank_three
            && baseActual.all_six_have_unimodular_minor === translatedActual.all_six_have_unimodular_minor) {
            rescueInvariant += 1;
          } else exact = false;
          if (same(
            baseActual.singular_schedule_minor_signature,
            translatedActual.singular_schedule_minor_signature,
          )) {
            singularSignatureInvariant += 1;
          } else exact = false;
          if (n !== 0) {
            if (!same(base, translated)) nontrivialTranslationsDistinct += 1;
            else exact = false;
          }
        }
      }
    }
  }

  const baseWidth = 2 * baseLimit + 1;
  const translationWidth = 2 * translationLimit + 1;
  const expected = (baseWidth ** 3) * translationWidth;
  const expectedNontrivial = (baseWidth ** 3) * (translationWidth - 1);
  return freeze({
    base_cube_limit: baseLimit,
    translation_limit: translationLimit,
    checked_translations: checkedTranslations,
    expected_translations: expected,
    quotient_invariant_checks: quotientInvariant,
    rescue_invariant_checks: rescueInvariant,
    singular_schedule_signature_invariant_checks: singularSignatureInvariant,
    nontrivial_translations_distinct: nontrivialTranslationsDistinct,
    expected_nontrivial_translations_distinct: expectedNontrivial,
    exact: exact
      && checkedTranslations === expected
      && quotientInvariant === expected
      && rescueInvariant === expected
      && singularSignatureInvariant === expected
      && nontrivialTranslationsDistinct === expectedNontrivial,
  });
}

function finiteFiberCompletenessAudit(limit = 3) {
  const rows = [];
  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) rows.push([a, b, c]);
    }
  }

  let checkedOrderedPairs = 0;
  let equalQuotientPairs = 0;
  let equivalenceMatches = 0;
  let exact = true;
  for (const left of rows) {
    const leftQ = replayRescueQuotientCoordinate(left);
    for (const right of rows) {
      const rightQ = replayRescueQuotientCoordinate(right);
      const quotientEqual = same(leftQ, rightQ);
      const fiberMultiple = isIntegerMultipleOfFiber(vectorDifference(left, right));
      checkedOrderedPairs += 1;
      if (quotientEqual) equalQuotientPairs += 1;
      if (quotientEqual === fiberMultiple) equivalenceMatches += 1;
      else exact = false;
    }
  }

  return freeze({
    finite_cube_limit: limit,
    row_count: rows.length,
    checked_ordered_pairs: checkedOrderedPairs,
    expected_ordered_pairs: rows.length ** 2,
    equal_quotient_ordered_pairs: equalQuotientPairs,
    equivalence_matches: equivalenceMatches,
    exact: exact && equivalenceMatches === checkedOrderedPairs,
  });
}

function namedSeparationControls() {
  const r0 = freeze([1, 0, 0]);
  const r1 = freeze([2, -1, -1]);
  const zero = freeze([0, 0, 0]);
  const hostile = freeze([1, -1, -1]);
  const schedule = DROMOLOGICAL_S3_SCHEDULES[0];
  const witnessState = freeze([1, 0, 0]);

  const r0Q = replayRescueQuotientCoordinate(r0);
  const r1Q = replayRescueQuotientCoordinate(r1);
  const r0Actual = actualRescueSignature(r0);
  const r1Actual = actualRescueSignature(r1);
  const r0Matrix = buildReplayAugmentedObservationMatrix(schedule, r0);
  const r1Matrix = buildReplayAugmentedObservationMatrix(schedule, r1);
  const r0Observation = observeReplayAssistedState(witnessState, schedule, r0);
  const r1Observation = observeReplayAssistedState(witnessState, schedule, r1);
  const zeroActual = actualRescueSignature(zero);
  const hostileActual = actualRescueSignature(hostile);

  return freeze({
    same_fiber_unimodular_pair: freeze({
      left: r0,
      right: r1,
      quotient: r0Q,
      same_quotient: same(r0Q, r1Q),
      same_rescue_status: r0Actual.all_six_rank_three === r1Actual.all_six_rank_three
        && r0Actual.all_six_have_unimodular_minor === r1Actual.all_six_have_unimodular_minor,
      both_unimodular_rescue: r0Actual.all_six_have_unimodular_minor
        && r1Actual.all_six_have_unimodular_minor,
      replay_rows_distinct: !same(r0, r1),
      augmented_matrices_distinct: !same(r0Matrix, r1Matrix),
      witness_state: witnessState,
      full_observations_distinct: !same(r0Observation, r1Observation),
      left_observation: r0Observation,
      right_observation: r1Observation,
      singular_schedule_minor_signatures_equal: same(
        r0Actual.singular_schedule_minor_signature,
        r1Actual.singular_schedule_minor_signature,
      ),
    }),
    null_fiber_pair: freeze({
      left: zero,
      right: hostile,
      same_zero_quotient: same(
        replayRescueQuotientCoordinate(zero),
        replayRescueQuotientCoordinate(hostile),
      ) && same(replayRescueQuotientCoordinate(zero), [0, 0]),
      both_fail_all_six_rank_rescue: !zeroActual.all_six_rank_three
        && !hostileActual.all_six_rank_three,
      replay_rows_distinct: !same(zero, hostile),
    }),
  });
}

export function dromologicalReplayRescueQuotientCertificate() {
  const parent = parentCertificate();
  const normal = deriveNormalForm();
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const cube = finiteReplayCubeAudit(4);
  const quotientWindow = finiteQuotientWindowAudit(4);
  const translation = finiteFiberTranslationAudit(3, 4);
  const completeness = finiteFiberCompletenessAudit(3);
  const named = namedSeparationControls();

  const expectedInverse = [[0, 0, 1], [1, 0, -1], [0, 1, -1]];
  const normalExact = same(normal.pairing_rows, [[1, 1, 0], [1, 0, 1]])
    && same(normal.fiber_generator, [1, -1, -1])
    && normal.transform_determinant === 1
    && same(normal.inverse_transform_matrix, expectedInverse)
    && normal.fiber_maps_to_zero_quotient
    && normal.fiber_coordinate_of_generator === 1;

  const namedExact = named.same_fiber_unimodular_pair.same_quotient
    && named.same_fiber_unimodular_pair.same_rescue_status
    && named.same_fiber_unimodular_pair.both_unimodular_rescue
    && named.same_fiber_unimodular_pair.replay_rows_distinct
    && named.same_fiber_unimodular_pair.augmented_matrices_distinct
    && named.same_fiber_unimodular_pair.full_observations_distinct
    && named.same_fiber_unimodular_pair.singular_schedule_minor_signatures_equal
    && named.null_fiber_pair.same_zero_quotient
    && named.null_fiber_pair.both_fail_all_six_rank_rescue
    && named.null_fiber_pair.replay_rows_distinct;

  const historicalRanksPreserved = same(
    atlas.schedules.map(row => row.observation_rank),
    [3, 3, 2, 2, 2, 2],
  );
  const scheduleIdentitySeparate = lag.passed && lag.minimal_schedule_identification_prefix === 2;

  const passed = parent.passed
    && normalExact
    && cube.exact
    && cube.checked_replay_rows === 729
    && quotientWindow.exact
    && quotientWindow.checked_quotient_targets === 81
    && quotientWindow.rank_rescue_target_count === 64
    && quotientWindow.unimodular_target_count === 4
    && translation.exact
    && translation.checked_translations === 3087
    && completeness.exact
    && completeness.checked_ordered_pairs === 117649
    && completeness.equal_quotient_ordered_pairs === 1225
    && namedExact
    && historicalRanksPreserved
    && scheduleIdentitySeparate;

  return freeze({
    schema: DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_SCHEMA,
    parent_receipt: DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_PARENT_RECEIPT,
    normal_form: normal,
    exact_sequence: '0 -> Z --(1,-1,-1)--> Z^3 --Q--> Z^2 -> 0',
    quotient_map: 'Q(a,b,c)=(a+b,a+c)',
    splitting_section: 's(u,v)=(0,u,v)',
    inverse_normal_form: '[a,b,c]=[t,q_H-t,q_I-t]',
    rank_rescue_quotient_locus: 'q_H!=0 AND q_I!=0',
    unimodular_rescue_quotient_locus: 'q_H,q_I in {-1,+1}',
    finite_replay_cube_audit: cube,
    finite_quotient_window_audit: quotientWindow,
    finite_fiber_translation_audit: translation,
    finite_fiber_completeness_audit: completeness,
    named_separation_controls: named,
    replay_removal_preserves_historical_rank_profile: historicalRanksPreserved,
    schedule_identity_already_exact_at_prefix_two: scheduleIdentitySeparate,
    passed,
    classification: passed
      ? 'THE_FIXED_S3_INTEGER_REPLAY_SPACE_ADMITS_A_UNIMODULAR_NORMAL_FORM_Z3_ISOMORPHIC_TO_Z2_CROSS_Z_WITH_COORDINATES_Q_H_Q_I_T_WHERE_THE_DECLARED_RESCUE_CLASSIFICATION_FACTORS_THROUGH_THE_Z2_QUOTIENT_AND_T_PARAMETERIZES_THE_EXACT_INTEGER_FIBER'
      : 'FIXED_S3_REPLAY_RESCUE_QUOTIENT_NORMAL_FORM_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'IN_THE_FIXED_S3_FIXTURE_REPLAY_IDENTITY_CAN_CONTAIN_AN_INTEGER_FIBER_COORDINATE_THAT_IS_INVISIBLE_TO_RESCUE_CLASSIFICATION_WHILE_REMAINING_VISIBLE_TO_THE_FULL_REPLAY_OBSERVATION_TRANSCRIPT'
      : 'REPLAY_RESCUE_QUOTIENT_FIBER_SEPARATION_NOT_ESTABLISHED',
    scars: freeze([
      'SAME_RESCUE_QUOTIENT != SAME_REPLAY_ROW',
      'SAME_RESCUE_QUOTIENT != SAME_AUGMENTED_OBSERVATION_MATRIX',
      'SAME_RESCUE_QUOTIENT != SAME_FULL_OBSERVATION_TRANSCRIPT',
      'RESCUE_CLASSIFICATION_FACTORING != INFORMATION_ERASURE_FROM_THE_SOURCE_RECORD',
      'INTEGER_FIBER != PHYSICAL_GAUGE_ORBIT',
      'SPLIT_EXACT_SEQUENCE != OPERATIONAL_INVERSE_ROUTE',
      'UNIMODULAR_COORDINATE_CHANGE != UNIVERSAL_SENSOR_OPTIMALITY',
      'QUOTIENT_COMPLETE_FOR_DECLARED_RESCUE_COORDINATES != SEMANTIC_EQUIVALENCE',
      'FINITE_FIBER_CERTIFICATE != ASYMPTOTIC_RECOVERY_THEOREM',
    ]),
  });
}

export function compileDromologicalReplayRescueQuotientProjection(receiver) {
  const certificate = dromologicalReplayRescueQuotientCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified replay-rescue quotient normal form');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-rescue-quotient-child-legible/v0.1',
      truths: freeze([
        'MANY_DIFFERENT_EXTRA_CHECKS_CAN_HAVE_THE_SAME_RESCUE_EFFECT',
        'THE_RESCUE_EFFECT_DOES_NOT_TELL_US_WHICH_EXACT_EXTRA_CHECK_WAS_USED',
        'FOUR_RESCUE_EFFECTS_HAVE_EXACT_INTEGER_KEYS_IN_THIS_FIXTURE',
        'THE_FULL_OBSERVATION_CAN_STILL_TELL_APART_CHECKS_WITH_THE_SAME_RESCUE_EFFECT',
      ]),
      quotient_matrix_exposed: false,
      fiber_vector_exposed: false,
      affine_fiber_equations_exposed: false,
      replay_vectors_exposed: false,
      inverse_formulas_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-rescue-quotient-loom-technical/v0.1',
      normal_form: certificate.normal_form,
      exact_sequence: certificate.exact_sequence,
      quotient_map: certificate.quotient_map,
      splitting_section: certificate.splitting_section,
      finite_replay_cube_audit: certificate.finite_replay_cube_audit,
      finite_quotient_window_audit: certificate.finite_quotient_window_audit,
      finite_fiber_translation_audit: certificate.finite_fiber_translation_audit,
      finite_fiber_completeness_audit: certificate.finite_fiber_completeness_audit,
    });
  } else {
    throw new Error(`undeclared AIA receiver for replay-rescue quotient: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_REPLAY_RESCUE_QUOTIENT_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_integer_quotient: true,
      universal_replay_theorem: false,
      universal_quotient_theorem: false,
      universal_sufficient_statistic: false,
      optimal_sensor_theorem: false,
      physical_gauge_orbit: false,
      continuum_tomography: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      semantic_equivalence: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalReplayRescueQuotientOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const universal = ceiling.universal_replay_theorem === true
    || ceiling.universal_quotient_theorem === true
    || ceiling.universal_sufficient_statistic === true
    || ceiling.optimal_sensor_theorem === true;
  const physical = ceiling.physical_gauge_orbit === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true;
  const continuum = ceiling.continuum_tomography === true;
  const semantic = ceiling.semantic_equivalence === true;
  const operationalInverse = ceiling.operational_inverse_route === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.quotient_matrix_exposed === true
    || candidate?.payload?.fiber_vector_exposed === true
    || candidate?.payload?.affine_fiber_equations_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.inverse_formulas_exposed === true
    || candidate?.payload?.latent_coordinates_exposed === true
  );

  const accepted = !authorityWidened
    && !runtime
    && !universal
    && !physical
    && !continuum
    && !semantic
    && !operationalInverse
    && !ashTechnicalLeak;

  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    universal_claim_attempted: universal,
    physical_claim_attempted: physical,
    continuum_claim_attempted: continuum,
    semantic_equivalence_attempted: semantic,
    operational_inverse_route_attempted: operationalInverse,
    ash_technical_leak_attempted: ashTechnicalLeak,
  });
}
