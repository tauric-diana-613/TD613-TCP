import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
  dromologicalS3ScheduleAtlasCertificate,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from './dromological-schedule-state-identifiability-lag.js';
import {
  DROMOLOGICAL_BASELINE_REPLAY_ROW,
  DROMOLOGICAL_HOSTILE_REPLAY_ROW,
  buildReplayAugmentedObservationMatrix,
  enumerateReplayMinors,
  observeReplayAssistedState,
  dromologicalBaselineReplayRescueCertificate,
} from './dromological-baseline-replay-rescue-aperture.js';

export const DROMOLOGICAL_REPLAY_TRANSVERSALITY_LOCUS_SCHEMA =
  'td613.dome-world.dromological-replay-transversality-unimodular-locus/v0.1';
export const DROMOLOGICAL_REPLAY_TRANSVERSALITY_PARENT_RECEIPT =
  '5fcaf191b7dbed9529687ed3c072107a37a54814';

export const DROMOLOGICAL_REPLAY_BASIS_ROWS = Object.freeze([
  Object.freeze([1, 0, 0]),
  Object.freeze([0, 1, 0]),
  Object.freeze([0, 0, 1]),
]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
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

function assertIntegerVector(vector, length, label) {
  if (!Array.isArray(vector) || vector.length !== length || !vector.every(Number.isInteger)) {
    throw new Error(`${label} must be an integer vector of length ${length}`);
  }
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function tripleRowIndexSets(rowCount) {
  const triples = [];
  for (let a = 0; a < rowCount; a += 1) {
    for (let b = a + 1; b < rowCount; b += 1) {
      for (let c = b + 1; c < rowCount; c += 1) {
        triples.push(freeze([a, b, c]));
      }
    }
  }
  return freeze(triples);
}

function rankRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.some(row => !Array.isArray(row) || row.length !== 3)) {
    throw new Error('rankRows expects one or more three-coordinate rows');
  }
  if (tripleRowIndexSets(rows.length).some(indices => (
    determinant3(indices.map(index => rows[index])) !== 0
  ))) return 3;

  for (let r1 = 0; r1 < rows.length; r1 += 1) {
    for (let r2 = r1 + 1; r2 < rows.length; r2 += 1) {
      for (let c1 = 0; c1 < 3; c1 += 1) {
        for (let c2 = c1 + 1; c2 < 3; c2 += 1) {
          if (rows[r1][c1] * rows[r2][c2] - rows[r1][c2] * rows[r2][c1] !== 0) return 2;
        }
      }
    }
  }
  return rows.some(row => row.some(value => value !== 0)) ? 1 : 0;
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function canonicalizeZero(value) {
  return value === 0 ? 0 : value;
}

function canonicalPrimitiveSign(vector) {
  assertIntegerVector(vector, 3, 'coefficient vector');
  const first = vector.find(value => value !== 0);
  if (first === undefined) return freeze([0, 0, 0]);
  const sign = first < 0 ? -1 : 1;
  return freeze(vector.map(value => canonicalizeZero(value * sign)));
}

function uniqueVectors(vectors) {
  const map = new Map();
  vectors.forEach((vector) => map.set(JSON.stringify(vector), vector));
  return freeze([...map.values()].map(vector => freeze([...vector])));
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => dot(row, vector));
}

function inverseUnimodular3(matrix, observation) {
  assertIntegerVector(observation, 3, 'selected replay-locus observation');
  const det = determinant3(matrix);
  if (Math.abs(det) !== 1) {
    throw new Error('replay-locus inverse requires an exact unimodular selected minor');
  }

  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adjugate = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  const numerator = matrixTimesVector(adjugate, observation);
  const recovered = numerator.map(value => canonicalizeZero(value / det));
  if (!recovered.every(Number.isInteger)) {
    throw new Error('replay-locus unimodular inverse produced a noninteger coordinate');
  }
  return freeze(recovered);
}

function determinantForRows(matrix, rows) {
  return determinant3(rows.map(index => matrix[index]));
}

export function deriveReplayMinorLinearForms(schedule) {
  const zeroReplay = [0, 0, 0];
  const zeroMatrix = buildReplayAugmentedObservationMatrix(schedule, zeroReplay);
  return freeze(tripleRowIndexSets(4).map((rows) => {
    const replayDependent = rows.includes(3);
    if (!replayDependent) {
      return freeze({
        rows,
        replay_dependent: false,
        constant_determinant: determinantForRows(zeroMatrix, rows),
        coefficients: null,
        zero_at_replay_origin: null,
      });
    }

    const coefficients = DROMOLOGICAL_REPLAY_BASIS_ROWS.map((basisRow) => {
      const matrix = buildReplayAugmentedObservationMatrix(schedule, basisRow);
      return determinantForRows(matrix, rows);
    });
    return freeze({
      rows,
      replay_dependent: true,
      constant_determinant: 0,
      coefficients: freeze(coefficients),
      zero_at_replay_origin: determinantForRows(zeroMatrix, rows) === 0,
    });
  }));
}

export function evaluateReplayMinorLinearForm(form, replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  if (form.replay_dependent !== true) return form.constant_determinant;
  return dot(form.coefficients, replayRow);
}

function deriveKernelDirections() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const directions = atlas.schedules
    .filter(row => row.kernel_generator !== null)
    .map(row => canonicalPrimitiveSign(row.kernel_generator));
  return uniqueVectors(directions);
}

function scheduleLinearFormCertificate(schedule) {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const atlasRow = atlas.schedules.find(row => row.schedule_id === scheduleId(schedule));
  const forms = deriveReplayMinorLinearForms(schedule);
  const replayForms = forms.filter(form => form.replay_dependent);
  const nonzeroCoefficientDirections = uniqueVectors(
    replayForms
      .filter(form => form.coefficients.some(value => value !== 0))
      .map(form => canonicalPrimitiveSign(form.coefficients)),
  );
  const inheritedKernel = atlasRow.kernel_generator
    ? canonicalPrimitiveSign(atlasRow.kernel_generator)
    : null;

  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: scheduleId(schedule),
    inherited_observation_rank: atlasRow.observation_rank,
    inherited_kernel_generator: atlasRow.kernel_generator,
    minor_linear_forms: forms,
    replay_dependent_nonzero_coefficient_directions: nonzeroCoefficientDirections,
    coefficient_direction_matches_inherited_kernel: inheritedKernel === null
      ? nonzeroCoefficientDirections.length >= 0
      : nonzeroCoefficientDirections.length === 1
        && same(nonzeroCoefficientDirections[0], inheritedKernel),
  });
}

export function classifyDromologicalReplayRow(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const kernelDirections = deriveKernelDirections();
  const pairings = freeze(kernelDirections.map(kernel => freeze({
    kernel_direction: kernel,
    pairing: dot(replayRow, kernel),
  })));
  const schedules = freeze(DROMOLOGICAL_S3_SCHEDULES.map((schedule) => {
    const augmented = buildReplayAugmentedObservationMatrix(schedule, replayRow);
    const minors = enumerateReplayMinors(schedule, replayRow);
    return freeze({
      schedule_id: scheduleId(schedule),
      augmented_rank: rankRows(augmented),
      minor_determinants: freeze(minors.map(minor => minor.determinant)),
      has_unimodular_minor: minors.some(minor => Math.abs(minor.determinant) === 1),
    });
  }));

  const actualRankRescue = schedules.every(row => row.augmented_rank === 3);
  const actualUnimodularRescue = schedules.every(row => row.has_unimodular_minor);
  const predictedRankRescue = pairings.every(row => row.pairing !== 0);
  const predictedUnimodularRescue = pairings.every(row => Math.abs(row.pairing) === 1);

  return freeze({
    replay_row: freeze([...replayRow]),
    missing_direction_pairings: pairings,
    schedules,
    actual_all_six_rank_three: actualRankRescue,
    actual_all_six_have_unimodular_minor: actualUnimodularRescue,
    kernel_pairing_predicts_all_six_rank_three: predictedRankRescue,
    unit_kernel_pairing_predicts_unimodular_rescue: predictedUnimodularRescue,
    rank_predicate_matches_actual: predictedRankRescue === actualRankRescue,
    unimodular_predicate_matches_actual: predictedUnimodularRescue === actualUnimodularRescue,
    classification: actualUnimodularRescue
      ? 'UNIMODULAR_INTEGER_RESCUE'
      : actualRankRescue
        ? 'RANK_THREE_RESCUE_WITHOUT_UNIMODULAR_INTEGER_RESCUE'
        : 'INCOMPLETE_RANK_RESCUE',
  });
}

export function parameterizeUnimodularReplayRow(t, epsH, epsI) {
  if (!Number.isInteger(t)) throw new Error('replay-family parameter t must be an integer');
  if (![1, -1].includes(epsH) || ![1, -1].includes(epsI)) {
    throw new Error('replay-family signs must each be +1 or -1');
  }
  return freeze([t, epsH - t, epsI - t]);
}

export function invertReplayLocusObservation(observation, schedule, replayRow) {
  assertIntegerVector(observation, 4, 'replay-locus observation');
  assertIntegerVector(replayRow, 3, 'replay row');
  const matrix = buildReplayAugmentedObservationMatrix(schedule, replayRow);
  const selected = enumerateReplayMinors(schedule, replayRow)
    .find(minor => Math.abs(minor.determinant) === 1);
  if (!selected) {
    throw new Error('declared replay row does not provide a unimodular minor for this schedule');
  }
  const selectedMatrix = selected.rows.map(index => matrix[index]);
  const selectedObservation = selected.rows.map(index => observation[index]);
  return inverseUnimodular3(selectedMatrix, selectedObservation);
}

function finiteReplayCubeAudit(limit = 4) {
  let checkedRows = 0;
  let checkedScheduleRows = 0;
  let checkedMinorDeterminants = 0;
  let rankRescueRows = 0;
  let unimodularRescueRows = 0;
  let exact = true;

  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const replayRow = [a, b, c];
        const classification = classifyDromologicalReplayRow(replayRow);
        checkedRows += 1;
        checkedScheduleRows += classification.schedules.length;
        checkedMinorDeterminants += classification.schedules
          .reduce((sum, row) => sum + row.minor_determinants.length, 0);
        if (classification.actual_all_six_rank_three) rankRescueRows += 1;
        if (classification.actual_all_six_have_unimodular_minor) unimodularRescueRows += 1;
        if (!classification.rank_predicate_matches_actual
          || !classification.unimodular_predicate_matches_actual) exact = false;

        for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
          const forms = deriveReplayMinorLinearForms(schedule);
          const actual = enumerateReplayMinors(schedule, replayRow);
          if (!forms.every((form, index) => (
            evaluateReplayMinorLinearForm(form, replayRow) === actual[index].determinant
          ))) exact = false;
        }
      }
    }
  }

  const width = 2 * limit + 1;
  return freeze({
    replay_cube_limit: limit,
    checked_replay_rows: checkedRows,
    expected_replay_rows: width ** 3,
    checked_schedule_rows: checkedScheduleRows,
    expected_schedule_rows: (width ** 3) * 6,
    checked_minor_determinants: checkedMinorDeterminants,
    expected_minor_determinants: (width ** 3) * 6 * 4,
    rank_rescue_row_count: rankRescueRows,
    unimodular_rescue_row_count: unimodularRescueRows,
    exact: exact
      && checkedRows === width ** 3
      && checkedScheduleRows === (width ** 3) * 6
      && checkedMinorDeterminants === (width ** 3) * 6 * 4,
  });
}

function finiteAffineFamilyReconstructionCertificate() {
  let sampledReplayRows = 0;
  let checkedReconstructions = 0;
  let exact = true;
  const seen = new Set();

  for (const epsH of [-1, 1]) {
    for (const epsI of [-1, 1]) {
      for (let t = -3; t <= 3; t += 1) {
        const replayRow = parameterizeUnimodularReplayRow(t, epsH, epsI);
        seen.add(JSON.stringify(replayRow));
        sampledReplayRows += 1;
        const classification = classifyDromologicalReplayRow(replayRow);
        if (!classification.actual_all_six_have_unimodular_minor) exact = false;

        for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
          for (let x1 = -2; x1 <= 2; x1 += 1) {
            for (let x2 = -2; x2 <= 2; x2 += 1) {
              for (let x3 = -2; x3 <= 2; x3 += 1) {
                const state = [x1, x2, x3];
                const observation = observeReplayAssistedState(state, schedule, replayRow);
                const recovered = invertReplayLocusObservation(observation, schedule, replayRow);
                checkedReconstructions += 1;
                if (!same(state, recovered)) exact = false;
              }
            }
          }
        }
      }
    }
  }

  return freeze({
    sampled_affine_family_rows_with_multiplicity: sampledReplayRows,
    expected_sampled_affine_family_rows_with_multiplicity: 28,
    distinct_sampled_replay_rows: seen.size,
    checked_state_schedule_reconstructions: checkedReconstructions,
    expected_state_schedule_reconstructions: 21000,
    exact: exact
      && sampledReplayRows === 28
      && checkedReconstructions === 21000,
  });
}

function finiteNamedHostileCertificate() {
  const baseline = classifyDromologicalReplayRow(DROMOLOGICAL_BASELINE_REPLAY_ROW);
  const doubleNull = classifyDromologicalReplayRow(DROMOLOGICAL_HOSTILE_REPLAY_ROW);
  const hOnly = classifyDromologicalReplayRow([1, 0, -1]);
  const iOnly = classifyDromologicalReplayRow([1, -1, 0]);
  const rankOnly = classifyDromologicalReplayRow([2, 0, 0]);
  const mixed = classifyDromologicalReplayRow([2, -1, 0]);

  return freeze({
    baseline,
    double_null: doubleNull,
    h_only: hOnly,
    i_only: iOnly,
    rank_only: rankOnly,
    mixed_unit_nonunit: mixed,
    passed:
      baseline.classification === 'UNIMODULAR_INTEGER_RESCUE'
      && doubleNull.actual_all_six_rank_three === false
      && hOnly.actual_all_six_rank_three === false
      && iOnly.actual_all_six_rank_three === false
      && rankOnly.classification === 'RANK_THREE_RESCUE_WITHOUT_UNIMODULAR_INTEGER_RESCUE'
      && mixed.classification === 'RANK_THREE_RESCUE_WITHOUT_UNIMODULAR_INTEGER_RESCUE',
  });
}

export function dromologicalReplayTransversalityLocusCertificate() {
  const parent = dromologicalBaselineReplayRescueCertificate();
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const linearFormAtlas = freeze(DROMOLOGICAL_S3_SCHEDULES.map(scheduleLinearFormCertificate));
  const kernelDirections = deriveKernelDirections();
  const exactExpectedKernelDirections = same(kernelDirections, [[1, 1, 0], [1, 0, 1]]);
  const rankTwoRows = linearFormAtlas.filter(row => row.inherited_observation_rank === 2);
  const coefficientKernelAlignment = rankTwoRows.length === 4
    && rankTwoRows.every(row => row.coefficient_direction_matches_inherited_kernel === true);
  const allReplayDependentFormsVanishAtOrigin = linearFormAtlas.every(row => (
    row.minor_linear_forms
      .filter(form => form.replay_dependent)
      .every(form => form.zero_at_replay_origin === true)
  ));

  const namedHostiles = finiteNamedHostileCertificate();
  const cube = finiteReplayCubeAudit(4);
  const affineFamily = finiteAffineFamilyReconstructionCertificate();
  const originalRanksPreserved = same(
    atlas.schedules.map(row => row.observation_rank),
    [3, 3, 2, 2, 2, 2],
  );
  const scheduleIdentitySeparate = lag.passed
    && lag.minimal_schedule_identification_prefix === 2;

  const passed = parent.passed
    && atlas.passed
    && lag.passed
    && exactExpectedKernelDirections
    && coefficientKernelAlignment
    && allReplayDependentFormsVanishAtOrigin
    && namedHostiles.passed
    && cube.exact
    && cube.checked_replay_rows === 729
    && cube.checked_schedule_rows === 4374
    && cube.checked_minor_determinants === 17496
    && affineFamily.exact
    && originalRanksPreserved
    && scheduleIdentitySeparate;

  return freeze({
    schema: DROMOLOGICAL_REPLAY_TRANSVERSALITY_LOCUS_SCHEMA,
    parent_receipt: DROMOLOGICAL_REPLAY_TRANSVERSALITY_PARENT_RECEIPT,
    parent_baseline_replay_certificate_passed: parent.passed,
    inherited_kernel_directions: kernelDirections,
    inherited_kernel_directions_match_witnessed_fixture: exactExpectedKernelDirections,
    replay_minor_linear_form_atlas: linearFormAtlas,
    replay_minor_coefficients_align_with_inherited_missing_directions: coefficientKernelAlignment,
    rank_rescue_predicate: '(a+b)!=0 AND (a+c)!=0',
    unimodular_rescue_predicate: 'abs(a+b)==1 AND abs(a+c)==1',
    unimodular_affine_family: '[t, eps_H-t, eps_I-t] with t in Z and eps_H,eps_I in {-1,+1}',
    finite_named_hostiles: namedHostiles,
    finite_replay_cube_audit: cube,
    finite_affine_family_reconstruction_certificate: affineFamily,
    replay_removal_preserves_historical_rank_profile: originalRanksPreserved,
    schedule_identity_already_exact_at_prefix_two: scheduleIdentitySeparate,
    passed,
    rank_classification: passed
      ? 'THE_FIXED_S3_REPLAY_RANK_RESCUE_LOCUS_IS_EXACTLY_THE_COMPLEMENT_OF_THE_TWO_KERNEL_ORTHOGONALITY_PLANES_A_PLUS_B_EQUALS_ZERO_AND_A_PLUS_C_EQUALS_ZERO'
      : 'FIXED_S3_REPLAY_RANK_RESCUE_LOCUS_NOT_ESTABLISHED',
    unimodular_classification: passed
      ? 'THE_FIXED_S3_UNIMODULAR_REPLAY_RESCUE_LOCUS_IS_EXACTLY_THE_UNION_OF_FOUR_AFFINE_INTEGER_LINES_DEFINED_BY_UNIT_PAIRING_WITH_BOTH_WITNESSED_MISSING_DIRECTIONS'
      : 'FIXED_S3_UNIMODULAR_REPLAY_RESCUE_LOCUS_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'IN_THE_FIXED_S3_FIXTURE_NONZERO_TRANSVERSALITY_TO_EACH_MISSING_DIRECTION_IS_NECESSARY_AND_SUFFICIENT_FOR_RANK_RESCUE_WHILE_UNIT_TRANSVERSALITY_IS_NECESSARY_AND_SUFFICIENT_FOR_UNIMODULAR_INTEGER_RESCUE'
      : 'REPLAY_TRANSVERSALITY_CLASSIFICATION_NOT_ESTABLISHED',
    scars: freeze([
      'RANK_RESCUE != UNIMODULAR_INTEGER_RESCUE',
      'NONZERO_KERNEL_PAIRING != UNIT_KERNEL_PAIRING',
      'REPLAY_TRANSVERSALITY_IN_THIS_FIXTURE != UNIVERSAL_SENSOR_DESIGN',
      'AFFINE_RESCUE_LOCUS != PHYSICAL_SENSOR_MANIFOLD',
      'INTEGER_PARAMETRIC_CLASSIFICATION != ASYMPTOTIC_RECOVERY_THEOREM',
      'PROBE_FAMILY != OPERATIONAL_INVERSE_ROUTE',
      'MISSING_DIRECTION_PAIRING != SEMANTIC_CAUSATION',
      'EXACT_RESCUE_LOCUS != RETROACTIVE_INFORMATION_EXISTENCE',
      'REPAIRED_IDENTIFIABILITY != ERASURE_OF_PRIOR_NONIDENTIFIABILITY',
    ]),
  });
}

export function compileDromologicalReplayTransversalityProjection(receiver) {
  const certificate = dromologicalReplayTransversalityLocusCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified replay-transversality locus');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-transversality-child-legible/v0.1',
      truths: freeze([
        'SOME_EXTRA_CHECKS_MISS_THE_MISSING_CLUE',
        'SOME_EXTRA_CHECKS_SEE_IT_BUT_NOT_WITH_AN_EXACT_INTEGER_KEY',
        'FOUR_SIMPLE_FAMILIES_OF_CHECKS_GIVE_AN_EXACT_INTEGER_KEY_IN_THIS_FIXTURE',
        'THE_OLD_MISSING_CLUE_REMAINS_A_TRUE_FACT_ABOUT_THE_OLD_RECORD',
      ]),
      replay_vectors_exposed: false,
      affine_family_equations_exposed: false,
      determinant_coefficients_exposed: false,
      kernel_vectors_exposed: false,
      inverse_formulas_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-transversality-loom-technical/v0.1',
      kernel_directions: certificate.inherited_kernel_directions,
      replay_minor_linear_form_atlas: certificate.replay_minor_linear_form_atlas,
      rank_rescue_predicate: certificate.rank_rescue_predicate,
      unimodular_rescue_predicate: certificate.unimodular_rescue_predicate,
      unimodular_affine_family: certificate.unimodular_affine_family,
      finite_replay_cube_audit: certificate.finite_replay_cube_audit,
      finite_affine_family_reconstruction_certificate:
        certificate.finite_affine_family_reconstruction_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for replay-transversality locus: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_REPLAY_TRANSVERSALITY_LOCUS_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_replay_locus: true,
      universal_replay_theorem: false,
      universal_sensor_design: false,
      optimal_sensor_theorem: false,
      asymptotic_recovery_theorem: false,
      physical_sensor_manifold: false,
      continuum_tomography: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      semantic_causation: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalReplayTransversalityOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const universal = ceiling.universal_replay_theorem === true
    || ceiling.universal_sensor_design === true
    || ceiling.optimal_sensor_theorem === true
    || ceiling.asymptotic_recovery_theorem === true;
  const physical = ceiling.physical_sensor_manifold === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true;
  const continuum = ceiling.continuum_tomography === true;
  const semantic = ceiling.semantic_causation === true;
  const operationalInverse = ceiling.operational_inverse_route === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.affine_family_equations_exposed === true
    || candidate?.payload?.determinant_coefficients_exposed === true
    || candidate?.payload?.kernel_vectors_exposed === true
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
    semantic_causation_attempted: semantic,
    operational_inverse_route_attempted: operationalInverse,
    ash_technical_leak_attempted: ashTechnicalLeak,
  });
}
