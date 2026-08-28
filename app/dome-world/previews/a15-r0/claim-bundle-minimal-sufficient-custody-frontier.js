import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate } from './bitemporal-authority-birth-nonretroactive-jurisdiction.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from './bitemporal-prospective-replay-minimal-observation-policy.js';
import { admissibilityHorizonRefinementRecompressionRuptureCertificate } from './admissibility-horizon-refinement-recompression-rupture.js';

export const CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_SCHEMA =
  'td613.dome-world.claim-bundle-minimal-sufficient-custody-frontier/v0.1';
export const CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_PARENT_RECEIPT =
  '623e03795d9cb4dfef33c003b05c3efc45da3f9a';

const STAGES = Object.freeze([0, 1, 2, 3]);
const CLAIMS = Object.freeze([
  'FIRST_STRATUM',
  'SCHEDULE',
  'X1',
  'X2',
  'X3',
  'FULL_STATE',
  'REPLAY_REQUIRED_FOR_EXACT_STATE',
]);
const EXPECTED_MINIMUM_STAGE_DISTRIBUTION = Object.freeze({ '1': 26, '2': 80, '3': 208, INF: 448 });
const EXPECTED_STAGE_AUTHORIZED = Object.freeze([0, 26, 106, 314]);
const EXPECTED_STAGE_HELD = Object.freeze([762, 736, 656, 448]);
const EXPECTED_SCHEDULE_DISTRIBUTION = Object.freeze({
  'P-H-I': Object.freeze({ '1': 7, '2': 24, '3': 96, INF: 0 }),
  'P-I-H': Object.freeze({ '1': 7, '2': 24, '3': 96, INF: 0 }),
  'H-P-I': Object.freeze({ '1': 3, '2': 4, '3': 8, INF: 112 }),
  'H-I-P': Object.freeze({ '1': 3, '2': 12, '3': 0, INF: 112 }),
  'I-P-H': Object.freeze({ '1': 3, '2': 4, '3': 8, INF: 112 }),
  'I-H-P': Object.freeze({ '1': 3, '2': 12, '3': 0, INF: 112 }),
});
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform',
  'release', 'production', 'physical_claim', 'continuum_claim',
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

function claimBundles() {
  const rows = [];
  for (let mask = 1; mask < (1 << CLAIMS.length); mask += 1) {
    const claims = CLAIMS.filter((_, index) => (mask & (1 << index)) !== 0);
    rows.push(freeze({
      mask,
      id: claims.join('+'),
      claims: freeze(claims),
      size: claims.length,
    }));
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
    if (!policyRow) throw new Error(`missing inherited policy row for ${id}`);
    const matrix = phasonicObservationMatrix(schedule);
    for (const state of states) {
      antecedents.push(freeze({
        id: `${id}:${state.join(',')}`,
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
  throw new Error(`unknown claim: ${claim}`);
}

function bundleValue(bundle, antecedent) {
  return freeze(bundle.claims.map(claim => freeze([claim, claimValue(claim, antecedent)])));
}

function fibreAtlas(antecedents) {
  const stages = new Map();
  for (const stage of STAGES) {
    const fibres = new Map();
    for (const antecedent of antecedents) {
      const quotient = quotientValue(stage, antecedent);
      const key = canonical(quotient);
      if (!fibres.has(key)) fibres.set(key, { quotient, antecedents: [] });
      fibres.get(key).antecedents.push(antecedent);
    }
    for (const fibre of fibres.values()) Object.freeze(fibre.antecedents);
    stages.set(stage, fibres);
  }
  return stages;
}

function inheritedBirthAtlas(jurisdiction, policy) {
  const replayBySchedule = new Map(policy.replay_required_authority_certificate.schedules.map(row => [row.schedule_id, row.birth]));
  const map = new Map();
  for (const schedule of jurisdiction.schedules) {
    const births = Object.fromEntries(schedule.claim_rows.map(row => [row.claim, row.birth]));
    births.REPLAY_REQUIRED_FOR_EXACT_STATE = replayBySchedule.get(schedule.schedule_id) ?? 'INF';
    map.set(schedule.schedule_id, freeze(births));
  }
  return map;
}

function maxBirth(bundle, births) {
  let maximum = 0;
  for (const claim of bundle.claims) {
    const birth = births[claim];
    if (birth === 'INF') return 'INF';
    maximum = Math.max(maximum, birth);
  }
  return maximum;
}

function targetBundleProfile(stageFibres, stage, antecedent, bundle) {
  const key = canonical(quotientValue(stage, antecedent));
  const fibre = stageFibres.get(stage).get(key);
  if (!fibre) throw new Error('missing target fibre');
  const union = new Set(fibre.antecedents.map(member => canonical(bundleValue(bundle, member))));
  return freeze({
    stage,
    fibre_size: fibre.antecedents.length,
    union_cardinality: union.size,
    exact: union.size === 1,
  });
}

function bundleAtlas(stageFibres, antecedents, bundles, birthsBySchedule) {
  const targetsBySchedule = new Map();
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    targetsBySchedule.set(id, antecedents.filter(antecedent => antecedent.schedule_id === id));
  }

  const rows = [];
  let jointSupportChecks = 0;
  let maxBirthAgreementChecks = 0;
  let cellAuthorizationChecks = 0;
  let mixedHeldCells = 0;

  for (const [id, targets] of targetsBySchedule.entries()) {
    const births = birthsBySchedule.get(id);
    for (const bundle of bundles) {
      const predictedBirth = maxBirth(bundle, births);
      const cells = [];
      for (const stage of STAGES) {
        let exactTargets = 0;
        let inexactTargets = 0;
        for (const target of targets) {
          const profile = targetBundleProfile(stageFibres, stage, target, bundle);
          jointSupportChecks += 1;
          if (profile.exact) exactTargets += 1;
          else inexactTargets += 1;
        }
        cellAuthorizationChecks += 1;
        const authorized = exactTargets === targets.length;
        const mixed = exactTargets > 0 && inexactTargets > 0;
        if (!authorized && mixed) mixedHeldCells += 1;
        cells.push(freeze({
          stage,
          authorized,
          exact_target_count: exactTargets,
          inexact_target_count: inexactTargets,
          mixed_target_fibres: mixed,
        }));
      }
      const birthCell = cells.find(cell => cell.authorized);
      const actualBirth = birthCell?.stage ?? 'INF';
      maxBirthAgreementChecks += 1;
      rows.push(freeze({
        schedule_id: id,
        bundle_id: bundle.id,
        bundle_mask: bundle.mask,
        claims: bundle.claims,
        bundle_size: bundle.size,
        predicted_birth: predictedBirth,
        actual_birth: actualBirth,
        max_birth_agreement: actualBirth === predictedBirth,
        cells: freeze(cells),
      }));
    }
  }

  return freeze({
    rows: freeze(rows),
    joint_support_target_checks: jointSupportChecks,
    max_birth_agreement_checks: maxBirthAgreementChecks,
    cell_authorization_checks: cellAuthorizationChecks,
    mixed_held_cells: mixedHeldCells,
    exact: rows.length === 762
      && jointSupportChecks === 381000
      && maxBirthAgreementChecks === 762
      && cellAuthorizationChecks === 3048
      && mixedHeldCells > 0
      && rows.every(row => row.max_birth_agreement)
      && rows.every(row => row.cells.every(cell => (
        cell.authorized === (cell.exact_target_count === 125)
        && cell.exact_target_count + cell.inexact_target_count === 125
      ))),
  });
}

function censusCertificate(atlasRows) {
  const minimumStageDistribution = { '1': 0, '2': 0, '3': 0, INF: 0 };
  const perSchedule = {};
  for (const row of atlasRows) {
    const key = String(row.actual_birth);
    minimumStageDistribution[key] += 1;
    if (!perSchedule[row.schedule_id]) perSchedule[row.schedule_id] = { '1': 0, '2': 0, '3': 0, INF: 0 };
    perSchedule[row.schedule_id][key] += 1;
  }

  const stageRows = STAGES.map(stage => {
    const authorized = atlasRows.filter(row => row.cells.find(cell => cell.stage === stage)?.authorized).length;
    return freeze({ stage, authorized, held: atlasRows.length - authorized });
  });
  const authorizedCells = stageRows.reduce((sum, row) => sum + row.authorized, 0);
  const heldCells = stageRows.reduce((sum, row) => sum + row.held, 0);
  const finiteBirthEarlierHeld = atlasRows.reduce((sum, row) => (
    row.actual_birth === 'INF' ? sum : sum + row.actual_birth
  ), 0);
  const infHeldCells = atlasRows.filter(row => row.actual_birth === 'INF').length * STAGES.length;
  const terminallyAuthorized = atlasRows.filter(row => row.actual_birth !== 'INF').length;
  const unreached = atlasRows.length - terminallyAuthorized;

  return freeze({
    minimum_stage_distribution: freeze(minimumStageDistribution),
    per_schedule_minimum_stage_distribution: freeze(perSchedule),
    stage_rows: freeze(stageRows),
    authorized_bundle_cells: authorizedCells,
    held_bundle_cells: heldCells,
    finite_birth_earlier_held_cells: finiteBirthEarlierHeld,
    inf_bundle_held_cells: infHeldCells,
    terminally_authorizable_bundles: terminallyAuthorized,
    unreached_bundles: unreached,
    exact: same(minimumStageDistribution, EXPECTED_MINIMUM_STAGE_DISTRIBUTION)
      && same(perSchedule, EXPECTED_SCHEDULE_DISTRIBUTION)
      && same(stageRows.map(row => row.authorized), EXPECTED_STAGE_AUTHORIZED)
      && same(stageRows.map(row => row.held), EXPECTED_STAGE_HELD)
      && authorizedCells === 446
      && heldCells === 2602
      && finiteBirthEarlierHeld === 810
      && infHeldCells === 1792
      && terminallyAuthorized === 314
      && unreached === 448,
  });
}

function recompressionCertificate(atlasRows) {
  let transitions = 0;
  let preserved = 0;
  let reopened = 0;
  let preservingStateChecks = 0;
  let reopeningStateChecks = 0;
  let frontierViolations = 0;
  const byBirth = {
    '1': { transitions: 0, preserved: 0, reopened: 0 },
    '2': { transitions: 0, preserved: 0, reopened: 0 },
    '3': { transitions: 0, preserved: 0, reopened: 0 },
  };

  for (const row of atlasRows) {
    if (row.actual_birth === 'INF') continue;
    const birth = row.actual_birth;
    for (let fine = birth; fine <= 3; fine += 1) {
      const fineCell = row.cells.find(cell => cell.stage === fine);
      if (!fineCell?.authorized) {
        frontierViolations += 1;
        continue;
      }
      for (let coarse = 0; coarse < fine; coarse += 1) {
        transitions += 1;
        byBirth[String(birth)].transitions += 1;
        const coarseCell = row.cells.find(cell => cell.stage === coarse);
        const shouldPreserve = coarse >= birth;
        if (coarseCell?.authorized !== shouldPreserve) frontierViolations += 1;
        if (shouldPreserve) {
          preserved += 1;
          byBirth[String(birth)].preserved += 1;
          preservingStateChecks += 125;
        } else {
          reopened += 1;
          byBirth[String(birth)].reopened += 1;
          reopeningStateChecks += 125;
          if (!coarseCell || coarseCell.inexact_target_count < 1) frontierViolations += 1;
        }
      }
    }
  }

  return freeze({
    fine_authorized_ordered_transitions: transitions,
    preserved_transitions: preserved,
    reopened_transitions: reopened,
    preserving_state_indexed_checks: preservingStateChecks,
    reopening_state_indexed_checks: reopeningStateChecks,
    total_state_indexed_checks: preservingStateChecks + reopeningStateChecks,
    by_minimum_stage: freeze(byBirth),
    frontier_violations: frontierViolations,
    exact: transitions === 1180
      && preserved === 158
      && reopened === 1022
      && preservingStateChecks === 19750
      && reopeningStateChecks === 127750
      && preservingStateChecks + reopeningStateChecks === 147500
      && same(byBirth, {
        '1': { transitions: 156, preserved: 78, reopened: 78 },
        '2': { transitions: 400, preserved: 80, reopened: 320 },
        '3': { transitions: 624, preserved: 0, reopened: 624 },
      })
      && frontierViolations === 0,
  });
}

function cardinalityNonidentityCertificate(atlasRows) {
  const phiX1 = atlasRows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X1');
  const phiX3 = atlasRows.find(row => row.schedule_id === 'P-H-I' && row.bundle_id === 'X3');
  const sameSizeDifferentFloor = Boolean(phiX1 && phiX3)
    && phiX1.bundle_size === phiX3.bundle_size
    && phiX1.actual_birth === 1
    && phiX3.actual_birth === 3;

  const sameFloorDifferentBundle = atlasRows.some(left => atlasRows.some(right => (
    left.schedule_id === right.schedule_id
    && left.bundle_id !== right.bundle_id
    && left.actual_birth !== 'INF'
    && left.actual_birth === right.actual_birth
  )));

  return freeze({
    named_same_size_witness: freeze({
      schedule_id: 'P-H-I',
      left_bundle: 'X1',
      left_minimum_stage: phiX1?.actual_birth ?? null,
      right_bundle: 'X3',
      right_minimum_stage: phiX3?.actual_birth ?? null,
    }),
    same_bundle_size_does_not_identify_floor: sameSizeDifferentFloor,
    same_floor_does_not_identify_bundle: sameFloorDifferentBundle,
    exact: sameSizeDifferentFloor && sameFloorDifferentBundle,
  });
}

export function claimBundleMinimalSufficientCustodyFrontierCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = admissibilityHorizonRefinementRecompressionRuptureCertificate();
  const jurisdiction = bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
  const policy = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(policy);
  const bundles = claimBundles();
  const stageFibres = fibreAtlas(built.antecedents);
  const birthsBySchedule = inheritedBirthAtlas(jurisdiction, policy);
  const atlas = bundleAtlas(stageFibres, built.antecedents, bundles, birthsBySchedule);
  const census = censusCertificate(atlas.rows);
  const recompression = recompressionCertificate(atlas.rows);
  const nonidentity = cardinalityNonidentityCertificate(atlas.rows);
  const passed = parent.passed
    && jurisdiction.passed
    && policy.passed
    && built.states.length === 125
    && built.antecedents.length === 750
    && bundles.length === 127
    && atlas.exact
    && census.exact
    && recompression.exact
    && nonidentity.exact;

  cachedCertificate = freeze({
    schema: CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_SCHEMA,
    parent_receipt: CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_PARENT_RECEIPT,
    finite_domain: freeze({
      schedules: 6,
      states: 125,
      antecedents: 750,
      claim_families: 7,
      nonempty_bundles_per_schedule: bundles.length,
      schedule_bundle_pairs: atlas.rows.length,
      registered_stages: STAGES.length,
      bundle_jurisdiction_cells: atlas.rows.length * STAGES.length,
    }),
    claim_order: CLAIMS,
    bundle_support_certificate: atlas,
    minimum_sufficient_custody_census: census,
    authority_preserving_recompression_frontier: recompression,
    cardinality_nonidentity_certificate: nonidentity,
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_EVERY_FINITE_BIRTH_NONEMPTY_CLAIM_BUNDLE_HAS_A_UNIQUE_EARLIEST_REGISTERED_STAGE_THAT_IS_SIMULTANEOUSLY_SUFFICIENT_FOR_THE_ENTIRE_BUNDLE_AND_THAT_STAGE_IS_EXACTLY_THE_MAXIMUM_OF_ITS_CONSTITUENT_SINGLE_CLAIM_AUTHORITY_BIRTH_HORIZONS',
      'THE_COMPLETE_SEVEN_CLAIM_BUNDLE_ATLAS_CONTAINS_762_SCHEDULE_BUNDLE_PAIRS_OF_WHICH_314_ARE_TERMINALLY_AUTHORIZABLE_AND_448_REMAIN_UNREACHED_WITH_MINIMUM_SUFFICIENT_STAGE_DISTRIBUTION_26_AT_Q1_80_AT_Q2_AND_208_AT_Q3',
      'RECOMPRESSION_PRESERVES_A_FINITE_BIRTH_CLAIM_BUNDLE_IFF_THE_SURVIVING_REGISTERED_STAGE_IS_NOT_EARLIER_THAN_THE_BUNDLES_MINIMUM_SUFFICIENT_AUTHORITY_STAGE',
      'CLAIM_REQUIREMENTS_CAN_BE_COMPILED_INTO_A_FINITE_MINIMUM_CUSTODY_FLOOR_WITHOUT_GRANTING_NEW_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY',
      'BUNDLE_CARDINALITY_DOES_NOT_IDENTIFY_MINIMUM_CUSTODY_STAGE_AND_SHARED_MINIMUM_STAGE_DOES_NOT_IDENTIFY_BUNDLE_CONTENT_IN_THE_FIXED_ATLAS',
    ] : []),
    scars: freeze([
      'CLAIM_BUNDLE != SINGLE_SEMANTIC_OBJECT',
      'BUNDLE_AUTHORITY != SOURCE_TRUTH',
      'MINIMUM_SUFFICIENT_STAGE != MINIMUM_BIT_LENGTH',
      'MINIMUM_SUFFICIENT_STAGE != UNIQUE_MINIMAL_ENCODING',
      'MINIMUM_SUFFICIENT_STAGE != UNIVERSAL_SUFFICIENT_STATISTIC',
      'BUNDLE_BIRTH_MAXIMUM != PROBABILISTIC_STOPPING_TIME',
      'BUNDLE_CARDINALITY != BUNDLE_AUTHORITY_IDENTITY',
      'SAME_MINIMUM_STAGE != SAME_CLAIM_BUNDLE',
      'TERMINALLY_AUTHORIZABLE != ALWAYS_AUTHORIZED',
      'INF_IN_THIS_FIXTURE != PRINCIPLED_UNKNOWABILITY',
      'SAFE_RECOMPRESSION_FLOOR != DATA_RETENTION_POLICY',
      'AUTHORITY_PRESERVING_RECOMPRESSION != SOURCE_STATE_COMPRESSION',
      'SCHEDULE_BUNDLE_HOLD != EVERY_TARGET_FIBRE_WOUNDED',
      'MIXED_EXACT_AND_WOUNDED_TARGET_FIBRES != SCHEDULE_LEVEL_AUTHORITY',
      'JOINT_CLAIM_CONSTANCY != SEMANTIC_COMPLETENESS',
      'FINITE_127_BUNDLE_CENSUS != UNIVERSAL_INFORMATION_LATTICE_THEOREM',
      'FINITE_STAGE_SYNTHESIS != ASYMPTOTIC_OPTIMIZATION',
    ]),
  });
  return cachedCertificate;
}

export function compileClaimBundleMinimalSufficientCustodyProjection(receiver) {
  const certificate = claimBundleMinimalSufficientCustodyFrontierCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified claim-bundle custody frontier');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.claim-bundle-custody-frontier-child-legible/v0.1',
      truths: freeze([
        'WHEN_SEVERAL_CLAIMS_MUST_STAY_SAFE_TOGETHER_WE_KEEP_AT_LEAST_THE_LATEST_LAYER_ANY_ONE_OF_THEM_NEEDS',
        'KEEPING_LESS_THAN_THAT_FLOOR_REOPENS_AT_LEAST_ONE_REQUIRED_CLAIM_WOUND',
        'TWO_BUNDLES_WITH_THE_SAME_NUMBER_OF_CLAIMS_CAN_NEED_DIFFERENT_CUSTODY_FLOORS',
        'SOME_CLAIM_BUNDLES_NEVER_BECOME_SAFE_INSIDE_THIS_FOUR_STAGE_FIXTURE',
      ]),
      complete_bundle_table_exposed: false,
      complete_fibre_table_exposed: false,
      latent_state_values_exposed: false,
      recompression_witness_table_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.claim-bundle-custody-frontier-loom-technical/v0.1',
      schedule_bundle_pairs: certificate.finite_domain.schedule_bundle_pairs,
      minimum_stage_distribution: certificate.minimum_sufficient_custody_census.minimum_stage_distribution,
      terminally_authorizable_bundles: certificate.minimum_sufficient_custody_census.terminally_authorizable_bundles,
      unreached_bundles: certificate.minimum_sufficient_custody_census.unreached_bundles,
      preserved_recompressions: certificate.authority_preserving_recompression_frontier.preserved_transitions,
      reopened_recompressions: certificate.authority_preserving_recompression_frontier.reopened_transitions,
      complete_bundle_table_exposed: false,
      complete_fibre_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for claim-bundle custody frontier: ${receiver}`);
  }
  return freeze({
    schema: CLAIM_BUNDLE_MINIMAL_SUFFICIENT_CUSTODY_FRONTIER_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      joint_support_target_checks: certificate.bundle_support_certificate.joint_support_target_checks,
      recompression_state_indexed_checks: certificate.authority_preserving_recompression_frontier.total_state_indexed_checks,
      represented_larger_cross_product_claimed_executed: false,
    }),
    claim_ceiling: freeze({
      bounded_claim_bundle_custody_synthesis: true,
      universal_sufficient_statistic: false,
      universal_information_lattice: false,
      shannon_or_entropy_theorem: false,
      asymptotic_optimization: false,
      general_database_theorem: false,
      physical_sensing_claim: false,
      source_state_mutation: false,
      autonomous_retention_or_deletion: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectClaimBundleCustodyFrontierOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_sufficient_statistic === true
    || ceiling.universal_information_lattice === true
    || ceiling.shannon_or_entropy_theorem === true
    || ceiling.asymptotic_optimization === true
    || ceiling.general_database_theorem === true
    || ceiling.physical_sensing_claim === true
    || ceiling.source_state_mutation === true
    || ceiling.autonomous_retention_or_deletion === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const falseSynthesis = candidate?.bundle_floor_from_cardinality_only === true
    || candidate?.same_minimum_stage_implies_same_bundle === true
    || candidate?.all_bundles_terminally_authorized === true
    || candidate?.inf_means_universally_unknowable === true
    || candidate?.recompression_below_floor_preserves_bundle === true;
  const sourceConfusion = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true
    || candidate?.minimum_stage_means_source_compressed === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.complete_bundle_table_exposed === true
    || candidate?.payload?.complete_fibre_table_exposed === true
    || candidate?.payload?.latent_state_values_exposed === true
    || candidate?.payload?.recompression_witness_table_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !falseSynthesis && !sourceConfusion && !runtime && !ashLeak });
}
