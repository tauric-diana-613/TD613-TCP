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
import {
  REPAIR_MASK_DOMAIN,
  enumerateBooleanTruthTables,
  evaluateBooleanTruthTable,
} from './dromological-holonomy-parity-completion-erasure-robust-aia.js';
import {
  canonicalSixBitRepairCode,
  dromologicalHolonomyCorruptionPlusErasureCertificate,
} from './dromological-holonomy-corruption-plus-erasure-aia.js';

export const DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_SCHEMA =
  'td613.dome-world.dromological-holonomy-double-corruption-correcting-aia/v0.1';
export const DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_PARENT_RECEIPT =
  '9a76b7594ba8d9093d8c6ef9428c669dbb2581f1';

const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'release', 'production', 'physical_claim', 'continuum_claim',
]);
const MASK_PAIRS = Object.freeze([
  Object.freeze([0, 1]),
  Object.freeze([0, 2]),
  Object.freeze([0, 3]),
  Object.freeze([1, 2]),
  Object.freeze([1, 3]),
  Object.freeze([2, 3]),
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

function hamming(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    throw new Error('Hamming comparison requires equal-length words');
  }
  return left.reduce((sum, bit, index) => sum + (bit === right[index] ? 0 : 1), 0);
}

function popcount(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1;
    count += 1;
  }
  return count;
}

function integerWord(value, width) {
  return freeze(Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1));
}

function pairwiseDistances(codewords) {
  const distances = [];
  for (let left = 0; left < codewords.length; left += 1) {
    for (let right = left + 1; right < codewords.length; right += 1) {
      distances.push(hamming(codewords[left], codewords[right]));
    }
  }
  return distances.sort((a, b) => a - b);
}

function minimumDistance(codewords) {
  return Math.min(...pairwiseDistances(codewords));
}

function choose4(n) {
  return (n * (n - 1) * (n - 2) * (n - 3)) / 24;
}

function compatibilityGraphCensus(width) {
  const wordCount = 2 ** width;
  const compatibleAbove = Array.from({ length: wordCount }, () => []);
  const compatible = Array.from({ length: wordCount }, () => new Uint8Array(wordCount));
  let edgeCount = 0;

  for (let left = 0; left < wordCount; left += 1) {
    for (let right = left + 1; right < wordCount; right += 1) {
      if (popcount(left ^ right) < 5) continue;
      compatibleAbove[left].push(right);
      compatible[left][right] = 1;
      compatible[right][left] = 1;
      edgeCount += 1;
    }
  }

  let qualifying = 0;
  const spectra = new Map();
  let example = null;
  for (let a = 0; a < wordCount; a += 1) {
    const aNeighbors = compatibleAbove[a];
    for (let bIndex = 0; bIndex < aNeighbors.length; bIndex += 1) {
      const b = aNeighbors[bIndex];
      for (let cIndex = bIndex + 1; cIndex < aNeighbors.length; cIndex += 1) {
        const c = aNeighbors[cIndex];
        if (compatible[b][c] !== 1) continue;
        for (let dIndex = cIndex + 1; dIndex < aNeighbors.length; dIndex += 1) {
          const d = aNeighbors[dIndex];
          if (compatible[b][d] !== 1 || compatible[c][d] !== 1) continue;
          qualifying += 1;
          const distances = [
            popcount(a ^ b), popcount(a ^ c), popcount(a ^ d),
            popcount(b ^ c), popcount(b ^ d), popcount(c ^ d),
          ].sort((x, y) => x - y);
          const key = distances.join(',');
          spectra.set(key, (spectra.get(key) ?? 0) + 1);
          if (!example) example = freeze({
            integer_words: freeze([a, b, c, d]),
            codewords: freeze([a, b, c, d].map(value => integerWord(value, width))),
            distances: freeze(distances),
          });
        }
      }
    }
  }

  return freeze({
    width,
    ambient_word_count: wordCount,
    ambient_four_word_image_count: choose4(wordCount),
    compatibility_edge_count: edgeCount,
    qualifying_image_count: qualifying,
    spectrum_counts: freeze(Object.fromEntries([...spectra.entries()])),
    first_qualifying_image: example,
  });
}

function affineDescriptor(table) {
  for (let constant = 0; constant <= 1; constant += 1) {
    for (let a = 0; a <= 1; a += 1) {
      for (let b = 0; b <= 1; b += 1) {
        const candidate = REPAIR_MASK_DOMAIN.map(([dH, dI]) => constant ^ (a & dH) ^ (b & dI));
        if (same(candidate, table)) return freeze({ affine: true, constant, a, b });
      }
    }
  }
  return freeze({ affine: false, constant: null, a: null, b: null });
}

function truthTableDifferenceSignature(table) {
  const values = REPAIR_MASK_DOMAIN.map(mask => evaluateBooleanTruthTable(table, mask));
  return freeze(MASK_PAIRS.map(([left, right]) => values[left] ^ values[right]));
}

function differenceSignatureClasses() {
  const groups = new Map();
  for (const table of enumerateBooleanTruthTables()) {
    const signature = truthTableDifferenceSignature(table);
    const key = signature.join('');
    if (!groups.has(key)) groups.set(key, { signature, tables: [], descriptors: [] });
    groups.get(key).tables.push(table);
    groups.get(key).descriptors.push(affineDescriptor(table));
  }

  return freeze([...groups.values()].map((group) => {
    const bothAffine = group.descriptors.every(item => item.affine);
    const coefficient = bothAffine
      ? freeze({ a: group.descriptors[0].a, b: group.descriptors[0].b })
      : null;
    return freeze({
      signature: group.signature,
      tables: freeze(group.tables),
      descriptors: freeze(group.descriptors),
      complement_pair: group.tables.length === 2
        && group.tables[0].every((bit, index) => bit ^ group.tables[1][index]),
      both_affine: bothAffine,
      coefficient,
    });
  }));
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

function nearestCodeword(received, labelledRows) {
  const ranked = labelledRows.map(row => ({
    repair_mask: row.repair_mask,
    codeword: row.codeword,
    distance: hamming(received, row.codeword),
  })).sort((left, right) => left.distance - right.distance);
  const minimum = ranked[0].distance;
  const nearest = ranked.filter(row => row.distance === minimum);
  return freeze({
    received: freeze([...received]),
    minimum_distance: minimum,
    unique: nearest.length === 1,
    repair_mask: nearest.length === 1 ? freeze([...nearest[0].repair_mask]) : null,
    codeword: nearest.length === 1 ? freeze([...nearest[0].codeword]) : null,
    tie_count: nearest.length,
  });
}

function systematicCodeFromCoefficients(coefficients, constantMask = 0) {
  return freeze(REPAIR_MASK_DOMAIN.map(([dH, dI], classIndex) => freeze({
    repair_mask: freeze([dH, dI]),
    codeword: freeze([
      dH,
      dI,
      ...coefficients.map(({ a, b }, index) => ((constantMask >> index) & 1) ^ (a & dH) ^ (b & dI)),
    ]),
    class_index: classIndex,
  })));
}

function systematicCertificate() {
  const groups = differenceSignatureClasses();
  const rawDistances = MASK_PAIRS.map(([left, right]) => hamming(REPAIR_MASK_DOMAIN[left], REPAIR_MASK_DOMAIN[right]));
  const successfulCoefficientSextuples = [];
  let signatureSextuplesChecked = 0;

  function visit(depth, totals, selected) {
    if (depth === 6) {
      signatureSextuplesChecked += 1;
      if (Math.min(...totals) < 5) return;
      const selectedGroups = selected.map(index => groups[index]);
      if (!selectedGroups.every(group => group.both_affine)) {
        successfulCoefficientSextuples.push(freeze({ coefficients: null, non_affine: true }));
        return;
      }
      const coefficients = freeze(selectedGroups.map(group => freeze({ ...group.coefficient })));
      successfulCoefficientSextuples.push(freeze({ coefficients, non_affine: false }));
      return;
    }
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const signature = groups[groupIndex].signature;
      visit(
        depth + 1,
        totals.map((value, index) => value + signature[index]),
        [...selected, groupIndex],
      );
    }
  }

  visit(0, rawDistances, []);

  const allAffine = successfulCoefficientSextuples.every(row => !row.non_affine && row.coefficients);
  const profileCounts = new Map();
  let noZeroCoefficient = true;
  let inequalitiesExact = true;
  if (allAffine) {
    for (const row of successfulCoefficientSextuples) {
      let nH = 0;
      let nI = 0;
      let nX = 0;
      for (const { a, b } of row.coefficients) {
        if (a === 1 && b === 0) nH += 1;
        else if (a === 0 && b === 1) nI += 1;
        else if (a === 1 && b === 1) nX += 1;
        else noZeroCoefficient = false;
      }
      if (!(nH + nX >= 4 && nI + nX >= 4 && nH + nI >= 3 && nH + nI + nX === 6)) {
        inequalitiesExact = false;
      }
      const key = `${nH},${nI},${nX}`;
      profileCounts.set(key, (profileCounts.get(key) ?? 0) + 1);
    }
  }

  let decoderAudits = 0;
  let decoderExact = true;
  if (allAffine) {
    for (const row of successfulCoefficientSextuples) {
      for (let constantMask = 0; constantMask < 64; constantMask += 1) {
        const code = systematicCodeFromCoefficients(row.coefficients, constantMask);
        if (minimumDistance(code.map(item => item.codeword)) < 5) decoderExact = false;
        for (let classIndex = 0; classIndex < code.length; classIndex += 1) {
          for (const received of receivedConditionsRadiusTwo(code[classIndex].codeword)) {
            const decoded = nearestCodeword(received, code);
            decoderAudits += 1;
            if (!decoded.unique
              || decoded.minimum_distance > 2
              || !same(decoded.repair_mask, code[classIndex].repair_mask)) decoderExact = false;
          }
        }
      }
    }
  }

  const successfulLinearSextupleCount = allAffine ? successfulCoefficientSextuples.length : 0;
  const liftedSuccessCount = successfulLinearSextupleCount * 64;
  const expectedProfiles = { '1,2,3': 60, '2,1,3': 60, '2,2,2': 90 };
  const observedProfiles = Object.fromEntries([...profileCounts.entries()].sort());

  return freeze({
    truth_table_count: 16,
    ordered_truth_table_sextuple_count: 16 ** 6,
    difference_signature_class_count: groups.length,
    every_difference_signature_class_is_complement_pair: groups.every(group => group.complement_pair),
    ordered_difference_signature_sextuples_checked: signatureSextuplesChecked,
    expected_ordered_difference_signature_sextuples_checked: 8 ** 6,
    successful_ordered_linear_coefficient_sextuples: successfulLinearSextupleCount,
    expected_successful_ordered_linear_coefficient_sextuples: 210,
    affine_constant_lift_per_linear_sextuple: 64,
    lifted_successful_truth_table_sextuples: liftedSuccessCount,
    expected_lifted_successful_truth_table_sextuples: 13440,
    every_success_uses_only_affine_derived_functions: allAffine,
    no_success_uses_zero_linear_coefficient: noZeroCoefficient,
    every_success_satisfies_exact_separation_inequalities: inequalitiesExact,
    coefficient_profile_counts: freeze(observedProfiles),
    expected_coefficient_profile_counts: freeze(expectedProfiles),
    radius_two_decoder_audit_count: decoderAudits,
    expected_radius_two_decoder_audit_count: 1989120,
    every_systematic_radius_two_word_decodes_exactly: decoderExact,
    exact: groups.length === 8
      && groups.every(group => group.complement_pair)
      && signatureSextuplesChecked === 262144
      && successfulLinearSextupleCount === 210
      && liftedSuccessCount === 13440
      && allAffine
      && noZeroCoefficient
      && inequalitiesExact
      && same(observedProfiles, expectedProfiles)
      && decoderAudits === 1989120
      && decoderExact,
  });
}

export function canonicalEightBitRepairCode() {
  return systematicCodeFromCoefficients([
    { a: 1, b: 0 },
    { a: 1, b: 0 },
    { a: 0, b: 1 },
    { a: 0, b: 1 },
    { a: 1, b: 1 },
    { a: 1, b: 1 },
  ]);
}

export function decodeCanonicalEightBitRepairWord(received) {
  if (!Array.isArray(received) || received.length !== 8 || !received.every(bit => bit === 0 || bit === 1)) {
    throw new Error('double-corruption decoder requires eight binary receiver coordinates');
  }
  return nearestCodeword(received, canonicalEightBitRepairCode());
}

function parentDistanceFourNegativeControl() {
  const code = canonicalSixBitRepairCode();
  let witness = null;
  for (let left = 0; left < code.length && !witness; left += 1) {
    for (let right = left + 1; right < code.length && !witness; right += 1) {
      if (hamming(code[left].codeword, code[right].codeword) !== 4) continue;
      const differing = code[left].codeword
        .map((bit, index) => bit !== code[right].codeword[index] ? index : -1)
        .filter(index => index >= 0);
      const received = [...code[left].codeword];
      received[differing[0]] ^= 1;
      received[differing[1]] ^= 1;
      const decoded = nearestCodeword(received, code);
      if (!decoded.unique && decoded.minimum_distance === 2) {
        witness = freeze({
          left_repair_mask: code[left].repair_mask,
          right_repair_mask: code[right].repair_mask,
          left_codeword: code[left].codeword,
          right_codeword: code[right].codeword,
          original_distance: 4,
          flipped_indices: freeze([differing[0], differing[1]]),
          ambiguous_received: freeze(received),
          minimum_distance: decoded.minimum_distance,
          tie_count: decoded.tie_count,
        });
      }
    }
  }
  return freeze({
    parent_width_six_minimum_distance: minimumDistance(code.map(row => row.codeword)),
    explicit_radius_two_ambiguity: witness,
    exact: minimumDistance(code.map(row => row.codeword)) === 4 && Boolean(witness),
  });
}

function imageClassificationCertificate() {
  const widthSeven = compatibilityGraphCensus(7);
  const widthEight = compatibilityGraphCensus(8);
  const expectedSpectrum = { '5,5,5,5,6,6': 17920 };
  const labelledCount = widthEight.qualifying_image_count * 24;
  return freeze({
    width_seven: widthSeven,
    width_eight: widthEight,
    expected_width_seven_ambient_image_count: 10668000,
    expected_width_seven_qualifying_count: 0,
    expected_width_eight_ambient_image_count: 174792640,
    expected_width_eight_qualifying_count: 17920,
    every_width_eight_success_has_distance_spectrum_555566: same(widthEight.spectrum_counts, expectedSpectrum),
    class_label_assignments_per_image: 24,
    class_labelled_width_eight_correcting_encoding_count: labelledCount,
    expected_class_labelled_width_eight_correcting_encoding_count: 430080,
    eight_binary_coordinates_minimal: widthSeven.qualifying_image_count === 0 && widthEight.qualifying_image_count > 0,
    exact: widthSeven.ambient_four_word_image_count === 10668000
      && widthSeven.qualifying_image_count === 0
      && widthEight.ambient_four_word_image_count === 174792640
      && widthEight.qualifying_image_count === 17920
      && same(widthEight.spectrum_counts, expectedSpectrum)
      && labelledCount === 430080,
  });
}

function canonicalTomographyCertificate() {
  const parent = dromologicalHolonomyCorruptionPlusErasureCertificate();
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const code = canonicalEightBitRepairCode();
  const schedulesById = new Map(DROMOLOGICAL_S3_SCHEDULES.map((schedule) => {
    const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
    return [schedule.map(stratum => letters[stratum]).join('-'), schedule];
  }));

  let decoderChecks = 0;
  let policyChecks = 0;
  let robustChecks = 0;
  let reconstructions = 0;
  let exact = parent.passed;

  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    const holonomyClass = classes[classIndex];
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const codeRow = code.find(row => same(row.repair_mask, mask));
    if (!codeRow) {
      exact = false;
      continue;
    }
    for (const received of receivedConditionsRadiusTwo(codeRow.codeword)) {
      const decoded = decodeCanonicalEightBitRepairWord(received);
      decoderChecks += 1;
      if (!decoded.unique || !same(decoded.repair_mask, mask) || decoded.minimum_distance > 2) exact = false;
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

  return freeze({
    canonical_code: code,
    canonical_pairwise_distances: freeze(pairwiseDistances(code.map(row => row.codeword))),
    canonical_minimum_distance: minimumDistance(code.map(row => row.codeword)),
    radius_two_received_decoder_checks: decoderChecks,
    expected_radius_two_received_decoder_checks: 148,
    minimum_cost_policy_checks: policyChecks,
    expected_minimum_cost_policy_checks: 148,
    class_robust_unimodular_checks: robustChecks,
    expected_class_robust_unimodular_checks: 148,
    exact_replay_assisted_state_reconstructions: reconstructions,
    expected_exact_replay_assisted_state_reconstructions: 27750,
    mixed_class_schedule_ambiguity_preserved:
      classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2),
    exact: exact
      && same(pairwiseDistances(code.map(row => row.codeword)), [5, 5, 5, 5, 6, 6])
      && decoderChecks === 148
      && policyChecks === 148
      && robustChecks === 148
      && reconstructions === 27750,
  });
}

export function dromologicalHolonomyDoubleCorruptionCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyCorruptionPlusErasureCertificate();
  const images = imageClassificationCertificate();
  const systematic = systematicCertificate();
  const negative = parentDistanceFourNegativeControl();
  const tomography = canonicalTomographyCertificate();
  const passed = parent.passed && images.exact && systematic.exact && negative.exact && tomography.exact;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_PARENT_RECEIPT,
    parent_schema: parent.schema,
    image_classification_certificate: images,
    systematic_affine_certificate: systematic,
    parent_mixed_fault_negative_control: negative,
    tomography_closure_certificate: tomography,
    passed,
    minimal_width_classification: passed
      ? 'EIGHT_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_UP_TO_TWO_UNKNOWN_BINARY_COORDINATE_CORRUPTIONS_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE'
      : 'EIGHT_BINARY_RECEIVER_COORDINATE_DOUBLE_CORRUPTION_MINIMALITY_NOT_ESTABLISHED',
    complete_image_classification: passed
      ? 'EXACTLY_17920_FOUR_WORD_SUBSETS_OF_THE_EIGHT_CUBE_HAVE_THE_DISTANCE_FIVE_GEOMETRY_REQUIRED_FOR_TWO_UNKNOWN_CORRUPTION_REPAIR_AND_EVERY_SUCCESSFUL_IMAGE_HAS_DISTANCE_SPECTRUM_555566_IN_THE_DECLARED_FIXTURE'
      : 'WIDTH_EIGHT_DOUBLE_CORRUPTION_IMAGE_CLASSIFICATION_NOT_ESTABLISHED',
    systematic_classification: passed
      ? 'EXACTLY_13440_OF_THE_16777216_SYSTEMATIC_SIX_DERIVED_BIT_AUGMENTATIONS_CORRECT_UP_TO_TWO_UNKNOWN_BIT_CORRUPTIONS_AND_EVERY_SUCCESSFUL_DERIVED_COORDINATE_IS_AFFINE_IN_THE_FIXED_REPAIR_MASK_FIXTURE'
      : 'SYSTEMATIC_DOUBLE_CORRUPTION_CLASSIFICATION_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'TWO_UNKNOWN_RECEIVER_COORDINATE_CORRUPTIONS_CAN_BE_REPAIRED_BY_DERIVED_RECEIVER_REDUNDANCY_AT_WIDTH_EIGHT_IN_THE_FIXED_FOUR_CLASS_S3_FIXTURE_WHILE_SOURCE_CUSTODY_HISTORICAL_INFORMATION_AND_RECEIVER_AUTHORITY_REMAIN_UNCHANGED'
      : 'AIA_DOUBLE_CORRUPTION_REDUNDANCY_LAW_NOT_ESTABLISHED',
    scars: freeze([
      'KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION',
      'ONE_CORRUPTION_PLUS_ONE_ERASURE_CORRECTION != TWO_UNKNOWN_CORRUPTION_CORRECTION',
      'DISTANCE_FOUR_RECEIVER_GEOMETRY != RADIUS_TWO_UNIQUE_DECODING',
      'TWO_UNKNOWN_CORRUPTIONS != PHYSICAL_SENSOR_NOISE_MODEL',
      'HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE',
      'EIGHT_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND',
      'FINITE_COMPATIBILITY_GRAPH_CENSUS != SHANNON_THEOREM',
      'FINITE_RADIUS_TWO_NEAREST_WORD_DECODER != UNIVERSAL_DOUBLE_ERROR_CORRECTION',
      'AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY',
      'DERIVED_REDUNDANCY != NEW_SENSOR_INFORMATION',
      'CORRECTED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION',
      'REPAIR_MASK_RECOVERY != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'EXACT_TOMOGRAPHY_AFTER_LABEL_CORRECTION != OPERATIONAL_INVERSE_ROUTE',
      'FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyDoubleCorruptionProjection(receiver) {
  const certificate = dromologicalHolonomyDoubleCorruptionCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified double-corruption chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.double-corruption-child-legible/v0.1',
      truths: freeze([
        'TWO_WRONG_CLUES_WITH_UNKNOWN_LOCATIONS_NEED_MORE_REDUNDANT_CLUES_HERE_THAN_ONE_WRONG_CLUE_PLUS_ONE_KNOWN_MISSING_CLUE',
        'EIGHT_CLUES_ARE_THE_FIRST_WIDTH_IN_THIS_FIXED_FOUR_CLASS_GAME_THAT_REPAIRS_ANY_TWO_UNKNOWN_WRONG_CLUES',
        'THE_EXTRA_CLUES_REPEAT_DERIVED_STRUCTURE_THEY_DO_NOT_ADD_NEW_SOURCE_INFORMATION',
        'FIXING_THE_RECEIVER_LABEL_STILL_DOES_NOT_RECOVER_FORGOTTEN_TEMPORAL_ORDER',
      ]),
      codeword_atlas_exposed: false,
      affine_function_atlas_exposed: false,
      radius_two_decoder_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.double-corruption-loom-technical/v0.1',
      image_summary: freeze({
        width_seven_correcting_images: certificate.image_classification_certificate.width_seven.qualifying_image_count,
        width_eight_correcting_images: certificate.image_classification_certificate.width_eight.qualifying_image_count,
        width_eight_class_labelled_encodings:
          certificate.image_classification_certificate.class_labelled_width_eight_correcting_encoding_count,
      }),
      systematic_summary: freeze({
        successful_augmentations: certificate.systematic_affine_certificate.lifted_successful_truth_table_sextuples,
        successful_linear_sextuples:
          certificate.systematic_affine_certificate.successful_ordered_linear_coefficient_sextuples,
        every_success_affine:
          certificate.systematic_affine_certificate.every_success_uses_only_affine_derived_functions,
      }),
      tomography_closure_certificate: certificate.tomography_closure_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for double-corruption chamber: ${receiver}`);
  }
  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_DOUBLE_CORRUPTION_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_two_unknown_corruption_correction: true,
      universal_coding_theorem: false,
      shannon_capacity_theorem: false,
      universal_double_error_correction: false,
      physical_sensor_fault_model: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyDoubleCorruptionOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity_theorem === true
    || ceiling.universal_double_error_correction === true
    || ceiling.physical_sensor_fault_model === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.codeword_atlas_exposed === true
    || candidate?.payload?.affine_function_atlas_exposed === true
    || candidate?.payload?.radius_two_decoder_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !runtime && !ashLeak });
}
