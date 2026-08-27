import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
} from './phasonic-supermoire-dromological-tomography.js';
import {
  DROMOLOGICAL_S3_SCHEDULES,
} from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import {
  observeReplayAssistedState,
} from './dromological-baseline-replay-rescue-aperture.js';
import {
  invertReplayLocusObservation,
} from './dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  deriveAlternateHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from './dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import {
  dromologicalHolonomyRawApertureCutCertificate,
} from './dromological-holonomy-raw-aperture-cut-anisotropic-redundancy.js';

export const DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_SCHEMA =
  'td613.dome-world.dromological-holonomy-parity-completion-erasure-robust-aia/v0.1';
export const DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_PARENT_RECEIPT =
  '012024d9a0d7bdb21721ede40dfe9f029de09717';

export const REPAIR_MASK_DOMAIN = Object.freeze([
  Object.freeze([0, 0]),
  Object.freeze([0, 1]),
  Object.freeze([1, 0]),
  Object.freeze([1, 1]),
]);

export const XOR_TRUTH_TABLE = Object.freeze([0, 1, 1, 0]);
export const XNOR_TRUTH_TABLE = Object.freeze([1, 0, 0, 1]);
export const EVEN_PARITY_IMAGE = Object.freeze([
  Object.freeze([0, 0, 0]),
  Object.freeze([0, 1, 1]),
  Object.freeze([1, 0, 1]),
  Object.freeze([1, 1, 0]),
]);
export const ODD_PARITY_IMAGE = Object.freeze([
  Object.freeze([0, 0, 1]),
  Object.freeze([0, 1, 0]),
  Object.freeze([1, 0, 0]),
  Object.freeze([1, 1, 1]),
]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
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

function assertBinary(value, label) {
  if (value !== 0 && value !== 1) throw new Error(`${label} must be binary`);
}

function assertRepairMask(mask) {
  if (!Array.isArray(mask) || mask.length !== 2) {
    throw new Error('repair mask must have exactly two coordinates');
  }
  assertBinary(mask[0], 'repair mask d_H');
  assertBinary(mask[1], 'repair mask d_I');
}

function truthTableIndex(mask) {
  assertRepairMask(mask);
  const [dH, dI] = mask;
  return dH * 2 + dI;
}

function truthTableKey(table) {
  return table.join('');
}

function wordKey(word) {
  return word.join('');
}

function sortedWordKeys(words) {
  return [...words].map(wordKey).sort();
}

function distinctCount(rows) {
  return new Set(rows.map(row => JSON.stringify(row))).size;
}

function eraseCoordinate(word, erasedIndex) {
  if (!Number.isInteger(erasedIndex) || erasedIndex < 0 || erasedIndex >= word.length) {
    throw new Error('erased coordinate index outside receiver label');
  }
  return freeze(word.filter((_, index) => index !== erasedIndex));
}

function hamming(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    throw new Error('Hamming comparison requires equal-length words');
  }
  return left.reduce((count, value, index) => count + (value === right[index] ? 0 : 1), 0);
}

function minimumPairwiseHamming(words) {
  if (words.length < 2) return 0;
  let minimum = Infinity;
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      minimum = Math.min(minimum, hamming(words[left], words[right]));
    }
  }
  return minimum;
}

function parity(word) {
  return word.reduce((sum, value) => sum + value, 0) % 2;
}

function scheduleId(schedule) {
  const letters = {
    PHI_PAIR_WIRE: 'P',
    HEXAGONAL_MOIRE: 'H',
    ICOSAHEDRAL_PHASON: 'I',
  };
  return schedule.map(stratum => letters[stratum]).join('-');
}

export function enumerateBooleanTruthTables() {
  const tables = [];
  for (let bits = 0; bits < 16; bits += 1) {
    const table = [];
    for (let index = 0; index < 4; index += 1) {
      table.push((bits >> index) & 1);
    }
    tables.push(freeze(table));
  }
  return freeze(tables);
}

export function evaluateBooleanTruthTable(table, mask) {
  if (!Array.isArray(table) || table.length !== 4 || !table.every(value => value === 0 || value === 1)) {
    throw new Error('Boolean truth table must contain four binary values');
  }
  return table[truthTableIndex(mask)];
}

export function systematicParityAugmentationLabel(mask, table) {
  assertRepairMask(mask);
  return freeze([
    mask[0],
    mask[1],
    evaluateBooleanTruthTable(table, mask),
  ]);
}

function robustDeletionProfile(labels) {
  if (!Array.isArray(labels) || labels.length !== 4) {
    throw new Error('receiver encoding requires four class labels');
  }
  const width = labels[0].length;
  if (labels.some(label => !Array.isArray(label) || label.length !== width)) {
    throw new Error('receiver labels must have equal width');
  }
  const deletions = freeze(Array.from({ length: width }, (_, erasedIndex) => {
    const projected = freeze(labels.map(label => eraseCoordinate(label, erasedIndex)));
    return freeze({
      erased_index: erasedIndex,
      projected_labels: projected,
      distinct_projected_label_count: distinctCount(projected),
      exact_repair_routing_retained: distinctCount(projected) === 4,
    });
  }));
  return freeze({
    width,
    labels: freeze(labels),
    full_label_distinct_count: distinctCount(labels),
    full_label_injective: distinctCount(labels) === 4,
    deletions,
    all_single_coordinate_erasures_retain_exact_routing:
      deletions.every(row => row.exact_repair_routing_retained),
    minimum_pairwise_hamming_distance: minimumPairwiseHamming(labels),
  });
}

function systematicAugmentationCertificate() {
  const tables = enumerateBooleanTruthTables();
  const rows = freeze(tables.map((table) => {
    const labels = freeze(REPAIR_MASK_DOMAIN.map(mask => systematicParityAugmentationLabel(mask, table)));
    const profile = robustDeletionProfile(labels);
    return freeze({
      truth_table: table,
      truth_table_key: truthTableKey(table),
      labels,
      deletion_profile: profile,
      one_coordinate_erasure_robust: profile.all_single_coordinate_erasures_retain_exact_routing,
    });
  }));
  const successes = rows.filter(row => row.one_coordinate_erasure_robust);
  const successTables = freeze(successes.map(row => row.truth_table));
  const expected = freeze([XOR_TRUTH_TABLE, XNOR_TRUTH_TABLE]);
  const sortedActual = successTables.map(truthTableKey).sort();
  const sortedExpected = expected.map(truthTableKey).sort();

  return freeze({
    boolean_truth_table_count: tables.length,
    expected_boolean_truth_table_count: 16,
    success_count: successes.length,
    expected_success_count: 2,
    successful_truth_tables: successTables,
    expected_successful_truth_tables: expected,
    successes_exactly_xor_and_xnor: same(sortedActual, sortedExpected),
    xor_present: sortedActual.includes(truthTableKey(XOR_TRUTH_TABLE)),
    xnor_present: sortedActual.includes(truthTableKey(XNOR_TRUTH_TABLE)),
    constant_zero_fails: rows.find(row => same(row.truth_table, [0, 0, 0, 0]))?.one_coordinate_erasure_robust === false,
    constant_one_fails: rows.find(row => same(row.truth_table, [1, 1, 1, 1]))?.one_coordinate_erasure_robust === false,
    duplicate_dh_fails: rows.find(row => same(row.truth_table, [0, 0, 1, 1]))?.one_coordinate_erasure_robust === false,
    duplicate_di_fails: rows.find(row => same(row.truth_table, [0, 1, 0, 1]))?.one_coordinate_erasure_robust === false,
    rows,
    exact: tables.length === 16
      && successes.length === 2
      && same(sortedActual, sortedExpected),
  });
}

function labelsFromCoordinateFunctions(functions) {
  return freeze(REPAIR_MASK_DOMAIN.map(mask => freeze(
    functions.map(table => evaluateBooleanTruthTable(table, mask)),
  )));
}

function parityImageKind(labels) {
  const keys = sortedWordKeys(labels);
  if (same(keys, sortedWordKeys(EVEN_PARITY_IMAGE))) return 'EVEN';
  if (same(keys, sortedWordKeys(ODD_PARITY_IMAGE))) return 'ODD';
  return 'NEITHER';
}

function unrestrictedBinaryEncodingCertificate() {
  const functions = enumerateBooleanTruthTables();
  let twoBitChecked = 0;
  let twoBitRobust = 0;

  for (const first of functions) {
    for (const second of functions) {
      const labels = labelsFromCoordinateFunctions([first, second]);
      const profile = robustDeletionProfile(labels);
      twoBitChecked += 1;
      if (profile.all_single_coordinate_erasures_retain_exact_routing) twoBitRobust += 1;
    }
  }

  let threeBitChecked = 0;
  let threeBitRobust = 0;
  let evenImageCount = 0;
  let oddImageCount = 0;
  let allRobustImagesParitySubsets = true;
  let allRobustMinimumDistanceAtLeastTwo = true;
  const robustRows = [];

  for (let firstIndex = 0; firstIndex < functions.length; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < functions.length; secondIndex += 1) {
      for (let thirdIndex = 0; thirdIndex < functions.length; thirdIndex += 1) {
        const selected = [functions[firstIndex], functions[secondIndex], functions[thirdIndex]];
        const labels = labelsFromCoordinateFunctions(selected);
        const profile = robustDeletionProfile(labels);
        threeBitChecked += 1;
        if (!profile.all_single_coordinate_erasures_retain_exact_routing) continue;

        threeBitRobust += 1;
        const imageKind = parityImageKind(labels);
        if (imageKind === 'EVEN') evenImageCount += 1;
        if (imageKind === 'ODD') oddImageCount += 1;
        if (imageKind === 'NEITHER') allRobustImagesParitySubsets = false;
        if (profile.minimum_pairwise_hamming_distance < 2) {
          allRobustMinimumDistanceAtLeastTwo = false;
        }
        robustRows.push(freeze({
          function_indices: freeze([firstIndex, secondIndex, thirdIndex]),
          truth_tables: freeze(selected),
          image_kind: imageKind,
          labels,
          minimum_pairwise_hamming_distance: profile.minimum_pairwise_hamming_distance,
        }));
      }
    }
  }

  return freeze({
    boolean_coordinate_function_count: functions.length,
    two_bit_encoding_count: twoBitChecked,
    expected_two_bit_encoding_count: 256,
    one_erasure_robust_two_bit_encoding_count: twoBitRobust,
    expected_one_erasure_robust_two_bit_encoding_count: 0,
    three_bit_encoding_count: threeBitChecked,
    expected_three_bit_encoding_count: 4096,
    one_erasure_robust_three_bit_encoding_count: threeBitRobust,
    expected_one_erasure_robust_three_bit_encoding_count: 48,
    robust_even_parity_image_count: evenImageCount,
    expected_robust_even_parity_image_count: 24,
    robust_odd_parity_image_count: oddImageCount,
    expected_robust_odd_parity_image_count: 24,
    every_robust_three_bit_image_is_even_or_odd_parity_subset: allRobustImagesParitySubsets,
    every_robust_three_bit_encoding_has_minimum_pairwise_hamming_at_least_two:
      allRobustMinimumDistanceAtLeastTwo,
    robust_three_bit_encodings: freeze(robustRows),
    structural_two_bit_lower_bound:
      'ERASING_ONE_OF_TWO_BINARY_COORDINATES_LEAVES_ONE_BINARY_COORDINATE_WITH_AT_MOST_TWO_LABELS_FOR_FOUR_CLASSES',
    three_binary_coordinates_minimal_for_any_one_erasure_robust_four_class_routing:
      twoBitRobust === 0 && threeBitRobust > 0,
    exact: functions.length === 16
      && twoBitChecked === 256
      && twoBitRobust === 0
      && threeBitChecked === 4096
      && threeBitRobust === 48
      && evenImageCount === 24
      && oddImageCount === 24
      && allRobustImagesParitySubsets
      && allRobustMinimumDistanceAtLeastTwo,
  });
}

export function recoverRepairMaskFromSystematicErasure(survivingLabel, erasedIndex, table) {
  if (!Array.isArray(survivingLabel) || survivingLabel.length !== 2) {
    throw new Error('surviving systematic label must have two coordinates');
  }
  const candidates = REPAIR_MASK_DOMAIN.filter((mask) => {
    const full = systematicParityAugmentationLabel(mask, table);
    return same(eraseCoordinate(full, erasedIndex), survivingLabel);
  });
  if (candidates.length !== 1) {
    throw new Error(`systematic erasure does not uniquely identify repair mask; candidates=${candidates.length}`);
  }
  return freeze([...candidates[0]]);
}

function finiteTomographyClosureCertificate(successTables) {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const inheritedPolicy = dromologicalHolonomyClassReplayPolicy();
  const schedulesById = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), schedule]));
  let recoveredMaskChecks = 0;
  let policyChecks = 0;
  let robustClassChecks = 0;
  let reconstructionChecks = 0;
  let exact = true;

  const classRows = freeze(classes.map((holonomyClass, index) => {
    const primaryMask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const alternateMask = deriveAlternateHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const policy = inheritedPolicy[index];
    if (!same(primaryMask, alternateMask)) exact = false;
    return freeze({
      holonomy_class_id: holonomyClass.holonomy_class_id,
      schedule_ids: holonomyClass.schedule_ids,
      repair_mask: primaryMask,
      inherited_policy_replay_row: policy.replay_row,
    });
  }));

  for (const table of successTables) {
    for (let erasedIndex = 0; erasedIndex < 3; erasedIndex += 1) {
      for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
        const holonomyClass = classes[classIndex];
        const row = classRows[classIndex];
        const fullLabel = systematicParityAugmentationLabel(row.repair_mask, table);
        const surviving = eraseCoordinate(fullLabel, erasedIndex);
        const recoveredMask = recoverRepairMaskFromSystematicErasure(surviving, erasedIndex, table);
        recoveredMaskChecks += 1;
        if (!same(recoveredMask, row.repair_mask)) exact = false;

        const decodedReplay = decodeMinimumCostReplayFromRepairMask(recoveredMask);
        policyChecks += 1;
        if (!same(decodedReplay, row.inherited_policy_replay_row)) exact = false;

        const classAssessment = classifyReplayAgainstHolonomyClass(holonomyClass, decodedReplay);
        robustClassChecks += 1;
        if (!classAssessment.actual_class_robust_unimodular_rescue) exact = false;

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
                const observation = observeReplayAssistedState(state, schedule, decodedReplay);
                const recoveredState = invertReplayLocusObservation(observation, schedule, decodedReplay);
                reconstructionChecks += 1;
                if (!same(state, recoveredState)) exact = false;
              }
            }
          }
        }
      }
    }
  }

  const mixedClass = classes.find(row => row.schedule_ids.length > 1 && row.defect_directions.length === 2);
  return freeze({
    successful_systematic_truth_table_count: successTables.length,
    expected_successful_systematic_truth_table_count: 2,
    class_rows: classRows,
    recovered_mask_checks: recoveredMaskChecks,
    expected_recovered_mask_checks: 24,
    minimum_cost_policy_checks: policyChecks,
    expected_minimum_cost_policy_checks: 24,
    class_robust_unimodular_checks: robustClassChecks,
    expected_class_robust_unimodular_checks: 24,
    exact_replay_assisted_state_reconstructions: reconstructionChecks,
    expected_exact_replay_assisted_state_reconstructions: 4500,
    mixed_class_schedule_ids: mixedClass?.schedule_ids ?? freeze([]),
    mixed_class_schedule_ambiguity_preserved: Boolean(mixedClass) && mixedClass.schedule_ids.length === 2,
    exact: exact
      && successTables.length === 2
      && recoveredMaskChecks === 24
      && policyChecks === 24
      && robustClassChecks === 24
      && reconstructionChecks === 4500
      && Boolean(mixedClass)
      && mixedClass.schedule_ids.length === 2,
  });
}

function inheritedRawCutCertificate() {
  const parent = dromologicalHolonomyRawApertureCutCertificate();
  return freeze({
    parent_passed: parent.passed,
    no_exact_raw_router_survives_h12_erasure:
      parent.erasure_certificate.no_exact_raw_router_survives_h12_erasure,
    no_raw_aperture_is_universally_one_erasure_robust:
      parent.erasure_certificate.no_raw_aperture_is_universally_one_erasure_robust,
    derived_parity_is_not_declared_as_raw_holonomy_coordinate: true,
    exact: parent.passed
      && parent.erasure_certificate.no_exact_raw_router_survives_h12_erasure
      && parent.erasure_certificate.no_raw_aperture_is_universally_one_erasure_robust,
  });
}

export function dromologicalHolonomyParityCompletionCertificate() {
  if (cachedCertificate) return cachedCertificate;

  const rawParent = inheritedRawCutCertificate();
  const systematic = systematicAugmentationCertificate();
  const unrestricted = unrestrictedBinaryEncodingCertificate();
  const tomography = finiteTomographyClosureCertificate(systematic.successful_truth_tables);

  const passed = rawParent.exact
    && systematic.exact
    && unrestricted.exact
    && tomography.exact;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_PARENT_RECEIPT,
    inherited_raw_cut_certificate: rawParent,
    systematic_augmentation_certificate: systematic,
    unrestricted_binary_encoding_certificate: unrestricted,
    tomography_closure_certificate: tomography,
    passed,
    systematic_classification: passed
      ? 'ONE_DERIVED_BOOLEAN_WITNESS_COMPLETES_THE_TWO_BIT_REPAIR_MASK_TO_ARBITRARY_ONE_COORDINATE_ERASURE_ROBUSTNESS_IFF_THE_DERIVED_WITNESS_IS_PARITY_OR_COMPLEMENT_PARITY_IN_THE_FIXED_S3_FIXTURE'
      : 'SYSTEMATIC_PARITY_COMPLETION_NOT_ESTABLISHED',
    minimal_representation_classification: passed
      ? 'THREE_BINARY_RECEIVER_COORDINATES_ARE_MINIMAL_FOR_EXACT_FOUR_CLASS_REPAIR_ROUTING_THAT_SURVIVES_ARBITRARY_ONE_COORDINATE_ERASURE_IN_THE_FIXED_S3_AIA_REPAIR_FIXTURE'
      : 'THREE_BINARY_RECEIVER_COORDINATE_MINIMALITY_NOT_ESTABLISHED',
    unrestricted_classification: passed
      ? 'EXACTLY_FORTY_EIGHT_OF_THE_4096_ORDERED_THREE_BIT_RECEIVER_ENCODINGS_ARE_ONE_COORDINATE_ERASURE_ROBUST_AND_EVERY_SUCCESSFUL_IMAGE_IS_ONE_OF_THE_TWO_FOUR_POINT_PARITY_SUBSETS_OF_THE_BINARY_CUBE'
      : 'UNRESTRICTED_THREE_BIT_ERASURE_ROBUST_CLASSIFICATION_NOT_ESTABLISHED',
    architectural_law: passed
      ? 'A_DERIVED_RECEIVER_COORDINATE_CAN_REPAIR_A_RAW_COORDINATE_CUT_AT_THE_REPRESENTATION_LAYER_WHILE_SOURCE_CUSTODY_RECEIVER_AUTHORITY_AND_THE_HISTORICAL_INFORMATION_RECORD_REMAIN_UNCHANGED'
      : 'AIA_REPRESENTATIONAL_PARITY_COMPLETION_LAW_NOT_ESTABLISHED',
    scars: freeze([
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
    ]),
  });

  return cachedCertificate;
}

export function compileDromologicalHolonomyParityCompletionProjection(receiver) {
  const certificate = dromologicalHolonomyParityCompletionCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified holonomy parity-completion chamber');

  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-parity-completion-child-legible/v0.1',
      truths: freeze([
        'THREE_SMALL_CLUES_CAN_BE_ARRANGED_SO_ANY_TWO_STILL_TELL_US_WHICH_REPAIR_TO_USE',
        'THE_THIRD_CLUE_IS_DERIVED_FROM_THE_TWO_REPAIR_CLUES',
        'LOSING_ONE_OF_THE_THREE_DOES_NOT_ERASE_THE_REPAIR_CHOICE_IN_THIS_FIXTURE',
        'THIS_EXTRA_CLUE_DOES_NOT_RECOVER_THE_FORGOTTEN_TEMPORAL_ORDER',
      ]),
      raw_holonomy_matrices_exposed: false,
      parity_truth_tables_exposed: false,
      boolean_encoding_atlas_exposed: false,
      erasure_decoder_formulas_exposed: false,
      replay_vectors_exposed: false,
      inverse_matrices_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.holonomy-parity-completion-loom-technical/v0.1',
      systematic_augmentation_certificate: certificate.systematic_augmentation_certificate,
      unrestricted_binary_encoding_summary: freeze({
        two_bit_encoding_count:
          certificate.unrestricted_binary_encoding_certificate.two_bit_encoding_count,
        one_erasure_robust_two_bit_encoding_count:
          certificate.unrestricted_binary_encoding_certificate.one_erasure_robust_two_bit_encoding_count,
        three_bit_encoding_count:
          certificate.unrestricted_binary_encoding_certificate.three_bit_encoding_count,
        one_erasure_robust_three_bit_encoding_count:
          certificate.unrestricted_binary_encoding_certificate.one_erasure_robust_three_bit_encoding_count,
        robust_even_parity_image_count:
          certificate.unrestricted_binary_encoding_certificate.robust_even_parity_image_count,
        robust_odd_parity_image_count:
          certificate.unrestricted_binary_encoding_certificate.robust_odd_parity_image_count,
      }),
      tomography_closure_certificate: certificate.tomography_closure_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for holonomy parity completion: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_PARITY_COMPLETION_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_parity_completion: true,
      universal_coding_theorem: false,
      shannon_information_theorem: false,
      universal_error_correction: false,
      physical_sensor_redundancy: false,
      physical_sensor_failure: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      live_runtime: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyParityCompletionOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const ceiling = candidate?.claim_ceiling ?? {};
  const coding = ceiling.universal_coding_theorem === true
    || ceiling.shannon_information_theorem === true
    || ceiling.universal_error_correction === true;
  const physical = ceiling.physical_sensor_redundancy === true
    || ceiling.physical_sensor_failure === true
    || ceiling.physical_holonomy === true
    || ceiling.physical_quasicrystal === true;
  const continuum = ceiling.continuum_tomography === true;
  const schedule = ceiling.complete_schedule_reconstruction === true;
  const inverse = ceiling.operational_inverse_route === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.raw_holonomy_matrices_exposed === true
    || candidate?.payload?.parity_truth_tables_exposed === true
    || candidate?.payload?.boolean_encoding_atlas_exposed === true
    || candidate?.payload?.erasure_decoder_formulas_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.inverse_matrices_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );

  const accepted = !authorityWidened
    && !runtime
    && !coding
    && !physical
    && !continuum
    && !schedule
    && !inverse
    && !ashLeak;

  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    coding_or_shannon_claim_attempted: coding,
    physical_claim_attempted: physical,
    continuum_claim_attempted: continuum,
    complete_schedule_reconstruction_attempted: schedule,
    operational_inverse_route_attempted: inverse,
    ash_technical_leak_attempted: ashLeak,
  });
}
