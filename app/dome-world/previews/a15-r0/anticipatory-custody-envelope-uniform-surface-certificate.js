import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import {
  ANTICIPATORY_CUSTODY_ENVELOPE_UNIFORM_SURFACE_SCHEMA,
  ANTICIPATORY_CUSTODY_ENVELOPE_PARENT_RECEIPT,
  anticipatoryCustodyEnvelopeUniformSurfaceCertificate as initialAnticipatoryCertificate,
  rejectAnticipatoryCustodyEnvelopeOverreach,
} from './anticipatory-custody-envelope-uniform-surface.js';

const EXPECTED_ROBUST_SPECTRUM = Object.freeze({
  5: 4, 10: 4, 15: 8, 25: 4, 30: 16, 50: 4,
  75: 8, 125: 18, 150: 16, 250: 18, 375: 36, 750: 72,
});
const EXPECTED_RATIO_SPECTRUM = Object.freeze({
  1: 4, 2: 4, 3: 8, 5: 4, 6: 16, 10: 4,
  15: 8, 25: 18, 30: 16, 50: 18, 75: 36, 150: 72,
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
const normalizedRecord = record => Object.fromEntries(
  Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
);
const sameRecord = (left, right) => canonical(normalizedRecord(left)) === canonical(normalizedRecord(right));
const zeroAuthority = () => freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));

function knownInitialRepresentativeOrderDefect(census) {
  const reps = census.representative_signatures;
  return reps?.FLAT_FLAT?.schedule_id === 'P-H-I'
    && reps?.FLAT_FLAT?.bundle_id === 'X3'
    && reps?.FLAT_FLAT?.m2 === 5
    && reps?.FLAT_FLAT?.m1 === 5
    && reps?.FLAT_FLAT?.m0 === 5
    && reps?.FLAT_EXPAND?.schedule_id === 'P-H-I'
    && reps?.FLAT_EXPAND?.bundle_id === 'FIRST_STRATUM+X3'
    && reps?.FLAT_EXPAND?.m2 === 5
    && reps?.FLAT_EXPAND?.m1 === 5
    && reps?.FLAT_EXPAND?.m0 === 15
    && reps?.EXPAND_FLAT?.schedule_id === 'P-H-I'
    && reps?.EXPAND_FLAT?.bundle_id === 'X2+X3'
    && reps?.EXPAND_FLAT?.m2 === 5
    && reps?.EXPAND_FLAT?.m1 === 25
    && reps?.EXPAND_FLAT?.m0 === 25
    && reps?.EXPAND_EXPAND?.schedule_id === 'P-H-I'
    && reps?.EXPAND_EXPAND?.bundle_id === 'SCHEDULE+X3'
    && reps?.EXPAND_EXPAND?.m2 === 5
    && reps?.EXPAND_EXPAND?.m1 === 10
    && reps?.EXPAND_EXPAND?.m0 === 30;
}

function correctedCensusExact(census) {
  return census.contexts === 208
    && census.local_q2_minimum_uniform_cardinality === 5
    && census.contexts_with_local_q2_minimum_five === 208
    && canonical(census.future_horizon) === canonical([1, 0])
    && sameRecord(census.by_schedule, EXPECTED_SCHEDULE_CONTEXTS)
    && sameRecord(census.future_robust_spectrum, EXPECTED_ROBUST_SPECTRUM)
    && sameRecord(census.robustness_ratio_spectrum, EXPECTED_RATIO_SPECTRUM)
    && sameRecord(census.support_triple_spectrum, EXPECTED_TRIPLES)
    && census.transport_signature_counts?.FLAT_FLAT === 4
    && census.transport_signature_counts?.FLAT_EXPAND === 20
    && census.transport_signature_counts?.EXPAND_FLAT === 2
    && census.transport_signature_counts?.EXPAND_EXPAND === 182
    && census.local_to_robust_plateau === 4
    && census.local_to_robust_expand === 204
    && census.maximum_cardinality_difference === 745
    && census.maximum_cardinality_ratio === 150
    && census.maximum_premium_witness?.schedule_id === 'P-H-I'
    && census.maximum_premium_witness?.bundle_id === 'SCHEDULE+FULL_STATE'
    && census.maximum_premium_witness?.m2 === 5
    && census.maximum_premium_witness?.m1 === 50
    && census.maximum_premium_witness?.m0 === 750
    && census.unique_stage_profiles === 624
    && census.occupied_fibre_support_evaluations === 6256
    && census.horizon_lower_bound_witnesses === 208
    && census.target_indexed_robust_decode_checks === 26000
    && census.robust_decode_failures === 0
    && census.three_stage_signature_checks === 208
    && census.full_context_rows_exposed === false
    && census.full_fibre_tables_exposed === false
    && census.full_label_tables_exposed === false
    && knownInitialRepresentativeOrderDefect(census);
}

export function anticipatoryCustodyEnvelopeCanonicalCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const initial = initialAnticipatoryCertificate();
  const census = initial.anticipatory_envelope_census;
  const correctedExact = correctedCensusExact(census);
  const passed = initial.parent_receipt === ANTICIPATORY_CUSTODY_ENVELOPE_PARENT_RECEIPT
    && initial.domain?.q3_birth_q2_branch_uncertain_contexts === 208
    && correctedExact;

  cachedCertificate = freeze({
    schema: ANTICIPATORY_CUSTODY_ENVELOPE_UNIFORM_SURFACE_SCHEMA,
    parent_receipt: ANTICIPATORY_CUSTODY_ENVELOPE_PARENT_RECEIPT,
    initial_implementation_passed: initial.passed,
    prehostile_repair: freeze({
      kind: 'REPRESENTATIVE_SELECTION_ONLY',
      scientific_counts_changed: false,
      theorem_changed: false,
      known_initial_iteration_representative_verified: knownInitialRepresentativeOrderDefect(census),
      canonical_named_controls: freeze({
        FLAT_FLAT: freeze({ schedule_id: 'P-H-I', bundle_id: 'X3', m2: 5, m1: 5, m0: 5 }),
        FLAT_EXPAND: freeze({ schedule_id: 'P-H-I', bundle_id: 'FIRST_STRATUM+X3', m2: 5, m1: 5, m0: 15 }),
        EXPAND_FLAT: freeze({ schedule_id: 'P-H-I', bundle_id: 'X2+X3', m2: 5, m1: 25, m0: 25 }),
        EXPAND_EXPAND: freeze({ schedule_id: 'P-H-I', bundle_id: 'FULL_STATE', m2: 5, m1: 25, m0: 125 }),
        MAXIMUM_PREMIUM: freeze({ schedule_id: 'P-H-I', bundle_id: 'SCHEDULE+FULL_STATE', m2: 5, m1: 50, m0: 750 }),
      }),
    }),
    domain: initial.domain,
    anticipatory_envelope_census: census,
    theorem: initial.theorem,
    execution_ledger: initial.execution_ledger,
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_EVERY_ONE_OF_THE_208_Q3_BIRTH_Q2_RESTORATION_CONTEXTS_HAS_THE_SAME_TRANSITION_LOCAL_MINIMUM_SIDECAR_CARDINALITY_FIVE_YET_THE_MINIMUM_SINGLE_SIDECAR_REQUIRED_TO_REMAIN_EXACT_UNDER_THE_BRANCH_UNCERTAIN_FUTURE_HORIZON_Q1_OR_Q0_HAS_TWELVE_DISTINCT_CARDINALITIES_FROM_FIVE_THROUGH_SEVEN_HUNDRED_FIFTY',
      'FOR_THE_DECLARED_Q1_Q0_FUTURE_HORIZON_THE_EXACT_MINIMUM_FUTURE_ROBUST_SIDECAR_CARDINALITY_EQUALS_THE_Q0_REQUIRED_BUNDLE_SUPPORT_MAXIMUM_WITH_204_OF_208_CONTEXTS_REQUIRING_ANTICIPATORY_EXPANSION_BEYOND_THE_UNIFORM_LOCAL_MINIMUM_FIVE_AND_SEVENTY_TWO_CONTEXTS_REQUIRING_A_150_FOLD_CARDINALITY_EXPANSION_TO_750',
      'THE_FIXED_BRANCH_UNCERTAIN_ATLAS_CONTAINS_TWENTY_CONTEXTS_WHERE_Q2_TO_Q1_LOCAL_MINIMUM_TRANSPORT_SUCCEEDS_BUT_Q1_TO_Q0_LATER_RUPTURES_SO_ONE_STEP_TRANSPORT_SUCCESS_DOES_NOT_IDENTIFY_HORIZON_ROBUSTNESS',
      'THE_FIXED_BRANCH_UNCERTAIN_ATLAS_CONTAINS_TWO_CONTEXTS_WHERE_Q2_TO_Q1_REQUIRES_CUSTODY_EXPANSION_BUT_Q1_TO_Q0_ADDS_NO_FURTHER_SUPPORT_CARDINALITY_SO_EARLY_RUPTURE_DOES_NOT_FORCE_CONTINUED_EXPANSION',
      'THE_UNIFORM_LOCAL_CARDINALITY_FIVE_CONTROL_SURFACE_IS_NONIDENTIFYING_FOR_FUTURE_ROBUST_CUSTODY_CARDINALITY_IN_THIS_FIXED_208_CONTEXT_ATLAS',
    ] : []),
    scars: freeze([
      ...initial.scars,
      'PRE_HOSTILE_REPRESENTATIVE_REPAIR != SCIENTIFIC_RED',
      'PRE_HOSTILE_REPRESENTATIVE_REPAIR != THEOREM_WEAKENING',
      'ITERATION_FIRST_WITNESS != PREREGISTERED_NAMED_CONTROL',
      'REPRESENTATIVE_SELECTION != CENSUS_IDENTITY',
      'INITIAL_IMPLEMENTATION_PASSED_FALSE_DUE_TO_REPRESENTATIVE_ORDER_ONLY != THEOREM_FAILURE',
    ]),
  });
  return cachedCertificate;
}

export function compileAnticipatoryCustodyEnvelopeCanonicalProjection(receiver) {
  const certificate = anticipatoryCustodyEnvelopeCanonicalCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified canonical anticipatory-custody envelope');

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
    throw new Error(`undeclared AIA receiver for canonical anticipatory-custody envelope: ${receiver}`);
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

export { rejectAnticipatoryCustodyEnvelopeOverreach };
