import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';
import { dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-stabilizer-claim-authority-filtration.js';
import {
  DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_SCHEMA,
  DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_PARENT_RECEIPT,
  validateDromologicalHolonomyRepairLabelPartition,
  dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate,
  compileDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeProjection,
  rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-repair-label-partition-safe-erasure-lattice.js';

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

function canonicalPartition(blocks) {
  return blocks
    .map(block => [...block].sort((a, b) => a - b))
    .sort((left, right) => left[0] - right[0] || left.length - right.length);
}

function partitionKey(blocks) {
  return canonicalPartition(blocks).map(block => block.join(',')).join('|');
}

// Independent partition generator: restricted-growth strings, not the implementation recursion.
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

function edgeKey(edges) {
  return edges.map(([a, b]) => a < b ? `${a}-${b}` : `${b}-${a}`).sort().join('|');
}

function actionKey(action) {
  return action.join(',');
}

const parent = dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate();
assert.equal(parent.passed, true);
assert.equal(DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_PARENT_RECEIPT,
  'e0cc001a7b25b2e03deb08a9972d10ab7e47f4f5');

const canonical = canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
assert.deepEqual(canonical, [0, 79, 179, 252]);
const canonicalSetKey = setKey(canonical);
const coordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(coordinatePermutations.length, 40320);

// Independent 576-element setwise receiver family.
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
const s4 = permutations(LABELS);
assert.equal(s4.length, 24);

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
  const matchingKey = edgeKey(distanceSixEdges);

  const matchingAutomorphisms = s4.filter(action => {
    const moved = distanceSixEdges.map(([a, b]) => [action[a], action[b]]);
    return edgeKey(moved) === matchingKey;
  });
  assert.equal(matchingAutomorphisms.length, 8);

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
  assert.equal([...actionCounts.values()].every(count => count === 72), true);
  assert.deepEqual(new Set(actionCounts.keys()), new Set(matchingAutomorphisms.map(actionKey)));

  const rows = partitions.map(partition => {
    const safe = witnessActions.filter(row => preservesPartition(row.action, partition));
    const unsafe = witnessActions.filter(row => !preservesPartition(row.action, partition));
    const safeActionKeys = new Set(safe.map(row => actionKey(row.action)));
    return {
      partition,
      key: partitionKey(partition),
      shape: partition.map(block => block.length).sort((a, b) => b - a).join('-'),
      safe,
      unsafe,
      safeActionKeys,
    };
  });

  const distribution = {};
  for (const row of rows) distribution[row.safe.length] = (distribution[row.safe.length] ?? 0) + 1;
  assert.deepEqual(distribution, { 72: 5, 144: 8, 288: 1, 576: 1 });
  assert.equal(rows.reduce((sum, row) => sum + row.safe.length, 0), 2376);
  assert.equal(rows.reduce((sum, row) => sum + row.unsafe.length, 0), 6264);
  assert.equal(rows.length * setwiseWitnesses.length * LABELS.length, 34560);

  // Unique 288 layer must be exactly the inherited distance-six matching as a two-block claim.
  const matchingPartition = canonicalPartition(distanceSixEdges);
  const matchingPartitionRow = rows.find(row => row.key === partitionKey(matchingPartition));
  assert.ok(matchingPartitionRow);
  assert.equal(matchingPartitionRow.shape, '2-2');
  assert.equal(matchingPartitionRow.safe.length, 288);
  const twoTwo = rows.filter(row => row.shape === '2-2');
  assert.equal(twoTwo.length, 3);
  assert.equal(twoTwo.filter(row => row.safe.length === 288).length, 1);
  assert.equal(twoTwo.filter(row => row.key !== matchingPartitionRow.key).every(row => row.safe.length === 144), true);

  // [2,1,1] split: matching-edge pair blocks cost 144; crossing pair blocks cost 72.
  const twoOneOne = rows.filter(row => row.shape === '2-1-1');
  assert.equal(twoOneOne.length, 6);
  const matchingEdgeKeys = new Set(distanceSixEdges.map(edge => [...edge].sort((a, b) => a - b).join(',')));
  const withMatchingEdgePair = twoOneOne.filter(row => {
    const pair = row.partition.find(block => block.length === 2);
    return matchingEdgeKeys.has(pair.join(','));
  });
  assert.equal(withMatchingEdgePair.length, 2);
  assert.equal(withMatchingEdgePair.every(row => row.safe.length === 144), true);
  assert.equal(twoOneOne.filter(row => !withMatchingEdgePair.includes(row)).every(row => row.safe.length === 72), true);

  // Every nontrivial partition has an explicit outside witness giving two block supports.
  for (const row of rows) {
    if (row.partition.length === 1) {
      assert.equal(row.unsafe.length, 0);
      continue;
    }
    assert.ok(row.unsafe.length > 0);
    const outside = row.unsafe[0];
    const map = blockMap(row.partition);
    const movedLabel = LABELS.find(label => map.get(outside.action[label]) !== map.get(label));
    assert.equal(Number.isInteger(movedLabel), true);
    const support = new Set([map.get(movedLabel), map.get(outside.action[movedLabel])]);
    assert.equal(support.size, 2);
    assert.equal(map.get(movedLabel) === map.get(outside.action[movedLabel]), false);
  }

  // Complete 31-cover refinement census and antitone safe-family law.
  const covers = [];
  for (const fine of rows) {
    for (const coarse of rows) {
      if (fine.partition.length !== coarse.partition.length + 1 || !refines(fine.partition, coarse.partition)) continue;
      const inclusion = [...fine.safeActionKeys].every(key => coarse.safeActionKeys.has(key));
      const equality = inclusion && fine.safeActionKeys.size === coarse.safeActionKeys.size
        && [...coarse.safeActionKeys].every(key => fine.safeActionKeys.has(key));
      covers.push({ fine, coarse, inclusion, equality });
    }
  }
  assert.equal(covers.length, 31);
  assert.equal(covers.every(row => row.inclusion), true);
  assert.equal(covers.filter(row => row.equality).length, 8);
  assert.equal(covers.filter(row => !row.equality).length, 23);

  // Hostile: proper refinement need not strictly contract safe authority.
  const equalityCover = covers.find(row => row.equality);
  assert.ok(equalityCover);
  assert.notEqual(equalityCover.fine.key, equalityCover.coarse.key);
  assert.equal(equalityCover.fine.safe.length, equalityCover.coarse.safe.length);

  // Hostile: distinct claim partitions can share exactly the same safe action subgroup.
  let repeatedSubgroup = null;
  for (let left = 0; left < rows.length && !repeatedSubgroup; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1) {
      const a = rows[left].safeActionKeys;
      const b = rows[right].safeActionKeys;
      if (a.size === b.size && [...a].every(key => b.has(key))) {
        repeatedSubgroup = [rows[left], rows[right]];
        break;
      }
    }
  }
  assert.ok(repeatedSubgroup);
  assert.notEqual(repeatedSubgroup[0].key, repeatedSubgroup[1].key);
}

// Malformed partitions fail closed.
assert.equal(validateDromologicalHolonomyRepairLabelPartition([[0, 1], [2, 3]]), true);
assert.equal(validateDromologicalHolonomyRepairLabelPartition([[0, 1], [1, 2, 3]]), false);
assert.equal(validateDromologicalHolonomyRepairLabelPartition([[0], [1], [2]]), false);
assert.equal(validateDromologicalHolonomyRepairLabelPartition([[0, 1, 2, 4]]), false);
assert.equal(validateDromologicalHolonomyRepairLabelPartition([[], [0, 1, 2, 3]]), false);

const certificate = dromologicalHolonomyRepairLabelPartitionSafeErasureLatticeCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_REPAIR_LABEL_PARTITION_SAFE_ERASURE_LATTICE_PARENT_RECEIPT);
assert.equal(certificate.collision_membrane.pr_753_fadt_universal_authority_partition_preserved, true);
assert.equal(certificate.collision_membrane.theorem_753_restatement, false);
assert.equal(certificate.repair_label_partition_certificate.complete_partition_count, 15);
assert.deepEqual(certificate.repair_label_partition_certificate.safe_witness_distribution, { '72': 5, '144': 8, '288': 1, '576': 1 });
assert.equal(certificate.repair_label_partition_certificate.refinement_cover_count, 31);
assert.equal(certificate.repair_label_partition_certificate.strict_cover_count, 23);
assert.equal(certificate.repair_label_partition_certificate.equality_cover_count, 8);
assert.equal(certificate.repair_label_partition_certificate.unique_288_layer_present, true);
assert.equal(certificate.repair_label_partition_certificate.receiver_partition_label_checks_per_type, 34560);
assert.equal(certificate.repair_label_partition_certificate.safe_partition_witness_incidences_per_type, 2376);
assert.equal(certificate.repair_label_partition_certificate.unsafe_partition_witness_incidences_per_type, 6264);
assert.equal(certificate.repair_label_partition_certificate.cross_type_distribution_agreement, true);
assert.equal(certificate.repair_label_partition_certificate.cross_type_cover_agreement, true);
for (const type of ['H', 'I', 'X']) {
  assert.equal(certificate.repair_label_partition_certificate.per_type[type].exact, true);
}
assert.equal(certificate.downstream_control_certificate.executed_state_reconstructions, 750);
assert.equal(certificate.downstream_control_certificate.mixed_schedule_ambiguity_preserved, true);
assert.equal(certificate.passed, true);

const ash = compileDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.payload.complete_partition_atlas_exposed, false);
assert.equal(ash.payload.full_refinement_cover_table_exposed, false);
assert.equal(ash.execution_ledger.receiver_partition_label_checks_per_type, 34560);
assert.equal(ash.execution_ledger.total_receiver_partition_label_checks_across_hix, 103680);
assert.equal(ash.execution_ledger.state_reconstructions, 750);
assert.deepEqual(loom.payload.summary.safe_witness_distribution, { '72': 5, '144': 8, '288': 1, '576': 1 });

// Hostile overclaims.
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  proper_refinement_always_strict: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  partition_to_safe_subgroup_is_anti_isomorphism: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  claim_partition_753_equivalent: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, complete_schedule_reconstruction: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_information_lattice_theorem: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_gauge: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyRepairLabelPartitionSafeErasureLatticeOverreach({
  ...ash,
  payload: { ...ash.payload, complete_partition_atlas_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy repair-label partition safe-erasure lattice hostile tests passed.');
