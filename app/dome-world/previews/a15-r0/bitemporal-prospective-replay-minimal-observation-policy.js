import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { DROMOLOGICAL_BASELINE_REPLAY_ROW } from './dromological-baseline-replay-rescue-aperture.js';
import {
  finiteAdmissibilityDescentProfile,
} from './aperture-pedagogue-finite-admissibility-descent-theorem.js';
import {
  bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate,
} from './bitemporal-authority-birth-nonretroactive-jurisdiction.js';

export const BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_SCHEMA =
  'td613.dome-world.bitemporal-prospective-replay-minimal-observation-policy/v0.1';
export const BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT =
  '54b10adf8a30e779b1cb5f15ce6a4e8350285365';

const PREFIXES = Object.freeze([1, 2, 3]);
const EXPECTED_MINIMUM_COUNTS = Object.freeze({
  'P-H-I': 3,
  'P-I-H': 3,
  'H-P-I': 4,
  'H-I-P': 3,
  'I-P-H': 4,
  'I-H-P': 3,
});
const EXPECTED_THREE_ROW_RANKS = Object.freeze({
  'P-H-I': Object.freeze([3, 2, 2]),
  'P-I-H': Object.freeze([3, 2, 2]),
  'H-P-I': Object.freeze([2, 2, 2]),
  'H-I-P': Object.freeze([2, 3, 3]),
  'I-P-H': Object.freeze([2, 2, 2]),
  'I-H-P': Object.freeze([2, 3, 3]),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'source_state_transform',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

let cachedCertificate = null;

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

function tripleIndexSets(rowCount) {
  const triples = [];
  for (let a = 0; a < rowCount; a += 1) {
    for (let b = a + 1; b < rowCount; b += 1) {
      for (let c = b + 1; c < rowCount; c += 1) triples.push(freeze([a, b, c]));
    }
  }
  return freeze(triples);
}

function rankRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) return 0;
  if (rows.length >= 3 && tripleIndexSets(rows.length).some(indices => (
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

function dot(row, vector) {
  return row.reduce((sum, value, index) => sum + value * vector[index], 0);
}

function inverseUnimodular3(matrix, observation) {
  const det = determinant3(matrix);
  if (Math.abs(det) !== 1) throw new Error('selected adaptive observation minor must be unimodular');
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const adjugate = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  return freeze(adjugate.map(row => {
    const numerator = dot(row, observation);
    const value = numerator / det;
    if (!Number.isInteger(value)) throw new Error('unimodular adaptive inverse produced noninteger state');
    return value === 0 ? 0 : value;
  }));
}

function stateCube() {
  const rows = [];
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) rows.push(freeze([x1, x2, x3]));
    }
  }
  return freeze(rows);
}

function replayRequired(schedule) {
  return rankRows(phasonicObservationMatrix(schedule)) < 3;
}

function prefixMatrix(schedule, prefix) {
  return freeze(phasonicObservationMatrix(schedule).slice(0, prefix).map(row => freeze([...row])));
}

function prefixKey(schedule, prefix) {
  return JSON.stringify(prefixMatrix(schedule, prefix));
}

function processEquivalentSchedules(targetSchedule, prefix) {
  const key = prefixKey(targetSchedule, prefix);
  return freeze(DROMOLOGICAL_S3_SCHEDULES.filter(schedule => prefixKey(schedule, prefix) === key));
}

function observationPrefix(schedule, state, prefix) {
  return freeze(observePhasonicState(state, schedule).slice(0, prefix));
}

function auditReplayRequiredCell(targetSchedule, prefix, states) {
  const family = processEquivalentSchedules(targetSchedule, prefix);
  const rows = [];
  for (const schedule of family) {
    for (const state of states) {
      rows.push(freeze({
        antecedent: freeze([scheduleId(schedule), [...state]]),
        quotient: freeze([prefixMatrix(schedule, prefix), observationPrefix(schedule, state, prefix)]),
        support: freeze([replayRequired(schedule)]),
      }));
    }
  }
  const profile = finiteAdmissibilityDescentProfile(rows);
  const authorized = profile.status === 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
    && profile.exact_descended_rule_exists === true
    && profile.occupied_fibers.every(fiber => fiber.irreducible_gap_cardinality === 0);
  return freeze({
    schedule_id: scheduleId(targetSchedule),
    prefix,
    conditioning_schedule_ids: freeze(family.map(scheduleId)),
    antecedent_count: rows.length,
    replay_required: replayRequired(targetSchedule),
    authorized,
    all_irreducible_gaps_empty: authorized,
    profile,
  });
}

function replayRequiredAuthorityCertificate(states, parent) {
  const schedules = DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
    const cells = PREFIXES.map(prefix => auditReplayRequiredCell(schedule, prefix, states));
    const first = cells.find(cell => cell.authorized);
    return freeze({
      schedule_id: scheduleId(schedule),
      replay_required: replayRequired(schedule),
      birth: first?.prefix ?? 'INF',
      cells: freeze(cells),
    });
  });
  const parentScheduleBirths = parent.schedules.map(row => freeze({
    schedule_id: row.schedule_id,
    schedule_birth: row.claim_rows.find(claim => claim.claim === 'SCHEDULE')?.birth ?? 'INF',
  }));
  const exact = schedules.every(row => row.birth === 1 && row.cells.every(cell => cell.authorized))
    && parentScheduleBirths.every(row => row.schedule_birth === 2);
  return freeze({
    new_claim_family: 'REPLAY_REQUIRED_FOR_EXACT_STATE',
    schedules: freeze(schedules),
    new_claim_birth_count_at_prefix_one: schedules.filter(row => row.birth === 1).length,
    new_jurisdiction_cells: schedules.length * PREFIXES.length,
    new_authorized_cells: schedules.reduce((sum, row) => sum + row.cells.filter(cell => cell.authorized).length, 0),
    new_held_cells: schedules.reduce((sum, row) => sum + row.cells.filter(cell => !cell.authorized).length, 0),
    inherited_schedule_births: freeze(parentScheduleBirths),
    replay_required_horizon: 1,
    exact_schedule_horizon: 2,
    exact,
  });
}

function acquisitionRow(kind, originalIndex, row) {
  return freeze({ kind, original_index: originalIndex, row: freeze([...row]) });
}

function canonicalAcquisition(schedule) {
  const original = phasonicObservationMatrix(schedule);
  const acquisitions = [acquisitionRow('original', 0, original[0])];
  if (replayRequired(schedule)) acquisitions.push(acquisitionRow('replay', null, DROMOLOGICAL_BASELINE_REPLAY_ROW));
  acquisitions.push(acquisitionRow('original', 1, original[1]));
  if (rankRows(acquisitions.map(row => row.row)) < 3) {
    acquisitions.push(acquisitionRow('original', 2, original[2]));
  }
  return freeze(acquisitions);
}

function lawfulThreeRowHistories(schedule) {
  const original = phasonicObservationMatrix(schedule);
  return freeze([
    freeze({ id: 'O1_O2_O3', rows: freeze([original[0], original[1], original[2]].map(row => freeze([...row]))) }),
    freeze({ id: 'O1_R_O2', rows: freeze([original[0], DROMOLOGICAL_BASELINE_REPLAY_ROW, original[1]].map(row => freeze([...row]))) }),
    freeze({ id: 'O1_O2_R', rows: freeze([original[0], original[1], DROMOLOGICAL_BASELINE_REPLAY_ROW].map(row => freeze([...row]))) }),
  ]);
}

function policyGeometryRow(schedule) {
  const id = scheduleId(schedule);
  const original = phasonicObservationMatrix(schedule);
  const histories = lawfulThreeRowHistories(schedule).map(history => freeze({
    id: history.id,
    rank: rankRows(history.rows),
    determinant: determinant3(history.rows),
  }));
  const canonical = canonicalAcquisition(schedule);
  const canonicalRows = canonical.map(row => row.row);
  const threeRowExactExists = histories.some(history => history.rank === 3 && Math.abs(history.determinant) === 1);
  const dimensionLowerBound = 3;
  const minimum = threeRowExactExists ? 3 : 4;
  const canonicalRank = rankRows(canonicalRows);
  const canonicalUnimodularMinorCount = tripleIndexSets(canonicalRows.length).filter(indices => (
    Math.abs(determinant3(indices.map(index => canonicalRows[index]))) === 1
  )).length;
  const optimalTimingCount = id.startsWith('P-')
    ? 1
    : histories.filter(history => history.rank === 3 && Math.abs(history.determinant) === 1).length
      + (minimum === 4 ? 1 : 0);
  return freeze({
    schedule: freeze([...schedule]),
    schedule_id: id,
    replay_required: replayRequired(schedule),
    native_original_rank: rankRows(original),
    lawful_three_row_histories: histories,
    lawful_three_row_rank_vector: freeze(histories.map(history => history.rank)),
    three_row_exact_history_exists: threeRowExactExists,
    dimension_lower_bound: dimensionLowerBound,
    pointwise_minimum_observation_count: minimum,
    canonical_acquisition_trace: canonical,
    canonical_observation_count: canonical.length,
    canonical_rank: canonicalRank,
    canonical_unimodular_minor_count: canonicalUnimodularMinorCount,
    optimal_timing_count_lower_bound: optimalTimingCount,
    optimal_timing_unique: optimalTimingCount === 1,
    exact: same(histories.map(history => history.rank), EXPECTED_THREE_ROW_RANKS[id])
      && minimum === EXPECTED_MINIMUM_COUNTS[id]
      && canonical.length === minimum
      && canonicalRank === 3
      && canonicalUnimodularMinorCount >= 1,
  });
}

function selectedUnimodularMinor(acquisitions) {
  const rows = acquisitions.map(row => row.row);
  const selected = tripleIndexSets(rows.length).find(indices => (
    Math.abs(determinant3(indices.map(index => rows[index]))) === 1
  ));
  if (!selected) return null;
  return freeze({
    acquisition_indices: selected,
    matrix: freeze(selected.map(index => freeze([...rows[index]]))),
    determinant: determinant3(selected.map(index => rows[index])),
  });
}

function acquisitionObservation(acquisition, originalObservation, state) {
  if (acquisition.kind === 'replay') return dot(DROMOLOGICAL_BASELINE_REPLAY_ROW, state);
  return originalObservation[acquisition.original_index];
}

function finiteAdaptiveReconstructionCertificate(geometry, states) {
  let checked = 0;
  let exact = true;
  const perSchedule = [];
  for (const row of geometry) {
    const selected = selectedUnimodularMinor(row.canonical_acquisition_trace);
    let scheduleChecked = 0;
    if (!selected) {
      exact = false;
      continue;
    }
    for (const state of states) {
      const originalObservation = observePhasonicState(state, row.schedule);
      const acquiredObservation = row.canonical_acquisition_trace.map(acquisition => (
        acquisitionObservation(acquisition, originalObservation, state)
      ));
      const selectedObservation = selected.acquisition_indices.map(index => acquiredObservation[index]);
      const recovered = inverseUnimodular3(selected.matrix, selectedObservation);
      checked += 1;
      scheduleChecked += 1;
      if (!same(recovered, state)) exact = false;
    }
    perSchedule.push(freeze({
      schedule_id: row.schedule_id,
      acquired_rows: row.canonical_observation_count,
      selected_minor_indices: selected.acquisition_indices,
      selected_minor_determinant: selected.determinant,
      checked_states: scheduleChecked,
    }));
  }
  return freeze({
    checked_state_schedule_pairs: checked,
    expected_state_schedule_pairs: 750,
    per_schedule: freeze(perSchedule),
    exact: exact && checked === 750 && perSchedule.every(row => row.checked_states === 125),
  });
}

function extendedLedgerCertificate(parent, replayAuthority) {
  const inheritedSpectrum = parent.birth_spectrum;
  const spectrum = freeze({
    '1': inheritedSpectrum['1'] + replayAuthority.new_claim_birth_count_at_prefix_one,
    '2': inheritedSpectrum['2'],
    '3': inheritedSpectrum['3'],
    INF: inheritedSpectrum.INF,
  });
  const ledger = freeze({
    claim_family_count: parent.finite_domain.claim_family_count + 1,
    schedule_claim_pair_count: 42,
    jurisdiction_cell_count: parent.finite_domain.jurisdiction_cell_count + replayAuthority.new_jurisdiction_cells,
    authorized_cells: parent.ledger_totals.authorized_cells + replayAuthority.new_authorized_cells,
    held_cells: parent.ledger_totals.held_cells + replayAuthority.new_held_cells,
    inherited_held_cells_preserved: parent.ledger_totals.held_cells,
    inherited_eventually_authorized_but_earlier_held_cells_preserved:
      parent.ledger_totals.eventually_authorized_but_earlier_held_cells,
    inherited_never_authorized_cells_preserved: parent.ledger_totals.never_authorized_cells,
  });
  const exact = same(spectrum, { '1': 14, '2': 10, '3': 6, INF: 12 })
    && ledger.claim_family_count === 7
    && ledger.schedule_claim_pair_count === 42
    && ledger.jurisdiction_cell_count === 126
    && ledger.authorized_cells === 68
    && ledger.held_cells === 58
    && ledger.inherited_held_cells_preserved === 58
    && ledger.inherited_eventually_authorized_but_earlier_held_cells_preserved === 22
    && ledger.inherited_never_authorized_cells_preserved === 36;
  return freeze({ birth_spectrum: spectrum, ledger, exact });
}

export function bitemporalProspectiveReplayMinimalObservationPolicyCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
  const states = stateCube();
  const replayAuthority = replayRequiredAuthorityCertificate(states, parent);
  const geometry = freeze(DROMOLOGICAL_S3_SCHEDULES.map(policyGeometryRow));
  const finite = finiteAdaptiveReconstructionCertificate(geometry, states);
  const extended = extendedLedgerCertificate(parent, replayAuthority);
  const minima = freeze(Object.fromEntries(geometry.map(row => [row.schedule_id, row.pointwise_minimum_observation_count])));
  const adaptiveBurden = Object.values(minima).reduce((sum, value) => sum + value, 0);
  const unconditionalBurden = DROMOLOGICAL_S3_SCHEDULES.length * 4;
  const nonuniqueTimingSchedules = geometry.filter(row => !row.optimal_timing_unique).map(row => row.schedule_id);
  const exact = parent.passed
    && states.length === 125
    && replayAuthority.exact
    && geometry.every(row => row.exact)
    && finite.exact
    && extended.exact
    && same(minima, EXPECTED_MINIMUM_COUNTS)
    && adaptiveBurden === 20
    && unconditionalBurden === 24
    && nonuniqueTimingSchedules.length === 4;
  cachedCertificate = freeze({
    schema: BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_SCHEMA,
    parent_receipt: BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_PARENT_RECEIPT,
    replay_row: DROMOLOGICAL_BASELINE_REPLAY_ROW,
    replay_required_authority_certificate: replayAuthority,
    extended_bitemporal_ledger_certificate: extended,
    policy_geometry: geometry,
    pointwise_minimum_observation_counts: minima,
    complete_atlas_adaptive_scalar_observation_burden: adaptiveBurden,
    unconditional_three_original_plus_replay_burden: unconditionalBurden,
    exact_rows_avoided: unconditionalBurden - adaptiveBurden,
    nonunique_optimal_replay_timing_schedule_ids: freeze(nonuniqueTimingSchedules),
    finite_adaptive_reconstruction_certificate: finite,
    passed: exact,
    classifications: freeze(exact ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_REPLAY_REQUIRED_FOR_EXACT_STATE_EXTENDS_THE_EARNED_BITEMPORAL_JURISDICTION_LEDGER_AS_A_SEVENTH_CLAIM_FAMILY_WITH_AUTHORITY_BIRTH_AT_PREFIX_ONE_ON_ALL_SIX_SCHEDULES_WHILE_EXACT_SCHEDULE_AUTHORITY_REMAINS_AT_PREFIX_TWO',
      'A_FIXED_NO_SKIP_SEQUENTIAL_PREFIX_POLICY_WITH_AT_MOST_ONE_DECLARED_BASELINE_REPLAY_MEASUREMENT_HAS_EXACT_POINTWISE_MINIMUM_SCALAR_OBSERVATION_COUNTS_3_3_4_3_4_3_ACROSS_THE_COMPLETE_SIX_SCHEDULE_ATLAS',
      'THE_COMPLETE_ADAPTIVE_ATLAS_REQUIRES_TWENTY_SCALAR_OBSERVATIONS_RATHER_THAN_THE_UNCONDITIONAL_TWENTY_FOUR_WITH_FOUR_ROWS_AVOIDED_WITHOUT_WEAKENING_EXACT_RECONSTRUCTION',
      'EARLIER_MEASUREMENT_POLICY_AUTHORITY_CAN_CHANGE_WHAT_IS_MEASURED_NEXT_BEFORE_EXACT_PROCESS_IDENTITY_OR_COMPLETE_LATENT_STATE_AUTHORITY_EXISTS_IN_THE_FIXED_FINITE_FIXTURE',
      'POINTWISE_MINIMUM_OBSERVATION_COUNT_DOES_NOT_SELECT_A_UNIQUE_OPTIMAL_REPLAY_TIMING_ON_THE_FOUR_REPLAY_REQUIRED_SCHEDULES',
    ] : []),
    scars: freeze([
      'POLICY_AUTHORITY_BIRTH != SCHEDULE_AUTHORITY_BIRTH',
      'POLICY_AUTHORITY != LATENT_STATE_POSSESSION',
      'EARLY_REPLAY_AUTHORIZATION != EARLY_STATE_RECONSTRUCTION',
      'POINTWISE_MINIMAL_OBSERVATION_COUNT != UNIQUE_OPTIMAL_REPLAY_TIMING',
      'PREFIX_ACQUISITION != ARBITRARY_SUBSEQUENCE_SELECTION',
      'FIXED_BASELINE_REPLAY != ARBITRARY_SENSOR_DESIGN',
      'ADAPTIVE_MEASUREMENT_POLICY != AUTONOMOUS_EXPERIMENT_EXECUTION',
      'SCALAR_MEASUREMENT_BUDGET != SHANNON_CAPACITY',
      'FINITE_RANK_LOWER_BOUND != ASYMPTOTIC_RECOVERY_THEOREM',
      'FINITE_RANK_LOWER_BOUND != CONTINUUM_TOMOGRAPHY_LIMIT',
      'ROWS_AVOIDED != EXPECTED_VALUE_SAVINGS',
      'LATER_EXACT_RECONSTRUCTION != RETROACTIVE_POSSESSION',
      'NEW_CLAIM_FAMILY != REWRITE_OF_PARENT_LEDGER',
      'THIS_CHAMBER != PR_699_ENDOGENOUS_OPERATOR_REAUDIT',
    ]),
  });
  return cachedCertificate;
}

export function compileBitemporalProspectiveReplayMinimalObservationProjection(receiver) {
  const certificate = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified prospective replay policy');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.bitemporal-prospective-replay-child-legible/v0.1',
      truths: freeze([
        'AFTER_THE_FIRST_LAYER_WE_CAN_ALREADY_KNOW_WHETHER_THIS_FIXED_EXTRA_CHECK_WILL_BE_NEEDED',
        'KNOWING_WHETHER_TO_USE_THE_EXTRA_CHECK_ARRIVES_BEFORE_KNOWING_THE_COMPLETE_ORDER',
        'FOUR_OF_THE_SIX_ORDERS_NEED_ONLY_THREE_SCALAR_CHECKS_UNDER_THIS_FIXED_POLICY',
        'TWO_ORDERS_NEED_FOUR_SCALAR_CHECKS_BECAUSE_THREE_LAWFUL_PREFIX_CHECKS_CANNOT_REACH_RANK_THREE',
        'A_LATER_EXACT_RECOVERY_DOES_NOT_MAKE_THE_HIDDEN_STATE_OURS_AT_AN_EARLIER_PREFIX',
      ]),
      matrices_exposed: false,
      replay_vector_exposed: false,
      inverse_coefficients_exposed: false,
      latent_state_values_exposed: false,
      complete_jurisdiction_ledger_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.bitemporal-prospective-replay-loom-technical/v0.1',
      pointwise_minimum_observation_counts: certificate.pointwise_minimum_observation_counts,
      adaptive_scalar_observation_burden: certificate.complete_atlas_adaptive_scalar_observation_burden,
      unconditional_scalar_observation_burden: certificate.unconditional_three_original_plus_replay_burden,
      rows_avoided: certificate.exact_rows_avoided,
      replay_required_horizon: certificate.replay_required_authority_certificate.replay_required_horizon,
      exact_schedule_horizon: certificate.replay_required_authority_certificate.exact_schedule_horizon,
      extended_birth_spectrum: certificate.extended_bitemporal_ledger_certificate.birth_spectrum,
      nonunique_optimal_replay_timing_schedule_ids: certificate.nonunique_optimal_replay_timing_schedule_ids,
      complete_jurisdiction_ledger_exposed: false,
      inverse_coefficients_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for prospective replay policy: ${receiver}`);
  }
  return freeze({
    schema: BITEMPORAL_PROSPECTIVE_REPLAY_MINIMAL_OBSERVATION_POLICY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      executed_state_reconstructions: certificate.finite_adaptive_reconstruction_certificate.checked_state_schedule_pairs,
      inherited_replay_reconstructions_counted_as_current_execution: false,
      unacquired_rows_counted_as_executed: false,
    }),
    claim_ceiling: freeze({
      bounded_bitemporal_adaptive_policy: true,
      universal_optimal_experimental_design: false,
      shannon_capacity: false,
      asymptotic_recovery_theorem: false,
      continuum_tomography: false,
      physical_active_sensing: false,
      physical_sensor_control: false,
      autonomous_experiment_execution: false,
      general_bitemporal_database_theorem: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectBitemporalProspectiveReplayPolicyOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_optimal_experimental_design === true
    || ceiling.shannon_capacity === true
    || ceiling.asymptotic_recovery_theorem === true
    || ceiling.continuum_tomography === true
    || ceiling.physical_active_sensing === true
    || ceiling.physical_sensor_control === true
    || ceiling.autonomous_experiment_execution === true
    || ceiling.general_bitemporal_database_theorem === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const protocolViolation = candidate?.original_prefix_skip === true
    || candidate?.arbitrary_new_sensing_row === true
    || candidate?.source_schedule_reordered === true
    || candidate?.endogenous_operator_mutation === true;
  const hierarchyCollapse = candidate?.exact_schedule_at_prefix_one === true
    || candidate?.policy_authority_implies_latent_state_authority === true
    || candidate?.later_reconstruction_backdates_earlier_possession === true;
  const falseOptimality = candidate?.always_replay_claimed_pointwise_minimal === true
    || candidate?.never_replay_claimed_exact_all_six === true
    || candidate?.all_six_three_rows_claimed_exact === true
    || candidate?.unique_optimal_replay_timing === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const executionInflation = candidate?.execution_ledger?.inherited_replay_reconstructions_counted_as_current_execution === true
    || candidate?.execution_ledger?.unacquired_rows_counted_as_executed === true
    || Number(candidate?.execution_ledger?.executed_state_reconstructions ?? 0) > 750;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.matrices_exposed === true
    || candidate?.payload?.replay_vector_exposed === true
    || candidate?.payload?.inverse_coefficients_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true
    || candidate?.payload?.complete_jurisdiction_ledger_exposed === true
  );
  return freeze({
    accepted: !authority
      && !overreach
      && !protocolViolation
      && !hierarchyCollapse
      && !falseOptimality
      && !sourceMutation
      && !executionInflation
      && !runtime
      && !ashLeak,
  });
}