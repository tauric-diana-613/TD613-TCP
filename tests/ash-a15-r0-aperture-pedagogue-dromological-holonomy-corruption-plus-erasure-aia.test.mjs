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
  canonicalFiveBitRepairCode,
  dromologicalHolonomySingleCorruptionCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-single-corruption-correcting-aia.js';
import {
  DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_SCHEMA,
  DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_PARENT_RECEIPT,
  canonicalSixBitRepairCode,
  decodeCanonicalSixBitRepairWordAfterErasure,
  dromologicalHolonomyCorruptionPlusErasureCertificate,
  compileDromologicalHolonomyCorruptionPlusErasureProjection,
  rejectDromologicalHolonomyCorruptionPlusErasureOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-corruption-plus-erasure-aia.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hamming(left, right) {
  assert.equal(left.length, right.length);
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

function censusFourWordImages(width, threshold) {
  const input = words(width);
  let audited = 0;
  let good = 0;
  const spectra = new Map();
  for (let a = 0; a < input.length - 3; a += 1) {
    for (let b = a + 1; b < input.length - 2; b += 1) {
      for (let c = b + 1; c < input.length - 1; c += 1) {
        for (let d = c + 1; d < input.length; d += 1) {
          audited += 1;
          const ds = distances([input[a], input[b], input[c], input[d]]);
          if (ds[0] < threshold) continue;
          good += 1;
          const key = ds.join(',');
          spectra.set(key, (spectra.get(key) ?? 0) + 1);
        }
      }
    }
  }
  return { audited, good, spectra };
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

function evaluate(table, mask) {
  return table[mask[0] * 2 + mask[1]];
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

function puncture(word, erasedIndex) {
  return word.filter((_, index) => index !== erasedIndex);
}

function survivingConditions(puncturedWord) {
  const rows = [[...puncturedWord]];
  for (let index = 0; index < puncturedWord.length; index += 1) {
    const corrupted = [...puncturedWord];
    corrupted[index] ^= 1;
    rows.push(corrupted);
  }
  return rows;
}

function nearestPunctured(received, code, erasedIndex) {
  const ds = code.map(word => hamming(received, puncture(word, erasedIndex)));
  const minimum = Math.min(...ds);
  const winners = ds.map((value, index) => ({ value, index })).filter(row => row.value === minimum);
  return { minimum, winners };
}

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

assert.equal(DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_PARENT_RECEIPT, 'de878502536c2a61a354ec898d07d5802bfcca5f');
assert.equal(dromologicalHolonomySingleCorruptionCertificate().passed, true);

// Independent unrestricted width-five / width-six census for distance-four mixed-fault geometry.
const widthFive = censusFourWordImages(5, 4);
assert.equal(widthFive.audited, 35960);
assert.equal(widthFive.good, 0);
assert.equal(widthFive.spectra.size, 0);

const widthSix = censusFourWordImages(6, 4);
assert.equal(widthSix.audited, 635376);
assert.equal(widthSix.good, 240);
assert.deepEqual([...widthSix.spectra.entries()], [['4,4,4,4,4,4', 240]]);
assert.equal(widthSix.good * 24, 5760);

// Independent complete systematic four-derived-bit census.
const tables = truthTables();
assert.equal(tables.length, 16);
let systematicChecked = 0;
const systematicGood = [];
for (const first of tables) {
  for (const second of tables) {
    for (const third of tables) {
      for (const fourth of tables) {
        systematicChecked += 1;
        const selected = [first, second, third, fourth];
        const code = systematicCode(selected);
        if (minDistance(code) < 4) continue;
        const descriptors = selected.map(affine);
        systematicGood.push({ selected, code, descriptors });
      }
    }
  }
}
assert.equal(systematicChecked, 65536);
assert.equal(systematicGood.length, 192);
assert.equal(systematicGood.every(row => row.descriptors.every(item => item.affine)), true);
const linearQuadrupleKeys = new Set();
for (const row of systematicGood) {
  assert.equal(row.descriptors.filter(item => item.a === 1).length >= 3, true);
  assert.equal(row.descriptors.filter(item => item.b === 1).length >= 3, true);
  assert.equal(row.descriptors.filter(item => (item.a ^ item.b) === 1).length >= 2, true);
  assert.deepEqual(distances(row.code), [4, 4, 4, 4, 4, 4]);
  linearQuadrupleKeys.add(row.descriptors.map(item => `${item.a}${item.b}`).join('|'));
}
assert.equal(linearQuadrupleKeys.size, 12);
assert.equal(systematicGood.length / linearQuadrupleKeys.size, 16);

// Every successful systematic code survives every known erasure and every radius-one corruption on surviving coordinates.
let systematicDecoderAudits = 0;
for (const row of systematicGood) {
  for (let classIndex = 0; classIndex < row.code.length; classIndex += 1) {
    for (let erasedIndex = 0; erasedIndex < 6; erasedIndex += 1) {
      const punctured = puncture(row.code[classIndex], erasedIndex);
      for (const received of survivingConditions(punctured)) {
        const decoded = nearestPunctured(received, row.code, erasedIndex);
        systematicDecoderAudits += 1;
        assert.equal(decoded.minimum <= 1, true);
        assert.equal(decoded.winners.length, 1);
        assert.equal(decoded.winners[0].index, classIndex);
      }
    }
  }
}
assert.equal(systematicDecoderAudits, 27648);

// #826 five-bit parent: distance-three single-corruption correction can fail after an additional known erasure.
const parentRows = canonicalFiveBitRepairCode();
const parentCode = parentRows.map(row => row.codeword);
assert.equal(minDistance(parentCode), 3);
let parentAmbiguity = null;
for (let left = 0; left < parentCode.length && !parentAmbiguity; left += 1) {
  for (let right = left + 1; right < parentCode.length && !parentAmbiguity; right += 1) {
    if (hamming(parentCode[left], parentCode[right]) !== 3) continue;
    const differing = parentCode[left].map((bit, index) => bit !== parentCode[right][index] ? index : -1).filter(index => index >= 0);
    const erasedIndex = differing[0];
    const leftPunctured = puncture(parentCode[left], erasedIndex);
    const rightPunctured = puncture(parentCode[right], erasedIndex);
    assert.equal(hamming(leftPunctured, rightPunctured), 2);
    const survivingDifference = leftPunctured.findIndex((bit, index) => bit !== rightPunctured[index]);
    const received = [...leftPunctured];
    received[survivingDifference] ^= 1;
    const decoded = nearestPunctured(received, parentCode, erasedIndex);
    if (decoded.minimum === 1 && decoded.winners.length > 1) {
      parentAmbiguity = { left, right, erasedIndex, received, winners: decoded.winners };
    }
  }
}
assert.ok(parentAmbiguity);

// Canonical six-bit code is equidistant and its public punctured decoder survives the complete declared mixed-fault domain.
const canonicalRows = canonicalSixBitRepairCode();
const canonicalCode = canonicalRows.map(row => row.codeword);
assert.deepEqual(canonicalCode, [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 0, 0],
]);
assert.deepEqual(distances(canonicalCode), [4, 4, 4, 4, 4, 4]);
for (let classIndex = 0; classIndex < canonicalRows.length; classIndex += 1) {
  for (let erasedIndex = 0; erasedIndex < 6; erasedIndex += 1) {
    const punctured = puncture(canonicalRows[classIndex].codeword, erasedIndex);
    for (const received of survivingConditions(punctured)) {
      const decoded = decodeCanonicalSixBitRepairWordAfterErasure(received, erasedIndex);
      assert.equal(decoded.unique, true);
      assert.deepEqual(decoded.repair_mask, canonicalRows[classIndex].repair_mask);
      assert.equal(decoded.minimum_distance <= 1, true);
    }
  }
}

// Mixed-fault recovery -> inherited minimum-cost replay -> exact tomography.
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
  for (let erasedIndex = 0; erasedIndex < 6; erasedIndex += 1) {
    const punctured = puncture(codeRow.codeword, erasedIndex);
    for (const received of survivingConditions(punctured)) {
      const decoded = decodeCanonicalSixBitRepairWordAfterErasure(received, erasedIndex);
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
}
assert.equal(decoderChecks, 144);
assert.equal(policyChecks, 144);
assert.equal(robustChecks, 144);
assert.equal(reconstructions, 27000);

const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
assert.ok(mixedClass);
assert.deepEqual([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

// Implementation certificate must independently match hostile census.
const certificate = dromologicalHolonomyCorruptionPlusErasureCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_CORRUPTION_PLUS_ERASURE_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.image_classification_certificate.width_five.audited_image_count, 35960);
assert.equal(certificate.image_classification_certificate.width_five.correcting_image_count, 0);
assert.equal(certificate.image_classification_certificate.width_six.audited_image_count, 635376);
assert.equal(certificate.image_classification_certificate.width_six.correcting_image_count, 240);
assert.equal(certificate.image_classification_certificate.every_width_six_success_has_distance_spectrum_444444, true);
assert.equal(certificate.image_classification_certificate.class_labelled_width_six_correcting_encoding_count, 5760);
assert.equal(certificate.image_classification_certificate.six_binary_coordinates_minimal, true);
assert.equal(certificate.systematic_affine_certificate.ordered_boolean_quadruple_count, 65536);
assert.equal(certificate.systematic_affine_certificate.success_count, 192);
assert.equal(certificate.systematic_affine_certificate.every_success_uses_only_affine_derived_functions, true);
assert.equal(certificate.systematic_affine_certificate.distinct_ordered_linear_coefficient_quadruples, 12);
assert.equal(certificate.systematic_affine_certificate.independent_constant_assignments_per_linear_quadruple, 16);
assert.equal(certificate.systematic_affine_certificate.mixed_fault_decoder_audit_count, 27648);
assert.equal(certificate.systematic_affine_certificate.every_systematic_mixed_fault_word_decodes_exactly, true);
assert.ok(certificate.parent_single_corruption_negative_control.explicit_corruption_plus_erasure_ambiguity);
assert.equal(certificate.tomography_closure_certificate.exact_replay_assisted_state_reconstructions, 27000);
assert.equal(certificate.tomography_closure_certificate.exact, true);
assert.equal(
  certificate.minimal_width_classification,
  'SIX_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_CORRECTS_ONE_UNKNOWN_BINARY_COORDINATE_CORRUPTION_AFTER_ONE_KNOWN_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE',
);
assert.equal(
  certificate.complete_image_classification,
  'EXACTLY_240_OF_THE_635376_FOUR_WORD_SUBSETS_OF_THE_SIX_CUBE_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AFTER_ONE_KNOWN_ERASURE_AND_ALL_SUCCESSFUL_IMAGES_HAVE_PAIRWISE_DISTANCE_FOUR_IN_THE_DECLARED_FIXTURE',
);
assert.equal(
  certificate.systematic_classification,
  'EXACTLY_192_OF_THE_65536_SYSTEMATIC_FOUR_DERIVED_BIT_AUGMENTATIONS_CORRECT_ONE_UNKNOWN_BIT_CORRUPTION_AFTER_ONE_KNOWN_ERASURE_AND_EVERY_SUCCESSFUL_DERIVED_COORDINATE_IS_AFFINE_IN_THE_FIXED_REPAIR_MASK_FIXTURE',
);
assert.equal(
  certificate.architectural_law,
  'KNOWN_RECEIVER_ERASURE_LOCATION_CAN_COMBINE_WITH_ADDITIONAL_DERIVED_REDUNDANCY_TO_PRESERVE_EXACT_REPAIR_ROUTING_UNDER_ONE_FURTHER_UNKNOWN_RECEIVER_CORRUPTION_WITHOUT_ADDING_RAW_SOURCE_INFORMATION_OR_RECEIVER_AUTHORITY',
);
assert.deepEqual(certificate.scars, [
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
]);

// Receiver split preserves exact custody and zero authority.
const ash = compileDromologicalHolonomyCorruptionPlusErasureProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyCorruptionPlusErasureProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.equal(ash.payload.codeword_atlas_exposed, false);
assert.equal(ash.payload.affine_function_atlas_exposed, false);
assert.equal(ash.payload.punctured_decoder_exposed, false);
assert.equal(ash.payload.replay_vectors_exposed, false);
assert.equal(ash.payload.latent_state_exposed, false);
assert.equal(loom.payload.image_summary.width_five_correcting_images, 0);
assert.equal(loom.payload.image_summary.width_six_correcting_images, 240);
assert.equal(loom.payload.image_summary.width_six_class_labelled_encodings, 5760);
assert.equal(loom.payload.systematic_summary.successful_augmentations, 192);
assert.equal(loom.payload.tomography_closure_certificate.exact, true);

assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach(loom).accepted, true);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_error_and_erasure_correction: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_sensor_fault_model: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_holonomy: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach({
  ...loom,
  runtime_binding: true,
}).accepted, false);
assert.equal(rejectDromologicalHolonomyCorruptionPlusErasureOverreach({
  ...ash,
  payload: { ...ash.payload, punctured_decoder_exposed: true },
}).accepted, false);

console.log('Ash A15-R0 dromological holonomy corruption-plus-erasure AIA hostile tests passed.');
