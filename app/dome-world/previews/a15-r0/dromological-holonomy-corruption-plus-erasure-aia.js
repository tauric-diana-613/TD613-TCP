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
  canonicalFiveBitRepairCode,
  dromologicalHolonomySingleCorruptionCertificate,
} from './dromological-holonomy-single-corruption-correcting-aia.js';

export const DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_SCHEMA =
  'td613.dome-world.dromological-holonomy-corruption-plus-erasure-aia/v0.1';
export const DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_PARENT_RECEIPT =
  'de878502536c2a61a354ec898d07d5802bfcca5f';

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
  for (let value = 0; value < 2 ** width; value += 1) {
    const word = [];
    for (let bit = width - 1; bit >= 0; bit -= 1) word.push((value >> bit) & 1);
    rows.push(freeze(word));
  }
  return freeze(rows);
}

function imageCensus(width) {
  const words = binaryWords(width);
  let audited = 0;
  const correcting = [];
  for (let a = 0; a < words.length - 3; a += 1) {
    for (let b = a + 1; b < words.length - 2; b += 1) {
      for (let c = b + 1; c < words.length - 1; c += 1) {
        for (let d = c + 1; d < words.length; d += 1) {
          audited += 1;
          const image = [words[a], words[b], words[c], words[d]];
          const distances = pairwiseDistances(image);
          if (distances[0] >= 4) correcting.push(freeze({ image: freeze(image), distances: freeze(distances) }));
        }
      }
    }
  }
  return freeze({
    width,
    ambient_word_count: words.length,
    audited_image_count: audited,
    correcting_image_count: correcting.length,
    correcting_images: freeze(correcting),
  });
}

function puncture(word, erasedIndex) {
  if (!Array.isArray(word) || erasedIndex < 0 || erasedIndex >= word.length) {
    throw new Error('puncture requires a valid word and erased coordinate');
  }
  return freeze(word.filter((_, index) => index !== erasedIndex));
}

function survivingReceivedConditions(puncturedWord) {
  const rows = [freeze([...puncturedWord])];
  for (let index = 0; index < puncturedWord.length; index += 1) {
    const corrupted = [...puncturedWord];
    corrupted[index] ^= 1;
    rows.push(freeze(corrupted));
  }
  return freeze(rows);
}

function nearestPuncturedCodeword(received, labelledRows, erasedIndex) {
  const ranked = labelledRows.map(row => ({
    repair_mask: row.repair_mask,
    codeword: row.codeword,
    punctured_codeword: puncture(row.codeword, erasedIndex),
    distance: hamming(received, puncture(row.codeword, erasedIndex)),
  })).sort((left, right) => left.distance - right.distance);
  const minimum = ranked[0].distance;
  const nearest = ranked.filter(row => row.distance === minimum);
  return freeze({
    erased_index: erasedIndex,
    received: freeze([...received]),
    minimum_distance: minimum,
    unique: nearest.length === 1,
    repair_mask: nearest.length === 1 ? freeze([...nearest[0].repair_mask]) : null,
    codeword: nearest.length === 1 ? freeze([...nearest[0].codeword]) : null,
    tie_count: nearest.length,
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
        for (let fourth = 0; fourth < functions.length; fourth += 1) {
          checked += 1;
          const selected = [functions[first], functions[second], functions[third], functions[fourth]];
          const labels = systematicLabels(selected);
          if (minimumDistance(labels) < 4) continue;
          const descriptors = selected.map(affineDescriptor);
          successes.push(freeze({
            function_indices: freeze([first, second, third, fourth]),
            truth_tables: freeze(selected),
            labels,
            distances: freeze(pairwiseDistances(labels)),
            affine_descriptors: freeze(descriptors),
            all_derived_functions_affine: descriptors.every(row => row.affine),
          }));
        }
      }
    }
  }

  const allAffine = successes.every(row => row.all_derived_functions_affine);
  const linearQuadruples = new Set(successes.map(row => row.affine_descriptors
    .map(({ a, b }) => `${a}${b}`).join('|')));
  const allLinearConstraints = successes.every((row) => {
    const descriptors = row.affine_descriptors;
    return descriptors.filter(item => item.a === 1).length >= 3
      && descriptors.filter(item => item.b === 1).length >= 3
      && descriptors.filter(item => (item.a ^ item.b) === 1).length >= 2;
  });

  let decoderAudits = 0;
  let decoderExact = true;
  for (const success of successes) {
    const labelled = success.labels.map((codeword, index) => freeze({
      repair_mask: REPAIR_MASK_DOMAIN[index],
      codeword,
    }));
    for (let classIndex = 0; classIndex < labelled.length; classIndex += 1) {
      for (let erasedIndex = 0; erasedIndex < 6; erasedIndex += 1) {
        const punctured = puncture(labelled[classIndex].codeword, erasedIndex);
        for (const received of survivingReceivedConditions(punctured)) {
          const decoded = nearestPuncturedCodeword(received, labelled, erasedIndex);
          decoderAudits += 1;
          if (!decoded.unique || !same(decoded.repair_mask, labelled[classIndex].repair_mask)) decoderExact = false;
        }
      }
    }
  }

  const constantsPerLinearQuadruple = allAffine && linearQuadruples.size > 0
    ? successes.length / linearQuadruples.size
    : null;

  return freeze({
    ordered_boolean_quadruple_count: checked,
    expected_ordered_boolean_quadruple_count: 65536,
    success_count: successes.length,
    expected_success_count: 192,
    successes: freeze(successes),
    every_success_uses_only_affine_derived_functions: allAffine,
    distinct_ordered_linear_coefficient_quadruples: linearQuadruples.size,
    expected_distinct_ordered_linear_coefficient_quadruples: 12,
    every_success_satisfies_linear_coefficient_constraints: allLinearConstraints,
    independent_constant_assignments_per_linear_quadruple: constantsPerLinearQuadruple,
    expected_independent_constant_assignments_per_linear_quadruple: 16,
    mixed_fault_decoder_audit_count: decoderAudits,
    expected_mixed_fault_decoder_audit_count: 27648,
    every_systematic_mixed_fault_word_decodes_exactly: decoderExact,
    exact: checked === 65536
      && successes.length === 192
      && allAffine
      && linearQuadruples.size === 12
      && allLinearConstraints
      && constantsPerLinearQuadruple === 16
      && decoderAudits === 27648
      && decoderExact,
  });
}

export function canonicalSixBitRepairCode() {
  return freeze(REPAIR_MASK_DOMAIN.map(([dH, dI]) => freeze({
    repair_mask: freeze([dH, dI]),
    codeword: freeze([dH, dI, dH, dI, dH ^ dI, dH ^ dI]),
  })));
}

export function decodeCanonicalSixBitRepairWordAfterErasure(received, erasedIndex) {
  if (!Array.isArray(received) || received.length !== 5 || !received.every(bit => bit === 0 || bit === 1)) {
    throw new Error('mixed-fault decoder requires five surviving binary coordinates');
  }
  if (!Number.isInteger(erasedIndex) || erasedIndex < 0 || erasedIndex >= 6) {
    throw new Error('mixed-fault decoder requires known erased coordinate 0..5');
  }
  return nearestPuncturedCodeword(received, canonicalSixBitRepairCode(), erasedIndex);
}

function parentFiveBitNegativeControl() {
  const code = canonicalFiveBitRepairCode();
  let witness = null;
  for (let left = 0; left < code.length && !witness; left += 1) {
    for (let right = left + 1; right < code.length && !witness; right += 1) {
      if (hamming(code[left].codeword, code[right].codeword) !== 3) continue;
      const differing = code[left].codeword
        .map((bit, index) => bit !== code[right].codeword[index] ? index : -1)
        .filter(index => index >= 0);
      const erasedIndex = differing[0];
      const leftPunctured = puncture(code[left].codeword, erasedIndex);
      const rightPunctured = puncture(code[right].codeword, erasedIndex);
      if (hamming(leftPunctured, rightPunctured) !== 2) continue;
      const survivingDifference = leftPunctured.findIndex((bit, index) => bit !== rightPunctured[index]);
      const ambiguous = [...leftPunctured];
      ambiguous[survivingDifference] ^= 1;
      const decoded = nearestPuncturedCodeword(ambiguous, code, erasedIndex);
      if (!decoded.unique && decoded.minimum_distance === 1) {
        witness = freeze({
          left_repair_mask: code[left].repair_mask,
          right_repair_mask: code[right].repair_mask,
          left_codeword: code[left].codeword,
          right_codeword: code[right].codeword,
          original_distance: 3,
          erased_index: erasedIndex,
          punctured_left: leftPunctured,
          punctured_right: rightPunctured,
          punctured_distance: 2,
          ambiguous_received: freeze(ambiguous),
          tie_count: decoded.tie_count,
          minimum_distance: decoded.minimum_distance,
        });
      }
    }
  }
  return freeze({
    parent_width_five_minimum_distance: minimumDistance(code.map(row => row.codeword)),
    explicit_corruption_plus_erasure_ambiguity: witness,
    exact: minimumDistance(code.map(row => row.codeword)) === 3 && Boolean(witness),
  });
}

function imageClassificationCertificate() {
  const widthFive = imageCensus(5);
  const widthSix = imageCensus(6);
  const sixDistanceSpectrumExact = widthSix.correcting_images.every(row => same(row.distances, [4, 4, 4, 4, 4, 4]));
  const labelledCount = widthSix.correcting_image_count * 24;
  return freeze({
    width_five: widthFive,
    width_six: widthSix,
    expected_width_five_image_count: 35960,
    expected_width_five_correcting_count: 0,
    expected_width_six_image_count: 635376,
    expected_width_six_correcting_count: 240,
    every_width_six_success_has_distance_spectrum_444444: sixDistanceSpectrumExact,
    class_label_assignments_per_image: 24,
    class_labelled_width_six_correcting_encoding_count: labelledCount,
    expected_class_labelled_width_six_correcting_encoding_count: 5760,
    six_binary_coordinates_minimal: widthFive.correcting_image_count === 0 && widthSix.correcting_image_count > 0,
    exact: widthFive.audited_image_count === 35960
      && widthFive.correcting_image_count === 0
      && widthSix.audited_image_count === 635376
      && widthSix.correcting_image_count === 240
      && sixDistanceSpectrumExact
      && labelledCount === 5760,
  });
}

function canonicalTomographyCertificate() {
  const parent = dromologicalHolonomySingleCorruptionCertificate();
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const code = canonicalSixBitRepairCode();
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
    for (let erasedIndex = 0; erasedIndex < 6; erasedIndex += 1) {
      const punctured = puncture(codeRow.codeword, erasedIndex);
      for (const received of survivingReceivedConditions(punctured)) {
        const decoded = decodeCanonicalSixBitRepairWordAfterErasure(received, erasedIndex);
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
  }

  return freeze({
    canonical_code: code,
    canonical_pairwise_distances: freeze(pairwiseDistances(code.map(row => row.codeword))),
    canonical_minimum_distance: minimumDistance(code.map(row => row.codeword)),
    punctured_received_decoder_checks: decoderChecks,
    expected_punctured_received_decoder_checks: 144,
    minimum_cost_policy_checks: policyChecks,
    expected_minimum_cost_policy_checks: 144,
    class_robust_unimodular_checks: robustChecks,
    expected_class_robust_unimodular_checks: 144,
    exact_replay_assisted_state_reconstructions: reconstructions,
    expected_exact_replay_assisted_state_reconstructions: 27000,
    mixed_class_schedule_ambiguity_preserved:
      classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2),
    exact: exact
      && minimumDistance(code.map(row => row.codeword)) === 4
      && decoderChecks === 144
      && policyChecks === 144
      && robustChecks === 144
      && reconstructions === 27000,
  });
}

export function dromologicalHolonomyCorruptionPlusErasureCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomySingleCorruptionCertificate();
  const images = imageClassificationCertificate();
  const systematic = systematicCertificate();
  const negative = parentFiveBitNegativeControl();
  const tomography = canonicalTomographyCertificate();
  const passed = parent.passed && images.exact && systematic.exact && negative.exact && tomography.exact;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_PARENT_RECEIPT,
    parent_schema: parent.schema,
    image_classification_certificate: images,
    systematic_affine_certificate: systematic,
    parent_single_corruption_negative_control: negative,
    tomography_closure_certificate: tomography,
    passed,
    minimal_width_classification: passed
      ? 'SIX_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_AFTER_ONE_KNOWN_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE'
      : 'SIX_BINARY_RECEIVER_COORDINATE_MIXED_FAULT_MINIMALITY_NOT_ESTABLISHED',
    complete_image_classification: passed
      ? 'EXACTLY_240_OF_THE_635376_FOUR_WORD_SUBSETS_OF_THE_SIX_CUBE_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AFTER_ONE_KNOWN_ERASURE_AND_ALL_SUCCESSFUL_IMAGES_HAVE_PAIRWISE_DISTANCE_FOUR_IN_THE_DECLARED_FIXTURE'
      : 'WIDTH_SIX_MIXED_FAULT_IMAGE_CLASSIFICATION_NOT_ESTABLISHED',
    systematic_classification: passed
      ? 'EXACTLY_192_OF_THE_65536_SYSTEMATIC_FOUR_DERIVED_BIT_AUGMENTATIONS_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AFTER_ONE_KNOWN_ERASURE_AND_EVERY_SUCCESSFUL_DERIVED_COORDINATE_IS_AFFINE_IN_THE_FIXED_REPAIR_MASK_FIXTURE'
      : 'SYSTEMATIC_MIXED_FAULT_CLASSIFICATION_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'KNOWN_RECEIVER_ERASURE_LOCATION_CAN_COMBINE_WITH_ADDITIONAL_DERIVED_REDUNDANCY_TO_PRESERVE_EXACT_REPAIR_ROUTING_UNDER_ONE_FURTHER_UNKNOWN_RECEIVER_CORRUPTION_WITHOUT_ADDING_RAW_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY'
      : 'AIA_MIXED_FAULT_REDUNDANCY_LAW_NOT_ESTABLISHED',
    scars: freeze([
      'KNOWN_ERASURE_LOCATION != UNKNOWN_CORRUPTION_LOCATION',
      'SINGLE_CORRUPTION_CORRECTION != CORRUPTION_PLUS_ERASURE_CORRECTION',
      'MIXED_RECEIVER_FAULT_MODEL != PHYSICAL_SENSOR_FAILURE_MODEL',
      'HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE',
      'SIX_BIT_MINIMALITY_IN_THIS_FIXTURE != UNIVERSAL_CODING_BOUND',
      'FINITE_PUNCTURED_NEAREST_NEIGHBOR_DECODER != UNIVERSAL_ERROR_AND_ERASURE_CORRECTION',
      'AFFINE_SYSTEMATIC_SUCCESS != UNIVERSAL_LINEAR_CODE_OPTIMALITY',
      'DERIVED_REDUNDANCY != NEW_SENSOR_INFORMATION',
      'KNOWN_ERASURE_LOCATION_SIDE_INFORMATION != NEW_SOURCE_INFORMATION',
      'CORRECTED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION',
      'REPAIR_MASK_RECOVERY != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'EXACT_TOMOGRAPHY_AFTER_LABEL_CORRECTION != OPERATIONAL_INVERSE_ROUTE',
      'FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyCorruptionPlusErasureProjection(receiver) {
  const certificate = dromologicalHolonomyCorruptionPlusErasureCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified corruption-plus-erasure chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.corruption-plus-erasure-child-legible/v0.1',
      truths: freeze([
        'IF_WE_KNOW_WHICH_CLUE_WENT_MISSING_ONE_MORE_WRONG_CLUE_CAN_STILL_BE_REPAIRED_HERE_WITH_SIX_CLUES',
        'FIVE_CLUES_WERE_ENOUGH_FOR_ONE_UNKNOWN_WRONG_CLUE_BUT_NOT_FOR_ONE_WRONG_CLUE_PLUS_ONE_KNOWN_MISSING_CLUE',
        'THE_EXTRA_CLUE_IS_REDUNDANT_RECEIVER_STRUCTURE_NOT_NEW_SOURCE_INFORMATION',
        'FIXING_THE_RECEIVER_LABEL_DOES_NOT_RECOVER_FORGOTTEN_TEMPORAL_ORDER',
      ]),
      codeword_atlas_exposed: false,
      affine_function_atlas_exposed: false,
      punctured_decoder_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.corruption-plus-erasure-loom-technical/v0.1',
      image_summary: freeze({
        width_five_correcting_images: certificate.image_classification_certificate.width_five.correcting_image_count,
        width_six_correcting_images: certificate.image_classification_certificate.width_six.correcting_image_count,
        width_six_class_labelled_encodings:
          certificate.image_classification_certificate.class_labelled_width_six_correcting_encoding_count,
      }),
      systematic_summary: freeze({
        successful_augmentations: certificate.systematic_affine_certificate.success_count,
        every_success_affine:
          certificate.systematic_affine_certificate.every_success_uses_only_affine_derived_functions,
      }),
      tomography_closure_certificate: certificate.tomography_closure_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for corruption-plus-erasure chamber: ${receiver}`);
  }
  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_corruption_plus_erasure_correction: true,
      universal_coding_theorem: false,
      shannon_capacity_theorem: false,
      universal_error_and_erasure_correction: false,
      physical_sensor_fault_model: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyCorruptionPlusErasureOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity_theorem === true
    || ceiling.universal_error_and_erasure_correction === true
    || ceiling.physical_sensor_fault_model === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.codeword_atlas_exposed === true
    || candidate?.payload?.affine_function_atlas_exposed === true
    || candidate?.payload?.punctured_decoder_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !runtime && !ashLeak });
}
