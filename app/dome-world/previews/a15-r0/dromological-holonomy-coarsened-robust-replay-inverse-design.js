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
  classifyDromologicalReplayRow,
  dromologicalReplayTransversalityLocusCertificate,
} from './dromological-replay-transversality-unimodular-locus.js';
import {
  dromologicalRepairSignature,
  canonicalReplayRepairRepresentative,
  compareReplayRepairRows,
  dromologicalReplayRepairQuotientCertificate,
} from './dromological-replay-repair-quotient-canonical-section.js';

export const DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_SCHEMA =
  'td613.dome-world.dromological-holonomy-coarsened-robust-replay-inverse-design/v0.1';
export const DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_PARENT_RECEIPT =
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

function l0(vector) {
  return vector.filter(value => value !== 0).length;
}

function l1(vector) {
  return vector.reduce((sum, value) => sum + Math.abs(value), 0);
}

function canonicalPrimitiveSign(vector) {
  assertIntegerVector(vector, 3, 'kernel direction');
  const first = vector.find(value => value !== 0);
  if (first === undefined) return freeze([0, 0, 0]);
  const sign = first < 0 ? -1 : 1;
  return freeze(vector.map(value => {
    const normalized = value * sign;
    return normalized === 0 ? 0 : normalized;
  }));
}

function uniqueVectors(vectors) {
  const map = new Map();
  vectors.forEach((vector) => {
    const normalized = canonicalPrimitiveSign(vector);
    map.set(JSON.stringify(normalized), normalized);
  });
  return freeze([...map.values()].map(vector => freeze([...vector])));
}

function lexicographicCompare(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function replayCandidateRows(limit = 2) {
  const rows = [];
  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) rows.push([a, b, c]);
    }
  }
  rows.sort((left, right) => (
    l1(left) - l1(right)
    || l0(left) - l0(right)
    || lexicographicCompare(left, right)
  ));
  return rows;
}

function classKey(matrix) {
  return JSON.stringify(matrix);
}

export function deriveDromologicalTerminalHolonomyClasses() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  if (!atlas.passed) throw new Error('cannot derive holonomy classes from uncertified S3 atlas');

  const classes = new Map();
  atlas.schedules.forEach((row) => {
    const key = classKey(row.terminal_formal_holonomy);
    if (!classes.has(key)) {
      classes.set(key, {
        terminal_formal_holonomy: row.terminal_formal_holonomy,
        members: [],
      });
    }
    classes.get(key).members.push(row);
  });

  return freeze([...classes.values()].map((entry, index) => {
    const defectDirections = uniqueVectors(
      entry.members
        .filter(member => member.kernel_generator !== null)
        .map(member => member.kernel_generator),
    );
    return freeze({
      holonomy_class_index: index,
      holonomy_class_id: `FORMAL_HOLONOMY_CLASS_${index}`,
      terminal_formal_holonomy: entry.terminal_formal_holonomy,
      schedule_ids: freeze(entry.members.map(member => member.schedule_id)),
      schedule_count: entry.members.length,
      observation_ranks: freeze(entry.members.map(member => member.observation_rank)),
      defect_directions: defectDirections,
      defect_direction_count: defectDirections.length,
    });
  }));
}

function globalInheritedDefectDirections() {
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  return uniqueVectors(
    atlas.schedules
      .filter(row => row.kernel_generator !== null)
      .map(row => row.kernel_generator),
  );
}

function positiveSelectivePolicyRow(defectDirections) {
  if (defectDirections.length === 0) return freeze([0, 0, 0]);
  const globalDirections = globalInheritedDefectDirections();
  const candidates = replayCandidateRows(2).filter((row) => {
    const requiredPositiveUnit = defectDirections.every(direction => dot(row, direction) === 1);
    const nonrequiredDirections = globalDirections.filter(direction => (
      !defectDirections.some(required => same(required, direction))
    ));
    const nonrequiredZero = nonrequiredDirections.every(direction => dot(row, direction) === 0);
    return requiredPositiveUnit && nonrequiredZero;
  });
  if (candidates.length < 1) {
    throw new Error('no positive directionally selective integer replay row found for holonomy defect set');
  }
  return freeze([...candidates[0]]);
}

export function dromologicalHolonomyClassReplayPolicy() {
  return freeze(deriveDromologicalTerminalHolonomyClasses().map((holonomyClass) => {
    const replayRow = positiveSelectivePolicyRow(holonomyClass.defect_directions);
    const globalDirections = globalInheritedDefectDirections();
    return freeze({
      holonomy_class_id: holonomyClass.holonomy_class_id,
      schedule_ids: holonomyClass.schedule_ids,
      defect_directions: holonomyClass.defect_directions,
      replay_row: replayRow,
      repair_signature: dromologicalRepairSignature(replayRow),
      pairings: freeze(globalDirections.map(direction => freeze({
        direction,
        pairing: dot(replayRow, direction),
        required: holonomyClass.defect_directions.some(required => same(required, direction)),
      }))),
      l0_cost: l0(replayRow),
      l1_cost: l1(replayRow),
    });
  }));
}

export function classifyReplayAgainstHolonomyClass(holonomyClass, replayRow) {
  assertIntegerVector(replayRow, 3, 'replay row');
  const classification = classifyDromologicalReplayRow(replayRow);
  const memberRows = classification.schedules.filter(row => holonomyClass.schedule_ids.includes(row.schedule_id));
  if (memberRows.length !== holonomyClass.schedule_ids.length) {
    throw new Error('holonomy class schedule membership does not match replay classification atlas');
  }

  const predictedRank = holonomyClass.defect_directions.every(direction => dot(replayRow, direction) !== 0);
  const predictedUnimodular = holonomyClass.defect_directions
    .every(direction => Math.abs(dot(replayRow, direction)) === 1);
  const actualRank = memberRows.every(row => row.augmented_rank === 3);
  const actualUnimodular = memberRows.every(row => row.has_unimodular_minor);

  return freeze({
    holonomy_class_id: holonomyClass.holonomy_class_id,
    replay_row: freeze([...replayRow]),
    schedule_ids: holonomyClass.schedule_ids,
    defect_directions: holonomyClass.defect_directions,
    actual_member_schedule_rows: freeze(memberRows),
    actual_class_robust_rank_rescue: actualRank,
    actual_class_robust_unimodular_rescue: actualUnimodular,
    defect_set_predicts_rank_rescue: predictedRank,
    defect_set_predicts_unimodular_rescue: predictedUnimodular,
    rank_predicate_matches_actual: predictedRank === actualRank,
    unimodular_predicate_matches_actual: predictedUnimodular === actualUnimodular,
  });
}

function classStructureCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const expectedScheduleClasses = [
    ['P-H-I', 'P-I-H'],
    ['H-P-I'],
    ['H-I-P', 'I-H-P'],
    ['I-P-H'],
  ];
  const expectedDefectDirections = [
    [],
    [[1, 1, 0]],
    [[1, 1, 0], [1, 0, 1]],
    [[1, 0, 1]],
  ];
  const exactMembership = same(classes.map(row => row.schedule_ids), expectedScheduleClasses);
  const exactDefects = same(classes.map(row => row.defect_directions), expectedDefectDirections);
  const mixed = classes[2];
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const mixedRows = atlas.schedules.filter(row => mixed.schedule_ids.includes(row.schedule_id));
  const mixedSameHolonomy = mixedRows.length === 2
    && same(mixedRows[0].terminal_formal_holonomy, mixedRows[1].terminal_formal_holonomy);
  const mixedDifferentKernel = mixedRows.length === 2
    && !same(mixedRows[0].kernel_generator, mixedRows[1].kernel_generator);

  return freeze({
    classes,
    expected_schedule_classes: freeze(expectedScheduleClasses.map(row => freeze(row))),
    expected_defect_directions: freeze(expectedDefectDirections.map(group => freeze(group.map(row => freeze(row))))),
    exact_schedule_membership: exactMembership,
    exact_defect_sets: exactDefects,
    mixed_class_same_terminal_holonomy: mixedSameHolonomy,
    mixed_class_different_missing_directions: mixedDifferentKernel,
    exact: classes.length === 4
      && exactMembership
      && exactDefects
      && mixedSameHolonomy
      && mixedDifferentKernel,
  });
}

function finiteHolonomyReplayAudit(limit = 4) {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  let replayRows = 0;
  let classRowAudits = 0;
  let memberScheduleAudits = 0;
  let exact = true;
  const robustRankCounts = new Array(classes.length).fill(0);
  const robustUnimodularCounts = new Array(classes.length).fill(0);

  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const replayRow = [a, b, c];
        replayRows += 1;
        classes.forEach((holonomyClass, classIndex) => {
          const classified = classifyReplayAgainstHolonomyClass(holonomyClass, replayRow);
          classRowAudits += 1;
          memberScheduleAudits += classified.actual_member_schedule_rows.length;
          if (classified.actual_class_robust_rank_rescue) robustRankCounts[classIndex] += 1;
          if (classified.actual_class_robust_unimodular_rescue) robustUnimodularCounts[classIndex] += 1;
          if (!classified.rank_predicate_matches_actual || !classified.unimodular_predicate_matches_actual) {
            exact = false;
          }
        });
      }
    }
  }

  const width = 2 * limit + 1;
  const expectedRows = width ** 3;
  return freeze({
    replay_cube_limit: limit,
    checked_replay_rows: replayRows,
    expected_replay_rows: expectedRows,
    checked_class_row_audits: classRowAudits,
    expected_class_row_audits: expectedRows * 4,
    checked_member_schedule_audits: memberScheduleAudits,
    expected_member_schedule_audits: expectedRows * 6,
    robust_rank_row_counts_by_holonomy_class: freeze(robustRankCounts),
    robust_unimodular_row_counts_by_holonomy_class: freeze(robustUnimodularCounts),
    exact: exact
      && replayRows === expectedRows
      && classRowAudits === expectedRows * 4
      && memberScheduleAudits === expectedRows * 6,
  });
}

function policyCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policy = dromologicalHolonomyClassReplayPolicy();
  const expectedRows = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ];
  const expectedSignatures = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];

  const exactRows = same(policy.map(row => row.replay_row), expectedRows);
  const exactSignatures = same(policy.map(row => row.repair_signature), expectedSignatures);
  const robust = policy.every((row, index) => (
    classifyReplayAgainstHolonomyClass(classes[index], row.replay_row)
      .actual_class_robust_unimodular_rescue === true
  ));
  const pairingDiscipline = policy.every(row => row.pairings.every(pairing => (
    pairing.required ? pairing.pairing === 1 : pairing.pairing === 0
  )));

  const minimumCost = policy.every((row, index) => {
    const lowerBound = classes[index].defect_directions.length === 0 ? 0 : 1;
    return row.l0_cost === lowerBound && row.l1_cost === lowerBound;
  });

  return freeze({
    policy,
    expected_policy_rows: freeze(expectedRows.map(row => freeze(row))),
    expected_policy_signatures: freeze(expectedSignatures.map(row => freeze(row))),
    exact_policy_rows: exactRows,
    exact_policy_signatures: exactSignatures,
    required_pairings_positive_unit_and_nonrequired_zero: pairingDiscipline,
    every_policy_row_robustly_unimodular_for_its_class: robust,
    theoretical_cost_lower_bound: 'empty defect set permits zero; every nonempty robust-unimodular defect set requires a nonzero integer row, hence l0>=1 and l1>=1',
    l0_l1_minima_attained: minimumCost,
    exact: exactRows && exactSignatures && pairingDiscipline && robust && minimumCost,
  });
}

function finiteCostHostile(limit = 4) {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const observedMinima = classes.map(() => ({ l0: Infinity, l1: Infinity }));

  for (let a = -limit; a <= limit; a += 1) {
    for (let b = -limit; b <= limit; b += 1) {
      for (let c = -limit; c <= limit; c += 1) {
        const replayRow = [a, b, c];
        classes.forEach((holonomyClass, index) => {
          const classified = classifyReplayAgainstHolonomyClass(holonomyClass, replayRow);
          if (classified.actual_class_robust_unimodular_rescue) {
            observedMinima[index].l0 = Math.min(observedMinima[index].l0, l0(replayRow));
            observedMinima[index].l1 = Math.min(observedMinima[index].l1, l1(replayRow));
          }
        });
      }
    }
  }

  const expected = [
    { l0: 0, l1: 0 },
    { l0: 1, l1: 1 },
    { l0: 1, l1: 1 },
    { l0: 1, l1: 1 },
  ];
  return freeze({
    replay_cube_limit: limit,
    observed_minimum_costs: freeze(observedMinima.map(row => freeze(row))),
    expected_minimum_costs: freeze(expected.map(row => freeze(row))),
    exact: same(observedMinima, expected),
  });
}

function nullFiberCostCertificate() {
  const signature = [1, 1];
  const section = canonicalReplayRepairRepresentative(signature);
  const optimized = [1, 0, 0];
  const comparison = compareReplayRepairRows(section, optimized);
  return freeze({
    repair_signature: freeze(signature),
    canonical_section_representative: section,
    optimized_same_fiber_representative: freeze(optimized),
    section_l0: l0(section),
    section_l1: l1(section),
    optimized_l0: l0(optimized),
    optimized_l1: l1(optimized),
    same_repair_signature: comparison.same_repair_signature,
    same_repair_determinant_atlas: comparison.same_repair_determinant_atlas,
    full_p_first_side_minor_atlas_still_distinguishes_rows:
      comparison.same_p_first_replay_side_minor_atlas === false,
    strict_l0_improvement: l0(optimized) < l0(section),
    strict_l1_improvement: l1(optimized) < l1(section),
    exact: comparison.same_repair_signature
      && comparison.same_repair_determinant_atlas
      && comparison.same_p_first_replay_side_minor_atlas === false
      && l0(optimized) < l0(section)
      && l1(optimized) < l1(section),
  });
}

function antiNecessityCertificate() {
  const universal = [1, 0, 0];
  const allSix = classifyDromologicalReplayRow(universal);
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const allClasses = classes.every(holonomyClass => (
    classifyReplayAgainstHolonomyClass(holonomyClass, universal)
      .actual_class_robust_unimodular_rescue === true
  ));
  return freeze({
    universal_replay_row: freeze(universal),
    all_six_unimodular_rescue: allSix.actual_all_six_have_unimodular_minor,
    every_holonomy_class_robustly_unimodular: allClasses,
    terminal_holonomy_not_necessary_for_all_six_repair: allSix.actual_all_six_have_unimodular_minor && allClasses,
  });
}

export function dromologicalHolonomyCoarsenedReplayInverseDesignCertificate() {
  const parentQuotient = dromologicalReplayRepairQuotientCertificate();
  const parentTransversality = dromologicalReplayTransversalityLocusCertificate();
  const atlas = dromologicalS3ScheduleAtlasCertificate();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const structure = classStructureCertificate();
  const finite = finiteHolonomyReplayAudit(4);
  const policy = policyCertificate();
  const finiteCost = finiteCostHostile(4);
  const nullFiber = nullFiberCostCertificate();
  const antiNecessity = antiNecessityCertificate();

  const passed = parentQuotient.passed
    && parentTransversality.passed
    && atlas.passed
    && lag.passed
    && structure.exact
    && finite.exact
    && policy.exact
    && finiteCost.exact
    && nullFiber.exact
    && antiNecessity.terminal_holonomy_not_necessary_for_all_six_repair;

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_PARENT_RECEIPT,
    holonomy_class_structure: structure,
    finite_holonomy_replay_audit: finite,
    holonomy_class_replay_policy: policy,
    finite_cost_hostile: finiteCost,
    null_fiber_cost_certificate: nullFiber,
    anti_necessity_certificate: antiNecessity,
    historical_schedule_identity_prefix: lag.minimal_schedule_identification_prefix,
    passed,
    defect_set_classification: passed
      ? 'TERMINAL_FORMAL_HOLONOMY_CLASS_IN_THE_FIXED_S3_FIXTURE_IS_SUFFICIENT_TO_DETERMINE_THE_EXACT_SET_OF_MISSING_DIRECTIONS_THAT_A_REPLAY_ROW_MUST_TRANSVERSE_FOR_CLASS_ROBUST_RANK_OR_UNIMODULAR_REPAIR'
      : 'HOLONOMY_CLASS_DEFECT_SET_REPAIR_CLASSIFICATION_NOT_ESTABLISHED',
    robust_repair_classification: passed
      ? 'INCOMPLETE_TERMINAL_FORMAL_HOLONOMY_MEMORY_CAN_STILL_BE_SUFFICIENT_FOR_CLASS_ROBUST_UNIMODULAR_REPAIR_IN_THE_FIXED_S3_FIXTURE'
      : 'HOLONOMY_COARSENED_ROBUST_REPAIR_NOT_ESTABLISHED',
    null_fiber_design_law: passed
      ? 'NULL_FIBER_FREEDOM_CAN_CHANGE_RAW_INTEGER_REPLAY_DESIGN_COST_WITHOUT_CHANGING_THE_FIXED_FIXTURE_REPAIR_PHENOTYPE'
      : 'NULL_FIBER_REPLAY_COST_LAW_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'TERMINAL_FORMAL_HOLONOMY_CAN_BE_TOO_COARSE_FOR_TEMPORAL_SCHEDULE_RECONSTRUCTION_YET_FINE_ENOUGH_FOR_CLASS_ROBUST_EXACT_REPLAY_REPAIR_WITH_ZERO_AUTHORITY_WIDENING'
      : 'HOLONOMY_MEMORY_REPAIR_SUFFICIENCY_SEPARATION_NOT_ESTABLISHED',
    scars: freeze([
      'TERMINAL_FORMAL_HOLONOMY != COMPLETE_DROMOLOGICAL_MEMORY',
      'SAME_TERMINAL_HOLONOMY != SAME_MISSING_DIRECTION',
      'HOLONOMY_CLASS_DEFECT_SET != PHYSICAL_HOLONOMY_SPECTRUM',
      'HOLONOMY_GUIDED_REPAIR_SUFFICIENCY != HOLONOMY_NECESSITY_FOR_REPAIR',
      'CLASS_ROBUST_REPLAY_POLICY != OPERATIONAL_SENSOR_CONTROL',
      'CLASS_CONDITIONED_INTEGER_COST_MINIMALITY != UNIVERSAL_OPTIMAL_EXPERIMENT_DESIGN',
      'NULL_FIBER_COST_OPTIMIZATION != PHYSICAL_GAUGE_FIXING',
      'CANONICAL_SECTION != COST_OPTIMAL_REPRESENTATIVE',
      'ROBUST_REPAIR != RECOVERY_OF_FORGOTTEN_SCHEDULE_IDENTITY',
      'FORMAL_HOLONOMY_COARSENING != SEMANTIC_CAUSATION',
    ]),
  });
}

export function compileDromologicalHolonomyCoarsenedReplayProjection(receiver) {
  const certificate = dromologicalHolonomyCoarsenedReplayInverseDesignCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified holonomy-coarsened replay inverse design');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-coarsened-replay-child-legible/v0.1',
      truths: freeze([
        'THE_LAST_PATTERN_CAN_FORGET_THE_EXACT_ORDER_AND_STILL_TELL_US_WHAT_KIND_OF_EXTRA_CHECK_IS_SAFE',
        'ONE_SHARED_LAST_PATTERN_NEEDS_AN_EXTRA_CHECK_THAT_COVERS_TWO_POSSIBLE_MISSING_CLUES',
        'A_SHORTER_EXTRA_CHECK_CAN_LIVE_IN_THE_SAME_REPAIR_FAMILY',
        'FIXING_THE_MISSING_CLUE_DOES_NOT_RECOVER_THE_FORGOTTEN_ORDER',
      ]),
      terminal_holonomy_matrices_exposed: false,
      kernel_vectors_exposed: false,
      replay_vectors_exposed: false,
      quotient_matrix_exposed: false,
      determinant_formulas_exposed: false,
      inverse_formulas_exposed: false,
      latent_coordinates_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-coarsened-replay-loom-technical/v0.1',
      holonomy_class_structure: certificate.holonomy_class_structure,
      holonomy_class_replay_policy: certificate.holonomy_class_replay_policy,
      finite_holonomy_replay_audit: certificate.finite_holonomy_replay_audit,
      finite_cost_hostile: certificate.finite_cost_hostile,
      null_fiber_cost_certificate: certificate.null_fiber_cost_certificate,
      anti_necessity_certificate: certificate.anti_necessity_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for holonomy-coarsened replay inverse design: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_COARSENED_REPLAY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_s3_formal_holonomy_repair_policy: true,
      complete_schedule_reconstruction_from_terminal_holonomy: false,
      universal_holonomy_guided_inverse_design: false,
      universal_optimal_sensor_theorem: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      physical_gauge_fixing: false,
      continuum_tomography: false,
      operational_sensor_control: false,
      operational_inverse_route: false,
      semantic_causation: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyCoarsenedReplayOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const overclaim = ceiling.complete_schedule_reconstruction_from_terminal_holonomy === true
    || ceiling.universal_holonomy_guided_inverse_design === true
    || ceiling.universal_optimal_sensor_theorem === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true
    || ceiling.physical_gauge_fixing === true
    || ceiling.continuum_tomography === true
    || ceiling.operational_sensor_control === true
    || ceiling.operational_inverse_route === true
    || ceiling.semantic_causation === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.terminal_holonomy_matrices_exposed === true
    || candidate?.payload?.kernel_vectors_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.quotient_matrix_exposed === true
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
