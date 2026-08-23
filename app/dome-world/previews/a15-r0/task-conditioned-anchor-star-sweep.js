import { S_BLOCKS, computeChamberIIStructure } from './structured-probe-design-chamber-ii.js';
import { C_BLOCKS, Q_BLOCKS, TASK_FAMILY } from './task-conditioned-anchor-star.js';

export const TASK_CONDITIONED_SWEEP_SCHEMA = 'td613.pedagogue.task-conditioned-anchor-star.detection-localization/v0.1';
const REPLICATES_PER_PROBE = 25;
const ACTIVE_COUNT_IF_PRESENT = 20;
const ACTIVE_COUNT_IF_ABSENT = 5;
const THRESHOLD = 0.5;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function exactHead(value) {
  const head = String(value ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(head)) throw new TypeError('scienceHead must be an exact 40-character Git SHA');
  return head;
}

function blockContainsPair(block, pair) {
  return block.includes(pair[0]) && block.includes(pair[1]);
}

export function runTaskConditionedPairSweep(blocks, taskPairs = TASK_FAMILY) {
  const structure = computeChamberIIStructure(blocks);
  const cases = taskPairs.map((pair) => {
    const blockObservations = blocks.map((block, index) => {
      const present = blockContainsPair(block, pair);
      const activeCount = present ? ACTIVE_COUNT_IF_PRESENT : ACTIVE_COUNT_IF_ABSENT;
      const empiricalRate = activeCount / REPLICATES_PER_PROBE;
      return freeze({
        block_index: index,
        block,
        pair_present: present,
        active_count: activeCount,
        inactive_count: REPLICATES_PER_PROBE - activeCount,
        empirical_active_rate: empiricalRate,
        decoded_active: empiricalRate >= THRESHOLD
      });
    });
    const observedSignature = blockObservations.map((item) => item.decoded_active ? '1' : '0').join('');
    const frozenSignature = structure.pair_signature_ledger[pair];
    const candidateSet = taskPairs.filter((candidate) => structure.pair_signature_ledger[candidate] === observedSignature);
    const detected = observedSignature.includes('1');
    return freeze({
      target_pair: pair,
      observed_signature: observedSignature,
      frozen_signature: frozenSignature,
      signature_matches_frozen_structure: observedSignature === frozenSignature,
      detected,
      task_localization_candidate_set: candidateSet,
      exact_task_localization: detected && candidateSet.length === 1,
      block_observations: blockObservations,
      micro_observation_count: blocks.length * REPLICATES_PER_PROBE
    });
  });
  const detected = cases.filter((item) => item.detected);
  const exact = cases.filter((item) => item.exact_task_localization);
  const ambiguous = cases.filter((item) => item.detected && !item.exact_task_localization);
  const missed = cases.filter((item) => !item.detected);
  return freeze({
    deterministic_fixture: {
      replicates_per_probe: REPLICATES_PER_PROBE,
      present_counts: { active: ACTIVE_COUNT_IF_PRESENT, inactive: 5 },
      absent_counts: { active: ACTIVE_COUNT_IF_ABSENT, inactive: 20 },
      threshold: THRESHOLD,
      rng_used: false
    },
    task_pairs: [...taskPairs],
    cases,
    detected_count: detected.length,
    exactly_localized_count: exact.length,
    ambiguous_detected_count: ambiguous.length,
    missed_count: missed.length,
    detected_pairs: detected.map((item) => item.target_pair),
    exactly_localized_pairs: exact.map((item) => item.target_pair),
    missed_pairs: missed.map((item) => item.target_pair),
    every_observed_signature_matches_frozen_structure: cases.every((item) => item.signature_matches_frozen_structure),
    total_micro_observations_per_case: blocks.length * REPLICATES_PER_PROBE
  });
}

export function compileTaskConditionedDetectionLocalizationReceipt({ scienceHead }) {
  const U = runTaskConditionedPairSweep(S_BLOCKS);
  const C = runTaskConditionedPairSweep(C_BLOCKS);
  const Q = runTaskConditionedPairSweep(Q_BLOCKS);
  return freeze({
    schema: TASK_CONDITIONED_SWEEP_SCHEMA,
    stage: 'TASK_CONDITIONED_B_STAR_DETERMINISTIC_SWEEP',
    science_head: exactHead(scienceHead),
    perturbation_law_frozen_before_execution: true,
    candidate_universe_restricted_to_predeclared_task_family: true,
    arms: { U, C, Q },
    outcome_vector: {
      U: { detected: U.detected_count, exact: U.exactly_localized_count, ambiguous: U.ambiguous_detected_count, missed: U.missed_count },
      C: { detected: C.detected_count, exact: C.exactly_localized_count, ambiguous: C.ambiguous_detected_count, missed: C.missed_count },
      Q: { detected: Q.detected_count, exact: Q.exactly_localized_count, ambiguous: Q.ambiguous_detected_count, missed: Q.missed_count }
    },
    bounded_relations: {
      task_conditioned_holdout_reproduces_structural_localization_gain: C.exactly_localized_count === 8 && U.exactly_localized_count === 0,
      equal_exposure_hostile_control_reproduces_code_gap: C.exactly_localized_count > Q.exactly_localized_count && Q.exactly_localized_count === 4,
      focal_exposure_alone_is_insufficient: C.exactly_localized_count > Q.exactly_localized_count,
      deterministic_sweep_matches_frozen_signatures: [U,C,Q].every((arm) => arm.every_observed_signature_matches_frozen_structure)
    },
    scalar_winner: null,
    universal_optimality_claim: false,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
