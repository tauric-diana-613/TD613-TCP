import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  bitemporalProspectiveReplayMinimalObservationPolicyCertificate,
} from './bitemporal-prospective-replay-minimal-observation-policy.js';

export const ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_SCHEMA =
  'td613.dome-world.admissibility-horizon-refinement-recompression-rupture/v0.1';
export const ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_PARENT_RECEIPT =
  '2fefe16e5883f6c4fe36d75e9e4c41331f317911';

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
const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'source_state_transform',
  'release', 'production', 'physical_claim', 'continuum_claim',
]);
const EXPECTED_STAGE_AUTHORIZED = Object.freeze([0, 14, 24, 30]);
const EXPECTED_STAGE_HELD = Object.freeze([42, 28, 18, 12]);
const EXPECTED_NULL_WOUNDS = Object.freeze({
  FIRST_STRATUM: 3,
  SCHEDULE: 6,
  X1: 5,
  X2: 5,
  X3: 5,
  FULL_STATE: 125,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 2,
});
const EXPECTED_REOPEN_BY_CLAIM = Object.freeze({
  FIRST_STRATUM: 18,
  SCHEDULE: 24,
  X1: 6,
  X2: 14,
  X3: 14,
  FULL_STATE: 6,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 18,
});
const EXPECTED_PRESERVE_BY_CLAIM = Object.freeze({
  FIRST_STRATUM: 18,
  SCHEDULE: 6,
  X1: 6,
  X2: 2,
  X3: 2,
  FULL_STATE: 0,
  REPLAY_REQUIRED_FOR_EXACT_STATE: 18,
});

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
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
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

function setSubset(left, right) {
  return [...left].every(value => right.has(value));
}

function setSame(left, right) {
  return left.size === right.size && setSubset(left, right);
}

function frozenSortedSet(set) {
  return freeze([...set].sort());
}

function buildAntecedents(parent) {
  const states = stateCube();
  const policyBySchedule = new Map(parent.policy_geometry.map(row => [row.schedule_id, row]));
  const antecedents = [];
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    const policy = policyBySchedule.get(id);
    if (!policy) throw new Error(`missing inherited policy geometry for ${id}`);
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
        replay_required: policy.replay_required,
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
  throw new Error(`unknown admissibility-horizon claim: ${claim}`);
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

function supportAtlas(stageFibres) {
  const profiles = new Map();
  for (const stage of STAGES) {
    for (const [key, fibre] of stageFibres.get(stage).entries()) {
      for (const claim of CLAIMS) {
        const union = new Set(fibre.antecedents.map(antecedent => canonical(claimValue(claim, antecedent))));
        const intersection = union.size === 1 ? new Set(union) : new Set();
        const gamma = new Set([...union].filter(value => !intersection.has(value)));
        profiles.set(`${stage}|${key}|${claim}`, freeze({
          stage,
          quotient_key: key,
          claim,
          fibre_size: fibre.antecedents.length,
          member_ids: freeze(fibre.antecedents.map(antecedent => antecedent.id)),
          union: frozenSortedSet(union),
          intersection: frozenSortedSet(intersection),
          gamma: frozenSortedSet(gamma),
          union_cardinality: union.size,
          intersection_cardinality: intersection.size,
          gamma_cardinality: gamma.size,
          exact: gamma.size === 0,
        }));
      }
    }
  }
  return profiles;
}

function targetProfile(stageFibres, profiles, stage, antecedent, claim) {
  const key = canonical(quotientValue(stage, antecedent));
  if (!stageFibres.get(stage).has(key)) throw new Error('target quotient missing from finite fibre atlas');
  const profile = profiles.get(`${stage}|${key}|${claim}`);
  if (!profile) throw new Error('target support profile missing from finite support atlas');
  return profile;
}

function cellAuthorization(stageFibres, profiles, antecedents) {
  const bySchedule = new Map();
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    const targets = antecedents.filter(antecedent => antecedent.schedule_id === id);
    const claimRows = [];
    for (const claim of CLAIMS) {
      const cells = STAGES.map(stage => freeze({
        stage,
        authorized: targets.every(target => targetProfile(stageFibres, profiles, stage, target, claim).exact),
      }));
      const birthCell = cells.find(cell => cell.authorized);
      claimRows.push(freeze({
        claim,
        birth: birthCell?.stage ?? 'INF',
        cells: freeze(cells),
      }));
    }
    bySchedule.set(id, freeze({ schedule_id: id, claim_rows: freeze(claimRows) }));
  }
  return bySchedule;
}

function ledgerCertificate(cellAtlas, stageFibres, profiles, antecedents) {
  const stageRows = STAGES.map(stage => {
    let authorized = 0;
    for (const scheduleRow of cellAtlas.values()) {
      for (const claimRow of scheduleRow.claim_rows) {
        if (claimRow.cells.find(cell => cell.stage === stage)?.authorized) authorized += 1;
      }
    }
    return freeze({ stage, authorized, held: 42 - authorized });
  });

  let eventuallyAuthorizedEarlierHeld = 0;
  let neverAuthorizedCells = 0;
  for (const scheduleRow of cellAtlas.values()) {
    for (const claimRow of scheduleRow.claim_rows) {
      for (const cell of claimRow.cells) {
        if (cell.authorized) continue;
        if (claimRow.birth === 'INF') neverAuthorizedCells += 1;
        else if (cell.stage < claimRow.birth) eventuallyAuthorizedEarlierHeld += 1;
      }
    }
  }

  const representative = antecedents[0];
  const nullWounds = freeze(Object.fromEntries(CLAIMS.map(claim => [
    claim,
    targetProfile(stageFibres, profiles, 0, representative, claim).gamma_cardinality,
  ])));
  const totalAuthorized = stageRows.reduce((sum, row) => sum + row.authorized, 0);
  const totalHeld = stageRows.reduce((sum, row) => sum + row.held, 0);
  const exact = same(stageRows.map(row => row.authorized), EXPECTED_STAGE_AUTHORIZED)
    && same(stageRows.map(row => row.held), EXPECTED_STAGE_HELD)
    && totalAuthorized === 68
    && totalHeld === 100
    && eventuallyAuthorizedEarlierHeld === 52
    && neverAuthorizedCells === 48
    && same(nullWounds, EXPECTED_NULL_WOUNDS);
  return freeze({
    stage_rows: freeze(stageRows),
    total_authorized_cells: totalAuthorized,
    total_held_cells: totalHeld,
    eventually_authorized_earlier_held_cells: eventuallyAuthorizedEarlierHeld,
    never_authorized_cells: neverAuthorizedCells,
    null_stage_wound_cardinalities: nullWounds,
    exact,
  });
}

function refinementCertificate(stageFibres, profiles, antecedents) {
  let checked = 0;
  let strict = 0;
  let equal = 0;
  let violations = 0;
  let fibreNestingViolations = 0;
  for (const antecedent of antecedents) {
    for (const claim of CLAIMS) {
      for (let stage = 0; stage < 3; stage += 1) {
        const coarse = targetProfile(stageFibres, profiles, stage, antecedent, claim);
        const fine = targetProfile(stageFibres, profiles, stage + 1, antecedent, claim);
        const coarseMembers = new Set(coarse.member_ids);
        const fineMembers = new Set(fine.member_ids);
        const coarseUnion = new Set(coarse.union);
        const fineUnion = new Set(fine.union);
        const coarseIntersection = new Set(coarse.intersection);
        const fineIntersection = new Set(fine.intersection);
        const coarseGamma = new Set(coarse.gamma);
        const fineGamma = new Set(fine.gamma);
        checked += 1;
        const nested = setSubset(fineMembers, coarseMembers);
        const unionContracted = setSubset(fineUnion, coarseUnion);
        const intersectionExpanded = setSubset(coarseIntersection, fineIntersection);
        const gammaContracted = setSubset(fineGamma, coarseGamma);
        if (!nested) fibreNestingViolations += 1;
        if (!(nested && unionContracted && intersectionExpanded && gammaContracted)) {
          violations += 1;
        } else if (setSame(fineGamma, coarseGamma)) {
          equal += 1;
        } else {
          strict += 1;
        }
      }
    }
  }
  return freeze({
    target_indexed_checks: checked,
    strict_gamma_contractions: strict,
    equal_gamma_transitions: equal,
    fibre_nesting_violations: fibreNestingViolations,
    refinement_violations: violations,
    exact: checked === 15750
      && strict === 6800
      && equal === 8950
      && fibreNestingViolations === 0
      && violations === 0,
  });
}

function recompressionCertificate(cellAtlas, stageFibres, profiles, antecedents) {
  const targetsBySchedule = new Map();
  for (const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const id = scheduleId(schedule);
    targetsBySchedule.set(id, antecedents.filter(antecedent => antecedent.schedule_id === id));
  }

  const reopenedByClaim = Object.fromEntries(CLAIMS.map(claim => [claim, 0]));
  const preservedByClaim = Object.fromEntries(CLAIMS.map(claim => [claim, 0]));
  const transitions = [];
  let transitionCount = 0;
  let reopened = 0;
  let preserved = 0;
  let reopenedStateChecks = 0;
  let preservedStateChecks = 0;
  let membraneViolations = 0;
  let fineAuthorityViolations = 0;

  for (const scheduleRow of cellAtlas.values()) {
    const targets = targetsBySchedule.get(scheduleRow.schedule_id);
    for (const claimRow of scheduleRow.claim_rows) {
      for (let fineStage = 1; fineStage <= 3; fineStage += 1) {
        const fineAuthorized = claimRow.cells.find(cell => cell.stage === fineStage)?.authorized === true;
        if (!fineAuthorized) continue;
        for (let coarseStage = 0; coarseStage < fineStage; coarseStage += 1) {
          transitionCount += 1;
          const coarseAuthorized = claimRow.cells.find(cell => cell.stage === coarseStage)?.authorized === true;
          const kind = coarseAuthorized ? 'PRESERVED' : 'REOPENED';
          if (coarseAuthorized) {
            preserved += 1;
            preservedByClaim[claimRow.claim] += 1;
          } else {
            reopened += 1;
            reopenedByClaim[claimRow.claim] += 1;
          }
          let stateChecks = 0;
          let firstWitness = null;
          for (const target of targets) {
            const fine = targetProfile(stageFibres, profiles, fineStage, target, claimRow.claim);
            const coarse = targetProfile(stageFibres, profiles, coarseStage, target, claimRow.claim);
            stateChecks += 1;
            if (!fine.exact) fineAuthorityViolations += 1;
            const coarseConstant = coarse.exact;
            if (coarseConstant !== coarseAuthorized) membraneViolations += 1;
            if (!firstWitness && !coarse.exact) {
              firstWitness = freeze({
                target_id: target.id,
                fine_stage: fineStage,
                coarse_stage: coarseStage,
                fine_gamma_cardinality: fine.gamma_cardinality,
                coarse_gamma_cardinality: coarse.gamma_cardinality,
              });
            }
          }
          if (kind === 'REOPENED') reopenedStateChecks += stateChecks;
          else preservedStateChecks += stateChecks;
          transitions.push(freeze({
            schedule_id: scheduleRow.schedule_id,
            claim: claimRow.claim,
            fine_stage: fineStage,
            coarse_stage: coarseStage,
            result: kind,
            state_checks: stateChecks,
            coarse_claim_constant_on_every_target_fibre: coarseAuthorized,
            witness: firstWitness,
          }));
        }
      }
    }
  }

  const exact = transitionCount === 152
    && reopened === 100
    && preserved === 52
    && reopenedStateChecks === 12500
    && preservedStateChecks === 6500
    && reopenedStateChecks + preservedStateChecks === 19000
    && same(reopenedByClaim, EXPECTED_REOPEN_BY_CLAIM)
    && same(preservedByClaim, EXPECTED_PRESERVE_BY_CLAIM)
    && membraneViolations === 0
    && fineAuthorityViolations === 0;

  return freeze({
    fine_authorized_ordered_transitions: transitionCount,
    reopened_transitions: reopened,
    preserved_transitions: preserved,
    reopened_by_claim: freeze(reopenedByClaim),
    preserved_by_claim: freeze(preservedByClaim),
    reopened_state_indexed_checks: reopenedStateChecks,
    preserved_state_indexed_checks: preservedStateChecks,
    total_state_indexed_checks: reopenedStateChecks + preservedStateChecks,
    claim_constancy_membrane_violations: membraneViolations,
    fine_authority_violations: fineAuthorityViolations,
    transitions: freeze(transitions),
    exact,
  });
}

export function admissibilityHorizonRefinementRecompressionRuptureCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  const built = buildAntecedents(parent);
  const stageFibres = fibreAtlas(built.antecedents);
  const profiles = supportAtlas(stageFibres);
  const cells = cellAuthorization(stageFibres, profiles, built.antecedents);
  const ledger = ledgerCertificate(cells, stageFibres, profiles, built.antecedents);
  const refinement = refinementCertificate(stageFibres, profiles, built.antecedents);
  const recompression = recompressionCertificate(cells, stageFibres, profiles, built.antecedents);
  const passed = parent.passed
    && built.states.length === 125
    && built.antecedents.length === 750
    && cells.size === 6
    && ledger.exact
    && refinement.exact
    && recompression.exact;

  cachedCertificate = freeze({
    schema: ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_SCHEMA,
    parent_receipt: ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_PARENT_RECEIPT,
    finite_domain: freeze({
      schedules: 6,
      states: built.states.length,
      antecedents: built.antecedents.length,
      claim_families: CLAIMS.length,
      stages: STAGES.length,
      schedule_claim_chains: 42,
      jurisdiction_cells: 168,
    }),
    stages: freeze(['q0_NULL_REGISTERED_TRACE', 'q1_PREFIX_ONE', 'q2_PREFIX_TWO', 'q3_PREFIX_THREE']),
    claims: CLAIMS,
    ledger_certificate: ledger,
    refinement_persistence_certificate: refinement,
    recompression_rupture_certificate: recompression,
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_S3_AIA_FIXTURE_GENUINE_REGISTERED_PREFIX_REFINEMENT_MONOTONICALLY_CONTRACTS_EACH_TARGET_INDEXED_FADT_ADMISSIBILITY_GAP_SO_ONCE_EXACT_CLAIM_AUTHORITY_IS_BORN_NO_LATER_PREFIX_REFINEMENT_REOPENS_THAT_WOUND',
      'THE_COMPLETE_SEVEN_CLAIM_FOUR_STAGE_ATLAS_CONTAINS_15750_TARGET_INDEXED_NESTED_FIBRE_COMPARISONS_WITH_6800_STRICT_GAP_CONTRACTIONS_8950_EQUAL_GAP_TRANSITIONS_AND_ZERO_REFINEMENT_VIOLATIONS',
      'A_CLAIM_THAT_WAS_EXACTLY_AUTHORIZED_ON_A_FINER_REGISTERED_REPRESENTATION_CAN_LOSE_PRESENT_REPRESENTATION_AUTHORITY_AFTER_LOSSY_RECOMPRESSION_TO_AN_EARLIER_COARSER_STAGE_WITHOUT_CHANGING_SOURCE_TRUTH_PRIOR_AUTHORITY_HISTORY_OR_THE_FINE_RECORD_THAT_ONCE_SUPPORTED_IT',
      'AMONG_ALL_152_FINE_AUTHORIZED_ORDERED_RECOMPRESSIONS_IN_THE_FIXED_ATLAS_EXACTLY_100_REOPEN_A_NONEMPTY_FADT_WOUND_AND_52_PRESERVE_EXACT_AUTHORITY_SO_RECOMPRESSION_RUPTURE_IS_CLAIM_AND_FIBRE_RELATIVE_NOT_AUTOMATIC',
      'EVER_KNOWN_DOES_NOT_IMPLY_STILL_AUTHORIZED_AFTER_RECOMPRESSION_IN_THE_FIXED_FINITE_FIXTURE',
    ] : []),
    scars: freeze([
      'REFINEMENT_PERSISTENCE != RECOMPRESSION_PERSISTENCE',
      'EVER_KNOWN != STILL_AUTHORIZED_AFTER_RECOMPRESSION',
      'RECOMPRESSION_CAN_REOPEN_AUTHORITY != RECOMPRESSION_MUST_REOPEN_AUTHORITY',
      'RECOMPRESSION != SOURCE_STATE_DELETION',
      'RECOMPRESSION != SOURCE_TRUTH_REVERSAL',
      'PRESENT_REPRESENTATION_AUTHORITY != HISTORICAL_AUTHORITY_EVENT',
      'PRIOR_AUTHORITY_EVENT != CURRENT_CLAIM_LICENSE',
      'NULL_REGISTERED_TRACE != ABSENT_SOURCE_STATE',
      'NULL_REGISTERED_TRACE != UNOBSERVED_PHYSICAL_WORLD',
      'GAP_CONTRACTION != ENTROPY_MONOTONICITY',
      'STRICT_REFINEMENT != NECESSARILY_STRICT_GAP_CONTRACTION',
      'FADT_FINITE_SET_MONOTONICITY != TD613_GENERIC_NOVELTY_CLAIM',
      'RECOMPRESSION_RUPTURE != DATA_DELETION_THEOREM',
      'RECOMPRESSION_RUPTURE != DATABASE_TRANSACTION_ROLLBACK',
      'RECOMPRESSION_RUPTURE != MEMORY_ERASURE_AT_SOURCE',
      'CLAIM_AUTHORITY != ONTOLOGICAL_TRUTH',
      'FINITE_FOUR_STAGE_ATLAS != UNIVERSAL_AI_MEMORY_THEOREM',
      'FINITE_FOUR_STAGE_ATLAS != ASYMPTOTIC_INFORMATION_THEOREM',
    ]),
  });
  return cachedCertificate;
}

export function compileAdmissibilityHorizonRefinementRecompressionProjection(receiver) {
  const certificate = admissibilityHorizonRefinementRecompressionRuptureCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified admissibility-horizon recompression result');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.admissibility-horizon-recompression-child-legible/v0.1',
      truths: freeze([
        'WHEN_WE_KEEP_A_FINER_RECORD_A_CLAIM_THAT_BECOMES_SAFE_STAYS_SAFE_THROUGH_LATER_PREFIXES',
        'IF_WE_LATER_KEEP_ONLY_A_COARSER_RECORD_SOME_PREVIOUSLY_SAFE_CLAIMS_CAN_LOSE_CURRENT_RECORD_SUPPORT',
        'THE_OLDER_FINE_RECORD_AND_SOURCE_FACTS_ARE_NOT_REWRITTEN_BY_THAT_COARSENING',
        'SOME_RECOMPRESSIONS_PRESERVE_CLAIM_SUPPORT_SO_COARSENING_DOES_NOT_ALWAYS_REOPEN_A_WOUND',
      ]),
      latent_state_values_exposed: false,
      complete_fibre_table_exposed: false,
      recompression_witness_table_exposed: false,
      source_mutation_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.admissibility-horizon-recompression-loom-technical/v0.1',
      stage_authorized_counts: freeze(certificate.ledger_certificate.stage_rows.map(row => row.authorized)),
      stage_held_counts: freeze(certificate.ledger_certificate.stage_rows.map(row => row.held)),
      refinement_checks: certificate.refinement_persistence_certificate.target_indexed_checks,
      strict_gamma_contractions: certificate.refinement_persistence_certificate.strict_gamma_contractions,
      equal_gamma_transitions: certificate.refinement_persistence_certificate.equal_gamma_transitions,
      recompression_transitions: certificate.recompression_rupture_certificate.fine_authorized_ordered_transitions,
      reopened_transitions: certificate.recompression_rupture_certificate.reopened_transitions,
      preserved_transitions: certificate.recompression_rupture_certificate.preserved_transitions,
      complete_fibre_table_exposed: false,
      recompression_witness_table_exposed: false,
      latent_state_values_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for admissibility-horizon recompression: ${receiver}`);
  }
  return freeze({
    schema: ADMISSIBILITY_HORIZON_REFINEMENT_RECOMPRESSION_RUPTURE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    claim_ceiling: freeze({
      bounded_four_stage_fadt_atlas: true,
      universal_ai_memory_theorem: false,
      general_database_theorem: false,
      shannon_or_entropy_theorem: false,
      asymptotic_information_theorem: false,
      physical_sensing_claim: false,
      source_state_mutation: false,
      autonomous_deletion_authority: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectAdmissibilityHorizonRecompressionOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_ai_memory_theorem === true
    || ceiling.general_database_theorem === true
    || ceiling.shannon_or_entropy_theorem === true
    || ceiling.asymptotic_information_theorem === true
    || ceiling.physical_sensing_claim === true
    || ceiling.source_state_mutation === true
    || ceiling.autonomous_deletion_authority === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const falsePersistence = candidate?.recompression_never_reopens_authority === true
    || candidate?.recompression_always_reopens_authority === true
    || candidate?.prior_authority_implies_current_authority === true
    || candidate?.fine_record_authority_backfills_coarse_record === true;
  const sourceConfusion = candidate?.recompression_deletes_source_state === true
    || candidate?.recompression_reverses_source_truth === true
    || candidate?.null_registered_trace_means_absent_source === true
    || candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.latent_state_values_exposed === true
    || candidate?.payload?.complete_fibre_table_exposed === true
    || candidate?.payload?.recompression_witness_table_exposed === true
    || candidate?.payload?.source_mutation_exposed === true
  );
  return freeze({
    accepted: !authority && !overreach && !falsePersistence && !sourceConfusion && !runtime && !ashLeak,
  });
}
