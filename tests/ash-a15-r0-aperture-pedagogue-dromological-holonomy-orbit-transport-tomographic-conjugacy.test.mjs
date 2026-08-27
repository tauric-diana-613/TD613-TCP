import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { REPAIR_MASK_DOMAIN } from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';
import {
  DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_SCHEMA,
  DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_PARENT_RECEIPT,
  buildDromologicalHolonomyOrbitTransportAtlas,
  validateDromologicalHolonomyOrbitTransportAtlas,
  dromologicalHolonomyOrbitTransportConjugacyCertificate,
  compileDromologicalHolonomyOrbitTransportConjugacyProjection,
  rejectDromologicalHolonomyOrbitTransportConjugacyOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-orbit-transport-tomographic-conjugacy.js';

function wordToInteger(word) {
  return word.reduce((value, bit) => (value << 1) | bit, 0);
}

function integerToWord(value, width = 8) {
  return Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1);
}

function permuteInteger(value, permutation) {
  const input = integerToWord(value);
  return wordToInteger(permutation.map(index => input[index]));
}

function hamming(left, right) {
  let value = (left ^ right) >>> 0;
  let count = 0;
  while (value !== 0) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function setKey(words) {
  return [...words].sort((left, right) => left - right).join(',');
}

function pack(words) {
  return (
    (words[0] & 0xff)
    | ((words[1] & 0xff) << 8)
    | ((words[2] & 0xff) << 16)
    | ((words[3] & 0xff) << 24)
  ) >>> 0;
}

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

function repairType(leftMask, rightMask) {
  const dH = leftMask[0] ^ rightMask[0];
  const dI = leftMask[1] ^ rightMask[1];
  if (dH === 1 && dI === 0) return 'H';
  if (dH === 0 && dI === 1) return 'I';
  if (dH === 1 && dI === 1) return 'X';
  throw new Error('distinct repair masks required');
}

function longType(words) {
  const types = [];
  for (let left = 0; left < 4; left += 1) {
    for (let right = left + 1; right < 4; right += 1) {
      if (hamming(words[left], words[right]) === 6) {
        types.push(repairType(REPAIR_MASK_DOMAIN[left], REPAIR_MASK_DOMAIN[right]));
      }
    }
  }
  const unique = [...new Set(types)];
  return types.length === 2 && unique.length === 1 ? unique[0] : null;
}

const parent = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
assert.equal(parent.passed, true);
assert.equal(parent.labelled_repair_orbit_certificate.labelled_isometry_orbit_size, 143360);
assert.equal(parent.labelled_repair_orbit_certificate.assignment_orbit_count, 3);
assert.equal(parent.declared_isometry_orbit_certificate.full_declared_isometry_group_size, 10321920);
assert.equal(DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_PARENT_RECEIPT, 'a0d88e26860f4d9c25feed21ab2d080f70b45f20');

const canonical = canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
const coordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(coordinatePermutations.length, 40320);

// Independent finite transport geometry: 280 normalized flats.
const normalizedFlats = new Map();
for (const permutation of coordinatePermutations) {
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  normalizedFlats.set(setKey(transformed), [...transformed].sort((a, b) => a - b));
}
assert.equal(normalizedFlats.size, 280);

// Every normalized two-flat has exactly 64 affine cosets.
for (const flat of normalizedFlats.values()) {
  const cosets = new Set();
  for (let translation = 0; translation < 256; translation += 1) {
    cosets.add(setKey(flat.map(value => value ^ translation)));
  }
  assert.equal(cosets.size, 64);
}

// Independent induced unlabelled stabilizer action: 576 elements, 8 codepoint actions.
const canonicalKey = setKey(canonical);
const pointIndex = new Map(canonical.map((value, index) => [value, index]));
let fullSetStabilizer = 0;
const inducedActions = new Set();
for (const permutation of coordinatePermutations) {
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  for (const translation of canonical) {
    const shifted = transformed.map(value => value ^ translation);
    if (setKey(shifted) !== canonicalKey) continue;
    fullSetStabilizer += 1;
    const induced = shifted.map(value => pointIndex.get(value));
    assert.equal(induced.every(Number.isInteger), true);
    inducedActions.add(induced.join(','));
  }
}
assert.equal(fullSetStabilizer, 576);
assert.equal(inducedActions.size, 8);
assert.equal(280 * 64 * 8, 143360);

// Independent labelled stabilizer audit: each H/I/X representative has exactly 72 elements.
const representatives = parent.labelled_repair_orbit_certificate.representative_assignments;
for (const type of ['H', 'I', 'X']) {
  const source = representatives[type].map(index => canonical[index]);
  assert.equal(longType(source), type);
  let stabilizer = 0;
  const translationOnly = new Set();
  const permutationOnly = new Set();
  for (let translation = 0; translation < 256; translation += 1) {
    translationOnly.add(pack(source.map(value => value ^ translation)));
  }
  for (const permutation of coordinatePermutations) {
    const transformed = source.map(value => permuteInteger(value, permutation));
    permutationOnly.add(pack(transformed));
    const translation = source[0] ^ transformed[0];
    if (source.every((value, index) => (transformed[index] ^ translation) === value)) stabilizer += 1;
  }
  assert.equal(stabilizer, 72);
  assert.equal((256 * 40320) / stabilizer, 143360);
  assert.equal(translationOnly.size, 256);
  assert.equal(permutationOnly.size, 560);
  assert.equal(translationOnly.size < 143360, true);
  assert.equal(permutationOnly.size < 143360, true);
}

// Exact implementation atlases: 143,360 per H/I/X, pairwise disjoint, 430,080 total.
const H = buildDromologicalHolonomyOrbitTransportAtlas('H');
const I = buildDromologicalHolonomyOrbitTransportAtlas('I');
const X = buildDromologicalHolonomyOrbitTransportAtlas('X');
for (const atlas of [H, I, X]) {
  assert.equal(atlas.generated_factorized_witnesses, 143360);
  assert.equal(atlas.unique_target_count, 143360);
  assert.equal(atlas.duplicate_target_derivations, 0);
  assert.equal(atlas.wrong_orbit_type_count, 0);
  assert.equal(atlas.wrong_distance_spectrum_count, 0);
  assert.equal(atlas.represented_stabilizer_multiplicity_per_target, 72);
  assert.equal(atlas.exact, true);
  assert.equal(validateDromologicalHolonomyOrbitTransportAtlas(atlas, atlas.type).accepted, true);
}
const HSet = new Set(H.target_keys);
const ISet = new Set(I.target_keys);
const XSet = new Set(X.target_keys);
assert.equal(HSet.size, 143360);
assert.equal(ISet.size, 143360);
assert.equal(XSet.size, 143360);
for (const key of HSet) {
  assert.equal(ISet.has(key), false);
  assert.equal(XSet.has(key), false);
}
for (const key of ISet) assert.equal(XSet.has(key), false);
assert.equal(HSet.size + ISet.size + XSet.size, 430080);

// Hostile 1: transport-atlas coverage deletion.
const deletedCoverage = {
  ...H,
  target_keys: H.target_keys.slice(0, -1),
  witness_packs: H.witness_packs.slice(0, -1),
};
assert.equal(validateDromologicalHolonomyOrbitTransportAtlas(deletedCoverage, 'H').accepted, false);

// Hostile 2: wrong H/I/X representative under an H atlas without the required labelled action.
const wrongOrbit = {
  ...H,
  type: 'I',
};
assert.equal(validateDromologicalHolonomyOrbitTransportAtlas(wrongOrbit, 'I').accepted, false);

// Hostile 3: non-Hamming-isometry bit map duplicates one coordinate and drops another.
// c0 -> c1 has distance 5, while the malformed duplicate-0/drop-1 map reduces it to 4.
const first = canonical[0];
const second = canonical[1];
const malformedMap = value => {
  const bits = integerToWord(value);
  return wordToInteger([bits[0], bits[0], bits[2], bits[3], bits[4], bits[5], bits[6], bits[7]]);
};
assert.equal(hamming(first, second), 5);
assert.equal(hamming(malformedMap(first), malformedMap(second)), 4);
assert.notEqual(hamming(first, second), hamming(malformedMap(first), malformedMap(second)));

// Hostiles 4 and 5: translation-only and permutation-only generation are both insufficient.
const certificate = dromologicalHolonomyOrbitTransportConjugacyCertificate();
for (const type of ['H', 'I', 'X']) {
  assert.equal(certificate.transport_geometry_certificate.pure_action_insufficiency[type].translation_only_target_count, 256);
  assert.equal(certificate.transport_geometry_certificate.pure_action_insufficiency[type].permutation_only_target_count, 560);
  assert.equal(certificate.transport_geometry_certificate.pure_action_insufficiency[type].translation_only_insufficient, true);
  assert.equal(certificate.transport_geometry_certificate.pure_action_insufficiency[type].permutation_only_insufficient, true);
}

assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_PARENT_RECEIPT);
assert.equal(certificate.transport_geometry_certificate.exact, true);
assert.deepEqual(certificate.transport_geometry_certificate.labelled_stabilizer_sizes, { H: 72, I: 72, X: 72 });
assert.deepEqual(certificate.transport_geometry_certificate.labelled_orbit_sizes_from_stabilizers, {
  H: 143360,
  I: 143360,
  X: 143360,
});
assert.deepEqual(certificate.transport_coverage_certificate.target_counts, { H: 143360, I: 143360, X: 143360 });
assert.equal(certificate.transport_coverage_certificate.target_total, 430080);
assert.equal(certificate.transport_coverage_certificate.H_I_X_cross_orbit_target_collisions, 0);
assert.equal(certificate.tomographic_conjugacy_certificate.executed_transport_received_conditions, 444);
assert.equal(certificate.tomographic_conjugacy_certificate.decoder_commutation_checks, 444);
assert.equal(certificate.tomographic_conjugacy_certificate.replay_policy_checks, 444);
assert.equal(certificate.tomographic_conjugacy_certificate.class_robust_unimodular_checks, 444);
assert.equal(certificate.tomographic_conjugacy_certificate.canonical_path_state_reconstructions, 83250);
assert.equal(certificate.tomographic_conjugacy_certificate.target_path_state_reconstructions, 83250);
assert.equal(certificate.tomographic_conjugacy_certificate.total_two_path_state_reconstructions, 166500);
assert.equal(certificate.tomographic_conjugacy_certificate.represented_all_labelled_received_conditions, 63651840);
assert.equal(certificate.tomographic_conjugacy_certificate.represented_full_cross_product_executed, false);
assert.equal(certificate.tomographic_conjugacy_certificate.receiver_transport_acts_on_latent_state, false);
assert.equal(certificate.tomographic_conjugacy_certificate.receiver_transport_acts_on_source_custody, false);
assert.equal(certificate.tomographic_conjugacy_certificate.receiver_transport_acts_on_formal_schedule_history, false);
assert.equal(certificate.tomographic_conjugacy_certificate.receiver_transport_acts_on_raw_terminal_holonomy, false);
assert.equal(certificate.tomographic_conjugacy_certificate.receiver_transport_acts_on_physical_space, false);
assert.equal(certificate.tomographic_conjugacy_certificate.mixed_terminal_holonomy_schedule_ambiguity_preserved, true);
assert.equal(certificate.tomographic_conjugacy_certificate.exact, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.classification,
  'EXACT_REPAIR_DECODING_AND_REPLAY_ASSISTED_TOMOGRAPHY_CAN_BE_TRANSPORTED_ACROSS_THE_DECLARED_MINIMAL_WIDTH_EIGHT_LABELLED_RECEIVER_ISOMETRY_ORBITS_BY_EXPLICIT_FINITE_REPRESENTATION_WITNESSES_WITHOUT_ACTING_ON_THE_SOURCE_STATE_OR_WIDENING_RECEIVER_AUTHORITY_IN_THE_FIXED_S3_AIA_FIXTURE',
);

const ash = compileDromologicalHolonomyOrbitTransportConjugacyProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyOrbitTransportConjugacyProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.equal(ash.source_state_transform, false);
assert.equal(loom.source_state_transform, false);
assert.equal(ash.execution_ledger.represented_receiver_conditions, 63651840);
assert.equal(ash.execution_ledger.executed_receiver_conditions, 444);
assert.equal(ash.execution_ledger.represented_receiver_conditions_claimed_executed, false);
assert.equal(ash.payload.transport_atlas_exposed, false);
assert.equal(ash.payload.stabilizer_atlas_exposed, false);
assert.equal(ash.payload.replay_vectors_exposed, false);
assert.equal(ash.payload.latent_state_exposed, false);
assert.equal(ash.payload.schedule_history_exposed, false);

// Hostile 6: H/I/X label-collapse attempt.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  label_collapse: true,
}).accepted, false);

// Hostile 7: latent/source-state mutation attempt.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);

// Hostile 8: schedule-completion overclaim.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, complete_schedule_reconstruction: true },
}).accepted, false);

// Hostile 9: represented cross-product inflation.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  execution_ledger: {
    ...loom.execution_ledger,
    executed_receiver_conditions: 63651840,
    represented_receiver_conditions_claimed_executed: true,
  },
}).accepted, false);

// Hostile 10: receiver-authority widening.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  authority: { ...loom.authority, inverse: true },
}).accepted, false);

// Hostile 11: Ash leakage of orbit/stabilizer/replay/state internals.
assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...ash,
  payload: {
    ...ash.payload,
    transport_atlas_exposed: true,
    stabilizer_atlas_exposed: true,
    replay_vectors_exposed: true,
    latent_state_exposed: true,
  },
}).accepted, false);

assert.equal(rejectDromologicalHolonomyOrbitTransportConjugacyOverreach({
  ...loom,
  non_hamming_isometry_bit_map: true,
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy orbit-transport tomographic conjugacy hostile tests passed.');
