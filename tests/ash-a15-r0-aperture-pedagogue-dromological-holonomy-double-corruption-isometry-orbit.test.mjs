import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { observeReplayAssistedState } from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import { invertReplayLocusObservation } from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import { REPAIR_MASK_DOMAIN } from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';
import {
  canonicalEightBitRepairCode,
  dromologicalHolonomyDoubleCorruptionCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import {
  DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_SCHEMA,
  DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_PARENT_RECEIPT,
  dromologicalHolonomyDoubleCorruptionIsometryCertificate,
  compileDromologicalHolonomyDoubleCorruptionIsometryProjection,
  rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-isometry-orbit.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hamming(left, right) {
  assert.equal(left.length, right.length);
  return left.reduce((sum, bit, index) => sum + (bit === right[index] ? 0 : 1), 0);
}

function distances(words) {
  const rows = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) rows.push(hamming(words[left], words[right]));
  }
  return rows.sort((a, b) => a - b);
}

function wordToInteger(word) {
  return word.reduce((value, bit) => (value << 1) | bit, 0);
}

function integerToWord(value, width = 8) {
  return Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1);
}

function weight(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1;
    count += 1;
  }
  return count;
}

function setKey(words) {
  return [...words].sort((a, b) => a - b).join(',');
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

function choose(values, count) {
  const rows = [];
  function visit(start, prefix) {
    if (prefix.length === count) {
      rows.push(prefix);
      return;
    }
    for (let index = start; index <= values.length - (count - prefix.length); index += 1) {
      visit(index + 1, [...prefix, values[index]]);
    }
  }
  visit(0, []);
  return rows;
}

function permuteInteger(value, permutation) {
  const input = integerToWord(value);
  return wordToInteger(permutation.map(index => input[index]));
}

function supportMask(coordinates) {
  return coordinates.reduce((value, coordinate) => value | (1 << coordinate), 0);
}

function repairType(left, right) {
  const dH = left[0] ^ right[0];
  const dI = left[1] ^ right[1];
  if (dH === 1 && dI === 0) return 'H';
  if (dH === 0 && dI === 1) return 'I';
  if (dH === 1 && dI === 1) return 'X';
  throw new Error('distinct repair masks required');
}

function longMatchingType(assignment, words) {
  const types = [];
  for (let left = 0; left < 4; left += 1) {
    for (let right = left + 1; right < 4; right += 1) {
      if (hamming(words[assignment[left]], words[assignment[right]]) === 6) {
        types.push(repairType(REPAIR_MASK_DOMAIN[left], REPAIR_MASK_DOMAIN[right]));
      }
    }
  }
  const unique = [...new Set(types)];
  return types.length === 2 && unique.length === 1 ? unique[0] : null;
}

function radiusTwo(word) {
  const rows = [[...word]];
  for (let first = 0; first < word.length; first += 1) {
    const single = [...word];
    single[first] ^= 1;
    rows.push(single);
  }
  for (let first = 0; first < word.length; first += 1) {
    for (let second = first + 1; second < word.length; second += 1) {
      const double = [...word];
      double[first] ^= 1;
      double[second] ^= 1;
      rows.push(double);
    }
  }
  return rows;
}

function nearest(received, rows) {
  const ranked = rows.map(row => ({
    repair_mask: row.repair_mask,
    distance: hamming(received, row.codeword),
  })).sort((left, right) => left.distance - right.distance);
  const minimum = ranked[0].distance;
  const winners = ranked.filter(row => row.distance === minimum);
  return {
    minimum,
    unique: winners.length === 1,
    repair_mask: winners.length === 1 ? winners[0].repair_mask : null,
  };
}

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

assert.equal(DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_PARENT_RECEIPT, '3877139365041453bab85741eb09ba2f5839eed6');
const parent = dromologicalHolonomyDoubleCorruptionCertificate();
assert.equal(parent.passed, true);
assert.equal(parent.image_classification_certificate.width_eight.qualifying_image_count, 17920);
assert.equal(parent.image_classification_certificate.class_labelled_width_eight_correcting_encoding_count, 430080);
assert.equal(parent.systematic_affine_certificate.lifted_successful_truth_table_sextuples, 13440);

const canonicalRows = canonicalEightBitRepairCode();
const canonicalWords = canonicalRows.map(row => row.codeword);
const canonical = canonicalWords.map(wordToInteger);
assert.deepEqual(canonicalWords, [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 1, 1, 1],
  [1, 0, 1, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0],
]);
assert.deepEqual(distances(canonicalWords), [5, 5, 5, 5, 6, 6]);
assert.equal(canonical[0], 0);
assert.equal(canonical[1] ^ canonical[2], canonical[3]);
assert.deepEqual(canonical.slice(1).map(weight).sort((a, b) => a - b), [5, 5, 6]);

// Independent coordinate-permutation orbit and stabilizers.
const coordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(coordinatePermutations.length, 40320);
const canonicalKey = setKey(canonical);
const permutationFlats = new Map();
let coordinateSetStabilizer = 0;
let coordinatePointwiseStabilizer = 0;
const inducedPermutations = new Map();
let fullSetStabilizer = 0;
const pointIndex = new Map(canonical.map((value, index) => [value, index]));
for (const permutation of coordinatePermutations) {
  const transformed = canonical.map(value => permuteInteger(value, permutation));
  permutationFlats.set(setKey(transformed), [...transformed].sort((a, b) => a - b));
  if (setKey(transformed) === canonicalKey) coordinateSetStabilizer += 1;
  if (transformed.every((value, index) => value === canonical[index])) coordinatePointwiseStabilizer += 1;
  for (const translation of canonical) {
    const shifted = transformed.map(value => value ^ translation);
    if (setKey(shifted) !== canonicalKey) continue;
    fullSetStabilizer += 1;
    const induced = transformed.map(value => pointIndex.get(value ^ translation));
    assert.equal(induced.every(Number.isInteger), true);
    inducedPermutations.set(induced.join(','), induced);
  }
}
assert.equal(permutationFlats.size, 280);
assert.equal(coordinateSetStabilizer, 144);
assert.equal(coordinatePointwiseStabilizer, 72);
assert.equal(fullSetStabilizer, 576);
assert.equal(inducedPermutations.size, 8);
assert.equal(256 * 40320, 10321920);
assert.equal((256 * 40320) / fullSetStabilizer, 17920);

// Independent support-intersection construction; require exact set equality, not just equal counts.
const supportFlats = new Map();
const coordinates = [0, 1, 2, 3, 4, 5, 6, 7];
let unorderedGeneratorPairs = 0;
for (const shared of choose(coordinates, 2)) {
  const remaining = coordinates.filter(value => !shared.includes(value));
  for (const firstExclusive of choose(remaining, 3)) {
    const secondExclusive = remaining.filter(value => !firstExclusive.includes(value));
    const sharedMask = supportMask(shared);
    const first = sharedMask | supportMask(firstExclusive);
    const second = sharedMask | supportMask(secondExclusive);
    if (first >= second) continue;
    unorderedGeneratorPairs += 1;
    const third = first ^ second;
    const flat = [0, first, second, third].sort((a, b) => a - b);
    assert.deepEqual(flat.slice(1).map(weight).sort((a, b) => a - b), [5, 5, 6]);
    supportFlats.set(setKey(flat), flat);
  }
}
assert.equal(unorderedGeneratorPairs, 280);
assert.equal(supportFlats.size, 280);
assert.equal((28 * 20) / 2, 280);
assert.deepEqual([...supportFlats.keys()].sort(), [...permutationFlats.keys()].sort());

// Every normalized flat has exactly 64 cosets; the full affine family is exactly the parent 17,920 census.
const affineImages = new Map();
for (const flat of supportFlats.values()) {
  const local = new Set();
  for (let translation = 0; translation < 256; translation += 1) {
    const shifted = flat.map(value => value ^ translation);
    const key = setKey(shifted);
    local.add(key);
    affineImages.set(key, [...shifted].sort((a, b) => a - b));
  }
  assert.equal(local.size, 64);
}
assert.equal(affineImages.size, 17920);
assert.equal(affineImages.size, parent.image_classification_certificate.width_eight.qualifying_image_count);
for (const image of affineImages.values()) {
  assert.deepEqual(distances(image.map(value => integerToWord(value))), [5, 5, 5, 5, 6, 6]);
}

// Label-aware orbit split: three perfect matchings H/I/X.
const assignments = permutations([0, 1, 2, 3]);
assert.equal(assignments.length, 24);
const typeCounts = { H: 0, I: 0, X: 0 };
for (const assignment of assignments) {
  const type = longMatchingType(assignment, canonicalWords);
  assert.ok(type);
  typeCounts[type] += 1;
}
assert.deepEqual(typeCounts, { H: 8, I: 8, X: 8 });

const unseen = new Set(assignments.map(row => row.join(',')));
const assignmentOrbits = [];
while (unseen.size > 0) {
  const seedKey = unseen.values().next().value;
  const seed = seedKey.split(',').map(Number);
  const orbitRows = new Map();
  for (const action of inducedPermutations.values()) {
    const transformed = seed.map(point => action[point]);
    orbitRows.set(transformed.join(','), transformed);
  }
  for (const key of orbitRows.keys()) unseen.delete(key);
  const types = [...new Set([...orbitRows.values()].map(row => longMatchingType(row, canonicalWords)))];
  assert.equal(types.length, 1);
  assignmentOrbits.push({ size: orbitRows.size, type: types[0], rows: [...orbitRows.values()] });
}
assert.equal(assignmentOrbits.length, 3);
assert.deepEqual(assignmentOrbits.map(row => row.size).sort((a, b) => a - b), [8, 8, 8]);
assert.deepEqual(assignmentOrbits.map(row => row.type).sort(), ['H', 'I', 'X']);
const labelledOrbitSize = (256 * 40320) / coordinatePointwiseStabilizer;
assert.equal(labelledOrbitSize, 143360);
assert.equal(labelledOrbitSize * 3, 430080);
assert.equal(labelledOrbitSize * 3, parent.image_classification_certificate.class_labelled_width_eight_correcting_encoding_count);

// Independent systematic linear-coefficient exhaustion: 4^6 = 4096.
const coefficientTypes = [
  { a: 0, b: 0, key: '0' },
  { a: 1, b: 0, key: 'H' },
  { a: 0, b: 1, key: 'I' },
  { a: 1, b: 1, key: 'X' },
];
let coefficientSextuples = 0;
let successfulLinear = 0;
const profileCounts = {};
const longTypeLinearCounts = { H: 0, I: 0, X: 0 };
const representativeCoefficients = {};
function visitCoefficients(prefix) {
  if (prefix.length === 6) {
    coefficientSextuples += 1;
    const code = REPAIR_MASK_DOMAIN.map(([dH, dI]) => [
      dH,
      dI,
      ...prefix.map(({ a, b }) => (a & dH) ^ (b & dI)),
    ]);
    if (Math.min(...distances(code)) < 5) return;
    successfulLinear += 1;
    let nH = 0;
    let nI = 0;
    let nX = 0;
    let n0 = 0;
    for (const coefficient of prefix) {
      if (coefficient.key === 'H') nH += 1;
      else if (coefficient.key === 'I') nI += 1;
      else if (coefficient.key === 'X') nX += 1;
      else n0 += 1;
    }
    const profile = `${nH},${nI},${nX},${n0}`;
    profileCounts[profile] = (profileCounts[profile] ?? 0) + 1;
    const pairDistances = {
      H: 1 + nH + nX,
      I: 1 + nI + nX,
      X: 2 + nH + nI,
    };
    const longTypes = Object.entries(pairDistances).filter(([, value]) => value === 6).map(([key]) => key);
    assert.equal(longTypes.length, 1);
    const longType = longTypes[0];
    longTypeLinearCounts[longType] += 1;
    if (!representativeCoefficients[longType]) representativeCoefficients[longType] = prefix.map(row => ({ ...row }));
    return;
  }
  for (const coefficient of coefficientTypes) visitCoefficients([...prefix, coefficient]);
}
visitCoefficients([]);
assert.equal(coefficientSextuples, 4096);
assert.equal(successfulLinear, 210);
assert.deepEqual(profileCounts, {
  '1,2,3,0': 60,
  '2,1,3,0': 60,
  '2,2,2,0': 90,
});
assert.deepEqual(longTypeLinearCounts, { H: 60, I: 60, X: 90 });
assert.deepEqual({
  H: longTypeLinearCounts.H * 64,
  I: longTypeLinearCounts.I * 64,
  X: longTypeLinearCounts.X * 64,
}, { H: 3840, I: 3840, X: 5760 });
assert.equal((60 + 60 + 90) * 64, 13440);
assert.equal((60 + 60 + 90) * 64, parent.systematic_affine_certificate.lifted_successful_truth_table_sextuples);

// Each H/I/X labelled orbit representative preserves exact radius-two repair routing and tomography.
const representatives = Object.fromEntries(assignmentOrbits.map(row => [row.type, row.rows[0]]));
const holonomyClasses = deriveDromologicalTerminalHolonomyClasses();
const policies = dromologicalHolonomyClassReplayPolicy();
const scheduleMap = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), schedule]));
let decoderChecks = 0;
let policyChecks = 0;
let robustChecks = 0;
let reconstructions = 0;
for (const type of ['H', 'I', 'X']) {
  const assignment = representatives[type];
  assert.ok(assignment);
  const rows = REPAIR_MASK_DOMAIN.map((mask, index) => ({
    repair_mask: [...mask],
    codeword: [...canonicalWords[assignment[index]]],
  }));
  assert.deepEqual(distances(rows.map(row => row.codeword)), [5, 5, 5, 5, 6, 6]);
  assert.equal(longMatchingType(assignment, canonicalWords), type);

  for (let classIndex = 0; classIndex < holonomyClasses.length; classIndex += 1) {
    const holonomyClass = holonomyClasses[classIndex];
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const row = rows.find(item => same(item.repair_mask, mask));
    assert.ok(row);
    for (const received of radiusTwo(row.codeword)) {
      const decoded = nearest(received, rows);
      decoderChecks += 1;
      assert.equal(decoded.unique, true);
      assert.equal(decoded.minimum <= 2, true);
      assert.deepEqual(decoded.repair_mask, mask);
      const replay = decodeMinimumCostReplayFromRepairMask(decoded.repair_mask);
      policyChecks += 1;
      assert.deepEqual(replay, policies[classIndex].replay_row);
      const assessment = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
      robustChecks += 1;
      assert.equal(assessment.actual_class_robust_unimodular_rescue, true);
      for (const id of holonomyClass.schedule_ids) {
        const schedule = scheduleMap.get(id);
        assert.ok(schedule);
        for (let x1 = -2; x1 <= 2; x1 += 1) {
          for (let x2 = -2; x2 <= 2; x2 += 1) {
            for (let x3 = -2; x3 <= 2; x3 += 1) {
              const state = [x1, x2, x3];
              const observation = observeReplayAssistedState(state, schedule, replay);
              const recovered = invertReplayLocusObservation(observation, schedule, replay);
              reconstructions += 1;
              assert.deepEqual(recovered, state);
            }
          }
        }
      }
    }
  }
}
assert.equal(decoderChecks, 444);
assert.equal(policyChecks, 444);
assert.equal(robustChecks, 444);
assert.equal(reconstructions, 83250);
const mixedClass = holonomyClasses.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
assert.ok(mixedClass);
assert.deepEqual([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

// Implementation certificate must match every independent hostile seam.
const certificate = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.canonical_linear_two_flat_witness.exact, true);
assert.equal(certificate.declared_isometry_orbit_certificate.normalized_linear_two_flat_count, 280);
assert.deepEqual(certificate.declared_isometry_orbit_certificate.distinct_cosets_per_linear_two_flat, [64]);
assert.equal(certificate.declared_isometry_orbit_certificate.full_unlabelled_orbit_image_count, 17920);
assert.equal(certificate.declared_isometry_orbit_certificate.coordinate_set_stabilizer_count, 144);
assert.equal(certificate.declared_isometry_orbit_certificate.coordinate_pointwise_stabilizer_count, 72);
assert.equal(certificate.declared_isometry_orbit_certificate.full_set_stabilizer_count, 576);
assert.equal(certificate.declared_isometry_orbit_certificate.induced_codepoint_permutation_count, 8);
assert.equal(certificate.independent_affine_two_flat_certificate.distinct_normalized_linear_two_flat_count, 280);
assert.equal(certificate.labelled_repair_orbit_certificate.assignment_orbit_count, 3);
assert.deepEqual(certificate.labelled_repair_orbit_certificate.assignment_orbit_sizes, [8, 8, 8]);
assert.deepEqual(certificate.labelled_repair_orbit_certificate.assignment_orbit_long_matching_types, ['H', 'I', 'X']);
assert.equal(certificate.labelled_repair_orbit_certificate.labelled_isometry_orbit_size, 143360);
assert.equal(certificate.systematic_profile_reconciliation_certificate.successful_linear_coefficient_sextuples, 210);
assert.deepEqual(certificate.systematic_profile_reconciliation_certificate.long_matching_linear_counts, { H: 60, I: 60, X: 90 });
assert.deepEqual(certificate.systematic_profile_reconciliation_certificate.lifted_systematic_counts_by_labelled_orbit, { H: 3840, I: 3840, X: 5760 });
assert.equal(certificate.representative_labelled_tomography_certificate.exact_replay_assisted_state_reconstructions, 83250);
assert.equal(certificate.all_parent_qualifying_images_covered_by_single_orbit, true);
assert.equal(
  certificate.unlabelled_classification,
  'EVERY_QUALIFYING_MINIMAL_WIDTH_EIGHT_IMAGE_IS_AN_AFFINE_TWO_FLAT_IN_F2_8_WITH_NONZERO_DIRECTION_WEIGHT_MULTISET_556_AND_ALL_SUCH_IMAGES_FORM_ONE_DECLARED_HYPERCUBE_ISOMETRY_ORBIT_IN_THE_FIXED_FIXTURE',
);
assert.equal(
  certificate.labelled_classification,
  'THE_SINGLE_UNLABELED_MINIMAL_WIDTH_EIGHT_ISOMETRY_ORBIT_SPLITS_INTO_EXACTLY_THREE_REPAIR_LABEL_AWARE_ORBITS_DISTINGUISHED_BY_WHETHER_THE_DISTANCE_SIX_PERFECT_MATCHING_IS_H_I_OR_X_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'UNLABELED_MINIMAL_RECEIVER_GEOMETRY_CAN_BE_ISOMETRICALLY_UNIFORM_WHILE_REPAIR_ROLE_LABELS_SPLIT_THAT_GEOMETRY_INTO_A_FINITE_ANISOTROPIC_ORBIT_STRUCTURE_WITHOUT_ADDING_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY',
);

const ash = compileDromologicalHolonomyDoubleCorruptionIsometryProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyDoubleCorruptionIsometryProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.equal(ash.payload.orbit_atlas_exposed, false);
assert.equal(ash.payload.stabilizer_atlas_exposed, false);
assert.equal(ash.payload.systematic_profile_atlas_exposed, false);
assert.equal(ash.payload.replay_vectors_exposed, false);
assert.equal(ash.payload.latent_state_exposed, false);
assert.equal(loom.payload.unlabelled_summary.normalized_linear_two_flats, 280);
assert.equal(loom.payload.unlabelled_summary.affine_cosets_per_flat, 64);
assert.equal(loom.payload.unlabelled_summary.unlabelled_orbit_images, 17920);
assert.equal(loom.payload.unlabelled_summary.full_set_stabilizer, 576);
assert.equal(loom.payload.labelled_summary.labelled_orbits, 3);
assert.equal(loom.payload.labelled_summary.labelled_orbit_size, 143360);
assert.deepEqual(loom.payload.labelled_summary.long_matching_types, ['H', 'I', 'X']);
assert.equal(loom.payload.representative_labelled_tomography.exact, true);

assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach(loom).accepted, true);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_coding_isometry_theorem: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_symmetry: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_gauge_group: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach({
  ...loom,
  runtime_binding: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach({
  ...ash,
  payload: { ...ash.payload, stabilizer_atlas_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy double-corruption isometry-orbit hostile tests passed.');
