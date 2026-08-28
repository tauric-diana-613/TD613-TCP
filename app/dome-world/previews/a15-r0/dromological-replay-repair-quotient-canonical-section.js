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
  deriveReplayMinorLinearForms,
  evaluateReplayMinorLinearForm,
  classifyDromologicalReplayRow,
  dromologicalReplayTransversalityLocusCertificate,
} from './dromological-replay-transversality-unimodular-locus.js';

export const DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_SCHEMA =
  'td613.dome-world.dromological-replay-repair-quotient-canonical-section/v0.1';
export const DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_PARENT_RECEIPT =
  '79a6533843c4133345bec3c1e83477c621230b09';

export const DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX = Object.freeze([
  Object.freeze([1, 1, 0]),
  Object.freeze([1, 0, 1]),
]);
export const DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR = Object.freeze([1, -1, -1]);

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

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function subtract(left, right) {
  return left.map((value, index) => value - right[index]);
}

function add(left, right) {
  return left.map((value, index) => value + right[index]);
}

function scale(vector, scalar) {
  return vector.map(value => value * scalar);
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

export function dromologicalRepairSignature(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  return freeze(DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX.map(row => dot(row, replayRow)));
}

export function canonicalReplayRepairRepresentative(signature) {
  assertIntegerVector(signature, 2, 'repair signature');
  return freeze([0, signature[0], signature[1]]);
}

export function decomposeReplayRepairRow(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const signature = dromologicalRepairSignature(replayRow);
  const representative = canonicalReplayRepairRepresentative(signature);
  const fiberCoordinate = replayRow[0];
  const nullComponent = freeze(scale(DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR, fiberCoordinate));
  const recomposed = freeze(add(representative, nullComponent));
  const nullSignature = dromologicalRepairSignature(nullComponent);

  return freeze({
    replay_row: freeze([...replayRow]),
    repair_signature: signature,
    canonical_representative: representative,
    null_fiber_coordinate: fiberCoordinate,
    null_fiber_component: nullComponent,
    null_fiber_component_signature: nullSignature,
    recomposed,
    exact_recomposition: same(recomposed, replayRow),
    null_component_in_kernel: same(nullSignature, [0, 0]),
    canonical_representative_first_coordinate_zero: representative[0] === 0,
  });
}

export function replayRowsDifferByNullFiber(left, right) {
  assertIntegerVector(left, 3, 'left replay row');
  assertIntegerVector(right, 3, 'right replay row');
  const difference = subtract(left, right);
  const t = difference[0];
  const expected = scale(DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR, t);
  return freeze({
    difference: freeze(difference),
    fiber_multiple: t,
    expected_null_fiber_difference: freeze(expected),
    lies_on_null_fiber: same(difference, expected),
  });
}

function inheritedSingularSchedules() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  return atlas.schedules
    .filter(row => row.observation_rank === 2)
    .map(row => row.schedule);
}

function inheritedPFirstSchedules() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  return atlas.schedules
    .filter(row => row.observation_rank === 3)
    .map(row => row.schedule);
}

function replayDependentMinorValues(schedule, replayRow) {
  return freeze(deriveReplayMinorLinearForms(schedule)
    .filter(form => form.replay_dependent)
    .map(form => evaluateReplayMinorLinearForm(form, replayRow)));
}

export function replayRepairDeterminantAtlas(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  return freeze(inheritedSingularSchedules().map(schedule => freeze({
    schedule_id: scheduleId(schedule),
    replay_dependent_minor_values: replayDependentMinorValues(schedule, replayRow),
  })));
}

export function pFirstReplaySideMinorAtlas(replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  return freeze(inheritedPFirstSchedules().map(schedule => freeze({
    schedule_id: scheduleId(schedule),
    replay_dependent_minor_values: replayDependentMinorValues(schedule, replayRow),
  })));
}

export function compareReplayRepairRows(left, right) {
  assertIntegerVector(left, 3, 'left replay row');
  assertIntegerVector(right, 3, 'right replay row');
  const leftSignature = dromologicalRepairSignature(left);
  const rightSignature = dromologicalRepairSignature(right);
  const nullFiber = replayRowsDifferByNullFiber(left, right);
  const leftRepairAtlas = replayRepairDeterminantAtlas(left);
  const rightRepairAtlas = replayRepairDeterminantAtlas(right);
  const leftPFirstAtlas = pFirstReplaySideMinorAtlas(left);
  const rightPFirstAtlas = pFirstReplaySideMinorAtlas(right);

  return freeze({
    left: freeze([...left]),
    right: freeze([...right]),
    left_signature: leftSignature,
    right_signature: rightSignature,
    same_repair_signature: same(leftSignature, rightSignature),
    null_fiber_relation: nullFiber,
    same_repair_determinant_atlas: same(leftRepairAtlas, rightRepairAtlas),
    same_p_first_replay_side_minor_atlas: same(leftPFirstAtlas, rightPFirstAtlas),
    left_repair_determinant_atlas: leftRepairAtlas,
    right_repair_determinant_atlas: rightRepairAtlas,
  });
}

function quotientAlgebraCertificate() {
  const generatorSignature = dromologicalRepairSignature(DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR);
  const surjectiveMinor = DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX[0][0]
      * DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX[1][1]
    - DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX[0][1]
      * DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX[1][0];

  const sectionSamples = [];
  for (let qH = -4; qH <= 4; qH += 1) {
    for (let qI = -4; qI <= 4; qI += 1) {
      const signature = [qH, qI];
      const representative = canonicalReplayRepairRepresentative(signature);
      sectionSamples.push(freeze({
        signature: freeze(signature),
        representative,
        projected_signature: dromologicalRepairSignature(representative),
      }));
    }
  }

  const sectionExact = sectionSamples.every(row => same(row.signature, row.projected_signature));
  return freeze({
    quotient_matrix: DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX,
    null_fiber_generator: DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR,
    null_fiber_generator_signature: generatorSignature,
    generator_in_kernel: same(generatorSignature, [0, 0]),
    unimodular_two_by_two_minor: surjectiveMinor,
    quotient_map_surjective_over_z: Math.abs(surjectiveMinor) === 1 && sectionExact,
    canonical_section_samples_checked: sectionSamples.length,
    canonical_section_exact_on_samples: sectionExact,
  });
}

function finiteCubeRows(limit = 4) {
  const rows = [];
  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const replayRow = [a, b, c];
        const decomposition = decomposeReplayRepairRow(replayRow);
        const classification = classifyDromologicalReplayRow(replayRow);
        const repairAtlas = replayRepairDeterminantAtlas(replayRow);
        const canonicalAtlas = replayRepairDeterminantAtlas(decomposition.canonical_representative);
        rows.push(freeze({
          replay_row: freeze(replayRow),
          signature: decomposition.repair_signature,
          decomposition,
          repair_atlas: repairAtlas,
          canonical_repair_atlas: canonicalAtlas,
          same_repair_atlas_as_canonical_representative: same(repairAtlas, canonicalAtlas),
          actual_rank_rescue: classification.actual_all_six_rank_three,
          actual_unimodular_rescue: classification.actual_all_six_have_unimodular_minor,
          predicted_rank_rescue:
            decomposition.repair_signature[0] !== 0 && decomposition.repair_signature[1] !== 0,
          predicted_unimodular_rescue:
            Math.abs(decomposition.repair_signature[0]) === 1
            && Math.abs(decomposition.repair_signature[1]) === 1,
        }));
      }
    }
  }
  return freeze(rows);
}

function finiteCubeQuotientAudit(limit = 4) {
  const rows = finiteCubeRows(limit);
  const signatures = new Map();
  let exact = true;

  for (const row of rows) {
    const key = JSON.stringify(row.signature);
    if (!signatures.has(key)) signatures.set(key, []);
    signatures.get(key).push(row);
    if (!row.decomposition.exact_recomposition
      || !row.decomposition.null_component_in_kernel
      || !row.same_repair_atlas_as_canonical_representative
      || row.actual_rank_rescue !== row.predicted_rank_rescue
      || row.actual_unimodular_rescue !== row.predicted_unimodular_rescue) {
      exact = false;
    }
  }

  let pairChecks = 0;
  let sameSignaturePairs = 0;
  let differentSignaturePairs = 0;
  for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
      const left = rows[leftIndex];
      const right = rows[rightIndex];
      const sameSignature = same(left.signature, right.signature);
      const nullFiber = replayRowsDifferByNullFiber(left.replay_row, right.replay_row).lies_on_null_fiber;
      const sameAtlas = same(left.repair_atlas, right.repair_atlas);
      pairChecks += 1;
      if (sameSignature) sameSignaturePairs += 1;
      else differentSignaturePairs += 1;
      if (!(sameSignature === nullFiber && nullFiber === sameAtlas)) exact = false;
    }
  }

  const signatureClasses = [...signatures.values()];
  const everySignatureClassRepairAtlasConstant = signatureClasses.every(group => (
    group.every(row => same(row.repair_atlas, group[0].repair_atlas))
  ));
  const signatureToRepairAtlas = new Map();
  for (const group of signatureClasses) {
    signatureToRepairAtlas.set(
      JSON.stringify(group[0].signature),
      JSON.stringify(group[0].repair_atlas),
    );
  }
  const uniqueRepairAtlases = new Set(signatureToRepairAtlas.values());
  const repairAtlasSeparatesSignatureClasses = uniqueRepairAtlases.size === signatureClasses.length;

  return freeze({
    replay_cube_limit: limit,
    checked_replay_rows: rows.length,
    expected_replay_rows: 729,
    distinct_repair_signatures: signatureClasses.length,
    expected_distinct_repair_signatures: 217,
    unordered_pair_checks: pairChecks,
    expected_unordered_pair_checks: 265356,
    same_signature_pair_checks: sameSignaturePairs,
    expected_same_signature_pair_checks: 1296,
    different_signature_pair_checks: differentSignaturePairs,
    expected_different_signature_pair_checks: 264060,
    every_signature_class_repair_atlas_constant: everySignatureClassRepairAtlasConstant,
    repair_atlas_separates_signature_classes: repairAtlasSeparatesSignatureClasses,
    exact: exact
      && rows.length === 729
      && signatureClasses.length === 217
      && pairChecks === 265356
      && sameSignaturePairs === 1296
      && differentSignaturePairs === 264060
      && everySignatureClassRepairAtlasConstant
      && repairAtlasSeparatesSignatureClasses,
  });
}

function coordinateNecessityCertificate() {
  const base = canonicalReplayRepairRepresentative([1, 1]);
  const changeH = canonicalReplayRepairRepresentative([2, 1]);
  const changeI = canonicalReplayRepairRepresentative([1, 2]);
  const baseAtlas = replayRepairDeterminantAtlas(base);
  const hAtlas = replayRepairDeterminantAtlas(changeH);
  const iAtlas = replayRepairDeterminantAtlas(changeI);

  const byId = atlas => Object.fromEntries(atlas.map(row => [row.schedule_id, row.replay_dependent_minor_values]));
  const baseById = byId(baseAtlas);
  const hById = byId(hAtlas);
  const iById = byId(iAtlas);
  const hIds = ['H-P-I', 'H-I-P'];
  const iIds = ['I-P-H', 'I-H-P'];

  const qHChangesHOnly = hIds.every(id => !same(baseById[id], hById[id]))
    && iIds.every(id => same(baseById[id], hById[id]));
  const qIChangesIOnly = iIds.every(id => !same(baseById[id], iById[id]))
    && hIds.every(id => same(baseById[id], iById[id]));

  return freeze({
    base_signature: freeze([1, 1]),
    q_h_change_signature: freeze([2, 1]),
    q_i_change_signature: freeze([1, 2]),
    changing_q_h_alone_changes_h_first_repair_coordinates_only: qHChangesHOnly,
    changing_q_i_alone_changes_i_first_repair_coordinates_only: qIChangesIOnly,
    both_coordinates_necessary_in_fixed_fixture: qHChangesHOnly && qIChangesIOnly,
  });
}

function nonEquivalenceScarsCertificate() {
  const baseline = [1, 0, 0];
  const canonicalSameSignature = canonicalReplayRepairRepresentative(
    dromologicalRepairSignature(baseline),
  );
  const sameSignaturePair = compareReplayRepairRows(baseline, canonicalSameSignature);

  const positiveUnit = classifyDromologicalReplayRow([1, 0, 0]);
  const negativeUnit = classifyDromologicalReplayRow([-1, 0, 0]);
  const unitSignaturesDifferent = !same(
    dromologicalRepairSignature([1, 0, 0]),
    dromologicalRepairSignature([-1, 0, 0]),
  );

  return freeze({
    same_signature_full_observation_counterexample: sameSignaturePair,
    same_signature_same_repair_atlas: sameSignaturePair.same_repair_signature
      && sameSignaturePair.same_repair_determinant_atlas,
    same_signature_but_p_first_side_minors_differ:
      sameSignaturePair.same_p_first_replay_side_minor_atlas === false,
    different_signatures_can_share_unimodular_rescue_verdict:
      positiveUnit.actual_all_six_have_unimodular_minor
      && negativeUnit.actual_all_six_have_unimodular_minor
      && unitSignaturesDifferent,
  });
}

export function dromologicalReplayRepairQuotientCertificate() {
  const parent = dromologicalReplayTransversalityLocusCertificate();
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const algebra = quotientAlgebraCertificate();
  const finite = finiteCubeQuotientAudit(4);
  const necessity = coordinateNecessityCertificate();
  const scars = nonEquivalenceScarsCertificate();

  const passed = parent.passed
    && atlas.passed
    && lag.passed
    && algebra.generator_in_kernel
    && algebra.quotient_map_surjective_over_z
    && finite.exact
    && necessity.both_coordinates_necessary_in_fixed_fixture
    && scars.same_signature_same_repair_atlas
    && scars.same_signature_but_p_first_side_minors_differ
    && scars.different_signatures_can_share_unimodular_rescue_verdict;

  return freeze({
    schema: DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_SCHEMA,
    parent_receipt: DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_PARENT_RECEIPT,
    quotient_algebra: algebra,
    finite_cube_quotient_audit: finite,
    coordinate_necessity: necessity,
    non_equivalence_scars_certificate: scars,
    passed,
    decomposition_classification: passed
      ? 'EVERY_INTEGER_REPLAY_ROW_IN_THE_FIXED_S3_FIXTURE_DECOMPOSES_UNIQUELY_INTO_A_CANONICAL_REPAIR_SIGNATURE_REPRESENTATIVE_PLUS_AN_INTEGER_NULL_FIBER_DISPLACEMENT_ALONG_1_MINUS1_MINUS1'
      : 'REPLAY_REPAIR_CANONICAL_DECOMPOSITION_NOT_ESTABLISHED',
    quotient_classification: passed
      ? 'THE_TWO_COORDINATE_MAP_Q_IS_A_COMPLETE_INTEGER_INVARIANT_FOR_THE_REPLAY_REPAIR_DETERMINANT_PHENOTYPE_OF_THE_FOUR_HISTORICALLY_NONIDENTIFIABLE_S3_SCHEDULES'
      : 'REPLAY_REPAIR_QUOTIENT_COMPLETENESS_NOT_ESTABLISHED',
    coordinate_classification: passed
      ? 'BOTH_Q_COORDINATES_ARE_NECESSARY_FOR_COMPLETE_REPAIR_PHENOTYPE_IDENTIFICATION_IN_THIS_FIXED_S3_FIXTURE'
      : 'REPAIR_SIGNATURE_COORDINATE_NECESSITY_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'REPLAY_REPAIR_BEHAVIOR_CAN_FACTOR_THROUGH_A_TWO_COORDINATE_INTEGER_QUOTIENT_WHILE_FULL_REPLAY_OBSERVATION_BEHAVIOR_REMAINS_STRICTLY_FINER'
      : 'REPLAY_REPAIR_QUOTIENT_FACTORING_NOT_ESTABLISHED',
    scars: freeze([
      'SAME_REPAIR_SIGNATURE != SAME_REPLAY_ROW',
      'SAME_REPAIR_SIGNATURE != SAME_FULL_AUGMENTED_MINOR_ATLAS',
      'REPAIR_QUOTIENT_COMPLETENESS != FULL_OBSERVATION_EQUIVALENCE',
      'NULL_FIBER_DISPLACEMENT != PHYSICAL_GAUGE_SYMMETRY',
      'CANONICAL_SECTION != OPERATIONAL_INVERSE_ROUTE',
      'Z3_MOD_KERNEL_EQUIV_Z2_IN_THIS_FIXTURE != UNIVERSAL_SENSOR_QUOTIENT',
      'FOUR_UNIT_SIGNATURES != FOUR_UNIQUE_PROBES',
      'REPAIR_SIGNATURE != SEMANTIC_EQUIVALENCE',
      'TWO_COORDINATE_NECESSITY_IN_THIS_FIXTURE != UNIVERSAL_MINIMAL_SUFFICIENT_STATISTIC',
    ]),
  });
}

export function compileDromologicalReplayRepairQuotientProjection(receiver) {
  const certificate = dromologicalReplayRepairQuotientCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified replay-repair quotient');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-repair-quotient-child-legible/v0.1',
      truths: freeze([
        'MANY_DIFFERENT_EXTRA_CHECKS_CAN_FIX_THE_SAME_MISSING_CLUES_IN_THE_SAME_WAY',
        'A_SMALL_REPAIR_SIGNATURE_CAN_SUMMARIZE_WHAT_MATTERS_FOR_THE_MISSING_CLUES_HERE',
        'SAME_REPAIR_EFFECT_DOES_NOT_MEAN_SAME_EXTRA_CHECK',
      ]),
      quotient_matrix_exposed: false,
      kernel_vector_exposed: false,
      canonical_section_formula_exposed: false,
      replay_coordinates_exposed: false,
      determinant_formulas_exposed: false,
      inverse_formulas_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.replay-repair-quotient-loom-technical/v0.1',
      quotient_matrix: certificate.quotient_algebra.quotient_matrix,
      null_fiber_generator: certificate.quotient_algebra.null_fiber_generator,
      finite_cube_quotient_audit: certificate.finite_cube_quotient_audit,
      coordinate_necessity: certificate.coordinate_necessity,
      non_equivalence_scars_certificate: certificate.non_equivalence_scars_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for replay-repair quotient: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_repair_quotient: true,
      full_observation_equivalence: false,
      universal_replay_theorem: false,
      universal_sensor_quotient: false,
      universal_minimal_sufficient_statistic: false,
      physical_gauge_symmetry: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      continuum_tomography: false,
      semantic_equivalence: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalReplayRepairQuotientOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const overclaim = ceiling.full_observation_equivalence === true
    || ceiling.universal_replay_theorem === true
    || ceiling.universal_sensor_quotient === true
    || ceiling.universal_minimal_sufficient_statistic === true
    || ceiling.physical_gauge_symmetry === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true
    || ceiling.continuum_tomography === true
    || ceiling.semantic_equivalence === true
    || ceiling.operational_inverse_route === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.quotient_matrix_exposed === true
    || candidate?.payload?.kernel_vector_exposed === true
    || candidate?.payload?.canonical_section_formula_exposed === true
    || candidate?.payload?.replay_coordinates_exposed === true
    || candidate?.payload?.determinant_formulas_exposed === true
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
  });
}
