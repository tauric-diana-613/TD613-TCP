import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { observeReplayAssistedState } from './dromological-baseline-replay-rescue-aperture.js';
import { invertReplayLocusObservation } from './dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  classifyReplayAgainstHolonomyClass,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from './dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import {
  REPAIR_MASK_DOMAIN,
  EVEN_PARITY_IMAGE,
  dromologicalHolonomyParityCompletionCertificate,
} from './dromological-holonomy-parity-completion-erasure-robust-aia.js';
import {
  canonicalFiveBitRepairCode,
  dromologicalHolonomySingleCorruptionCertificate,
} from './dromological-holonomy-single-corruption-correcting-aia.js';
import {
  canonicalSixBitRepairCode,
  dromologicalHolonomyCorruptionPlusErasureCertificate,
} from './dromological-holonomy-corruption-plus-erasure-aia.js';
import {
  canonicalEightBitRepairCode,
  dromologicalHolonomyDoubleCorruptionCertificate,
} from './dromological-holonomy-double-corruption-correcting-aia.js';

export const DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_SCHEMA =
  'td613.dome-world.dromological-holonomy-fault-budget-stratigraphy-aia/v0.1';
export const DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_PARENT_RECEIPT =
  '3877139365041453bab85741eb09ba2f5839eed6';

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

function pairwiseDistances(code) {
  const distances = [];
  for (let left = 0; left < code.length; left += 1) {
    for (let right = left + 1; right < code.length; right += 1) {
      distances.push(hamming(code[left].codeword, code[right].codeword));
    }
  }
  return freeze(distances.sort((a, b) => a - b));
}

function indexSubsets(width, choose) {
  const rows = [];
  function visit(start, selected) {
    if (selected.length === choose) {
      rows.push(freeze([...selected]));
      return;
    }
    for (let index = start; index < width; index += 1) visit(index + 1, [...selected, index]);
  }
  visit(0, []);
  return freeze(rows);
}

function eraseCoordinates(word, erasedIndices) {
  const erased = new Set(erasedIndices);
  return freeze(word.filter((_, index) => !erased.has(index)));
}

function receivedConditionsAtMost(word, radius) {
  const rows = [];
  for (let flips = 0; flips <= radius; flips += 1) {
    for (const indices of indexSubsets(word.length, flips)) {
      const received = [...word];
      for (const index of indices) received[index] ^= 1;
      rows.push(freeze(received));
    }
  }
  return freeze(rows);
}

function puncturedNearest(received, code, erasedIndices) {
  const ranked = code.map(row => ({
    repair_mask: row.repair_mask,
    codeword: row.codeword,
    punctured_codeword: eraseCoordinates(row.codeword, erasedIndices),
  })).map(row => freeze({
    ...row,
    distance: hamming(received, row.punctured_codeword),
  })).sort((left, right) => left.distance - right.distance);
  const minimum = ranked[0].distance;
  const nearest = ranked.filter(row => row.distance === minimum);
  return freeze({
    unique: nearest.length === 1,
    minimum_distance: minimum,
    tie_count: nearest.length,
    repair_mask: nearest.length === 1 ? nearest[0].repair_mask : null,
    tied_repair_masks: freeze(nearest.map(row => row.repair_mask)),
  });
}

function parityThreeBitCode() {
  return freeze(REPAIR_MASK_DOMAIN.map((repairMask, index) => freeze({
    repair_mask: repairMask,
    codeword: EVEN_PARITY_IMAGE[index],
  })));
}

function canonicalLadder() {
  return freeze([
    freeze({
      id: '824_PARITY_WIDTH_3',
      source_pr: 824,
      width: 3,
      expected_minimum_distance: 2,
      expected_positive_profiles: 2,
      expected_failing_profiles: 8,
      code: parityThreeBitCode(),
    }),
    freeze({
      id: '826_SINGLE_CORRUPTION_WIDTH_5',
      source_pr: 826,
      width: 5,
      expected_minimum_distance: 3,
      expected_positive_profiles: 4,
      expected_failing_profiles: 17,
      code: canonicalFiveBitRepairCode(),
    }),
    freeze({
      id: '828_CORRUPTION_PLUS_ERASURE_WIDTH_6',
      source_pr: 828,
      width: 6,
      expected_minimum_distance: 4,
      expected_positive_profiles: 6,
      expected_failing_profiles: 22,
      code: canonicalSixBitRepairCode(),
    }),
    freeze({
      id: '830_DOUBLE_CORRUPTION_WIDTH_8',
      source_pr: 830,
      width: 8,
      expected_minimum_distance: 5,
      expected_positive_profiles: 9,
      expected_failing_profiles: 36,
      code: canonicalEightBitRepairCode(),
    }),
  ]);
}

function auditFaultProfile(code, erasureCount, corruptionRadius) {
  const width = code[0].codeword.length;
  const erasureSets = indexSubsets(width, erasureCount);
  let decoderAudits = 0;
  let exact = true;
  let firstAmbiguity = null;

  for (const erasedIndices of erasureSets) {
    for (let classIndex = 0; classIndex < code.length; classIndex += 1) {
      const punctured = eraseCoordinates(code[classIndex].codeword, erasedIndices);
      for (const received of receivedConditionsAtMost(punctured, corruptionRadius)) {
        const decoded = puncturedNearest(received, code, erasedIndices);
        decoderAudits += 1;
        const rowExact = decoded.unique && same(decoded.repair_mask, code[classIndex].repair_mask);
        if (!rowExact) {
          exact = false;
          if (!firstAmbiguity) {
            firstAmbiguity = freeze({
              erased_indices: erasedIndices,
              expected_repair_mask: code[classIndex].repair_mask,
              source_punctured_word: punctured,
              received,
              decoded,
            });
          }
        }
      }
    }
  }

  return freeze({
    erasures: erasureCount,
    unknown_corruption_radius: corruptionRadius,
    budget_cost: erasureCount + 2 * corruptionRadius,
    erasure_set_count: erasureSets.length,
    decoder_audit_count: decoderAudits,
    exact,
    first_ambiguity: firstAmbiguity,
  });
}

function maximalExactProfiles(profiles) {
  const exact = profiles.filter(row => row.exact);
  return freeze(exact.filter(row => !exact.some(other => (
    other.erasures >= row.erasures
    && other.unknown_corruption_radius >= row.unknown_corruption_radius
    && (other.erasures > row.erasures || other.unknown_corruption_radius > row.unknown_corruption_radius)
  ))).map(row => freeze([row.erasures, row.unknown_corruption_radius])));
}

function ladderCertificate() {
  const rows = [];
  let allExact = true;
  let totalDecoderAudits = 0;

  for (const representation of canonicalLadder()) {
    const distances = pairwiseDistances(representation.code);
    const minimumDistance = Math.min(...distances);
    const budget = minimumDistance - 1;
    const profiles = [];
    for (let erasures = 0; erasures <= representation.width; erasures += 1) {
      for (let corruptions = 0; corruptions <= representation.width - erasures; corruptions += 1) {
        const audit = auditFaultProfile(representation.code, erasures, corruptions);
        profiles.push(audit);
        totalDecoderAudits += audit.decoder_audit_count;
      }
    }

    const positive = profiles.filter(row => row.exact);
    const failing = profiles.filter(row => !row.exact);
    const budgetAgreement = profiles.every(row => row.exact === (row.budget_cost <= budget));
    const boundaryFailures = profiles.filter(row => row.budget_cost === budget + 1);
    const boundaryAllFailWithWitness = boundaryFailures.length > 0
      && boundaryFailures.every(row => !row.exact && Boolean(row.first_ambiguity));
    const rowExact = minimumDistance === representation.expected_minimum_distance
      && positive.length === representation.expected_positive_profiles
      && failing.length === representation.expected_failing_profiles
      && budgetAgreement
      && boundaryAllFailWithWitness;
    if (!rowExact) allExact = false;

    rows.push(freeze({
      id: representation.id,
      source_pr: representation.source_pr,
      width: representation.width,
      pairwise_distances: distances,
      minimum_distance: minimumDistance,
      repair_budget: budget,
      profile_count: profiles.length,
      positive_profile_count: positive.length,
      failing_profile_count: failing.length,
      positive_profiles: freeze(positive.map(row => freeze([row.erasures, row.unknown_corruption_radius]))),
      maximal_positive_profiles: maximalExactProfiles(profiles),
      first_boundary_failures: freeze(boundaryFailures.map(row => freeze({
        profile: freeze([row.erasures, row.unknown_corruption_radius]),
        ambiguity: row.first_ambiguity,
      }))),
      budget_predicate_agrees_with_every_exhaustive_profile: budgetAgreement,
      boundary_failures_have_explicit_ambiguities: boundaryAllFailWithWitness,
      exact: rowExact,
    }));
  }

  const expectedBudgets = [1, 2, 3, 4];
  const observedBudgets = rows.map(row => row.repair_budget);
  const expectedWidthEightPositive = [
    [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [4, 0],
  ];
  const expectedWidthEightMaximal = [[0, 2], [2, 1], [4, 0]];
  const widthEight = rows[3];

  return freeze({
    representations: freeze(rows),
    observed_repair_budgets: freeze(observedBudgets),
    expected_repair_budgets: freeze(expectedBudgets),
    width_eight_positive_profiles_exact: same(widthEight.positive_profiles, expectedWidthEightPositive),
    width_eight_maximal_positive_profiles_exact: same(widthEight.maximal_positive_profiles, expectedWidthEightMaximal),
    total_profile_decoder_audits: totalDecoderAudits,
    exact: allExact
      && same(observedBudgets, expectedBudgets)
      && same(widthEight.positive_profiles, expectedWidthEightPositive)
      && same(widthEight.maximal_positive_profiles, expectedWidthEightMaximal),
  });
}

function widthEightPositiveProfileDecoderCertificate() {
  const code = canonicalEightBitRepairCode();
  const positiveProfiles = [
    [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [4, 0],
  ];
  const maximalProfiles = [[0, 2], [2, 1], [4, 0]];
  let positiveCases = 0;
  let maximalCases = 0;
  let exact = true;

  for (const [erasures, corruptions] of positiveProfiles) {
    const audit = auditFaultProfile(code, erasures, corruptions);
    positiveCases += audit.decoder_audit_count;
    if (!audit.exact) exact = false;
  }
  for (const [erasures, corruptions] of maximalProfiles) {
    const audit = auditFaultProfile(code, erasures, corruptions);
    maximalCases += audit.decoder_audit_count;
    if (!audit.exact) exact = false;
  }

  return freeze({
    positive_profiles: freeze(positiveProfiles.map(row => freeze(row))),
    maximal_profiles: freeze(maximalProfiles.map(row => freeze(row))),
    positive_profile_decoder_cases: positiveCases,
    expected_positive_profile_decoder_cases: 1876,
    maximal_profile_decoder_cases: maximalCases,
    expected_maximal_profile_decoder_cases: 1212,
    exact: exact && positiveCases === 1876 && maximalCases === 1212,
  });
}

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function factoredTomographyCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const code = canonicalEightBitRepairCode();
  const maximalProfiles = [[0, 2], [2, 1], [4, 0]];
  const classByMask = new Map(classes.map(row => [
    JSON.stringify(derivePrimaryHolonomyRepairMask(row.terminal_formal_holonomy)), row,
  ]));
  const schedulesById = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [scheduleId(schedule), schedule]));

  let decoderCases = 0;
  let replayPolicyChecks = 0;
  let robustChecks = 0;
  let receiverLayerExact = true;

  for (const [erasures, corruptions] of maximalProfiles) {
    for (const erasedIndices of indexSubsets(8, erasures)) {
      for (const row of code) {
        const punctured = eraseCoordinates(row.codeword, erasedIndices);
        for (const received of receivedConditionsAtMost(punctured, corruptions)) {
          const decoded = puncturedNearest(received, code, erasedIndices);
          decoderCases += 1;
          if (!decoded.unique || !same(decoded.repair_mask, row.repair_mask)) {
            receiverLayerExact = false;
            continue;
          }
          const replay = decodeMinimumCostReplayFromRepairMask(decoded.repair_mask);
          const expectedReplay = decodeMinimumCostReplayFromRepairMask(row.repair_mask);
          replayPolicyChecks += 1;
          if (!same(replay, expectedReplay)) receiverLayerExact = false;
          const holonomyClass = classByMask.get(JSON.stringify(row.repair_mask));
          const assessment = holonomyClass
            ? classifyReplayAgainstHolonomyClass(holonomyClass, replay)
            : null;
          robustChecks += 1;
          if (!assessment?.actual_class_robust_unimodular_rescue) receiverLayerExact = false;
        }
      }
    }
  }

  let reconstructions = 0;
  let stateLayerExact = true;
  for (const holonomyClass of classes) {
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const replay = decodeMinimumCostReplayFromRepairMask(mask);
    for (const id of holonomyClass.schedule_ids) {
      const schedule = schedulesById.get(id);
      if (!schedule) {
        stateLayerExact = false;
        continue;
      }
      for (let x1 = -2; x1 <= 2; x1 += 1) {
        for (let x2 = -2; x2 <= 2; x2 += 1) {
          for (let x3 = -2; x3 <= 2; x3 += 1) {
            const state = [x1, x2, x3];
            const observation = observeReplayAssistedState(state, schedule, replay);
            const recovered = invertReplayLocusObservation(observation, schedule, replay);
            reconstructions += 1;
            if (!same(state, recovered)) stateLayerExact = false;
          }
        }
      }
    }
  }

  const mixedClassAmbiguityPreserved = classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
  const representedCrossProductCardinality = 6 * 303 * 125;

  return freeze({
    maximal_profile_receiver_cases: decoderCases,
    expected_maximal_profile_receiver_cases: 1212,
    replay_policy_checks: replayPolicyChecks,
    expected_replay_policy_checks: 1212,
    class_robust_unimodular_checks: robustChecks,
    expected_class_robust_unimodular_checks: 1212,
    executed_state_reconstructions: reconstructions,
    expected_executed_state_reconstructions: 750,
    represented_full_receiver_by_state_cross_product_cardinality: representedCrossProductCardinality,
    expected_represented_cross_product_cardinality: 227250,
    full_cross_product_executed: false,
    damaged_receiver_word_enters_state_reconstruction_function: false,
    receiver_layer_exact: receiverLayerExact,
    state_layer_exact: stateLayerExact,
    mixed_class_schedule_ambiguity_preserved: mixedClassAmbiguityPreserved,
    exact: receiverLayerExact
      && stateLayerExact
      && decoderCases === 1212
      && replayPolicyChecks === 1212
      && robustChecks === 1212
      && reconstructions === 750
      && representedCrossProductCardinality === 227250
      && mixedClassAmbiguityPreserved,
  });
}

export function dromologicalHolonomyFaultBudgetStratigraphyCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const ancestor824 = dromologicalHolonomyParityCompletionCertificate();
  const ancestor826 = dromologicalHolonomySingleCorruptionCertificate();
  const ancestor828 = dromologicalHolonomyCorruptionPlusErasureCertificate();
  const parent830 = dromologicalHolonomyDoubleCorruptionCertificate();
  const ladder = ladderCertificate();
  const widthEight = widthEightPositiveProfileDecoderCertificate();
  const tomography = factoredTomographyCertificate();
  const ancestorsPassed = ancestor824.passed && ancestor826.passed && ancestor828.passed && parent830.passed;
  const passed = ancestorsPassed && ladder.exact && widthEight.exact && tomography.exact;

  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_PARENT_RECEIPT,
    ancestors_passed: ancestorsPassed,
    fault_budget_ladder_certificate: ladder,
    width_eight_positive_profile_certificate: widthEight,
    factored_tomography_certificate: tomography,
    passed,
    fault_budget_classification: passed
      ? 'IN_THE_FOUR_EARNED_CANONICAL_AIA_RECEIVER_REPRESENTATIONS_ONE_KNOWN_ERASURE_CONSUMES_ONE_UNIT_AND_ONE_UNKNOWN_CORRUPTION_CONSUMES_TWO_UNITS_OF_THE_FINITE_REPAIR_BUDGET_DMIN_MINUS_ONE'
      : 'FIXED_CANONICAL_RECEIVER_FAULT_BUDGET_STRATIGRAPHY_NOT_ESTABLISHED',
    factorization_law: passed
      ? 'EXHAUSTIVE_RECEIVER_FAULT_DECODING_CAN_FACTOR_FROM_EXACT_REPLAY_ASSISTED_STATE_RECONSTRUCTION_WHEN_THE_DOWNSTREAM_REPLAY_ROUTE_DEPENDS_ONLY_ON_THE_RECOVERED_REPAIR_MASK_IN_THIS_FIXED_S3_AIA_FIXTURE'
      : 'FACTORED_RECEIVER_TO_TOMOGRAPHY_CLOSURE_NOT_ESTABLISHED',
    scars: freeze([
      'FINITE_REPAIR_BUDGET != SHANNON_OR_CHANNEL_CAPACITY',
      'ONE_ERASURE_COST_ONE_IN_THIS_LADDER != UNIVERSAL_ERASURE_METRIC',
      'ONE_CORRUPTION_COST_TWO_IN_THIS_LADDER != UNIVERSAL_ERROR_METRIC',
      'KNOWN_ERASURE_POSITION != UNKNOWN_CORRUPTION_POSITION',
      'RECEIVER_FAULT_PROFILE != PHYSICAL_SENSOR_FAULT_MODEL',
      'HAMMING_DISTANCE_IN_RECEIVER_LABEL_SPACE != PHYSICAL_DISTANCE',
      'FACTORED_TOMOGRAPHY_CLOSURE != EXECUTED_FULL_CROSS_PRODUCT',
      'DECODED_REPAIR_MASK != COMPLETE_SCHEDULE_IDENTITY',
      'REPLAY_ROUTE_FACTOR != OPERATIONAL_SENSOR_CONTROL',
      'EXACT_STATE_RECONSTRUCTION != CONTINUUM_TOMOGRAPHY',
      'FORMAL_HOLONOMY_REPAIR_LABEL != PHYSICAL_HOLONOMY_OBSERVABLE',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyFaultBudgetProjection(receiver) {
  const certificate = dromologicalHolonomyFaultBudgetStratigraphyCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified fault-budget stratigraphy chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.fault-budget-stratigraphy-child-legible/v0.1',
      truths: freeze([
        'IN_THIS_EIGHT_CLUE_GAME_A_KNOWN_MISSING_CLUE_COSTS_ONE_REPAIR_MARK_AND_AN_UNKNOWN_WRONG_CLUE_COSTS_TWO',
        'THE_EIGHT_CLUE_REPRESENTATION_HAS_FOUR_REPAIR_MARKS',
        'FIX_THE_CLUE_LABEL_FIRST_THEN_THE_SAME_REPAIR_ROUTE_CAN_BE_USED_FOR_THE_STATE',
        'WE_DO_NOT_HAVE_TO_REDO_THE_WHOLE_STATE_CALCULATION_FOR_EVERY_DIFFERENT_DAMAGED_CLUE_PATTERN',
      ]),
      profile_lattice_exposed: false,
      ambiguity_witnesses_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.fault-budget-stratigraphy-loom-technical/v0.1',
      repair_budgets: certificate.fault_budget_ladder_certificate.observed_repair_budgets,
      width_eight_positive_profiles:
        certificate.fault_budget_ladder_certificate.representations[3].positive_profiles,
      width_eight_boundary_failures:
        certificate.fault_budget_ladder_certificate.representations[3].first_boundary_failures,
      factored_tomography_certificate: certificate.factored_tomography_certificate,
    });
  } else {
    throw new Error(`undeclared AIA receiver for fault-budget stratigraphy chamber: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    claim_ceiling: freeze({
      fixed_fixture_fault_budget_stratigraphy: true,
      fixed_fixture_factored_tomography: true,
      universal_coding_theorem: false,
      shannon_capacity_theorem: false,
      physical_sensor_fault_model: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyFaultBudgetOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity_theorem === true
    || ceiling.physical_sensor_fault_model === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.profile_lattice_exposed === true
    || candidate?.payload?.ambiguity_witnesses_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
  );
  return freeze({ accepted: !authority && !overreach && !runtime && !ashLeak });
}
