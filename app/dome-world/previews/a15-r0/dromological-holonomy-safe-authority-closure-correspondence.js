import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import {
  dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate,
} from './dromological-holonomy-repair-label-partition-safe-erasure-lattice.js';

export const DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_SCHEMA =
  'td613.dome-world.dromological-holonomy-safe-authority-closure-correspondence/v0.1';
export const DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_PARENT_RECEIPT =
  'a7726078034328d9cad811ff9d8f73f52fd26729';

const LABELS = Object.freeze([0, 1, 2, 3]);
const ORBIT_TYPES = Object.freeze(['H', 'I', 'X']);
const EXPECTED_RAW_PARTITIONS = 15;
const EXPECTED_ACTION_GROUP_ORDER = 8;
const EXPECTED_RECEIVER_WITNESSES = 576;
const EXPECTED_ACTION_MULTIPLICITY = 72;
const EXPECTED_SUBGROUPS = 10;
const EXPECTED_FIXED_CLAIMS = 7;
const EXPECTED_NONFIXED_CLAIMS = 8;
const EXPECTED_FIXED_SUBGROUPS = 7;
const EXPECTED_NONFIXED_SUBGROUPS = 3;
const EXPECTED_SUBGROUP_PARTITION_CHECKS = 150;
const EXPECTED_PARTITION_PAIR_CHECKS = 105;
const EXPECTED_RAW_COVERS = 31;
const EXPECTED_EQUALITY_COVERS = 8;
const EXPECTED_STRICT_COVERS = 23;
const EXPECTED_FIXED_LATTICE_COVERS = 9;
const EXPECTED_FIXED_LATTICE_PAIR_CHECKS = 49;
const EXPECTED_CLOSURE_FIBERS = 7;
const EXPECTED_FIBER_SIZES = Object.freeze([5, 3, 3, 1, 1, 1, 1]);
const EXPECTED_SUBGROUP_ORDER_DISTRIBUTION = Object.freeze({ '1': 1, '2': 5, '4': 3, '8': 1 });
const EXPECTED_CLOSED_SAFE_FAMILY_DISTRIBUTION = Object.freeze({ '72': 1, '144': 4, '288': 1, '576': 1 });
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

function blockMap(partition) {
  const map = new Map();
  partition.forEach((block, blockIndex) => block.forEach(label => map.set(label, blockIndex)));
  return map;
}

function refines(fine, coarse) {
  const coarseMap = blockMap(coarse);
  return fine.every(block => block.every(label => coarseMap.get(label) === coarseMap.get(block[0])));
}

function actionKey(action) {
  return action.join(',');
}

function parseActionKey(key) {
  return key.split(',').map(Number);
}

function composeActions(left, right) {
  return LABELS.map(label => left[right[label]]);
}

function inverseAction(action) {
  const inverse = Array(action.length).fill(null);
  action.forEach((target, source) => { inverse[target] = source; });
  return inverse;
}

function setEqual(left, right) {
  if (left.size !== right.size) return false;
  return [...left].every(value => right.has(value));
}

function setSubset(left, right) {
  return [...left].every(value => right.has(value));
}

function subgroupKey(actionKeys) {
  return [...actionKeys].sort().join(';');
}

function orbitPartition(actionKeys, actionMap) {
  const unseen = new Set(LABELS);
  const blocks = [];
  while (unseen.size > 0) {
    const seed = Math.min(...unseen);
    const orbit = new Set();
    for (const key of actionKeys) orbit.add(actionMap.get(key)[seed]);
    blocks.push([...orbit].sort((a, b) => a - b));
    orbit.forEach(label => unseen.delete(label));
  }
  return canonicalPartition(blocks);
}

function enumerateSubgroups(actionKeys, actionMap) {
  const identityKey = actionKey(LABELS);
  const rows = [];
  for (let mask = 0; mask < (1 << actionKeys.length); mask += 1) {
    const keys = actionKeys.filter((_, index) => (mask & (1 << index)) !== 0);
    const keySet = new Set(keys);
    if (!keySet.has(identityKey)) continue;
    let closed = true;
    for (const leftKey of keys) {
      const inverseKey = actionKey(inverseAction(actionMap.get(leftKey)));
      if (!keySet.has(inverseKey)) {
        closed = false;
        break;
      }
      for (const rightKey of keys) {
        const compositionKey = actionKey(composeActions(actionMap.get(leftKey), actionMap.get(rightKey)));
        if (!keySet.has(compositionKey)) {
          closed = false;
          break;
        }
      }
      if (!closed) break;
    }
    if (closed) {
      rows.push({
        action_keys: [...keys].sort(),
        subgroup_key: subgroupKey(keys),
        order: keys.length,
      });
    }
  }
  rows.sort((left, right) => left.order - right.order || left.subgroup_key.localeCompare(right.subgroup_key));
  return rows;
}

function partitionMeet(left, right) {
  const parent = LABELS.map(label => label);
  const find = (value) => {
    let cursor = value;
    while (parent[cursor] !== cursor) cursor = parent[cursor];
    return cursor;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  for (const partition of [left, right]) {
    for (const block of partition) {
      for (let index = 1; index < block.length; index += 1) union(block[0], block[index]);
    }
  }
  const groups = new Map();
  for (const label of LABELS) {
    const root = find(label);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(label);
  }
  return canonicalPartition([...groups.values()]);
}

function partitionJoin(left, right) {
  const blocks = [];
  for (const leftBlock of left) {
    const leftSet = new Set(leftBlock);
    for (const rightBlock of right) {
      const intersection = rightBlock.filter(label => leftSet.has(label));
      if (intersection.length > 0) blocks.push(intersection);
    }
  }
  return canonicalPartition(blocks);
}

function isImmediateCover(fine, coarse, candidates) {
  if (!refines(fine.partition, coarse.partition) || fine.partition_key === coarse.partition_key) return false;
  return !candidates.some(middle => middle.partition_key !== fine.partition_key
    && middle.partition_key !== coarse.partition_key
    && refines(middle.partition, coarse.partition)
    && refines(fine.partition, middle.partition));
}

function deriveTypeClosure(type, parentAtlas) {
  const partitions = parentAtlas.partitions;
  const byKey = new Map(partitions.map(row => [row.partition_key, row]));
  const oneBlock = partitions.find(row => row.partition.length === 1);
  let exact = parentAtlas.exact && partitions.length === EXPECTED_RAW_PARTITIONS && Boolean(oneBlock);

  const actionKeys = [...(oneBlock?.safe_action_keys ?? [])].sort();
  const actionMap = new Map(actionKeys.map(key => [key, parseActionKey(key)]));
  if (actionKeys.length !== EXPECTED_ACTION_GROUP_ORDER) exact = false;

  const subgroups = enumerateSubgroups(actionKeys, actionMap);
  const subgroupByKey = new Map(subgroups.map(row => [row.subgroup_key, row]));
  const subgroupOrderDistribution = {};
  for (const subgroup of subgroups) {
    const key = String(subgroup.order);
    subgroupOrderDistribution[key] = (subgroupOrderDistribution[key] ?? 0) + 1;
  }
  if (subgroups.length !== EXPECTED_SUBGROUPS
      || !same(subgroupOrderDistribution, EXPECTED_SUBGROUP_ORDER_DISTRIBUTION)) exact = false;

  const closureRows = partitions.map(row => {
    const safeKeys = [...row.safe_action_keys].sort();
    const closurePartition = orbitPartition(safeKeys, actionMap);
    const closurePartitionKey = partitionKey(closurePartition);
    const closureParentRow = byKey.get(closurePartitionKey);
    const safePreserved = Boolean(closureParentRow)
      && setEqual(new Set(safeKeys), new Set(closureParentRow.safe_action_keys));
    const closureRefinesClaim = refines(closurePartition, row.partition);
    return {
      partition: row.partition,
      partition_key: row.partition_key,
      safe_action_keys: safeKeys,
      safe_action_subgroup_key: subgroupKey(safeKeys),
      safe_action_order: safeKeys.length,
      safe_receiver_witness_count: row.safe_receiver_witness_count,
      closure_partition: closurePartition,
      closure_partition_key: closurePartitionKey,
      fixed: closurePartitionKey === row.partition_key,
      closure_refines_claim: closureRefinesClaim,
      closure_preserves_safe_family: safePreserved,
    };
  });
  const closureByRawKey = new Map(closureRows.map(row => [row.partition_key, row]));

  for (const row of closureRows) {
    const closureRow = closureByRawKey.get(row.closure_partition_key);
    if (!row.closure_refines_claim || !row.closure_preserves_safe_family || !closureRow
        || closureRow.closure_partition_key !== row.closure_partition_key) exact = false;
  }

  let comparableClaimPairs = 0;
  for (const coarse of closureRows) {
    for (const fine of closureRows) {
      if (coarse.partition_key === fine.partition_key || !refines(fine.partition, coarse.partition)) continue;
      comparableClaimPairs += 1;
      const coarseClosure = closureByRawKey.get(coarse.closure_partition_key);
      const fineClosure = closureByRawKey.get(fine.closure_partition_key);
      if (!refines(fineClosure.partition, coarseClosure.partition)) exact = false;
    }
  }

  const fibers = new Map();
  for (const row of closureRows) {
    if (!fibers.has(row.safe_action_subgroup_key)) fibers.set(row.safe_action_subgroup_key, []);
    fibers.get(row.safe_action_subgroup_key).push(row);
  }
  const fiberRows = [...fibers.entries()].map(([safeKey, members]) => {
    const fixedMembers = members.filter(row => row.fixed);
    const fixed = fixedMembers[0] ?? null;
    const uniqueFinest = fixedMembers.length === 1
      && members.every(member => refines(fixed.partition, member.partition));
    return {
      safe_action_subgroup_key: safeKey,
      member_partition_keys: members.map(row => row.partition_key).sort(),
      size: members.length,
      fixed_partition_key: fixed?.partition_key ?? null,
      unique_finest_fixed_member: uniqueFinest,
    };
  });
  const fiberSizes = fiberRows.map(row => row.size).sort((a, b) => b - a);
  if (fiberRows.length !== EXPECTED_CLOSURE_FIBERS || !same(fiberSizes, EXPECTED_FIBER_SIZES)
      || !fiberRows.every(row => row.unique_finest_fixed_member)) exact = false;

  let partitionPairChecks = 0;
  for (let left = 0; left < closureRows.length; left += 1) {
    for (let right = left + 1; right < closureRows.length; right += 1) {
      partitionPairChecks += 1;
      const sameSafe = closureRows[left].safe_action_subgroup_key === closureRows[right].safe_action_subgroup_key;
      const sameClosure = closureRows[left].closure_partition_key === closureRows[right].closure_partition_key;
      if (sameSafe !== sameClosure) exact = false;
    }
  }
  if (partitionPairChecks !== EXPECTED_PARTITION_PAIR_CHECKS) exact = false;

  const fixedClaims = closureRows.filter(row => row.fixed);
  const nonfixedClaims = closureRows.filter(row => !row.fixed);
  if (fixedClaims.length !== EXPECTED_FIXED_CLAIMS || nonfixedClaims.length !== EXPECTED_NONFIXED_CLAIMS) exact = false;

  const closedSafeFamilyDistribution = {};
  for (const row of fixedClaims) {
    const key = String(row.safe_receiver_witness_count);
    closedSafeFamilyDistribution[key] = (closedSafeFamilyDistribution[key] ?? 0) + 1;
  }
  const distinct144Keys = new Set(fixedClaims
    .filter(row => row.safe_receiver_witness_count === 144)
    .map(row => row.safe_action_subgroup_key));
  if (!same(closedSafeFamilyDistribution, EXPECTED_CLOSED_SAFE_FAMILY_DISTRIBUTION)
      || distinct144Keys.size !== 4) exact = false;

  const equalityCoverSet = new Set(parentAtlas.refinement_covers
    .filter(row => row.equality)
    .map(row => `${row.coarse}->${row.fine}`));
  const strictCovers = parentAtlas.refinement_covers.filter(row => row.strict);
  const closureArrowSet = new Set(nonfixedClaims.map(row => `${row.partition_key}->${row.closure_partition_key}`));
  if (parentAtlas.refinement_cover_count !== EXPECTED_RAW_COVERS
      || parentAtlas.equality_cover_count !== EXPECTED_EQUALITY_COVERS
      || parentAtlas.strict_cover_count !== EXPECTED_STRICT_COVERS
      || !setEqual(equalityCoverSet, closureArrowSet)) exact = false;
  for (const row of strictCovers) {
    const fine = closureByRawKey.get(row.fine);
    const coarse = closureByRawKey.get(row.coarse);
    if (!fine || !coarse || fine.closure_partition_key === coarse.closure_partition_key) exact = false;
  }

  let maximalFreeRefinementChecks = 0;
  for (const row of closureRows) {
    const closed = closureByRawKey.get(row.closure_partition_key);
    for (const candidate of closureRows) {
      if (candidate.partition_key === closed.partition_key || !refines(candidate.partition, closed.partition)) continue;
      maximalFreeRefinementChecks += 1;
      const candidateSafe = new Set(candidate.safe_action_keys);
      const rowSafe = new Set(row.safe_action_keys);
      if (!setSubset(candidateSafe, rowSafe) || candidateSafe.size >= rowSafe.size) exact = false;
    }
  }

  const subgroupClosureRows = subgroups.map(subgroup => {
    const orbit = orbitPartition(subgroup.action_keys, actionMap);
    const orbitKey = partitionKey(orbit);
    const orbitClaim = byKey.get(orbitKey);
    const closedActionKeys = [...(orbitClaim?.safe_action_keys ?? [])].sort();
    const closedGroupKey = subgroupKey(closedActionKeys);
    const closedGroup = subgroupByKey.get(closedGroupKey);
    const containsOriginal = setSubset(new Set(subgroup.action_keys), new Set(closedActionKeys));
    let idempotent = false;
    if (closedGroup) {
      const secondOrbit = orbitPartition(closedGroup.action_keys, actionMap);
      const secondClaim = byKey.get(partitionKey(secondOrbit));
      idempotent = Boolean(secondClaim)
        && subgroupKey(secondClaim.safe_action_keys) === closedGroupKey;
    }
    return {
      subgroup_key: subgroup.subgroup_key,
      order: subgroup.order,
      action_keys: subgroup.action_keys,
      orbit_partition: orbit,
      orbit_partition_key: orbitKey,
      closure_subgroup_key: closedGroupKey,
      closure_order: closedActionKeys.length,
      contains_original: containsOriginal,
      closure_idempotent: idempotent,
      fixed: subgroup.subgroup_key === closedGroupKey,
    };
  });

  const fixedSubgroups = subgroupClosureRows.filter(row => row.fixed);
  const nonfixedSubgroups = subgroupClosureRows.filter(row => !row.fixed);
  const expansionSpectrum = {};
  for (const row of nonfixedSubgroups) {
    const key = `${row.order}->${row.closure_order}`;
    expansionSpectrum[key] = (expansionSpectrum[key] ?? 0) + 1;
  }
  if (fixedSubgroups.length !== EXPECTED_FIXED_SUBGROUPS
      || nonfixedSubgroups.length !== EXPECTED_NONFIXED_SUBGROUPS
      || !same(expansionSpectrum, { '2->4': 1, '4->8': 2 })
      || !subgroupClosureRows.every(row => row.contains_original && row.closure_idempotent)) exact = false;

  let subgroupPartitionChecks = 0;
  for (const subgroup of subgroupClosureRows) {
    const subgroupSet = new Set(subgroup.action_keys);
    for (const claim of closureRows) {
      subgroupPartitionChecks += 1;
      const subgroupInsideSafe = setSubset(subgroupSet, new Set(claim.safe_action_keys));
      const orbitRefinesClaim = refines(subgroup.orbit_partition, claim.partition);
      if (subgroupInsideSafe !== orbitRefinesClaim) exact = false;
    }
  }
  if (subgroupPartitionChecks !== EXPECTED_SUBGROUP_PARTITION_CHECKS) exact = false;

  const fixedGroupKeys = new Set(fixedSubgroups.map(row => row.subgroup_key));
  const fixedClaimKeys = new Set(fixedClaims.map(row => row.partition_key));
  for (const claim of fixedClaims) {
    if (!fixedGroupKeys.has(claim.safe_action_subgroup_key)) exact = false;
    const orbit = orbitPartition(claim.safe_action_keys, actionMap);
    if (partitionKey(orbit) !== claim.partition_key) exact = false;
  }
  for (const subgroup of fixedSubgroups) {
    if (!fixedClaimKeys.has(subgroup.orbit_partition_key)) exact = false;
    const claim = byKey.get(subgroup.orbit_partition_key);
    if (!claim || subgroupKey(claim.safe_action_keys) !== subgroup.subgroup_key) exact = false;
  }

  let fixedCorrespondencePairChecks = 0;
  for (const coarse of fixedClaims) {
    for (const fine of fixedClaims) {
      fixedCorrespondencePairChecks += 1;
      const claimRefinement = refines(fine.partition, coarse.partition);
      const safeInclusion = setSubset(new Set(fine.safe_action_keys), new Set(coarse.safe_action_keys));
      if (claimRefinement !== safeInclusion) exact = false;
    }
  }
  if (fixedCorrespondencePairChecks !== EXPECTED_FIXED_LATTICE_PAIR_CHECKS) exact = false;

  const fixedLatticeCovers = [];
  for (const coarse of fixedClaims) {
    for (const fine of fixedClaims) {
      if (coarse.partition_key === fine.partition_key) continue;
      if (isImmediateCover(fine, coarse, fixedClaims)) {
        fixedLatticeCovers.push({ coarse: coarse.partition_key, fine: fine.partition_key });
      }
    }
  }
  if (fixedLatticeCovers.length !== EXPECTED_FIXED_LATTICE_COVERS) exact = false;

  let fixedSublatticePairChecks = 0;
  for (const left of fixedClaims) {
    for (const right of fixedClaims) {
      fixedSublatticePairChecks += 1;
      const meetKey = partitionKey(partitionMeet(left.partition, right.partition));
      const joinKey = partitionKey(partitionJoin(left.partition, right.partition));
      if (!fixedClaimKeys.has(meetKey) || !fixedClaimKeys.has(joinKey)) exact = false;
    }
  }

  const matchingEdges = parentAtlas.matching_edges.map(edge => [...edge]);
  const [firstEdge, secondEdge] = matchingEdges;
  const [a, b] = firstEdge;
  const [c, d] = secondEdge;
  const discrete = canonicalPartition(LABELS.map(label => [label]));
  const pi1 = canonicalPartition([[a, c], [b], [d]]);
  const tau = canonicalPartition([[a, d], [b], [c]]);
  const meet0Tau = partitionMeet(discrete, tau);
  const meet1Tau = partitionMeet(pi1, tau);
  const pi0Row = byKey.get(partitionKey(discrete));
  const pi1Row = byKey.get(partitionKey(pi1));
  const meet0Row = byKey.get(partitionKey(meet0Tau));
  const meet1Row = byKey.get(partitionKey(meet1Tau));
  const initialSameSafe = Boolean(pi0Row && pi1Row)
    && subgroupKey(pi0Row.safe_action_keys) === subgroupKey(pi1Row.safe_action_keys);
  const meetSafeDistinct = Boolean(meet0Row && meet1Row)
    && subgroupKey(meet0Row.safe_action_keys) !== subgroupKey(meet1Row.safe_action_keys);
  const noncongruenceWitness = {
    matching_edges: matchingEdges,
    pi0: partitionKey(discrete),
    pi1: partitionKey(pi1),
    tau: partitionKey(tau),
    meet_pi0_tau: partitionKey(meet0Tau),
    meet_pi1_tau: partitionKey(meet1Tau),
    initial_same_safe_family: initialSameSafe,
    meet_safe_families_distinct: meetSafeDistinct,
    safe_equivalence_is_not_lattice_congruence: initialSameSafe && meetSafeDistinct,
  };
  if (!noncongruenceWitness.safe_equivalence_is_not_lattice_congruence) exact = false;

  return freeze({
    type,
    matching_edges: freeze(matchingEdges.map(edge => freeze(edge))),
    action_group_order: actionKeys.length,
    raw_claim_count: partitions.length,
    claim_closure_rows: freeze(closureRows),
    fixed_claim_count: fixedClaims.length,
    nonfixed_claim_count: nonfixedClaims.length,
    safe_equivalence_class_count: fiberRows.length,
    safe_equivalence_fibers: freeze(fiberRows),
    fiber_sizes_descending: freeze(fiberSizes),
    distinct_closed_safe_family_distribution: freeze(closedSafeFamilyDistribution),
    distinct_144_safe_family_identities: distinct144Keys.size,
    raw_refinement_cover_count: parentAtlas.refinement_cover_count,
    raw_equality_cover_count: parentAtlas.equality_cover_count,
    raw_strict_cover_count: parentAtlas.strict_cover_count,
    equality_covers_equal_nonfixed_closure_arrows: setEqual(equalityCoverSet, closureArrowSet),
    comparable_claim_pair_checks: comparableClaimPairs,
    unordered_partition_pair_safe_equivalence_checks: partitionPairChecks,
    maximal_free_refinement_checks: maximalFreeRefinementChecks,
    subgroup_subset_candidates: 1 << actionKeys.length,
    subgroup_count: subgroups.length,
    subgroup_order_distribution: freeze(subgroupOrderDistribution),
    subgroup_closure_rows: freeze(subgroupClosureRows),
    fixed_subgroup_count: fixedSubgroups.length,
    nonfixed_subgroup_count: nonfixedSubgroups.length,
    nonfixed_subgroup_expansion_spectrum: freeze(expansionSpectrum),
    subgroup_partition_correspondence_checks: subgroupPartitionChecks,
    fixed_correspondence_pair_checks: fixedCorrespondencePairChecks,
    fixed_claim_lattice_cover_count: fixedLatticeCovers.length,
    fixed_claim_lattice_covers: freeze(fixedLatticeCovers),
    fixed_claim_sublattice_pair_checks: fixedSublatticePairChecks,
    fixed_claims_closed_under_ambient_meet_and_join: fixedSublatticePairChecks === EXPECTED_FIXED_LATTICE_PAIR_CHECKS,
    noncongruence_witness: freeze(noncongruenceWitness),
    exact,
  });
}

export function dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate();
  let exact = parent.passed;
  const perType = {};

  for (const type of ORBIT_TYPES) {
    const parentAtlas = parent.repair_label_partition_certificate.per_type[type];
    const row = deriveTypeClosure(type, parentAtlas);
    perType[type] = row;
    if (!row.exact) exact = false;
  }

  const crossTypeCensusAgreement = ORBIT_TYPES.every(type => (
    perType[type].raw_claim_count === EXPECTED_RAW_PARTITIONS
    && perType[type].fixed_claim_count === EXPECTED_FIXED_CLAIMS
    && perType[type].nonfixed_claim_count === EXPECTED_NONFIXED_CLAIMS
    && perType[type].safe_equivalence_class_count === EXPECTED_CLOSURE_FIBERS
    && same(perType[type].fiber_sizes_descending, EXPECTED_FIBER_SIZES)
    && same(perType[type].distinct_closed_safe_family_distribution, EXPECTED_CLOSED_SAFE_FAMILY_DISTRIBUTION)
    && perType[type].subgroup_count === EXPECTED_SUBGROUPS
    && perType[type].fixed_subgroup_count === EXPECTED_FIXED_SUBGROUPS
    && perType[type].nonfixed_subgroup_count === EXPECTED_NONFIXED_SUBGROUPS
    && perType[type].fixed_claim_lattice_cover_count === EXPECTED_FIXED_LATTICE_COVERS
    && perType[type].noncongruence_witness.safe_equivalence_is_not_lattice_congruence
  ));
  if (!crossTypeCensusAgreement) exact = false;

  const downstream = parent.downstream_control_certificate;
  if (!downstream.exact || downstream.executed_state_reconstructions !== 750
      || !downstream.mixed_schedule_ambiguity_preserved) exact = false;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_PARENT_RECEIPT,
    parent_schema: parent.schema,
    collision_membrane: freeze({
      pr_753_fadt_universal_authority_partition_preserved: true,
      pr_843_raw_fifteen_partition_atlas_preserved: true,
      generic_group_action_novelty_claim: false,
      naive_equivalence_quotient_lattice_claim: false,
    }),
    safe_authority_closure_certificate: freeze({
      repair_label_count: 4,
      inherited_action_group_order: EXPECTED_ACTION_GROUP_ORDER,
      inherited_receiver_witness_family: EXPECTED_RECEIVER_WITNESSES,
      inherited_action_multiplicity: EXPECTED_ACTION_MULTIPLICITY,
      raw_claim_count: EXPECTED_RAW_PARTITIONS,
      fixed_claim_count: EXPECTED_FIXED_CLAIMS,
      nonfixed_claim_count: EXPECTED_NONFIXED_CLAIMS,
      safe_equivalence_class_count: EXPECTED_CLOSURE_FIBERS,
      fiber_sizes_descending: EXPECTED_FIBER_SIZES,
      distinct_closed_safe_family_distribution: EXPECTED_CLOSED_SAFE_FAMILY_DISTRIBUTION,
      all_subgroup_count: EXPECTED_SUBGROUPS,
      fixed_subgroup_count: EXPECTED_FIXED_SUBGROUPS,
      nonfixed_subgroup_count: EXPECTED_NONFIXED_SUBGROUPS,
      fixed_claim_lattice_cover_count: EXPECTED_FIXED_LATTICE_COVERS,
      raw_equality_covers_explained_by_closure: EXPECTED_EQUALITY_COVERS,
      raw_strict_covers_cross_closure_fibers: EXPECTED_STRICT_COVERS,
      cross_type_census_agreement: crossTypeCensusAgreement,
      per_type: freeze(perType),
      exact,
    }),
    downstream_control_certificate: downstream,
    passed: exact,
    classifications: freeze(exact ? [
      'IN_THE_FIXED_WIDTH_EIGHT_S3_AIA_FIXTURE_THE_FIFTEEN_REPAIR_LABEL_CLAIM_PARTITIONS_COLLAPSE_TO_SEVEN_CANONICAL_ORBIT_CLOSED_SAFE_AUTHORITY_CLASSES_EACH_WITH_A_UNIQUE_FINEST_ZERO_ADDITIONAL_COST_CLAIM_REPRESENTATIVE',
      'THE_EIGHT_ZERO_COST_REFINEMENT_COVERS_EARNED_IN_PR_843_ARE_EXACTLY_THE_EIGHT_NONFIXED_CLAIMS_REFINING_TO_THEIR_ORBIT_CLOSURES_WHILE_EVERY_REFINEMENT_BEYOND_CLOSURE_STRICTLY_REDUCES_SAFE_WITNESS_AUTHORITY',
      'THE_EARNED_EIGHT_ACTION_REPAIR_LABEL_GROUP_HAS_TEN_SUBGROUPS_BUT_ONLY_SEVEN_ARE_ORBIT_CLOSED_MAXIMUM_SAFE_CLAIM_AUTHORITIES_AND_THE_REMAINING_THREE_EXPAND_STRICTLY_UNDER_H_TO_K_OF_ORB_H',
      'SAFE_CLAIM_CLOSURE_AND_ORBIT_CLOSED_SAFE_SUBGROUPS_FORM_A_SEVEN_BY_SEVEN_FIXED_POINT_ANTI_ISOMORPHIC_CORRESPONDENCE_IN_THIS_FIXTURE_WHILE_RAW_SAME_SAFE_FAMILY_EQUIVALENCE_FAILS_TO_BE_A_LATTICE_CONGRUENCE',
      'CLAIM_SYNTAX_CAN_CONTAIN_ZERO_COST_REDUNDANCY_BUT_CUSTODY_AUTHORITY_IS_INDEXED_BY_THE_CANONICAL_CLOSURE_CLASS_NOT_BY_RAW_PARTITION_WORDING_OR_SAFE_FAMILY_CARDINALITY_ALONE',
    ] : []),
    scars: freeze([
      'RAW_CLAIM_PARTITION != CANONICAL_CLOSED_CLAIM',
      'SAME_SAFE_FAMILY != SAME_RAW_CLAIM',
      'SAFE_FAMILY_CARDINALITY != SAFE_FAMILY_IDENTITY',
      'SAFE_EQUIVALENCE != LATTICE_CONGRUENCE',
      'FIXED_POINT_LATTICE != NAIVE_EQUIVALENCE_QUOTIENT_LATTICE',
      'RAW_PARTITION_TO_SAFE_SUBGROUP != ANTI_ISOMORPHISM',
      'ORBIT_PARTITION != PHYSICAL_ORBIT',
      'ACTION_SUBGROUP != PHYSICAL_SYMMETRY_GROUP',
      'SUBGROUP_MEMBERSHIP != MAXIMUM_SAFE_CLAIM_AUTHORITY',
      'ZERO_COST_REFINEMENT != NEW_WITNESS_AUTHORITY',
      'CLAIM_CLOSURE != TEMPORAL_CLOSURE',
      'CLAIM_CLOSURE != SEMANTIC_COMPLETENESS',
      'GENERIC_FINITE_ACTION_LEMMA != TD613_NOVELTY_CLAIM',
      'SEVEN_FIXED_POINTS != UNIVERSAL_INFORMATION_LATTICE',
      'REPAIR_LABEL_CLOSURE != COMPLETE_SCHEDULE_RECONSTRUCTION',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomySafeAuthorityClosureCorrespondenceProjection(receiver) {
  const certificate = dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified safe-authority closure correspondence');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.safe-authority-closure-child-legible/v0.1',
      truths: freeze([
        'FIFTEEN_RAW_REPAIR_LABEL_CLAIMS_HAVE_SEVEN_CUSTODY_DISTINCT_CLOSED_AUTHORITY_CLASSES_HERE',
        'EIGHT_ADDED_DISTINCTIONS_COST_ZERO_EXTRA_WITNESS_DETAIL_BECAUSE_THE_SAFE_FAMILY_ALREADY_FORCES_THEM',
        'FOUR_DIFFERENT_SAFE_FAMILIES_HAVE_144_WITNESSES_SO_SIZE_ALONE_DOES_NOT_IDENTIFY_AUTHORITY',
        'SAME_SAFE_FAMILY_DOES_NOT_LICENSE_A_NAIVE_QUOTIENT_LATTICE',
        'AN_ARBITRARY_ACTION_SUBGROUP_CAN_BE_SMALLER_THAN_THE_MAXIMUM_SAFE_FAMILY_FOR_ITS_OWN_ORBIT_CLAIM',
      ]),
      complete_claim_closure_atlas_exposed: false,
      complete_subgroup_atlas_exposed: false,
      fixed_lattice_cover_table_exposed: false,
      noncongruence_witness_details_exposed: false,
      latent_state_exposed: false,
      schedule_history_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.safe-authority-closure-loom-technical/v0.1',
      summary: freeze({
        raw_claims: certificate.safe_authority_closure_certificate.raw_claim_count,
        closed_claims: certificate.safe_authority_closure_certificate.fixed_claim_count,
        safe_equivalence_classes: certificate.safe_authority_closure_certificate.safe_equivalence_class_count,
        all_action_subgroups: certificate.safe_authority_closure_certificate.all_subgroup_count,
        orbit_closed_action_subgroups: certificate.safe_authority_closure_certificate.fixed_subgroup_count,
        fixed_claim_lattice_covers: certificate.safe_authority_closure_certificate.fixed_claim_lattice_cover_count,
        distinct_closed_safe_family_distribution: certificate.safe_authority_closure_certificate.distinct_closed_safe_family_distribution,
      }),
      complete_claim_closure_atlas_exposed: false,
      complete_subgroup_atlas_exposed: false,
      full_receiver_witness_identity_table_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for safe-authority closure correspondence: ${receiver}`);
  }

  const h = certificate.safe_authority_closure_certificate.per_type.H;
  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      subgroup_subset_candidates_per_type: h.subgroup_subset_candidates,
      subgroup_partition_correspondence_checks_per_type: h.subgroup_partition_correspondence_checks,
      unordered_partition_pair_safe_equivalence_checks_per_type: h.unordered_partition_pair_safe_equivalence_checks,
      comparable_claim_pair_checks_per_type: h.comparable_claim_pair_checks,
      maximal_free_refinement_checks_per_type: h.maximal_free_refinement_checks,
      fixed_correspondence_pair_checks_per_type: h.fixed_correspondence_pair_checks,
      fixed_claim_sublattice_pair_checks_per_type: h.fixed_claim_sublattice_pair_checks,
      inherited_parent_receiver_partition_label_checks_per_type: 34560,
      state_reconstructions: certificate.downstream_control_certificate.executed_state_reconstructions,
      represented_larger_cross_product_claimed_executed: false,
    }),
    claim_ceiling: freeze({
      fixed_fixture_safe_authority_closure_correspondence: true,
      universal_information_lattice_theorem: false,
      universal_group_action_novelty_theorem: false,
      universal_galois_correspondence_novelty_theorem: false,
      naive_equivalence_quotient_lattice: false,
      safe_equivalence_lattice_congruence: false,
      universal_ai_architecture_theorem: false,
      shannon_capacity: false,
      operational_path_groupoid: false,
      operational_inverse: false,
      physical_symmetry: false,
      physical_gauge: false,
      physical_holonomy: false,
      continuum_tomography: false,
      semantic_completeness: false,
      complete_schedule_reconstruction: false,
      source_state_mutation: false,
      production: false,
      release: false,
      deployment: false,
    }),
  });
}

export function rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_information_lattice_theorem === true
    || ceiling.universal_group_action_novelty_theorem === true
    || ceiling.universal_galois_correspondence_novelty_theorem === true
    || ceiling.naive_equivalence_quotient_lattice === true
    || ceiling.safe_equivalence_lattice_congruence === true
    || ceiling.universal_ai_architecture_theorem === true
    || ceiling.shannon_capacity === true
    || ceiling.operational_path_groupoid === true
    || ceiling.operational_inverse === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_gauge === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.semantic_completeness === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.source_state_mutation === true
    || ceiling.production === true
    || ceiling.release === true
    || ceiling.deployment === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const runtime = candidate?.runtime_binding === true;
  const congruenceFallacy = candidate?.safe_equivalence_is_lattice_congruence === true;
  const quotientFallacy = candidate?.same_safe_family_defines_naive_quotient_lattice === true;
  const rawAntiIsomorphism = candidate?.raw_partition_to_safe_subgroup_is_anti_isomorphism === true;
  const subgroupMaximalityFallacy = candidate?.every_action_subgroup_is_maximum_safe_for_its_orbit_claim === true;
  const collision = candidate?.claim_partition_753_equivalent === true
    || candidate?.replaces_pr_843_raw_partition_atlas === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.complete_claim_closure_atlas_exposed === true
    || candidate?.payload?.complete_subgroup_atlas_exposed === true
    || candidate?.payload?.fixed_lattice_cover_table_exposed === true
    || candidate?.payload?.noncongruence_witness_details_exposed === true
    || candidate?.payload?.latent_state_exposed === true
    || candidate?.payload?.schedule_history_exposed === true
  );
  return freeze({
    accepted: !authority
      && !overreach
      && !sourceMutation
      && !runtime
      && !congruenceFallacy
      && !quotientFallacy
      && !rawAntiIsomorphism
      && !subgroupMaximalityFallacy
      && !collision
      && !ashLeak,
  });
}
