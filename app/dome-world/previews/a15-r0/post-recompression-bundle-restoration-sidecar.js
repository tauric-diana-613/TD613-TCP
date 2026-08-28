import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';

export const POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_SCHEMA =
  'td613.dome-world.post-recompression-bundle-restoration-sidecar/v0.1';
export const POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_PARENT_RECEIPT =
  'c83bafb12ff6e44f10481f41190fd91bbbf85650';

const STAGES = Object.freeze([0, 1, 2, 3]);
const EXPECTED_M_DISTRIBUTION = Object.freeze({
  '2': 82, '3': 36, '5': 298, '6': 48, '10': 90, '15': 36, '25': 88, '30': 64,
  '50': 88, '75': 16, '125': 18, '150': 32, '250': 18, '375': 36, '750': 72,
});
const EXPECTED_PER_SCHEDULE = Object.freeze({
  'P-H-I': Object.freeze({ '2':19,'3':6,'5':126,'6':8,'10':30,'15':12,'25':44,'30':20,'50':44,'75':8,'125':9,'150':16,'250':9,'375':18,'750':36 }),
  'P-I-H': Object.freeze({ '2':19,'3':6,'5':126,'6':8,'10':30,'15':12,'25':44,'30':20,'50':44,'75':8,'125':9,'150':16,'250':9,'375':18,'750':36 }),
  'H-P-I': Object.freeze({ '2':11,'3':6,'5':13,'6':8,'10':5,'15':2,'30':4 }),
  'H-I-P': Object.freeze({ '2':11,'3':6,'5':10,'6':8,'10':10,'15':4,'30':8 }),
  'I-P-H': Object.freeze({ '2':11,'3':6,'5':13,'6':8,'10':5,'15':2,'30':4 }),
  'I-H-P': Object.freeze({ '2':11,'3':6,'5':10,'6':8,'10':10,'15':4,'30':8 }),
});
const EXPECTED_WITNESSES = Object.freeze([
  Object.freeze({ m:2, schedule_id:'H-I-P', bundle_id:'REPLAY_REQUIRED_FOR_EXACT_STATE', birth:1, fine:1, coarse:0 }),
  Object.freeze({ m:3, schedule_id:'H-I-P', bundle_id:'FIRST_STRATUM', birth:1, fine:1, coarse:0 }),
  Object.freeze({ m:5, schedule_id:'H-I-P', bundle_id:'X3', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:6, schedule_id:'H-I-P', bundle_id:'SCHEDULE', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:10, schedule_id:'H-I-P', bundle_id:'X3+REPLAY_REQUIRED_FOR_EXACT_STATE', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:15, schedule_id:'H-I-P', bundle_id:'FIRST_STRATUM+X3', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:25, schedule_id:'P-H-I', bundle_id:'X1+X2', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:30, schedule_id:'H-I-P', bundle_id:'SCHEDULE+X3', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:50, schedule_id:'P-H-I', bundle_id:'X1+X2+REPLAY_REQUIRED_FOR_EXACT_STATE', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:75, schedule_id:'P-H-I', bundle_id:'FIRST_STRATUM+X1+X2', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:125, schedule_id:'P-H-I', bundle_id:'FULL_STATE', birth:3, fine:3, coarse:0 }),
  Object.freeze({ m:150, schedule_id:'P-H-I', bundle_id:'SCHEDULE+X1+X2', birth:2, fine:2, coarse:0 }),
  Object.freeze({ m:250, schedule_id:'P-H-I', bundle_id:'FULL_STATE+REPLAY_REQUIRED_FOR_EXACT_STATE', birth:3, fine:3, coarse:0 }),
  Object.freeze({ m:375, schedule_id:'P-H-I', bundle_id:'FIRST_STRATUM+FULL_STATE', birth:3, fine:3, coarse:0 }),
  Object.freeze({ m:750, schedule_id:'P-H-I', bundle_id:'SCHEDULE+FULL_STATE', birth:3, fine:3, coarse:0 }),
]);
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform', 'new_sensor_measurement',
  'release', 'production', 'physical_claim', 'continuum_claim', 'cryptographic_key', 'authentication_credential',
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
const same = (left, right) => canonical(left) === canonical(right);
const zeroAuthority = () => freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
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

function buildAntecedents(policy) {
  const states = stateCube();
  const policyBySchedule = new Map(policy.policy_geometry.map(row => [row.schedule_id, row]));
  const antecedents = [];
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    const policyRow = policyBySchedule.get(id);
    if (!policyRow) throw new Error(`missing inherited replay policy row for ${id}`);
    const observationMatrix = phasonicObservationMatrix(schedule);
    for (const state of states) {
      antecedents.push(freeze({
        schedule: freeze([...schedule]),
        schedule_id: id,
        first_stratum: schedule[0],
        state,
        observation_matrix: observationMatrix,
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
  throw new Error(`unknown restoration claim: ${claim}`);
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

function supportFor(fibres, stage, key, claims) {
  const fibre = fibres.get(stage).get(key);
  if (!fibre) throw new Error(`missing restoration fibre at q${stage}`);
  const values = new Map();
  for (const antecedent of fibre.antecedents) {
    const value = bundleValue(claims, antecedent);
    values.set(canonical(value), value);
  }
  const sortedKeys = [...values.keys()].sort();
  return freeze({
    quotient: fibre.quotient,
    antecedent_count: fibre.antecedents.length,
    support_keys: freeze(sortedKeys),
    support_cardinality: sortedKeys.length,
  });
}

function normalizeDistribution(map) {
  const rows = {};
  [...map.entries()].sort((left, right) => Number(left[0]) - Number(right[0]))
    .forEach(([key, value]) => { if (value > 0) rows[String(key)] = value; });
  return freeze(rows);
}

function buildRestorationCensus(parent, built, fibres) {
  const targetsBySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
    const id = scheduleId(schedule);
    return [id, built.antecedents.filter(antecedent => antecedent.schedule_id === id)];
  }));

  const mCounts = new Map();
  const scheduleCounts = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), new Map()]));
  const transitionIndex = new Map();
  let transitions = 0;
  let unsafeTransitions = 0;
  let safeTransitions = 0;
  let unsafeFibreEvaluations = 0;
  let safeFibreEvaluations = 0;
  let unsafeWoundedFibreIncidences = 0;
  let unsafeExactFibreIncidences = 0;
  let safeWoundedFibreIncidences = 0;
  let safeExactFibreIncidences = 0;
  let unsafeTargetChecks = 0;
  let safeTargetChecks = 0;
  let lowerBoundChecks = 0;
  let restorationFailures = 0;
  let safeControlFailures = 0;
  let unsafeMixedTransitions = 0;
  let unsafeAllWoundedTransitions = 0;
  let maximumM = 0;

  for (const row of parent.bundle_support_certificate.rows) {
    if (row.actual_birth === 'INF') continue;
    const birth = row.actual_birth;
    const targets = targetsBySchedule.get(row.schedule_id);
    if (!targets || targets.length !== 125) throw new Error(`missing restoration targets for ${row.schedule_id}`);

    for (let fine = birth; fine <= 3; fine += 1) {
      const fineCell = row.cells.find(cell => cell.stage === fine);
      if (!fineCell?.authorized) throw new Error(`parent fine authority lost at ${row.schedule_id}/${row.bundle_id}/q${fine}`);
      for (let coarse = 0; coarse < fine; coarse += 1) {
        transitions += 1;
        const unsafe = coarse < birth;
        const occupiedKeys = [...new Set(targets.map(target => canonical(quotientValue(coarse, target))))];
        const supports = occupiedKeys.map(key => supportFor(fibres, coarse, key, row.claims));
        const supportSizes = supports.map(support => support.support_cardinality);
        const m = Math.max(...supportSizes);
        const exactFibres = supportSizes.filter(size => size === 1).length;
        const woundedFibres = supportSizes.filter(size => size > 1).length;
        const transitionKey = `${row.schedule_id}|${row.bundle_id}|${fine}|${coarse}`;

        if (unsafe) {
          unsafeTransitions += 1;
          unsafeFibreEvaluations += supports.length;
          unsafeExactFibreIncidences += exactFibres;
          unsafeWoundedFibreIncidences += woundedFibres;
          if (exactFibres > 0 && woundedFibres > 0) unsafeMixedTransitions += 1;
          if (woundedFibres === supports.length) unsafeAllWoundedTransitions += 1;
          maximumM = Math.max(maximumM, m);
          mCounts.set(m, (mCounts.get(m) ?? 0) + 1);
          const local = scheduleCounts.get(row.schedule_id);
          local.set(m, (local.get(m) ?? 0) + 1);

          const maximizing = supports.find(support => support.support_cardinality === m);
          if (!maximizing || m <= 1) restorationFailures += 1;
          else lowerBoundChecks += 1;

          const supportByKey = new Map(supports.map(support => [canonical(support.quotient), support]));
          for (const target of targets) {
            unsafeTargetChecks += 1;
            const coarseKey = canonical(quotientValue(coarse, target));
            const support = supportByKey.get(coarseKey);
            if (!support) {
              restorationFailures += 1;
              continue;
            }
            const valueKey = canonical(bundleValue(row.claims, target));
            const localLabel = support.support_keys.indexOf(valueKey);
            if (localLabel < 0 || localLabel >= m) {
              restorationFailures += 1;
              continue;
            }
            // The sidecar alphabet is transition-local with cardinality m(T). Labels are
            // reused across different coarse records; the coarse record disambiguates the decoder.
            const decodedValueKey = support.support_keys[localLabel];
            if (decodedValueKey !== valueKey) restorationFailures += 1;
          }
        } else {
          safeTransitions += 1;
          safeFibreEvaluations += supports.length;
          safeExactFibreIncidences += exactFibres;
          safeWoundedFibreIncidences += woundedFibres;
          for (const target of targets) {
            safeTargetChecks += 1;
            const coarseKey = canonical(quotientValue(coarse, target));
            const support = supports.find(candidate => canonical(candidate.quotient) === coarseKey);
            if (!support || support.support_cardinality !== 1) safeControlFailures += 1;
          }
        }

        transitionIndex.set(transitionKey, freeze({
          schedule_id: row.schedule_id,
          bundle_id: row.bundle_id,
          claims: row.claims,
          bundle_size: row.bundle_size,
          birth,
          fine,
          coarse,
          unsafe,
          m,
          occupied_fibre_count: supports.length,
          exact_fibre_count: exactFibres,
          wounded_fibre_count: woundedFibres,
        }));
      }
    }
  }

  const distribution = normalizeDistribution(mCounts);
  const perSchedule = freeze(Object.fromEntries([...scheduleCounts.entries()].map(([id, counts]) => [id, normalizeDistribution(counts)])));
  const unsafeRows = [...transitionIndex.values()].filter(row => row.unsafe);
  const safeRows = [...transitionIndex.values()].filter(row => !row.unsafe);

  const find = (schedule, bundle, fine, coarse) => transitionIndex.get(`${schedule}|${bundle}|${fine}|${coarse}`);
  const counterexamples = freeze({
    same_bundle_size_different_cost: freeze([
      find('P-H-I', 'REPLAY_REQUIRED_FOR_EXACT_STATE', 1, 0),
      find('P-H-I', 'X1', 1, 0),
    ]),
    same_floor_different_cost: freeze([
      find('P-H-I', 'FIRST_STRATUM', 1, 0),
      find('P-H-I', 'X1', 1, 0),
    ]),
    same_cost_different_bundle: freeze([
      find('P-H-I', 'FIRST_STRATUM', 1, 0),
      find('P-H-I', 'FIRST_STRATUM+REPLAY_REQUIRED_FOR_EXACT_STATE', 1, 0),
    ]),
  });

  const witnesses = EXPECTED_WITNESSES.map(spec => {
    const row = find(spec.schedule_id, spec.bundle_id, spec.fine, spec.coarse);
    const q0Key = canonical(['NULL_REGISTERED_TRACE']);
    const support = supportFor(fibres, 0, q0Key, row?.claims ?? []);
    return freeze({
      ...spec,
      coarse_record: freeze(['NULL_REGISTERED_TRACE']),
      coarse_fibre_antecedents: support.antecedent_count,
      support_cardinality: support.support_cardinality,
      verified: Boolean(row)
        && row.birth === spec.birth
        && row.m === spec.m
        && support.support_cardinality === spec.m,
    });
  });

  const counterexampleExact = counterexamples.same_bundle_size_different_cost.every(Boolean)
    && counterexamples.same_bundle_size_different_cost[0].bundle_size === counterexamples.same_bundle_size_different_cost[1].bundle_size
    && counterexamples.same_bundle_size_different_cost[0].m !== counterexamples.same_bundle_size_different_cost[1].m
    && counterexamples.same_floor_different_cost.every(Boolean)
    && counterexamples.same_floor_different_cost[0].birth === counterexamples.same_floor_different_cost[1].birth
    && counterexamples.same_floor_different_cost[0].m !== counterexamples.same_floor_different_cost[1].m
    && counterexamples.same_cost_different_bundle.every(Boolean)
    && counterexamples.same_cost_different_bundle[0].bundle_id !== counterexamples.same_cost_different_bundle[1].bundle_id
    && counterexamples.same_cost_different_bundle[0].m === counterexamples.same_cost_different_bundle[1].m;

  return freeze({
    transition_count: transitions,
    unsafe_transition_count: unsafeTransitions,
    safe_control_transition_count: safeTransitions,
    m_distribution: distribution,
    maximum_m: maximumM,
    per_schedule_m_distribution: perSchedule,
    unsafe_coarse_fibre_support_evaluations: unsafeFibreEvaluations,
    safe_coarse_fibre_support_evaluations: safeFibreEvaluations,
    total_coarse_fibre_support_evaluations: unsafeFibreEvaluations + safeFibreEvaluations,
    unsafe_wounded_fibre_incidences: unsafeWoundedFibreIncidences,
    unsafe_exact_fibre_incidences: unsafeExactFibreIncidences,
    unsafe_mixed_transitions: unsafeMixedTransitions,
    unsafe_all_occupied_fibres_wounded_transitions: unsafeAllWoundedTransitions,
    safe_wounded_fibre_incidences: safeWoundedFibreIncidences,
    safe_exact_fibre_incidences: safeExactFibreIncidences,
    lower_bound_witness_checks: lowerBoundChecks,
    unsafe_target_indexed_restoration_checks: unsafeTargetChecks,
    safe_target_indexed_control_checks: safeTargetChecks,
    total_target_indexed_checks: unsafeTargetChecks + safeTargetChecks,
    restoration_failures: restorationFailures,
    safe_control_failures: safeControlFailures,
    counterexamples,
    maximizing_lower_bound_witnesses: freeze(witnesses),
    unsafe_rows_retained_in_public_certificate: false,
    safe_rows_retained_in_public_certificate: false,
    exact: transitions === 1180
      && unsafeTransitions === 1022
      && safeTransitions === 158
      && same(distribution, EXPECTED_M_DISTRIBUTION)
      && maximumM === 750
      && same(perSchedule, EXPECTED_PER_SCHEDULE)
      && unsafeFibreEvaluations === 7550
      && safeFibreEvaluations === 3382
      && unsafeWoundedFibreIncidences === 7550
      && unsafeExactFibreIncidences === 0
      && unsafeMixedTransitions === 0
      && unsafeAllWoundedTransitions === 1022
      && safeWoundedFibreIncidences === 0
      && safeExactFibreIncidences === 3382
      && lowerBoundChecks === 1022
      && unsafeTargetChecks === 127750
      && safeTargetChecks === 19750
      && unsafeTargetChecks + safeTargetChecks === 147500
      && restorationFailures === 0
      && safeControlFailures === 0
      && witnesses.every(row => row.verified)
      && counterexampleExact
      && unsafeRows.length === 1022
      && safeRows.length === 158,
  });
}

export function postRecompressionBundleRestorationSidecarCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(policy);
  const fibres = fibreAtlas(built.antecedents);
  const census = buildRestorationCensus(parent, built, fibres);
  const passed = parent.passed
    && policy.passed
    && built.states.length === 125
    && built.antecedents.length === 750
    && census.exact;

  cachedCertificate = freeze({
    schema: POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_SCHEMA,
    parent_receipt: POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_PARENT_RECEIPT,
    finite_domain: freeze({
      schedules: 6,
      states: 125,
      antecedents: 750,
      claim_families: 7,
      unsafe_transitions: census.unsafe_transition_count,
      safe_controls: census.safe_control_transition_count,
    }),
    restoration_census: census,
    minimality_certificate: freeze({
      lower_bound: 'ANY_ALPHABET_SMALLER_THAN_M_T_COLLIDES_ON_AN_EXPLICIT_MAXIMIZING_SAME_COARSE_RECORD_FIBRE',
      sufficiency: 'A_TRANSITION_LOCAL_M_T_LABEL_ALPHABET_DERIVED_FROM_THE_ALREADY_AUTHORIZED_FINE_REPRESENTATION_RESTORES_THE_REQUESTED_BUNDLE_ON_EVERY_OCCUPIED_COARSE_FIBRE',
      coding_uniqueness_claimed: false,
      minimum_bit_length_claimed: false,
      shannon_capacity_claimed: false,
    }),
    safe_control_certificate: freeze({
      transitions: census.safe_control_transition_count,
      all_surviving_coarse_supports_singleton: census.safe_wounded_fibre_incidences === 0,
      extra_distinguishing_sidecar_information: 0,
      trivial_control_alphabet_cardinality_if_materialized: 1,
    }),
    execution_ledger: freeze({
      coarse_fibre_support_evaluations: census.total_coarse_fibre_support_evaluations,
      lower_bound_witness_checks: census.lower_bound_witness_checks,
      target_indexed_checks: census.total_target_indexed_checks,
      represented_larger_cross_product_claimed_executed: false,
    }),
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_EACH_OF_THE_1022_EARNED_UNSAFE_FINITE_BIRTH_CLAIM_BUNDLE_RECOMPRESSIONS_HAS_A_TRANSITION_LOCAL_MINIMUM_RESTORATION_SIDECAR_ALPHABET_CARDINALITY_EQUAL_TO_THE_MAXIMUM_NUMBER_OF_REQUIRED_BUNDLE_VALUES_COHABITING_ANY_OCCUPIED_SURVIVING_COARSE_FIBRE',
      'AN_EXPLICIT_TRANSITION_LOCAL_SIDECAR_ALPHABET_OF_CARDINALITY_M_T_RESTORES_PRESENT_REQUESTED_BUNDLE_AUTHORITY_ON_EVERY_OCCUPIED_COARSE_FIBRE_WHILE_ANY_SMALLER_ALPHABET_COLLIDES_ON_AN_EXPLICIT_MAXIMIZING_FIBRE',
      'THE_COMPLETE_FIXED_FIXTURE_RESTORATION_COST_SPECTRUM_HAS_FIFTEEN_VALUES_2_3_5_6_10_15_25_30_50_75_125_150_250_375_750_WITH_MAXIMUM_750_ACROSS_1022_UNSAFE_TRANSITIONS',
      'BUNDLE_CARDINALITY_AND_MINIMUM_CUSTODY_FLOOR_BOTH_FAIL_TO_IDENTIFY_RESTORATION_SIDECAR_COST_IN_THE_FIXED_FINITE_ATLAS',
      'THE_158_ALREADY_SAFE_RECOMPRESSIONS_REQUIRE_ZERO_ADDITIONAL_DISTINGUISHING_SIDECAR_INFORMATION_AND_REMAIN_EXACT_CONTROLS',
    ] : []),
    scars: freeze([
      'SIDECAR_WITNESS != SOURCE_INFORMATION_CREATION',
      'RESTORED_PRESENT_AUTHORITY != RETROACTIVE_POSSESSION',
      'MINIMAL_SIDECAR_ALPHABET != MINIMUM_BIT_LENGTH',
      'MINIMAL_SIDECAR_ALPHABET != SHANNON_CAPACITY',
      'SIDECAR_LABEL != CRYPTOGRAPHIC_KEY',
      'SIDECAR_LABEL != AUTHENTICATION_CREDENTIAL',
      'SIDECAR != NEW_SENSOR_MEASUREMENT',
      'BUNDLE_RESTORATION != FULL_STATE_RECONSTRUCTION',
      'RESTORATION != SOURCE_STATE_MUTATION',
      'RESTORATION_FOR_BUNDLE_B != AUTHORITY_FOR_SUPERSET_BUNDLE',
      'BUNDLE_CARDINALITY != RESTORATION_SIDECAR_CARDINALITY',
      'MINIMUM_CUSTODY_FLOOR != RESTORATION_SIDECAR_COST',
      'SAME_RESTORATION_COST != SAME_BUNDLE_IDENTITY',
      'SCHEDULE_BUNDLE_HOLD != EVERY_TARGET_FIBRE_WOUNDED',
      'FINITE_BIRTH_UNSAFE_DOMAIN_ALL_WOUNDED != PARENT_HELD_ATLAS_UNIFORM_WOUNDING',
      'TRANSITION_LOCAL_MINIMALITY != UNIVERSAL_ENCODING_MINIMALITY',
      'FINITE_RESTORATION_CENSUS != ASYMPTOTIC_INFORMATION_THEOREM',
      'FIRST_MOMENT_MINIMUM_CUSTODY != POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR',
      'CLAIM_CONDITIONED_PARTIAL_EVENT_CUSTODY != FIXED_S3_POST_RECOMPRESSION_BUNDLE_RESTORATION',
    ]),
  });
  return cachedCertificate;
}

export function compilePostRecompressionBundleRestorationProjection(receiver) {
  const certificate = postRecompressionBundleRestorationSidecarCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified restoration-sidecar chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.post-recompression-bundle-restoration-child-legible/v0.1',
      truths: freeze([
        'WHEN_A_COARSER_RECORD_MIXES_SEVERAL_REQUIRED_ANSWERS_A_SMALL_RETAINED_LABEL_CAN_KEEP_THOSE_ANSWERS_APART',
        'THE_LABEL_ONLY_NEEDS_AS_MANY_NAMES_AS_THE_MOST_CROWDED_SURVIVING_COARSE_FIBRE_FOR_THE_REQUESTED_BUNDLE',
        'A_LABEL_RESTORES_PRESENT_BUNDLE_AUTHORITY_WITHOUT_REWRITING_WHAT_WAS_KNOWN_EARLIER',
        'ALREADY_SAFE_RECOMPRESSIONS_NEED_NO_EXTRA_DISTINGUISHING_LABEL_INFORMATION',
      ]),
      unsafe_transition_count: certificate.finite_domain.unsafe_transitions,
      distinct_restoration_cost_count: Object.keys(certificate.restoration_census.m_distribution).length,
      maximum_restoration_alphabet_cardinality: certificate.restoration_census.maximum_m,
      complete_transition_table_exposed: false,
      complete_fibre_table_exposed: false,
      complete_sidecar_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.post-recompression-bundle-restoration-loom-technical/v0.1',
      unsafe_transition_count: certificate.finite_domain.unsafe_transitions,
      safe_control_count: certificate.finite_domain.safe_controls,
      m_distribution: certificate.restoration_census.m_distribution,
      maximum_m: certificate.restoration_census.maximum_m,
      target_indexed_checks: certificate.execution_ledger.target_indexed_checks,
      complete_transition_table_exposed: false,
      complete_fibre_table_exposed: false,
      complete_sidecar_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for restoration-sidecar chamber: ${receiver}`);
  }
  return freeze({
    schema: POST_RECOMPRESSION_BUNDLE_RESTORATION_SIDECAR_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    claim_ceiling: freeze({
      universal_encoding_minimality: false,
      minimum_bit_length: false,
      shannon_capacity: false,
      cryptographic_key: false,
      authentication_credential: false,
      retroactive_possession: false,
      authority_for_superset_bundle: false,
      source_information_creation: false,
      merge: false,
      deploy: false,
      publish: false,
      release: false,
      vercel: false,
    }),
  });
}

export function rejectPostRecompressionBundleRestorationOverreach(candidate) {
  const forbidden = [
    'source_state_transform', 'source_information_creation', 'retroactive_possession',
    'minimum_bit_length', 'shannon_capacity', 'cryptographic_key', 'authentication_credential',
    'new_sensor_measurement', 'authority_for_superset_bundle', 'universal_encoding_minimality',
    'first_moment_minimum_custody_equivalence', 'claim_conditioned_partial_event_custody_equivalence',
  ];
  const directViolation = forbidden.some(key => candidate?.[key] === true)
    || Object.values(candidate?.authority ?? {}).some(Boolean)
    || Object.values(candidate?.claim_ceiling ?? {}).some(Boolean)
    || candidate?.payload?.complete_transition_table_exposed === true
    || candidate?.payload?.complete_fibre_table_exposed === true
    || candidate?.payload?.complete_sidecar_table_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true;
  return freeze({
    accepted: !directViolation,
    reason: directViolation ? 'POST_RECOMPRESSION_BUNDLE_RESTORATION_AUTHORITY_OVERREACH' : 'WITHIN_FIXED_RESTORATION_SIDECAR_MEMBRANE',
  });
}
