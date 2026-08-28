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
import {
  REPAIR_MASK_DOMAIN,
  XOR_TRUTH_TABLE,
  systematicParityAugmentationLabel,
  dromologicalHolonomyParityCompletionCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';
import {
  DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_SCHEMA,
  DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_PARENT_RECEIPT,
  canonicalFiveBitRepairCode,
  decodeCanonicalFiveBitRepairWord,
  dromologicalHolonomySingleCorruptionCertificate,
  compileDromologicalHolonomySingleCorruptionProjection,
  rejectDromologicalHolonomySingleCorruptionOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-single-corruption-correcting-aia.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hamming(left, right) {
  return left.reduce((sum, bit, index) => sum + (bit === right[index] ? 0 : 1), 0);
}

function distances(code) {
  const rows = [];
  for (let left = 0; left < code.length; left += 1) {
    for (let right = left + 1; right < code.length; right += 1) rows.push(hamming(code[left], code[right]));
  }
  return rows.sort((a, b) => a - b);
}

function minDistance(code) {
  return Math.min(...distances(code));
}

function words(width) {
  const rows = [];
  for (let value = 0; value < 2 ** width; value += 1) {
    rows.push(Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1));
  }
  return rows;
}

function chooseFour(input) {
  const rows = [];
  for (let a = 0; a < input.length - 3; a += 1) {
    for (let b = a + 1; b < input.length - 2; b += 1) {
      for (let c = b + 1; c < input.length - 1; c += 1) {
        for (let d = c + 1; d < input.length; d += 1) rows.push([input[a], input[b], input[c], input[d]]);
      }
    }
  }
  return rows;
}

function truthTables() {
  const rows = [];
  for (let a = 0; a <= 1; a += 1) {
    for (let b = 0; b <= 1; b += 1) {
      for (let c = 0; c <= 1; c += 1) {
        for (let d = 0; d <= 1; d += 1) rows.push([a, b, c, d]);
      }
    }
  }
  return rows;
}

function truthIndex(mask) {
  return mask[0] * 2 + mask[1];
}

function evaluate(table, mask) {
  return table[truthIndex(mask)];
}

function affine(table) {
  for (let constant = 0; constant <= 1; constant += 1) {
    for (let a = 0; a <= 1; a += 1) {
      for (let b = 0; b <= 1; b += 1) {
        const candidate = REPAIR_MASK_DOMAIN.map(([dH, dI]) => constant ^ (a & dH) ^ (b & dI));
        if (same(candidate, table)) return { affine: true, constant, a, b };
      }
    }
  }
  return { affine: false, constant: null, a: null, b: null };
}

function systematicCode(functions) {
  return REPAIR_MASK_DOMAIN.map(mask => [
    mask[0], mask[1], ...functions.map(table => evaluate(table, mask)),
  ]);
}

function receivedConditions(codeword) {
  const rows = [[...codeword]];
  for (let index = 0; index < codeword.length; index += 1) {
    const corrupted = [...codeword];
    corrupted[index] ^= 1;
    rows.push(corrupted);
  }
  return rows;
}

function nearest(received, code) {
  const ds = code.map(word => hamming(received, word));
  const minimum = Math.min(...ds);
  const winners = ds.map((value, index) => ({ value, index })).filter(row => row.value === minimum);
  return { minimum, winners };
}

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

assert.equal(DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_PARENT_RECEIPT, '68d700999c69c4bbb663904a8fafb47683e4032e');
assert.equal(dromologicalHolonomyParityCompletionCertificate().passed, true);

// Independent complete width-four and width-five image census.
const widthFourImages = chooseFour(words(4));
assert.equal(widthFourImages.length, 1820);
const widthFourGood = widthFourImages.filter(code => minDistance(code) >= 3);
assert.equal(widthFourGood.length, 0);
assert.equal(4 * (1 + 4) > 2 ** 4, true);

const widthFiveImages = chooseFour(words(5));
assert.equal(widthFiveImages.length, 35960);
const widthFiveGood = widthFiveImages.filter(code => minDistance(code) >= 3);
assert.equal(widthFiveGood.length, 120);
for (const code of widthFiveGood) assert.deepEqual(distances(code), [3, 3, 3, 3, 4, 4]);
assert.equal(widthFiveGood.length * 24, 2880);

// Independent complete systematic three-derived-bit census.
const tables = truthTables();
assert.equal(tables.length, 16);
let systematicChecked = 0;
const systematicGood = [];
for (const first of tables) {
  for (const second of tables) {
    for (const third of tables) {
      systematicChecked += 1;
      const selected = [first, second, third];
      const code = systematicCode(selected);
      if (minDistance(code) < 3) continue;
      const descriptors = selected.map(affine);
      systematicGood.push({ selected, code, descriptors });
    }
  }
}
assert.equal(systematicChecked, 4096);
assert.equal(systematicGood.length, 96);
assert.equal(systematicGood.every(row => row.descriptors.every(item => item.affine)), true);
const linearTripleKeys = new Set();
for (const row of systematicGood) {
  assert.equal(row.descriptors.filter(item => item.a === 1).length >= 2, true);
  assert.equal(row.descriptors.filter(item => item.b === 1).length >= 2, true);
  assert.equal(row.descriptors.filter(item => (item.a ^ item.b) === 1).length >= 1, true);
  linearTripleKeys.add(row.descriptors.map(item => `${item.a}${item.b}`).join('|'));
}
assert.equal(linearTripleKeys.size, 12);
assert.equal(systematicGood.length / linearTripleKeys.size, 8);

// Every successful systematic code uniquely corrects every radius-one received word.
let systematicDecoderAudits = 0;
for (const row of systematicGood) {
  for (let classIndex = 0; classIndex < row.code.length; classIndex += 1) {
    for (const received of receivedConditions(row.code[classIndex])) {
      const decoded = nearest(received, row.code);
      systematicDecoderAudits += 1;
      assert.equal(decoded.minimum <= 1, true);
      assert.equal(decoded.winners.length, 1);
      assert.equal(decoded.winners[0].index, classIndex);
    }
  }
}
assert.equal(systematicDecoderAudits, 2304);

// #824's three-bit parity representation is erasure-robust but not unknown-corruption-correcting.
const threeBitParent = REPAIR_MASK_DOMAIN.map(mask => systematicParityAugmentationLabel(mask, XOR_TRUTH_TABLE));
assert.equal(minDistance(threeBitParent), 2);
let ambiguousParentWord = null;
for (const word of words(3)) {
  const decoded = nearest(word, threeBitParent);
  if (decoded.minimum === 1 && decoded.winners.length > 1) {
    ambiguousParentWord = word;
    break;
  }
}
assert.ok(ambiguousParentWord);

// Canonical five-bit code and public decoder.
const canonicalRows = canonicalFiveBitRepairCode();
const canonicalCode = canonicalRows.map(row => row.codeword);
assert.deepEqual(canonicalCode, [
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 0],
]);
assert.deepEqual(distances(canonicalCode), [3, 3, 3, 3, 4, 4]);
for (let classIndex = 0; classIndex < canonicalRows.length; classIndex += 1) {
  for (const received of receivedConditions(canonicalRows[classIndex].codeword)) {
    const decoded = decodeCanonicalFiveBitRepairWord(received);
    assert.equal(decoded.unique, true);
    assert.deepEqual(decoded.repair_mask, canonicalRows[classIndex].repair_mask);
    assert.equal(decoded.minimum_distance <= 1, true);
  }
}

// Unknown-corruption correction -> inherited minimum-cost replay -> exact tomography.
const classes = deriveDromologicalTerminalHolonomyClasses();
const policies = dromologicalHolonomyClassReplayPolicy();
const scheduleMap = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), schedule]));
let decoderChecks = 0;
let policyChecks = 0;
let robustChecks = 0;
let reconstructions = 0;
for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
  const holonomyClass = classes[classIndex];
  const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
  const codeRow = canonicalRows.find(row => same(row.repair_mask, mask));
  assert.ok(codeRow);
  for (const received of receivedConditions(codeRow.codeword)) {
    const decoded = decodeCanonicalFiveBitRepairWord(received);
    decoderChecks += 1;
    assert.equal(decoded.unique, true);
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
assert.equal(decoderChecks, 24);
assert.equal(policyChecks, 24);
assert.equal(robustChecks, 24);
assert.equal(reconstructions, 4500);

const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
assert.ok(mixedClass);
assert.deepEqual([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

// Implementation certificate must independently match hostile census.
const certificate = dromologicalHolonomySingleCorruptionCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_SINGLE_CORRUPTION_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.image_classification_certificate.width_four.audited_image_count, 1820);
assert.equal(certificate.image_classification_certificate.width_four.correcting_image_count, 0);
assert.equal(certificate.image_classification_certificate.width_five.audited_image_count, 35960);
assert.equal(certificate.image_classification_certificate.width_five.correcting_image_count, 120);
assert.equal(certificate.image_classification_certificate.class_labelled_width_five_correcting_encoding_count, 2880);
assert.equal(certificate.image_classification_certificate.every_width_five_success_has_distance_spectrum_333344, true);
assert.equal(certificate.image_classification_certificate.five_binary_coordinates_minimal, true);
assert.equal(certificate.systematic_affine_certificate.ordered_boolean_triple_count, 4096);
assert.equal(certificate.systematic_affine_certificate.success_count, 96);
assert.equal(certificate.systematic_affine_certificate.every_success_uses_only_affine_derived_functions, true);
assert.equal(certificate.systematic_affine_certificate.distinct_ordered_linear_coefficient_triples, 12);
assert.equal(certificate.systematic_affine_certificate.independent_constant_assignments_per_linear_triple, 8);
assert.equal(certificate.systematic_affine_certificate.decoder_audit_count, 2304);
assert.equal(certificate.systematic_affine_certificate.every_systematic_received_word_decodes_exactly, true);
assert.equal(certificate.parent_erasure_negative_control.parent_xor_minimum_distance, 2);
assert.equal(certificate.parent_erasure_negative_control.explicit_ambiguity_exists, true);
assert.equal(certificate.tomography_closure_certificate.exact_replay_assisted_state_reconstructions, 4500);
assert.equal(certificate.tomography_closure_certificate.exact, true);

assert.equal(
  certificate.minimal_width_classification,
  'FIVE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE',
);
assert.equal(
  certificate.complete_image_classification,
  'EXACTLY_120_OF_THE_35960_FOUR_WORD_SUBSETS_OF_THE_FIVE_CUBE_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AND_THEIR_2880_CLASS_LABELINGS_EXHAUST_THE_MINIMAL_WIDTH_FIVE_RECEIVER_ENCODINGS_IN_THE_DECLARED_FIXTURE',
);
assert.equal(
  certificate.systematic_classification,
  'EXACTLY_96_OF_THE_4096_SYSTEMATIC_THREE_DERIVED_BIT_AUGMENTATIONS_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AND_EVERY_SUCCESSFUL_DERIVED_COORDINATE_IS_AFFINE_IN_THE_FIXED_REPAIR_MASK_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'UNKNOWN_RECEIVER_COORDINATE_CORRUPTION_REQUIRES_STRICTLY_MORE_DERIVED_REPRESENTATIONAL_REDUNDANCY_THAN_KNOWN_COORDINATE_ERASURE_WHILE_SOURCE_CUSTODY_HISTORICAL_INFORMATION_AND_RECEIVER_AUTHORITY_REMAIN_UNCHANGED',
);

// AIA receiver discipline and overreach membrane.
const ash = compileDromologicalHolonomySingleCorruptionProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomySingleCorruptionProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'FIVE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ONE_WRONG_CLUE_CAN_BE_FOUND_AND_REPAIRED_HERE',
  'THREE_CLUES_WERE_ENOUGH_WHEN_WE_KNEW_WHICH_CLUE_WAS_MISSING',
  'A_WRONG_CLUE_WITH_AN_UNKNOWN_LOCATION_NEEDS_MORE_REDUNDANCY_THAN_A_KNOWN_MISSING_CLUE',
  'REPAIRING_THE_RECEIVER_LABEL_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER',
]);
assert.equal(rejectDromologicalHolonomySingleCorruptionOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomySingleCorruptionOverreach(loom).accepted, true);
assert.equal(rejectDromologicalHolonomySingleCorruptionOverreach({ ...loom, authority: { ...loom.authority, inverse: true } }).accepted, false);
assert.equal(rejectDromologicalHolonomySingleCorruptionOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, universal_coding_theorem: true } }).accepted, false);
assert.equal(rejectDromologicalHolonomySingleCorruptionOverreach({ ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_sensor_noise: true } }).accepted, false);
assert.throws(() => compileDromologicalHolonomySingleCorruptionProjection('UNDECLARED_RECEIVER'), /undeclared AIA receiver/);

assert.deepEqual(certificate.scars, [
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
]);

console.log('Ash A15-R0 holonomy single-corruption-correcting AIA hostile tests passed.');
