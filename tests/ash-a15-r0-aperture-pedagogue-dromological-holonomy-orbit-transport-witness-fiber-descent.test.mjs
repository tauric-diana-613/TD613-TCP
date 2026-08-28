import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { REPAIR_MASK_DOMAIN } from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';
import {
  buildDromologicalHolonomyOrbitTransportAtlas,
  dromologicalHolonomyOrbitTransportConjugacyCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-orbit-transport-tomographic-conjugacy.js';
import {
  DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_SCHEMA,
  DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_PARENT_RECEIPT,
  dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate,
  compileDromologicalHolonomyOrbitTransportWitnessFiberDescentProjection,
  rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-orbit-transport-witness-fiber-descent.js';

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

function setKey(words) {
  return [...words].sort((a, b) => a - b).join(',');
}

function packLabelledWords(words) {
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

function applyWitness(value, witness) {
  return permuteInteger(value, witness.permutation) ^ witness.translation;
}

function composeWitness(left, right, permutationIndex) {
  const permutation = left.permutation.map(index => right.permutation[index]);
  const translation = permuteInteger(right.translation, left.permutation) ^ left.translation;
  return {
    translation,
    permutation,
    permutation_index: permutationIndex.get(permutation.join(',')),
  };
}

function nearestLabelled(received, words) {
  const distances = words.map((word, index) => ({
    index,
    distance: integerToWord(received ^ word).reduce((sum, bit) => sum + bit, 0),
  })).sort((a, b) => a.distance - b.distance || a.index - b.index);
  const minimum = distances[0].distance;
  const winners = distances.filter(row => row.distance === minimum);
  return winners.length === 1 ? REPAIR_MASK_DOMAIN[winners[0].index] : null;
}

const parent837 = dromologicalHolonomyOrbitTransportConjugacyCertificate();
assert.equal(parent837.passed, true);
assert.equal(DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_PARENT_RECEIPT,
  '17475d670e339d7b562194a4429fa979584da65a');

const canonical = canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
assert.deepEqual(canonical, [0, 79, 179, 252]);
const perms = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(perms.length, 40320);
const permIndex = new Map(perms.map((row, index) => [row.join(','), index]));
const identityPerm = [0, 1, 2, 3, 4, 5, 6, 7];

const orbit834 = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
const assignments = orbit834.labelled_repair_orbit_certificate.representative_assignments;
const pointwiseByType = {};
for (const type of ['H', 'I', 'X']) {
  const source = assignments[type].map(index => canonical[index]);
  const rows = [];
  for (let permutation_index = 0; permutation_index < perms.length; permutation_index += 1) {
    const permutation = perms[permutation_index];
    const translation = source[0] ^ permuteInteger(source[0], permutation);
    if (source.every(value => (permuteInteger(value, permutation) ^ translation) === value)) {
      rows.push({ translation, permutation_index, permutation });
    }
  }
  assert.equal(rows.length, 72);
  pointwiseByType[type] = { source, rows };
}

// Independent full setwise audit: 576 elements, 8 induced actions, each multiplicity 72.
const canonicalKey = setKey(canonical);
const pointIndex = new Map(canonical.map((value, index) => [value, index]));
const setwise = [];
const actionCounts = new Map();
for (let permutation_index = 0; permutation_index < perms.length; permutation_index += 1) {
  const permutation = perms[permutation_index];
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  for (const translation of canonical) {
    const shifted = transformed.map(value => value ^ translation);
    if (setKey(shifted) !== canonicalKey) continue;
    const action = shifted.map(value => pointIndex.get(value));
    assert.equal(action.every(Number.isInteger), true);
    const key = action.join(',');
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
    setwise.push({ translation, permutation_index, permutation, action });
  }
}
assert.equal(setwise.length, 576);
assert.equal(actionCounts.size, 8);
assert.equal([...actionCounts.values()].every(value => value === 72), true);
assert.equal(actionCounts.get('0,1,2,3'), 72);

// Concrete preregistered hostile: translation 79 preserves the unlabeled set but moves repair labels.
const translation79 = {
  translation: 79,
  permutation_index: permIndex.get(identityPerm.join(',')),
  permutation: identityPerm,
};
const translatedCanonical = canonical.map(value => applyWitness(value, translation79));
assert.equal(setKey(translatedCanonical), canonicalKey);
assert.deepEqual(translatedCanonical.map(value => pointIndex.get(value)), [1, 0, 3, 2]);
const identitySupport = nearestLabelled(canonical[0], canonical);
const hostileSupport = nearestLabelled(canonical[0] ^ 79, canonical);
assert.deepEqual(identitySupport, [0, 0]);
assert.deepEqual(hostileSupport, [0, 1]);
const hostileUnion = new Set([identitySupport.join(','), hostileSupport.join(',')]);
assert.equal(hostileUnion.size, 2);
assert.equal(JSON.stringify(identitySupport) === JSON.stringify(hostileSupport), false);

function validatesPointwiseFibre(rows, source) {
  return rows.length === 72 && rows.every(witness =>
    source.every(value => applyWitness(value, witness) === value));
}

// Hostile 1: 71-of-72 fibre deletion fails exact fibre certification.
assert.equal(validatesPointwiseFibre(pointwiseByType.H.rows.slice(0, 71), pointwiseByType.H.source), false);

// Hostile 2: inject a setwise-but-not-pointwise element into the labelled fibre.
const injected = [...pointwiseByType.H.rows.slice(0, 71), translation79];
assert.equal(validatesPointwiseFibre(injected, pointwiseByType.H.source), false);

// Hostiles 3+4: the 576-for-72 substitution and translation-79 witness produce an exact support conflict.
assert.equal(setwise.length > pointwiseByType.H.rows.length, true);
assert.equal(hostileUnion.size, 2);

// Hostile 5: wrong coset composition side fails to preserve a nontrivial target for some stabilizer element.
const HAtlas = buildDromologicalHolonomyOrbitTransportAtlas('H');
let primary = null;
for (let index = 0; index < HAtlas.witness_packs.length && !primary; index += 1) {
  const packed = HAtlas.witness_packs[index];
  const witness = {
    translation: Math.floor(packed / 40320),
    permutation_index: packed % 40320,
    permutation: perms[packed % 40320],
  };
  if (witness.translation !== 0 && witness.permutation.some((value, position) => value !== position)) {
    primary = { witness, target_key: HAtlas.target_keys[index] >>> 0 };
  }
}
assert.ok(primary);
const HSource = pointwiseByType.H.source;
assert.equal(packLabelledWords(HSource.map(value => applyWitness(value, primary.witness))), primary.target_key);
let wrongSideWitness = null;
for (const stabilizerElement of pointwiseByType.H.rows) {
  const correct = composeWitness(primary.witness, stabilizerElement, permIndex); // g ∘ s
  assert.equal(packLabelledWords(HSource.map(value => applyWitness(value, correct))), primary.target_key);
  const wrong = composeWitness(stabilizerElement, primary.witness, permIndex); // s ∘ g
  if (packLabelledWords(HSource.map(value => applyWitness(value, wrong))) !== primary.target_key) {
    wrongSideWitness = wrong;
    break;
  }
}
assert.ok(wrongSideWitness);

// Hostile 6: a witness for a different target cannot certify the chosen target fibre.
let secondTarget = null;
for (let index = 0; index < HAtlas.target_keys.length; index += 1) {
  if ((HAtlas.target_keys[index] >>> 0) !== primary.target_key) {
    const packed = HAtlas.witness_packs[index];
    secondTarget = {
      translation: Math.floor(packed / 40320),
      permutation_index: packed % 40320,
      permutation: perms[packed % 40320],
    };
    break;
  }
}
assert.ok(secondTarget);
assert.notEqual(packLabelledWords(HSource.map(value => applyWitness(value, secondTarget))), primary.target_key);

const certificate = dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_PARENT_RECEIPT);
assert.equal(certificate.witness_fiber_descent_certificate.labelled_pointwise_stabilizer_size, 72);
assert.equal(certificate.witness_fiber_descent_certificate.unlabelled_set_stabilizer_size, 576);
assert.equal(certificate.witness_fiber_descent_certificate.induced_codepoint_action_count, 8);
assert.equal(certificate.witness_fiber_descent_certificate.every_induced_action_has_multiplicity_72, true);
assert.equal(certificate.witness_fiber_descent_certificate.stabilizer_receiver_checks, 31968);
assert.equal(certificate.witness_fiber_descent_certificate.alternative_target_map_checks, 216);
assert.equal(certificate.witness_fiber_descent_certificate.alternative_witness_pullback_checks, 31968);
assert.equal(certificate.witness_fiber_descent_certificate.replay_policy_witness_independence_checks, 31968);
assert.equal(certificate.witness_fiber_descent_certificate.represented_witness_incidences_total, 30965760);
assert.equal(certificate.witness_fiber_descent_certificate.represented_all_witness_incidences_executed, false);
assert.equal(certificate.witness_fiber_descent_certificate.fadt_descent.fibrewise_support_constant, true);
assert.equal(certificate.witness_fiber_descent_certificate.fadt_descent.union_equals_intersection, true);
assert.equal(certificate.witness_fiber_descent_certificate.fadt_descent.gamma_empty, true);
assert.deepEqual(certificate.witness_fiber_descent_certificate.unsafe_setwise_counterexample.induced_codepoint_action, [1, 0, 3, 2]);
assert.deepEqual(certificate.witness_fiber_descent_certificate.unsafe_setwise_counterexample.identity_repair_mask, [0, 0]);
assert.deepEqual(certificate.witness_fiber_descent_certificate.unsafe_setwise_counterexample.hostile_pullback_repair_mask, [0, 1]);
assert.equal(certificate.witness_fiber_descent_certificate.unsafe_setwise_counterexample.gamma_size_for_two_witness_subfamily, 2);
assert.equal(certificate.downstream_tomography_certificate.executed_state_reconstructions, 750);
assert.equal(certificate.downstream_tomography_certificate.mixed_terminal_holonomy_schedule_ambiguity_preserved, true);
assert.equal(certificate.passed, true);
assert.equal(
  certificate.classification,
  'IN_THE_FIXED_S3_AIA_FIXTURE_THE_72_FOLD_DECLARED_RECEIVER_ISOMETRY_WITNESS_FIBER_OVER_EACH_SUCCESSFUL_LABELLED_WIDTH_EIGHT_TARGET_HAS_ZERO_REPAIR_ADMISSIBILITY_GAP_AND_DESCENDS_TO_ONE_EXACT_REPAIR_AND_REPLAY_ASSISTED_TOMOGRAPHY_CLASS_WHILE_THE_576_ELEMENT_UNLABELLED_SET_STABILIZER_IS_TOO_COARSE_FOR_LABELLED_REPAIR_AUTHORITY',
);

const ash = compileDromologicalHolonomyOrbitTransportWitnessFiberDescentProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyOrbitTransportWitnessFiberDescentProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.equal(ash.execution_ledger.represented_witness_incidences, 30965760);
assert.equal(ash.execution_ledger.represented_witness_incidences_claimed_executed, false);
assert.equal(ash.execution_ledger.executed_stabilizer_receiver_checks, 31968);
assert.equal(ash.execution_ledger.executed_alternative_pullback_checks, 31968);
assert.equal(ash.execution_ledger.executed_state_reconstructions, 750);
assert.equal(ash.payload.pointwise_stabilizer_atlas_exposed, false);
assert.equal(ash.payload.alternate_witnesses_exposed, false);
assert.equal(ash.payload.setwise_counterexample_internals_exposed, false);

// Hostile 7: deterministic section cannot acquire scientific authority.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  deterministic_section_has_scientific_authority: true,
}).accepted, false);

// Hostile 8: represented incidence inflation.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  execution_ledger: {
    ...loom.execution_ledger,
    represented_witness_incidences_claimed_executed: true,
  },
}).accepted, false);

// Hostile 9: schedule-completion overclaim.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, complete_schedule_reconstruction: true },
}).accepted, false);

// Hostile 10: source-state mutation.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  source_state_transform: true,
}).accepted, false);

// Hostile 11: authority widening.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  authority: { ...loom.authority, inverse: true },
}).accepted, false);

// Hostile 12: Ash leakage of stabilizer / alternate-witness / state internals.
assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...ash,
  payload: {
    ...ash.payload,
    pointwise_stabilizer_atlas_exposed: true,
    alternate_witnesses_exposed: true,
    latent_state_exposed: true,
  },
}).accepted, false);

assert.equal(rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach({
  ...loom,
  setwise_stabilizer_claimed_safe: true,
}).accepted, false);

console.log('Ash A15-R0 orbit-transport witness-fiber admissibility descent hostile tests passed.');
