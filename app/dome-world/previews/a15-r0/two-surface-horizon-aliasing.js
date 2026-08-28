import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { anticipatoryCustodyEnvelopeCanonicalCertificate } from './anticipatory-custody-envelope-uniform-surface-certificate.js';

export const TWO_SURFACE_HORIZON_ALIASING_SCHEMA =
  'td613.dome-world.two-surface-horizon-aliasing/v0.1';
export const TWO_SURFACE_HORIZON_ALIASING_PARENT_RECEIPT =
  '3b58898bbdb64af056913f770ba4891176b27789';

const STAGES = Object.freeze([0, 1, 2]);
const EXPECTED_SCALAR = Object.freeze({
  '5->5': Object.freeze({ count: 24, m0: Object.freeze({ 5:4, 10:4, 15:8, 25:2, 50:2, 75:4 }) }),
  '5->10': Object.freeze({ count: 24, m0: Object.freeze({ 30:16, 150:8 }) }),
  '5->25': Object.freeze({ count: 80, m0: Object.freeze({ 25:2, 50:2, 75:4, 125:18, 250:18, 375:36 }) }),
  '5->50': Object.freeze({ count: 80, m0: Object.freeze({ 150:8, 750:72 }) }),
});
const EXPECTED_MARGINAL = Object.freeze({
  '25x5|5x5': Object.freeze({ count:16, m0:Object.freeze({ 5:2,10:2,15:4,25:2,50:2,75:4 }) }),
  '25x5|5x25': Object.freeze({ count:80, m0:Object.freeze({ 25:2,50:2,75:4,125:18,250:18,375:36 }) }),
  '25x5|5x10': Object.freeze({ count:16, m0:Object.freeze({ 30:8,150:8 }) }),
  '25x5|5x50': Object.freeze({ count:80, m0:Object.freeze({ 150:8,750:72 }) }),
  '9x5|9x5': Object.freeze({ count:8, m0:Object.freeze({ 5:2,10:2,15:4 }) }),
  '9x5|9x10': Object.freeze({ count:8, m0:Object.freeze({ 30:8 }) }),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform', 'new_sensor_measurement',
  'release', 'production', 'physical_claim', 'continuum_claim', 'cryptographic_key',
  'authentication_credential', 'retrocausal_channel', 'retention_policy',
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
    if (!policyRow) throw new Error(`missing inherited replay row for ${id}`);
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
  throw new Error(`unknown two-surface claim ${claim}`);
}

function bundleValue(claims, antecedent) {
  return freeze(claims.map(claim => freeze([claim, claimValue(claim, antecedent)])));
}

function fibreAtlas(antecedents) {
  const atlas = new Map();
  for (const stage of STAGES) {
    const fibres = new Map();
    for (const antecedent of antecedents) {
      const key = canonical(quotientValue(stage, antecedent));
      if (!fibres.has(key)) fibres.set(key, []);
      fibres.get(key).push(antecedent);
    }
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
      occupiedKeys.set(`${id}|${stage}`, freeze([...new Set(
        targets.map(target => canonical(quotientValue(stage, target))),
      )]));
    }
  }

  const cache = new Map();
  let supportEvaluations = 0;
  function profile(row, stage) {
    const id = `${row.schedule_id}|${row.bundle_id}|${stage}`;
    if (cache.has(id)) return cache.get(id);
    const supports = occupiedKeys.get(`${row.schedule_id}|${stage}`).map(key => {
      const values = new Set(fibres.get(stage).get(key).map(antecedent => canonical(bundleValue(row.claims, antecedent))));
      supportEvaluations += 1;
      return freeze({ key, cardinality: values.size });
    });
    const result = freeze({
      stage,
      supports: freeze(supports),
      maximum: Math.max(...supports.map(support => support.cardinality)),
      cardinality_multiset: freeze(supports.map(support => support.cardinality).sort((a,b) => a-b)),
    });
    cache.set(id, result);
    return result;
  }
  return { cache, profile, getSupportEvaluations: () => supportEvaluations };
}

function incrementNested(map, key, value) {
  if (!map.has(key)) map.set(key, { count: 0, m0: new Map() });
  const row = map.get(key);
  row.count += 1;
  row.m0.set(String(value), (row.m0.get(String(value)) ?? 0) + 1);
}

function nestedRecord(map) {
  return freeze(Object.fromEntries([...map.entries()]
    .sort(([left],[right]) => left.localeCompare(right))
    .map(([key,row]) => [key, freeze({
      count: row.count,
      m0: freeze(Object.fromEntries([...row.m0.entries()].sort(([a],[b]) => Number(a)-Number(b)))),
    })])));
}

function uniformProfileKey(profile) {
  const values = [...new Set(profile.cardinality_multiset)];
  return values.length === 1
    ? `${profile.cardinality_multiset.length}x${values[0]}`
    : `${profile.cardinality_multiset.length}xMIXED:${profile.cardinality_multiset.join(',')}`;
}

function buildCensus(bundleParent, built, fibres) {
  const profiles = buildProfiles(bundleParent, built, fibres);
  const scalar = new Map();
  const marginal = new Map();
  const rows = [];

  for (const row of bundleParent.bundle_support_certificate.rows) {
    if (row.actual_birth !== 3) continue;
    const q2 = profiles.profile(row, 2);
    const q1 = profiles.profile(row, 1);
    const q0 = profiles.profile(row, 0);
    const scalarKey = `${q2.maximum}->${q1.maximum}`;
    const marginalKey = `${uniformProfileKey(q2)}|${uniformProfileKey(q1)}`;
    incrementNested(scalar, scalarKey, q0.maximum);
    incrementNested(marginal, marginalKey, q0.maximum);
    rows.push(freeze({
      schedule_id: row.schedule_id,
      bundle_id: row.bundle_id,
      claims: row.claims,
      bundle_size: row.bundle_size,
      m2: q2.maximum,
      m1: q1.maximum,
      m0: q0.maximum,
      q2_profile: uniformProfileKey(q2),
      q1_profile: uniformProfileKey(q1),
      scalar_key: scalarKey,
      marginal_key: marginalKey,
    }));
  }

  const scalarRecord = nestedRecord(scalar);
  const marginalRecord = nestedRecord(marginal);
  const scalarAmbiguous = Object.values(scalarRecord).filter(row => Object.keys(row.m0).length > 1);
  const marginalAmbiguous = Object.values(marginalRecord).filter(row => Object.keys(row.m0).length > 1);
  const marginalIdentifying = Object.values(marginalRecord).filter(row => Object.keys(row.m0).length === 1);
  const ambiguousContexts = marginalAmbiguous.reduce((sum,row) => sum + row.count, 0);
  const identifyingContexts = marginalIdentifying.reduce((sum,row) => sum + row.count, 0);

  const aliasAleft = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'FIRST_STRATUM+X3');
  const aliasAright = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X1+X3');
  const aliasBleft = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'FIRST_STRATUM+FULL_STATE');
  const aliasBright = rows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X2+X3');

  const aliasA = freeze({ left: aliasAleft, right: aliasAright });
  const aliasB = freeze({ left: aliasBleft, right: aliasBright, ratio: aliasBleft?.m0 / aliasBright?.m0 });

  const exact = rows.length === 208
    && rows.every(row => row.m2 === 5)
    && profiles.cache.size === 624
    && profiles.getSupportEvaluations() === 6256
    && sameRecord(scalarRecord, EXPECTED_SCALAR)
    && sameRecord(marginalRecord, EXPECTED_MARGINAL)
    && Object.keys(scalarRecord).length === 4
    && scalarAmbiguous.length === 4
    && Object.keys(marginalRecord).length === 6
    && marginalAmbiguous.length === 5
    && marginalIdentifying.length === 1
    && ambiguousContexts === 200
    && identifyingContexts === 8
    && aliasAleft?.bundle_size === 2
    && aliasAright?.bundle_size === 2
    && aliasAleft?.q2_profile === aliasAright?.q2_profile
    && aliasAleft?.q1_profile === aliasAright?.q1_profile
    && aliasAleft?.m0 === 15
    && aliasAright?.m0 === 25
    && aliasBleft?.bundle_size === 2
    && aliasBright?.bundle_size === 2
    && aliasBleft?.q2_profile === aliasBright?.q2_profile
    && aliasBleft?.q1_profile === aliasBright?.q1_profile
    && aliasBleft?.m0 === 375
    && aliasBright?.m0 === 25
    && aliasB.ratio === 15;

  return freeze({
    contexts: rows.length,
    all_local_m2: rows.every(row => row.m2 === 5) ? 5 : null,
    scalar_two_surface_classes: scalarRecord,
    scalar_class_count: Object.keys(scalarRecord).length,
    scalar_ambiguous_class_count: scalarAmbiguous.length,
    marginal_profile_classes: marginalRecord,
    marginal_profile_class_count: Object.keys(marginalRecord).length,
    marginal_ambiguous_class_count: marginalAmbiguous.length,
    marginal_identifying_class_count: marginalIdentifying.length,
    marginal_ambiguous_contexts: ambiguousContexts,
    marginal_identifying_contexts: identifyingContexts,
    named_alias_A: aliasA,
    named_alias_B: aliasB,
    unique_stage_profiles: profiles.cache.size,
    occupied_fibre_support_evaluations: profiles.getSupportEvaluations(),
    full_context_rows_exposed: false,
    full_fibre_tables_exposed: false,
    labelled_merge_incidence_exposed: false,
    exact,
  });
}

export function twoSurfaceHorizonAliasingCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = anticipatoryCustodyEnvelopeCanonicalCertificate();
  const bundleParent = claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(policy);
  const fibres = fibreAtlas(built.antecedents);
  const census = buildCensus(bundleParent, built, fibres);
  const passed = parent.passed
    && parent.parent_receipt === '082de53b0972a5fd0d235973a8deee2faaebce71'
    && bundleParent.passed
    && policy.passed
    && census.exact;

  cachedCertificate = freeze({
    schema: TWO_SURFACE_HORIZON_ALIASING_SCHEMA,
    parent_receipt: TWO_SURFACE_HORIZON_ALIASING_PARENT_RECEIPT,
    domain: freeze({
      contexts: census.contexts,
      birth: 3,
      visible_stages: freeze([2,1]),
      future_terminal: 0,
    }),
    census,
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_208_CONTEXT_Q3_BIRTH_DOMAIN_EVERY_OBSERVED_TWO_SURFACE_SCALAR_COST_TRAJECTORY_CLASS_REMAINS_COMPATIBLE_WITH_MULTIPLE_DISTINCT_FUTURE_ROBUST_Q0_CUSTODY_REQUIREMENTS',
      'THE_COMPLETE_TWO_SURFACE_SCALAR_ATLAS_HAS_EXACTLY_FOUR_PREFIX_COST_CLASSES_5_5_5_10_5_25_AND_5_50_AND_NONE_IDENTIFIES_THE_FUTURE_ROBUST_Q0_REQUIREMENT',
      'PER_STAGE_SUPPORT_CARDINALITY_MARGINALS_AT_Q2_AND_Q1_ARE_NOT_GENERALLY_SUFFICIENT_TO_IDENTIFY_Q0_FUTURE_ROBUST_CUSTODY_WITH_200_OF_208_CONTEXTS_IN_FIVE_AMBIGUOUS_MARGINAL_PROFILE_CLASSES',
      'THE_FIXED_ATLAS_CONTAINS_SAME_SCHEDULE_SAME_BUNDLE_SIZE_CONTEXTS_WITH_IDENTICAL_Q2_Q1_SUPPORT_CARDINALITY_MARGINALS_BUT_A_FIFTEEN_FOLD_DIFFERENCE_IN_FUTURE_ROBUST_ALPHABET_CARDINALITY',
      'NESTED_FIBRE_MERGE_INCIDENCE_IS_STRICTLY_RICHER_THAN_PER_STAGE_SUPPORT_CARDINALITY_MARGINALS_FOR_THE_PURPOSE_OF_EXACT_FUTURE_CUSTODY_CLASSIFICATION_IN_THIS_FIXED_DOMAIN',
    ] : []),
    scars: freeze([
      'ONE_MORE_CONTROL_SURFACE != FUTURE_CUSTODY_IDENTIFIABILITY',
      'TWO_SURFACE_COST_TRAJECTORY != FUTURE_ROBUST_CUSTODY_IDENTITY',
      'PER_STAGE_SUPPORT_CARDINALITY_MARGINALS != FUTURE_MERGE_GEOMETRY',
      'SAME_SCHEDULE_AND_BUNDLE_SIZE_AND_TWO_SURFACE_CARDINALITY_PROFILE != SAME_FUTURE_ROBUST_CUSTODY',
      'MARGINAL_PROFILE_ALIASING != PROBABILISTIC_UNCERTAINTY',
      'MARGINAL_PROFILE_ALIASING != ENTROPY',
      'MARGINAL_PROFILE_ALIASING != MUTUAL_INFORMATION_THEOREM',
      'FINITE_ALIAS_CENSUS != UNIVERSAL_IDENTIFIABILITY_THEOREM',
      'TWO_SURFACE_ALIASING != GENERAL_DISTINGUISHABILITY_TRAJECTORY_CALCULUS',
    ]),
  });
  return cachedCertificate;
}

export function compileTwoSurfaceHorizonAliasingProjection(receiver) {
  const certificate = twoSurfaceHorizonAliasingCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified two-surface horizon aliasing');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.two-surface-horizon-aliasing-child-legible/v0.1',
      truths: freeze([
        'SEEING_THE_CURRENT_LABEL_COST_AND_THE_NEXT_LABEL_COST_STILL_DOES_NOT_TELL_YOU_HOW_MUCH_CUSTODY_A_LATER_MERGE_WILL_REQUIRE',
        'EVEN_THE_LIST_OF_LABEL_COUNTS_ON_EACH_VISIBLE_FIBRE_CAN_MATCH_WHILE_LATER_MERGE_OBLIGATIONS_DIFFER',
        'THE_MISSING_RELATION_IS_HOW_VISIBLE_FIBRES_WILL_MERGE_NOT_JUST_HOW_LARGE_THEY_ARE_NOW',
      ]),
      contexts: certificate.census.contexts,
      scalar_classes: certificate.census.scalar_class_count,
      ambiguous_marginal_contexts: certificate.census.marginal_ambiguous_contexts,
      full_context_rows_exposed: false,
      full_fibre_tables_exposed: false,
      labelled_merge_incidence_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.two-surface-horizon-aliasing-loom-technical/v0.1',
      contexts: certificate.census.contexts,
      scalar_two_surface_classes: certificate.census.scalar_two_surface_classes,
      marginal_profile_class_count: certificate.census.marginal_profile_class_count,
      marginal_ambiguous_contexts: certificate.census.marginal_ambiguous_contexts,
      marginal_identifying_contexts: certificate.census.marginal_identifying_contexts,
      full_context_rows_exposed: false,
      full_fibre_tables_exposed: false,
      labelled_merge_incidence_exposed: false,
    });
  } else throw new Error(`undeclared two-surface receiver ${receiver}`);

  return freeze({
    schema: TWO_SURFACE_HORIZON_ALIASING_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      shannon_capacity: false,
      entropy: false,
      mutual_information: false,
      minimum_bit_length: false,
      retrocausal_information_flow: false,
      cryptographic_key: false,
      universal_trajectory_theorem: false,
      operational_path_groupoid: false,
      source_state_mutation: false,
      merge: false,
      deploy: false,
      publish: false,
      release: false,
      vercel: false,
    }),
  });
}

export function rejectTwoSurfaceHorizonAliasingOverreach(candidate) {
  const forbidden = [
    'shannon_capacity','entropy','mutual_information','minimum_bit_length',
    'retrocausal_information_flow','cryptographic_key','universal_trajectory_theorem',
    'operational_path_groupoid','source_state_mutation',
  ];
  const violation = forbidden.some(key => candidate?.[key] === true)
    || Object.values(candidate?.authority ?? {}).some(Boolean)
    || Object.values(candidate?.claim_ceiling ?? {}).some(Boolean)
    || candidate?.payload?.full_context_rows_exposed === true
    || candidate?.payload?.full_fibre_tables_exposed === true
    || candidate?.payload?.labelled_merge_incidence_exposed === true;
  return freeze({
    accepted: !violation,
    reason: violation ? 'TWO_SURFACE_HORIZON_ALIASING_OVERREACH' : 'WITHIN_FIXED_TWO_SURFACE_ALIASING_MEMBRANE',
  });
}
