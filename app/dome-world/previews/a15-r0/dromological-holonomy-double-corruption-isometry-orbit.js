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
  canonicalEightBitRepairCode,
  dromologicalHolonomyDoubleCorruptionCertificate,
} from './dromological-holonomy-double-corruption-correcting-aia.js';

export const DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_SCHEMA =
  'td613.dome-world.dromological-holonomy-double-corruption-isometry-orbit/v0.1';
export const DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_PARENT_RECEIPT =
  '3877139365041453bab85741eb09ba2f5839eed6';

const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'release', 'production', 'physical_claim', 'continuum_claim',
]);
const REPAIR_PAIR_TYPES = Object.freeze({
  H: Object.freeze([[0, 2], [1, 3]]),
  I: Object.freeze([[0, 1], [2, 3]]),
  X: Object.freeze([[0, 3], [1, 2]]),
});
const COEFFICIENT_TYPES = Object.freeze([
  Object.freeze({ a: 0, b: 0, key: '0' }),
  Object.freeze({ a: 1, b: 0, key: 'H' }),
  Object.freeze({ a: 0, b: 1, key: 'I' }),
  Object.freeze({ a: 1, b: 1, key: 'X' }),
]);

let cachedCertificate = null;
let cachedPermutations = null;

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

function hamming(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    throw new Error('Hamming comparison requires equal-length receiver words');
  }
  return left.reduce((sum, bit, index) => sum + (bit === right[index] ? 0 : 1), 0);
}

function pairwiseDistances(words) {
  const rows = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      rows.push(hamming(words[left], words[right]));
    }
  }
  return rows.sort((a, b) => a - b);
}

function wordToInteger(word) {
  return word.reduce((value, bit) => (value << 1) | bit, 0);
}

function integerToWord(value, width = 8) {
  return freeze(Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1));
}

function setKey(words) {
  return [...words].sort((a, b) => a - b).join(',');
}

function permutations(values) {
  const rows = [];
  function visit(prefix, remaining) {
    if (remaining.length === 0) {
      rows.push(freeze(prefix));
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit(
        [...prefix, remaining[index]],
        [...remaining.slice(0, index), ...remaining.slice(index + 1)],
      );
    }
  }
  visit([], values);
  return freeze(rows);
}

function coordinatePermutations() {
  if (!cachedPermutations) cachedPermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
  return cachedPermutations;
}

function permuteIntegerWord(value, permutation) {
  const input = integerToWord(value, 8);
  const output = permutation.map(index => input[index]);
  return wordToInteger(output);
}

function canonicalIntegerImage() {
  const rows = canonicalEightBitRepairCode();
  return freeze(rows.map(row => wordToInteger(row.codeword)));
}

function canonicalImageLinearWitness() {
  const words = canonicalIntegerImage();
  const sorted = [...words].sort((a, b) => a - b);
  const containsZero = sorted[0] === 0;
  const nonzero = sorted.filter(value => value !== 0);
  const xorClosed = nonzero.length === 3
    && nonzero.some((left, leftIndex) => nonzero.some((right, rightIndex) => (
      leftIndex < rightIndex && nonzero.includes(left ^ right)
    )));
  const weights = nonzero.map(value => value.toString(2).split('1').length - 1).sort((a, b) => a - b);
  return freeze({
    integer_words: freeze(sorted),
    codewords: freeze(sorted.map(value => integerToWord(value))),
    contains_zero: containsZero,
    xor_closed: xorClosed,
    linear_dimension: containsZero && xorClosed && sorted.length === 4 ? 2 : null,
    nonzero_direction_weights: freeze(weights),
    exact: containsZero && xorClosed && same(weights, [5, 5, 6]),
  });
}

function coordinateOrbitCertificate() {
  const canonical = canonicalIntegerImage();
  const canonicalKey = setKey(canonical);
  const subspaces = new Map();
  let setStabilizer = 0;
  let pointwiseStabilizer = 0;
  const fullStabilizerElements = [];
  const inducedPointPermutations = new Map();
  const pointIndex = new Map(canonical.map((value, index) => [value, index]));

  for (const permutation of coordinatePermutations()) {
    const transformed = canonical.map(value => permuteIntegerWord(value, permutation));
    const key = setKey(transformed);
    if (!subspaces.has(key)) subspaces.set(key, freeze([...transformed].sort((a, b) => a - b)));
    if (key === canonicalKey) setStabilizer += 1;
    if (transformed.every((value, index) => value === canonical[index])) pointwiseStabilizer += 1;

    for (const translation of canonical) {
      const shifted = transformed.map(value => value ^ translation);
      if (setKey(shifted) !== canonicalKey) continue;
      fullStabilizerElements.push(freeze({ permutation, translation }));
      const induced = transformed.map(value => pointIndex.get(value ^ translation));
      if (induced.every(value => Number.isInteger(value))) {
        inducedPointPermutations.set(induced.join(','), freeze(induced));
      }
    }
  }

  const cosetImages = new Map();
  const cosetCounts = [];
  for (const subspace of subspaces.values()) {
    const local = new Set();
    for (let translation = 0; translation < 256; translation += 1) {
      const shifted = subspace.map(value => value ^ translation);
      const key = setKey(shifted);
      local.add(key);
      if (!cosetImages.has(key)) cosetImages.set(key, freeze([...shifted].sort((a, b) => a - b)));
    }
    cosetCounts.push(local.size);
  }

  let spectrumExact = true;
  for (const image of cosetImages.values()) {
    const words = image.map(value => integerToWord(value));
    if (!same(pairwiseDistances(words), [5, 5, 5, 5, 6, 6])) {
      spectrumExact = false;
      break;
    }
  }

  const groupSize = 256 * 40320;
  const fullStabilizerCount = fullStabilizerElements.length;
  const orbitStabilizerSize = fullStabilizerCount > 0 ? groupSize / fullStabilizerCount : null;

  return freeze({
    coordinate_permutations_checked: coordinatePermutations().length,
    expected_coordinate_permutations_checked: 40320,
    normalized_linear_two_flat_count: subspaces.size,
    expected_normalized_linear_two_flat_count: 280,
    distinct_cosets_per_linear_two_flat: freeze([...new Set(cosetCounts)].sort((a, b) => a - b)),
    expected_distinct_cosets_per_linear_two_flat: freeze([64]),
    full_unlabelled_orbit_image_count: cosetImages.size,
    expected_full_unlabelled_orbit_image_count: 17920,
    every_orbit_image_has_spectrum_555566: spectrumExact,
    coordinate_set_stabilizer_count: setStabilizer,
    expected_coordinate_set_stabilizer_count: 144,
    coordinate_pointwise_stabilizer_count: pointwiseStabilizer,
    expected_coordinate_pointwise_stabilizer_count: 72,
    full_declared_isometry_group_size: groupSize,
    full_set_stabilizer_count: fullStabilizerCount,
    expected_full_set_stabilizer_count: 576,
    orbit_size_from_stabilizer: orbitStabilizerSize,
    induced_codepoint_permutation_count: inducedPointPermutations.size,
    expected_induced_codepoint_permutation_count: 8,
    induced_codepoint_permutations: freeze([...inducedPointPermutations.values()]),
    exact: coordinatePermutations().length === 40320
      && subspaces.size === 280
      && same([...new Set(cosetCounts)].sort((a, b) => a - b), [64])
      && cosetImages.size === 17920
      && spectrumExact
      && setStabilizer === 144
      && pointwiseStabilizer === 72
      && groupSize === 10321920
      && fullStabilizerCount === 576
      && orbitStabilizerSize === 17920
      && inducedPointPermutations.size === 8,
  });
}

function choose(values, count) {
  const rows = [];
  function visit(start, prefix) {
    if (prefix.length === count) {
      rows.push(freeze(prefix));
      return;
    }
    for (let index = start; index <= values.length - (count - prefix.length); index += 1) {
      visit(index + 1, [...prefix, values[index]]);
    }
  }
  visit(0, []);
  return freeze(rows);
}

function maskFromCoordinates(coordinates) {
  return coordinates.reduce((value, coordinate) => value | (1 << coordinate), 0);
}

function independentAffineFlatCertificate() {
  const coordinates = [0, 1, 2, 3, 4, 5, 6, 7];
  const flats = new Map();
  let generatorPairs = 0;
  for (const shared of choose(coordinates, 2)) {
    const remaining = coordinates.filter(value => !shared.includes(value));
    for (const firstExclusive of choose(remaining, 3)) {
      const secondExclusive = remaining.filter(value => !firstExclusive.includes(value));
      const sharedMask = maskFromCoordinates(shared);
      const first = sharedMask | maskFromCoordinates(firstExclusive);
      const second = sharedMask | maskFromCoordinates(secondExclusive);
      if (first >= second) continue;
      generatorPairs += 1;
      const third = first ^ second;
      const key = setKey([0, first, second, third]);
      flats.set(key, freeze([0, first, second, third].sort((a, b) => a - b)));
    }
  }

  let everyFlatExact = true;
  for (const flat of flats.values()) {
    const nonzero = flat.filter(value => value !== 0);
    const weights = nonzero.map(value => value.toString(2).split('1').length - 1).sort((a, b) => a - b);
    if (!same(weights, [5, 5, 6]) || !flat.includes(nonzero[0] ^ nonzero[1])) {
      everyFlatExact = false;
      break;
    }
  }

  return freeze({
    shared_support_choices: choose(coordinates, 2).length,
    first_exclusive_support_choices_per_shared_support: choose([0, 1, 2, 3, 4, 5], 3).length,
    unordered_generator_pair_count: generatorPairs,
    distinct_normalized_linear_two_flat_count: flats.size,
    expected_distinct_normalized_linear_two_flat_count: 280,
    combinatorial_formula_value: (28 * 20) / 2,
    every_flat_has_nonzero_direction_weight_multiset_556: everyFlatExact,
    exact: generatorPairs === 280
      && flats.size === 280
      && (28 * 20) / 2 === 280
      && everyFlatExact,
  });
}

function repairDifferenceType(leftMask, rightMask) {
  const dH = leftMask[0] ^ rightMask[0];
  const dI = leftMask[1] ^ rightMask[1];
  if (dH === 1 && dI === 0) return 'H';
  if (dH === 0 && dI === 1) return 'I';
  if (dH === 1 && dI === 1) return 'X';
  throw new Error('repair masks must be distinct');
}

function labelledLongMatching(assignment, canonicalWords) {
  const longTypes = [];
  for (let left = 0; left < REPAIR_MASK_DOMAIN.length; left += 1) {
    for (let right = left + 1; right < REPAIR_MASK_DOMAIN.length; right += 1) {
      const distance = hamming(canonicalWords[assignment[left]], canonicalWords[assignment[right]]);
      if (distance === 6) longTypes.push(repairDifferenceType(REPAIR_MASK_DOMAIN[left], REPAIR_MASK_DOMAIN[right]));
    }
  }
  const unique = [...new Set(longTypes)];
  return unique.length === 1 && longTypes.length === 2 ? unique[0] : null;
}

function labelledOrbitCertificate(orbit) {
  const canonicalRows = canonicalEightBitRepairCode();
  const canonicalWords = canonicalRows.map(row => row.codeword);
  const assignments = permutations([0, 1, 2, 3]);
  const typeCounts = { H: 0, I: 0, X: 0 };
  const assignmentsByType = { H: [], I: [], X: [] };
  for (const assignment of assignments) {
    const type = labelledLongMatching(assignment, canonicalWords);
    if (!type) continue;
    typeCounts[type] += 1;
    assignmentsByType[type].push(assignment);
  }

  const induced = orbit.induced_codepoint_permutations;
  const unseen = new Set(assignments.map(row => row.join(',')));
  const assignmentOrbits = [];
  while (unseen.size > 0) {
    const seedKey = unseen.values().next().value;
    const seed = seedKey.split(',').map(Number);
    const rows = new Map();
    for (const action of induced) {
      const transformed = seed.map(pointIndex => action[pointIndex]);
      rows.set(transformed.join(','), freeze(transformed));
    }
    for (const key of rows.keys()) unseen.delete(key);
    const types = [...new Set([...rows.values()].map(row => labelledLongMatching(row, canonicalWords)))];
    assignmentOrbits.push(freeze({
      size: rows.size,
      long_matching_types: freeze(types),
      assignments: freeze([...rows.values()]),
    }));
  }

  const fullGroupSize = orbit.full_declared_isometry_group_size;
  const pointwise = orbit.coordinate_pointwise_stabilizer_count;
  const labelledOrbitSize = fullGroupSize / pointwise;
  const parent = dromologicalHolonomyDoubleCorruptionCertificate();

  return freeze({
    class_label_assignments_checked: assignments.length,
    expected_class_label_assignments_checked: 24,
    long_matching_assignment_counts: freeze(typeCounts),
    expected_long_matching_assignment_counts: freeze({ H: 8, I: 8, X: 8 }),
    induced_set_stabilizer_action_size: induced.length,
    assignment_orbit_count: assignmentOrbits.length,
    expected_assignment_orbit_count: 3,
    assignment_orbit_sizes: freeze(assignmentOrbits.map(row => row.size).sort((a, b) => a - b)),
    expected_assignment_orbit_sizes: freeze([8, 8, 8]),
    assignment_orbit_long_matching_types: freeze(assignmentOrbits.map(row => row.long_matching_types[0]).sort()),
    expected_assignment_orbit_long_matching_types: freeze(['H', 'I', 'X']),
    labelled_isometry_orbit_size: labelledOrbitSize,
    expected_labelled_isometry_orbit_size: 143360,
    three_labelled_orbits_cover_parent_labelled_encoding_count:
      labelledOrbitSize * assignmentOrbits.length,
    parent_class_labelled_encoding_count:
      parent.image_classification_certificate.class_labelled_width_eight_correcting_encoding_count,
    representative_assignments: freeze(Object.fromEntries(
      Object.entries(assignmentsByType).map(([type, rows]) => [type, rows[0]]),
    )),
    exact: assignments.length === 24
      && same(typeCounts, { H: 8, I: 8, X: 8 })
      && induced.length === 8
      && assignmentOrbits.length === 3
      && same(assignmentOrbits.map(row => row.size).sort((a, b) => a - b), [8, 8, 8])
      && same(assignmentOrbits.map(row => row.long_matching_types[0]).sort(), ['H', 'I', 'X'])
      && labelledOrbitSize === 143360
      && labelledOrbitSize * 3 === 430080
      && parent.image_classification_certificate.class_labelled_width_eight_correcting_encoding_count === 430080,
  });
}

function systematicProfileCertificate() {
  const successful = [];
  for (const coefficients of permutationsWithReplacement(COEFFICIENT_TYPES, 6)) {
    const code = REPAIR_MASK_DOMAIN.map(([dH, dI]) => [
      dH,
      dI,
      ...coefficients.map(({ a, b }) => (a & dH) ^ (b & dI)),
    ]);
    if (Math.min(...pairwiseDistances(code)) < 5) continue;
    let nH = 0;
    let nI = 0;
    let nX = 0;
    let n0 = 0;
    for (const coefficient of coefficients) {
      if (coefficient.key === 'H') nH += 1;
      else if (coefficient.key === 'I') nI += 1;
      else if (coefficient.key === 'X') nX += 1;
      else n0 += 1;
    }
    const profile = `${nH},${nI},${nX},${n0}`;
    const assignment = [0, 1, 2, 3];
    const longType = systematicLongType({ nH, nI, nX });
    successful.push(freeze({ coefficients, profile, long_type: longType, code, assignment }));
  }

  const profileCounts = {};
  const longTypeCounts = { H: 0, I: 0, X: 0 };
  for (const row of successful) {
    profileCounts[row.profile] = (profileCounts[row.profile] ?? 0) + 1;
    if (row.long_type) longTypeCounts[row.long_type] += 1;
  }
  const observedProfileCounts = Object.fromEntries(
    Object.entries(profileCounts).sort(([left], [right]) => left.localeCompare(right)),
  );

  const lifted = freeze({
    H: longTypeCounts.H * 64,
    I: longTypeCounts.I * 64,
    X: longTypeCounts.X * 64,
  });
  const parent = dromologicalHolonomyDoubleCorruptionCertificate();

  return freeze({
    ordered_linear_coefficient_sextuples_checked: 4 ** 6,
    expected_ordered_linear_coefficient_sextuples_checked: 4096,
    successful_linear_coefficient_sextuples: successful.length,
    expected_successful_linear_coefficient_sextuples: 210,
    profile_counts: freeze(observedProfileCounts),
    expected_profile_counts: freeze({
      '1,2,3,0': 60,
      '2,1,3,0': 60,
      '2,2,2,0': 90,
    }),
    long_matching_linear_counts: freeze(longTypeCounts),
    expected_long_matching_linear_counts: freeze({ H: 60, I: 60, X: 90 }),
    lifted_systematic_counts_by_labelled_orbit: lifted,
    expected_lifted_systematic_counts_by_labelled_orbit: freeze({ H: 3840, I: 3840, X: 5760 }),
    lifted_total: lifted.H + lifted.I + lifted.X,
    parent_lifted_systematic_success_count:
      parent.systematic_affine_certificate.lifted_successful_truth_table_sextuples,
    every_success_has_no_zero_coefficient: successful.every(row => !row.profile.endsWith(',1') && !row.profile.endsWith(',2')
      && !row.profile.endsWith(',3') && !row.profile.endsWith(',4') && !row.profile.endsWith(',5') && !row.profile.endsWith(',6')),
    exact: successful.length === 210
      && same(observedProfileCounts, { '1,2,3,0': 60, '2,1,3,0': 60, '2,2,2,0': 90 })
      && same(longTypeCounts, { H: 60, I: 60, X: 90 })
      && same(lifted, { H: 3840, I: 3840, X: 5760 })
      && lifted.H + lifted.I + lifted.X === 13440
      && parent.systematic_affine_certificate.lifted_successful_truth_table_sextuples === 13440,
  });
}

function permutationsWithReplacement(values, length) {
  const rows = [];
  function visit(prefix) {
    if (prefix.length === length) {
      rows.push(freeze(prefix));
      return;
    }
    for (const value of values) visit([...prefix, value]);
  }
  visit([]);
  return freeze(rows);
}

function systematicLongType({ nH, nI, nX }) {
  const distances = {
    H: 1 + nH + nX,
    I: 1 + nI + nX,
    X: 2 + nH + nI,
  };
  const long = Object.entries(distances).filter(([, value]) => value === 6).map(([key]) => key);
  return long.length === 1 ? long[0] : null;
}

function receivedConditionsRadiusTwo(word) {
  const rows = [freeze([...word])];
  for (let first = 0; first < word.length; first += 1) {
    const single = [...word];
    single[first] ^= 1;
    rows.push(freeze(single));
  }
  for (let first = 0; first < word.length; first += 1) {
    for (let second = first + 1; second < word.length; second += 1) {
      const double = [...word];
      double[first] ^= 1;
      double[second] ^= 1;
      rows.push(freeze(double));
    }
  }
  return freeze(rows);
}

function nearestLabelled(received, rows) {
  const ranked = rows.map(row => ({
    repair_mask: row.repair_mask,
    distance: hamming(received, row.codeword),
  })).sort((left, right) => left.distance - right.distance);
  const minimum = ranked[0].distance;
  const nearest = ranked.filter(row => row.distance === minimum);
  return freeze({
    minimum_distance: minimum,
    unique: nearest.length === 1,
    repair_mask: nearest.length === 1 ? freeze([...nearest[0].repair_mask]) : null,
  });
}

function labelledTomographyCertificate(labelled) {
  const canonicalWords = canonicalEightBitRepairCode().map(row => row.codeword);
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const schedulesById = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => {
    const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
    return [schedule.map(stratum => letters[stratum]).join('-'), schedule];
  }));

  const representativeRows = {};
  let decoderChecks = 0;
  let policyChecks = 0;
  let robustChecks = 0;
  let reconstructions = 0;
  let exact = true;

  for (const type of ['H', 'I', 'X']) {
    const assignment = labelled.representative_assignments[type];
    const rows = REPAIR_MASK_DOMAIN.map((mask, index) => freeze({
      repair_mask: freeze([...mask]),
      codeword: freeze([...canonicalWords[assignment[index]]]),
    }));
    representativeRows[type] = rows;

    for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
      const holonomyClass = classes[classIndex];
      const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
      const row = rows.find(item => same(item.repair_mask, mask));
      if (!row) {
        exact = false;
        continue;
      }
      for (const received of receivedConditionsRadiusTwo(row.codeword)) {
        const decoded = nearestLabelled(received, rows);
        decoderChecks += 1;
        if (!decoded.unique || decoded.minimum_distance > 2 || !same(decoded.repair_mask, mask)) exact = false;
        const replay = decodeMinimumCostReplayFromRepairMask(decoded.repair_mask);
        policyChecks += 1;
        if (!same(replay, policies[classIndex].replay_row)) exact = false;
        const assessment = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
        robustChecks += 1;
        if (!assessment.actual_class_robust_unimodular_rescue) exact = false;
        for (const id of holonomyClass.schedule_ids) {
          const schedule = schedulesById.get(id);
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
                if (!same(state, recovered)) exact = false;
              }
            }
          }
        }
      }
    }
  }

  return freeze({
    representative_labelled_codes: freeze(representativeRows),
    representative_orbit_types_checked: 3,
    radius_two_decoder_checks: decoderChecks,
    expected_radius_two_decoder_checks: 3 * 148,
    minimum_cost_policy_checks: policyChecks,
    expected_minimum_cost_policy_checks: 3 * 148,
    class_robust_unimodular_checks: robustChecks,
    expected_class_robust_unimodular_checks: 3 * 148,
    exact_replay_assisted_state_reconstructions: reconstructions,
    expected_exact_replay_assisted_state_reconstructions: 3 * 27750,
    mixed_class_schedule_ambiguity_preserved:
      classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2),
    exact: exact
      && decoderChecks === 444
      && policyChecks === 444
      && robustChecks === 444
      && reconstructions === 83250,
  });
}

export function dromologicalHolonomyDoubleCorruptionIsometryCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyDoubleCorruptionCertificate();
  const linear = canonicalImageLinearWitness();
  const orbit = coordinateOrbitCertificate();
  const independent = independentAffineFlatCertificate();
  const labelled = labelledOrbitCertificate(orbit);
  const systematic = systematicProfileCertificate();
  const tomography = labelledTomographyCertificate(labelled);

  const parentQualifyingCount = parent.image_classification_certificate.width_eight.qualifying_image_count;
  const allParentImagesCoveredByOrbit = orbit.full_unlabelled_orbit_image_count === parentQualifyingCount
    && orbit.every_orbit_image_has_spectrum_555566;
  const passed = parent.passed
    && linear.exact
    && orbit.exact
    && independent.exact
    && labelled.exact
    && systematic.exact
    && tomography.exact
    && allParentImagesCoveredByOrbit;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_PARENT_RECEIPT,
    parent_schema: parent.schema,
    canonical_linear_two_flat_witness: linear,
    declared_isometry_orbit_certificate: orbit,
    independent_affine_two_flat_certificate: independent,
    labelled_repair_orbit_certificate: labelled,
    systematic_profile_reconciliation_certificate: systematic,
    representative_labelled_tomography_certificate: tomography,
    parent_width_eight_qualifying_image_count: parentQualifyingCount,
    all_parent_qualifying_images_covered_by_single_orbit: allParentImagesCoveredByOrbit,
    passed,
    unlabelled_classification: passed
      ? 'EVERY_QUALIFYING_MINIMAL_WIDTH_EIGHT_IMAGE_IS_AN_AFFINE_TWO_FLAT_IN_F2_8_WITH_NONZERO_DIRECTION_WEIGHT_MULTISET_556_AND_ALL_SUCH_IMAGES_FORM_ONE_DECLARED_HYPERCUBE_ISOMETRY_ORBIT_IN_THE_FIXED_FIXTURE'
      : 'MINIMAL_WIDTH_EIGHT_UNLABELLED_ISOMETRY_ORBIT_CLASSIFICATION_NOT_ESTABLISHED',
    labelled_classification: passed
      ? 'THE_SINGLE_UNLABELED_MINIMAL_WIDTH_EIGHT_ISOMETRY_ORBIT_SPLITS_INTO_EXACTLY_THREE_REPAIR_LABEL_AWARE_ORBITS_DISTINGUISHED_BY_WHETHER_THE_DISTANCE_SIX_PERFECT_MATCHING_IS_H_I_OR_X_IN_THE_FIXED_S3_FIXTURE'
      : 'MINIMAL_WIDTH_EIGHT_LABELLED_ORBIT_SPLIT_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'UNLABELED_MINIMAL_RECEIVER_GEOMETRY_CAN_BE_ISOMETRICALLY_UNIFORM_WHILE_REPAIR_ROLE_LABELS_SPLIT_THAT_GEOMETRY_INTO_A_FINITE_ANISOTROPIC_ORBIT_STRUCTURE_WITHOUT_ADDING_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY'
      : 'AIA_LABEL_AWARE_ORBIT_STRUCTURE_NOT_ESTABLISHED',
    scars: freeze([
      'HYPERCUBE_ISOMETRY != PHYSICAL_SYMMETRY',
      'AFFINE_TWO_FLAT != PHYSICAL_PLANE',
      'F2_AFFINE_STRUCTURE != PHYSICAL_GEOMETRY',
      'SINGLE_UNLABELED_ORBIT != UNIQUE_ENCODING',
      'LABELLED_ORBIT_SPLIT != SEMANTIC_ONTOLOGY',
      'REPAIR_ROLE_ANISOTROPY != PHYSICAL_ANISOTROPIC_MEDIUM',
      'COMMON_XOR_TRANSLATION != SOURCE_MUTATION',
      'COORDINATE_PERMUTATION != PHYSICAL_SENSOR_REWIRING',
      'FINITE_STABILIZER != PHYSICAL_GAUGE_GROUP',
      'ISOMETRY_EQUIVALENCE != SEMANTIC_EQUIVALENCE',
      'MINIMAL_WIDTH_EIGHT_ORBIT_CLASSIFICATION != UNIVERSAL_CODING_CLASSIFICATION',
      'SYSTEMATIC_PROFILE_ALIGNMENT != UNIVERSAL_LINEAR_CODE_NORMAL_FORM',
      'GEOMETRIC_REPRESENTATIVE != OPERATIONAL_INVERSE_ROUTE',
      'REPAIR_MASK_RECOVERY != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyDoubleCorruptionIsometryProjection(receiver) {
  const certificate = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified double-corruption isometry chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.double-corruption-isometry-child-legible/v0.1',
      truths: freeze([
        'ALL_THE_GOOD_EIGHT_CLUE_SHAPES_HERE_ARE_THE_SAME_SHAPE_AFTER_RENAMING_CLUE_POSITIONS_AND_FLIPPING_ONE_SHARED_PATTERN',
        'KEEPING_THE_REPAIR_LABEL_NAMES_SPLITS_THAT_ONE_SHAPE_INTO_THREE_ROLE_PATTERNS',
        'THE_THREE_ROLE_PATTERNS_TRACK_WHICH_PAIR_TYPE_GETS_THE_LONGER_SEPARATION',
        'SAME_SHAPE_DOES_NOT_MEAN_SAME_TEMPORAL_HISTORY_OR_NEW_SOURCE_INFORMATION',
      ]),
      orbit_atlas_exposed: false,
      stabilizer_atlas_exposed: false,
      systematic_profile_atlas_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.double-corruption-isometry-loom-technical/v0.1',
      unlabelled_summary: freeze({
        normalized_linear_two_flats: certificate.declared_isometry_orbit_certificate.normalized_linear_two_flat_count,
        affine_cosets_per_flat: certificate.declared_isometry_orbit_certificate.distinct_cosets_per_linear_two_flat[0],
        unlabelled_orbit_images: certificate.declared_isometry_orbit_certificate.full_unlabelled_orbit_image_count,
        full_set_stabilizer: certificate.declared_isometry_orbit_certificate.full_set_stabilizer_count,
      }),
      labelled_summary: freeze({
        labelled_orbits: certificate.labelled_repair_orbit_certificate.assignment_orbit_count,
        labelled_orbit_size: certificate.labelled_repair_orbit_certificate.labelled_isometry_orbit_size,
        long_matching_types: certificate.labelled_repair_orbit_certificate.assignment_orbit_long_matching_types,
      }),
      systematic_profile_reconciliation: certificate.systematic_profile_reconciliation_certificate,
      representative_labelled_tomography: certificate.representative_labelled_tomography_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for double-corruption isometry chamber: ${receiver}`);
  }
  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_ISOMETRY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_isometry_orbit_classification: true,
      universal_coding_isometry_theorem: false,
      physical_symmetry: false,
      physical_geometry: false,
      physical_gauge_group: false,
      physical_sensor_model: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyDoubleCorruptionIsometryOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_isometry_theorem === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_geometry === true
    || ceiling.physical_gauge_group === true
    || ceiling.physical_sensor_model === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.orbit_atlas_exposed === true
    || candidate?.payload?.stabilizer_atlas_exposed === true
    || candidate?.payload?.systematic_profile_atlas_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !runtime && !ashLeak });
}