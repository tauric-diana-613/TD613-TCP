import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  dromologicalScheduleStateIdentifiabilityLagCertificate,
} from './dromological-schedule-state-identifiability-lag.js';
import {
  FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
  finiteAdmissibilityDescentProfile,
} from './aperture-pedagogue-finite-admissibility-descent-theorem.js';
import {
  dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate,
} from './dromological-holonomy-safe-authority-closure-correspondence.js';

export const BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_SCHEMA =
  'td613.dome-world.bitemporal-authority-birth-nonretroactive-jurisdiction/v0.1';
export const BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_PARENT_RECEIPT =
  '8048a3986e2e583f59cc84500ec13caa49f0a52d';
export const BITEMPORAL_AUTHORITY_BIRTH_FADT_RECEIPT =
  '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
export const BITEMPORAL_AUTHORITY_BIRTH_LAG_RECEIPT =
  'a51afae88292878de2c02ca0a086ad1e88f73cfb';

const CLAIMS = Object.freeze([
  'FIRST_STRATUM',
  'SCHEDULE',
  'X1',
  'X2',
  'X3',
  'FULL_STATE',
]);
const PREFIXES = Object.freeze([1, 2, 3]);
const EXPECTED_BIRTH_SIGNATURES = Object.freeze({
  'P-H-I': Object.freeze([1, 2, 1, 2, 3, 3]),
  'P-I-H': Object.freeze([1, 2, 1, 3, 2, 3]),
  'H-P-I': Object.freeze([1, 2, 'INF', 'INF', 3, 'INF']),
  'H-I-P': Object.freeze([1, 2, 'INF', 'INF', 2, 'INF']),
  'I-P-H': Object.freeze([1, 2, 'INF', 3, 'INF', 'INF']),
  'I-H-P': Object.freeze([1, 2, 'INF', 2, 'INF', 'INF']),
});
const EXPECTED_BIRTH_SPECTRUM = Object.freeze({ '1': 8, '2': 10, '3': 6, INF: 12 });
const EXPECTED_AUTHORIZED_ACCUMULATION = Object.freeze({ '1': 8, '2': 18, '3': 24 });
const EXPECTED_HELD_ACCUMULATION = Object.freeze({ '1': 28, '2': 18, '3': 12 });
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
  const letter = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letter[stratum]).join('-');
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

function claimValue(claim, schedule, state) {
  if (claim === 'FIRST_STRATUM') return schedule[0];
  if (claim === 'SCHEDULE') return scheduleId(schedule);
  if (claim === 'X1') return state[0];
  if (claim === 'X2') return state[1];
  if (claim === 'X3') return state[2];
  if (claim === 'FULL_STATE') return freeze([...state]);
  throw new Error(`undeclared authority-birth claim family: ${claim}`);
}

function traceValue(schedule, state, prefix) {
  return freeze([
    prefixMatrix(schedule, prefix),
    observationPrefix(schedule, state, prefix),
  ]);
}

function rowsForCell(targetSchedule, claim, prefix, states) {
  const family = processEquivalentSchedules(targetSchedule, prefix);
  const rows = [];
  for (const schedule of family) {
    for (const state of states) {
      rows.push(freeze({
        antecedent: freeze([scheduleId(schedule), [...state]]),
        quotient: traceValue(schedule, state, prefix),
        support: freeze([claimValue(claim, schedule, state)]),
      }));
    }
  }
  return freeze(rows);
}

function twoAntecedentWound(profile) {
  const conflictFiber = profile.occupied_fibers.find(fiber => !fiber.supports_constant_on_fiber);
  if (!conflictFiber) return null;
  let left = null;
  let right = null;
  for (let i = 0; i < conflictFiber.antecedent_supports.length && !right; i += 1) {
    for (let j = i + 1; j < conflictFiber.antecedent_supports.length; j += 1) {
      const a = conflictFiber.antecedent_supports[i];
      const b = conflictFiber.antecedent_supports[j];
      if (!same(a.support, b.support)) {
        left = a;
        right = b;
        break;
      }
    }
  }
  if (!left || !right) return null;
  const pairProfile = finiteAdmissibilityDescentProfile([
    {
      antecedent: left.antecedent,
      quotient: conflictFiber.quotient,
      support: left.support,
    },
    {
      antecedent: right.antecedent,
      quotient: conflictFiber.quotient,
      support: right.support,
    },
  ]);
  const pairFiber = pairProfile.occupied_fibers?.[0];
  return freeze({
    antecedents: freeze([left.antecedent, right.antecedent]),
    supports: freeze([left.support, right.support]),
    quotient: conflictFiber.quotient,
    pair_exact_descent: pairProfile.exact_descended_rule_exists,
    union_cardinality: pairFiber?.union_cardinality ?? null,
    intersection_cardinality: pairFiber?.intersection_cardinality ?? null,
    irreducible_gap_cardinality: pairFiber?.irreducible_gap_cardinality ?? null,
    exact_two_support_wound: pairProfile.status === 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED'
      && pairProfile.exact_descended_rule_exists === false
      && pairFiber?.union_cardinality === 2
      && pairFiber?.intersection_cardinality === 0
      && pairFiber?.irreducible_gap_cardinality === 2,
  });
}

function auditCell(targetSchedule, claim, prefix, states) {
  const rows = rowsForCell(targetSchedule, claim, prefix, states);
  const profile = finiteAdmissibilityDescentProfile(rows);
  if (profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') {
    return freeze({
      target_schedule_id: scheduleId(targetSchedule),
      claim,
      prefix,
      authorized: false,
      abstained: true,
      fadt_profile_status: profile.status,
    });
  }
  const authorized = profile.exact_descended_rule_exists;
  const allGapsEmpty = profile.occupied_fibers.every(fiber => fiber.irreducible_gap_cardinality === 0);
  const wound = authorized ? null : twoAntecedentWound(profile);
  return freeze({
    target_schedule_id: scheduleId(targetSchedule),
    claim,
    prefix,
    conditioning_schedule_ids: freeze(processEquivalentSchedules(targetSchedule, prefix).map(scheduleId)),
    antecedent_count: rows.length,
    occupied_trace_count: profile.occupied_quotient_count,
    authorized,
    all_irreducible_gaps_empty: allGapsEmpty,
    explicit_two_antecedent_wound: wound,
    exact: authorized
      ? allGapsEmpty
      : wound?.exact_two_support_wound === true,
  });
}

function birthForCells(cells) {
  const first = cells.find(cell => cell.authorized);
  return first ? first.prefix : 'INF';
}

function processEquivalenceCensus() {
  const census = {};
  for (const prefix of PREFIXES) {
    const keys = new Set(DROMOLOGICAL_S3_SCHEDULES.map(schedule => prefixKey(schedule, prefix)));
    census[prefix] = keys.size;
  }
  return freeze(census);
}

function auditSchedule(targetSchedule, states) {
  const claimRows = [];
  let exact = true;
  for (const claim of CLAIMS) {
    const cells = PREFIXES.map(prefix => auditCell(targetSchedule, claim, prefix, states));
    const birth = birthForCells(cells);
    const forwardMonotone = cells.every((cell, index) => (
      index === cells.length - 1 || !cell.authorized || cells[index + 1].authorized
    ));
    if (!cells.every(cell => cell.exact) || !forwardMonotone) exact = false;
    claimRows.push(freeze({ claim, birth, cells: freeze(cells), forward_monotone: forwardMonotone }));
  }
  const signature = freeze(CLAIMS.map(claim => claimRows.find(row => row.claim === claim).birth));
  return freeze({
    schedule_id: scheduleId(targetSchedule),
    claim_rows: freeze(claimRows),
    birth_signature: signature,
    exact,
  });
}

export function bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const states = stateCube();
  const parent = dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate();
  const lag = dromologicalScheduleStateIdentifiabilityLagCertificate();
  const schedules = DROMOLOGICAL_S3_SCHEDULES.map(schedule => auditSchedule(schedule, states));

  let exact = parent.passed && lag.passed && states.length === 125 && schedules.every(row => row.exact);
  const processCensus = processEquivalenceCensus();
  if (!same(processCensus, { 1: 3, 2: 6, 3: 6 })) exact = false;

  const birthSpectrum = { '1': 0, '2': 0, '3': 0, INF: 0 };
  const authorizedAccumulation = { '1': 0, '2': 0, '3': 0 };
  const heldAccumulation = { '1': 0, '2': 0, '3': 0 };
  let authorizedCells = 0;
  let heldCells = 0;
  let eventuallyAuthorizedEarlierHeld = 0;
  let neverAuthorizedCells = 0;
  let heldCellsWithExactWound = 0;
  let authorizedCellsWithEmptyGaps = 0;
  let forwardMonotonePairs = 0;

  for (const schedule of schedules) {
    const expected = EXPECTED_BIRTH_SIGNATURES[schedule.schedule_id];
    if (!expected || !same(schedule.birth_signature, expected)) exact = false;
    for (const row of schedule.claim_rows) {
      birthSpectrum[String(row.birth)] += 1;
      if (row.forward_monotone) forwardMonotonePairs += 1;
      for (const cell of row.cells) {
        if (cell.authorized) {
          authorizedCells += 1;
          authorizedAccumulation[String(cell.prefix)] += 1;
          if (cell.all_irreducible_gaps_empty) authorizedCellsWithEmptyGaps += 1;
        } else {
          heldCells += 1;
          heldAccumulation[String(cell.prefix)] += 1;
          if (cell.explicit_two_antecedent_wound?.exact_two_support_wound) heldCellsWithExactWound += 1;
          if (row.birth === 'INF') neverAuthorizedCells += 1;
          else if (cell.prefix < row.birth) eventuallyAuthorizedEarlierHeld += 1;
        }
      }
    }
  }

  const signatureKeys = new Set(schedules.map(row => JSON.stringify(row.birth_signature)));
  const signaturesInjective = signatureKeys.size === 6;
  const partialLatentPrecedesProcess = schedules.filter(schedule => {
    const scheduleBirth = schedule.claim_rows.find(row => row.claim === 'SCHEDULE').birth;
    return ['X1', 'X2', 'X3'].some(claim => {
      const birth = schedule.claim_rows.find(row => row.claim === claim).birth;
      return birth !== 'INF' && birth < scheduleBirth;
    });
  });
  const partialLatentWithFullStateInf = schedules.filter(schedule => {
    const fullStateBirth = schedule.claim_rows.find(row => row.claim === 'FULL_STATE').birth;
    return fullStateBirth === 'INF' && ['X1', 'X2', 'X3'].some(claim => (
      schedule.claim_rows.find(row => row.claim === claim).birth !== 'INF'
    ));
  });

  const lagBridgeExact = schedules.every(schedule => {
    const scheduleBirth = schedule.claim_rows.find(row => row.claim === 'SCHEDULE').birth;
    const stateBirth = schedule.claim_rows.find(row => row.claim === 'FULL_STATE').birth;
    const expectedStateBirth = schedule.schedule_id.startsWith('P-') ? 3 : 'INF';
    return scheduleBirth === 2 && stateBirth === expectedStateBirth;
  });

  if (!same(birthSpectrum, EXPECTED_BIRTH_SPECTRUM)
      || !same(authorizedAccumulation, EXPECTED_AUTHORIZED_ACCUMULATION)
      || !same(heldAccumulation, EXPECTED_HELD_ACCUMULATION)
      || authorizedCells !== 50
      || heldCells !== 58
      || eventuallyAuthorizedEarlierHeld !== 22
      || neverAuthorizedCells !== 36
      || heldCellsWithExactWound !== 58
      || authorizedCellsWithEmptyGaps !== 50
      || forwardMonotonePairs !== 36
      || !signaturesInjective
      || partialLatentPrecedesProcess.length !== 2
      || partialLatentWithFullStateInf.length !== 4
      || !lagBridgeExact) {
    exact = false;
  }

  cachedCertificate = freeze({
    schema: BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_SCHEMA,
    parent_receipt: BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_PARENT_RECEIPT,
    fadt_receipt: BITEMPORAL_AUTHORITY_BIRTH_FADT_RECEIPT,
    fadt_schema: FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
    lag_receipt: BITEMPORAL_AUTHORITY_BIRTH_LAG_RECEIPT,
    finite_domain: freeze({
      schedule_count: DROMOLOGICAL_S3_SCHEDULES.length,
      states_per_schedule: states.length,
      antecedent_count: DROMOLOGICAL_S3_SCHEDULES.length * states.length,
      claim_family_count: CLAIMS.length,
      prefix_count: PREFIXES.length,
      jurisdiction_cell_count: DROMOLOGICAL_S3_SCHEDULES.length * CLAIMS.length * PREFIXES.length,
    }),
    process_equivalence_class_census: processCensus,
    claim_order: CLAIMS,
    schedules: freeze(schedules),
    birth_spectrum: freeze(birthSpectrum),
    authorized_accumulation: freeze(authorizedAccumulation),
    held_accumulation: freeze(heldAccumulation),
    ledger_totals: freeze({
      authorized_cells: authorizedCells,
      held_cells: heldCells,
      eventually_authorized_but_earlier_held_cells: eventuallyAuthorizedEarlierHeld,
      never_authorized_cells: neverAuthorizedCells,
      held_cells_with_exact_two_antecedent_fadt_wound: heldCellsWithExactWound,
      authorized_cells_with_empty_fadt_gaps: authorizedCellsWithEmptyGaps,
    }),
    authority_birth_signature_count: signatureKeys.size,
    authority_birth_signatures_injective_over_s3: signaturesInjective,
    forward_monotone_schedule_claim_pairs: forwardMonotonePairs,
    partial_latent_precedes_full_process_schedule_ids: freeze(partialLatentPrecedesProcess.map(row => row.schedule_id)),
    partial_latent_with_full_state_infinite_schedule_ids: freeze(partialLatentWithFullStateInf.map(row => row.schedule_id)),
    schedule_full_state_lag_bridge_exact: lagBridgeExact,
    collision_membrane: freeze({
      generic_fadt_preserved: true,
      schedule_complete_state_lag_preserved: true,
      safe_erasure_closure_preserved: true,
      commercial_ai_architecture_claim: false,
      general_bitemporal_database_theorem: false,
      physical_braid_claim: false,
    }),
    passed: exact,
    classifications: freeze(exact ? [
      'IN_THE_FIXED_S3_DROMOLOGICAL_TOMOGRAPHY_FIXTURE_EACH_OF_SIX_EXACT_CLAIM_FAMILIES_HAS_A_REGISTERED_HISTORY_AUTHORITY_BIRTH_TIME_EQUAL_TO_THE_FIRST_PREFIX_AT_WHICH_ITS_FINITE_SUPPORT_DESCENDS_EXACTLY_THROUGH_THE_PREFIX_TRACE_QUOTIENT',
      'THE_COMPLETE_THIRTY_SIX_PAIR_AUTHORITY_BIRTH_SPECTRUM_IS_EIGHT_AT_PREFIX_ONE_TEN_AT_PREFIX_TWO_SIX_AT_PREFIX_THREE_AND_TWELVE_UNREACHED_WITHIN_THE_THREE_PREFIX_FIXTURE',
      'THE_RESULTING_ONE_HUNDRED_EIGHT_CELL_CLAIM_JURISDICTION_LEDGER_CONTAINS_FIFTY_AUTHORIZED_AND_FIFTY_EIGHT_HELD_CELLS_WITH_FORWARD_ACCUMULATION_EIGHT_TO_EIGHTEEN_TO_TWENTY_FOUR',
      'EVERY_EVENTUALLY_AUTHORIZED_BUT_EARLIER_HELD_CELL_RETAINS_AN_EXPLICIT_EARLIER_TWO_ANTECEDENT_FADT_WOUND_SO_LATER_EXACT_RECONSTRUCTION_CANNOT_BACKDATE_THE_CLAIMS_PRIOR_AUTHORITY',
      'THE_SIX_AUTHORITY_BIRTH_SIGNATURES_ARE_PAIRWISE_DISTINCT_EVEN_THOUGH_FOUR_SCHEDULES_NEVER_AUTHORIZE_COMPLETE_LATENT_STATE_RECONSTRUCTION_IN_THE_FIXED_APERTURE',
      'PARTIAL_LATENT_CLAIM_AUTHORITY_CAN_PRECEDE_FULL_PROCESS_IDENTITY_AND_CAN_ALSO_EXIST_WHEN_COMPLETE_LATENT_STATE_AUTHORITY_REMAINS_UNREACHED',
      'EVENTUAL_KNOWABILITY_DOES_NOT_IMPLY_PRIOR_POSSESSION_BECOMES_AN_EXECUTABLE_PREFIX_INDEXED_FINITE_DESCENT_LAW_IN_THIS_FIXTURE',
    ] : []),
    scars: freeze([
      'EVENT_TIME != AUTHORITY_TIME',
      'TRUTH_AT_SOURCE != CLAIM_AUTHORITY_AT_PREFIX',
      'LATER_RECONSTRUCTION != EARLIER_POSSESSION',
      'LATER_EXACT_DESCENT != RETROACTIVE_GAP_ERASURE',
      'FORWARD_AUTHORITY_MONOTONICITY != RETROACTIVE_AUTHORITY',
      'PARTIAL_LATENT_AUTHORITY != FULL_STATE_RECONSTRUCTIBILITY',
      'PARTIAL_LATENT_CLAIM != COMPLETE_PROCESS_IDENTITY',
      'AUTHORITY_BIRTH_SIGNATURE != TERMINAL_HOLONOMY',
      'JURISDICTION_BRAID != PHYSICAL_BRAID_GROUP',
      'BITEMPORAL_LEDGER != GENERAL_DATABASE_THEOREM',
      'SINGLE_EVENT_SLICE != UNIVERSAL_BITEMPORAL_MODEL',
      'FINITE_CUBE_IDENTIFIABILITY != CONTINUUM_IDENTIFIABILITY',
      'FADT_INSTANTIATION != NEW_GENERIC_FADT_PROOF',
      'CLAIM_BIRTH_TIME != PROBABILITY_OR_CONFIDENCE',
      'CLAIM_AUTHORITY != TRUTH_VALUE',
      'REGISTERED_OPERATOR_PREFIX != SECRET_INTERNAL_STATE',
      'A15_R0_FIXTURE != CONTEMPORARY_COMMERCIAL_AI_ARCHITECTURE',
    ]),
  });
  return cachedCertificate;
}

export function compileBitemporalAuthorityBirthProjection(receiver) {
  const certificate = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified bitemporal authority-birth jurisdiction');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.bitemporal-authority-birth-child-legible/v0.1',
      truths: freeze([
        'A_LATER_CLUE_CAN_MAKE_AN_OLD_EVENT_KNOWABLE_LATER_WITHOUT_MAKING_IT_KNOWN_EARLIER',
        'EACH_CLAIM_HAS_ITS_OWN_FIRST_LAWFUL_MOMENT_IN_THIS_FIXTURE',
        'ONE_PART_OF_THE_HIDDEN_STATE_CAN_ARRIVE_BEFORE_THE_FULL_PROCESS_NAME',
        'ONE_PART_OF_THE_HIDDEN_STATE_CAN_ARRIVE_EVEN_WHEN_THE_WHOLE_STATE_NEVER_DOES',
        'THE_PATTERN_OF_WHEN_CLAIMS_ARRIVE_REMEMBERS_ALL_SIX_ORDERS_HERE',
      ]),
      complete_108_cell_ledger_exposed: false,
      conflict_antecedents_exposed: false,
      latent_state_values_exposed: false,
      technical_operator_prefixes_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.bitemporal-authority-birth-loom-technical/v0.1',
      claim_order: certificate.claim_order,
      birth_spectrum: certificate.birth_spectrum,
      authorized_accumulation: certificate.authorized_accumulation,
      ledger_totals: certificate.ledger_totals,
      schedule_birth_signatures: freeze(certificate.schedules.map(row => freeze({
        schedule_id: row.schedule_id,
        birth_signature: row.birth_signature,
      }))),
      complete_108_cell_ledger_exposed: false,
      conflict_antecedents_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for bitemporal authority birth: ${receiver}`);
  }

  return freeze({
    schema: BITEMPORAL_AUTHORITY_BIRTH_NONRETROACTIVE_JURISDICTION_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    claim_ceiling: freeze({
      bounded_claim_authority_birth_ledger: true,
      universal_ai_audit_theorem: false,
      universal_causality_theorem: false,
      general_bitemporal_database_theorem: false,
      physical_braid_group: false,
      physical_holonomy: false,
      continuum_tomography: false,
      semantic_equivalence: false,
      complete_schedule_reconstruction: false,
      source_state_mutation: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectBitemporalAuthorityBirthOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_ai_audit_theorem === true
    || ceiling.universal_causality_theorem === true
    || ceiling.general_bitemporal_database_theorem === true
    || ceiling.physical_braid_group === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.semantic_equivalence === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.source_state_mutation === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const retroactive = candidate?.later_reconstruction_backdates_earlier_authority === true
    || candidate?.event_time_equals_authority_time === true;
  const hierarchyCollapse = candidate?.partial_latent_requires_full_process_identity === true
    || candidate?.partial_latent_requires_full_state_reconstruction === true;
  const runtime = candidate?.runtime_binding === true;
  const sourceMutation = candidate?.source_state_transform === true;
  const collision = candidate?.replaces_generic_fadt === true
    || candidate?.replaces_schedule_state_lag === true
    || candidate?.replaces_safe_erasure_closure === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.complete_108_cell_ledger_exposed === true
    || candidate?.payload?.conflict_antecedents_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true
    || candidate?.payload?.technical_operator_prefixes_exposed === true
  );
  return freeze({
    accepted: !authority
      && !overreach
      && !retroactive
      && !hierarchyCollapse
      && !runtime
      && !sourceMutation
      && !collision
      && !ashLeak,
  });
}
