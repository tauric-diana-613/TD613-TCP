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
  XOR_TRUTH_TABLE,
  enumerateBooleanTruthTables,
  evaluateBooleanTruthTable,
  systematicParityAugmentationLabel,
  dromologicalHolonomyParityCompletionCertificate,
} from './dromological-holonomy-parity-completion-erasure-robust-aia.js';

export const DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_SCHEMA =
  'td613.dome-world.dromological-holonomy-single-corruption-correcting-aia/v0.1';
export const DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_PARENT_RECEIPT =
  '68d700999c69c4bbb663904a8fafb47683e4032e';

const AUTHORITY_KEYS = Object.freeze([
  'inverse', 'encoder', 'custody_mutation', 'release', 'production', 'physical_claim', 'continuum_claim',
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

function binaryWords(width) {
  const rows = [];
  const count = 2 ** width;
  for (let value = 0; value < count; value += 1) {
    const word = [];
    for (let bit = width - 1; bit >= 0; bit -= 1) word.push((value >> bit) & 1);
    rows.push(freeze(word));
  }
  return freeze(rows);
}

function fourWordSubsets(words) {
  const rows = [];
  for (let a = 0; a < words.length - 3; a += 1) {
    for (let b = a + 1; b < words.length - 2; b += 1) {
      for (let c = b + 1; c < words.length - 1; c += 1) {
        for (let d = c + 1; d < words.length; d += 1) rows.push([words[a], words[b], words[c], words[d]]);
      }
    }
  }
  return rows;
}

function imageCensus(width) {
  const words = binaryWords(width);
  const images = fourWordSubsets(words);
  const correcting = [];
  for (const image of images) {
    const distances = pairwiseDistances(image);
    if (distances[0] >= 3) correcting.push(freeze({ image: freeze(image), distances: freeze(distances) }));
  }
  return freeze({
    width,
    ambient_word_count: words.length,
    audited_image_count: images.length,
    correcting_image_count: correcting.length,
    correcting_images: freeze(correcting),
  });
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

function receivedConditions(codeword) {
  const rows = [freeze([...codeword])];
  for (let index = 0; index < codeword.length; index += 1) {
    const corrupted = [...codeword];
    corrupted[index] ^= 1;
    rows.push(freeze(corrupted));
  }
  return freeze(rows);
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

function systematicLabels(functions) {
  return freeze(REPAIR_MASK_DOMAIN.map(mask => freeze([
    mask[0], mask[1], ...functions.map(table => evaluateBooleanTruthTable(table, mask)),
  ])));
}

function systematicCertificate() {
  const functions = enumerateBooleanTruthTables();
  const successes = [];
  let checked = 0;
  for (let first = 0; first < functions.length; first += 1) {
    for (let second = 0; second < functions.length; second += 1) {
      for (let third = 0; third < functions.length; third += 1) {
        checked += 1;
        const selected = [functions[first], functions[second], functions[third]];
        const labels = systematicLabels(selected);
        if (minimumDistance(labels) < 3) continue;
        const descriptors = selected.map(affineDescriptor);
        successes.push(freeze({
          function_indices: freeze([first, second, third]),
          truth_tables: freeze(selected),
          labels,
          distances: freeze(pairwiseDistances(labels)),
          affine_descriptors: freeze(descriptors),
          all_derived_functions_affine: descriptors.every(row => row.affine),
        }));
      }
    }
  }

  const allAffine = successes.every(row => row.all_derived_functions_affine);
  const linearTriples = new Set(successes.map(row => row.affine_descriptors
    .map(({ a, b }) => `${a}${b}`).join('|')));
  const allLinearConstraints = successes.every((row) => {
    const descriptors = row.affine_descriptors;
    return descriptors.filter(item => item.a === 1).length >= 2
      && descriptors.filter(item => item.b === 1).length >= 2
      && descriptors.filter(item => (item.a ^ item.b) === 1).length >= 1;
  });

  const decoderRows = [];
  for (const success of successes) {
    const labelled = success.labels.map((codeword, index) => freeze({
      repair_mask: REPAIR_MASK_DOMAIN[index],
      codeword,
    }));
    for (let classIndex = 0; classIndex < labelled.length; classIndex += 1) {
      for (const received of receivedConditions(labelled[classIndex].codeword)) {
        const decoded = nearestCodeword(received, labelled);
        decoderRows.push(freeze({
          encoding_indices: success.function_indices,
          expected_repair_mask: labelled[classIndex].repair_mask,
          received,
          decoded_repair_mask: decoded.repair_mask,
          unique: decoded.unique,
          exact: decoded.unique && same(decoded.repair_mask, labelled[classIndex].repair_mask),
        }));
      }
    }
  }

  return freeze({
    ordered_boolean_triple_count: checked,
    expected_ordered_boolean_triple_count: 4096,
    success_count: successes.length,
    expected_success_count: 96,
    successes: freeze(successes),
    every_success_uses_only_affine_derived_functions: allAffine,
    distinct_ordered_linear_coefficient_triples: linearTriples.size,
    expected_distinct_ordered_linear_coefficient_triples: 12,
    every_success_satisfies_linear_coefficient_constraints: allLinearConstraints,
    independent_constant_assignments_per_linear_triple: allAffine && linearTriples.size > 0
      ? successes.length / linearTriples.size
      : null,
    expected_independent_constant_assignments_per_linear_triple: 8,
    decoder_audit_count: decoderRows.length,
    expected_decoder_audit_count: 2304,
    every_systematic_received_word_decodes_exactly: decoderRows.every(row => row.exact),
    decoder_rows: freeze(decoderRows),
    exact: checked === 4096
      && successes.length === 96
      && allAffine
      && linearTriples.size === 12
      && allLinearConstraints
      && successes.length / linearTriples.size === 8
      && decoderRows.length === 2304
      && decoderRows.every(row => row.exact),
  });
}

export function canonicalFiveBitRepairCode() {
  return freeze(REPAIR_MASK_DOMAIN.map(([dH, dI]) => freeze({
    repair_mask: freeze([dH, dI]),
    codeword: freeze([dH, dI, dH, dI, dH ^ dI]),
  })));
}

export function decodeCanonicalFiveBitRepairWord(received) {
  if (!Array.isArray(received) || received.length !== 5 || !received.every(bit => bit === 0 || bit === 1)) {
    throw new Error('canonical corruption decoder requires five binary coordinates');
  }
  return nearestCodeword(received, canonicalFiveBitRepairCode());
}

function canonicalTomographyCertificate() {
  const parent = dromologicalHolonomyParityCompletionCertificate();
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const code = canonicalFiveBitRepairCode();
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
    for (const received of receivedConditions(codeRow.codeword)) {
      const decoded = decodeCanonicalFiveBitRepairWord(received);
      decoderChecks += 1;
      if (!decoded.unique || !same(decoded.repair_mask, mask) || decoded.minimum_distance > 1) exact = false;
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
    received_decoder_checks: decoderChecks,
    expected_received_decoder_checks: 24,
    minimum_cost_policy_checks: policyChecks,
    expected_minimum_cost_policy_checks: 24,
    class_robust_unimodular_checks: robustChecks,
    expected_class_robust_unimodular_checks: 24,
    exact_replay_assisted_state_reconstructions: reconstructions,
    expected_exact_replay_assisted_state_reconstructions: 4500,
    mixed_class_schedule_ambiguity_preserved:
      classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2),
    exact: exact
      && minimumDistance(code.map(row => row.codeword)) === 3
      && decoderChecks === 24
      && policyChecks === 24
      && robustChecks === 24
      && reconstructions === 4500,
  });
}

function parentThreeBitNegativeControl() {
  const labels = REPAIR_MASK_DOMAIN.map(mask => systematicParityAugmentationLabel(mask, XOR_TRUTH_TABLE));
  const distance = minimumDistance(labels);
  let ambiguousReceived = null;
  const allThreeBitWords = binaryWords(3);
  for (const word of allThreeBitWords) {
    const distances = labels.map(label => hamming(word, label));
    const minimum = Math.min(...distances);
    if (minimum === 1 && distances.filter(value => value === minimum).length > 1) {
      ambiguousReceived = word;
      break;
    }
  }
  return freeze({
    parent_xor_labels: freeze(labels),
    parent_xor_minimum_distance: distance,
    unknown_single_bit_correction_not_guaranteed: distance === 2,
    explicit_ambiguous_received_word: ambiguousReceived,
    explicit_ambiguity_exists: Boolean(ambiguousReceived),
    exact: distance === 2 && Boolean(ambiguousReceived),
  });
}

function imageClassificationCertificate() {
  const widthFour = imageCensus(4);
  const widthFive = imageCensus(5);
  const fiveDistanceSpectrumExact = widthFive.correcting_images.every(row => same(row.distances, [3, 3, 3, 3, 4, 4]));
  const labelledCount = widthFive.correcting_image_count * 24;
  return freeze({
    width_four: widthFour,
    width_five: widthFive,
    radius_one_ball_size_width_four: 5,
    four_class_radius_one_packing_demand_width_four: 20,
    ambient_size_width_four: 16,
    packing_bound_rules_out_width_four: 20 > 16,
    expected_width_four_image_count: 1820,
    expected_width_four_correcting_count: 0,
    expected_width_five_image_count: 35960,
    expected_width_five_correcting_count: 120,
    every_width_five_success_has_distance_spectrum_333344: fiveDistanceSpectrumExact,
    class_label_assignments_per_image: 24,
    class_labelled_width_five_correcting_encoding_count: labelledCount,
    expected_class_labelled_width_five_correcting_encoding_count: 2880,
    five_binary_coordinates_minimal: widthFour.correcting_image_count === 0 && widthFive.correcting_image_count > 0,
    exact: widthFour.audited_image_count === 1820
      && widthFour.correcting_image_count === 0
      && widthFive.audited_image_count === 35960
      && widthFive.correcting_image_count === 120
      && fiveDistanceSpectrumExact
      && labelledCount === 2880,
  });
}

export function dromologicalHolonomySingleCorruptionCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyParityCompletionCertificate();
  const images = imageClassificationCertificate();
  const systematic = systematicCertificate();
  const negative = parentThreeBitNegativeControl();
  const tomography = canonicalTomographyCertificate();
  const passed = parent.passed && images.exact && systematic.exact && negative.exact && tomography.exact;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_PARENT_RECEIPT,
    parent_schema: parent.schema,
    image_classification_certificate: images,
    systematic_affine_certificate: systematic,
    parent_erasure_negative_control: negative,
    tomography_closure_certificate: tomography,
    passed,
    minimal_width_classification: passed
      ? 'FIVE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE'
      : 'FIVE_BINARY_RECEIVER_COORDINATE_SINGLE_CORRUPTION_MINIMALITY_NOT_ESTABLISHED',
    complete_image_classification: passed
      ? 'EXACTLY_120_OF_THE_35960_FOUR_WORD_SUBSETS_OF_THE_FIVE_CUBE_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AND_THEIR_2880_CLASS_LABELINGS_EXHAUST_THE_MINIMAL_WIDTH_FIVE_RECEIVER_ENCODINGS_IN_THE_DECLARED_FIXTURE'
      : 'WIDTH_FIVE_CORRUPTION_CORRECTING_IMAGE_CLASSIFICATION_NOT_ESTABLISHED',
    systematic_classification: passed
      ? 'EXACTLY_96_OF_THE_4096_SYSTEMATIC_THREE_DERIVED_BIT_AUGMENTATIONS_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AND_EVERY_SUCCESSFUL_DERIVED_COORDINATE_IS_AFFINE_IN_THE_FIXED_REPAIR_MASK_FIXTURE'
      : 'SYSTEMATIC_SINGLE_CORRUPTION_CLASSIFICATION_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'UNKNOWN_RECEIVER_COORDINATE_CORRUPTION_REQUIRES_STRICTLY_MORE_DERIVED_REPRESENTATIONAL_REDUNDANCY_THAN_KNOWN_COORDINATE_ERASURE_WHILE_SOURCE_CUSTODY_HISTORICAL_INFORMATION_AND_RECEIVER_AUTHORITY_REMAIN_UNCHANGED'
      : 'AIA_UNKNOWN_CORRUPTION_REDUNDANCY_SEPARATION_NOT_ESTABLISHED',
    scars: freeze([
      'KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION',
      'SINGLE_BIT_CORRUPTION != PHYSICAL_SENSOR_NOISE_MODEL',
      'HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE',
      'FIVE_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND',
      'FINITE_NEAREST_NEIGHBOR_DECODER != UNIVERSAL_ERROR_CORRECTION',
      'AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY',
      'CORRUPTION_CORRECTION != NEW_SENSOR_INFORMATION',
      'CORRECTED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION',
      'REPAIR_MASK_RECOVERY != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'EXACT_TOMOGRAPHY_AFTER_LABEL_CORRECTION != OPERATIONAL_INVERSE_ROUTE',
      'FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomySingleCorruptionProjection(receiver) {
  const certificate = dromologicalHolonomySingleCorruptionCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified single-corruption chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.single-corruption-child-legible/v0.1',
      truths: freeze([
        'FIVE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ONE_WRONG_CLUE_CAN_BE_FOUND_AND_REPAIRED_HERE',
        'THREE_CLUES_WERE_ENOUGH_WHEN_WE_KNEW_WHICH_CLUE_WAS_MISSING',
        'A_WRONG_CLUE_WITH_AN_UNKNOWN_LOCATION_NEEDS_MORE_REDUNDANCY_THAN_A_KNOWN_MISSING_CLUE',
        'REPAIRING_THE_RECEIVER_LABEL_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER',
      ]),
      codeword_atlas_exposed: false,
      affine_function_atlas_exposed: false,
      nearest_neighbor_decoder_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.single-corruption-loom-technical/v0.1',
      image_summary: freeze({
        width_four_correcting_images: certificate.image_classification_certificate.width_four.correcting_image_count,
        width_five_correcting_images: certificate.image_classification_certificate.width_five.correcting_image_count,
        width_five_class_labelled_encodings:
          certificate.image_classification_certificate.class_labelled_width_five_correcting_encoding_count,
      }),
      systematic_summary: freeze({
        successful_augmentations: certificate.systematic_affine_certificate.success_count,
        every_success_affine:
          certificate.systematic_affine_certificate.every_success_uses_only_affine_derived_functions,
      }),
      tomography_closure_certificate: certificate.tomography_closure_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for single-corruption chamber: ${receiver}`);
  }
  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_single_corruption_correction: true,
      universal_coding_theorem: false,
      shannon_capacity_theorem: false,
      universal_error_correction: false,
      physical_sensor_noise: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomySingleCorruptionOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity_theorem === true
    || ceiling.universal_error_correction === true
    || ceiling.physical_sensor_noise === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.codeword_atlas_exposed === true
    || candidate?.payload?.affine_function_atlas_exposed === true
    || candidate?.payload?.nearest_neighbor_decoder_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !runtime && !ashLeak });
}
