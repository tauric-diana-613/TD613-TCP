import {
  A_BLOCKS,
  H_BLOCKS,
  S_BLOCKS,
  computeChamberIIStructure
} from './structured-probe-design-chamber-ii.js';

export const CHAMBER_II_SWEEP_SCHEMA = 'td613.pedagogue.structured-probe-coverage.chamber-ii-detection-localization/v0.1';
export const BASELINE_SOURCE_PACKET = '721de28a8ef4d160e87d46bc1e9107bd249a0db0';
export const BASELINE_RELOCK_SHA = '153f0a69a23ab7e665f2386a51406821b62be01d';
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

function allPairs() {
  const channels = ['A','B','C','D','E','F','G','H','I'];
  const pairs = [];
  for (let i = 0; i < channels.length; i += 1) {
    for (let j = i + 1; j < channels.length; j += 1) pairs.push(`${channels[i]}${channels[j]}`);
  }
  return pairs;
}

function blockContainsPair(block, pair) {
  return block.includes(pair[0]) && block.includes(pair[1]);
}

export function runChamberIIPairSweep(blocks) {
  const structure = computeChamberIIStructure(blocks);
  const pairs = allPairs();
  const cases = pairs.map((pair) => {
    const block_observations = blocks.map((block, index) => {
      const pairPresent = blockContainsPair(block, pair);
      const activeCount = pairPresent ? ACTIVE_COUNT_IF_PRESENT : ACTIVE_COUNT_IF_ABSENT;
      const inactiveCount = REPLICATES_PER_PROBE - activeCount;
      const empiricalRate = activeCount / REPLICATES_PER_PROBE;
      return freeze({
        block_index: index,
        block,
        pair_present: pairPresent,
        active_count: activeCount,
        inactive_count: inactiveCount,
        empirical_active_rate: empiricalRate,
        decoded_active: empiricalRate >= THRESHOLD
      });
    });
    const observedSignature = block_observations.map((item) => item.decoded_active ? '1' : '0').join('');
    const detected = observedSignature.includes('1');
    const candidateSet = pairs.filter((candidate) => structure.pair_signature_ledger[candidate] === observedSignature);
    return freeze({
      target_pair: pair,
      observed_signature: observedSignature,
      frozen_signature: structure.pair_signature_ledger[pair],
      signature_matches_frozen_structure: observedSignature === structure.pair_signature_ledger[pair],
      detected,
      localization_candidate_set: candidateSet,
      exact_localization: detected && candidateSet.length === 1,
      block_observations,
      micro_observation_count: blocks.length * REPLICATES_PER_PROBE
    });
  });

  const detected = cases.filter((item) => item.detected);
  const exact = cases.filter((item) => item.exact_localization);
  const ambiguous = cases.filter((item) => item.detected && !item.exact_localization);
  const missed = cases.filter((item) => !item.detected);
  return freeze({
    deterministic_fixture: {
      replicates_per_probe: REPLICATES_PER_PROBE,
      present_counts: { active: ACTIVE_COUNT_IF_PRESENT, inactive: REPLICATES_PER_PROBE - ACTIVE_COUNT_IF_PRESENT },
      absent_counts: { active: ACTIVE_COUNT_IF_ABSENT, inactive: REPLICATES_PER_PROBE - ACTIVE_COUNT_IF_ABSENT },
      threshold: THRESHOLD,
      rng_used: false
    },
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

export function compileChamberIIDetectionLocalizationReceipt({ scienceHead }) {
  const S = runChamberIIPairSweep(S_BLOCKS);
  const A = runChamberIIPairSweep(A_BLOCKS);
  const H = runChamberIIPairSweep(H_BLOCKS);
  return freeze({
    schema: CHAMBER_II_SWEEP_SCHEMA,
    stage: 'CHAMBER_II_DETERMINISTIC_36_PAIR_SWEEP',
    science_head: exactHead(scienceHead),
    baseline_source_packet: BASELINE_SOURCE_PACKET,
    baseline_relock_sha: BASELINE_RELOCK_SHA,
    perturbation_law_frozen_before_execution: true,
    arms: { S, A, H },
    outcome_vector: {
      S: { detected: S.detected_count, exact: S.exactly_localized_count, ambiguous: S.ambiguous_detected_count, missed: S.missed_count },
      A: { detected: A.detected_count, exact: A.exactly_localized_count, ambiguous: A.ambiguous_detected_count, missed: A.missed_count },
      H: { detected: H.detected_count, exact: H.exactly_localized_count, ambiguous: H.ambiguous_detected_count, missed: H.missed_count }
    },
    bounded_relations: {
      controlled_incidence_maximizes_declared_pair_coverage_in_authored_fixture: S.detected_count === 36 && S.detected_count > A.detected_count && A.detected_count > H.detected_count,
      point_marginal_balance_is_insufficient_for_target_pair_coverage: H.missed_count === 10,
      complete_coverage_does_not_guarantee_exact_source_localization: S.detected_count === 36 && S.exactly_localized_count === 0,
      coverage_localization_inversion_present: S.detected_count > H.detected_count && S.exactly_localized_count < H.exactly_localized_count,
      multi_objective_design_tradeoff_preserved: true
    },
    scalar_winner: null,
    universal_optimality_claim: false,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
