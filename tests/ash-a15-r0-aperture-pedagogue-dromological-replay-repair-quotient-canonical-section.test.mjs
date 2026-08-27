import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalS3ScheduleAtlasCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-schedule-state-identifiability-lag.js';
import {
  classifyDromologicalReplayRow,
  dromologicalReplayTransversalityLocusCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_SCHEMA,
  DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_PARENT_RECEIPT,
  DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX,
  DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR,
  dromologicalRepairSignature,
  canonicalReplayRepairRepresentative,
  decomposeReplayRepairRow,
  replayRowsDifferByNullFiber,
  replayRepairDeterminantAtlas,
  pFirstReplaySideMinorAtlas,
  compareReplayRepairRows,
  dromologicalReplayRepairQuotientCertificate,
  compileDromologicalReplayRepairQuotientProjection,
  rejectDromologicalReplayRepairQuotientOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-replay-repair-quotient-canonical-section.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function subtract(left, right) {
  return left.map((value, index) => value - right[index]);
}

function independentSignature([a, b, c]) {
  return [a + b, a + c];
}

function independentNullFiber(left, right) {
  const [da, db, dc] = subtract(left, right);
  return db === -da && dc === -da;
}

assert.equal(
  DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_PARENT_RECEIPT,
  '79a6533843c4133345bec3c1e83477c621230b09',
);
assert.deepEqual(DROMOLOGICAL_REPAIR_QUOTIENT_MATRIX, [
  [1, 1, 0],
  [1, 0, 1],
]);
assert.deepEqual(DROMOLOGICAL_REPAIR_NULL_FIBER_GENERATOR, [1, -1, -1]);

// Exact quotient matrix has a unimodular 2x2 minor, and the hostile line lies in its kernel.
assert.equal(1 * 0 - 1 * 1, -1);
assert.deepEqual(dromologicalRepairSignature([1, -1, -1]), [0, 0]);
assert.deepEqual(dromologicalRepairSignature([-3, 3, 3]), [0, 0]);

// The explicit section is a right inverse on a broad exact integer sample.
let sectionChecks = 0;
for (let qH = -8; qH <= 8; qH += 1) {
  for (let qI = -8; qI <= 8; qI += 1) {
    const signature = [qH, qI];
    const representative = canonicalReplayRepairRepresentative(signature);
    assert.equal(representative[0], 0);
    assert.deepEqual(dromologicalRepairSignature(representative), signature);
    sectionChecks += 1;
  }
}
assert.equal(sectionChecks, 289);

// Exact decomposition: r = S(Q(r)) + a*(1,-1,-1).
for (const replayRow of [
  [0, 0, 0],
  [1, 0, 0],
  [1, -1, -1],
  [2, -1, 0],
  [-4, 3, -2],
  [7, -5, 9],
]) {
  const decomposition = decomposeReplayRepairRow(replayRow);
  assert.deepEqual(decomposition.repair_signature, independentSignature(replayRow));
  assert.equal(decomposition.null_fiber_coordinate, replayRow[0]);
  assert.deepEqual(
    decomposition.null_fiber_component,
    [replayRow[0], -replayRow[0], -replayRow[0]],
  );
  assert.deepEqual(decomposition.null_fiber_component_signature, [0, 0]);
  assert.deepEqual(decomposition.recomposed, replayRow);
  assert.equal(decomposition.exact_recomposition, true);
  assert.equal(decomposition.null_component_in_kernel, true);
}

// Same signature iff exact integer null-fiber displacement on representative controls.
for (const pair of [
  [[1, 0, 0], [0, 1, 1]],
  [[3, -2, -2], [-1, 2, 2]],
  [[1, -1, -1], [0, 0, 0]],
]) {
  const [left, right] = pair;
  assert.deepEqual(dromologicalRepairSignature(left), dromologicalRepairSignature(right));
  assert.equal(replayRowsDifferByNullFiber(left, right).lies_on_null_fiber, true);
  assert.equal(independentNullFiber(left, right), true);
}
for (const pair of [
  [[1, 0, 0], [0, 1, 0]],
  [[2, 0, 0], [1, 0, 0]],
  [[1, -1, 0], [1, 0, -1]],
]) {
  const [left, right] = pair;
  assert.notDeepEqual(dromologicalRepairSignature(left), dromologicalRepairSignature(right));
  assert.equal(replayRowsDifferByNullFiber(left, right).lies_on_null_fiber, false);
  assert.equal(independentNullFiber(left, right), false);
}

// Quotient equivalence preserves defect-repair determinants but not the complete P-first side-minor surface.
const baseline = [1, 0, 0];
const canonicalBaseline = canonicalReplayRepairRepresentative(dromologicalRepairSignature(baseline));
assert.deepEqual(canonicalBaseline, [0, 1, 1]);
const quotientPair = compareReplayRepairRows(baseline, canonicalBaseline);
assert.equal(quotientPair.same_repair_signature, true);
assert.equal(quotientPair.null_fiber_relation.lies_on_null_fiber, true);
assert.equal(quotientPair.same_repair_determinant_atlas, true);
assert.equal(quotientPair.same_p_first_replay_side_minor_atlas, false);
assert.deepEqual(replayRepairDeterminantAtlas(baseline), replayRepairDeterminantAtlas(canonicalBaseline));
assert.notDeepEqual(pFirstReplaySideMinorAtlas(baseline), pFirstReplaySideMinorAtlas(canonicalBaseline));

// Different signatures can still share the coarse exact-unimodular rescue verdict.
assert.deepEqual(dromologicalRepairSignature([1, 0, 0]), [1, 1]);
assert.deepEqual(dromologicalRepairSignature([-1, 0, 0]), [-1, -1]);
assert.equal(classifyDromologicalReplayRow([1, 0, 0]).actual_all_six_have_unimodular_minor, true);
assert.equal(classifyDromologicalReplayRow([-1, 0, 0]).actual_all_six_have_unimodular_minor, true);
assert.notDeepEqual(
  replayRepairDeterminantAtlas([1, 0, 0]),
  replayRepairDeterminantAtlas([-1, 0, 0]),
);

// Independent exhaustive finite-cube quotient audit.
const rows = [];
const signatureGroups = new Map();
for (let a = -4; a <= 4; a += 1) {
  for (let b = -4; b <= 4; b += 1) {
    for (let c = -4; c <= 4; c += 1) {
      const replayRow = [a, b, c];
      const signature = independentSignature(replayRow);
      const exportedSignature = dromologicalRepairSignature(replayRow);
      const decomposition = decomposeReplayRepairRow(replayRow);
      const repairAtlas = replayRepairDeterminantAtlas(replayRow);
      const canonicalAtlas = replayRepairDeterminantAtlas(
        canonicalReplayRepairRepresentative(signature),
      );
      const classification = classifyDromologicalReplayRow(replayRow);
      const predictedRank = signature[0] !== 0 && signature[1] !== 0;
      const predictedUnimodular = Math.abs(signature[0]) === 1 && Math.abs(signature[1]) === 1;

      assert.deepEqual(exportedSignature, signature);
      assert.equal(decomposition.exact_recomposition, true);
      assert.equal(decomposition.null_component_in_kernel, true);
      assert.deepEqual(repairAtlas, canonicalAtlas);
      assert.equal(classification.actual_all_six_rank_three, predictedRank);
      assert.equal(classification.actual_all_six_have_unimodular_minor, predictedUnimodular);

      const row = { replayRow, signature, repairAtlas };
      rows.push(row);
      const key = JSON.stringify(signature);
      if (!signatureGroups.has(key)) signatureGroups.set(key, []);
      signatureGroups.get(key).push(row);
    }
  }
}
assert.equal(rows.length, 729);
assert.equal(signatureGroups.size, 217);

let pairChecks = 0;
let sameSignaturePairs = 0;
let differentSignaturePairs = 0;
for (let leftIndex = 0; leftIndex < rows.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < rows.length; rightIndex += 1) {
    const left = rows[leftIndex];
    const right = rows[rightIndex];
    const sameSignature = same(left.signature, right.signature);
    const nullFiber = independentNullFiber(left.replayRow, right.replayRow);
    const sameRepairAtlas = same(left.repairAtlas, right.repairAtlas);
    assert.equal(sameSignature, nullFiber);
    assert.equal(nullFiber, sameRepairAtlas);
    pairChecks += 1;
    if (sameSignature) sameSignaturePairs += 1;
    else differentSignaturePairs += 1;
  }
}
assert.equal(pairChecks, 265356);
assert.equal(sameSignaturePairs, 1296);
assert.equal(differentSignaturePairs, 264060);

const repairAtlasBySignature = new Map();
for (const [signatureKey, group] of signatureGroups.entries()) {
  for (const row of group) assert.deepEqual(row.repairAtlas, group[0].repairAtlas);
  repairAtlasBySignature.set(signatureKey, JSON.stringify(group[0].repairAtlas));
}
assert.equal(new Set(repairAtlasBySignature.values()).size, 217);

// Both signature coordinates are independently necessary in this fixed repair phenotype.
const q11 = replayRepairDeterminantAtlas(canonicalReplayRepairRepresentative([1, 1]));
const q21 = replayRepairDeterminantAtlas(canonicalReplayRepairRepresentative([2, 1]));
const q12 = replayRepairDeterminantAtlas(canonicalReplayRepairRepresentative([1, 2]));
const asMap = atlas => Object.fromEntries(atlas.map(row => [row.schedule_id, row.replay_dependent_minor_values]));
const a11 = asMap(q11);
const a21 = asMap(q21);
const a12 = asMap(q12);
for (const id of ['H-P-I', 'H-I-P']) {
  assert.notDeepEqual(a11[id], a21[id]);
  assert.deepEqual(a11[id], a12[id]);
}
for (const id of ['I-P-H', 'I-H-P']) {
  assert.deepEqual(a11[id], a21[id]);
  assert.notDeepEqual(a11[id], a12[id]);
}

const parent = dromologicalReplayTransversalityLocusCertificate();
assert.equal(parent.passed, true);
const atlas = dromologicalS3ScheduleAtlasCertificate();
assert.equal(atlas.passed, true);
const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
assert.equal(lag.passed, true);
assert.equal(lag.minimal_schedule_identification_prefix, 2);

const certificate = dromologicalReplayRepairQuotientCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_REPLAY_REPAIR_QUOTIENT_PARENT_RECEIPT);
assert.equal(certificate.quotient_algebra.generator_in_kernel, true);
assert.equal(certificate.quotient_algebra.unimodular_two_by_two_minor, -1);
assert.equal(certificate.quotient_algebra.quotient_map_surjective_over_z, true);
assert.equal(certificate.quotient_algebra.canonical_section_samples_checked, 81);
assert.equal(certificate.quotient_algebra.canonical_section_exact_on_samples, true);
assert.equal(certificate.finite_cube_quotient_audit.checked_replay_rows, 729);
assert.equal(certificate.finite_cube_quotient_audit.distinct_repair_signatures, 217);
assert.equal(certificate.finite_cube_quotient_audit.unordered_pair_checks, 265356);
assert.equal(certificate.finite_cube_quotient_audit.same_signature_pair_checks, 1296);
assert.equal(certificate.finite_cube_quotient_audit.different_signature_pair_checks, 264060);
assert.equal(certificate.finite_cube_quotient_audit.every_signature_class_repair_atlas_constant, true);
assert.equal(certificate.finite_cube_quotient_audit.repair_atlas_separates_signature_classes, true);
assert.equal(certificate.finite_cube_quotient_audit.exact, true);
assert.equal(certificate.coordinate_necessity.both_coordinates_necessary_in_fixed_fixture, true);
assert.equal(certificate.non_equivalence_scars_certificate.same_signature_same_repair_atlas, true);
assert.equal(certificate.non_equivalence_scars_certificate.same_signature_but_p_first_side_minors_differ, true);
assert.equal(certificate.non_equivalence_scars_certificate.different_signatures_can_share_unimodular_rescue_verdict, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.decomposition_classification,
  'EVERY_INTEGER_REPLAY_ROW_IN_THE_FIXED_S3_FIXTURE_DECOMPOSES_UNIQUELY_INTO_A_CANONICAL_REPAIR_SIGNATURE_REPRESENTATIVE_PLUS_AN_INTEGER_NULL_FIBER_DISPLACEMENT_ALONG_1_MINUS1_MINUS1',
);
assert.equal(
  certificate.quotient_classification,
  'THE_TWO_COORDINATE_MAP_Q_IS_A_COMPLETE_INTEGER_INVARIANT_FOR_THE_REPLAY_REPAIR_DETERMINANT_PHENOTYPE_OF_THE_FOUR_HISTORICALLY_NONIDENTIFIABLE_S3_SCHEDULES',
);
assert.equal(
  certificate.coordinate_classification,
  'BOTH_Q_COORDINATES_ARE_NECESSARY_FOR_COMPLETE_REPAIR_PHENOTYPE_IDENTIFICATION_IN_THIS_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'REPLAY_REPAIR_BEHAVIOR_CAN_FACTOR_THROUGH_A_TWO_COORDINATE_INTEGER_QUOTIENT_WHILE_FULL_REPLAY_OBSERVATION_BEHAVIOR_REMAINS_STRICTLY_FINER',
);

const ash = compileDromologicalReplayRepairQuotientProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalReplayRepairQuotientProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'MANY_DIFFERENT_EXTRA_CHECKS_CAN_FIX_THE_SAME_MISSING_CLUES_IN_THE_SAME_WAY',
  'A_SMALL_REPAIR_SIGNATURE_CAN_SUMMARIZE_WHAT_MATTERS_FOR_THE_MISSING_CLUES_HERE',
  'SAME_REPAIR_EFFECT_DOES_NOT_MEAN_SAME_EXTRA_CHECK',
]);
for (const key of [
  'quotient_matrix_exposed',
  'kernel_vector_exposed',
  'canonical_section_formula_exposed',
  'replay_coordinates_exposed',
  'determinant_formulas_exposed',
  'inverse_formulas_exposed',
  'latent_coordinates_exposed',
]) assert.equal(ash.payload[key], false);
assert.deepEqual(loom.payload.quotient_matrix, [[1, 1, 0], [1, 0, 1]]);
assert.deepEqual(loom.payload.null_fiber_generator, [1, -1, -1]);
assert.equal(rejectDromologicalReplayRepairQuotientOverreach(ash).accepted, true);
assert.equal(rejectDromologicalReplayRepairQuotientOverreach(loom).accepted, true);

assert.equal(
  rejectDromologicalReplayRepairQuotientOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalReplayRepairQuotientOverreach({ ...loom, runtime_binding: true }).accepted,
  false,
);
for (const key of [
  'full_observation_equivalence',
  'universal_replay_theorem',
  'universal_sensor_quotient',
  'universal_minimal_sufficient_statistic',
  'physical_gauge_symmetry',
  'physical_holonomy',
  'physical_quasicrystal',
  'continuum_tomography',
  'semantic_equivalence',
  'operational_inverse_route',
]) {
  assert.equal(
    rejectDromologicalReplayRepairQuotientOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalReplayRepairQuotientOverreach({
    ...ash,
    payload: { ...ash.payload, kernel_vector_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalReplayRepairQuotientProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'SAME_REPAIR_SIGNATURE != SAME_REPLAY_ROW',
  'SAME_REPAIR_SIGNATURE != SAME_FULL_AUGMENTED_MINOR_ATLAS',
  'REPAIR_QUOTIENT_COMPLETENESS != FULL_OBSERVATION_EQUIVALENCE',
  'NULL_FIBER_DISPLACEMENT != PHYSICAL_GAUGE_SYMMETRY',
  'CANONICAL_SECTION != OPERATIONAL_INVERSE_ROUTE',
  'Z3_MOD_KERNEL_EQUIV_Z2_IN_THIS_FIXTURE != UNIVERSAL_SENSOR_QUOTIENT',
  'FOUR_UNIT_SIGNATURES != FOUR_UNIQUE_PROBES',
  'REPAIR_SIGNATURE != SEMANTIC_EQUIVALENCE',
  'TWO_COORDINATE_NECESSITY_IN_THIS_FIXTURE != UNIVERSAL_MINIMAL_SUFFICIENT_STATISTIC',
]);

console.log('Ash A15-R0 dromological replay repair quotient / canonical-section hostile tests passed.');
