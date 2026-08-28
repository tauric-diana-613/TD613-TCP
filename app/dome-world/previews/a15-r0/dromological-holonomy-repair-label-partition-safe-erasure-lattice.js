import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { observeReplayAssistedState } from './dromological-baseline-replay-rescue-aperture.js';
import { invertReplayLocusObservation } from './dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from './dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import { REPAIR_MASK_DOMAIN } from './dromological-holonomy-parity-completion-erasure-robust-aia.js';
import {
  dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate,
} from './dromological-holonomy-stabilizer-claim-authority-filtration.js';

export const DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_SCHEMA =
  'td613.dome-world.dromological-holonomy-repair-label-partition-safe-erasure-lattice/v0.1';
export const DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_PARENT_RECEIPT =
  'e0cc001a7b25b2e03deb08a9972d10ab7e47f4f5';

const LABELS = Object.freeze([0, 1, 2, 3]);
const ORBIT_TYPES = Object.freeze(['H', 'I', 'X']);
const EXPECTED_PARTITIONS = 15;
const EXPECTED_ACTIONS = 8;
const EXPECTED_ACTION_MULTIPLICITY = 72;
const EXPECTED_SETWISE_WITNESSES = 576;
const EXPECTED_RECEIVER_PARTITION_LABEL_CHECKS = 15 * 576 * 4;
const EXPECTED_SAFE_INCIDENCES = 2376;
const EXPECTED_UNSAFE_INCIDENCES = 6264;
const EXPECTED_COVERS = 31;
const EXPECTED_STRICT_COVERS = 23;
const EXPECTED_EQUALITY_COVERS = 8;
const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'source_state_transform',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

let cachedCertificate = null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function canonicalPartition(partition) {
  return partition
    .map(block => [...block].sort((a, b) => a - b))
    .sort((left, right) => left[0] - right[0] || left.length - right.length);
}

function partitionKey(partition) {
  return canonicalPartition(partition).map(block => block.join(',')).join('|');
}

function setPartitions(values) {
  if (values.length === 0) return [[]];
  const [first, ...rest] = values;
  const tails = setPartitions(rest);
  const rows = [];
  for (const tail of tails) {
    rows.push([[first], ...tail.map(block => [...block])]);
    for (let index = 0; index < tail.length; index += 1) {
      const next = tail.map(block => [...block]);
      next[index] = [first, ...next[index]];
      rows.push(next);
    }
  }
  const unique = new Map();
  for (const row of rows) {
    const canonical = canonicalPartition(row);
    unique.set(partitionKey(canonical), canonical);
  }
  return [...unique.values()].sort((left, right) => partitionKey(left).localeCompare(partitionKey(right)));
}

function partitionBlockMap(partition) {
  const map = new Map();
  partition.forEach((block, blockIndex) => block.forEach(label => map.set(label, blockIndex)));
  return map;
}

function validPartition(partition) {
  if (!Array.isArray(partition) || partition.length < 1 || partition.length > 4) return false;
  const flat = [];
  for (const block of partition) {
    if (!Array.isArray(block) || block.length === 0) return false;
    for (const label of block) {
      if (!Number.isInteger(label) || !LABELS.includes(label)) return false;
      flat.push(label);
    }
  }
  return flat.length === LABELS.length
    && new Set(flat).size === LABELS.length
    && LABELS.every(label => flat.includes(label));
}

export function validateDromologicalHolonomyRepairLabelPartition(partition) {
  return validPartition(partition);
}

function actionPreservesPartition(action, partition) {
  const blocks = partitionBlockMap(partition);
  return LABELS.every(label => blocks.get(action[label]) === blocks.get(label));
}

function partitionShape(partition) {
  return partition.map(block => block.length).sort((a, b) => b - a).join('-');
}

function matchingPartitionKey(edges) {
  return partitionKey(edges.map(edge => [...edge]));
}

function refines(fine, coarse) {
  const coarseMap = partitionBlockMap(coarse);
  return fine.every(block => block.every(label => coarseMap.get(label) === coarseMap.get(block[0])));
}

function safeActionKey(row) {
  return row.action.join(',');
}

function setEqual(left, right) {
  if (left.size !== right.size) return false;
  return [...left].every(value => right.has(value));
}

function derivePartitionAtlasForType(type, parentType) {
  const partitions = setPartitions(LABELS);
  const actionRows = parentType.induced_actions;
  const matchingKey = matchingPartitionKey(parentType.matching_edges);
  let exact = partitions.length === EXPECTED_PARTITIONS
    && actionRows.length === EXPECTED_ACTIONS
    && actionRows.every(row => row.multiplicity === EXPECTED_ACTION_MULTIPLICITY);
  let receiverPartitionLabelChecks = 0;
  let safeIncidences = 0;
  let unsafeIncidences = 0;

  const rows = partitions.map(partition => {
    const key = partitionKey(partition);
    const safeActions = actionRows.filter(row => actionPreservesPartition(row.action, partition));
    const safeWitnessCount = safeActions.reduce((sum, row) => sum + row.multiplicity, 0);
    const unsafeActions = actionRows.filter(row => !actionPreservesPartition(row.action, partition));
    const unsafeWitnessCount = unsafeActions.reduce((sum, row) => sum + row.multiplicity, 0);
    const safeActionKeys = new Set(safeActions.map(safeActionKey));

    for (const actionRow of actionRows) {
      for (const label of LABELS) {
        receiverPartitionLabelChecks += actionRow.multiplicity;
        const sourceBlock = partitionBlockMap(partition).get(label);
        const targetBlock = partitionBlockMap(partition).get(actionRow.action[label]);
        if (safeActionKeys.has(safeActionKey(actionRow)) && sourceBlock !== targetBlock) exact = false;
      }
    }

    safeIncidences += safeWitnessCount;
    unsafeIncidences += unsafeWitnessCount;

    let outsideWitnessConflict = null;
    if (unsafeActions.length > 0) {
      const outside = unsafeActions[0];
      const blocks = partitionBlockMap(partition);
      const movedLabel = LABELS.find(label => blocks.get(outside.action[label]) !== blocks.get(label));
      if (!Number.isInteger(movedLabel)) exact = false;
      else {
        const sourceBlock = blocks.get(movedLabel);
        const movedBlock = blocks.get(outside.action[movedLabel]);
        outsideWitnessConflict = freeze({
          action: outside.action,
          action_multiplicity: outside.multiplicity,
          antecedent_label: movedLabel,
          source_block: sourceBlock,
          moved_block: movedBlock,
          union_blocks: freeze([sourceBlock, movedBlock].sort((a, b) => a - b)),
          union_size: 2,
          intersection_empty: true,
          gamma_size: 2,
        });
      }
    }

    const insideSupportsConstant = safeActions.every(actionRow => {
      const blocks = partitionBlockMap(partition);
      return LABELS.every(label => blocks.get(actionRow.action[label]) === blocks.get(label));
    });
    if (!insideSupportsConstant) exact = false;
    if (partition.length > 1 && !outsideWitnessConflict) exact = false;
    if (partition.length === 1 && outsideWitnessConflict) exact = false;

    return freeze({
      partition: freeze(canonicalPartition(partition).map(block => freeze(block))),
      partition_key: key,
      shape: partitionShape(partition),
      is_inherited_matching_partition: key === matchingKey,
      safe_action_stabilizer_size: safeActions.length,
      safe_receiver_witness_count: safeWitnessCount,
      unsafe_receiver_witness_count: unsafeWitnessCount,
      safe_action_keys: freeze([...safeActionKeys].sort()),
      exact_blockwise_descent_inside_safe_family: insideSupportsConstant,
      outside_family_two_witness_fadt_conflict: outsideWitnessConflict,
    });
  });

  const byKey = new Map(rows.map(row => [row.partition_key, row]));
  const coverRows = [];
  for (const fine of partitions) {
    for (const coarse of partitions) {
      if (fine.length !== coarse.length + 1 || !refines(fine, coarse)) continue;
      const fineRow = byKey.get(partitionKey(fine));
      const coarseRow = byKey.get(partitionKey(coarse));
      const fineSet = new Set(fineRow.safe_action_keys);
      const coarseSet = new Set(coarseRow.safe_action_keys);
      const inclusion = [...fineSet].every(key => coarseSet.has(key));
      const equality = setEqual(fineSet, coarseSet);
      if (!inclusion) exact = false;
      coverRows.push(freeze({
        fine: fineRow.partition_key,
        coarse: coarseRow.partition_key,
        fine_safe_witnesses: fineRow.safe_receiver_witness_count,
        coarse_safe_witnesses: coarseRow.safe_receiver_witness_count,
        safe_family_inclusion: inclusion,
        equality,
        strict: inclusion && !equality,
      }));
    }
  }

  const distribution = {};
  for (const row of rows) {
    const key = String(row.safe_receiver_witness_count);
    distribution[key] = (distribution[key] ?? 0) + 1;
  }

  const matchingRows = rows.filter(row => row.is_inherited_matching_partition);
  const twoTwoRows = rows.filter(row => row.shape === '2-2');
  const unique288 = rows.filter(row => row.safe_receiver_witness_count === 288);
  const equalityCovers = coverRows.filter(row => row.equality);
  const strictCovers = coverRows.filter(row => row.strict);
  const repeatedSafeSubgroupPair = (() => {
    for (let left = 0; left < rows.length; left += 1) {
      for (let right = left + 1; right < rows.length; right += 1) {
        if (rows[left].partition_key !== rows[right].partition_key
            && same(rows[left].safe_action_keys, rows[right].safe_action_keys)) {
          return freeze({ left: rows[left].partition_key, right: rows[right].partition_key });
        }
      }
    }
    return null;
  })();

  if (!same(distribution, { '72': 5, '144': 8, '288': 1, '576': 1 })) exact = false;
  if (matchingRows.length !== 1 || matchingRows[0].safe_receiver_witness_count !== 288) exact = false;
  if (twoTwoRows.length !== 3 || twoTwoRows.filter(row => !row.is_inherited_matching_partition)
    .some(row => row.safe_receiver_witness_count !== 144)) exact = false;
  if (coverRows.length !== EXPECTED_COVERS
      || strictCovers.length !== EXPECTED_STRICT_COVERS
      || equalityCovers.length !== EXPECTED_EQUALITY_COVERS) exact = false;
  if (!repeatedSafeSubgroupPair) exact = false;
  if (receiverPartitionLabelChecks !== EXPECTED_RECEIVER_PARTITION_LABEL_CHECKS) exact = false;
  if (safeIncidences !== EXPECTED_SAFE_INCIDENCES || unsafeIncidences !== EXPECTED_UNSAFE_INCIDENCES) exact = false;

  return freeze({
    type,
    matching_edges: parentType.matching_edges,
    matching_partition_key: matchingKey,
    partition_count: rows.length,
    partitions: freeze(rows),
    safe_witness_distribution: freeze(distribution),
    unique_288_partition: unique288.length === 1 ? unique288[0].partition_key : null,
    refinement_cover_count: coverRows.length,
    strict_cover_count: strictCovers.length,
    equality_cover_count: equalityCovers.length,
    refinement_covers: freeze(coverRows),
    repeated_safe_subgroup_distinct_claim_pair: repeatedSafeSubgroupPair,
    receiver_partition_label_checks: receiverPartitionLabelChecks,
    safe_partition_witness_incidences: safeIncidences,
    unsafe_partition_witness_incidences: unsafeIncidences,
    exact,
  });
}

function scheduleMap() {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
    schedule.map(stratum => letters[stratum]).join('-'),
    schedule,
  ]));
}

function downstreamControlCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const schedules = scheduleMap();
  let replayChecks = 0;
  let robustChecks = 0;
  let reconstructions = 0;
  let exact = true;

  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    const holonomyClass = classes[classIndex];
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const replay = decodeMinimumCostReplayFromRepairMask(mask);
    replayChecks += 1;
    if (!same(replay, policies[classIndex].replay_row)) exact = false;
    const rescue = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
    robustChecks += 1;
    if (!rescue.actual_class_robust_unimodular_rescue) exact = false;

    for (const id of holonomyClass.schedule_ids) {
      const schedule = schedules.get(id);
      if (!schedule) {
        exact = false;
        continue;
      }
      for (let x1 = -2; x1 <= 2; x1 += 1) {
        for (let x2 = -2; x2 <= 2; x2 += 1) {
          for (let x3 = -2; x3 <= 2; x3 += 1) {
            const state = [x1, x2, x3];
            const observation = observeReplayAssistedState(state, schedule, replay);
            const recovered = invertReplayLocusObservation(observation, schedule, replay);
            reconstructions += 1;
            if (!same(recovered, state)) exact = false;
          }
        }
      }
    }
  }

  const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
  const ambiguityPreserved = Boolean(mixedClass)
    && same([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

  return freeze({
    repair_class_replay_checks: replayChecks,
    class_robust_unimodular_checks: robustChecks,
    executed_state_reconstructions: reconstructions,
    expected_state_reconstructions: 750,
    partition_identity_enters_state_reconstruction: false,
    receiver_witness_identity_enters_state_reconstruction: false,
    source_state_mutated: false,
    schedule_history_reconstructed_from_partition: false,
    mixed_schedule_ambiguity_preserved: ambiguityPreserved,
    exact: exact && reconstructions === 750 && ambiguityPreserved,
  });
}

export function dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate();
  const perType = {};
  let exact = parent.passed;
  for (const type of ORBIT_TYPES) {
    const parentType = parent.claim_authority_certificate.per_type[type];
    const atlas = derivePartitionAtlasForType(type, parentType);
    perType[type] = atlas;
    if (!atlas.exact) exact = false;
  }
  const downstream = downstreamControlCertificate();
  if (!downstream.exact) exact = false;

  const crossTypeDistributionAgreement = ORBIT_TYPES.every(type =>
    same(perType[type].safe_witness_distribution, perType.H.safe_witness_distribution));
  const crossTypeCoverAgreement = ORBIT_TYPES.every(type =>
    perType[type].refinement_cover_count === perType.H.refinement_cover_count
    && perType[type].strict_cover_count === perType.H.strict_cover_count
    && perType[type].equality_cover_count === perType.H.equality_cover_count);
  if (!crossTypeDistributionAgreement || !crossTypeCoverAgreement) exact = false;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_PARENT_RECEIPT,
    parent_schema: parent.schema,
    collision_membrane: freeze({
      pr_753_fadt_universal_authority_partition_preserved: true,
      current_domain: 'SET_PARTITIONS_OF_FOUR_EARNED_REPAIR_LABELS_UNDER_PR_841_INDUCED_ACTION',
      theorem_753_restatement: false,
    }),
    repair_label_partition_certificate: freeze({
      repair_label_count: 4,
      complete_partition_count: EXPECTED_PARTITIONS,
      ambient_s4_permutation_count: 24,
      inherited_action_count: EXPECTED_ACTIONS,
      action_multiplicity: EXPECTED_ACTION_MULTIPLICITY,
      setwise_receiver_family_size: EXPECTED_SETWISE_WITNESSES,
      safe_witness_distribution: perType.H.safe_witness_distribution,
      refinement_cover_count: perType.H.refinement_cover_count,
      strict_cover_count: perType.H.strict_cover_count,
      equality_cover_count: perType.H.equality_cover_count,
      unique_288_layer_present: perType.H.unique_288_partition !== null,
      receiver_partition_label_checks_per_type: EXPECTED_RECEIVER_PARTITION_LABEL_CHECKS,
      safe_partition_witness_incidences_per_type: EXPECTED_SAFE_INCIDENCES,
      unsafe_partition_witness_incidences_per_type: EXPECTED_UNSAFE_INCIDENCES,
      cross_type_distribution_agreement: crossTypeDistributionAgreement,
      cross_type_cover_agreement: crossTypeCoverAgreement,
      per_type: freeze(perType),
      exact,
    }),
    downstream_control_certificate: downstream,
    passed: exact && downstream.exact,
    classifications: freeze(exact && downstream.exact ? [
      'IN_THE_FIXED_WIDTH_EIGHT_S3_AIA_FIXTURE_EVERY_SET_PARTITION_OF_THE_FOUR_EARNED_REPAIR_LABELS_HAS_AN_EXACT_MAXIMUM_SAFE_RECEIVER_WITNESS_ERASURE_FAMILY_GIVEN_BY_THE_PREIMAGE_OF_ITS_BLOCKWISE_STABILIZER_UNDER_THE_EARNED_EIGHT_ACTION_RECEIVER_REPRESENTATION',
      'CLAIM_REFINEMENT_ANTITONICALLY_RESTRICTS_MAXIMUM_SAFE_WITNESS_ERASURE_IN_THE_COMPLETE_FIFTEEN_PARTITION_REPAIR_LABEL_ATLAS_BUT_PROPER_REFINEMENT_NEED_NOT_STRICTLY_REDUCE_THE_SAFE_WITNESS_FAMILY_WHEN_THE_ADDED_DISTINCTION_IS_ALREADY_FORCED_BY_THE_INHERITED_MATCHING_GEOMETRY',
      'THE_COMPLETE_REPAIR_LABEL_PARTITION_CENSUS_CONTAINS_A_UNIQUE_288_WITNESS_INTERMEDIATE_AUTHORITY_LAYER_ASSOCIATED_WITH_PRESERVING_THE_INHERITED_DISTANCE_SIX_PERFECT_MATCHING_AS_TWO_BLOCKS',
      'MORE_DISTINGUISHING_CLAIMS_CANNOT_INCREASE_SAFE_ERASURE_AUTHORITY_BUT_CAN_COST_ZERO_ADDITIONAL_WITNESS_DETAIL_WHEN_EXISTING_GEOMETRY_ALREADY_PRESERVES_THE_NEW_DISTINCTION',
    ] : []),
    scars: freeze([
      'REPAIR_LABEL_PARTITION != FADT_UNIVERSAL_AUTHORITY_PARTITION',
      'PARTITION_REFINEMENT != TEMPORAL_REFINEMENT',
      'SAFE_ERASURE_ANTITONICITY != INFORMATION_ENTROPY_MONOTONICITY',
      'PROPER_REFINEMENT != NECESSARILY_STRICT_SAFE_FAMILY_CONTRACTION',
      'SAME_SAFE_SUBGROUP != SAME_CLAIM_PARTITION',
      'BLOCK_STABILIZER != PHYSICAL_GAUGE_STABILIZER',
      'PARTITION_LATTICE != SEMANTIC_ONTOLOGY',
      'ACTION_PREIMAGE != OPERATIONAL_INVERSE_ROUTE',
      'MATCHING_PARTITION != PHYSICAL_PAIRING',
      '288_WITNESS_LAYER != NEW_SOURCE_INFORMATION',
      'FADT_TWO_WITNESS_CONFLICT != GLOBAL_INFORMATION_LOSS_METRIC',
      'FINITE_FOUR_LABEL_CENSUS != UNIVERSAL_INFORMATION_LATTICE_THEOREM',
      'REPAIR_LABEL_PRESERVATION != COMPLETE_SCHEDULE_RECONSTRUCTION',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeProjection(receiver) {
  const certificate = dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified repair-label partition safe-erasure lattice');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.repair-label-partition-safe-erasure-lattice-child-legible/v0.1',
      truths: freeze([
        'HOW_MUCH_RECEIVER_WITNESS_DETAIL_CAN_BE_FORGOTTEN_DEPENDS_ON_WHICH_REPAIR_LABEL_DISTINCTIONS_THE_CLAIM_NEEDS_TO_KEEP',
        'ASKING_FOR_MORE_REPAIR_LABEL_DETAIL_NEVER_INCREASES_THE_SAFE_FORGETTING_FAMILY_HERE',
        'SOMETIMES_AN_ADDED_REPAIR_LABEL_DISTINCTION_COSTS_NO_EXTRA_WITNESS_DETAIL_BECAUSE_THE_EXISTING_MATCHING_GEOMETRY_ALREADY_PRESERVES_IT',
        'THE_COMPLETE_FOUR_LABEL_ATLAS_CONTAINS_ONE_INTERMEDIATE_288_WITNESS_LAYER',
      ]),
      complete_partition_atlas_exposed: false,
      full_refinement_cover_table_exposed: false,
      outside_witness_conflicts_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
      schedule_history_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.repair-label-partition-safe-erasure-lattice-loom-technical/v0.1',
      summary: freeze({
        partition_count: certificate.repair_label_partition_certificate.complete_partition_count,
        safe_witness_distribution: certificate.repair_label_partition_certificate.safe_witness_distribution,
        refinement_cover_count: certificate.repair_label_partition_certificate.refinement_cover_count,
        strict_cover_count: certificate.repair_label_partition_certificate.strict_cover_count,
        equality_cover_count: certificate.repair_label_partition_certificate.equality_cover_count,
        unique_288_layer_present: certificate.repair_label_partition_certificate.unique_288_layer_present,
      }),
      downstream_control: certificate.downstream_control_certificate,
      complete_partition_atlas_exposed: false,
      full_receiver_partition_incidence_atlas_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for repair-label partition safe-erasure lattice: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      receiver_partition_label_checks_per_type: EXPECTED_RECEIVER_PARTITION_LABEL_CHECKS,
      total_receiver_partition_label_checks_across_hix: EXPECTED_RECEIVER_PARTITION_LABEL_CHECKS * 3,
      safe_partition_witness_incidences_per_type: EXPECTED_SAFE_INCIDENCES,
      unsafe_partition_witness_incidences_per_type: EXPECTED_UNSAFE_INCIDENCES,
      state_reconstructions: certificate.downstream_control_certificate.executed_state_reconstructions,
      represented_larger_cross_product_claimed_executed: false,
    }),
    claim_ceiling: freeze({
      fixed_fixture_repair_label_partition_safe_erasure: true,
      universal_information_lattice_theorem: false,
      universal_ai_architecture_theorem: false,
      universal_group_action_theorem: false,
      universal_coding_theorem: false,
      shannon_capacity: false,
      operational_path_groupoid: false,
      operational_inverse: false,
      physical_symmetry: false,
      physical_gauge: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      source_state_mutation: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_information_lattice_theorem === true
    || ceiling.universal_ai_architecture_theorem === true
    || ceiling.universal_group_action_theorem === true
    || ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity === true
    || ceiling.operational_path_groupoid === true
    || ceiling.operational_inverse === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_gauge === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.source_state_mutation === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const runtime = candidate?.runtime_binding === true;
  const strictFallacy = candidate?.proper_refinement_always_strict === true;
  const antiIsomorphism = candidate?.partition_to_safe_subgroup_is_anti_isomorphism === true;
  const collision = candidate?.claim_partition_753_equivalent === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.complete_partition_atlas_exposed === true
    || candidate?.payload?.full_refinement_cover_table_exposed === true
    || candidate?.payload?.outside_witness_conflicts_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
    || candidate?.payload?.schedule_history_exposed === true
  );
  return freeze({
    accepted: !authority
      && !overreach
      && !sourceMutation
      && !runtime
      && !strictFallacy
      && !antiIsomorphism
      && !collision
      && !ashLeak,
  });
}
