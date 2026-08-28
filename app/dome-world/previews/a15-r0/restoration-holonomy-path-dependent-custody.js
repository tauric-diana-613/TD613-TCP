import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from './claim-bundle-minimal-sufficient-custody-frontier.js';
import { postRecompressionBundleRestorationSidecarCertificate } from './post-recompression-bundle-restoration-sidecar.js';

export const RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_SCHEMA =
  'td613.dome-world.restoration-holonomy-path-dependent-custody/v0.1';
export const RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_PARENT_RECEIPT =
  '53e713059cde5dd6c2b4d4cbc20f882601360f7c';

const STAGES = Object.freeze([0, 1, 2, 3]);
const EXPECTED_SUPPORT_PAIRS = Object.freeze({
  '5->25':90, '5->50':90, '50->750':72, '5->750':72, '2->6':48, '10->30':48,
  '5->5':40, '5->10':40, '25->375':36, '5->375':36, '5->15':32, '10->150':24,
  '5->75':20, '25->125':18, '5->125':18, '25->250':18, '5->250':18, '2->30':16,
  '5->30':16, '5->150':16, '50->150':8, '25->75':4, '25->25':2, '25->50':2,
});
const EXPECTED_SCHEDULE = Object.freeze({
  'P-H-I': Object.freeze({ plateau:13, rupture:323, total:336 }),
  'P-I-H': Object.freeze({ plateau:13, rupture:323, total:336 }),
  'H-P-I': Object.freeze({ plateau:6, rupture:26, total:32 }),
  'H-I-P': Object.freeze({ plateau:2, rupture:22, total:24 }),
  'I-P-H': Object.freeze({ plateau:6, rupture:26, total:32 }),
  'I-H-P': Object.freeze({ plateau:2, rupture:22, total:24 }),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform', 'new_sensor_measurement',
  'release', 'production', 'physical_claim', 'continuum_claim', 'cryptographic_key',
  'authentication_credential', 'operational_path_groupoid',
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
    if (!policyRow) throw new Error(`missing replay policy row for ${id}`);
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
  throw new Error(`unknown restoration-holonomy claim: ${claim}`);
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

function normalizeCounts(counts) {
  return freeze(Object.fromEntries([...counts.entries()]));
}

function buildPathCensus(bundleParent, built, fibres) {
  const targetsBySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
    const id = scheduleId(schedule);
    return [id, built.antecedents.filter(antecedent => antecedent.schedule_id === id)];
  }));
  const occupiedKeys = new Map();
  for (const [id, targets] of targetsBySchedule.entries()) {
    for (const stage of STAGES) {
      occupiedKeys.set(`${id}|${stage}`, freeze([...new Set(targets.map(target => canonical(quotientValue(stage, target))))]));
    }
  }

  const profileCache = new Map();
  let supportEvaluations = 0;
  function stageProfile(row, stage) {
    const cacheKey = `${row.schedule_id}|${row.bundle_id}|${stage}`;
    if (profileCache.has(cacheKey)) return profileCache.get(cacheKey);
    const supports = occupiedKeys.get(`${row.schedule_id}|${stage}`).map(key => {
      const fibre = fibres.get(stage).get(key);
      if (!fibre) throw new Error(`missing q${stage} fibre for ${row.schedule_id}/${row.bundle_id}`);
      const support = new Map();
      for (const antecedent of fibre.antecedents) {
        const value = bundleValue(row.claims, antecedent);
        support.set(canonical(value), value);
      }
      supportEvaluations += 1;
      return freeze({
        key,
        quotient: fibre.quotient,
        support_keys: freeze([...support.keys()].sort()),
        support_cardinality: support.size,
      });
    });
    const result = freeze({
      stage,
      supports: freeze(supports),
      maximum: Math.max(...supports.map(support => support.support_cardinality)),
    });
    profileCache.set(cacheKey, result);
    return result;
  }

  const paths = [];
  const pairCounts = new Map();
  const bySchedule = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), { plateau:0, rupture:0, total:0 }]));
  const byBirth = { '2': { plateau:0, rupture:0, total:0 }, '3': { plateau:0, rupture:0, total:0 } };
  const bySecondLeg = {
    'q1->q0': { plateau:0, rupture:0, total:0 },
    'q2->q1': { plateau:0, rupture:0, total:0 },
    'q2->q0': { plateau:0, rupture:0, total:0 },
  };
  let pathChecks = 0;
  let plateau = 0;
  let rupture = 0;
  let strictDecrease = 0;
  let lowerBoundChecks = 0;
  let plateauDecodeChecks = 0;
  let plateauConstructionFailures = 0;
  let maximumExpansion = -1;
  let maximumExpansionWitness = null;

  for (const row of bundleParent.bundle_support_certificate.rows) {
    if (row.actual_birth === 'INF' || row.actual_birth < 2) continue;
    const birth = row.actual_birth;
    const targets = targetsBySchedule.get(row.schedule_id);
    if (!targets || targets.length !== 125) throw new Error(`missing path targets for ${row.schedule_id}`);

    for (let fine = birth; fine <= 3; fine += 1) {
      for (let intermediate = 0; intermediate < fine; intermediate += 1) {
        if (intermediate >= birth) continue;
        for (let terminal = 0; terminal < intermediate; terminal += 1) {
          pathChecks += 1;
          const dProfile = stageProfile(row, intermediate);
          const cProfile = stageProfile(row, terminal);
          const md = dProfile.maximum;
          const mc = cProfile.maximum;
          const transportable = md === mc;
          if (md > mc) strictDecrease += 1;
          const supportPair = `${md}->${mc}`;
          pairCounts.set(supportPair, (pairCounts.get(supportPair) ?? 0) + 1);
          const scheduleCounts = bySchedule.get(row.schedule_id);
          scheduleCounts.total += 1;
          byBirth[String(birth)].total += 1;
          const secondLegKey = `q${intermediate}->q${terminal}`;
          bySecondLeg[secondLegKey].total += 1;

          if (transportable) {
            plateau += 1;
            scheduleCounts.plateau += 1;
            byBirth[String(birth)].plateau += 1;
            bySecondLeg[secondLegKey].plateau += 1;

            // Construct a path-conditioned compatible minimum sidecar by assigning labels
            // to bundle values at each terminal fibre and restricting that assignment to
            // every nested intermediate subfibre. The terminal record remains part of the decoder.
            const terminalMaps = new Map(cProfile.supports.map(support => [
              support.key,
              new Map(support.support_keys.map((valueKey, index) => [valueKey, index])),
            ]));
            for (const target of targets) {
              plateauDecodeChecks += 1;
              const terminalKey = canonical(quotientValue(terminal, target));
              const intermediateKey = canonical(quotientValue(intermediate, target));
              const valueKey = canonical(bundleValue(row.claims, target));
              const map = terminalMaps.get(terminalKey);
              const label = map?.get(valueKey);
              if (!Number.isInteger(label) || label < 0 || label >= md) {
                plateauConstructionFailures += 1;
                continue;
              }
              const intermediateSupport = dProfile.supports.find(support => support.key === intermediateKey);
              if (!intermediateSupport?.support_keys.includes(valueKey)) plateauConstructionFailures += 1;
              const decoded = cProfile.supports.find(support => support.key === terminalKey)?.support_keys[label];
              if (decoded !== valueKey) plateauConstructionFailures += 1;
            }
          } else {
            rupture += 1;
            scheduleCounts.rupture += 1;
            byBirth[String(birth)].rupture += 1;
            bySecondLeg[secondLegKey].rupture += 1;
            const maximizing = cProfile.supports.find(support => support.support_cardinality === mc);
            if (!maximizing || !(md < maximizing.support_cardinality)) {
              throw new Error(`missing strict path lower bound for ${row.schedule_id}/${row.bundle_id}/q${fine}->q${intermediate}->q${terminal}`);
            }
            lowerBoundChecks += 1;
          }

          const expansion = mc - md;
          if (expansion > maximumExpansion) {
            maximumExpansion = expansion;
            maximumExpansionWitness = freeze({
              schedule_id: row.schedule_id,
              bundle_id: row.bundle_id,
              birth,
              fine,
              intermediate,
              terminal,
              m_d: md,
              m_c: mc,
              expansion,
            });
          }

          paths.push(freeze({
            schedule_id: row.schedule_id,
            bundle_id: row.bundle_id,
            claims: row.claims,
            bundle_size: row.bundle_size,
            birth,
            fine,
            intermediate,
            terminal,
            m_d: md,
            m_c: mc,
            transportable,
          }));
        }
      }
    }
  }

  const endpointGroups = new Map();
  for (const path of paths) {
    const key = `${path.schedule_id}|${path.bundle_id}|${path.birth}|${path.fine}|${path.terminal}`;
    if (!endpointGroups.has(key)) endpointGroups.set(key, []);
    endpointGroups.get(key).push(path);
  }
  const twoPathGroups = [...endpointGroups.values()].filter(group => group.length === 2);
  const mixedGroups = twoPathGroups.filter(group => group.some(path => path.transportable) && group.some(path => !path.transportable));
  const sameEndpointWitnesses = freeze(mixedGroups.map(group => freeze({
    schedule_id: group[0].schedule_id,
    bundle_id: group[0].bundle_id,
    birth: group[0].birth,
    fine: group[0].fine,
    terminal: group[0].terminal,
    paths: freeze([...group].sort((left, right) => left.intermediate - right.intermediate).map(path => freeze({
      intermediate: path.intermediate,
      m_d: path.m_d,
      m_c: path.m_c,
      transportable: path.transportable,
    }))),
  })));

  const localPlateau = paths.find(path => (
    path.schedule_id === 'P-H-I' && path.bundle_id === 'X2'
    && path.birth === 2 && path.fine === 2 && path.intermediate === 1 && path.terminal === 0
  ));
  const localRupture = paths.find(path => (
    path.schedule_id === 'P-H-I' && path.bundle_id === 'FULL_STATE'
    && path.birth === 3 && path.fine === 3 && path.intermediate === 2 && path.terminal === 0
  ));

  const scheduleObject = freeze(Object.fromEntries([...bySchedule.entries()].map(([id, counts]) => [id, freeze(counts)])));
  const supportPairs = normalizeCounts(pairCounts);
  const plateauSupports = freeze({
    '5->5': supportPairs['5->5'] ?? 0,
    '25->25': supportPairs['25->25'] ?? 0,
  });

  return freeze({
    total_paths: paths.length,
    birth_q2_paths: paths.filter(path => path.birth === 2).length,
    birth_q3_paths: paths.filter(path => path.birth === 3).length,
    transport_plateau_paths: plateau,
    transport_rupture_paths: rupture,
    strict_decrease_paths: strictDecrease,
    support_pair_spectrum: supportPairs,
    distinct_support_pair_count: Object.keys(supportPairs).length,
    plateau_supports: plateauSupports,
    by_schedule: scheduleObject,
    by_birth: freeze({ '2': freeze(byBirth['2']), '3': freeze(byBirth['3']) }),
    by_second_leg: freeze(Object.fromEntries(Object.entries(bySecondLeg).map(([key, counts]) => [key, freeze(counts)]))),
    unique_stage_profiles: profileCache.size,
    occupied_fibre_support_evaluations: supportEvaluations,
    path_criterion_checks: pathChecks,
    strict_expansion_lower_bound_checks: lowerBoundChecks,
    plateau_target_decode_checks: plateauDecodeChecks,
    plateau_construction_failures: plateauConstructionFailures,
    endpoint_groups: endpointGroups.size,
    endpoint_two_path_groups: twoPathGroups.length,
    mixed_transport_endpoint_groups: mixedGroups.length,
    same_endpoint_path_dependence_witnesses: sameEndpointWitnesses,
    maximum_support_cardinality_expansion: maximumExpansion,
    maximum_expansion_witness: maximumExpansionWitness,
    local_cost_nonidentity_witness: freeze({ plateau: localPlateau, rupture: localRupture }),
    path_rows_retained_in_public_certificate: false,
    exact: paths.length === 784
      && paths.filter(path => path.birth === 2).length === 160
      && paths.filter(path => path.birth === 3).length === 624
      && plateau === 42
      && rupture === 742
      && strictDecrease === 0
      && same(supportPairs, EXPECTED_SUPPORT_PAIRS)
      && supportPairs['5->5'] === 40
      && supportPairs['25->25'] === 2
      && same(scheduleObject, EXPECTED_SCHEDULE)
      && byBirth['2'].plateau === 8 && byBirth['2'].rupture === 152 && byBirth['2'].total === 160
      && byBirth['3'].plateau === 34 && byBirth['3'].rupture === 590 && byBirth['3'].total === 624
      && bySecondLeg['q1->q0'].plateau === 14 && bySecondLeg['q1->q0'].rupture === 354
      && bySecondLeg['q2->q1'].plateau === 24 && bySecondLeg['q2->q1'].rupture === 184
      && bySecondLeg['q2->q0'].plateau === 4 && bySecondLeg['q2->q0'].rupture === 204
      && profileCache.size === 784
      && supportEvaluations === 6864
      && pathChecks === 784
      && lowerBoundChecks === 742
      && plateauDecodeChecks === 5250
      && plateauConstructionFailures === 0
      && endpointGroups.size === 576
      && twoPathGroups.length === 208
      && mixedGroups.length === 2
      && sameEndpointWitnesses.every(witness => (
        ['P-H-I', 'P-I-H'].includes(witness.schedule_id)
        && witness.bundle_id === 'X2+X3'
        && witness.birth === 3
        && witness.fine === 3
        && witness.terminal === 0
        && witness.paths.length === 2
        && witness.paths[0].intermediate === 1
        && witness.paths[0].m_d === 25
        && witness.paths[0].m_c === 25
        && witness.paths[0].transportable === true
        && witness.paths[1].intermediate === 2
        && witness.paths[1].m_d === 5
        && witness.paths[1].m_c === 25
        && witness.paths[1].transportable === false
      ))
      && maximumExpansion === 745
      && maximumExpansionWitness?.schedule_id === 'P-H-I'
      && maximumExpansionWitness?.bundle_id === 'SCHEDULE+FULL_STATE'
      && maximumExpansionWitness?.intermediate === 2
      && maximumExpansionWitness?.terminal === 0
      && maximumExpansionWitness?.m_d === 5
      && maximumExpansionWitness?.m_c === 750
      && localPlateau?.m_d === 5 && localPlateau?.m_c === 5 && localPlateau?.transportable === true
      && localRupture?.m_d === 5 && localRupture?.m_c === 125 && localRupture?.transportable === false,
  });
}

export function restorationHolonomyPathDependentCustodyCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = postRecompressionBundleRestorationSidecarCertificate();
  const bundleParent = claimBundleMinimalSufficientCustodyFrontierCertificate();
  const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(policy);
  const fibres = fibreAtlas(built.antecedents);
  const census = buildPathCensus(bundleParent, built, fibres);
  const passed = parent.passed
    && bundleParent.passed
    && policy.passed
    && built.states.length === 125
    && built.antecedents.length === 750
    && census.exact;

  cachedCertificate = freeze({
    schema: RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_SCHEMA,
    parent_receipt: RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_PARENT_RECEIPT,
    finite_domain: freeze({
      schedules: 6,
      states: 125,
      antecedents: 750,
      restored_then_recompressed_paths: census.total_paths,
      endpoint_equivalent_two_path_groups: census.endpoint_two_path_groups,
    }),
    path_transport_census: census,
    transport_criterion: freeze({
      necessary_and_sufficient: 'PATH_CONDITIONED_LOCALLY_MINIMUM_D_SIDECAR_CAN_REMAIN_EXACT_AFTER_D_IS_DISCARDED_TO_C_IFF_M_D_EQUALS_M_C',
      lower_bound: 'IF_M_D_IS_SMALLER_THAN_M_C_THE_MAXIMIZING_TERMINAL_FIBRE_HAS_MORE_REQUIRED_BUNDLE_VALUES_THAN_THE_ENTIRE_RETAINED_D_SIDECAR_ALPHABET',
      sufficiency: 'IF_M_D_EQUALS_M_C_LABEL_REQUIRED_BUNDLE_VALUES_IN_EACH_TERMINAL_FIBRE_AND_RESTRICT_THAT_ASSIGNMENT_TO_NESTED_INTERMEDIATE_FIBRES',
      every_minimum_labelling_claimed_transportable: false,
    }),
    execution_ledger: freeze({
      occupied_fibre_support_evaluations: census.occupied_fibre_support_evaluations,
      path_criterion_checks: census.path_criterion_checks,
      strict_expansion_lower_bound_checks: census.strict_expansion_lower_bound_checks,
      plateau_target_decode_checks: census.plateau_target_decode_checks,
      endpoint_group_comparisons: census.endpoint_two_path_groups,
      represented_path_target_cross_product_claimed_executed: false,
    }),
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_LOCAL_MINIMUM_RESTORATION_SIDECARS_ARE_NOT_GENERALLY_COMPOSITIONALLY_STABLE_UNDER_FURTHER_RECOMPRESSION_WITH_ONLY_42_OF_784_RESTORED_THEN_RECOMPRESSED_PATHS_ADMITTING_A_COMPATIBLE_UNCHANGED_MINIMUM_ALPHABET_WHILE_742_FORCE_A_SAME_TERMINAL_RECORD_COLLISION_IF_THE_INTERMEDIATE_RECORD_IS_DISCARDED_WITHOUT_RECODING_OR_AUGMENTATION',
      'A_PATH_CONDITIONED_LOCALLY_MINIMUM_INTERMEDIATE_SIDECAR_CAN_REMAIN_EXACT_AFTER_FURTHER_RECOMPRESSION_IFF_THE_MAXIMUM_REQUIRED_BUNDLE_SUPPORT_CARDINALITY_DOES_NOT_INCREASE_BETWEEN_THE_INTERMEDIATE_AND_TERMINAL_STAGES',
      'THE_FIXED_FIXTURE_CONTAINS_EXACT_SAME_ENDPOINT_PATHS_FOR_P_H_I_AND_P_I_H_WITH_BUNDLE_X2_X3_WHERE_Q3_TO_Q1_TO_Q0_PRESERVES_A_25_LABEL_MINIMUM_SIDECAR_BUT_Q3_TO_Q2_TO_Q0_BREAKS_A_5_LABEL_MINIMUM_SIDECAR_AT_THE_IDENTICAL_Q0_VISIBLE_TERMINAL_SURFACE',
      'A_FINER_INTERMEDIATE_REGISTERED_REPRESENTATION_CAN_REQUIRE_A_SMALLER_LOCALLY_MINIMUM_SIDECAR_YET_PRODUCE_STRICTLY_WORSE_FUTURE_TRANSPORT_ROBUSTNESS_THAN_A_COARSER_INTERMEDIATE_REPRESENTATION_FOR_THE_SAME_ENDPOINT_RESTORATION_PROBLEM',
      'LOCAL_MINIMUM_SIDECAR_CARDINALITY_DOES_NOT_IDENTIFY_FUTURE_TRANSPORTABILITY_IN_THE_FIXED_PATH_ATLAS',
    ] : []),
    scars: freeze([
      'LOCAL_MINIMUM != COMPOSITIONALLY_SUFFICIENT',
      'SAME_ENDPOINT != SAME_CUSTODY_PATH',
      'SAME_VISIBLE_TERMINAL_COARSE_SURFACE != SAME_RETAINED_CUSTODY_AUTHORITY',
      'FINER_INTERMEDIATE_REPRESENTATION != MORE_FUTURE_ROBUST_MINIMUM_SIDECAR',
      'LOCAL_MINIMUM_SIDECAR_CARDINALITY != FUTURE_TRANSPORTABILITY_IDENTITY',
      'EXISTS_COMPATIBLE_MINIMAL_LABELING != EVERY_MINIMAL_LABELING_TRANSPORTS',
      'FORMAL_RESTORATION_HOLONOMY != PHYSICAL_BERRY_OR_GAUGE_HOLONOMY',
      'FORMAL_RESTORATION_HOLONOMY != OPERATIONAL_PATH_GROUPOID',
      'PATH_DEPENDENCE != SOURCE_STATE_MUTATION',
      'TRANSPORT_PLATEAU != ZERO_BIT_COST',
      'SUPPORT_CARDINALITY_EXPANSION != MINIMUM_AUGMENTATION_ALPHABET',
      'SIDECAR_LABEL_COORDINATION != CRYPTOGRAPHIC_KEY_AGREEMENT',
      'RESTORED_PRESENT_AUTHORITY != RETROACTIVE_POSSESSION',
      'TRANSITION_LOCAL_MINIMUM_RESTORATION != MULTISTEP_TRANSPORT_COMPOSITION',
      'REPRESENTED_PATH_TARGET_CROSS_PRODUCT != EXECUTED_TARGET_DECODE_CHECKS',
      'FINITE_PATH_CENSUS != ASYMPTOTIC_INFORMATION_THEOREM',
    ]),
  });
  return cachedCertificate;
}

export function compileRestorationHolonomyPathDependentCustodyProjection(receiver) {
  const certificate = restorationHolonomyPathDependentCustodyCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified restoration-holonomy chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.restoration-holonomy-child-legible/v0.1',
      truths: freeze([
        'A_SMALL_LABEL_THAT_WAS_ENOUGH_NEXT_TO_ONE_COARSE_RECORD_MAY_STOP_BEING_ENOUGH_IF_THAT_RECORD_IS_COMPRESSED_AWAY_AGAIN',
        'TWO_ROUTES_CAN_END_ON_THE_SAME_VISIBLE_COARSE_RECORD_BUT_LEAVE_DIFFERENT_RETAINED_CLAIM_AUTHORITY',
        'A_FINER_MIDDLE_RECORD_CAN_ALLOW_A_SMALLER_LOCAL_LABEL_THAT_IS_LESS_ROBUST_TO_LATER_RECOMPRESSION',
        'A_LOCALLY_MINIMUM_LABEL_TRANSPORTS_WITHOUT_ENLARGEMENT_ONLY_ON_THE_FINITE_SUPPORT_PLATEAUX_IN_THIS_FIXTURE',
      ]),
      total_paths: certificate.path_transport_census.total_paths,
      plateau_paths: certificate.path_transport_census.transport_plateau_paths,
      rupture_paths: certificate.path_transport_census.transport_rupture_paths,
      same_endpoint_flip_count: certificate.path_transport_census.mixed_transport_endpoint_groups,
      complete_path_table_exposed: false,
      complete_fibre_table_exposed: false,
      complete_label_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.restoration-holonomy-loom-technical/v0.1',
      total_paths: certificate.path_transport_census.total_paths,
      plateau_paths: certificate.path_transport_census.transport_plateau_paths,
      rupture_paths: certificate.path_transport_census.transport_rupture_paths,
      support_pair_spectrum: certificate.path_transport_census.support_pair_spectrum,
      endpoint_two_path_groups: certificate.path_transport_census.endpoint_two_path_groups,
      mixed_transport_endpoint_groups: certificate.path_transport_census.mixed_transport_endpoint_groups,
      complete_path_table_exposed: false,
      complete_fibre_table_exposed: false,
      complete_label_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for restoration-holonomy chamber: ${receiver}`);
  }
  return freeze({
    schema: RESTORATION_HOLONOMY_PATH_DEPENDENT_CUSTODY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    claim_ceiling: freeze({
      every_minimum_labelling_transports: false,
      minimum_bit_length: false,
      shannon_capacity: false,
      cryptographic_key: false,
      authentication_credential: false,
      operational_path_groupoid: false,
      physical_holonomy: false,
      retroactive_possession: false,
      source_information_creation: false,
      merge: false,
      deploy: false,
      publish: false,
      release: false,
      vercel: false,
    }),
  });
}

export function rejectRestorationHolonomyOverreach(candidate) {
  const forbidden = [
    'source_state_transform', 'source_information_creation', 'retroactive_possession',
    'minimum_bit_length', 'shannon_capacity', 'cryptographic_key', 'authentication_credential',
    'new_sensor_measurement', 'operational_path_groupoid', 'physical_holonomy',
    'universal_functoriality', 'minimum_augmentation_alphabet_from_support_difference',
    'every_minimum_labelling_transports',
  ];
  const directViolation = forbidden.some(key => candidate?.[key] === true)
    || Object.values(candidate?.authority ?? {}).some(Boolean)
    || Object.values(candidate?.claim_ceiling ?? {}).some(Boolean)
    || candidate?.payload?.complete_path_table_exposed === true
    || candidate?.payload?.complete_fibre_table_exposed === true
    || candidate?.payload?.complete_label_table_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true;
  return freeze({
    accepted: !directViolation,
    reason: directViolation ? 'RESTORATION_HOLONOMY_AUTHORITY_OVERREACH' : 'WITHIN_FIXED_FORMAL_RESTORATION_HOLONOMY_MEMBRANE',
  });
}
