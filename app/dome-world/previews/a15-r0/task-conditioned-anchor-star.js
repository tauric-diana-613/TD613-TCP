import { computeChamberIIStructure, S_BLOCKS } from './structured-probe-design-chamber-ii.js';

export const TASK_CONDITIONED_SCHEMA = 'td613.pedagogue.task-conditioned-anchor-star.structural/v0.1';
export const TASK_FAMILY = Object.freeze(['AB','BC','BD','BE','BF','BG','BH','BI']);
export const C_BLOCKS = Object.freeze(['ABC','BCD','BDE','BEF','BFG','BGH','BHI','ABI','DEF','GHI','ADG','CFI']);
export const Q_BLOCKS = Object.freeze(['ABC','BDE','BFG','BFH','BFI','BGH','BGI','BHI','DEF','GHI','ADG','CFI']);
export const BASELINE_SOURCE_PACKET = '721de28a8ef4d160e87d46bc1e9107bd249a0db0';
export const BASELINE_RELOCK_SHA = '153f0a69a23ab7e665f2386a51406821b62be01d';

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

function taskExposure(blocks) {
  const anchorBlockCount = blocks.filter((block) => block.includes('B')).length;
  return freeze({
    anchor: 'B',
    anchor_block_count: anchorBlockCount,
    task_incidence_slots: anchorBlockCount * 2
  });
}

export function computeTaskFamilyGeometry(structure, taskPairs = TASK_FAMILY) {
  const signatures = Object.fromEntries(taskPairs.map((pair) => [pair, structure.pair_signature_ledger[pair]]));
  const groups = new Map();
  for (const pair of taskPairs) {
    const signature = signatures[pair];
    groups.set(signature, [...(groups.get(signature) ?? []), pair]);
  }
  const detected = taskPairs.filter((pair) => signatures[pair].includes('1'));
  const exact = detected.filter((pair) => groups.get(signatures[pair]).length === 1);
  const ambiguous = detected.filter((pair) => groups.get(signatures[pair]).length > 1);
  const collisionGroups = [...groups.values()].filter((items) => items.length > 1).map((items) => [...items]);
  const distances = [];
  for (let i = 0; i < taskPairs.length; i += 1) {
    for (let j = i + 1; j < taskPairs.length; j += 1) distances.push(hamming(signatures[taskPairs[i]], signatures[taskPairs[j]]));
  }
  const mean = distances.reduce((sum, value) => sum + value, 0) / distances.length;
  return freeze({
    task_pairs: [...taskPairs],
    task_pair_count: taskPairs.length,
    task_signature_ledger: signatures,
    task_signature_weights: Object.fromEntries(taskPairs.map((pair) => [pair, signatures[pair].split('').filter((bit) => bit === '1').length])),
    task_detected_count: detected.length,
    task_exact_localization_count: exact.length,
    task_exact_localization_pairs: exact,
    task_ambiguous_detected_count: ambiguous.length,
    task_signature_collision_groups: collisionGroups,
    task_distinct_signature_count: groups.size,
    minimum_pairwise_task_signature_hamming_distance: Math.min(...distances),
    mean_pairwise_task_signature_hamming_distance: Number(mean.toFixed(15))
  });
}

function arm(blocks) {
  const global = computeChamberIIStructure(blocks);
  return freeze({
    exposure: taskExposure(blocks),
    task: computeTaskFamilyGeometry(global),
    global: {
      blocks: global.blocks,
      unique_block_count: global.unique_block_count,
      point_degree_vector: global.point_degree_vector,
      point_degree_variance: global.point_degree_variance,
      covered_pair_count: global.covered_pair_count,
      uncovered_pair_count: global.uncovered_pair_count,
      uncovered_pairs: global.uncovered_pairs,
      pair_duplicate_excess: global.pair_duplicate_excess,
      maximum_pair_multiplicity: global.maximum_pair_multiplicity,
      row_rank: global.row_rank,
      row_space_condition_number: global.row_space_condition_number,
      uniquely_localizable_pair_count: global.uniquely_localizable_pair_count,
      uniquely_localizable_pairs: global.uniquely_localizable_pairs
    }
  });
}

export function compileTaskConditionedStructuralReceipt({ scienceHead }) {
  const U = arm(S_BLOCKS);
  const C = arm(C_BLOCKS);
  const Q = arm(Q_BLOCKS);
  const exposureMatched = C.exposure.anchor_block_count === Q.exposure.anchor_block_count &&
    C.exposure.task_incidence_slots === Q.exposure.task_incidence_slots;
  return freeze({
    schema: TASK_CONDITIONED_SCHEMA,
    stage: 'TASK_CONDITIONED_B_STAR_STRUCTURAL_HOLDOUT',
    science_head: exactHead(scienceHead),
    baseline_source_packet: BASELINE_SOURCE_PACKET,
    baseline_relock_sha: BASELINE_RELOCK_SHA,
    development_contamination: {
      a_centered_star_cycle: 'DEVELOPMENT_ONLY_NOT_CONFIRMATORY',
      counted_as_confirmatory_evidence: false
    },
    task_family: [...TASK_FAMILY],
    matched_global_budget: {
      distinct_probe_count: 12,
      probe_cardinality: 3,
      replicates_per_probe: 25,
      total_micro_observations: 300,
      all_arms_matched: true
    },
    exposure_matched_primary_comparison: {
      arms: ['C','Q'],
      anchor_block_count_match: C.exposure.anchor_block_count === Q.exposure.anchor_block_count,
      task_incidence_slots_match: C.exposure.task_incidence_slots === Q.exposure.task_incidence_slots,
      same_fillers: true,
      all_required_exposure_controls_match: exposureMatched
    },
    arms: { U, C, Q },
    bounded_relations: {
      task_conditioned_holdout_localizes_more_than_universal_baseline: C.task.task_exact_localization_count > U.task.task_exact_localization_count,
      exposure_matched_incidence_code_changes_task_localization: exposureMatched && C.task.task_exact_localization_count > Q.task.task_exact_localization_count,
      focal_exposure_alone_does_not_explain_task_localization_gain: exposureMatched && C.task.task_exact_localization_count > Q.task.task_exact_localization_count,
      task_specialization_trades_against_global_pair_coverage: C.global.covered_pair_count < U.global.covered_pair_count
    },
    deterministic_task_sweep_executed: false,
    scalar_winner: null,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
