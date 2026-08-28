import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { restorationHolonomyPathDependentCustodyCertificate } from './restoration-holonomy-path-dependent-custody-certificate.js';

export const ANTICIPATORY_CUSTODY_ENVELOPE_UNIFORM_SURFACE_SCHEMA =
  'td613.dome-world.anticipatory-custody-envelope-uniform-surface/v0.1';
export const ANTICIPATORY_CUSTODY_ENVELOPE_PARENT_RECEIPT =
  '082de53b0972a5fd0d235973a8deee2faaebce71';

const STAGES = Object.freeze([0, 1, 2]);
const EXPECTED_ROBUST_SPECTRUM = Object.freeze({
  5: 4,
  10: 4,
  15: 8,
  25: 4,
  30: 16,
  50: 4,
  75: 8,
  125: 18,
  150: 16,
  250: 18,
  375: 36,
  750: 72,
});
const EXPECTED_RATIO_SPECTRUM = Object.freeze({
  1: 4,
  2: 4,
  3: 8,
  5: 4,
  6: 16,
  10: 4,
  15: 8,
  25: 18,
  30: 16,
  50: 18,
  75: 36,
  150: 72,
});
const EXPECTED_TRIPLES = Object.freeze({
  '5->5->5': 4,
  '5->5->10': 4,
  '5->5->15': 8,
  '5->5->25': 2,
  '5->5->50': 2,
  '5->5->75': 4,
  '5->10->30': 16,
  '5->10->150': 8,
  '5->25->25': 2,
  '5->25->50': 2,
  '5->25->75': 4,
  '5->25->125': 18,
  '5->25->250': 18,
  '5->25->375': 36,
  '5->50->150': 8,
  '5->50->750': 72,
});
const EXPECTED_SCHEDULE_CONTEXTS = Object.freeze({
  'P-H-I': 96,
  'P-I-H': 96,
  'H-P-I': 8,
  'H-I-P': 0,
  'I-P-H': 8,
  'I-H-P': 0,
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform',
  'new_sensor_measurement', 'release', 'production', 'physical_claim',
  'continuum_claim', 'cryptographic_key', 'authentication_credential',
  'retrocausal_channel', 'retention_policy',
]);

let cachedCertificate = null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const canonical = value => JSON.stringify(value);
const sortedRecord = record => Object.fromEntries(
  Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
);
const sameRecord = (left, right) => canonical(sortedRecord(left)) === canonical(sortedRecord(right));
const zeroAuthority = () => freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function stateCube() {
  const states = [];
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) states.push(freeze([x1, x2, x3]));
    }
  }
  return freeze(states);
}

function buildAntecedents(policy) {
  const states = stateCube();
  const policyBySchedule = new Map(policy.policy_geometry.map(row => [row.schedule_id, row]));
  const antecedents = [];
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    const policyRow = policyBySchedule.get(id);
    if (!policyRow) throw new Error(`missing prospective replay row for ${id}`);
    const matrix = phasonicObservationMatrix(schedule);
    for (const state of states) {
      antecedents.push(freeze({
        schedule: freeze([...schedule]),
        schedule_id: id,
        first_stratum: schedule[0],
        state,
        observation_matrix: matrix,
        observation: observePhasonicState(state, schedule),
        replay_required: policyRow.replay_required,
      }));
    }
  }
  return freeze({ states, antecedents: freeze(antecedents) });
}

function quotientValue(stage, antecedent) {
  if (stage === 0) return freeze(['NULL_REGISTERED_TRACE']);
  return freeze([
    freeze(antecedent.observation_matrix.slice(0, stage).map(row => freeze([...row]))),
    freeze(antecedent.observation.slice(0, stage)),
  ]);
}

function claimValue(claim, antecedent) {
  if (claim === 'FIRST_STRATUM') return antecedent.first_stratum;
  if (claim === 'SCHEDULE') return antecedent.schedule_id;
  if (claim === 'X1') return antecedent.state[0];
  if (claim === 'X2') return antecedent.state[1];
  if (claim === 'X3') return antecedent.state[2];
  if (claim === 'FULL_STATE') return antecedent.state;
  if (claim === 'REPLAY_REQUIRED_FOR_EXACT_STATE') return antecedent.replay_required;
  throw new Error(`unknown anticipatory-custody claim: ${claim}`);
}

function bundleValue(claims, antecedent) {
  return freeze(claims.map(claim => freeze([claim, claimValue(claim, antecedent)])));
}

function fibreAtlas(antecedents) {
  const atlas = new Map();
  for (const stage of STAGES) {
    const fibres = new Map();
    for (const antecedent of antecedents) {
      const quotient = quotientValue(stage, antecedent);
      const key = canonical(quotient);
      if (!fibres.has(key)) fibres.set(key, { quotient, antecedents: [] });
      fibres.get(key).antecedents.push(antecedent);
    }
    for (const fibre of fibres.values()) Object.freeze(fibre.antecedents);
    atlas.set(stage, fibres);
  }
  return atlas;
}

function buildProfiles(bundleParent, built, fibres) {
  const targetsBySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
    const id = scheduleId(schedule);
    return [id, built.antecedents.filter(antecedent => antecedent.schedule_id === id)];
  }));
  const occupiedKeys = new Map();
  for (const [id, targets] of targetsBySchedule.entries()) {
    for (const stage of STAGES) {
      occupiedKeys.set(`${id}|${stage}`, freeze([
        ...new Set(targets.map(target => canonical(quotientValue(stage, target)))),
      ]));
    }
  }

  const profiles = new Map();
  let supportEvaluations = 0;
  function profile(row, stage) {
    const cacheKey = `${row.schedule_id}|${row.bundle_id}|${stage}`;
    if (profiles.has(cacheKey)) return profiles.get(cacheKey);
    const supports = occupiedKeys.get(`${row.schedule_id}|${stage}`).map(key => {
      const fibre = fibres.get(stage).get(key);
      if (!fibre) throw new Error(`missing q${stage} fibre for ${row.schedule_id}/${row.bundle_id}`);
      const valueMap = new Map();
      for (const antecedent of fibre.antecedents) {
        const value = bundleValue(row.claims, antecedent);
        valueMap.set(canonical(value), value);
      }
      supportEvaluations += 1;
      return freeze({
        key,
        support_keys: freeze([...valueMap.keys()].sort()),
        support_cardinality: valueMap.size,
      });
    });
    const result = freeze({
      stage,
      supports: freeze(supports),
      maximum: Math.max(...supports.map(support => support.support_cardinality)),
    });
    profiles.set(cacheKey, result);
    return result;
  }

  return {
    targetsBySchedule,
    profiles,
    profile,
    getSupportEvaluationCount: () => supportEvaluations,
  };
}

function increment(counter, key) {
  counter.set(String(key), (counter.get(String(key)) ?? 0) + 1);
}

function mapToSortedRecord(counter, numeric = false) {
  return freeze(Object.fromEntries([...counter.entries()].sort(([left], [right]) => (
    numeric ? Number(left) - Number(right) : left.localeCompare(right)
  ))));
}

function buildEnvelopeCensus(bundleParent, built, fibres) {
  const stageProfiles = buildProfiles(bundleParent, built, fibres);
  const robustSpectrum = new Map();
  const ratioSpectrum = new Map();
  const tripleSpectrum = new Map();
  const scheduleContexts = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), 0]));
  const signatureCounts = { FLAT_FLAT: 0, FLAT_EXPAND: 0, EXPAND_FLAT: 0, EXPAND_EXPAND: 0 };
  const representatives = {};
  let contextCount = 0;
  let uniformLocalFive = 0;
  let plateau = 0;
  let expand = 0;
  let lowerBoundWitnesses = 0;
  let targetDecodeChecks = 0;
  let decodeFailures = 0;
  let signatureChecks = 0;
  let maxDifference = -1;
  let maxRatio = -1;
  let maximumPremiumWitness = null;

  for (const row of bundleParent.bundle_support_certificate.rows) {
    if (row.actual_birth !== 3) continue;
    contextCount += 1;
    scheduleContexts.set(row.schedule_id, (scheduleContexts.get(row.schedule_id) ?? 0) + 1);
    const q2 = stageProfiles.profile(row, 2);
    const q1 = stageProfiles.profile(row, 1);
    const q0 = stageProfiles.profile(row, 0);
    const m2 = q2.maximum;
    const m1 = q1.maximum;
    const m0 = q0.maximum;
    signatureChecks += 1;

    if (m2 === 5) uniformLocalFive += 1;
    if (!(m2 <= m1 && m1 <= m0)) {
      throw new Error(`support envelope lost monotonicity for ${row.schedule_id}/${row.bundle_id}`);
    }

    increment(robustSpectrum, m0);
    increment(ratioSpectrum, m0 / m2);
    increment(tripleSpectrum, `${m2}->${m1}->${m0}`);

    const firstFlat = m2 === m1;
    const secondFlat = m1 === m0;
    const signature = firstFlat
      ? (secondFlat ? 'FLAT_FLAT' : 'FLAT_EXPAND')
      : (secondFlat ? 'EXPAND_FLAT' : 'EXPAND_EXPAND');
    signatureCounts[signature] += 1;
    if (!representatives[signature]) {
      representatives[signature] = freeze({
        schedule_id: row.schedule_id,
        bundle_id: row.bundle_id,
        claims: row.claims,
        m2,
        m1,
        m0,
      });
    }

    if (m2 === m0) plateau += 1;
    else expand += 1;

    const q0Support = q0.supports.find(support => support.support_cardinality === m0);
    if (!q0Support || q0Support.support_keys.length !== m0 || m0 < 2) {
      throw new Error(`missing anticipatory lower-bound q0 support for ${row.schedule_id}/${row.bundle_id}`);
    }
    // Explicit m0-1 alphabet collision: indices 0 and m0-1 share label 0 under modulo m0-1.
    if (q0Support.support_keys[0] === q0Support.support_keys[m0 - 1]) {
      throw new Error(`degenerate anticipatory lower-bound support for ${row.schedule_id}/${row.bundle_id}`);
    }
    lowerBoundWitnesses += 1;

    // Sufficiency: assign each q0 bundle value a global label. The same retained label
    // decodes exactly whether the future terminal is q1 or q0.
    const globalLabels = new Map(q0Support.support_keys.map((valueKey, label) => [valueKey, label]));
    const targets = stageProfiles.targetsBySchedule.get(row.schedule_id);
    if (!targets || targets.length !== 125) throw new Error(`missing q3-birth targets for ${row.schedule_id}`);
    for (const target of targets) {
      targetDecodeChecks += 1;
      const valueKey = canonical(bundleValue(row.claims, target));
      const label = globalLabels.get(valueKey);
      const q1Key = canonical(quotientValue(1, target));
      const q0Key = canonical(quotientValue(0, target));
      const q1Support = q1.supports.find(support => support.key === q1Key);
      const terminalQ0Support = q0.supports.find(support => support.key === q0Key);
      if (!Number.isInteger(label)
        || label < 0
        || label >= m0
        || !q1Support?.support_keys.includes(valueKey)
        || !terminalQ0Support?.support_keys.includes(valueKey)
        || q0Support.support_keys[label] !== valueKey) {
        decodeFailures += 1;
      }
    }

    const difference = m0 - m2;
    const ratio = m0 / m2;
    if (difference > maxDifference) maxDifference = difference;
    if (ratio > maxRatio) maxRatio = ratio;
    if (row.schedule_id === 'P-H-I'
      && row.bundle_id === 'SCHEDULE+FULL_STATE'
      && m2 === 5
      && m1 === 50
      && m0 === 750) {
      maximumPremiumWitness = freeze({
        schedule_id: row.schedule_id,
        bundle_id: row.bundle_id,
        claims: row.claims,
        m2,
        m1,
        m0,
        difference,
        ratio,
      });
    }
  }

  const robustRecord = mapToSortedRecord(robustSpectrum, true);
  const ratioRecord = mapToSortedRecord(ratioSpectrum, true);
  const tripleRecord = mapToSortedRecord(tripleSpectrum, false);
  const scheduleRecord = freeze(Object.fromEntries([...scheduleContexts.entries()]));
  const exact = contextCount === 208
    && uniformLocalFive === 208
    && plateau === 4
    && expand === 204
    && sameRecord(robustRecord, EXPECTED_ROBUST_SPECTRUM)
    && sameRecord(ratioRecord, EXPECTED_RATIO_SPECTRUM)
    && sameRecord(tripleRecord, EXPECTED_TRIPLES)
    && canonical(scheduleRecord) === canonical(EXPECTED_SCHEDULE_CONTEXTS)
    && signatureCounts.FLAT_FLAT === 4
    && signatureCounts.FLAT_EXPAND === 20
    && signatureCounts.EXPAND_FLAT === 2
    && signatureCounts.EXPAND_EXPAND === 182
    && stageProfiles.profiles.size === 624
    && stageProfiles.getSupportEvaluationCount() === 6256
    && lowerBoundWitnesses === 208
    && targetDecodeChecks === 26000
    && decodeFailures === 0
    && signatureChecks === 208
    && maxDifference === 745
    && maxRatio === 150
    && maximumPremiumWitness?.m2 === 5
    && maximumPremiumWitness?.m1 === 50
    && maximumPremiumWitness?.m0 === 750
    && representatives.FLAT_FLAT?.schedule_id === 'P-H-I'
    && representatives.FLAT_FLAT?.bundle_id === 'X3'
    && representatives.FLAT_EXPAND?.bundle_id === 'FIRST_STRATUM+X3'
    && representatives.EXPAND_FLAT?.bundle_id === 'X2+X3'
    && representatives.EXPAND_EXPAND?.bundle_id === 'FULL_STATE';

  return freeze({
    contexts: contextCount,
    by_schedule: scheduleRecord,
    local_q2_minimum_uniform_cardinality: 5,
    contexts_with_local_q2_minimum_five: uniformLocalFive,
    future_horizon: freeze([1, 0]),
    future_robust_spectrum: robustRecord,
    robustness_ratio_spectrum: ratioRecord,
    support_triple_spectrum: tripleRecord,
    transport_signature_counts: freeze({ ...signatureCounts }),
    representative_signatures: freeze({ ...representatives }),
    local_to_robust_plateau: plateau,
    local_to_robust_expand: expand,
    maximum_cardinality_difference: maxDifference,
    maximum_cardinality_ratio: maxRatio,
    maximum_premium_witness: maximumPremiumWitness,
    unique_stage_profiles: stageProfiles.profiles.size,
    occupied_fibre_support_evaluations: stageProfiles.getSupportEvaluationCount(),
    horizon_lower_bound_witnesses: lowerBoundWitnesses,
    target_indexed_robust_decode_checks: targetDecodeChecks,
    robust_decode_failures: decodeFailures,
    three_stage_signature_checks: signatureChecks,
    full_context_rows_exposed: false,
    full_fibre_tables_exposed: false,
    full_label_tables_exposed: false,
    exact,
  });
}

export function anticipatoryCustodyEnvelopeUniformSurfaceCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = restorationHolonomyPathDependentCustodyCertificate();
  const bundleParent = claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(policy);
  const fibres = fibreAtlas(built.antecedents);
  const census = buildEnvelopeCensus(bundleParent, built, fibres);
  const passed = parent.passed
    && bundleParent.passed
    && policy.passed
    && built.states.length === 125
    && built.antecedents.length === 750
    && census.exact;

  cachedCertificate = freeze({
    schema: ANTICIPATORY_CUSTODY_ENVELOPE_UNIFORM_SURFACE_SCHEMA,
    parent_receipt: ANTICIPATORY_CUSTODY_ENVELOPE_PARENT_RECEIPT,
    domain: freeze({
      schedules: 6,
      states: 125,
      antecedents: 750,
      q3_birth_q2_branch_uncertain_contexts: census.contexts,
      declared_future_horizon: census.future_horizon,
    }),
    anticipatory_envelope_census: census,
    theorem: freeze({
      candidate_minimum:
        'MINIMUM_SINGLE_RETAINED_SIDECAR_ALPHABET_FOR_DECLARED_Q1_OR_Q0_FUTURE_HORIZON_EQUALS_Q0_REQUIRED_BUNDLE_SUPPORT_MAXIMUM',
      lower_bound:
        'ANY_ALPHABET_SMALLER_THAN_M0_COLLIDES_BETWEEN_DISTINCT_REQUIRED_BUNDLE_VALUES_INSIDE_THE_SINGLE_Q0_REGISTERED_FIBRE',
      sufficiency:
        'A_GLOBAL_M0_LABEL_ASSIGNMENT_TO_REQUIRED_Q0_BUNDLE_VALUES_DERIVED_FROM_ALREADY_AUTHORIZED_FINE_BUNDLE_VALUE_DECODES_EXACTLY_WITH_EITHER_Q1_OR_Q0_TERMINAL_RECORD',
      unique_encoding_claimed: false,
      minimum_bit_length_claimed: false,
    }),
    execution_ledger: freeze({
      occupied_fibre_support_evaluations: census.occupied_fibre_support_evaluations,
      horizon_lower_bound_witnesses: census.horizon_lower_bound_witnesses,
      target_indexed_robust_decode_checks: census.target_indexed_robust_decode_checks,
      three_stage_signature_checks: census.three_stage_signature_checks,
    }),
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_EVERY_ONE_OF_THE_208_Q3_BIRTH_Q2_RESTORATION_CONTEXTS_HAS_THE_SAME_TRANSITION_LOCAL_MINIMUM_SIDECAR_CARDINALITY_FIVE_YET_THE_MINIMUM_SINGLE_SIDECAR_REQUIRED_TO_REMAIN_EXACT_UNDER_THE_BRANCH_UNCERTAIN_FUTURE_HORIZON_Q1_OR_Q0_HAS_TWELVE_DISTINCT_CARDINALITIES_FROM_FIVE_THROUGH_SEVEN_HUNDRED_FIFTY',
      'FOR_THE_DECLARED_Q1_Q0_FUTURE_HORIZON_THE_EXACT_MINIMUM_FUTURE_ROBUST_SIDECAR_CARDINALITY_EQUALS_THE_Q0_REQUIRED_BUNDLE_SUPPORT_MAXIMUM_WITH_204_OF_208_CONTEXTS_REQUIRING_ANTICIPATORY_EXPANSION_BEYOND_THE_UNIFORM_LOCAL_MINIMUM_FIVE_AND_SEVENTY_TWO_CONTEXTS_REQUIRING_A_150_FOLD_CARDINALITY_EXPANSION_TO_750',
      'THE_FIXED_BRANCH_UNCERTAIN_ATLAS_CONTAINS_TWENTY_CONTEXTS_WHERE_Q2_TO_Q1_LOCAL_MINIMUM_TRANSPORT_SUCCEEDS_BUT_Q1_TO_Q0_LATER_RUPTURES_SO_ONE_STEP_TRANSPORT_SUCCESS_DOES_NOT_IDENTIFY_HORIZON_ROBUSTNESS',
      'THE_FIXED_BRANCH_UNCERTAIN_ATLAS_CONTAINS_TWO_CONTEXTS_WHERE_Q2_TO_Q1_REQUIRES_CUSTODY_EXPANSION_BUT_Q1_TO_Q0_ADDS_NO_FURTHER_SUPPORT_CARDINALITY_SO_EARLY_RUPTURE_DOES_NOT_FORCE_CONTINUED_EXPANSION',
    ] : []),
    scars: freeze([
      'UNIFORM_LOCAL_MINIMUM != UNIFORM_FUTURE_ROBUST_OBLIGATION',
      'LOCAL_SIDECAR_CARDINALITY != FUTURE_ROBUST_CUSTODY_IDENTITY',
      'CURRENT_CONTROL_SURFACE_COST != HORIZON_ROBUST_CUSTODY_COST',
      'LOCAL_CARDINALITY_EQUALITY != FUTURE_CUSTODY_EQUIVALENCE',
      'ONE_STEP_TRANSPORT_SUCCESS != HORIZON_ROBUSTNESS',
      'EARLY_TRANSPORT_RUPTURE != NECESSARILY_CONTINUED_CUSTODY_EXPANSION',
      'ANTICIPATORY_CUSTODY_REQUIREMENT != RETROCAUSAL_INFORMATION_FLOW',
      'DECLARED_FUTURE_PATH_SET != FUTURE_EVENT_OCCURRENCE',
      'FUTURE_ROBUST_OVERPROVISIONING != NEW_SOURCE_INFORMATION',
      'ROBUST_SIDECAR != SOURCE_STATE_MUTATION',
      'CARDINALITY_RATIO != BIT_RATIO',
      'CARDINALITY_RATIO != INFORMATION_GAIN_RATIO',
      'UNIFORM_CARDINALITY_SURFACE != ZERO_MUTUAL_INFORMATION_THEOREM',
      'FUTURE_HORIZON_MINIMUM != DATA_RETENTION_POLICY',
      'TRANSITION_LOCAL_MINIMUM_RESTORATION != FUTURE_HORIZON_ROBUST_MINIMUM',
      'PATH_CONDITIONED_TRANSPORT != BRANCH_UNCERTAIN_SINGLE_SIDECAR_ENVELOPE',
      'FINITE_208_CONTEXT_CENSUS != ASYMPTOTIC_INFORMATION_THEOREM',
    ]),
  });
  return cachedCertificate;
}

export function compileAnticipatoryCustodyEnvelopeProjection(receiver) {
  const certificate = anticipatoryCustodyEnvelopeUniformSurfaceCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified anticipatory-custody envelope');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.anticipatory-custody-envelope-child-legible/v0.1',
      truths: freeze([
        'EVERY_LOCAL_Q2_LABEL_SET_CAN_HAVE_SIZE_FIVE_WHILE_THE_LABEL_SET_NEEDED_TO_SURVIVE_UNKNOWN_LATER_COMPRESSION_CAN_BE_MUCH_LARGER',
        'BEING_SAFE_FOR_THE_NEXT_COMPRESSION_STEP_DOES_NOT_PROVE_SAFETY_FOR_ALL_LATER_ALLOWED_COMPRESSION_STEPS',
        'PLANNING_FOR_A_DECLARED_FUTURE_COMPRESSION_OPTION_CHANGES_THE_REQUIRED_REPRESENTATION_BUDGET_WITHOUT_CHANGING_THE_PAST_SOURCE_STATE',
      ]),
      contexts: certificate.anticipatory_envelope_census.contexts,
      local_minimum: certificate.anticipatory_envelope_census.local_q2_minimum_uniform_cardinality,
      future_robust_minimum_spectrum: certificate.anticipatory_envelope_census.future_robust_spectrum,
      full_context_rows_exposed: false,
      full_fibre_tables_exposed: false,
      full_label_tables_exposed: false,
      latent_state_values_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.anticipatory-custody-envelope-loom-technical/v0.1',
      contexts: certificate.anticipatory_envelope_census.contexts,
      local_q2_minimum: certificate.anticipatory_envelope_census.local_q2_minimum_uniform_cardinality,
      future_robust_spectrum: certificate.anticipatory_envelope_census.future_robust_spectrum,
      transport_signature_counts: certificate.anticipatory_envelope_census.transport_signature_counts,
      maximum_cardinality_ratio: certificate.anticipatory_envelope_census.maximum_cardinality_ratio,
      full_context_rows_exposed: false,
      full_fibre_tables_exposed: false,
      full_label_tables_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for anticipatory-custody envelope: ${receiver}`);
  }

  return freeze({
    schema: ANTICIPATORY_CUSTODY_ENVELOPE_UNIFORM_SURFACE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    claim_ceiling: freeze({
      retrocausal_information_flow: false,
      minimum_bit_length: false,
      shannon_capacity: false,
      mutual_information: false,
      cryptographic_key: false,
      authentication_credential: false,
      universal_robust_control: false,
      data_retention_policy: false,
      source_state_mutation: false,
      merge: false,
      deploy: false,
      publish: false,
      release: false,
      vercel: false,
    }),
  });
}

export function rejectAnticipatoryCustodyEnvelopeOverreach(candidate) {
  const forbidden = [
    'retrocausal_information_flow', 'future_event_changes_past_state',
    'source_state_transform', 'source_state_mutation', 'source_information_creation',
    'minimum_bit_length', 'shannon_capacity', 'mutual_information',
    'cryptographic_key', 'authentication_credential', 'new_sensor_measurement',
    'universal_robust_control', 'universal_coding_theorem', 'data_retention_policy',
  ];
  const violation = forbidden.some(key => candidate?.[key] === true)
    || Object.values(candidate?.authority ?? {}).some(Boolean)
    || Object.values(candidate?.claim_ceiling ?? {}).some(Boolean)
    || candidate?.payload?.full_context_rows_exposed === true
    || candidate?.payload?.full_fibre_tables_exposed === true
    || candidate?.payload?.full_label_tables_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true;
  return freeze({
    accepted: !violation,
    reason: violation
      ? 'ANTICIPATORY_CUSTODY_ENVELOPE_AUTHORITY_OVERREACH'
      : 'WITHIN_FIXED_ANTICIPATORY_CUSTODY_ENVELOPE_MEMBRANE',
  });
}
