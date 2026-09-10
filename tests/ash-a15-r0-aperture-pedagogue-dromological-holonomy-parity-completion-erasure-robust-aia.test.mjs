import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
} from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  observeReplayAssistedState,
} from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import {
  invertReplayLocusObservation,
} from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  deriveAlternateHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import {
  dromologicalHolonomyRawApertureCutCertificate,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-raw-aperture-cut-anisotropic-redundancy.js';
import {
  DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_SCHEMA,
  DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_PARENT_RECEIPT,
  REPAIR_MASK_DOMAIN,
  XOR_TRUTH_TABLE,
  XNOR_TRUTH_TABLE,
  EVEN_PARITY_IMAGE,
  ODD_PARITY_IMAGE,
  enumerateBooleanTruthTables,
  evaluateBooleanTruthTable,
  systematicParityAugmentationLabel,
  recoverRepairMaskFromSystematicErasure,
  dromologicalHolonomyParityCompletionCertificate,
  compileDromologicalHolonomyParityCompletionProjection,
  rejectDromologicalHolonomyParityCompletionOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function erase(word, index) {
  return word.filter((_, candidate) => candidate !== index);
}

function distinctCount(rows) {
  return new Set(rows.map(row => JSON.stringify(row))).size;
}

function truthIndex(mask) {
  return mask[0] * 2 + mask[1];
}

function evalTable(table, mask) {
  return table[truthIndex(mask)];
}

function independentTruthTables() {
  const tables = [];
  for (let a = 0; a <= 1; a += 1) {
    for (let b = 0; b <= 1; b += 1) {
      for (let c = 0; c <= 1; c += 1) {
        for (let d = 0; d <= 1; d += 1) tables.push([a, b, c, d]);
      }
    }
  }
  return tables;
}

function labelsFor(functions) {
  return REPAIR_MASK_DOMAIN.map(mask => functions.map(table => evalTable(table, mask)));
}

function oneErasureRobust(labels) {
  const width = labels[0].length;
  for (let erased = 0; erased < width; erased += 1) {
    if (distinctCount(labels.map(label => erase(label, erased))) !== 4) return false;
  }
  return true;
}

function hamming(left, right) {
  return left.reduce((sum, value, index) => sum + (value === right[index] ? 0 : 1), 0);
}

function minimumHamming(labels) {
  let minimum = Infinity;
  for (let left = 0; left < labels.length; left += 1) {
    for (let right = left + 1; right < labels.length; right += 1) {
      minimum = Math.min(minimum, hamming(labels[left], labels[right]));
    }
  }
  return minimum;
}

function imageKey(labels) {
  return labels.map(label => label.join('')).sort().join('|');
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

assert.equal(
  DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_PARENT_RECEIPT,
  '012024d9a0d7bdb21721ede40dfe9f029de09717',
);
assert.deepEqual(REPAIR_MASK_DOMAIN, [[0, 0], [0, 1], [1, 0], [1, 1]]);
assert.deepEqual(XOR_TRUTH_TABLE, [0, 1, 1, 0]);
assert.deepEqual(XNOR_TRUTH_TABLE, [1, 0, 0, 1]);
assert.deepEqual(EVEN_PARITY_IMAGE, [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]]);
assert.deepEqual(ODD_PARITY_IMAGE, [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]]);

// Independent 16-function systematic census.
const independentTables = independentTruthTables();
assert.equal(independentTables.length, 16);
assert.equal(enumerateBooleanTruthTables().length, 16);
for (const table of enumerateBooleanTruthTables()) {
  assert.equal(independentTables.some(candidate => same(candidate, table)), true);
  for (const mask of REPAIR_MASK_DOMAIN) {
    assert.equal(evaluateBooleanTruthTable(table, mask), evalTable(table, mask));
  }
}

const systematicSuccesses = independentTables.filter((table) => {
  const labels = REPAIR_MASK_DOMAIN.map(mask => [mask[0], mask[1], evalTable(table, mask)]);
  return oneErasureRobust(labels);
});
assert.equal(systematicSuccesses.length, 2);
assert.deepEqual(
  systematicSuccesses.map(table => table.join('')).sort(),
  [XOR_TRUTH_TABLE, XNOR_TRUTH_TABLE].map(table => table.join('')).sort(),
);
for (const failing of [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 1, 1],
  [0, 1, 0, 1],
]) {
  const labels = REPAIR_MASK_DOMAIN.map(mask => [mask[0], mask[1], evalTable(failing, mask)]);
  assert.equal(oneErasureRobust(labels), false);
}

// Independent exhaustive unrestricted binary-representation census.
let twoBitCount = 0;
let twoBitRobust = 0;
for (const first of independentTables) {
  for (const second of independentTables) {
    twoBitCount += 1;
    if (oneErasureRobust(labelsFor([first, second]))) twoBitRobust += 1;
  }
}
assert.equal(twoBitCount, 256);
assert.equal(twoBitRobust, 0);

let threeBitCount = 0;
let threeBitRobust = 0;
let evenCount = 0;
let oddCount = 0;
const robustImageKeys = new Set();
const evenKey = imageKey(EVEN_PARITY_IMAGE);
const oddKey = imageKey(ODD_PARITY_IMAGE);
for (const first of independentTables) {
  for (const second of independentTables) {
    for (const third of independentTables) {
      threeBitCount += 1;
      const labels = labelsFor([first, second, third]);
      if (!oneErasureRobust(labels)) continue;
      threeBitRobust += 1;
      const key = imageKey(labels);
      robustImageKeys.add(key);
      if (key === evenKey) evenCount += 1;
      else if (key === oddKey) oddCount += 1;
      else assert.fail(`robust three-bit image escaped parity subsets: ${key}`);
      assert.equal(minimumHamming(labels) >= 2, true);
    }
  }
}
assert.equal(threeBitCount, 4096);
assert.equal(threeBitRobust, 48);
assert.equal(evenCount, 24);
assert.equal(oddCount, 24);
assert.deepEqual([...robustImageKeys].sort(), [evenKey, oddKey].sort());

// Parent raw-coordinate cut remains real: this chamber adds a derived representation coordinate.
const rawParent = dromologicalHolonomyRawApertureCutCertificate();
assert.equal(rawParent.passed, true);
assert.equal(rawParent.erasure_certificate.no_exact_raw_router_survives_h12_erasure, true);
assert.equal(rawParent.erasure_certificate.no_raw_aperture_is_universally_one_erasure_robust, true);

// Both earned raw minimal apertures normalize to the same defect mask.
const classes = deriveDromologicalTerminalHolonomyClasses();
assert.equal(classes.length, 4);
const policies = dromologicalHolonomyClassReplayPolicy();
assert.equal(policies.length, 4);
for (const holonomyClass of classes) {
  assert.deepEqual(
    derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy),
    deriveAlternateHolonomyRepairMask(holonomyClass.terminal_formal_holonomy),
  );
}

// Independent erasure -> mask -> minimum-cost replay -> exact tomography closure.
const scheduleMap = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), schedule]));
let maskChecks = 0;
let policyChecks = 0;
let robustChecks = 0;
let reconstructions = 0;
for (const table of systematicSuccesses) {
  for (let erasedIndex = 0; erasedIndex < 3; erasedIndex += 1) {
    for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
      const holonomyClass = classes[classIndex];
      const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
      const fullLabel = systematicParityAugmentationLabel(mask, table);
      const surviving = erase(fullLabel, erasedIndex);
      const recoveredMask = recoverRepairMaskFromSystematicErasure(surviving, erasedIndex, table);
      maskChecks += 1;
      assert.deepEqual(recoveredMask, mask);

      const replay = decodeMinimumCostReplayFromRepairMask(recoveredMask);
      policyChecks += 1;
      assert.deepEqual(replay, policies[classIndex].replay_row);

      const classAssessment = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
      robustChecks += 1;
      assert.equal(classAssessment.actual_class_robust_unimodular_rescue, true);

      for (const id of holonomyClass.schedule_ids) {
        const schedule = scheduleMap.get(id);
        assert.ok(schedule, `missing schedule ${id}`);
        for (let x1 = -2; x1 <= 2; x1 += 1) {
          for (let x2 = -2; x2 <= 2; x2 += 1) {
            for (let x3 = -2; x3 <= 2; x3 += 1) {
              const state = [x1, x2, x3];
              const observation = observeReplayAssistedState(state, schedule, replay);
              const recoveredState = invertReplayLocusObservation(observation, schedule, replay);
              reconstructions += 1;
              assert.deepEqual(recoveredState, state);
            }
          }
        }
      }
    }
  }
}
assert.equal(maskChecks, 24);
assert.equal(policyChecks, 24);
assert.equal(robustChecks, 24);
assert.equal(reconstructions, 4500);

const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
assert.ok(mixedClass);
assert.deepEqual([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

const certificate = dromologicalHolonomyParityCompletionCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_SCHEMA);
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_PARENT_RECEIPT);
assert.equal(certificate.passed, true);
assert.equal(certificate.inherited_raw_cut_certificate.parent_passed, true);
assert.equal(certificate.inherited_raw_cut_certificate.no_exact_raw_router_survives_h12_erasure, true);
assert.equal(certificate.inherited_raw_cut_certificate.no_raw_aperture_is_universally_one_erasure_robust, true);
assert.equal(certificate.inherited_raw_cut_certificate.derived_parity_is_not_declared_as_raw_holonomy_coordinate, true);

const systematic = certificate.systematic_augmentation_certificate;
assert.equal(systematic.boolean_truth_table_count, 16);
assert.equal(systematic.success_count, 2);
assert.equal(systematic.successes_exactly_xor_and_xnor, true);
assert.equal(systematic.xor_present, true);
assert.equal(systematic.xnor_present, true);
assert.equal(systematic.constant_zero_fails, true);
assert.equal(systematic.constant_one_fails, true);
assert.equal(systematic.duplicate_dh_fails, true);
assert.equal(systematic.duplicate_di_fails, true);
assert.equal(systematic.exact, true);

const unrestricted = certificate.unrestricted_binary_encoding_certificate;
assert.equal(unrestricted.two_bit_encoding_count, 256);
assert.equal(unrestricted.one_erasure_robust_two_bit_encoding_count, 0);
assert.equal(unrestricted.three_bit_encoding_count, 4096);
assert.equal(unrestricted.one_erasure_robust_three_bit_encoding_count, 48);
assert.equal(unrestricted.robust_even_parity_image_count, 24);
assert.equal(unrestricted.robust_odd_parity_image_count, 24);
assert.equal(unrestricted.every_robust_three_bit_image_is_even_or_odd_parity_subset, true);
assert.equal(unrestricted.every_robust_three_bit_encoding_has_minimum_pairwise_hamming_at_least_two, true);
assert.equal(unrestricted.three_binary_coordinates_minimal_for_any_one_erasure_robust_four_class_routing, true);
assert.equal(unrestricted.exact, true);

const tomography = certificate.tomography_closure_certificate;
assert.equal(tomography.recovered_mask_checks, 24);
assert.equal(tomography.minimum_cost_policy_checks, 24);
assert.equal(tomography.class_robust_unimodular_checks, 24);
assert.equal(tomography.exact_replay_assisted_state_reconstructions, 4500);
assert.equal(tomography.mixed_class_schedule_ambiguity_preserved, true);
assert.equal(tomography.exact, true);

assert.equal(
  certificate.systematic_classification,
  'ONE_DERIVED_BOOLEAN_WITNESS_COMPLETES_THE_TWO_BIT_REPAIR_MASK_TO_ARBITRARY_ONE_COORDINATE_ERASURE_ROBUSTNESS_IFF_THE_DERIVED_WITNESS_IS_PARITY_OR_COMPLEMENT_PARITY_IN_THE_FIXED_S3_FIXTURE',
);
assert.equal(
  certificate.minimal_representation_classification,
  'THREE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_SURVIVES_ARBITRARY_ONE_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE',
);
assert.equal(
  certificate.unrestricted_classification,
  'EXACTLY_FORTY_EIGHT_OF_THE_4096_ORDERED_THREE_BIT_RECEIVER_ENCODINGS_ARE_ONE_COORDINATE_ERASURE_ROBUST_AND_EVERY_SUCCESSFUL_IMAGE_IS_ONE_OF_THE_TWO_FOUR_POINT_PARITY_SUBSETS_OF_THE_BINARY_CUBE',
);
assert.equal(
  certificate.architectural_law,
  'A_DERIVED_RECEIVER_COORDINATE_CAN_REPAIR_A_RAW_COORDINATE_CUT_AT_THE_REPRESENTATION_LAYER_WHILE_SOURCE_CUSTODY_RECEIVER_AUTHORITY_AND_THE_HISTORICAL_INFORMATION_RECORD_REMAIN_UNCHANGED',
);

// Receiver discipline, custody invariance, and overreach rejection.
const ash = compileDromologicalHolonomyParityCompletionProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyParityCompletionProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.authority, loom.authority);
assert.equal(Object.values(ash.authority).some(Boolean), false);
assert.equal(Object.values(loom.authority).some(Boolean), false);
assert.deepEqual(ash.payload.truths, [
  'THREE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ANY_TWO_STILL_TELL_US_WHICH_REPAIR_TO_USE',
  'THE_THIRD_CLUE_IS_DERIVED_FROM_THE_TWO_REPAIR_CLUES',
  'LOSING_ONE_OF_THE_THREE_DOES_NOT_ERASE_THE_REPAIR_CHOICE_IN_THIS_FIXTURE',
  'THIS_EXTRA_CLUE_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER',
]);
for (const key of [
  'raw_holonomy_matrices_exposed',
  'parity_truth_tables_exposed',
  'boolean_encoding_atlas_exposed',
  'erasure_decoder_formulas_exposed',
  'replay_vectors_exposed',
  'inverse_matrices_exposed',
  'latent_state_exposed',
]) {
  assert.equal(ash.payload[key], false);
}
assert.equal(loom.payload.systematic_augmentation_certificate.success_count, 2);
assert.equal(loom.payload.unrestricted_binary_encoding_summary.two_bit_encoding_count, 256);
assert.equal(loom.payload.unrestricted_binary_encoding_summary.three_bit_encoding_count, 4096);
assert.equal(loom.payload.unrestricted_binary_encoding_summary.one_erasure_robust_three_bit_encoding_count, 48);
assert.equal(rejectDromologicalHolonomyParityCompletionOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyParityCompletionOverreach(loom).accepted, true);

assert.equal(
  rejectDromologicalHolonomyParityCompletionOverreach({
    ...loom,
    authority: { ...loom.authority, inverse: true },
  }).accepted,
  false,
);
assert.equal(
  rejectDromologicalHolonomyParityCompletionOverreach({
    ...loom,
    runtime_binding: true,
  }).accepted,
  false,
);
for (const key of [
  'universal_coding_theorem',
  'shannon_information_theorem',
  'universal_error_correction',
  'physical_sensor_redundancy',
  'physical_sensor_failure',
  'physical_holonomy',
  'physical_quasicrystal',
  'continuum_tomography',
  'complete_schedule_reconstruction',
  'operational_inverse_route',
]) {
  assert.equal(
    rejectDromologicalHolonomyParityCompletionOverreach({
      ...loom,
      claim_ceiling: { ...loom.claim_ceiling, [key]: true },
    }).accepted,
    false,
  );
}
assert.equal(
  rejectDromologicalHolonomyParityCompletionOverreach({
    ...ash,
    payload: { ...ash.payload, parity_truth_tables_exposed: true },
  }).accepted,
  false,
);
assert.throws(
  () => compileDromologicalHolonomyParityCompletionProjection('UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);

assert.deepEqual(certificate.scars, [
  'DERIVED_PARITY_WITNESS != RAW_HOLONOMY_COORDINATE',
  'REPRESENTATIONAL_REDUNDANCY != NEW_SENSOR_INFORMATION',
  'PARITY_COMPLETION_IN_THIS_FIXTURE != UNIVERSAL_ERROR_CORRECTING_CODE',
  'FINITE_BINARY_ENCODING_CLASSIFICATION != SHANNON_THEOREM',
  'ONE_COORDINATE_ERASURE != PHYSICAL_SENSOR_FAILURE',
  'ERASURE_ROBUST_REPAIR_ROUTING != COMPLETE_SCHEDULE_RECONSTRUCTION',
  'DERIVED_RECEIVER_LABEL != SOURCE_CUSTODY_MUTATION',
  'REPAIR_MASK_RECOVERY != RETROACTIVE_INFORMATION_EXISTENCE',
  'MINIMAL_THREE_BIT_REPRESENTATION != UNIVERSAL_MINIMAL_SUFFICIENT_STATISTIC',
  'PARITY_SUBSET_OF_BINARY_CUBE != PHYSICAL_TOPOLOGICAL_CODE',
  'EXACT_REPLAY_RECONSTRUCTION_AFTER_ROUTING != OPERATIONAL_INVERSE_ROUTE',
]);

console.log('Ash A15-R0 holonomy parity-completion / erasure-robust AIA hostile tests passed.');