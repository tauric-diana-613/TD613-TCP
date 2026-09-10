import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';
import { dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-repair-label-partition-safe-erasure-lattice.js';
import {
  DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_SCHEMA,
  DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_PARENT_RECEIPT,
  dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate,
  compileDromologicalHolonomySafeAuthorityClosureCorrespondenceProjection,
  rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-safe-authority-closure-correspondence.js';

const LABELS = [0, 1, 2, 3];

function wordToInteger(word) {
  return word.reduce((value, bit) => (value << 1) | bit, 0);
}

function integerToWord(value, width = 8) {
  return Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1);
}

function permuteInteger(value, permutation) {
  const bits = integerToWord(value);
  return wordToInteger(permutation.map(index => bits[index]));
}

function hamming(left, right) {
  return integerToWord(left ^ right).reduce((sum, bit) => sum + bit, 0);
}

function setKey(values) {
  return [...values].sort((a, b) => a - b).join(',');
}

function permutations(values) {
  const out = [];
  const visit = (prefix, rest) => {
    if (rest.length === 0) {
      out.push(prefix);
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit([...prefix, rest[index]], [...rest.slice(0, index), ...rest.slice(index + 1)]);
    }
  };
  visit([], values);
  return out;
}

function powerset(values) {
  let rows = [[]];
  for (const value of values) rows = [...rows, ...rows.map(row => [...row, value])];
  return rows;
}

function canonicalPartition(blocks) {
  return blocks
    .map(block => [...block].sort((a, b) => a - b))
    .sort((left, right) => left[0] - right[0] || left.length - right.length);
}

function partitionKey(blocks) {
  return canonicalPartition(blocks).map(block => block.join(',')).join('|');
}

function restrictedGrowthPartitions(n) {
  const strings = [];
  const visit = (prefix) => {
    if (prefix.length === n) {
      strings.push(prefix);
      return;
    }
    const max = prefix.length === 0 ? -1 : Math.max(...prefix);
    for (let value = 0; value <= max + 1; value += 1) {
      if (prefix.length === 0 && value !== 0) continue;
      visit([...prefix, value]);
    }
  };
  visit([]);
  return strings.map(row => {
    const blocks = Array.from({ length: Math.max(...row) + 1 }, () => []);
    row.forEach((block, label) => blocks[block].push(label));
    return canonicalPartition(blocks);
  });
}

function blockMap(partition) {
  const map = new Map();
  partition.forEach((block, index) => block.forEach(label => map.set(label, index)));
  return map;
}

function preservesPartition(action, partition) {
  const map = blockMap(partition);
  return LABELS.every(label => map.get(action[label]) === map.get(label));
}

function refines(fine, coarse) {
  const coarseMap = blockMap(coarse);
  return fine.every(block => block.every(label => coarseMap.get(label) === coarseMap.get(block[0])));
}

function actionKey(action) {
  return action.join(',');
}

function compose(left, right) {
  return LABELS.map(label => left[right[label]]);
}

function inverse(action) {
  const out = Array(4).fill(null);
  action.forEach((target, source) => { out[target] = source; });
  return out;
}

function subgroupKey(keys) {
  return [...keys].sort().join(';');
}

function setEqual(left, right) {
  return left.size === right.size && [...left].every(value => right.has(value));
}

function setSubset(left, right) {
  return [...left].every(value => right.has(value));
}

function orbitPartition(keys, actionMap) {
  const unseen = new Set(LABELS);
  const blocks = [];
  while (unseen.size > 0) {
    const seed = Math.min(...unseen);
    const orbit = new Set(keys.map(key => actionMap.get(key)[seed]));
    blocks.push([...orbit].sort((a, b) => a - b));
    orbit.forEach(label => unseen.delete(label));
  }
  return canonicalPartition(blocks);
}

// Independent subgroup enumerator: recursive powerset materialization, not implementation bitmasks.
function enumerateSubgroupsIndependently(actions) {
  const actionMap = new Map(actions.map(action => [actionKey(action), action]));
  const keys = [...actionMap.keys()].sort();
  const identity = actionKey(LABELS);
  const subsets = powerset(keys);
  assert.equal(subsets.length, 256);
  const groups = [];
  for (const subset of subsets) {
    const set = new Set(subset);
    if (!set.has(identity)) continue;
    let valid = true;
    for (const leftKey of subset) {
      if (!set.has(actionKey(inverse(actionMap.get(leftKey))))) {
        valid = false;
        break;
      }
      for (const rightKey of subset) {
        if (!set.has(actionKey(compose(actionMap.get(leftKey), actionMap.get(rightKey))))) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
    if (valid) groups.push({ keys: [...subset].sort(), key: subgroupKey(subset), order: subset.length });
  }
  groups.sort((left, right) => left.order - right.order || left.key.localeCompare(right.key));
  return { groups, actionMap };
}

function partitionMeet(left, right) {
  const parent = LABELS.map(label => label);
  const find = value => {
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

function immediateCover(fine, coarse, candidates) {
  if (fine.key === coarse.key || !refines(fine.partition, coarse.partition)) return false;
  return !candidates.some(middle => middle.key !== fine.key && middle.key !== coarse.key
    && refines(middle.partition, coarse.partition)
    && refines(fine.partition, middle.partition));
}

const parent = dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate();
assert.equal(parent.passed, true);
assert.equal(DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_PARENT_RECEIPT,
  'a7726078034328d9cad811ff9d8f73f52fd26729');

const canonical = canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
assert.deepEqual(canonical, [0, 79, 179, 252]);
const canonicalSetKey = setKey(canonical);
const coordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(coordinatePermutations.length, 40320);

// Independent receiver-witness reconstruction from the width-eight repair code.
const setwiseWitnesses = [];
for (let permutationIndex = 0; permutationIndex < coordinatePermutations.length; permutationIndex += 1) {
  const permutation = coordinatePermutations[permutationIndex];
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  for (const translation of canonical) {
    const shifted = transformed.map(value => value ^ translation);
    if (setKey(shifted) === canonicalSetKey) {
      setwiseWitnesses.push({ permutation, permutation_index: permutationIndex, translation });
    }
  }
}
assert.equal(setwiseWitnesses.length, 576);

const partitions = restrictedGrowthPartitions(4);
assert.equal(partitions.length, 15);
assert.equal(new Set(partitions.map(partitionKey)).size, 15);
const assignments = dromologicalHolonomyDoubleCorruptionIsometryCertificate()
  .labelled_repair_orbit_certificate.representative_assignments;

for (const type of ['H', 'I', 'X']) {
  const words = assignments[type].map(index => canonical[index]);
  const wordIndex = new Map(words.map((word, index) => [word, index]));
  const distanceSixEdges = [];
  for (let left = 0; left < 4; left += 1) {
    for (let right = left + 1; right < 4; right += 1) {
      if (hamming(words[left], words[right]) === 6) distanceSixEdges.push([left, right]);
    }
  }
  assert.equal(distanceSixEdges.length, 2);
  assert.equal(new Set(distanceSixEdges.flat()).size, 4);

  const witnessActions = setwiseWitnesses.map(witness => {
    const action = words.map(word => {
      const transformed = permuteInteger(word, witness.permutation) ^ witness.translation;
      return wordIndex.get(transformed);
    });
    assert.equal(action.every(Number.isInteger), true);
    return { witness, action };
  });
  const actionCounts = new Map();
  for (const row of witnessActions) {
    const key = actionKey(row.action);
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  }
  assert.equal(actionCounts.size, 8);
  assert.equal([...actionCounts.values()].every(value => value === 72), true);
  const actions = [...actionCounts.keys()].sort().map(key => key.split(',').map(Number));
  const { groups: subgroups, actionMap } = enumerateSubgroupsIndependently(actions);
  assert.equal(subgroups.length, 10);
  const subgroupDistribution = {};
  for (const group of subgroups) subgroupDistribution[group.order] = (subgroupDistribution[group.order] ?? 0) + 1;
  assert.deepEqual(subgroupDistribution, { 1: 1, 2: 5, 4: 3, 8: 1 });

  const rows = partitions.map(partition => {
    const safeWitnesses = witnessActions.filter(row => preservesPartition(row.action, partition));
    const safeActionKeys = new Set(safeWitnesses.map(row => actionKey(row.action)));
    assert.equal(safeWitnesses.length, safeActionKeys.size * 72);
    const closurePartition = orbitPartition([...safeActionKeys], actionMap);
    return {
      partition,
      key: partitionKey(partition),
      safeWitnesses,
      safeActionKeys,
      safeGroupKey: subgroupKey([...safeActionKeys]),
      closurePartition,
      closureKey: partitionKey(closurePartition),
      fixed: partitionKey(partition) === partitionKey(closurePartition),
    };
  });
  const byKey = new Map(rows.map(row => [row.key, row]));

  // Claim closure laws and unique finest safe-equivalence representatives.
  for (const row of rows) {
    assert.equal(refines(row.closurePartition, row.partition), true);
    const closed = byKey.get(row.closureKey);
    assert.ok(closed);
    assert.equal(closed.closureKey, row.closureKey);
    assert.equal(setEqual(row.safeActionKeys, closed.safeActionKeys), true);
  }

  const fibers = new Map();
  for (const row of rows) {
    if (!fibers.has(row.safeGroupKey)) fibers.set(row.safeGroupKey, []);
    fibers.get(row.safeGroupKey).push(row);
  }
  assert.equal(fibers.size, 7);
  assert.deepEqual([...fibers.values()].map(values => values.length).sort((a, b) => b - a), [5, 3, 3, 1, 1, 1, 1]);
  for (const members of fibers.values()) {
    const fixed = members.filter(row => row.fixed);
    assert.equal(fixed.length, 1);
    assert.equal(members.every(row => refines(fixed[0].partition, row.partition)), true);
  }

  let pairChecks = 0;
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1) {
      pairChecks += 1;
      const sameSafe = rows[left].safeGroupKey === rows[right].safeGroupKey;
      const sameClosedClaim = rows[left].closureKey === rows[right].closureKey;
      assert.equal(sameSafe, sameClosedClaim);
    }
  }
  assert.equal(pairChecks, 105);

  const fixedClaims = rows.filter(row => row.fixed);
  const nonfixedClaims = rows.filter(row => !row.fixed);
  assert.equal(fixedClaims.length, 7);
  assert.equal(nonfixedClaims.length, 8);

  const closedSafeDistribution = {};
  for (const row of fixedClaims) closedSafeDistribution[row.safeWitnesses.length] = (closedSafeDistribution[row.safeWitnesses.length] ?? 0) + 1;
  assert.deepEqual(closedSafeDistribution, { 72: 1, 144: 4, 288: 1, 576: 1 });
  assert.equal(new Set(fixedClaims.filter(row => row.safeWitnesses.length === 144).map(row => row.safeGroupKey)).size, 4);

  // The eight zero-cost #843 covers are exactly the eight nonfixed closure arrows.
  const rawCovers = [];
  for (const fine of rows) {
    for (const coarse of rows) {
      if (fine.partition.length !== coarse.partition.length + 1 || !refines(fine.partition, coarse.partition)) continue;
      const inclusion = setSubset(fine.safeActionKeys, coarse.safeActionKeys);
      const equality = inclusion && setEqual(fine.safeActionKeys, coarse.safeActionKeys);
      rawCovers.push({ fine, coarse, inclusion, equality });
    }
  }
  assert.equal(rawCovers.length, 31);
  assert.equal(rawCovers.filter(row => row.equality).length, 8);
  assert.equal(rawCovers.filter(row => !row.equality).length, 23);
  const equalityArrows = new Set(rawCovers.filter(row => row.equality).map(row => `${row.coarse.key}->${row.fine.key}`));
  const closureArrows = new Set(nonfixedClaims.map(row => `${row.key}->${row.closureKey}`));
  assert.equal(setEqual(equalityArrows, closureArrows), true);
  assert.equal(rawCovers.filter(row => !row.equality).every(row => row.fine.closureKey !== row.coarse.closureKey), true);

  // Every refinement beyond a closed claim must strictly reduce safe authority.
  for (const row of rows) {
    const closed = byKey.get(row.closureKey);
    for (const candidate of rows) {
      if (candidate.key === closed.key || !refines(candidate.partition, closed.partition)) continue;
      assert.equal(setSubset(candidate.safeActionKeys, row.safeActionKeys), true);
      assert.ok(candidate.safeActionKeys.size < row.safeActionKeys.size);
    }
  }

  // Exhaustive subgroup/partition correspondence: H <= K(pi) iff Orb(H) refines pi.
  let correspondenceChecks = 0;
  const subgroupClosureRows = [];
  for (const group of subgroups) {
    const orbit = orbitPartition(group.keys, actionMap);
    const orbitRow = byKey.get(partitionKey(orbit));
    assert.ok(orbitRow);
    const closureKeys = orbitRow.safeActionKeys;
    const fixed = group.key === subgroupKey([...closureKeys]);
    assert.equal(setSubset(new Set(group.keys), closureKeys), true);
    subgroupClosureRows.push({
      ...group,
      orbit,
      orbitKey: partitionKey(orbit),
      closureKey: subgroupKey([...closureKeys]),
      closureOrder: closureKeys.size,
      fixed,
    });
    for (const claim of rows) {
      correspondenceChecks += 1;
      assert.equal(
        setSubset(new Set(group.keys), claim.safeActionKeys),
        refines(orbit, claim.partition),
      );
    }
  }
  assert.equal(correspondenceChecks, 150);

  const fixedSubgroups = subgroupClosureRows.filter(row => row.fixed);
  const nonfixedSubgroups = subgroupClosureRows.filter(row => !row.fixed);
  assert.equal(fixedSubgroups.length, 7);
  assert.equal(nonfixedSubgroups.length, 3);
  const expansionSpectrum = {};
  for (const row of nonfixedSubgroups) {
    const key = `${row.order}->${row.closureOrder}`;
    expansionSpectrum[key] = (expansionSpectrum[key] ?? 0) + 1;
    const closedGroup = subgroupClosureRows.find(candidate => candidate.key === row.closureKey);
    assert.ok(closedGroup);
    assert.equal(closedGroup.fixed, true);
  }
  assert.deepEqual(expansionSpectrum, { '2->4': 1, '4->8': 2 });

  // Seven-by-seven fixed-point anti-isomorphic correspondence.
  const fixedGroupKeySet = new Set(fixedSubgroups.map(row => row.key));
  for (const claim of fixedClaims) {
    assert.equal(fixedGroupKeySet.has(claim.safeGroupKey), true);
    assert.equal(partitionKey(orbitPartition([...claim.safeActionKeys], actionMap)), claim.key);
  }
  for (const group of fixedSubgroups) {
    const claim = byKey.get(group.orbitKey);
    assert.ok(claim?.fixed);
    assert.equal(claim.safeGroupKey, group.key);
  }
  let fixedPairChecks = 0;
  for (const coarse of fixedClaims) {
    for (const fine of fixedClaims) {
      fixedPairChecks += 1;
      assert.equal(
        refines(fine.partition, coarse.partition),
        setSubset(fine.safeActionKeys, coarse.safeActionKeys),
      );
    }
  }
  assert.equal(fixedPairChecks, 49);

  // Seven fixed claims form a genuine sublattice in this fixture; raw equivalence still does not.
  const fixedKeys = new Set(fixedClaims.map(row => row.key));
  for (const left of fixedClaims) {
    for (const right of fixedClaims) {
      assert.equal(fixedKeys.has(partitionKey(partitionMeet(left.partition, right.partition))), true);
      assert.equal(fixedKeys.has(partitionKey(partitionJoin(left.partition, right.partition))), true);
    }
  }
  const fixedCovers = [];
  for (const fine of fixedClaims) {
    for (const coarse of fixedClaims) {
      if (immediateCover(fine, coarse, fixedClaims)) fixedCovers.push({ fine, coarse });
    }
  }
  assert.equal(fixedCovers.length, 9);

  // Matching-relative noncongruence witness, instantiated independently for H/I/X.
  const [[a, b], [c, d]] = distanceSixEdges;
  const pi0 = canonicalPartition(LABELS.map(label => [label]));
  const pi1 = canonicalPartition([[a, c], [b], [d]]);
  const tau = canonicalPartition([[a, d], [b], [c]]);
  const pi0Row = byKey.get(partitionKey(pi0));
  const pi1Row = byKey.get(partitionKey(pi1));
  assert.ok(pi0Row && pi1Row);
  assert.equal(pi0Row.safeGroupKey, pi1Row.safeGroupKey);
  const meet0 = byKey.get(partitionKey(partitionMeet(pi0, tau)));
  const meet1 = byKey.get(partitionKey(partitionMeet(pi1, tau)));
  assert.ok(meet0 && meet1);
  assert.notEqual(meet0.safeGroupKey, meet1.safeGroupKey);
  assert.ok(meet1.safeActionKeys.size > meet0.safeActionKeys.size);

  // Compare independent hostile census with implementation certificate for this type.
  const implementation = dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate()
    .safe_authority_closure_certificate.per_type[type];
  assert.equal(implementation.exact, true);
  assert.equal(implementation.raw_claim_count, 15);
  assert.equal(implementation.fixed_claim_count, 7);
  assert.equal(implementation.nonfixed_claim_count, 8);
  assert.equal(implementation.safe_equivalence_class_count, 7);
  assert.deepEqual(implementation.fiber_sizes_descending, [5, 3, 3, 1, 1, 1, 1]);
  assert.deepEqual(implementation.distinct_closed_safe_family_distribution, { '72': 1, '144': 4, '288': 1, '576': 1 });
  assert.equal(implementation.distinct_144_safe_family_identities, 4);
  assert.equal(implementation.equality_covers_equal_nonfixed_closure_arrows, true);
  assert.equal(implementation.subgroup_count, 10);
  assert.deepEqual(implementation.subgroup_order_distribution, { '1': 1, '2': 5, '4': 3, '8': 1 });
  assert.equal(implementation.fixed_subgroup_count, 7);
  assert.equal(implementation.nonfixed_subgroup_count, 3);
  assert.deepEqual(implementation.nonfixed_subgroup_expansion_spectrum, { '2->4': 1, '4->8': 2 });
  assert.equal(implementation.subgroup_partition_correspondence_checks, 150);
  assert.equal(implementation.unordered_partition_pair_safe_equivalence_checks, 105);
  assert.equal(implementation.fixed_claim_lattice_cover_count, 9);
  assert.equal(implementation.fixed_claims_closed_under_ambient_meet_and_join, true);
  assert.equal(implementation.noncongruence_witness.safe_equivalence_is_not_lattice_congruence, true);
}

const certificate = dromologicalHolonomySafeAuthorityClosureCorrespondenceCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_PARENT_RECEIPT);
assert.equal(certificate.collision_membrane.pr_753_fadt_universal_authority_partition_preserved, true);
assert.equal(certificate.collision_membrane.pr_843_raw_fifteen_partition_atlas_preserved, true);
assert.equal(certificate.collision_membrane.generic_group_action_novelty_claim, false);
assert.equal(certificate.collision_membrane.naive_equivalence_quotient_lattice_claim, false);
assert.equal(certificate.safe_authority_closure_certificate.raw_claim_count, 15);
assert.equal(certificate.safe_authority_closure_certificate.fixed_claim_count, 7);
assert.equal(certificate.safe_authority_closure_certificate.nonfixed_claim_count, 8);
assert.equal(certificate.safe_authority_closure_certificate.safe_equivalence_class_count, 7);
assert.deepEqual(certificate.safe_authority_closure_certificate.fiber_sizes_descending, [5, 3, 3, 1, 1, 1, 1]);
assert.deepEqual(certificate.safe_authority_closure_certificate.distinct_closed_safe_family_distribution,
  { '72': 1, '144': 4, '288': 1, '576': 1 });
assert.equal(certificate.safe_authority_closure_certificate.all_subgroup_count, 10);
assert.equal(certificate.safe_authority_closure_certificate.fixed_subgroup_count, 7);
assert.equal(certificate.safe_authority_closure_certificate.nonfixed_subgroup_count, 3);
assert.equal(certificate.safe_authority_closure_certificate.fixed_claim_lattice_cover_count, 9);
assert.equal(certificate.safe_authority_closure_certificate.raw_equality_covers_explained_by_closure, 8);
assert.equal(certificate.safe_authority_closure_certificate.raw_strict_covers_cross_closure_fibers, 23);
assert.equal(certificate.safe_authority_closure_certificate.cross_type_census_agreement, true);
assert.equal(certificate.downstream_control_certificate.executed_state_reconstructions, 750);
assert.equal(certificate.downstream_control_certificate.mixed_schedule_ambiguity_preserved, true);
assert.equal(certificate.passed, true);

const ash = compileDromologicalHolonomySafeAuthorityClosureCorrespondenceProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomySafeAuthorityClosureCorrespondenceProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_claim_closure_atlas_exposed, false);
assert.equal(ash.payload.complete_subgroup_atlas_exposed, false);
assert.equal(ash.payload.noncongruence_witness_details_exposed, false);
assert.equal(ash.execution_ledger.subgroup_subset_candidates_per_type, 256);
assert.equal(ash.execution_ledger.subgroup_partition_correspondence_checks_per_type, 150);
assert.equal(ash.execution_ledger.unordered_partition_pair_safe_equivalence_checks_per_type, 105);
assert.equal(ash.execution_ledger.state_reconstructions, 750);
assert.deepEqual(loom.payload.summary.distinct_closed_safe_family_distribution,
  { '72': 1, '144': 4, '288': 1, '576': 1 });

// Hostile claim widening and category collapses fail closed.
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  safe_equivalence_is_lattice_congruence: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  same_safe_family_defines_naive_quotient_lattice: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  raw_partition_to_safe_subgroup_is_anti_isomorphism: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  every_action_subgroup_is_maximum_safe_for_its_orbit_claim: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  claim_partition_753_equivalent: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  replaces_pr_843_raw_partition_atlas: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_galois_correspondence_novelty_theorem: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, naive_equivalence_quotient_lattice: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_symmetry: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, complete_schedule_reconstruction: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomySafeAuthorityClosureCorrespondenceOverreach({
  ...ash,
  payload: { ...ash.payload, complete_subgroup_atlas_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy safe-authority closure correspondence hostile tests passed.');
