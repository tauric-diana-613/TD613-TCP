import { computeChamberIIStructure, S_BLOCKS } from './structured-probe-design-chamber-ii.js';
import { C_BLOCKS, Q_BLOCKS, TASK_FAMILY } from './task-conditioned-anchor-star.js';

export const ONE_BIT_REPLAY_SCHEMA = 'td613.pedagogue.replay-stable-task-code-one-bit/v0.1';

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

function hamming(left, right) {
  if (left.length !== right.length) throw new TypeError('signatures must have equal length');
  let distance = 0;
  for (let i = 0; i < left.length; i += 1) if (left[i] !== right[i]) distance += 1;
  return distance;
}

function flipBit(signature, index) {
  if (!Number.isInteger(index) || index < 0 || index >= signature.length) throw new RangeError('bit index out of range');
  const flipped = signature[index] === '0' ? '1' : '0';
  return signature.slice(0, index) + flipped + signature.slice(index + 1);
}

export function runOneBitReplayFamily(blocks, taskPairs = TASK_FAMILY) {
  const structure = computeChamberIIStructure(blocks);
  const codebook = Object.fromEntries(taskPairs.map((pair) => [pair, structure.pair_signature_ledger[pair]]));
  const cases = [];
  for (const truePair of taskPairs) {
    const cleanSignature = codebook[truePair];
    for (let bit = 0; bit < cleanSignature.length; bit += 1) {
      const corruptedSignature = flipBit(cleanSignature, bit);
      const distances = Object.fromEntries(taskPairs.map((candidate) => [candidate, hamming(corruptedSignature, codebook[candidate])]));
      const nearestDistance = Math.min(...Object.values(distances));
      const nearestCandidateSet = taskPairs.filter((candidate) => distances[candidate] === nearestDistance);
      const uniqueNearest = nearestCandidateSet.length === 1;
      const selectedPair = uniqueNearest ? nearestCandidateSet[0] : null;
      const truePairInNearestSet = nearestCandidateSet.includes(truePair);
      const outcomeClass = uniqueNearest
        ? (selectedPair === truePair ? 'UNIQUE_CORRECT' : 'UNIQUE_WRONG')
        : (truePairInNearestSet ? 'AMBIGUOUS_WITH_TRUTH' : 'AMBIGUOUS_WITHOUT_TRUTH');
      cases.push(freeze({
        true_pair: truePair,
        clean_signature: cleanSignature,
        corruption_bit_index: bit,
        corruption_direction: `${cleanSignature[bit]}->${corruptedSignature[bit]}`,
        corrupted_signature: corruptedSignature,
        nearest_distance: nearestDistance,
        nearest_candidate_set: nearestCandidateSet,
        unique_nearest: uniqueNearest,
        selected_pair: selectedPair,
        true_pair_in_nearest_set: truePairInNearestSet,
        outcome_class: outcomeClass
      }));
    }
  }
  const count = (label) => cases.filter((item) => item.outcome_class === label).length;
  const nearestDistances = cases.map((item) => item.nearest_distance);
  return freeze({
    case_count: cases.length,
    cases,
    unique_correct_count: count('UNIQUE_CORRECT'),
    unique_wrong_count: count('UNIQUE_WRONG'),
    ambiguous_with_truth_count: count('AMBIGUOUS_WITH_TRUTH'),
    ambiguous_without_truth_count: count('AMBIGUOUS_WITHOUT_TRUTH'),
    true_pair_in_nearest_set_count: cases.filter((item) => item.true_pair_in_nearest_set).length,
    mean_nearest_distance: nearestDistances.reduce((sum, value) => sum + value, 0) / nearestDistances.length,
    maximum_nearest_distance: Math.max(...nearestDistances),
    rng_used: false,
    oracle_tie_break_used: false
  });
}

export function compileOneBitReplayStabilityReceipt({ scienceHead }) {
  const U = runOneBitReplayFamily(S_BLOCKS);
  const C = runOneBitReplayFamily(C_BLOCKS);
  const Q = runOneBitReplayFamily(Q_BLOCKS);
  return freeze({
    schema: ONE_BIT_REPLAY_SCHEMA,
    stage: 'EXHAUSTIVE_ONE_BIT_TASK_CODE_REPLAY',
    science_head: exactHead(scienceHead),
    clean_baseline: {
      U: { exact: 0, total: 8 },
      C: { exact: 8, total: 8 },
      Q: { exact: 4, total: 8 }
    },
    arms: { U, C, Q },
    corrupted_outcome_vector: {
      U: { unique_correct: U.unique_correct_count, unique_wrong: U.unique_wrong_count, ambiguous_with_truth: U.ambiguous_with_truth_count, ambiguous_without_truth: U.ambiguous_without_truth_count },
      C: { unique_correct: C.unique_correct_count, unique_wrong: C.unique_wrong_count, ambiguous_with_truth: C.ambiguous_with_truth_count, ambiguous_without_truth: C.ambiguous_without_truth_count },
      Q: { unique_correct: Q.unique_correct_count, unique_wrong: Q.unique_wrong_count, ambiguous_with_truth: Q.ambiguous_with_truth_count, ambiguous_without_truth: Q.ambiguous_without_truth_count }
    },
    bounded_relations: {
      clean_task_preference_survives_one_bit_replay_family: C.unique_correct_count > Q.unique_correct_count && Q.unique_correct_count > U.unique_correct_count,
      clean_task_preference_weakens_under_one_bit_replay_family: C.unique_correct_count < 96,
      positive_minimum_code_distance_does_not_establish_one_bit_correctability: C.ambiguous_with_truth_count > 0,
      no_unique_wrong_cases_in_authored_one_bit_family: [U,C,Q].every((arm) => arm.unique_wrong_count === 0),
      oracle_tie_break_never_used: [U,C,Q].every((arm) => arm.oracle_tie_break_used === false)
    },
    scalar_winner: null,
    universal_replay_stability_claim: false,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
