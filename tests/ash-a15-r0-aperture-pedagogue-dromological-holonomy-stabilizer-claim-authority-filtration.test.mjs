import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';
import { dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-orbit-transport-witness-fiber-descent.js';
import {
  DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_SCHEMA,
  DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_PARENT_RECEIPT,
  dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate,
  compileDromologicalHolonomyStabilizerClaimAuthorityFiltrationProjection,
  rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-stabilizer-claim-authority-filtration.js';

function permutations(values) {
  const rows = [];
  function visit(prefix, remaining) {
    if (remaining.length === 0) {
      rows.push(prefix);
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit([...prefix, remaining[index]], [...remaining.slice(0, index), ...remaining.slice(index + 1)]);
    }
  }
  visit([], values);
  return rows;
}

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

function hammingInteger(left, right) {
  return integerToWord(left ^ right).reduce((sum, bit) => sum + bit, 0);
}

function setKey(values) {
  return [...values].sort((left, right) => left - right).join(',');
}

function edgeKey(edges) {
  return edges
    .map(([left, right]) => left < right ? `${left}-${right}` : `${right}-${left}`)
    .sort()
    .join('|');
}

function matchingEdges(words) {
  const edges = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      if (hammingInteger(words[left], words[right]) === 6) edges.push([left, right]);
    }
  }
  return edges;
}

function preservesMatching(action, edges) {
  return edgeKey(edges.map(([left, right]) => [action[left], action[right]])) === edgeKey(edges);
}

function composeActions(left, right) {
  return right.map(index => left[index]);
}

const parent839 = dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate();
assert.equal(parent839.passed, true);
assert.equal(
  DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_PARENT_RECEIPT,
  '4c524665fd5a3d59b0ebcd8ec44144466b15ad31',
);

const canonical = canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
assert.deepEqual(canonical, [0, 79, 179, 252]);
const canonicalKey = setKey(canonical);
const coordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(coordinatePermutations.length, 40320);

// Independent setwise derivation: do not consume the implementation's private stabilizer atlas.
const setwise = [];
for (let permutation_index = 0; permutation_index < coordinatePermutations.length; permutation_index += 1) {
  const permutation = coordinatePermutations[permutation_index];
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  for (const translation of canonical) {
    const shifted = transformed.map(value => value ^ translation);
    if (setKey(shifted) !== canonicalKey) continue;
    setwise.push({ translation, permutation_index, permutation });
  }
}
assert.equal(setwise.length, 576);

const assignments = dromologicalHolonomyDoubleCorruptionIsometryCertificate()
  .labelled_repair_orbit_certificate.representative_assignments;
const ambientS4 = permutations([0, 1, 2, 3]);
assert.equal(ambientS4.length, 24);

for (const type of ['H', 'I', 'X']) {
  const words = assignments[type].map(index => canonical[index]);
  const pointIndex = new Map(words.map((value, index) => [value, index]));
  const edges = matchingEdges(words);
  assert.equal(edges.length, 2);

  const matchingAutomorphisms = ambientS4.filter(action => preservesMatching(action, edges));
  assert.equal(matchingAutomorphisms.length, 8);
  const matchingKeys = new Set(matchingAutomorphisms.map(row => row.join(',')));

  const rows = setwise.map(witness => {
    const action = words.map(value => pointIndex.get(permuteInteger(value, witness.permutation) ^ witness.translation));
    assert.equal(action.every(Number.isInteger), true);
    return { witness, action };
  });
  const actionCounts = new Map();
  for (const row of rows) {
    const key = row.action.join(',');
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  }
  assert.equal(actionCounts.size, 8);
  assert.equal([...actionCounts.values()].every(count => count === 72), true);
  assert.deepEqual(new Set(actionCounts.keys()), matchingKeys);

  // Full-map kernel: exactly the identity induced action, multiplicity 72.
  const kernel = rows.filter(row => row.action.join(',') === '0,1,2,3');
  assert.equal(kernel.length, 72);

  // Full 576 FADT spectrum: every starting label reaches all four labels.
  for (let label = 0; label < 4; label += 1) {
    const fullSupport = new Set(rows.map(row => row.action[label]));
    assert.deepEqual([...fullSupport].sort(), [0, 1, 2, 3]);
    assert.equal(fullSupport.size, 4);

    // Selected-label authority: exact 144-element preimage of the 2-action vertex stabilizer.
    const selected = rows.filter(row => row.action[label] === label);
    assert.equal(selected.length, 144);
    assert.equal(new Set(selected.map(row => row.action.join(','))).size, 2);
    assert.deepEqual(new Set(selected.map(row => row.action[label])), new Set([label]));

    // Hostile 2: 144 is label-relative, not full-map safe.
    const movesOther = selected.find(row => row.action.some((target, index) => index !== label && target !== index));
    assert.ok(movesOther);

    // Hostile 3: any witness outside the 144 preimage moves the selected label.
    const outside = rows.find(row => row.action[label] !== label);
    assert.ok(outside);
    assert.notEqual(outside.action[label], label);
  }

  // Hostile 4: every nonkernel action moves at least one repair label.
  assert.equal(
    rows.filter(row => row.action.join(',') !== '0,1,2,3')
      .every(row => row.action.some((target, index) => target !== index)),
    true,
  );

  // Hostile 5: at least one of the other 16 S4 permutations destroys the matching and is absent from the image.
  const excluded = ambientS4.find(action => !preservesMatching(action, edges));
  assert.ok(excluded);
  assert.equal(actionCounts.has(excluded.join(',')), false);

  // Hostile 6: induced matching group is nonabelian; malformed composition order is observable.
  const actions = [...actionCounts.keys()].map(key => key.split(',').map(Number));
  let noncommuting = null;
  for (const left of actions) {
    for (const right of actions) {
      const lr = composeActions(left, right);
      const rl = composeActions(right, left);
      if (JSON.stringify(lr) !== JSON.stringify(rl)) {
        noncommuting = { left, right, lr, rl };
        break;
      }
    }
    if (noncommuting) break;
  }
  assert.ok(noncommuting);
}

// Hostile 1: concrete translation 79 still preserves the set while moving repair identity.
const translated = canonical.map(value => value ^ 79);
assert.equal(setKey(translated), canonicalKey);
const canonicalIndex = new Map(canonical.map((value, index) => [value, index]));
assert.deepEqual(translated.map(value => canonicalIndex.get(value)), [1, 0, 3, 2]);

const certificate = dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_PARENT_RECEIPT);
assert.equal(certificate.claim_authority_certificate.setwise_stabilizer_size, 576);
assert.equal(certificate.claim_authority_certificate.induced_action_count, 8);
assert.equal(certificate.claim_authority_certificate.full_repair_map_kernel_size, 72);
assert.equal(certificate.claim_authority_certificate.selected_label_receiver_preimage_size, 144);
assert.deepEqual(certificate.claim_authority_certificate.candidate_authority_filtration, {
  matching_geometry: 576,
  one_selected_repair_label: 144,
  complete_four_label_repair_map: 72,
});
assert.equal(certificate.claim_authority_certificate.executed_setwise_label_action_checks, 6912);
assert.equal(certificate.claim_authority_certificate.executed_selected_label_stabilizer_checks, 1728);
assert.equal(certificate.claim_authority_certificate.executed_kernel_label_checks, 864);
assert.equal(certificate.claim_authority_certificate.executed_action_composition_checks, 192);
assert.equal(certificate.claim_authority_certificate.executed_matching_predicate_checks, 72);
assert.equal(certificate.claim_authority_certificate.translation_79_control.exact, true);

for (const type of ['H', 'I', 'X']) {
  const row = certificate.claim_authority_certificate.per_type[type];
  assert.equal(row.exact, true);
  assert.equal(row.setwise_stabilizer_size, 576);
  assert.equal(row.induced_action_count, 8);
  assert.equal(row.matching_automorphism_count, 8);
  assert.equal(row.image_equals_matching_automorphism_group, true);
  assert.equal(row.every_action_multiplicity_72, true);
  assert.equal(row.kernel_size, 72);
  assert.equal(row.full_setwise_preserves_matching_geometry, true);
  assert.equal(row.full_setwise_preserves_complete_label_map, false);
  assert.equal(row.kernel_preserves_complete_label_map, true);
  assert.equal(row.every_nonkernel_element_moves_at_least_one_label, true);
  assert.equal(row.excluded_matching_destroying_permutation_absent_from_image, true);
  assert.ok(row.noncommuting_action_pair);
  assert.equal(row.selected_label_authority.length, 4);
  assert.equal(row.selected_label_authority.every(item =>
    item.action_stabilizer_size === 2
    && item.receiver_preimage_size === 144
    && item.fadt_signature.gamma_size === 0
    && item.selected_label_safe_but_not_global
    && item.maximal_for_selected_label), true);
  assert.equal(row.full_setwise_fadt_signatures.every(item =>
    item.union_size === 4 && item.intersection_empty && item.gamma_size === 4), true);
}

assert.equal(certificate.downstream_control_certificate.executed_state_reconstructions, 750);
assert.equal(certificate.downstream_control_certificate.mixed_schedule_ambiguity_preserved, true);
assert.equal(certificate.passed, true);

const ash = compileDromologicalHolonomyStabilizerClaimAuthorityFiltrationProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyStabilizerClaimAuthorityFiltrationProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(ash.source_state_transform, false);
assert.equal(ash.payload.full_stabilizer_table_exposed, false);
assert.equal(ash.payload.action_multiplication_table_exposed, false);
assert.equal(ash.execution_ledger.setwise_label_action_checks, 6912);
assert.equal(ash.execution_ledger.selected_label_stabilizer_checks, 1728);
assert.equal(ash.execution_ledger.kernel_label_checks, 864);
assert.equal(ash.execution_ledger.action_composition_checks, 192);
assert.equal(ash.execution_ledger.state_reconstructions, 750);

// Hostile 7: cardinality alone cannot grant selected-label authority.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  selected_label_144_claimed_full_map_safe: true,
}).accepted, false);

// Hostile 8: collapse all three claim levels.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  all_claim_levels_declared_equivalent: true,
}).accepted, false);

// Hostile 9: FADT spectrum inflation/erasure.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  full_576_gamma_claimed_zero: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  selected_label_144_global_gamma_claimed_zero: true,
}).accepted, false);

// Hostile 10: source-state mutation.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);

// Hostile 11: schedule-completion overclaim.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, complete_schedule_reconstruction: true },
}).accepted, false);

// Hostile 12: physical/gauge/operational authority widening and Ash hidden-table leakage.
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  action_kernel_claimed_physical_gauge_kernel: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, operational_inverse: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach({
  ...ash,
  payload: { ...ash.payload, full_stabilizer_table_exposed: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach(loom).accepted, true);

console.log('Ash A15-R0 stabilizer claim-authority filtration hostile passed.');
